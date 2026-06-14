import { describe, expect, it } from 'bun:test'
import { backoffDelayMs, DEFAULT_RETRY_POLICY, withRetry } from './retry'

const noSleep = async (): Promise<void> => {}

describe('retry', () => {
  it('backoff exponencial 1s → 4s → 16s', () => {
    expect(backoffDelayMs(1)).toBe(1000)
    expect(backoffDelayMs(2)).toBe(4000)
    expect(backoffDelayMs(3)).toBe(16000)
  })

  it('respeita maxAttempts (3) para erro retriable e relança o último erro', async () => {
    let calls = 0
    const delays: number[] = []
    let thrown: unknown
    try {
      await withRetry(
        async () => {
          calls++
          throw { code: 'TIMEOUT', message: 't', retriable: true }
        },
        { sleep: noSleep, onRetry: (_attempt, delayMs) => delays.push(delayMs) },
      )
    } catch (error) {
      thrown = error
    }
    expect(thrown).toMatchObject({ code: 'TIMEOUT' })
    expect(calls).toBe(DEFAULT_RETRY_POLICY.maxAttempts)
    expect(delays).toEqual([1000, 4000])
  })

  it('não faz retry de erro permanente (retriable=false)', async () => {
    let calls = 0
    let thrown: unknown
    try {
      await withRetry(
        async () => {
          calls++
          throw { code: 'AUTH', message: 'bad', retriable: false }
        },
        { sleep: noSleep },
      )
    } catch (error) {
      thrown = error
    }
    expect(thrown).toMatchObject({ code: 'AUTH' })
    expect(calls).toBe(1)
  })

  it('retorna no sucesso sem relançar', async () => {
    let calls = 0
    const value = await withRetry(
      async (attempt) => {
        calls++
        if (attempt < 2) throw { code: 'X', message: 'x', retriable: true }
        return 'ok'
      },
      { sleep: noSleep },
    )
    expect(value).toBe('ok')
    expect(calls).toBe(2)
  })

  it('maxAttempts <= 0 executa ao menos 1 vez e relança o erro real (não undefined)', async () => {
    let calls = 0
    let thrown: unknown
    try {
      await withRetry(
        async () => {
          calls++
          throw { code: 'BOOM', message: 'b', retriable: false }
        },
        {
          sleep: noSleep,
          policy: { maxAttempts: 0, baseDelayMs: 1000, factor: 4, maxDelayMs: 16000 },
        },
      )
    } catch (error) {
      thrown = error
    }
    expect(calls).toBe(1)
    expect(thrown).toMatchObject({ code: 'BOOM' })
  })
})
