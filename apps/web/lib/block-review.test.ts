import { describe, expect, it } from 'bun:test'
import {
  approve,
  approvedCount,
  initialReview,
  isPublishable,
  markModelChanged,
  type ReviewState,
  settleRethink,
  startRethink,
} from './block-review'

describe('block-review', () => {
  it('initialReview começa tudo "proposto"', () => {
    expect(initialReview(3)).toEqual(['proposto', 'proposto', 'proposto'])
  })

  it('approve é imutável e aprova só o índice', () => {
    const before: ReviewState = initialReview(2)
    const after = approve(before, 0)
    expect(before).toEqual(['proposto', 'proposto'])
    expect(after).toEqual(['aprovado', 'proposto'])
  })

  it('trocar modelo de um Bloco aprovado revoga a aprovação', () => {
    const s = markModelChanged(approve(initialReview(1), 0), 0)
    expect(s).toEqual(['modelo-trocado'])
  })

  it('rethink: start → repensando; settle → proposto', () => {
    const started = startRethink(approve(initialReview(1), 0), 0)
    expect(started).toEqual(['repensando'])
    expect(settleRethink(started, 0)).toEqual(['proposto'])
  })

  it('isPublishable só quando TODOS aprovados', () => {
    const s = approve(approve(initialReview(2), 0), 1)
    expect(isPublishable(s)).toBe(true)
    expect(isPublishable(approve(initialReview(2), 0))).toBe(false)
    expect(isPublishable([])).toBe(false)
  })

  it('approvedCount conta os aprovados', () => {
    expect(approvedCount(approve(initialReview(3), 1))).toBe(1)
  })

  it('índice fora do intervalo não altera o estado', () => {
    const before = initialReview(1)
    expect(approve(before, 5)).toEqual(before)
  })
})
