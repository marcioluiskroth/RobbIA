import { baseEnvSchema, makeLoadEnv } from '@robbia/shared'

/** Schema de ambiente do app — estenda o base com vars próprias quando necessário. */
export const envSchema = baseEnvSchema

/** Valida o ambiente no boot (parse, don't validate). */
export const loadEnv = makeLoadEnv(envSchema)

export type Env = ReturnType<typeof loadEnv>
