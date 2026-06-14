import { err, ok, type Result, withRetry } from '@robbia/shared'
import { mapProviderError } from './errors'
import { completeStructured as runStructured } from './normalize'
import type { LLMProvider } from './provider'
import type { CompletionResult, LLMRequest, ProviderKind, StructuredRequest } from './types'

/**
 * Base comum dos adaptadores: centraliza retry (transitório, via @robbia/shared),
 * mapeamento de erro e o caminho de saída estruturada (complete + normalize/repair).
 * Cada adaptador só implementa `call` (a chamada bruta ao SDK).
 */
export abstract class BaseProvider implements LLMProvider {
  abstract readonly kind: ProviderKind

  /** Chamada bruta ao SDK do Provider. Pode lançar — a base mapeia/aplica retry. */
  protected abstract call(req: LLMRequest): Promise<CompletionResult>

  async complete(req: LLMRequest): Promise<Result<CompletionResult>> {
    try {
      const data = await withRetry(() => this.call(req), {
        isRetriable: (error) => mapProviderError(error, this.kind).retriable,
      })
      return ok(data)
    } catch (error) {
      return err(mapProviderError(error, this.kind))
    }
  }

  completeStructured<T>(req: StructuredRequest<T>): Promise<Result<T>> {
    return runStructured((r) => this.complete(r), req)
  }
}
