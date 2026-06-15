import type { Block } from '@robbia/shared'
import { hasModelBadge } from '@/lib/block-presentation'
import type { BlockStatus } from '@/lib/block-review'
import { blockStatusVisual } from '@/lib/block-status-visuals'
import { blockBorderClass, blockTypeVisual } from '@/lib/block-types'
import { COPY } from '@/lib/glossary'
import { cn } from '@/lib/utils'
import { ModelSelector } from './model-selector'

/**
 * Inspetor de um Bloco com AÇÕES de revisão (FR-3, UX-DR2): Aprovar · Trocar modelo
 * (`ModelSelector`; oculto se Bloco "sem LLM") · Repensar. Mostra o status (rótulo+ícone).
 * Read-first do conteúdo (sem edição de texto livre). Componente burro: recebe handlers.
 */
export function BlockCard({
  block,
  status,
  onApprove,
  onSelectModel,
  onRethink,
}: {
  block: Block
  status: BlockStatus
  onApprove: () => void
  onSelectModel: (modelId: string) => void
  onRethink: () => void
}) {
  const visual = blockTypeVisual(block.type)
  const Icon = visual.icon
  const statusVisual = blockStatusVisual(status)
  const StatusIcon = statusVisual.icon
  const busy = status === 'repensando'
  const hasModel = hasModelBadge(block)

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
        <span className={cn('ml-auto inline-flex items-center gap-1 text-xs', statusVisual.token)}>
          <StatusIcon size={13} aria-hidden className={cn(busy && 'motion-safe:animate-spin')} />
          {statusVisual.label}
        </span>
      </header>

      <p className="text-sm text-fg-muted">{block.justification}</p>

      <div className="flex items-center gap-2">
        {hasModel ? (
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs">
            {block.model}
          </span>
        ) : (
          <span className="rounded-full px-2 py-0.5 text-xs text-fg-muted">{COPY.noLlmBadge}</span>
        )}
        <span className="font-mono text-[11px] text-fg-muted uppercase tracking-wide">
          {block.type}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-border border-t pt-3">
        <button
          type="button"
          onClick={onApprove}
          disabled={busy}
          className="rounded-md bg-fg px-3 py-1.5 font-medium text-bg text-xs hover:opacity-90 disabled:opacity-40"
        >
          {COPY.approve}
        </button>
        {hasModel && !busy ? <ModelSelector value={block.model} onSelect={onSelectModel} /> : null}
        <button
          type="button"
          onClick={onRethink}
          disabled={busy}
          className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-bg disabled:opacity-40"
        >
          {COPY.rethink}
        </button>
      </div>
    </article>
  )
}
