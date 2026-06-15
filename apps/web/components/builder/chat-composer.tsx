'use client'

import { Send } from 'lucide-react'
import { type KeyboardEvent, useRef, useState } from 'react'
import type { ConversationTurn } from '@/lib/conversation'
import { isSendable } from '@/lib/conversation'
import { COPY } from '@/lib/glossary'
import { cn } from '@/lib/utils'

/**
 * Entrada de NL com refino contínuo na mesma conversa (FR-14, UX-DR3). Enter envia,
 * Shift+Enter quebra linha; entrada vazia/whitespace não envia; limpa e refoca após enviar.
 * COMPONENTE CONTROLADO: a lista de turnos e o envio vivem no `BuilderWorkspace` (que
 * orquestra a geração); aqui fica só o input local e os atalhos de teclado.
 */
export function ChatComposer({
  turns,
  onSubmit,
  busy = false,
}: {
  turns: readonly ConversationTurn[]
  onSubmit: (text: string) => void
  busy?: boolean
}) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function send() {
    if (busy || !isSendable(text)) return
    onSubmit(text.trim())
    setText('')
    textareaRef.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <ul
        aria-label={COPY.conversationLabel}
        className="flex flex-1 flex-col gap-2 overflow-y-auto"
      >
        {turns.map((turn) => (
          <li
            key={turn.id}
            className={cn(
              'max-w-[85%] whitespace-pre-wrap rounded-md px-3 py-2 text-sm',
              turn.role === 'user' ? 'self-end bg-surface' : 'self-start border border-border',
            )}
          >
            {turn.text}
          </li>
        ))}
      </ul>

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          aria-label={COPY.composerAriaLabel}
          placeholder={COPY.composerPlaceholder}
          className="flex-1 resize-none rounded-md border border-border bg-bg px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={send}
          disabled={busy || !isSendable(text)}
          aria-label={COPY.composerSend}
          className="rounded-md bg-fg p-2 text-bg hover:opacity-90 disabled:opacity-40"
        >
          <Send size={16} aria-hidden />
        </button>
      </div>
    </div>
  )
}
