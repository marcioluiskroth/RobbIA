import { z } from 'zod'

/**
 * Fonte ÚNICA de verdade dos 7 Tipos de Bloco (PRD §4.3).
 * Valores ASCII minúsculos (sem acento) — rótulos de exibição vivem na UI.
 * Reutilizado pelo `pgEnum('block_type', ...)` em @robbia/db (sem divergência).
 */
export const BLOCK_TYPES = [
  'gatilho',
  'contexto',
  'decisao',
  'resposta',
  'rpa',
  'acao',
  'verificacao',
] as const

export const BlockTypeSchema = z.enum(BLOCK_TYPES)
export type BlockType = z.infer<typeof BlockTypeSchema>
