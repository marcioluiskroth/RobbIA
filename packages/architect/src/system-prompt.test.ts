import { describe, expect, it } from 'bun:test'
import { buildSystemPrompt } from './system-prompt'

describe('buildSystemPrompt', () => {
  it('inclui recursos conectados e as regras (RPA-sem-API, clarification, JSON)', () => {
    const prompt = buildSystemPrompt({
      connectedChannels: ['telegram'],
      availableProviders: ['claude'],
    })
    expect(prompt).toContain('telegram')
    // AC2: a REGRA RPA-sem-API (não só a palavra 'rpa', que aparece na enumeração dos Tipos):
    expect(prompt).toContain('SEM API')
    expect(prompt).toMatch(/AO MENOS UM Bloco do tipo "rpa"/i)
    // AC3: a INSTRUÇÃO de propor Gatilho/Ação compatíveis com os recursos (não só o nome do Canal):
    expect(prompt).toContain('Gatilho/Ação compatíveis')
    expect(prompt.toLowerCase()).toContain('esclarecimento')
    expect(prompt).toContain('clarification')
    expect(prompt).toContain('harness')
  })

  it('funciona sem Workspace (nenhum Canal conectado)', () => {
    expect(buildSystemPrompt()).toContain('Nenhum Canal conectado')
  })
})
