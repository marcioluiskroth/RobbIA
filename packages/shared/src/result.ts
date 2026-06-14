/**
 * Resultado discriminado usado em TODAS as fronteiras de serviço.
 * Sem wrapper genérico solto — ver architecture.md › Padrões de Formato.
 */

export interface ResultError {
  /** Código estável e legível por máquina, ex.: 'PROVIDER_TIMEOUT'. */
  code: string
  /** Mensagem humana e acionável (sem segredos). */
  message: string
  /** Distingue falha transitória (retry) de permanente (escala) — FR-17. */
  retriable: boolean
}

export type Ok<T> = { ok: true; data: T }
export type Err<E = ResultError> = { ok: false; error: E }
export type Result<T, E = ResultError> = Ok<T> | Err<E>

export function ok<T>(data: T): Ok<T> {
  return { ok: true, data }
}

export function err<E = ResultError>(error: E): Err<E> {
  return { ok: false, error }
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok
}
