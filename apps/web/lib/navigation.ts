/** Navegação primária do workspace (UX-DR12) — fonte única dos rótulos PT-BR. */
export interface NavItem {
  key: string
  /** Rótulo exato do PRD — não usar sinônimos. */
  label: string
  href: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'harnesses', label: 'Harnesses', href: '/harnesses' },
  { key: 'builder', label: 'Builder', href: '/builder' },
  { key: 'operacao', label: 'Operação', href: '/operacao' },
  { key: 'workspace', label: 'Workspace', href: '/workspace' },
] as const

/** Item ativo para um pathname (match exato ou subrota). */
export function isActiveNav(item: NavItem, pathname: string): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
