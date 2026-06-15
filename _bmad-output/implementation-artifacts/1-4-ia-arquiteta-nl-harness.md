---
baseline_commit: 7de57aa03377c84eca9119af4d06b31448d38b59
---
# Story 1.4: IA Arquiteta — decomposição de linguagem natural em Harness

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a arquiteto,
I want descrever uma automação em linguagem natural e receber uma proposta de Harness em Blocos (ou um pedido de esclarecimento),
so that eu obtenha um ponto de partida estruturado sem montar o fluxo nó a nó — o coração/moat do produto.

> **Constrói sobre 1.2 e 1.3 (done/merged).** Consome `@robbia/provider` (`LLMProvider.completeStructured` — validação Zod + repair já prontos) e o `HarnessSchema` de `@robbia/shared`. O `@robbia/architect` é hoje um esqueleto. **É o FR-1.**

## Acceptance Criteria

1. **NL → proposta de Harness validada.**
   **Given** o package `@robbia/architect` (system-prompt, decompose, schema/parser, validator) e um `LLMProvider` + modelo configurável (default = spike, ver Dev Notes)
   **When** envio uma descrição em linguagem natural
   **Then** recebo uma proposta de Harness com **Blocos ordenados**, cada um com **Tipo**, **Modelo de IA sugerido (ou "sem LLM")** e **justificativa de 1 linha**, validada contra `HarnessSchema` (FR-1) — a saída inválida é rejeitada/recuperada pelo `completeStructured` antes de retornar.

2. **Sistema sem API → Bloco RPA.**
   **Given** um pedido que implica um sistema **sem API**
   **When** a IA Arquiteta decompõe
   **Then** a proposta inclui **ao menos um Bloco do Tipo RPA** (instruído no system-prompt; um validador semântico sinaliza quando a heurística de "sem API" não tem RPA).

3. **Consciência de recursos conectados (moat).**
   **Given** Canais/recursos já conectados ao Workspace (passados como contexto)
   **When** a IA Arquiteta planeja
   **Then** o system-prompt inclui esses recursos e instrui a propor Gatilho/Ação compatíveis (ex.: Telegram conectado → Gatilho/Ação de Telegram), em vez de propor às cegas.

4. **Pede esclarecimento quando falta entrada obrigatória.**
   **Given** entradas obrigatórias que não podem ser inferidas (Canal de origem, sistema-alvo, credencial/recurso ausente)
   **When** a IA Arquiteta processa o pedido
   **Then** retorna um resultado do tipo **`clarification`** com perguntas objetivas — em vez de inventar um Harness. (A saída é um union discriminado `harness | clarification`.)

## Tasks / Subtasks

- [ ] **Task 1 — Tooling/deps (AC: 1)**
  - [x] `packages/architect/package.json`: garantir deps `@robbia/provider` (`workspace:*`), `@robbia/shared` (`workspace:*`) e `zod`; reintroduzir o script `"test": "bun test"`.
- [ ] **Task 2 — Schema da resposta da IA Arquiteta (AC: 1, 4)**
  - [x] `src/schema.ts`: `HarnessProposalSchema = z.object({ kind: z.literal('harness'), harness: HarnessSchema })` (reusa `HarnessSchema` de `@robbia/shared`); `ClarificationSchema = z.object({ kind: z.literal('clarification'), questions: z.array(z.string().min(1)).min(1) })`; `ArchitectResponseSchema = z.discriminatedUnion('kind', [HarnessProposalSchema, ClarificationSchema])`. Tipos inferidos (`ArchitectResponse`, etc.).
- [ ] **Task 3 — Contexto de Workspace (AC: 3)**
  - [x] `src/types.ts`: `WorkspaceContext` (`connectedChannels: string[]`, `availableProviders: ProviderKind[]`, `notes?: string`) e `ArchitectInput` (`description: string`, `workspace?: WorkspaceContext`, `model: string`, `repairAttempts?`).
- [ ] **Task 4 — System prompt (AC: 1, 2, 3, 4)**
  - [x] `src/system-prompt.ts`: `buildSystemPrompt(workspace?)` que instrui a IA Arquiteta a: decompor em Blocos ordenados (Tipo dentre os 7, Modelo sugerido ou "sem LLM", justificativa de 1 linha); **incluir Bloco RPA** quando o alvo não tem API; **considerar os recursos conectados** (lista injetada); **pedir esclarecimento** (responder `kind:"clarification"`) quando faltar Canal/sistema-alvo/credencial; e **responder SOMENTE JSON** no formato do `ArchitectResponseSchema`. Voz técnica/colega sênior (UX-DR19), PT-BR.
- [ ] **Task 5 — Decompose (AC: 1, 4)**
  - [x] `src/decompose.ts`: `decompose(provider: LLMProvider, input: ArchitectInput): Promise<Result<ArchitectResponse>>` — monta system + `messages:[{role:'user', content: description}]`, chama `provider.completeStructured({ model, system, messages, schema: ArchitectResponseSchema, repairAttempts })`. Retorna o `Result` (harness ou clarification) — propaga erro de Provider.
- [ ] **Task 6 — Validador semântico (AC: 2)**
  - [x] `src/validator.ts`: helpers puros sobre uma proposta de Harness — `proposalHasRpa(harness): boolean`, `everyBlockHasJustification(harness): boolean`, e `reviewProposal(harness, hints?): { warnings: string[] }` (ex.: warning quando `hints.targetHasNoApi` e não há RPA). Usado para instrumentar qualidade (SM-1/SM-4), **não** para bloquear.
  - [x] `src/index.ts`: barrel (schema, types, system-prompt, decompose, validator).
- [ ] **Task 7 — Testes (AC: 1,2,3,4) [red-green]**
  - [x] `schema.test.ts`: valida proposta `harness` e `clarification`; rejeita `kind` desconhecido / harness sem blocos / clarification sem perguntas.
  - [x] `system-prompt.test.ts`: o prompt inclui os recursos conectados (ex.: 'telegram'), a regra de RPA-sem-API e a instrução de clarification + formato JSON.
  - [x] `decompose.test.ts` (com `FakeProvider` de `@robbia/provider`): caminho **harness** (retorna Harness parseado), caminho **clarification** (retorna perguntas), e **erro de Provider** propagado.
  - [x] `validator.test.ts`: `proposalHasRpa`/`everyBlockHasJustification`/`reviewProposal` (warning quando sem-API e sem RPA).
- [ ] **Task 8 — Verificação (AC: 1,2,3,4)**
  - [x] `bun run lint` (Biome — organize-imports), `bun run typecheck`, `bun run test` verdes.

## Dev Notes

### Decisões de arquitetura (seguir)
[Source: architecture.md#Sequência de Implementação (item 3), #Provider Abstraction, #Arquitetura de Dados]
- **`packages/architect/src/{system-prompt,decompose,parser,validator}.ts`** — a IA Arquiteta. Nesta implementação, o "parser/validator" da saída do LLM **é o Zod** (via `completeStructured`): `schema.ts` carrega o `ArchitectResponseSchema`; `validator.ts` faz checagens **semânticas** da proposta (consequências testáveis: tem RPA? toda justificativa presente?).
- **Reusa `@robbia/provider` (1.3):** chame `provider.completeStructured({ ..., schema })` — você ganha validação Zod + **repair** + retry/erro de graça. **NÃO** chame SDKs de LLM diretamente aqui.
- **Reusa `HarnessSchema` (1.2)** de `@robbia/shared` como a forma da proposta — **não** redefina os Tipos de Bloco (use `BLOCK_TYPES`/`HarnessSchema`).
- **Resultado discriminado** (`Result` de `@robbia/shared`) na fronteira; nunca lance para fluxo normal.

### Spike — modelo padrão da IA Arquiteta (diferido)
- O **modelo padrão** específico (ex.: Claude Opus vs. Sonnet) é um **spike de arquitetura** (benchmark de qualidade de decomposição) — **NÃO** decida/benchmarke aqui. `decompose` recebe `model` por `ArchitectInput` (configurável). Deixe um default sensato documentado como provisório, mas o valor vem da config.

### Aprendizados de 1.1–1.3 (aplicar)
[Source: _bmad-output/implementation-artifacts/1-3-provider-abstraction.md, 1-2-…, 1-1-…]
- TS `strict`, sem `any`; `import type` para tipos (`verbatimModuleSyntax`). Biome `organize-imports` enforced (`bunx biome check --write .`).
- **Turbo `test`** só roda onde há script `test` → reintroduza em `@robbia/architect`.
- **Testabilidade sem rede:** use o `FakeProvider` de `@robbia/provider` (já existe) injetando uma resposta JSON canônica — não chame LLM real (fora do CI).
- Reuse `Result`/`ok`/`err` de `@robbia/shared`; `completeStructured` de `@robbia/provider`.

### O que NÃO fazer (anti-scope)
- **NÃO** executar o Harness (Runtime = Epic 2) nem persistir no banco (a UI/CRUD entra em 1.6–1.8).
- **NÃO** construir a UI de cards/aprovação (Stories 1.6–1.8).
- **NÃO** benchmarkar/fixar o modelo da IA Arquiteta (spike).
- **NÃO** chamar SDKs de LLM diretamente — use `@robbia/provider`.
- **NÃO** chamar APIs reais em testes/CI — `FakeProvider`.

### Segurança
- A IA Arquiteta recebe só descrição + contexto de Workspace (recursos conectados) — **nunca** segredos/credenciais no prompt. O `completeStructured` já roteia pelo Provider (chaves via env/CES). Não logar conteúdo sensível (logger de shared redige).

### Testing standards
[Source: architecture.md#Organização de Config / Testes / Build]
- Co-localizado `*.test.ts`, `bun test`. Cobertura: schema (harness/clarification), system-prompt (recursos+regras), decompose (harness/clarification/erro via FakeProvider), validator. APIs reais fora do CI.

### Project Structure Notes
- Novos arquivos só em `packages/architect/`. `@robbia/architect` passa a depender de `@robbia/provider` + `@robbia/shared` + `zod`. Não altere outros packages.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4: IA Arquiteta — decomposição de linguagem natural em Harness]
- [Source: _bmad-output/planning-artifacts/prds/prd-robbia-2026-06-14/prd.md#4.1] (FR-1: decompor pedido em Harness; consequências testáveis: RPA-sem-API, consciência de recursos, clarification)
- [Source: _bmad-output/planning-artifacts/architecture.md#Provider Abstraction (multi-LLM)] (normalização/validação antes do Runtime)
- [Source: _bmad-output/implementation-artifacts/1-3-provider-abstraction.md] (`LLMProvider`, `completeStructured`, `FakeProvider`)
- [Source: _bmad-output/implementation-artifacts/1-2-schema-dominio-harness.md] (`HarnessSchema`, `BLOCK_TYPES`)

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (1M context) — BMad dev-story workflow

### Debug Log References

- `bun add @robbia/provider@workspace:* zod` em `@robbia/architect`; reintroduzido script `test`.
- Typecheck do `completeStructured<ArchitectResponse>` com o **union discriminado** `harness|clarification`: exit 0 (sem cast).
- Lint/typecheck/test verdes: 112 arquivos, 16/16 pacotes, **46 testes** (architect 11 + provider 15 + shared 18 + db 2).

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- ✅ **`decompose(provider, input)`** reusa `provider.completeStructured` (1.3) com o `ArchitectResponseSchema` → ganha validação Zod + **repair** + retry/erro de graça. **Não** chama LLM diretamente.
- ✅ **Saída = union discriminado** `harness | clarification` — a IA Arquiteta pede esclarecimento (FR-1 AC4) em vez de inventar quando falta Canal/sistema-alvo/credencial.
- ✅ **`system-prompt`** instrui: Blocos ordenados (Tipo/Modelo/justificativa), **RPA quando sem API** (AC2), **consciência de recursos conectados** (AC3, injetados no prompt) e formato JSON estrito.
- ✅ **`validator`** semântico (`proposalHasRpa`/`everyBlockHasJustification`/`reviewProposal`) — instrumenta qualidade (SM-1/SM-4) com warnings, **não** bloqueia.
- ✅ **`HarnessSchema`/`BLOCK_TYPES` reusados** de `@robbia/shared` (1.2) — fonte única, sem redefinição de Tipos de Bloco.
- ✅ **Testes** com `FakeProvider` (sem rede): caminhos harness/clarification/erro; schema; system-prompt; validator.
- 📌 **Spike (diferido):** o modelo padrão da IA Arquiteta (benchmark de decomposição) **não** foi fixado — `model` vem de `ArchitectInput` (config). A escolha/benchmark fica para o spike de arquitetura.
- 📌 **Anti-scope respeitado:** sem execução de Harness (Epic 2), sem UI de cards (1.6–1.8), sem persistência; sem APIs reais no CI.
- 🔒 **Segurança:** a IA Arquiteta recebe só descrição + recursos conectados — nunca segredos no prompt; chaves via env/CES (pelo Provider).

### File List

**packages/architect:** `src/{types,schema,system-prompt,decompose,validator,index}.ts` · testes `src/{schema,system-prompt,decompose,validator}.test.ts` · `package.json` (modificado: +`@robbia/provider` +`zod` +script `test`)
**raiz:** `bun.lock` (modificado)

## Change Log

| Data | Mudança |
|------|---------|
| 2026-06-14 | Story 1.4 criada (ready-for-dev): IA Arquiteta NL→Harness (system-prompt, decompose via completeStructured, schema union harness|clarification, validador semântico). Consome @robbia/provider + HarnessSchema. |
| 2026-06-14 | Story 1.4 implementada: `@robbia/architect` (NL→Harness via `completeStructured`, union `harness|clarification`, system-prompt com RPA-sem-API + recursos conectados, validador semântico). +11 testes (46 total). Lint/typecheck/test verdes. Modelo padrão = spike diferido. Status → review. |
| 2026-06-15 | Code review (épico 1) resolvido: testes reforçados — regra RPA-sem-API agora assere a frase real (não só a palavra 'rpa' da enumeração), AC3 assere a instrução "Gatilho/Ação compatíveis", e a propagação de erro de Provider confere a identidade (`PROVIDER_HTTP_401`). Commit `5799ecd`. Lint/typecheck/test/build verdes. **Status → done.** |
