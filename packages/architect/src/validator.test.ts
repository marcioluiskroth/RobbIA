import { describe, expect, it } from 'bun:test'
import type { Harness } from '@robbia/shared'
import { everyBlockHasJustification, proposalHasRpa, reviewProposal } from './validator'

const withRpa: Harness = {
  name: 'A',
  blocks: [{ type: 'rpa', name: 'r', justification: 'lança no ERP', config: {} }],
}
const noRpa: Harness = {
  name: 'A',
  blocks: [{ type: 'resposta', name: 'r', justification: 'responde', config: {} }],
}

describe('validator', () => {
  it('proposalHasRpa detecta Bloco RPA', () => {
    expect(proposalHasRpa(withRpa)).toBe(true)
    expect(proposalHasRpa(noRpa)).toBe(false)
  })

  it('reviewProposal avisa quando o alvo é sem-API e não há RPA', () => {
    expect(reviewProposal(noRpa, { targetHasNoApi: true }).warnings.length).toBeGreaterThan(0)
    expect(reviewProposal(withRpa, { targetHasNoApi: true }).warnings).toHaveLength(0)
  })

  it('everyBlockHasJustification', () => {
    expect(everyBlockHasJustification(withRpa)).toBe(true)
  })
})
