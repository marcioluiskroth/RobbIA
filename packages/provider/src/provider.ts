import type { Result } from '@robbia/shared'
import type { CompletionResult, LLMRequest, ProviderKind, StructuredRequest } from './types'

/** Interface única para todo Modelo de IA — adaptadores por Provider implementam isto (FR-9). */
export interface LLMProvider {
  readonly kind: ProviderKind
  complete(req: LLMRequest): Promise<Result<CompletionResult>>
  completeStructured<T>(req: StructuredRequest<T>): Promise<Result<T>>
}
