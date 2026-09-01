# Resolution queue closeout

## Result

The free improvements block is complete.
The queue closeout made no finding lifecycle change.
No unconditional agent-actionable block remains.

## Resolver receipts

| finding | receipt | source commit |
|---|---|---|
| `sd-001` | `improvements/resolved.json` entry `sd-001` | `5e23340be0da63630f86e662f010219cf0458eef` |
| `sd-036` | `improvements/resolved.json` entry `sd-036` | `5e23340be0da63630f86e662f010219cf0458eef` |
| `sk-020` | `improvements/resolved.json` entry `sk-020` | `462ff2b1976040d9d04097981f71ae8970f1439c` |
| `sls-080` | `improvements/resolved.json` entry `sls-080` | `9074093d4686cb34a05371b5a21a4b6c83aa80f2` |

`sd-048` is filed at https://github.com/stellar/stellar-protocol/issues/2010.

The resolution comments are:

- `sd-036`: https://github.com/stellar/stellar-protocol/issues/1980#issuecomment-5499757126
- `sk-020`: https://github.com/stellar/stellar-dev-skill/issues/113#issuecomment-5499760587
- `sls-080`: https://github.com/Stellar-Light/stellarlight/issues/1134#issuecomment-5499763507

All three comments were posted and read back before this closeout.

## Recovery queue

`.agents/TODO.md` no longer contains the completed Improvements backlog.
Its recovery section now cites the retired `sls-080` receipt.
The monitor, cadence, thresholds, evidence requirements, and spend gate remain unchanged.
`sls-082` remains reserved for a distinct future Scout defect.

The fresh successful reading returned these fields:

- Value: `MaxSupportedProtocolVersion = 28`
- `answerSource`: `knowledge-note`
- `answerAsOf`: `2026-09-01T00:00:00Z`
- `generatedAt`: `2026-09-01T20:08:07.092Z`
- `scannedRef`: `82660510ecda7fd365a14d08badb9d85fa22bc32`
- Source value: `MaxSupportedProtocolVersion uint32 = 28`

## Current handoff

`.agents/NEXT.md` now records current queue truth.
Production verification and deployment remain owner-blocked.
The Raven capability classification remains owner-blocked.
All other programs remain conditional on their recorded triggers.

The active queue contains 66 findings:

- 60 `reported-upstream`
- Three `proposed`
- Three `declined-upstream`

No `fixed-upstream` deletion candidate remains.
`sd-048` remains active at issue #2010.
`sd-047` remains active at issue #2805.
Retired `sls-074` remains fixed while issue #1031 stays open.
Retired `sls-080` has a complete durable receipt.

## Fable reconciliation

- F1: the Algolia self-test now requires exactly 14 controls.
- F2: five consistency reasons now describe the complete golden change.
- F3: the round ledger now has one final-state validation table.
- F4: the `sd-036` and `sls-080` receipt titles now state their defects.
- F6: `sd-048` remains an evidence cross-reference, not a golden root cause.
- F7: `golden.notes` no longer contains the `GT-31 CORRECTION` label.
- F9: `.agents/TODO.md` now waits for PR #2806 before re-reading both cadence sentences.

The consistency reasons preserve Protocol 25, CAP-0074, CAP-0075, primitive, and privacy boundaries.
They record the removed `U32Val`, Protocol 24, and `sd-036` caution text.
They also record the pinned class A and B evidence.

`improvements/README.md` still names `sd-001` and `sd-006` as resolved precedents.
This reconciliation did not change F5 or F8.

## Validation

| command | result |
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

The corpus keeps the resolved `sd-036` root cause as provenance.
The canonical source now agrees, so the former grading caution stays removed.

No commit, push, file, comment, deployment, production edit, or Algolia write occurred in this closeout.
