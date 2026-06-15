import { describe, expect, it } from 'bun:test'
import { JOBS } from './jobs'

describe('JOBS (nomes canônicos de job pg-boss)', () => {
  it('fixa os valores literais exatos (renomear quebra o roteamento — pegue aqui)', () => {
    expect(JOBS).toEqual({
      harnessExecute: 'harness.execute',
      rpaWeb: 'rpa.web',
      rpaDesktop: 'rpa.desktop',
      actionSend: 'action.send',
      actionHttp: 'action.http',
    })
  })

  it('todos os nomes seguem o padrão dominio.acao', () => {
    for (const name of Object.values(JOBS)) {
      expect(name).toMatch(/^[a-z]+\.[a-z]+$/)
    }
  })
})
