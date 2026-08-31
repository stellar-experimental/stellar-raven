# Eval stability and protocol-history routing — 2026-08-31

## Scope

This round determines and completes the next appropriate work from `.agents/NEXT.md`.
It starts with free analysis of judge stability and protocol-history routing.
It can include a paid eval only after a reviewed pre-spend plan.
It excludes the rejected Raven capability-boundary method and all monitor-only recovery work.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| Product and measurement plan | Claude, Fable 5, high | pending | `plan-fable.md` | pending |
| Routing diagnosis and design | Codex, GPT-5.6 Sol, high | pending | `routing-analysis-sol.md` | pending |
| Eval register and cost analysis | Codex, GPT-5.6 Terra, high | pending | `eval-analysis-terra.md` | pending |
| Independent review | Grok, Grok 4.6, high | pending | review files | pending |

## Route cards

### Product and measurement plan

- Worker CLI: Claude
- Model: Fable 5
- Effort: high
- Reason: The lane needs ambiguous product and measurement synthesis.
- Verified: The repository roster records a completed Fable invocation.
- Fallback: GPT-5.6 Sol
- Reviewer: Grok 4.6
- Report contract: Recommend the next bounded block, gates, spend boundary, and stop conditions.

### Routing diagnosis and design

- Worker CLI: Codex
- Model: GPT-5.6 Sol
- Effort: high
- Reason: The lane needs difficult scoring analysis and test design.
- Verified: The repository roster records a completed Sol high invocation.
- Fallback: Fable 5
- Reviewer: Grok 4.6
- Report contract: Identify a general mechanism, affected cases, tests, risks, and candidate files.

### Eval register and cost analysis

- Worker CLI: Codex
- Model: GPT-5.6 Terra
- Effort: high
- Reason: The lane needs bounded repository inspection and data analysis.
- Verified: The installed Codex catalog lists the model and the high effort value.
- Fallback: GPT-5.6 Sol
- Reviewer: Grok 4.6
- Report contract: Explain the smallest valid refresh, exact commands, costs, pins, and blockers.

## Ledger

### 2026-08-31 — round opened

The source branch was clean at `1bfb9838491fa571166a2a631789a3b0e814980c`.
Herdr created branch `next/eval-routing-stability` in workspace `w1Y`.
No paid command was authorized by this ledger entry.

### 2026-08-31 — free analysis lanes launched

Herdr pane `w1Y:p1` runs `nextplan-fable` with Fable 5 at high effort.
Its only write is `plan-fable.md`.

Herdr pane `w1Y:p2` runs `route-sol` with GPT-5.6 Sol at high effort.
Its only write is `routing-analysis-sol.md`.

Herdr pane `w1Y:p3` runs `eval-terra` with GPT-5.6 Terra at high effort.
Its only write is `eval-analysis-terra.md`.

All three lanes prohibit paid calls and production-code edits.

### 2026-08-31 — free analysis results

Fable wrote `plan-fable.md`.
It recommends a free register refresh, followed by a free routing candidate.
It rejects another same-100 collection before a product candidate exists.

Terra wrote `eval-analysis-terra.md`.
Its free refresh used 197 artifacts, with 163 collections and 34 rejudges.
The same-100 set stayed at 57 unstable cases and 43 stable cases.
Four cases crossed into the unstable set, and four cases crossed out.
Terra recommends no paid same-100 collection now.

The two generated register hashes differ because each run has a different `generatedAt` value.
No generated register is pinned for paid use in this entry.

### 2026-08-31 — independent plan review launched

Herdr pane `w1Y:p4` runs `evalroute-grok` with Grok 4.6 at high effort.
Its only write is `review-grok-plan.md`.
The review covers block 2, register identity, deferred spend, and completion gates.

### 2026-08-31 — routing root cause and next experiment

Sol wrote `routing-analysis-sol.md`.
It reproduced every routing baseline and passed 121 focused tests.
It found that the builder flattens structured Scout routing clauses into one keyword field.
The coverage gate then removes valid paraphrases while the flat field captures unrelated controls.
Sol rejected another lexical rescue and proposed a structured semantic route-fit experiment.

Fable wrote `implementation-brief-fable.md`.
It selected one measurement-only clause-level Qwen experiment.
The experiment keeps production search unchanged and uses fixed readings with one strict stop.
The implementation brief needs independent review before code work starts.

### 2026-08-31 — independent plan review result

Grok wrote `review-grok-plan.md`.
It passed the free-first sequence and rejected another same-100 collection.
It confirmed that only the judge-stability TODO can close.
It found six blocking method defects and additional record defects.
No paid method can start until every applicable issue is repaired.

Fable is repairing `plan-fable.md` and will write `plan-reconciliation-fable.md`.
Grok is now reviewing `implementation-brief-fable.md` before implementation.

### 2026-08-31 — plan repaired and semantic brief blocked

Fable repaired `plan-fable.md` and wrote `plan-reconciliation-fable.md`.
The repaired plan addresses every plan-review issue and still authorizes no paid work.
Grok is running the requested bounded delta review of that repair.

Grok wrote `review-grok-clause-brief.md` with verdict `BLOCK`.
The proposed `U50` union omitted two required blind positives.
The swap predicate moved equal scores, and the brief misstated the production tier rule.
The holdout acceptance also omitted the top-1 and top-3 gates.
Fable is repairing the semantic brief before any model fetch or implementation.

### 2026-08-31 — bounded review status

Grok wrote `review-grok-plan-delta.md` with verdict `PASS`.
Fable is correcting three non-blocking record errors from that review.
The plan still authorizes no paid work.

Fable repaired `implementation-brief-fable.md` and wrote
`clause-brief-reconciliation-fable.md`.
The repaired brief uses `P5` plus the full non-null ungated remainder.
It explicitly replaces the lexical `1.6` margin only inside the experiment.
Grok is now running the required bounded delta review.

### 2026-08-31 — semantic experiment implementation authorized

Grok wrote `review-grok-clause-brief-delta.md` with verdict `PASS`.
Fable corrected the one remaining wording error.
The review permits one pinned model fetch and one fixed referee run.
It permits no production change and no paid call.

Sol is implementing the reviewed measurement-only experiment in pane `w1Y:p2`.
Its allowed write set is limited to `eval/vectorize/`, one test file, two package scripts,
two README updates, and `implementation-sol.md`.

### 2026-08-31 — clause-fit attempt blocked before scoring

Sol wrote `implementation-sol.md`.
The offline gate passed all 21 tests after the artifact build.
The fixed clause set contains 683 clauses.
The only artifact build succeeded with SHA-256
`e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4`.

The single referee invocation stopped before scoring.
Its process tried to fetch pinned tokenizer metadata and failed.
No query cache, result stamp, reading table, or changed-ranking list exists.
The correct experiment state is `BLOCKED`, not `PASS`, `PARTIAL`, or `FAIL`.
The strict two-fetch and single-referee limits forbid another run in this attempt.

All free validation gates passed: 1,536 tests in 97 files, typecheck, build,
secret scan, and `git diff --check`.
Grok is reviewing the implementation and retention decision.
Terra is independently diagnosing the failure without another model fetch.

### 2026-08-31 — local validation setup

The worktree now has an ignored placeholder `.dev.vars` with the CI secret names.
`DEV_ALLOW_UNAUTHENTICATED` is `true` for a possible later local server.
`npm run typegen` passed and generated ignored `env.d.ts`.

### 2026-08-31 — post-implementation review passed

Grok wrote `review-grok-clause-fit.md` with verdict `PASS` for the harness.
Terra wrote `verification-terra.md` and reached the same retention decision.
Both reviews keep the artifact and classify the measurement as `BLOCKED`.

The direct block was the missing tokenizer metadata in the referee process.
The harness also relies on an implicit remote cache and lacks a local-only preflight.
No routing score or acceptance result exists.

The completed artifact remains valid experiment input.
Its file size is 3,917,367 bytes, and its SHA-256 is
`e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4`.

### 2026-08-31 — new finish plan requested

The prior attempt remains closed with its two fetches and one referee invocation spent.
Fable is preparing a separate finish plan for explicit local model assets and a local-only referee.
The plan must reuse the clause artifact and must receive an independent Grok review before work.

### 2026-08-31 — finish plan ready for review

Fable wrote `finish-plan-fable.md`.
The new attempt first copies the existing 596 MB model cache into a machine-local snapshot.
It then adds a local-only loader mode and a hash-checking preflight.

The plan permits no artifact rebuild, no paid call, and no production change.
It permits one conditional asset-repair fetch and one referee invocation after a passing review.
Grok is reviewing the plan before any snapshot or implementation change starts.

### 2026-08-31 — finish plan blocked for repair

Grok wrote `review-grok-finish-plan.md` with verdict `BLOCK`.
The primary snapshot and local-only loader design is sound.
The proposed asset-repair fetch could not enforce its revision or four-file limit.

Fable is removing that fetch path.
The repaired plan will stop as `BLOCKED-ASSETS` when the existing cache cannot supply a valid snapshot.
It will also make the loader check the four files before pipeline construction and isolate the default cache.

### 2026-08-31 — repaired finish plan passed

Fable repaired `finish-plan-fable.md` and wrote `finish-plan-reconciliation-fable.md`.
The repaired attempt permits zero model fetches, zero artifact builds, and one referee invocation.

Grok wrote `review-grok-finish-plan-delta.md` with verdict `PASS`.
It confirmed all five findings are resolved and authorized the snapshot and loader implementation.
The referee still waits for a separate review of the exact implementation diff.

Sol is copying the four pinned cached files into the machine-local snapshot.
Sol is also implementing the env-gated loader and preflight in the three allowed files.

### 2026-08-31 — local-only implementation ready for review

Sol wrote `finish-implementation-sol.md`.
The four source files and the machine-local snapshot matched every pinned SHA-256.
The snapshot is outside the repository at
`/Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394`.

Sol changed only `eval/vectorize/embedder.mjs`, the new preflight file, and the package script.
The local-only mode checks all four files before pipeline construction and disables the FS cache.
The preflight hashes the files before it dynamically imports the model code.

All free gates passed with `RAVEN_VECTORIZE_MODEL_DIR` unset.
No preflight, referee, model load, or fetch ran during implementation.
Grok is now reviewing the exact implementation before the single referee can start.

### 2026-08-31 — implementation review passed

Grok wrote `review-grok-finish.md` with verdict `PASS` and no actionable finding.
It verified the four snapshot hashes, the exact loader and preflight diff, and every protected file.
It also confirmed that the new local-only path has no fetch mechanism.

The worktree still points at `1bfb9838491fa571166a2a631789a3b0e814980c`.
The catalog, inventory, workflow archetypes, clause artifact, referee, contracts, gates, and `src/` are unchanged.
The preflight, `eval:selftest`, and `eval:compile` are the remaining referee preconditions.

After those pass, Sol may run the one authorized referee invocation with the same snapshot path.
No second referee, model fetch, artifact rebuild, or production change is authorized.

### 2026-08-31 — clause-fit finish completed

Sol wrote `finish-result-sol.md`.
The local-only preflight passed with probe-vector SHA-256
`d32aabf37d5aaeda98bd2c817cc7d38c6b746f82c89d874f982d8016fbaf4b4b`.
`npm run eval:selftest` and `npm run eval:compile` also passed.

The one authorized referee completed all five readings and wrote its result.
The measured outcome is `FAIL`; no grid reading met the acceptance table or the partial rule.
The result stamp is `2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1`.

The query cache SHA-256 is
`65ca5052c5258aeb1f5a30e93a1b9c1fde61aace80c8b3fdd4d044346385b8c2`.
The query-vector payload SHA-256 is
`55f11af02a90940b784719b819e52ac9da84a7fe028af8c258d9218f18e281b9`.
The result file SHA-256 is
`17e75f0d1b13848aa2e0841624e8496c558624493d156c3cb2115301a6a9cda0`.

The `m = 0.10` grid had the fewest routing-gate failures.
It returned legacy 196/281/311, holdout 15/29/30 with 12 forbidden captures,
and extended strict 91/109/117.
Its protocol counts stayed 4/8 and 3/11 at top five, with one and six control captures.

The attempt used no model fetch, no artifact rebuild, and no second referee.
Terra and Grok are independently verifying the result and its interpretation.

### 2026-08-31 — result review requires record repair

Terra wrote `result-verification-terra.md` with verdict `BLOCK` on one interpretation sentence.
It independently recomputed every reading from the stored 563 query vectors.
Every file hash, total, gate, ranking count, capture count, and the `FAIL` outcome matched.

Terra found that no metric defines a grid nearest to the full acceptance table.
The `m = 0.10` grid has the fewest routing-gate failures and ranking changes among grids.
The `m = 0.03` grid has the smallest protocol-contract deficit under Terra's diagnostic count.

Grok wrote `review-grok-result.md` and passed the measured `FAIL`.
It confirmed no grid qualifies for `PASS` or `PARTIAL`, and no production change is supported.
It found that blind top-five recovery moved from 3 to 4 at `m = 0.03` and `m = 0.06`.
That movement is not a contract win and must replace the broad no-movement statement.

The preflight probe-vector hash is already recorded with the result pins in this ledger.
Sol is correcting only the result report language before a bounded verification delta.

### 2026-08-31 — measured result review passed

Sol repaired `finish-result-sol.md` and wrote `result-reconciliation-sol.md`.
The active record now limits `m = 0.10` to the fewest routing-gate failures and ranking changes.
It also records the exact blind top-five movement from 3 to 4 at `m = 0.03` and `m = 0.06`.

Terra wrote `result-verification-delta-terra.md` with verdict `PASS`.
Every review finding is reconciled.
The saved result, query cache, artifact, implementation, and outcome remain unchanged.

The harness and artifact remain as durable evidence for the measured negative.
No production routing change ships from this experiment.
Fable is now preparing the closeout and next-work documentation guidance.

### 2026-08-31 — closeout records applied

Fable wrote `closeout-guidance-fable.md`.
The closeout removed only the completed judge-stability TODO.
It recorded the stable-at-57 refresh and the measured clause-fit `FAIL` in the canonical docs.

Block 2 remains open for the Raven diagnostic and Friendbot monitor.
Block 3 is held for a separately reviewed cross-encoder attempt.
All monitor-only work, small fixes, the Playground work, and the owner decision remain open.

Terra is running the final repository gates.
The root agent is auditing the complete diff against the reviewability rubric.

### 2026-08-31 — final validation passed

Terra wrote `final-validation-terra.md` and `final-validation-delta-terra.md`.
The first report misclassified the intended queue and README edits as protected.
The bounded reconciliation corrected that scope and ended with verdict `PASS`.

The final gates passed: typecheck, 1,536 tests, build, secret scan, routing gate,
QA lint with 0 errors and 61 expected warnings, 31 focused vector tests, and `git diff --check`.
The validation commands changed no tracked file.

The root reviewability audit found no finding.
The round records remain in the designated `.agents/rounds/` evidence surface.
Grok is now running the final independent review of the complete branch diff.

### 2026-08-31 — final independent review passed

The first final-review Grok session exited before it wrote a report.
The root agent restarted only its owned review pane with the same Grok 4.6 high route.

The replacement reviewer wrote `final-review-grok.md` with verdict `PASS`.
It found no high, medium, or low issue in the complete branch diff.
It verified every result pin, protected hash, closeout claim, prior reconciliation, and next-work item.

The first commit attempt then exposed two gitleaks false positives in the preflight's public
tokenizer-file SHA-256 pins.
Two `gitleaks:allow` comments now identify those values as public file hashes.
The preflight behavior is unchanged, and its new file SHA-256 is
`29dff3a31163f2cebd2558c6a3853104b936c0f958cb1827b6c45cc0aeca0764`.

The staged secret scan now passes both the repository scanner and gitleaks.
Grok wrote `final-review-commit-hook-delta-grok.md` with verdict `PASS`.
It confirmed that the two comments are narrow, truthful, behavior-neutral, and reviewable.

The branch is ready for commit and the normal pull-request flow.

## Outcome

Complete.

The free register refresh used 197 artifacts and kept the same-100 unstable count at 57.
Four cases entered and four left the unstable set.
The judge-stability TODO is closed as stable at 57.

The clause-fit experiment completed with a reviewed `FAIL`.
No grid passed both frozen protocol contracts while preserving every routing gate.
Attempt one of the protocol-history routing box is closed as a measured negative.
No production routing change ships.

The harness and clause artifact remain as the frozen instrument.
The local query cache, result JSON, five ranking dumps, and model snapshot remain retained.
The result and every review pin appear in the ledger entries above.

The full free validation passed: typecheck, 1,536 tests, build, secret scan, self-test, compile,
31 focused vector tests, and `git diff --check`.
Grok passed the plan, implementation, and measured-result reviews after every finding was repaired.
Terra independently recomputed the stored result and passed the final wording delta.

Nothing new surfaced for `improvements/`.
The defect remains this repository's ranking behavior.
Block 3 is held for a separately reviewed cross-encoder attempt.
The next free own-repository block is the Playground 8,000-character message limit.
