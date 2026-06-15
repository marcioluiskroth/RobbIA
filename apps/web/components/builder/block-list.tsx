'use client'

import type { Harness } from '@robbia/shared'
import type { BlockStatus } from '@/lib/block-review'
import { blockStatusVisual } from '@/lib/block-status-visuals'
import { blockTypeVisual } from '@/lib/block-types'
import { COPY } from '@/lib/glossary'
import { cn } from '@/lib/utils'

/**
 * Alternativa NÃO-CANVAS acessível ao fluxo (UX-DR7, UX-DR16): lista navegável dos
 * Blocos espelhando a ordem do fluxo. Cada item é um `<button>` (Enter/Espaço nativos)
 * que foca o mesmo Bloco selecionado no canvas/centro. Mostra o status de revisão (1.8).
 */
export function BlockList({
  harness,
  selectedIndex,
  onSelectBlock,
  statuses,
}: {
  harness: Harness
  selectedIndex: number
  onSelectBlock: (index: number) => void
  statuses?: readonly BlockStatus[]
}) {
  return (
    <ul aria-label={COPY.blockListLabel} className="flex flex-col gap-1">
      {harness.blocks.map((block, index) => {
        const Icon = blockTypeVisual(block.type).icon
        const active = index === selectedIndex
        const statusVisual = statuses ? blockStatusVisual(statuses[index] ?? 'proposto') : null
        const StatusIcon = statusVisual?.icon
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
              <span className="flex-1 truncate">{block.name}</span>
              {StatusIcon && statusVisual ? (
                <StatusIcon
                  size={13}
                  aria-label={statusVisual.label}
                  className={statusVisual.token}
                />
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
