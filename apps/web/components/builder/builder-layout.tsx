import type { ReactNode } from 'react'

/**
 * Layout de 3 zonas do Builder (UX-DR13): Conversa (esq.) · Cards/Inspetor (centro) ·
 * Fluxo & Contexto (dir.). Em `xl` (~1280px, viewport ótimo): 3 colunas. Abaixo de 1280px
 * ou sob zoom alto, colapsa para zonas EMPILHADAS (stacked) — sem scroll horizontal mesmo
 * na faixa 1024–1280px (colunas fixas 20rem+22rem não cabem ali), medidas em rem (UX-DR16).
 * Layout puramente declarativo (CSS), por isso sem
 * `'use client'`: as zonas chegam como props e o componente não tem estado/efeito.
 */
export function BuilderLayout({
  conversation,
  cards,
  flow,
}: {
  conversation: ReactNode
  cards: ReactNode
  flow: ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[20rem_minmax(0,1fr)_22rem]">
      <section
        aria-label="Conversa"
        className="flex min-h-[24rem] flex-col rounded-lg border border-border p-4"
      >
        {conversation}
      </section>
      <section
        aria-label="Cards e Inspetor do Bloco"
        className="flex min-h-[24rem] flex-col rounded-lg border border-border p-4"
      >
        {cards}
      </section>
      <section
        aria-label="Fluxo e Contexto"
        className="flex min-h-[24rem] flex-col gap-4 rounded-lg border border-border p-4"
      >
        {flow}
      </section>
    </div>
  )
}
