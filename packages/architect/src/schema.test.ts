import { describe, expect, it } from 'bun:test'
import { ArchitectResponseSchema } from './schema'

const harness = {
  kind: 'harness',
  harness: {
    name: 'Agente',
    blocks: [{ type: 'gatilho', name: 'g', justification: 'recebe msg' }],
  },
}
const clarification = { kind: 'clarification', questions: ['Qual o Canal de origem?'] }

describe('ArchitectResponseSchema', () => {
  it('valida proposta harness', () => {
    expect(ArchitectResponseSchema.safeParse(harness).success).toBe(true)
  })

  it('valida clarification', () => {
    expect(ArchitectResponseSchema.safeParse(clarification).success).toBe(true)
  })

  it('rejeita kind desconhecido / harness sem Blocos / clarification vazia', () => {
    expect(ArchitectResponseSchema.safeParse({ kind: 'x' }).success).toBe(false)
    expect(
      ArchitectResponseSchema.safeParse({ kind: 'harness', harness: { name: 'A', blocks: [] } })
        .success,
    ).toBe(false)
    expect(
      ArchitectResponseSchema.safeParse({ kind: 'clarification', questions: [] }).success,
    ).toBe(false)
  })
})
