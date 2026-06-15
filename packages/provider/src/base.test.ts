import { describe, expect, it } from 'bun:test'
import { FakeProvider } from './adapters/fake'
import { foldSystemMessages } from './base'
import type { CompletionResult } from './types'

describe('BaseProvider — retry (integração com withRetry) e normalização', () => {
  it('erro transitório (429) é reexecutado pelo retry e depois sucede — AC4', async () => {
    let n = 0
    const provider = new FakeProvider('gpt', (): CompletionResult => {
      n++
      if (n === 1) throw { status: 429, message: 'rate limited' }
      return { text: 'ok', model: 'm', providerKind: 'gpt' }
    })
    const res = await provider.complete({ model: 'm', messages: [] })
    expect(res.ok).toBe(true)
    expect(n).toBe(2)
  })

  it('erro permanente (401) NÃO é reexecutado e vira Result err (sem lançar) — AC4', async () => {
    let n = 0
    const provider = new FakeProvider('gpt', (): CompletionResult => {
      n++
      throw { status: 401, message: 'bad key' }
    })
    const res = await provider.complete({ model: 'm', messages: [] })
    expect(res.ok).toBe(false)
    expect(n).toBe(1)
    if (!res.ok) expect(res.error.code).toBe('PROVIDER_HTTP_401')
  })
})

describe('foldSystemMessages', () => {
  it('dobra mensagens role:system de messages[] em req.system (na ordem) e as remove', () => {
    const folded = foldSystemMessages({
      model: 'm',
      system: 'base',
      messages: [
        { role: 'system', content: 'regra A' },
        { role: 'user', content: 'oi' },
        { role: 'system', content: 'regra B' },
      ],
    })
    expect(folded.system).toBe('base\n\nregra A\n\nregra B')
    expect(folded.messages).toEqual([{ role: 'user', content: 'oi' }])
  })

  it('sem system em messages[], retorna a requisição intocada', () => {
    const req = { model: 'm', messages: [{ role: 'user' as const, content: 'oi' }] }
    expect(foldSystemMessages(req)).toBe(req)
  })
})
