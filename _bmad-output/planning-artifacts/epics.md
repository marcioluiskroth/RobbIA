---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-robbia-2026-06-14/prd.md
  - _bmad-output/planning-artifacts/prds/prd-robbia-2026-06-14/addendum.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-RobbIA-2026-06-14/EXPERIENCE.md
---

# RobbIA — Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for RobbIA, decomposing the requirements from the PRD, UX Design and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: A IA Arquiteta decompõe uma automação descrita em linguagem natural numa proposta de Harness em Blocos ordenados; cada Bloco traz Tipo, Modelo de IA sugerido (ou "sem LLM") e justificativa de 1 linha. Pedidos que impliquem sistema sem API geram ao menos um Bloco RPA. O planejamento considera Canais/recursos já conectados ao Workspace e pede esclarecimento quando entradas obrigatórias (Canal de origem, sistema-alvo, credencial) não podem ser inferidas.
FR-2: O arquiteto vê a proposta como cards visuais, um Bloco por vez, com o encadeamento (ordem e dependências de dados) visível; cada card mostra o que o Bloco faz, o Modelo de IA sugerido e o porquê.
FR-3: Para cada Bloco o arquiteto pode (A) aprovar, (B) trocar o Modelo de IA, (C) pedir nova proposta daquele Bloco ("repensar", sem descartar os já aprovados). O Harness só fica elegível à publicação quando todos os Blocos estão aprovados.
FR-4: O arquiteto pode escolher, por Bloco, qualquer Modelo de IA entre os Providers configurados; a troca num Bloco não altera nenhum outro Bloco; Blocos "sem LLM" permanecem determinísticos.
FR-5: O Harness Runtime executa os Blocos na ordem definida, passa a saída de um aos seguintes, mantém estado e trata erro: política de retry padrão configurável por Bloco (até 3 tentativas, backoff exponencial ≈1s→4s→16s); esgotadas as tentativas, marca erro e escala ao humano (painel + log + notificação por Canal) sem completar Ação Irreversível.
FR-6: O arquiteto executa o Harness em Modo de Teste com dados simulados e vê cada Bloco rodando em tempo real (entrada/saída/status) antes de publicar; o teste não dispara Ações Irreversíveis reais sem confirmação.
FR-7: O Bloco RPA executa ação ampla em sistema web via RPA isolado (container Docker isolado, rede restrita, efêmero, artefatos deletados pós-processamento): navegação multi-página, preenchimento/submissão de formulários, upload/download de arquivos e extração estruturada de dados (scraping). Autentica via CES; aplica a política de retry; desafio interativo (2FA/captcha/OTP) pausa o Bloco e aciona handoff humano.
FR-8: Um Bloco de Verificação usa um Modelo de IA para analisar o screenshot e retornar um veredito estruturado (sucesso/falha + motivo); veredito de falha impede o avanço. Screenshots são capturados pós-autenticação ou têm campos sensíveis mascarados/redatados antes do envio ao LLM.
FR-9: Toda chamada a Modelo de IA passa por uma interface única; os 5 Providers (Claude, GPT, Gemini, Ollama local, OpenRouter) estão disponíveis para seleção por Bloco; trocar Provider/Modelo num Bloco não exige alterar outros; a saída estruturada é normalizada por adaptador a um schema único e respostas inválidas são rejeitadas/recuperadas antes do Runtime.
FR-10: Um Bloco de Gatilho dispara o Harness ao receber mensagem por Evolution API (WhatsApp não-oficial) ou Telegram; um Bloco de Ação envia resposta pelo mesmo Canal de origem; conectar um Canal não requer verificação/aprovação de plataforma oficial.
FR-11: O CES armazena credenciais cifradas e as injeta na execução (RPA/Ação) no processo isolado, sem nunca aparecerem em prompts, logs ou respostas do LLM; artefatos derivados passam por redaction antes de qualquer envio a um Modelo ou persistência; falha de autenticação em runtime sinaliza re-credenciamento.
FR-12: Publicação leva o Harness do Modo de Teste para produção sem reconstruir; logs de cada execução/decisão ficam disponíveis em tempo real e são auditáveis; o arquiteto pode pausar o agente e editar um Bloco isolado sem recriar o Harness.
FR-13: Por padrão, Ações Irreversíveis (envio externo/em massa, lançamento financeiro, deleção de dados) exigem confirmação humana antes de executar; a política é configurável por Bloco/Harness.
FR-14: O arquiteto descreve e refina o agente em linguagem natural numa única conversa; os Blocos aparecem como cards visuais com seletor de Modelo embutido; o Modo de Teste é acionável da mesma interface; o encadeamento também é visível como fluxo visual (ReactFlow) — complementar, não editor nó-a-nó.
FR-15: Mensagens de uma conversa são persistidas e recuperáveis por um Bloco de Contexto na mesma conversa; a memória é isolada por conversa/cliente; sem perfil persistente entre conversas nem busca semântica no MVP.
FR-16: Mensagens em rajada na mesma conversa são serializadas (lock por conversa) — sem race de leitura/escrita na memória nem respostas duplicadas/fora de ordem; conversas distintas executam em paralelo sem interferência.
FR-17: O Runtime distingue falha transitória (rate limit/timeout → retry com backoff) de permanente (chave inválida → erro/escala); um Bloco pode ter Modelo de IA de fallback; indisponibilidade de um Provider não trava o agente indefinidamente.
FR-18: Desconexão ou banimento de um Canal (Evolution/Telegram) é detectado e alertado ao operador; mensagens recebidas durante indisponibilidade são retidas em fila e reprocessadas na reconexão (não se perdem silenciosamente).
FR-19: Se o guardião não confirmar uma Ação Irreversível há timeout/fila explícita (padrão 24h, configurável) — esgotado o prazo, a ação é cancelada/enfileirada para revisão, nunca executada às cegas nem pendente para sempre; o canal de confirmação não depende unicamente de um Canal que pode estar fora (oferece confirmação via painel/log).
FR-20: A UI aplica a identidade da marca: paleta Grafite + Ciano (hierarquia 60/30/10), tipografia Inter (interface) + JetBrains Mono (código/configs), em temas claro e escuro (ambos no MVP); o indicador do agente (núcleo do mascote) reflete o estado por cor: Ocioso, Pensando, Ativo, Aguardando, Concluído, Erro.
FR-21: O Bloco RPA executa ação em aplicativo desktop Windows nativo (janelas de `.exe`, ex.: SISCOM, Kmov) via RPA isolado num ambiente Windows dedicado, separado do sandbox Docker Linux: localizar janela/elemento, clicar, digitar, navegar telas, ler valores e capturar screenshot para verificação (FR-8). Autentica via CES; aplica a mesma política de retry/escalonamento e de handoff em desafio interativo; não completa Ação Irreversível em falha/ambiguidade.
FR-22: O Bloco de Ação pode executar uma chamada HTTP/API genérica a um sistema **com** API, disponível como skill built-in no catálogo (`packages/skills`). Configura método (GET/POST/PUT/PATCH/DELETE), URL, headers, query e corpo; autenticação (API key / bearer / basic) resolvida via CES quando necessária, sem credencial no LLM/log. A resposta (status + corpo) é validada/normalizada e fica disponível aos Blocos seguintes; falhas seguem a política de retry (FR-5) distinguindo transitório de permanente; quando a chamada for uma Ação Irreversível (ex.: POST que cria/deleta/transaciona), respeita o Trust Engine (FR-13/FR-19). A IA Arquiteta propõe um Bloco de Ação HTTP — em vez de RPA — quando o sistema-alvo expõe API.

FR-23: Ingestão de documentos (PDF, Markdown, TXT, URL) numa Base de Conhecimento por agente — chunking + embeddings (FR-25) + indexação em `pgvector`; idempotente (reprocessar não duplica); isolada por Workspace/agente.
FR-24: O Bloco de Contexto recupera os top-k trechos mais relevantes de uma Base de Conhecimento (com atribuição de fonte: documento + posição), além da memória de conversa (FR-15); trechos entram no contexto sem expor credenciais.
FR-25: Geração de embeddings via Provider Abstraction (FR-9), com modelo configurável e caminho 100% local (Ollama); a dimensão do vetor é registrada por índice (troca de modelo não corrompe o store). Usado por RAG (FR-23/24) e memória híbrida (FR-29).
FR-26: Catálogo de Skills built-in (`SKILL.md` + `TOOLS.json`) carregado por Workspace; um Bloco de Ação invoca uma Skill por nome, com os argumentos validados contra o schema da tool antes de executar; o catálogo é extensível sem recompilar o Runtime.
FR-27: Connectors — o arquiteto conecta um servidor MCP (config + credencial via CES) e as tools expostas viram Skills disponíveis, invocáveis por Blocos de Ação como qualquer Skill; desconectar remove as tools do catálogo sem quebrar Harnesses (Blocos que as usavam marcam capacidade ausente).
FR-28: A IA Arquiteta recebe o catálogo de Skills disponíveis (built-in + MCP conectado) e propõe Blocos de Ação apenas para Skills existentes; quando o pedido exige capacidade ausente (ex.: responder de documentos sem Base de Conhecimento, ou integração não conectada), pede esclarecimento / sinaliza a lacuna em vez de inventar (estende FR-1).
FR-29: Memória híbrida (dense+sparse) e perfil persistente global entre conversas/cliente — o Bloco de Contexto pode recuperar memória entre conversas do mesmo cliente/usuário (perfil), isolada por Workspace; a recuperação combina busca vetorial (`pgvector`) e lexical e devolve trechos ranqueados.

### NonFunctional Requirements

NFR-1: **Segurança (P0)** — credenciais nunca chegam ao LLM (CES); RPA web em sandbox Docker isolado e efêmero; RPA desktop em ambiente Windows isolado igualmente restrito/efêmero; Ações Irreversíveis sob confirmação; log auditável de cada execução/decisão.
NFR-2: **Privacidade** — dados ficam na VPS do usuário; sem telemetria para servidores externos; ao usar Providers frontier em nuvem, documentar que dados de prompt saem para o Provider e permitir caminho 100% local via Ollama (LGPD).
NFR-3: **Confiabilidade** — agente roda 24/7; falhas tratadas com retry e escalonamento; sem avanço silencioso após erro.
NFR-4: **Concorrência** — execuções serializadas por conversa; conversas distintas em paralelo.
NFR-5: **Observabilidade** — logs em tempo real por execução e por Bloco (streaming via WebSocket, latência percebida < ~2s); trilha de decisão auditável.
NFR-6: **Custo** — seleção de Modelo de IA por Bloco permite trocar frontier por modelo barato/local onde raciocínio pesado não é necessário; o trade-off deve ser visível ao arquiteto.
NFR-7: **Portabilidade/Deploy** — o núcleo sobe via Docker Compose num comando em VPS Linux comum; o RPA desktop Windows requer adicionalmente um ambiente de execução Windows (host/VM/contêiner/nó dedicado), com a camada de RPA abstraindo as duas modalidades.
NFR-8: **Usabilidade/Marca** — UI conforme brand book (paleta Grafite+Ciano, tipografia Inter+JetBrains Mono, temas claro/escuro); voz da marca aplica-se ao texto de interface (não às respostas dos agentes); acessibilidade WCAG 2.1 AA.

### Additional Requirements

*(Derivados do documento de Arquitetura — direcionam implementação e fundação.)*

- **[STARTER TEMPLATE — Épico 1, Story 1]** Scaffold próprio de monorepo **Bun workspaces + Turborepo 2.x** (não há starter de app único adequado). Comando de inicialização documentado na arquitetura: `bun init` + workspaces `apps/*`/`packages/*`, `bun create next-app` para `apps/web`, demais apps/packages como libs Bun+TS. Esta inicialização é a **primeira story de implementação**.
- **Stack fixada (versões jun/2026):** TypeScript `strict` em todo o monorepo; Bun 1.3.x (runtime/PM/test); Turborepo 2.x; Next.js 16 + React 19.2.x (App Router, Server Components, streaming) + Tailwind + Shadcn/ui + ReactFlow; Biome 2.2.x (lint+format); PostgreSQL + Drizzle 0.45.x; Fastify 5.8.x + WebSocket; pg-boss (filas/jobs). pgvector adiado (Fase 4).
- **Modelo de domínio (schema Drizzle):** `Harness`→`Block[]` (tipado por Tipo de Bloco, com dependências); `Execution`+`ExecutionStep` (estado e I/O por Bloco — base de retry/replay e do Modo de Teste); `Conversation`+`Message` (memória por conversa, isolada — FR-15); `Credential` (apenas referência; segredo no CES); `Provider`/`ModelConfig`. PK `id` = UUID v7; timestamps `timestamptz` UTC.
- **Validação Zod v4 em todas as fronteiras:** webhook de Canal, saída estruturada do LLM (normalização entre Providers — FR-9) e schema de proposta de Harness (FR-1). Princípio "parse, don't validate".
- **pg-boss como espinha única de mensageria/jobs** desacoplando Gateway→Runtime→workers. Tipos de job: `harness.execute`, `rpa.web`, `rpa.desktop`, `action.*`. Concorrência por conversa via lock/fila por `conversationId` (advisory lock).
- **CES = microsserviço dedicado** com envelope encryption (AES-GCM), chave mestra fora do banco (env/secret do host); injeta credenciais só no worker de execução em runtime.
- **RPA web** = worker em Docker Linux isolado usando Stagehand 2.0 (SDK TS) sobre Playwright + Playwright MCP (snapshot da árvore de acessibilidade). **RPA desktop** = worker no nó Windows com FlaUI (.NET, UI Automation/UIA3) + fallback de visão/computer-use; cliente de fila TS (Bun) acionando o helper .NET via IPC/CLI. Ambos compartilham o contrato `rpa-core`; o Runtime é agnóstico de ambiente.
- **Gateway = Fastify 5 + WebSocket:** recebe webhooks de Canais e faz streaming de logs/estado à UI; única superfície de entrada externa em produção.
- **Contrato de erro discriminado** `{ ok: true, data } | { ok: false, error: { code, message, retriable } }` em todas as fronteiras de serviço; política de retry central única (3x, backoff exp.) reutilizada por Runtime e workers.
- **Padrões de consistência obrigatórios** (nomenclatura DB snake_case plural / JSON camelCase / arquivos kebab-case; jobs `dominio.acao`; eventos WS `dominio.evento`; logs estruturados JSON sem segredos; estado de servidor via TanStack Query v5). Todo agente roda Biome + `tsc` antes de concluir.
- **Estrutura do monorepo:** `apps/{web,gateway,runtime,ces,rpa-web-worker,rpa-desktop-worker}` + `packages/{shared,db,architect,provider,rpa-core,rpa-web,rpa-desktop,memory,skills,channels}` + `workers/rpa-desktop-host` (.NET FlaUI).
- **Deploy:** `docker-compose.yml` (núcleo Linux: web, gateway, runtime, ces, rpa-web-worker, postgres) + `docker-compose.windows.yml` (nó Windows: rpa-desktop-worker + host .NET) ligado ao mesmo Postgres/fila. CI `.github/workflows/ci.yml`: bun install → biome → tsc → test → build.
- **Spikes de arquitetura (resolver antes da story correspondente, não-bloqueadores):** (1) modelo padrão da IA Arquiteta (benchmark de decomposição) — antes da story `architect`; (2) confirmação da lib de RPA web (Stagehand 2.0/Playwright MCP) e da abordagem desktop (FlaUI vs visão) — antes das stories `rpa-web`/`rpa-desktop`; (3) formato do ambiente Windows isolado (host/VM/contêiner) — antes da story `rpa-desktop`/deploy.

### UX Design Requirements

*(Insumo de primeira classe — DESIGN.md + EXPERIENCE.md. Cada UX-DR é específico o suficiente para gerar story com AC testável.)*

UX-DR1: **Sistema de design tokens** implementado como tema Tailwind + shadcn/ui: paleta de marca (graphite/charcoal/cyan), apoio, **cores de estado** (idle/thinking/active/waiting/done/error), **variantes acessíveis** (cyanText `#0E7490`, fills nível-700) e **tokens de foco**; tipografia Inter + JetBrains Mono (pesos 400/500); escala tipográfica (H1–caption); spacing base-4; elevation (flat/raised/overlay); rounded (8px base, pill); **temas claro e escuro** nativos (ambos no MVP).
UX-DR2: **BlockCard** — card de Bloco com ícone do Tipo, título, badge de Modelo (mono), justificativa de 1 linha, borda esquerda colorida por Tipo; ações **Aprovar / Trocar modelo / Repensar** (FR-3); Blocos "sem LLM" não exibem seletor de modelo; elevation `raised`.
UX-DR3: **ChatComposer** — entrada de linguagem natural com refino contínuo numa única conversa (FR-14).
UX-DR4: **ModelSelector** — popover agrupado por Provider com dica de custo/latência relativa; troca afeta só aquele Bloco (FR-4); contrato de teclado (setas navegam, Esc fecha e devolve foco ao gatilho).
UX-DR5: **StateBadge** — pill de status por Bloco/execução (rótulo + ícone + cor); no tema claro usa fill nível-700 + texto branco; carrega a regra "cor não é o único sinal".
UX-DR6: **MascotCore** — núcleo de IA como indicador vivo dos 6 estados do agente, com pulso (Pensando/Ativo); respeita `prefers-reduced-motion`; expõe estado via `aria-label` sem disparar anúncio (anti-duplicação); componente distinto do StateBadge.
UX-DR7: **FlowNode + vista ReactFlow** — forma/cor/ícone por Tipo de Bloco renderizados a partir da taxonomia autoritativa; read-first (não editor de arestas); reflete estado de execução ao vivo; clicável para focar o Bloco no centro; **alternativa não-canvas acessível** (lista navegável dos Blocos espelhando o canvas).
UX-DR8: **LogLine** — stream append-only por execução/Bloco (entrada/saída/status); mono para dados; cor por nível/estado; dados sensíveis redatados (nunca exibe credencial); o log é `role="log"` navegável sob demanda — **não** aria-live (anti-inundação).
UX-DR9: **ConfirmDialog** — modal de Ação Irreversível (ênfase âmbar/erro) que descreve a ação concreta e exige confirmação explícita; focus trap; Esc cancela; foco inicial no botão seguro/cancelar; default seguro = não-executar.
UX-DR10: **CredentialPrompt** — quando falta credencial, pausa o fluxo e a solicita antes de permitir teste/execução (FR-11, UJ-1 edge case); encaminha ao CES; nunca exibe segredo em claro.
UX-DR11: **Taxonomia visual dos 7 Tipos de Bloco** — mapa autoritativo (cor de borda/realce, ícone Lucide, forma do nó) para Gatilho, Contexto, Decisão, Resposta, RPA (web/desktop), Ação, Verificação; BlockCard e FlowNode renderizam deterministicamente a partir dele; disciplina do ciano (só Gatilho e Ação recebem ciano).
UX-DR12: **Arquitetura de informação / navegação** do workspace único: **Harnesses** (lista de agentes), **Builder**, **Operação** (execuções/logs/fila de confirmações), **Workspace** (Providers, Canais, Credenciais, tema).
UX-DR13: **Layout do Builder de 3 zonas** — Conversa (esquerda) / Cards-Inspetor do Bloco (centro) / Fluxo & Contexto + MascotCore (direita); **colapso responsivo** para zonas empilhadas ou em abas em larguras estreitas/zoom alto.
UX-DR14: **Padrões de estado por surface** — `idle · loading · streaming · success · error · empty`; toda lista/painel define explicitamente seus estados vazio e erro com recuperação acionável; **first-run/onboarding** guiado (primeiro agente, encadeando conectar Provider/Canal quando necessário).
UX-DR15: **Real-time & streaming** via WebSocket (<~2s) — cada Bloco transmite entrada/saída/status ao vivo no Teste e na Operação; queda de conexão mostra banner não-bloqueante "Reconectando…" (`role="status"`) e o log se reconcilia no retorno (anuncia só "N eventos sincronizados", não o backlog); rajada de mensagens reflete serialização por conversa (FR-16).
UX-DR16: **Acessibilidade WCAG 2.1 AA** (requisito comprometido): contraste de texto/foco (nunca ciano de marca nem cor de estado pura como texto); **contrato aria-live** (uma região `polite` só para transição de estado do agente; erros/confirmações via `role="alert"`; log em `role="log"` sob demanda); anel de foco visível ≥2px nos dois temas; **contratos de teclado** por componente (ModelSelector, ConfirmDialog, alternativa não-canvas do ReactFlow); reflow/zoom 200–400% (1.4.10/1.4.4); `prefers-reduced-motion`; cor + ícone + rótulo sempre juntos.
UX-DR17: **Trust & Confirmation (segurança como experiência)** — fila de confirmação em Operação com ConfirmDialog; timeout de 24h → cancela/enfileira para revisão (FR-19); canal de confirmação resiliente (confirmável pelo painel/log, não só pelo Canal de mensagens); credenciais nunca exibidas em claro (só status configurada/expirada/faltando).
UX-DR18: **RPA Modality Cues** — distinção visual web (Playwright) vs desktop Windows nativo (FR-21) via ícone/badge no BlockCard e FlowNode; verificação visual (FR-8) mostra o screenshot capturado no log com o veredito estruturado e dados redatados; desafio interativo (2FA/captcha) sinaliza handoff humano explícito.
UX-DR19: **Voice & Tone / microcopy** — voz de interface técnica, clara, profissional, PT-BR, sem hype; a IA Arquiteta fala como colega sênior (justificativa de 1 linha, pede esclarecimento, nunca finge certeza); erros dizem o que houve + o que fazer (acionável, sem jargão de stack); glossário da UI usa os termos exatos do PRD (Harness, Bloco, Modelo de IA, Canal, Modo de Teste).
UX-DR20: **Surfaces de Operação e Workspace** — Operação: dashboard de execuções/saúde dos agentes + logs ao vivo + fila de confirmações; Workspace: Providers (add chave → validar → status configurado/inválido/inalcançável + cue de failover FR-17), Canais (conectar via QR Evolution/token Telegram → pareando → conectado/expirado), Credenciais (status, nunca segredo).

### FR Coverage Map

FR-1: Epic 1 — IA Arquiteta decompõe NL→Harness
FR-2: Epic 1 — Apresentação do Harness bloco a bloco (cards)
FR-3: Epic 1 — Aprovar / trocar modelo / repensar por Bloco
FR-4: Epic 1 — Seleção de Modelo de IA por Bloco
FR-5: Epic 2 — Runtime: execução sequencial com estado e retry
FR-6: Epic 2 — Modo de Teste com dados simulados
FR-7: Epic 5 — RPA web isolado (Playwright/Docker)
FR-8: Epic 5 — Verificação visual por LLM
FR-9: Epic 1 — Provider Abstraction multi-LLM
FR-10: Epic 4 — Gatilho/envio por Evolution API e Telegram
FR-11: Epic 3 — CES: credenciais isoladas do LLM
FR-12: Epic 3 — Publicar e operar 24/7
FR-13: Epic 3 — Confirmação humana de Ação Irreversível
FR-14: Epic 1 — Construir/revisar Harness por chat + cards (+ fluxo)
FR-15: Epic 2 — Memória por conversa
FR-16: Epic 4 — Ordenação e concorrência por conversa
FR-17: Epic 4 — Resiliência de Provider (failover)
FR-18: Epic 4 — Resiliência de Canal (fila/replay)
FR-19: Epic 3 — Confirmação robusta de Ação Irreversível (24h/painel)
FR-20: Epic 1 — Identidade visual + estados expressivos
FR-21: Epic 5 — RPA desktop Windows nativo
FR-22: Epic 4 — Bloco de Ação HTTP/API genérico (1ª Skill built-in)
FR-23: Epic 6 — Ingestão/indexação de Conhecimento (RAG, pgvector)
FR-24: Epic 6 — Recuperação semântica no Bloco de Contexto
FR-25: Epic 6 — Embeddings via Provider Abstraction
FR-26: Epic 7 — Catálogo de Skills built-in
FR-27: Epic 7 — Connectors (MCP de 1 clique)
FR-28: Epic 7 — IA Arquiteta ciente de Skills/capacidades
FR-29: Epic 6 — Memória híbrida (dense+sparse) + perfis globais

## Epic List

### Epic 1: Fundação & Geração do Harness pela IA Arquiteta
O arquiteto descreve uma automação em linguagem natural e recebe, na bancada (chat + cards + identidade visual da marca), uma proposta de Harness com Modelo de IA sugerido e justificativa por Bloco, que aprova, troca de modelo ou repensa. Núcleo/moat do produto. Inclui a fundação técnica (scaffold do monorepo + schema de domínio) como primeira story.
**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-9, FR-14, FR-20

### Epic 2: Execução & Modo de Teste do Harness
O arquiteto roda o Harness aprovado em Modo de Teste com dados simulados e vê cada Bloco executar ao vivo (entrada/saída/status), com memória por conversa disponível aos Blocos de Contexto.
**FRs covered:** FR-5, FR-6, FR-15

### Epic 3: Segurança & Operação 24/7 com Trust Engine
O arquiteto publica o Harness na VPS, opera 24/7 com logs auditáveis ao vivo, credenciais isoladas do LLM (CES) e Ações Irreversíveis sob confirmação humana resiliente.
**FRs covered:** FR-11, FR-12, FR-13, FR-19

### Epic 4: Canais & Ações Externas em Produção (WhatsApp, Telegram + API HTTP)
O arquiteto conecta Evolution (WhatsApp) e Telegram; o agente recebe e responde mensagens reais 24/7, com ordenação por conversa e resiliência de Provider/Canal — realizando UJ-1 ponta a ponta — e executa ações em sistemas com API via Bloco de Ação HTTP genérico (built-in), evitando RPA quando há API.
**FRs covered:** FR-10, FR-16, FR-17, FR-18, FR-22

### Epic 5: RPA — Automação de Sistemas sem API (web + desktop Windows)
O agente automatiza sistemas sem API — web (Playwright/Docker) e desktop Windows nativo (FlaUI, ex.: SISCOM/Kmov) — com verificação visual por LLM e handoff em desafio interativo — realizando UJ-2 ponta a ponta.
**FRs covered:** FR-7, FR-8, FR-21

### Epic 6: Conhecimento (RAG) & Memória avançada
O agente responde "a partir dos nossos documentos": o arquiteto cria uma Base de Conhecimento por agente (ingestão → embeddings → pgvector), o Bloco de Contexto recupera trechos relevantes com atribuição de fonte, e a memória vai além da conversa (híbrida dense+sparse + perfis persistentes globais). *(Update v3 — elevado ao MVP.)*
**FRs covered:** FR-23, FR-24, FR-25, FR-29

### Epic 7: Skills & Connectors (MCP)
As ações do agente viram um catálogo de Skills plugáveis: catálogo built-in (SKILL.md + TOOLS.json, generalizando a Ação HTTP da Story 4.5) + Connectors que conectam servidores MCP de 1 clique (tools externas viram Skills), com a IA Arquiteta ciente do catálogo ao planejar. *(Update v3 — elevado ao MVP.)*
**FRs covered:** FR-26, FR-27, FR-28

## Epic 1: Fundação & Geração do Harness pela IA Arquiteta

O arquiteto descreve uma automação em linguagem natural e recebe, na bancada (chat + cards + identidade visual da marca), uma proposta de Harness com Modelo de IA sugerido e justificativa por Bloco, que aprova, troca de modelo ou repensa. Núcleo/moat do produto; estabelece a fundação técnica e o design system.

**FRs:** FR-1, FR-2, FR-3, FR-4, FR-9, FR-14, FR-20 · **UX-DRs:** 1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 19 · **Spike:** modelo padrão da IA Arquiteta (resolver antes da Story 1.4).

### Story 1.1: Scaffold do monorepo e fundação de qualidade

As a desenvolvedor da RobbIA,
I want o monorepo inicializado com a stack e o ferramental acordados,
So that todas as histórias seguintes construam sobre uma fundação consistente e verificável.

**Acceptance Criteria:**

**Given** um repositório vazio
**When** executo o comando de inicialização documentado na arquitetura (Bun workspaces + Turborepo 2.x)
**Then** existe um monorepo com `apps/*` e `packages/*` habilitados como workspaces, `apps/web` criado via `create next-app` (Next.js 16 + React 19 + Tailwind + TS)
**And** `turbo.json`, `biome.json`, `tsconfig.base.json` (TypeScript `strict`, sem `any`) e `.env.example` estão na raiz.

**Given** o monorepo inicializado
**When** crio os esqueletos dos demais apps/packages conforme a árvore da arquitetura (`apps/{gateway,runtime,ces,rpa-web-worker,rpa-desktop-worker}`, `packages/{shared,db,architect,provider,rpa-core,rpa-web,rpa-desktop,memory,skills,channels}`)
**Then** cada package expõe um barrel `src/index.ts` e `packages/shared` contém os contratos transversais iniciais (`result.ts` com o resultado discriminado, `retry.ts` com a política única 3x/backoff exp., `logger.ts` estruturado, `jobs.ts`/`events.ts` com os nomes de job/evento).

**Given** a fundação configurada
**When** rodo o pipeline de CI (`.github/workflows/ci.yml`: bun install → biome → tsc → test → build)
**Then** todos os passos passam em verde
**And** `docker-compose.yml` (núcleo Linux) sobe ao menos `postgres` e a `apps/web` localmente.

### Story 1.2: Schema de domínio do Harness (Drizzle)

As a desenvolvedor da RobbIA,
I want o modelo de dados do Harness e dos Providers persistido,
So that a proposta da IA Arquiteta possa ser criada, lida e editada com tipagem forte.

**Acceptance Criteria:**

**Given** o package `@robbia/db` (Drizzle + Drizzle Kit)
**When** defino o schema necessário a este épico
**Then** existem apenas as tabelas requeridas agora — `harnesses`, `blocks` (tipado por Tipo de Bloco: Gatilho/Contexto/Decisão/Resposta/RPA/Ação/Verificação), `providers`, `model_configs` — em `snake_case` plural, PK `id` UUID v7 e timestamps `timestamptz` (UTC)
**And** as tabelas de execução/conversa NÃO são criadas aqui (ficam para os épicos 2/4).

**Given** o schema definido
**When** gero e aplico a migration
**Then** o Postgres reflete o schema e `packages/db` é o único acesso ao banco (client + schema exportados).

**Given** o package `@robbia/shared`
**When** modelo a proposta de Harness
**Then** existem schemas Zod (`HarnessSchema`, `BlockSchema`, `BlockTypeSchema`) com tipos inferidos, usados como contrato entre `architect`, `db` e `web`.

### Story 1.3: Provider Abstraction multi-LLM com normalização de schema

As a arquiteto,
I want acessar qualquer um dos 5 Providers por uma interface única,
So that eu possa escolher o Modelo de IA por Bloco sem lock-in e sem quebrar o sistema.

**Acceptance Criteria:**

**Given** o package `@robbia/provider` com a interface `LLMProvider`
**When** configuro chaves de Provider
**Then** os 5 Providers — Claude, GPT, Gemini, Ollama (local) e OpenRouter — estão disponíveis por adaptador (`XxxProvider implements LLMProvider`), incluindo ao menos um caminho 100% local (Ollama).

**Given** uma chamada de saída estruturada a qualquer Provider
**When** o Provider responde
**Then** o adaptador valida/normaliza a saída contra um schema Zod único (`normalize.ts`); uma resposta que não valide é rejeitada e recuperada (retry/repair) antes de retornar ao chamador.

**Given** dois Blocos com Providers diferentes
**When** troco o Provider/Modelo de um Bloco
**Then** nenhum outro Bloco é afetado
**And** o roteamento usa Providers diretos para frontier e OpenRouter para amplitude.

### Story 1.4: IA Arquiteta — decomposição de linguagem natural em Harness

As a arquiteto,
I want descrever uma automação em linguagem natural e receber uma proposta de Harness em Blocos,
So that eu obtenha um ponto de partida estruturado sem montar o fluxo nó a nó.

**Acceptance Criteria:**

**Given** o package `@robbia/architect` (system-prompt, decompose, parser, validator) e o modelo padrão definido pelo spike
**When** envio uma descrição em linguagem natural
**Then** recebo uma proposta de Harness com Blocos ordenados; cada Bloco traz Tipo, Modelo de IA sugerido (ou "sem LLM") e justificativa de 1 linha, validada contra `HarnessSchema` (FR-1).

**Given** um pedido que implica um sistema sem API
**When** a IA Arquiteta decompõe
**Then** a proposta inclui ao menos um Bloco do Tipo RPA.

**Given** Canais/recursos já conectados ao Workspace
**When** a IA Arquiteta planeja
**Then** a proposta considera esses recursos (ex.: propõe Gatilho/Ação de Telegram se o Telegram estiver conectado) em vez de propor às cegas.

**Given** entradas obrigatórias que não podem ser inferidas (Canal de origem, sistema-alvo, credencial/recurso ausente)
**When** a IA Arquiteta processa o pedido
**Then** ela pede esclarecimento antes de propor, em vez de inventar.

### Story 1.5: Design system — tokens, temas claro/escuro e componentes de estado

As a arquiteto,
I want uma identidade visual consistente com indicadores de estado claros,
So that a bancada comunique competência técnica e o estado do agente de forma inequívoca.

**Acceptance Criteria:**

**Given** o tema Tailwind + shadcn/ui
**When** aplico os tokens do DESIGN.md
**Then** estão disponíveis paleta de marca/apoio/estado, variantes acessíveis (cyanText `#0E7490`, fills nível-700) e tokens de foco; tipografia Inter + JetBrains Mono (pesos 400/500); spacing base-4; elevation; rounded (8px) — com temas **claro e escuro** alternáveis (UX-DR1, FR-20).

**Given** o componente `MascotCore`
**When** o agente muda de estado
**Then** o núcleo reflete os 6 estados (Ocioso/Pensando/Ativo/Aguardando/Concluído/Erro) por cor + ícone + rótulo, com pulso em Pensando/Ativo
**And** sob `prefers-reduced-motion: reduce` o pulso e a animação de fluxo são desligados, mantendo o estado legível estaticamente.

**Given** o componente `StateBadge` e a taxonomia visual dos 7 Tipos de Bloco
**When** renderizo status/Blocos
**Then** o `StateBadge` usa fill nível-700 + texto branco no tema claro e sempre acompanha rótulo+ícone (cor não é o único sinal); cada Tipo de Bloco tem cor de borda/ícone/forma determinísticos (disciplina do ciano: só Gatilho e Ação recebem ciano) (UX-DR5, UX-DR11).

### Story 1.6: Bancada do Builder — navegação, layout de 3 zonas e entrada em linguagem natural

As a arquiteto,
I want uma bancada com navegação clara e entrada conversacional,
So that eu possa descrever e refinar um agente numa única conversa.

**Acceptance Criteria:**

**Given** o app `apps/web`
**When** acesso o workspace
**Then** há navegação primária para **Harnesses**, **Builder**, **Operação** e **Workspace** (UX-DR12), com a lista de Harnesses exibindo estado vazio guiado ("descreva seu primeiro agente" — first-run) (UX-DR14).

**Given** o Builder aberto
**When** visualizo o layout
**Then** há 3 zonas — Conversa (esquerda), Cards/Inspetor do Bloco (centro), Fluxo & Contexto + MascotCore (direita) (UX-DR13)
**And** em larguras estreitas ou zoom 200–400% as zonas colapsam para empilhadas/abas, sem scroll bidirecional nem corte de conteúdo (UX-DR16).

**Given** o `ChatComposer`
**When** digito uma descrição ou refino em PT-BR
**Then** a entrada suporta refino contínuo na mesma conversa; a microcopy segue a voz técnica/colega sênior e o glossário usa os termos exatos do PRD (Harness, Bloco, Modelo de IA, Canal, Modo de Teste) (UX-DR3, UX-DR19, FR-14).

### Story 1.7: Apresentação do Harness em cards e fluxo visual

As a arquiteto,
I want ver a proposta da IA Arquiteta como cards e como fluxo,
So that eu entenda cada Bloco e o encadeamento antes de decidir.

**Acceptance Criteria:**

**Given** uma proposta de Harness gerada (Story 1.4)
**When** a bancada a exibe
**Then** cada Bloco aparece como `BlockCard` com ícone do Tipo, título, badge de Modelo (mono), justificativa de 1 linha e borda colorida por Tipo; Blocos "sem LLM" não exibem badge de modelo (UX-DR2, FR-2).

**Given** a vista de fluxo (ReactFlow)
**When** visualizo o Harness
**Then** os `FlowNode` renderizam forma/cor/ícone por Tipo (taxonomia autoritativa), a ordem e as dependências de dados são visíveis, e a vista é read-first (não editor de arestas); clicar num nó foca o Bloco no centro (UX-DR7, FR-2, FR-14).

**Given** a exigência de acessibilidade do canvas
**When** navego por teclado/leitor de tela
**Then** há uma alternativa não-canvas (lista navegável dos Blocos espelhando o fluxo, Enter foca o Bloco) (UX-DR7, UX-DR16).

### Story 1.8: Aprovação e customização por Bloco

As a arquiteto,
I want aprovar, trocar o modelo ou repensar cada Bloco,
So that eu entregue o agente com a minha assinatura, com controle total.

**Acceptance Criteria:**

**Given** um `BlockCard` proposto
**When** interajo com suas ações
**Then** posso (A) **Aprovar**, (B) **Trocar modelo** via `ModelSelector`, (C) **Repensar** — que gera uma alternativa só daquele Bloco sem descartar os já aprovados (FR-3, UX-DR2).

**Given** o `ModelSelector`
**When** o abro num Bloco
**Then** ele lista Modelos agrupados por Provider com dica de custo/latência relativa; a troca afeta só aquele Bloco (FR-4); por teclado, setas navegam, Esc fecha e devolve o foco ao gatilho (UX-DR4, UX-DR16).

**Given** um Harness em revisão
**When** verifico a elegibilidade de publicação
**Then** o Harness só fica elegível quando **todos** os Blocos estão aprovados (FR-3)
**And** o estado por Bloco progride `proposto → (aprovado | modelo-trocado | repensando)`.

## Epic 2: Execução & Modo de Teste do Harness

O arquiteto roda o Harness aprovado em Modo de Teste com dados simulados e vê cada Bloco executar ao vivo (entrada/saída/status), com memória por conversa disponível aos Blocos de Contexto.

**FRs:** FR-5, FR-6, FR-15 · **UX-DRs:** 7 (estado vivo no FlowNode), 8 (LogLine), 14 (padrões de estado), 15 (streaming).

### Story 2.1: Schema de execução e memória por conversa

As a desenvolvedor da RobbIA,
I want as tabelas de execução e de conversa persistidas,
So that o Runtime tenha estado durável e a memória por conversa exista.

**Acceptance Criteria:**

**Given** o package `@robbia/db`
**When** estendo o schema com o necessário a este épico
**Then** existem `executions` (uma execução de Harness, com status) e `execution_steps` (estado e I/O por Bloco — base de retry/replay e do Modo de Teste), em `snake_case` plural, PK UUID v7, timestamps `timestamptz` UTC.

**Given** a necessidade de memória por conversa
**When** defino as tabelas
**Then** existem `conversations` e `messages` isoladas por conversa/cliente (FK `conversation_id`), sem perfil global nem coluna vetorial (pgvector adiado).

**Given** o schema estendido
**When** gero e aplico a migration
**Then** o Postgres reflete as novas tabelas e os schemas Zod correspondentes (`ExecutionSchema`, `ExecutionStepSchema`, `MessageSchema`) existem em `@robbia/shared`.

### Story 2.2: Harness Runtime — máquina de estado com retry

As a arquiteto,
I want que o Harness execute seus Blocos em sequência com estado e tratamento de erro,
So that o agente rode de forma confiável e nunca avance silenciosamente após uma falha.

**Acceptance Criteria:**

**Given** o app `apps/runtime` consumindo o job `harness.execute` (pg-boss)
**When** uma execução inicia
**Then** os Blocos executam na ordem definida, a saída de um Bloco fica disponível aos seguintes, e cada passo é persistido em `execution_steps` (estado durável).

**Given** uma falha transitória num Bloco
**When** o Runtime a captura
**Then** aplica a política de retry central (até 3 tentativas, backoff exp. ≈1s→4s→16s, configurável por Bloco); esgotadas as tentativas, marca erro com status registrado e **não** completa Ação Irreversível, escalando ao humano (FR-5).

**Given** o contrato de erro
**When** um Bloco retorna resultado
**Then** usa o resultado discriminado `{ ok: true, data } | { ok: false, error: { code, message, retriable } }`, distinguindo transitório de permanente
**And** Blocos determinísticos ("sem LLM": Contexto/RPA/Verificação quando aplicável) executam sem chamar Modelo de IA.

### Story 2.3: Memória por conversa

As a arquiteto,
I want que o agente recupere o histórico da conversa,
So that um Bloco de Contexto possa responder com base no que já foi dito.

**Acceptance Criteria:**

**Given** o package `@robbia/memory` (store/retrieve)
**When** mensagens de uma conversa são processadas
**Then** ficam persistidas e podem ser recuperadas por um Bloco de Contexto na **mesma** conversa (FR-15).

**Given** duas conversas distintas
**When** um Bloco de Contexto recupera memória
**Then** a memória é isolada por conversa/cliente — uma conversa nunca enxerga o histórico de outra.

**Given** o escopo do MVP
**When** verifico a memória
**Then** não há perfil de usuário persistente entre conversas nem busca semântica/vetorial.

### Story 2.4: Streaming ao vivo da execução (WebSocket)

As a arquiteto,
I want ver cada Bloco executar em tempo real,
So that eu acompanhe e confie no que o agente está fazendo.

**Acceptance Criteria:**

**Given** o `apps/gateway` (Fastify 5 + WebSocket, lado de streaming)
**When** o Runtime emite eventos de execução
**Then** os eventos `execution.step.updated`, `execution.completed` e `agent.state.changed` são transmitidos à UI com latência percebida < ~2s (UX-DR15, NFR-5).

**Given** o componente `LogLine`
**When** a execução transmite
**Then** o log é append-only por execução/Bloco (entrada/saída/status), mono para dados, com dados sensíveis redatados (nunca exibe credencial), e é `role="log"` navegável sob demanda — não aria-live (UX-DR8, UX-DR16).

**Given** o `FlowNode` e o `MascotCore`
**When** o estado de um Bloco/agente muda
**Then** o nó e o núcleo refletem o estado ao vivo (`pendente → executando → ok | retry n/3 | erro-escalado`) (UX-DR7).

**Given** uma queda de conexão WebSocket
**When** a UI perde o stream
**Then** mostra banner não-bloqueante "Reconectando…" (`role="status"`) e, ao reconciliar, anuncia só "N eventos sincronizados" — sem perder eventos nem inundar o leitor de tela (UX-DR15).

### Story 2.5: Modo de Teste com dados simulados

As a arquiteto,
I want executar o Harness em Modo de Teste antes de publicar,
So that eu valide o comportamento sem risco e com a minha assinatura.

**Acceptance Criteria:**

**Given** um Harness com todos os Blocos aprovados
**When** aciono o Modo de Teste a partir do Builder
**Then** o Harness executa com dados simulados, bloco a bloco, e cada Bloco mostra entrada, saída e status (ok/erro) em tempo real via o streaming da Story 2.4 (FR-6).

**Given** um Bloco que dispararia uma Ação Irreversível
**When** o teste o alcança
**Then** a Ação Irreversível real **não** é disparada sem confirmação (default seguro = não-executar).

**Given** uma falha de Bloco durante o teste
**When** ela ocorre
**Then** o overlay de Teste mostra o retry (n/3) e, persistindo, o erro escalado — oferecendo repensar/ajustar o Bloco sem recriar o Harness.

## Epic 3: Segurança & Operação 24/7 com Trust Engine

O arquiteto publica o Harness na VPS, opera 24/7 com logs auditáveis ao vivo, credenciais isoladas do LLM (CES) e Ações Irreversíveis sob confirmação humana resiliente.

**FRs:** FR-11, FR-12, FR-13, FR-19 · **UX-DRs:** 9 (ConfirmDialog), 10 (CredentialPrompt), 14 (estados), 17 (Trust & Confirmation), 20 (Operação/Workspace) · **NFR:** Segurança P0, Observabilidade, Portabilidade/Deploy.

### Story 3.1: CES — microsserviço de isolamento de credenciais

As a arquiteto,
I want que credenciais fiquem isoladas do LLM,
So that segredos de cliente nunca vazem em prompt, log ou resposta da IA.

**Acceptance Criteria:**

**Given** o app `apps/ces` (microsserviço dedicado) e a tabela `credentials` (apenas referência; segredo nunca no banco de domínio)
**When** uma credencial é cadastrada
**Then** é guardada com envelope encryption (AES-GCM), com a chave mestra fora do banco (env/secret do host), e `db.credentials` guarda só a referência (FR-11).

**Given** um Bloco de execução (RPA/Ação) que autentica
**When** o worker precisa da credencial
**Then** o CES expõe apenas `inject(ref, ctx)` ao worker em runtime; `provider`, `architect`, `runtime` e os LLMs **nunca** recebem o segredo, e nada de credencial aparece em prompt, log ou resposta.

**Given** uma credencial expirada/rotacionada
**When** uma autenticação falha em runtime
**Then** o CES detecta a falha e sinaliza re-credenciamento, em vez de prosseguir com credencial inválida.

### Story 3.2: CredentialPrompt e status de credenciais no Workspace

As a arquiteto,
I want ser solicitado a configurar uma credencial faltante no momento certo,
So that o fluxo não avance sem o acesso necessário e sem expor segredos.

**Acceptance Criteria:**

**Given** um Bloco que requer uma credencial ainda não configurada
**When** o fluxo (Builder/Teste) o alcança
**Then** o `CredentialPrompt` **pausa o fluxo** e solicita a credencial antes de permitir teste/execução, encaminhando-a ao CES (UX-DR10, FR-11, UJ-1 edge case).

**Given** a tela Workspace › Credenciais
**When** visualizo as credenciais
**Then** vejo apenas status (`configurada` / `expirada` / `faltando`) — a UI **nunca** exibe o segredo em claro (UX-DR17).

### Story 3.3: Publicar e operar o Harness 24/7

As a arquiteto,
I want publicar o Harness e operá-lo continuamente,
So that o agente rode 24/7 sem eu reconstruí-lo.

**Acceptance Criteria:**

**Given** um Harness validado em Modo de Teste
**When** clico em Publicar
**Then** o Harness vai do Modo de Teste para produção **sem reconstruir** o Harness (FR-12).

**Given** um agente em produção
**When** preciso intervir
**Then** posso **pausar** o agente e **editar um Bloco isolado** sem recriar o Harness.

**Given** o deploy do núcleo
**When** subo a stack
**Then** `docker-compose.yml` sobe o núcleo Linux (web, gateway, runtime, ces, postgres) num comando (NFR-7), e o agente publicado processa execuções reais.

### Story 3.4: Operação — dashboard e logs auditáveis ao vivo

As a arquiteto,
I want um painel de operação com logs ao vivo,
So that eu monitore a saúde dos agentes e audite cada decisão.

**Acceptance Criteria:**

**Given** a surface **Operação**
**When** a abro
**Then** vejo um dashboard com a lista de execuções, o estado dos agentes (`MascotCore`/`StateBadge`) e a saúde geral, com estados vazio/erro explícitos (UX-DR20, UX-DR14).

**Given** uma execução em produção
**When** acompanho seus logs
**Then** os logs de cada execução/decisão ficam disponíveis em tempo real (reutilizando o streaming da Story 2.4) e são **auditáveis** (trilha de decisão persistida) (FR-12, NFR-5).

### Story 3.5: Trust Engine — confirmação de Ação Irreversível

As a arquiteto,
I want que Ações Irreversíveis exijam minha confirmação,
So that velocidade nunca atropele a segurança (nenhuma ação de alto impacto dispara sozinha).

**Acceptance Criteria:**

**Given** a política do Trust Engine (configurável por Bloco/Harness)
**When** um Bloco vai disparar uma Ação Irreversível (envio externo/em massa, lançamento financeiro, deleção)
**Then** por padrão exige confirmação humana antes de executar; quais Ações são autônomas vs. confirmadas é configurável (FR-13).

**Given** uma Ação Irreversível pendente
**When** entra na fila de confirmação (Operação)
**Then** aparece com o `ConfirmDialog` descrevendo a ação concreta, com focus trap, Esc cancela, foco inicial no botão seguro e default = não-executar (UX-DR9, UX-DR17).

**Given** o guardião não confirma a tempo
**When** o timeout (padrão 24h, configurável) expira
**Then** a ação é **cancelada/enfileirada para revisão**, nunca executada às cegas nem pendente para sempre (FR-19).

**Given** o Canal de mensagens pode estar fora
**When** preciso confirmar
**Then** a confirmação é possível pelo **painel/log** (Operação), não dependendo unicamente de um Canal — evitando dependência circular com a resiliência de Canal (FR-19).

## Epic 4: Canais & Ações Externas em Produção (WhatsApp, Telegram + API HTTP)

O arquiteto conecta Evolution (WhatsApp) e Telegram; o agente recebe e responde mensagens reais 24/7, com ordenação por conversa e resiliência de Provider/Canal — realizando UJ-1 ponta a ponta — e executa ações em sistemas com API via Bloco de Ação HTTP genérico (built-in), evitando RPA quando há API.

**FRs:** FR-10, FR-16, FR-17, FR-18, FR-22 · **UX-DRs:** 14 (estados), 15 (serialização visível), 20 (Workspace Canais/Providers, cue de failover) · **NFR:** Confiabilidade, Concorrência.

### Story 4.1: Gateway de Canais — Evolution API e Telegram

As a arquiteto,
I want conectar WhatsApp (Evolution) e Telegram,
So that o agente receba e responda mensagens reais.

**Acceptance Criteria:**

**Given** o `apps/gateway` (lado de webhooks) e o package `@robbia/channels` (`evolution.ts`, `telegram.ts`)
**When** uma mensagem chega por qualquer Canal
**Then** um Bloco de **Gatilho** dispara o Harness (job `harness.execute`) e um Bloco de **Ação** envia a resposta pelo **mesmo** Canal de origem (FR-10).

**Given** a tela Workspace › Canais
**When** conecto um Canal
**Then** o fluxo é por QR (Evolution) ou token (Telegram), com estados `pareando → conectado/expirado`; os tokens são guardados via CES; conectar **não** requer verificação/aprovação de plataforma oficial (Evolution self-hosted) (UX-DR20, FR-10).

**Given** o webhook recebido
**When** o gateway o processa
**Then** o payload é validado por Zod na fronteira antes de enfileirar (parse, don't validate).

### Story 4.2: Ordenação e concorrência por conversa

As a arquiteto,
I want que mensagens em rajada sejam tratadas em ordem,
So that o agente não duplique respostas nem corrompa a memória.

**Acceptance Criteria:**

**Given** mensagens em rajada na **mesma** conversa
**When** chegam quase simultaneamente
**Then** são serializadas via lock/fila por `conversationId` (advisory lock) — sem race de leitura/escrita na memória (FR-15) e sem respostas duplicadas/fora de ordem (FR-16).

**Given** conversas **distintas**
**When** executam ao mesmo tempo
**Then** rodam em paralelo sem interferência.

**Given** a UI de Operação
**When** observo execuções concorrentes
**Then** ela reflete a serialização por conversa, sem respostas duplicadas/fora de ordem visíveis (UX-DR15).

### Story 4.3: Resiliência de Provider (failover)

As a arquiteto,
I want que a queda de um Provider não trave o agente,
So that o agente 24/7 sobreviva a indisponibilidades de LLM.

**Acceptance Criteria:**

**Given** uma falha de Provider
**When** o Runtime a avalia
**Then** distingue transitória (rate limit/timeout → retry com backoff) de permanente (chave inválida → erro/escala) (FR-17).

**Given** um Bloco com Modelo de IA de fallback configurado
**When** o Provider primário está indisponível
**Then** o Bloco cai para o fallback e o agente não trava indefinidamente.

**Given** um failover ocorrido
**When** o operador acompanha
**Then** vê o cue "Provider X indisponível → fallback Y" no log/entrada, e a saúde/chaves dos Providers ficam visíveis em Workspace › Providers (UX-DR20, FR-9).

### Story 4.4: Resiliência de Canal

As a arquiteto,
I want que mensagens não se percam quando um Canal cai,
So that nenhuma interação do cliente seja silenciosamente descartada.

**Acceptance Criteria:**

**Given** a desconexão ou banimento de um Canal (Evolution/Telegram)
**When** ocorre
**Then** é detectada e alertada ao operador (Notificações/Operação) (FR-18).

**Given** mensagens recebidas durante a indisponibilidade
**When** o Canal está fora
**Then** são retidas em fila e reprocessadas na reconexão — não se perdem silenciosamente (FR-18).

### Story 4.5: Bloco de Ação HTTP/API genérico (built-in)

As a arquiteto,
I want um Bloco de Ação que chame uma API genérica,
So that o agente integre sistemas que têm API sem recorrer a RPA.

**Acceptance Criteria:**

**Given** o catálogo built-in `packages/skills` e o job `action.http`
**When** configuro um Bloco de Ação HTTP
**Then** posso definir método (GET/POST/PUT/PATCH/DELETE), URL, headers, query e corpo; a autenticação (API key / bearer / basic) é resolvida via CES quando necessária, sem credencial no LLM/log (FR-22, FR-11).

**Given** uma chamada executada
**When** a API responde
**Then** o resultado (status + corpo) é validado/normalizado e fica disponível aos Blocos seguintes; falhas seguem a política de retry (FR-5), distinguindo transitório de permanente.

**Given** uma chamada que é uma Ação Irreversível (ex.: POST que cria/deleta/transaciona)
**When** o Bloco vai executá-la
**Then** respeita o Trust Engine (confirmação humana / timeout 24h) antes de disparar (FR-13/FR-19).

**Given** um sistema-alvo que expõe API documentada
**When** a IA Arquiteta decompõe o pedido
**Then** propõe um Bloco de Ação HTTP **em vez de** RPA (FR-22, FR-1).

## Epic 5: RPA — Automação de Sistemas sem API (web + desktop Windows)

O agente automatiza sistemas sem API — web (Playwright/Docker) e desktop Windows nativo (FlaUI, ex.: SISCOM/Kmov) — com verificação visual por LLM e handoff em desafio interativo — realizando UJ-2 ponta a ponta.

**FRs:** FR-7, FR-8, FR-21 · **UX-DRs:** 18 (RPA modality cues + verificação visual), 16 (a11y) · **NFR:** Segurança P0 (sandbox dual isolado/efêmero), Portabilidade (nó Windows) · **Spikes:** lib RPA web (Stagehand 2.0/Playwright MCP); abordagem desktop (FlaUI vs visão); formato do ambiente Windows isolado.

### Story 5.1: Contrato rpa-core e verificação visual por LLM

As a arquiteto,
I want que o resultado de um Bloco RPA seja confirmado por leitura da tela,
So that o agente só avance quando a ação realmente deu certo.

**Acceptance Criteria:**

**Given** o package `@robbia/rpa-core` (`contract.ts`, `verify.ts`) compartilhado por ambos os ambientes de RPA
**When** defino o contrato de job RPA
**Then** existe um contrato único (`rpa.web`/`rpa.desktop`) que o Runtime enfileira de forma agnóstica de ambiente.

**Given** um Bloco de Verificação com um screenshot (página ou janela)
**When** o LLM o analisa
**Then** retorna um veredito estruturado (sucesso/falha + motivo); um veredito de falha impede o avanço para Blocos dependentes (FR-8).

**Given** a colisão de segurança FR-8×FR-11
**When** um screenshot é capturado
**Then** é capturado **pós-autenticação** ou tem campos sensíveis mascarados/redatados **antes** de ir ao LLM — nenhuma credencial em claro chega ao Modelo de IA (FR-8, FR-11).

### Story 5.2: RPA web — worker isolado em Docker

As a arquiteto,
I want automatizar sistemas web sem API,
So that o agente opere ERPs/portais que não expõem API.

**Acceptance Criteria:**

**Given** o `apps/rpa-web-worker` + `packages/rpa-web` (Stagehand 2.0 sobre Playwright + Playwright MCP, conforme spike)
**When** um job `rpa.web` executa
**Then** roda em container Docker Linux isolado, com **rede restrita**, destruído ao final; screenshots e dados extraídos são deletados após o processamento, salvo persistência explícita (FR-7, NFR-1).

**Given** uma tarefa web ampla
**When** o Bloco RPA atua
**Then** cobre navegação multi-página, preenchimento/submissão de formulários, upload/download de arquivos e extração estruturada de dados (scraping), autenticando via CES (FR-7).

**Given** uma falha ou um desafio interativo
**When** ocorre durante a execução
**Then** sequências de múltiplos passos aplicam retry (FR-5) e, persistindo, marcam erro sem completar Ação Irreversível; 2FA/captcha/OTP pausam o Bloco e acionam handoff humano em vez de falhar silenciosamente (FR-7).

### Story 5.3: RPA desktop Windows nativo — worker no nó Windows

As a arquiteto,
I want automatizar aplicativos desktop Windows nativos,
So that o agente opere sistemas legados sem API como SISCOM e Kmov.

**Acceptance Criteria:**

**Given** o `apps/rpa-desktop-worker` (Bun) consumindo `rpa.desktop` e o helper `workers/rpa-desktop-host` (.NET, FlaUI/UIA3) via IPC/CLI (conforme spike)
**When** um job `rpa.desktop` executa
**Then** controla um aplicativo desktop Windows: localiza janela/elemento, clica, digita, navega telas, lê valores e captura screenshot para verificação (FR-8); quando o app não expõe árvore UIA, usa o fallback de visão/computer-use (FR-21).

**Given** o ambiente de execução
**When** o worker desktop roda
**Then** ocorre num ambiente Windows isolado/dedicado (host/VM/contêiner), separado do sandbox Docker Linux, com artefatos efêmeros deletados após o processamento; `docker-compose.windows.yml` adiciona o nó Windows conectado ao mesmo Postgres/fila (FR-21, NFR-7).

**Given** autenticação e falha
**When** o Bloco desktop atua
**Then** autentica via CES (segredo nunca no LLM), aplica a mesma política de retry/escalonamento e o handoff em desafio interativo (2FA/OTP), e não completa Ação Irreversível em falha/ambiguidade (FR-21).

### Story 5.4: RPA Modality Cues e verificação visual na UI

As a arquiteto,
I want reconhecer a modalidade de um Bloco RPA e ver a verificação,
So that eu entenda o que o agente automatiza e confie no resultado.

**Acceptance Criteria:**

**Given** um Bloco RPA (web ou desktop Windows)
**When** ele aparece no `BlockCard` e no `FlowNode`
**Then** exibe ícone/badge distinto por modalidade (web Playwright vs desktop Windows nativo) (UX-DR18, FR-21).

**Given** uma verificação visual concluída
**When** o resultado é registrado
**Then** o screenshot capturado (página ou janela) aparece no log com o veredito estruturado do LLM (sucesso/falha + motivo) e dados sensíveis redatados (UX-DR18, FR-8).

**Given** um desafio interativo (2FA/captcha)
**When** bloqueia a automação
**Then** o Bloco pausa e sinaliza **handoff humano** explícito na UI, em vez de falhar silenciosamente (UX-DR18, FR-7/FR-21).

## Epic 6: Conhecimento (RAG) & Memória avançada

O agente responde a partir de documentos próprios e lembra entre conversas: Base de Conhecimento por agente (ingestão → embeddings → `pgvector`), recuperação semântica no Bloco de Contexto com atribuição de fonte, e memória híbrida (dense+sparse) com perfis persistentes globais. *(Update v3 — elevado ao MVP.)*

**FRs:** FR-23, FR-24, FR-25, FR-29 · **Spikes:** modelo de embedding + chunking + busca híbrida. **Depende de:** Provider (Epic 1), Runtime/Contexto (Epic 2), `pgvector` (extensão Postgres).

### Story 6.1: Embeddings via Provider Abstraction (`embed()`)

As a desenvolvedor,
I want gerar embeddings por uma interface única de Provider,
So that RAG e memória híbrida tenham vetores sem lock-in e com caminho local.

**Acceptance Criteria:**

**Given** a interface `LLMProvider` (`@robbia/provider`)
**When** adiciono a capacidade de embeddings
**Then** existe `embed(texts, model)` que retorna vetores via adaptador, com ao menos um caminho 100% local (Ollama) (FR-25).

**Given** um modelo de embedding configurável
**When** gero embeddings
**Then** a dimensão do vetor é exposta/registrada, para o índice `pgvector` ser criado coerente; trocar de modelo não corrompe dados existentes.

**Given** uma falha transitória do Provider
**When** ela ocorre
**Then** aplica a política de retry central (reusa `withRetry`), distinguindo transitório de permanente.

### Story 6.2: Schema de Conhecimento e Memória (pgvector)

As a desenvolvedor,
I want as tabelas de Conhecimento e Memória persistidas com suporte vetorial,
So that ingestão, recuperação e perfis tenham base durável.

**Acceptance Criteria:**

**Given** o `@robbia/db` e a extensão `pgvector` habilitada
**When** defino o schema
**Then** existem `knowledge_bases`, `documents`, `chunks` (com coluna `embedding vector` + texto + atribuição de fonte) e `memory_profiles` (perfil por cliente/usuário) — `snake_case`, UUID v7, `timestamptz`, isolados por Workspace.

**Given** o índice vetorial
**When** crio a migration
**Then** há índice de similaridade (`ivfflat`/`hnsw`) na coluna `embedding`, com a dimensão do modelo de embedding configurada.

### Story 6.3: Ingestão de documentos (chunking + indexação)

As a arquiteto,
I want adicionar documentos à Base de Conhecimento de um agente,
So that ele possa responder a partir deles.

**Acceptance Criteria:**

**Given** o `@robbia/knowledge`
**When** adiciono um documento (PDF/Markdown/TXT/URL)
**Then** ele é extraído, dividido em trechos (chunking), embeddado (Story 6.1) e indexado em `pgvector`, com atribuição de fonte (documento + posição) (FR-23).

**Given** a mesma fonte reprocessada
**When** rodo a ingestão de novo
**Then** é idempotente — não duplica trechos.

**Given** dois agentes/Workspaces distintos
**When** consulto
**Then** uma Base não enxerga documentos/trechos da outra (isolamento).

### Story 6.4: Recuperação semântica no Bloco de Contexto

As a arquiteto,
I want que o Bloco de Contexto recupere trechos relevantes da Base de Conhecimento,
So that o agente responda fundamentado e cite a origem.

**Acceptance Criteria:**

**Given** um Bloco de Contexto com fonte de conhecimento configurada
**When** o Runtime o executa com uma consulta
**Then** recupera os top-k trechos mais relevantes (similaridade vetorial) com **atribuição de fonte**, disponibilizando-os ao Bloco seguinte (FR-24).

**Given** a coexistência com a memória de conversa
**When** o Bloco recupera
**Then** combina (ou seleciona) memória de conversa (FR-15) e conhecimento, sem expor credenciais nos trechos.

### Story 6.5: Memória híbrida (dense+sparse) e perfis globais

As a arquiteto,
I want memória entre conversas com busca híbrida,
So that o agente lembre do cliente e recupere o mais relevante.

**Acceptance Criteria:**

**Given** um `memory_profile` por cliente/usuário
**When** um Bloco de Contexto recupera memória
**Then** pode recuperar **entre conversas** do mesmo cliente (perfil persistente), isolado por Workspace (FR-29).

**Given** uma consulta de memória
**When** a recuperação executa
**Then** combina busca **vetorial (dense)** e **lexical (sparse)** e devolve os trechos ranqueados por relevância.

## Epic 7: Skills & Connectors (MCP)

As ações do agente viram um catálogo de Skills plugáveis: catálogo built-in (`SKILL.md` + `TOOLS.json`) — generalizando a Ação HTTP (Story 4.5) — e Connectors que conectam servidores **MCP** de 1 clique (tools externas viram Skills), com a IA Arquiteta ciente do catálogo ao planejar. *(Update v3 — elevado ao MVP.)*

**FRs:** FR-26, FR-27, FR-28 · **Spike:** SDK/runtime MCP. **Depende de:** IA Arquiteta (Epic 1), Runtime/Ação (Epic 2/4), CES (Epic 3).

### Story 7.1: Catálogo de Skills built-in (loader + validação)

As a desenvolvedor,
I want um catálogo de Skills declarativas carregável,
So that capacidades sejam adicionadas sem recompilar o Runtime.

**Acceptance Criteria:**

**Given** o `@robbia/skills`
**When** carrego o catálogo do Workspace
**Then** cada Skill é declarada por `SKILL.md` (descrição/uso) + `TOOLS.json` (schema das tools) e fica disponível por nome; a Ação HTTP (Story 4.5) é registrada como a primeira Skill built-in (FR-26, FR-22).

**Given** uma invocação de Skill com argumentos
**When** vou executar
**Then** os argumentos são validados contra o schema da tool (Zod); inválido é rejeitado antes de executar.

### Story 7.2: Bloco de Ação invoca Skills do catálogo

As a arquiteto,
I want que um Bloco de Ação execute qualquer Skill do catálogo,
So that o agente use capacidades plugáveis de forma uniforme.

**Acceptance Criteria:**

**Given** um Bloco de Ação referenciando uma Skill por nome
**When** o Runtime o executa
**Then** resolve a Skill no catálogo, valida os argumentos e executa; o resultado fica disponível aos Blocos seguintes; falhas seguem a política de retry (FR-5) e Ações Irreversíveis respeitam o Trust Engine (FR-13/FR-19).

**Given** uma Skill inexistente/indisponível
**When** o Bloco tenta executá-la
**Then** marca erro de capacidade ausente (não avança silenciosamente).

### Story 7.3: Connectors — cliente MCP + ponte tool→Skill

As a arquiteto,
I want conectar servidores MCP com 1 clique,
So that tools externas virem Skills sem programar integração.

**Acceptance Criteria:**

**Given** o `@robbia/mcp-adapters`
**When** conecto um servidor MCP (config + credencial via CES)
**Then** as tools expostas pelo servidor passam a aparecer como Skills no catálogo, invocáveis por Blocos de Ação como qualquer Skill (mesmo contrato de validação/erro/retry) (FR-27).

**Given** um Connector conectado
**When** o desconecto
**Then** suas tools saem do catálogo sem quebrar Harnesses; Blocos que as usavam marcam capacidade ausente.

**Given** uma tool MCP que exige credencial
**When** é invocada
**Then** o segredo é injetado via CES (nunca no LLM/log).

### Story 7.4: IA Arquiteta ciente de Skills/capacidades

As a arquiteto,
I want que a IA Arquiteta conheça as Skills disponíveis,
So that ela proponha só o que existe e peça esclarecimento quando faltar capacidade.

**Acceptance Criteria:**

**Given** o catálogo de Skills (built-in + MCP conectado)
**When** a IA Arquiteta decompõe um pedido
**Then** o system-prompt recebe o catálogo e ela propõe Blocos de Ação **apenas** para Skills existentes (FR-28).

**Given** um pedido que exige capacidade ausente (ex.: responder de documentos sem Base de Conhecimento, ou integração não conectada)
**When** a IA Arquiteta planeja
**Then** **pede esclarecimento / sinaliza a lacuna** (estende FR-1 AC4) em vez de inventar um Harness que não roda.
