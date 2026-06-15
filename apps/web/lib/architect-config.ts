import type { ProviderKind } from '@robbia/provider'

const PROVIDER_KINDS = ['claude', 'gpt', 'gemini', 'ollama', 'openrouter'] as const

/** Var de env com a chave de cada Provider (null = local, dispensa chave). */
const KEY_ENV: Record<ProviderKind, string | null> = {
  claude: 'ANTHROPIC_API_KEY',
  gpt: 'OPENAI_API_KEY',
  gemini: 'GOOGLE_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  ollama: null,
}

export type ArchitectConfig =
  | { ok: true; kind: ProviderKind; model: string; config: { apiKey?: string; baseURL?: string } }
  | { ok: false; reason: 'no-provider' | 'no-key' }

type Env = Record<string, string | undefined>

function isProviderKind(value: string | undefined): value is ProviderKind {
  return value != null && (PROVIDER_KINDS as readonly string[]).includes(value)
}

/**
 * Resolve a config da IA Arquiteta a partir do ambiente — PURO (recebe o env, não lê
 * `process.env`), portanto testável headless. Server-only: as chaves nunca cruzam para o client.
 * `ARCHITECT_PROVIDER` (kind) + `ARCHITECT_MODEL` + a chave do Provider (Ollama dispensa).
 */
export function resolveArchitectConfig(env: Env): ArchitectConfig {
  const kind = env.ARCHITECT_PROVIDER
  if (!isProviderKind(kind)) return { ok: false, reason: 'no-provider' }
  const model = env.ARCHITECT_MODEL
  if (!model) return { ok: false, reason: 'no-provider' }

  const keyEnv = KEY_ENV[kind]
  if (keyEnv) {
    const apiKey = env[keyEnv]
    if (!apiKey) return { ok: false, reason: 'no-key' }
    return { ok: true, kind, model, config: { apiKey } }
  }
  // Ollama (local): chave dispensada; baseURL opcional.
  return {
    ok: true,
    kind,
    model,
    config: env.OLLAMA_BASE_URL ? { baseURL: env.OLLAMA_BASE_URL } : {},
  }
}
