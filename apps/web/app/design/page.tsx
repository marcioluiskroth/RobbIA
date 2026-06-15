import { BLOCK_TYPES } from '@robbia/shared'
import { ThemeToggle } from '@/components/theme-toggle'
import { MascotCore } from '@/components/ui/mascot-core'
import { StateBadge } from '@/components/ui/state-badge'
import { AGENT_STATE_KEYS } from '@/lib/agent-state'
import { blockTypeVisual } from '@/lib/block-types'

/** Vitrine do design system — apoio à verificação visual manual (não é surface de produto). */
export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">RobbIA — Design System</h1>
        <ThemeToggle />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Estados do agente</h2>
        <div className="flex flex-wrap gap-4">
          {AGENT_STATE_KEYS.map((state) => (
            <MascotCore key={state} state={state} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {AGENT_STATE_KEYS.map((state) => (
            <StateBadge key={state} state={state} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Tipos de Bloco</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BLOCK_TYPES.map((type) => {
            const v = blockTypeVisual(type)
            const Icon = v.icon
            return (
              <li
                key={type}
                className="flex items-center gap-2 rounded-md border-l-4 border-border bg-surface p-3"
              >
                <Icon size={18} aria-hidden />
                <span className="font-mono text-sm">{type}</span>
                <span className="ml-auto text-xs text-fg-muted">{v.shape}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
