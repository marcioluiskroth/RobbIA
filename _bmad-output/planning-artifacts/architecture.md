---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-06-14'
inputDocuments:
  - docs/product-vision-architecture.md
  - docs/brand-book.md
  - _bmad-output/planning-artifacts/prds/prd-RobbIA-2026-06-14/prd.md
  - _bmad-output/planning-artifacts/prds/prd-RobbIA-2026-06-14/addendum.md
workflowType: 'architecture'
project_name: 'RobbIA'
user_name: 'Marcio'
date: '2026-06-14'
---

# Documento de Decisões de Arquitetura — RobbIA

_Este documento é construído de forma colaborativa, passo a passo. As seções são anexadas conforme avançamos em cada decisão arquitetural juntos._

## Análise de Contexto do Projeto

### Visão Geral dos Requisitos

**Requisitos Funcionais (29 FRs / 13 features) — Update v3 (RAG, Skills/MCP, memória híbrida elevados ao MVP):**
- Geração NL→Harness pela IA Arquiteta (FR-1, FR-2) — núcleo/moat; exige LLM dedicado + parser/validador de schema de Harness.
- Aprovação por etapa e seleção de Modelo por Bloco (FR-3, FR-4) — UI de revisão acoplada ao modelo de dados de Harness/Bloco.
- Harness Runtime: execução sequencial com estado, erro e retry; Modo de Teste (FR-5, FR-6) — motor de orquestração com persistência de estado.
- RPA dual: web/Playwright em sandbox Docker (FR-7), verificação visual por LLM (FR-8) e desktop Windows nativo em ambiente Windows isolado (FR-21).
- Provider Abstraction multi-LLM com normalização de schema (FR-9).
- Canais Evolution API + Telegram, plugáveis (FR-10).
- CES — isolamento de credenciais do LLM (FR-11).
- Deploy/operação 24/7 + Trust Engine (FR-12, FR-13).
- Harness UI: chat + cards + fluxo visual + identidade de marca (FR-14, FR-20).
- Memória por conversa + **híbrida (dense+sparse) e perfis globais** (FR-15, FR-29).
- **Conhecimento (RAG):** ingestão/indexação (`pgvector`), recuperação semântica no Bloco Contexto, embeddings via Provider (FR-23, FR-24, FR-25).
- **Skills & Connectors:** catálogo built-in (`SKILL.md`+`TOOLS.json`) + camada **MCP** de 1 clique; IA Arquiteta ciente do catálogo (FR-22, FR-26, FR-27, FR-28).
- Concorrência/resiliência: ordenação por conversa, failover de Provider, resiliência de Canal, confirmação robusta (FR-16–FR-19).

**Requisitos Não-Funcionais (direcionadores de arquitetura):**
- Segurança (P0): credenciais nunca no LLM (CES); sandbox dual isolado e efêmero; ações irreversíveis sob confirmação; log auditável.
- Privacidade: dados na VPS do usuário; sem telemetria externa; caminho 100% local via Ollama (LGPD).
- Confiabilidade: 24/7, retry/backoff, sem avanço silencioso após erro.
- Concorrência: serialização por conversa; conversas paralelas.
- Observabilidade: logs por execução/Bloco em tempo real (WebSocket, <~2s), trilha de decisão auditável.
- Custo: seleção de Modelo por Bloco torna o trade-off visível.
- Portabilidade/Deploy: Docker Compose (Linux) + ambiente de execução Windows para RPA desktop.
- Usabilidade/Marca: paleta e tipografia do brand book, temas claro/escuro, WCAG 2.1 AA.

**Escala e Complexidade:**
- Domínio primário: full-stack TypeScript (monorepo) — backend de orquestração + infra de RPA + UI realtime.
- Nível de complexidade: Alto.
- Componentes arquiteturais estimados: ~8–10 (Provider Abstraction, Agent Runtime, RPA Engine web, RPA Engine desktop, CES, Gateway de Canais, IA Arquiteta + parser, Harness UI, camada de persistência/memória, observabilidade).

### Restrições e Dependências Técnicas
- Stack-alvo (addendum/docs): Bun + TypeScript, PostgreSQL + Drizzle (+ pgvector), Next.js 15/React 19 + ReactFlow, pg-boss, Fastify + WebSocket, Docker Compose.
- Evolution API (WhatsApp não-oficial): risco de ToS/banimento → camada de Canal plugável para migração à Cloud API oficial.
- RPA desktop exige ambiente Windows (host/VM/contêiner/nó dedicado), distinto do sandbox Docker Linux.
- 5 Providers de LLM com saída não-fungível → adaptador valida/normaliza schema.
- Spikes pendentes (do PRD §12): modelo padrão da IA Arquiteta; biblioteca(s) de RPA web e abordagem desktop Windows; **modelo de embedding + estratégia de chunking + busca híbrida (RAG/memória)**; **SDK/runtime MCP (isolamento das tools + mapeamento tool→Skill)**.

### Preocupações Transversais Identificadas
- Isolamento de credenciais (CES) atravessa todos os Blocos que autenticam.
- Abstração multi-LLM + normalização de schema entre Providers.
- Concorrência/ordenação por conversa e resiliência/failover (Provider, Canal, confirmação).
- Observabilidade/auditoria em tempo real.
- Sandbox dual (Linux + Windows) orquestrado por um único Runtime.
- Plugabilidade (Canal e modalidade de RPA) para evolução pós-MVP (multi-tenancy B2B2B).
- Visibilidade e controle de custo por Bloco.

## Avaliação de Starter Template

### Domínio Tecnológico Primário
Full-stack TypeScript em monorepo multi-app + packages (backend de orquestração + infra de RPA + UI realtime).

### Opções Consideradas
- **create-t3-turbo** (pnpm + Turborepo, Next 15/React 19, Expo, Supabase, tRPC): rico, MIT, popular — porém traz Expo (mobile só na Fase 5), Supabase (contraria self-host Postgres próprio), pnpm (não Bun) e tRPC. Encaixe parcial; bagagem a remover.
- **Nx**: monorepo poderoso e opinativo, com geradores; overhead e curva altos — overkill para o MVP.
- **Bun workspaces + Turborepo (scaffold próprio)**: alinhado à stack-alvo e à estrutura multi-app/packages, sem bagagem. ("Low-Overhead Stack 2026": Bun 1.3 + Turborepo + Biome.)

### Starter Selecionado: Bun workspaces + Turborepo 2.x (scaffold próprio)

**Justificativa:** a arquitetura da RobbIA (apps web/runtime/gateway + 7 packages) não é servida por um starter de app único; um scaffold de monorepo dá controle total e zero bagagem, alinhado à stack documentada e ao self-host MIT.

**Comando de inicialização (primeira story de implementação):**
```bash
# 1. Monorepo base
mkdir robbia && cd robbia
bun init -y
# habilitar workspaces em package.json: "workspaces": ["apps/*", "packages/*"]
bun add -d turbo@^2 @biomejs/biome@^2

# 2. App web (Harness UI)
bun create next-app@latest apps/web   # Next.js 16, React 19, App Router, TS, Tailwind

# 3. Demais apps/packages como libs Bun + TS
#    apps/runtime, apps/gateway, packages/{architect,provider,rpa-engine,memory,skills,mcp-adapters,ces}
```

**Decisões arquiteturais estabelecidas pela fundação:**
- **Linguagem & Runtime:** TypeScript em todo o monorepo; Bun 1.3.x como runtime/PM/test runner.
- **Orquestração de monorepo:** Turborepo 2.x (pipelines com dependsOn + cache); Bun workspaces (`workspace:*`).
- **Estilo/UI:** Next.js 16 + React 19 (App Router, Server Components, streaming) + Tailwind + Shadcn/ui + ReactFlow.
- **Lint/Format:** Biome 2.x (substitui ESLint+Prettier; mais rápido).
- **Banco/ORM:** PostgreSQL + Drizzle (+ pgvector quando memória híbrida entrar).
- **Backend:** Fastify 5.x + WebSocket (gateway); pg-boss para filas/jobs.
- **Deploy:** Docker Compose (núcleo Linux) + nó/ambiente Windows para RPA desktop.

**Atualização de versão:** subir Next.js de 15 (docs) para **16** (estável atual). Demais versões conforme tabela verificada (jun/2026): Bun 1.3.x, Turborepo 2.x, React 19.2.x, Drizzle 0.45.x, Fastify 5.8.x, Biome 2.2.x.

**Nota:** a inicialização por estes comandos deve ser a primeira story de implementação.

## Decisões de Arquitetura Centrais

### Análise de Prioridade
**Críticas (bloqueiam implementação):** motor de execução do Harness; orquestração cross-ambiente do RPA; CES; modelo de dados do Harness; Provider Abstraction.
**Importantes (moldam a arquitetura):** abordagem do RPA web e desktop; estratégia de WebSocket/observabilidade; validação de schema; **pipeline de RAG (chunking/embedding/`pgvector`) e busca híbrida**; **runtime MCP (tool→Skill) e catálogo de Skills**.
**Adiadas (pós-MVP):** multi-tenancy/RLS; marketplace público de Skills/harnesses; engine proativo.

### Arquitetura de Dados
- **Modelo de domínio:** `Harness` → `Block[]` (tipado por Tipo de Bloco) com dependências; `Execution` + `ExecutionStep` (estado e I/O por Bloco, base de retry/replay e do Modo de Teste); `Conversation` + `Message` (memória por conversa — FR-15, isolada); `Credential` (apenas referência; segredo vive no CES); `Provider`/`ModelConfig`.
- **Conhecimento/RAG (FR-23/24):** `KnowledgeBase` (por agente/Workspace) → `Document` → `Chunk` (`embedding vector`, via `pgvector`) com atribuição de fonte; índice de busca **híbrida** (vetorial + lexical).
- **Memória híbrida/global (FR-29):** `MemoryProfile` (por cliente/usuário, entre conversas) + memória vetorial em `pgvector`; isolada por Workspace.
- **Skills/MCP (FR-26/27):** `Skill` (catálogo built-in + tools MCP) com schema de tool validável; `Connector` (servidor MCP conectado; segredo via CES).
- **Validação:** Zod v4 em todas as fronteiras — webhook de Canal, **saída estruturada do LLM** (normalização entre Providers, FR-9) e schema de proposta de Harness (FR-1).
- **ORM/Migrations:** Drizzle + Drizzle Kit. **`pgvector` no MVP** (RAG/Conhecimento FR-23/24 e memória híbrida FR-29); dimensão do vetor registrada por índice (troca de modelo de embedding sem corromper o store).

### Autenticação e Segurança
- **Auth:** single-admin no MVP (sessão do arquiteto no Workspace).
- **CES — microsserviço dedicado (P0):** processo separado guarda credenciais com **envelope encryption (AES-GCM)**; chave mestra fora do banco (env/secret do host). Credenciais são injetadas apenas no worker de execução (RPA/Ação) em runtime — **nunca** em prompt, log ou resposta do LLM (FR-11). Detecta falha de auth em runtime → sinaliza re-credenciamento.
- **Redaction:** screenshots capturados pós-autenticação; campos sensíveis mascarados antes de irem ao LLM (FR-8).
- **Trust Engine:** política por Bloco/Harness; Ações Irreversíveis exigem confirmação (FR-13), com timeout 24h → cancela/enfileira (FR-19).

### API e Padrões de Comunicação
- **Gateway (Fastify 5 + WebSocket):** recebe webhooks dos Canais (Evolution API, Telegram) e faz streaming de logs/estado à UI (<~2s).
- **pg-boss como espinha dorsal de mensageria/jobs:** desacopla Gateway → Runtime → workers. Tipos de job: `harness.execute`, `rpa.web`, `rpa.desktop`, `action.*`.
- **Concorrência por conversa (FR-16):** serialização via fila/lock por `conversationId` (singleton/advisory lock); conversas distintas em paralelo.
- **Contrato de erro:** resultado discriminado `{ ok } | { error, retriable }`; distingue transitório (retry/backoff) de permanente (escala) — FR-17.

### Motor de Execução do Harness (Runtime)
- **Decisão: pg-boss + máquina de estado própria, persistida em Postgres.** Mínima infra (alinha ao self-host "um Docker Compose"). Cada `Execution` avança Bloco a Bloco com estado durável; falha aplica retry (3x, backoff exp.) e, esgotado, marca erro sem completar Ação Irreversível (FR-5).
- **Resiliência:** failover de Provider via Modelo de fallback por Bloco (FR-17); retenção/replay de mensagens de Canal em fila na indisponibilidade (FR-18); confirmação robusta independente de um único Canal (FR-19).

### RPA — Orquestração Cross-Ambiente
- **Decisão: fila (pg-boss) como espinha.** O Runtime (Linux) enfileira jobs de RPA; workers consomem por tipo e devolvem resultado/screenshot. Desacopla os ambientes heterogêneos e dá replay/retenção de graça.
- **RPA web:** worker em **Docker Linux** isolado (rede restrita, efêmero) usando **Stagehand 2.0** (SDK TS: act/extract/observe/agent) sobre Playwright + **Playwright MCP** (snapshot da árvore de acessibilidade — mais previsível que pixels). Cobre multi-página, formulários, upload/download, scraping (FR-7).
- **RPA desktop:** **worker no nó Windows** consumindo a mesma fila. Motor **FlaUI (.NET, Windows UI Automation/UIA3)** = determinístico em Win32/WinForms/WPF (legados como SISCOM/Kmov); **fallback de visão/computer-use** quando o app não expõe árvore UIA (FR-21). Cliente de fila em processo TS (Bun) acionando o helper FlaUI .NET via IPC/CLI.
- **Verificação visual (FR-8):** aplica-se a ambas as modalidades (screenshot da página/janela → veredito estruturado do LLM).

### Provider Abstraction (multi-LLM)
- Interface única; adaptadores por Provider (Claude, GPT, Gemini, Ollama, OpenRouter). Diretos p/ frontier (custo/latência), OpenRouter p/ amplitude. **Normalização de schema** (Zod) valida/recupera saída antes do Runtime (FR-9). Modelo da IA Arquiteta = spike de benchmark.
- **Embeddings (FR-25):** a interface de Provider ganha `embed()` (além de `complete`/`completeStructured`); modelo de embedding configurável, com caminho 100% local (Ollama). Usado por RAG (FR-23/24) e memória híbrida (FR-29).

### Frontend (Harness UI)
- Next.js 16 (App Router, Server Components, streaming) + React 19. **TanStack Query v5** para estado de servidor; estado do builder (chat+cards) local + WebSocket para execução ao vivo. **ReactFlow** para a vista de fluxo (complementar). Tailwind + Shadcn/ui; temas claro/escuro e estados do mascote (FR-20, brand book).

### Infra e Deploy
- Núcleo (web, gateway, runtime, ces, rpa-web, postgres) via **Docker Compose (Linux)**. **Nó Windows** separado para o worker de RPA desktop (host/VM/contêiner Windows), conectado à fila/Postgres. Observabilidade: logs estruturados + trilha de decisão auditável persistida; streaming via WebSocket.

### Sequência de Implementação (decisões → ordem)
1. Scaffold do monorepo (story de init) + schema Drizzle (domínio do Harness).
2. Provider Abstraction + normalização de schema.
3. IA Arquiteta (decomposição NL→Harness) + parser/validador.
4. Harness Runtime (máquina de estado pg-boss) + Modo de Teste.
5. CES + Trust Engine.
6. Gateway de Canais (Evolution + Telegram) + WebSocket.
7. RPA web (Stagehand/Playwright MCP em Docker).
8. RPA desktop (worker Windows FlaUI + fallback visão).
9. Harness UI (chat+cards+ReactFlow) + memória por conversa + resiliência (FR-16–19).
10. **Skills & Connectors:** catálogo built-in (`packages/skills`) + Ação HTTP (FR-22/26); camada MCP (`packages/mcp-adapters`, FR-27) + consciência de Skills na IA Arquiteta (FR-28).
11. **Conhecimento (RAG):** `embed()` no Provider (FR-25) → `packages/knowledge` (ingestão/chunking/index `pgvector`, FR-23) → recuperação no Bloco Contexto (FR-24).
12. **Memória híbrida/global:** busca híbrida (dense+sparse) + perfis persistentes (FR-29) em `packages/memory`.

### Dependências Cruzadas
- pg-boss é dependência central (Runtime + RPA + Gateway) — definir contratos de job cedo.
- CES é pré-requisito de qualquer Bloco que autentique (RPA/Ação).
- Normalização de schema do Provider habilita troca de Modelo por Bloco sem quebrar Runtime.
- Worker Windows depende do contrato de job de RPA e do CES para credenciais.

## Padrões de Implementação e Regras de Consistência

### Pontos de Conflito Identificados
~6 áreas onde agentes de IA poderiam divergir: nomenclatura (DB/API/código), estrutura do monorepo, formato de resposta/erro, nomes de jobs/eventos, logging e tratamento de erro/estado.

### Padrões de Nomenclatura

**Banco de dados (Postgres/Drizzle):**
- Tabelas: `snake_case` no **plural** — `harnesses`, `blocks`, `executions`, `execution_steps`, `conversations`, `messages`, `credentials`, `providers`.
- Colunas: `snake_case` — `created_at`, `harness_id`. PK: `id` (**UUID v7**, ordenável). FK: `<entidade>_id`. Índices: `idx_<tabela>_<colunas>`.
- Modelos Drizzle em `camelCase` mapeando colunas `snake_case`. Timestamps: `timestamptz` (UTC).

**API / mensageria:**
- Endpoints REST: recurso no **plural**, kebab — `/harnesses`, `/executions/:id`. Param de rota `:id`.
- Campos JSON: **camelCase** (nativo TS). Datas: **ISO 8601 (UTC)**. Booleanos `true/false`. `null` (não `undefined`) na fronteira.
- Jobs pg-boss: `dominio.acao` minúsculo pontuado — `harness.execute`, `rpa.web`, `rpa.desktop`, `action.send`.
- Eventos WebSocket: `dominio.evento` — `execution.step.updated`, `execution.completed`, `agent.state.changed`.

**Código:**
- Arquivos: `kebab-case` — `harness-runtime.ts`, `block-card.tsx`. Componentes React: `PascalCase`. Funções/variáveis: `camelCase`. Tipos/interfaces: `PascalCase`. Constantes: `UPPER_SNAKE`.
- Schemas Zod: `XxxSchema`; tipo inferido `Xxx` (`type Harness = z.infer<typeof HarnessSchema>`).
- Adaptadores de Provider: `XxxProvider implements LLMProvider`.

### Padrões de Estrutura
- Monorepo: `apps/*` (web, runtime, gateway) + `packages/*` (architect, provider, rpa-engine, memory, skills, mcp-adapters, ces) + `packages/shared` (`@robbia/shared`: tipos, schemas Zod, contratos de job).
- Cada package exporta por **barrel** `src/index.ts`. Dentro de packages: organização por domínio; dentro de `web`: por segmento do App Router (feature).
- Testes **co-localizados** `*.test.ts` (Bun test runner); e2e em `apps/web/e2e`.
- Env validado por Zod no boot (`env.ts` por app); segredos nunca em `.env` versionado.

### Padrões de Formato
- **Resultado discriminado** (todas as fronteiras de serviço): `{ ok: true, data } | { ok: false, error: { code, message, retriable } }`. Sem wrapper genérico solto.
- HTTP externo (webhooks/UI): status code semântico + corpo no padrão de resultado.

### Padrões de Comunicação
- **Payloads de job/evento** sempre tipados e validados por Zod; incluem `correlationId`, e quando aplicável `conversationId`/`executionId`/`blockId`.
- **Logs estruturados** (JSON, estilo pino): níveis `debug|info|warn|error`; campos obrigatórios `ts, level, service, correlationId`. **Proibido logar segredos/credenciais** (CES) ou conteúdo redatado.

### Padrões de Estado (Frontend)
- Estado de servidor via **TanStack Query** (query keys em array: `['harness', id]`); atualizações imutáveis. Estado efêmero da UI em React local. Execução ao vivo via WebSocket → atualiza cache. Sem mutação direta.

### Padrões de Processo
- **Validação:** "parse, don't validate" — Zod em toda fronteira (webhook, saída do LLM, schema de Harness).
- **Erro:** retornar resultado tipado nas fronteiras; `throw` só para excepcional; mapear para resultado na borda. Distinguir `retriable` (transitório → retry/backoff) de permanente (escala) — FR-17.
- **Loading:** estados explícitos `idle|loading|success|error` (via Query).
- **Retry:** política única central (3x, backoff exp.) reutilizada por Runtime e workers.

### Diretrizes de Enforcement
**Todo agente de IA DEVE:**
- Usar TypeScript `strict` (sem `any`); validar fronteiras com Zod; seguir as convenções acima.
- Reusar a política de retry e o contrato de resultado centrais (não reinventar).
- Nunca expor credenciais (sempre via CES) nem logá-las.
- Rodar Biome (lint+format) e `tsc` antes de concluir.

**Exemplos:**
- ✅ `executions` (tabela), `execution.completed` (evento), `HarnessSchema` (Zod), `{ ok: false, error: { code: 'PROVIDER_TIMEOUT', retriable: true } }`.
- ❌ `Execution`/`tbl_exec` (tabela), `ExecutionCompleted` (evento), `data: {...}` cru sem `ok`, `console.log(credential)`.

## Estrutura do Projeto e Fronteiras

### Árvore Completa do Monorepo

```
robbia/
├── package.json                  # workspaces: apps/*, packages/*
├── turbo.json                    # pipelines (build, dev, test, lint, typecheck)
├── biome.json                    # lint + format
├── tsconfig.base.json
├── bun.lock
├── .env.example
├── docker-compose.yml            # núcleo Linux (web, gateway, runtime, ces, rpa-web-worker, postgres)
├── docker-compose.windows.yml    # override/nó Windows (rpa-desktop-worker + host .NET)
├── .github/workflows/ci.yml      # bun install → biome → tsc → test → build
├── README.md
├── apps/
│   ├── web/                      # Harness UI — Next.js 16 / React 19
│   │   ├── app/                  # App Router (segmentos por feature)
│   │   │   ├── (builder)/        # chat + cards + ReactFlow
│   │   │   ├── (operations)/     # logs ao vivo, execuções, confirmações
│   │   │   └── api/              # rotas server (BFF leve p/ a UI)
│   │   ├── components/{ui,builder,flow,operations}/
│   │   ├── lib/{ws-client.ts,query.ts,env.ts}
│   │   └── e2e/                  # Playwright (testes e2e da UI)
│   ├── gateway/                  # Fastify 5 + WebSocket
│   │   └── src/{webhooks/,ws/,server.ts,env.ts}   # webhooks Evolution/Telegram + stream à UI
│   ├── runtime/                  # Harness Runtime — máquina de estado (consome harness.execute)
│   │   └── src/{engine/,state-machine.ts,scheduler.ts,worker.ts,env.ts}
│   ├── ces/                      # Credential Execution Service (microsserviço isolado)
│   │   └── src/{vault.ts,crypto.ts,inject.ts,server.ts,env.ts}
│   ├── rpa-web-worker/           # consome rpa.web (Docker Linux isolado, efêmero)
│   │   └── src/{worker.ts,run.ts,env.ts}
│   └── rpa-desktop-worker/       # consome rpa.desktop (Bun, roda no nó Windows)
│       └── src/{worker.ts,bridge.ts,env.ts}        # aciona o host .NET via IPC/CLI
├── packages/
│   ├── shared/                   # @robbia/shared — contratos transversais
│   │   └── src/{types.ts,schemas/,jobs.ts,events.ts,result.ts,retry.ts,logger.ts}
│   ├── db/                       # @robbia/db — Drizzle
│   │   └── src/{schema/,client.ts}  +  drizzle/ (migrations)
│   ├── architect/                # @robbia/architect — IA Arquiteta
│   │   └── src/{system-prompt.ts,decompose.ts,parser.ts,validator.ts}
│   ├── provider/                 # @robbia/provider — Provider Abstraction
│   │   └── src/{provider.ts,adapters/{claude,gpt,gemini,ollama,openrouter}.ts,normalize.ts}
│   ├── rpa-core/                 # @robbia/rpa-core — contratos RPA + verificação visual (FR-8)
│   │   └── src/{contract.ts,verify.ts}
│   ├── rpa-web/                  # @robbia/rpa-web — Stagehand 2.0 + Playwright MCP
│   │   └── src/{engine.ts,actions.ts}
│   ├── rpa-desktop/              # @robbia/rpa-desktop — cliente/bridge do host Windows
│   │   └── src/{client.ts,fallback-vision.ts}
│   ├── memory/                   # @robbia/memory — memória por conversa (FR-15)
│   │   └── src/{store.ts,retrieve.ts}
│   ├── skills/                   # @robbia/skills — catálogo de Skills (loader + invocação; SKILL.md + TOOLS.json)
│   │   └── src/{catalog.ts,invoke.ts,validate.ts}  +  builtin/
│   ├── knowledge/                # @robbia/knowledge — RAG: ingestão/chunking/embeddings/retrieval (pgvector)
│   │   └── src/{ingest.ts,chunk.ts,index.ts,retrieve.ts}
│   ├── mcp-adapters/             # @robbia/mcp-adapters — cliente MCP + ponte tool→Skill (Connectors)
│   │   └── src/{client.ts,bridge.ts}
│   └── channels/                 # @robbia/channels — Canais plugáveis
│       └── src/{channel.ts,evolution.ts,telegram.ts}
└── workers/
    └── rpa-desktop-host/         # helper .NET (FlaUI/UIA3) — roda no Windows; não-TS
        └── src/  (.csproj)
```

### Fronteiras Arquiteturais

**Fronteiras de API (externas):**
- `gateway`: webhooks de Canais (POST de Evolution/Telegram) + WebSocket (stream de execução à UI). Única superfície de entrada externa em produção.
- `web/app/api`: BFF leve da UI (CRUD de Harness, disparo de Modo de Teste).

**Fronteiras internas (via pg-boss):** todo o trabalho assíncrono cruza filas — `harness.execute` (gateway→runtime), `rpa.web`/`rpa.desktop` (runtime→workers), `action.*` (runtime→executores). Nenhum serviço chama o worker do outro diretamente.

**Fronteira de credenciais (CES):** `ces` é o único que descriptografa segredos; expõe apenas `inject(ref, ctx)` ao worker de execução. `provider`, `architect`, `runtime` e LLMs **nunca** recebem segredo. `db.credentials` guarda só referência.

**Fronteira de dados:** `packages/db` é o único acesso ao Postgres (schema + client). Outros packages recebem dados já tipados/validados (Zod). **`pgvector` no MVP** (RAG/Conhecimento e memória híbrida — FR-23/24/29); `packages/knowledge` e `packages/memory` acessam vetores via `packages/db`.

**Fronteira de ambiente (RPA):** `rpa-web-worker` (Linux/Docker) e `rpa-desktop-worker` (Windows) compartilham o contrato `rpa-core` mas vivem em ambientes separados; o `runtime` é agnóstico de qual executa.

### Mapeamento Requisitos → Estrutura
- **FR-1/FR-2 (IA Arquiteta):** `packages/architect` + `packages/provider`; UI em `apps/web/(builder)`.
- **FR-3/FR-4 (aprovação/seleção):** `apps/web/(builder)` + `packages/db` (estado do Harness).
- **FR-5/FR-6 (Runtime/Modo de Teste):** `apps/runtime` (engine + state-machine).
- **FR-7/FR-8 (RPA web + verificação):** `apps/rpa-web-worker` + `packages/{rpa-web,rpa-core}`.
- **FR-21 (RPA desktop):** `apps/rpa-desktop-worker` + `packages/rpa-desktop` + `workers/rpa-desktop-host` (.NET FlaUI).
- **FR-9 (Provider):** `packages/provider`.
- **FR-10 (Canais):** `packages/channels` + `apps/gateway`.
- **FR-11 (CES):** `apps/ces`.
- **FR-12/FR-13/FR-19 (deploy/operação/Trust):** `apps/runtime` (Trust Engine) + `apps/web/(operations)` + `docker-compose*.yml`.
- **FR-14/FR-20 (UI/marca):** `apps/web` (components/ui, flow, builder).
- **FR-15/FR-29 (memória por conversa + híbrida/global):** `packages/memory` (+ `pgvector` via `packages/db`).
- **FR-22/FR-26 (Ação HTTP + catálogo de Skills):** `packages/skills` + `apps/runtime` (executor de Ação).
- **FR-27 (Connectors/MCP):** `packages/mcp-adapters` + `apps/ces` (credenciais).
- **FR-28 (consciência de Skills na IA Arquiteta):** `packages/architect` (system-prompt recebe o catálogo).
- **FR-23/FR-24 (RAG: ingestão + recuperação):** `packages/knowledge` + `packages/db` (`pgvector`); Bloco Contexto em `apps/runtime`.
- **FR-25 (embeddings):** `packages/provider` (`embed()`).
- **FR-16–18 (concorrência/resiliência):** `apps/runtime` (lock por conversa, failover) + `apps/gateway` (retenção/replay de Canal).

### Pontos de Integração e Fluxo de Dados
- **Build-time:** UI → `web/api` → `architect`(via `provider`) → proposta de Harness validada → `db`.
- **Run-time:** Canal → `gateway` (webhook) → `harness.execute` (pg-boss) → `runtime` avança Blocos → conforme Tipo: `provider` (LLM), `rpa.web`/`rpa.desktop` (workers, credenciais via `ces`), `action.*` → estado/log persistido em `db` → eventos `execution.*` via WebSocket → UI.
- **Externos:** Providers de LLM (HTTP), Evolution API/Telegram (HTTP/webhook), sistemas-alvo (RPA web/desktop).

### Organização de Config / Testes / Build
- **Config:** `turbo.json`, `biome.json`, `tsconfig.base.json` na raiz; `env.ts` (Zod) por app; `.env.example` documenta variáveis.
- **Testes:** unitários co-localizados `*.test.ts` (Bun); e2e em `apps/web/e2e` (Playwright).
- **Build/Deploy:** Turborepo orquestra; `docker-compose.yml` sobe o núcleo Linux; `docker-compose.windows.yml` adiciona o nó Windows (rpa-desktop-worker + host .NET) conectado ao mesmo Postgres/fila.

## Resultados da Validação da Arquitetura

### Validação de Coerência ✅
- **Compatibilidade de decisões:** Bun/TS + Turborepo + Next 16/React 19 + Drizzle/Postgres + pg-boss + Fastify/WS são mutuamente compatíveis (versões verificadas jun/2026). pg-boss é a espinha única (Runtime + RPA + Gateway), evitando infra extra. Sem decisões contraditórias.
- **Consistência de padrões:** nomenclatura (snake_case DB / camelCase JSON / kebab arquivos), resultado discriminado e nomes de job/evento atravessam todos os serviços de forma uniforme.
- **Alinhamento de estrutura:** a árvore (apps/* + packages/* + workers/) realiza as fronteiras (CES isolado, db único, RPA agnóstico de ambiente).

### Cobertura de Requisitos ✅
- **FRs (21/21):** todos mapeados a componentes (ver "Mapeamento Requisitos → Estrutura"). Núcleo (FR-1–6), RPA dual (FR-7/8/21), Provider (FR-9), Canais (FR-10), CES (FR-11), operação/Trust (FR-12/13/19), UI (FR-14/20), memória (FR-15), resiliência (FR-16–18).
- **NFRs:** Segurança P0 (CES + sandbox dual + redaction); Privacidade/LGPD (self-host + Ollama local); Confiabilidade (state machine durável + retry); Concorrência (lock por conversa); Observabilidade (logs estruturados + WebSocket); Custo (Modelo por Bloco); Portabilidade (Compose Linux + nó Windows); Marca (Tailwind/Shadcn + temas + WCAG 2.1 AA).

### Prontidão para Implementação ✅
- **Decisões:** críticas documentadas com versões; estratégia de RPA, motor de execução, CES e Provider definidos.
- **Estrutura:** árvore completa e específica; fronteiras e pontos de integração explícitos; mapeamento FR→local completo.
- **Padrões:** todos os pontos de conflito previstos (nomes, formato, comunicação, erro/estado) cobertos com exemplos.

### Análise de Gaps
**Críticos (bloqueiam início):** nenhum.
**Importantes (resolver antes da story correspondente):**
- Spike: modelo padrão da IA Arquiteta (benchmark de decomposição) — antes da story `architect`.
- Spike: biblioteca de RPA web (confirmar Stagehand 2.0/Playwright MCP) e abordagem desktop (FlaUI vs visão) — antes das stories `rpa-web`/`rpa-desktop`.
- Spike: formato do ambiente Windows isolado (host/VM/contêiner) — antes da story `rpa-desktop`/deploy.
**Nice-to-have:** detalhar fluxo de auth single-admin (sessão); estratégia de testes de integração cross-worker; métricas/telemetria interna de SM-1.

### Issues Endereçadas
- Polyglot TS↔.NET isolado atrás de IPC, mantendo a fila e o contrato em TS (sem .NET na fila).
- Colisão de segurança FR-8×FR-11 já resolvida no PRD (captura pós-auth + redaction) e refletida na fronteira do CES.

### Checklist de Completude da Arquitetura
**Análise de Requisitos**
- [x] Contexto do projeto analisado a fundo
- [x] Escala e complexidade avaliadas
- [x] Restrições técnicas identificadas
- [x] Preocupações transversais mapeadas

**Decisões Arquiteturais**
- [x] Decisões críticas documentadas com versões
- [x] Stack tecnológica totalmente especificada
- [x] Padrões de integração definidos
- [x] Considerações de performance endereçadas (concorrência, realtime, retry)

**Padrões de Implementação**
- [x] Convenções de nomenclatura estabelecidas
- [x] Padrões de estrutura definidos
- [x] Padrões de comunicação especificados
- [x] Padrões de processo documentados

**Estrutura do Projeto**
- [x] Estrutura de diretórios completa definida
- [x] Fronteiras de componentes estabelecidas
- [x] Pontos de integração mapeados
- [x] Mapeamento requisitos→estrutura completo

### Avaliação de Prontidão
**Status Geral:** READY FOR IMPLEMENTATION (16/16 itens marcados; nenhum gap crítico aberto). Os 3 spikes são gaps importantes não-bloqueadores, a resolver antes de suas stories específicas.
**Nível de Confiança:** Alto.
**Pontos Fortes:** infra mínima (pg-boss como espinha única); isolamento de credenciais forte (CES); abstração que desacopla ambientes heterogêneos de RPA; multi-LLM sem lock-in com normalização; estrutura mapeada 1:1 aos requisitos.
**Áreas para Evolução Futura:** multi-tenancy/RLS (B2B2B); memória híbrida (pgvector); marketplace curado; WhatsApp Cloud API oficial; resolução dos 3 spikes.

### Handoff para Implementação
**Diretrizes para Agentes de IA:**
- Seguir as decisões exatamente como documentadas; usar os padrões de consistência sempre; respeitar estrutura e fronteiras; consultar este documento para qualquer dúvida arquitetural.

**Primeira Prioridade de Implementação:** scaffold do monorepo (Bun workspaces + Turborepo) + schema Drizzle do domínio do Harness — conforme a "Sequência de Implementação".
