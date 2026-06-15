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

  it('mensagem role:system em messages[] é dobrada em `system` e não vira turno user', async () => {
    let captured: { system?: string; messages: { role: string; content: string }[] } | undefined
    const client = {
      messages: {
        create: (args: { system?: string; messages: { role: string; content: string }[] }) => {
          captured = args
          return Promise.resolve({
            content: [{ type: 'text', text: 'ok' }],
            usage: { input_tokens: 1, output_tokens: 1 },
          })
        },
      },
    } as unknown as Anthropic
    const provider = new ClaudeProvider({}, client)
    await provider.complete({
      model: 'm',
      messages: [
        { role: 'system', content: 'seja conciso' },
        { role: 'user', content: 'oi' },
      ],
    })
    expect(captured?.system).toContain('seja conciso')
    expect(captured?.messages).toEqual([{ role: 'user', content: 'oi' }])
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
