/**
 * Estado de REVISÃO por Bloco (puro/imutável) — FR-3. Array paralelo aos Blocos da
 * proposta. Elegibilidade de publicação = todos `aprovado`. Trocar o Modelo de um
 * Bloco aprovado o revoga (→ `modelo-trocado`): mudança material exige re-aprovação.
 */
export type BlockStatus = 'proposto' | 'aprovado' | 'modelo-trocado' | 'repensando'
export type ReviewState = BlockStatus[]

export function initialReview(count: number): ReviewState {
  return Array.from({ length: count }, () => 'proposto')
}

function setAt(state: ReviewState, index: number, status: BlockStatus): ReviewState {
  if (index < 0 || index >= state.length) return state
  const next = state.slice()
  next[index] = status
  return next
}

/** Aprovar de qualquer estado → `aprovado`. */
export function approve(state: ReviewState, index: number): ReviewState {
  return setAt(state, index, 'aprovado')
}

/** Após Trocar modelo → `modelo-trocado` (revoga aprovação anterior). */
export function markModelChanged(state: ReviewState, index: number): ReviewState {
  return setAt(state, index, 'modelo-trocado')
}

/** Início do Repensar (transiente). */
export function startRethink(state: ReviewState, index: number): ReviewState {
  return setAt(state, index, 'repensando')
}

/** Fim do Repensar → volta a `proposto` (precisa nova aprovação). */
export function settleRethink(state: ReviewState, index: number): ReviewState {
  return setAt(state, index, 'proposto')
}

export function approvedCount(state: ReviewState): number {
  return state.filter((status) => status === 'aprovado').length
}

/** Harness elegível para publicação ⇔ existe ≥1 Bloco e todos estão `aprovado`. */
export function isPublishable(state: ReviewState): boolean {
  return state.length > 0 && state.every((status) => status === 'aprovado')
}
