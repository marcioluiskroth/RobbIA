import { describe, expect, it } from 'bun:test'
import type OpenAI from 'openai'
import { OpenRouterProvider } from './openrouter'

type ChatArgs = { messages: { role: string; content: string }[] }

const mockOpenAI = (capture?: (args: ChatArgs) => void): OpenAI =>
  ({
    chat: {
      completions: {
        create: (args: ChatArgs) => {
          capture?.(args)
          return Promise.resolve({
            choices: [{ message: { content: 'amplitude' } }],
            usage: { prompt_tokens: 4, completion_tokens: 6 },
          })
        },
      },
    },
  }) as unknown as OpenAI

describe('OpenRouterProvider (cliente mockado) — caminho de amplitude', () => {
  it('não lança ao construir sem API key (cliente é lazy)', () => {
    expect(() => new OpenRouterProvider({})).not.toThrow()
  })

  it('mapeia a resposta do SDK compatível-OpenAI para CompletionResult', async () => {
    const provider = new OpenRouterProvider({}, mockOpenAI())
    const res = await provider.complete({
      model: 'meta-llama/llama-3-70b',
      messages: [{ role: 'user', content: 'oi' }],
    })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data.text).toBe('amplitude')
      expect(res.data.providerKind).toBe('openrouter')
      expect(res.data.usage).toMatchObject({ inputTokens: 4, outputTokens: 6 })
    }
  })

  it('dobra system de messages[] em uma mensagem system única (consistência cross-provider)', async () => {
    let captured: ChatArgs | undefined
    const provider = new OpenRouterProvider(
      {},
      mockOpenAI((a) => (captured = a)),
    )
    await provider.complete({
      model: 'm',
      messages: [
        { role: 'system', content: 'seja conciso' },
        { role: 'user', content: 'oi' },
      ],
    })
    const roles = captured?.messages.map((m) => m.role)
    expect(roles).toEqual(['system', 'user'])
    expect(captured?.messages[0]?.content).toContain('seja conciso')
  })
})
