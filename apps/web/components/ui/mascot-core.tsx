import { AGENT_STATES, type AgentStateKey } from '@/lib/agent-state'
import { cn } from '@/lib/utils'

/** Cor do núcleo por estado (texto/borda) — variantes acessíveis no claro. */
const CORE_CLASS: Record<AgentStateKey, string> = {
  idle: 'text-state-idle',
  thinking: 'text-state-thinking-700',
  active: 'text-state-active-700',
  waiting: 'text-state-waiting-700',
  done: 'text-state-done-700',
  error: 'text-state-error-700',
}

/**
 * Núcleo de IA como indicador vivo de estado (UX-DR6). Cor + ícone + rótulo.
 * Pulso só em Pensando/Ativo e apenas com movimento permitido (motion-safe) —
 * respeita prefers-reduced-motion. Expõe o estado por texto (sem live-region própria).
 */
export function MascotCore({
  state,
  showLabel = true,
  className,
}: {
  state: AgentStateKey
  showLabel?: boolean
  className?: string
}) {
  const meta = AGENT_STATES[state]
  const Icon = meta.icon
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-full border-2 border-current',
          CORE_CLASS[state],
          meta.pulse && 'motion-safe:animate-pulse',
        )}
      >
        <Icon size={14} aria-hidden />
      </span>
      <span className={cn('text-sm text-fg', !showLabel && 'sr-only')}>{meta.label}</span>
    </span>
  )
}
