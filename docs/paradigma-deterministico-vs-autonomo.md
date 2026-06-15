# Addendum de Visão — Determinístico vs Autônomo

> **Status:** reflexão estratégica (não é contrato de implementação). Data: 2026-06-15.
> **Origem:** dúvida durante o Epic 1 — "o Harness vai olhar para as técnicas de agentes autônomos? Esqueci de algo?"
> Referência: [product-vision-architecture.md](./product-vision-architecture.md), `_bmad-output/planning-artifacts/{epics,architecture}.md`.

## A tese do RobbIA

O RobbIA é uma **bancada de automação determinística e aprovada por humano**: a IA Arquiteta **propõe** um Harness (sequência inspecionável de Blocos), o arquiteto **aprova/customiza Bloco a Bloco**, e o Runtime **executa** com retry/escalonamento e confirmação de Ação Irreversível. O controle e a inspecionabilidade são o **moat**.

Boa parte do vocabulário moderno de "agentes" nasceu do paradigma **oposto** — o **agente autônomo**, em que o LLM decide, em runtime, quais ferramentas chamar e quais sub-agentes disparar. A questão estratégica não é *"esquecemos uma técnica?"*, e sim:

> **Até onde absorvemos padrões autônomos sem abrir mão do controle determinístico que é a proposta de valor?**

Cada técnica pode ser **mapeada conscientemente** no modelo de Harness, sem trair a tese.

## Mapa das 5 técnicas

| Técnica | Cobertura no RobbIA | Onde / Lacuna |
|---|---|---|
| **sandbox / computer use** | ✅ **Forte (diferencial)** | RPA web (Stagehand+Playwright em Docker isolado/efêmero), RPA desktop (FlaUI no nó Windows), verificação visual por LLM (FR-8), CES p/ credenciais. "computer-use" aparece como fallback de visão. Epics 3 e 5. |
| **MCP — client** | ✅ **Coberto** | Epic 7 (FR-27): `mcp-adapters`, Connectors de 1 clique, ponte tool→Skill. |
| **MCP — server** | 🔴 **Lacuna** | Expor os Harnesses do RobbIA **como** tools/servidor MCP para outros agentes não está no plano. Extensão natural do marketplace/agentskills.io. → **Decisão 2**. |
| **tool use nativo** | 🟡 **Conceito sim, mecanismo não** | O agente usa "tools" via Skills (`SKILL.md`+`TOOLS.json`), MCP, RPA, HTTP — escolhidas **em design-time pela IA Arquiteta**. A Story 1.3 **adiou** o tool-use/structured-output *nativo* (usa complete+normalize). Decisão deliberada: o fluxo é do humano, não de um loop autônomo. |
| **agents.md / claude.md** | 🟡 **Equivalente estrutural** | O **próprio Harness** é a definição portátil do agente (+ export/marketplace). `SKILL.md` cobre a definição de Skill. Não há um arquivo de instruções/convenções editável à mão por Harness. Avaliar se power-users querem essa camada. |
| **parallel sub-agents** | 🔴 **Lacuna** | O Harness é uma **sequência ordenada** de Blocos (a Story 1.7 assume fluxo linear). "Concorrência" no plano é *lock por conversa* — o oposto de fan-out. Sem sub-Harness nem paralelismo de sub-agentes. → **Decisão 1**. |

## Decisões em aberto (candidatas a FR de épico futuro)

### Decisão 1 — Paralelismo / sub-Harness (`parallel sub-agents`)
**Pergunta:** o modelo de Blocos deve suportar **composição** (um Bloco que é, ele próprio, um sub-Harness) e/ou **fan-out paralelo** (um Bloco "map" que dispara N execuções e agrega)?
- **A favor:** muitos casos reais (processar uma lista, consultar várias fontes, comparar respostas) pedem paralelismo; mantém-se determinístico se o fan-out for **declarado** no Harness (não decidido em runtime pelo LLM).
- **Custo/risco:** toca o schema de domínio (Bloco precisaria referenciar um sub-Harness ou um Tipo "paralelo"), o Runtime (state machine com ramos concorrentes) e a UI (fluxo deixa de ser linear). **Decidir antes do schema endurecer.**
- **Forma sugerida se adotado:** novo Tipo de Bloco (`paralelo`/`map`) **ou** `harness_id` aninhado no Bloco; o paralelismo é parte da **estrutura aprovada**, não autonomia de runtime.

### Decisão 2 — MCP server (expor Harnesses como tools)
**Pergunta:** o RobbIA deve **expor** Harnesses publicados como um **servidor MCP**, para que outros agentes/LLMs os invoquem como tools?
- **A favor:** simetria com o Connector (client) do Epic 7; transforma cada Harness publicado num bloco de construção para terceiros; reforça o marketplace e a compatibilidade com o ecossistema MCP.
- **Custo/risco:** superfície de exposição/segurança (autenticação, escopo, rate-limit) — passa pelo CES e Trust Engine; provavelmente um épico próprio pós-MVP.

> As demais 3 técnicas (`computer use`, `MCP client`, `tool use` conceitual/`agents.md`) são **consciência**, não retrabalho — já cobertas ou são escolha de design assumida.

## Orientação

Manter a **linha determinística** como default; absorver padrões autônomos **apenas quando declaráveis e inspecionáveis** no Harness (nunca como decisão opaca de runtime). Revisitar as Decisões 1 e 2 no planejamento pós-Epic 1 (provável Epic 8+), antes que o schema de execução (Epic 2) e o catálogo de Skills (Epic 7) fixem as fronteiras.
