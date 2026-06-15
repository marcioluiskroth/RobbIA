---
baseline_commit: 6ad6644476acc79f20ca51117b042a38cd428219
---
# Story 1.7: Apresentação do Harness em cards e fluxo visual

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a arquiteto,
I want ver a proposta da IA Arquiteta como **cards** (um Bloco por vez) e como **fluxo visual**,
so that eu entenda cada Bloco e o encadeamento do Harness antes de decidir.

> **Terceira story de UI do Epic 1.** Liga o shell da bancada (**1.6**) ao motor da IA Arquiteta (**1.4**): a descrição na Conversa vira uma **proposta de Harness** que é exibida como `BlockCard` (centro) e fluxo `ReactFlow` (direita), com alternativa acessível não-canvas. Reusa a taxonomia visual da **1.5** (`BLOCK_TYPE_VISUALS`). **FR-2 + FR-14 + UX-DR2/7/16.**

## Acceptance Criteria

1. **BlockCard — um Bloco por vez (UX-DR2, FR-2).**
   **Given** uma proposta de Harness gerada (via `@robbia/architect`)
   **When** a bancada exibe um Bloco no centro
   **Then** ele aparece como `BlockCard` com: **ícone do Tipo** (Lucide, de `BLOCK_TYPE_VISUALS`), **título** (nome do Bloco), **badge de Modelo** em `font-mono`, **justificativa de 1 linha** e **borda colorida por Tipo** (disciplina do ciano — só Gatilho/Ação)
   **And** um Bloco **"sem LLM"** (sem `model`) **não** exibe badge de Modelo.

2. **Vista de fluxo ReactFlow — read-first (UX-DR7, FR-2, FR-14).**
   **Given** uma proposta de Harness
   **When** visualizo a zona Fluxo (direita)
   **Then** os `FlowNode` renderizam **forma + cor + ícone por Tipo** (taxonomia autoritativa `BLOCK_TYPE_VISUALS`), a **ordem** e o **encadeamento** (arestas sequenciais) são visíveis, e a vista é **read-first** — **não** é editor de arestas (nós não arrastáveis/conectáveis no MVP)
   **And** **clicar num nó foca o Bloco correspondente no centro** (sincroniza a seleção com o `BlockCard`).

3. **Alternativa não-canvas acessível (UX-DR7, UX-DR16).**
   **Given** a exigência de acessibilidade do canvas (ReactFlow não é navegável por teclado/leitor de tela)
   **When** navego por teclado/leitor de tela
   **Then** há uma **lista navegável dos Blocos** espelhando o fluxo (ordem + Tipo + nome), com cada item focável; **Enter** foca o Bloco correspondente no centro (mesma seleção do clique no nó).

## Tasks / Subtasks

- [x] **Task 1 — Dependência ReactFlow (AC: 2)**
  - [x] Em `apps/web`: adicionar `@xyflow/react` (ReactFlow v12 — compatível com React 19). Importar o CSS base `@xyflow/react/dist/style.css` uma vez (no componente de fluxo ou layout do Builder).
  - [x] `biome.json` já exclui `**/*.css` — não há lint sobre o CSS do ReactFlow. Confirmar que o `next build` empacota o estilo.
- [x] **Task 2 — Mapeamento puro Harness → grafo (AC: 2, 3) [red-green]**
  - [x] `apps/web/lib/harness-flow.ts`: `harnessToFlow(harness)` **puro** → `{ nodes, edges }`. Cada Bloco vira um nó `id: "block-{index}"` com `data: { index, block }` e posição determinística (layout vertical por índice, ex.: `{ x: 0, y: index * 96 }`). Arestas **sequenciais** `block-{i} → block-{i+1}` (encadeamento por ordem). Sem efeitos; sem `Math.random()`/`Date.now()`.
  - [x] `apps/web/lib/block-presentation.ts`: helpers puros — `hasModelBadge(block) = block.model != null` e (se útil) `blockCardLabel`. Centraliza a regra "sem LLM → sem badge".
- [x] **Task 3 — BlockCard (AC: 1)**
  - [x] `apps/web/components/builder/block-card.tsx`: `BlockCard` (Server Component — sem estado) com ícone do Tipo (`blockTypeVisual(type).icon`), título (nome), justificativa (1 linha, truncada), badge de Modelo em `font-mono` **só quando** `hasModelBadge`, e **borda colorida por Tipo** (reusar o mapa `BORDER_CLASS` da vitrine `/design` — extrair para `lib/block-types.ts` como `blockBorderClass(token)` para fonte única; **não** duplicar). Estado selecionado vs. não-selecionado por realce **não-cromático** (peso/anel), não só cor.
- [x] **Task 4 — FlowNode + HarnessFlow (ReactFlow) (AC: 2)**
  - [x] `apps/web/components/flow/flow-node.tsx` (`'use client'`): nó custom do ReactFlow — forma por Tipo (`shape` de `BLOCK_TYPE_VISUALS`: stadium/rounded-rect/diamond/sharp-rect/hexagon via classes/clip-path), cor de borda por Tipo, ícone + nome. `Handle` de origem/alvo apenas para desenhar arestas (não conectáveis).
  - [x] `apps/web/components/flow/harness-flow.tsx` (`'use client'`): `HarnessFlow({ harness, selectedIndex, onSelectBlock })` — monta `nodes/edges` via `harnessToFlow`, registra `nodeTypes`, **read-first** (`nodesDraggable={false}`, `nodesConnectable={false}`, `edgesFocusable={false}`, `elementsSelectable`, `fitView`, `proOptions={{ hideAttribution: true }}`), `onNodeClick → onSelectBlock(index)`. Marca o nó `selected` quando `index === selectedIndex`. Inclui `<Background/>` e `<Controls showInteractive={false}/>`. O container do canvas é decorativo para AT → **`aria-hidden="true"`** (o caminho acessível é a `BlockList`, AC3). **SSR:** ReactFlow é client-only — se houver erro de hydration, importar via `next/dynamic` com `ssr: false`. Edge id determinístico `e-{i}-{i+1}`.
- [x] **Task 5 — Lista não-canvas acessível (AC: 3)**
  - [x] `apps/web/components/builder/block-list.tsx` (`'use client'`): `BlockList({ harness, selectedIndex, onSelectBlock })` — `<ul>` de Blocos (ordem + ícone do Tipo + nome) com cada item como `<button>` focável; clique/**Enter**/Space → `onSelectBlock(index)`. `aria-current`/`aria-selected` no item ativo. É o **espelho acessível** do canvas (UX-DR7) — sempre presente, não um modo escondido.
- [x] **Task 6 — Geração e integração no Builder (AC: 1, 2, 3)**
  - [x] `apps/web/lib/architect-config.ts`: helper **puro** `resolveArchitectConfig(env)` → `{ ok: true, kind, model, config } | { ok: false, reason: 'no-provider' | 'no-key' }`. Lê `ARCHITECT_PROVIDER` (um de `ProviderKind`), `ARCHITECT_MODEL` e a chave do Provider (`ANTHROPIC_API_KEY`/`OPENAI_API_KEY`/`GEMINI_API_KEY`/`OPENROUTER_API_KEY`; Ollama dispensa chave, usa `OLLAMA_BASE_URL` opcional). Separar o parsing do env da ação torna-o **testável headless** (Task 7). Atualizar `.env.example` com essas vars (comentadas, sem valores).
  - [x] `apps/web/app/(workspace)/builder/actions.ts` (`'use server'`): server action `proposeHarness(description)` → usa `resolveArchitectConfig(process.env)`; se `ok:false` retorna `Result` err com código legível (`ARCHITECT_NO_PROVIDER`); senão monta `createProviderRegistry({ [kind]: config })`, pega `registry.get(kind)` e chama `decompose(provider, { description, model })`. Retorna o `ArchitectResponse` (`harness | clarification`) embrulhado em `Result` **serializável** (objeto plano — nada de classes/funções cruzando a fronteira server→client). **Segredos só no servidor**, nunca no client nem no retorno. Sem persistência.
  - [x] `apps/web/components/builder/builder-workspace.tsx` (`'use client'`): eleva o estado do Builder — conversa (turnos), `proposal` (Harness | null), `selectedIndex` (default **0** ao receber nova proposta), status do agente. Envia a descrição → `proposeHarness` (transição `MascotCore`: `thinking` durante, `done`/`error` depois). Resposta `harness` → popula cards/fluxo + turno `assistant` resumindo ("Propus N Blocos…"); `clarification` → perguntas como turno `assistant` na Conversa; `Result` err → estado de erro legível (inclui o caminho `ARCHITECT_NO_PROVIDER` → "configure um Provider no Workspace", link `/workspace`).
  - [x] Integrar no `apps/web/app/(workspace)/builder/page.tsx`: a `BuilderLayout` passa a receber as 3 zonas do `BuilderWorkspace` — Conversa (`ChatComposer` + turnos), centro (`BlockCard` do Bloco selecionado **ou** `EmptyState` quando sem proposta), direita (`HarnessFlow` + `BlockList` + `MascotCore`; `EmptyState` quando sem proposta). Seleção sincronizada entre nó, lista e card.
- [x] **Task 7 — Testes de lógica pura (AC: 1, 2, 3) [red-green]**
  - [x] `apps/web/lib/harness-flow.test.ts`: N Blocos → N nós + (N−1) arestas; ids determinísticos (`block-0..`); ordem preservada; arestas conectam consecutivos; mesma entrada → mesma saída.
  - [x] `apps/web/lib/block-presentation.test.ts`: `hasModelBadge` true com `model`, false sem `model` (Bloco "sem LLM"); determinístico.
  - [x] `apps/web/lib/architect-config.test.ts`: `resolveArchitectConfig` — env completo (provider+model+chave) → `ok:true` com os campos certos; sem `ARCHITECT_PROVIDER` → `no-provider`; provider que exige chave sem a chave → `no-key`; Ollama sem chave → `ok:true`. Puro (recebe um objeto de env, não lê `process.env`).
- [x] **Task 8 — Verificação (AC: 1, 2, 3)**
  - [x] `bun run lint` (Biome), `bun run typecheck`, `bun run test` verdes. `bun run build` (Next) compila com o ReactFlow. *(Verificação visual real do navegador é manual — abrir `/builder`, gerar uma proposta, conferir cards/fluxo/lista e o clique-no-nó→foco.)*

## Dev Notes

### Insumo de dados (autoritativo)
[Source: packages/shared/src/schemas/{block,harness}.ts; packages/architect/src/schema.ts]
- **`Block`** = `{ type: BlockType, name: string, justification: string, model?: string, config: Record<string,unknown> }`. **`model` ausente = Bloco "sem LLM"** (sem badge de Modelo — AC1).
- **`Harness`** = `{ name: string, description?: string, blocks: Block[] }` (≥1 Bloco). **Ordem = índice no array** (não há `position` no schema compartilhado; o encadeamento do fluxo é sequencial por índice). Não há `dependsOn` no `BlockSchema` compartilhado → o fluxo desta story é **linear por ordem** (dependências ricas ficam para quando o schema as expuser).
- **`ArchitectResponse`** = union discriminado `{ kind:'harness', harness } | { kind:'clarification', questions[] }` — tratar **os dois** ramos na integração (Task 6).

### Decisão de escopo — por que a geração entra aqui
- A 1.6 entregou o **shell** do Builder com o `ChatComposer` **inerte** (anti-scope: sem geração). A 1.4 entregou o **motor** (`decompose`). Esta story é a **ponte**: sem ela os componentes de apresentação não teriam dado real e a Conversa continuaria sem efeito. Por isso 1.7 inclui o **server action** que chama o architect — mantido mínimo (provider via env), **sem** UI de configuração de Provider (isso é do **Workspace**, story posterior) e **sem** persistência.
- Se nenhum Provider estiver configurado no env → estado legível "configure um Provider no Workspace" (link para `/workspace`), não erro cru.
- **Contrato de env (server-only):** `ARCHITECT_PROVIDER` (kind), `ARCHITECT_MODEL` (id do modelo) e a chave do Provider correspondente (`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` / `OPENROUTER_API_KEY`; `ollama` dispensa chave e aceita `OLLAMA_BASE_URL`). Parseado por `resolveArchitectConfig` (puro, testável); a leitura de `process.env` só acontece no server action. Adicionar ao `.env.example` (comentado). Nunca expor essas vars ao client (sem prefixo `NEXT_PUBLIC_`).

### Taxonomia visual — reuso obrigatório (NÃO reinventar)
[Source: apps/web/lib/block-types.ts (1.5); apps/web/app/design/page.tsx (1.5)]
- `blockTypeVisual(type)` → `{ borderColorToken, icon, shape }` é **a fonte única** de ícone/forma/cor por Tipo. **Não** redefinir.
- O mapa `BORDER_CLASS` (token → classe Tailwind de borda) hoje vive **duplicado** na vitrine `/design`. **Extrair para `lib/block-types.ts`** (`blockBorderClass(token)`) e consumir na vitrine **e** no `BlockCard`/`FlowNode` — fonte única (evita deriva). Atualizar `app/design/page.tsx` para usar o helper.
- Formas (`shape`): mapear para classes utilitárias/`clip-path` no `FlowNode` (stadium=`rounded-full`, rounded-rect, diamond/hexagon via `clip-path`, sharp-rect). Garantir que **forma + ícone + cor** coexistam (cor nunca é o único sinal).

### ReactFlow (read-first) — decisões
[Source: architecture.md › Frontend (ReactFlow complementar); EXPERIENCE.md › FlowNode]
- Lib: **`@xyflow/react`** (ReactFlow v12, mantida, compatível com React 19). Importar `@xyflow/react/dist/style.css`.
- **Read-first (FR-14):** `nodesDraggable={false}`, `nodesConnectable={false}`, `edgesFocusable={false}`, `elementsSelectable`, `fitView`, `proOptions={{ hideAttribution: true }}` se aplicável. **Não** é editor nó-a-nó estilo n8n.
- O canvas **não** substitui a acessibilidade: a `BlockList` (AC3) é o caminho de teclado/leitor de tela, sempre presente (não um modo alternativo escondido).
- `'use client'` no fluxo (ReactFlow usa hooks/DOM). `harnessToFlow` (mapa puro) fica fora do componente, **testável headless** (Task 7).

### Integração no Builder (1.6) — o que muda
[Source: apps/web/components/builder/builder-layout.tsx; app/(workspace)/builder/page.tsx (1.6)]
- `BuilderLayout` (3 zonas) **permanece** — recebe as zonas já preenchidas. Introduz-se `BuilderWorkspace` (client) que detém o estado e compõe as 3 zonas; a `page.tsx` passa a renderizar `BuilderWorkspace` dentro do `BuilderLayout` (ou o `BuilderWorkspace` usa o `BuilderLayout` internamente — manter o layout burro).
- **Seleção única** compartilhada: clique no `FlowNode`, clique/Enter na `BlockList` e a navegação de cards apontam para o **mesmo** `selectedIndex` → o centro mostra o `BlockCard` daquele Bloco.
- `MascotCore`: `idle` → `thinking` (durante `proposeHarness`) → `done` (proposta) / `error`. Respeita `prefers-reduced-motion` (já tratado na 1.5).
- **Estado efêmero em React local** (a proposta não é persistida — Epic 2+). **Sem** TanStack Query nesta story (não há GET de servidor; a geração é um server action pontual).

### Voz, microcopy e glossário (autoritativo)
[Source: apps/web/lib/glossary.ts (1.6)]
- Reusar `GLOSSARY`/`COPY` e **adicionar** as chaves novas necessárias (ex.: badge "sem LLM", erro de geração, "configure um Provider") em `lib/glossary.ts` — **fonte única** de copy, termos canônicos (Harness, Bloco, Modelo de IA, Canal, Modo de Teste), voz técnica/colega sênior.

### Acessibilidade (requisito comprometido)
[Source: EXPERIENCE.md › Accessibility Floor]
- **Alternativa não-canvas** obrigatória (AC3) — a `BlockList` espelha o fluxo e é operável por teclado (Tab/Enter/Space), com `aria-current`/`aria-selected`.
- **Cor não é o único sinal:** Tipo do Bloco sempre por **ícone + forma + cor**; Bloco selecionado por realce não-cromático (anel/peso).
- **Foco** visível via tokens `focus` (1.5). Nós do ReactFlow não substituem foco real — daí a lista.

### Stack / decisões (seguir)
[Source: architecture.md; 1-5/1-6]
- Next.js 16 App Router; **componentes hand-rolled** (CVA + `cn`) — shadcn/Radix **não** instalado. `'use client'` só onde há estado/efeito/hook (`HarnessFlow`, `FlowNode`, `BlockList`, `BuilderWorkspace`). `BlockCard` pode ser Server Component.
- **Server action** (`'use server'`) para a geração — segredos do Provider **nunca** no client (segurança). TS `strict`, sem `any`. Biome `organize-imports`.
- Reuso: `@robbia/architect` (`decompose`), `@robbia/provider` (`createProviderRegistry`, `routeProvider`), `@robbia/shared` (`Harness`/`Block`/`BlockType`), `MascotCore`/`EmptyState` (1.5/1.6), `blockTypeVisual` (1.5).

### Aprendizados 1.1–1.6 (aplicar)
- Testes de **lógica pura** em `apps/web/lib/*.test.ts` via `bun test` (sem DOM) — `harness-flow`, `block-presentation`. Componentes React: verificação visual + `next build`.
- `apps/web/tsconfig.json` exclui `**/*.test.ts(x)` do `tsc`; manter.
- `next build` reescreve `next-env.d.ts` (import `.next/...`) — reverter para a versão limpa committada antes de finalizar.
- Provider/SDK constroem cliente **lazy** (1.3) — o server action pode instanciar o registry sem crashear se faltar chave (retorna `Result` err → estado legível).

### O que NÃO fazer (anti-scope)
- **NÃO** implementar **Aprovar / Trocar modelo / Repensar** nem `ModelSelector` nem estado por Bloco (`proposto→aprovado…`) — isso é a **Story 1.8**. Aqui os cards são **read-first** (exibição + seleção), sem ações de mutação.
- **NÃO** tornar o ReactFlow um **editor** (arestas/arrastar/conectar) — read-first.
- **NÃO** persistir a proposta, criar tabelas/endpoints REST, nem wiring de WebSocket (Epic 2+). A proposta é estado efêmero do client.
- **NÃO** construir a UI de configuração de Provider (Workspace) — só a resolução via env no server action, com estado "configure um Provider" quando ausente.
- **NÃO** redefinir a taxonomia de Tipos nem duplicar o mapa de borda — extrair/reusar de `lib/block-types.ts`.

### Testing standards
- `apps/web/lib/{harness-flow,block-presentation}.test.ts` com `bun test` (puro). Render do ReactFlow/cards/lista: verificação visual manual + `next build` (sem DOM tests). Geração: a lógica do architect já é testada em `@robbia/architect` (1.4); aqui o server action é fino (orquestração).

### Project Structure Notes
- Novos: `app/(workspace)/builder/actions.ts`; `components/builder/{block-card,block-list,builder-workspace}.tsx`; `components/flow/{flow-node,harness-flow}.tsx`; `lib/{harness-flow,block-presentation,architect-config}.ts` (+ testes). Modificados: `app/(workspace)/builder/page.tsx` (1.6), `lib/block-types.ts` (+`blockBorderClass`), `app/design/page.tsx` (usar o helper), `lib/glossary.ts` (+copy), `apps/web/package.json` (+`@xyflow/react`), `.env.example` (vars do architect). **Não** alterar outros packages.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.7: Apresentação do Harness em cards e fluxo visual]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/EXPERIENCE.md] (BlockCard, FlowNode read-first, alternativa não-canvas, Accessibility Floor)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/DESIGN.md] (taxonomia de Blocos, formas)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/mockups/mock-builder.html] (cards + fluxo do agente WhatsApp)
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend (Harness UI)] (ReactFlow complementar, server components/actions, padrões de estado)
- [Source: _bmad-output/implementation-artifacts/1-4-ia-arquiteta-nl-harness.md] (decompose, ArchitectResponse union)
- [Source: _bmad-output/implementation-artifacts/1-5-design-system.md] (BLOCK_TYPE_VISUALS, MascotCore)
- [Source: _bmad-output/implementation-artifacts/1-6-bancada-builder.md] (BuilderLayout 3 zonas, ChatComposer, glossary, EmptyState)

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (1M context) — BMad dev-story workflow

### Debug Log References

- Lógica pura primeiro (harness-flow/block-presentation/architect-config) com testes (`bun test`) → 16 pass antes da UI.
- **Deps faltando:** `apps/web` não dependia de `@robbia/architect`/`@robbia/provider` → adicionados (`workspace:*`) + `bun install`. O erro de índice em `architect-config` era cascata do `ProviderKind` não resolvido.
- **`@xyflow/react` v12** (React 19). Tipos: `NodeProps` sem genérico + cast `data as unknown as FlowNodeData` (FlowNodeData não tem index signature p/ o constraint `Record<string,unknown>` do xyflow); `nodes/edges as unknown as Node[]/Edge[]`.
- **`.env.example` usava `GOOGLE_API_KEY`** (não `GEMINI_API_KEY`) → `architect-config` alinhado à convenção existente.
- **AC2 (sem scroll horizontal) — bug do `BuilderLayout` (1.6) exposto:** colunas fixas `20rem+22rem` estouravam na faixa 1024–1280px. Corrigido: grid de 3 colunas movido para `xl:` (≥1280) com `minmax(0,1fr)` no centro; abaixo de 1280 empilha. Verificado no navegador a 1280 (3 col) e 1100 (stacked) — sem scroll horizontal.
- `biome` `noArrayIndexKey` na `BlockList`: suprimido com justificativa (lista estática de proposta, sem reorder, Blocos sem id).
- `next build` reescreve `next-env.d.ts` → revertido p/ a versão limpa committada.
- Verde em estado limpo: typecheck 16/16, lint 154 arquivos, `bun test apps/web` **35 pass** (8 arquivos), `next build` OK (6 rotas, ReactFlow empacotado).
- **Smoke no navegador:** descrição → server action → caminho `ARCHITECT_NO_PROVIDER` (sem chave no env) → turno `assistant` "configure um Provider" + `MascotCore` Erro. Wiring end-to-end validado sem credencial.

### Completion Notes List

- ✅ **AC1 — BlockCard:** ícone do Tipo + nome + badge de Modelo (`font-mono`) + justificativa + borda colorida por Tipo (`blockBorderClass`). Bloco "sem LLM" exibe badge muted "sem LLM" em vez do Modelo (`hasModelBadge`).
- ✅ **AC2 — Fluxo ReactFlow read-first:** `FlowNode` por Tipo (forma via `clip-path` + cor + ícone), `HarnessFlow` com `nodesDraggable/Connectable=false`, `fitView`, clique-no-nó → foca o Bloco; canvas `aria-hidden`. Mapa `harnessToFlow` puro/testado.
- ✅ **AC3 — Lista não-canvas:** `BlockList` (botões focáveis, Enter/Espaço nativos, `aria-current`) espelha o fluxo; mesma `selectedIndex` que o canvas e o card.
- ✅ **Ponte de geração:** server action `proposeHarness` (`resolveArchitectConfig(env)` → `createProviderRegistry` → `decompose`); `BuilderWorkspace` orquestra conversa/proposta/seleção/estado do agente; `ChatComposer` refatorado para controlado. Trata `harness` (cards+fluxo+resumo), `clarification` (perguntas) e erro (`no-provider`/`no-key` → "configure um Provider").
- 📌 **Reuso/fonte única:** `blockBorderClass` extraído p/ `lib/block-types.ts` (vitrine `/design` atualizada a consumi-lo); `BLOCK_TYPE_VISUALS`/`MascotCore`/`EmptyState`/glossário reusados.
- 📌 **Anti-scope respeitado:** sem Aprovar/Trocar/Repensar nem `ModelSelector` (1.8), sem editor de arestas, sem persistência, sem UI de Provider (só env).
- 📌 **Manual:** o render real de cards/fluxo precisa de um Provider configurado no env (`ARCHITECT_PROVIDER`/`ARCHITECT_MODEL` + chave). Sem isso, o caminho "configure um Provider" é exercido.

### File List

**apps/web (novos):**
- `lib/harness-flow.ts` · `lib/block-presentation.ts` · `lib/architect-config.ts` (+ `*.test.ts` dos três)
- `components/builder/{block-card,block-list,builder-workspace}.tsx`
- `components/flow/{flow-node,harness-flow}.tsx`
- `app/(workspace)/builder/actions.ts`

**apps/web (modificados):**
- `app/(workspace)/builder/page.tsx` (renderiza `BuilderWorkspace`)
- `components/builder/chat-composer.tsx` (controlado: `turns`/`onSubmit`/`busy`)
- `components/builder/builder-layout.tsx` (3 colunas em `xl`, sem scroll horizontal na faixa 1024–1280)
- `lib/block-types.ts` (+`blockBorderClass`) · `app/design/page.tsx` (usa o helper) · `lib/glossary.ts` (+copy 1.7)
- `package.json` (+`@robbia/architect`, `@robbia/provider`, `@xyflow/react`)

**raiz (modificados):** `.env.example` (vars do architect) · `bun.lock`

## Change Log

| Data | Mudança |
|------|---------|
| 2026-06-15 | Story 1.7 criada (ready-for-dev): apresentação do Harness como `BlockCard` (centro) + fluxo `ReactFlow` read-first (direita) + lista não-canvas acessível; clique-no-nó/Enter-na-lista focam o mesmo Bloco. Inclui a ponte de geração (server action `proposeHarness` → `@robbia/architect`, provider via env) que liga o `ChatComposer` (1.6) ao motor (1.4). Reusa `BLOCK_TYPE_VISUALS` (1.5). Anti-scope: sem Aprovar/Trocar/Repensar (1.8), sem editor de arestas, sem persistência, sem UI de Provider. |
| 2026-06-15 | Revisão de qualidade aplicada: (1) contrato de env do server action especificado + helper puro testável `resolveArchitectConfig` + `.env.example` + estados `no-provider`/`no-key`; (2) ReactFlow `aria-hidden` no canvas (lista é o caminho acessível) + nota de SSR (`next/dynamic ssr:false` se preciso) + edge id determinístico; (3) `selectedIndex` default 0 na nova proposta + turno `assistant` no sucesso; (4) `architect-config` no File List + teste dedicado. |
| 2026-06-15 | Story 1.7 implementada: `BlockCard` (badge sem-LLM), `HarnessFlow`/`FlowNode` ReactFlow read-first (forma+cor+ícone por Tipo, clique→foco, canvas `aria-hidden`), `BlockList` acessível, ponte de geração (server action `proposeHarness` → `@robbia/architect`, provider via env), `BuilderWorkspace` orquestrando conversa/proposta/seleção/estado, `ChatComposer` → controlado. `blockBorderClass` extraído (fonte única). Correção AC2: grid 3-col movido p/ `xl` (sem scroll horizontal na faixa 1024–1280). +16 testes (35 total web). typecheck/lint/test/build verdes; smoke do server action no navegador. **Status → review.** |
