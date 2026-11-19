# Item 8.12 `sweep` — Retention Candidates

Generated before any deletion under `.agents/README.md` ("Retention"), `.agents/rounds/README.md`, and `eval/EVALS.md`.

## Summary

| Verdict | Files | Bytes |
|---|---:|---:|
| **keep** | 390 | 6,575,474 |
| **delete** | 603 | 11,473,860 |
| **fold** | 0 | 0 |
| **Total in scope** | 993 | 18,049,334 |

## Out of scope (untouched)

- `research/decisions/` — durable Architecture Decision Records (current artifacts).
- `.agents/rounds/README.md`, `.agents/rounds/.ignore` — durable round guide and ripgrep ignore list.
- `.agents/rounds/2026-11-16-next-phase.md` and `.agents/rounds/2026-11-16-next-phase/` — active running round (dated runs read it until 2026-12-04).
- `.agents/rounds/2026-11-02-golden-audit/` and `.agents/rounds/2026-11-14-golden-coverage-audit/` — listed in `.agents/rounds/.ignore` (hold golden text; never opened, listed into, or deleted; governed by `scripts/find-uncited-golden-round-json.mjs`).
- `docs/` (2 files: `operations.md`, `stellar-docs.md`) and `ideas/` (9 files: `README.md` plus 8 live held/deferred/measuring idea notes) — verified as live docs/notes, not one-off records.

## Classification rules applied

- **K1 (direct current citation):** cited by path, link, or filename in a current artifact (`AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `PLAN.md`, `CONTRIBUTING.md`, `docs/`, `.agents/TODO.md`, `.agents/skills/`, `research/decisions/`, `improvements/`, `ideas/`, `eval/`, `test/`, `scripts/`, `src/`, `usage/`, `ecosystem-skills/`, `inventory/`, `specs/`, `assets/brand/`, `wrangler.jsonc`, `.github/`).
- **K2 (QA provenance / companion scope, count-only):** cited in `eval/qa/corpus/`, `eval/corpus/`, `eval/qa/reviewed/`, `eval/qa/consistency-register.json`, `eval/qa/source-sentinels.json`, `eval/qa/cases.json`, `eval/qa/sample.json`, `eval/qa/tool-cases.json`, or `eval/protocol-history-blind-cases-v2.json`, checked solely via token-only `rg --hidden -g !.git --with-filename --count-matches` aggregated by scope (no case text opened, no case filenames printed).
- **K3 (current directory/subdirectory citation):** directory or subdirectory cited as a unit by a current artifact.
- **K4 (retained ledger Outcome):** named as retained evidence or linked by the `## Outcome` section of a retained ledger (except `.agents/rounds/2026-10-08-flagged-row-recollection/`, whose sole named consumer — the annotation TODO item in `2026-10-08-maintenance.md:64` — was closed and removed from `.agents/TODO.md` in #433).
- **K5 (supporting evidence / runtime input):** data table, carried-over artifact, or runtime script input directly imported or linked by a retained current-cited artifact to interpret or run it.
- **D (delete):** no current artifact, QA provenance scope, or active retained ledger Outcome cites or needs it. Uncited `research/` notes were inspected for any durable rule lacking a living home; every durable invariant already lives in ADRs, `AGENTS.md`, `ARCHITECTURE.md`, `docs/`, `src/`, or `test/` (0 folds required).

## Candidates

| Path | Files | Bytes | Verdict | Evidence | Fold target |
|---|---:|---:|---|---|---|
| `.agents/rounds/2026-08-28-eval-block2.md` | 1 | 8,006 | **keep** | QA (count-only): `eval/qa/reviewed` (1f/2m) | — |
| `.agents/rounds/2026-08-28-human-review-grill.md` | 1 | 11,478 | **keep** | Current: `research/decisions/0008-human-review-eval-and-playground-policy.md:9` | — |
| `.agents/rounds/2026-08-29-golden-truth-session-3/` (5 files) | 5 | 76,416 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-08-29-golden-truth-session-3.md` | 1 | 65,531 | **keep** | QA (count-only): `eval/qa/reviewed` (1f/1m) | — |
| `.agents/rounds/2026-08-30-golden-metadata-remainder/` (2 files) | 2 | 40,543 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-08-30-golden-metadata-remainder.md` | 1 | 21,194 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-08-31-golden-metadata-remainder/` (4 files) | 4 | 117,648 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1.md` | 1 | 18,787 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-08-31-rejected-experiments-closeout.md` | 1 | 5,301 | **keep** | Current: `.agents/TODO.md:463` | — |
| `.agents/rounds/2026-09-01-free-improvements-maintenance/` (2 files) | 2 | 46,783 | **keep** | All 2 files retained (Current: `improvements/resolved.json:3728`; Current: `improvements/stellar-docs/sd-048-cap-0075-poseidon2-sbox-degree-contradiction.md:12`) | — |
| `.agents/rounds/2026-09-01-free-improvements-maintenance.md` | 1 | 15,539 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-01-next-actionable-blocks/` (1 files) | 1 | 27,155 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-09-01-protocol-history-attempt-three.md` | 1 | 38,335 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-01-stale-gospel-refresh/passkeys-relayer-matrix.md` | 1 | 25,552 | **keep** | QA (count-only): `eval/qa/corpus` (1f/2m), `eval/qa/tool-cases.json` (1f/2m) | — |
| `.agents/rounds/2026-09-01-stale-gospel-refresh/soroban-core-matrix.md` | 1 | 41,302 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/1m), `eval/qa/corpus` (1f/1m) | — |
| `.agents/rounds/2026-09-01-stale-gospel-refresh/friendbot-lane.md` | 1 | 12,055 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-01-stale-gospel-refresh/usdc-lane.md` | 1 | 7,606 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-02-protocol-history-free-evidence/` (1 files) | 1 | 21,457 | **keep** | Current: `eval/protocol-history-cases-v2.json:13,17`, `eval/self-test.mjs:462,498`; QA (count-only): `eval/protocol-history-blind-cases-v2.json` (1f/2m) | — |
| `.agents/rounds/2026-09-02-protocol-history-free-evidence.md` | 1 | 12,659 | **keep** | Current: `.agents/TODO.md:591` | — |
| `.agents/rounds/2026-09-03-owner-decisions.md` | 1 | 7,901 | **keep** | Current: `.agents/TODO.md:592,1109`, `eval/protocol-history-cases-v2.json:18`, `eval/self-test.mjs:502`; QA (count-only): `eval/protocol-history-blind-cases-v2.json` (1f/1m) | — |
| `.agents/rounds/2026-09-03-truth-maintenance/final-routing-review-terra.md` | 1 | 8,752 | **keep** | Current: `.agents/TODO.md:704` | — |
| `.agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-review-opus.md` | 1 | 15,331 | **keep** | Current: `improvements/stellar-docs/sd-050-js-sdk-package-prose-unscoped.md:16` | — |
| `.agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-terra.md` | 1 | 5,801 | **keep** | Current: `improvements/stellar-docs/sd-050-js-sdk-package-prose-unscoped.md:15`, `improvements/skills/sk-022-oz-upgrade-skill-retired-derive-api.md:15` | — |
| `.agents/rounds/2026-09-03-truth-maintenance/` (8 uncited files) | 8 | 290,025 | **delete** | Uncited working/review/raw files: `candidate-row-review-skills-none-fable.md`, `final-launch-contract-review-opus.md`, `golden-followup-fable.md`, `golden-sol.md`, `post-candidate-measurement-fable.md`, +3 more | — |
| `.agents/rounds/2026-09-08-improvements-docs-fixes/` (1 files) | 1 | 17,515 | **keep** | Current: `improvements/resolved.json:840` | — |
| `.agents/rounds/2026-09-08-improvements-followups/sls023-review-fable.md` | 1 | 26,587 | **keep** | Current: `improvements/resolved.json:2706` | — |
| `.agents/rounds/2026-09-08-improvements-followups/sls024-review-sol.md` | 1 | 17,817 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-08-maintenance-execution.md` | 1 | 20,488 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-08-maintenance-independent-review-grok.md` | 1 | 36,225 | **keep** | Current: `improvements/resolved.json:932` | — |
| `.agents/rounds/2026-09-09-docs-golden-matrix-sol.md` | 1 | 36,957 | **keep** | Current: `improvements/resolved.json:764,821,918` | — |
| `.agents/rounds/2026-09-09-docs-ingestion-sol.md` | 1 | 19,278 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-09-docs-retirement-review-grok.md` | 1 | 29,492 | **keep** | Current: `improvements/resolved.json:764,821,918` | — |
| `.agents/rounds/2026-09-09-drift-141-astra.md` | 1 | 19,004 | **keep** | Current: `ecosystem-skills/PIN-REVIEW.md:412` | — |
| `.agents/rounds/2026-09-09-outstanding-closeout.md` | 1 | 23,997 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-09-scout-retirement-live-terra.md` | 1 | 7,612 | **keep** | Current: `improvements/resolved.json:3748,3768,3788` | — |
| `.agents/rounds/2026-09-09-skill-pin-acceptance-grok.md` | 1 | 13,847 | **keep** | Current: `ecosystem-skills/PIN-REVIEW.md:410` | — |
| `.agents/rounds/2026-09-09-skill-retirement-live-grok.md` | 1 | 10,522 | **keep** | Current: `improvements/resolved.json:2060,2079,2098` | — |
| `.agents/rounds/2026-09-09-truth-maintenance.md` | 1 | 16,170 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-09-upstream-handoffs-grok.md` | 1 | 24,747 | **keep** | Current: `ecosystem-skills/PIN-REVIEW.md:411` | — |
| `.agents/rounds/2026-09-16-docs-resolutions/` (1 files) | 1 | 31,615 | **keep** | Current: `improvements/resolved.json:782,800 (+3)` | — |
| `.agents/rounds/2026-09-16-docs-resolutions.md` | 1 | 8,027 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-16-maintenance-execution.md` | 1 | 19,431 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-16-scout-acceptance.md` | 1 | 6,456 | **keep** | Current: `eval/gates.json:55` | — |
| `.agents/rounds/2026-09-16-trustless-work/source-review.md` | 1 | 7,261 | **keep** | Current: `ecosystem-skills/PIN-REVIEW.md:446` | — |
| `.agents/rounds/2026-09-16-trustless-work/independent-review.md` | 1 | 11,714 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-16-trustless-work-acceptance.md` | 1 | 3,309 | **keep** | Current: `ecosystem-skills/PIN-REVIEW.md:447`, `ecosystem-skills/README.md:138` | — |
| `.agents/rounds/2026-09-16-truth-maintenance/` (2 files) | 2 | 9,157 | **keep** | All 2 files retained (Current: `ecosystem-skills/PIN-REVIEW.md:474`; Current: `eval/gates.json:55`) | — |
| `.agents/rounds/2026-09-17-routing-audit.md` | 1 | 14,658 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-19-stellardocs-include-content.md` | 1 | 7,367 | **keep** | Current: `eval/gates.json:55` | — |
| `.agents/rounds/2026-09-19-stellardocs-result-shape.md` | 1 | 7,704 | **keep** | Current: `eval/gates.json:55` | — |
| `.agents/rounds/2026-09-21-improvements-followup/` (1 files) | 1 | 16,668 | **keep** | Current: `improvements/resolved.json:580` | — |
| `.agents/rounds/2026-09-21-improvements-followup.md` | 1 | 20,474 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-29-truth-maintenance/docs-independent-review.md` | 1 | 10,602 | **keep** | Current: `improvements/resolved.json:897`; QA (count-only): `eval/qa/cases.json` (1f/1m), `eval/qa/corpus` (1f/1m) | — |
| `.agents/rounds/2026-09-29-truth-maintenance/drift-independent-review.md` | 1 | 11,605 | **keep** | Current: `ecosystem-skills/PIN-REVIEW.md:182` | — |
| `.agents/rounds/2026-09-29-truth-maintenance/sd-046-resolution-comments.json` | 1 | 3,609 | **keep** | Current: `improvements/resolved.json:897` | — |
| `.agents/rounds/2026-09-29-truth-maintenance/` (7 uncited files) | 7 | 56,561 | **delete** | Uncited working/review/raw files: `golden-register-independent-review.md`, `horizon-current-query.json`, `horizon-monitor.json`, `scout-rechecks.json`, `sd-046-live.json`, +2 more | — |
| `.agents/rounds/2026-09-29-truth-maintenance.md` | 1 | 14,180 | **keep** | Current: `eval/gates.json:55` | — |
| `.agents/rounds/2026-09-30-raven-next/` (1 files) | 1 | 46,657 | **keep** | Current: `research/decisions/0010-scf-community-fund-skills-stay-unpinned.md:16` | — |
| `.agents/rounds/2026-09-30-raven-next.md` | 1 | 35,271 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-30-repo-audit.md` | 1 | 10,426 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-09-30-skill-system-audit/` (1 files) | 1 | 27,709 | **keep** | Directory cited by `improvements/skills/sk-027-scout-skill-stale-skills-catalog.md:17` | — |
| `.agents/rounds/2026-09-30-skill-system-audit.md` | 1 | 21,641 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-01-audit-verification.md` | 1 | 5,538 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-01-backlog-closeout/golden-followups.md` | 1 | 20,426 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/1m), `eval/qa/corpus` (1f/1m) | — |
| `.agents/rounds/2026-10-01-backlog-closeout/owner-adjudications.md` | 1 | 16,668 | **keep** | Current: `.agents/TODO.md:1099,1110` | — |
| `.agents/rounds/2026-10-01-backlog-closeout/scf-review-astra.md` | 1 | 21,944 | **keep** | Current: `research/decisions/0010-scf-community-fund-skills-stay-unpinned.md:14,70` | — |
| `.agents/rounds/2026-10-01-backlog-closeout/scf-review-fable.md` | 1 | 21,982 | **keep** | Current: `research/decisions/0010-scf-community-fund-skills-stay-unpinned.md:12,69` | — |
| `.agents/rounds/2026-10-01-backlog-closeout/scf-review-grok.md` | 1 | 14,561 | **keep** | Current: `research/decisions/0010-scf-community-fund-skills-stay-unpinned.md:13` | — |
| `.agents/rounds/2026-10-01-backlog-closeout/` (30 uncited files) | 30 | 473,860 | **delete** | Uncited working/review/raw files: `2026-10-12-launch-change/reuse-live-surface.json`, `2026-10-12-launch-change/review-ra-astra.md`, `2026-10-12-launch-change/review-ra2-astra.md`, `2026-10-12-launch-change/review-ra3-astra.md`, `2026-10-12-launch-change/review-ra4-astra.md`, +25 more | — |
| `.agents/rounds/2026-10-01-backlog-closeout.md` | 1 | 11,459 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-02-drift-scout-1.9.61/` (5 files) | 5 | 38,402 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-10-02-drift-scout-1.9.61.md` | 1 | 17,104 | **keep** | Current: `eval/gates.json:55` | — |
| `.agents/rounds/2026-10-02-raven-next-followup/review-improvements-grok.md` | 1 | 11,026 | **keep** | Current: `improvements/resolved.json:968` | — |
| `.agents/rounds/2026-10-02-raven-next-followup/` (9 uncited files) | 9 | 62,376 | **delete** | Uncited working/review/raw files: `ai-bump-lockfile.patch`, `ai-bump-plan.md`, `final-guard-astra.md`, `review-ai-plan-astra.md`, `review-brief-deps.md`, +4 more | — |
| `.agents/rounds/2026-10-02-raven-next-followup.md` | 1 | 18,373 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-02-routing-adapter-repairs/lane-a-report.md` | 1 | 23,593 | **keep** | Current: `eval/gates.json:55` | — |
| `.agents/rounds/2026-10-02-routing-adapter-repairs/review-lane-a-grok.md` | 1 | 15,013 | **keep** | Current: `eval/gates.json:55` | — |
| `.agents/rounds/2026-10-02-routing-adapter-repairs/` (31 uncited files) | 31 | 341,443 | **delete** | Uncited working/review/raw files: `brief-common.md`, `brief-lane-a.md`, `brief-lane-b.md`, `brief-lane-c.md`, `evidence/acronym-max-scoring.ts`, +26 more | — |
| `.agents/rounds/2026-10-02-routing-adapter-repairs.md` | 1 | 17,337 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-06-scout-hackathon-goldens/` (4 files) | 4 | 107,972 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-10-06-scout-hackathon-goldens.md` | 1 | 10,396 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-06-truth-maintenance/sd037-review-sol.md` | 1 | 13,813 | **keep** | Current: `improvements/resolved.json:721` | — |
| `.agents/rounds/2026-10-06-truth-maintenance/` (21 uncited files) | 21 | 893,474 | **delete** | Uncited working/review/raw files: `goldens-fable.md`, `improvements-lane.md`, `pr229-review-sol.md`, `reverify-opus.md`, `review-drift-grok.md`, +16 more | — |
| `.agents/rounds/2026-10-06-truth-maintenance.md` | 1 | 14,703 | **keep** | Current: `eval/gates.json:55` | — |
| `.agents/rounds/2026-10-07-tool-surface-qa.md` | 1 | 35,587 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-08-flagged-row-recollection/` (6 files) | 6 | 40,657 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-10-08-flagged-row-recollection.md` | 1 | 18,674 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-08-maintenance.md` | 1 | 5,398 | **keep** | Current: `.agents/TODO.md:529` | — |
| `.agents/rounds/2026-10-08-routing-repair/` (10 files) | 10 | 214,171 | **keep** | Retained in `.agents/rounds/2026-10-08-maintenance.md:59-61` Outcome for `.agents/TODO.md:529` | — |
| `.agents/rounds/2026-10-09-backlog/` (11 files) | 11 | 417,138 | **keep** | Subdirectory linked by `.agents/TODO.md:530` | — |
| `.agents/rounds/2026-10-09-backlog.md` | 1 | 11,148 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-09-continuation/pack-omission/stored-pack-omissions.json` | 1 | 4,806 | **keep** | Read at runtime by `.agents/rounds/2026-10-12-pack-p9/replay-p9.mjs:117` (linked by `eval/qa/README.md:549`) | — |
| `.agents/rounds/2026-10-09-continuation/` (17 uncited files) | 17 | 413,609 | **delete** | Uncited working/review/raw files: `horizon-current-query.json`, `horizon-monitor.json`, `pack-omission/independent-review.md`, `pack-omission/pack-omission-analysis.md`, `pack-omission/replay-pack-boundary.mjs`, +12 more | — |
| `.agents/rounds/2026-10-09-continuation.md` | 1 | 6,168 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-09-followup/routing-step1/acceptance.mjs` | 1 | 18,295 | **keep** | Current: `.agents/TODO.md:537` | — |
| `.agents/rounds/2026-10-09-followup/` (13 uncited files) | 13 | 690,379 | **delete** | Uncited working/review/raw files: `routing-step1/baseline-fresh-acceptance.json`, `routing-step1/baseline-main-acceptance.json`, `routing-step1/independent-review.md`, `routing-step1/measurement-summary.json`, `routing-step1/routing-step1-report.md`, +8 more | — |
| `.agents/rounds/2026-10-09-followup.md` | 1 | 14,979 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-10-weekend/answer-style/design.md` | 1 | 19,122 | **keep** | Current: `test/mcp-instructions.test.ts:98` | — |
| `.agents/rounds/2026-10-10-weekend/answer-style/result-v2.md` | 1 | 16,982 | **keep** | Current: `.agents/TODO.md:659` | — |
| `.agents/rounds/2026-10-10-weekend/pack-p7/rejudge-artifacts.json` | 1 | 6,005 | **keep** | Read at runtime by `.agents/rounds/2026-10-12-pack-p9/replay-p9.mjs:141` (linked by `eval/qa/README.md:549`) | — |
| `.agents/rounds/2026-10-10-weekend/pack-p8/p8b-artifacts.json` | 1 | 2,101 | **keep** | Read at runtime by `.agents/rounds/2026-10-12-pack-p9/replay-p9.mjs:143` (linked by `eval/qa/README.md:549`) | — |
| `.agents/rounds/2026-10-10-weekend/pack-p8/rejudge-artifacts.json` | 1 | 6,477 | **keep** | Read at runtime by `.agents/rounds/2026-10-12-pack-p9/replay-p9.mjs:142` (linked by `eval/qa/README.md:549`) | — |
| `.agents/rounds/2026-10-10-weekend/` (69 uncited files) | 69 | 1,919,198 | **delete** | Uncited working/review/raw files: `ai-upgrade/demo-steps.mjs`, `ai-upgrade/judge-pin.mjs`, `ai-upgrade/measurement-plan.md`, `ai-upgrade/results.md`, `ai-upgrade/review-delta-fable.md`, +64 more | — |
| `.agents/rounds/2026-10-10-weekend.md` | 1 | 4,832 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-12-baseline-soak/` (35 files) | 35 | 112,370 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-10-12-call-pattern-triage/` (14 files) | 14 | 229,238 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-10-12-call-pattern-triage-review-astra.md` | 1 | 21,032 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-12-call-pattern-triage.md` | 1 | 50,902 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-12-pack-p9/inputs.mjs` | 1 | 3,527 | **keep** | Imported by `.agents/rounds/2026-10-12-pack-p9/replay-p9.mjs:43` (linked by `eval/qa/README.md:549`) | — |
| `.agents/rounds/2026-10-12-pack-p9/replay-p9.mjs` | 1 | 17,026 | **keep** | Current: `eval/qa/README.md:549` | — |
| `.agents/rounds/2026-10-12-pack-p9/result-p9.md` | 1 | 18,117 | **keep** | Current: `.agents/TODO.md:1057` | — |
| `.agents/rounds/2026-10-12-pack-p9/` (13 uncited files) | 13 | 725,812 | **delete** | Uncited working/review/raw files: `analyze-rejudge-p9.mjs`, `design.md`, `launcher/invocations.tsv`, `launcher/run-inv-p9.sh`, `measurement-plan-p9.md`, +8 more | — |
| `.agents/rounds/2026-10-12-weekday.md` | 1 | 3,961 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-13-improvements-followup/` (2 files) | 2 | 13,899 | **keep** | Current: `improvements/resolved.json:541,683` | — |
| `.agents/rounds/2026-10-13-improvements-followup.md` | 1 | 15,079 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-10-15-truth-maintenance.md` | 1 | 13,660 | **keep** | Current: `improvements/resolved.json:3889,3914 (+3)` | — |
| `.agents/rounds/2026-10-27-issue-batch.md` | 1 | 4,819 | **keep** | Current: `improvements/resolved.json:2117,4006` | — |
| `.agents/rounds/2026-10-28-routing-repair/` (47 files) | 47 | 480,661 | **keep** | All 47 files retained (Retained in `.agents/rounds/2026-10-28-routing-repair.md:236-239,265-281` Outcome for `.agents/TODO.md:531` (already pruned in N1); Retained in `.agents/rounds/2026-10-28-routing-repair.md:236-239,265-281` Outcome for `.agents/TODO.md:531` (already pruned in N1); direct: `.agents/TODO.md:581`) | — |
| `.agents/rounds/2026-10-28-routing-repair.md` | 1 | 22,874 | **keep** | Current: `.agents/TODO.md:531` | — |
| `.agents/rounds/2026-11-02-golden-audit.md` | 1 | 12,662 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/4m), `eval/qa/consistency-register.json` (1f/1m), `eval/qa/corpus` (6f/6m), `eval/qa/tool-cases.json` (1f/2m) | — |
| `.agents/rounds/2026-11-02-golden-overnight.md` | 1 | 106,520 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/2m), `eval/qa/corpus` (1f/2m) | — |
| `.agents/rounds/2026-11-02-golden-reverify/` (4 files) | 4 | 149,712 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-11-02-golden-reverify.md` | 1 | 7,093 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-02-grading-policy/` (2 files) | 2 | 14,986 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-11-02-grading-policy.md` | 1 | 10,030 | **keep** | Current: `research/decisions/0008-human-review-eval-and-playground-policy.md:167` | — |
| `.agents/rounds/2026-11-02-mintlify-anchors/` (1 files) | 1 | 14,193 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-11-02-mintlify-anchors.md` | 1 | 1,734 | **keep** | Current: `eval/gates.json:55` | — |
| `.agents/rounds/2026-11-02-mintlify-migration/identifier-probe.json` | 1 | 5,052 | **keep** | Current: `improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md:10` | — |
| `.agents/rounds/2026-11-02-mintlify-migration/responsefield-files.txt` | 1 | 7,536 | **keep** | Saved 93-file `<ResponseField>` input list for `.agents/rounds/2026-11-02-mintlify-migration/rf-rank.mjs:7` (cited by open finding `improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md:9`) | — |
| `.agents/rounds/2026-11-02-mintlify-migration/responsefield-rank.json` | 1 | 26,653 | **keep** | Current: `improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md:9` | — |
| `.agents/rounds/2026-11-02-mintlify-migration/rf-rank.mjs` | 1 | 2,546 | **keep** | Current: `improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md:9` | — |
| `.agents/rounds/2026-11-02-mintlify-migration/sd003-golden-review.md` | 1 | 16,899 | **keep** | Current: `improvements/resolved.json:135` | — |
| `.agents/rounds/2026-11-02-mintlify-migration/sd003-recheck.md` | 1 | 12,790 | **keep** | Current: `improvements/resolved.json:135` | — |
| `.agents/rounds/2026-11-02-mintlify-migration/` (14 uncited files) | 14 | 192,852 | **delete** | Uncited working/review/raw files: `branch-review.md`, `golden-handoff.md`, `ident-probe.mjs`, `page-coverage.json`, `paramfield-rank.json`, +9 more | — |
| `.agents/rounds/2026-11-02-mintlify-migration.md` | 1 | 22,036 | **keep** | Current: `eval/gates.json:55`, `improvements/stellar-docs/sd-009-sep-6-interactive-deprecation-undiscoverable.md:18`, `improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md:12`, `improvements/stellar-docs/sd-005-agentic-payments-no-landscape-positioning.md:22` | — |
| `.agents/rounds/2026-11-02-pr314-review/` (3 files) | 3 | 40,405 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-11-02-pr314-review.md` | 1 | 6,010 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-02-routing-repair/` (5 files) | 5 | 97,120 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-11-02-routing-repair.md` | 1 | 5,319 | **keep** | Current: `.agents/TODO.md:532` | — |
| `.agents/rounds/2026-11-02-stellar-light-pin.md` | 1 | 4,920 | **keep** | Current: `ecosystem-skills/PIN-REVIEW.md:619` | — |
| `.agents/rounds/2026-11-02-upstream-filing/sd-056-retire-review.md` | 1 | 13,367 | **keep** | Current: `improvements/resolved.json:1047` | — |
| `.agents/rounds/2026-11-02-upstream-filing/sd-075-retire-review.md` | 1 | 12,559 | **keep** | Current: `improvements/resolved.json:1325` | — |
| `.agents/rounds/2026-11-02-upstream-filing/hackmeridian-review.md` | 1 | 19,536 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-02-upstream-filing.md` | 1 | 6,192 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-02-upstream-followup/` (3 files) | 3 | 83,028 | **keep** | All 3 files retained (Current: `improvements/resolved.json:19`; Current: `improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md:14`, `improvements/stellar-docs/sd-081-contract-restoration-example-obsolete-xdr.md:12`, `improvements/resolved.json:1027,1067 (+3)`; +1 more) | — |
| `.agents/rounds/2026-11-02-upstream-followup.md` | 1 | 10,919 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-03-cs003-golden-pass-review.md` | 1 | 11,850 | **keep** | Current: `improvements/resolved.json:38` | — |
| `.agents/rounds/2026-11-03-cs003-golden-truth.md` | 1 | 3,814 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-03-demo-createai/repro/README.md` | 1 | 1,179 | **keep** | Subdirectory cited by `.agents/TODO.md:1263` and `improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md:12,79` | — |
| `.agents/rounds/2026-11-03-demo-createai/repro/observed.jsonl` | 1 | 1,108 | **keep** | Subdirectory cited by `.agents/TODO.md:1263` and `improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md:12,79`; direct: `improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md:12` | — |
| `.agents/rounds/2026-11-03-demo-createai/repro/package-lock.json` | 1 | 54,695 | **keep** | Subdirectory cited by `.agents/TODO.md:1263` and `improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md:12,79` | — |
| `.agents/rounds/2026-11-03-demo-createai/repro/package.json` | 1 | 270 | **keep** | Subdirectory cited by `.agents/TODO.md:1263` and `improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md:12,79` | — |
| `.agents/rounds/2026-11-03-demo-createai/repro/repro.mjs` | 1 | 4,077 | **keep** | Subdirectory cited by `.agents/TODO.md:1263` and `improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md:12,79` | — |
| `.agents/rounds/2026-11-03-demo-createai/dry-run.md` | 1 | 10,356 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-03-demo-createai/report.md` | 1 | 5,226 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-03-demo-createai/review-argon.md` | 1 | 5,734 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-03-golden-urls-review.md` | 1 | 27,755 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-03-golden-urls.md` | 1 | 3,256 | **keep** | Current: `improvements/stellar-docs/sd-096-wildcard-redirects-land-on-missing-pages.md:16` | — |
| `.agents/rounds/2026-11-03-hackmeridian-golden-proposals-review.md` | 1 | 9,936 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-03-hackmeridian-golden-proposals.md` | 1 | 4,745 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-03-model-ranking/results.md` | 1 | 5,643 | **keep** | Current: `.agents/TODO.md:489` | — |
| `.agents/rounds/2026-11-03-model-ranking/` (14 uncited files) | 14 | 306,577 | **delete** | Uncited working/review/raw files: `attack-reconciliation.md`, `attacks/attack-argon.md`, `attacks/attack-kimi.md`, `candidates.md`, `contract.md`, +9 more | — |
| `.agents/rounds/2026-11-03-owner-followup.md` | 1 | 18,717 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-03-playground-model-sweep.md` | 1 | 39,982 | **keep** | Current: `.agents/TODO.md:1061` | — |
| `.agents/rounds/2026-11-03-qa-followup.md` | 1 | 12,932 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/2m), `eval/qa/corpus` (1f/2m) | — |
| `.agents/rounds/2026-11-03-scout-1.9.116.md` | 1 | 7,808 | **keep** | Current: `eval/gates.json:55` | — |
| `.agents/rounds/2026-11-03-sd072-resolution-review.md` | 1 | 10,743 | **keep** | Current: `improvements/resolved.json:1287` | — |
| `.agents/rounds/2026-11-03-stellar-dev-pin-review.md` | 1 | 8,317 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-03-upstream-sweep/` (4 files) | 4 | 41,606 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-11-05-truth-maintenance/docs-independent.md` | 1 | 21,369 | **keep** | Current: `improvements/resolved.json:1104,1141 (+18)` | — |
| `.agents/rounds/2026-11-05-truth-maintenance/docs.md` | 1 | 53,216 | **keep** | Current: `.agents/TODO.md:418`, `improvements/stellar-docs/sd-014-transaction-inclusion-proof-boundaries.md:20`, `improvements/stellar-docs/sd-077-stellar-org-marketing-grants-pre-launch-eligibility-conflict.md:20`, `improvements/stellar-docs/sd-004-rpc-limits-described-as-hardcoded.md:18` (+10 more files) | — |
| `.agents/rounds/2026-11-05-truth-maintenance/drift-review.md` | 1 | 7,240 | **keep** | Current: `ecosystem-skills/PIN-REVIEW.md:648` | — |
| `.agents/rounds/2026-11-05-truth-maintenance/other.md` | 1 | 50,696 | **keep** | Current: `.agents/TODO.md:435`, `improvements/lumenloop/ll-017-semantic-person-match-provenance.md:24`, `improvements/lumenloop/ll-025-quantum-roadmap-maturity-typing.md:16`, `improvements/lumenloop/ll-006-article-ranking-freshness.md:18` (+55 more files) | — |
| `.agents/rounds/2026-11-05-truth-maintenance/scout-golden-changes.md` | 1 | 7,761 | **keep** | QA (count-only): `eval/qa/corpus` (1f/2m), `eval/qa/tool-cases.json` (1f/2m) | — |
| `.agents/rounds/2026-11-05-truth-maintenance/scout-golden-review.md` | 1 | 14,670 | **keep** | Current: `improvements/resolved.json:4024,4042 (+7)` | — |
| `.agents/rounds/2026-11-05-truth-maintenance/scout.md` | 1 | 34,381 | **keep** | Current: `improvements/stellar-light-scout/sls-039-project-tvl-history-capability.md:18`; QA (count-only): `eval/qa/cases.json` (1f/2m), `eval/qa/corpus` (2f/3m), `eval/qa/tool-cases.json` (1f/1m) | — |
| `.agents/rounds/2026-11-05-truth-maintenance/upstream-independent.md` | 1 | 19,401 | **keep** | Current: `improvements/resolved.json:74,2235 (+9)` | — |
| `.agents/rounds/2026-11-05-truth-maintenance/` (7 uncited files) | 7 | 118,386 | **delete** | Uncited working/review/raw files: `docs-golden-proposals.md`, `docs-retirement-review.md`, `final-mechanics-review.md`, `handoffs.json`, `other-actions.json`, +2 more | — |
| `.agents/rounds/2026-11-05-truth-maintenance.md` | 1 | 12,341 | **keep** | Current: `.agents/TODO.md:401`, `ecosystem-skills/PIN-REVIEW.md:646` | — |
| `.agents/rounds/2026-11-06-assets-type-handoff.md` | 1 | 5,598 | **keep** | Current: `ecosystem-skills/PIN-REVIEW.md:669` | — |
| `.agents/rounds/2026-11-06-main-only-cleanup/` (2 files) | 2 | 26,656 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `.agents/rounds/2026-11-06-main-only-cleanup.md` | 1 | 4,878 | **keep** | Linked by `.agents/rounds/2026-11-03-playground-model-sweep.md:467` Outcome | — |
| `.agents/rounds/2026-11-06-playground-final-resolution.md` | 1 | 47,835 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-06-playground-resume.md` | 1 | 19,997 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-06-remaining-sweep/cross-review.md` | 1 | 32,058 | **keep** | Current: `improvements/lumenloop/ll-022-cctp-milestone-provenance.md:8`, `improvements/stellar-docs/sd-081-contract-restoration-example-obsolete-xdr.md:11,22`, `improvements/resolved.json:4061` | — |
| `.agents/rounds/2026-11-06-remaining-sweep/docs.md` | 1 | 21,336 | **keep** | Current: `.agents/TODO.md:419`, `improvements/stellar-docs/sd-061-claimable-balance-id-via-getledgerentries.md:9`, `improvements/stellar-docs/sd-081-contract-restoration-example-obsolete-xdr.md:22` | — |
| `.agents/rounds/2026-11-06-remaining-sweep/other.md` | 1 | 64,481 | **keep** | Current: `improvements/lumenloop/ll-017-semantic-person-match-provenance.md:8`, `improvements/lumenloop/ll-025-quantum-roadmap-maturity-typing.md:7`, `improvements/lumenloop/ll-006-article-ranking-freshness.md:8`, `improvements/lumenloop/ll-026-event-announcement-effective-date-separation.md:7` (+6 more files) | — |
| `.agents/rounds/2026-11-06-remaining-sweep/sls097-author.md` | 1 | 11,470 | **keep** | Current: `improvements/resolved.json:4061` | — |
| `.agents/rounds/2026-11-06-remaining-sweep/` (5 uncited files) | 5 | 363,178 | **delete** | Uncited working/review/raw files: `alias-review.md`, `alias.md`, `docs-actions.json`, `other-actions.json`, `sls097-preparation.md` | — |
| `.agents/rounds/2026-11-06-remaining-sweep.md` | 1 | 7,372 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-06-skill-handoff/` (2 files) | 2 | 23,221 | **keep** | All 2 files retained (Current: `ecosystem-skills/PIN-REVIEW.md:134`; Current: `ecosystem-skills/PIN-REVIEW.md:133`) | — |
| `.agents/rounds/2026-11-06-skill-handoff.md` | 1 | 5,802 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-09-improvements-sweep.md` | 1 | 9,461 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-09-playground-resumption.md` | 1 | 6,070 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-09-upstream-handoffs.md` | 1 | 8,051 | **keep** | Current: `ecosystem-skills/PIN-REVIEW.md:109`, `improvements/resolved.json:640,988 (+11)` | — |
| `.agents/rounds/2026-11-10-truth-maintenance.md` | 1 | 11,652 | **keep** | Current: `.agents/TODO.md:429`, `improvements/resolved.json:56,1735` | — |
| `.agents/rounds/2026-11-11-sd103-sd104-retirement.md` | 1 | 2,958 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `.agents/rounds/2026-11-12-fp.md` | 1 | 12,134 | **keep** | Current: `.agents/TODO.md:80` | — |
| `.agents/rounds/2026-11-12-truth-maintenance.md` | 1 | 19,022 | **keep** | Current: `.agents/TODO.md:308,452` | — |
| `.agents/rounds/2026-11-14-baseline-tuning/` (18 files) | 18 | 352,904 | **keep** | All 18 files retained (Retained in `.agents/rounds/2026-11-14-baseline-tuning.md:151-159` Outcome (reconciled in round item 0.4; cited by `.agents/TODO.md`, `eval/qa/heldout-read.sh`, `improvements/`, and QA provenance); direct: `.agents/TODO.md:757`; Retained in `.agents/rounds/2026-11-14-baseline-tuning.md:151-159` Outcome (reconciled in round item 0.4; cited by `.agents/TODO.md`, `eval/qa/heldout-read.sh`, `improvements/`, and QA provenance); +5 more) | — |
| `.agents/rounds/2026-11-14-baseline-tuning.md` | 1 | 10,969 | **keep** | Current: `.agents/TODO.md:62` | — |
| `.agents/rounds/2026-11-14-golden-coverage-audit.md` | 1 | 16,570 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/242m), `eval/qa/corpus` (530f/537m), `eval/qa/sample.json` (1f/26m), `eval/qa/tool-cases.json` (1f/3m) | — |
| `.agents/rounds/2026-11-15-tuning-loop-2/` (84 files) | 84 | 945,788 | **keep** | Retained in `.agents/rounds/2026-11-15-tuning-loop-2.md:515-521` Outcome (reconciled in round item 0.4; `.agents/TODO.md:185` cites `P0`, `P1`, `P2`, `R`, and `scans/`) | — |
| `.agents/rounds/2026-11-15-tuning-loop-2.md` | 1 | 50,788 | **keep** | Current: `.agents/TODO.md:63,124 (+2)` | — |
| `research/audits/2026-07-03-full-audit.md` | 1 | 13,700 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/audits/2026-07-10-gt41-soroban-empirical-findings.md` | 1 | 2,051 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/audits/2026-07-11-eval-round-orchestration.md` | 1 | 5,962 | **keep** | Current: `.agents/skills/run-evals/SKILL.md:43` | — |
| `research/audits/2026-07-11-gt42-archival-events-reflector.md` | 1 | 1,186 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/audits/2026-07-11-gt43-sac-sep41-bn254.md` | 1 | 1,448 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/audits/2026-07-11-super-corpus-design.md` | 1 | 51,488 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/2m), `eval/qa/corpus` (1f/2m) | — |
| `research/audits/2026-08-07-codegen-partner-report.md` | 1 | 16,890 | **keep** | Current: `ideas/README.md:20`, `.agents/TODO.md:360,478,1382` | — |
| `research/audits/2026-08-27-qa-postflight-keepalive.md` | 1 | 1,664 | **keep** | Current: `eval/report-live-surface.mjs:63`, `eval/qa/run-qa.mjs:1228` | — |
| `research/audits/2026-09-14-golden-freshness-review.md` | 1 | 28,420 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/audits/2026-09-17-routing-audit/golden-and-pipeline-review.md` | 1 | 28,621 | **keep** | Current: `improvements/lumenloop/ll-013-scf-submission-award-fields.md:24` | — |
| `research/audits/2026-09-17-routing-audit/m1-c1-passkeys-loss-review.md` | 1 | 7,147 | **keep** | Current: `.agents/TODO.md:693` | — |
| `research/audits/2026-09-17-routing-audit/porter-stem-experiment.md` | 1 | 8,207 | **keep** | Current: `improvements/canonical-source/cs-001-codemode-search-short-token-prefix.md:14` | — |
| `research/audits/2026-09-17-routing-audit/scorer-followup-plan.md` | 1 | 16,128 | **keep** | Current: `improvements/canonical-source/cs-001-codemode-search-short-token-prefix.md:14` | — |
| `research/audits/2026-09-17-routing-audit/upstream-prefix-review.md` | 1 | 10,012 | **keep** | Current: `improvements/canonical-source/cs-001-codemode-search-short-token-prefix.md:13` | — |
| `research/audits/2026-09-17-routing-audit/` (4 uncited files) | 4 | 49,700 | **delete** | Uncited working/review/raw files: `aquarius-description-roles.md`, `direction-review.md`, `register-review.md`, `soroswap-contract-role.md` | — |
| `research/audits/2026-10-01-playground-accounting-coverage.md` | 1 | 2,882 | **keep** | Current: `eval/playground/README.md:102` | — |
| `research/audits/2026-11-02-golden-freshness-probe/` (6 files) | 6 | 112,088 | **keep** | All 6 files retained (`README.md` (cited by `eval/qa/README.md:372`, `eval/qa/source-sentinels.mjs:14`) links all 5 JSON data tables (`probes.json`, `controls.json`, `results.json`, `sentinel-controls.json`, `quote-sweep.json`) to interpret retained recall/false-alarm figures; direct: `eval/qa/README.md:372`, `eval/qa/source-sentinels.mjs:14`; `README.md` (cited by `eval/qa/README.md:372`, `eval/qa/source-sentinels.mjs:14`) links all 5 JSON data tables (`probes.json`, `controls.json`, `results.json`, `sentinel-controls.json`, `quote-sweep.json`) to interpret retained recall/false-alarm figures) | — |
| `research/audits/2026-11-02-golden-overnight/audit-bank-stage-receipts.json` | 1 | 2,990 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/2m), `eval/qa/corpus` (1f/2m) | — |
| `research/audits/2026-11-02-golden-overnight/issuer-lock-core-receipts.json` | 1 | 9,457 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/2m), `eval/qa/corpus` (1f/2m) | — |
| `research/audits/2026-11-02-golden-overnight/reference-correction-review.md` | 1 | 4,875 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/2m), `eval/qa/corpus` (1f/2m) | — |
| `research/audits/2026-11-02-golden-overnight/` (20 uncited files) | 20 | 172,213 | **delete** | Uncited working/review/raw files: `README.md`, `authorization-source-receipts.json`, `cost-observations.json`, `final-closeout-review.md`, `horizon-strict-send-receipts.json`, +15 more | — |
| `research/audits/2026-11-03-playground-model-recheck.md` | 1 | 7,544 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/audits/2026-11-03-playground-model-sweep.md` | 1 | 17,343 | **keep** | Referenced by `src/demo/model-config.ts:229` ('2026-11-03 (sweep record in research/audits)') | — |
| `research/audits/2026-11-03-qa-followup/additional-source-triage.md` | 1 | 2,800 | **keep** | Current: `.agents/TODO.md:343` | — |
| `research/audits/2026-11-03-qa-followup/blind-reference-matrix.json` | 1 | 11,834 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/2m), `eval/qa/corpus` (1f/2m) | — |
| `research/audits/2026-11-03-qa-followup/bounty-policy-access.json` | 1 | 1,213 | **keep** | Current: `.agents/TODO.md:344` | — |
| `research/audits/2026-11-03-qa-followup/reference-approval.md` | 1 | 5,785 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/2m), `eval/qa/corpus` (1f/2m) | — |
| `research/audits/2026-11-03-qa-followup/reference-corroboration.json` | 1 | 10,279 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/2m), `eval/qa/corpus` (1f/2m) | — |
| `research/audits/2026-11-03-qa-followup/reference-review-v1.md` | 1 | 9,225 | **keep** | QA (count-only): `eval/qa/cases.json` (1f/2m), `eval/qa/corpus` (1f/2m) | — |
| `research/audits/2026-11-03-qa-followup/` (32 uncited files) | 32 | 1,071,369 | **delete** | Uncited working/review/raw files: `README.md`, `additional-source-findings.initial24.json`, `additional-source-findings.json`, `additional-source-triage.initial24.md`, `additional-stellar-docs-manifest.json`, +27 more | — |
| `research/audits/2026-11-03-scout-1.9.116-routing.json` | 1 | 13,319 | **keep** | Named as retained evidence in `.agents/rounds/2026-11-03-scout-1.9.116.md:130` Outcome for `eval/gates.json` and `.agents/TODO.md` | — |
| `research/audits/2026-11-05-drift-routing.json` | 1 | 13,486 | **keep** | Schema-drift enumeration cited by `.agents/rounds/2026-11-05-truth-maintenance/drift-review.md:12` (retained for `ecosystem-skills/PIN-REVIEW.md:648`) and `.agents/rounds/2026-11-05-truth-maintenance.md:45` | — |
| `research/audits/2026-11-05-improvements/` (22 files) | 22 | 194,403 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `research/audits/2026-11-06-assets-type-handoff/independent-review.md` | 1 | 20,465 | **keep** | Current: `improvements/resolved.json:2256` | — |
| `research/audits/2026-11-06-assets-type-handoff/` (7 uncited files) | 7 | 6,721 | **delete** | Uncited working/review/raw files: `compile-results.json`, `public-comments.json`, `root-docs-residual.json`, `root-live.json`, `routing-comparison.json`, +2 more | — |
| `research/audits/2026-11-06-main-only-cleanup/` (2 files) | 2 | 176,134 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `research/audits/2026-11-06-playground-final-resolution/handoff-retirement-review.md` | 1 | 26,612 | **keep** | Current: `improvements/resolved.json:1638,1658` | — |
| `research/audits/2026-11-06-playground-final-resolution/` (17 uncited files) | 17 | 165,313 | **delete** | Uncited working/review/raw files: `README.md`, `blind-packets.md`, `blind-packets.mjs`, `blind-packets.test.mjs`, `calibration-summary.json`, +12 more | — |
| `research/audits/2026-11-06-remaining-sweep/live-host-check.mjs` | 1 | 3,245 | **keep** | Current: `.agents/TODO.md:1457` | — |
| `research/audits/2026-11-06-remaining-sweep/other-receipt.json` | 1 | 412,104 | **keep** | Current: `improvements/lumenloop/ll-017-semantic-person-match-provenance.md:8`, `improvements/lumenloop/ll-025-quantum-roadmap-maturity-typing.md:7`, `improvements/lumenloop/ll-006-article-ranking-freshness.md:8`, `improvements/lumenloop/ll-026-event-announcement-effective-date-separation.md:7` (+6 more files) | — |
| `research/audits/2026-11-06-remaining-sweep/` (39 uncited files) | 39 | 165,466 | **delete** | Uncited working/review/raw files: `coverage.json`, `docs-evidence.json`, `docs-github.py`, `docs-live.py`, `docs-protocol.py`, +34 more | — |
| `research/audits/2026-11-09-improvements-sweep/lane-docs.md` | 1 | 85,747 | **keep** | Current: `improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md:8` | — |
| `research/audits/2026-11-09-improvements-sweep/lane-lumenloop.md` | 1 | 105,569 | **keep** | Current: `improvements/lumenloop/ll-017-semantic-person-match-provenance.md:7`, `improvements/lumenloop/ll-025-quantum-roadmap-maturity-typing.md:14`, `improvements/lumenloop/ll-006-article-ranking-freshness.md:7`, `improvements/lumenloop/ll-026-event-announcement-effective-date-separation.md:17` (+33 more files) | — |
| `research/audits/2026-11-09-improvements-sweep/lane-scout.md` | 1 | 71,034 | **keep** | Current: `improvements/stellar-light-scout/sls-039-project-tvl-history-capability.md:8` | — |
| `research/audits/2026-11-09-improvements-sweep/review-astra-sd100.md` | 1 | 11,881 | **keep** | Current: `improvements/resolved.json:1715` | — |
| `research/audits/2026-11-09-improvements-sweep/review-astra.md` | 1 | 30,206 | **keep** | Current: `improvements/resolved.json:4097,4115 (+3)` | — |
| `research/audits/2026-11-09-improvements-sweep/review-fable.md` | 1 | 24,970 | **keep** | Current: `improvements/resolved.json:1159,2278` | — |
| `research/audits/2026-11-09-improvements-sweep/lane-skills.md` | 1 | 46,651 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/audits/2026-11-09-improvements-sweep/review-gold-fable.md` | 1 | 16,177 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/audits/2026-11-09-improvements-sweep/review-lct-fable.md` | 1 | 14,173 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file; listed only in `eval/qa/case-text-baseline.json` ratchet (stale entry removed per `test/case-text-scan.test.mjs`) | — |
| `research/audits/2026-11-09-playground-product-decision.md` | 1 | 12,712 | **keep** | Current: `.agents/TODO.md:799`, `scripts/run-demo-model-gauntlet.mjs:50`, `eval/playground/README.md:42` | — |
| `research/audits/2026-11-10-playground-gpt61-terra-recheck.md` | 1 | 5,240 | **keep** | Current: `scripts/run-demo-model-gauntlet.mjs:49`, `eval/playground/README.md:42`, `eval/EVALS.md:136` | — |
| `research/audits/2026-11-10-truth-maintenance/` (4 files) | 4 | 88,640 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `research/audits/2026-11-11-sd103-sd104/` (1 files) | 1 | 11,227 | **keep** | Current: `improvements/resolved.json:1754,1773` | — |
| `research/audits/2026-11-12-first-principles-round.md` | 1 | 14,085 | **keep** | Current: `.agents/TODO.md:81`, `research/decisions/0011-tool-surface-stays-code-mode-trimmed.md:12` | — |
| `research/audits/2026-11-12-truth-maintenance/review-caps-fable.md` | 1 | 16,482 | **keep** | Current: `.agents/TODO.md:331`, `improvements/resolved.json:2727,2819` | — |
| `research/audits/2026-11-12-truth-maintenance/review-retire-astra.md` | 1 | 59,927 | **keep** | Current: `improvements/stellar-light-scout/sls-116-scf-earlier-round-award-coverage.md:12`, `improvements/resolved.json:2727,2819 (+3)` | — |
| `research/audits/2026-11-12-truth-maintenance/` (9 uncited files) | 9 | 223,507 | **delete** | Uncited working/review/raw files: `caps-lifecycle-matrix.md`, `caps-oracle-matrix.md`, `caps-remittance-matrix.md`, `caps-report.md`, `comb-other.md`, +4 more | — |
| `research/audits/2026-11-14-caps-audit-review.md` | 1 | 17,733 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/audits/2026-11-14-caps-audit.md` | 1 | 40,125 | **keep** | Current: `.agents/TODO.md:116` | — |
| `research/audits/2026-11-14-client-text-limits/` (24 files) | 24 | 147,383 | **keep** | Evidence folder (`README.md`, `results.json`, `probe/`) linked by `research/audits/2026-11-14-client-text-limits.md:6,104,184` (cited by `.agents/TODO.md:161` and `test/helpers/mcp-tool-metadata.ts:37`) | — |
| `research/audits/2026-11-14-client-text-limits.md` | 1 | 26,111 | **keep** | Current: `.agents/TODO.md:161`, `test/helpers/mcp-tool-metadata.ts:37` | — |
| `research/audits/2026-11-14-family-decider/` (3 files) | 3 | 29,878 | **keep** | Explicitly carried over by `research/audits/2026-11-14-family-decider.md:5` (cited by `.agents/TODO.md:224`) | — |
| `research/audits/2026-11-14-family-decider.md` | 1 | 15,972 | **keep** | Current: `.agents/TODO.md:224` | — |
| `research/audits/2026-11-14-mcp-peer-survey/` (15 files) | 15 | 37,687 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs any file in this folder | — |
| `research/audits/2026-11-14-mcp-peer-survey.md` | 1 | 35,976 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/demo-playground-design.md` | 1 | 22,363 | **keep** | Current: `ideas/playground-chatgpt-subscription-login.md:83`, `ideas/shareable-durable-playground-sessions.md:452` | — |
| `research/evidence-poor-retrieval-2026-07-13.md` | 1 | 8,220 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/gauntlets/2026-11-03-sweep-probe-gemini-passthrough-summary.md` | 1 | 711 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/gauntlets/2026-11-03-sweep-probe-summary.md` | 1 | 4,688 | **keep** | Current: `scripts/run-demo-model-gauntlet.mjs:48`, `eval/playground/README.md:167`, `eval/EVALS.md:113` | — |
| `research/gauntlets/2026-11-03-sweep-stage1-low-summary.md` | 1 | 927 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/gauntlets/2026-11-03-sweep-stage1-summary.md` | 1 | 10,848 | **keep** | 2026-11-03 sweep summary for `anthropic/claude-sonnet-5.5`, `xai/grok-4.7`, `openai/gpt-6.1-terra`, and `anthropic/claude-haiku-5.5` under `research/gauntlets/` (`scripts/run-demo-model-gauntlet.mjs:53`) | — |
| `research/gauntlets/2026-11-03-sweep-stage1b-astra1-summary.md` | 1 | 991 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/gauntlets/2026-11-03-sweep-stage1b-astra2-summary.md` | 1 | 689 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/gauntlets/2026-11-03-sweep-stage1b-deepseek-summary.md` | 1 | 2,053 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/gauntlets/2026-11-03-sweep-stage1b-grok1-summary.md` | 1 | 786 | **keep** | 2026-11-03 sweep summary for `xai/grok-4.7` under `research/gauntlets/` (`scripts/run-demo-model-gauntlet.mjs:53`) | — |
| `research/gauntlets/2026-11-03-sweep-stage1b-grok2-summary.md` | 1 | 1,182 | **keep** | 2026-11-03 sweep summary for `xai/grok-4.7` under `research/gauntlets/` (`scripts/run-demo-model-gauntlet.mjs:53`) | — |
| `research/gauntlets/2026-11-03-sweep-stage1b-six-summary.md` | 1 | 4,090 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/gauntlets/2026-11-03-sweep-stage1c-astra-summary.md` | 1 | 686 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/gauntlets/2026-11-03-sweep-stage1c-muse-summary.md` | 1 | 805 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/listing-carousel-evidence-2026-10-07.md` | 1 | 6,902 | **keep** | Current: `assets/brand/listing.md:6`, `assets/brand/README.md:13` | — |
| `research/observability-cloudflare.md` | 1 | 12,781 | **keep** | Current: `wrangler.jsonc:116` | — |
| `research/partner-doc-source-onboarding.md` | 1 | 19,682 | **keep** | Current: `ideas/partner-doc-live-sources.md:7,126,185`, `eval/partner-docs/README.md:69`, `eval/partner-docs/cases.json:217`, `scripts/eval-partner-docs.mjs:22` | — |
| `research/prior-art.md` | 1 | 29,190 | **keep** | QA (count-only): `eval/corpus` (2f/2m) | — |
| `research/qa-deep-dive-2026-08-25/fable-max.md` | 1 | 55,845 | **keep** | Current: `ideas/source-delivery-ranked-references.md:479` | — |
| `research/qa-deep-dive-2026-08-25/grok-xhigh.md` | 1 | 42,230 | **keep** | Current: `ideas/source-delivery-ranked-references.md:481` | — |
| `research/qa-deep-dive-2026-08-25/receipts/wisdomtree-live-sources.json` | 1 | 36,240 | **keep** | Current: `scripts/catalog-data/known-aliases.mjs:13`, `test/catalog.test.ts:29` | — |
| `research/qa-deep-dive-2026-08-25/receipts/wisdomtree-toml.txt` | 1 | 16,201 | **keep** | Current: `scripts/catalog-data/known-aliases.mjs:17`, `test/catalog.test.ts:33` | — |
| `research/qa-deep-dive-2026-08-25/sol-max.md` | 1 | 33,678 | **keep** | Current: `ideas/source-delivery-ranked-references.md:483` | — |
| `research/qa-deep-dive-2026-08-25/terra-max.md` | 1 | 24,662 | **keep** | Current: `ideas/source-delivery-ranked-references.md:477` | — |
| `research/qa-deep-dive-2026-08-25/review-judge.md` | 1 | 17,777 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/qa-improvement-plan-2026-08-25.md` | 1 | 11,908 | **keep** | Current: `ideas/source-delivery-ranked-references.md:7,475` | — |
| `research/retired-skill-guidance.md` | 1 | 1,548 | **keep** | Cited in `research/skill-exposure-inventory.json:174,224` (`evidenceRefs`), which is a live test-enforced artifact (`test/skill-exposure-classification.test.ts:20`, `ecosystem-skills/README.md:146,164`) | — |
| `research/services/lumenloop.md` | 1 | 23,789 | **keep** | Current: `scripts/refresh-inventory.mjs:276`, `inventory/lumenloop.json:9177`, `eval/plan/README.md:16`, `eval/plan/coverage-rules.json:2,7 (+10)` (+1 more files) | — |
| `research/services/stellar-docs-algolia.md` | 1 | 35,672 | **delete** | No current artifact, QA provenance scope, or retained ledger Outcome cites or needs this file | — |
| `research/services/stellar-docs-mintlify.md` | 1 | 13,135 | **keep** | Current: `specs/stellar-docs.json:7`, `scripts/refresh-inventory.mjs:516`, `docs/stellar-docs.md:6`, `inventory/stellar-docs.json:56` (+2 more files) | — |
| `research/services/stellar-docs-spec-design.md` | 1 | 13,796 | **keep** | Current: `specs/stellar-docs.json:7` | — |
| `research/services/stellar-light.md` | 1 | 29,237 | **keep** | Current: `scripts/refresh-inventory.mjs:344`, `eval/plan/build-op-classes.mjs:56`, `eval/plan/README.md:16`, `eval/plan/coverage-rules.json:2,21 (+14)` (+1 more files) | — |
| `research/services/stellar-org-queries.json` | 1 | 22,322 | **keep** | Query set linked by `research/services/stellar-org-site.md:6` (cited by `ARCHITECTURE.md:409`, `specs/stellar-org.json:7`, `scripts/refresh-inventory.mjs:550`) and read by running-round `2026-11-16-next-phase/items/3.3/measure.mts:57` | — |
| `research/services/stellar-org-site.md` | 1 | 8,262 | **keep** | Current: `specs/stellar-org.json:7,16`, `scripts/refresh-inventory.mjs:550,575`, `scripts/build-catalog.mjs:887`, `inventory/stellar-org.json:32` (+4 more files) | — |
| `research/skill-exposure-inventory.json` | 1 | 45,874 | **keep** | Current: `ecosystem-skills/README.md:146,164`, `test/skill-exposure-classification.test.ts:20`, `research/decisions/0010-scf-community-fund-skills-stay-unpinned.md:64` | — |
| `research/skill-exposure-inventory.md` | 1 | 5,143 | **keep** | Current: `ideas/skill-discovery-without-bundling.md:97` | — |
| `research/skill-run-design.md` | 1 | 61,151 | **keep** | Current: `test/fixtures/evidence-pack.mjs:1073,1178`, `scripts/build-super-spec.mjs:886`, `specs/super-spec.json:7427`; QA (count-only): `eval/qa/corpus` (1f/2m), `eval/qa/reviewed` (1f/1m) | — |
