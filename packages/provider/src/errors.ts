import type { ResultError } from '@robbia/shared'
import type { ProviderKind } from './types'

const RETRIABLE_STATUS = new Set([408, 409, 425, 429])

export function isRetriableStatus(status: number | undefined): boolean {
  if (status === undefined) return false
  return RETRIABLE_STATUS.has(status) || status >= 500
}

interface MaybeApiError {
  status?: number
  code?: string
  name?: string
  message?: string
}

/**
 * Mapeia um erro de SDK/HTTP para o `ResultError` discriminado de @robbia/shared,
 * distinguindo transitório (retry) de permanente (escala) — FR-17.
 */
export function mapProviderError(error: unknown, providerKind: ProviderKind): ResultError {
  const e: MaybeApiError = error && typeof error === 'object' ? (error as MaybeApiError) : {}
  const status = typeof e.status === 'number' ? e.status : undefined
  const isTimeout =
    e.name === 'APIConnectionTimeoutError' ||
    e.code === 'ETIMEDOUT' ||
    e.code === 'ECONNRESET' ||
    /timeout|timed out/i.test(e.message ?? '')
  const retriable = isTimeout || isRetriableStatus(status)
  const code = status !== undefined ? `PROVIDER_HTTP_${status}` : (e.code ?? 'PROVIDER_ERROR')
  const message = `[${providerKind}] ${e.message ?? 'unknown provider error'}`
  return { code, message, retriable }
}
