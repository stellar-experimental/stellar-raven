# Pre-spend review: measurement plan v3 and discovery measurement changes

Reviewer: Fable high. Read-only. No edits, paid calls, servers, Git, or nested agents.
Inputs: `evals/measurement-plan-draft-v3.json`; worktree `eval/discovery/{cases.json,lib.mjs,run-discovery.mjs}`;
`test/eval-discovery-cases.test.mjs`; pins under `/tmp/raven-routing-audit-2026-09-17`.

## Verdict

**Approve for spend, conditional on four reconciliations (R1-R4).** None changes method terms or runtime bytes.
The reviewer accepts the stated known risk: a single verified fact loss blocks D3 even if it is answering variance.
Verification requires transcript review plus live re-execution, so that trade-off is sound.

## Verified

| Item | Result |
|---|---|
| Pins | `cases.json` a81df0b9…, `lib.mjs` cad1a9c0…, release view 4ade5f68…, challenge 34edbc2f…, stability cb5fcc19…, `search.ts` 3cc4c140… all match v3 |
| Release view | 57 = 54 challenge questions + 3 known controls; zero overlap with holdout; all `acceptableOps` searchable; rc01/rc02 marked fallback-not-authority as the plan states |
| Discovery label repair | 24 of 43 cases changed; every change removes a `searchable:false` section id or replaces it with its whole skill; each has a body-check reason in `discovery-repair-log.json`; identical file for both arms, so no arm advantage |
| Loader | `loadDiscoveryCases` now rejects unsearchable ids; families, ops, and duplicates validated in one place; `run-discovery.mjs` reuses it and keeps only seed/groundTruth checks; existence check is subsumed by the searchable check |
| Loader test | 5 pass; the extra argument was removed |
| Runners | `run-qa --ids` keeps battery (id-sorted) order, matching `executionOrder`; `--max-budget-usd`, `--server-revision`, binary and environment sha flags are required; `run-agent-discovery` has the same preconditions and `--url`; `run-qa` targets `--port` |
| Budget arithmetic | 60+20+24+30+24 = 158; reserve 92; cap 250 |
| Reading rules | Verified loss blocks in one replicate; replicates diagnose only; qa-paired recorded INDETERMINATE |
| M3/M4 | One run per arm, variance claims forbidden; matches the removed repeats |

## Reconciliations required before launch

- **R1. Server port and URL.** Baseline server is on 8793. `run-qa` defaults to 8788 and `run-discovery`/`run-agent-discovery` default to `localhost:8788`. Every command must pass `--port 8793` or `--url http://localhost:8793`, and the candidate session must state its port. Record the exact command arrays in the plan.
- **R2. M1 per-run budget.** 16 rows at the observed max ($1.20) is $19.2, above the $15 budget. Exhaustion leaves an incomplete run and breaks per-ID pairing for that replicate. Raise the M1 per-run budget to $20 (ceiling $80; allocation $178; reserve $72), or accept and state that an incomplete M1 run voids its pair.
- **R3. Cost evidence tuple.** No stored run uses pack p6 or rubric v2.10. The $0.38-0.41 mean and $1.20 max come from p5 with v2.8-v2.9. Record this as a proxy in the plan. Discovery costs ($5.33-$9.83 per 43-case run) are confirmed from stored `agentCost`.
- **R4. Candidate pin.** `pinned: false`. Insert the clean candidate commit SHA and re-hash `search.ts`, `cases.json`, `lib.mjs`, and `run-discovery.mjs` from that commit. Both arms must run the committed discovery files.

## Recommendations (non-blocking)

- Add a checkpoint after M2-C1b: re-judge the Soroswap rows (about $2) before M3-C1 and M4-C1 spend about $27.
- State the session confound: C1 and C2 share one server session; B1 and B2 do not.
- Write M4 results outside the implementer's worktree; the release view carries challenge questions.
- The phase-0 free one-shot discovery run needs the live server, so it belongs to the session owner, not to a reviewer without server rights.

## Exclusions

Not run by the reviewer: any server, `run-discovery.mjs`, paid runners. No holdout or challenge question text or IDs appear here.
