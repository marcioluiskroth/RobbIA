'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { isActiveNav, NAV_ITEMS } from '@/lib/navigation'
import { cn } from '@/lib/utils'

/**
 * Navegação primária persistente (UX-DR12). Item ativo sinalizado por MAIS que cor:
 * `aria-current="page"` + peso/realce de borda (cor nunca é o único sinal). Anel de
 * foco visível herdado dos tokens `focus` (globals.css).
 */
export function AppNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação primária"
      className="flex shrink-0 flex-col gap-4 border-b border-border bg-surface p-4 lg:min-h-screen lg:w-56 lg:border-r lg:border-b-0"
    >
      <span className="px-2 font-mono text-lg font-medium">RobbIA</span>

      <ul className="flex flex-1 flex-wrap gap-1 lg:flex-col lg:flex-nowrap">
        {NAV_ITEMS.map((item) => {
          const active = isActiveNav(item, pathname)
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-md border-l-2 border-transparent px-3 py-2 text-sm hover:bg-bg',
                  active ? 'border-cyan-text bg-bg font-medium text-fg' : 'text-fg-muted',
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="px-1">
        <ThemeToggle />
      </div>
    </nav>
  )
}
