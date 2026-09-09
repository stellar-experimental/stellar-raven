# Outstanding issue closeout — 2026-09-09

## Scope

The owner asked to complete the remaining issues and improvements after the reviewed deployment.
Start: clean `b6913d13e8ea0df15382503eb16ed47327a450d6` on main.
Working branch: `maintenance/outstanding-2026-09-09`.
Production deployment: `0dad1151-56f5-4e7d-ae75-b4b81f3601f9`, 100%, created `2026-09-09T17:58:54.979Z`.
Root checks confirmed all four corrected stellar-dev skill bodies from pin `0472452a05731de5e0a1e886d8aae6df24873fe2`.
The landing page and Terms returned 200. Unauthenticated MCP returned 401.
The prior three-agent review and CI evidence remain in `2026-09-09-truth-maintenance.md`.
No paid QA, chat, payment, crawler write, or account provisioning is authorized by this round.

## Lane plan

- Root: coordinate, verify Scout 1.9.49, own generated and finding edits, run gates, and integrate review results.
- Grok 4.6 high: independently verify production sk-021/sk-023/sk-024 retirement candidates and persistent references.
- Sol high: diagnose #124 against accepted and candidate catalogs; propose a general correction without changing thresholds or labels.
- Terra high: check all active improvement refs for substantive new maintainer activity and actionable fixes.
- Root: inspect available authenticated browser access for #40; do not create a paid chat response.

The coordinator owns all edits except each worker's named report.
Independent reviewers re-derive current facts; historical reports are context, not acceptance proof.
Only root-created panes belong to this round. Record their returned IDs before control.
Owned panes: `w3G:pA` (retire-review), `w3G:pB` (search-repair), and `w3G:pC` (upstream-sweep).
Root occupies `w3G:p2`. No other pane or worktree is adopted.

## Drift verdict

Root independently confirmed Scout OpenAPI 1.9.49 at `2026-09-09T18:14:27Z`.
Both RWA state enums contain `issued-single-holder`.
The matching read returned 200, one matching row, and 34 total matches.
This fixes the original sls-082 trigger but does not itself accept the complete Scout catalog.

The source update adds the read-only `GET /api/rwa` operation (`scout.getRwaAssets`).
Its input supports state, level, kind, project, and a maximum limit of 100.
The public call requires no account, payment, or persistence.
The seven excluded Scout operations remain excluded.
This is an operation-surface and routing/schema change, not a provenance-only change.
Exposure is technically read-only, but acceptance remains blocked by search regressions below.

At `2026-09-09T18:27:19Z`–`18:27:37Z`, root repeated the three newly fixed Scout triggers.
Specification version: `1.9.49`.
SHA-256: `2a44488dbf4c9fc3d7114a38d8cee29596d0cc37f367d74b0b7e5fc323f1cc01`.
Both RWA state enums include `issued-single-holder`; its request returned one matching row and 34 matches.
An invalid state returned 400. ACTA returned the now-documented `package-release` basis.
Etherfuse returned nine registry assets and project coverage `declared=9, tracked=9, served=8, complete=true`.
`CETESZ` has no supply, which explains the eight served products.
The current issuer TOML declares the same nine assets; SHA-256 `f9b923ae30b0abf176c6abb9acf8787c6251221e6dfb480263a8501b44b85afe`.
Terra independently reproduced the service checks in `2026-09-09-upstream-sweep-terra.md`.
These upstream fixes do not establish Raven catalog acceptance.

## Eval verdict

Run deterministic routing, corpus, and focused regressions. Do not run paid model-answering or judging lanes.

Candidate: `eval/results/routing-2026-09-09T18-24-30-719Z.json`.
Accepted comparison: `eval/results/routing-2026-09-09T16-44-14-655Z.json`.
Manifest SHA-256 changes from `83d9998f984cae38c363524e0592c6d035e80ba09cc27003f7a65e11bb0350f9`
to `dd55dea7f5e00047d467644c51a5905416926d387e579405b097655d18e34a63`.
No scorer, gate threshold, label, or case membership changed.

| Instrument | Accepted | Candidate |
| --- | --- | --- |
| Legacy 338 top-1/3/5 | 213 / 279 / 312 | 211 / 277 / 311 |
| Legacy card@5, 182 eligible | 95 | 103 |
| Extended 122 top-1/3/5 | 90 / 110 / 116 | 88 / 109 / 114 |
| Skills 23 top-1/3/5 | 16 / 23 / 23 | 16 / 22 / 23 |
| Holdout 49 top-1/3/5 | 10 / 22 / 26 | 11 / 23 / 27 |
| Holdout forbidden captures | 11 | 10 |
| Holdout passes | 21 | 23 |

The numerical gates stay within their existing bounds. The manifest fingerprint gate fails.
Root did not update `eval/gates.json`.
Per-case review finds harmful `getRwaAssets` captures for issuer setup, SAC balance storage, and balance retrieval.
It also displaces the SCF similarity operation and Lumenloop evidence for 2025 DeFi launches.
Other losses include current network-passphrase lookup, token staking, reserve recovery, and first-contract skill placement.
Protocol-history v1 remains diagnostic: seven of eight positives pass, but three of four controls capture `searchResearch`.
These losses prevent aggregate-only acceptance. The independent drift review must reconcile them.

The candidate initially failed nine unit tests after source regeneration.
Root corrected operation counts, schema-compaction membership, and the truthful static example total.
Root replaced the catalog-dependent confidence-gap fixture with two deterministic entries; assertions remain unchanged.
The focused suite then passed 168 tests. The full suite passed 1,995 tests in 108 test files.
Typecheck, build, and all 85 smoke tests passed.
The plain-operation harness now checks the candidate's 61-operation set without weakening its count guards.
This changes that experimental surface and invalidates comparisons against previous 60-operation runs.
No paid architecture comparison ran. Historical experiment contracts and artifacts remain unchanged.

## Golden verdict

No golden changes are assumed. Any necessary change requires the golden-truth workflow.

## Improvements/issues/PR verdict

Retirement requires fresh independent production verification, public source snapshots, comments, reference cleanup, and resolver receipts.

## Own-repo todos

#124 requires a general repair that preserves authorized gates. #40 requires authenticated production copying.

## Decisions

Do not treat an upstream correction, merged source, deployment, and finding retirement as the same gate.

## Final checklist

Pending.
