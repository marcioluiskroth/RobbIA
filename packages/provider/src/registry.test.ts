import { describe, expect, it } from 'bun:test'
import { FakeProvider } from './adapters/fake'
import { OpenRouterProvider } from './adapters/openrouter'
import { createProviderRegistry, routeProvider } from './registry'
import type { CompletionResult, ProviderKind } from './types'

const fake = (kind: ProviderKind, text: string) =>
  new FakeProvider(kind, (): CompletionResult => ({ text, model: 'm', providerKind: kind }))

const ALL_KINDS: readonly ProviderKind[] = ['claude', 'gpt', 'gemini', 'ollama', 'openrouter']

describe('registry', () => {
  it('build() constrói cada um dos 5 adaptadores REAIS (sem overrides) e expõe o kind — AC1', () => {
    // Clients são lazy: construir o adaptador nunca toca o SDK nem exige credencial.
    const reg = createProviderRegistry({
      claude: {},
      gpt: {},
      gemini: {},
      ollama: {},
      openrouter: {},
    })
    for (const kind of ALL_KINDS) {
      expect(() => reg.get(kind)).not.toThrow()
      expect(reg.get(kind).kind).toBe(kind)
    }
  })

  it('Ollama é selecionável por kind — caminho 100% LOCAL exigido pelo AC1', () => {
    const reg = createProviderRegistry({ ollama: { baseURL: 'http://localhost:11434' } })
    expect(reg.get('ollama').kind).toBe('ollama')
  })

  it('OpenRouter sem API key NÃO lança (regressão do HIGH) — direto e via fallback de routeProvider (AC4)', () => {
    expect(() => new OpenRouterProvider({})).not.toThrow()
    const reg = createProviderRegistry({}) // nada configurado
    expect(() => routeProvider(reg, 'gemini')).not.toThrow()
    expect(routeProvider(reg, 'gemini').kind).toBe('openrouter')
  })

  it('get retorna o override e cacheia; has/kinds refletem config+overrides', () => {
    const reg = createProviderRegistry({}, { gpt: fake('gpt', 'g'), claude: fake('claude', 'c') })
    expect(reg.get('gpt').kind).toBe('gpt')
    expect(reg.get('gpt')).toBe(reg.get('gpt'))
    expect(reg.has('gpt')).toBe(true)
    expect(reg.has('gemini')).toBe(false)
    expect(reg.kinds().sort()).toEqual(['claude', 'gpt'])
  })

  it('trocar um Provider não afeta outro (sem estado global)', async () => {
    const reg = createProviderRegistry(
      {},
      { gpt: fake('gpt', 'from-gpt'), openrouter: fake('openrouter', 'from-or') },
    )
    const g = await reg.get('gpt').complete({ model: 'm', messages: [] })
    const o = await reg.get('openrouter').complete({ model: 'm', messages: [] })
    expect(g.ok && g.data.text).toBe('from-gpt')
    expect(o.ok && o.data.text).toBe('from-or')
  })

  it('routeProvider: direto se configurado; senão cai para OpenRouter (amplitude)', () => {
    const reg = createProviderRegistry(
      {},
      { claude: fake('claude', 'c'), openrouter: fake('openrouter', 'or') },
    )
    expect(routeProvider(reg, 'claude').kind).toBe('claude')
    expect(routeProvider(reg, 'gemini').kind).toBe('openrouter')
  })
})
