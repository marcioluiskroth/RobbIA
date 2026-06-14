# Deferred Work

## Deferred from: code review of story 1-1-scaffold-monorepo (2026-06-14)

- **Logger — redação de segredos em VALORES (não só nomes de chave):** hoje `redactSecrets` só inspeciona o NOME da chave; um segredo embutido num valor (connection string com senha, header `Authorization: Bearer x`, JWT) passa em texto puro. Varredura de valores é uma decisão de design com tradeoff (custo por log + falsos positivos). Adiar para quando o logging carregar payloads reais (Story 2.4 — streaming/logs ao vivo), avaliando padrões de valor (URLs com credencial, prefixo Bearer/JWT) e limites de performance. [packages/shared/src/logger.ts]
