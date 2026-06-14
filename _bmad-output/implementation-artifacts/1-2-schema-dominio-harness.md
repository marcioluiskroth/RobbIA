---
baseline_commit: NO_VCS
---
# Story 1.2: Schema de domínio do Harness (Drizzle)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a desenvolvedor da RobbIA,
I want o modelo de dados do Harness e dos Providers persistido em Postgres via Drizzle, com schemas Zod correspondentes,
so that a proposta da IA Arquiteta (Story 1.4) possa ser criada, lida e editada com tipagem forte e validada nas fronteiras.

> **Constrói sobre a Story 1.1 (done).** A fundação `@robbia/db` (client + `drizzle.config.ts` que exige `DATABASE_URL`) e `@robbia/shared` (com a pasta `src/schemas/` já criada) existem. Esta story preenche o schema de domínio — **apenas** as tabelas que o núcleo (FR-1..FR-4) precisa agora.

## Acceptance Criteria

1. **Tabelas de domínio do Harness em `@robbia/db`.**
   **Given** o package `@robbia/db` (Drizzle + Drizzle Kit)
   **When** defino o schema necessário a este épico
   **Then** existem as tabelas `harnesses`, `blocks`, `providers` e `model_configs` em `snake_case` **plural**, com PK `id` **UUID v7** (ordenável), FKs `<entidade>_id`, e timestamps `created_at`/`updated_at` em `timestamptz` (UTC)
   **And** `blocks` é tipado por um enum `block_type` com os 7 Tipos de Bloco do PRD (Gatilho/Contexto/Decisão/Resposta/RPA/Ação/Verificação)
   **And** as tabelas de execução/conversa/credencial **NÃO** são criadas aqui (ficam para as Stories 2.1 e 3.1) e **não** há coluna `pgvector` (adiado, Fase 4).

2. **Migration gerada e aplicável; `@robbia/db` é o único acesso ao Postgres.**
   **Given** o schema definido
   **When** rodo `drizzle-kit generate`
   **Then** uma migration SQL é gerada em `packages/db/drizzle/` e reflete o schema; `createDbClient` expõe o schema tipado (o client da Story 1.1 continua o único ponto de acesso ao banco)
   **And** os modelos Drizzle usam `camelCase` mapeando colunas `snake_case`.

3. **Schemas Zod do domínio em `@robbia/shared`.**
   **Given** o package `@robbia/shared` (pasta `src/schemas/` já existente)
   **When** modelo a proposta de Harness
   **Then** existem `BlockTypeSchema`, `BlockSchema` e `HarnessSchema` (Zod v4) com tipos inferidos (`type Harness = z.infer<typeof HarnessSchema>`), exportados pelo barrel e reexportados em `@robbia/shared`
   **And** os schemas Zod e o enum Drizzle compartilham a MESMA fonte de verdade dos 7 Tipos de Bloco (sem divergência).

## Tasks / Subtasks

- [x] **Task 1 — Dependências e tooling (AC: 1, 2)**
  - [x] Adicionar `uuidv7` (gerador de UUID v7 app-side) a `packages/db` (`bun add uuidv7` no dir do package) — Postgres 16 não tem `uuidv7()` nativo
  - [x] Reintroduzir o script `"test": "bun test"` em `packages/db/package.json` (removido na 1.1 por não haver testes; agora haverá)
  - [x] Confirmar `drizzle-orm@^0.45` e `drizzle-kit@^0.30` já instalados (Story 1.1)
- [x] **Task 2 — Enum + tabelas Drizzle (AC: 1, 2)**
  - [x] `packages/db/src/schema/block-type.ts`: `export const blockType = pgEnum('block_type', ['gatilho','contexto','decisao','resposta','rpa','acao','verificacao'])` (valores ASCII minúsculos, sem acento — rótulos de exibição ficam na UI)
  - [x] `packages/db/src/schema/providers.ts`: tabela `providers` (id uuid v7 PK, `kind` enum/text dentre claude/gpt/gemini/ollama/openrouter, `label` text, `config` jsonb não-sensível, `enabled` boolean default true, timestamps)
  - [x] `packages/db/src/schema/model-configs.ts`: tabela `model_configs` (id, `provider_id` FK→providers, `model` text, `params` jsonb, timestamps)
  - [x] `packages/db/src/schema/harnesses.ts`: tabela `harnesses` (id, `name` text notNull, `description` text, `status` text default 'draft', timestamps)
  - [x] `packages/db/src/schema/blocks.ts`: tabela `blocks` (id, `harness_id` FK→harnesses onDelete cascade, `type` blockType notNull, `position` integer notNull, `name` text, `justification` text, `model_config_id` FK→model_configs **nullable** (Blocos "sem LLM"), `config` jsonb, `depends_on` jsonb default '[]', timestamps)
  - [x] Índices: `idx_blocks_harness_id`, `idx_model_configs_provider_id`
  - [x] `packages/db/src/schema/index.ts`: reexportar todas as tabelas + enum (substitui o `export {}` stub da 1.1)
  - [x] UUID v7 default via Drizzle: `id: uuid('id').primaryKey().$defaultFn(() => uuidv7())`
- [x] **Task 3 — Schemas Zod do domínio (AC: 3)**
  - [x] `packages/shared/src/schemas/block-type.ts`: `BlockTypeSchema = z.enum([...os 7...])` — **única fonte de verdade**; o enum Drizzle deve derivar/coincidir com esta lista (exporte a tupla `BLOCK_TYPES` de shared e use-a no `pgEnum`)
  - [x] `packages/shared/src/schemas/block.ts`: `BlockSchema` (type: BlockTypeSchema; model?: string; justification: string; etc., alinhado à proposta da IA Arquiteta FR-1/FR-2)
  - [x] `packages/shared/src/schemas/harness.ts`: `HarnessSchema` (name: string; blocks: BlockSchema[])
  - [x] `packages/shared/src/schemas/index.ts`: reexportar (substitui o stub) + garantir reexport via `packages/shared/src/index.ts`
  - [x] Tipos inferidos exportados: `BlockType`, `Block`, `Harness`
- [x] **Task 4 — Migration (AC: 2)**
  - [x] Exportar `DATABASE_URL` (o `drizzle.config.ts` da 1.1 exige; usar `.env`/valor do `.env.example`) e rodar `bun run --filter @robbia/db db:generate`
  - [x] Commitar a migration SQL gerada em `packages/db/drizzle/`
- [x] **Task 5 — Testes (AC: 3) [red-green]**
  - [x] `packages/shared/src/schemas/*.test.ts`: parse válido e inválido de `BlockTypeSchema`/`BlockSchema`/`HarnessSchema` (ex.: tipo de bloco inválido rejeitado; harness sem name rejeitado; bloco "sem LLM" sem model aceito)
  - [x] (Opcional/leve) `packages/db`: teste estrutural confirmando que `schema` exporta as 4 tabelas + enum
- [x] **Task 6 — Verificação (AC: 1,2,3)**
  - [x] `bun run lint` (Biome — atenção ao organize-imports), `bun run typecheck`, `bun run test` verdes
  - [x] Migration presente e coerente com o schema

## Dev Notes

### Modelo de dados alvo (autoritativo)
[Source: architecture.md#Arquitetura de Dados, #Padrões de Nomenclatura]
- **Domínio desta story:** `harnesses` → `blocks[]` (tipado por `block_type`, com dependências), `providers`, `model_configs`. **Fora desta story:** `executions`/`execution_steps` (Story 2.1), `conversations`/`messages` (Story 2.1), `credentials` (Story 3.1).
- **Nomenclatura:** tabelas `snake_case` plural; colunas `snake_case`; PK `id` = **UUID v7** (ordenável); FK `<entidade>_id`; índices `idx_<tabela>_<colunas>`; modelos Drizzle em `camelCase` mapeando colunas `snake_case`; timestamps `timestamptz` (UTC).
- **7 Tipos de Bloco (PRD §4.3):** Gatilho, Contexto, Decisão, Resposta, RPA, Ação, Verificação → enum `block_type` com valores ASCII minúsculos `gatilho|contexto|decisao|resposta|rpa|acao|verificacao`.

### UUID v7 (decisão de implementação)
- Postgres 16 (imagem do `docker-compose.yml`) **não** tem `uuidv7()` nativo (chega no PG18). Gerar **app-side** via package `uuidv7` no `$defaultFn` do Drizzle: `id: uuid('id').primaryKey().$defaultFn(() => uuidv7())`. Coluna tipo `uuid`.

### Fonte única de verdade dos Tipos de Bloco
- Para evitar divergência entre o enum Drizzle e o Zod (ponto de conflito clássico): defina a tupla em `@robbia/shared` (ex.: `export const BLOCK_TYPES = ['gatilho','contexto','decisao','resposta','rpa','acao','verificacao'] as const`), use-a em `BlockTypeSchema = z.enum(BLOCK_TYPES)` e importe-a no `pgEnum('block_type', BLOCK_TYPES)` no `@robbia/db` (o db já depende de `@robbia/shared`).

### Aprendizados da Story 1.1 (aplicar)
[Source: _bmad-output/implementation-artifacts/1-1-scaffold-monorepo.md]
- **Stack/padrões já valendo:** TypeScript `strict` (sem `any` — Biome falha), Bun test runner (`bun test`), barrels `src/index.ts`, `verbatimModuleSyntax` ligado → use `import type` para imports de tipo.
- **Biome `organize-imports`** é enforced no `biome ci` — rode `bunx biome check --write .` antes de finalizar (ordena imports/exports).
- **Turbo `test`** só roda onde há script `test`; por isso reintroduza-o em `packages/db` (Task 1).
- **`drizzle.config.ts` exige `DATABASE_URL`** (corrigido no review da 1.1 — sem default silencioso); exporte a env antes de `db:generate`.
- **Contratos disponíveis em `@robbia/shared`:** `Result`/`ok`/`err`, `withRetry`, `createLogger`, `JOBS`, `WS_EVENTS`. Reuse — não reinvente.
- **Sem VCS** (`baseline_commit: NO_VCS`); a migration é versionada por arquivo em `packages/db/drizzle/`.

### O que NÃO fazer (anti-scope)
- **NÃO** criar `executions`/`execution_steps`/`conversations`/`messages`/`credentials` (outras stories).
- **NÃO** adicionar `pgvector`/colunas vetoriais (Fase 4).
- **NÃO** colocar segredos de Provider no schema — `providers.config` guarda só config **não-sensível**; chaves/segredos vão para o CES (Story 3.1), aqui no máximo uma **referência**.
- **NÃO** alterar o `createDbClient` da 1.1 além de garantir que o `schema` agora populado flua por ele.

### Testing standards
[Source: architecture.md#Organização de Config / Testes / Build]
- Testes co-localizados `*.test.ts`, `bun test`. Foco desta story: **schemas Zod** (parse válido/ inválido — fronteira "parse, don't validate"). Teste estrutural do schema Drizzle é opcional/leve (não exige Postgres no CI).

### Project Structure Notes
- Novos arquivos só em `packages/db/src/schema/` e `packages/shared/src/schemas/` (+ migration em `packages/db/drizzle/`). Nada fora dessas fronteiras.
- `packages/db` é o único acesso ao Postgres; `@robbia/shared` é a fonte dos schemas Zod/contratos.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2: Schema de domínio do Harness (Drizzle)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Arquitetura de Dados] (modelo de domínio, Zod nas fronteiras, Drizzle/Drizzle Kit, pgvector adiado)
- [Source: _bmad-output/planning-artifacts/architecture.md#Padrões de Nomenclatura] (snake_case plural, UUID v7, FK, índices, camelCase↔snake_case, timestamptz)
- [Source: _bmad-output/planning-artifacts/prds/prd-robbia-2026-06-14/prd.md#4.3] (os 7 Tipos de Bloco)
- [Source: _bmad-output/implementation-artifacts/1-1-scaffold-monorepo.md] (fundação @robbia/db e @robbia/shared, padrões, learnings)

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (1M context) — BMad dev-story workflow

### Debug Log References

- `bun add uuidv7` → uuidv7@1.2.1 em `@robbia/db`.
- `drizzle-kit generate` (com `DATABASE_URL` setada; não conecta ao banco) → `0000_short_captain_stacy.sql`: 4 tabelas (blocks 11 col/1 idx/2 fk, harnesses 6, model_configs 6/1 idx/1 fk, providers 7).
- Biome `ci` acusou format dos JSON gerados pelo drizzle (`drizzle/meta/*`) → excluído `**/drizzle` do Biome; `biome migrate` atualizou o schema para 2.5.0 (`recommended:true` → `preset:"recommended"`).

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- ✅ **Schema de domínio (4 tabelas)** em `@robbia/db`: `harnesses`, `blocks` (enum `block_type` com os 7 Tipos), `providers`, `model_configs` — `snake_case` plural, PK **UUID v7** (`uuidv7` no `$defaultFn`), FKs com `onDelete` (cascade/set null), índices `idx_blocks_harness_id`/`idx_model_configs_provider_id`, timestamps `timestamptz` UTC. **Sem** execution/conversa/credencial e **sem** pgvector (escopo respeitado).
- ✅ **Schemas Zod** em `@robbia/shared`: `BlockTypeSchema`/`BlockSchema`/`HarnessSchema` com tipos inferidos. **Fonte única de verdade** dos Tipos de Bloco: `BLOCK_TYPES` (shared) alimenta tanto o `z.enum` quanto o `pgEnum` do db — zero divergência.
- ✅ **Migration gerada** (`packages/db/drizzle/0000_*.sql` + meta). `createDbClient` (Story 1.1) agora flui o `schema` populado, mantendo-se o único acesso ao Postgres.
- ✅ **Testes:** 20 pass / 0 fail (shared schemas: enum/válido/inválido/default; db: 4 tabelas + enum de 7). Lint/typecheck verdes.
- ⚠️ **Aplicação live da migration pendente:** `drizzle-kit generate` não precisa de banco e rodou; `db:migrate` (aplicar) exige Postgres rodando (Docker daemon offline neste ambiente). Para aplicar: subir o Docker e `DATABASE_URL=... bun run --filter @robbia/db db:migrate`.
- 📌 **Decisão (a confirmar no review):** `blocks.depends_on` modelado como `jsonb` (array de IDs) para o fluxo de dados entre Blocos; `providers.kind`/`harnesses.status`/`blocks` config como `text`/`jsonb` flexíveis (constraints finos virão com o uso real nas stories seguintes).

### File List

**packages/shared:** `src/schemas/{block-type,block,harness,index}.ts` (novos) · `src/schemas/schemas.test.ts` (novo) · `src/index.ts` (modificado: reexporta schemas)
**packages/db:** `src/schema/{block-type,blocks,harnesses,model-configs,providers,index}.ts` (novos/substitui stub) · `src/schema/index.test.ts` (novo) · `drizzle/0000_short_captain_stacy.sql` + `drizzle/meta/*` (migration gerada) · `package.json` (modificado: +`uuidv7`, +script `test`)
**raiz:** `biome.json` (modificado: exclui `**/drizzle`, schema → 2.5.0) · `bun.lock` (modificado)

## Change Log

| Data | Mudança |
|------|---------|
| 2026-06-14 | Story 1.2 criada (ready-for-dev): schema de domínio Harness/Block/Provider/ModelConfig (Drizzle) + schemas Zod em @robbia/shared. |
| 2026-06-14 | Story 1.2 implementada: 4 tabelas Drizzle (UUID v7, enum block_type, FKs, índices, timestamptz), schemas Zod (fonte única dos Tipos de Bloco), migration `0000_*` gerada, +5 testes (20 pass total). Lint/typecheck/test verdes; aplicação live da migration pendente (Docker offline). Status → review. |
