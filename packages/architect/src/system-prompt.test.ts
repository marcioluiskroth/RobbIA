import { describe, expect, it } from 'bun:test'
import { buildSystemPrompt } from './system-prompt'

describe('buildSystemPrompt', () => {
  it('inclui recursos conectados e as regras (RPA-sem-API, clarification, JSON)', () => {
    const prompt = buildSystemPrompt({
      connectedChannels: ['telegram'],
      availableProviders: ['claude'],
    })
    expect(prompt).toContain('telegram')
    expect(prompt.toLowerCase()).toContain('rpa')
    expect(prompt.toLowerCase()).toContain('esclarecimento')
    expect(prompt).toContain('clarification')
    expect(prompt).toContain('harness')
  })

  it('funciona sem Workspace (nenhum Canal conectado)', () => {
    expect(buildSystemPrompt()).toContain('Nenhum Canal conectado')
  })
})
