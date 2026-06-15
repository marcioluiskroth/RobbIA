'use client'

import type { Harness } from '@robbia/shared'
import { Boxes, Workflow } from 'lucide-react'
import { useState } from 'react'
import { proposeHarness } from '@/app/(workspace)/builder/actions'
import { HarnessFlow } from '@/components/flow/harness-flow'
import { EmptyState } from '@/components/ui/empty-state'
import { MascotCore } from '@/components/ui/mascot-core'
import type { AgentStateKey } from '@/lib/agent-state'
import { appendTurn, type ConversationState, emptyConversation } from '@/lib/conversation'
import { COPY } from '@/lib/glossary'
import { BlockCard } from './block-card'
import { BlockList } from './block-list'
import { BuilderLayout } from './builder-layout'
import { ChatComposer } from './chat-composer'

const newId = () => crypto.randomUUID()

/**
 * Orquestra a bancada (1.7): detém a conversa, a proposta de Harness, a seleção de Bloco
 * e o estado do agente. A descrição na Conversa → `proposeHarness` (server action) →
 * cards + fluxo + lista, com seleção única sincronizada entre nó, lista e card.
 */
export function BuilderWorkspace() {
  const [conversation, setConversation] = useState<ConversationState>(emptyConversation)
  const [proposal, setProposal] = useState<Harness | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [agentState, setAgentState] = useState<AgentStateKey>('idle')
  const [busy, setBusy] = useState(false)

  const addTurn = (role: 'user' | 'assistant', text: string) =>
    setConversation((current) => appendTurn(current, { id: newId(), role, text }))

  async function handleSubmit(text: string) {
    addTurn('user', text)
    setBusy(true)
    setAgentState('thinking')

    const result = await proposeHarness(text)
    setBusy(false)

    if (!result.ok) {
      setAgentState('error')
      const isProviderIssue =
        result.error.code === 'ARCHITECT_NO_PROVIDER' || result.error.code === 'ARCHITECT_NO_KEY'
      addTurn('assistant', isProviderIssue ? COPY.noProviderDescription : COPY.generationError)
      return
    }

    if (result.data.kind === 'clarification') {
      setAgentState('waiting')
      addTurn('assistant', result.data.questions.join('\n'))
      return
    }

    const harness = result.data.harness
    setProposal(harness)
    setSelectedIndex(0)
    setAgentState('done')
    addTurn('assistant', COPY.proposalSummary(harness.blocks.length))
  }

  const selectedBlock = proposal?.blocks[selectedIndex] ?? null

  return (
    <BuilderLayout
      conversation={<ChatComposer turns={conversation.turns} onSubmit={handleSubmit} busy={busy} />}
      cards={
        selectedBlock ? (
          <BlockCard block={selectedBlock} />
        ) : (
          <EmptyState
            className="m-auto border-0 bg-transparent"
            icon={Boxes}
            title={COPY.builderCardsTitle}
            description={COPY.builderCardsDescription}
          />
        )
      }
      flow={
        <>
          <MascotCore state={agentState} />
          {proposal ? (
            <div className="flex flex-col gap-3">
              <HarnessFlow
                harness={proposal}
                selectedIndex={selectedIndex}
                onSelectBlock={setSelectedIndex}
              />
              <BlockList
                harness={proposal}
                selectedIndex={selectedIndex}
                onSelectBlock={setSelectedIndex}
              />
            </div>
          ) : (
            <EmptyState
              className="m-auto border-0 bg-transparent"
              icon={Workflow}
              title={COPY.builderFlowTitle}
              description={COPY.builderFlowDescription}
            />
          )}
        </>
      }
    />
  )
}
