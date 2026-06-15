import OpenAI from 'openai'
import { BaseProvider } from '../base'
import type { CompletionResult, LLMRequest, ProviderConfig, ProviderKind } from '../types'
import { openAiChat } from './openai-compat'

/** Adaptador OpenAI GPT (Provider direto — frontier). */
export class GptProvider extends BaseProvider {
  readonly kind: ProviderKind = 'gpt'
  private readonly client: OpenAI

  constructor(config: ProviderConfig = {}, client?: OpenAI) {
    super()
    this.client =
      client ??
      new OpenAI({
        ...(config.apiKey ? { apiKey: config.apiKey } : {}),
        ...(config.baseURL ? { baseURL: config.baseURL } : {}),
      })
  }

  protected call(req: LLMRequest): Promise<CompletionResult> {
    return openAiChat(this.client, req, this.kind)
  }
}
