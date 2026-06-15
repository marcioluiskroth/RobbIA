import OpenAI from 'openai'
import { BaseProvider } from '../base'
import type { CompletionResult, LLMRequest, ProviderConfig, ProviderKind } from '../types'
import { openAiChat } from './openai-compat'

/** Adaptador OpenRouter (API compatível com OpenAI) — caminho de AMPLITUDE (FR-9). */
export class OpenRouterProvider extends BaseProvider {
  readonly kind: ProviderKind = 'openrouter'
  private readonly config: ProviderConfig
  private readonly injected?: OpenAI
  private cached?: OpenAI

  constructor(config: ProviderConfig = {}, client?: OpenAI) {
    super()
    this.config = config
    this.injected = client
  }

  /**
   * Cliente construído LAZY, dentro de `call`. O SDK da OpenAI lança síncrono quando
   * falta credencial; construir aqui (e `call` ser async) garante que o throw caia no
   * try/catch de `BaseProvider.complete` e vire `Result` err — nunca escapa do contrato (AC4).
   * Nunca passar `apiKey: ''` (string vazia força o throw mesmo com env presente).
   */
  private getClient(): OpenAI {
    if (this.injected) return this.injected
    this.cached ??= new OpenAI({
      ...(this.config.apiKey ? { apiKey: this.config.apiKey } : {}),
      baseURL: this.config.baseURL ?? 'https://openrouter.ai/api/v1',
    })
    return this.cached
  }

  protected async call(req: LLMRequest): Promise<CompletionResult> {
    return openAiChat(this.getClient(), req, this.kind)
  }
}
