# Plan — stellar-raven-codemode

## 0. Product scope

Stellar Raven is a Cloudflare Workers MCP server at https://raven.stellar.org.
It connects agents to Lumenloop, Stellar Light/Scout, Stellar Docs, and selected ecosystem skills.
The initial implementation is complete.

[The task queue](.agents/TODO.md) owns outstanding work.
[The handoff](.agents/NEXT.md) ranks that work and records open owner decisions.
[The architecture](ARCHITECTURE.md) describes the implementation.
[The README](README.md) covers connection and operation.

## 1. Architecture

Raven exposes two tools:

- `search` finds service operations and skills through a host-side ranked query.
- `execute` runs model-authored JavaScript in a fresh Dynamic Worker.

The MCP handler is stateless. The sandbox has `globalOutbound: null`.
The host owns service traffic, authentication, argument validation, and secrets.
The Playground uses the same discovery and execution system with additional request and usage limits.

[ADR-0001](research/decisions/0001-search-tool-shape.md) records the two-tool design.

## 2. The unified catalog

The generated manifest is the exposed surface.
Search returns service operations and whole skills.
Operations and runnable skills include TypeScript signatures.
Whole-skill hits include available section keys; section reads use exact IDs.

Recovery advice remains separate from ranked results and does not change ranking.
The sandbox also exposes `codemode.search`, `codemode.describe`, `codemode.catalog`, and `codemode.spec`.

[ADR-0003](research/decisions/0003-build-time-exposure-filtering.md) owns exposure policy.
[ADR-0005](research/decisions/0005-skills-form-sections-out-of-search.md) covers section visibility.
[ADR-0007](research/decisions/0007-structural-recovery-guidance.md) covers recovery advice.

## 3. Skills directory

Skill bodies stay upstream at reviewed commit and blob hashes.
Raven stores the pins and routing metadata, not the bodies.
`codemode.skill.read` supports whole-skill and section reads.
The ecosystem digest is the only runnable skill.
Its host-side runner uses the same validated operation closures as sandbox calls.

Use [the pin guide](ecosystem-skills/README.md) for maintenance.
[The runner decision record](research/skill-run-design.md) retains the measured acceptance and retirement evidence.

## 4. Policy and security

Model code does not own endpoints, arguments, authentication, or exposure.
Arguments must match the manifest before a host call.
Adapters distinguish data, soft-empty responses, and errors.
Results, logs, and errors pass through redaction and bounded model-output handling.

Raven uses WorkOS-backed OAuth, named API keys, and a loopback-only development bypass.
The Worker owns OAuth grants; WorkOS supplies the upstream login.
The Playground requires sign-in for chat and keeps replay history in browser page memory.

Structured logs and spans support diagnostics.
Usage collection and private reports have separate retention and access controls.
See [the usage guide](usage/README.md) and [the security policy](SECURITY.md).

Partner-tier Lumenloop details stay outside the public repository; inventory retains name-only stubs.
Algolia operator credentials are maintenance-only.
Index writes require the comparison and guardrails in [the Algolia runbook](research/services/stellar-docs-algolia.md).

## 5. Inventory refresh

Daily CI detects service, routing-text, schema, and skill-pin drift.
Pin freshness, upstream availability, and Worker-side reachability are separate checks.
The hourly Worker canary records its result at `/health/skills`.

Use the repository skills for drift resolution, evaluations, golden truth, and improvement findings.
Keep the accepted catalog until the candidate passes its review and evaluation gates.
Successful regeneration alone does not approve a new operation or skill pin.

## 6. Repo layout and configuration

| Area | Owner |
|---|---|
| Request handling and authentication | `src/server.ts`, `src/auth/` |
| Ranking, adapters, and sandbox execution | `src/catalog/`, `src/adapters/`, `src/executor/` |
| Service snapshots | `inventory/` and `scripts/refresh-inventory.mjs` |
| Skill pins | `ecosystem-skills/MANIFEST.json` and `ecosystem-skills/update.sh` |
| Generated catalog and sandbox specification | `catalog/manifest.json`, `specs/super-spec.json` |
| Runtime limits | [Architecture limits](ARCHITECTURE.md#7-operating-limits-and-caps) |
| Worker bindings and compatibility flags | `wrangler.jsonc` |
| Dependency versions | `package.json` and `package-lock.json` |
| Evaluation contracts and gates | [Evaluation map](eval/EVALS.md) |

Use [the scripts guide](scripts/README.md) for generated-file ownership.
The vendor headers in `src/catalog/vendor/` explain which upstream helpers Raven maintains locally.

## 7. Delivery and maintenance

The server, public site, Playground, skill reads, digest runner, authentication, and maintenance checks are implemented.
Historical experiments and deployment evidence live in the evaluation records and dated round ledgers.
The [September 14 audit](.agents/rounds/2026-09-14-truth-maintenance.md) records the latest reviewed drift and outstanding work.

Run the checks in [AGENTS.md](AGENTS.md) before release.
Deploy only from a clean checkout that matches pushed `origin/main`.
Verify production behavior after deployment.

## 8. Open decisions and defaults

Paid Lumenloop research and its account-scoped reads remain unexposed.
Enabling them requires host-side approval, elicitation, budget enforcement, partner-detail persistence, and deduplication in one reviewed change.

Durable Playground sessions, personalization, and new source families remain proposals.
[Ideas](ideas/README.md) are research notes, not implementation authority.
Source acceptance, paid evaluation, deployment, and upstream issue closure remain separate decisions.
[ADR-0008](research/decisions/0008-human-review-eval-and-playground-policy.md) owns the human-review boundaries.
