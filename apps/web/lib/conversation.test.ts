import { describe, expect, it } from 'bun:test'
import {
  appendTurn,
  type ConversationState,
  type ConversationTurn,
  emptyConversation,
  isSendable,
} from './conversation'

const turn = (id: string, text: string): ConversationTurn => ({ id, role: 'user', text })

describe('appendTurn', () => {
  it('é imutável — não muta o estado anterior', () => {
    const before: ConversationState = emptyConversation
    const after = appendTurn(before, turn('1', 'oi'))
    expect(before.turns).toHaveLength(0)
    expect(after.turns).toHaveLength(1)
    expect(after).not.toBe(before)
  })

  it('preserva a ordem dos turnos (refino contínuo)', () => {
    const s = appendTurn(appendTurn(emptyConversation, turn('1', 'a')), turn('2', 'b'))
    expect(s.turns.map((t) => t.id)).toEqual(['1', '2'])
    expect(s.turns.map((t) => t.text)).toEqual(['a', 'b'])
  })
})

describe('isSendable', () => {
  it('rejeita vazio e somente-whitespace', () => {
    expect(isSendable('')).toBe(false)
    expect(isSendable('   \n\t ')).toBe(false)
  })

  it('aceita texto com conteúdo', () => {
    expect(isSendable('  agente de WhatsApp ')).toBe(true)
  })
})
