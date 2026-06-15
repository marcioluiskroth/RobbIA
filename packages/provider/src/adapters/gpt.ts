import OpenAI from 'openai'
import { BaseProvider } from '../base'
import type { CompletionResult, LLMRequest, ProviderConfig, ProviderKind } from '../types'
import { openAiChat } from './openai-compat'

/** Adaptador OpenAI GPT (Provider direto — frontier). */
export class GptProvider extends BaseProvider {
  readonly kind: ProviderKind = 'gpt'
  private readonly config: ProviderConfig
  private readonly injected?: OpenAI
  private cached?: OpenAI

  constructor(config: ProviderConfig = {}, client?: OpenAI) {
    super()
    this.config = config
    this.injected = client
  }

  /** Cliente lazy: um throw do SDK (sem credencial) cai no try/catch de `complete`. */
  private getClient(): OpenAI {
    if (this.injected) return this.injected
    this.cached ??= new OpenAI({
      ...(this.config.apiKey ? { apiKey: this.config.apiKey } : {}),
      ...(this.config.baseURL ? { baseURL: this.config.baseURL } : {}),
    })
    return this.cached
  }

  protected async call(req: LLMRequest): Promise<CompletionResult> {
    return openAiChat(this.getClient(), req, this.kind)
  }
}
