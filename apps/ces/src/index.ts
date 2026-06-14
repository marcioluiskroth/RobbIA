// @robbia/ces — esqueleto de app (Story 1.1). Logica nas stories seguintes.
import { createLogger } from '@robbia/shared'
import { loadEnv } from './env'

export const SERVICE_NAME = 'ces' as const

export function bootstrap(): void {
  const env = loadEnv()
  const log = createLogger(SERVICE_NAME)
  log.info('service skeleton booted', { correlationId: 'boot', nodeEnv: env.NODE_ENV })
}
