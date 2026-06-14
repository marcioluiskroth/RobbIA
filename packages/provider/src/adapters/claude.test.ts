import { describe, expect, it } from 'bun:test'
import type Anthropic from '@anthropic-ai/sdk'
import { ClaudeProvider } from './claude'

describe('ClaudeProvider (cliente mockado)', () => {
  it('mapeia a resposta do SDK para CompletionResult', async () => {
    const client = {
      messages: {
        create: () =>
          Promise.resolve({
            content: [{ type: 'text', text: 'olá' }],
            usage: { input_tokens: 3, output_tokens: 5 },
          }),
      },
    } as unknown as Anthropic
    const provider = new ClaudeProvider({}, client)
    const res = await provider.complete({
      model: 'claude-sonnet-4-6',
      messages: [{ role: 'user', content: 'oi' }],
    })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data.text).toBe('olá')
      expect(res.data.providerKind).toBe('claude')
      expect(res.data.usage).toMatchObject({ inputTokens: 3, outputTokens: 5 })
    }
  })

  it('erro permanente do SDK (401) → Result err não-retriable, sem lançar', async () => {
    const client = {
      messages: {
        create: () => Promise.reject({ status: 401, message: 'invalid api key' }),
      },
    } as unknown as Anthropic
    const provider = new ClaudeProvider({}, client)
    const res = await provider.complete({ model: 'm', messages: [{ role: 'user', content: 'oi' }] })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.retriable).toBe(false)
  })
})
