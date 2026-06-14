import { describe, expect, it } from 'bun:test'
import { createLogger, redactSecrets } from './logger'

const fixedNow = (): Date => new Date('2026-06-14T00:00:00.000Z')

describe('logger', () => {
  it('emite JSON com os campos obrigatórios (ts/level/service/correlationId/msg)', () => {
    const lines: string[] = []
    const log = createLogger('test-svc', { now: fixedNow, write: (line) => lines.push(line) })
    log.info('hello', { correlationId: 'abc-1' })
    expect(lines).toHaveLength(1)
    const record = JSON.parse(lines[0] ?? '{}')
    expect(record.ts).toBe('2026-06-14T00:00:00.000Z')
    expect(record.level).toBe('info')
    expect(record.service).toBe('test-svc')
    expect(record.correlationId).toBe('abc-1')
    expect(record.msg).toBe('hello')
  })

  it('redige segredos (recursivamente) antes de logar', () => {
    const lines: string[] = []
    const log = createLogger('test-svc', { now: fixedNow, write: (line) => lines.push(line) })
    log.info('auth', { apiKey: 'sk-123', password: 'p', nested: { token: 't', keep: 1 } })
    const record = JSON.parse(lines[0] ?? '{}')
    expect(record.apiKey).toBe('[REDACTED]')
    expect(record.password).toBe('[REDACTED]')
    expect(record.nested.token).toBe('[REDACTED]')
    expect(record.nested.keep).toBe(1)
  })

  it('respeita o nível mínimo configurado', () => {
    const lines: string[] = []
    const log = createLogger('svc', {
      level: 'warn',
      now: fixedNow,
      write: (line) => lines.push(line),
    })
    log.info('skip')
    log.warn('keep')
    expect(lines).toHaveLength(1)
    expect(JSON.parse(lines[0] ?? '{}').msg).toBe('keep')
  })

  it('redactSecrets é puro e recursivo', () => {
    const out = redactSecrets({ a: 1, secret: 'x', arr: [{ token: 't' }] }) as Record<
      string,
      unknown
    >
    expect(out.a).toBe(1)
    expect(out.secret).toBe('[REDACTED]')
  })

  it('campos do chamador não sobrescrevem as chaves canônicas (ts/level/service/msg)', () => {
    const lines: string[] = []
    const log = createLogger('test-svc', { now: fixedNow, write: (line) => lines.push(line) })
    log.info('real-msg', { level: 'debug', service: 'fake', msg: 'fake', ts: 'fake' })
    const record = JSON.parse(lines[0] ?? '{}')
    expect(record.level).toBe('info')
    expect(record.service).toBe('test-svc')
    expect(record.msg).toBe('real-msg')
    expect(record.ts).toBe('2026-06-14T00:00:00.000Z')
  })

  it('serializa referência circular, Error e BigInt sem lançar', () => {
    const lines: string[] = []
    const log = createLogger('svc', { now: fixedNow, write: (line) => lines.push(line) })
    const circular: Record<string, unknown> = { name: 'x' }
    circular.self = circular
    expect(() => {
      log.info('c', { circular, big: 10n, err: new Error('boom') })
    }).not.toThrow()
    const record = JSON.parse(lines[0] ?? '{}')
    expect(record.circular.self).toBe('[Circular]')
    expect(record.big).toBe('10')
    expect(record.err.message).toBe('boom')
  })

  it('redige chaves sensíveis sem super-redigir métricas benignas', () => {
    const out = redactSecrets({
      tokenCount: 5,
      cookieConsent: true,
      accessKey: 'AKIA',
      masterKey: 'm',
      token: 'raw',
    }) as Record<string, unknown>
    expect(out.tokenCount).toBe(5)
    expect(out.cookieConsent).toBe(true)
    expect(out.accessKey).toBe('[REDACTED]')
    expect(out.masterKey).toBe('[REDACTED]')
    expect(out.token).toBe('[REDACTED]')
  })
})
