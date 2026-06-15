import { err, ok, type Result, withRetry } from '@robbia/shared'
import { mapProviderError } from './errors'
import { completeStructured as runStructured } from './normalize'
import type { LLMProvider } from './provider'
import type { CompletionResult, LLMRequest, ProviderKind, StructuredRequest } from './types'

/**
 * Normaliza mensagens `role:'system'` embutidas em `messages[]`: dobra-as em `req.system`
 * (concatenadas, na ordem) e remove-as de `messages`. Um único ponto garante semântica
 * idêntica entre Providers (AC3, fungibilidade) — sem isto, Claude descartava o conteúdo
 * e Gemini o rotulava como 'user'. Caso não haja system em messages, retorna `req` intocado.
 */
export function foldSystemMessages(req: LLMRequest): LLMRequest {
  const systemFromMessages = req.messages.filter((m) => m.role === 'system')
  if (systemFromMessages.length === 0) return req
  const system = [req.system, ...systemFromMessages.map((m) => m.content)]
    .filter((s): s is string => Boolean(s))
    .join('\n\n')
  return { ...req, system, messages: req.messages.filter((m) => m.role !== 'system') }
}

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
    const normalized = foldSystemMessages(req)
    try {
      const data = await withRetry(() => this.call(normalized), {
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
