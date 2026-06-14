# PRD Quality Review — RobbIA — Conversational Agent Builder (MVP)

> Revisão contra a rubrica oficial `bmad-prd/assets/prd-validation-checklist.md` (7 dimensões + notas mecânicas).
> Stakes: **altos** — produto de lançamento público open-source (MIT). Revisão calibrada para rigor máximo.
> Escopo revisado: `prd.md` (284 linhas, 15 FRs) + `addendum.md` (52 linhas).
> Data: 2026-06-14.

## Overall verdict

Este é um PRD **forte e acima da média**: tem tese defensável e explícita (NL→Harness + RPA nativo + multi-LLM self-hosted), 15 FRs com "Consequences (testable)" de verdade, IDs perfeitamente contíguos (FR-1..15, UJ-1..2, SM-1..4 + 2 contra-métricas), Glossário disciplinado usado sem sinônimos, Non-Goals que fazem trabalho real e um Índice de Pressupostos com roundtrip quase impecável. O que está em risco é **uma contradição de escopo de MVP entre o corpo do PRD e o addendum** — o corpo crava "5 Providers" e "RPA amplo (não se limita a login+formulário)" enquanto o addendum recomenda "2–3 bem-feitos" e "fatia fina: 1 caso login+formulário+1 ERP" — o que, num green-light-to-build, deixa o engenheiro sem saber qual é o contrato. Some-se a isso a **densidade alta de itens abertos para um documento que se declara "para o time construir o MVP"** (12 pressupostos inline, vários alvos de métrica ainda provisórios, 5 Open Questions sendo a #2 sobre construir-vs-integrar o componente de maior complexidade). Nenhuma dimensão está *broken*; a contradição de escopo e os alvos de métrica não-confirmados são os bloqueios a resolver antes de uso público.

---

## 1. Decision-readiness — **adequate** (tendendo a strong)

O PRD age como um documento de decisão, não de "considerações". As escolhas mais quentes estão nomeadas **como decisões do dono, com o que foi cedido**: WhatsApp via Evolution API ("**porém viola os Termos de Serviço** e expõe a banimento" — §10, addendum §B), RPA amplo já no MVP (§4.4), 5 Providers (§4.5), memória por conversa (§4.10). Cada uma carrega o trade-off explícito (ex.: "Mais adaptadores = mais manutenção (tradeoff aceito)" em §4.5). As Questões em Aberto (§12) são genuinamente abertas — a #2 (construir vs. integrar RPA) e a #4 (política de retry "precisa de números") não têm resposta escondida na frase seguinte. O guardrail de priorização ("tempo não é critério") é uma decisão real e incomum, declarada de frente.

Onde perde pontos: a decisão de escopo do RPA e dos Providers está **decidida no corpo e contradita no addendum** (ver dimensão 5 e Notas Mecânicas) — um decision-maker que ler os dois documentos não saberá qual contrato vale. Além disso, o alvo da métrica primária (SM-1 ≥ 60%) é a aposta central do produto e ainda é `[ASSUMPTION]` provisório — defensável num MVP, mas é exatamente o número sobre o qual o "go" deveria se apoiar.

### Findings
- **high** Contradição de decisão entre corpo e addendum sobre amplitude de escopo (§4.4/§4.5 vs addendum §C/§E) — o corpo crava "RPA amplo, não se limita a login+formulário" e "5 Providers no MVP"; o addendum recomenda "fatia fina (1 caso: login+formulário+1 ERP)" e "2–3 bem-feitos". Um leitor não sabe qual é o compromisso de build. *Fix:* declarar explicitamente no corpo que o addendum é **rationale/recomendação não-vinculante** e que a decisão do dono (amplo / 5 Providers) prevalece — ou reconciliar para uma "fatia fina ambiciosa" definida.
- **medium** O alvo da aposta central (SM-1 ≥ 60% publicado com ≤1 bloco editado) é a base do "go" e segue como `[ASSUMPTION]` (§7). *Fix:* marcar SM-1 como "gate de validação do piloto" e definir o que acontece se ficar abaixo (pivota? adia lançamento público?).

## 2. Substance over theater — **strong**

Conteúdo é majoritariamente ganho, não mobília. **Sem persona theater**: há apenas 2 jornadas (UJ-1 Rafael, UJ-2 Marina), ambas com protagonista nomeado, contexto, entry state, path, climax, resolution e edge case — e cada FR aponta qual UJ realiza. Os JTBD (§2.1) incluem honestamente o JTBD "de builder" ("como criador da RobbIA, quero usar a própria ferramenta") em vez de inventar personas para parecer abrangente. **A diferenciação não é innovation theater**: a matriz competitiva (addendum §F) é específica por categoria (builders OSS de fluxo / frameworks code-first / no-code / RPA+LLM) e nomeia a lacuna que cada classe deixa — não é a seção "porque o template pedia". **NFRs não são boilerplate** (ver dimensão 4). **A Vision (§1) não é intercambiável**: nomeia os concorrentes reais e a combinação específica ("decomposição NL→harness + RPA nativo + multi-LLM sem lock-in") — não caberia em outro PRD de categoria diferente.

Observação leve, não-bloqueante: o CES como "pilar de marketing defensável" é bem fundamentado por evidência concreta de incidentes (addendum §G: postmark-mcp, ClawHub ~1.184 skills, Shai-Hulud 2.0, Snyk 13,4%) — isto é substância, não teatro de segurança.

### Findings
- *(nenhum — dimensão forte; conteúdo é load-bearing.)*

## 3. Strategic coherence — **strong**

O PRD tem tese e aposta nela. A tese ("o coração do produto e seu diferencial defensável é a geração automática do harness a partir de linguagem natural" — §1) governa a priorização: a feature §4.1 é marcada "*(núcleo do produto)*", a métrica **primária** SM-1 mede exatamente a qualidade dessa geração, e o adiamento deliberado do painel multi-cliente ("o que no futuro separa a RobbIA de tudo no mercado — é deliberadamente adiado para depois que o núcleo estiver provado") mostra prioridade vinda da tese, não do "que é fácil primeiro". O recorte do MVP é coerente — tipo **problem-solving** (provar o loop NL→harness→produção ponta a ponta), com escopo que casa.

As métricas validam a tese e não só atividade: SM-1 mede *qualidade da proposta*, não DAU/MAU. **Contra-métricas existem e são afiadas**: SM-C1 ("se SM-1 subir porque o arquiteto deixa de revisar, é falha") protege o JTBD "entregar com a minha assinatura" contra o anti-padrão "botão mágico"; SM-C2 protege segurança contra a pressa do time-to-production. Isso é raro e bem-feito.

### Findings
- **low** SM-3 (confiabilidade ≥95%) e SM-4 (RPA passa na verificação visual no 1º teste) não têm contra-métrica explícita, enquanto SM-1 e SM-2 têm. Risco baixo (são métricas de qualidade, menos "gameáveis"), mas vale nomear o trade-off — ex.: SM-4 alto obtido restringindo RPA a casos triviais contraria o "RPA amplo". *Fix:* adicionar 1 contra-métrica para SM-4 (cobertura/variedade de sistemas-alvo não pode cair para inflar a taxa de aprovação visual).

## 4. Done-ness clarity — **strong** (a dimensão mais bem executada)

Esta é a dimensão que story creation mais usa, e o PRD é incomumente bom aqui. **Todos os 15 FRs têm bloco "Consequences (testable)"** com condições verificáveis, não adjetivos. Exemplos de consequências genuinamente testáveis: "Pedidos que impliquem sistema sem API resultam em ao menos um Bloco do Tipo RPA" (FR-1); "A troca de Modelo de IA num Bloco não altera nenhum outro Bloco" (FR-4); "Cada execução de RPA roda em container Docker isolado, destruído ao final" (FR-7); "Credenciais... nunca aparecem em prompts, logs ou respostas do LLM" (FR-11); "A memória é isolada por conversa/cliente (uma conversa não enxerga o histórico de outra)" (FR-15). Para seções não-funcionais, há bounds reais: NFR de segurança fala em "sandbox Docker isolado e efêmero" e "log auditável de cada execução/decisão"; NFR de custo dá o mecanismo (seleção de modelo por Bloco), não só "deve ser barato".

A varredura automatizada de adjetivos vagos dentro de §4 encontrou apenas: "em tempo real" (3×) e "mínima" (1×). Nenhum "razoável / amigável / gracioso / robusto / escalável" sem número — o PRD evitou os padrões de não-testabilidade. Ainda assim, dois pontos merecem aperto antes de virar story:

### Findings
- **medium** "em tempo real" (FR-2 encadeamento, FR-6 "cada Bloco mostra entrada/saída/status em tempo real", FR-12 "logs... em tempo real") não tem bound. Para um engenheiro, "tempo real" pode ser 200ms ou 5s. *Fix:* definir latência aceitável de atualização de UI/log (ex.: "atualização ≤ Xs por Bloco") ou marcar como detalhe de UX a resolver no design.
- **medium** FR-1 diz "Se o pedido for ambíguo ou insuficiente, a IA Arquiteta faz pergunta(s) de esclarecimento" — comportamento testável na forma, mas o gatilho ("ambíguo ou insuficiente") é subjetivo e é o coração do produto. *Fix:* ou aceitar como critério qualitativo do piloto (ligado a SM-1), ou dar 1–2 exemplos canônicos de pedido que deve disparar pergunta vs. proposta direta.
- **low** FR-5 e FR-7 citam "retry e, persistindo, interrompe/escala" sem número de tentativas; a própria §12.4 reconhece "precisa de números". *Fix:* não é bloqueio do PRD (é Open Question consciente), mas a story precisará do número — manter rastreado.

## 5. Scope honesty — **adequate**

Omissões são majoritariamente explícitas e bem-feitas. **Há uma seção Não-Goals (§5) que faz trabalho real** — cada item explica o porquê (multi-tenancy exige tenancy → v2; marketplace aberto = vetor supply-chain → só curado/certificado), com callouts `[NON-GOAL for MVP]`. A §6.2 ("Fora de escopo") complementa com rationale por item. A distinção mais escorregadia — memória — é tratada com cuidado redundante e correto: o PRD repete em §4.10, §5 e §6.2 que **tem** memória mínima por conversa mas **não** o motor híbrido/perfis globais (Fase 4), evitando que o leitor assuma a versão maior. De-scoping é proposto honestamente, não feito em silêncio.

O que rebaixa a dimensão é a **densidade de itens abertos relativa aos stakes declarados**. O documento se abre dizendo que é "para o time que vai construir o MVP" (§0) — ou seja, próximo de green-light — mas carrega **12 pressupostos inline reais**, **alvos de 4 métricas ainda provisórios** ("a recalibrar no piloto", §13), **5 Open Questions** (a #2 sobre construir-vs-integrar o componente de maior complexidade técnica; a #3 sobre quais sistemas-alvo do RPA sequer priorizar), **e a contradição de escopo corpo↔addendum** descrita na dimensão 1. Para uma feature de lançamento público de stakes altos, "RPA amplo" + "quais portais priorizar ainda é Open Question" + "construir vs. integrar ainda é Open Question" é muita superfície aberta sobre o item mais arriscado. A rubrica é explícita: "high counts on a green-light-to-build PRD is a blocker." Não chega a *broken* porque cada item está **rastreado e nomeado** (não silenciado) — mas precisa de fechamento antes de virar build.

### Findings
- **high** Contradição de escopo corpo↔addendum (repetida da dim. 1, registrada aqui como honestidade de escopo): o leitor que lê só o corpo recebe um contrato ("amplo / 5 Providers") diferente do que o addendum recomenda ("fatia fina / 2–3"). *Fix:* reconciliar e declarar o contrato vinculante único.
- **high** Densidade de itens abertos sobre o componente de maior risco (RPA): §12.2 (construir vs. integrar) e §12.3 (quais sistemas-alvo priorizar) ainda abertas, com escopo declarado "amplo". Para green-light público isto é bloqueio. *Fix:* fechar §12.2 e §12.3 (escolher abordagem + 1–2 sistemas-alvo) ou rebaixar formalmente o RPA do MVP para uma fatia fina definida.
- **medium** Alvos de SM-1..SM-4 marcados como provisórios (§13) num PRD de build. Aceitável se rotulados como "gates de piloto", mas hoje parecem critérios de sucesso firmes. *Fix:* rotular explicitamente como provisórios-até-piloto no §7 (não só no índice).

## 6. Downstream usability — **strong**

Este PRD é chain-top (alimenta UX → Arquitetura → stories, conforme §0 e addendum §A), então a dimensão pesa — e ele se sai bem. **Glossário presente (§3)** com a instrução explícita "Termos usados exatamente assim em FRs, UJs e SMs. Sem sinônimos no restante do PRD" — e cumpre: Harness, Bloco, Tipo de Bloco, IA Arquiteta, Modelo de IA, Provider, Connector/Canal, CES, Trust Engine, Ação Irreversível, Modo de Teste, Workspace aparecem consistentes (maiúsculas e singular/plural estáveis) ao longo dos FRs. **IDs perfeitos** (verificação automatizada): FR-1..15 contíguos, únicos, sem gaps nem duplicatas; todos os 15 citados na §6.1 (escopo); UJ-1/UJ-2 e SM referenciados resolvem. As cross-references usam termos do Glossário e número de §, não "ver acima". As duas UJs têm protagonista nomeado carregando contexto inline (sem UJ flutuante).

Pequeno atrito de extração, não-bloqueante: 7 dos 15 FRs (FR-4, FR-9, FR-10, FR-11, FR-13, FR-14, FR-15) **não são validados por nenhuma SM** — isto é normal num MVP (nem todo FR vira métrica de sucesso), mas para quem source-extrai a matriz FR↔SM, vale saber que a cobertura de métricas é parcial e intencional.

### Findings
- **low** Cobertura FR↔SM parcial: FR-4/9/10/11/13/14/15 sem métrica associada. Não é defeito, mas a rastreabilidade ficaria mais limpa se §7 dissesse "FRs sem SM são validados por aceitação funcional, não por métrica de produto". *Fix:* uma frase em §7 declarando a intenção.

## 7. Shape fit — **strong**

A forma casa com o produto. É um **produto multi-stakeholder com UX significativa** (arquiteto constrói via chat; clientes finais interagem por WhatsApp/Telegram), então **UJs com protagonista nomeado são load-bearing** — e o PRD as tem, sem over-formalizar (2 UJs enxutas cobrindo os dois fluxos canônicos: agente conversacional e agente RPA). Não há UJ density excessiva (não é tratado como ferramenta de operador único, que dispensaria UJ) nem under-formalização (não é consumer product sem UJ). O caráter **open-source/MIT self-hosted** está refletido na forma (Docker Compose, caminho 100% local via Ollama, Non-Goal de SaaS gerenciado). É também parcialmente **greenfield com referências a docs-base existentes** (visão+arquitetura v2.0, brand book v1.1) — e o PRD trata isso corretamente: aponta para os docs em vez de duplicar ("Identidade visual já existe — ver brand book; este PRD não a duplica", §0), e nomeia os dois ajustes conscientes frente aos docs (RPA no MVP; WhatsApp via Evolution).

### Findings
- *(nenhum — forma adequada ao produto.)*

---

## Mechanical notes

Cobertura de baixo peso (não dirige o veredito), com base em verificação automatizada sobre os dois arquivos.

- **ID continuity — OK.** FR-1..15 definidos por header, contíguos, únicos, **sem gaps e sem duplicatas**; todos referenciados e todos presentes na §6.1. UJ-1..2 e SM-1..4 + SM-C1/C2 contíguos. Nenhuma cross-reference de ID quebrada.

- **Glossário / drift — OK.** Termos do Glossário aparecem com casing e número consistentes nos FRs/UJs/SMs; não foram detectados sinônimos concorrentes para os termos centrais (Harness/Bloco/Provider/Modelo de IA/CES/Ação Irreversível). "Connector / Canal" é definido como par no Glossário e usado como "Canal" no corpo — consistente com a própria definição. Sem ação.

- **Assumptions Index roundtrip — OK (quase impecável).** 12 pressupostos inline reais (`[ASSUMPTION: ...]` com conteúdo) mapeiam para as 10 entradas do §13 (o §7 agrupa três pressupostos numa entrada; §4.5/§11 agrupa dois) — todas as entradas do índice têm origem inline e todos os inline aparecem no índice. A ocorrência de `[ASSUMPTION]` no §0 é **meta-menção em backticks** (descreve a convenção), corretamente fora do índice — não é um falso pendente.

- **Qualidade de tag — Atenção (baixo).** O guardrail de WhatsApp/ToS em §10 termina com um `[ASSUMPTION]` **vazio** (sem `: texto`), enquanto a entrada correspondente do §13 ("Evolution API self-hosted; risco de ToS/banimento assumido (decidido)") está completa. Inconsistência cosmética: a tag inline mais crítica em risco (banimento de número, violação de ToS) é a única sem conteúdo próprio. *Fix:* preencher o `[ASSUMPTION: ...]` do §10 com o teor da entrada do índice, ou removê-lo (já que §13 o classifica como "decidido — não mais pressuposto").

- **Contradição corpo↔addendum — Atenção (high, já contada nas dim. 1/5).** "5 Providers" + "RPA amplo (não se limita a login+formulário)" no corpo vs. "2–3 bem-feitos" + "fatia fina: 1 caso login+formulário+1 ERP" no addendum. Mecanicamente, o §13 lista "RPA amplo; 5 Providers" como **decidido**, o que sugere que o corpo é a fonte de verdade e o addendum é recomendação superada pela decisão do dono — mas isso **não está dito em lugar nenhum**. Resolver a ambiguidade explicitamente.

- **Estatísticas não-validadas — Atenção (médio, para uso público).** §9 e addendum §H carregam números load-bearing ("62% experimentam / 11% em produção", "+280% YoY", "3,2:1", mercado US$7,84B→US$52,62B) explicitamente marcados como "validar em fonte primária antes de uso público". Como este é um PRD de **lançamento público**, esses números não podem ir para material externo sem fechar o pressuposto §9. Está corretamente rastreado — falta executar a validação.

- **Seções requeridas — OK.** Para stakes altos / produto público multi-stakeholder, estão presentes: Propósito, Visão, Público+JTBD+Não-Usuários+UJs, Glossário, Features/FRs, Non-Goals, Escopo MVP, Métricas+Contra-métricas, NFRs, Why Now, Constraints/Guardrails, Dependências, Open Questions, Índice de Pressupostos. Nenhuma seção esperada ausente.

---

## Síntese das maiores lacunas (ordem de prioridade)

1. **[high]** Reconciliar a contradição de escopo corpo↔addendum (5 Providers / RPA amplo vs. 2–3 / fatia fina) e declarar qual é o contrato vinculante.
2. **[high]** Fechar as Open Questions sobre o RPA (§12.2 construir-vs-integrar, §12.3 sistemas-alvo) — é o componente de maior risco e está com escopo "amplo" + decisões em aberto, impróprio para green-light público.
3. **[medium]** Rotular os alvos de SM-1..SM-4 como gates provisórios-de-piloto no próprio §7 (hoje parecem firmes; §13 diz que são provisórios) e definir o que acontece se SM-1 ficar abaixo de 60%.
4. **[medium]** Dar bound a "em tempo real" (FR-2/6/12) e a "ambíguo/insuficiente" (FR-1) ou marcá-los como critérios de UX/piloto.
5. **[médio→baixo]** Validar em fonte primária as estatísticas de mercado (§9/addendum §H) antes de qualquer material público; preencher/remover o `[ASSUMPTION]` vazio do §10; considerar 1 contra-métrica para SM-4.
