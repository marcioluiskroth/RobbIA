import { Check, CircleDashed, Loader2, type LucideIcon, RefreshCw } from 'lucide-react'
import type { BlockStatus } from './block-review'

/** Visual determinístico do status de revisão — rótulo + ícone + cor (cor nunca é o único sinal). */
export interface BlockStatusVisual {
  label: string
  icon: LucideIcon
  /** Classe de cor de texto (token acessível). */
  token: string
}

export const BLOCK_STATUS_VISUALS: Record<BlockStatus, BlockStatusVisual> = {
  proposto: { label: 'Proposto', icon: CircleDashed, token: 'text-fg-muted' },
  aprovado: { label: 'Aprovado', icon: Check, token: 'text-state-done-700' },
  'modelo-trocado': { label: 'Modelo trocado', icon: RefreshCw, token: 'text-state-waiting-700' },
  repensando: { label: 'Repensando', icon: Loader2, token: 'text-state-thinking-700' },
}

export function blockStatusVisual(status: BlockStatus): BlockStatusVisual {
  return BLOCK_STATUS_VISUALS[status]
}
