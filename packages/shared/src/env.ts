import { z } from 'zod'

/**
 * Schema-base de ambiente compartilhado por todos os apps (evita drift do boilerplate).
 * Cada app estende com as próprias vars: `baseEnvSchema.extend({ DATABASE_URL: z.string().url() })`.
 */
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type BaseEnv = z.infer<typeof baseEnvSchema>

/**
 * Cria um `loadEnv` tipado a partir de um schema (parse, don't validate).
 * Valida o ambiente no boot e infere o tipo do Env do app.
 */
export function makeLoadEnv<T extends z.ZodTypeAny>(
  schema: T,
): (source?: Record<string, string | undefined>) => z.infer<T> {
  return (source: Record<string, string | undefined> = process.env) => schema.parse(source)
}
