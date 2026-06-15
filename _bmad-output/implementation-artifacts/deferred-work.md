# Deferred Work

## Deferred from: code review of story 1-1-scaffold-monorepo (2026-06-14)

- **Logger — redação de segredos em VALORES (não só nomes de chave):** hoje `redactSecrets` só inspeciona o NOME da chave; um segredo embutido num valor (connection string com senha, header `Authorization: Bearer x`, JWT) passa em texto puro. Varredura de valores é uma decisão de design com tradeoff (custo por log + falsos positivos). Adiar para quando o logging carregar payloads reais (Story 2.4 — streaming/logs ao vivo), avaliando padrões de valor (URLs com credencial, prefixo Bearer/JWT) e limites de performance. [packages/shared/src/logger.ts]

## Decisões de visão a revisitar (pós-Epic 1)

Ver [docs/paradigma-deterministico-vs-autonomo.md](../../docs/paradigma-deterministico-vs-autonomo.md) — mapeamento das técnicas de agente autônomo ao modelo determinístico do Harness.

- **Decisão 1 — Paralelismo / sub-Harness (`parallel sub-agents`):** suportar composição (Bloco = sub-Harness) e/ou fan-out paralelo declarado (Tipo `paralelo`/`map`)? **Toca schema de domínio + Runtime + UI — decidir antes do schema de execução (Epic 2) endurecer.**
- **Decisão 2 — MCP server:** expor Harnesses publicados como servidor MCP (tools para outros agentes)? Simetria com o Connector/client (Epic 7); provável épico próprio pós-MVP (segurança via CES/Trust Engine).
