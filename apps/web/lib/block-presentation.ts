import type { Block } from '@robbia/shared'

/**
 * Regra "sem LLM → sem badge de Modelo" (FR-4, UX-DR2): um Bloco sem `model`
 * (determinístico) não exibe badge. Fonte única da regra de apresentação.
 */
export function hasModelBadge(block: Block): boolean {
  return typeof block.model === 'string' && block.model.length > 0
}
