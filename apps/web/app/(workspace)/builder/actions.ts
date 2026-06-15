'use server'

import { type ArchitectResponse, decompose } from '@robbia/architect'
import { createProviderRegistry, type ProviderConfigMap } from '@robbia/provider'
import type { Result } from '@robbia/shared'
import { resolveArchitectConfig } from '@/lib/architect-config'

/**
 * Gera uma proposta de Harness a partir de uma descrição em NL (FR-1/FR-2).
 * Ponte entre o `ChatComposer` (1.6) e o motor `@robbia/architect` (1.4). O Provider
 * é resolvido do ENV no servidor — segredos NUNCA cruzam para o client; o retorno é
 * um `Result` plano e serializável (proposta efêmera, sem persistência).
 */
export async function proposeHarness(description: string): Promise<Result<ArchitectResponse>> {
  const resolved = resolveArchitectConfig(process.env)
  if (!resolved.ok) {
    return {
      ok: false,
      error: {
        code: resolved.reason === 'no-key' ? 'ARCHITECT_NO_KEY' : 'ARCHITECT_NO_PROVIDER',
        message: 'Provider da IA Arquiteta não configurado',
        retriable: false,
      },
    }
  }

  const config: ProviderConfigMap = { [resolved.kind]: resolved.config }
  const provider = createProviderRegistry(config).get(resolved.kind)
  return decompose(provider, { description, model: resolved.model })
}
