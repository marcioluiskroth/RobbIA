---
title: RobbIA — Conversational Agent Builder (MVP)
status: final
created: 2026-06-14
updated: 2026-06-14
---

# PRD: RobbIA — Conversational Agent Builder (MVP)
*Título de trabalho — confirmar.*

> **Status:** final (v2) — v1 passou por reconciliação de insumos + revisão adversarial / edge-case / rubrica. **v2 (Update 2026-06-14):** fechadas as questões em aberto do §12 (modelo da IA Arquiteta e lib de RPA viram spikes de arquitetura; estratégia de RPA = integrar OSS; política de retry/escalonamento e roteamento de Provider definidos) e **ampliado o escopo de RPA para cobrir também aplicativos desktop Windows nativos** (FR-21), com as implicações de sandbox/deploy registradas. Não é imutável: reabra quando quiser.

## 0. Propósito do Documento

Este PRD é para o time que vai **construir o MVP da RobbIA** (produto, arquitetura, dev) e para stakeholders do projeto open-source. Ele define **o quê** o MVP entrega — não o **como** técnico, que vive no [addendum.md](addendum.md) e nos documentos-base em [docs/](../../../../docs/) ([visão + arquitetura v2.0](../../../../docs/product-vision-architecture.md), [brand book v1.1](../../../../docs/brand-book.md)). Vocabulário ancorado no **Glossário (§3)**; features agrupadas com **FRs** numerados globalmente; pressupostos marcados inline com `[ASSUMPTION]` e indexados em §13. Recorte: **Roadmap Fase 1 (Meses 1–2)**, com dois ajustes conscientes frente aos docs (RPA incluído no MVP; WhatsApp via Evolution API). Identidade visual já existe — ver brand book; este PRD não a duplica.

## 1. Visão

A RobbIA é a **bancada de trabalho open-source (MIT) do Arquiteto de Agentes de IA**. O usuário descreve em linguagem natural o que quer automatizar; uma **IA Arquiteta** decompõe o pedido em um **Harness** — uma sequência de **Blocos** executáveis (Gatilho, Contexto, Decisão, Resposta, RPA, Ação, Verificação) — escolhendo o modelo de IA adequado para cada bloco e justificando cada escolha. O profissional refina bloco a bloco, aprova e publica; o agente passa a rodar 24/7 numa VPS, acessível por WhatsApp e Telegram.

O coração do produto — e seu diferencial defensável — é a **geração automática do harness a partir de linguagem natural**. Ferramentas próximas (n8n, Flowise, Langflow, Dify, Activepieces) exigem que o usuário monte o fluxo manualmente; frameworks (LangChain, CrewAI, LangGraph) exigem um engenheiro; no-code de usuário final (Zapier, Lindy, Make) é SaaS fechado, sem self-host, sem RPA real e sem camada profissional. Ninguém combina, num único produto self-hosted, **decomposição NL→harness + RPA nativo + multi-LLM sem lock-in**. O MVP existe para provar esse loop ponta a ponta.

Para o MVP, a RobbIA é **single-workspace**: um arquiteto, um espaço de trabalho, construindo e operando seus próprios agentes. O painel multi-cliente com white-label — o que no futuro separa a RobbIA de tudo no mercado — é deliberadamente adiado para depois que o núcleo estiver provado.

## 2. Público-Alvo

### 2.1 Jobs To Be Done
- **Funcional:** "Quando um cliente/eu descreve uma automação em linguagem natural, quero transformá-la num agente rodando em produção em minutos — não horas montando fluxo nó a nó."
- **Funcional:** "Quando monto um agente, quero escolher o modelo de IA certo (custo × qualidade) em cada etapa, sem reescrever o resto."
- **Funcional:** "Quero automatizar sistemas web que não têm API (ERP, portais) sem programar scraping do zero."
- **Social/Profissional:** "Quero entregar com a minha assinatura — refinar e aprovar o que a IA propõe, com controle total, e não só apertar um botão mágico."
- **Emocional / confiança:** "Preciso confiar que credenciais de cliente não vão vazar e que ações irreversíveis não vão disparar sozinhas."
- **De builder (válido para o MVP):** "Como criador da RobbIA, quero usar a própria ferramenta para construir os primeiros agentes reais e validar o loop."

### 2.2 Não-Usuários (v1)
- **Agências com vários clientes simultâneos** que precisam de painel multi-cliente/white-label hoje — atendidas só pós-MVP. `[ASSUMPTION: o MVP serve um arquiteto operando um workspace; multi-tenancy é v2.]`
- **Usuário final não-técnico** comprando automação self-service — a experiência conversacional o atende, mas o produto e o go-to-market do MVP miram o profissional.
- **Quem precisa rodar em nuvem gerenciada/SaaS** — o MVP é self-hosted (Docker Compose em VPS própria).

### 2.3 Principais Jornadas de Usuário

- **UJ-1. Rafael transforma um pedido de cliente num agente de atendimento.**
  - **Persona + contexto:** Rafael, consultor de automação, acabou de fechar com uma loja que quer responder dúvidas de clientes no WhatsApp 24/7. Ele hospeda a RobbIA numa VPS própria.
  - **Entry state:** autenticado no workspace único; Evolution API já conectada a um número de WhatsApp de teste.
  - **Path:** (1) abre o chat e escreve *"agente que recebe mensagens no WhatsApp, busca o histórico do cliente, responde dúvidas e, se for reclamação grave, me avisa"*; (2) a IA Arquiteta propõe um harness em cards — Gatilho (Evolution), Contexto, Decisão (classifica intenção), Resposta, Decisão (escala?), Ação (envia), Ação (registra); (3) em um bloco ele troca o modelo sugerido de Claude Sonnet para um mais barato; (4) em outro pede "repensar" e a IA ajusta; (5) aprova os demais.
  - **Climax:** roda em **modo de teste** com uma mensagem simulada e vê cada bloco executar em tempo real, terminando numa resposta coerente.
  - **Resolution:** publica na VPS com um clique; o agente passa a responder no número conectado. Rafael acompanha logs ao vivo.
  - **Edge case:** se a IA Arquiteta propõe um bloco que precisa de credencial ainda não configurada, o fluxo pausa e pede a credencial antes de permitir o teste.

- **UJ-2. Marina cria um agente que lança pedidos num ERP sem API (RPA).**
  - **Persona + contexto:** Marina, analista de TI, precisa eliminar o lançamento manual de pedidos que chegam por planilha.
  - **Entry state:** autenticada; credenciais do ERP guardadas via CES.
  - **Path:** descreve o objetivo; a IA Arquiteta inclui um **bloco RPA**; Marina aprova; no teste o Playwright abre o ERP em sandbox, preenche o formulário e captura um screenshot; um bloco de **Verificação** usa o LLM para confirmar pelo screenshot se o lançamento deu certo.
  - **Climax:** o teste confirma "pedido lançado com sucesso" lendo a tela — sem ela escrever uma linha de automação.
  - **Resolution:** ativa em produção; o agente passa a lançar pedidos sozinho, escalando para humano em caso de erro.
  - **Edge case:** se o ERP mudar de layout e o bloco RPA falhar, a execução tenta novamente e, persistindo, marca erro e notifica Marina (não dispara ação irreversível às cegas).

## 3. Glossário

*Termos usados exatamente assim em FRs, UJs e SMs. Sem sinônimos no restante do PRD.*

- **Harness** — a estrutura-mãe que organiza e executa um agente: uma sequência ordenada de **Blocos**, com fluxo de dados e tratamento de erro entre eles. Um Harness pertence a um **Workspace**.
- **Bloco** — unidade de execução do Harness, de um **Tipo de Bloco**, podendo usar (ou não) um **Modelo de IA**.
- **Tipo de Bloco** — um de: Gatilho, Contexto, Decisão, Resposta, RPA, Ação, Verificação (definidos em §4.3).
- **IA Arquiteta** — instância de LLM, separada dos modelos que executam os Blocos, que transforma uma descrição em linguagem natural em uma proposta de Harness com justificativas e Modelo de IA sugerido por Bloco.
- **Modelo de IA** — um LLM acessível via **Provider**, selecionável por Bloco.
- **Provider** — fornecedor de Modelos de IA acessado por uma interface única (ex.: Anthropic, OpenAI, Google, Ollama).
- **Canal** — integração de entrada/saída de mensagens usada por Blocos de Gatilho/Ação. No MVP: **Evolution API** (WhatsApp não-oficial) e **Telegram**. *(Termo único; não usar "Connector" como sinônimo.)*
- **Connectors** — conceito do produto-alvo: camada "1-clique" sobre MCP que torna integrações plugáveis e alimenta o planejamento da IA Arquiteta. **Fora do MVP** (ver §5); registrado aqui para não se confundir com **Canal**.
- **Evolution API** — gateway self-hosted de WhatsApp **não-oficial** (variante "Evolution Go") usado como Canal no MVP.
- **CES (Credential Execution Service)** — processo isolado que armazena credenciais cifradas e as injeta na execução sem expô-las ao LLM.
- **Trust Engine** — conjunto de permissões que define **quem pode disparar o agente** e quais **Ações Irreversíveis** exigem confirmação humana.
- **Ação Irreversível** — operação de efeito não desfazível ou de alto impacto: **envio externo / em massa de mensagens, lançamento financeiro, deleção de dados**. Por padrão exige confirmação humana (FR-13/FR-19).
- **Modo de Teste** — execução do Harness com dados simulados, bloco a bloco, antes da ativação em produção.
- **Workspace** — o espaço único do arquiteto no MVP, contendo seus Harnesses, Connectors e credenciais.

## 4. Features

### 4.1 IA Arquiteta — geração de Harness por linguagem natural *(núcleo do produto)*
**Descrição:** o usuário descreve em linguagem natural o que quer automatizar e a **IA Arquiteta** devolve uma proposta de **Harness** em **Blocos**, cada um com função, Modelo de IA sugerido e justificativa. É o diferencial central — realiza UJ-1, UJ-2. Usa Glossário exatamente. A IA Arquiteta roda num **modelo frontier configurável**, distinto dos modelos que executam os Blocos. **Decisão (Update v2):** o *modelo padrão* específico (ex.: Claude Opus vs. Sonnet vs. outro) é definido por **spike de arquitetura** (benchmark de qualidade de decomposição), não fixado neste PRD — ver §12.

**Functional Requirements:**

#### FR-1: Decompor pedido em Harness
O arquiteto pode descrever uma automação em linguagem natural e receber uma proposta de Harness em Blocos. Realiza UJ-1, UJ-2.
**Consequences (testable):**
- A proposta lista Blocos ordenados; cada Bloco traz Tipo, Modelo de IA sugerido (ou "sem LLM") e uma justificativa de 1 linha.
- Pedidos que impliquem sistema sem API resultam em ao menos um Bloco do Tipo RPA.
- **Consciência no planejamento (moat):** a proposta considera os Canais/recursos já conectados ao Workspace (ex.: se Telegram está conectado, propõe Gatilho/Ação de Telegram) em vez de propor às cegas.
- A IA Arquiteta pede esclarecimento antes de propor quando entradas obrigatórias não podem ser inferidas: Canal de origem, sistema-alvo, ou credencial/recurso necessário ausente.

#### FR-2: Apresentar o Harness bloco a bloco
O arquiteto vê a proposta como cards visuais, um Bloco por vez, com o encadeamento do fluxo.
**Consequences (testable):**
- Cada card mostra o que o Bloco faz, o Modelo de IA sugerido e o porquê.
- O encadeamento (ordem e dependências de dados entre Blocos) é visível.

### 4.2 Aprovação e customização por etapa
**Descrição:** para cada Bloco proposto, o arquiteto aprova, troca o Modelo de IA ou pede para a IA Arquiteta repensar — sem precisar entender a implementação. Realiza UJ-1.

#### FR-3: Decidir por Bloco (aprovar / trocar modelo / repensar)
**Consequences (testable):**
- Para cada Bloco: (A) aprovar, (B) trocar o Modelo de IA, (C) solicitar nova proposta daquele Bloco.
- "Repensar" gera uma alternativa para o mesmo Bloco sem descartar os já aprovados.
- O Harness só fica elegível à publicação quando todos os Blocos estão aprovados.

#### FR-4: Selecionar Modelo de IA por Bloco
O arquiteto pode escolher, por Bloco, qualquer Modelo de IA disponível entre os Providers configurados.
**Consequences (testable):**
- A troca de Modelo de IA num Bloco não altera nenhum outro Bloco do Harness.
- Blocos "sem LLM" podem permanecer determinísticos (sem Modelo de IA).

### 4.3 Harness Runtime — execução de Blocos
**Descrição:** motor que executa os Blocos em sequência, passa dados entre eles, mantém estado e trata erros. Tipos de Bloco no MVP: **Gatilho** (inicia por evento), **Contexto** (recupera dados/histórico), **Decisão** (classifica/raciocina), **Resposta** (gera conteúdo), **RPA** (ação em sistema web — ver §4.4), **Ação** (comando externo sem raciocínio), **Verificação** (valida resultado).

#### FR-5: Executar Harness em sequência com estado e tratamento de erro
**Consequences (testable):**
- Os Blocos executam na ordem definida; a saída de um Bloco fica disponível aos seguintes.
- Falha em um Bloco é capturada: o Runtime aplica retry e, persistindo, interrompe com status de erro registrado (não avança silenciosamente).
- **Política de retry padrão (configurável por Bloco):** até **3 tentativas** com **backoff exponencial** (≈1s → 4s → 16s) para falhas transitórias; esgotadas as tentativas, o Bloco marca erro e escala ao humano (painel + log + notificação por Canal) **sem** completar Ação Irreversível.
- Blocos com `Sim*` (Contexto, RPA, Verificação) operam de forma determinística quando o LLM não é necessário.

#### FR-6: Modo de Teste com dados simulados
O arquiteto executa o Harness em Modo de Teste e vê cada Bloco rodando em tempo real antes de publicar. Realiza UJ-1, UJ-2.
**Consequences (testable):**
- A execução de teste usa dados simulados e não dispara Ações Irreversíveis reais sem confirmação.
- Cada Bloco mostra entrada, saída e status (ok/erro) em tempo real.

### 4.4 Bloco RPA — automação web + desktop Windows (cobertura ampla)
**Descrição:** Bloco que interage com sistemas **sem API**, em **duas modalidades**: (a) **web** via Playwright (DOM) e (b) **desktop Windows nativo** (janelas de executáveis `.exe`). Roda isolado, com verificação visual por LLM. **Decisão do dono: RPA amplo já no MVP** — não se limita a login+formulário, e cobre tanto navegador quanto aplicativos desktop. Realiza UJ-2.

**Decisão (Update v2) — construir vs. integrar:** a estratégia é **integrar/embutir motor(es) OSS resiliente(s)** em vez de construir do zero. Para web: motor resiliente a DOM (Stagehand/Skyvern) sobre Playwright + padrão Playwright MCP/Agents. Para desktop: motor de automação Windows (visão/computer-use ou APIs de acessibilidade UI Automation). A **escolha final da(s) biblioteca(s)** é um **spike de arquitetura** (§12), não um item de produto em aberto. O valor da RobbIA não é *ter* RPA, e sim **orquestrá-lo dentro do Harness gerado pela IA Arquiteta + isolamento de credenciais (CES)**.

> **Implicação de sandbox/deploy (desktop):** automação de app Windows nativo **não roda no sandbox Docker Linux**; exige **ambiente de execução Windows** (host/VM/contêiner Windows). Isso amplia a história de deploy do §8/§10 (hoje "Docker Compose em VPS Linux") — ver §10. `[ASSUMPTION: a abordagem técnica de automação desktop (visão vs. APIs de acessibilidade) e o formato do ambiente Windows isolado são definidos na arquitetura.]`

#### FR-7: Executar ação ampla em sistema **web** via RPA isolado
**Consequences (testable):**
- Cada execução de RPA web roda em container Docker isolado, **com rede restrita**, destruído ao final; screenshots e dados extraídos são deletados após o processamento, salvo instrução explícita de persistência.
- O Bloco autentica via CES (credenciais nunca expostas ao LLM) e cobre: navegação multi-página, preenchimento/submissão de formulários, **upload/download de arquivos** e **extração estruturada de dados (scraping)**.
- Sequências de múltiplos passos têm recuperação de erro: retry conforme política (FR-5); persistindo, marca erro e escala para humano sem completar Ação Irreversível.
- **Desafio interativo** (2FA, captcha, OTP) que bloqueie a automação pausa o Bloco e aciona handoff humano em vez de falhar silenciosamente. `[ASSUMPTION: MVP trata 2FA/captcha por handoff, não por resolução automática.]`

#### FR-21: Executar ação em **aplicativo desktop Windows nativo** via RPA isolado
O Bloco RPA automatiza aplicativos desktop Windows (janelas de executáveis `.exe`) — ex.: ERPs/sistemas legados desktop como os do domínio do dono (SISCOM, Kmov). Realiza UJ-2.
**Consequences (testable):**
- O Bloco controla um aplicativo desktop Windows: localizar janela/elemento, clicar, digitar, navegar telas, ler valores e capturar screenshot para verificação (FR-8).
- A execução ocorre num **ambiente Windows isolado** (host/VM/contêiner Windows dedicado), separado do sandbox Docker Linux usado pelo RPA web; o ambiente é restrito e seus artefatos efêmeros são deletados após o processamento, salvo persistência explícita.
- Autentica via CES (credenciais nunca expostas ao LLM); aplica a mesma política de retry/escalonamento (FR-5) e de handoff em desafio interativo (2FA/OTP) que o RPA web.
- Não completa Ação Irreversível em caso de falha/ambiguidade — marca erro e escala ao humano.

#### FR-8: Verificação visual por LLM
Um Bloco de Verificação usa um Modelo de IA para analisar o screenshot e confirmar o resultado antes de prosseguir.
**Consequences (testable):**
- O Bloco retorna um veredito estruturado (sucesso/falha + motivo) a partir do screenshot.
- Veredito de falha impede o avanço para Blocos seguintes que dependam do sucesso.
- **Segurança (resolve colisão com FR-11):** screenshots enviados ao LLM são capturados **após** a autenticação ou têm campos sensíveis (senha, token, dados pessoais) **mascarados/redatados** antes do envio; nenhuma credencial em claro chega ao Modelo de IA. `[ASSUMPTION: redaction por seletor/área conhecida; telas de login não são fotografadas com credencial visível.]`

### 4.5 Provider Abstraction — multi-LLM sem lock-in
**Descrição:** toda chamada a Modelo de IA passa por uma interface única; trocar de Provider não quebra Blocos. **Decisão do dono: 5 Providers no MVP** — Anthropic Claude, OpenAI GPT, Google Gemini, **Ollama** (local) e **OpenRouter** (agregador de 200+ modelos). **Política de roteamento (Update v2):** usar os **Providers diretos** para os modelos frontier (melhor custo/latência) e o **OpenRouter** para amplitude (modelos não integrados diretamente). O adaptador **valida e normaliza o schema** da saída estruturada para que a troca de Modelo por Bloco não quebre o Runtime (modelos não são fungíveis).

#### FR-9: Acessar múltiplos Providers por interface única
**Consequences (testable):**
- Os cinco Providers (Claude, GPT, Gemini, Ollama, OpenRouter) estão disponíveis para seleção por Bloco no MVP, incluindo ao menos um caminho 100% local (Ollama).
- Trocar o Provider/Modelo de IA de um Bloco não exige alterar outros Blocos nem o Harness.
- A saída estruturada (proposta de Bloco / resultado) é normalizada por adaptador a um schema único; uma resposta que não valide contra o schema é rejeitada/recuperada antes de chegar ao Runtime.

### 4.6 Canais — Evolution API (WhatsApp não-oficial) + Telegram
**Descrição:** o Harness recebe e envia mensagens por **Evolution API** (WhatsApp não-oficial) e **Telegram**, usados em Blocos de Gatilho e Ação. `[ASSUMPTION: Evolution API "Evolution Go" auto-hospedada; ver guardrail de ToS em §10.]`

#### FR-10: Gatilho e envio por Evolution API e Telegram
**Consequences (testable):**
- Um Bloco de Gatilho dispara o Harness ao receber mensagem em qualquer um dos dois Canais.
- Um Bloco de Ação envia resposta pelo mesmo Canal de origem.
- Conectar um Canal não requer verificação/aprovação de plataforma oficial (Evolution self-hosted).

### 4.7 CES — isolamento de credenciais *(P0 de segurança)*
**Descrição:** credenciais (ERP, tokens, Canais) ficam no **CES**, processo isolado; injetadas na execução sem chegar ao LLM. Prioridade P0 — o histórico de marketplaces de skills/MCP comprometidos torna isto requisito de confiança, não opcional.

#### FR-11: Armazenar e injetar credenciais isoladas do LLM
**Consequences (testable):**
- Credenciais são armazenadas cifradas e nunca aparecem em prompts, logs ou respostas do LLM.
- Blocos RPA/Ação autenticam recebendo as credenciais do CES em tempo de execução, no processo isolado.
- Artefatos derivados (screenshots, dados extraídos) passam por redaction de credenciais/dados sensíveis antes de qualquer envio a um Modelo de IA ou persistência (ver FR-8).
- O CES detecta falha de autenticação em runtime (credencial expirada/rotacionada) e sinaliza re-credenciamento em vez de prosseguir com credencial inválida.

### 4.8 Deploy, operação e Trust Engine
**Descrição:** publicar o Harness na VPS com um clique; rodar 24/7 com logs; pausar/editar Blocos sem recriar tudo; o Trust Engine exige confirmação humana para Ações Irreversíveis. Realiza UJ-1, UJ-2.

#### FR-12: Publicar e operar o Harness 24/7
**Consequences (testable):**
- Publicação leva o Harness de Modo de Teste para produção sem reconstruir o Harness.
- Logs de cada execução e decisão ficam disponíveis em tempo real e são auditáveis.
- O arquiteto pode pausar o agente e editar um Bloco isolado sem recriar o Harness.

#### FR-13: Confirmação humana para Ações Irreversíveis
**Consequences (testable):**
- Por padrão, Ações Irreversíveis (conforme Glossário) exigem confirmação humana antes de executar.
- A política é configurável por Bloco/Harness (quais Ações são autônomas vs. confirmadas).
- Confirmação robusta a falha de Canal e a guardião ausente: ver FR-19.

### 4.9 Harness UI — chat de construção
**Descrição:** interface conversacional onde o arquiteto descreve o agente e aprova os Blocos em cards visuais com seletor de Modelo de IA. Estética conforme o [brand book](../../../../docs/brand-book.md) (mascote robô-fluxo, Grafite + Ciano, temas claro/escuro). Realiza UJ-1.

#### FR-14: Construir e revisar o Harness por chat + cards
**Consequences (testable):**
- O arquiteto descreve e refina o agente em linguagem natural numa única conversa.
- Os Blocos aparecem como cards visuais com a ação de seleção de Modelo de IA embutida.
- O Modo de Teste é acionável a partir da mesma interface.
- A interação primária do MVP é **chat + cards (um Bloco por vez)**; o encadeamento do Harness também é visível como **fluxo visual** (ReactFlow). `[ASSUMPTION: chat+cards é o modelo mental principal; a vista de fluxo é complementar, não um editor nó-a-nó estilo n8n.]`

#### FR-20: Identidade visual e estados expressivos na UI
A UI segue a identidade da marca e comunica o estado do agente visualmente. Detalhes em [brand-book.md](../../../../docs/brand-book.md).
**Consequences (testable):**
- A UI aplica a paleta Grafite + Ciano (hierarquia 60/30/10) e a tipografia Inter (interface) + JetBrains Mono (código/configs), em **temas claro e escuro** (ambos no MVP).
- O indicador do agente (núcleo do mascote) reflete o estado por cor conforme o brand book: Ocioso, Pensando, Ativo, Aguardando, Concluído, Erro.

### 4.10 Memória por conversa
**Descrição:** o agente mantém **memória mínima por conversa** — histórico da conversa/cliente disponível aos Blocos (ex.: Contexto) dentro de uma mesma conversa em produção. Decisão do dono: incluir no MVP como feature explícita. **Não** é o motor de memória híbrida (dense+sparse) nem perfis persistentes globais — esses continuam na Fase 4. Realiza UJ-1. `[ASSUMPTION: escopo = persistir e recuperar o histórico por conversa/cliente; sem busca vetorial nem perfil global no MVP.]`

#### FR-15: Persistir e recuperar memória por conversa
**Consequences (testable):**
- Mensagens de uma conversa ficam persistidas e podem ser recuperadas por um Bloco de Contexto na mesma conversa.
- A memória é isolada por conversa/cliente (uma conversa não enxerga o histórico de outra).
- Não há, no MVP, perfil de usuário persistente entre conversas distintas nem busca semântica.

### 4.11 Concorrência e Resiliência *(robustez 24/7)*
**Descrição:** um agente que roda 24/7 precisa sobreviver a mensagens simultâneas, Providers fora do ar, Canais que caem/banem e confirmações que não chegam — sem perder dados nem agir errado. Cobre lacunas levantadas na revisão adversarial e de edge cases. Realiza UJ-1, UJ-2.

#### FR-16: Ordenação e concorrência por conversa
**Consequences (testable):**
- Mensagens em rajada na mesma conversa são serializadas (lock por conversa): sem race de leitura/escrita na memória (FR-15) e sem respostas duplicadas/fora de ordem.
- Conversas distintas executam em paralelo sem interferência.

#### FR-17: Resiliência de Provider (failover)
**Consequences (testable):**
- O Runtime distingue falha transitória (rate limit, timeout → retry com backoff) de permanente (chave inválida → erro/escala).
- Um Bloco pode ter Modelo de IA de fallback; indisponibilidade de um Provider não trava o agente indefinidamente.

#### FR-18: Resiliência de Canal
**Consequences (testable):**
- Desconexão ou banimento de um Canal (Evolution/Telegram) é detectado e alertado ao operador.
- Mensagens recebidas durante indisponibilidade são retidas em fila e reprocessadas na reconexão (não se perdem silenciosamente).

#### FR-19: Confirmação robusta de Ação Irreversível
**Consequences (testable):**
- Se o guardião não confirmar uma Ação Irreversível, há timeout/fila explícita (**padrão: 24h, configurável**) — esgotado o prazo, a ação é **cancelada/enfileirada para revisão**, nunca executada às cegas nem pendente para sempre.
- O canal de confirmação não depende unicamente de um Canal que pode estar fora (ex.: oferece confirmação via painel/log), evitando dependência circular com FR-18.

## 5. Não-Goals (Explícito)
- **Não** é painel multi-cliente nem white-label no MVP (single-workspace). `[NON-GOAL for MVP]`
- **Não** há marketplace de harnesses no MVP; se vier, será **curado/certificado**, nunca aberto sem certificação (risco de supply-chain). `[NON-GOAL for MVP]`
- **Não** há motor de memória híbrida (dense+sparse), perfis persistentes globais nem engine proativo (Fase 4). O MVP **tem** memória mínima por conversa (§4.10, FR-15), mas nada além disso.
- **Não** há catálogo amplo de Skills/MCP da comunidade (Fase 3); o MVP traz os Canais, RPA e Blocos básicos.
- **Não** é SaaS gerenciado; o MVP é self-hosted via Docker Compose.
- **Não** usa WhatsApp Cloud API oficial no MVP (escolha por Evolution API — ver §10).

## 6. Escopo do MVP

### 6.1 Em escopo
- IA Arquiteta: NL → proposta de Harness em Blocos com justificativa e Modelo de IA por Bloco (FR-1, FR-2).
- Aprovação por etapa + seletor de Modelo de IA por Bloco (FR-3, FR-4).
- Harness Runtime: execução sequencial com estado, erro e Modo de Teste (FR-5, FR-6).
- Bloco RPA **amplo** em duas modalidades: **web** (Playwright + sandbox Docker): multi-página, formulários, upload/download, scraping; e **desktop Windows nativo** (ambiente Windows isolado): controle de janelas de `.exe` — ambos com verificação visual (FR-7, FR-8, FR-21). Estratégia = integrar motor OSS (lib final = spike de arquitetura).
- Provider Abstraction com **5 Providers**: Claude, GPT, Gemini, Ollama, OpenRouter (FR-9).
- Canais Evolution API + Telegram (FR-10).
- CES — isolamento de credenciais (FR-11).
- Deploy/operação na VPS + Trust Engine (FR-12, FR-13).
- Harness UI conversacional com cards + fluxo visual (FR-14).
- **Memória mínima por conversa** (FR-15).
- **Concorrência e resiliência 24/7**: ordenação por conversa, failover de Provider, resiliência de Canal, confirmação robusta (FR-16 a FR-19).
- **Identidade visual** (brand book) + estados expressivos do mascote + temas claro/escuro (FR-20).

### 6.2 Fora de escopo do MVP
- Painel multi-cliente / white-label — *núcleo do posicionamento, mas exige tenancy; v2.*
- Marketplace de harnesses (fork/remix/avaliação) — *vetor de supply-chain; só curado/certificado, pós-MVP.*
- Motor de memória híbrida (dense+sparse) + perfis persistentes globais + engine proativo — *Fase 4.* (O MVP **tem** memória mínima por conversa — §4.10/FR-15.)
- Catálogo de Skills/MCP da comunidade + agentskills.io — *Fase 3.*
- DeepSeek como Provider direto dedicado — *acessível via OpenRouter no MVP; sem adaptador próprio.*
- Multi-agente (um Harness orquestra outros), interface mobile, certificação/Academy — *Fase 5+.*
- WhatsApp Cloud API oficial — *trocado por Evolution API no MVP.*

## 7. Métricas de Sucesso

**Primária**
- **SM-1 — Qualidade da geração do Harness:** % de Harnesses propostos pela IA Arquiteta que o arquiteto **publica com pouca edição**, onde "pouca edição" = **proporção de Blocos trocados/repensados ≤ 20%** (proxy que escala com o tamanho do Harness, em vez de contagem absoluta). Alvo inicial `[ASSUMPTION: ≥ 60% dos Harnesses no MVP]`. **Se abaixo do alvo:** sinal para iterar o system prompt da IA Arquiteta (não relaxar o critério). Valida FR-1, FR-2, FR-3. Lido junto da contra-métrica SM-C1 (evita inflar por aprovação sem leitura).

**Secundárias**
- **SM-2 — Time-to-production:** tempo mediano do "descrevi" ao "agente publicado e rodando". Alvo `[ASSUMPTION: < 30 min para um agente simples]`. Valida FR-6, FR-12.
- **SM-3 — Confiabilidade de execução:** % de execuções em produção sem erro não tratado. Alvo `[ASSUMPTION: ≥ 95%]`. Valida FR-5, FR-7.
- **SM-4 — RPA em modo de teste:** % de Blocos RPA que passam na verificação visual no primeiro teste, medido sobre os **sistemas-alvo definidos para o MVP** (denominador): **ERP** (Totvs/SAP/web), **portal gov** (SEFAZ/prefeitura), **e-commerce**, **CRM/web genérico** e **app desktop Windows nativo** (ex.: SISCOM, Kmov). Valida FR-7, FR-8, FR-21.

**Counter-metrics (não otimizar)**
- **SM-C1 — Edição não vira fricção:** se SM-1 subir porque o arquiteto **deixa de revisar** (aprova tudo sem ler), é falha, não sucesso. Acompanhar taxa de Harnesses aprovados sem nenhuma interação por Bloco — alta demais sinaliza "botão mágico", contrariando o JTBD de "entregar com a minha assinatura". Contrabalança SM-1.
- **SM-C2 — Velocidade não atropela segurança:** reduzir Time-to-production (SM-2) não pode vir de pular confirmação de Ações Irreversíveis. Acompanhar % de Ações Irreversíveis executadas sem confirmação — deve permanecer ~0. Contrabalança SM-2.

## 8. NFRs Transversais
- **Segurança (P0):** credenciais nunca chegam ao LLM (CES); RPA **web** em sandbox Docker isolado e efêmero, e RPA **desktop** em ambiente Windows isolado igualmente restrito/efêmero; ações irreversíveis sob confirmação; log auditável de cada execução/decisão.
- **Privacidade:** dados ficam na VPS do usuário; sem telemetria para servidores externos. `[ASSUMPTION: LGPD aplicável; ao usar Providers frontier em nuvem, dados de prompt saem para o Provider — documentar e permitir caminho 100% local via Ollama.]`
- **Confiabilidade:** agente roda 24/7; falhas tratadas com retry e escalonamento; sem avanço silencioso após erro (ver §4.11).
- **Concorrência:** execuções serializadas por conversa, conversas distintas em paralelo (FR-16).
- **Observabilidade:** logs em tempo real por execução e por Bloco; trilha de decisão auditável. `[ASSUMPTION: "tempo real" = streaming via WebSocket, latência percebida < ~2s.]`
- **Custo:** seleção de Modelo de IA por Bloco permite trocar frontier por modelo barato/local onde raciocínio pesado não é necessário (Blocos `Sim*` podem ser determinísticos).
- **Portabilidade/Deploy:** o núcleo sobe via Docker Compose num comando em VPS Linux comum. **O RPA desktop Windows requer, adicionalmente, um ambiente de execução Windows** (host/VM/contêiner Windows) — a arquitetura define o formato (ex.: nó Windows dedicado acionado pelo Runtime). `[ASSUMPTION: o RPA desktop pode rodar num nó Windows separado, sem exigir que todo o stack seja Windows.]`
- **Usabilidade/Marca:** UI conforme [brand book](../../../../docs/brand-book.md) (paleta Grafite+Ciano, tipografia Inter+JetBrains Mono, temas claro/escuro). A voz/tom da marca (técnico, inteligente, profissional, confiável) aplica-se ao **texto de interface do produto** — não às respostas geradas pelos agentes (configuradas por Harness). Acessibilidade alvo `[ASSUMPTION: WCAG 2.1 AA]`.

## 9. Por que agora (Why Now)
A demanda pela persona-alvo é forte e mal servida: levantamentos de mercado apontam "AI/agentic engineer" entre os cargos de maior crescimento, escassez global de talento e uma lacuna de execução — **a maioria das organizações experimenta agentes, mas a minoria os coloca em produção**. Surge a especialização explícita de **"AI Agent Architect"**, sem ferramenta dedicada: frameworks exigem engenharia, no-code é fechado e de usuário final. `[ASSUMPTION: validar 2–3 estatísticas load-bearing (ex.: "62% experimentam / 11% em produção", crescimento de vagas) em fonte primária antes de uso público — vieram de fontes secundárias na pesquisa.]`

## 10. Constraints e Guardrails
- **Guardrail — WhatsApp via Evolution API (não-oficial):** acelera e baratea o MVP (sem verificação Meta), **porém viola os Termos de Serviço do WhatsApp** e expõe o número a **banimento**. Decisão consciente do dono. Mitigações: usar número dedicado/descartável em teste, documentar o risco para o usuário, e manter a arquitetura de Canal plugável para permitir migração à Cloud API oficial sem reescrever Harnesses. `[ASSUMPTION: a camada de Canal plugável permite adicionar/migrar para a Cloud API oficial sem reescrever Harnesses existentes.]`
- **Guardrail — Ações Irreversíveis:** confirmação humana por padrão (FR-13).
- **Guardrail — Segurança de credenciais:** CES é P0; nenhuma credencial em prompt/log (FR-11).
- **Constraint — Custo de LLM:** custo por execução depende dos Modelos escolhidos por Bloco; o produto deve tornar o trade-off visível ao arquiteto.
- **Constraint — Ambiente Windows para RPA desktop:** automatizar apps Windows nativos exige um ambiente de execução Windows (licenciamento/infra próprios), distinto do sandbox Docker Linux do RPA web. Decisão consciente do dono (necessário para sistemas como SISCOM/Kmov). A camada de RPA deve abstrair as duas modalidades para que o Harness não precise saber qual motor executa o Bloco.

## 11. Dependências e Integrações
- **Providers de LLM (5):** Anthropic Claude, OpenAI GPT, Google Gemini, Ollama (local) e OpenRouter (agregador).
- **Evolution API (Evolution Go):** serviço self-hosted de WhatsApp não-oficial.
- **Telegram:** Bot API.
- **RPA web:** navegador Playwright + motor OSS resiliente a DOM (Stagehand/Skyvern — a definir em spike).
- **RPA desktop Windows:** motor de automação de UI Windows (visão/computer-use ou UI Automation — a definir em spike) + **ambiente de execução Windows** (host/VM/contêiner).
- **Infra:** Docker/Docker Compose, PostgreSQL (+ pgvector quando memória entrar). Detalhes de stack no [addendum.md](addendum.md) e nos [docs](../../../../docs/product-vision-architecture.md).

## 12. Questões em Aberto e Spikes de Arquitetura
*(Abertas por qualidade da solução — tempo não é critério; ver guardrail de priorização no §0/decision log.)*

**Fechadas na Update v2 (2026-06-14):**
- ✅ **Sistemas-alvo do RPA** (era §12.3, decisão do dono): ERP, portal gov, e-commerce, CRM/web genérico e **app desktop Windows nativo** — fixados em §4.4/SM-4 (FR-7, FR-21).
- ✅ **Estratégia de RPA:** integrar motor OSS resiliente, não construir do zero (§4.4).
- ✅ **Política de retry/escalonamento:** 3 tentativas + backoff exp.; timeout de confirmação 24h → cancela/enfileira (FR-5, FR-17, FR-19).
- ✅ **Roteamento de Provider:** diretos p/ frontier, OpenRouter p/ amplitude; normalização de schema (FR-9).
- ✅ **Medição de SM-1:** proxy proporcional (≤20% de Blocos editados/repensados), instrumentado no fluxo de build.

**Spikes transferidos para a Arquitetura** (decisão técnica, não de produto):
1. **Modelo padrão da IA Arquiteta** — benchmark de qualidade de decomposição (ex.: Claude Opus vs. Sonnet vs. outros) para fixar o default configurável (FR-1).
2. **Biblioteca(s) de RPA** — escolha do motor OSS para web (Stagehand/Skyvern + Playwright MCP) e da abordagem desktop Windows (visão/computer-use vs. UI Automation) + formato do ambiente Windows isolado (FR-7, FR-21).

**A validar (não-bloqueador):**
- Estatísticas de mercado do §9 — confirmar em fonte primária antes de uso público.

## 13. Índice de Pressupostos
*Cada `[ASSUMPTION]` do documento, para confirmação explícita:*
- §2.2 — MVP serve um arquiteto/um Workspace; multi-tenancy é v2.
- §4.1 — IA Arquiteta roda num modelo frontier configurável, distinto dos modelos de execução; **modelo padrão específico = spike de arquitetura** (Update v2).
- §4.4 — RPA do MVP = **amplo em duas modalidades**: web (Playwright) + desktop Windows nativo; abordagem técnica desktop (visão vs. UI Automation) e formato do ambiente Windows isolado = spike de arquitetura.
- §4.5 / §11 — MVP com **5 Providers** (Claude, GPT, Gemini, Ollama, OpenRouter); roteamento diretos (frontier) × OpenRouter (amplitude) + normalização de schema **decidido** (Update v2).
- §4.6 / §10 — Evolution API "Evolution Go" self-hosted; risco de ToS/banimento assumido (decidido).
- §4.7/§4.4 — RPA: redaction de credenciais antes do screenshot ir ao LLM (FR-8); 2FA/captcha tratados por handoff humano, não resolução automática (FR-7).
- §4.9 — Chat+cards é a interação primária; vista de fluxo (ReactFlow) é complementar (não editor nó-a-nó).
- §4.10 — Memória mínima por conversa no MVP; sem busca vetorial nem perfil global (Fase 4).
- §7 — Alvos de SM-1..SM-4 são **provisórios** (SM-1: ≤20% dos Blocos editados em ≥60% dos Harnesses; SM-2 <30 min; SM-3 ≥95%), a recalibrar no piloto.
- §8 — LGPD aplicável; dados saem ao Provider frontier em nuvem; caminho 100% local via Ollama. "Tempo real" ≈ streaming WebSocket <~2s. Acessibilidade alvo WCAG 2.1 AA.
- §9 — Estatísticas de mercado precisam de validação em fonte primária.
- §10 — RPA desktop pode rodar num nó/ambiente Windows separado, sem exigir que todo o stack seja Windows (formato definido na arquitetura).
- **Decidido (não mais pressuposto):** auth single-admin no MVP; Evolution API; RPA amplo **web + desktop Windows** (FR-21); estratégia RPA = integrar OSS; sistemas-alvo do RPA (ERP/gov/e-commerce/CRM/desktop); política de retry/escalonamento (FR-5/17/19); roteamento de Provider (FR-9); 5 Providers; memória por conversa; concorrência/resiliência (FR-16–19) e identidade visual (FR-20) no MVP.
