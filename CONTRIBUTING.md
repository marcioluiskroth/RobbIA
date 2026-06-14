# Contributing to RobbIA · Contribuindo com a RobbIA

> 🇺🇸 English first · 🇧🇷 Português abaixo

First off — thank you for considering a contribution! RobbIA is open source (MIT) and community-driven.

---

## 🇺🇸 English

### Ways to contribute

- 🐛 **Report bugs** and 💡 **request features** via [Issues](https://github.com/marcioluiskroth/RobbIA/issues)
- 📖 **Improve documentation** (including translations)
- 🔧 **Submit code** via Pull Requests
- 🔒 **Report security issues** privately — see [SECURITY.md](SECURITY.md)

### Development setup

```bash
bun install          # Bun ≥ 1.3
bun run lint         # Biome (lint + format)
bun run typecheck    # tsc --noEmit across all packages
bun run test         # bun test
```

This is a **Bun workspaces + Turborepo** monorepo. Code lives in `apps/*` and `packages/*`. PostgreSQL is provided via `docker compose up`.

### Coding standards (non-negotiable)

These keep an AI-assisted codebase consistent — please follow them:

- **TypeScript `strict`, no `any`.** Biome enforces it.
- **Validate every boundary with Zod** — "parse, don't validate".
- **Never log or expose secrets.** Credentials always go through the CES; the structured logger redacts sensitive keys.
- **Use the shared contracts** in `@robbia/shared` (discriminated `Result`, the central retry policy, the logger) — don't reinvent them.
- **Naming:** files `kebab-case`; DB tables `snake_case` plural; JSON fields `camelCase`; jobs `domain.action`; WebSocket events `domain.event`.
- **Tests co-located** as `*.test.ts`, run with `bun test`.

### Pull request checklist

1. Branch from `main` (`feat/...`, `fix/...`, `docs/...`).
2. Keep changes focused; update/add tests.
3. Run `bun run lint && bun run typecheck && bun run test` — all green.
4. Use clear, [Conventional Commit](https://www.conventionalcommits.org/)-style messages (`feat:`, `fix:`, `docs:`, `chore:`…).
5. Fill in the PR template and link related issues.

### Project planning

RobbIA is planned with a spec-first flow: the PRD, architecture, UX, and a 27-story epic breakdown live under [`_bmad-output/planning-artifacts/`](_bmad-output/planning-artifacts/). Please align substantial features with those documents (or open an issue to discuss changes to them first).

By contributing, you agree your contributions are licensed under the project's [MIT License](LICENSE).

---

## 🇧🇷 Português

### Formas de contribuir

- 🐛 **Reporte bugs** e 💡 **sugira funcionalidades** via [Issues](https://github.com/marcioluiskroth/RobbIA/issues)
- 📖 **Melhore a documentação** (incluindo traduções)
- 🔧 **Envie código** via Pull Requests
- 🔒 **Reporte problemas de segurança** de forma privada — veja o [SECURITY.md](SECURITY.md)

### Configuração de desenvolvimento

```bash
bun install          # Bun ≥ 1.3
bun run lint         # Biome (lint + formato)
bun run typecheck    # tsc --noEmit em todos os pacotes
bun run test         # bun test
```

Este é um monorepo **Bun workspaces + Turborepo**. O código vive em `apps/*` e `packages/*`. O PostgreSQL sobe via `docker compose up`.

### Padrões de código (inegociáveis)

Eles mantêm um código assistido por IA consistente — por favor, siga-os:

- **TypeScript `strict`, sem `any`.** O Biome garante isso.
- **Valide toda fronteira com Zod** — "parse, don't validate".
- **Nunca logue nem exponha segredos.** Credenciais sempre passam pelo CES; o logger estruturado redige chaves sensíveis.
- **Use os contratos compartilhados** em `@robbia/shared` (`Result` discriminado, política de retry central, logger) — não os reinvente.
- **Nomenclatura:** arquivos `kebab-case`; tabelas `snake_case` plural; campos JSON `camelCase`; jobs `dominio.acao`; eventos WebSocket `dominio.evento`.
- **Testes co-localizados** como `*.test.ts`, executados com `bun test`.

### Checklist do Pull Request

1. Crie um branch a partir de `main` (`feat/...`, `fix/...`, `docs/...`).
2. Mantenha as mudanças focadas; atualize/adicione testes.
3. Rode `bun run lint && bun run typecheck && bun run test` — tudo verde.
4. Use mensagens claras no estilo [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`…).
5. Preencha o template de PR e vincule issues relacionadas.

### Planejamento do projeto

A RobbIA é planejada com um fluxo spec-first: o PRD, a arquitetura, o UX e um detalhamento de 27 histórias vivem em [`_bmad-output/planning-artifacts/`](_bmad-output/planning-artifacts/). Alinhe funcionalidades substanciais a esses documentos (ou abra uma issue para discutir mudanças neles primeiro).

Ao contribuir, você concorda que suas contribuições são licenciadas sob a [Licença MIT](LICENSE) do projeto.
