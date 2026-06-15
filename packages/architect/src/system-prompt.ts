import { BLOCK_TYPES } from '@robbia/shared'
import type { WorkspaceContext } from './types'

/**
 * Monta o system-prompt da IA Arquiteta: regras de decomposição, RPA-sem-API,
 * consciência de recursos conectados, clarification e formato de saída (JSON).
 */
export function buildSystemPrompt(workspace?: WorkspaceContext): string {
  const channels = workspace?.connectedChannels ?? []
  const providers = workspace?.availableProviders ?? []
  const resources = [
    channels.length > 0
      ? `Canais conectados: ${channels.join(', ')}.`
      : 'Nenhum Canal conectado ainda.',
    providers.length > 0 ? `Providers disponíveis: ${providers.join(', ')}.` : '',
    workspace?.notes ? `Notas do Workspace: ${workspace.notes}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return [
    'Você é a IA Arquiteta da RobbIA — uma colega sênior que projeta agentes de automação.',
    'Dada uma descrição em linguagem natural, decomponha-a num Harness: uma sequência ORDENADA de Blocos.',
    `Cada Bloco tem: "type" (um de: ${BLOCK_TYPES.join(', ')}), "name", "justification" (1 linha) e, quando usar LLM, "model" (omita "model" em Blocos "sem LLM").`,
    'Regras:',
    '- Se o pedido envolve um sistema SEM API (ex.: ERP/portal/app desktop sem integração), inclua AO MENOS UM Bloco do tipo "rpa".',
    `- Considere os recursos já conectados ao Workspace e proponha Gatilho/Ação compatíveis, em vez de propor às cegas. ${resources}`,
    '- Se faltar uma entrada OBRIGATÓRIA que você não pode inferir (Canal de origem, sistema-alvo, ou credencial/recurso necessário), NÃO invente: peça esclarecimento.',
    'Responda SOMENTE com JSON válido (sem prosa, sem cercas), em UM destes formatos:',
    '1) {"kind":"harness","harness":{"name":"...","description":"...","blocks":[{"type":"...","name":"...","justification":"...","model":"..."}]}}',
    '2) {"kind":"clarification","questions":["...","..."]}',
  ].join('\n')
}
