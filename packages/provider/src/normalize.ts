import { err, ok, type Result } from '@robbia/shared'
import type { z } from 'zod'
import type { CompletionResult, LLMRequest, StructuredRequest } from './types'

/** Extrai o JSON da saída do modelo (tolerante a cercas ```json e prosa ao redor). */
export function extractJson(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fenced?.[1] ?? raw).trim()
  const start = candidate.search(/[[{]/)
  if (start === -1) return null
  return candidate.slice(start).trim()
}

/** Valida a saída bruta contra um schema Zod. Erro → mensagem usável no repair. */
export function parseStructured<T>(raw: string, schema: z.ZodType<T>): Result<T> {
  const jsonText = extractJson(raw)
  if (jsonText === null) {
    return err({
      code: 'PARSE_NO_JSON',
      message: 'No JSON found in model output',
      retriable: false,
    })
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch (error) {
    return err({
      code: 'PARSE_INVALID_JSON',
      message: `Invalid JSON: ${(error as Error).message}`,
      retriable: false,
    })
  }
  const result = schema.safeParse(parsed)
  if (!result.success) {
    return err({ code: 'SCHEMA_VALIDATION', message: result.error.message, retriable: false })
  }
  return ok(result.data)
}

export type CompleteFn = (req: LLMRequest) => Promise<Result<CompletionResult>>

/**
 * Obtém saída estruturada via `complete` + validação Zod, com loop de REPAIR
 * (re-prompt com o erro de validação). Falha de rede (complete err) NÃO é repair —
 * já passou pelo retry na camada de complete; aqui só se trata validação.
 */
export async function completeStructured<T>(
  complete: CompleteFn,
  req: StructuredRequest<T>,
): Promise<Result<T>> {
  const maxAttempts = (req.repairAttempts ?? 2) + 1
  let lastError = 'unknown validation error'

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const messages =
      attempt === 1
        ? req.messages
        : [
            ...req.messages,
            {
              role: 'user' as const,
              content: `Your previous output was invalid: ${lastError}. Respond ONLY with valid JSON matching the requested schema — no prose, no code fences.`,
            },
          ]
    const completion = await complete({ ...req, messages, jsonMode: true })
    if (!completion.ok) return completion
    const parsed = parseStructured(completion.data.text, req.schema)
    if (parsed.ok) return parsed
    lastError = parsed.error.message
  }

  return err({
    code: 'STRUCTURED_REPAIR_EXHAUSTED',
    message: `Failed to obtain valid structured output after ${maxAttempts} attempts: ${lastError}`,
    retriable: false,
  })
}
