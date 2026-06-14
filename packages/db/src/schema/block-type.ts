import { BLOCK_TYPES } from '@robbia/shared'
import { pgEnum } from 'drizzle-orm/pg-core'

/** Enum Postgres dos 7 Tipos de Bloco — deriva da fonte única em @robbia/shared. */
export const blockType = pgEnum('block_type', BLOCK_TYPES)
