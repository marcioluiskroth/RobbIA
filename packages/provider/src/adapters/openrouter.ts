import OpenAI from 'openai'
import { BaseProvider } from '../base'
import type { CompletionResult, LLMRequest, ProviderConfig, ProviderKind } from '../types'
import { openAiChat } from './openai-compat'

/** Adaptador OpenRouter (API compatível com OpenAI) — caminho de AMPLITUDE (FR-9). */
export class OpenRouterProvider extends BaseProvider {
  readonly kind: ProviderKind = 'openrouter'
  private readonly client: OpenAI

  constructor(config: ProviderConfig = {}, client?: OpenAI) {
    super()
    this.client =
      client ??
      new OpenAI({
        apiKey: config.apiKey ?? '',
        baseURL: config.baseURL ?? 'https://openrouter.ai/api/v1',
      })
  }

  protected call(req: LLMRequest): Promise<CompletionResult> {
    return openAiChat(this.client, req, this.kind)
  }
}
