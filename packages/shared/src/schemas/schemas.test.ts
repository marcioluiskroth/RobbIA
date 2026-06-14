import { describe, expect, it } from 'bun:test'
import { BLOCK_TYPES, BlockSchema, BlockTypeSchema, HarnessSchema } from './index'

describe('domain schemas', () => {
  it('BlockTypeSchema aceita os 7 tipos e rejeita inválido', () => {
    expect(BLOCK_TYPES).toHaveLength(7)
    for (const t of BLOCK_TYPES) {
      expect(BlockTypeSchema.parse(t)).toBe(t)
    }
    expect(BlockTypeSchema.safeParse('invalido').success).toBe(false)
  })

  it('BlockSchema: Bloco "sem LLM" (sem model) é válido; sem justification é inválido', () => {
    expect(
      BlockSchema.safeParse({ type: 'contexto', name: 'ctx', justification: 'busca histórico' })
        .success,
    ).toBe(true)
    expect(BlockSchema.safeParse({ type: 'contexto', name: 'ctx' }).success).toBe(false)
    expect(BlockSchema.safeParse({ type: 'x', name: 'n', justification: 'j' }).success).toBe(false)
  })

  it('BlockSchema preenche config vazio por padrão', () => {
    const parsed = BlockSchema.parse({ type: 'gatilho', name: 'g', justification: 'inicia' })
    expect(parsed.config).toEqual({})
  })

  it('HarnessSchema: exige name e ao menos 1 Bloco', () => {
    const ok = HarnessSchema.safeParse({
      name: 'Agente WhatsApp',
      blocks: [{ type: 'gatilho', name: 'g', justification: 'recebe mensagem' }],
    })
    expect(ok.success).toBe(true)
    expect(HarnessSchema.safeParse({ name: '', blocks: [] }).success).toBe(false)
  })
})
