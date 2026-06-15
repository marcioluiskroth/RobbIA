import { Settings } from 'lucide-react'
import type { Metadata } from 'next'
import { EmptyState } from '@/components/ui/empty-state'
import { COPY } from '@/lib/glossary'

export const metadata: Metadata = { title: 'Workspace · RobbIA' }

/** Configuração do workspace (Providers, Canais, Credenciais via CES) — conteúdo real nos Epics 2–3. */
export default function WorkspacePage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-medium">Workspace</h1>
      <EmptyState
        icon={Settings}
        title={COPY.comingSoon}
        description="Providers (chaves), Canais e Credenciais (via CES) serão configurados aqui nos próximos épicos. O tema claro/escuro fica na navegação."
      />
    </section>
  )
}
