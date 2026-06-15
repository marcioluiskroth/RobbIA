import type { ReactNode } from 'react'
import { AppNav } from '@/components/app-nav'

/**
 * Shell do workspace: navegação primária persistente + slot de conteúdo. Desktop-first
 * (sidebar à esquerda em `lg`, empilhada em telas estreitas). Skip-to-content (WCAG 2.4.1)
 * pula a navegação repetida. O route group `(workspace)` não entra na URL.
 */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <a
        href="#main"
        className="sr-only rounded-md bg-fg px-3 py-2 text-bg focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-10"
      >
        Pular para o conteúdo
      </a>
      <AppNav />
      <main id="main" className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
