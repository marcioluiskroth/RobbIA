import { describe, expect, it } from 'bun:test'
import { COPY, GLOSSARY, glossaryTerm } from './glossary'

describe('GLOSSARY', () => {
  it('contém os 5 termos canônicos exatos do PRD', () => {
    expect(GLOSSARY).toEqual({
      harness: 'Harness',
      bloco: 'Bloco',
      modeloDeIa: 'Modelo de IA',
      canal: 'Canal',
      modoDeTeste: 'Modo de Teste',
    })
  })

  it('glossaryTerm é determinístico e resolve o termo', () => {
    expect(glossaryTerm('modeloDeIa')).toBe('Modelo de IA')
    expect(glossaryTerm('harness')).toBe(glossaryTerm('harness'))
  })
})

describe('COPY (microcopy)', () => {
  it('o CTA de first-run é exatamente o texto da AC', () => {
    expect(COPY.firstRunCta).toBe('descreva seu primeiro agente')
  })

  it('usa termos do glossário (Harness/Bloco) sem sinônimos divergentes', () => {
    expect(COPY.firstRunDescription).toContain(GLOSSARY.harness)
    expect(COPY.builderCardsTitle).toContain(GLOSSARY.bloco)
  })
})
