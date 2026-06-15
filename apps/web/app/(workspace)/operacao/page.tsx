import { Activity } from 'lucide-react'
import type { Metadata } from 'next'
import { EmptyState } from '@/components/ui/empty-state'
import { COPY } from '@/lib/glossary'

export const metadata: Metadata = { title: 'Operação · RobbIA' }

/** Surface de run-time (execuções ao vivo, logs, confirmações) — conteúdo real nos Epics 2–3. */
export default function OperacaoPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-medium">Operação</h1>
      <EmptyState
        icon={Activity}
        title={COPY.comingSoon}
        description="Execuções ao vivo, logs auditáveis e a fila de confirmações de Ação Irreversível chegam nos próximos épicos."
      />
    </section>
  )
}
