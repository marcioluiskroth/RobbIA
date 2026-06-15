---
baseline_commit: 8631e69338d0b018708ed29c7f0c24a3b5b3558d
---
# Story 1.5: Design system — tokens, temas claro/escuro e componentes de estado

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a arquiteto,
I want uma identidade visual consistente (tokens + temas) com indicadores de estado claros,
so that a bancada comunique competência técnica e o estado do agente de forma inequívoca, sobre uma base reutilizável.

> **Primeira story de UI do Epic 1.** Insumo primário: **DESIGN.md** (tokens, taxonomia de Blocos) + **EXPERIENCE.md** (estados, acessibilidade). Reusa `BLOCK_TYPES` de `@robbia/shared` (1.2) — fonte única dos 7 Tipos. Em `apps/web` (Next.js 16 + Tailwind v4 + shadcn/ui). **FR-20 + UX-DR1/5/6/11.**

## Acceptance Criteria

1. **Tokens + temas claro/escuro.**
   **Given** o app `apps/web` com Tailwind v4 + shadcn/ui
   **When** aplico os tokens do DESIGN.md
   **Then** estão disponíveis como variáveis de tema: paleta de **marca** (graphite `#334155`, charcoal `#0F172A`, cyan `#06B6D4`), **apoio** (slate `#475569`, steel `#64748B`, cyanLight `#22D3EE`, mist `#F1F5F9`), **estado** (idle `#64748B`, thinking `#06B6D4`, active `#22D3EE`, waiting `#F59E0B`, done `#22C55E`, error `#EF4444`), **acessível** (cyanText `#0E7490`, fills nível-700: waiting `#B45309`/done `#15803D`/error `#B91C1C`/thinking `#0E7490`/active `#0891B2`) e **foco** (light `#0E7490`, dark `#22D3EE`, 2px/offset 2px); tipografia **Inter** (sans) + **JetBrains Mono** (mono), pesos **400/500**; spacing base-4; rounded (8px base, pill `9999px`); elevation (flat/raised/overlay)
   **And** há **tema claro e escuro alternáveis** (estratégia de classe via `next-themes`), com os valores `light`/`dark` do DESIGN.md (dark bg `#0B1220` — nunca preto puro).

2. **MascotCore — indicador vivo de 6 estados.**
   **Given** o componente `MascotCore`
   **When** o agente muda de estado
   **Then** reflete os 6 estados (Ocioso/Pensando/Ativo/Aguardando/Concluído/Erro) por **cor + ícone + rótulo** (cor nunca é o único sinal), com **pulso** em Pensando/Ativo
   **And** sob `prefers-reduced-motion: reduce` o pulso é desligado e o estado permanece legível estaticamente (UX-DR6, UX-DR16).

3. **StateBadge + taxonomia dos 7 Tipos de Bloco.**
   **Given** o componente `StateBadge` e o mapa de Tipos de Bloco
   **When** renderizo status/Tipos
   **Then** o `StateBadge` é uma pill com **rótulo + ícone + cor**, usando **fill nível-700 + texto branco** no tema claro (UX-DR5)
   **And** existe um mapa **determinístico** dos 7 Tipos de Bloco (cor de borda/realce, ícone Lucide, forma do nó) derivado de `BLOCK_TYPES`, com **ciano apenas em Gatilho e Ação** (disciplina do ciano — UX-DR11).

## Tasks / Subtasks

- [ ] **Task 1 — Dependências e tooling (AC: 1, 2, 3)**
  - [x] Em `apps/web`: adicionar `next-themes`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority` (base do shadcn) e `@robbia/shared` (`workspace:*`, para `BLOCK_TYPES`). Confirmar `tailwindcss`/`@tailwindcss/postcss` (já presentes na 1.1).
  - [x] Adicionar script `"test": "bun test"` em `apps/web/package.json` (para os testes de lógica pura em `lib/`).
- [ ] **Task 2 — Tokens de tema (AC: 1)**
  - [x] `apps/web/app/globals.css`: definir os tokens via Tailwind v4 `@theme` + variáveis CSS para **claro** (`:root`) e **escuro** (`.dark`) com os valores do DESIGN.md (todas as paletas acima). Tokens de fonte (`--font-sans`/`--font-mono`), radius, e cores semânticas (bg/surface/text/textMuted/border/focus).
  - [x] `apps/web/app/layout.tsx`: carregar **Inter** e **JetBrains Mono** via `next/font/google` (pesos 400/500) e expor como CSS vars; envolver com o `ThemeProvider` (next-themes, `attribute="class"`, default system).
  - [x] `apps/web/components/theme-provider.tsx` + `theme-toggle.tsx`: provider e um toggle claro/escuro acessível (aria-label, foco visível).
- [ ] **Task 3 — Utilitário + mapas puros (AC: 2, 3)**
  - [x] `apps/web/lib/utils.ts`: `cn(...)` = `twMerge(clsx(...))` (base shadcn).
  - [x] `apps/web/lib/agent-state.ts`: `AGENT_STATES` — os 6 estados com `{ key, label (PT-BR), colorToken, icon (Lucide), pulse: boolean }`. `pulse` true só em `thinking`/`active`.
  - [x] `apps/web/lib/block-types.ts`: `BLOCK_TYPE_VISUALS: Record<BlockType, { borderColorToken, icon, shape }>` derivado de `BLOCK_TYPES` (`@robbia/shared`) — Gatilho(cyan, `zap`, stadium) · Contexto(slate, `database`, rounded-rect) · Decisão(graphite, `git-branch`, diamond) · Resposta(steel, `message-square`, rounded-rect) · RPA(slate-dark, `monitor`, sharp-rect) · Ação(cyan, `send`, stadium) · Verificação(steel, `check-circle`, hexagon). **Ciano só em Gatilho e Ação.** Exportar um helper `blockTypeVisual(type)`.
- [ ] **Task 4 — Componentes de estado (AC: 2, 3)**
  - [x] `apps/web/components/ui/state-badge.tsx`: `StateBadge` — pill (`rounded-full`) com **ícone + rótulo + cor**; no tema claro usa fill nível-700 + texto branco (via tokens acessíveis). Props: `state` (uma das 6 chaves) ou variante por Tipo; sempre renderiza rótulo textual + ícone.
  - [x] `apps/web/components/ui/mascot-core.tsx`: `MascotCore` — núcleo de IA por estado (cor + ícone + rótulo associado via `aria-label`/texto), **pulso** (Pensando/Ativo) com classe que respeita `motion-reduce:animate-none`; estado legível estaticamente.
- [ ] **Task 5 — Vitrine (opcional, AC: 1,2,3)**
  - [x] `apps/web/app/(showcase)/design/page.tsx` (ou similar): página simples que renderiza a paleta, os 6 estados (MascotCore/StateBadge) e os 7 Tipos de Bloco — apoio à verificação visual manual (não é surface de produto).
- [ ] **Task 6 — Testes de lógica pura (AC: 2, 3) [red-green]**
  - [x] `apps/web/lib/agent-state.test.ts`: 6 estados; cada um tem `label` não-vazio + `icon` + `colorToken` (cor não é único sinal); `pulse` true só em thinking/active.
  - [x] `apps/web/lib/block-types.test.ts`: cobre os 7 `BLOCK_TYPES`; determinismo (mesma entrada → mesma saída); **ciano (`cyan`) apenas em `gatilho` e `acao`**; todo Tipo tem icon + shape + borderColorToken.
- [ ] **Task 7 — Verificação (AC: 1,2,3)**
  - [x] `bun run lint` (Biome), `bun run typecheck`, `bun run test` verdes. `bun run build` (Next) compila. *(Verificação visual real do navegador é manual — fluxo headless.)*

## Dev Notes

### Tokens do DESIGN.md (autoritativo — valores exatos)
[Source: _bmad-output/planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/DESIGN.md]
- **Marca:** graphite `#334155` · charcoal `#0F172A` · cyan `#06B6D4`. **Apoio:** slate `#475569` · steel `#64748B` · cyanLight `#22D3EE` · mist `#F1F5F9` · white `#FFFFFF`.
- **light:** bg `#FFFFFF` · surface `#F1F5F9` · text `#1E293B` · textMuted `#64748B` · structure `#334155` · connectors `#475569` · energy `#06B6D4`.
- **dark:** bg `#0B1220` (nunca preto puro) · surface `#0F172A` · text `#F1F5F9` · textMuted `#94A3B8` · structure `#475569` · connectors `#94A3B8` · energy `#22D3EE`.
- **estado:** idle `#64748B` · thinking `#06B6D4` · active `#22D3EE` · waiting `#F59E0B` · done `#22C55E` · error `#EF4444`.
- **acessível (texto/badge no claro):** cyanText `#0E7490`; fills 700: waiting `#B45309` · done `#15803D` · error `#B91C1C` · thinking `#0E7490` · active `#0891B2`.
- **foco:** light `#0E7490` · dark `#22D3EE` · width 2px · offset 2px (≥3:1 nos dois temas; **nunca** ciano puro como anel no claro).
- **tipografia:** Inter (interface) + JetBrains Mono (código/IDs), pesos **400/500** (evitar Bold). Escala: h1 24/500, h2 18/500, h3 16/500, body 16/400, caption 13/400.
- **rounded:** base/md 8px · sm 4px · lg 12px · full 9999px. **spacing:** base-4. **elevation:** flat `none`, raised `0 1px 2px / 0 1px 3px rgba(15,23,42,.06/.10)`, overlay `0 8px 24px rgba(15,23,42,.18)`.

### Taxonomia visual dos 7 Tipos de Bloco (autoritativo)
[Source: DESIGN.md › Block Types] — **disciplina do ciano: só Gatilho e Ação.**
| Tipo (`BLOCK_TYPES`) | Cor borda/realce | Ícone (Lucide) | Forma |
|---|---|---|---|
| `gatilho` | cyan | `zap` | estádio (start) |
| `contexto` | slate | `database` | retângulo arredondado |
| `decisao` | graphite | `git-branch` | losango |
| `resposta` | steel | `message-square` | retângulo arredondado |
| `rpa` | slate (escuro) + badge modalidade | `monitor` | retângulo cantos retos |
| `acao` | cyan | `send` | estádio (end) |
| `verificacao` | steel | `check-circle` | hexágono |

### 6 estados do agente (EXPERIENCE.md › State Patterns)
Ocioso=`idle`, Pensando=`thinking` (pulso), Ativo=`active` (pulso), Aguardando=`waiting`, Concluído=`done`, Erro=`error`. **Sempre cor + ícone + rótulo** (daltonismo). Ícones sugeridos (Lucide): idle `circle`, thinking `loader`/`sparkles`, active `zap`, waiting `clock`, done `check-circle`, error `alert-triangle`.

### Acessibilidade (requisito comprometido — não suposição)
[Source: EXPERIENCE.md › Accessibility Floor]
- **Nunca** ciano de marca nem cor de estado pura como texto: texto/link/foco em ciano no claro = `#0E7490`. Texto secundário sobre `surface` (mist) usa `slate` (`#475569`), não `steel`/`idle`.
- **StateBadge no claro = fill nível-700 + texto branco** (tokens acessíveis); tonalidades claras só para glifo grande/tema escuro.
- **Anel de foco** visível ≥2px nos dois temas (`focus` tokens). **`prefers-reduced-motion`**: desligar pulso do MascotCore (`motion-reduce:animate-none`).
- **Cor não é o único sinal:** os 6 estados + StateBadge sempre com rótulo textual + ícone.

### Stack / decisões (seguir)
[Source: architecture.md#Frontend (Harness UI), 1-1-scaffold]
- Next.js 16 + React 19 (App Router), **Tailwind v4** (`@theme` em CSS — já em uso; **não** há `tailwind.config.js`), shadcn/ui (base: `cn`, CVA). `next-themes` para alternância de tema (classe `.dark`).
- TS `strict`, sem `any`; Biome `organize-imports` (`bunx biome check --write .`). `'use client'` nos componentes que usam estado/efeitos (MascotCore com animação, ThemeToggle).

### Aprendizados 1.1–1.4 (aplicar)
- **Turbo `test`** só roda onde há script `test` → adicione em `apps/web` (Task 1). Testes de **lógica pura** em `lib/*.test.ts` (sem DOM) — `bun test`.
- **next-env.d.ts:** o `next build` reescreve com `import "./.next/types/..."`; mantenha a versão limpa committada (ver 1.1) para o `tsc` passar em checkout sem `.next`.
- Reuse `BLOCK_TYPES` de `@robbia/shared` — **não** redefina os Tipos.

### O que NÃO fazer (anti-scope)
- **NÃO** construir o Builder de 3 zonas / navegação (Story 1.6), nem BlockCard/FlowNode (1.7), nem ModelSelector/aprovação (1.8). Aqui são **só** tokens + MascotCore + StateBadge + a taxonomia (mapa).
- **NÃO** adicionar testes de render com DOM/Testing-Library nesta story (infra de DOM fica para depois) — teste a **lógica pura** (mapas) que codifica determinismo/acessibilidade. Componentes são consumidores finos.
- **NÃO** usar Bold pesado; **NÃO** usar ciano como texto/anel no claro.

### Testing standards
- `lib/*.test.ts` com `bun test` (lógica pura). Componentes React: verificação visual manual via a vitrine (Task 5) + `next build`. Sem APIs/rede.

### Project Structure Notes
- Arquivos em `apps/web/` (`app/`, `components/ui/`, `components/`, `lib/`). `apps/web` passa a depender de `@robbia/shared` + libs de UI. Não altere outros packages.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5: Design system — tokens, temas claro/escuro e componentes de estado]
- [Source: DESIGN.md] (tokens, contraste/AA, taxonomia de Blocos)
- [Source: EXPERIENCE.md] (6 estados, Accessibility Floor, reduced-motion)
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend (Harness UI)]
- [Source: _bmad-output/implementation-artifacts/1-1-scaffold-monorepo.md] (Tailwind v4, next-env, padrões web)

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (1M context) — BMad dev-story workflow

### Debug Log References

- `bun add next-themes lucide-react clsx tailwind-merge class-variance-authority @robbia/shared@workspace:*` em `apps/web`; +script `test`.
- `apps/web/tsconfig.json`: excluídos `**/*.test.ts(x)` do `tsc` (o app tem `types:[]`, sem `bun:test`; os testes rodam via `bun test`).
- `biome.json`: excluído `**/*.css` — Biome 2.x não parseia as diretivas Tailwind v4 (`@theme`/`@custom-variant`). O Tailwind é dono desse CSS.
- `next build` reescreve `next-env.d.ts` com `import "./.next/types/..."`; revertido para a versão limpa (committada) — typecheck passa em checkout sem `.next` (padrão da 1.1).
- Verde em estado limpo: lint 121 arquivos, typecheck 16/16, **51 testes** (web 5 + architect 11 + provider 15 + shared 18 + db 2), `next build` OK (rotas `/`, `/design`).

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- ✅ **Tokens DESIGN.md** no `globals.css` (Tailwind v4 `@theme` + vars semânticas `:root`/`.dark`): marca/apoio/estado/acessível/foco, Inter + JetBrains Mono (400/500), radius, anel de foco por tema. **Temas claro/escuro** via `next-themes` (`ThemeProvider` + `ThemeToggle` acessível).
- ✅ **`MascotCore`** (6 estados: cor + ícone + rótulo; pulso só Pensando/Ativo via `motion-safe:animate-pulse` → respeita prefers-reduced-motion; expõe estado por texto, sem live-region própria).
- ✅ **`StateBadge`** (pill rótulo+ícone+cor, fill nível-700 + texto branco).
- ✅ **Taxonomia dos 7 Tipos de Bloco** (`lib/block-types.ts`) derivada de `BLOCK_TYPES` (`@robbia/shared`): cor/ícone/forma determinísticos, **ciano só em Gatilho e Ação** (testado).
- ✅ **Vitrine** em `/design` (apoio à verificação visual manual). `bun build` compila tudo (Tailwind v4 + componentes).
- 📌 **Testabilidade headless:** a lógica (mapa de estados + taxonomia de Blocos) é pura e **testada** (codifica determinismo + cor-não-é-único-sinal). **Render de componente com DOM/Testing-Library NÃO foi adicionado** (infra de DOM fica para depois). **A verificação VISUAL real (navegador) é manual** — rode `bun run --filter @robbia/web dev` e abra `/design`.
- 📌 **Anti-scope respeitado:** sem Builder/navegação (1.6), BlockCard/FlowNode (1.7) ou ModelSelector (1.8).

### File List

**apps/web (novos):** `components/theme-provider.tsx` · `components/theme-toggle.tsx` · `components/ui/state-badge.tsx` · `components/ui/mascot-core.tsx` · `lib/{utils,agent-state,block-types}.ts` · `lib/{agent-state,block-types}.test.ts` · `app/design/page.tsx`
**apps/web (modificados):** `app/globals.css` (tokens) · `app/layout.tsx` (fontes + ThemeProvider) · `package.json` (+6 deps, +script `test`) · `tsconfig.json` (exclui testes)
**raiz (modificados):** `biome.json` (exclui `*.css`) · `bun.lock`

## Change Log

| Data | Mudança |
|------|---------|
| 2026-06-14 | Story 1.5 criada (ready-for-dev): design system (tokens DESIGN.md, temas claro/escuro via next-themes, MascotCore + StateBadge, taxonomia determinística dos 7 Tipos de Bloco). UI em apps/web. |
| 2026-06-14 | Story 1.5 implementada: tokens Tailwind v4 + temas (next-themes), MascotCore/StateBadge, taxonomia dos 7 Tipos (ciano só Gatilho/Ação), vitrine /design. +5 testes (51 total). Lint/typecheck/test/build verdes. Verificação visual manual (headless). Status → review. |
