import { BaseProvider } from '../base'
import type { CompletionResult, LLMRequest, ProviderKind } from '../types'

export type FakeHandler = (req: LLMRequest) => CompletionResult | Promise<CompletionResult>

/** Adaptador em memória para testes e fluxos sem rede real. */
export class FakeProvider extends BaseProvider {
  readonly kind: ProviderKind
  private readonly handler: FakeHandler

  constructor(kind: ProviderKind, handler: FakeHandler) {
    super()
    this.kind = kind
    this.handler = handler
  }

  protected call(req: LLMRequest): Promise<CompletionResult> {
    return Promise.resolve(this.handler(req))
  }
}
