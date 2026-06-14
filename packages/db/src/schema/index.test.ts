import { describe, expect, it } from 'bun:test'
import { blocks, blockType, harnesses, modelConfigs, providers } from './index'

describe('db schema', () => {
  it('exporta as 4 tabelas de domínio', () => {
    expect(harnesses).toBeDefined()
    expect(blocks).toBeDefined()
    expect(providers).toBeDefined()
    expect(modelConfigs).toBeDefined()
  })

  it('enum block_type cobre os 7 Tipos de Bloco', () => {
    expect(blockType.enumValues).toHaveLength(7)
    expect(blockType.enumValues).toContain('gatilho')
    expect(blockType.enumValues).toContain('verificacao')
  })
})
