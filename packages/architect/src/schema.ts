import { HarnessSchema } from '@robbia/shared'
import { z } from 'zod'

/** Proposta de Harness pronta para revisão (FR-1). */
export const HarnessProposalSchema = z.object({
  kind: z.literal('harness'),
  harness: HarnessSchema,
})

/** Pedido de esclarecimento quando falta entrada obrigatória (FR-1). */
export const ClarificationSchema = z.object({
  kind: z.literal('clarification'),
  questions: z.array(z.string().min(1)).min(1),
})

/** Saída da IA Arquiteta: union discriminado harness | clarification. */
export const ArchitectResponseSchema = z.discriminatedUnion('kind', [
  HarnessProposalSchema,
  ClarificationSchema,
])

export type HarnessProposal = z.infer<typeof HarnessProposalSchema>
export type Clarification = z.infer<typeof ClarificationSchema>
export type ArchitectResponse = z.infer<typeof ArchitectResponseSchema>
