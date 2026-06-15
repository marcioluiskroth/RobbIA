import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Estado vazio genérico (EXPERIENCE.md › State Patterns › `empty`). Ícone + título +
 * descrição + ação opcional. Usado pela lista de Harnesses (first-run) e pelas zonas
 * placeholder do Builder.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-8 text-center',
        className,
      )}
    >
      {Icon ? <Icon size={28} aria-hidden className="text-fg-muted" /> : null}
      <p className="font-medium">{title}</p>
      {description ? <p className="max-w-prose text-sm text-fg-muted">{description}</p> : null}
      {action}
    </div>
  )
}
