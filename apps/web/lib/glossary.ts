/**
 * Glossário canônico do produto (PRD) — fonte única de copy. Usar EXATAMENTE estes
 * termos na microcopy, sem sinônimos divergentes (UX-DR19). Voz: técnica, colega
 * sênior, PT-BR, sem hype nem infantilização (UX-DR3).
 */
export const GLOSSARY = {
  harness: 'Harness',
  bloco: 'Bloco',
  modeloDeIa: 'Modelo de IA',
  canal: 'Canal',
  modoDeTeste: 'Modo de Teste',
} as const

export type GlossaryKey = keyof typeof GLOSSARY

/** Resolve um termo canônico (determinístico). */
export function glossaryTerm(key: GlossaryKey): string {
  return GLOSSARY[key]
}

/** Microcopy-chave centralizada (apoiada no glossário acima). */
export const COPY = {
  composerPlaceholder: 'Descreva o agente que você quer automatizar…',
  composerAriaLabel: 'Descrição do agente em linguagem natural',
  composerSend: 'Enviar',
  conversationLabel: 'Conversa com a IA Arquiteta',
  firstRunTitle: 'Nenhum Harness ainda',
  firstRunDescription:
    'Descreva o que quer automatizar e a IA Arquiteta propõe os Blocos do seu primeiro Harness.',
  firstRunCta: 'descreva seu primeiro agente',
  builderCardsTitle: 'Nenhum Bloco ainda',
  builderCardsDescription:
    'Descreva o agente na Conversa: a IA Arquiteta propõe os Blocos e eles aparecem aqui.',
  builderFlowTitle: 'O fluxo aparece aqui',
  builderFlowDescription:
    'A sequência de Blocos do Harness é desenhada nesta zona após a proposta.',
  comingSoon: 'Em breve',
} as const
