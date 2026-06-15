---
baseline_commit: 3b33593e81570a4f1978153194e29623d7630b85
---
# Story 1.6: Bancada do Builder — navegação, layout de 3 zonas e entrada em linguagem natural

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a arquiteto,
I want uma bancada com navegação primária clara, o Builder em layout de 3 zonas e uma entrada conversacional em PT-BR,
so that eu possa descrever e refinar um agente numa única conversa, com a UI já estruturada para receber os cards e o fluxo nas próximas stories.

> **Segunda story de UI do Epic 1 — o "shell" da bancada.** Consome o design system da **1.5** (tokens, `MascotCore`, `StateBadge`, taxonomia de Blocos) e o glossário/voz do **EXPERIENCE.md**. Insumo primário: **EXPERIENCE.md › Information Architecture / State Patterns / Responsive** + **DESIGN.md › Layout & Spacing**. Em `apps/web` (Next.js 16 App Router). **FR-14 + UX-DR3/12/13/14/16/19.**

## Acceptance Criteria

1. **Navegação primária + lista de Harnesses com estado vazio guiado (UX-DR12, UX-DR14).**
   **Given** o app `apps/web` com o app shell
   **When** acesso o workspace
   **Then** existe navegação primária persistente para as 4 surfaces **Harnesses**, **Builder**, **Operação** e **Workspace** (rótulos exatos do PRD), com o item ativo indicado por **mais que cor** (rótulo + estado `aria-current`, não só destaque cromático)
   **And** a surface **Harnesses** exibe, sem nenhum Harness, um **estado vazio guiado de first-run** com o CTA **"descreva seu primeiro agente"** que leva ao **Builder** (UX-DR14); a navegação por teclado alcança todos os itens com anel de foco visível (`focus` tokens da 1.5).

2. **Builder em layout de 3 zonas, responsivo a reflow/zoom (UX-DR13, UX-DR16).**
   **Given** o **Builder** aberto
   **When** visualizo o layout em viewport ~1280px
   **Then** há **3 zonas** — **Conversa** (esquerda), **Cards/Inspetor do Bloco** (centro), **Fluxo & Contexto + `MascotCore`** (direita) — as zonas centro e direita renderizam **estados vazios** ("nenhum Bloco ainda", "o fluxo aparece aqui") enquanto não há proposta (geração real = Story 1.7)
   **And** em larguras estreitas (≤~1024px) ou zoom alto (200–400%) as 3 zonas **colapsam para empilhadas ou em abas** (Conversa / Cards / Fluxo), **sem scroll bidirecional nem corte de conteúdo**, com tipografia/medidas em unidades relativas (rem); o `MascotCore` permanece legível estaticamente e respeita `prefers-reduced-motion`.

3. **`ChatComposer` — entrada de NL com refino contínuo, voz e glossário corretos (UX-DR3, UX-DR19, FR-14).**
   **Given** o `ChatComposer` na zona Conversa
   **When** digito uma descrição ou um refino em PT-BR e envio
   **Then** a mensagem entra numa **conversa contínua** (lista de turnos na mesma sessão — refino não abre nova conversa); **Enter** envia, **Shift+Enter** quebra linha, o campo limpa após enviar e o foco volta ao campo; entrada vazia/whitespace não envia
   **And** a microcopy segue a **voz técnica/colega sênior** (sem hype, sem infantilização) e usa os **termos exatos do glossário** — **Harness, Bloco, Modelo de IA, Canal, Modo de Teste** — sem sinônimos divergentes.

## Tasks / Subtasks

- [x] **Task 1 — App shell + navegação primária (AC: 1)**
  - [x] `apps/web/app/(workspace)/layout.tsx`: shell com `AppNav` (Server Component envolvendo o conteúdo; `children` no slot principal) + **skip-to-content link** (`<a href="#main">` visível ao foco) e `<main id="main">`. Mantém o `ThemeToggle` (1.5) acessível na navegação. **Forma da nav (sidebar) ancorada no mock** — ver [mockups/mock-builder.html](../planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/mockups/mock-builder.html) (mocks ilustram; spines vencem).
  - [x] `apps/web/lib/navigation.ts`: `NAV_ITEMS` puro — `{ key, label (PT-BR exato), href }` para Harnesses(`/harnesses`), Builder(`/builder`), Operação(`/operacao`), Workspace(`/workspace`). **Fonte única** dos rótulos.
  - [x] `apps/web/components/app-nav.tsx` (`'use client'` — usa `usePathname` p/ ativo): renderiza `NAV_ITEMS`; item ativo com `aria-current="page"` + indicador não-cromático (peso/rótulo), nunca só cor. Anel de foco via tokens `focus`.
  - [x] Cada `page.tsx` das 4 surfaces exporta `metadata` com `title` próprio (ex.: "Harnesses · RobbIA") — coerência e a11y (título de documento por rota).
  - [x] `apps/web/app/page.tsx`: substituir o placeholder da 1.1 por `redirect('/harnesses')` (`next/navigation`).
- [x] **Task 2 — Surface Harnesses com first-run (AC: 1)**
  - [x] `apps/web/app/(workspace)/harnesses/page.tsx`: lista de Harnesses. **MVP desta story: sem fetch/persistência** — renderiza o **estado vazio guiado** (`EmptyState`) com CTA **"descreva seu primeiro agente"** → link p/ `/builder`. (Wiring de dados real fica para quando houver endpoint; não inventar API aqui.)
  - [x] `apps/web/components/ui/empty-state.tsx`: `EmptyState` reutilizável (ícone Lucide + título + descrição + ação opcional), alinhado ao padrão genérico `empty` do EXPERIENCE.md. Usado por Harnesses e pelas zonas vazias do Builder.
- [x] **Task 3 — Builder de 3 zonas + responsivo (AC: 2)**
  - [x] `apps/web/app/(workspace)/builder/page.tsx`: monta `BuilderLayout` com as 3 zonas; centro/direita recebem `EmptyState` placeholder (sem BlockCard/FlowNode — Story 1.7). Direita inclui o `MascotCore` (estado `idle` por ora).
  - [x] `apps/web/components/builder/builder-layout.tsx` (`'use client'`): grid de 3 colunas no desktop; **colapsa para zonas empilhadas (stacked)** em ≤~1024px e sob zoom alto, via breakpoints `lg:` do Tailwind v4 (zoom reduz o viewport CSS → media queries reagem). **Stacked é o padrão** — não introduz dependência. Abas são opcionais: se adotadas, exigem `@radix-ui/react-tabs` explícito (ou hand-roll acessível), nunca assumir um `Tabs` pré-instalado. **Sem scroll horizontal**; medidas em rem. Zonas como props (`conversation`, `cards`, `flow`) para manter o layout burro/testável.
- [x] **Task 4 — ChatComposer + conversa contínua (AC: 3)**
  - [x] `apps/web/lib/glossary.ts`: `GLOSSARY` puro com os termos canônicos (`Harness`, `Bloco`, `Modelo de IA`, `Canal`, `Modo de Teste`) + microcopy-chave (placeholder do composer, título/descrição do first-run). **Fonte única** de copy — proíbe sinônimos divergentes.
  - [x] `apps/web/lib/conversation.ts`: tipos + reducer **puro** da conversa — `ConversationTurn { id, role: 'user' | 'assistant', text }` (`user` = arquiteto; `assistant` = IA Arquiteta), `appendTurn(state, turn)`. Sem efeitos; testável headless. (Sem geração de resposta da IA Arquiteta nesta story — só o registro do turno `user`.)
  - [x] `apps/web/components/builder/chat-composer.tsx` (`'use client'`): `textarea` + botão Enviar. **Enter envia / Shift+Enter quebra linha**; trim → não envia vazio; limpa + refoca após enviar; `aria-label` no campo e no botão; placeholder e rótulos vindos de `GLOSSARY`. Gera o `id` do turno via `crypto.randomUUID()` (no componente — **nunca** `Math.random()`/`Date.now()`; o reducer recebe o turno pronto e permanece determinístico). Lista de turnos acima do composer (refino contínuo na mesma conversa).
- [x] **Task 5 — Surfaces Operação e Workspace (shell mínimo) (AC: 1)**
  - [x] `apps/web/app/(workspace)/operacao/page.tsx` e `.../workspace/page.tsx`: páginas-shell com título + `EmptyState` ("em breve" / âncora de navegação). Mantêm a navegação completa e evitam rota 404. (Conteúdo real é dos Epics 2–3 / Workspace de credenciais.)
- [x] **Task 6 — Testes de lógica pura (AC: 1, 2, 3) [red-green]**
  - [x] `apps/web/lib/navigation.test.ts`: `NAV_ITEMS` tem as 4 surfaces na ordem PRD, rótulos exatos, `href` únicos.
  - [x] `apps/web/lib/glossary.test.ts`: glossário contém os 5 termos canônicos exatos; helper de resolução é determinístico.
  - [x] `apps/web/lib/conversation.test.ts`: `appendTurn` é imutável (não muta o estado anterior), preserva ordem, gera turnos distintos; entrada só-whitespace é rejeitada pelo validador.
- [x] **Task 7 — Verificação (AC: 1, 2, 3)**
  - [x] `bun run lint` (Biome), `bun run typecheck`, `bun run test` verdes. `bun run build` (Next) compila todas as rotas (`/`, `/harnesses`, `/builder`, `/operacao`, `/workspace`). *(Verificação visual real do navegador é manual — fluxo headless; ver Testing standards.)*

## Dev Notes

### Arquitetura de Informação (autoritativo)
[Source: EXPERIENCE.md › Information Architecture; architecture.md › Frontend (Harness UI)]
- **Navegação primária (4 surfaces, rótulos exatos):** **Harnesses** (lista: criar/abrir/status) · **Builder** (construir um Harness) · **Operação** (execuções ao vivo, logs, fila de confirmações) · **Workspace** (Providers, Canais, Credenciais, tema). Dois planos de uso separados: *build-time* (Builder) e *run-time* (Operação).
- **Modelo mental:** **conversa → cards (um Bloco por vez) → aprovação.** A vista de fluxo (ReactFlow) é **complementar**, não editor nó-a-nó (FR-14). Nesta story só o **shell** dos cards/fluxo (vazios) — render real é 1.7.

### Layout do Builder — 3 zonas (autoritativo)
[Source: EXPERIENCE.md › Information Architecture "Layout do Builder"; DESIGN.md › Layout & Spacing]
- **Esquerda — Conversa:** chat com a IA Arquiteta (descrição, "repensar", esclarecimentos) → `ChatComposer` + lista de turnos.
- **Centro — Cards/Inspetor do Bloco:** um `BlockCard` por vez (1.7) → aqui **EmptyState** placeholder.
- **Direita — Fluxo & Contexto:** `FlowNode`/ReactFlow (1.7) + `MascotCore` (1.5) → aqui **EmptyState** + `MascotCore idle`.
- Densidade média-alta (bancada com muita informação ao vivo), base-4, sem sufocar.

### Responsivo / Reflow / Zoom (requisito comprometido — não suposição)
[Source: EXPERIENCE.md › Responsive & Platform + Accessibility Floor (WCAG 1.4.10 / 1.4.4)]
- **Desktop-first**, viewport ótimo ~**1280px**; reflow gracioso até ~**1024px** e sob **zoom 200–400%**.
- As 3 zonas **colapsam para empilhadas/abas** (Conversa / Cards / Fluxo) em larguras estreitas e zoom alto — **AA obrigatório mesmo no desktop** (reflow ≠ mobile). **Sem scroll bidirecional**, sem corte de conteúdo; tipografia/medidas em **rem**. Mobile fora do MVP.

### Voz, microcopy e glossário (autoritativo)
[Source: EXPERIENCE.md › Voice and Tone; PRD glossary]
- Técnico, claro, profissional, **PT-BR**; sem hype, sem infantilização; trata o usuário como par especialista. A IA Arquiteta fala como **colega sênior** (propõe com justificativa, pede esclarecimento, nunca finge certeza).
- **Termos canônicos (usar exatamente):** **Harness**, **Bloco**, **Modelo de IA**, **Canal**, **Modo de Teste**. Centralizar em `lib/glossary.ts` para impedir deriva de copy.
- **First-run:** Harnesses vazia → CTA guiado **"descreva seu primeiro agente"** (encadeia conectar Provider/Canal antes de testar — fora desta story).

### Acessibilidade (aplicar — herdado do contrato da 1.5)
[Source: EXPERIENCE.md › Accessibility Floor]
- **Cor não é o único sinal:** item de nav ativo usa `aria-current` + rótulo/peso, não só cor. Estados sempre rótulo+ícone+cor.
- **Foco** visível ≥2px nos dois temas via tokens `focus` (claro `#0E7490`, escuro `#22D3EE`); **nunca** ciano puro como anel no claro.
- **`prefers-reduced-motion`:** `MascotCore` já respeita (1.5 `motion-safe:`); nada de novo movimento essencial aqui.
- **Teclado:** toda a navegação e o `ChatComposer` operáveis por teclado. A vista compacta é **empilhada (stacked)** por padrão — sem widget de abas a implementar; se abas forem adotadas, garantir o padrão WAI-ARIA Tabs completo (setas, `aria-selected`, foco gerenciado).
- **Skip link:** `<a href="#main">` visível ao foco no topo do shell, apontando para `<main id="main">` — pula a navegação repetida (WCAG 2.4.1).

### Stack / decisões (seguir)
[Source: architecture.md › Frontend / Estrutura; 1-5-design-system.md]
- Next.js 16 + React 19 (**App Router**, Server Components, streaming), **Tailwind v4** (`@theme` em CSS — **não** há `tailwind.config.js`). **Componentes são hand-rolled** (CVA + `cn`), no padrão da 1.5 — **o shadcn CLI/Radix NÃO está instalado** (sem `@radix-ui/*` no `apps/web/package.json`). Não rodar `shadcn add` nem assumir primitivos prontos (Tabs, Dialog etc.); se um primitivo Radix for realmente necessário, adicionar a dep explicitamente. `next-themes` já configurado (1.5).
- **Segmentação por feature:** `apps/web/app/(workspace)/{harnesses,builder,operacao,workspace}/` (route group `(workspace)` não entra na URL); componentes em `components/{ui,builder,flow,operations}/`. Reusar `lib/utils.ts` (`cn`).
- **`'use client'`** só onde há estado/efeito/hooks de rota: `AppNav` (usePathname), `BuilderLayout` (abas/responsive), `ChatComposer`. Páginas e o shell layout podem ser Server Components.
- **Estado:** efêmero da UI em React local (a conversa é estado local nesta story). **TanStack Query v5** é o padrão para estado de servidor (query keys em array), mas **não há fetch nesta story** — não introduzir chamadas/endpoints fictícios.
- TS `strict`, **sem `any`**; Biome `organize-imports` (`bunx biome check --write .`).

### Reuso obrigatório (NÃO reinventar)
- `MascotCore`, `StateBadge` → `apps/web/components/ui/` (1.5). **Não** recriar.
- `AGENT_STATES` (`lib/agent-state.ts`), `BLOCK_TYPE_VISUALS`/`blockTypeVisual` (`lib/block-types.ts`), `cn` (`lib/utils.ts`) — já existem (1.5).
- `BLOCK_TYPES`/`BlockType` de `@robbia/shared` — fonte única dos 7 Tipos; não redefinir.
- `ThemeToggle` (`components/theme-toggle.tsx`) — embutir na navegação, não duplicar.

### Aprendizados 1.1–1.5 (aplicar)
[Source: 1-5-design-system.md › Debug Log / Dev Notes]
- **Turbo `test`** só roda onde há script `test`; `apps/web` já tem (1.5). Testes de **lógica pura** em `lib/*.test.ts` via **`bun test`** (sem DOM).
- `apps/web/tsconfig.json` **exclui** `**/*.test.ts(x)` do `tsc` (app tem `types:[]`, sem `bun:test`); manter esse padrão ao adicionar novos testes.
- `next build` reescreve `next-env.d.ts` com `import "./.next/types/..."`; **reverter para a versão limpa committada** antes de finalizar (senão `tsc` quebra em checkout sem `.next`).
- `biome.json` exclui `**/*.css` (Tailwind v4 é dono do CSS). Não tocar.

### O que NÃO fazer (anti-scope)
- **NÃO** renderizar proposta real / `BlockCard` / `FlowNode`/ReactFlow (Story 1.7) — centro e direita são **EmptyState** placeholders.
- **NÃO** implementar `ModelSelector`, aprovação ou estado por Bloco (Story 1.8).
- **NÃO** chamar a IA Arquiteta / gerar resposta no chat (1.7) — o `ChatComposer` só registra o turno do arquiteto na conversa local.
- **NÃO** criar endpoints/API, persistência, TanStack Query wiring nem WebSocket (Epic 2+). Harnesses = só estado vazio.
- **NÃO** adicionar testes de render DOM/Testing-Library (infra de DOM fica para depois) — testar a **lógica pura** (nav, glossário, reducer da conversa). Componentes são consumidores finos, verificados visualmente à mão.

### Testing standards
[Source: architecture.md › Testes co-localizados; 1-5-design-system.md › Testing]
- `apps/web/lib/*.test.ts` com **`bun test`** (lógica pura, sem rede/DOM). Componentes React: **verificação visual manual** + `next build`. e2e (`apps/web/e2e`) fora do MVP desta story.
- Verificação visual headless: `bun run --filter @robbia/web dev` e abrir `/harnesses` (first-run), `/builder` (3 zonas; testar reflow estreitando a janela / zoom 200%+), composer (Enter / Shift+Enter).

### Project Structure Notes
- Novos arquivos sob `apps/web/` apenas: `app/(workspace)/...`, `components/{app-nav,builder/*,ui/empty-state}.tsx`, `lib/{navigation,glossary,conversation}.ts` (+ testes). **Não** alterar outros packages.
- `app/page.tsx` passa de placeholder (1.1) para `redirect('/harnesses')`.
- A vitrine `/design` (1.5) permanece como rota de apoio fora do route group `(workspace)`.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6: Bancada do Builder — navegação, layout de 3 zonas e entrada em linguagem natural]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/EXPERIENCE.md] (IA, 3 zonas, Voice/Tone, State Patterns, Responsive, Accessibility Floor)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/DESIGN.md] (Layout & Spacing, tokens focus/typography)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/mockups/mock-builder.html] (ilustra o layout de 3 zonas — mocks ilustram, spines vencem)
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend (Harness UI)] (App Router por feature, ReactFlow complementar, padrões de estado)
- [Source: _bmad-output/implementation-artifacts/1-5-design-system.md] (MascotCore/StateBadge, padrões de tooling/test web, anti-scope herdado)

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (1M context) — BMad dev-story workflow

### Debug Log References

- Lógica pura (navigation/glossary/conversation) escrita primeiro com testes (`bun test apps/web/lib`) → 19 pass antes de tocar a UI.
- **`builder-layout.tsx` sem `'use client'`** (a Task sugeria client): a vista compacta é **stacked puro em CSS** (`grid-cols-1` → `lg:grid-cols-[20rem_1fr_22rem]`), sem estado/efeito — segue o princípio das Dev Notes ("`'use client'` só onde há hook/efeito"). Clients reais: `app-nav` (usePathname) e `chat-composer` (useState/useRef).
- Zonas do Builder passadas como props (ReactNode) do `BuilderPage` (Server Component) para o `BuilderLayout` — `ChatComposer`/`MascotCore` (clients) compostos a partir do server, padrão suportado pelo App Router.
- `crypto.randomUUID()` só roda no handler de envio (client), nunca no prerender → build estático OK.
- `next build` reescreveu `next-env.d.ts` (import de `.next/...`); revertido para a versão limpa committada (padrão 1.1/1.5).
- Verde em estado limpo: typecheck 16/16, lint 142 arquivos, `bun test apps/web` 19 pass (5 arquivos), `next build` gera `/ · /harnesses · /builder · /operacao · /workspace · /design`.

### Completion Notes List

- ✅ **AC1 — Navegação + first-run:** `(workspace)/layout.tsx` (shell + skip-link WCAG 2.4.1) + `AppNav` (4 surfaces de `NAV_ITEMS`, ativo por `aria-current` + peso/realce — não só cor). `/` → `redirect('/harnesses')`. Harnesses renderiza `EmptyState` first-run com CTA exato "descreva seu primeiro agente" → `/builder`. `metadata.title` por rota.
- ✅ **AC2 — Builder 3 zonas responsivo:** `BuilderLayout` (Conversa | Cards | Fluxo+`MascotCore idle`); 3 colunas em `lg`, **empilhado** abaixo/zoom alto (rem, sem scroll horizontal). Centro/direita são `EmptyState` (BlockCard/FlowNode = 1.7).
- ✅ **AC3 — ChatComposer:** refino contínuo na mesma conversa (reducer puro `appendTurn`), Enter envia / Shift+Enter quebra linha, trim bloqueia vazio, limpa+refoca; `id` via `crypto.randomUUID()`. Microcopy e termos canônicos centralizados em `lib/glossary.ts`.
- 📌 **Lógica pura testada** (nav/glossário/conversa): +19 testes web (era ~5 da 1.5). Componentes React verificados por `next build` + verificação visual manual (headless, sem DOM tests — anti-scope).
- 📌 **Anti-scope respeitado:** sem BlockCard/FlowNode (1.7), sem ModelSelector/aprovação (1.8), sem API/persistência/geração/WebSocket (Epic 2+). `/design` (1.5) intacta.

### File List

**apps/web (novos):**
- `app/(workspace)/layout.tsx` · `app/(workspace)/harnesses/page.tsx` · `app/(workspace)/builder/page.tsx` · `app/(workspace)/operacao/page.tsx` · `app/(workspace)/workspace/page.tsx`
- `components/app-nav.tsx` · `components/builder/builder-layout.tsx` · `components/builder/chat-composer.tsx` · `components/ui/empty-state.tsx`
- `lib/navigation.ts` · `lib/glossary.ts` · `lib/conversation.ts` (+ `navigation.test.ts` · `glossary.test.ts` · `conversation.test.ts`)

**apps/web (modificados):**
- `app/page.tsx` (placeholder 1.1 → `redirect('/harnesses')`)

## Change Log

| Data | Mudança |
|------|---------|
| 2026-06-14 | Story 1.6 criada (ready-for-dev): shell da bancada — navegação primária (4 surfaces), Builder de 3 zonas responsivo (colapsa em abas sob reflow/zoom), ChatComposer com refino contínuo + glossário canônico, Harnesses com first-run guiado. UI em apps/web; reusa design system da 1.5. Anti-scope: sem BlockCard/FlowNode (1.7), sem ModelSelector/aprovação (1.8), sem API/geração. |
| 2026-06-14 | Revisão de qualidade aplicada: (1) corrigida suposição de shadcn/Tabs — projeto é hand-rolled, sem Radix; vista compacta passa a **stacked** por padrão; (2) papéis da conversa `user`/`assistant` (era `arquiteto`/`arquiteta`, ambíguo); (3) `id` do turno via `crypto.randomUUID()` (sem `Math.random`/`Date.now`); (4) mock-builder ancorado na Task 1; (5) `metadata.title` por rota; (6) skip-to-content link (WCAG 2.4.1). |
| 2026-06-15 | Story 1.6 implementada: app shell `(workspace)` com navegação primária (4 surfaces, ativo por `aria-current`+peso) + skip-link; Harnesses com first-run guiado; Builder de 3 zonas (stacked responsivo, rem, sem scroll horizontal) com `MascotCore idle` + placeholders; `ChatComposer` (refino contínuo, Enter/Shift+Enter, glossário canônico); Operação/Workspace shell. `/` → redirect Harnesses. Lógica pura (navigation/glossary/conversation) +19 testes. typecheck/lint/test/build verdes. **Status → review.** |
