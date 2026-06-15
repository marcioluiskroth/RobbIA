import type { LLMProvider } from '@robbia/provider'
import type { Result } from '@robbia/shared'
import { type ArchitectResponse, ArchitectResponseSchema } from './schema'
import { buildSystemPrompt } from './system-prompt'
import type { ArchitectInput } from './types'

/**
 * Decompõe uma descrição em linguagem natural numa proposta de Harness — ou num
 * pedido de esclarecimento (FR-1). Usa `provider.completeStructured`, que valida
 * contra o schema e aplica repair; erros de Provider são propagados como `Result` de erro.
 */
export function decompose(
  provider: LLMProvider,
  input: ArchitectInput,
): Promise<Result<ArchitectResponse>> {
  return provider.completeStructured<ArchitectResponse>({
    model: input.model,
    system: buildSystemPrompt(input.workspace),
    messages: [{ role: 'user', content: input.description }],
    schema: ArchitectResponseSchema,
    repairAttempts: input.repairAttempts,
  })
}
