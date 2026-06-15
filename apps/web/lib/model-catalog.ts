import type { ProviderKind } from '@robbia/provider'

export type CostTier = 'baixo' | 'médio' | 'alto'
export type LatencyTier = 'baixa' | 'média' | 'alta'

/** Opção de Modelo de IA — custo/latência são dicas RELATIVAS e curadas ([ASSUMPTION]), não medidas. */
export interface ModelOption {
  id: string
  label: string
  provider: ProviderKind
  cost: CostTier
  latency: LatencyTier
}

/** Catálogo estático curado (MVP). A configuração real de Providers vive no Workspace (posterior). */
export const MODEL_CATALOG: readonly ModelOption[] = [
  {
    id: 'claude-opus-4-8',
    label: 'Claude Opus 4.8',
    provider: 'claude',
    cost: 'alto',
    latency: 'média',
  },
  {
    id: 'claude-sonnet-4-6',
    label: 'Claude Sonnet 4.6',
    provider: 'claude',
    cost: 'médio',
    latency: 'baixa',
  },
  {
    id: 'claude-haiku-4-5',
    label: 'Claude Haiku 4.5',
    provider: 'claude',
    cost: 'baixo',
    latency: 'baixa',
  },
  { id: 'gpt-5', label: 'GPT-5', provider: 'gpt', cost: 'alto', latency: 'média' },
  { id: 'gpt-5-mini', label: 'GPT-5 mini', provider: 'gpt', cost: 'baixo', latency: 'baixa' },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'gemini',
    cost: 'médio',
    latency: 'média',
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'gemini',
    cost: 'baixo',
    latency: 'baixa',
  },
  {
    id: 'llama3.3',
    label: 'Llama 3.3 (local)',
    provider: 'ollama',
    cost: 'baixo',
    latency: 'alta',
  },
  {
    id: 'openrouter/auto',
    label: 'OpenRouter (auto)',
    provider: 'openrouter',
    cost: 'médio',
    latency: 'média',
  },
] as const

const PROVIDER_ORDER: readonly ProviderKind[] = ['claude', 'gpt', 'gemini', 'ollama', 'openrouter']
const PROVIDER_LABEL: Record<ProviderKind, string> = {
  claude: 'Claude',
  gpt: 'GPT',
  gemini: 'Gemini',
  ollama: 'Ollama',
  openrouter: 'OpenRouter',
}

export interface ProviderGroup {
  provider: ProviderKind
  label: string
  models: ModelOption[]
}

/** Modelos agrupados por Provider (ordem estável), para o ModelSelector. */
export function modelsByProvider(): ProviderGroup[] {
  return PROVIDER_ORDER.map((provider) => ({
    provider,
    label: PROVIDER_LABEL[provider],
    models: MODEL_CATALOG.filter((model) => model.provider === provider),
  })).filter((group) => group.models.length > 0)
}

export function findModel(id: string): ModelOption | undefined {
  return MODEL_CATALOG.find((model) => model.id === id)
}
