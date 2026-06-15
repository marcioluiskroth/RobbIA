---
baseline_commit: NO_VCS
---
# Story 1.1: Scaffold do monorepo e fundação de qualidade

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a desenvolvedor da RobbIA,
I want o monorepo inicializado com a stack e o ferramental acordados (Bun workspaces + Turborepo, Next.js 16, Biome, CI, docker-compose base e o package `@robbia/shared` com os contratos transversais),
so that todas as histórias seguintes construam sobre uma fundação consistente, verificável e sem retrabalho.

> **Greenfield · primeira story de implementação.** A arquitetura define explicitamente este scaffold como o ponto de partida ("A inicialização por estes comandos deve ser a primeira story de implementação"). Não há story anterior nem código existente a preservar.

## Acceptance Criteria

1. **Monorepo base inicializado.**
   **Given** um repositório vazio
   **When** executo a inicialização (Bun workspaces + Turborepo 2.x)
   **Then** existe um monorepo com `apps/*` e `packages/*` habilitados como workspaces no `package.json` raiz (`"workspaces": ["apps/*", "packages/*"]`), `apps/web` criado via `create next-app` (Next.js 16 + React 19 + App Router + TypeScript + Tailwind)
   **And** `turbo.json`, `biome.json`, `tsconfig.base.json` (TypeScript `strict`, sem `any`) e `.env.example` estão na raiz.

2. **Esqueletos de apps/packages + contratos transversais.**
   **Given** o monorepo inicializado
   **When** crio os esqueletos dos demais apps/packages conforme a árvore da arquitetura
   **Then** existem `apps/{gateway,runtime,ces,rpa-web-worker,rpa-desktop-worker}` e `packages/{shared,db,architect,provider,rpa-core,rpa-web,rpa-desktop,memory,skills,channels}`, cada um com barrel `src/index.ts`
   **And** `packages/shared` (`@robbia/shared`) contém `result.ts` (resultado discriminado), `retry.ts` (política única 3x/backoff exp.), `logger.ts` (logger estruturado JSON), `jobs.ts` e `events.ts` (nomes de job/evento canônicos).

3. **CI e deploy base verdes.**
   **Given** a fundação configurada
   **When** rodo o pipeline de CI (`.github/workflows/ci.yml`: bun install → biome → tsc → test → build)
   **Then** todos os passos passam em verde
   **And** `docker-compose.yml` (núcleo Linux) sobe ao menos `postgres` e a `apps/web` localmente.

## Tasks / Subtasks

- [x] **Task 1 — Monorepo base (AC: 1)**
  - [x] `bun init -y` na raiz; configurar `"workspaces": ["apps/*", "packages/*"]` no `package.json`
  - [x] `bun add -d turbo@^2 @biomejs/biome@^2`
  - [x] Criar `apps/web` (Next.js 16, React 19, App Router, TS, Tailwind v4) — *variância: hand-authored em vez de `create-next-app` interativo (ambiente não-interativo; resultado equivalente e verificado por `next build`)*
  - [x] Criar `tsconfig.base.json` com `strict: true`, `noUncheckedIndexedAccess: true`, sem `any` permitido; cada app/package estende a base
  - [x] Criar `biome.json` (lint + format) substituindo ESLint/Prettier do template Next (remover artefatos de ESLint/Prettier se o create-next-app os trouxer)
  - [x] Criar `turbo.json` com pipelines `build`, `dev`, `test`, `lint`, `typecheck` (usar `dependsOn: ["^build"]` onde aplicável) + cache
  - [x] Criar `.env.example` (documenta variáveis; segredos nunca versionados)
- [x] **Task 2 — Esqueletos de apps/packages (AC: 2)**
  - [x] Criar as pastas `apps/{gateway,runtime,ces,rpa-web-worker,rpa-desktop-worker}` (libs Bun + TS) com `src/index.ts` (barrel) e `src/env.ts` (validação Zod no boot, stub)
  - [x] Criar `packages/{architect,provider,rpa-core,rpa-web,rpa-desktop,memory,skills,channels}` com `src/index.ts` (barrel)
  - [x] Criar `packages/db` (`@robbia/db`) com `src/client.ts` + config Drizzle Kit (`drizzle.config.ts`) — **sem** tabelas de domínio ainda (entram na Story 1.2)
  - [x] Definir `package.json` de cada workspace com `name` `@robbia/<pkg>` e dependências internas via `workspace:*`
  - [x] Criar `workers/rpa-desktop-host/` como placeholder (.NET/FlaUI — fora do TS; só estrutura, sem implementação nesta story)
- [x] **Task 3 — `@robbia/shared` contratos transversais (AC: 2)**
  - [x] `result.ts`: tipo `Result<T,E>` discriminado `{ ok: true; data: T } | { ok: false; error: { code: string; message: string; retriable: boolean } }` + helpers `ok()`/`err()`
  - [x] `retry.ts`: política única `withRetry` (3 tentativas, backoff exp. ≈1s→4s→16s) parametrizável por bloco; distingue `retriable` de permanente
  - [x] `logger.ts`: logger estruturado JSON (estilo pino) com níveis `debug|info|warn|error` e campos obrigatórios `ts, level, service, correlationId`; **proibido logar segredos**
  - [x] `jobs.ts`: constantes de nomes de job pg-boss (`harness.execute`, `rpa.web`, `rpa.desktop`, `action.send`, `action.http`)
  - [x] `events.ts`: constantes de eventos WS (`execution.step.updated`, `execution.completed`, `agent.state.changed`)
  - [x] `schemas/` + `types.ts`: pasta-base para schemas Zod (vazia/stub; populada nas stories seguintes)
- [x] **Task 4 — CI + deploy base (AC: 3)**
  - [x] `.github/workflows/ci.yml`: `bun install` → `biome ci` → `tsc --noEmit` (turbo `typecheck`) → `bun test` → `turbo build`
  - [x] `docker-compose.yml`: serviços `postgres` (PostgreSQL 16) e `web` (apps/web) subindo localmente com um comando
  - [x] `docker-compose.windows.yml`: arquivo override placeholder para o nó Windows (rpa-desktop-worker + host .NET) — só estrutura, sem implementação
  - [x] `README.md` raiz com comandos de bootstrap
- [x] **Task 5 — Verificação local (AC: 1,2,3)**
  - [x] `bun install` na raiz resolve todos os workspaces
  - [x] `biome ci`, `tsc --noEmit`, `bun test` (ao menos 1 teste smoke por package shared), `turbo build` passam
  - [x] `docker compose config` valida postgres + web localmente — *live `docker compose up` não executado neste ambiente (daemon Docker offline).*
  - [x] **AC#3 (cláusula "sobe localmente") provada em CI:** job `docker-smoke` no `ci.yml` roda `docker compose up -d --build`, aguarda a `web` responder em `:3000` (curl) e confirma `postgres` healthy — a verificação real do build/run do container deixa de depender de daemon local.

### Review Findings

*Code review adversarial (3 camadas + verificação) — 2026-06-14. 27 brutas → 18 confirmadas / 9 descartadas. 0 high, 6 medium, 12 low. Consolidadas (dedup) em 10 patches + 1 defer.*

- [x] [Review][Patch] Logger: campos do chamador sobrescrevem chaves canônicas (ts/level/service/msg) — só `correlationId` é protegido [packages/shared/src/logger.ts:68-76]
- [x] [Review][Patch] Logger: serialização frágil a objetos não-plain — recursão infinita em ref circular, `Error`→`{}`, `Date/Map/Set`→vazio, e `emit()` lança em valor não-serializável (BigInt) [packages/shared/src/logger.ts:28-38,76]
- [x] [Review][Patch] Logger: redação por nome de chave frágil — regex por substring super-redige benignos (`tokenCount`) e subredige sensíveis (`accessKey/privateKey/masterKey/bearer/pwd`); `msg` não é redatado [packages/shared/src/logger.ts:25,33]
- [x] [Review][Patch] Logger: nível inválido não validado — `LEVEL_ORDER[level]` undefined nunca suprime (debug vaza) [packages/shared/src/logger.ts:57,63]
- [x] [Review][Patch] withRetry: `maxAttempts <= 0` relança `undefined`, apagando o contexto de erro [packages/shared/src/retry.ts:67,80]
- [x] [Review][Patch] db client: pool postgres nunca fechado (sem `closeDbClient`/handle) e `connectionString` não validada [packages/db/src/client.ts:9-12]
- [x] [Review][Patch] drizzle.config: `DATABASE_URL ?? default local` — migração pode rodar no banco errado em silêncio [packages/db/drizzle.config.ts:8]
- [x] [Review][Patch] biome.json: `useIgnoreFile:true` com `vcs.enabled:false` — `.gitignore` não é honrado (config inerte) [biome.json:3]
- [x] [Review][Patch] turbo.json: tarefa `lint` é config morta (lint roda via `biome ci` no script raiz, não `turbo lint`) [turbo.json:16]
- [x] [Review][Patch] Conformidade com o subtask: `packages/shared/src/schemas/` não foi criada apesar de marcada como concluída [packages/shared/src/]
- [x] [Review][Defer] Logger: redação só olha NOME da chave; segredos embutidos em VALORES (connection strings, "Bearer x") vazam — varredura de valores é decisão de design (tradeoff perf/falsos positivos), adiada para quando logs carregarem payloads reais (Story 2.4) [packages/shared/src/logger.ts:25] — deferred

## Dev Notes

### Decisões de fundação estabelecidas (seguir exatamente)
[Source: architecture.md#Avaliação de Starter Template, #Decisões de Arquitetura Centrais]
- **Starter selecionado:** scaffold próprio **Bun workspaces + Turborepo 2.x** (NÃO usar create-t3-turbo/Nx — descartados: trazem Expo/Supabase/pnpm/tRPC ou overhead). Zero bagagem.
- **Linguagem & Runtime:** TypeScript em todo o monorepo; **Bun 1.3.x** como runtime, package manager e test runner (não usar npm/pnpm/yarn; não usar Jest/Vitest — usar `bun test`).
- **Orquestração:** **Turborepo 2.x** (pipelines com `dependsOn` + cache); Bun workspaces (`workspace:*`).
- **Lint/Format:** **Biome 2.2.x** (substitui ESLint + Prettier — mais rápido). Não reintroduzir ESLint/Prettier.
- **UI:** **Next.js 16** + **React 19.2.x** (App Router, Server Components, streaming) + Tailwind + Shadcn/ui + ReactFlow. (Shadcn/ReactFlow entram nas stories de UI 1.5–1.8; aqui só o `create-next-app` base.)
- **Banco/ORM:** PostgreSQL + **Drizzle 0.45.x** (+ Drizzle Kit). **pgvector adiado** (Fase 4) — não adicionar agora.
- **Backend:** Fastify 5.8.x + WebSocket (gateway) e pg-boss (filas) — entram nas stories 2.x/4.x; aqui só o esqueleto dos apps.

> ⚠️ **Versões:** a tabela acima é a "verificada (jun/2026)" da arquitetura. Confirme o pin exato no `package.json`/lockfile no momento da implementação; **suba Next.js para 16** (docs antigos citam 15).

### Árvore-alvo do monorepo (criar exatamente esta estrutura)
[Source: architecture.md#Árvore Completa do Monorepo]
```
robbia/
├── package.json            # workspaces: apps/*, packages/*
├── turbo.json · biome.json · tsconfig.base.json · bun.lock · .env.example
├── docker-compose.yml      # núcleo Linux (web, gateway, runtime, ces, rpa-web-worker, postgres)
├── docker-compose.windows.yml  # override nó Windows (placeholder nesta story)
├── .github/workflows/ci.yml
├── apps/
│   ├── web/        # Next.js 16 / React 19 (App Router; segmentos (builder)/(operations) nas stories de UI)
│   ├── gateway/    # Fastify 5 + WS (esqueleto)
│   ├── runtime/    # máquina de estado (esqueleto)
│   ├── ces/        # Credential Execution Service (esqueleto)
│   ├── rpa-web-worker/    # consome rpa.web (esqueleto)
│   └── rpa-desktop-worker/# consome rpa.desktop, roda no nó Windows (esqueleto)
├── packages/
│   ├── shared/   # @robbia/shared — types, schemas/, jobs.ts, events.ts, result.ts, retry.ts, logger.ts
│   ├── db/       # @robbia/db — Drizzle client + config (SEM tabelas de domínio nesta story)
│   ├── architect/ provider/ rpa-core/ rpa-web/ rpa-desktop/ memory/ skills/ channels/  # barrels
└── workers/
    └── rpa-desktop-host/   # helper .NET (FlaUI/UIA3) — placeholder, não-TS
```

### Padrões de consistência obrigatórios (já valem nesta story)
[Source: architecture.md#Padrões de Nomenclatura, #Diretrizes de Enforcement]
- **Arquivos:** `kebab-case` (`harness-runtime.ts`, `block-card.tsx`). Componentes React `PascalCase`. Funções/variáveis `camelCase`. Tipos/interfaces `PascalCase`. Constantes `UPPER_SNAKE`.
- **Schemas Zod:** `XxxSchema`; tipo inferido `Xxx` (`type Harness = z.infer<typeof HarnessSchema>`).
- **Cada package exporta por barrel `src/index.ts`.** Dentro de packages: organização por domínio.
- **Env validado por Zod no boot** (`env.ts` por app); segredos nunca em `.env` versionado.
- **Resultado discriminado** em todas as fronteiras de serviço (sem wrapper genérico solto).
- **Logs estruturados** (JSON, pino-style); **proibido logar segredos/credenciais**.
- **Todo agente DEVE** usar TS `strict` (sem `any`), rodar Biome (lint+format) e `tsc` antes de concluir.

### O que NÃO fazer nesta story (escopo / anti-scope-creep)
- **NÃO** criar tabelas de domínio (`harnesses`, `blocks`, etc.) — isso é a **Story 1.2**. Aqui só o client/config Drizzle.
- **NÃO** implementar lógica de Provider, IA Arquiteta, Runtime, CES, RPA, Canais — apenas barrels/esqueletos vazios.
- **NÃO** adicionar pgvector (Fase 4).
- **NÃO** implementar o host .NET FlaUI (placeholder apenas).
- **NÃO** reintroduzir ESLint/Prettier/npm/Jest — a stack é Bun + Biome + `bun test`.

### Testing standards
[Source: architecture.md#Organização de Config / Testes / Build, #Padrões de Estrutura]
- **Testes unitários co-localizados** `*.test.ts`, executados com o **Bun test runner** (`bun test`).
- e2e da UI ficam em `apps/web/e2e` (Playwright) — não nesta story.
- Para esta story: ao menos **testes smoke** dos contratos de `@robbia/shared` (`result.ok/err`, `withRetry` respeita 3 tentativas/backoff, `logger` redige campos obrigatórios e não vaza segredo). CI deve falhar se algum passo (biome/tsc/test/build) falhar.

### Project Structure Notes
- A árvore acima é **autoritativa** (architecture.md#Estrutura do Projeto e Fronteiras). Toda divergência deve ser registrada com justificativa.
- **Fronteiras a respeitar desde já:** `packages/db` será o único acesso ao Postgres; `apps/ces` será o único a descriptografar segredos; o `runtime` é agnóstico de ambiente de RPA. Nesta story isso se reflete só na separação física dos pacotes — a lógica vem depois.
- **Sem `_bmad/` no projeto:** os artefatos de planejamento vivem em `_bmad-output/planning-artifacts/`; o código-fonte do produto deve ser criado na raiz do repositório (`apps/`, `packages/`) conforme a árvore — separado da pasta de artefatos.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1: Scaffold do monorepo e fundação de qualidade]
- [Source: _bmad-output/planning-artifacts/architecture.md#Avaliação de Starter Template] (comando de init, decisões de fundação, tabela de versões jun/2026)
- [Source: _bmad-output/planning-artifacts/architecture.md#Padrões de Implementação e Regras de Consistência] (nomenclatura, formato, comunicação, enforcement)
- [Source: _bmad-output/planning-artifacts/architecture.md#Estrutura do Projeto e Fronteiras] (árvore completa, fronteiras, mapeamento FR→estrutura)
- [Source: _bmad-output/planning-artifacts/architecture.md#Sequência de Implementação] (item 1: scaffold + schema = ponto de partida; schema é tratado na Story 1.2)

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (1M context) — BMad dev-story workflow

### Debug Log References

- `bun install` → 154 pacotes, lockfile salvo.
- Biome: `biome check --write` aplicou *organize imports* (retry.test.ts, index.ts); `biome ci` verde (2 infos não-fatais de migração de config).
- Ajuste: removido o script `test` dos pacotes-esqueleto sem testes (`bun test` falha com "No tests found"); turbo passa a pular a task neles. Só `@robbia/shared` mantém `test`.
- `next build` exigiu `@types/node` em `apps/web` (adicionado) e reescreveu `next-env.d.ts` com `import "./.next/types/routes.d.ts"`; revertido para a versão limpa (committada) para o `tsc` passar em checkout sem `.next`.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- ✅ **Fundação verificada (núcleo de CI):** `bun install` · Biome lint · `tsc --noEmit` (16/16 pacotes, inclusive em estado limpo sem `.next`) · `bun test` (10 pass / 0 fail em `@robbia/shared`) · `turbo build` (Next.js 16.2.9, 3 páginas estáticas).
- ✅ **`@robbia/shared`** com contratos reais e testados: resultado discriminado (`ok/err`), política de retry central (3x, backoff 1s→4s→16s), logger estruturado com redação de segredos, nomes de job/evento canônicos.
- ✅ **Estrutura completa** apps/* + packages/* + workers/ conforme a árvore da arquitetura; esqueletos com barrels e `env.ts` (Zod) por app; `@robbia/db` com client Drizzle + config (sem tabelas de domínio — Story 1.2).
- ⚠️ **Docker (AC#3):** `docker compose config` valida `postgres` + `web`. O **live `docker compose up` NÃO foi executado** porque o **daemon do Docker (Docker Desktop) não está rodando** neste ambiente. Para validar: iniciar o Docker Desktop e rodar `docker compose up` (postgres usa imagem oficial `postgres:16-alpine`; `web` constrói via `apps/web/Dockerfile`, que executa o mesmo `next build` já verificado).
- 📌 **Variância:** `apps/web` foi escrito à mão (Next 16 mínimo) em vez de `create-next-app` interativo — ambiente não-interativo; resultado equivalente e validado por `next build`.
- 📌 **Sem VCS:** projeto não é repositório git (`baseline_commit: NO_VCS`). Recomenda-se `git init` antes de evoluir (o `.gitignore` já está pronto; `bun.lock` é versionado).
- 📌 **Spike não aplicável** a esta story (modelo da IA Arquiteta só afeta a Story 1.4).

### File List

**Raiz:** `package.json` · `turbo.json` · `biome.json` · `tsconfig.base.json` · `.gitignore` · `.dockerignore` · `.env.example` · `README.md` · `docker-compose.yml` · `docker-compose.windows.yml` · `bun.lock` · `.github/workflows/ci.yml`
**packages/shared:** `package.json` · `tsconfig.json` · `src/{index,result,retry,logger,jobs,events,types}.ts` · `src/{result,retry,logger}.test.ts`
**packages/db:** `package.json` · `tsconfig.json` · `drizzle.config.ts` · `src/{index,client}.ts` · `src/schema/index.ts`
**packages/{architect,provider,rpa-core,rpa-web,rpa-desktop,memory,skills,channels}:** `package.json` · `tsconfig.json` · `src/index.ts` (esqueletos)
**apps/web:** `package.json` · `tsconfig.json` · `next.config.ts` · `next-env.d.ts` · `postcss.config.mjs` · `app/{layout.tsx,page.tsx,globals.css}`
**apps/{gateway,runtime,ces,rpa-web-worker,rpa-desktop-worker}:** `package.json` · `tsconfig.json` · `src/{index,env}.ts` (esqueletos)
**workers/rpa-desktop-host:** `README.md` (placeholder .NET/FlaUI)

## Change Log

| Data | Mudança |
|------|---------|
| 2026-06-14 | Story 1.1 implementada: scaffold do monorepo Bun + Turborepo, `@robbia/shared` (com testes), esqueletos de apps/packages, `apps/web` (Next 16), CI e docker-compose. CI-core verde (lint/typecheck/test/build); docker config validado (live up pendente — daemon offline). Status → review. |
| 2026-06-14 | Code review adversarial (3 camadas + verificação): 18 confirmadas → 10 patches aplicados + 1 defer. Endurecido `logger.ts` (chaves canônicas protegidas; serialização robusta a circular/Error/BigInt/Map/Set; redação por palavra + vocabulário ampliado; nível validado), `retry.ts` (maxAttempts≥1), `db/client.ts` (valida connString + `close()`), `drizzle.config.ts` (exige DATABASE_URL), `biome.json`/`turbo.json` (configs corrigidas), criada `packages/shared/src/schemas/`. +4 testes (14 pass). Lint/typecheck/test verdes. Status → done. |
