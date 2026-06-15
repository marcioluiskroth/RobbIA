import { describe, expect, it } from 'bun:test'
import { findModel, MODEL_CATALOG, modelsByProvider } from './model-catalog'

describe('model-catalog', () => {
  it('agrupa por Provider, na ordem estável, só grupos não-vazios', () => {
    const groups = modelsByProvider()
    expect(groups.map((g) => g.provider)).toEqual([
      'claude',
      'gpt',
      'gemini',
      'ollama',
      'openrouter',
    ])
    for (const group of groups) {
      expect(group.models.length).toBeGreaterThan(0)
      for (const model of group.models) expect(model.provider).toBe(group.provider)
    }
  })

  it('toda opção tem custo e latência', () => {
    for (const model of MODEL_CATALOG) {
      expect(model.cost).toBeTruthy()
      expect(model.latency).toBeTruthy()
    }
  })

  it('findModel é determinístico', () => {
    expect(findModel('claude-sonnet-4-6')?.provider).toBe('claude')
    expect(findModel('inexistente')).toBeUndefined()
  })

  it('ids são únicos', () => {
    const ids = MODEL_CATALOG.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
