# Plan — stellar-raven-codemode

Product scope, what is built, and what is not built. See [ARCHITECTURE.md](ARCHITECTURE.md) for
design and [the work queue](.agents/TODO.md) for open work and owner decisions.

## Scope

Stellar Raven is a Cloudflare Workers MCP server at https://raven.stellar.org connecting agents to
Lumenloop, Stellar Light/Scout, Stellar Docs, stellar.org, and pinned ecosystem skills through
`search` (host-side ranked catalog search) and `execute` (model-written JavaScript in a fresh
networkless Dynamic Worker). Host adapters own traffic, auth, validation, and secrets.
[ADR-0001](research/decisions/0001-search-tool-shape.md) and
[ADR-0011](research/decisions/0011-tool-surface-stays-code-mode-trimmed.md) record the two-tool,
cost-trimmed surface.

## What is built

| Area | Reference |
|---|---|
| MCP server, `search`, and `execute` | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Generated catalog; manifest defines the exposed surface | [ADR-0003](research/decisions/0003-build-time-exposure-filtering.md) |
| Skill section reads by exact ID; sections stay out of search | [ADR-0005](research/decisions/0005-skills-form-sections-out-of-search.md) |
| Advisory recovery separate from ranking | [ADR-0007](research/decisions/0007-structural-recovery-guidance.md) |
| Pinned skills; bodies stay upstream at reviewed commit and blob hashes | [ecosystem-skills/README.md](ecosystem-skills/README.md) |
| One runnable skill (`skills.lumenloop.stellar-ecosystem-digest`) | [src/skills/README.md](src/skills/README.md) |
| WorkOS-backed OAuth, named API keys, loopback dev bypass | [ARCHITECTURE.md](ARCHITECTURE.md), [docs/operations.md](docs/operations.md) |
| Public site, `/docs`, and signed-in Playground | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Daily drift checks and hourly skill canary | [docs/operations.md](docs/operations.md) |
| Usage collection and private monthly reports | [usage/README.md](usage/README.md) |
| Evaluation instruments and gates | [eval/EVALS.md](eval/EVALS.md) |

## Change rules

A new operation, skill pin, or source must pass review and evaluation gates before replacing the
accepted catalog; regenerating artifacts alone does not approve it. Procedures for drift, evals,
golden answers, and upstream findings live in `.agents/skills/`. Source acceptance, paid evals,
deployment, and upstream issue closure are separate decisions. Paid runs require a dollar cap and
recorded cost ([AGENTS.md](AGENTS.md#spend-and-evidence)); lead-session merge and deploy rules live
in [owner delegations](AGENTS.md#owner-delegations-lead-session-only).

## Not built

- The paid Lumenloop research trigger and its account-scoped reads stay unexposed (conditions to
  enable them live in [AGENTS.md](AGENTS.md#hard-rules)).
- Durable Playground sessions, personalization, and new source families remain proposals.
  [Ideas](ideas/README.md) are research notes, not implementation authority.
