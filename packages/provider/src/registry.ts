import { ClaudeProvider } from './adapters/claude'
import { GeminiProvider } from './adapters/gemini'
import { GptProvider } from './adapters/gpt'
import { OllamaProvider } from './adapters/ollama'
import { OpenRouterProvider } from './adapters/openrouter'
import type { LLMProvider } from './provider'
import type { ProviderConfig, ProviderKind } from './types'

export type ProviderConfigMap = Partial<Record<ProviderKind, ProviderConfig>>
export type ProviderOverrides = Partial<Record<ProviderKind, LLMProvider>>

const DIRECT_KINDS: readonly ProviderKind[] = ['claude', 'gpt', 'gemini', 'ollama']

export interface ProviderRegistry {
  get(kind: ProviderKind): LLMProvider
  has(kind: ProviderKind): boolean
  kinds(): ProviderKind[]
}

/**
 * Cria um registry de Providers. `overrides` injeta instâncias (testes/fakes) sem
 * construir o SDK real. Sem estado global mutável — trocar um Provider não afeta outro (FR-9).
 */
export function createProviderRegistry(
  config: ProviderConfigMap = {},
  overrides: ProviderOverrides = {},
): ProviderRegistry {
  const cache = new Map<ProviderKind, LLMProvider>()

  function build(kind: ProviderKind): LLMProvider {
    const override = overrides[kind]
    if (override) return override
    const cfg = config[kind] ?? {}
    switch (kind) {
      case 'claude':
        return new ClaudeProvider(cfg)
      case 'gpt':
        return new GptProvider(cfg)
      case 'gemini':
        return new GeminiProvider(cfg)
      case 'ollama':
        return new OllamaProvider(cfg)
      case 'openrouter':
        return new OpenRouterProvider(cfg)
    }
  }

  return {
    get(kind) {
      const cached = cache.get(kind)
      if (cached) return cached
      const provider = build(kind)
      cache.set(kind, provider)
      return provider
    },
    has(kind) {
      return overrides[kind] !== undefined || config[kind] !== undefined
    },
    kinds() {
      const all = new Set<ProviderKind>([
        ...(Object.keys(config) as ProviderKind[]),
        ...(Object.keys(overrides) as ProviderKind[]),
      ])
      return [...all]
    },
  }
}

/**
 * Roteamento (FR-9): usa o Provider DIRETO se configurado (custo/latência);
 * senão cai para OpenRouter (amplitude).
 */
export function routeProvider(registry: ProviderRegistry, kind: ProviderKind): LLMProvider {
  if (DIRECT_KINDS.includes(kind) && registry.has(kind)) return registry.get(kind)
  return registry.get('openrouter')
}
