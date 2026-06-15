import { describe, expect, it } from 'bun:test'
import { z } from 'zod'
import { completeStructured, extractJson, parseStructured } from './normalize'
import type { CompletionResult, StructuredRequest } from './types'

const Schema = z.object({ name: z.string(), count: z.number() })
type Shape = z.infer<typeof Schema>

const okCompletion = (text: string): { ok: true; data: CompletionResult } => ({
  ok: true,
  data: { text, model: 'm', providerKind: 'gpt' },
})

describe('normalize', () => {
  it('extractJson lida com cercas ```json e prosa ao redor', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toBe('{"a":1}')
    expect(extractJson('aqui está: {"a":1}')).toBe('{"a":1}')
    expect(extractJson('sem json aqui')).toBeNull()
  })

  it('parseStructured: válido → ok; schema inválido → err; JSON inválido → err', () => {
    expect(parseStructured('{"name":"x","count":2}', Schema)).toMatchObject({
      ok: true,
      data: { name: 'x', count: 2 },
    })
    expect(parseStructured('{"name":"x"}', Schema).ok).toBe(false)
    expect(parseStructured('{nope}', Schema).ok).toBe(false)
  })

  it('completeStructured: sucesso na 1ª tentativa', async () => {
    const req: StructuredRequest<Shape> = { model: 'm', messages: [], schema: Schema }
    const res = await completeStructured(
      () => Promise.resolve(okCompletion('{"name":"x","count":1}')),
      req,
    )
    expect(res).toMatchObject({ ok: true, data: { name: 'x', count: 1 } })
  })

  it('completeStructured: repair recupera na 2ª tentativa', async () => {
    let n = 0
    const req: StructuredRequest<Shape> = {
      model: 'm',
      messages: [],
      schema: Schema,
      repairAttempts: 2,
    }
    const res = await completeStructured(() => {
      n++
      return Promise.resolve(okCompletion(n === 1 ? '{"name":"x"}' : '{"name":"x","count":2}'))
    }, req)
    expect(res.ok).toBe(true)
    expect(n).toBe(2)
  })

  it('completeStructured: esgota o repair → err', async () => {
    const req: StructuredRequest<Shape> = {
      model: 'm',
      messages: [],
      schema: Schema,
      repairAttempts: 1,
    }
    const res = await completeStructured(() => Promise.resolve(okCompletion('{"bad":true}')), req)
    expect(res.ok).toBe(false)
  })

  it('completeStructured: erro de complete (rede) propaga sem repair', async () => {
    let n = 0
    const req: StructuredRequest<Shape> = { model: 'm', messages: [], schema: Schema }
    const res = await completeStructured(() => {
      n++
      return Promise.resolve({
        ok: false as const,
        error: { code: 'PROVIDER_HTTP_500', message: 'boom', retriable: true },
      })
    }, req)
    expect(res.ok).toBe(false)
    expect(n).toBe(1)
  })
})
