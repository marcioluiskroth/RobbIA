/**
 * Nomes canônicos de evento WebSocket — `dominio.evento`. Ver architecture.md › Padrões de Comunicação.
 */

export const WS_EVENTS = {
  executionStepUpdated: 'execution.step.updated',
  executionCompleted: 'execution.completed',
  agentStateChanged: 'agent.state.changed',
} as const

export type WsEventName = (typeof WS_EVENTS)[keyof typeof WS_EVENTS]
