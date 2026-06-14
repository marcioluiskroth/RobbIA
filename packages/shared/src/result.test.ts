import { describe, expect, it } from 'bun:test'
import { err, isErr, isOk, ok } from './result'

describe('result', () => {
  it('ok() cria sucesso discriminado', () => {
    const result = ok(42)
    expect(result.ok).toBe(true)
    expect(isOk(result)).toBe(true)
    if (result.ok) expect(result.data).toBe(42)
  })

  it('err() cria falha com contrato de erro (code/message/retriable)', () => {
    const result = err({ code: 'PROVIDER_TIMEOUT', message: 'boom', retriable: true })
    expect(result.ok).toBe(false)
    expect(isErr(result)).toBe(true)
    if (!result.ok) {
      expect(result.error.code).toBe('PROVIDER_TIMEOUT')
      expect(result.error.retriable).toBe(true)
    }
  })
})
