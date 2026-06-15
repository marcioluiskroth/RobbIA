import type { Block } from '@robbia/shared'
import { hasModelBadge } from '@/lib/block-presentation'
import { blockBorderClass, blockTypeVisual } from '@/lib/block-types'
import { COPY } from '@/lib/glossary'
import { cn } from '@/lib/utils'

/**
 * Inspetor de um Bloco (UX-DR2, FR-2): ícone do Tipo + título + badge de Modelo (mono)
 * + justificativa de 1 linha + borda colorida por Tipo (read-first — sem ações de mutação,
 * que são da Story 1.8). Bloco "sem LLM" não exibe badge de Modelo.
 */
export function BlockCard({ block }: { block: Block }) {
  const visual = blockTypeVisual(block.type)
  const Icon = visual.icon
  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-lg border-l-4 bg-surface p-4',
        blockBorderClass(visual.borderColorToken),
      )}
    >
      <header className="flex items-center gap-2">
        <Icon size={18} aria-hidden />
        <h3 className="font-medium">{block.name}</h3>
        {hasModelBadge(block) ? (
          <span className="ml-auto rounded-full border border-border px-2 py-0.5 font-mono text-xs">
            {block.model}
          </span>
        ) : (
          <span className="ml-auto rounded-full px-2 py-0.5 text-xs text-fg-muted">
            {COPY.noLlmBadge}
          </span>
        )}
      </header>
      <p className="text-sm text-fg-muted">{block.justification}</p>
      <span className="font-mono text-[11px] uppercase tracking-wide text-fg-muted">
        {block.type}
      </span>
    </article>
  )
}
