# Plan — stellar-raven-codemode

This file gives the product scope, what is built, and the decisions that remain open.
[ARCHITECTURE.md](ARCHITECTURE.md) describes how the system works.
[The task queue](.agents/TODO.md) holds the outstanding work, its priorities, and the open owner
decisions.

## Scope

Stellar Raven is a Cloudflare Workers MCP server at https://raven.stellar.org. It connects agents to
Lumenloop, Stellar Light/Scout, Stellar Docs, and selected ecosystem skills through two tools:

- `search` finds service operations and skills through a host-side ranked query.
- `execute` runs model-authored JavaScript in a fresh Dynamic Worker with no network access.

The host owns service traffic, authentication, argument validation, and secrets.
[ADR-0001](research/decisions/0001-search-tool-shape.md) records the two-tool design.

## What is built

| Area | State | Reference |
|---|---|---|
| MCP server, `search`, and `execute` | Built | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Generated catalog: the manifest is the exposed surface | Built | [ADR-0003](research/decisions/0003-build-time-exposure-filtering.md) |
| Skill section reads by exact ID; sections stay out of search | Built | [ADR-0005](research/decisions/0005-skills-form-sections-out-of-search.md) |
| Recovery advice, separate from ranking | Built | [ADR-0007](research/decisions/0007-structural-recovery-guidance.md) |
| Skill pins: bodies stay upstream at reviewed commit and blob hashes | Built | [ecosystem-skills/README.md](ecosystem-skills/README.md) |
| One runnable skill (the ecosystem digest) | Built | [src/skills/README.md](src/skills/README.md) |
| WorkOS-backed OAuth, named API keys, localhost-only development bypass | Built | [docs/operations.md](docs/operations.md) |
| Public site, `/docs`, and the signed-in Playground | Built | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Daily drift checks and the hourly skill canary | Built | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Usage collection and private monthly reports | Built | [usage/README.md](usage/README.md) |
| Evaluation instruments and gates | Built | [eval/EVALS.md](eval/EVALS.md) |

## Repository layout

| Area | Owner |
|---|---|
| Request handling and authentication | `src/server.ts`, `src/auth/` |
| Ranking, adapters, and sandbox execution | `src/catalog/`, `src/adapters/`, `src/executor/` |
| Service snapshots | `inventory/` and `scripts/refresh-inventory.mjs` |
| Skill pins | `ecosystem-skills/MANIFEST.json` and `ecosystem-skills/update.sh` |
| Generated catalog and sandbox specification | `catalog/manifest.json`, `specs/super-spec.json` |
| Stellar Docs search contract and Algolia guardrails | [docs/stellar-docs.md](docs/stellar-docs.md) |
| Worker bindings and compatibility flags | `wrangler.jsonc` |
| Dependency versions | `package.json` and `package-lock.json` |
| Generated-file ownership | [scripts/README.md](scripts/README.md) |

The vendor headers in `src/catalog/vendor/` explain which upstream helpers Raven keeps locally.

## Change rules

A new operation, skill pin, or source passes its review and evaluation gates before it replaces
the accepted catalog. A successful regeneration alone does not approve it. The repository skills
in `.agents/skills/` give the procedures for drift, evaluations, golden answers, and improvement
findings. [docs/operations.md](docs/operations.md) gives the deploy procedure.

## Open decisions

- The paid Lumenloop research trigger and its account-scoped reads stay unexposed. The
  conditions to enable them are in the hard rules of [AGENTS.md](AGENTS.md).
- Durable Playground sessions, personalization, and new source families are proposals.
  [Ideas](ideas/README.md) are research notes, not implementation authority.
- Source acceptance, paid evaluation, deployment, and upstream issue closure are separate
  decisions. [ADR-0008](research/decisions/0008-human-review-eval-and-playground-policy.md) sets the
  human-review boundaries.
