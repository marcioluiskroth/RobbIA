import { describe, expect, it } from 'bun:test'
import type { Block, Harness } from '@robbia/shared'

import { blockNodeId, harnessToFlow } from './harness-flow'

const block = (name: string): Block => ({
  type: 'gatilho',
  name,
  justification: 'j',
  config: {},
})
const harness = (n: number): Harness => ({
  name: 'H',
  blocks: Array.from({ length: n }, (_, i) => block(`b${i}`)),
})

describe('harnessToFlow', () => {
  it('N Blocos → N nós + (N−1) arestas', () => {
    const g = harnessToFlow(harness(3))
    expect(g.nodes).toHaveLength(3)
    expect(g.edges).toHaveLength(2)
  })

  it('ids determinísticos e ordem preservada', () => {
    const g = harnessToFlow(harness(3))
    expect(g.nodes.map((n) => n.id)).toEqual(['block-0', 'block-1', 'block-2'])
    expect(g.nodes.map((n) => n.data.index)).toEqual([0, 1, 2])
    expect(g.nodes.map((n) => n.data.block.name)).toEqual(['b0', 'b1', 'b2'])
  })

  it('arestas conectam Blocos consecutivos', () => {
    expect(harnessToFlow(harness(3)).edges).toEqual([
      { id: 'e-0-1', source: 'block-0', target: 'block-1' },
      { id: 'e-1-2', source: 'block-1', target: 'block-2' },
    ])
  })

  it('1 Bloco → 1 nó, 0 arestas', () => {
    const g = harnessToFlow(harness(1))
    expect(g.nodes).toHaveLength(1)
    expect(g.edges).toHaveLength(0)
  })

  it('é determinístico (mesma entrada → mesma saída)', () => {
    expect(harnessToFlow(harness(2))).toEqual(harnessToFlow(harness(2)))
  })

  it('blockNodeId é estável', () => {
    expect(blockNodeId(0)).toBe('block-0')
  })
})
