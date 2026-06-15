import type { ProviderKind } from '@robbia/provider'

/** Recursos já conectados ao Workspace — alimentam a consciência de planejamento (FR-1, moat). */
export interface WorkspaceContext {
  connectedChannels: string[]
  availableProviders: ProviderKind[]
  notes?: string
}

/** Entrada da IA Arquiteta. `model` vem da config (default = spike — ver Dev Notes). */
export interface ArchitectInput {
  description: string
  workspace?: WorkspaceContext
  model: string
  repairAttempts?: number
}
