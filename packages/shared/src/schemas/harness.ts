import { z } from 'zod'
import { BlockSchema } from './block'

/** Proposta de Harness: sequência ordenada de Blocos com justificativa (FR-1). */
export const HarnessSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  blocks: z.array(BlockSchema).min(1),
})

export type Harness = z.infer<typeof HarnessSchema>
