import { describe, expect, it } from 'bun:test'
import { FakeProvider } from '@robbia/provider'
import type { Harness } from '@robbia/shared'
import { rethinkBlock } from './rethink'

const harness: Harness = {
  name: 'Atendimento',
  blocks: [
    { type: 'gatilho', name: 'recebe', justification: 'recebe a mensagem', config: {} },
    {
      type: 'resposta',
      name: 'responde',
      justification: 'responde o cliente',
      model: 'm1',
      config: {},
    },
  ],
}

const altBlockJson = JSON.stringify({
  type: 'resposta',
  name: 'responde-melhor',
  justification: 'responde com tom mais claro',
  model: 'm2',
})

describe('rethinkBlock', () => {
  it('retorna um Bloco alternativo validado', async () => {
    const provider = new FakeProvider('claude', () => ({
      text: altBlockJson,
      model: 'm',
      providerKind: 'claude',
    }))
    const res = await rethinkBlock(provider, { harness, index: 1, model: 'm' })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data.type).toBe('resposta')
      expect(res.data.name).toBe('responde-melhor')
      expect(res.data.model).toBe('m2')
    }
  })

  it('erro permanente de Provider é propagado (sem lançar)', async () => {
    const provider = new FakeProvider('claude', () => {
      throw { status: 401, message: 'invalid api key' }
    })
    const res = await rethinkBlock(provider, { harness, index: 0, model: 'm' })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.code).toBe('PROVIDER_HTTP_401')
  })
})
