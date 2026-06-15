'use client'

import { ChevronDown } from 'lucide-react'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { COPY } from '@/lib/glossary'
import { findModel, type ModelOption, modelsByProvider } from '@/lib/model-catalog'
import { cn } from '@/lib/utils'

/**
 * Seletor de Modelo de IA — popover hand-rolled e ACESSÍVEL (UX-DR4/16). Padrão `listbox`
 * com roving tabindex (opções são `<button role="option">` → teclado nativo). Setas navegam,
 * Enter/Espaço selecionam, **Esc fecha e devolve o foco ao gatilho**, clicar fora fecha.
 * Modelos agrupados por Provider com dica de custo/latência (rótulo, não só cor). A troca
 * afeta apenas o Bloco de contexto (o chamador faz o update imutável).
 */
export function ModelSelector({
  value,
  onSelect,
}: {
  value?: string
  onSelect: (modelId: string) => void
}) {
  const groups = modelsByProvider()
  const flat = groups.flatMap((group) => group.models)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const wasOpen = useRef(false)

  const current = value ? findModel(value) : undefined

  function openPanel() {
    const index = value ? flat.findIndex((model) => model.id === value) : 0
    setActiveIndex(index >= 0 ? index : 0)
    setOpen(true)
  }

  function choose(model: ModelOption) {
    onSelect(model.id)
    setOpen(false)
  }

  // Foco: ao abrir → opção ativa; ao fechar (após ter aberto) → devolve ao gatilho.
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus()
    else if (wasOpen.current) triggerRef.current?.focus()
    wasOpen.current = open
  }, [open, activeIndex])

  // Fechar ao clicar fora.
  useEffect(() => {
    if (!open) return
    function onDocMouseDown(event: MouseEvent) {
      const target = event.target as Node
      // Fora = nem o gatilho nem QUALQUER parte do painel (inclui cabeçalhos de grupo e padding).
      if (!triggerRef.current?.contains(target) && !listboxRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open])

  function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(flat.length - 1, index + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(0, index - 1))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(flat.length - 1)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
    // Enter/Espaço: tratados nativamente pelo <button> da opção focada.
  }

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-xs hover:bg-surface"
      >
        {current?.label ?? value ?? COPY.swapModel}
        <ChevronDown size={12} aria-hidden />
      </button>

      {open ? (
        <div
          ref={listboxRef}
          role="listbox"
          aria-label={COPY.modelSelectorLabel}
          onKeyDown={onListKeyDown}
          className="absolute z-20 mt-1 max-h-72 w-64 overflow-auto rounded-md border border-border bg-bg p-1 shadow-lg"
        >
          {groups.map((group) => (
            // biome-ignore lint/a11y/useSemanticElements: agrupamento dentro de um listbox usa role="group" (padrão WAI-ARIA), não <fieldset> (que é para forms)
            <div key={group.provider} role="group" aria-label={group.label}>
              <p className="px-2 pt-2 pb-1 font-medium text-[11px] text-fg-muted uppercase tracking-wide">
                {group.label}
              </p>
              {group.models.map((model) => {
                const flatIndex = flat.findIndex((m) => m.id === model.id)
                const active = flatIndex === activeIndex
                const selected = model.id === value
                return (
                  <button
                    key={model.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    tabIndex={active ? 0 : -1}
                    ref={(el) => {
                      optionRefs.current[flatIndex] = el
                    }}
                    onClick={() => choose(model)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
                      active ? 'bg-surface' : 'hover:bg-surface',
                      selected && 'font-medium',
                    )}
                  >
                    <span className="flex-1 truncate">{model.label}</span>
                    <span className="font-mono text-[11px] text-fg-muted">
                      {COPY.costLabel} {model.cost} · {COPY.latencyLabel} {model.latency}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
