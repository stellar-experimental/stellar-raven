# Post-implementation review — clause-fit measurement

Date: 2026-08-31
Reviewer: Grok 4.6 high
Author: Codex GPT-5.6 Sol high (`implementation-sol.md` and the harness)
Orchestrator: Claude Fable 5 high
Brief: `.agents/rounds/2026-08-31-eval-routing-next/implementation-brief-fable.md`
Pre-implementation reviews: `review-grok-clause-brief.md` (BLOCK) and `review-grok-clause-brief-delta.md` (PASS)
Status: complete. The model was not loaded. The referee was not run. This reviewer wrote only this file.

This review does not authorize a second fetch. It does not authorize a second referee run. It does not authorize a product commit.

## Verdict

**PASS the harness. Keep the artifact. Agree that the measurement is `BLOCKED`.**

The code matches the reviewed brief. No `src/` file changed. The frozen contracts did not change.

The referee produced no reading. `BLOCKED` is the correct label. It is not `FAIL`. `FAIL` requires completed readings.

Keep the measurement harness. Keep the clause artifact. They are the frozen instrument and the only allowed build. They are not unused speculative code.

## Keep-or-remove decision

Keep both.

| Object | Size / role | Decision |
| --- | --- | --- |
| Harness (`clause-config.mjs`, `clause-retrieval.mjs`, `build-clause-artifact.mjs`, `run-clause-fit.mjs`, tests, two `package.json` scripts) | reviewed mechanism plus 21 offline checks | keep |
| Artifact `eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json` | 3,917,367 bytes (3.74 MiB); 683 pinned clause vectors | keep |

Reasons:

- The brief allows one artifact build. That build succeeded. Deleting the file would force a second build. A second build is allowed only for artifact mechanical failure. This artifact has no such failure.
- Tests 19 and 20 now pin the file. Removal would skip those checks.
- The vectors and hashes are durable input evidence. They are not a routing result. The 2026-07 Vectorize no-ship artifact stayed for the same reason.
- The harness is the only way to finish under a later authorized fetch budget. Removing it deletes the reviewed mechanism.
- `eval/README.md` and `eval/vectorize/README.md` already say the referee stopped before scoring. They do not claim a routing gain.

Do not treat KEEP as a new referee authorization. The two-fetch limit is already spent.

## Evidence this review checked

All checks were free. The embedder did not run.

| Check | Result |
| --- | --- |
| `HEAD` | `1bfb9838491fa571166a2a631789a3b0e814980c` |
| `src/` and frozen contracts | no diff |
| Artifact SHA-256 | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` |
| Clause-set SHA-256 | `cc5df2e4d89522c580626cfc21727b927494f5f528f42acfa035187a211d89e5` |
| Vector payload SHA-256 | `1dd9eb2ebcaede223fc39e4f07b943375b5025a7922a1578545a09229c09856d` |
| Live `loadClauseArtifact({ requireCatalogMatch: true })` | pass; 683 clauses and 683 vectors |
| Source counts | description 343, workflow 63, purpose 26, useWhen 103, exampleQuestion 73, notFor 75 |
| Unmatched Scout ops | the four listed ids |
| Clause metadata leak of frozen ids | none |
| Stored clause `text` field | absent |
| README claims | blocked, no readings, no production change |

## Code correctness

`buildClauses` follows section 4. Keyword fields never enter clause text. Unmatched Scout operations receive description clauses only.

`buildCandidateUnion` follows section 5. `P5` comes from `searchCatalog` at limit 5. `R` uses the documented projection and exported ungated scoring. Coverage-failed remainder ids are marked `backfill`.

`clauseFit` matches section 6. `applyClauseHysteresis` uses `fit >= previous + m` and `fit !== previous`. `m = Infinity` returns the base order.

`run-clause-fit.mjs` uses five readings: identity, pure-fit, and three grid values. `shouldFail` looks only at grid acceptance. `PARTIAL` still exits 1.

Identity calibration is written and unrun. It compares identity totals to `gates.json` and to 4/8, 1/4, 3/11, and 6/9. Because identity returns the `P5` prefix, the check is structurally sound. It has no executed proof.

The shared `embedder.mjs` does not set a local-only load. A new process can fetch tokenizer metadata from the network. The referee error used `resolve/main/tokenizer_config.json`, not the pinned revision path. That is why fetch two failed after a successful build. See H1.

## Brief compliance

| Brief rule | Implementation |
| --- | --- |
| No `src/` change | held |
| No frozen-contract edit | held |
| One clause set | held; 683 clauses |
| Membership tests before build | recorded; 19 tests passed, two artifact tests skipped, then all 21 passed |
| One artifact build | held |
| One referee invocation | held; exit 1 at 0.67 s |
| Two fetch attempts | spent; build succeeded; referee fetch failed |
| No third fetch | held |
| Outcomes PASS / PARTIAL / FAIL | none; correctly replaced by `BLOCKED` |
| Query-vector cache and result stamp | absent; recorded as unavailable |

The attempt stop fired on the second fetch. That stop is the written rule. The missing identity proof is a consequence of the stop, not a skipped calibration after successful scoring.

## Test adequacy

The test file encodes all 21 brief checks. Vector tests use synthetic maps. Membership tests use the live catalog and the frozen questions. The no-leak test reads both frozen contracts.

Gaps that remain acceptable:

- Test 20 does not read `textSha256` on the `requireCatalogMatch: false` path. The false path returns before clause comparison. The brief still holds: a corrupt hash is accepted without catalog match and refused with it.
- Identity calibration against `gates.json` is referee-only. It never ran.

Hostile `searchCatalog` tests stay out of this measurement, as the brief requires.

## Artifact integrity

The artifact matches the brief schema. `model` equals the frozen `MODEL` object. `policy` matches `CLAUSE_POLICY`. Payload length is `683 × 1024 × 4` bytes. Live clause-set hash equals the stored hash.

The file is 3.74 MiB, not 3.6 MiB. Use the byte size and the SHA-256 as the pin.

No query-vector cache exists. A later environment can still drift when the referee first succeeds. Record that cache when a new authorized run completes.

## README claims

`eval/README.md` says the referee stopped before scoring and that production search did not change. That is true.

`eval/vectorize/README.md` states 683 clauses, the artifact SHA-256, 21 passing offline tests, no query cache, no result stamp, and `BLOCKED`. That is true.

Do not add a results table. No reading exists.

## `BLOCKED` classification

Agree.

| Label | When it applies | This run |
| --- | --- | --- |
| `PASS` | a grid reading meets the full table | no |
| `PARTIAL` | zero control captures and gates hold, positives miss | no |
| `FAIL` | readings complete; no grid meets the capture-and-gate bar | no |
| `BLOCKED` | the referee stops before any reading | yes |

Do not convert `BLOCKED` into `FAIL`. A `FAIL` would close the attempt box as a measured negative. This run measured the loader, not routing.

A later finish needs a new authorized attempt. That attempt must reset the fetch and referee budgets. It must reuse this artifact. It must not rebuild the vectors unless the artifact itself is corrupt.

## Actionable findings

### H1 — Severity: bug — a new process still fetches tokenizer metadata

`eval/vectorize/embedder.mjs` always constructs the pipeline from the model id. It does not force a local-only load of revision `c25a394dd583836952667c12f008335071b3f43d`.

The referee then spent fetch two. The error named `resolve/main/tokenizer_config.json`. Scoring never started.

The brief required reuse of this embedder. The two-fetch stop then made completion impossible on a restricted network.

Repair in a newly authorized attempt: load the pinned revision from local files only. Do not count that loader change as a score change. Do not rebuild the clause artifact. Do not run a third fetch under the old budget.

### M1 — Severity: suggestion — identity calibration never executed

`run-clause-fit.mjs` compares identity totals to every `gates.json` accepted key, including `cardN` and holdout `passed`. That code path did not run.

Repair: when the next authorized referee starts, treat an identity abort as a harness defect, not as a routing `FAIL`.

### L1 — Severity: nit — artifact size language

The file is 3,917,367 bytes (3.74 MiB). Say that. Do not say 3.6 MiB.

## Residual non-blocking notes

The name projection still uses `name: entry.id`. The delta review accepted that. Identity still returns `P5`.

Keyword exclusion remains. Do not reverse it.

Production `TIER_INTERLEAVE_MARGIN` remains untouched. Do not claim the inherited product gate is met.

No paid QA arm belongs here.

## What this PASS allows

- Keep the harness and the clause artifact in the tree.
- Record the attempt as `BLOCKED` in the round ledger.
- Plan a later authorized finish that reuses the artifact.

## What this PASS does not allow

- A second artifact build for score reasons.
- A second referee run under the spent two-fetch budget.
- A product commit.
- A claim that clause-fit improved routing.
- Deletion of the harness or the artifact as unused.
