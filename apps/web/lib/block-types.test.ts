import { describe, expect, it } from 'bun:test'
import { BLOCK_TYPES } from '@robbia/shared'
import { BLOCK_TYPE_VISUALS, blockTypeVisual } from './block-types'

describe('block type visuals', () => {
  it('cobre os 7 Tipos de Bloco, cada um com cor/ícone/forma', () => {
    expect(BLOCK_TYPES).toHaveLength(7)
    for (const type of BLOCK_TYPES) {
      const visual = blockTypeVisual(type)
      expect(visual.borderColorToken).toBeTruthy()
      expect(visual.icon).toBeTruthy()
      expect(visual.shape).toBeTruthy()
    }
  })

  it('ciano SÓ em gatilho e acao (disciplina do ciano)', () => {
    const cyan = BLOCK_TYPES.filter((t) => BLOCK_TYPE_VISUALS[t].borderColorToken === 'cyan').sort()
    expect(cyan).toEqual(['acao', 'gatilho'])
  })

  it('é determinístico', () => {
    expect(blockTypeVisual('gatilho')).toEqual(blockTypeVisual('gatilho'))
  })
})
