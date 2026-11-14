# Plan — stellar-raven-codemode

Product scope, what is built, and what is undecided. [ARCHITECTURE.md](ARCHITECTURE.md) describes
how the system works. [The work queue](.agents/TODO.md) holds outstanding work and open owner
decisions.

## Scope

Stellar Raven is a Cloudflare Workers MCP server at https://raven.stellar.org. It connects agents
to Lumenloop, Stellar Light/Scout, Stellar Docs, and selected ecosystem skills through two tools:

- `search` finds service operations and skills through a host-side ranked query.
- `execute` runs model-written JavaScript in a fresh Dynamic Worker with no network access.

The host owns service traffic, authentication, argument validation, and secrets.
[ADR-0001](research/decisions/0001-search-tool-shape.md) records the two-tool design.

## What is built

| Area | Reference |
|---|---|
| MCP server, `search`, and `execute` | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Generated catalog; the manifest is the exposed surface | [ADR-0003](research/decisions/0003-build-time-exposure-filtering.md) |
| Skill section reads by exact ID; sections stay out of search | [ADR-0005](research/decisions/0005-skills-form-sections-out-of-search.md) |
| Recovery advice, separate from ranking | [ADR-0007](research/decisions/0007-structural-recovery-guidance.md) |
| Skill pins; bodies stay upstream at reviewed commit and blob hashes | [ecosystem-skills/README.md](ecosystem-skills/README.md) |
| One runnable skill (the ecosystem digest) | [src/skills/README.md](src/skills/README.md) |
| WorkOS-backed OAuth, named API keys, loopback-only development bypass | [ARCHITECTURE.md](ARCHITECTURE.md), [docs/operations.md](docs/operations.md) |
| Public site, `/docs`, and the signed-in Playground | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Daily drift checks and the hourly skill canary | [docs/operations.md](docs/operations.md) |
| Usage collection and private monthly reports | [usage/README.md](usage/README.md) |
| Evaluation instruments and gates | [eval/EVALS.md](eval/EVALS.md) |

## Repository layout

| Area | Owner |
|---|---|
| Request handling and authentication | `src/server.ts`, `src/auth/` |
| Ranking, adapters, and sandbox execution | `src/catalog/`, `src/adapters/`, `src/executor/` |
| Service snapshots | `inventory/`, `scripts/refresh-inventory.mjs` |
| Skill pins | `ecosystem-skills/MANIFEST.json`, `ecosystem-skills/update.sh` |
| Generated catalog and sandbox specification | `catalog/manifest.json`, `specs/super-spec.json` |
| Stellar Docs search contract and credential guardrails | [docs/stellar-docs.md](docs/stellar-docs.md) |
| Worker bindings and compatibility flags | `wrangler.jsonc` |
| Generated-file ownership | [scripts/README.md](scripts/README.md) |

## Change rules

A new operation, skill pin, or source passes its review and evaluation gates before it replaces
the accepted catalog. A successful regeneration alone does not approve it. The skills in
`.agents/skills/` give the procedures for drift, evaluations, golden answers, and improvement
findings. Source acceptance, paid evaluation, deployment, and upstream issue closure are separate
decisions ([ADR-0008](research/decisions/0008-human-review-eval-and-playground-policy.md)).

## Not built

- The paid Lumenloop research trigger and its account-scoped reads stay unexposed. The hard rules
  in [AGENTS.md](AGENTS.md#hard-rules) give the conditions to enable them.
- Durable Playground sessions, personalization, and new source families are proposals.
  [Ideas](ideas/README.md) are research notes, not implementation authority.
