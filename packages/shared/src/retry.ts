/**
 * Política de retry central única — reutilizada por Runtime e workers (FR-5/FR-17).
 * Padrão: até 3 tentativas, backoff exponencial ≈1s → 4s → 16s.
 */

export interface RetryPolicy {
  maxAttempts: number
  baseDelayMs: number
  factor: number
  maxDelayMs: number
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  factor: 4,
  maxDelayMs: 16000,
}

/**
 * Atraso (ms) após a tentativa `attempt` falhar, antes da próxima.
 * attempt é 1-based: 1 → base (1s), 2 → base*factor (4s), 3 → 16s.
 */
export function backoffDelayMs(
  attempt: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
): number {
  const raw = policy.baseDelayMs * policy.factor ** (attempt - 1)
  return Math.min(raw, policy.maxDelayMs)
}

export interface WithRetryOptions {
  policy?: RetryPolicy
  /** Decide se um erro é transitório. Padrão: erro com `retriable === true`. */
  isRetriable?: (error: unknown) => boolean
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void
  /** Injeção para testes (evita esperar de verdade). */
  sleep?: (ms: number) => Promise<void>
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

function defaultIsRetriable(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'retriable' in error &&
      (error as { retriable?: unknown }).retriable === true,
  )
}

/**
 * Executa `fn` aplicando a política de retry. `fn` recebe o número da tentativa (1-based).
 * Esgotadas as tentativas (ou erro permanente), relança o último erro — o chamador
 * decide escalar sem completar Ação Irreversível.
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: WithRetryOptions = {},
): Promise<T> {
  const policy = options.policy ?? DEFAULT_RETRY_POLICY
  const isRetriable = options.isRetriable ?? defaultIsRetriable
  const sleep = options.sleep ?? defaultSleep
  // Garante ao menos 1 tentativa: maxAttempts <= 0 nunca deve relançar `undefined`.
  const maxAttempts = Math.max(1, policy.maxAttempts)
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt)
    } catch (error) {
      lastError = error
      const canRetry = attempt < maxAttempts && isRetriable(error)
      if (!canRetry) break
      const delayMs = backoffDelayMs(attempt, policy)
      options.onRetry?.(attempt, delayMs, error)
      await sleep(delayMs)
    }
  }

  throw lastError
}
