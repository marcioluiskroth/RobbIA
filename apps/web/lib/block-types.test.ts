import { describe, expect, it } from 'bun:test'
import { BLOCK_TYPES } from '@robbia/shared'
import { CheckCircle2, Database, GitBranch, MessageSquare, Monitor, Send, Zap } from 'lucide-react'
import { BLOCK_TYPE_VISUALS, type BlockTypeVisual, blockTypeVisual } from './block-types'

/** Mapa AUTORITATIVO esperado (DESIGN.md › Block Types) — qualquer divergência deve falhar. */
const EXPECTED: Record<string, BlockTypeVisual> = {
  gatilho: { borderColorToken: 'cyan', icon: Zap, shape: 'stadium' },
  contexto: { borderColorToken: 'slate', icon: Database, shape: 'rounded-rect' },
  decisao: { borderColorToken: 'graphite', icon: GitBranch, shape: 'diamond' },
  resposta: { borderColorToken: 'steel', icon: MessageSquare, shape: 'rounded-rect' },
  rpa: { borderColorToken: 'slate', icon: Monitor, shape: 'sharp-rect' },
  acao: { borderColorToken: 'cyan', icon: Send, shape: 'stadium' },
  verificacao: { borderColorToken: 'steel', icon: CheckCircle2, shape: 'hexagon' },
}

describe('block type visuals', () => {
  it('fixa ícone/forma/cor exatos de cada um dos 7 Tipos (mapa autoritativo)', () => {
    expect(BLOCK_TYPES).toHaveLength(7)
    for (const type of BLOCK_TYPES) {
      expect(blockTypeVisual(type)).toEqual(EXPECTED[type] as BlockTypeVisual)
    }
  })

  it('ciano SÓ em gatilho e acao (disciplina do ciano)', () => {
    const cyan = BLOCK_TYPES.filter((t) => BLOCK_TYPE_VISUALS[t].borderColorToken === 'cyan').sort()
    expect(cyan).toEqual(['acao', 'gatilho'])
  })

  it('o mapa cobre EXATAMENTE os 7 BLOCK_TYPES (sem chave faltante nem sobrando)', () => {
    expect(Object.keys(BLOCK_TYPE_VISUALS).sort()).toEqual([...BLOCK_TYPES].sort())
  })
})
