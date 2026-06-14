# Addendum — PRD RobbIA (MVP)

Profundidade técnica, rationale e alternativas que **não** pertencem ao corpo do PRD (capacidades), mas alimentam Arquitetura / Solution Design / UX. Capturado durante a facilitação.

## A. Arquitetura (referência)
A arquitetura em 4 camadas (Provider Abstraction, Agent Runtime, RPA Engine, Harness UI) e a stack recomendada estão em [docs/product-vision-architecture.md](../../../../docs/product-vision-architecture.md) §3 e §8. Stack-alvo: **Bun + TypeScript**, **PostgreSQL + Drizzle (+ pgvector quando memória entrar)**, **Next.js 15 / React 19 + ReactFlow**, **pg-boss**, **Fastify + WebSocket**, **Docker Compose**. Não repetir no PRD.

## B. Decisão: WhatsApp via Evolution API (Evolution Go) em vez de Meta Cloud API
- **Escolha do dono (Marcio).** Diverge do doc de arquitetura (que citava Meta Cloud API).
- **Por quê:** setup mais simples e barato, sem verificação de conta business nem aprovação de número/template pela Meta; popular no mercado BR de automação.
- **Custo/risco:** API **não-oficial** → viola ToS do WhatsApp → risco de **banimento de número**. Sem garantias de estabilidade de API.
- **Mecanismo de mitigação:** manter a camada de **Canal plugável** (mesma interface para Gatilho/Ação) de modo que migrar para a Cloud API oficial — ou rodar ambas — não exija reescrever Harnesses. Número dedicado/descartável em teste.

## C. Decisão: RPA no MVP — construir vs. integrar
- **Escolha do dono:** RPA **dentro** do MVP (override do roadmap, que punha na Fase 2).
- **Recomendação da pesquisa:** **integrar/embutir** motor OSS resiliente a DOM em vez de construir do zero. Candidatos:
  - **Skyvern** (OSS, levantou US$2,7M) — mapeia elementos visuais→ações; resiliente a mudança de layout.
  - **Stagehand** (Browserbase) — primitivas `act/extract/observe/agent` em NL, re-engaja o LLM quando o DOM muda.
  - **browser-use** (OSS, Python) — maior comunidade.
  - **Padrão emergente:** **Playwright MCP** (mar/2025) + **Playwright Agents** (out/2025) como camada de orquestração LLM↔Playwright.
- **Valor RobbIA:** não é *ter* RPA, e sim **orquestrá-lo dentro do Harness gerado pela IA Arquiteta + isolamento de credenciais (CES)** — coisa que as bibliotecas acima (não-produtos, sem multi-cliente) não entregam.
- **Escopo decidido: RPA AMPLO no MVP** (multi-página, formulários, upload/download, scraping). Critério de decisão = qualidade/resiliência da solução, **não** prazo.
- **Decisões da Update v2 (2026-06-14):**
  - **Construir vs. integrar → INTEGRAR** motor OSS resiliente (web: Stagehand/Skyvern + Playwright MCP). Lib final = spike de arquitetura.
  - **Sistemas-alvo (decisão do dono):** ERP (Totvs/SAP/web), portal gov (SEFAZ/prefeitura), e-commerce, CRM/web genérico **e desktop Windows nativo** (SISCOM, Kmov). Define o denominador de SM-4.

## C.1 RPA Desktop Windows (nova modalidade — Update v2)
- **Decisão do dono:** o RPA do MVP cobre **duas modalidades** — web (Playwright) **e desktop Windows nativo** (janelas de `.exe`). Motivado por sistemas legados desktop do domínio do dono (SISCOM, Kmov) que não têm interface web.
- **Playwright não cobre desktop.** Opções técnicas a avaliar no spike de arquitetura:
  - **Baseada em visão / computer-use:** o LLM enxerga a tela e controla mouse/teclado (Claude computer use, OmniParser, etc.). Resiliente a UIs sem árvore de acessibilidade; mais custosa por exigir visão a cada passo.
  - **APIs de acessibilidade Windows (UI Automation):** pywinauto, FlaUI, UIA — determinística e rápida quando o app expõe a árvore UIA; frágil em apps que não a expõem (ex.: telas custom/Win32 antigas).
  - Provável **abordagem híbrida:** UIA quando disponível, visão como fallback.
- **Sandbox/deploy:** não roda no Docker Linux. Exige **ambiente de execução Windows isolado** (VM/contêiner Windows ou nó Windows dedicado acionado pelo Runtime). A camada de RPA deve abstrair web×desktop para o Harness não saber qual motor executa o Bloco. Verificação visual (FR-8) aplica-se às duas modalidades (screenshot da janela).

## D. IA Arquiteta (mecanismo)
- Instância de LLM separada dos modelos de execução, com system prompt especializado em **decomposição de tarefas → Blocos**. É o componente nº 1 de qualidade do produto (núcleo do moat).
- Modelo padrão: frontier configurável. **Update v2:** o modelo específico (Opus vs. Sonnet vs. outro) vira **spike de arquitetura** — benchmark de qualidade de decomposição. Parser converte a saída numa estrutura de Harness (Blocos tipados + dependências).
- Medição de qualidade (SM-1) **decidida:** proxy objetivo = proporção de Blocos editados/repensados por Harness (≤20%), instrumentada como evento no fluxo de build.

## E. Provider Abstraction (mecanismo)
- Interface única; adaptadores por Provider. **Decisão do dono: 5 Providers no MVP** — Anthropic Claude, OpenAI GPT, Google Gemini, Ollama (local) e OpenRouter (agregador 200+ modelos). A pesquisa recomendava 2–3 "bem-feitos"; override consciente por amplitude/qualidade (tempo não é critério).
- **Sobreposição OpenRouter × diretos (decidido — Update v2):** **diretos para os modelos frontier** (custo/latência) e **OpenRouter para amplitude** (modelos não integrados diretamente). Normalização crítica: a saída estruturada (JSON de proposta de Bloco) precisa ser consistente entre Providers — modelos não são fungíveis; o adaptador **valida/normaliza o schema** e rejeita/recupera respostas que não validem, para a troca por Bloco não quebrar o Runtime (ver PRD FR-9).

## F. Matriz competitiva (resumo da pesquisa, 2025–26)
| Categoria | Players | Força | Lacuna que a RobbIA explora |
|---|---|---|---|
| Builders OSS de fluxo | n8n, Flowise, Langflow, Dify, Activepieces | Conectores, self-host, comunidade | Não decompõem NL→harness; usuário monta o fluxo |
| Frameworks code-first | LangGraph, CrewAI, LangChain | Orquestração para produção | Exigem engenheiro; sem UI multi-cliente, sem RPA pronto |
| No-code usuário final | Zapier, Lindy, Make | Acessibilidade, integrações | SaaS fechado, sem self-host/MIT, sem RPA real |
| RPA+LLM | Skyvern, Stagehand, browser-use, Computer-Use/CUA | Automação de navegador | São bibliotecas, não produtos multi-cliente; CUA é cloud-lock-in |

**Gap ocupado pela RobbIA:** único produto OSS self-hosted unindo (a) NL→harness, (b) RPA Playwright nativo, (c) multi-LLM sem lock-in, (d) — pós-MVP — painel multi-cliente white-label B2B2B.

## G. Segurança — por que CES é P0 (evidência da pesquisa)
Incidentes 2025–26 que tornam isolamento de credencial + sandbox requisito de confiança (não feature):
- **postmark-mcp** (set/2025): MCP malicioso reenviou 3k–15k e-mails/dia herdando chaves pré-autorizadas.
- **ClawHub/OpenClaw:** Antiy CERT confirmou ~**1.184 skills maliciosas** (maior supply-chain de agentes até hoje).
- **Shai-Hulud 2.0** (nov/2025): via `@seezo/sdr-mcp-server`, colheita de credenciais + infecção de repos.
- **Snyk:** 13,4% de ~3.984 skills com problemas críticos. **OX Security:** envenenou 9/11 registries MCP.
> Implicação: marketplace de harnesses **aberto** = importar o problema do ClawHub. Só **curado/certificado**, e pós-MVP. "Credenciais isoladas" vira pilar de marketing defensável.

## H. Estatísticas de mercado a validar (fonte primária) antes de uso público
- "62% experimentam agentes / 11% em produção"; vagas agentic **+280% YoY**; "AI Engineer" cargo de maior crescimento; escassez **3,2:1**; mercado US$7,84B (2025)→US$52,62B (2030). Origem: blogs/vendors via busca — validar em Securelist/Snyk/relatório de emprego primário.
