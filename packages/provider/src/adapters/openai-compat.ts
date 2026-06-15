import type OpenAI from 'openai'
import type { CompletionResult, LLMRequest, ProviderKind } from '../types'

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

/** Chamada de chat compatível com a API OpenAI (usada por GPT e OpenRouter). */
export async function openAiChat(
  client: OpenAI,
  req: LLMRequest,
  kind: ProviderKind,
): Promise<CompletionResult> {
  const messages: ChatMessage[] = [
    ...(req.system ? [{ role: 'system' as const, content: req.system }] : []),
    ...req.messages.map((m) => ({ role: m.role, content: m.content })),
  ]
  const res = await client.chat.completions.create({
    model: req.model,
    messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
    ...(req.maxTokens !== undefined ? { max_tokens: req.maxTokens } : {}),
    ...(req.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
  })
  const text = res.choices[0]?.message?.content ?? ''
  return {
    text,
    model: req.model,
    providerKind: kind,
    usage: { inputTokens: res.usage?.prompt_tokens, outputTokens: res.usage?.completion_tokens },
  }
}
