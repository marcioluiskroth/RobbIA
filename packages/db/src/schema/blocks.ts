import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { blockType } from './block-type'
import { harnesses } from './harnesses'
import { modelConfigs } from './model-configs'

/** Bloco: unidade de execução do Harness, de um Tipo de Bloco, podendo usar um Modelo de IA. */
export const blocks = pgTable(
  'blocks',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    harnessId: uuid('harness_id')
      .notNull()
      .references(() => harnesses.id, { onDelete: 'cascade' }),
    type: blockType('type').notNull(),
    position: integer('position').notNull(),
    name: text('name'),
    justification: text('justification'),
    // Nullable: Blocos "sem LLM" (determinísticos) não referenciam Modelo de IA (FR-4).
    modelConfigId: uuid('model_config_id').references(() => modelConfigs.id, {
      onDelete: 'set null',
    }),
    config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
    // IDs de Blocos dos quais este depende (fluxo de dados entre Blocos).
    dependsOn: jsonb('depends_on').$type<string[]>().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [index('idx_blocks_harness_id').on(t.harnessId)],
)
