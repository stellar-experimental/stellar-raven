# Open issue resolution — 2026-08-25

## Scope

Resolve Raven issues #25, #30, #31, #32, #33, #34, #35, #37, and #50.
Do not change issues #39 or #40. Issue #1 was already closed as not planned.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| #50 implementation, then #35 review | Codex (`gpt-5.6-sol`, high) | `wA:p2` | `src/skills/store.ts`, tests, architecture; later read-only review | complete |
| upstream and golden verification, then #50 review | Claude Opus (high) | `wA:p3` | read-only | complete |
| issue scope and independent truth review | Grok 4.6 (high) | `wA:p4` | read-only; reports under `/tmp` | complete |
| integration, finding lifecycle, deployment | Codex orchestrator | `wA:p1` | repository and GitHub | complete |

## Ledger

- `2026-08-25T19:04Z` — `node scripts/refresh-inventory.mjs` refreshed Scout to
  OpenAPI `1.8.87` and Stellar Docs titles from 636 to 646. Scout now has 34
  paths and 35 operations.
- `2026-08-25T19:09Z` — `npm run eval:routing` measured the first exposed-op
  design. Independent review later rejected that design because the resolver
  nested response objects were opaque.
- `2026-08-25T19:17Z` — two independent primary-source lanes checked the
  Veridise V2 and V2.1 reports. Both confirmed the versioned identifiers,
  Critical and Investigated labels, invalid disposition, and zero valid
  Critical counts. Sources were the Veridise PDF and portal reports 28 and 42.
- `2026-08-25T19:21Z` — `npm run improvements:lint` returned
  `improvements lint ok`. `npm run improvements:probes` returned four known
  recurring skill findings and two credential-inconclusive Lumenloop probes.
- `2026-08-25T19:25Z` — `npm run eval:qa:lint` returned `0 error(s), 103
  warning(s)`. `npm run eval:qa:compile` wrote 499 cases.
- `2026-08-25T19:28Z` — the #50 reviewer found stale model-facing result-shape
  text. The follow-up patch added per-section URLs to the generated
  specification and added two file-provenance tests.
- `2026-08-25T19:31Z` — `npm test` passed 84 files and 1,230 tests.
  `npm run typecheck` and `npm run build` passed.
- `2026-08-25T19:38Z` — the #35 reviewer found the resolver response contract
  unusable for safe nested projections. Raven now excludes
  `GET /api/projects/resolve`. Finding `sls-075` records the upstream gap.
- `2026-08-25T19:40Z` — `npm run eval:routing -- --gate` passed at strict
  legacy 209/279/312, skills 16/23/23, and holdout 10/22/25 with 11 forbidden
  captures. Card@5 remained 94/182.
- `2026-08-25T19:41Z` — the independent #35 reviewer rebuilt the catalog,
  micro-map, specification, and operation classes in a temporary directory.
  All four outputs matched byte-for-byte. The reviewer returned `PASS` with no
  findings.
- `2026-08-25T19:44Z` — `git commit 63e337c` recorded the reviewed changes.
  `git rebase origin/main` completed without conflicts. The reviewed branch commit is
  `74e1e38ac28d34f8ab49c7b5ca530e4c8b8c1729`.
- `2026-08-25T19:46Z` — `npm run eval:qa:register` returned `up to date; 0
  reopened`. `npm run eval:qa:lint -- --since origin/main` returned zero
  errors.
- `2026-08-25T19:49Z` — Raven filed `sls-074` as
  [Stellar-Light/stellarlight#1031](https://github.com/Stellar-Light/stellarlight/issues/1031).
  Raven filed `sls-075` as
  [Stellar-Light/stellarlight#1030](https://github.com/Stellar-Light/stellarlight/issues/1030).
- `2026-08-25T19:52Z` — Raven retired `sls-068` through `sls-072` after live
  checks, independent review, and upstream resolution comments. Durable receipts
  are in `improvements/resolved.json`.
- `2026-08-25T19:53Z` — Raven kept `sls-024` active. Live checks found 583
  reachable rows against 1,025 status projects, plus remaining provenance and
  deployment gaps. Raven posted the result to both recorded upstream issues.
- `2026-08-25T19:56Z` — [PR #63](https://github.com/stellar-experimental/stellar-raven/pull/63)
  passed CI and merged as `4b1ddbaf83577ca2cc1e6362252bc8ea8bb32686`.
- `2026-08-25T19:58Z` — `npm run deploy` deployed production Version
  `2ac46467-6e45-485f-aba7-07414c0fba1f`. The root, docs, terms, health,
  skill-health, and OAuth metadata routes returned 200. Unauthenticated MCP
  returned the expected 401 OAuth challenge.
- `2026-08-25T20:00Z` — Raven closed #25, #30, #31, #32, #33, #34, #35,
  #37, and #50 with issue-specific evidence. Raven left #39 and #40 unchanged.
  They are the only open Raven issues.

## Outcome

The requested issue pass is complete. The reviewed change is merged and deployed.
Only the user-excluded issues #39 and #40 remain open.

## Later issue addendum — 2026-08-27

Issue #67 opened after this pass and reports new live-service drift. The original outcome remains
correct for its stated scope. `.agents/TODO.md` now tracks issue #67 and the dependent production
verification for issue #39.
