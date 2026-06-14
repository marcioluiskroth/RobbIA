import { defineConfig } from 'drizzle-kit'

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error(
    'DATABASE_URL não definida — exporte-a antes de rodar drizzle-kit (ver .env.example). ' +
      'Sem default silencioso para evitar migrar o banco errado.',
  )
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url },
})
