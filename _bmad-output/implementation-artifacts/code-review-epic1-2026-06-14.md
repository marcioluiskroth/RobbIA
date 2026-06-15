---
review_date: 2026-06-14
baseline_commit: 3b33593e81570a4f1978153194e29623d7630b85
scope: Epic 1 — Stories 1.1–1.5 (código mergeado em main)
method: revisão multi-agente adversarial (76 agentes — 15 revisores × 3 lentes, confirm+refute por achado, síntese triada)
overall_verdict: changes-requested
findings: 20 (high 1 · medium 6 · low 10 · nit 3)
---

# Relatório de Code Review — RobbIA Epic 1 (Stories 1.1–1.5)

**Veredito geral:** `changes-requested`

Epic 1 estabelece uma fundação coesa, tipada e majoritariamente bem testada. Há **1 achado high** (1.3) que bloqueia o merge, **5 achados medium**, e o restante low/nit. Não há corrupção de dados nem problema de segurança. As correções são, em sua maioria, localizadas e de baixo esforço.

| Story | Veredito | Achados (high/med/low/nit) |
|---|---|---|
| 1.1 Scaffold do monorepo | approve-with-nits | 0 / 1 / 1 / 2 |
| 1.2 Schema de domínio (Drizzle+Zod) | changes-requested | 0 / 1 / 1 / 0 |
| 1.3 Provider Abstraction multi-LLM | changes-requested | 1 / 3 / 2 / 0 |
| 1.4 IA Arquiteta (decomposição) | approve-with-nits | 0 / 0 / 2 / 1 |
| 1.5 Design system | approve-with-nits | 0 / 1 / 2 / 0 |

> Nenhum achado foi contestado (`contested`) na passada adversarial — todos sobreviveram com `verifyConfidence: high`.

---

## Story 1.1 — Scaffold do monorepo e fundação de qualidade

### 🟠 MEDIUM · acceptance-gap · `docker-compose.yml:18-29`
**AC#3 'docker-compose sobe postgres + web' nunca foi de fato executado — só `docker compose config` foi validado.**
A AC#3 exige que o compose **suba** ao menos `postgres` e `apps/web` localmente. As próprias notas da story (Task 5 e Completion Notes) revelam que o `docker compose up` ao vivo **nunca rodou** (daemon Docker offline); apenas `docker compose config` (validação de sintaxe/referências) foi executado. Isso não exercita o build/run do container web (`bun install --frozen-lockfile` in-container, build por pacote, serviço em :3000, ordenação por healthcheck). Não há smoke job de CI que compense — o `ci.yml` roda apenas install/lint/typecheck/test/turbo build. A cláusula 'And' da AC foi marcada satisfeita sem a evidência exigida.
**Correção:** rodar `docker compose up` contra um daemon vivo e confirmar postgres healthy + web respondendo em :3000 (curl → 200); ou adicionar um smoke job de CI (postgres + build-and-run da imagem web). Até lá, rebaixar o checkbox da AC#3 para TODO de verificação.

### 🔵 LOW · reuse-simplification · `packages/shared/src/logger.ts:14,181`
**`RESERVED_KEYS` é código morto — declarado e exportado pelo barrel, mas nunca consumido.**
A proteção das chaves canônicas em `emit()` é feita puramente pela ordem do spread (`{ ...safe, ts, level, service, correlationId, msg }`), que nunca lê `RESERVED_KEYS`. A constante documenta um invariante que não impõe e vaza um símbolo não usado para a API pública de `@robbia/shared`.
**Correção:** remover `RESERVED_KEYS` (e seu export no barrel); ou, se mantida, usá-la de fato em `emit()` (strip das reserved keys de `safe` antes do spread) para que constante e comportamento não divirjam.

### ⚪ NIT · test-gap · `packages/shared/src/jobs.ts:5-13`
**Constantes canônicas de nomes de job/evento (`jobs.ts`, `events.ts`) sobem com zero testes.**
São a fonte única de verdade para nomes de jobs pg-boss e eventos WebSocket, casados por string literal nos limites de integração. Um rename acidental (`harness.execute` → `harness.exec`) quebraria silenciosamente o roteamento sem teste que pegue. Não viola o plano de testes declarado (que enumerava só result/withRetry/logger), por isso é nit.
**Correção:** adicionar smoke test (`jobs.test.ts`/`events.test.ts`) fixando os valores literais exatos e o conjunto de chaves esperado.

### ⚪ NIT · reuse-simplification · `apps/ces/src/env.ts:1-12`
**`env.ts` (loadEnv/EnvSchema) por app é byte-idêntico nos 5 apps — boilerplate duplicado.**
O mesmo `EnvSchema` (`z.object({ NODE_ENV: ... })`) e `loadEnv()` estão copiados em ces/gateway/runtime/rpa-web-worker/rpa-desktop-worker. Aceitável para skeletons, mas convida a drift quando cada app adicionar `DATABASE_URL`/secrets.
**Correção:** exportar um `baseEnvSchema` (ou helper `makeLoadEnv(schema)`) de `@robbia/shared` e cada app estender com `baseEnvSchema.extend({ ... })`.

---

## Story 1.2 — Schema de domínio do Harness (Drizzle) + Zod

### 🟠 MEDIUM · correctness · `packages/db/src/schema/blocks.ts:25-27`
**Colunas jsonb inferem como `unknown` nos modelos Drizzle — buraco de tipo que força casts inseguros downstream.**
Nenhuma coluna jsonb declara `.$type<>()`, então o Drizzle infere `unknown`. Reproduzido empiricamente: `InferSelectModel` de `blocks.dependsOn`/`config`, `providers.config` e `modelConfigs.params` falham com `TS2322 Type 'unknown' is not assignable`. Consumidores (IA Arquiteta na 1.4, resolução de dependências entre blocos) recebem `unknown` e precisam castar em todo uso — o oposto da AC de 'tipagem forte'. Além disso, o `BlockSchema` do `@robbia/shared` tipa `config` como objeto, enquanto o DB infere `unknown` puro: contrato de persistência e de fronteira discordam.
**Correção:** anotar cada coluna jsonb, ex.: `dependsOn: jsonb('depends_on').$type<string[]>()...` e `config: jsonb('config').$type<Record<string, unknown>>()...` (idem `providers.config`, `model_configs.params`), reusando as shapes dos schemas Zod de `@robbia/shared`.

### 🔵 LOW · correctness · `packages/db/src/schema/blocks.ts:29`
**`updated_at` nunca é atualizado — `defaultNow()` só dispara no insert, sem `$onUpdate` nem trigger.**
Todas as tabelas usam `timestamp(...).notNull().defaultNow()` sem `$onUpdateFn`; a migração não tem trigger `ON UPDATE`. `updated_at` fica congelado no timestamp de criação e nunca reflete edições — justamente o fluxo central (editar proposta da IA Arquiteta na 1.4). Não é miss de AC (a AC só exige a coluna existir como timestamptz UTC), mas o nome da coluna afirma um contrato que o código não cumpre.
**Correção:** adicionar `.$onUpdateFn(() => new Date())` a todo `updatedAt` (ou implementar trigger BEFORE UPDATE no Postgres).

---

## Story 1.3 — Provider Abstraction multi-LLM com normalização de schema

### 🔴 HIGH · correctness · `packages/provider/src/adapters/openrouter.ts:14-18`
**`OpenRouterProvider` lança exceção síncrona quando não há API key — escapa do contrato Result.**
O adaptador passa `apiKey: config.apiKey ?? ''` para `new OpenAI(...)`. O SDK da OpenAI lança síncrono (`OpenAIError: Missing credentials...`) quando `apiKey` é falsy e não há `OPENAI_API_KEY` (verificado em runtime: o `''` explícito **bypassa** o fallback de env e lança mesmo com a env setada). Como providers são construídos lazy dentro de `registry.get()`/`build()` — **fora** do try/catch de `BaseProvider.complete` — o throw escapa do `Result` discriminado. Crítico: `routeProvider` chama `registry.get('openrouter')` **incondicionalmente** como fallback de breadth (registry.ts:74-75), então rotear, p.ex., um `gemini` sem OpenRouter configurado lança exceção não capturada em vez de `err(...)`, violando a AC4 ('nunca lança'). `GptProvider` evita isso com `config.apiKey ? { apiKey } : {}` (defere à env). Os testes atuais passam só porque injetam openrouter via overrides — o SDK real nunca é exercido.
**Correção:** construir o cliente lazy dentro de `call` (para o throw cair no try/catch de `complete` e ser mapeado por `mapProviderError`); ou guardar `routeProvider`/registry com `has('openrouter')` antes do `get('openrouter')`, retornando `err` permanente quando OpenRouter está desconfigurado. Não passar `apiKey` string vazia.

### 🟠 MEDIUM · correctness · `packages/provider/src/adapters/claude.ts:25-27`
**Mensagens `role:'system'` em `messages[]` são tratadas de forma inconsistente — descartadas (Claude) ou rotuladas como user (Gemini).**
`LLMMessageSchema` permite `role:'system'` e `LLMRequest.messages` é `LLMMessage[]`. Os adaptadores divergem: Claude faz `.filter((m) => m.role !== 'system')` — **descarta silenciosamente o conteúdo** (não redireciona para `req.system`); Gemini mapeia para `'user'` (conteúdo mantido, semântica errada); openai-compat/ollama (e gpt/openrouter via openAiChat) passam adiante. O mesmo `LLMRequest` normalizado produz prompts semanticamente diferentes (e perda de conteúdo no Claude) conforme o provider — minando a AC3 (fungibilidade, 'modelos não são fungíveis'). Manifesta-se apenas no caminho permitido-mas-não-idiomático de pôr system em `messages[]` em vez de `req.system`.
**Correção:** normalizar em um único lugar (BaseProvider ou helper): proibir `role:'system'` em `messages[]` no boundary, ou dobrar consistentemente qualquer system-message no canal system de cada adaptador. No mínimo, Claude deve prefixar em `req.system` em vez de filtrar.

### 🟠 MEDIUM · test-gap · `packages/provider/src/registry.test.ts:9-38`
**AC1 subtestada: 3 dos 5 adaptadores reais (Gemini, Ollama, OpenRouter) e o `build()` do registry nunca são exercitados; caminho 100% local Ollama com zero cobertura.**
Os testes do registry injetam `FakeProvider` via overrides, que curto-circuitam o switch real de `build()` — as classes reais nunca são construídas. Gemini/Ollama/OpenRouter (e também GPT/openai-compat) não têm teste algum, e nada assere que Ollama é selecionável nem que seu host local (`http://localhost:11434`) está cabeado. A afirmação central da AC1 ('os 5 disponíveis por adaptador, selecionáveis por kind, incluindo Ollama') está provada só para fakes.
**Correção:** adicionar teste que chama `createProviderRegistry(config)` **sem** overrides e assere `reg.get(kind).kind === kind` para os 5 kinds (exercitando `build()`). Adicionar testes de `OllamaProvider`/`OpenRouterProvider` com client mockado (como `claude.test.ts`), incluindo o default de host local do Ollama.

### 🟠 MEDIUM · test-gap · `packages/provider/src/errors.test.ts:1-32`
**AC4 retry-on-transitório nunca testado: nenhum teste prova que `withRetry` reexecuta um erro retriável e depois sucede.**
`errors.test.ts` só testa a classificação pura (`mapProviderError`/`isRetriableStatus`). A integração real em `BaseProvider.complete` (onde `withRetry` é cabeado com `isRetriable`) nunca é exercida para um caso retriável: o único teste de nível `complete()` usa 401 (PERMANENTE, não retenta). Não há teste de falha transitória (429/500) na tentativa 1 com sucesso na 2, nem de exaustão de `maxAttempts`. Nota: as duas metades de que a AC4 depende (classificação em `errors.test.ts` e o mecanismo de retry em `shared/retry.test.ts`) **estão** cobertas no nível unitário — falta apenas a cola de integração, por isso medium e não high.
**Correção:** teste baseado em FakeProvider que lança `{status:429}` na 1ª chamada e sucede na 2ª (asserindo retry → ok), e que `{status:401}` NÃO é retentado (handler chamado uma vez).

### 🔵 LOW · correctness · `packages/provider/src/normalize.ts:6-12`
**`extractJson` mantém prosa após o valor JSON, fazendo `JSON.parse` falhar em saída recuperável.**
A função acha o primeiro `[`/`{` e fatia até o **fim** da string (`candidate.slice(start)`), sem localizar o fecho correspondente. Para `{"name":"x","count":1} Hope this helps!`, retorna a string inteira e `JSON.parse` lança → `PARSE_INVALID_JSON`. O caso de prosa **ao final** (que a função alega tolerar) não é tolerado. Mitigado: retorna `err` (sem crash), o loop de repair pode recuperar e `jsonMode:true` reduz incidência — mas desperdiça uma tentativa. Testes só cobrem prosa no início.
**Correção:** após o primeiro bracket, varrer o fecho correspondente (contagem de profundidade respeitando string literals) e fatiar só o span balanceado; adicionar teste de prosa ao final.

### 🔵 LOW · test-gap · `packages/provider/src/normalize.test.ts:39-53`
**Teste de repair não verifica se o re-prompt inclui o erro de validação (AC2 're-prompt com o erro de validação').**
O teste só assere `res.ok` e `n===2` (completer chamado duas vezes). Nunca inspeciona as mensagens da 2ª tentativa, então não prova que o erro de validação anterior é realimentado no re-prompt (implementado em normalize.ts:56-65). Uma regressão que descartasse a mensagem de erro passaria igual.
**Correção:** capturar o `req` da tentativa 2 e asserir que suas `messages` contêm um turno user com o texto do erro (ex.: `/previous output was invalid/` + erro de schema).

### 🔵 LOW · acceptance-gap · `_bmad-output/implementation-artifacts/1-3-provider-abstraction.md:64`
**Task 7 (checkbox [x]) afirma structured output nativo (json_schema / responseSchema / tool use) por provider, mas o código não implementa.**
O código não faz json_schema nem responseSchema: openai-compat envia só `response_format {type:'json_object'}`; gemini envia só `responseMimeType:'application/json'` (sem `responseSchema`); claude não usa `tool_choice`. Só Ollama (`format:'json'`) bate com o claim. Existe apenas o caminho uniforme complete+normalize + flag genérica `jsonMode`. As Completion Notes já retratam isso como 'enhancement futuro' deferido, mas o checkbox segue [x], contradizendo o File List. AC2 é atendida via normalize/repair, então é gap de acurácia do ledger, não falha de AC.
**Correção:** implementar o structured output nativo por provider, ou marcar o sub-item da Task 7 como deferido/não-feito para o ledger refletir o código.

### 🔵 LOW · convention · `packages/provider/src/errors.ts:21`
**`mapProviderError` alarga `providerKind` para `string` em vez da união `ProviderKind`.**
Todos os callers passam um `ProviderKind` (`base.ts` chama `mapProviderError(error, this.kind)`), mas o parâmetro é `string`, descartando a informação e contrariando a convenção TS-strict do projeto. Sem bug funcional (só usado em interpolação de string).
**Correção:** importar `ProviderKind` de `./types` e mudar a assinatura para `mapProviderError(error: unknown, providerKind: ProviderKind): ResultError`. `errors.test.ts` já só passa kinds válidos — sem mudança de teste.

---

## Story 1.4 — IA Arquiteta: decomposição de linguagem natural em Harness

### 🔵 LOW · test-gap · `packages/architect/src/system-prompt.test.ts:10`
**Teste da regra AC2 'RPA-sem-API' passa pela enumeração de `BLOCK_TYPES`, não pela regra em si.**
A única assertion de RPA é `expect(prompt.toLowerCase()).toContain('rpa')`, mas 'rpa' aparece incondicionalmente na linha de enumeração de `BLOCK_TYPES`. Verificado: deletar a linha inteira da regra ('SEM API ... inclua AO MENOS UM Bloco do tipo "rpa"') mantém o teste verde. A assertion não verifica nada sobre a regra AC2 que diz cobrir.
**Correção:** asserir a frase da regra, ex.: `expect(prompt).toContain('SEM API')` e `expect(prompt).toMatch(/AO MENOS UM Bloco do tipo "rpa"/i)`.

### 🔵 LOW · test-gap · `packages/architect/src/system-prompt.test.ts:11`
**Teste da AC3 só checa presença do nome do canal, não a instrução 'propor Gatilho/Ação compatíveis'.**
A AC3 exige incluir os recursos conectados **e** instruir a propor Gatilho/Ação compatíveis. O teste só assere `toContain('telegram')`, satisfeito pela string de recurso injetada. Não cobre a instrução 'proponha Gatilho/Ação compatíveis ... em vez de propor às cegas' (system-prompt.ts:27) — a metade que define o moat da AC3.
**Correção:** `expect(prompt).toContain('Gatilho/Ação compatíveis')`.

### ⚪ NIT · test-gap · `packages/architect/src/decompose.test.ts:42`
**Teste de erro de Provider propagado não verifica a identidade do erro.**
O teste faz o FakeProvider lançar 401 e assere só `expect(res.ok).toBe(false)` — prova que 'algo falhou', não que o erro de Provider específico foi surfado (sem repair). Uma regressão que engolisse o erro real e retornasse um err não relacionado passaria. (O contrato primário do teste — retornar Result em vez de lançar — é coberto por `ok===false`, por isso nit.)
**Correção:** asserir a identidade, ex.: `if (!res.ok) expect(res.error.code).toBe('PROVIDER_HTTP_401')`. (Atenção: o exemplo da sugestão original cita `PROVIDER_AUTH`, mas o código produz `PROVIDER_HTTP_401`.)

---

## Story 1.5 — Design system: tokens, temas e componentes de estado

### 🟠 MEDIUM · test-gap · `apps/web/lib/block-types.test.ts:6-14`
**Teste de block-types não fixa o mapeamento ícone/shape/cor por tipo que a AC declara autoritativo.**
A AC3 faz de `BLOCK_TYPE_VISUALS` um mapa 'autoritativo e determinístico' com ícone/shape/cor-de-borda específicos por tipo. O teste só assere que cada campo é truthy. Um mapeamento errado — `rpa` usando `Database` em vez de `Monitor`, ou `verificacao` com shape `'diamond'` em vez de `'hexagon'` — passaria. O único valor realmente fixado é a disciplina do cyan. O mapa de produção está correto (sem bug vivo), mas é o contrato visual que o Builder da Story 1.6 vai consumir.
**Correção:** asserir o mapeamento concreto esperado para os 7 tipos (ex.: `expect(blockTypeVisual('verificacao').shape).toBe('hexagon')`, `expect(blockTypeVisual('rpa').icon).toBe(Monitor)`), ou comparar `BLOCK_TYPE_VISUALS` a um objeto esperado congelado.

### 🔵 LOW · test-gap · `apps/web/lib/block-types.test.ts:21-23`
**Teste de determinismo é tautológico — compara um objeto a si mesmo por referência.**
O teste 'é determinístico' chama `blockTypeVisual('gatilho')` duas vezes; o helper retorna `BLOCK_TYPE_VISUALS[type]` — a mesma referência de objeto —, então `toEqual` é trivialmente verdadeiro e nunca falha. Não assere nada sobre a AC3 'determinístico'. (Cobertura de 'todo tipo tem visual definido' já é dada pelo teste irmão nas linhas 6-14, e o tipo `Record<BlockType, ...>` já impede chaves faltantes/extras em compile time.)
**Correção:** remover o teste (determinismo é implícito por um const map) ou substituir por invariante real, ex.: asserir que as chaves de `BLOCK_TYPE_VISUALS` são exatamente iguais a `BLOCK_TYPES`.

### 🔵 LOW · acceptance-gap · `apps/web/app/design/page.tsx:9-51`
**A vitrine omite a paleta que afirma renderizar.**
A Task 5 e a completion note descrevem a `/design` renderizando 'a paleta, os 6 estados e os 7 Tipos de Bloco'. A página renderiza os 6 estados e os 7 tipos, mas **não há seção de paleta/swatch** — nenhum token de cor brand/support/state é mostrado. Além disso, a lista de blocos usa `border-border` genérico e só imprime `v.shape` como texto, então a cor de borda e o shape por tipo do mapa não são visualizados. Task 5 é explicitamente opcional e a página não é surface de produto, por isso low.
**Correção:** adicionar seção de paleta com swatches brand/support/state e aplicar `v.borderColorToken` (e o shape) a cada item de bloco, exercitando o mapa de taxonomia.

---

## Recomendação de merge
Corrigir **1.3-HIGH (OpenRouter)** antes do merge — é o único bloqueador real. Os 5 mediums (1.1 docker-up, 1.2 jsonb tipagem, 1.3 role:system, 1.3 AC1 testes, 1.3 AC4 retry, 1.5 mapa de visuais) devem ser endereçados nesta epic ou rastreados como follow-ups explícitos antes de a Story 1.6 (Builder) consumir esses contratos. Lows/nits podem ser agrupados num PR de limpeza.
