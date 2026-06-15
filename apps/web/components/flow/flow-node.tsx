'use client'

import { Handle, type NodeProps, Position } from '@xyflow/react'
import type { BlockShape } from '@/lib/block-types'
import { blockBorderClass, blockTypeVisual } from '@/lib/block-types'
import type { FlowNodeData } from '@/lib/harness-flow'
import { cn } from '@/lib/utils'

/** Forma do nó por Tipo de Bloco (taxonomia autoritativa). Cor + ícone + forma juntos. */
const SHAPE_CLASS: Record<BlockShape, string> = {
  stadium: 'rounded-full',
  'rounded-rect': 'rounded-lg',
  'sharp-rect': 'rounded-none',
  diamond: '[clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)] px-6',
  hexagon: '[clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)] px-5',
}

const hidden = '!h-0 !min-h-0 !w-0 !border-0 !bg-transparent'

/** Nó custom do ReactFlow — read-first (Handles não conectáveis, só desenham as arestas). */
export function FlowNode(props: NodeProps) {
  const { block } = props.data as unknown as FlowNodeData
  const visual = blockTypeVisual(block.type)
  const Icon = visual.icon
  return (
    <div
      className={cn(
        'flex min-w-40 items-center gap-2 border-2 bg-surface px-3 py-2 text-xs',
        SHAPE_CLASS[visual.shape],
        blockBorderClass(visual.borderColorToken),
        props.selected && 'ring-2 ring-focus ring-offset-1',
      )}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} className={hidden} />
      <Icon size={14} aria-hidden />
      <span className="truncate">{block.name}</span>
      <Handle type="source" position={Position.Bottom} isConnectable={false} className={hidden} />
    </div>
  )
}
