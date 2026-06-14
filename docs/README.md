# RobbIA — Documentação de Projeto

Conhecimento de projeto (project knowledge) que ancora o fluxo BMad. As skills de planejamento (PRD, Arquitetura, Epics) leem esta pasta como contexto-base.

## Índice

- [product-vision-architecture.md](product-vision-architecture.md) — Visão de produto, conceitos (harness, blocos, IA Arquiteta), arquitetura técnica em 4 camadas, casos de uso, segurança (CES, sandbox, trust engine), roadmap (5 fases), stack recomendada, estrutura do monorepo, distribuição/comunidade e marca. *(Documento de Arquitetura e Visão • v2.0 • Junho 2026)*
- [brand-book.md](brand-book.md) — Guia de identidade visual: mascote robô-fluxo, sistema de cores Grafite + Ciano (60/30/10), temas claro/escuro, logotipo, tipografia (Inter + JetBrains Mono), estados do mascote e regras de uso. *(Brand Book • v1.1 • Junho 2026)*

## Resumo de uma linha

RobbIA é a **bancada open-source (MIT) do Arquiteto de Agentes de IA**: descreva em linguagem natural → a IA Arquiteta monta um *harness* de blocos (Gatilho, Contexto, Decisão, Resposta, RPA, Ação, Verificação) com LLM escolhido por bloco → o profissional refina e aprova → o agente roda 24/7 em VPS, acessível por WhatsApp/Telegram/Web/API, em painel multi-cliente.

## Pilares técnicos

- **Multi-LLM sem lock-in** via Provider Abstraction Layer (Claude, GPT, Gemini, OpenRouter, Ollama, DeepSeek).
- **RPA com Playwright** em sandbox Docker para automatizar sistemas sem API.
- **Skills (SKILL.md + TOOLS.json) + MCP/Connectors** de um clique, herdando o ecossistema MCP.
- **Segurança profissional:** credenciais isoladas no CES, ações irreversíveis sob confirmação, log auditável.
- **Stack:** Bun + TypeScript, PostgreSQL + Drizzle + pgvector, Next.js 15/React 19 + ReactFlow, pg-boss, Fastify, Docker Compose.
