import { LayoutGrid } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/empty-state'
import { COPY } from '@/lib/glossary'

export const metadata: Metadata = { title: 'Harnesses · RobbIA' }

/**
 * Lista de Harnesses. Sem fetch/persistência nesta story — renderiza o estado vazio
 * guiado de first-run (UX-DR14) com o CTA que leva ao Builder.
 */
export default function HarnessesPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-medium">Harnesses</h1>
      <EmptyState
        icon={LayoutGrid}
        title={COPY.firstRunTitle}
        description={COPY.firstRunDescription}
        action={
          <Link
            href="/builder"
            className="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
          >
            {COPY.firstRunCta}
          </Link>
        }
      />
    </section>
  )
}
