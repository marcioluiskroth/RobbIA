/**
 * Nomes canônicos de job (pg-boss) — `dominio.acao`. Ver architecture.md › Padrões de Comunicação.
 */

export const JOBS = {
  harnessExecute: 'harness.execute',
  rpaWeb: 'rpa.web',
  rpaDesktop: 'rpa.desktop',
  actionSend: 'action.send',
  actionHttp: 'action.http',
} as const

export type JobName = (typeof JOBS)[keyof typeof JOBS]
