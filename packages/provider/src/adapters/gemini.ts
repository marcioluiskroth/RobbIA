import { GoogleGenAI } from '@google/genai'
import { BaseProvider } from '../base'
import type { CompletionResult, LLMRequest, ProviderConfig, ProviderKind } from '../types'

/** Adaptador Google Gemini (@google/genai — Provider direto). */
export class GeminiProvider extends BaseProvider {
  readonly kind: ProviderKind = 'gemini'
  private readonly client: GoogleGenAI

  constructor(config: ProviderConfig = {}, client?: GoogleGenAI) {
    super()
    this.client = client ?? new GoogleGenAI({ apiKey: config.apiKey ?? '' })
  }

  protected async call(req: LLMRequest): Promise<CompletionResult> {
    const contents = req.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const res = await this.client.models.generateContent({
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
