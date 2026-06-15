import { GoogleGenAI } from '@google/genai'
import { BaseProvider } from '../base'
import type { CompletionResult, LLMRequest, ProviderConfig, ProviderKind } from '../types'

/** Adaptador Google Gemini (@google/genai — Provider direto). */
export class GeminiProvider extends BaseProvider {
  readonly kind: ProviderKind = 'gemini'
  private readonly config: ProviderConfig
  private readonly injected?: GoogleGenAI
  private cached?: GoogleGenAI

  constructor(config: ProviderConfig = {}, client?: GoogleGenAI) {
    super()
    this.config = config
    this.injected = client
  }

  /** Cliente lazy: um throw do SDK (sem credencial) cai no try/catch de `complete`. */
  private getClient(): GoogleGenAI {
    if (this.injected) return this.injected
    this.cached ??= new GoogleGenAI({ apiKey: this.config.apiKey ?? '' })
    return this.cached
  }

  protected async call(req: LLMRequest): Promise<CompletionResult> {
    // `req` já chega com system dobrado em `req.system` (BaseProvider) → systemInstruction.
    const contents = req.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const res = await this.getClient().models.generateContent({
      model: req.model,
      contents,
      config: {
        ...(req.system ? { systemInstruction: req.system } : {}),
        ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
        ...(req.maxTokens !== undefined ? { maxOutputTokens: req.maxTokens } : {}),
        ...(req.jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    })
    return { text: res.text ?? '', model: req.model, providerKind: this.kind }
  }
}
