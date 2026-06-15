'use client'

import type { Harness } from '@robbia/shared'
import { blockTypeVisual } from '@/lib/block-types'
import { COPY } from '@/lib/glossary'
import { cn } from '@/lib/utils'

/**
 * Alternativa NÃO-CANVAS acessível ao fluxo (UX-DR7, UX-DR16): lista navegável dos
 * Blocos espelhando a ordem do fluxo. Cada item é um `<button>` (Enter/Espaço nativos)
 * que foca o mesmo Bloco selecionado no canvas/centro. Sempre presente, não um modo oculto.
 */
export function BlockList({
  harness,
  selectedIndex,
  onSelectBlock,
}: {
  harness: Harness
  selectedIndex: number
  onSelectBlock: (index: number) => void
}) {
  return (
    <ul aria-label={COPY.blockListLabel} className="flex flex-col gap-1">
      {harness.blocks.map((block, index) => {
        const Icon = blockTypeVisual(block.type).icon
        const active = index === selectedIndex
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de uma proposta (sem reorder/insert/delete); Blocos não têm id persistente
          <li key={`block-${index}`}>
            <button
              type="button"
              aria-current={active ? 'true' : undefined}
              onClick={() => onSelectBlock(index)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface',
                active && 'bg-surface font-medium',
              )}
            >
              <span className="font-mono text-xs text-fg-muted">{index + 1}</span>
              <Icon size={14} aria-hidden />
              <span className="truncate">{block.name}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
