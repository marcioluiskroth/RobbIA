import { AGENT_STATES, type AgentStateKey } from '@/lib/agent-state'
import { cn } from '@/lib/utils'

/** Fill nível-700 + texto branco (UX-DR5) — legível em ambos os temas. */
const FILL_CLASS: Record<AgentStateKey, string> = {
  idle: 'bg-slate text-white',
  thinking: 'bg-state-thinking-700 text-white',
  active: 'bg-state-active-700 text-white',
  waiting: 'bg-state-waiting-700 text-white',
  done: 'bg-state-done-700 text-white',
  error: 'bg-state-error-700 text-white',
}

/** Pill de status por Bloco/execução: rótulo + ícone + cor (cor não é o único sinal). */
export function StateBadge({ state, className }: { state: AgentStateKey; className?: string }) {
  const meta = AGENT_STATES[state]
  const Icon = meta.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px] font-medium',
        FILL_CLASS[state],
        className,
      )}
    >
      <Icon size={14} aria-hidden />
      <span>{meta.label}</span>
    </span>
  )
}
