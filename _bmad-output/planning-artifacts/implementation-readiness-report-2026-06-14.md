---
stepsCompleted: [1, 2, 3, 4, 5, 6]
project_name: RobbIA
date: 2026-06-14
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-robbia-2026-06-14/prd.md
  - _bmad-output/planning-artifacts/prds/prd-robbia-2026-06-14/addendum.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/EXPERIENCE.md
  - _bmad-output/planning-artifacts/epics.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-06-14
**Project:** RobbIA

## Step 1 — Document Inventory

### PRD
- **Whole:** `prds/prd-robbia-2026-06-14/prd.md` (final v2, 21 FRs + §8 NFRs + §10 constraints)
- Apoio: `addendum.md` (detalhe técnico de stack)
- Sem versão sharded concorrente → sem duplicata.

### Architecture
- **Whole:** `architecture.md` (status: complete; starter template, sequência de implementação, fronteiras, mapeamento FR→estrutura)
- Sem duplicata.

### Epics & Stories
- **Whole:** `epics.md` (5 épicos, 27 histórias, FR coverage map; inclui FR-22 adicionado nesta sessão)
- Sem duplicata.

### UX Design
- **Spine pair (folder `ux-designs/ux-RobbIA-2026-06-14/`):** `DESIGN.md` (tokens/componentes/taxonomia) + `EXPERIENCE.md` (IA/estados/acessibilidade/fluxos)
- Apoio: mockups HTML + reviews (a11y/rubrica) — já incorporados aos spines finais.
- Sem duplicata.

**Duplicatas:** nenhuma. **Documentos obrigatórios ausentes:** nenhum (PRD, Arquitetura, Épicos, UX todos presentes).

## PRD Analysis

### Functional Requirements

FR-1: IA Arquiteta decompõe um pedido em NL numa proposta de Harness em Blocos ordenados (Tipo + Modelo sugerido + justificativa); RPA quando sistema sem API; consciência de recursos conectados; pede esclarecimento quando falta entrada obrigatória.
FR-2: Apresentar o Harness bloco a bloco como cards visuais com o encadeamento (ordem/dependências) visível.
FR-3: Decidir por Bloco — aprovar / trocar modelo / repensar (sem descartar aprovados); publicação só com todos aprovados.
FR-4: Selecionar Modelo de IA por Bloco entre Providers configurados; troca não afeta outros Blocos; "sem LLM" permanece determinístico.
FR-5: Executar Harness em sequência com estado e tratamento de erro (retry 3x backoff exp.; escala sem completar Ação Irreversível).
FR-6: Modo de Teste com dados simulados, bloco a bloco em tempo real, sem disparar Ações Irreversíveis reais sem confirmação.
FR-7: Executar ação ampla em sistema web via RPA isolado (Docker, rede restrita, efêmero): multi-página, formulários, upload/download, scraping; auth via CES; handoff em 2FA/captcha.
FR-8: Verificação visual por LLM (screenshot → veredito estruturado; falha impede avanço; redaction pós-auth).
FR-9: Acessar 5 Providers por interface única (Claude/GPT/Gemini/Ollama/OpenRouter); normalização de schema; troca não quebra Runtime.
FR-10: Gatilho e envio por Evolution API (WhatsApp não-oficial) e Telegram; sem verificação de plataforma oficial.
FR-11: Armazenar e injetar credenciais isoladas do LLM (CES); nunca em prompt/log/resposta; redaction de artefatos; detecção de re-credenciamento.
FR-12: Publicar e operar 24/7 (logs auditáveis em tempo real; pausar/editar Bloco isolado sem recriar).
FR-13: Confirmação humana para Ações Irreversíveis (configurável por Bloco/Harness).
FR-14: Construir/revisar o Harness por chat + cards (seletor de Modelo embutido; Modo de Teste acionável; fluxo visual ReactFlow complementar).
FR-15: Persistir e recuperar memória por conversa (isolada; sem perfil global nem busca semântica no MVP).
FR-16: Ordenação e concorrência por conversa (lock por conversa; conversas distintas em paralelo).
FR-17: Resiliência de Provider — failover (transitório vs permanente; Modelo de fallback por Bloco).
FR-18: Resiliência de Canal (detecção/alerta de queda; fila/replay de mensagens; não perde silenciosamente).
FR-19: Confirmação robusta de Ação Irreversível (timeout 24h → cancela/enfileira; canal de confirmação resiliente via painel/log).
FR-20: Identidade visual + estados expressivos (paleta Grafite+Ciano 60/30/10, Inter+JetBrains Mono, temas claro/escuro; mascote 6 estados).
FR-21: Executar ação em aplicativo desktop Windows nativo via RPA isolado (ambiente Windows dedicado; SISCOM/Kmov; mesma política de retry/handoff).

**Total FRs (PRD): 21.**

### Non-Functional Requirements

NFR-1: Segurança (P0) — credenciais nunca no LLM (CES); RPA web sandbox Docker isolado/efêmero; RPA desktop ambiente Windows isolado; Ações Irreversíveis sob confirmação; log auditável.
NFR-2: Privacidade — dados na VPS; sem telemetria externa; caminho 100% local via Ollama (LGPD).
NFR-3: Confiabilidade — 24/7; retry/escalonamento; sem avanço silencioso após erro.
NFR-4: Concorrência — serialização por conversa; conversas distintas em paralelo.
NFR-5: Observabilidade — logs em tempo real por execução/Bloco (WebSocket <~2s); trilha auditável.
NFR-6: Custo — seleção de Modelo por Bloco torna o trade-off visível.
NFR-7: Portabilidade/Deploy — Docker Compose (Linux) num comando + ambiente Windows para RPA desktop.
NFR-8: Usabilidade/Marca — brand book (paleta/tipografia/temas); voz da marca no texto de interface; WCAG 2.1 AA.

**Total NFRs (PRD): 8.**

### Additional Requirements

- Constraints/Guardrails (§10): Evolution API viola ToS do WhatsApp (risco de banimento assumido; Canal plugável para migração à Cloud API); Ações Irreversíveis com confirmação; CES P0; custo de LLM visível; ambiente Windows para RPA desktop.
- Dependências/Integrações (§11): 5 Providers de LLM; Evolution API (Evolution Go); Telegram Bot API; RPA web (Playwright + motor OSS); RPA desktop (UI Automation Windows + ambiente Windows); Docker/Compose, PostgreSQL (+pgvector futuro).
- Spikes de arquitetura (§12): modelo padrão da IA Arquiteta; biblioteca(s) de RPA web + abordagem desktop.

### PRD Completeness Assessment

- PRD **final v2**, passou por reconciliação de insumos + revisões adversarial/edge-case/rubrica; questões em aberto do §12 fechadas (viraram spikes de arquitetura). Vocabulário ancorado em Glossário; FRs numerados globalmente; pressupostos indexados (§13). **Alta completude e clareza.**
- ⚠️ **Achado de rastreabilidade (a validar nos próximos passos):** o `epics.md` contém um **FR-22** (Bloco de Ação HTTP/API genérico) **não presente no PRD** — introduzido como decisão durante a criação de épicos nesta sessão. Recomendação: refletir FR-22 no PRD (via `bmad-prd update`) para fechar a rastreabilidade PRD↔Épicos.
- Pressupostos `[ASSUMPTION]` ainda a confirmar (alvos de SM, estatísticas de mercado §9) — não bloqueiam implementação.

## Epic Coverage Validation

### Coverage Matrix

| FR | Requisito (PRD) | Cobertura nos Épicos | Status |
|----|-----------------|----------------------|--------|
| FR-1 | NL→Harness pela IA Arquiteta | Epic 1 · Story 1.4 | ✓ Covered |
| FR-2 | Apresentar Harness bloco a bloco | Epic 1 · Story 1.7 | ✓ Covered |
| FR-3 | Decidir por Bloco (aprovar/trocar/repensar) | Epic 1 · Story 1.8 | ✓ Covered |
| FR-4 | Selecionar Modelo por Bloco | Epic 1 · Story 1.8 | ✓ Covered |
| FR-5 | Runtime: sequência, estado, retry | Epic 2 · Story 2.2 | ✓ Covered |
| FR-6 | Modo de Teste com dados simulados | Epic 2 · Story 2.5 | ✓ Covered |
| FR-7 | RPA web isolado | Epic 5 · Story 5.2 | ✓ Covered |
| FR-8 | Verificação visual por LLM | Epic 5 · Stories 5.1, 5.4 | ✓ Covered |
| FR-9 | Provider Abstraction multi-LLM | Epic 1 · Story 1.3 | ✓ Covered |
| FR-10 | Gatilho/envio Evolution + Telegram | Epic 4 · Story 4.1 | ✓ Covered |
| FR-11 | CES: credenciais isoladas do LLM | Epic 3 · Stories 3.1, 3.2 | ✓ Covered |
| FR-12 | Publicar e operar 24/7 | Epic 3 · Stories 3.3, 3.4 | ✓ Covered |
| FR-13 | Confirmação de Ação Irreversível | Epic 3 · Story 3.5 | ✓ Covered |
| FR-14 | Construir/revisar por chat + cards | Epic 1 · Stories 1.6, 1.7, 1.8 | ✓ Covered |
| FR-15 | Memória por conversa | Epic 2 · Story 2.3 | ✓ Covered |
| FR-16 | Ordenação/concorrência por conversa | Epic 4 · Story 4.2 | ✓ Covered |
| FR-17 | Resiliência de Provider (failover) | Epic 4 · Story 4.3 | ✓ Covered |
| FR-18 | Resiliência de Canal | Epic 4 · Story 4.4 | ✓ Covered |
| FR-19 | Confirmação robusta (24h/painel) | Epic 3 · Story 3.5 | ✓ Covered |
| FR-20 | Identidade visual + estados | Epic 1 · Story 1.5 | ✓ Covered |
| FR-21 | RPA desktop Windows nativo | Epic 5 · Story 5.3 | ✓ Covered |

### Missing Requirements

- **FRs do PRD não cobertos:** **nenhum** — todos os 21 FRs têm caminho de implementação rastreável. ✅
- **FR em épicos NÃO presente no PRD (rastreabilidade inversa):** **FR-22** (Bloco de Ação HTTP/API genérico) → Epic 4 · Story 4.5. Decisão consciente desta sessão; **não é lacuna de cobertura**, mas deve ser refletido no PRD para fechar a rastreabilidade bidirecional.

### Coverage Statistics

- Total PRD FRs: **21**
- FRs cobertos nos épicos: **21**
- Percentual de cobertura: **100%**
- FRs adicionais nos épicos (fora do PRD): **1** (FR-22 — a refletir no PRD)

## UX Alignment Assessment

### UX Document Status

**Found** — `DESIGN.md` (identidade visual, tokens, 9 componentes, taxonomia dos 7 Tipos de Bloco) + `EXPERIENCE.md` (arquitetura de informação, padrões de estado, acessibilidade, fluxos). Ambos com status `final`. Mockups HTML (Builder/Operação/Modo de Teste) + reviews de a11y/rubrica.

### UX ↔ PRD Alignment

- ✅ **Jornadas alinhadas:** UJ-1 (conversacional WhatsApp) e UJ-2 (RPA) do EXPERIENCE.md espelham exatamente as UJs do PRD §2.3.
- ✅ **Surface closure:** a tabela "necessidade (PRD) → surface → fluxo" mapeia FR-1…FR-13/FR-18 a telas concretas; nenhuma necessidade do PRD ficou sem surface.
- ✅ **Glossário:** UI usa os termos exatos do PRD (Harness, Bloco, Modelo de IA, Canal, Modo de Teste).
- ✅ **NFR de marca/acessibilidade:** WCAG 2.1 AA tratado como requisito comprometido (não suposição), coerente com PRD §8.

### UX ↔ Architecture Alignment

- ✅ **Stack de UI coerente:** shadcn/ui + Tailwind, Next.js 16/React 19 (App Router, segmentos `(builder)`/`(operations)`), ReactFlow — exatamente as decisões da arquitetura.
- ✅ **Tempo real:** "streaming via WebSocket <~2s" do EXPERIENCE.md casa com o Gateway (Fastify 5 + WebSocket) e os eventos `execution.*` da arquitetura.
- ✅ **Segurança como experiência:** CredentialPrompt/Trust/“nunca exibir segredo” refletem CES + Trust Engine da arquitetura.

### Alignment Issues / Warnings

- ⚠️ **Lacuna de UX para FR-22 (novo):** as spines e mockups **não especificam a surface de configuração de um Bloco de Ação HTTP** (método/URL/headers/body/auth). Como FR-22 nasceu nesta sessão, a **Story 4.5** precisará de definição de UX para esse formulário (ou herdar o padrão genérico de inspetor de Bloco). **Não-bloqueador**, mas registrar.
- ⚠️ **Itens `[ASSUMPTION]` da UX pendentes de confirmação** (não-bloqueadores): escala de spacing base-4, densidade média-alta, layout de 3 zonas, família de ícones (Lucide), e o **mapa de cor por Tipo de Bloco** no BlockCard. Recomenda-se confirmar antes/junto das stories 1.5/1.7.
- ✅ **Cobertura de mockups:** telas-chave mockadas; surfaces spine-only (Harnesses, Workspace, Notificações) reconhecidas como "construir a partir das tabelas" — aceitável.

**Veredito UX:** alinhamento **forte** com PRD e Arquitetura; apenas 1 lacuna nova (UX do FR-22) e confirmações de pressupostos — ambos não-bloqueadores.

## Epic Quality Review

Validação rigorosa contra os padrões de create-epics-and-stories (valor de usuário · independência · dependências · sizing · AC · timing de tabelas).

### Compliance por épico

| Épico | Valor de usuário | Independente | Sizing | Sem dep. futura | Tabelas just-in-time | AC claras | Rastreável a FRs |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Epic 1 | ✅ (gera Harness) | ✅ standalone | ⚠️ pesado (8) | ✅ | ✅ (1.2) | ✅ | ✅ |
| Epic 2 | ✅ (testar) | ✅ usa E1 | ✅ | ✅ | ✅ (2.1) | ✅ | ✅ |
| Epic 3 | ✅ (publicar/operar) | ✅ usa E1–2 | ✅ | ✅ | ✅ (3.1) | ✅ | ✅ |
| Epic 4 | ✅ (UJ-1 produção) | ✅ usa E1–3 | ✅ | ✅ | n/a | ✅ | ✅ |
| Epic 5 | ✅ (UJ-2 RPA) | ✅ usa E1–3 | ✅ | ✅ | n/a | ✅ | ✅ |

- **Sem épicos técnicos sem valor.** A fundação está embutida na Story 1.1 (padrão de starter template exigido), não num "épico de infra".
- **Independência:** nenhum épico requer um futuro; E4 e E5 dependem só de E3 (CES) — backward. ✓
- **Dependências intra-épico:** verificadas história a história — todas usam apenas as anteriores. **Zero forward dependencies.** ✓
- **Timing de tabelas:** criação incremental (1.2 domínio · 2.1 execução/conversa · 3.1 credenciais) — **não** tudo de uma vez. ✓ (padrão correto)
- **Starter template:** arquitetura especifica Bun+Turborepo → **Story 1.1** cobre init/deps/config/CI. ✓ Greenfield com setup + CI cedo. ✓

### 🔴 Violações Críticas
- **Nenhuma.** Sem épicos técnicos, sem dependências futuras, sem stories do tamanho de um épico.

### 🟠 Problemas Maiores
- **Nenhum.** ACs específicas e testáveis (incluindo erro/edge: retry n/3, handoff 2FA, timeout 24h, reconexão WS).

### 🟡 Preocupações Menores (recomendações, não bloqueiam)
1. **Stories enabler sem valor de usuário direto** — 1.2, 2.1 (schema) e 3.1 (CES backend) são habilitadoras, não "user stories". São **corretamente escopadas** (criam só o necessário) e inevitáveis. *Opção:* manter como enablers explícitos, **ou** fundir o schema na primeira story consumidora. Recomendo **manter** (clareza de sequência) — apenas registrar que são enablers.
2. **Epic 1 é front-loaded (8 stories)** — agrega fundação + provider + IA Arquiteta + design system + builder + cards + aprovação. Cada story é individualmente bem dimensionada, mas o épico concentra carga. *Recomendação:* tratar como **dois trilhos paralelos** (backend 1.1–1.4 · UI 1.5–1.8) na execução; a numeração linear subestima a paralelização (1.5 depende só de 1.1, não de 1.4).
3. **Spikes como pré-requisitos de stories específicas** — 1.4 (modelo da IA Arquiteta), 5.2 (lib RPA web) e 5.3 (abordagem desktop + ambiente Windows) dependem de spikes da arquitetura. Não são forward-deps de story, mas **bloqueiam** essas stories. *Recomendação:* registrar os 3 spikes como tarefas de pré-trabalho no backlog/sprint para não serem esquecidos.
4. **Lacuna de UX do FR-22** (repete do passo 4) — Story 4.5 precisa de definição de UX do formulário de Ação HTTP.
5. **`apps/gateway` tocado em E2 (WS-streaming) e E4 (webhooks)** — overlap incidental em subdiretórios distintos (`ws/` vs `webhooks/`), não churn do mesmo arquivo; E2 primeiro, sem dependência reversa. Aceitável.

### Remediação sugerida (priorizada)
- **Antes de codar 1.4/5.2/5.3:** resolver os 3 spikes da arquitetura (registrá-los no sprint).
- **Fechar rastreabilidade:** refletir **FR-22** no PRD (`bmad-prd update`) e definir a UX do Bloco de Ação HTTP.
- **Confirmar `[ASSUMPTION]`s da UX** (spacing/densidade/ícones/cor por Tipo de Bloco) antes de 1.5/1.7.
- **Opcional:** decidir se as stories de schema permanecem enablers ou são fundidas.

## Summary and Recommendations

### Overall Readiness Status

**✅ READY** — pronto para iniciar a implementação (Fase 4).

Fundamentos sólidos: PRD final v2 com alta completude, Arquitetura `complete` com starter template e sequência de implementação, UX `final` alinhada a PRD e Arquitetura, e Épicos com **cobertura de 100% dos FRs (21/21)**, organizados por valor de usuário, sem dependências futuras e com criação de tabelas just-in-time. **Zero achados críticos ou maiores.**

### Critical Issues Requiring Immediate Action

- **Nenhum.** Não há bloqueadores para iniciar a implementação.

### Pré-trabalho recomendado (antes de stories específicas, não bloqueia o início)

- **3 Spikes de arquitetura** — resolver antes das stories dependentes: (1) modelo padrão da IA Arquiteta → antes da **1.4**; (2) lib de RPA web (Stagehand/Playwright MCP) → antes da **5.2**; (3) abordagem RPA desktop (FlaUI vs visão) + formato do ambiente Windows → antes da **5.3**. A **Story 1.1 não depende de nenhum spike** — pode começar já.

### Recommended Next Steps

1. **Iniciar pela Story 1.1** (scaffold do monorepo) — sem dependências, sem spike; via `bmad-create-story` → `bmad-dev-story`.
2. **Fechar rastreabilidade do FR-22** — refletir o Bloco de Ação HTTP/API no PRD (`bmad-prd update`) e definir a UX do formulário (herdar inspetor genérico de Bloco ou especificar).
3. **Registrar os 3 spikes no sprint** como tarefas de pré-trabalho (`bmad-sprint-planning`), para não bloquearem 1.4/5.2/5.3 quando chegarem.
4. **Confirmar os `[ASSUMPTION]` da UX** (spacing/densidade/ícones Lucide/cor por Tipo de Bloco) antes de 1.5/1.7.
5. **(Opcional)** decidir o tratamento das stories de schema (enablers explícitos vs. fundidas na consumidora).

### Final Note

Esta avaliação identificou **0 problemas críticos**, **0 maiores** e **5 preocupações menores** (mais 1 nota de rastreabilidade do FR-22 e confirmações de pressupostos de UX), distribuídas em 4 categorias (completude do PRD, rastreabilidade, alinhamento de UX, qualidade dos épicos). Nenhum é bloqueador. Os artefatos estão prontos para implementação — endereçar os itens acima **eleva a qualidade** e fecha a rastreabilidade, mas você pode prosseguir com a Story 1.1 imediatamente.

---

**Assessor:** Product Manager (BMad Implementation Readiness) · **Data:** 2026-06-14 · **Projeto:** RobbIA
