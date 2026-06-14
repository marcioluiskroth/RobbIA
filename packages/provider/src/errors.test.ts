import { describe, expect, it } from 'bun:test'
import { isRetriableStatus, mapProviderError } from './errors'

describe('errors', () => {
  it('classifica status transitório vs permanente', () => {
    expect(isRetriableStatus(429)).toBe(true)
    expect(isRetriableStatus(503)).toBe(true)
    expect(isRetriableStatus(401)).toBe(false)
    expect(isRetriableStatus(400)).toBe(false)
    expect(isRetriableStatus(undefined)).toBe(false)
  })

  it('mapProviderError: 429 → retriable; 401 → permanente', () => {
    expect(mapProviderError({ status: 429, message: 'rate limited' }, 'gpt')).toMatchObject({
      retriable: true,
      code: 'PROVIDER_HTTP_429',
    })
    expect(mapProviderError({ status: 401, message: 'bad key' }, 'gpt').retriable).toBe(false)
  })

  it('mapProviderError: timeout → retriable', () => {
    expect(mapProviderError({ name: 'APIConnectionTimeoutError' }, 'claude').retriable).toBe(true)
    expect(mapProviderError({ message: 'request timed out' }, 'claude').retriable).toBe(true)
  })

  it('mapProviderError: prefixa o providerKind na mensagem e nunca lança', () => {
    expect(mapProviderError('algo estranho', 'ollama')).toMatchObject({
      retriable: false,
      message: '[ollama] unknown provider error',
    })
  })
})
