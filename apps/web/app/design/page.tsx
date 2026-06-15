import { BLOCK_TYPES } from '@robbia/shared'
import { ThemeToggle } from '@/components/theme-toggle'
import { MascotCore } from '@/components/ui/mascot-core'
import { StateBadge } from '@/components/ui/state-badge'
import { AGENT_STATE_KEYS } from '@/lib/agent-state'
import { type BlockColorToken, blockTypeVisual } from '@/lib/block-types'

/** Borda por Tipo de Bloco (DESIGN.md) — ciano reservado a Gatilho/Ação. */
const BORDER_CLASS: Record<BlockColorToken, string> = {
  cyan: 'border-cyan',
  slate: 'border-slate',
  steel: 'border-steel',
  graphite: 'border-graphite',
}

const PALETTE: { group: string; swatches: { label: string; className: string }[] }[] = [
  {
    group: 'Marca',
    swatches: [
      { label: 'graphite', className: 'bg-graphite' },
      { label: 'charcoal', className: 'bg-charcoal' },
      { label: 'cyan', className: 'bg-cyan' },
    ],
  },
  {
    group: 'Apoio',
    swatches: [
      { label: 'slate', className: 'bg-slate' },
      { label: 'steel', className: 'bg-steel' },
      { label: 'cyan-light', className: 'bg-cyan-light' },
      { label: 'mist', className: 'bg-mist' },
    ],
  },
  {
    group: 'Estado',
    swatches: [
      { label: 'idle', className: 'bg-state-idle' },
      { label: 'thinking', className: 'bg-state-thinking' },
      { label: 'active', className: 'bg-state-active' },
      { label: 'waiting', className: 'bg-state-waiting' },
      { label: 'done', className: 'bg-state-done' },
      { label: 'error', className: 'bg-state-error' },
    ],
  },
]

/** Vitrine do design system — apoio à verificação visual manual (não é surface de produto). */
export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">RobbIA — Design System</h1>
        <ThemeToggle />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Paleta</h2>
        {PALETTE.map(({ group, swatches }) => (
          <div key={group} className="flex flex-col gap-1">
            <span className="text-xs text-fg-muted">{group}</span>
            <div className="flex flex-wrap gap-2">
              {swatches.map(({ label, className }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span
                    className={`size-10 rounded border border-border ${className}`}
                    aria-hidden
                  />
                  <span className="font-mono text-[11px] text-fg-muted">{label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

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
                className={`flex items-center gap-2 rounded-md border-l-4 bg-surface p-3 ${BORDER_CLASS[v.borderColorToken]}`}
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
