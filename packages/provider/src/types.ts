import { z } from 'zod'

/** Os 5 Providers do MVP (FR-9). */
export type ProviderKind = 'claude' | 'gpt' | 'gemini' | 'ollama' | 'openrouter'

export const ROLES = ['system', 'user', 'assistant'] as const
export type Role = (typeof ROLES)[number]

export const LLMMessageSchema = z.object({
  role: z.enum(ROLES),
  content: z.string(),
})
export type LLMMessage = z.infer<typeof LLMMessageSchema>

/** Requisição unificada a um Modelo de IA — independente de Provider. */
export interface LLMRequest {
  model: string
  messages: LLMMessage[]
  system?: string
  temperature?: number
  maxTokens?: number
  /** Pede saída JSON ao Provider quando há modo nativo (OpenAI/Ollama/Gemini). */
  jsonMode?: boolean
}

export interface TokenUsage {
  inputTokens?: number
  outputTokens?: number
}

/** Resultado normalizado de uma chamada — independente de Provider. */
export interface CompletionResult {
  text: string
  model: string
  providerKind: ProviderKind
  usage?: TokenUsage
}

/** Requisição de saída estruturada validada contra um schema Zod (FR-9). */
export interface StructuredRequest<T> extends LLMRequest {
  schema: z.ZodType<T>
  /** Tentativas de "repair" (re-prompt no erro de validação). Padrão 2. */
  repairAttempts?: number
}

/** Config de um Provider (chave/baseURL). Segredos vêm de env/CES — nunca chumbados. */
export interface ProviderConfig {
  apiKey?: string
  baseURL?: string
}
