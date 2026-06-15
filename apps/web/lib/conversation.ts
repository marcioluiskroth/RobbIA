/**
 * Estado e reducer PUROS da conversa do Builder (testável headless, sem efeitos).
 * Refino contínuo na mesma sessão = uma lista de turnos crescente (FR-14).
 * Sem geração de resposta da IA Arquiteta nesta story — só o registro do turno do arquiteto.
 */
export type TurnRole = 'user' | 'assistant' // user = arquiteto; assistant = IA Arquiteta

export interface ConversationTurn {
  id: string
  role: TurnRole
  text: string
}

export interface ConversationState {
  turns: ConversationTurn[]
}

export const emptyConversation: ConversationState = { turns: [] }

/** Entrada enviável = tem conteúdo após trim (vazio/whitespace não envia). */
export function isSendable(text: string): boolean {
  return text.trim().length > 0
}

/** Anexa um turno de forma imutável, preservando a ordem. */
export function appendTurn(state: ConversationState, turn: ConversationTurn): ConversationState {
  return { turns: [...state.turns, turn] }
}
