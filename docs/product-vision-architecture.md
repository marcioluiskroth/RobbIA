# RobbIA — Conversational Agent Builder

> A Bancada de Trabalho do Arquiteto de Agentes de IA
> Documento de Arquitetura e Visão de Produto • v2.0 • Junho 2026 • Licença MIT
> Em homenagem ao primeiro robô da literatura — Robbie, de Isaac Asimov (1940)

## Resumo Executivo

RobbIA é uma **plataforma open-source de construção de agentes de automação por conversa**, posicionada como a ferramenta indispensável do **Arquiteto de Agentes de IA** — a profissão emergente de quem projeta, constrói e opera agentes para empresas. O cliente (ou o próprio arquiteto) descreve em linguagem natural o que deseja automatizar; uma **IA Arquiteta** decompõe o pedido em um **harness** de blocos executáveis — combinando Skills, MCPs, RPA com Playwright e integrações de API — e o profissional refina, escolhe o modelo de IA em cada bloco e aprova. A IA gera o rascunho em segundos; o arquiteto assina e entrega. O resultado é um agente rodando em VPS, acessível via WhatsApp, Telegram, Web ou API, operado em painel multi-cliente.

---

## 1. Visão Geral do Produto

Uma nova profissão está nascendo: o **Arquiteto de Agentes de IA**. Engenheiro de IA já é o cargo que mais cresce no Brasil segundo o LinkedIn, e 94% dos líderes de engenharia relatam lacunas críticas de especialistas em IA agêntica. Mas as ferramentas desse profissional são improvisadas: frameworks de código (LangChain, CrewAI) que consomem tempo em infraestrutura, ou plataformas no-code de usuário final (Lindy, Zapier) sem camada profissional.

A RobbIA é a bancada de trabalho dessa profissão: o cliente descreve o que quer automatizar em linguagem natural, a IA Arquiteta projeta o harness completo em segundos, e o profissional refina, escolhe o modelo de IA em cada bloco, valida e entrega — operando todos os seus clientes em um painel só.

### 1.1 Problema que resolve
- As ferramentas atuais do profissional são frameworks de código — produtividade baixa, sem camada de negócio.
- Plataformas no-code de usuário final não servem ao profissional: sem multi-cliente, white-label, RPA ou governança.
- Não existe a bancada integrada do Arquiteto de Agentes: do briefing do cliente ao deploy e à operação.
- A formação não acompanha a demanda: universidades e treinamentos tradicionais não dão conta do ritmo do mercado.

### 1.2 Diferencial central — o que nenhuma outra ferramenta faz hoje
- A IA Arquiteta gera o rascunho do harness em segundos — horas de trabalho viram minutos.
- O profissional refina, troca o modelo de IA por bloco e assina a entrega: controle total.
- **RPA com Playwright integrado:** automatiza até sistemas legados sem API.
- **Painel multi-cliente com white-label:** todos os projetos do arquiteto em um lugar só.
- **Marketplace + certificação:** o arquiteto monetiza templates e valida sua credencial.

### 1.3 Para quem: o Arquiteto de Agentes de IA

O usuário central é o profissional que vive de construir agentes — consultores de automação, desenvolvedores RPA em transição, analistas de TI e integradores. Usuários finais não-técnicos continuam atendidos pela mesma experiência conversacional, mas o produto e o go-to-market priorizam o profissional, que traz consigo os próprios clientes — um **modelo B2B2B** em que cada arquiteto adquirido representa de 5 a 20 empresas geradoras de receita recorrente.

---

## 2. Conceitos Fundamentais

### 2.1 O que é um Harness

Um **harness** é a estrutura-mãe que organiza e executa um agente de automação. É composto por uma sequência ordenada de **blocos**, cada um com responsabilidade específica. O harness garante que os dados fluam corretamente entre os blocos, que erros sejam tratados, e que cada bloco use o recurso correto (LLM, skill, MCP, RPA ou API).

### 2.2 Tipos de Blocos

| Bloco | Função | Usa LLM? | Exemplo prático |
|---|---|---|---|
| **Gatilho** | Inicia o harness ao detectar um evento | Não | Mensagem no WhatsApp, webhook, cron |
| **Contexto** | Recupera memória, histórico e dados relevantes | Sim* | Busca conversas anteriores, perfil do cliente |
| **Decisão** | Classifica, raciocina e define próxima etapa | Sim | Classifica intenção, decide escalada ou resposta |
| **Resposta** | Gera conteúdo: texto, dados, relatório | Sim | Redigir e-mail, gerar resumo, criar proposta |
| **RPA** | Executa ação em sistema web via Playwright | Sim* | Preencher formulário ERP, lançar nota fiscal |
| **Ação** | Executa comando externo sem raciocínio | Não | Enviar mensagem, salvar banco, chamar API |
| **Verificação** | Valida resultado antes de prosseguir | Sim* | Confirma se lançamento foi realizado com sucesso |

> `Sim*` = usa LLM apenas se necessário; pode operar com lógica determinística para reduzir custo.

### 2.3 A IA Arquiteta

A IA Arquiteta é o modelo responsável por **transformar a descrição do usuário em um harness estruturado**. Recebe o pedido em linguagem natural e produz uma proposta de blocos, com justificativas para cada escolha. **Não é o mesmo modelo que executa os blocos** — é uma instância separada, configurada com um system prompt especializado em decomposição de tarefas e design de fluxos de automação.

**Exemplo de interação** — Usuário: *"Quero um agente que receba pedidos de clientes pelo WhatsApp, verifique o estoque no sistema, e registre o pedido no ERP automaticamente."* A IA Arquiteta propõe:

1. **Gatilho:** WhatsApp MCP (sem LLM)
2. **Contexto:** recupera histórico do cliente (Gemini Flash)
3. **Decisão:** classifica pedido e extrai itens (Claude Sonnet)
4. **RPA:** consulta estoque no ERP via Playwright (sem LLM)
5. **Decisão:** verifica disponibilidade e define ação (Claude Haiku)
6. **RPA:** lança pedido no ERP via Playwright (sem LLM)
7. **Ação:** confirma pedido para cliente via WhatsApp (sem LLM)

---

## 3. Arquitetura Técnica

### 3.1 Camadas do Sistema

A plataforma é organizada em quatro camadas independentes e substituíveis:

| Camada | Responsabilidade | Tecnologia sugerida |
|---|---|---|
| **Provider Abstraction** | Normaliza chamadas para qualquer API de IA | TypeScript + adaptadores por provider |
| **Agent Runtime** | Executa blocos em sequência, gerencia estado e memória | Bun + PostgreSQL + pgvector |
| **RPA Engine** | Controla navegadores para automação web | Playwright + sandbox Docker |
| **Harness UI** | Interface conversacional de construção de agentes | Next.js 15 + React 19 + WebSocket |

### 3.2 Provider Abstraction Layer

Toda chamada a um modelo de IA passa por uma **interface única**, independentemente do provider. O usuário pode trocar de Claude para GPT, Gemini, DeepSeek ou um modelo local (Ollama) sem alterar nenhum outro bloco do harness.

**Providers suportados nativamente:**
- **Anthropic Claude** — claude-opus-4, claude-sonnet-4, claude-haiku-4
- **OpenAI** — gpt-4o, gpt-4o-mini, o1, o3
- **Google Gemini** — gemini-2.0-flash, gemini-2.5-pro
- **OpenRouter** — acesso unificado a 200+ modelos com uma única chave
- **Ollama** — modelos locais: Llama 3, Mistral, Qwen, DeepSeek-R1
- **DeepSeek** — deepseek-chat, deepseek-reasoner (custo ultra-baixo)

### 3.3 RPA Engine com Playwright

Permite ao harness interagir com sistemas web **sem API** — ERPs legados, portais governamentais, sistemas bancários, e-commerce. Usa Playwright rodando em container Docker isolado.

**Capacidades:** navegação e clique, preenchimento/submissão de formulários, upload/download, scraping estruturado, autenticação via CES, captura de screenshot para verificação visual, recuperação de erros, e **integração com decisão da IA** (o LLM analisa o screenshot e decide o próximo passo).

### 3.4 Sistema de Skills

Skills são capacidades pré-construídas que o harness pode usar em qualquer bloco. Cada skill é definida por um **`SKILL.md`** (descrição e instruções) e um **`TOOLS.json`** (definição das ferramentas expostas). A IA Arquiteta escolhe as skills relevantes automaticamente.

| Categoria | Skills incluídas |
|---|---|
| Memória e contexto | Busca semântica, resumo de histórico, extração de entidades, perfil de usuário |
| Comunicação | Formatação de mensagens, tradução, detecção de idioma, análise de sentimento |
| Documentos | Leitura de PDF/DOCX/XLSX, extração de tabelas, geração de relatórios |
| Dados e análise | SQL em linguagem natural, análise estatística, comparação de dados, alertas |
| Pesquisa web | Busca Google via MCP, leitura de páginas, extração de informações |
| Calendário e tarefas | Agendamento, criação de eventos, gestão de lembretes |
| Financeiro | Análise de documentos fiscais, conciliação, cálculo de comissões |
| CRM | Classificação de leads, follow-up automático, atualização de status |

### 3.5 MCP — Model Context Protocol

MCPs são conectores padronizados que permitem ao harness interagir com serviços externos. Usados principalmente nos blocos de **Ação** e **Gatilho**.

| MCP | Ações disponíveis |
|---|---|
| WhatsApp (Meta Cloud API) | Enviar/receber mensagens, mídia, templates, listas interativas |
| Telegram | Enviar mensagens, botões inline, arquivos, notificações |
| Gmail / Google Workspace | Ler, enviar, classificar e-mails; criar eventos; editar documentos |
| Slack | Enviar mensagens, criar canais, notificações, workflows |
| Notion | Criar/atualizar páginas e bancos de dados |
| GitHub | Criar issues, PRs, comentários, disparar workflows |
| Google Sheets | Ler/escrever células, criar planilhas, disparar alertas |
| PostgreSQL / MySQL | Consultas SQL, inserções, atualizações, relatórios |
| REST API genérico | Qualquer endpoint HTTP configurável pelo usuário |
| Zapier MCP | Acesso a 6.000+ integrações via Zapier como ponte |

### 3.6 Connectors — a biblioteca de conexões

Connectors é a camada de produto que transforma o MCP — um protocolo técnico — em uma **experiência de um clique**. Cada Connector é um servidor MCP empacotado com autenticação simplificada, ícone e permissões pré-configuradas. Por adotar o padrão MCP, a RobbIA herda todo o ecossistema existente de milhares de servidores públicos.

**Os dois momentos do Connector** (diferencial frente a OpenClaw e Hermes):
- **No planejamento (diferencial):** a IA Arquiteta consulta os Connectors ligados e projeta o harness já escolhendo as ferramentas certas.
- **Na execução (paridade):** o agente usa o Connector como ferramenta em tempo real.

**Segurança:** toda conexão passa pelo **Credential Execution Service (CES)** e pelo trust engine — credenciais isoladas do LLM, escopo mínimo por Connector, confirmação para ações sensíveis. Resposta direta a incidentes como o do OpenClaw em 2026 (≈20% do catálogo de skills comprometido).

---

## 4. Fluxo de Criação do Harness (experiência do usuário)

1. **Descrição em linguagem natural** — o usuário descreve o que quer automatizar. Sem formulários nem campos técnicos.
2. **Análise pela IA Arquiteta** — identifica gatilhos, sistemas, decisões que exigem raciocínio, ações determinísticas e necessidade de RPA/Skills/MCPs.
3. **Proposta de harness em blocos** — cards visuais, um bloco por vez (o que faz, qual LLM, por quê).
4. **Aprovação e customização por etapa** — para cada bloco: (A) aprovar, (B) trocar o modelo de IA, (C) pedir à IA para repensar.
5. **Configuração de credenciais** — armazenadas criptografadas; nunca chegam ao LLM diretamente.
6. **Teste e ajuste** — execução em modo de teste com dados simulados, bloco a bloco em tempo real.
7. **Deploy e monitoramento** — um clique para produção na VPS; roda 24/7 com logs, alertas e edição de blocos sem recriar tudo.

---

## 5. Casos de Uso Práticos

### 5.1 Atendimento ao Cliente via WhatsApp
Gatilho (WhatsApp) → Busca histórico (Gemini Flash) → Classifica intenção (Claude Haiku) → Responde (Claude Sonnet) → Decide escalada (Claude Haiku) → Envia (WhatsApp) → Registra no CRM.
*Custo estimado por interação: R$ 0,003 a R$ 0,02.*

### 5.2 Lançamento Automático no ERP
Gatilho (planilha por Gmail) → Extrai dados (Claude Sonnet) → Valida (Claude Haiku) → Login ERP (RPA) → Lança pedido (RPA) → Verifica screenshot (Claude Haiku) → Confirma por e-mail.
*Tempo médio por lançamento: 45 segundos vs. 8 minutos manualmente.*

### 5.3 Agente de Prospecção e Follow-up
Gatilho cron (9h) → Busca leads sem contato há 7 dias (CRM API) → Prioriza (Claude Haiku) → Pesquisa empresa (Gemini Flash) → Personaliza mensagem (Claude Sonnet) → Envia (WhatsApp) → Atualiza CRM.

### 5.4 Monitor de Notas Fiscais e Conciliação
Gatilho cron (3x/dia) → Acessa portal SEFAZ/prefeitura (RPA) → Extrai XMLs (RPA) → Processa dados (Claude Haiku) → Concilia com banco/ERP (Claude Sonnet) → Identifica divergências (Claude Haiku) → Alerta por WhatsApp/e-mail.

---

## 6. Segurança e Privacidade

- **6.1 Isolamento de credenciais** — modelo Vellum Assistant: credenciais (ERP, tokens, chaves WhatsApp) ficam no **Credential Execution Service (CES)**, processo separado. O LLM nunca acessa credenciais diretamente.
- **6.2 Sandbox para RPA** — cada execução de Playwright roda em container Docker isolado com rede restrita, destruído ao final. Screenshots/dados extraídos são temporários e deletados após o processamento.
- **6.3 Trust Engine** — define quem pode disparar o agente, quais ações exigem confirmação humana e quais blocos são autônomos. **Ações irreversíveis** (deleção, envio em massa, lançamentos financeiros) exigem aprovação explícita por padrão.

**Princípios:** credenciais nunca chegam ao LLM • RPA isolado e efêmero • ações irreversíveis exigem confirmação humana • log auditável de cada execução e decisão • dados ficam na VPS do usuário (sem telemetria externa) • **Licença MIT** (código auditável).

---

## 7. Roadmap de Desenvolvimento

| Fase | Período | Entregas |
|---|---|---|
| **1 — MVP** | Meses 1–2 | IA Arquiteta funcional • geração de harness via prompt • aprovação por etapa • seletor de LLM por bloco • deploy básico na VPS • WhatsApp e Telegram |
| **2 — RPA** | Meses 3–4 | Playwright integrado • sandbox Docker • verificação visual via LLM • ERPs comuns (Totvs, SAP, web genéricos) • CES para credenciais |
| **3 — Skills & MCP** | Meses 5–6 | Catálogo de Skills nativas • 10+ MCPs pré-configurados • instalação de Skills da comunidade • compatibilidade com agentskills.io |
| **4 — Memória** | Meses 7–8 | Motor de memória híbrido (dense + sparse) • perfis persistentes • memória por conversa e por agente • engine proativo |
| **5 — Marketplace** | Meses 9–12 | Marketplace de harnesses • fork e remix • avaliação • multi-agente (um harness orquestra outros) • interface mobile |

---

## 8. Stack Técnica Recomendada

| Componente | Tecnologia | Justificativa |
|---|---|---|
| Runtime do agente | **Bun + TypeScript** | Mais rápido que Node; mesmo stack do Vellum Assistant |
| Banco de dados | **PostgreSQL + Drizzle ORM** | Robusto, ACID, JSON nativo, extensível |
| Embeddings / busca | **PostgreSQL + pgvector** | Busca vetorial no mesmo banco, sem servidor extra |
| RPA | **Playwright + Docker** | Multi-browser; sandbox isolado |
| Frontend | **Next.js 15 + React 19** | SSR, streaming, WebSocket nativo |
| UI de fluxos | **ReactFlow** | Visualização de fluxos |
| Componentes UI | **Shadcn/ui + Tailwind** | Sem licença restritiva; dark mode |
| Filas de jobs | **pg-boss (PostgreSQL)** | Jobs assíncronos no Postgres, sem Redis |
| Gateway de canais | **Fastify + WebSocket** | Alto throughput para webhooks WhatsApp/Telegram |
| Distribuição | **Docker Compose** | Um comando para subir tudo na VPS |
| Licença | **MIT** | Uso comercial; favorece adoção pela comunidade |

---

## 9. Estrutura do Repositório (monorepo)

```
conversational-agent-builder/
├── apps/
│   ├── web/          → Frontend Next.js (Harness UI)
│   ├── runtime/      → Motor de execução de harnesses
│   └── gateway/      → Gateway WhatsApp / Telegram / Slack
├── packages/
│   ├── architect/    → IA Arquiteta (system prompt + parser)
│   ├── provider/     → Abstração multi-LLM (Claude, GPT, Gemini, Ollama)
│   ├── rpa-engine/   → Playwright + Docker sandbox
│   ├── memory/       → Motor de memória híbrida
│   ├── skills/       → Catálogo de skills nativas
│   ├── mcp-adapters/ → Conectores MCP (WhatsApp, Gmail, etc.)
│   └── ces/          → Credential Execution Service
├── skills/
│   ├── builtin/      → Skills que vêm com a plataforma
│   └── community/    → Skills enviadas pela comunidade
├── harnesses/
│   └── templates/    → Harnesses prontos para fork
├── docker-compose.yml → Deploy completo em um comando
└── setup.sh           → Instalação automática na VPS
```

---

## 10. Distribuição e Comunidade

- **10.1 Modelo** — 100% open-source sob **licença MIT**. Qualquer um instala na própria VPS, modifica, cria skills e distribui harnesses. Serviços gerenciados opcionais.
- **10.2 Marketplace de Harnesses** — exportar/publicar; instalar com um clique; fork e adaptar; contribuir de volta. Compatível com o padrão **agentskills.io**.
- **10.3 Públicos:** Arquitetos de Agentes (bancada profissional) • Consultores e integradores (revenda recorrente) • Academy (formação + certificação oficial) • Desenvolvedores (extensão via SDK).

**Proposta de valor:** construção conversacional + RPA + multi-cliente • escolha livre de LLM (sem lock-in) • self-hosted (dados na VPS do usuário) • MIT • compatível com agentskills.io • Certificação RobbIA.

---

## 11. Próximos Passos Recomendados (para o MVP)

1. **Definir o system prompt da IA Arquiteta** — o núcleo do produto; o resto depende da qualidade desse componente.
2. **Construir o Provider Abstraction Layer** — adaptadores para Claude, GPT-4o e Ollama; validar troca de provider sem quebrar blocos.
3. **Criar o Harness Runtime básico** — executa blocos em sequência, passa dados, registra estado (sem RPA ainda: Gatilho, Decisão, Resposta, Ação simples).
4. **Desenvolver a Harness UI (chat + aprovação)** — chat para descrever o agente e aprovar blocos; cards visuais com seletor de LLM.
5. **Integrar WhatsApp via MCP** — primeiro canal de produção; testa o fluxo completo mensagem → harness → resposta.
6. **Adicionar Playwright (RPA básico)** — primeiro harness com RPA: login + formulário; validar sandbox Docker e verificação por screenshot.

---

## 12. Identidade e Marca

- **Nome:** portmanteau de **Robbie + IA**. Homenagem a Robbie (Isaac Asimov, 1940), o primeiro robô com nome próprio da literatura. Pronúncia "Róbia", funciona em PT/EN/ES/FR/IT/DE sem adaptação.
- **Disponibilidade de marca (Junho 2026):** USPTO e EUIPO sem conflito; INPI (Brasil) com verificação manual pendente na Classe 42. Marcas próximas (ROBBE, ROBI, ROBLOX, ROBBIE) analisadas e descartadas como conflito (baixo risco).
- **Domínios prioritários a registrar:** `robbia.ai` ⭐, `robbia.com` ⭐, `robbia.io`, `robbia.com.br`.
- **Próximos passos de marca:** consultar INPI/emarcas (Classe 42), registrar domínios e handles `@robbia`, protocolar pedido INPI, consultar advogado de PI, considerar WIPO (Protocolo de Madri).

> *Aviso legal: a pesquisa de marca (junho/2026) não substitui busca profissional de anterioridade por advogado de PI.*

Ver também: [brand-book.md](brand-book.md) para o guia completo de identidade visual.

---

## Referências e Projetos Relacionados

| Projeto | URL | Relevância |
|---|---|---|
| Vellum Assistant | github.com/vellum-ai/vellum-assistant | Arquitetura de referência: memória, skills, trust engine |
| Hermes Agent | github.com/NousResearch/hermes-agent | Auto-geração de skills, padrão agentskills.io |
| Archon | github.com/coleam00/archon | Harness builder open-source para AI coding |
| OpenClaw | github.com/openclaw/openclaw | Assistente self-hosted viral — valida demanda por agentes em VPS |
| Playwright | playwright.dev | Engine RPA para automação web |
| ReactFlow | reactflow.dev | Biblioteca de visualização de fluxos |
| Shadcn/ui | ui.shadcn.com | Componentes de UI open-source |
| OpenRouter | openrouter.ai | Abstração multi-provider de LLMs |
| agentskills.io | agentskills.io | Padrão aberto de portabilidade de skills |
| pg-boss | github.com/timgit/pg-boss | Filas e jobs assíncronos sobre PostgreSQL |
| pgvector | github.com/pgvector/pgvector | Busca vetorial nativa no PostgreSQL |
