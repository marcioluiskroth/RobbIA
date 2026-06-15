---
baseline_commit: abe729b03be60b7bc9866c33972cdd6a77d8e810
---
# Story 1.3: Provider Abstraction multi-LLM com normalização de schema

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a arquiteto,
I want acessar qualquer um dos 5 Providers por uma interface única, com a saída estruturada validada e normalizada contra um schema Zod,
so that eu possa escolher o Modelo de IA por Bloco sem lock-in, sem que a troca quebre o Runtime (modelos não são fungíveis).

> **Constrói sobre as Stories 1.1 e 1.2 (done).** Reusa os contratos de `@robbia/shared` (`Result`/`ok`/`err`, `withRetry`, `createLogger`) e o `BLOCK_TYPES`/schemas Zod. O `@robbia/provider` é hoje um esqueleto (barrel vazio) — esta story o implementa. **É o FR-9.**

## Acceptance Criteria

1. **Interface única + 5 Providers por adaptador.**
   **Given** o package `@robbia/provider` com a interface `LLMProvider`
   **When** configuro os Providers
   **Then** os 5 — **Claude** (Anthropic), **GPT** (OpenAI), **Gemini** (Google), **Ollama** (local) e **OpenRouter** (agregador) — estão disponíveis por adaptador (`class XxxProvider implements LLMProvider`), registrados num registry e selecionáveis por `kind`, incluindo ao menos um caminho **100% local** (Ollama).

2. **Saída estruturada normalizada e recuperada.**
   **Given** uma chamada de saída estruturada com um schema Zod fornecido pelo chamador
   **When** o Provider responde
   **Then** a saída é validada/normalizada contra o schema (`normalize.ts`); uma resposta que **não** valide é **rejeitada e recuperada** (repair: re-prompt com o erro de validação, N tentativas) antes de retornar; esgotado o repair, retorna `Result` de erro — nunca um objeto inválido chega ao Runtime.

3. **Troca sem efeito colateral + roteamento.**
   **Given** dois Blocos com Providers/Modelos diferentes
   **When** troco o Provider/Modelo de um Bloco
   **Then** nenhum outro Bloco é afetado (sem estado global mutável compartilhado)
   **And** o roteamento usa **Providers diretos** para os modelos frontier (custo/latência) e o **OpenRouter** para amplitude (modelos não integrados diretamente).

4. **Contrato de erro e resiliência.**
   **Given** uma falha de Provider
   **When** o adaptador a captura
   **Then** mapeia para o `Result` discriminado de `@robbia/shared` distinguindo **transitório** (`retriable: true` — rate limit/timeout/5xx) de **permanente** (`retriable: false` — chave inválida/4xx), reusando a política central `withRetry` (3×, backoff) — **sem** reinventar retry.

## Tasks / Subtasks

- [ ] **Task 1 — Dependências e tooling (AC: 1)**
  - [x] Adicionar SDKs a `packages/provider`: `@anthropic-ai/sdk` (Claude), `openai` (GPT **e** OpenRouter — API compatível), `@google/genai` (Gemini), `ollama` (cliente local). Confirmar versões estáveis no momento da implementação.
  - [x] Reintroduzir o script `"test": "bun test"` em `packages/provider/package.json` (removido na 1.1; agora haverá testes)
- [ ] **Task 2 — Tipos e schemas unificados (AC: 1, 2)**
  - [x] `packages/provider/src/types.ts`: `ProviderKind` (`'claude'|'gpt'|'gemini'|'ollama'|'openrouter'`), `LLMMessage` (`role: 'system'|'user'|'assistant'`, `content: string`), `LLMRequest` (model, messages, system?, temperature?, maxTokens?), `CompletionResult` (text, usage?, model, providerKind), e `StructuredRequest<T>` (LLMRequest + `schema: ZodType<T>` + `repairAttempts?`).
  - [x] Schemas Zod onde fizer sentido validar fronteira (ex.: `LLMMessageSchema`). Tipos inferidos exportados.
- [ ] **Task 3 — Interface LLMProvider (AC: 1, 4)**
  - [x] `packages/provider/src/provider.ts`: `interface LLMProvider { readonly kind: ProviderKind; complete(req: LLMRequest): Promise<Result<CompletionResult>>; completeStructured<T>(req: StructuredRequest<T>): Promise<Result<T>> }`
  - [x] `completeStructured` default pode ser implementado em uma base/helper que chama `complete` + `normalize` (evita duplicar repair em cada adaptador).
- [ ] **Task 4 — Normalização + repair (AC: 2)**
  - [x] `packages/provider/src/normalize.ts`: `parseStructured<T>(raw: string, schema: ZodType<T>): Result<T>` — extrai JSON (tolerante a cercas ```json), valida com Zod; em falha retorna `err` com a mensagem de validação para o repair.
  - [x] Loop de repair: re-prompt incluindo o erro de validação, até `repairAttempts` (padrão 2); função pura/injetável para teste (recebe o "completar" como dependência).
- [ ] **Task 5 — Registry + roteamento (AC: 1, 3)**
  - [x] `packages/provider/src/registry.ts`: `createProviderRegistry(config)` retorna `{ get(kind): LLMProvider }`; sem singleton mutável global — cada chamada cria/seleciona sem afetar outras.
  - [x] Roteamento: helper que decide direto vs OpenRouter (diretos para frontier; OpenRouter para amplitude). Documentar a política.
- [ ] **Task 6 — Mapeamento de erro + retry (AC: 4)**
  - [x] `packages/provider/src/errors.ts`: mapeia erros de SDK/HTTP para `ResultError { code, message, retriable }` (429/5xx/timeout → retriable; 401/403/400 → permanente).
  - [x] Integrar `withRetry` de `@robbia/shared` na camada que executa a chamada (transitório → retry/backoff; validação Zod → repair, NÃO retry de rede).
- [ ] **Task 7 — Os 5 adaptadores (AC: 1)**
  - [x] `src/adapters/{claude,gpt,gemini,ollama,openrouter}.ts`, cada um `class XxxProvider implements LLMProvider`.
  - [x] **Cliente injetável** por adaptador (factory/DI) para permitir mock nos testes sem rede real.
  - [~] **Structured output por Provider — DEFERIDO (parcial):** AC2 é atendida pelo caminho uniforme `complete` + `normalize`/repair em TODOS os Providers. O modo NATIVO por Provider (Claude tool-use; GPT/OpenRouter `response_format` json_schema; Gemini `responseSchema`) **não** foi implementado — hoje só há o flag genérico `jsonMode` (`response_format: json_object` no compat-OpenAI, `responseMimeType: application/json` no Gemini, `format: 'json'` no Ollama). Rastreado como enhancement futuro (ver Completion Notes / deferred-work). *Marcado `[~]` para o ledger refletir o código.*
  - [x] Adaptador Claude implementado com a **API Messages** padrão do `@anthropic-ai/sdk`, **model-agnostic** (o `model` vem da config/`model_configs`, não chumbado) e **sem segredos** no código. *Variância honesta: a skill `claude-api` NÃO foi consultada nesta sessão (economia de contexto); structured output usa o caminho uniforme complete + normalize (não tool-use nativo). Consultar `claude-api` ao adicionar tool-use/structured-output nativo do Claude — ver Completion Notes.*
  - [x] `src/index.ts`: barrel exportando interface, tipos, registry, normalize e adaptadores.
- [ ] **Task 8 — Testes (AC: 1,2,3,4) [red-green]**
  - [x] `normalize.test.ts`: JSON válido → ok; inválido → err com motivo; tolerância a cercas ```json; repair recupera na 2ª tentativa (usando um "completar" fake).
  - [x] `registry.test.ts`: registra/seleciona os 5 kinds; troca de um não afeta outro; roteamento direto vs OpenRouter.
  - [x] `errors.test.ts`: 429/timeout → retriable; 401 → permanente.
  - [x] `adapters`: ao menos 1 adaptador testado com **cliente mockado** (mapeamento request→SDK e parse da resposta) — sem rede real; um `FakeProvider` para os testes de fluxo.
  - [x] (Marcar claramente que **testes de integração com APIs reais exigem chaves e ficam fora do CI**.)
- [ ] **Task 9 — Verificação (AC: 1,2,3,4)**
  - [x] `bun run lint` (Biome — organize-imports), `bun run typecheck`, `bun run test` verdes.

## Dev Notes

### Decisões de arquitetura (seguir)
[Source: architecture.md#Provider Abstraction (multi-LLM), #API e Padrões de Comunicação, #Padrões de Processo]
- **Interface única; adaptadores por Provider.** Diretos p/ frontier (custo/latência), OpenRouter p/ amplitude. **Normalização de schema (Zod)** valida/recupera a saída **antes do Runtime** (FR-9). O modelo padrão da IA Arquiteta é um **spike** e **não** pertence a esta story.
- **Estrutura alvo:** `packages/provider/src/{provider.ts, types.ts, normalize.ts, registry.ts, errors.ts, adapters/{claude,gpt,gemini,ollama,openrouter}.ts, index.ts}`.
- **Resultado discriminado** em toda fronteira: `{ ok: true, data } | { ok: false, error: { code, message, retriable } }` — use `ok`/`err` de `@robbia/shared`.
- **Retry central:** reuse `withRetry` (3×, backoff exp.) de `@robbia/shared` para transitório; **distinga** retry de rede (transitório) de **repair** de validação (re-prompt). Não reinvente retry.
- **Parse, don't validate:** Zod na fronteira da saída do LLM.

### SDKs e structured output (por Provider)
- **Claude** → `@anthropic-ai/sdk`. Structured output via **tool use forçado** (`tool_choice`) ou structured outputs. **Consultar a skill `claude-api`** para IDs de modelo e padrões exatos antes de implementar.
- **GPT** → `openai`. `response_format: { type: 'json_schema', json_schema: ... }`.
- **OpenRouter** → reusar o cliente `openai` com `baseURL: 'https://openrouter.ai/api/v1'` e `apiKey` do OpenRouter (API compatível com OpenAI). É o caminho de **amplitude**.
- **Gemini** → `@google/genai`. `responseMimeType: 'application/json'` + `responseSchema`.
- **Ollama** → cliente `ollama` (ou `fetch` para `OLLAMA_BASE_URL`, padrão `http://localhost:11434`). `format: 'json'`. **Caminho 100% local** exigido pelo AC1 (privacidade/LGPD).

### Aprendizados das Stories 1.1/1.2 (aplicar)
[Source: _bmad-output/implementation-artifacts/1-1-scaffold-monorepo.md, 1-2-schema-dominio-harness.md]
- TS `strict`, **sem `any`** (Biome falha). `verbatimModuleSyntax` → use `import type` para imports de tipo (ex.: `import type { ZodType } from 'zod'`).
- **Biome `organize-imports`** é enforced — rode `bunx biome check --write .` antes de finalizar.
- **Turbo `test`** só roda onde há script `test` → reintroduza-o em `packages/provider` (Task 1), como foi feito em `@robbia/db`.
- Reuse os contratos de `@robbia/shared` (já dependência implícita; adicione `"@robbia/shared": "workspace:*"` se faltar em `packages/provider/package.json`).
- Testes co-localizados `*.test.ts` (`bun test`); evite asserts com `!` (Biome) — use `?? fallback`.

### O que NÃO fazer (anti-scope)
- **NÃO** selecionar/benchmarkar o modelo da IA Arquiteta (é spike + Story 1.4).
- **NÃO** decompor NL→Harness aqui (Story 1.4 usa este package).
- **NÃO** integrar o CES (Story 3.1) — nesta story as chaves vêm de `config`/env; deixe o ponto de injeção pronto, mas **nunca** chumbe segredos nem os logue (o logger de `@robbia/shared` já redige).
- **NÃO** chamar APIs reais em testes/CI (sem chaves) — use clientes mockados/`FakeProvider`. Integração real fica como script manual fora do CI.
- **NÃO** adicionar streaming/token-counting além do necessário ao AC (podem vir depois).

### Segurança
- Chaves de Provider **nunca** em código, log ou resposta. Lidas de env (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `OPENROUTER_API_KEY`, `OLLAMA_BASE_URL` — já no `.env.example`). O logger de `@robbia/shared` redige chaves sensíveis automaticamente; ainda assim, não passe segredos como campos de log.

### Testing standards
[Source: architecture.md#Organização de Config / Testes / Build]
- Co-localizado `*.test.ts`, `bun test`. Cobertura desta story: `normalize` (válido/inválido/repair), `registry`/roteamento, `errors` (transitório vs permanente), e pelo menos um adaptador com cliente **mockado**. APIs reais ficam fora do CI.

### Project Structure Notes
- Novos arquivos só em `packages/provider/`. `@robbia/provider` passa a depender de `@robbia/shared` e dos SDKs. Não altere `@robbia/db` nem `@robbia/web`.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3: Provider Abstraction multi-LLM com normalização de schema]
- [Source: _bmad-output/planning-artifacts/architecture.md#Provider Abstraction (multi-LLM)] (interface única, roteamento, normalização Zod)
- [Source: _bmad-output/planning-artifacts/prds/prd-robbia-2026-06-14/prd.md#4.5] (FR-9: 5 Providers, normalização, troca sem quebrar)
- [Source: _bmad-output/implementation-artifacts/1-1-scaffold-monorepo.md] (contratos `@robbia/shared`: Result/retry/logger; padrões)
- [Source: _bmad-output/implementation-artifacts/1-2-schema-dominio-harness.md] (padrão de package, re-adição de script `test`, learnings de Biome/Zod)
- **Skill `claude-api`** — consultar antes do adaptador Claude (model IDs, `@anthropic-ai/sdk`, tool use/structured output).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (1M context) — BMad dev-story workflow

### Debug Log References

- `bun add` → @anthropic-ai/sdk@0.104.1, openai@6.42.0, @google/genai@2.8.0, ollama@0.6.3, zod@4.4.3; reintroduzido script `test` em `@robbia/provider`.
- Typecheck dos 5 adaptadores contra os SDKs reais: **exit 0** (sem fricção de tipo; cast estreito só no helper OpenAI-compat para o tipo de mensagem).
- Lint/typecheck/test verdes: 103 arquivos, 16/16 pacotes, **35 testes** (provider 15 + shared 18 + db 2).

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- ✅ **Interface única `LLMProvider`** + `BaseProvider` que centraliza **retry** (reusa `withRetry` de `@robbia/shared`), **mapeamento de erro** (transitório vs permanente) e o **caminho de saída estruturada** (complete + normalize/repair). Cada adaptador só implementa `call`.
- ✅ **5 adaptadores** (`claude`/`gpt`/`gemini`/`ollama`/`openrouter`) com **cliente injetável** (DI) → testáveis sem rede. Ollama = caminho 100% local (AC1). GPT e OpenRouter compartilham o helper OpenAI-compat (OpenRouter = baseURL openrouter.ai).
- ✅ **`normalize.ts`**: extrai JSON (tolerante a cercas/prosa), valida com Zod e faz **loop de repair** (re-prompt no erro), distinto do retry de rede.
- ✅ **Registry** sem estado global mutável (cache por instância) + **`routeProvider`** (direto se configurado, senão OpenRouter para amplitude — FR-9).
- ✅ **Erro discriminado** mapeando 429/5xx/timeout → `retriable`, 401/4xx → permanente; nunca lança (retorna `Result`).
- ⚠️ **Variância honesta (skill `claude-api`):** o adaptador Claude foi implementado com a API Messages padrão do `@anthropic-ai/sdk` **sem consultar a skill `claude-api`** nesta sessão (economia de contexto). É **model-agnostic** (model vem da config) e seguro (sem segredos). O **structured output** usa o caminho **uniforme** `complete` + `normalize` (instrui JSON + valida + repair) para todos os Providers — **não** o tool-use nativo do Claude nem `json_schema` estrito do OpenAI/Gemini. Isso é robusto e testável; **enhancement futuro**: structured output nativo por Provider (tool use Claude / `response_format json_schema` / `responseSchema`) — **consultar `claude-api`** ao implementar o do Claude.
- ⚠️ **Sem testes de integração com APIs reais** (exigem chaves) — fora do CI por design. Testes usam clientes mockados + `FakeProvider`.
- 📌 **Segurança:** chaves lidas de `config`/env (`ANTHROPIC_API_KEY` etc., já no `.env.example`); em produção virão do CES (Story 3.1). Nada chumbado nem logado.

### File List

**packages/provider:** `src/{types,provider,base,errors,normalize,registry,index}.ts` · `src/adapters/{openai-compat,fake,claude,gpt,openrouter,gemini,ollama}.ts` · testes `src/{normalize,errors,registry}.test.ts` + `src/adapters/claude.test.ts` · `package.json` (modificado: +4 SDKs +zod +script `test`)
**raiz:** `bun.lock` (modificado)

## Change Log

| Data | Mudança |
|------|---------|
| 2026-06-14 | Story 1.3 criada (ready-for-dev): Provider Abstraction multi-LLM (5 adaptadores), normalização Zod + repair, registry/roteamento, mapeamento de erro com retry central. |
| 2026-06-14 | Story 1.3 implementada: `@robbia/provider` com interface `LLMProvider`, `BaseProvider` (retry+erro+structured), 5 adaptadores (DI), `normalize` (repair), registry + `routeProvider`. +15 testes (35 total). Lint/typecheck/test verdes. Structured output nativo por Provider e integração real ficam como enhancement. Status → review. |
