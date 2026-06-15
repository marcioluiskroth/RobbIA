/**
 * Logger estruturado (JSON, estilo pino). Campos obrigatórios: ts, level, service, correlationId.
 * PROIBIDO logar segredos/credenciais — chaves sensíveis são redatadas automaticamente (FR-11).
 *
 * Nota: a redação atua sobre NOMES de chave. Segredos embutidos em VALORES de string
 * (connection strings, "Bearer x") são tratados separadamente (ver deferred-work.md).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

export interface LogFields {
  correlationId?: string
  [key: string]: unknown
}

export interface LogRecord {
  ts: string
  level: LogLevel
  service: string
  correlationId: string
  msg: string
  [key: string]: unknown
}

const REDACTED = '[REDACTED]'

/**
 * Termos sensíveis "fortes": redigem se aparecerem como palavra OU como a chave inteira
 * sem delimitadores. Compostos (apiKey, accessKey, masterKey...) ficam aqui para evitar
 * depender de 'key' isolado (que super-redigiria sortKey/rowKey).
 */
const STRONG_SECRETS = new Set([
  'password',
  'passwd',
  'pwd',
  'passphrase',
  'secret',
  'clientsecret',
  'credential',
  'credentials',
  'authorization',
  'bearer',
  'jwt',
  'apikey',
  'accesskey',
  'secretkey',
  'privatekey',
  'publickey',
  'masterkey',
  'sessionkey',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'authtoken',
  'sessiontoken',
])

/** Termos ambíguos: redigem apenas quando são a chave INTEIRA (ex.: `token`, não `tokenCount`). */
const AMBIGUOUS_SECRETS = new Set(['token', 'cookie'])

function keyWords(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
}

export function isSecretKey(key: string): boolean {
  const joined = key.toLowerCase().replace(/[^a-z0-9]+/g, '')
  if (STRONG_SECRETS.has(joined) || AMBIGUOUS_SECRETS.has(joined)) return true
  return keyWords(key).some((w) => STRONG_SECRETS.has(w))
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * Redige (por nome de chave) e torna o valor seguro para JSON: trata BigInt, Date, Error,
 * Map/Set e referências circulares — nunca lança nem produz `{}` silencioso.
 */
export function redactSecrets(input: unknown, seen: WeakSet<object> = new WeakSet()): unknown {
  if (typeof input === 'bigint') return input.toString()
  if (typeof input === 'function') return `[Function ${input.name || 'anonymous'}]`
  if (input instanceof Date) return input.toISOString()
  if (input instanceof Error) {
    return { name: input.name, message: input.message, stack: input.stack }
  }
  if (input instanceof Map) {
    if (seen.has(input)) return '[Circular]'
    seen.add(input)
    const out: Record<string, unknown> = {}
    for (const [k, v] of input.entries()) {
      const key = String(k)
      out[key] = isSecretKey(key) ? REDACTED : redactSecrets(v, seen)
    }
    return out
  }
  if (input instanceof Set) {
    if (seen.has(input)) return '[Circular]'
    seen.add(input)
    return [...input].map((v) => redactSecrets(v, seen))
  }
  if (Array.isArray(input)) {
    if (seen.has(input)) return '[Circular]'
    seen.add(input)
    return input.map((v) => redactSecrets(v, seen))
  }
  if (isPlainObject(input)) {
    if (seen.has(input)) return '[Circular]'
    seen.add(input)
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      out[key] = isSecretKey(key) ? REDACTED : redactSecrets(value, seen)
    }
    return out
  }
  if (input && typeof input === 'object') return String(input)
  return input
}

export interface Logger {
  readonly level: LogLevel
  debug(msg: string, fields?: LogFields): void
  info(msg: string, fields?: LogFields): void
  warn(msg: string, fields?: LogFields): void
  error(msg: string, fields?: LogFields): void
  child(bindings: LogFields): Logger
}

export interface CreateLoggerOptions {
  level?: LogLevel
  now?: () => Date
  write?: (line: string) => void
  bindings?: LogFields
}

export function createLogger(service: string, options: CreateLoggerOptions = {}): Logger {
  const requested = options.level ?? 'info'
  const level: LogLevel = requested in LEVEL_ORDER ? requested : 'info'
  const now = options.now ?? ((): Date => new Date())
  const write = options.write ?? ((line: string): void => void process.stdout.write(`${line}\n`))
  const bindings = options.bindings ?? {}

  function emit(recordLevel: LogLevel, msg: string, fields?: LogFields): void {
    if (LEVEL_ORDER[recordLevel] < LEVEL_ORDER[level]) return
    const merged: LogFields = { ...bindings, ...(fields ?? {}) }
    const correlationId = typeof merged.correlationId === 'string' ? merged.correlationId : 'none'
    const safe = redactSecrets(merged) as Record<string, unknown>
    // Campos canônicos vêm DEPOIS de `...safe`: o chamador nunca sobrescreve ts/level/service/msg/correlationId.
    const record: LogRecord = {
      ...safe,
      ts: now().toISOString(),
      level: recordLevel,
      service,
      correlationId,
      msg,
    }
    write(JSON.stringify(record))
  }

  return {
    level,
    debug: (msg, fields) => emit('debug', msg, fields),
    info: (msg, fields) => emit('info', msg, fields),
    warn: (msg, fields) => emit('warn', msg, fields),
    error: (msg, fields) => emit('error', msg, fields),
    child: (childBindings) =>
      createLogger(service, { ...options, bindings: { ...bindings, ...childBindings } }),
  }
}
