# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Foundation (Story 1.1):** Bun workspaces + Turborepo monorepo with Next.js 16 web app, Biome, strict TypeScript, CI (`bun install → biome → tsc → test → build`), Docker Compose (PostgreSQL + web), and the `@robbia/shared` package with cross-cutting contracts — discriminated `Result`, the central retry policy (3× exponential backoff), and a structured JSON logger with **automatic secret redaction** and safe serialization (circular refs, `Error`, `BigInt`, `Map`/`Set`).
- **Domain schema (Story 1.2):** Drizzle schema for `harnesses`, `blocks` (with the `block_type` enum of the 7 Block Types), `providers`, and `model_configs` — UUID v7 primary keys, foreign keys, indexes, and UTC `timestamptz`. Matching Zod schemas (`BlockTypeSchema`, `BlockSchema`, `HarnessSchema`) in `@robbia/shared`, with a single source of truth for the Block Types shared between the Postgres enum and Zod.
- **Documentation:** bilingual README (EN/PT-BR), security policy, contribution guide, code of conduct, and MIT license.

### Security

- Credentials are designed to never reach the LLM (CES); the shared logger redacts sensitive keys by design.

[Unreleased]: https://github.com/marcioluiskroth/RobbIA/commits/main
