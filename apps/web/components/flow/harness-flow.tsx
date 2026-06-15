'use client'

import { Background, Controls, type Edge, type Node, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { Harness } from '@robbia/shared'
import { useMemo } from 'react'
import { type FlowNodeData, harnessToFlow } from '@/lib/harness-flow'
import { FlowNode } from './flow-node'

const nodeTypes = { harnessBlock: FlowNode }

/**
 * Vista de fluxo do Harness (ReactFlow) — READ-FIRST (não é editor de arestas).
 * Forma/cor/ícone por Tipo; clicar num nó foca o Bloco no centro. O canvas é
 * `aria-hidden` (decorativo p/ AT) — o caminho acessível é a `BlockList` (UX-DR7).
 */
export function HarnessFlow({
  harness,
  selectedIndex,
  onSelectBlock,
}: {
  harness: Harness
  selectedIndex: number
  onSelectBlock: (index: number) => void
}) {
  const { nodes, edges } = useMemo(() => {
    const graph = harnessToFlow(harness)
    return {
      nodes: graph.nodes.map((n) => ({
        ...n,
        selected: n.data.index === selectedIndex,
      })) as unknown as Node[],
      edges: graph.edges as unknown as Edge[],
    }
  }, [harness, selectedIndex])

  return (
    <div aria-hidden="true" className="h-72 w-full overflow-hidden rounded-md border border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        onNodeClick={(_, node) => onSelectBlock((node.data as unknown as FlowNodeData).index)}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
