import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/**
 * Cria o client Drizzle. `packages/db` é o ÚNICO acesso ao Postgres
 * (ver architecture.md › Fronteira de dados). Use `close()` para encerrar o pool
 * (shutdown gracioso / isolamento de testes).
 */
export function createDbClient(connectionString: string) {
  if (!connectionString) {
    throw new Error(
      'createDbClient: connectionString é obrigatória (ver DATABASE_URL no .env.example)',
    )
  }
  const sql = postgres(connectionString)
  return {
    db: drizzle(sql, { schema }),
    sql,
    close: (): Promise<void> => sql.end(),
  }
}

export type DbClient = ReturnType<typeof createDbClient>
export type Db = DbClient['db']
export { schema }
