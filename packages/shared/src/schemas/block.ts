import { z } from 'zod'
import { BlockTypeSchema } from './block-type'

/**
 * Proposta de um Bloco pela IA Arquiteta (FR-1/FR-2): Tipo, Modelo sugerido e justificativa.
 * `model` ausente = Bloco "sem LLM" (determinístico — FR-4).
 */
export const BlockSchema = z.object({
  type: BlockTypeSchema,
  name: z.string().min(1),
  justification: z.string().min(1),
  model: z.string().min(1).optional(),
  config: z.record(z.string(), z.unknown()).default({}),
})

export type Block = z.infer<typeof BlockSchema>
