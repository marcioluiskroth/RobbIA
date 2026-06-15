import { Ollama } from 'ollama'
import { BaseProvider } from '../base'
import type { CompletionResult, LLMRequest, ProviderConfig, ProviderKind } from '../types'

/** Adaptador Ollama — caminho 100% LOCAL exigido pelo AC1 (privacidade/LGPD). */
export class OllamaProvider extends BaseProvider {
  readonly kind: ProviderKind = 'ollama'
  private readonly client: Ollama

  constructor(config: ProviderConfig = {}, client?: Ollama) {
    super()
    this.client = client ?? new Ollama({ host: config.baseURL ?? 'http://localhost:11434' })
  }

  protected async call(req: LLMRequest): Promise<CompletionResult> {
    const messages = [
      ...(req.system ? [{ role: 'system', content: req.system }] : []),
      ...req.messages.map((m) => ({ role: m.role, content: m.content })),
    ]
    const res = await this.client.chat({
      model: req.model,
      messages,
      stream: false,
      ...(req.jsonMode ? { format: 'json' } : {}),
      ...(req.temperature !== undefined ? { options: { temperature: req.temperature } } : {}),
    })
    return {
      text: res.message.content,
      model: req.model,
      providerKind: this.kind,
      usage: { inputTokens: res.prompt_eval_count, outputTokens: res.eval_count },
    }
  }
}
