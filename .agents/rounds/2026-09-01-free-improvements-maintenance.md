# Free improvements maintenance — 2026-09-01

## Scope

This round completes the next free block from `.agents/NEXT.md`.
It reads three upstream issue states, runs free Scout readings, and reviews the deletion candidates.
It creates no paid eval, deployment, production edit, or Algolia write.
Untouched upstream issues stay quiet.

## Route cards

### Live evidence

- Lane: Collect current issue states, author-side live rechecks, and the `sls-080` Scout reading.
- Worker CLI: Codex.
- Model: `gpt-5.6-terra`.
- Effort: `high`.
- Reason: This lane is bounded data collection and tool use.
- Verified: Herdr started the configured model and effort in `w1H:p2`.
- Fallback: `gpt-5.6-sol` at `high`.
- Reviewer: Opus 5 at `high` for deletion decisions.
- Report contract: Write current states, commands, response fields, risks, and blockers.

### Deletion review

- Lane: Independently re-derive whether `sd-001`, `sd-036`, and `sk-020` can leave the active queue.
- Worker CLI: Claude.
- Model: Opus 5 through `--model opus`.
- Effort: `high`.
- Reason: This lane needs precision review and costly deletion judgment.
- Verified: Herdr started the configured model and effort in `w1H:p3`.
- Fallback: `gpt-5.6-sol` at `high`.
- Reviewer: A later Grok 4.6 gate will review the final diff.
- Report contract: Write one verdict per candidate, independent rechecks, reference cleanup, and blockers.

### `sls-080` lifecycle review

- Lane: Independently decide whether the new source-parity result permits `sls-080` resolution.
- Worker CLI: Grok.
- Model: `grok-4.6`.
- Effort: `high`.
- Reason: This lane needs a vendor-diverse service-contract review.
- Verified: Herdr started the configured model and effort in `w1H:p4`.
- Fallback: `gpt-5.6-sol` at `high`.
- Reviewer: The final diff receives a separate review after implementation.
- Report contract: Re-run the exact trigger, verify source parity, inspect references, and give a lifecycle verdict.

### Safe pre-resolution review

- Lane: Review the proposed successor, canary, recurrence evidence, and record truth.
- Worker CLI: Claude.
- Model: Fable 5 through `--model fable`.
- Effort: `high`.
- Reason: This lane needs product, API, and maintainer-facing prose judgment.
- Verified: Herdr started the configured model and effort in `w1H:p6`.
- Fallback: Opus 5 at `high`.
- Reviewer: A later final-diff reviewer remains required after closeout.
- Report contract: Record severity, exact evidence, and the smallest repair for each finding.

## Upstream state table

| finding | trigger evidence | upstream ref | ref state | PR checks/reviews | live re-check | action |
|---|---|---|---|---|---|---|
| `sls-074` | resolved record; exact audit identifier and absent control | `Stellar-Light/stellarlight#1031` | open; no close reason | no linked work; only Raven's 2026-08-28 resolution comment | 2026-09-01 orchestrator recheck below: `V-SOR-APP-VUL-003` returns the Veridise row without `exactMiss`; `V-SOR-APP-VUL-999` retains `exactMiss` | Keep quiet; the maintainer owns closure. |
| `sls-080` | exact Horizon source-parity question | `Stellar-Light/stellarlight#1134` | closed completed | PR #1136 and follow-up PR #1174 merged | 2026-09-01: answer and source at `82660510ecda7fd365a14d08badb9d85fa22bc32` both equal `28` | Independent lifecycle review pending. |
| `sd-047` | current raw cadence sentences | `stellar/stellar-docs#2805` | open; no close reason | PR #2806 remains open | 2026-09-01: Validators still says 3-5 seconds; Stellar Stack still says 5-7 seconds | Retain and record recurrence. |

## Deletion candidates

| finding | author live recheck | independent review | persistent references | upstream comment | resolver receipt |
|---|---|---|---|---|---|
| `sd-001` | PASS; settled full reindex and controls hold | Opus 5 high: PASS | harness and README cleanup complete; intake removal waits for the resolver | not applicable; never filed | gated; do not run yet |
| `sd-036` | PASS for the named field-selector defect | Opus 5 high: SUCCESSOR | `sd-048` added; golden reconciliation remains gated | required on issue #1980 | gated; do not run yet |
| `sk-020` | PASS; upstream source and deployed skill use `stellardev` | Opus 5 high: PASS | no active non-generated cleanup identified | required on issue #113 | gated; do not run yet |
| `sls-080` | PASS; source parity holds | Grok 4.6 high: DEFER | `TODO.md` and `NEXT.md` changes remain gated | required on issue #1134 | gated; lifecycle bars remain open |

## Reviewer outcomes

- Opus 5 high approved later retirement for `sd-001` and `sk-020`.
- Opus 5 high required successor `sd-048` before later `sd-036` retirement.
- Grok 4.6 high confirmed the live `sls-080` fix and deferred retirement.
- The `sls-080` status, evidence prose, comment, and queue references still block retirement.
- Fable 5 high found two medium record-truth issues and six lower findings in the safe preflight.
- This round reconciled F1 through F8 before the safe checkpoint.

## Orchestrator recheck for resolved `sls-074`

The orchestrator ran the current trigger and absent control on 2026-09-01.
It called `scout.searchResearch({ q, source: "audit", limit: 2 })` through the local Raven server.
`V-SOR-APP-VUL-003` returned the Veridise report first at section `V-SOR-APP-VUL-003:`.
That result had no `meta.exactMiss` and had `generatedAt` `2026-09-01T18:31:09.456Z`.
`V-SOR-APP-VUL-999` retained `meta.exactMiss` at `2026-09-01T18:31:09.827Z`.
This recheck supports the ledger row and does not justify another upstream comment.

## Safe pre-resolution implementation

- Added proposed successor `sd-048` with pinned CAP, ABI, and host evidence.
- Added the `sd-048` intake override for `stellar/stellar-protocol`.
- Replaced the obsolete `sd-001` meeting target with a monitor-only rank-one canary.
- Recorded `sd-001` as fixed pending retirement in `improvements/README.md`.

## Remaining gated actions

1. Do not change a lifecycle status until the authorized closeout lane starts.
2. Reconcile the `sd-036` golden through the `golden-truth` skill before retirement.
3. Do not edit `.agents/TODO.md` or `.agents/NEXT.md` until the authorized closeout lane starts.
4. Post and read back the required resolution comments before any applicable resolver run.
5. Keep `sd-048` proposed until an authorized filing lane reviews and files it. The verified
   evidence bar is already met; that lane reviews the prose and owner, not the source facts.
6. Run each resolver only after all finding-specific bars pass.
7. Run the separate final-diff review before round closeout.

## Validation

- `npm run improvements:index`: PASS; wrote `improvements/INDEX.md` with 70 findings.
- `npm run improvements:lint`: PASS; `improvements lint ok (70 findings)`.
- `node scripts/eval-algolia-raven.mjs --self-test`: PASS; 14 controls.
- `npm run eval:algolia-raven`: PASS; the `sd-001` monitor target ranked first with rules enabled and disabled.
- `npm run typegen && npm run typecheck`: PASS; type generation reported a non-fatal Wrangler log-file permission warning.
- `npm test`: PASS; 99 files and 1,588 tests passed.
- `npm run build`: PASS; the Wrangler dry run completed.
- `npm run improvements:lint -- --live`: pending.
- `npm run improvements:probes`: pending.
- `npm run secrets:scan -- --tree`: pending.
