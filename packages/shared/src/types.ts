/**
 * Tipos transversais base. Os schemas Zod de domínio (Harness, Bloco, etc.)
 * entram nas stories seguintes em `packages/shared/src/schemas/`.
 */

/** UUID v7 (ordenável) — PK padrão do domínio (ver architecture.md › Arquitetura de Dados). */
export type Uuid = string & { readonly __brand: 'uuid' }

/** Identificador de correlação propagado em jobs/eventos/logs. */
export type CorrelationId = string
