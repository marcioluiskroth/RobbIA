import { describe, expect, it } from 'bun:test'
import { WS_EVENTS } from './events'

describe('WS_EVENTS (nomes canônicos de evento WebSocket)', () => {
  it('fixa os valores literais exatos (renomear quebra o streaming — pegue aqui)', () => {
    expect(WS_EVENTS).toEqual({
      executionStepUpdated: 'execution.step.updated',
      executionCompleted: 'execution.completed',
      agentStateChanged: 'agent.state.changed',
    })
  })

  it('todos os nomes seguem o padrão dominio.evento(.sub)', () => {
    for (const name of Object.values(WS_EVENTS)) {
      expect(name).toMatch(/^[a-z]+(\.[a-z]+)+$/)
    }
  })
})
