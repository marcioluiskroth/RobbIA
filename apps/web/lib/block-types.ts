import type { BlockType } from '@robbia/shared'
import {
  CheckCircle2,
  Database,
  GitBranch,
  type LucideIcon,
  MessageSquare,
  Monitor,
  Send,
  Zap,
} from 'lucide-react'

/** Cor de borda/realce por Tipo de Bloco. Ciano é reservado a endpoints de energia. */
export type BlockColorToken = 'cyan' | 'slate' | 'steel' | 'graphite'
export type BlockShape = 'stadium' | 'rounded-rect' | 'diamond' | 'sharp-rect' | 'hexagon'

export interface BlockTypeVisual {
  borderColorToken: BlockColorToken
  icon: LucideIcon
  shape: BlockShape
}

/**
 * Mapa AUTORITATIVO de render dos 7 Tipos de Bloco (DESIGN.md › Block Types).
 * Disciplina do ciano: SÓ Gatilho e Ação (os endpoints) recebem ciano.
 */
export const BLOCK_TYPE_VISUALS: Record<BlockType, BlockTypeVisual> = {
  gatilho: { borderColorToken: 'cyan', icon: Zap, shape: 'stadium' },
  contexto: { borderColorToken: 'slate', icon: Database, shape: 'rounded-rect' },
  decisao: { borderColorToken: 'graphite', icon: GitBranch, shape: 'diamond' },
  resposta: { borderColorToken: 'steel', icon: MessageSquare, shape: 'rounded-rect' },
  rpa: { borderColorToken: 'slate', icon: Monitor, shape: 'sharp-rect' },
  acao: { borderColorToken: 'cyan', icon: Send, shape: 'stadium' },
  verificacao: { borderColorToken: 'steel', icon: CheckCircle2, shape: 'hexagon' },
}

export function blockTypeVisual(type: BlockType): BlockTypeVisual {
  return BLOCK_TYPE_VISUALS[type]
}

/** Classe Tailwind de borda por token de cor — fonte única (vitrine /design, BlockCard, FlowNode). */
const BORDER_CLASS: Record<BlockColorToken, string> = {
  cyan: 'border-cyan',
  slate: 'border-slate',
  steel: 'border-steel',
  graphite: 'border-graphite',
}

export function blockBorderClass(token: BlockColorToken): string {
  return BORDER_CLASS[token]
}
