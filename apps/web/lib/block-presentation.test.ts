import { describe, expect, it } from 'bun:test'
import type { Block } from '@robbia/shared'

import { hasModelBadge } from './block-presentation'

const block = (model?: string): Block => ({
  type: 'gatilho',
  name: 'b',
  justification: 'j',
  model,
  config: {},
})

describe('hasModelBadge', () => {
  it('true quando o Bloco tem um Modelo', () => {
    expect(hasModelBadge(block('claude-sonnet-4-6'))).toBe(true)
  })

  it('false quando o Bloco é "sem LLM" (sem model)', () => {
    expect(hasModelBadge(block())).toBe(false)
  })

  it('false para model vazio', () => {
    expect(hasModelBadge(block(''))).toBe(false)
  })
})
