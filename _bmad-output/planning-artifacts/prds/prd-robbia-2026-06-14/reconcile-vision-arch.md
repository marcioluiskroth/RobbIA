# Reconciliação Insumo ↔ PRD — RobbIA (MVP)

**Insumo (visão/arquitetura):** `c:\Desenvolvimentos\RobbIA\docs\product-vision-architecture.md` (v2.0, jun/2026)
**PRD:** `_bmad-output/planning-artifacts/prds/prd-robbia-2026-06-14/prd.md` (MVP / Fase 1)
**Addendum:** `_bmad-output/planning-artifacts/prds/prd-robbia-2026-06-14/addendum.md`
**Data da reconciliação:** 2026-06-14

---

## 0. Veredito

O PRD captura **muito bem** o núcleo da visão e gerencia adiamentos com disciplina (Não-Goals em §5, Fora-de-escopo em §6.2, índice de pressupostos em §13). Os dois desvios conscientes frente aos docs — **RPA antecipado para o MVP** e **WhatsApp via Evolution API em vez de Meta Cloud API** — estão registrados de forma exemplar (PRD §0/§10 + Addendum B/C).

A reconciliação de ~26 conceitos do insumo resultou em: a grande maioria **capturada** ou **adiada conscientemente** (multi-cliente/white-label, marketplace, Skills/MCP da comunidade, memória híbrida, Academy/SDK, DeepSeek direto — todos corretamente fora do MVP e **não** contam como gap).

Restam **poucos gaps reais** — itens do insumo perdidos sem decisão explícita, ou nuances/divergências de UX que merecem uma linha no PRD ou no addendum. Nenhum é bloqueante; o mais relevante é conceitual (Connectors em tempo de planejamento) e dois são de redação de NFR/UX.

---

## 1. Gaps reais (perdidos sem decisão explícita)

### GAP-1 — Connectors como camada de produto "1-clique" sobre MCP (conceito ausente do recorte) — **Médio**
- **Insumo §3.6:** "Connectors é a camada de produto que transforma o MCP — um protocolo técnico — em uma **experiência de um clique**... Por adotar o padrão MCP, a RobbIA herda todo o ecossistema existente de milhares de servidores públicos."
- **No PRD:** o termo "Connector" foi **reduzido no Glossário a sinônimo de "Canal"** ("integração de entrada/saída de mensagens. No MVP: Evolution API e Telegram"). O conceito original — Connector = servidor MCP empacotado com auth simplificada/ícone/permissões, como camada de produto — **desapareceu** sem aparecer nem como capacidade nem como item adiado nomeado.
- **Por que importa:** no insumo, Connectors são tratados como **diferencial de produto** (não só plumbing). No MVP só existem 2 Canais, então é legítimo não construir a biblioteca de Connectors; o problema é que o conceito sumiu silenciosamente. Como o Glossário "reaproveitou" a palavra, há risco de o time perder a intenção estratégica e de o termo significar coisas diferentes entre os dois documentos.
- **Recomendação:** uma linha em §6.2 (Fora de escopo) — "Biblioteca de Connectors 1-clique (MCP empacotado) — Fase 3" — e/ou nota no Glossário esclarecendo que, no MVP, "Connector" está deliberadamente restrito a "Canal".

### GAP-2 — Connectors no momento de **planejamento** (a IA Arquiteta consulta as conexões ligadas ao projetar o Harness) — **Médio** (é um diferencial declarado)
- **Insumo §3.6 (marcado explicitamente como diferencial frente a OpenClaw e Hermes):** "**No planejamento (diferencial):** a IA Arquiteta consulta os Connectors ligados e projeta o harness já escolhendo as ferramentas certas." (vs. "na execução (paridade)").
- **No PRD:** a IA Arquiteta (4.1/FR-1) decompõe o pedido em Blocos, mas **não há requisito** de que ela conheça/consulte os Canais/credenciais já conectados ao Workspace para escolher ferramentas. O único reflexo próximo é o *edge case* de UJ-1 (pausa e pede credencial faltante) — que é reação em tempo de teste, não consciência em tempo de planejamento.
- **Por que importa:** o insumo posiciona isto como parte do *moat* ("diferencial frente a OpenClaw e Hermes"). Perder a awareness em tempo de planejamento enfraquece silenciosamente o diferencial central que o próprio PRD (§1) diz existir para provar.
- **Recomendação:** acrescentar uma *Consequence (testable)* em FR-1 do tipo "a proposta prioriza Canais/Connectors já configurados no Workspace quando aplicável" — ou registrar explicitamente como adiado se for o caso.

### GAP-3 — Garantias do sandbox RPA mais fracas que o insumo (NFR de segurança incompleto) — **Médio/Baixo**
- **Insumo §6.2:** sandbox Docker "com **rede restrita**, destruído ao final. **Screenshots/dados extraídos são temporários e deletados após o processamento.**"
- **No PRD (FR-7 / §8 NFR):** garante container "isolado, destruído ao final", credenciais via CES e log auditável — **mas omite** (a) **isolamento/restrição de rede** do container e (b) **deleção dos screenshots/dados extraídos** após o processamento.
- **Por que importa:** ambos são controles de segurança/privacidade concretos (e o PRD trata segurança como P0). Como há captura de screenshot de telas de ERP (potencialmente com dados sensíveis/PII → LGPD), a não-retenção é um requisito de privacidade que ficou de fora sem decisão registrada.
- **Recomendação:** adicionar ao NFR de Segurança (§8) e/ou a uma *Consequence* de FR-7: "rede do container RPA restrita" e "screenshots/dados extraídos são efêmeros e deletados após o processamento".

---

## 2. Nuances / divergências a confirmar (não necessariamente erro)

### DIV-1 — Modelo de UX: "fluxo visual (ReactFlow)" no insumo vs. "chat + cards, um bloco por vez" no PRD — **Confirmar intenção**
- **Insumo:** stack §8 lista **ReactFlow** como "UI de fluxos / visualização de fluxos"; §9 sugere canvas de fluxo.
- **PRD §4.9/FR-2/FR-14:** a UI é descrita como **chat conversacional + cards visuais, um Bloco por vez**, com "encadeamento (ordem e dependências) visível". Não menciona canvas node-graph.
- **Leitura:** não é necessariamente contradição — cards com encadeamento podem ser renderizados sobre ReactFlow. Mas o **modelo mental de UX diverge** (editor de grafo vs. wizard de cards sequenciais) e o PRD não diz qual é. O Addendum A repete ReactFlow na stack, o que reforça a ambiguidade.
- **Recomendação:** uma frase em §4.9 alinhando — ou "cards sequenciais (sem canvas de grafo no MVP)" ou "cards renderizados sobre canvas ReactFlow". Decisão de UX, não de PRD-corpo, mas deve ser explícita para não gerar retrabalho.

### DIV-2 — Trust Engine: dimensão "**quem pode disparar** o agente" (autorização do gatilho) sub-representada — **Baixo**
- **Insumo §6.3:** Trust Engine "define **quem pode disparar o agente**, quais ações exigem confirmação humana e quais blocos são autônomos" (três dimensões).
- **PRD (Glossário + 4.8/FR-13):** Trust Engine reduzido a "permissões que definem quais **Ações Irreversíveis** exigem confirmação humana". A dimensão de **autorização de quem aciona** o Harness não aparece (e a única menção a controle de acesso é o pressuposto de "auth single-admin no MVP" em §13).
- **Leitura:** num MVP single-admin/single-workspace, "quem dispara" é quase trivial, então o adiamento é defensável — mas ficou **implícito**, não registrado.
- **Recomendação:** opcional. Uma nota de que, no MVP single-admin, a dimensão "quem dispara" do Trust Engine é trivial e a granularidade fica para v2 (quando entra multi-tenancy).

### DIV-3 — Economia por execução (custo/tempo concretos dos casos de uso) não carregada — **Baixo (informativo)**
- **Insumo §5:** casos de uso trazem números de ROI concretos — "custo por interação R$ 0,003–0,02", "45 s vs. 8 min manualmente".
- **PRD:** trata custo apenas como **guardrail/NFR** ("tornar o trade-off visível ao arquiteto") e tem SM-2 (time-to-production). Os números de economia/ROI por execução não foram transpostos.
- **Leitura:** é material de visão/marketing, legitimamente fora do corpo de capacidades do PRD. Citado só para registro de completude — **não é gap de produto**.

---

## 3. Itens do insumo corretamente ADIADOS (não são gaps — registro de confirmação)

Confirmados como decisões conscientes (Não-Goal/Fora-de-escopo/Fase), **não** contam como perda:

- **Painel multi-cliente + white-label (B2B2B)** — diferencial central da visão; adiado p/ v2 (PRD §5, §6.2, §1). Exige multi-tenancy.
- **Marketplace de harnesses (fork/remix/avaliação) + agentskills.io** — Fase 5; e, se vier, curado/certificado (justificado pela evidência de supply-chain no Addendum G). PRD §5, §6.2.
- **Sistema de Skills (SKILL.md/TOOLS.json, 8 categorias) + catálogo de MCP da comunidade (10 MCPs)** — Fase 3. PRD §5, §6.2.
- **Motor de memória híbrida (dense+sparse), perfis persistentes globais, memória por agente, engine proativo** — Fase 4. MVP mantém só memória mínima por conversa (FR-15). PRD §4.10, §5, §6.2.
- **DeepSeek como Provider direto** — substituído por acesso via OpenRouter no MVP. PRD §6.2 (explícito).
- **WhatsApp Meta Cloud API → Evolution API** — desvio consciente e bem documentado (risco de ToS/banimento assumido). PRD §10 + Addendum B.
- **RPA na Fase 2 → antecipado para o MVP** — override consciente do roadmap. PRD §4.4 + Addendum C.
- **Academy/certificação, SDK p/ desenvolvedores, multi-agente, interface mobile** — Fase 5+. PRD §6.2.
- **Stack técnica (Bun, Drizzle, pgvector, ReactFlow, pg-boss, Fastify, Shadcn, Docker Compose, MIT)** — não duplicada no PRD por design; mora no Addendum A + docs. Correto.
- **Marca/identidade (§12 do insumo)** — delegada ao brand book; PRD não duplica. Correto.

---

## 4. Resumo dos gaps reais (priorizado)

| # | Gap | Severidade | Ação sugerida |
|---|-----|-----------|----------------|
| GAP-1 | Conceito "Connectors 1-clique sobre MCP" sumiu (palavra reusada como "Canal") | Média | Linha em §6.2 + nota no Glossário |
| GAP-2 | IA Arquiteta não consulta Connectors ligados em tempo de **planejamento** (diferencial declarado) | Média | Consequence em FR-1 ou adiar explicitamente |
| GAP-3 | Sandbox RPA sem "rede restrita" nem "deleção de screenshots/dados" (segurança/LGPD) | Média/Baixa | Acrescentar a §8 NFR e/ou FR-7 |
| DIV-1 | UX: fluxo ReactFlow (insumo) vs. cards sequenciais (PRD) — modelo mental diverge | Confirmar | Uma frase em §4.9 |
| DIV-2 | Trust Engine: dimensão "quem dispara" não registrada (trivial no single-admin) | Baixa | Nota opcional |
| DIV-3 | Números de ROI/custo dos casos de uso não transpostos | Informativo | Nenhuma (fora do corpo do PRD) |

**Conclusão:** o PRD está sólido e fiel ao MVP. Os três gaps reais (GAP-1/2/3) e a divergência de UX (DIV-1) são correções de **uma a duas linhas cada** — recomenda-se endereçá-las antes de congelar o PRD, com atenção especial a GAP-2 (toca o moat) e GAP-3 (toca segurança P0/LGPD).
