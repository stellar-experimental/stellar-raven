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

### Gated local closeout implementation

- Lane: Reconcile the CAP-0075 golden and prepare `sd-048` and `sls-080` lifecycle records.
- Worker CLI: Codex.
- Model: `gpt-5.6-sol`.
- Effort: `high`.
- Reason: This lane needs coupled golden, provenance, lifecycle, and generated-artifact changes.
- Authorization: Local edits and required generators only. No external or production write is allowed.
- Reviewer: A separate final-diff reviewer remains required.
- Report contract: `.agents/rounds/2026-09-01-free-improvements-maintenance/closeout-sol.md`.

## Upstream state table

| finding | trigger evidence | upstream ref | ref state | PR checks/reviews | live re-check | action |
|---|---|---|---|---|---|---|
| `sls-074` | resolved record; exact audit identifier and absent control | `Stellar-Light/stellarlight#1031` | open; no close reason | no linked work; only Raven's 2026-08-28 resolution comment | 2026-09-01 orchestrator recheck below: `V-SOR-APP-VUL-003` returns the Veridise row without `exactMiss`; `V-SOR-APP-VUL-999` retains `exactMiss` | Keep quiet; the maintainer owns closure. |
| `sls-080` | exact Horizon source-parity question | `Stellar-Light/stellarlight#1134` | closed completed | PR #1136 and follow-up PR #1174 merged | 2026-09-01: answer and source at `82660510ecda7fd365a14d08badb9d85fa22bc32` both equal `28` | Retired with a complete receipt. |
| `sd-047` | current raw cadence sentences | `stellar/stellar-docs#2805` | open; no close reason | PR #2806 remains open | 2026-09-01: Validators still says 3-5 seconds; Stellar Stack still says 5-7 seconds | Retain and record recurrence. |

## Deletion candidates

| finding | author live recheck | independent review | persistent references | upstream comment | resolver receipt |
|---|---|---|---|---|---|
| `sd-001` | PASS; settled full reindex and controls hold | Opus 5 high: PASS | harness, README, and intake cleanup complete | not applicable; never filed | `improvements/resolved.json` entry `sd-001` |
| `sd-036` | PASS for the named field-selector defect | Opus 5 high: SUCCESSOR | `sd-048` filed; golden and references reconciled | posted and read back on issue #1980 | `improvements/resolved.json` entry `sd-036` |
| `sk-020` | PASS; upstream source and deployed skill use `stellardev` | Opus 5 high: PASS | no active non-generated cleanup remains | posted and read back on issue #113 | `improvements/resolved.json` entry `sk-020` |
| `sls-080` | PASS; source parity holds | Grok 4.6 high: PASS after final gates | recovery cites the resolved receipt | posted and read back on issue #1134 | `improvements/resolved.json` entry `sls-080` |

## Reviewer outcomes

- Opus 5 high approved later retirement for `sd-001` and `sk-020`.
- Opus 5 high required successor `sd-048` before later `sd-036` retirement.
- Grok 4.6 high confirmed the live `sls-080` fix and initially deferred retirement.
- The later comment, public snapshot, queue update, and resolver cleared the remaining gates.
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

- Added successor `sd-048` with pinned CAP, ABI, and host evidence. The gated closeout changed it to `verified`.
- Added the `sd-048` intake override for `stellar/stellar-protocol`.
- Replaced the obsolete `sd-001` meeting target with a monitor-only rank-one canary.
- At this phase, `improvements/README.md` still described `sd-001` as fixed pending retirement.

## Gated local closeout implementation

### Source evidence

| class | source | observed result |
|---|---|---|
| A | `https://stellar.org/blog/developers/announcing-stellar-x-ray-protocol-25` | The official announcement records the exact Mainnet activation time: 2026-01-22 at 17:00 UTC. |
| A | `stellar/stellar-docs@83c68f21c721905327f5db12fb84702e3a48367c/docs/build/apps/zk.mdx` | Lines 6 and 41-42 state that Protocol 25 introduced BN254 and Poseidon/Poseidon2. They name `poseidon_permutation` and `poseidon2_permutation`. |
| B | `stellar/stellar-protocol@65e2b6262c0825494caf2a94116eb512c8335f22/core/cap-0074.md` | CAP-0074 defines the three BN254 functions at Protocol 25. |
| B | `stellar/stellar-protocol@65e2b6262c0825494caf2a94116eb512c8335f22/core/cap-0075.md` | CAP-0075 defines two permutation primitives at Protocol 25. The field selector is `Symbol`. |
| B | `stellar/rs-soroban-env@a7e15b439c4b49b17ba8f9e4527efee8d8119aba/soroban-env-common/env.json` | The shipped interface matches the CAP-0075 Protocol 25 field selector. |
| C | `https://stellarlight.xyz/api/status` and `/api/repos/explain` | Deployed API `1.9.16` returned `28` at the response's scanned source ref. |

The direct Scout result used the exact Horizon monitor question.
It returned `answerSource: knowledge-note` and `answerAsOf: 2026-09-01T00:00:00Z`.
It returned `generatedAt: 2026-09-01T19:42:19.933Z`.
It returned `scannedRef: 82660510ecda7fd365a14d08badb9d85fa22bc32`.
The source at that ref defines `MaxSupportedProtocolVersion uint32 = 28`.

### Changed golden

The lane changed only `q-protocol-bn254-poseidon-xray` in the owned battery.
It removed the obsolete Protocol 24 and `U32Val` claims.
It removed the stale `sd-036` grading caution and contradiction row.
It preserved the Protocol 25, CAP-0074, CAP-0075, permutation, helper-name, and privacy facts.
It set `truth.asOf` to `2026-09-01` and refreshed source classes A and B.
Its root causes name the `sd-021` and `sd-036` receipts.
Its evidence cross-references active `sd-048` outside the grading contract.

The focused follow-up added the pinned current Stellar Docs page as class A evidence.
The command `gh api 'repos/stellar/stellar-docs/contents/docs/build/apps/zk.mdx?ref=83c68f21c721905327f5db12fb84702e3a48367c' -H 'Accept: application/vnd.github.raw+json' | nl -ba | sed -n '1,220p'` verified it.
Line 6 states that Protocol 25 introduced BN254 and Poseidon/Poseidon2.
Lines 41-42 name `poseidon_permutation` and `poseidon2_permutation`.
The activation blog remains because it gives the exact Mainnet activation time.

### Sibling sweep

The sibling sweep covered these cases:

- `q-edge-noinfo-stellar-native-privacy-default`
- `q-pc-protocol-26-yardstick`
- `q-protocol-bls12-381-cap59`
- `q-protocol-version-history-list`
- `q-sor-confidential-tokens`
- `q-sor-cross-warmancer-zk-stack`
- `q-tool-zk-repo-live`
- `q-zk-host-functions-status`
- `q-zk-poseidon-input-encoding`
- `q-zk-proof-systems-stellar`

All siblings preserve the same Protocol 25, low-level primitive, and privacy boundaries.
No sibling retains the obsolete `U32Val` or `sd-036` grading claim.

### Local lifecycle preparation

- This phase changed `sd-048` from `proposed` to `verified` before issue #2010 was filed.
- Changed `sls-080` from `reported-upstream` to `fixed-upstream` with deployed evidence.
- Updated only the `sls-080` recovery section in `.agents/TODO.md`.
- Moved future evidence into the round ledger and eventual resolved receipt.
- Preserved the monitor, cadence, thresholds, evidence fields, and spend gate.
- Kept `sls-082` reserved for a later distinct defect.
- This phase did not edit `.agents/NEXT.md`; the later resolution closeout rewrote it.

## Resolution closeout

### Filed successor and resolution comments

- `sd-048`: https://github.com/stellar/stellar-protocol/issues/2010
- `sd-036`: https://github.com/stellar/stellar-protocol/issues/1980#issuecomment-5499757126
- `sk-020`: https://github.com/stellar/stellar-dev-skill/issues/113#issuecomment-5499760587
- `sls-080`: https://github.com/Stellar-Light/stellarlight/issues/1134#issuecomment-5499763507

All three resolution comments were posted and read back.
This queue closeout posted no new comment.

### Resolver receipts

| finding | receipt | source commit | result |
|---|---|---|---|
| `sd-001` | `improvements/resolved.json` entry `sd-001` | `5e23340be0da63630f86e662f010219cf0458eef` | Retired after the settled reindex and control checks passed. |
| `sd-036` | `improvements/resolved.json` entry `sd-036` | `5e23340be0da63630f86e662f010219cf0458eef` | Retired after `sd-048` preserved the distinct residual defect. |
| `sk-020` | `improvements/resolved.json` entry `sk-020` | `462ff2b1976040d9d04097981f71ae8970f1439c` | Retired after source and deployed skill checks passed. |
| `sls-080` | `improvements/resolved.json` entry `sls-080` | `9074093d4686cb34a05371b5a21a4b6c83aa80f2` | Retired after deployed source parity and the final comment gate passed. |

### Fresh `sls-080` reading

The exact monitor question returned `MaxSupportedProtocolVersion = 28`.
It returned `answerSource: knowledge-note`.
It returned `answerAsOf: 2026-09-01T00:00:00Z`.
It returned `generatedAt: 2026-09-01T20:08:07.092Z`.
It returned `scannedRef: 82660510ecda7fd365a14d08badb9d85fa22bc32`.
The source at that ref defines `MaxSupportedProtocolVersion uint32 = 28`.

### Active queue and final handoff

The active queue contains 66 findings.
It contains 60 `reported-upstream`, three `proposed`, and three `declined-upstream` findings.
No `fixed-upstream` deletion candidate remains.
The active service counts are 29 Lumenloop, 21 Stellar Docs, nine Stellar Light, six skills, and one provider finding.

The completed Improvements backlog items were removed from `.agents/TODO.md`.
The recovery monitor now cites the retired `sls-080` receipt.
Its monitor, cadence, thresholds, evidence requirements, and spend gate did not change.
`sls-082` remains reserved for a distinct future Scout defect.

`.agents/NEXT.md` now records no unconditional agent-actionable block.
The production and Raven capability choices remain owner-blocked.
The paired, recovery, protocol-history, `sources.locate`, Friendbot, and short-token programs remain conditional.
The queue-documentation phase made no additional finding lifecycle change.

## Remaining gates

1. Keep `sd-048` active at issue #2010 until a later verified fix clears its lifecycle gates.
2. Keep `sd-047` active at issue #2805 while the cadence conflict remains.
3. Keep issue #1031 quiet. The maintainer owns its close.
4. Require the recorded owner decisions before production or paid work.
5. Fire conditional programs only through their recorded triggers.

## Validation

| command | final result |
|---|---|
| `npm run eval:qa:compile` | PASS; 500 cases; corpus SHA-256 `0393e7bef6b8bea9e519fbdf11d65fa4a7d32ea2ea803f469c0ac8bd78857ad7`. |
| `npm run eval:qa:register` | PASS; up to date with 0 reopened clusters. |
| `npm run eval:qa:lint -- --since 23982548b7b67a1931c61f2d02a04d8a386f6b5c` | PASS; 0 errors and 62 warnings. |
| `npm run improvements:index` | PASS; wrote 66 findings. |
| `npm run improvements:lint` | PASS; `improvements lint ok (66 findings)`. |
| `npm run improvements:lint -- --live` | PASS; `improvements lint ok (66 findings, live intake checked)`. |
| `npm run improvements:probes` | PASS; 6 recurring, 0 fixed-candidate, 0 inconclusive, and 0 errors. |
| `node scripts/eval-algolia-raven.mjs --self-test` | PASS; 14 controls. |
| `npm test` | PASS; 99 files and 1,588 tests. |
| `npm run typecheck` | PASS. |
| `npm run build` | PASS; Wrangler dry-run build completed. |
| `npm run secrets:scan -- --tree` | PASS; no leaks found. |
| `git diff --check` | PASS. |

The `q-protocol-bn254-poseidon-xray` symmetric-caution warning preserves resolved `sd-036` provenance.
The current canonical source agrees with the golden, so the removed grading caution must not return.
