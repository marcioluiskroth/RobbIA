# Caça a Edge Cases — PRD RobbIA (MVP)

**Documento revisado:** `prd.md` + `addendum.md` (`prd-robbia-2026-06-14`)
**Data:** 2026-06-14
**Método:** percorrer cada FR (FR-1..FR-15) e cada jornada (UJ-1, UJ-2), mapeando para cada comportamento declarado a respectiva condição de fronteira / caminho não tratado. Orientado por método, não por atitude. Lista **apenas** edge cases plausíveis **e não cobertos** pelo PRD.

---

## Convenção

Cada item: **onde ocorre** (FR/UJ) + **o gap** (o caminho de fronteira que o documento não trata). Itens que o PRD **já cobre** estão listados ao final (§ "Já tratado") para deixar explícito o que foi conferido e descartado.

---

## 1. IA Arquiteta (FR-1, FR-2, FR-3, FR-4 / UJ-1)

**EC-1.1 — Harness inválido / ciclo de dependências.** *(FR-1, FR-2)*
FR-2 exige que o encadeamento (ordem e dependências de dados) seja "visível", mas nada exige que a proposta seja um **DAG válido**. A IA Arquiteta (via parser, Addendum D) pode produzir um Harness com dependência circular (Bloco A consome a saída de B, que consome a de A) ou com um Bloco que referencia a saída de um Bloco que vem **depois** dele. Não há etapa de validação estrutural antes de apresentar/permitir aprovação. Gap: ciclo e referência-adiante não detectados.

**EC-1.2 — Modelo sugerido inexistente/indisponível.** *(FR-1 × FR-4/FR-9)*
FR-1 garante que cada Bloco traz "Modelo de IA sugerido", mas nada valida que o Modelo sugerido pertence a um Provider efetivamente configurado e ativo no Workspace. A IA Arquiteta pode sugerir um Modelo de um Provider que o arquiteto não configurou (sem chave) ou que está fora do ar. Gap: proposta com Modelo não-selecionável/indisponível, sem checagem cruzada com FR-9.

**EC-1.3 — Loop de esclarecimento sem condição de saída.** *(FR-1 / UJ-1)*
FR-1: "se ambíguo ou insuficiente, faz pergunta(s) de esclarecimento antes de propor." Não há limite de rodadas nem fallback se o usuário nunca fornecer informação suficiente (pergunta → resposta vaga → pergunta → …). Gap: ausência de condição de término / proposta de melhor-esforço.

**EC-1.4 — Pedido fora do escopo / impossível no MVP.** *(FR-1)*
Não há caminho para a IA Arquiteta **recusar** ou sinalizar "fora do MVP" um pedido que exige capacidade não suportada (ex.: multi-agente — Fase 5+; login que exige 2FA por SMS — ver EC-3.2; perfil global persistente — Fase 4). Risco: ela propõe um Harness plausível na tela que **nunca executará** em produção. Gap: detecção de inviabilidade vs. ambiguidade (que é coberta).

**EC-1.5 — "Repensar" sem convergência e invalidação em cascata.** *(FR-3)*
FR-3 permite "repensar" um Bloco gerando alternativa "sem descartar os já aprovados", mas (a) não limita quantas vezes — repensar indefinidamente; e (b) **não trata o que acontece se repensar um Bloco quebra a dependência de um Bloco já aprovado a jusante** (ex.: o Bloco repensado deixa de produzir o dado que um Bloco aprovado consumia). Gap: aprovações a jusante podem ficar silenciosamente inválidas; nada as reabre/sinaliza.

---

## 2. Harness Runtime (FR-5, FR-6)

**EC-2.1 — Política de retry/timeout indefinida.** *(FR-5; reconhecido na Questão Aberta §12.4)*
"Aplica retry e, persistindo, interrompe" — sem número de tentativas, backoff ou **timeout por Bloco**. Consequências de fronteira: (a) Bloco que trava (LLM lento ou sem resposta, página RPA pendurada) **congela um Harness 24/7** sem timeout; (b) retry agressivo amplifica falhas externas (rate-limit, bloqueio por tentativas). Gap: o PRD admite a lacuna mas nenhum FR fixa o comportamento padrão seguro.

**EC-2.2 — Estado sujo após falha parcial (sem rollback/compensação).** *(FR-5)*
Quando o Runtime interrompe no meio, nada define o destino dos **efeitos colaterais já aplicados** por Blocos anteriores: um Bloco Ação já enviou a mensagem, um Bloco RPA já submeteu metade de um formulário. "Não avança silenciosamente" trata o fluxo adiante, mas não o que já foi feito atrás. Gap: ausência de compensação/rollback ou ao menos de registro explícito de "estado parcial aplicado".

**EC-2.3 — Crash/restart do Runtime no meio da execução.** *(FR-5, FR-12)*
Agente roda 24/7, mas nada define recuperação de **execuções em andamento** quando a VPS reinicia, o container morre ou ocorre OOM. Retomar? Descartar? Há idempotência? O Addendum A cita `pg-boss` (fila), porém o PRD não especifica garantia de entrega nem idempotência de Bloco. Gap: durabilidade/retomada de execução não especificada.

**EC-2.4 — Modo de Teste com efeito colateral real no sistema-alvo.** *(FR-6)*
FR-6 garante **dados simulados** e "não dispara Ações Irreversíveis reais sem confirmação" — ou seja, **com** confirmação dispara real mesmo em teste; e Blocos não-irreversíveis tocam o alvo real de qualquer modo. O RPA em teste abre o **ERP de produção real** (UJ-2 diz "abre o ERP em sandbox", mas o sandbox é do navegador/container, não do sistema-alvo). Resultado: um teste pode lançar um pedido de verdade ou enviar um WhatsApp real. Gap: o Modo de Teste isola os *dados*, não o *sistema-alvo* — sem conceito de mock/staging do alvo.

**EC-2.5 — Gatilho em Modo de Teste.** *(FR-6, FR-10)*
FR-6 mostra "cada Bloco rodando", mas não define **como o Bloco de Gatilho é simulado** (uma mensagem recebida) nem como impedir que o **Gatilho real** (Evolution já conectada — entry state de UJ-1) dispare execuções de produção durante a sessão de teste. Gap: injeção do evento-gatilho de teste e isolamento do Gatilho de produção.

---

## 3. Bloco RPA (FR-7, FR-8 / UJ-2)

**EC-3.1 — Site cai vs. site muda de layout.** *(FR-7 / UJ-2)*
UJ-2 só trata **mudança de layout**. Indisponibilidade do alvo (timeout, 5xx, DNS, página de manutenção) e **redirecionamento inesperado** não têm tratamento distinto; o retry cego pode bater em rate-limit do portal ou disparar bloqueio por excesso de tentativas de login. Gap: classificação do tipo de falha (indisponível vs. mudou vs. negou acesso) ausente.

**EC-3.2 — 2FA / captcha / OTP no login RPA.** *(FR-7)*
O CES cobre usuário+senha, mas login que exige **2FA, captcha, OTP por SMS/app ou device-trust** não tem caminho. O Bloco RPA travaria no desafio sem mecanismo de **handoff humano em tempo real** (distinto da confirmação de Ação Irreversível, que é uma aprovação, não a inserção de um código efêmero). Gap: desafios interativos de autenticação não previstos — afeta diretamente o caso-fina "1 ERP" do Addendum C.

**EC-3.3 — Verificação visual divergindo do estado real (falso-positivo).** *(FR-7, FR-8)*
FR-8 confirma sucesso **pelo screenshot**, mas a tela pode exibir "sucesso" enquanto a transação falhou no backend (ou o inverso). Um **falso-positivo** do LLM de Verificação deixa avançar o Bloco dependente e pode dar por concluída uma Ação Irreversível que não ocorreu. Gap: ausência de checagem cruzada (ex.: número de pedido/idempotência) além da leitura visual.

**EC-3.4 — Ponto de interceptação do Trust Engine *dentro* do RPA.** *(FR-7 × FR-13)*
FR-7 diz que escala "sem completar Ação Irreversível", mas um RPA **amplo** executa a ação irreversível clicando "Confirmar" **dentro** do fluxo multi-passo — possivelmente **antes** de detectar erro. FR-13 intercepta **Blocos do Tipo Ação**, não **passos internos** de um Bloco RPA. Gap: onde, dentro de uma sequência RPA, o Trust Engine pausa para confirmação não está definido.

**EC-3.5 — Sessão longa, container efêmero e re-login multiplicado.** *(FR-7)*
Container "destruído ao final": fluxos longos (download grande, espera por processamento do portal) podem exceder limites de tempo/recurso; e como a sessão de login **não persiste** entre execuções, cada execução re-autentica — multiplicando logins e **acelerando bloqueio/2FA por atividade suspeita** (sinergia com EC-3.2). Gap: ciclo de vida de sessão/cookies entre execuções não tratado.

**EC-3.6 — Falhas específicas de upload/download.** *(FR-7, FR-8)*
FR-7 lista upload/download como capacidade, mas nenhuma consequência trata: arquivo de entrada ausente/corrompido, formato inválido, download que nunca completa, ou **diálogo nativo do SO** ("Salvar como") que o Playwright não controla por DOM. Gap: sub-casos de I/O de arquivo sem tratamento.

---

## 4. Provider Abstraction (FR-9)

**EC-4.1 — Provider fora do ar / rate-limited / chave expirada (sem fallback).** *(FR-9)*
Nada define **failover**. Um Bloco preso a um Modelo cujo Provider está down (429/503 transitório, ou 401/`insufficient_quota` permanente) **trava a execução em produção**. Faltam: distinção entre erro transitório e permanente, degradação graciosa e fallback para outro Provider/Modelo. Gap crítico para um agente 24/7.

**EC-4.2 — Resposta do LLM malformada / recusa / alucinação.** *(FR-9 × FR-3/FR-4)*
Blocos Decisão/Verificação esperam **saída estruturada** (veredito). Se o Modelo — em especial um **barato/local escolhido por custo** (FR-3 troca para mais barato; UJ-1 faz isso) — retorna JSON inválido, texto livre, ou uma **recusa de safety**, não há tratamento. Gap: parsing/validação da saída do Modelo e caminho de erro.

**EC-4.3 — Ollama local indisponível / modelo não baixado / sem VRAM.** *(FR-9)*
O "caminho 100% local" pode falhar porque o modelo não foi puxado (`pull`), o serviço Ollama não está no ar, ou a máquina não tem VRAM/RAM. Nenhuma consequência trata o caso **local** especificamente (sinaliza? sugere outro? falha clara?). Gap: pré-condições do caminho local.

**EC-4.4 — Estouro de janela de contexto do Modelo.** *(FR-9 × FR-15)*
A memória por conversa (FR-15) cresce; um Bloco Contexto grande + prompt pode **exceder o limite de tokens** do Modelo escolhido por Bloco (e modelos diferentes têm janelas diferentes). Sem truncamento, sumarização ou erro definido. Gap: fronteira de tamanho de contexto.

---

## 5. Canais — Evolution API + Telegram (FR-10 / Guardrail §10)

**EC-5.1 — Número banido / Evolution desconecta em runtime.** *(FR-10, Guardrail §10)*
O guardrail **reconhece** o risco de banimento, mas **nenhum FR trata a detecção + recuperação em tempo de execução**. Com o agente 24/7 no ar, se a Evolution cai ou o número é banido: mensagens recebidas **se perdem** (sem Gatilho) e respostas falham silenciosamente. Faltam: detecção de desconexão, **alerta ao arquiteto**, fila de retenção e reconexão. Gap: risco assumido na decisão, mas sem comportamento operacional.

**EC-5.2 — Mensagem não-textual.** *(FR-10)*
FR-10 dispara "ao receber mensagem", mas Contexto/Decisão/Resposta assumem **texto**. Imagem, áudio, sticker, localização, documento ou mensagem **de grupo** não têm definição de tratamento (transcrever? ignorar? responder "não suportado"?). Gap: tipos de payload de entrada.

**EC-5.3 — Origem indisponível entre Gatilho e Ação.** *(FR-10)*
FR-10 responde "pelo mesmo Canal de origem". Se a origem ficou indisponível entre o Gatilho e a Ação (cliente bloqueou o número; sessão Evolution caiu no meio da execução), a entrega falha **sem retry/dead-letter**. Gap: janela entre receber e responder não tratada.

---

## 6. CES — isolamento de credenciais (FR-11 / UJ-1, UJ-2)

**EC-6.1 — Credencial expirada/inválida/rotacionada em RUNTIME.** *(FR-11 × UJ-1, UJ-2)*
UJ-1 cobre credencial **ausente no momento da construção** (pausa e pede). Mas credencial que **existia e expirou** / foi trocada / teve MFA revogado **em produção 24/7** não tem caminho: o CES injeta uma credencial sintaticamente válida, e o **sistema-alvo a rejeita**. Falta detecção de "auth failed" distinta de erro genérico e um prompt de **re-credenciamento**. Gap: ciclo de vida da credencial no ar (alta probabilidade ao longo de meses de operação).

**EC-6.2 — Bootstrap/perda/comprometimento da chave-mestra de cifragem.** *(FR-11 — P0 de segurança)*
Credenciais ficam "cifradas", mas o PRD não define **onde reside a chave** que as decifra no processo isolado, nem o que acontece se ela for **perdida** (restore de backup da VPS sem a chave → credenciais irrecuperáveis) ou **comprometida** (rotação? re-cifragem?). Sendo P0, é uma fronteira de segurança sem ciclo de vida de chave. Gap.

---

## 7. Trust Engine — Ações Irreversíveis (FR-13)

**EC-7.1 — Ação Irreversível sem guardião disponível (sem timeout da confirmação).** *(FR-13)*
Confirmação humana "por padrão", mas se **ninguém confirma** (arquiteto offline, fora do horário, agente 24/7), nada define **timeout/expiração/fila** da confirmação. A ação fica pendente para sempre? Bloqueia o Harness? As mensagens do cliente acumulam sem resposta enquanto isso? Gap: comportamento quando a confirmação não chega.

**EC-7.2 — Canal de confirmação não especificado (dependência circular com EC-5.1).** *(FR-13)*
Como o humano **recebe e responde** o pedido de confirmação? (UI? WhatsApp? e-mail/push?) Se for pelo **mesmo Canal Evolution** — que pode estar caído ou banido (EC-5.1) — a confirmação é **inalcançável**, criando dependência circular: a ação que protege contra erro fica bloqueada justamente pela falha do Canal. Gap: meio de confirmação fora-de-banda não definido.

**EC-7.3 — Quem classifica "Irreversível" e o default sobrescrito sem fricção.** *(FR-13 × SM-C2)*
A política é "configurável por Bloco/Harness", e quem **monta** o Harness é a IA Arquiteta. Se ela classificar uma Ação Irreversível como **autônoma**, ou se o usuário marcar tudo como autônomo para acelerar (**exatamente o risco que SM-C2 monitora**), não há trava nem aviso reforçado — o default seguro é sobrescrito sem fricção. Gap: ausência de salvaguarda contra desativação em massa da confirmação (a contra-métrica observa, mas o produto não impede).

---

## 8. Memória por conversa (FR-15)

**EC-8.1 — Fronteira e expiração de "conversa".** *(FR-15 × FR-9)*
Isolamento é "por conversa/cliente", mas **o que delimita uma conversa** no WhatsApp? O mesmo número ao longo de meses é uma conversa **infinita**? Quando uma conversa termina/expira? Crescimento ilimitado do histórico colide com o limite de contexto do Modelo (EC-4.4). Gap: definição de início/fim/expiração e estratégia de truncamento.

**EC-8.2 — Identidade ambígua do cliente.** *(FR-15)*
Se a chave de isolamento é o número: o cliente que **troca de número** fragmenta o próprio histórico; um número **compartilhado** (telefone de empresa/balcão) **mistura pessoas diferentes** na mesma memória. Gap: política de identidade/merge ausente — com implicação de privacidade (vazamento entre pessoas sob o mesmo número).

---

## 9. Concorrência (FR-5, FR-10, FR-12, FR-15)

**EC-9.1 — Mensagens simultâneas na mesma conversa (race na memória).** *(FR-5, FR-10, FR-15)*
O cliente envia 3 mensagens em rajada → 3 execuções do Harness **concorrentes** lendo/gravando a **mesma memória por conversa**. Sem serialização/lock por conversa: **condição de corrida** na memória (FR-15), respostas **fora de ordem** ou **duplicadas**. **Nenhum FR menciona concorrência.** Gap de alto impacto e alta probabilidade num canal de chat.

**EC-9.2 — Editar/pausar Bloco durante execuções vivas.** *(FR-12 × FR-13)*
FR-12 permite pausar o agente e editar um Bloco isolado. O que acontece com as **execuções em andamento** no instante da edição/pausa? Sem **versionamento do Harness em runtime**, uma execução viva pode usar uma versão meio-antiga/meio-nova do Harness. Gap: semântica de edição sob carga.

**EC-9.3 — Limite de execuções RPA concorrentes (esgotamento da VPS).** *(FR-7)*
Cada RPA = um container Docker. Um pico de mensagens dispara **muitos containers simultâneos** → exaustão de CPU/RAM/disco da VPS comum (alvo de deploy do MVP). Sem limite/fila/**backpressure** definido. Gap: controle de concorrência de recursos.

---

## 10. Deploy e operação (FR-12)

**EC-10.1 — Publicação de Harness "aprovado" mas não-executável.** *(FR-12 × FR-3)*
"Só elegível à publicação quando todos os Blocos aprovados" (FR-3), mas **aprovação ≠ executabilidade**: depois da aprovação, um Provider pode ter sido removido, uma credencial de um Bloco aprovado pode não ter sido configurada, ou um Canal pode não estar conectado. O deploy sobe um Harness que **falha no primeiro Gatilho real**. Gap: ausência de checagem de prontidão (pré-flight) na publicação.

**EC-10.2 — Logs auditáveis vs. PII/segredos em operação 24/7.** *(FR-12 × FR-11, NFR Privacidade)*
"Logs de cada execução/decisão" (FR-12) coexistem com "credenciais nunca em log" (FR-11) e dados do cliente sob LGPD (NFR Privacidade). Os payloads que trafegam entre Blocos contêm **PII** e podem conter segredos colados pelo usuário. Sem política de **mascaramento, retenção e limite de tamanho** dos logs num agente 24/7. Gap: governança de logs em runtime.

---

## Síntese — priorização

| # | Edge case | Onde | Severidade | Probabilidade |
|---|---|---|---|---|
| EC-9.1 | Mensagens simultâneas → race na memória | FR-5/FR-10/FR-15 | Alta | Alta |
| EC-4.1 | Provider down/rate-limited/401 sem failover | FR-9 | Alta | Alta |
| EC-5.1 | Número banido / Evolution desconecta em runtime | FR-10/§10 | Alta | Alta |
| EC-7.1 | Ação Irreversível sem guardião / sem timeout de confirmação | FR-13 | Alta | Média |
| EC-3.2 | 2FA/captcha/OTP no login RPA sem handoff | FR-7 | Alta | Alta |
| EC-6.1 | Credencial expira/rotaciona em runtime | FR-11 | Alta | Alta |
| EC-2.4 | Modo de Teste com efeito real no sistema-alvo | FR-6 | Alta | Média |
| EC-3.4 | Trust Engine não intercepta passo interno do RPA | FR-7×FR-13 | Alta | Média |
| EC-1.1 | Harness com ciclo/grafo inválido não detectado | FR-1/FR-2 | Média | Média |
| EC-7.2 | Canal de confirmação inalcançável (circular com EC-5.1) | FR-13 | Alta | Média |

(Os demais — EC-1.x, EC-2.x, EC-3.x, EC-4.x, EC-8.x, EC-10.x — completam a cobertura por FR.)

---

## Já tratado pelo PRD (conferido e descartado)

Para deixar explícito o que **não** é gap:

- **FR-1** — pedido ambíguo/insuficiente: a IA Arquiteta faz pergunta(s) de esclarecimento. *(Coberto — mas ver EC-1.3 sobre ausência de condição de saída e EC-1.4 sobre inviabilidade.)*
- **FR-5** — falha de Bloco: retry e, persistindo, interrompe com erro registrado, sem avanço silencioso. *(Coberto o fluxo adiante — mas ver EC-2.1 retry indefinido e EC-2.2 estado atrás.)*
- **FR-6** — teste não dispara Ação Irreversível real sem confirmação. *(Coberto para dados — mas ver EC-2.4 sobre o sistema-alvo real.)*
- **FR-7** — sequência RPA multi-passo: retry, marca erro e escala sem completar Ação Irreversível. *(Coberto no nível do Bloco — mas ver EC-3.4 sobre o passo interno.)*
- **FR-8** — veredito de falha impede avanço de Blocos dependentes. *(Coberto — mas ver EC-3.3 sobre falso-positivo.)*
- **FR-11** — credenciais cifradas, nunca em prompt/log/resposta. *(Coberto o isolamento — mas ver EC-6.1 expiração e EC-6.2 chave-mestra.)*
- **FR-13** — Ações Irreversíveis exigem confirmação humana por padrão. *(Coberto o default — mas ver EC-7.1 timeout, EC-7.2 canal, EC-7.3 override.)*
- **FR-15** — memória isolada por conversa; sem vazamento entre conversas. *(Coberto o isolamento lógico — mas ver EC-8.1 fronteira e EC-8.2 identidade.)*
- **UJ-1 (edge declarado)** — Bloco precisa de credencial não configurada → fluxo pausa e pede antes do teste. *(Coberto na construção — mas ver EC-6.1 em runtime.)*
- **UJ-2 (edge declarado)** — ERP muda de layout → retry, marca erro, notifica. *(Coberto a mudança de layout — mas ver EC-3.1 indisponibilidade e EC-3.3 falso-positivo.)*

---

*Observação de cobertura: a análise percorreu FR-1 a FR-15 e UJ-1/UJ-2. As áreas com maior densidade de gaps são RPA (6), IA Arquiteta (5) e Runtime (5) — coerente com o Addendum, que aponta o RPA como "componente de maior complexidade técnica do MVP" e a IA Arquiteta como "componente nº 1 de qualidade". Concorrência (3 gaps) é a dimensão **inteiramente ausente** do PRD — nenhum FR a menciona.*
