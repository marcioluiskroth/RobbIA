import Anthropic from '@anthropic-ai/sdk'
import { BaseProvider } from '../base'
import type { CompletionResult, LLMRequest, ProviderConfig, ProviderKind } from '../types'

/**
 * Adaptador Anthropic Claude (@anthropic-ai/sdk). `model` vem da config do Bloco
 * (model_configs) — não chumbado aqui. Para structured output nativo (tool use),
 * consultar a skill `claude-api`; a base usa complete + normalize (uniforme).
 */
export class ClaudeProvider extends BaseProvider {
  readonly kind: ProviderKind = 'claude'
  private readonly client: Anthropic

  constructor(config: ProviderConfig = {}, client?: Anthropic) {
    super()
    this.client = client ?? new Anthropic(config.apiKey ? { apiKey: config.apiKey } : {})
  }

  protected async call(req: LLMRequest): Promise<CompletionResult> {
    const res = await this.client.messages.create({
      model: req.model,
      max_tokens: req.maxTokens ?? 4096,
      ...(req.system ? { system: req.system } : {}),
      ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
      messages: req.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    })
    const text = res.content.map((block) => (block.type === 'text' ? block.text : '')).join('')
    return {
      text,
      model: req.model,
      providerKind: this.kind,
      usage: { inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens },
    }
  }
}
