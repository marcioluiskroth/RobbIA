---
baseline_commit: 9657aa525bd905c4cd68c515ba308cbd75175602
---
# Story 1.8: Aprovação e customização por Bloco

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a arquiteto,
I want **aprovar**, **trocar o Modelo de IA** ou **repensar** cada Bloco,
so that eu entregue o agente com a minha assinatura, com controle total.

> **Quarta (e última) story de UI build-time do Epic 1.** Fecha o ciclo conversa → cards → **aprovação**. Constrói sobre o `BuilderWorkspace`/`BlockCard` (1.7): adiciona **estado por Bloco**, ações no card (Aprovar / Trocar modelo / Repensar), o `ModelSelector` acessível e a **elegibilidade de publicação**. **FR-3 + FR-4 + UX-DR2/4/16.**

## Acceptance Criteria

1. **Ações por Bloco no `BlockCard` (UX-DR2, FR-3).**
   **Given** um `BlockCard` proposto
   **When** interajo com suas ações
   **Then** posso **(A) Aprovar**, **(B) Trocar modelo** (abre o `ModelSelector`), **(C) Repensar** — que gera uma alternativa **só daquele Bloco** sem descartar os já aprovados
   **And** um Bloco **"sem LLM"** não oferece **Trocar modelo** (não há Modelo a trocar); Aprovar e Repensar seguem disponíveis.

2. **`ModelSelector` agrupado e acessível (UX-DR4, UX-DR16, FR-4).**
   **Given** o `ModelSelector` aberto num Bloco
   **When** escolho um Modelo
   **Then** ele lista **Modelos agrupados por Provider** com **dica de custo/latência relativa**, e a troca afeta **só aquele Bloco** (nenhum outro muda)
   **And** por teclado: **setas** navegam as opções, **Enter/Espaço** seleciona, **Esc** fecha **e devolve o foco ao gatilho**; o popover tem o papel ARIA correto (`listbox`/`menu`) e foco gerenciado.

3. **Estado por Bloco + elegibilidade de publicação (FR-3).**
   **Given** um Harness em revisão
   **When** verifico a elegibilidade de publicação
   **Then** o Harness só fica **elegível** quando **todos** os Blocos estão **aprovados**, com um resumo visível ("N de M Blocos aprovados")
   **And** o estado por Bloco progride **`proposto` → (`aprovado` | `modelo-trocado` | `repensando`)**; trocar o Modelo de um Bloco aprovado o devolve a `modelo-trocado` (re-aprovação necessária); o estado é sinalizado por **rótulo + ícone** (cor não é o único sinal).

## Tasks / Subtasks

- [x] **Task 1 — Máquina de estado por Bloco (AC: 3) [red-green]**
  - [x] `apps/web/lib/block-review.ts`: tipos + reducer **puro** do estado de revisão. `BlockStatus = 'proposto' | 'aprovado' | 'modelo-trocado' | 'repensando'`. `ReviewState` = array paralelo aos Blocos (`BlockStatus[]`). Transições puras: `approve(state, i)`, `markModelChanged(state, i)`, `startRethink(state, i)`, `settleRethink(state, i)` (→ `proposto`). `isPublishable(state)` = todos `aprovado`. `approvedCount(state)`. Imutável; sem efeitos. **Aprovar** de qualquer estado → `aprovado`; **trocar modelo** de `aprovado` → `modelo-trocado`.
  - [x] `apps/web/lib/block-status-visuals.ts`: mapa determinístico `BlockStatus → { label (PT-BR), icon (Lucide), token }` (cor + ícone + rótulo — UX-DR16). Não reusar `AGENT_STATES` (são os 6 estados do agente, semântica diferente).
- [x] **Task 2 — Catálogo de Modelos (AC: 2) [red-green]**
  - [x] `apps/web/lib/model-catalog.ts`: catálogo **estático/puro** agrupado por `ProviderKind` — `ModelOption { id, label, cost: 'baixo'|'médio'|'alto', latency: 'baixa'|'média'|'alta' }`. Curar alguns Modelos por Provider (Claude/GPT/Gemini/Ollama/OpenRouter). Helper `modelsByProvider()` e `findModel(id)`. Dica de custo/latência é **relativa** (`[ASSUMPTION]` do EXPERIENCE — curada, não medida).
- [x] **Task 3 — ModelSelector acessível (AC: 2)**
  - [x] `apps/web/components/builder/model-selector.tsx` (`'use client'`): popover hand-rolled (sem Radix — não instalado). Gatilho = `<button aria-haspopup="listbox" aria-expanded>`; painel = `role="listbox"` com grupos por Provider (`role="group"` + `aria-label`), cada Modelo `role="option"` + `aria-selected`. **Teclado:** ↑/↓ navegam (roving tabindex ou `aria-activedescendant`), Enter/Espaço seleciona, **Esc fecha e devolve foco ao gatilho**; clicar fora fecha. Mostra `cost`/`latency` por opção (rótulo + ícone, não só cor). `onSelect(modelId)` afeta só o Bloco do contexto.
- [x] **Task 4 — Ações no BlockCard + indicador de estado (AC: 1, 3)**
  - [x] `apps/web/components/builder/block-card.tsx` (modificar — 1.7): adicionar barra de ações **Aprovar** · **Trocar modelo** (abre `ModelSelector`; **oculto se Bloco "sem LLM"**) · **Repensar**, recebidas por props (`onApprove`, `onSelectModel`, `onRethink`) para manter o card testável/burro. Exibir o **status** do Bloco (de `block-status-visuals`) — rótulo + ícone. Estado `repensando` desabilita as ações e mostra atividade. Manter read-first do conteúdo (sem editar texto livre do Bloco).
- [x] **Task 5 — Repensar: architect + server action (AC: 1)**
  - [x] `packages/architect/src/rethink.ts`: `rethinkBlock(provider, input)` → `Result<Block>`. `input = { harness, index, model?, workspace? }`. System-prompt focado: "dado este Harness e o Bloco na posição N, proponha **uma** alternativa para **esse** Bloco (mesmo Tipo, melhor abordagem), preservando os demais"; valida a saída contra `BlockSchema` (reusa `completeStructured`/repair). Exportar no barrel. +teste com `FakeProvider` (mesmo padrão de `decompose.test.ts`).
  - [x] `apps/web/app/(workspace)/builder/actions.ts` (modificar): server action `rethinkBlockAction(harness, index)` → `resolveArchitectConfig` + `createProviderRegistry` + `rethinkBlock`. `Result<Block>` serializável; mesmos estados de erro (`no-provider`/`no-key`) da 1.7. Segredos só no servidor.
- [x] **Task 6 — Integração no BuilderWorkspace (AC: 1, 2, 3)**
  - [x] `apps/web/components/builder/builder-workspace.tsx` (modificar — 1.7): adicionar `reviewState` (`BlockStatus[]`, inicia tudo `proposto` ao receber proposta). Handlers: **Aprovar** → `approve`; **Trocar modelo** → atualiza `proposal.blocks[i].model` (imutável) + `markModelChanged`; **Repensar** → `startRethink` → `rethinkBlockAction` → substitui `proposal.blocks[i]` + `settleRethink` (mantém os aprovados intactos). Propagar status para `BlockCard` (centro) e `BlockList` (1.7). Erro de Provider → reusa o estado "configure um Provider".
- [x] **Task 7 — Elegibilidade de publicação (AC: 3)**
  - [x] No `BuilderWorkspace`/`BuilderLayout`: barra/resumo de revisão — `approvedCount`/total ("N de M Blocos aprovados") + botão **Publicar** habilitado **só** quando `isPublishable`. **Publicação real é do Epic 3** → o botão fica desabilitado com tooltip "disponível ao publicar (Epic 3)" ou dispara um placeholder; **não** implementar publish/deploy aqui.
- [x] **Task 8 — Testes de lógica pura (AC: 1, 2, 3) [red-green]**
  - [x] `apps/web/lib/block-review.test.ts`: transições (proposto→aprovado; aprovado + troca → modelo-trocado; rethink start/settle); `isPublishable` só com todos aprovados; `approvedCount`; imutabilidade.
  - [x] `apps/web/lib/model-catalog.test.ts`: agrupamento por Provider; `findModel` determinístico; toda opção tem cost+latency.
  - [x] `packages/architect/src/rethink.test.ts`: caminho feliz (Block válido) + erro de Provider propagado (sem lançar).
- [x] **Task 9 — Verificação (AC: 1, 2, 3)**
  - [x] `bun run lint`, `bun run typecheck`, `bun run test` verdes. `bun run build` compila. *(Verificação visual manual: abrir `/builder`, gerar proposta (Provider no env), aprovar/trocar/repensar Blocos, conferir o teclado do `ModelSelector` e a elegibilidade.)*

## Dev Notes

### Construído sobre a 1.7 (não reinventar)
[Source: 1-7-cards-e-fluxo.md]
- `BuilderWorkspace` já detém `proposal`/`selectedIndex`/conversa/estado do agente e o server action `proposeHarness` + `resolveArchitectConfig`. 1.8 **estende**: + `reviewState`, + ações no card, + `ModelSelector`, + `rethinkBlockAction`.
- `BlockCard` (1.7) é read-first; 1.8 adiciona **ações** (não edição de texto livre). `BlockList` (1.7) também mostra o status.
- Glossário/`COPY` (`lib/glossary.ts`) — adicionar a copy nova (rótulos de ação, status, "N de M aprovados", tooltip de publicar). Termos canônicos (Modelo de IA, Bloco, Harness).

### Estado por Bloco (autoritativo — AC3)
- `proposto` (inicial) → `aprovado` (Aprovar) | `modelo-trocado` (após Trocar modelo) | `repensando` (transiente durante Repensar; ao concluir volta a `proposto` com novo conteúdo).
- **Elegível para publicação ⇔ todos os Blocos `aprovado`.** Trocar o Modelo de um Bloco já aprovado **revoga** a aprovação (→ `modelo-trocado`) — mudança material exige re-aprovação.
- Sinalizar sempre por **rótulo + ícone** (cor não é o único sinal — UX-DR16). **Não** reusar `AGENT_STATES` (os 6 estados do agente são outra dimensão).

### ModelSelector — contrato de acessibilidade (UX-DR4/16)
[Source: EXPERIENCE.md › Interaction Primitives / Accessibility Floor]
- shadcn/Radix **não** está instalado → **hand-roll** o popover com o padrão ARIA: gatilho `aria-haspopup="listbox"`+`aria-expanded`; painel `role="listbox"`; grupos por Provider; opções `role="option"`+`aria-selected`. **Setas navegam, Enter/Espaço seleciona, Esc fecha e devolve o foco ao gatilho** (retorno de foco garantido — UX-DR16). Fechar ao clicar fora e ao perder foco.
- A troca afeta **só** o Bloco de contexto (FR-4) — outros Blocos intocados (o `BuilderWorkspace` faz update imutável de `proposal.blocks[i].model`).
- Custo/latência: rótulo textual + ícone (ex.: `$`/`$$`/`$$$` **com** rótulo), nunca só cor.

### Repensar — onde mora a inteligência
[Source: 1-4-ia-arquiteta-nl-harness.md; packages/architect]
- A lógica de planejamento mora em `@robbia/architect` (a 1.4 fez `decompose`). 1.8 adiciona `rethinkBlock` lá (não no app web) — reusa `completeStructured`/repair e valida contra `BlockSchema`. O server action é fino (orquestração + provider via env).
- **Preservar aprovados:** o `BuilderWorkspace` substitui **apenas** `proposal.blocks[index]`; os demais (incl. aprovados) ficam intactos. O Bloco repensado entra como `proposto` (precisa nova aprovação).

### Stack / decisões (seguir)
- Next.js 16 App Router; componentes **hand-rolled** (CVA + `cn`); `'use client'` só onde há estado/efeito (`ModelSelector`, e os handlers no `BuilderWorkspace`). `BlockCard` permanece um componente burro que recebe handlers.
- TS `strict`, sem `any`; Biome `organize-imports`. Server action com segredos só no servidor (1.7).
- Testes de **lógica pura** (`block-review`, `model-catalog`) e o `rethinkBlock` (architect, com `FakeProvider`) — sem DOM. `ModelSelector`/cards: verificação visual + `next build`.

### O que NÃO fazer (anti-scope)
- **NÃO** implementar **publicação/deploy real** nem operação 24/7 — é o **Epic 3** (Story 3.3). Aqui só a **elegibilidade** (botão habilita quando todos aprovados) + placeholder.
- **NÃO** persistir a proposta/aprovações (sem tabelas/endpoints) — estado efêmero do client (Epic 2+ traz persistência).
- **NÃO** permitir edição livre do texto do Bloco, nem editor de arestas (read-first segue valendo).
- **NÃO** medir custo/latência reais — catálogo curado estático (`[ASSUMPTION]`).
- **NÃO** instalar shadcn/Radix — `ModelSelector` é hand-rolled acessível.

### Testing standards
- `apps/web/lib/{block-review,model-catalog}.test.ts` + `packages/architect/src/rethink.test.ts` com `bun test`. Componentes: visual + `next build`.

### Project Structure Notes
- Novos: `apps/web/lib/{block-review,block-status-visuals,model-catalog}.ts` (+ testes); `apps/web/components/builder/model-selector.tsx`; `packages/architect/src/rethink.ts` (+ teste).
- Modificados: `apps/web/components/builder/{block-card,builder-workspace}.tsx`; `apps/web/components/builder/block-list.tsx` (status); `apps/web/app/(workspace)/builder/actions.ts` (+`rethinkBlockAction`); `apps/web/lib/glossary.ts` (+copy); `packages/architect/src/index.ts` (barrel).

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.8: Aprovação e customização por Bloco]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/EXPERIENCE.md] (BlockCard ações, ModelSelector, Accessibility Floor, State Patterns)
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend (Harness UI)] (server actions, estado local, FR-3/FR-4)
- [Source: _bmad-output/implementation-artifacts/1-7-cards-e-fluxo.md] (BuilderWorkspace, BlockCard, server action, architect bridge)
- [Source: _bmad-output/implementation-artifacts/1-4-ia-arquiteta-nl-harness.md] (architect decompose/completeStructured — base do rethinkBlock)

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (1M context) — BMad dev-story workflow

### Debug Log References

- Lógica pura primeiro (block-review/model-catalog) + architect rethinkBlock, com testes (`bun test`) → 13 pass antes da UI.
- `ModelSelector` acessível: padrão **listbox com roving tabindex** (opções `<button role="option">` → teclado nativo p/ Enter/Espaço; container `role="listbox"` trata setas/Esc; foco devolvido ao gatilho). Evita `useKeyWithClickEvents`/`useFocusableInteractive` (botões nativos + roving). Único `biome-ignore` necessário: `useSemanticElements` no `<div role="group">` (padrão WAI-ARIA de grupos em listbox; `<fieldset>` é p/ forms).
- Server action: extraído helper privado `resolveProvider()` (não-exportado — `'use server'` só permite exports async) compartilhado por `proposeHarness` (1.7) e `rethinkBlockAction` (1.8).
- `ChatComposer` (1.6→1.7) já era controlado; `BlockCard` (1.7) passou de read-only a receber handlers (Aprovar/Trocar/Repensar) + status.
- `next build` reescreve `next-env.d.ts` → revertido.
- Verde em estado limpo: typecheck 16/16, lint (162 arquivos, sem supressões inúteis), `bun test apps/web packages/architect` **59 pass** (15 arquivos), `next build` OK (6 rotas).

### Completion Notes List

- ✅ **AC1 — Ações por Bloco:** `BlockCard` ganhou Aprovar · Trocar modelo (`ModelSelector`, **oculto se Bloco "sem LLM"**) · Repensar (handlers via props). Status do Bloco exibido (rótulo+ícone).
- ✅ **AC2 — ModelSelector:** Modelos agrupados por Provider + dica de custo/latência (rótulo+texto, não só cor); troca afeta **só** aquele Bloco (update imutável de `proposal.blocks[i].model`); teclado completo (↑/↓/Home/End, Enter/Espaço, **Esc devolve foco ao gatilho**), ARIA `listbox`/`group`/`option`, fecha ao clicar fora.
- ✅ **AC3 — Estado + elegibilidade:** `reviewState` (`proposto→aprovado/modelo-trocado/repensando`); trocar Modelo de um Bloco aprovado o revoga (→`modelo-trocado`); barra "N de M Blocos aprovados" + botão **Publicar** habilitado só quando `isPublishable` (todos aprovados). Status também espelhado na `BlockList`.
- ✅ **Repensar preserva aprovados:** `rethinkBlock` (architect) gera UM Bloco validado; o `BuilderWorkspace` substitui **só** `proposal.blocks[index]` (demais intactos) e o repensado volta a `proposto`.
- 📌 **Anti-scope:** sem publish/deploy real (botão é só elegibilidade — Epic 3); sem persistência; sem edição livre/arestas; catálogo de Modelos estático curado; sem Radix/shadcn (ModelSelector hand-rolled).
- 📌 **Manual:** gerar/repensar com proposta real exige Provider no env (1.7); sem ele, cai no estado "configure um Provider".

### File List

**apps/web (novos):**
- `lib/block-review.ts` · `lib/block-status-visuals.ts` · `lib/model-catalog.ts` (+ `block-review.test.ts`, `model-catalog.test.ts`)
- `components/builder/model-selector.tsx`

**apps/web (modificados):**
- `components/builder/block-card.tsx` (ações + status) · `components/builder/builder-workspace.tsx` (reviewState + handlers + barra de publicação) · `components/builder/block-list.tsx` (status) · `app/(workspace)/builder/actions.ts` (+`rethinkBlockAction` + helper) · `lib/glossary.ts` (+copy 1.8)

**packages/architect (novos):** `src/rethink.ts` (+ `rethink.test.ts`) · **(modificado)** `src/index.ts` (barrel)

## Change Log

| Data | Mudança |
|------|---------|
| 2026-06-15 | Story 1.8 criada (ready-for-dev): aprovação/customização por Bloco — ações no `BlockCard` (Aprovar/Trocar modelo/Repensar), `ModelSelector` acessível agrupado por Provider (teclado + retorno de foco), estado por Bloco (`proposto→aprovado/modelo-trocado/repensando`) e elegibilidade de publicação (todos aprovados). `rethinkBlock` adicionado a `@robbia/architect` (preserva os demais Blocos). Catálogo de Modelos estático. Constrói sobre o `BuilderWorkspace` (1.7). Anti-scope: sem publish/deploy real (Epic 3), sem persistência, sem edição livre/arestas. |
| 2026-06-15 | Story 1.8 implementada: `block-review` (máquina de estado pura) + `block-status-visuals` + `model-catalog`; `ModelSelector` (listbox roving-tabindex acessível); `BlockCard` com ações + status; `rethinkBlock` no architect + `rethinkBlockAction`; `BuilderWorkspace` com reviewState/handlers/barra de publicação; `BlockList` com status. +diversos testes (59 total web+architect). typecheck/lint/test/build verdes. **Status → review.** Fecha o fluxo build-time do Épico 1. |
| 2026-06-15 | Code review aplicado: (1) `ModelSelector` não fecha mais ao clicar em cabeçalho de grupo / padding do painel (passa a usar `listboxRef` no check de clique-fora); (2) Repensar que falha restaura o status anterior do Bloco (não rebaixa um Bloco aprovado). Verde em typecheck/lint/test/build. |
| 2026-06-15 | Mergeada na `main` (PR #12) após code review; ciclo encerrado. **Status → done.** Fecha o build-time do Épico 1. |
