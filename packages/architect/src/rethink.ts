import type { LLMProvider } from '@robbia/provider'
import { type Block, BlockSchema, type Harness, type Result } from '@robbia/shared'
import type { WorkspaceContext } from './types'

/** Entrada do "Repensar": repensa UM Bloco preservando os demais (FR-3). */
export interface RethinkInput {
  harness: Harness
  /** Índice (0-based) do Bloco a repensar. */
  index: number
  model: string
  workspace?: WorkspaceContext
  repairAttempts?: number
}

function buildRethinkSystemPrompt(): string {
  return [
    'Você é a IA Arquiteta da RobbIA — uma colega sênior que projeta agentes de automação.',
    'O arquiteto pediu para REPENSAR um único Bloco de um Harness já proposto, sem descartar os demais.',
    'Proponha UMA alternativa melhor para EXATAMENTE o Bloco indicado: preserve o papel dele no fluxo e a coerência com os Blocos vizinhos; melhore a abordagem, a justificativa e/ou o Modelo. Não repita a versão atual.',
    'Mantenha o mesmo "type" quando fizer sentido. Se o Bloco usa LLM, inclua "model"; se for determinístico ("sem LLM"), omita "model".',
    'Responda SOMENTE com JSON válido de UM Bloco (sem prosa, sem cercas): {"type":"...","name":"...","justification":"...","model":"...","config":{}}.',
  ].join('\n')
}

function buildRethinkRequest(harness: Harness, index: number): string {
  const current = harness.blocks[index]
  return [
    `Harness atual: ${JSON.stringify({ name: harness.name, blocks: harness.blocks })}`,
    `Repense o Bloco na posição ${index} (0-based)${
      current ? ` — atualmente Tipo "${current.type}", nome "${current.name}"` : ''
    }.`,
    'Responda só com o JSON do Bloco alternativo.',
  ].join('\n')
}

/**
 * Repensa um único Bloco (FR-3). Reusa `completeStructured` (validação Zod + repair) e
 * valida contra `BlockSchema`. Erros de Provider são propagados como `Result` de erro.
 * Quem substitui o Bloco e preserva os aprovados é o chamador (UI) — aqui só geramos.
 */
export function rethinkBlock(provider: LLMProvider, input: RethinkInput): Promise<Result<Block>> {
  return provider.completeStructured<Block>({
    model: input.model,
    system: buildRethinkSystemPrompt(),
    messages: [{ role: 'user', content: buildRethinkRequest(input.harness, input.index) }],
    schema: BlockSchema,
    repairAttempts: input.repairAttempts,
  })
}
