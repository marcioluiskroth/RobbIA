import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type Env = z.infer<typeof EnvSchema>

/** Valida o ambiente no boot (parse, don't validate). */
export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  return EnvSchema.parse(source)
}
