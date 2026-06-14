# Reconciliação de Insumo — Brand Book × PRD RobbIA

> **Tipo:** Reconciliação de insumo qualitativo para finalização de PRD
> **Insumo (fonte):** `docs/brand-book.md` — RobbIA Brand Book v1.1 (Junho 2026)
> **Alvo:** `_bmad-output/planning-artifacts/prds/prd-robbia-2026-06-14/prd.md` (+ `addendum.md`)
> **Data:** 2026-06-14
> **Foco:** ideias QUALITATIVAS (tom, voz, estética, sensação) silenciosamente descartadas pela estrutura de FRs.

---

## 1. Resumo executivo

O PRD entrega uma UI conversacional (FR-14, §4.9 "Harness UI — chat de construção") e **referencia** o brand book numa única linha de descrição de feature. Porém, o corpo do PRD **não possui nenhuma seção de "Estética e Tom"** e a esmagadora maioria das diretrizes qualitativas do brand book **não viraram requisito nem referência forte**. Elas existem apenas no insumo e podem ser silenciosamente perdidas no handoff para Arquitetura/UX/Dev.

A intenção declarada do brand book é forte e operacional — não é decoração:

> *"O núcleo de IA no centro do losango muda de cor para comunicar o estado do agente, transformando o mascote em um indicador vivo na interface."* (Brand Book §7)

Isto é **comportamento de produto**, não estética acessória. Hoje vive só no brand book.

### Evidência quantitativa (varredura do PRD inteiro)

| Termo do brand book | Ocorrências no PRD | Situação |
|---|---|---|
| `brand book` / `brand-book` | 5 (todas na **mesma** descrição §4.9) | Referência única e fraca |
| `Grafite` | 1 | Só citada em §4.9 |
| `Ciano` | 1 | Só citada em §4.9 |
| `mascote` | 1 | Só citada em §4.9 |
| `robô-fluxo` | 1 | Só citada em §4.9 |
| `tema claro` | **0** | **AUSENTE** |
| `tema escuro` | **0** | **AUSENTE** |
| `tipografia` | **0** | **AUSENTE** |
| `Inter` (fonte) | 0 reais (matches são substring de "interface") | **AUSENTE** |
| `JetBrains` | **0** | **AUSENTE** |
| `paleta` | **0** | **AUSENTE** |
| `voz` | **0** | **AUSENTE** |
| `acessibilidade` / `usabilidade` / `contraste` / `WCAG` | **0** | **AUSENTE** |
| Estados expressivos (núcleo muda de cor) | **0** | **AUSENTE** |

Seções `##` do PRD: Propósito, Visão, Público-Alvo, Glossário, Features, Não-Goals, Escopo do MVP, Métricas, **NFRs Transversais**, Why Now, Constraints, Dependências, Questões em Aberto, Pressupostos.
**Não há** seção de Estética/Tom/UX/Design. Os NFRs Transversais (§8) cobrem segurança, privacidade, confiabilidade, observabilidade, custo, portabilidade — mas **nenhum NFR de usabilidade, acessibilidade ou consistência de marca**.

---

## 2. O que o PRD já captura (não está perdido)

- **Referência única à estética:** §4.9 / FR-14 diz *"Estética conforme o brand book (mascote robô-fluxo, Grafite + Ciano, temas claro/escuro)"*. Isto **aponta** para o insumo, mas é um ponteiro frágil: cita 3 dos ~8 eixos do brand book e não os torna verificáveis (testable consequences de FR-14 falam só de chat, cards e Modo de Teste — nada de cor, tema, tom ou estado).
- A UI conversacional em si (chat + cards) está bem especificada como capacidade funcional.

> **Conclusão parcial:** o PRD não ignora o brand book — ele o *menciona de passagem*. O risco não é omissão total; é **rebaixamento silencioso** de diretrizes operacionais a "detalhe de implementação" sem âncora no documento de capacidades.

---

## 3. GAPS — ideias qualitativas descartadas ou enfraquecidas

### GAP 1 — Não existe seção "Estética e Tom" (visual + voz) — **ALTO**
O PRD não tem um lugar canônico que oriente o time sobre identidade. A única âncora é meia-frase em FR-14. Personalidade da marca (**Técnica / Inteligente / Profissional / Confiável**, Brand Book §1.2) — que o próprio brand book mapeia para escolhas visuais concretas — **não aparece em lugar nenhum do PRD**. O time de dev/UX não tem, no documento de requisitos, como saber qual "sensação" o produto deve transmitir.
**Recomendação:** criar **§ "Estética e Tom (referência de marca)"** no MVP, sumarizando os 4 atributos de personalidade + apontando o brand book como fonte normativa (não opcional).

### GAP 2 — Estados expressivos do mascote (núcleo muda de cor) não são requisito — **ALTO / é comportamento, não estética**
O brand book §7 define que o núcleo do mascote muda de cor conforme o **estado do agente**: Ocioso (aço), Pensando (ciano), Ativo (ciano claro), Aguardando aprovação (âmbar), Concluído (verde), Erro (coral). Isto é **feedback de status vivo na UI** e mapeia 1:1 com estados que o PRD já tem em outras features: aprovação por etapa (FR-3), IA Arquiteta "pensando" (FR-1/FR-2), execução com erro (FR-5), confirmação humana / Trust Engine (FR-13), Modo de Teste (FR-6). Hoje **nenhum FR liga estado de execução a feedback visual**.
**Recomendação:** virar **requisito explícito** (ex.: FR-14a ou NFR de usabilidade) — "a UI reflete o estado do agente/execução pelos 6 estados expressivos do mascote". É o tipo de ideia qualitativa de maior risco de ser perdida, justamente por parecer "enfeite".

### GAP 3 — Temas claro/escuro não são requisito testável — **MÉDIO/ALTO**
O brand book trata os **dois temas como nativos desde a origem** (§4: "desenhada para viver nos dois temas desde a origem", com especificação de cor por tema e regra de adaptação grafite→ardósia / ciano→ciano claro). No PRD, "temas claro/escuro" só aparecem como 2 palavras dentro da descrição de FR-14, sem virar consequência testável nem entrar em §6.1 (Em escopo). Risco real: o MVP sair com um tema só e alegar conformidade.
**Recomendação:** tornar suporte a tema claro **e** escuro um item explícito de escopo do MVP **ou** registrar como decisão consciente em Questões em Aberto se for adiado.

### GAP 4 — Paleta Grafite + Ciano e hierarquia 60/30/10 sem âncora normativa — **MÉDIO**
A disciplina de cor (Grafite 60% domina, Carvão 30% aprofunda, Ciano 10% pontua — "o grafite manda; o ciano pontua") é a regra mais característica da marca. No PRD ela é só uma menção entre parênteses. Sem referência forte, dev tende a usar cor por conveniência (ciano demais), quebrando a identidade.
**Recomendação:** referência forte ao sistema de cores na nova §Estética, citando a regra 60/30/10 e a "regra de ouro do ciano" como restrição de design.

### GAP 5 — Tipografia (Inter + JetBrains Mono) ausente — **BAIXO/MÉDIO**
Brand Book §6 define Inter (interface/wordmark) + JetBrains Mono (código/dados/hex) e a regra de usar só dois pesos (Regular/Medium, evitar Bold). **Zero ocorrências** no PRD. Como a UI exibe blocos de código, nomes de variáveis e configs (FR-1, FR-2, FR-4), a fonte mono é funcionalmente relevante, não cosmética.
**Recomendação:** citar a stack tipográfica na §Estética (referência ao brand book); baixo esforço, evita retrabalho de fonte.

---

## 4. Recomendação consolidada

Adicionar ao PRD **uma seção curta "Estética e Tom (referência de marca)"** (não precisa duplicar o brand book — basta ancorar e elevar de "menção" para "referência normativa") cobrindo:

1. **Personalidade/tom:** Técnica, Inteligente, Profissional, Confiável (a sensação-alvo do produto).
2. **Sistema visual:** paleta Grafite + Ciano, hierarquia 60/30/10, regra de ouro do ciano.
3. **Temas:** claro e escuro nativos (mover para escopo do MVP ou registrar adiamento consciente).
4. **Tipografia:** Inter + JetBrains Mono.
5. **Brand book como fonte normativa**, não opcional.

E **promover a estado de requisito** (FR ou NFR de usabilidade) o item de maior risco:

6. **Estados expressivos do mascote** ligados ao estado real do agente/execução (Ocioso/Pensando/Ativo/Aguardando/Concluído/Erro) — comportamento de UI, reaproveitando estados que os FRs já produzem.

Opcionalmente, abrir **1 NFR de Usabilidade/Acessibilidade** (§8) cobrindo consistência de marca + contraste/legibilidade nos dois temas — hoje §8 não tem nenhum NFR voltado ao usuário.

---

## 5. Veredito

| Pergunta da tarefa | Resposta |
|---|---|
| O PRD tem UI conversacional (FR-14)? | Sim (§4.9). |
| Referencia o brand book? | Sim, mas em **uma única linha**, fraca e não-testável. |
| Falta seção de "Estética e Tom"? | **Sim — ausente.** |
| Personalidade da marca merece virar requisito/referência forte? | **Sim** — hoje ausente do PRD. |
| Paleta Grafite + Ciano? | Referência fraca — elevar para normativa. |
| Mascote com estados expressivos? | **Promover a requisito** — é comportamento de UI, não estética. |
| Temas claro/escuro? | Tornar item explícito de escopo (ou adiamento consciente). |
| Tipografia? | Adicionar como referência (baixo esforço). |

**Conclusão:** sim, há descarte silencioso de ideias qualitativas. O ponteiro único em FR-14 não é suficiente para preservar a intenção do brand book no handoff. Recomenda-se a seção "Estética e Tom" + a promoção dos estados expressivos a requisito antes de finalizar o PRD.
