import { describe, expect, it } from 'bun:test'
import { isActiveNav, NAV_ITEMS } from './navigation'

describe('NAV_ITEMS', () => {
  it('tem as 4 surfaces na ordem do PRD, com rótulos exatos', () => {
    expect(NAV_ITEMS.map((i) => i.label)).toEqual(['Harnesses', 'Builder', 'Operação', 'Workspace'])
  })

  it('hrefs e keys são únicos', () => {
    const hrefs = NAV_ITEMS.map((i) => i.href)
    const keys = NAV_ITEMS.map((i) => i.key)
    expect(new Set(hrefs).size).toBe(hrefs.length)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('todo href começa com "/"', () => {
    for (const item of NAV_ITEMS) expect(item.href.startsWith('/')).toBe(true)
  })
})

describe('isActiveNav', () => {
  const builder = NAV_ITEMS.find((i) => i.key === 'builder')
  if (!builder) throw new Error('builder ausente')

  it('match exato', () => {
    expect(isActiveNav(builder, '/builder')).toBe(true)
  })

  it('match de subrota', () => {
    expect(isActiveNav(builder, '/builder/abc')).toBe(true)
  })

  it('não casa rota de outra surface', () => {
    expect(isActiveNav(builder, '/harnesses')).toBe(false)
  })
})
