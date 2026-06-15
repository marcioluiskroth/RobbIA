'use client'

import type { Harness } from '@robbia/shared'
import { Boxes, Workflow } from 'lucide-react'
import { useState } from 'react'
import { proposeHarness, rethinkBlockAction } from '@/app/(workspace)/builder/actions'
import { HarnessFlow } from '@/components/flow/harness-flow'
import { EmptyState } from '@/components/ui/empty-state'
import { MascotCore } from '@/components/ui/mascot-core'
import type { AgentStateKey } from '@/lib/agent-state'
import {
  approve,
  approvedCount,
  initialReview,
  isPublishable,
  markModelChanged,
  type ReviewState,
  settleRethink,
  startRethink,
} from '@/lib/block-review'
import { appendTurn, type ConversationState, emptyConversation } from '@/lib/conversation'
import { COPY } from '@/lib/glossary'
import { BlockCard } from './block-card'
import { BlockList } from './block-list'
import { BuilderLayout } from './builder-layout'
import { ChatComposer } from './chat-composer'

const newId = () => crypto.randomUUID()
const isProviderIssue = (code: string) =>
  code === 'ARCHITECT_NO_PROVIDER' || code === 'ARCHITECT_NO_KEY'

/**
 * Orquestra a bancada (1.7 + 1.8): conversa, proposta, seleção, estado do agente e o
 * estado de REVISÃO por Bloco (Aprovar / Trocar modelo / Repensar) + elegibilidade de
 * publicação (todos aprovados). Geração e Repensar rodam em server actions.
 */
export function BuilderWorkspace() {
  const [conversation, setConversation] = useState<ConversationState>(emptyConversation)
  const [proposal, setProposal] = useState<Harness | null>(null)
  const [review, setReview] = useState<ReviewState>([])
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
      addTurn(
        'assistant',
        isProviderIssue(result.error.code) ? COPY.noProviderDescription : COPY.generationError,
      )
      return
    }
    if (result.data.kind === 'clarification') {
      setAgentState('waiting')
      addTurn('assistant', result.data.questions.join('\n'))
      return
    }

    const harness = result.data.harness
    setProposal(harness)
    setReview(initialReview(harness.blocks.length))
    setSelectedIndex(0)
    setAgentState('done')
    addTurn('assistant', COPY.proposalSummary(harness.blocks.length))
  }

  function handleApprove(index: number) {
    setReview((state) => approve(state, index))
  }

  /** Trocar o Modelo afeta SÓ este Bloco (update imutável) e revoga sua aprovação (FR-4). */
  function handleSelectModel(index: number, modelId: string) {
    setProposal((current) =>
      current
        ? {
            ...current,
            blocks: current.blocks.map((b, i) => (i === index ? { ...b, model: modelId } : b)),
          }
        : current,
    )
    setReview((state) => markModelChanged(state, index))
  }

  /** Repensar: gera alternativa só deste Bloco, preservando os demais (inclusive aprovados). */
  async function handleRethink(index: number) {
    if (!proposal) return
    const previousStatus = review[index] ?? 'proposto'
    setReview((state) => startRethink(state, index))
    const result = await rethinkBlockAction(proposal, index)

    if (!result.ok) {
      // Falhou: nada mudou → restaura o status anterior (não rebaixa um Bloco aprovado).
      setReview((state) => state.map((status, i) => (i === index ? previousStatus : status)))
      addTurn(
        'assistant',
        isProviderIssue(result.error.code) ? COPY.noProviderDescription : COPY.rethinkError,
      )
      return
    }

    const block = result.data
    setProposal((current) =>
      current
        ? { ...current, blocks: current.blocks.map((b, i) => (i === index ? block : b)) }
        : current,
    )
    setReview((state) => settleRethink(state, index))
  }

  const selectedBlock = proposal?.blocks[selectedIndex] ?? null
  const selectedStatus = review[selectedIndex] ?? 'proposto'
  const publishable = isPublishable(review)

  return (
    <div className="flex flex-col gap-4">
      {proposal ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2">
          <span className="text-sm text-fg-muted">
            {COPY.approvedSummary(approvedCount(review), proposal.blocks.length)}
          </span>
          <button
            type="button"
            disabled={!publishable}
            title={COPY.publishHint}
            className="ml-auto rounded-md bg-fg px-3 py-1.5 font-medium text-bg text-sm hover:opacity-90 disabled:opacity-40"
          >
            {COPY.publish}
          </button>
        </div>
      ) : null}

      <BuilderLayout
        conversation={
          <ChatComposer turns={conversation.turns} onSubmit={handleSubmit} busy={busy} />
        }
        cards={
          selectedBlock ? (
            <BlockCard
              block={selectedBlock}
              status={selectedStatus}
              onApprove={() => handleApprove(selectedIndex)}
              onSelectModel={(modelId) => handleSelectModel(selectedIndex, modelId)}
              onRethink={() => handleRethink(selectedIndex)}
            />
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
                  statuses={review}
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
    </div>
  )
}
