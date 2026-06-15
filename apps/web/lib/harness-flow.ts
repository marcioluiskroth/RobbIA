import type { Block, Harness } from '@robbia/shared'

export interface FlowNodeData {
  index: number
  block: Block
}

export interface HarnessFlowNode {
  id: string
  type: 'harnessBlock'
  position: { x: number; y: number }
  data: FlowNodeData
}

export interface HarnessFlowEdge {
  id: string
  source: string
  target: string
}

export interface HarnessFlowGraph {
  nodes: HarnessFlowNode[]
  edges: HarnessFlowEdge[]
}

const NODE_GAP_Y = 96

export function blockNodeId(index: number): string {
  return `block-${index}`
}

/**
 * Mapeia um Harness para nós/arestas do ReactFlow (puro/determinístico). Encadeamento
 * LINEAR por ordem (o `BlockSchema` compartilhado não expõe dependências ricas — a vista
 * é read-first). N Blocos → N nós + (N−1) arestas sequenciais.
 */
export function harnessToFlow(harness: Harness): HarnessFlowGraph {
  const nodes: HarnessFlowNode[] = harness.blocks.map((block, index) => ({
    id: blockNodeId(index),
    type: 'harnessBlock',
    position: { x: 0, y: index * NODE_GAP_Y },
    data: { index, block },
  }))
  const edges: HarnessFlowEdge[] = harness.blocks.slice(1).map((_, i) => ({
    id: `e-${i}-${i + 1}`,
    source: blockNodeId(i),
    target: blockNodeId(i + 1),
  }))
  return { nodes, edges }
}
