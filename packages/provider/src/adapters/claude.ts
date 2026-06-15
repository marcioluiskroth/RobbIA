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
  private readonly config: ProviderConfig
  private readonly injected?: Anthropic
  private cached?: Anthropic

  constructor(config: ProviderConfig = {}, client?: Anthropic) {
    super()
    this.config = config
    this.injected = client
  }

  /** Cliente lazy: um throw do SDK (sem credencial) cai no try/catch de `complete`. */
  private getClient(): Anthropic {
    if (this.injected) return this.injected
    this.cached ??= new Anthropic(this.config.apiKey ? { apiKey: this.config.apiKey } : {})
    return this.cached
  }

  protected async call(req: LLMRequest): Promise<CompletionResult> {
    // `req` já chega com mensagens role:'system' dobradas em `req.system` (BaseProvider).
    const res = await this.getClient().messages.create({
      model: req.model,
      max_tokens: req.maxTokens ?? 4096,
      ...(req.system ? { system: req.system } : {}),
      ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
      messages: req.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
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
