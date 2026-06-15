import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  type LucideIcon,
  Zap,
} from 'lucide-react'

/** Os 6 estados do agente (EXPERIENCE.md › State Patterns). */
export type AgentStateKey = 'idle' | 'thinking' | 'active' | 'waiting' | 'done' | 'error'

export interface AgentStateMeta {
  key: AgentStateKey
  /** Rótulo PT-BR — cor NUNCA é o único sinal (sempre rótulo + ícone). */
  label: string
  /** Token de cor de estado (→ var(--color-state-<key>)). */
  colorToken: AgentStateKey
  icon: LucideIcon
  /** Pulso só em Pensando/Ativo (respeitando prefers-reduced-motion na UI). */
  pulse: boolean
}

export const AGENT_STATES: Record<AgentStateKey, AgentStateMeta> = {
  idle: { key: 'idle', label: 'Ocioso', colorToken: 'idle', icon: Circle, pulse: false },
  thinking: {
    key: 'thinking',
    label: 'Pensando',
    colorToken: 'thinking',
    icon: Loader2,
    pulse: true,
  },
  active: { key: 'active', label: 'Ativo', colorToken: 'active', icon: Zap, pulse: true },
  waiting: {
    key: 'waiting',
    label: 'Aguardando',
    colorToken: 'waiting',
    icon: Clock,
    pulse: false,
  },
  done: { key: 'done', label: 'Concluído', colorToken: 'done', icon: CheckCircle2, pulse: false },
  error: { key: 'error', label: 'Erro', colorToken: 'error', icon: AlertTriangle, pulse: false },
}

export const AGENT_STATE_KEYS = Object.keys(AGENT_STATES) as AgentStateKey[]
