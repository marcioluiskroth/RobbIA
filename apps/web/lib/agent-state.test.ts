import { describe, expect, it } from 'bun:test'
import { AGENT_STATE_KEYS, AGENT_STATES } from './agent-state'

describe('agent states', () => {
  it('tem 6 estados, cada um com rótulo, ícone e colorToken (cor não é o único sinal)', () => {
    expect(AGENT_STATE_KEYS).toHaveLength(6)
    for (const key of AGENT_STATE_KEYS) {
      const state = AGENT_STATES[key]
      expect(state.label.length).toBeGreaterThan(0)
      expect(state.icon).toBeTruthy()
      expect(state.colorToken).toBe(key)
    }
  })

  it('pulso apenas em Pensando e Ativo', () => {
    expect(AGENT_STATES.thinking.pulse).toBe(true)
    expect(AGENT_STATES.active.pulse).toBe(true)
    expect(AGENT_STATES.idle.pulse).toBe(false)
    expect(AGENT_STATES.waiting.pulse).toBe(false)
    expect(AGENT_STATES.done.pulse).toBe(false)
    expect(AGENT_STATES.error.pulse).toBe(false)
  })
})
