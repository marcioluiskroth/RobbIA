---
status: draft
updated: 2026-06-14
project: RobbIA
review_type: accessibility
target: WCAG 2.1 AA
reviewer: accessibility specialist
sources:
  - ./DESIGN.md
  - ./EXPERIENCE.md
---

# RobbIA — Accessibility Review (WCAG 2.1 AA)

> Revisão de acessibilidade dos spines de UX (DESIGN.md + EXPERIENCE.md). Alvo: **WCAG 2.1 AA**. Produto desktop-first, profissional, denso em dados ao vivo, open-source com lançamento público. Os spines já têm uma seção "Accessibility Floor" sólida em intenção; a maioria dos problemas reais está na **paleta de cores funcionais** e na falta de especificação concreta (tokens de texto acessível, parâmetros de foco, contrato de aria-live).

## Veredito geral

Intenção de acessibilidade boa e explícita (não-cor-única, teclado, aria-live, reduced-motion estão todos nomeados). Porém **a paleta tem falhas reais de contraste AA** que, se implementadas como escritas, reprovam: ciano como texto em tema claro, e várias **cores de estado usadas como texto/rótulo em tema claro**. O tema escuro é muito mais saudável. Há também lacunas de especificação que precisam virar contrato antes do build.

---

## 1. Contraste de cor (1.4.3 texto / 1.4.11 não-texto)

Razões calculadas (fórmula WCAG relative luminance) para os pares do frontmatter `colors`. Limiares: **4.5:1** texto normal, **3:1** texto grande (≥18px regular / ≥14px bold) e componentes de UI / indicadores gráficos.

### Tema claro — texto

| Par (texto sobre fundo) | Ratio | Texto 4.5:1 | Grande/UI 3:1 |
|---|---|---|---|
| graphite `#334155` / white | 10.35:1 | PASS | PASS |
| graphite `#334155` / mist `#F1F5F9` | 9.45:1 | PASS | PASS |
| slate `#475569` / white | 7.58:1 | PASS | PASS |
| lightText `#1E293B` / white | 14.63:1 | PASS | PASS |
| lightText `#1E293B` / mist | 13.35:1 | PASS | PASS |
| steel `#64748B` / white | 4.76:1 | PASS (marginal) | PASS |
| **steel `#64748B` / mist `#F1F5F9`** | **4.34:1** | **FAIL** | PASS |
| **cyan `#06B6D4` / white** | **2.43:1** | **FAIL** | **FAIL** |
| **cyan `#06B6D4` / mist** | **2.22:1** | **FAIL** | **FAIL** |
| **cyanLight `#22D3EE` / white** | **1.81:1** | **FAIL** | **FAIL** |
| **cyanLight `#22D3EE` / mist** | **1.65:1** | **FAIL** | **FAIL** |

### Tema escuro — texto (todos saudáveis exceto estrutura como texto)

| Par | Ratio | Texto 4.5:1 |
|---|---|---|
| darkText `#F1F5F9` / darkBg `#0B1220` | 17.09:1 | PASS |
| darkText / darkSurface `#0F172A` | 16.30:1 | PASS |
| darkTextMuted `#94A3B8` / darkBg | 7.30:1 | PASS |
| darkTextMuted / darkSurface | 6.96:1 | PASS |
| cyanLight `#22D3EE` (energy dark) / darkBg | 10.36:1 | PASS |
| cyanLight / darkSurface | 9.88:1 | PASS |
| cyan `#06B6D4` / darkBg | 7.71:1 | PASS |
| **slate `#475569` (dark `structure`) / darkBg** | **2.47:1** | FAIL como texto (mas é estrutura, não texto — ver abaixo) |

### Cores de estado como TEXTO/RÓTULO

Tema claro (sobre white / mist):

| Estado | /white | /mist | Texto 4.5:1 | Grande/UI 3:1 |
|---|---|---|---|---|
| idle `#64748B` | 4.76 | 4.34 | white PASS, **mist FAIL** | PASS |
| **thinking `#06B6D4`** | 2.43 | 2.22 | **FAIL** | **FAIL** |
| **active `#22D3EE`** | 1.81 | 1.65 | **FAIL** | **FAIL** |
| **waiting `#F59E0B`** | 2.15 | 1.96 | **FAIL** | **FAIL** |
| **done `#22C55E`** | 2.28 | 2.08 | **FAIL** | **FAIL** |
| **error `#EF4444`** | 3.76 | 3.44 | **FAIL** | white PASS / **mist FAIL** |

Tema escuro (sobre darkBg / darkSurface) — quase tudo passa:

| Estado | /darkBg | /darkSurface | Texto 4.5:1 | UI 3:1 |
|---|---|---|---|---|
| idle `#64748B` | 3.93 | 3.75 | **FAIL como texto** | PASS |
| thinking `#06B6D4` | 7.71 | 7.35 | PASS | PASS |
| active `#22D3EE` | 10.36 | 9.88 | PASS | PASS |
| waiting `#F59E0B` | 8.72 | 8.31 | PASS | PASS |
| done `#22C55E` | 8.22 | 7.83 | PASS | PASS |
| error `#EF4444` | 4.98 | 4.74 | PASS | PASS |

### Achados de contraste

**[CRITICAL] Ciano como texto reprova AA no tema claro** — `DESIGN.md › Colors`, tokens `colors.brand.cyan #06B6D4` e `colors.support.cyanLight #22D3EE`. Ratios de 2.43:1 e 1.81:1 sobre branco — reprovam até o limiar de 3:1 de componente de UI. O spine já adverte isso parcialmente (`Accessibility Floor` marca como `[ASSUMPTION]` a validar), mas a "regra de ouro do ciano" diz literalmente que o ciano marca "ação final" e o "IA" do wordmark — ou seja, há intenção de usá-lo em elementos significativos.
*Fix:* proibir ciano para qualquer texto e para qualquer ícone/borda fina <3px **em fundo claro**. Para o "IA" do wordmark em fundo claro, usar uma variante escurecida (ex.: `#0E7490` cyan-700, ~4.7:1 / verificar) ou colocar o wordmark sobre superfície escura. Texto de ação (botões) deve ser branco sobre fill ciano escurecido, nunca ciano sobre branco. Documentar um token `cyanText-onLight` separado do `cyan` de marca.

**[CRITICAL] Cores de estado reprovam como rótulo/texto no tema claro** — `EXPERIENCE.md › State Patterns` + `DESIGN.md › StateBadge` ("pill com a cor de `colors.state` + rótulo"). thinking/active/waiting/done reprovam tanto 4.5:1 quanto 3:1 sobre fundo claro; error passa 3:1 só sobre white. Se o StateBadge usar a cor pura como **texto do rótulo** ou como fill claro com texto colorido, reprova.
*Fix:* StateBadge em tema claro deve usar **fill saturado + texto branco/escuro de alto contraste**, não texto colorido sobre fundo claro. Definir, por estado, um par tonal acessível: ex. `waiting` fill `#B45309` (amber-700) com texto branco; `done` fill `#15803D` (green-700) com texto branco; `error` fill `#B91C1C` (red-700) com texto branco; `thinking/active` fill ciano escurecido (`#0E7490`/`#0891B2`) com texto branco. As cores claras originais (`#22D3EE`, `#22C55E`, `#F59E0B`) ficam reservadas para **glifo/indicador grande (≥24px, ≥3:1)** e para o tema escuro.

**[HIGH] `idle #64748B` e `error #EF4444` falham AA como texto sobre `mist`** — `colors.light.surface #F1F5F9` é a superfície padrão de cards (BlockCard é `raised`). idle/mist = 4.34:1, error/mist = 3.44:1, steel/mist = 4.34:1. Texto secundário e o texto "Ocioso"/"Erro" colocados sobre cards reprovam.
*Fix:* para texto sobre `surface` (mist), elevar o piso: usar `slate #475569` (PASS) ou `graphite` para texto secundário em cards; não usar `steel`/`idle` como cor de texto sobre mist. Ou escurecer os tokens de texto secundário.

**[MEDIUM] `steel #64748B` é o `textMuted` do tema claro e passa só por 0.26** — `colors.light.textMuted #64748B` = 4.76:1 sobre white (PASS marginal) mas **4.34:1 sobre mist (FAIL)**. Qualquer texto muted dentro de um card reprova.
*Fix:* definir `textMuted` por superfície, ou escurecer para `#5A6personally`/`slate #475569` (7.58:1) para garantir folga em ambos os fundos. Num tool denso, texto muted é onipresente (IDs, captions 13px) — folga importa.

**[LOW] `slate #475569` como `dark.structure` tem 2.47:1 sobre darkBg** — `colors.dark.structure`. Não é texto (é cor estrutural de traços/bordas grossas), então não viola 1.4.11 se usado apenas em massas/preenchimentos decorativos. **Mas** se virar borda funcional de 1px que carrega significado (ex.: separar zonas, indicar foco), 1.4.11 exige 3:1.
*Fix:* qualquer borda/divisor que comunique informação no tema escuro deve usar `connectors #94A3B8` (mais claro), não `structure`. Manter `structure` só para preenchimento decorativo.

**[LOW] Caption 13px com pesos 400/500 reduz a margem** — `typography.scale.caption 13px/400`. 13px regular não é "texto grande" (precisa 4.5:1 cheio). Com tokens muted marginais, captions são o primeiro lugar a reprovar.
*Fix:* garantir que toda caption use cor com ≥4.5:1 sobre **a superfície real** onde aparece (white E mist), não só sobre white.

---

## 2. Sinalização não-dependente de cor (1.4.1)

**[OK / BOM]** `EXPERIENCE.md › Accessibility Floor` afirma: *"Cor não é o único sinal: os 6 estados sempre acompanham rótulo textual/ícone além da cor."* E `DESIGN.md › StateBadge` = "pill com a cor + **rótulo**". Bom — atende 1.4.1 na intenção.

**[MEDIUM] Falta o mapa ícone-por-estado e o glossário de rótulos** — a regra existe mas não está especificada. Sem isso, o build pode entregar pill colorida sem ícone, ou ícones ambíguos.
*Fix:* especificar no DESIGN.md uma tabela `estado → rótulo PT-BR exato → ícone Lucide`. Ex.: idle=Pause, thinking=Sparkles/Loader, active=Play/Activity, waiting=Clock/AlertCircle, done=CheckCircle, error=XCircle. Garantir formas de ícone distinguíveis (não só cor) para daltonismo total/monocromacia.

**[MEDIUM] LogLine "cor por nível/estado" pode ser color-only** — `DESIGN.md › LogLine` ("cor por nível/estado") e `EXPERIENCE.md › Component Patterns`. Logs costumam sinalizar severidade só por cor da linha.
*Fix:* cada LogLine deve carregar um **prefixo textual de nível** (ex.: `[INFO]`/`[ERRO]`/`[OK]`) e/ou ícone, não só a cor. Em mono já há espaço natural para isso.

**[MEDIUM] RPA Modality Cue depende de ícone/badge — bom, mas confirmar rótulo** — `EXPERIENCE.md › RPA Modality Cues` usa "ícone/badge distinto" para web vs desktop Windows (`[ASSUMPTION]`). Ícone sozinho pode ser ambíguo.
*Fix:* badge com **texto** ("Web" / "Desktop Windows") além do ícone; não diferenciar modalidade só por cor da borda do card.

**[LOW] BlockCard "borda esquerda colorida pelo Tipo de Bloco"** — `DESIGN.md › BlockCard`. Tipo de Bloco comunicado por cor de borda = color-only.
*Fix:* Tipo de Bloco também via ícone do Tipo (já existe "ícone do Tipo" no card) + rótulo textual do Tipo; a cor da borda é reforço, não o único sinal. Garantir que a borda colorida do Tipo tenha ≥3:1 contra a superfície do card (1.4.11) se carregar significado.

---

## 3. Teclado e foco (2.1.1, 2.4.3, 2.4.7)

**[OK parcial]** `EXPERIENCE.md › Accessibility Floor`: *"todo fluxo de build/operação navegável por teclado; foco visível; ordem lógica."* Intenção correta e cobre build + operation. shadcn/Radix dá boa base de teclado.

**[HIGH] Foco "visível" não tem especificação de token nem contraste** — não há definição de espessura, cor ou offset do anel de foco, nem garantia de 3:1 do indicador (2.4.11/2.4.13 são 2.2, mas 2.4.7 AA exige foco visível e o anel precisa ser perceptível). Ciano (`#06B6D4`) como cor de foco em tema claro teria só 2.43:1 contra branco — anel de foco fraco.
*Fix:* definir token `focusRing` com ≥3:1 contra ambos os fundos. Em tema claro **não** usar ciano puro; usar grafite/slate ou ciano escurecido, anel ≥2px com offset. Em tema escuro `cyanLight` (10:1) serve bem. Adicionar ao DESIGN.md.

**[HIGH] Interações complexas sem contrato de teclado** — vários primitivos exigem padrões de teclado não-triviais que o spine não especifica:
- **FlowNode (ReactFlow)** — `EXPERIENCE.md` diz "clicável para focar o Bloco". ReactFlow não é acessível por teclado por padrão. "Read-first/não-editor" ajuda, mas navegar e ativar nós por teclado precisa ser projetado (foco por nó, Enter para focar Bloco, alternativa textual ao canvas).
- **ModelSelector (popover agrupado)** — precisa de roving tabindex / setas / Esc / retorno de foco ao gatilho.
- **ConfirmDialog** — modal precisa focus trap, Esc, foco inicial no botão seguro, retorno de foco. "default seguro = não-executar" é ótimo; confirmar que o foco inicial NÃO cai no botão destrutivo.
- **Fila de confirmações / Modo de Teste (overlay)** — navegação e foco entre itens da fila.
*Fix:* adicionar à seção Accessibility um contrato por componente (foco inicial, teclas, trap, retorno) e uma **alternativa não-canvas** para o fluxo do ReactFlow (lista navegável dos Blocos espelhando o canvas).

**[MEDIUM] Layout de 3 zonas e ordem de tabulação** — `EXPERIENCE.md › Information Architecture` (Conversa | Cards | Fluxo). Numa bancada densa de 3 colunas, ordem de foco e landmarks importam (2.4.1 Bypass Blocks / 1.3.1).
*Fix:* definir landmarks ARIA por zona (region/complementary com aria-label), skip-links entre zonas, e ordem de tab lógica (conversa → card ativo → ações → fluxo).

---

## 4. Live regions / streaming (4.1.3 Status Messages, 1.4.13)

**[OK na intenção]** `EXPERIENCE.md › Accessibility Floor`: *"logs em streaming e mudanças de estado anunciados a leitores de tela (aria-live polido)."* Excelente que esteja nomeado — é o ponto crítico de um tool real-time.

**[HIGH] aria-live em log append-only de alta frequência vai inundar o leitor de tela** — `EXPERIENCE.md › Real-time & Streaming` descreve stream WebSocket <2s, "rajada de mensagens", LogLine append-only. `aria-live="polite"` num log que adiciona muitas linhas/segundo é inutilizável (fala atrasada e infinita) e pode violar a usabilidade de 4.1.3.
*Fix:* **não** colocar `aria-live` no container de log inteiro. Em vez disso: (a) anunciar só **transições de estado do agente** e **eventos acionáveis** (erro, aguardando confirmação, handoff humano) via uma região `aria-live="polite"` dedicada e enxuta; (b) erros/confirmações via `role="alert"`/`aria-live="assertive"`; (c) o log em si como `role="log"` navegável sob demanda, com mecanismo de **pausar/silenciar anúncios** e um resumo periódico ("12 novas linhas"). Especificar isso no spine.

**[MEDIUM] Banner "Reconectando…" e reconciliação de log** — `EXPERIENCE.md › Real-time & Streaming` ("banner não-bloqueante 'Reconectando…'", log reconcilia no retorno). Mudança de status de conexão deve ser anunciada (4.1.3) sem roubar foco.
*Fix:* banner como `role="status"` (polite); ao reconciliar, **não** re-anunciar todo o backlog — anunciar só "conexão restaurada, N eventos sincronizados".

**[MEDIUM] Modo de Teste "ao vivo, bloco a bloco" e MascotCore onipresente** — atualizações de estado por Bloco precisam de anúncio coerente sem duplicar (a serialização por conversa do FR-16 ajuda visualmente, mas o canal SR precisa do mesmo cuidado anti-duplicação).
*Fix:* uma única live-region de estado por surface; o MascotCore expõe o estado via `aria-label`/texto associado, mas **não** dispara o anúncio sozinho (evitar dois anúncios para a mesma transição).

---

## 5. Movimento (2.3.3 Animation from Interactions, 2.2.2)

**[OK / BOM]** `DESIGN.md › MascotCore`: *"Respeita prefers-reduced-motion"* e `EXPERIENCE.md › Accessibility Floor`: *"animação do MascotCore (pulso) respeita prefers-reduced-motion."* Bem coberto na intenção.

**[MEDIUM] O escopo de reduced-motion está limitado ao pulso do MascotCore** — `DESIGN.md › Brand & Style` descreve o mascote-fluxograma onde *"o fluxo 'roda' de cima a baixo"* (animação contínua do fluxograma), além do pulso. E há streaming/aparição de logs e nós animando. reduced-motion precisa cobrir **toda** animação não-essencial, não só o pulso.
*Fix:* estender a regra: sob `prefers-reduced-motion: reduce`, desligar o "fluxo rodando" do mascote, transições de entrada de LogLine/FlowNode e qualquer auto-scroll suave; manter o estado legível de forma estática (cor+ícone+rótulo). 2.2.2: o pulso/fluxo é conteúdo em movimento automático >5s — precisa de mecanismo de pausar OU respeitar reduced-motion (este último basta).

**[LOW] Auto-scroll do log** — stream append-only geralmente auto-scrolla. Movimento + perda de controle de leitura.
*Fix:* auto-scroll pausável; sob reduced-motion, scroll instantâneo (sem smooth) e/ou pausa por padrão quando o usuário rolou para cima.

---

## 6. Outras lacunas AA para um tool real-time denso

**[HIGH] Sem menção a redimensionamento de texto / zoom 200% / reflow (1.4.4, 1.4.10)** — layout fixo de 3 zonas de alta densidade num desktop tende a quebrar em 200% de zoom ou 1.4.10 (reflow a 320px CSS / 400% zoom). Mobile está fora do MVP, mas **reflow não é mobile — é zoom**, e é AA obrigatório.
*Fix:* especificar comportamento das 3 zonas sob zoom (colapsar/empilhar zonas, sem scroll bidirecional, sem corte de conteúdo). Usar unidades relativas (rem) na tipografia.

**[MEDIUM] Espaçamento de texto (1.4.12)** — densidade "média-alta" declarada (`DESIGN.md › Layout & Spacing`). Alta densidade conflita com 1.4.12 (o usuário deve poder aumentar line-height/spacing sem corte).
*Fix:* garantir que line-height/letter/word spacing aumentáveis não causem clipping nos cards densos; testar com o bookmarklet de 1.4.12.

**[MEDIUM] CredentialPrompt e segredos (boa prática + 3.3)** — `EXPERIENCE.md › Trust & Confirmation` ("nunca exibe segredo em claro") é ótimo. Mas inputs de credencial precisam de label programática, mensagens de erro associadas (3.3.1/3.3.3) e estado "expirada/faltando" anunciado.
*Fix:* especificar `aria-describedby` para erros, `aria-required`, e anúncio do status da credencial.

**[MEDIUM] ConfirmDialog de Ação Irreversível (3.3.4 Error Prevention)** — já tem confirmação explícita e default seguro (ótimo, atende 3.3.4 na intenção). Falta especificar a acessibilidade do diálogo em si.
*Fix:* `role="alertdialog"`, `aria-labelledby`/`aria-describedby` com a descrição concreta da ação, foco inicial no botão seguro/cancelar, ação destrutiva claramente rotulada (não só cor âmbar/coral — `DESIGN.md › ConfirmDialog` cita "ênfase âmbar/erro": garantir rótulo + ícone, pois âmbar/coral reprovam contraste como vimos).

**[MEDIUM] Screenshot de verificação RPA precisa de alternativa textual (1.1.1)** — `EXPERIENCE.md › RPA Modality Cues` ("screenshot aparece no log com o veredito estruturado do LLM"). A imagem é informativa.
*Fix:* o veredito estruturado (sucesso/falha + motivo) já serve como alternativa textual — garantir que esteja **programaticamente associado** à imagem (alt/aria-describedby), não só visualmente adjacente.

**[LOW] Estados vazios e mensagens de status (4.1.3)** — `EXPERIENCE.md › State Patterns` define empty states (bom). Garantir que loading/empty/error genéricos sejam anunciados como status messages sem roubar foco.

**[LOW] Densidade + alvos de toque/clique (2.5.8 é 2.2, mas boa prática)** — densidade média-alta pode produzir alvos pequenos. Não bloqueia AA 2.1, mas para um tool profissional de uso longo, manter alvos ≥24px e espaçamento mínimo.

---

## Resumo priorizado

| Sev | Achado | Token/Seção |
|---|---|---|
| CRITICAL | Ciano reprova como texto no tema claro (2.43 / 1.81:1) | `colors.brand.cyan`, `colors.support.cyanLight` |
| CRITICAL | Cores de estado reprovam como rótulo/texto no tema claro (thinking/active/waiting/done/error) | `colors.state.*`, `StateBadge` |
| HIGH | aria-live no log de alta frequência inunda o SR — precisa de contrato (status vs log vs alert) | `EXPERIENCE › Real-time & Streaming` / `Accessibility Floor` |
| HIGH | Foco visível sem token nem contraste ≥3:1; ciano fraco como anel no claro | `Accessibility Floor` (teclado) |
| HIGH | Teclado de FlowNode/ReactFlow, ModelSelector, ConfirmDialog não especificado; falta alternativa não-canvas | `EXPERIENCE › Component Patterns` |
| HIGH | Sem reflow/zoom 200%–400% (1.4.10/1.4.4) para layout denso de 3 zonas | `Layout & Spacing` |
| HIGH | idle/error/steel reprovam sobre `mist` (surface de cards) | `colors.light.surface`, `textMuted` |
| MEDIUM | Mapa ícone+rótulo por estado não especificado | `StateBadge` / `State Patterns` |
| MEDIUM | LogLine/Tipo de Bloco/RPA podem ser color-only | `LogLine`, `BlockCard`, `RPA Modality Cues` |
| MEDIUM | reduced-motion cobre só o pulso, não o "fluxo rodando"/entradas/auto-scroll | `MascotCore`, `Brand & Style` |
| MEDIUM | Espaçamento de texto (1.4.12) vs densidade média-alta | `Layout & Spacing` |
| LOW | `slate` como estrutura/borda no escuro (2.47:1) se virar borda funcional | `colors.dark.structure` |

### Direção de correção da paleta (resumo acionável)
- **Tema claro:** texto = `lightText #1E293B` / `graphite #334155` / `slate #475569` (todos PASS). **Nunca** ciano nem cores de estado puras como texto. Para texto secundário sobre cards (`mist`), usar `slate`, não `steel`/`idle`.
- **Ciano:** só ícones/realces ≥24px e fills (com texto branco) em fundo claro; para texto/anel em fundo claro usar ciano escurecido (~cyan-700 `#0E7490`). No tema escuro o ciano claro está liberado (≥7:1).
- **StateBadge tema claro:** fill tonal saturado (700-level) + texto branco por estado; reservar as cores claras para o glifo grande e para o tema escuro.
- **Foco:** token dedicado, ≥2px, ≥3:1 nos dois temas, com offset.
