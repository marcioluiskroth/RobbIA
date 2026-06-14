---
status: final
updated: 2026-06-14
project: RobbIA
design_ref: ./DESIGN.md
sources:
  - _bmad-output/planning-artifacts/prds/prd-RobbIA-2026-06-14/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - docs/brand-book.md
---

# RobbIA — EXPERIENCE.md

> Como a bancada **funciona**: arquitetura de informação, comportamento, estados, interações, acessibilidade e fluxos. Identidade visual vive em [DESIGN.md](./DESIGN.md); este spine referencia tokens por `{path.to.token}`. **Ambos os spines vencem em conflito** com qualquer mock. `[ASSUMPTION]` = inferido no Fast path, confirmar.

## Foundation
- **Form-factor:** web **desktop-first** (single-workspace, um arquiteto). Mobile fora do MVP (Fase 5).
- **UI system:** shadcn/ui + Tailwind — herda comportamento/acessibilidade dos componentes shadcn; aqui especificamos só o **delta** específico da RobbIA.
- **Modelo mental primário:** **conversa → cards (um Bloco por vez) → aprovação**. A vista de fluxo (ReactFlow) é **complementar** (visualização do encadeamento), **não** um editor nó-a-nó estilo n8n (FR-14).
- **Dois planos de uso:** *build-time* (construir/refinar o Harness) e *run-time* (operar/monitorar o agente 24/7) — a IA da informação separa os dois.

## Information Architecture
**Navegação primária (workspace único):**
1. **Harnesses** — lista dos agentes do arquiteto (criar, abrir, status).
2. **Builder** — construção de um Harness (entra ao criar/abrir).
3. **Operação** — execuções ao vivo, logs, fila de confirmações de Ação Irreversível.
4. **Workspace** — Providers (chaves), Canais (Evolution/Telegram), Credenciais (via CES), tema claro/escuro.

**Layout do Builder — 3 zonas** `[ASSUMPTION]` (ver DESIGN.md › Layout & Spacing):
- **Esquerda — Conversa:** chat com a IA Arquiteta (descrição, "repensar", esclarecimentos).
- **Centro — Cards/Inspetor do Bloco:** um `{components.BlockCard}` por vez com ações de aprovação.
- **Direita — Fluxo & Contexto:** `{components.FlowNode}` (ReactFlow) do Harness + estado do agente (`{components.MascotCore}`).

**Surface closure (cada necessidade → uma tela; cada tela → um fluxo que aterrissa nela):**
| Necessidade (PRD) | Surface | Fluxo |
|---|---|---|
| Descrever automação em NL (FR-1) | Builder › Conversa | UJ-1 passo 1 |
| Ver/aprovar Blocos (FR-2,3,4) | Builder › Cards | UJ-1 passos 2–5 |
| Testar antes de publicar (FR-6) | Builder › Modo de Teste (overlay no fluxo) | UJ-1 clímax / UJ-2 clímax |
| Publicar + operar 24/7 (FR-12) | Operação | UJ-1 resolução |
| Logs/auditoria ao vivo (FR-12) | Operação › Logs | UJ-1 resolução |
| Confirmar Ação Irreversível (FR-13,19) | Operação › Fila de confirmações | Fluxo de Confirmação |
| Configurar credencial faltante (FR-11) | `{components.CredentialPrompt}` (inline no Builder/Teste) | UJ-1 edge case |
| Trocar Modelo por Bloco (FR-4) | `{components.ModelSelector}` no card | UJ-1 passo 3 |
| Gerenciar agentes (FR-12) | Harnesses (lista) | criar → abrir → ver status (empty: primeiro agente — ver First-Run) |
| Visão geral de execuções/saúde (FR-12) | Operação › Dashboard | abrir Operação → lista de execuções + estado dos agentes + fila |
| Gerir chaves/Providers + ver Modelos (FR-9) | Workspace › Providers | add chave → validar → status (configurado/inválido/inalcançável) |
| Conectar Canal (FR-10) | Workspace › Canais | conectar (QR Evolution / token Telegram) → pareando → conectado/expirado |
| Status de credencial (FR-11) | Workspace › Credenciais | ver status (configurada/expirada/faltando) — **nunca** exibe segredo |
| Alertar arquiteto ausente (FR-18 / erro) | Notificações/Alertas | gatilho (ação irreversível pendente, erro escalado, Provider/Canal fora) → notifica |

## Voice and Tone (microcopy)
- **Princípio:** técnico, claro, profissional; PT-BR; sem hype, sem infantilização. Trata o usuário como um par especialista.
- **A IA Arquiteta fala como uma colega sênior:** propõe com justificativa de 1 linha, pede esclarecimento quando falta entrada obrigatória (Canal/sistema-alvo/credencial — FR-1), nunca finge certeza.
- **Erros:** dizem o que houve + o que fazer (acionável), sem jargão de stack. Ex.: *"O Provider Claude não respondeu (timeout). Tentando novamente… 2/3."*
- **Distinção crítica:** esta voz é da **interface**; a voz dos **agentes gerados** é configurada por Harness e não segue este spine.
- `[ASSUMPTION]` Glossário do produto na UI usa os termos exatos do PRD (Harness, Bloco, Modelo de IA, Canal, Modo de Teste) — sem sinônimos.

## Component Patterns (comportamento)
*(Specs visuais em DESIGN.md › Components.)*
- **BlockCard** — mostra Tipo, Modelo sugerido, justificativa, encadeamento. Ações: **Aprovar** · **Trocar modelo** (`{components.ModelSelector}`) · **Repensar** (gera alternativa só daquele Bloco, sem descartar os aprovados — FR-3). Blocos "sem LLM" não exibem seletor de modelo.
- **ChatComposer** — entrada de NL; suporta refino contínuo numa única conversa (FR-14).
- **ModelSelector** — popover agrupado por Provider; troca afeta só aquele Bloco (FR-4); mostra dica de custo/latência relativa `[ASSUMPTION]`.
- **FlowNode** — reflete estado de execução em tempo real; clicável para focar o Bloco no centro. Read-first (não é editor de arestas no MVP).
- **LogLine** — stream append-only por execução/Bloco; entrada/saída/status; dados sensíveis já redatados (nunca exibe credencial).
- **ConfirmDialog** — Ação Irreversível: descreve a ação concreta, exige confirmação explícita; default seguro = não-executar.
- **CredentialPrompt** — quando falta credencial, **pausa o fluxo** e a solicita antes de permitir teste/execução (FR-11; UJ-1 edge case); encaminha ao CES.
- **MascotCore** — indicador de **estado vivo no nível do agente** (núcleo de IA pulsante; os 6 estados), onipresente no Builder/Operação. Componente **distinto** do StateBadge.
- **StateBadge** — pill de **status por Bloco / por execução** (rótulo + ícone + cor); aparece no `{components.BlockCard}`, no `{components.FlowNode}` e na lista de execuções. Carrega a regra "cor não é o único sinal" (rótulo + ícone sempre presentes — ver Accessibility Floor).
- **Block Types** — `{components.BlockCard}` (borda/realce por Tipo) e `{components.FlowNode}` (forma do nó) renderizam a partir do mapa autoritativo em **DESIGN.md › Block Types (taxonomia visual)** — cor/ícone/forma por Tipo, deterministicamente.
- **Provider & Failover cue (FR-17)** — quando um Bloco cai para um Modelo/Provider de fallback, o operador **vê**: badge/entrada de log "Claude indisponível → fallback OpenRouter". A saúde e as chaves dos Providers ficam visíveis em **Workspace › Providers** (FR-9).

## State Patterns
- **Estados genéricos por surface:** `idle · loading · streaming · success · error · empty`. Toda lista/painel define o estado vazio (ex.: "Nenhum Harness ainda — descreva o que quer automatizar").
- **6 estados do agente** (mapeados às cores `{colors.state}` e ao `{components.MascotCore}`):
  | Estado | Quando | Cor |
  |---|---|---|
  | Ocioso | agente parado | `{colors.state.idle}` |
  | Pensando | IA Arquiteta projetando o Harness | `{colors.state.thinking}` |
  | Ativo | executando uma tarefa | `{colors.state.active}` |
  | Aguardando | esperando aprovação humana (FR-13) | `{colors.state.waiting}` |
  | Concluído | tarefa finalizada com sucesso | `{colors.state.done}` |
  | Erro | falha que requer atenção | `{colors.state.error}` |
- **Estado por Bloco (build):** `proposto → (aprovado | modelo-trocado | repensando)`. Publicação só habilita quando **todos** os Blocos estão aprovados (FR-3).
- **Estado por Bloco (execução):** `pendente → executando → (ok | retry n/3 | erro-escalado)` — espelha a política de retry da arquitetura (FR-5/FR-17).
- **Taxonomia consolidada de erro & vazio:** toda lista/painel define explicitamente seus estados **vazio** e **erro**. Categorias de erro → surface → recuperação: Provider fora (Operação/log → failover/retry), Canal fora (Operação/Workspace › Canais → reconectar), credencial faltando/expirada (`{components.CredentialPrompt}` → configurar via CES), RPA mudou de layout (log/Bloco → retry n/3, depois notifica), falha no Teste (overlay de Teste → repensar/ajustar), falha ao publicar (Operação → tentar novamente). Estados genéricos (loading/empty/error) anunciados como status sem roubar foco.
- **First-run / onboarding (estado vazio guiado):** primeira chegada sem Providers/Canais/Harnesses. Harnesses vazia → CTA guiado **"descreva seu primeiro agente"**, encadeando conectar primeiro Provider/Canal quando necessário antes de testar.

## Interaction Primitives
- **Aprovar / Trocar modelo / Repensar** por Bloco (FR-3).
- **Rodar Modo de Teste** — executa com dados simulados, bloco a bloco, ao vivo; **não dispara Ação Irreversível real sem confirmação** (FR-6).
- **Publicar** — leva do Teste à produção sem reconstruir (FR-12).
- **Pausar / Editar Bloco isolado** sem recriar o Harness (FR-12).
- **Confirmar Ação Irreversível** — ver Trust & Confirmation.
- **Conectar Canal / Credencial mid-flow** — sem sair do Builder (FR-11).

## Real-time & Streaming *(seção inventada — concorrência central da RobbIA)*
- A execução é **ao vivo via WebSocket** (arquitetura: <~2s). Cada Bloco transmite entrada/saída/status em tempo real no Teste e na Operação (FR-6/FR-12).
- **Conexão caindo:** banner não-bloqueante "Reconectando…"; o log se reconcilia no retorno (não perde eventos — FR-18). `[ASSUMPTION]`
- **Rajada de mensagens:** UI reflete serialização por conversa (FR-16) — sem respostas duplicadas/fora de ordem visíveis.

## Responsive & Platform
- **Desktop-first.** Viewport ótimo ~**1280px**; reflow gracioso até ~**1024px** e sob zoom alto (200–400%, WCAG 1.4.10/1.4.4 — ver Accessibility Floor).
- Em larguras estreitas / zoom alto, o **builder de 3 zonas colapsa** para zonas empilhadas ou em abas (Conversa / Cards / Fluxo), sem scroll bidirecional nem corte de conteúdo.
- **Mobile fora do MVP** (Fase 5).

## Trust & Confirmation *(seção inventada — segurança como experiência)*
- **Ação Irreversível** (envio em massa, lançamento financeiro, deleção) entra numa **fila de confirmação** em Operação, com `{components.ConfirmDialog}`.
- **Timeout de 24h** (configurável) → a ação é **cancelada/enfileirada para revisão**, nunca executada às cegas (FR-19).
- **Canal de confirmação resiliente:** confirmável pelo **painel/log**, não só pelo Canal de mensagens (que pode estar fora) — evita dependência circular (FR-19).
- **Credenciais:** a UI **nunca** exibe segredo em claro; só status "configurada / expirada / faltando" (FR-11).

## RPA Modality Cues *(seção inventada — web vs desktop Windows)*
- O usuário deve **reconhecer a modalidade** de um Bloco RPA: web (Playwright) vs **desktop Windows nativo** (FR-21) — ícone/badge distinto no `{components.BlockCard}` e `{components.FlowNode}`. `[ASSUMPTION: ícones distintos por modalidade.]`
- **Verificação visual (FR-8):** o screenshot capturado (página ou janela) aparece no log com o veredito estruturado do LLM (sucesso/falha + motivo), com dados sensíveis redatados.
- **Desafio interativo (2FA/captcha):** o Bloco pausa e sinaliza **handoff humano** explícito em vez de falhar silenciosamente (FR-7/FR-21).

## Accessibility Floor
- **Alvo WCAG 2.1 AA** (PRD §8) — **requisito comprometido**, não suposição.
- **Contraste (texto/foco em fundo claro):** texto = `{colors.light.text}` / `{colors.brand.graphite}` / `{colors.support.slate}` (todos PASS); **nunca** ciano de marca nem cor de estado pura como texto. Para texto/link/foco em ciano sobre claro usar `{colors.accessible.cyanText}` (`#0E7490`). Texto secundário sobre cards (`{colors.light.surface}` névoa) usa `{colors.support.slate}`, não `steel`/`idle`. **StateBadge em tema claro = fill nível-700 + texto branco** (`{colors.accessible.waitingFill|doneFill|errorFill|thinkingFill|activeFill}`); tonalidades claras só para glifo grande (≥24px) e tema escuro. Detalhe da paleta em DESIGN.md › Contraste & uso de cor (AA).
- **Contrato de aria-live (anti-inundação):**
  - **Uma** região `aria-live="polite"` dedicada **só a transições de estado do agente** (e a eventos acionáveis enxutos: aguardando confirmação, handoff humano). O `{components.MascotCore}` expõe o estado via `aria-label`/texto associado, mas **não** dispara o anúncio sozinho (evitar duplicação).
  - **Erros** e **confirmações de Ação Irreversível** via `role="alert"` (`aria-live="assertive"`).
  - O **log em streaming** é `role="log"` navegável **sob demanda** — **NÃO** é aria-live (evita inundar o leitor de tela com rajada append-only). Banner "Reconectando…" é `role="status"`; ao reconciliar anuncia só "conexão restaurada, N eventos sincronizados", nunca o backlog inteiro.
- **Foco:** anel visível usando `{colors.focus}` (largura ≥2px, offset 2px, contraste ≥3:1 nos dois temas); **nunca** ciano puro como anel em fundo claro (usar `{colors.focus.light}` `#0E7490`); no escuro `{colors.focus.dark}`.
- **Contratos de teclado por componente:**
  - **`{components.ModelSelector}`** (popover): setas para navegar opções, Esc fecha e devolve foco ao gatilho, retorno de foco garantido.
  - **`{components.ConfirmDialog}`**: focus trap, Esc cancela (default seguro), confirmação explícita; foco inicial **no botão seguro/cancelar**, nunca no destrutivo.
  - **`{components.FlowNode}` / vista ReactFlow**: o canvas **não** é acessível por teclado/leitor de tela — fornecer uma **alternativa não-canvas**: lista navegável dos Blocos do Harness espelhando o canvas (foco por Bloco, Enter foca o Bloco no centro).
- **Reflow / zoom 200–400% (WCAG 1.4.10 / 1.4.4):** o builder de 3 zonas **colapsa para zonas empilhadas/em abas** em larguras estreitas e zoom alto — **AA obrigatório mesmo no desktop** (reflow ≠ mobile). Sem scroll bidirecional nem corte de conteúdo; tipografia em unidades relativas (rem). Ver Responsive & Platform.
- **Movimento (reduced-motion):** sob `prefers-reduced-motion: reduce` desligar o **pulso do `{components.MascotCore}`**, a animação de **"fluxo rodando"** do mascote e o **auto-scroll do log** (scroll instantâneo, pausável); manter o estado legível de forma estática (cor+ícone+rótulo).
- **Cor não é o único sinal:** os 6 estados sempre acompanham **rótulo textual + ícone** além da cor (daltonismo/monocromacia).

## Key Flows
**UJ-1 — Rafael transforma um pedido de cliente num agente de atendimento WhatsApp.**
1. Abre o Builder e descreve em NL: *"agente que recebe mensagens no WhatsApp, busca histórico, responde dúvidas e me avisa se for reclamação grave."*
2. IA Arquiteta (estado **Pensando**) propõe o Harness em cards: Gatilho (Evolution) → Contexto → Decisão (intenção) → Resposta → Decisão (escala?) → Ação (envia) → Ação (registra).
3. Num card, troca o modelo sugerido por um mais barato (`{components.ModelSelector}`).
4. Em outro, pede **Repensar**; a IA ajusta só aquele Bloco.
5. Aprova os demais; **Publicar** habilita.
6. **Clímax:** roda em **Modo de Teste** com uma mensagem simulada e vê cada Bloco executar ao vivo até uma resposta coerente.
7. **Resolução:** publica com um clique; acompanha logs ao vivo em Operação.
- *Edge case:* Bloco precisa de credencial não configurada → `{components.CredentialPrompt}` pausa o fluxo e a solicita antes do teste.

**UJ-2 — Marina cria um agente que lança pedidos num ERP sem API (RPA).**
1. Descreve o objetivo; a IA Arquiteta inclui um **Bloco RPA** (badge de modalidade — web ou desktop Windows).
2. Marina aprova; no Teste, o RPA abre o sistema isolado, preenche o formulário e captura screenshot.
3. **Clímax:** um Bloco de **Verificação** lê o screenshot e confirma *"pedido lançado com sucesso"* — sem ela escrever uma linha de automação.
4. **Resolução:** ativa em produção; o agente lança pedidos sozinho, escalando para humano em caso de erro.
- *Edge case:* ERP muda de layout e o RPA falha → retry (n/3); persistindo, marca erro e **notifica Marina**, sem completar Ação Irreversível.

**Fluxo de Confirmação — Ação Irreversível.**
1. Em produção, um Bloco vai disparar uma Ação Irreversível (ex.: lançamento financeiro).
2. Agente entra em **Aguardando**; aparece na **fila de confirmações** (Operação) com `{components.ConfirmDialog}` descrevendo a ação concreta.
3. **Clímax:** Marina confirma pelo painel (ou rejeita). Se ninguém confirma em 24h → cancelada/enfileirada para revisão (FR-19).

## Mockups de Referência
Mocks HTML 1:1 (tema claro) que ancoram layout e linguagem visual. **Os spines vencem em conflito** — os mocks ilustram, não substituem.
- [mockups/mock-builder.html](./mockups/mock-builder.html) — Builder de 3 zonas (conversa / cards de Bloco / fluxo), 7 Blocos do agente WhatsApp, MascotCore "Pensando".
- [mockups/mock-operacao.html](./mockups/mock-operacao.html) — Operação: dashboard, fila de confirmação de Ação Irreversível, log ao vivo com cue de failover e verificação visual de RPA.
- [mockups/mock-modo-teste.html](./mockups/mock-modo-teste.html) — Modo de Teste: execução bloco a bloco ao vivo com dados simulados, retry 2/3, preview da resposta.

**Cobertura de mocks:** telas-chave mockadas (Builder, Operação, Modo de Teste). Surfaces **spine-only** (construir a partir das tabelas, sem mock dedicado): Harnesses (lista), Workspace › Providers/Canais/Credenciais, Notificações. Layout simples; o brand book + tokens bastam.
