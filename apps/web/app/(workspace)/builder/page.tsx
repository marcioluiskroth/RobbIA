import { Boxes, Workflow } from 'lucide-react'
import type { Metadata } from 'next'
import { BuilderLayout } from '@/components/builder/builder-layout'
import { ChatComposer } from '@/components/builder/chat-composer'
import { EmptyState } from '@/components/ui/empty-state'
import { MascotCore } from '@/components/ui/mascot-core'
import { COPY } from '@/lib/glossary'

export const metadata: Metadata = { title: 'Builder · RobbIA' }

/**
 * Bancada do Builder — shell de 3 zonas. Centro e direita são placeholders (EmptyState);
 * o render real de Blocos/fluxo é da Story 1.7. O `MascotCore` fica em `idle`.
 */
export default function BuilderPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-medium">Builder</h1>
      <BuilderLayout
        conversation={<ChatComposer />}
        cards={
          <EmptyState
            className="m-auto border-0 bg-transparent"
            icon={Boxes}
            title={COPY.builderCardsTitle}
            description={COPY.builderCardsDescription}
          />
        }
        flow={
          <>
            <MascotCore state="idle" />
            <EmptyState
              className="m-auto border-0 bg-transparent"
              icon={Workflow}
              title={COPY.builderFlowTitle}
              description={COPY.builderFlowDescription}
            />
          </>
        }
      />
    </div>
  )
}
