import { boolean, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

/** Provider de Modelos de IA (Claude/GPT/Gemini/Ollama/OpenRouter). Segredos vão para o CES. */
export const providers = pgTable('providers', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  kind: text('kind').notNull(),
  label: text('label').notNull(),
  config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})
