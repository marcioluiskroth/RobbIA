import type { ReactNode } from 'react'

/**
 * Layout de 3 zonas do Builder (UX-DR13): Conversa (esq.) · Cards/Inspetor (centro) ·
 * Fluxo & Contexto (dir.). Desktop ~1280px: 3 colunas. Em larguras estreitas (≤~1024px)
 * ou zoom alto, colapsa para zonas EMPILHADAS (stacked) via breakpoint `lg:` — sem scroll
 * horizontal, medidas em rem (UX-DR16). Layout puramente declarativo (CSS), por isso sem
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[20rem_1fr_22rem]">
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
