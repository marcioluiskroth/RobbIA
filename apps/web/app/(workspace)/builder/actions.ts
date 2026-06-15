'use server'

import { type ArchitectResponse, decompose, rethinkBlock } from '@robbia/architect'
import { createProviderRegistry, type LLMProvider, type ProviderConfigMap } from '@robbia/provider'
import type { Block, Harness, Result, ResultError } from '@robbia/shared'
import { resolveArchitectConfig } from '@/lib/architect-config'

/** Erro legível quando o Provider da IA Arquiteta não está configurado no ENV. */
function providerNotConfigured(reason: 'no-provider' | 'no-key'): ResultError {
  return {
    code: reason === 'no-key' ? 'ARCHITECT_NO_KEY' : 'ARCHITECT_NO_PROVIDER',
    message: 'Provider da IA Arquiteta não configurado',
    retriable: false,
  }
}

/** Resolve Provider+Modelo do ENV (server-only). Helper privado — segredos nunca no client. */
function resolveProvider():
  | { ok: true; provider: LLMProvider; model: string }
  | { ok: false; error: ResultError } {
  const resolved = resolveArchitectConfig(process.env)
  if (!resolved.ok) return { ok: false, error: providerNotConfigured(resolved.reason) }
  const config: ProviderConfigMap = { [resolved.kind]: resolved.config }
  return {
    ok: true,
    provider: createProviderRegistry(config).get(resolved.kind),
    model: resolved.model,
  }
}

/**
 * Gera uma proposta de Harness a partir de uma descrição em NL (FR-1/FR-2).
 * Ponte entre o `ChatComposer` (1.6) e o motor `@robbia/architect` (1.4). `Result`
 * plano e serializável (proposta efêmera, sem persistência).
 */
export async function proposeHarness(description: string): Promise<Result<ArchitectResponse>> {
  const resolved = resolveProvider()
  if (!resolved.ok) return { ok: false, error: resolved.error }
  return decompose(resolved.provider, { description, model: resolved.model })
}

/**
 * Repensa UM Bloco do Harness preservando os demais (FR-3). O chamador (UI) substitui
 * apenas o Bloco do índice; aqui só geramos a alternativa validada.
 */
export async function rethinkBlockAction(harness: Harness, index: number): Promise<Result<Block>> {
  const resolved = resolveProvider()
  if (!resolved.ok) return { ok: false, error: resolved.error }
  return rethinkBlock(resolved.provider, { harness, index, model: resolved.model })
}
