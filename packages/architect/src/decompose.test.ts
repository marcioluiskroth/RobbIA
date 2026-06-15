import { describe, expect, it } from 'bun:test'
import { FakeProvider } from '@robbia/provider'
import { decompose } from './decompose'

const harnessJson = JSON.stringify({
  kind: 'harness',
  harness: { name: 'WhatsApp', blocks: [{ type: 'gatilho', name: 'g', justification: 'recebe' }] },
})
const clarificationJson = JSON.stringify({ kind: 'clarification', questions: ['Qual Canal?'] })

describe('decompose', () => {
  it('caminho harness: retorna a proposta parseada', async () => {
    const provider = new FakeProvider('claude', () => ({
      text: harnessJson,
      model: 'm',
      providerKind: 'claude',
    }))
    const res = await decompose(provider, { description: 'agente de WhatsApp', model: 'm' })
    expect(res.ok).toBe(true)
    if (res.ok && res.data.kind === 'harness') {
      expect(res.data.harness.blocks[0]?.type).toBe('gatilho')
    } else {
      throw new Error('esperava uma proposta de harness')
    }
  })

  it('caminho clarification: retorna perguntas', async () => {
    const provider = new FakeProvider('claude', () => ({
      text: clarificationJson,
      model: 'm',
      providerKind: 'claude',
    }))
    const res = await decompose(provider, { description: 'faça algo vago', model: 'm' })
    expect(res.ok && res.data.kind).toBe('clarification')
  })

  it('erro permanente de Provider é propagado com a identidade do erro (sem lançar)', async () => {
    const provider = new FakeProvider('claude', () => {
      throw { status: 401, message: 'invalid api key' }
    })
    const res = await decompose(provider, { description: 'x', model: 'm' })
    expect(res.ok).toBe(false)
    // não basta "algo falhou": o erro do Provider deve ser surfado fielmente (sem repair).
    if (!res.ok) {
      expect(res.error.code).toBe('PROVIDER_HTTP_401')
      expect(res.error.retriable).toBe(false)
    }
  })
})
