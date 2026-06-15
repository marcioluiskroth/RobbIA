import type { Harness } from '@robbia/shared'

/** A proposta inclui ao menos um Bloco RPA? (consequência testável de FR-1, AC2). */
export function proposalHasRpa(harness: Harness): boolean {
  return harness.blocks.some((b) => b.type === 'rpa')
}

/** Todo Bloco tem justificativa não-vazia? */
export function everyBlockHasJustification(harness: Harness): boolean {
  return harness.blocks.every((b) => b.justification.trim().length > 0)
}

export interface ProposalReviewHints {
  /** Heurística externa: o sistema-alvo parece NÃO ter API. */
  targetHasNoApi?: boolean
}

/**
 * Revisão semântica da proposta — instrumenta qualidade (SM-1/SM-4) com warnings,
 * NÃO bloqueia. A IA Arquiteta é quem decide; isto só sinaliza desvios prováveis.
 */
export function reviewProposal(
  harness: Harness,
  hints: ProposalReviewHints = {},
): { warnings: string[] } {
  const warnings: string[] = []
  if (harness.blocks.length === 0) {
    warnings.push('A proposta não tem Blocos.')
  }
  if (hints.targetHasNoApi && !proposalHasRpa(harness)) {
    warnings.push('O alvo parece não ter API, mas a proposta não inclui nenhum Bloco RPA.')
  }
  if (!everyBlockHasJustification(harness)) {
    warnings.push('Há Blocos sem justificativa.')
  }
  return { warnings }
}
