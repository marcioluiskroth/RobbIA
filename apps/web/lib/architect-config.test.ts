import { describe, expect, it } from 'bun:test'
import { resolveArchitectConfig } from './architect-config'

describe('resolveArchitectConfig', () => {
  it('env completo (claude) → ok com kind/model/apiKey', () => {
    expect(
      resolveArchitectConfig({
        ARCHITECT_PROVIDER: 'claude',
        ARCHITECT_MODEL: 'claude-sonnet-4-6',
        ANTHROPIC_API_KEY: 'sk-x',
      }),
    ).toEqual({ ok: true, kind: 'claude', model: 'claude-sonnet-4-6', config: { apiKey: 'sk-x' } })
  })

  it('sem ARCHITECT_PROVIDER → no-provider', () => {
    expect(resolveArchitectConfig({ ARCHITECT_MODEL: 'm' })).toEqual({
      ok: false,
      reason: 'no-provider',
    })
  })

  it('provider inválido → no-provider', () => {
    expect(resolveArchitectConfig({ ARCHITECT_PROVIDER: 'foo', ARCHITECT_MODEL: 'm' }).ok).toBe(
      false,
    )
  })

  it('sem ARCHITECT_MODEL → no-provider', () => {
    expect(
      resolveArchitectConfig({ ARCHITECT_PROVIDER: 'claude', ANTHROPIC_API_KEY: 'k' }),
    ).toEqual({ ok: false, reason: 'no-provider' })
  })

  it('provider que exige chave, sem a chave → no-key', () => {
    expect(resolveArchitectConfig({ ARCHITECT_PROVIDER: 'gpt', ARCHITECT_MODEL: 'm' })).toEqual({
      ok: false,
      reason: 'no-key',
    })
  })

  it('ollama dispensa chave → ok (local)', () => {
    expect(
      resolveArchitectConfig({ ARCHITECT_PROVIDER: 'ollama', ARCHITECT_MODEL: 'llama3' }),
    ).toEqual({ ok: true, kind: 'ollama', model: 'llama3', config: {} })
  })

  it('ollama com OLLAMA_BASE_URL → inclui baseURL', () => {
    const r = resolveArchitectConfig({
      ARCHITECT_PROVIDER: 'ollama',
      ARCHITECT_MODEL: 'llama3',
      OLLAMA_BASE_URL: 'http://host:11434',
    })
    expect(r).toMatchObject({ ok: true, config: { baseURL: 'http://host:11434' } })
  })
})
