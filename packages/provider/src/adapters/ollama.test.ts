import { describe, expect, it } from 'bun:test'
import type { Ollama } from 'ollama'
import { OllamaProvider } from './ollama'

describe('OllamaProvider (cliente mockado) — caminho 100% local', () => {
  it('mapeia a resposta do SDK para CompletionResult', async () => {
    const client = {
      chat: () =>
        Promise.resolve({
          message: { content: 'olá local' },
          prompt_eval_count: 7,
          eval_count: 11,
        }),
    } as unknown as Ollama
    const provider = new OllamaProvider({}, client)
    const res = await provider.complete({
      model: 'llama3',
      messages: [{ role: 'user', content: 'oi' }],
    })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data.text).toBe('olá local')
      expect(res.data.providerKind).toBe('ollama')
      expect(res.data.usage).toMatchObject({ inputTokens: 7, outputTokens: 11 })
    }
  })

  it('erro do SDK → Result err, sem lançar', async () => {
    const client = {
      chat: () => Promise.reject({ message: 'connection refused' }),
    } as unknown as Ollama
    const provider = new OllamaProvider({}, client)
    const res = await provider.complete({ model: 'm', messages: [{ role: 'user', content: 'oi' }] })
    expect(res.ok).toBe(false)
  })
})
