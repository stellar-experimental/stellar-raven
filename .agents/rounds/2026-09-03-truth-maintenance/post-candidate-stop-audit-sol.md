# Post-candidate stop audit

Date: 2026-09-04

Role: independent fail-closed and next-work reviewer

## Decision

The baseline must remain stopped.

The candidate artifact is structurally complete.
However, the candidate violated the registered live-upstream interval guard.
Scout changed from OpenAPI `1.9.23` to `1.9.30` during the candidate collection.

The artifact cannot enter the planned paired comparison.
It also cannot define a single-interval current-quality headline.
Its rows remain useful as diagnostic leads after independent review.

Do not start the baseline arm.
Do not rerun the candidate arm under the existing authorization.
Do not start the canonical live-data or digest arms.
Do not start either flip rejudge batch.

## Evidence reviewed

I read these governing records:

- `.agents/rounds/2026-09-03-truth-maintenance.md`
- `.agents/rounds/2026-09-03-truth-maintenance/final-prespend-launch-sol.md`
- `.agents/skills/truth-maintenance/SKILL.md`
- `.agents/skills/run-evals/SKILL.md`
- `.agents/skills/live-drift-resolution/SKILL.md`
- `eval/EVALS.md`
- `improvements/README.md`

I inspected this candidate artifact:

- `/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json`
- Artifact SHA-256: `e629666bf476244d350840069094a8a579757724c101830d6d6727685b5904f7`

I inspected this post-run Scout evidence:

- `/private/tmp/stellar-raven-upstream-ObAJaV/repo/inventory/stellar-light.json`
- Fetch time: `2026-09-04T05:42:52.877Z`
- OpenAPI version: `1.9.30`
- File SHA-256: `ac9d9b258980436370ce798fa4e5f9db21e93b31e77d0fcedc3e96307427c918`

The refresh changed only `inventory/stellar-light.json` in that worktree.
Its diff has 2,330 insertions and 142 deletions against committed Scout `1.9.1`.
The operation count remains 37.
The diff changes routing text, schemas, enums, and response fields.
Therefore, Scout `1.9.30` is not a provenance-only change.

## Decisive interval failure

The candidate started at `2026-09-03T18:29:30.879Z`.
It finished at `2026-09-04T05:40:51.010Z`.

Candidate row 173 is `q-gap-scout-status-envelope`.
Its live Scout evidence reports `apiVersion: 1.9.23` at `2026-09-03T22:35:38.445Z`.

Candidate row 450 is `q-ti-scout-changelog-contract-check`.
Its live Scout evidence reports `apiVersion: 1.9.30` at `2026-09-04T04:34:02.708Z`.

Candidate row 451 also reports `apiVersion: 1.9.30`.
Its live evidence has `generatedAt: 2026-09-04T04:35:27.084Z`.

The artifact therefore proves the Scout identity changed inside the candidate arm.
The post-run refresh confirms Scout `1.9.30` two minutes after artifact completion.

The launch review required one live upstream interval for both arms.
Assertion 6 required a stop after any advertised upstream identity change.
The completed candidate already spans at least two Scout contracts.
No later baseline can repair that violation.

## Candidate completeness audit

The artifact is structurally complete despite the interval failure.

| Check | Result | Evidence |
|---|---|---|
| Artifact schema | PASS | `qa-agent-result-v4` and `qa-five-track-v1` |
| Selected membership | PASS | 500 active, 500 selected, and 500 unique rows |
| Ordered membership | PASS | Row IDs exactly match `meta.selectedIds` |
| Missing or extra rows | PASS | No missing, unexpected, or overrun IDs |
| Answer collection | PASS | 500 first attempts and 500 answered rows |
| Judging | PASS | 500 judged rows and zero error verdicts |
| Case identity | PASS | All 500 `caseInputSha256` values recompute correctly |
| Summary consistency | PASS | 199 correct, 230 partial, 71 wrong, and zero errors |
| T1 | PASS | 500 valid first-pass grades over 500 selected IDs |
| T2 | PASS | Zero eligible transport failures and zero retries |
| T3 accounting | PASS | 33 passes and eight failures over 41 answered traps |
| T4 accounting | PASS | Zero harness, judge, consistency, or invalid-test failures |
| T5 accounting | PASS | Zero safeguards, transport failures, or timeouts |
| Cost reporting | PASS | 500 agent costs and 790 judge costs reported |
| Budget | PASS | `$190.1686672` spent from the `$400` cap |
| Budget call count | PASS | 1,290 expected calls and 1,290 reported calls |
| Aggregate suppression | PASS | `aggregatesSuppressed: false` |
| Local comparability | PASS | `meta.comparable: true` with no local reasons |

The raw score is diagnostic only.
The upstream interval failure overrides the artifact's local `meta.comparable` value.

## Registered launch guards

This table covers all ten launch-time assertions.

| Guard | Result | Audit evidence |
|---|---|---|
| 1. Exact runner and method pins | PASS | All recorded revision, file, corpus, binary, environment, and register hashes match. |
| 2. `QA_AGENT_PROMPT_APPEND` unset | PASS | `meta.promptAppend` is null. The audit shell also reports it unset. |
| 3. Listener identities and adapter attestation | PASS | Both preflight and postflight listener pairs match. Both adapter attestations pass. |
| 4. Public MCP surface and source revision | PASS | Artifact pins pass. A later free probe reproduced the same surface and revision. |
| 5. Available upstream identities recorded | FAIL | Scout changed inside the arm. The artifact lacks a complete upstream identity vector. |
| 6. Stop after an upstream identity change | FAIL | Collection continued from Scout `1.9.23` through `1.9.30`. |
| 7. Candidate-first and one server pair | PASS | The candidate ran first. The baseline did not start. One listener pair stayed stable. |
| 8. P6 seven-call summary and costs | UNVERIFIED | The ledger reports seven passes and `$0.2536528`. No retained machine-readable record was available. |
| 9. `meta.comparable: true` | PASS, insufficient | The value is true. It does not cover mutable upstream services. |
| 10. Connected `raven` MCP server | PASS | All 500 rows report exactly one connected `raven` server. |

The local guards correctly cover the runner and listener pair.
They do not cover the remote services that `execute` calls.
This gap let a mixed-upstream artifact report `meta.comparable: true`.

## Other registered stop rules

The candidate stayed below its method cap.
Every paid call reported cost.
No planned row is missing, duplicated, or unjudged.
No local source, listener, surface, binary, environment, or corpus pin changed.
The artifact did not suppress its aggregate.

The required all-row review is not complete.
The artifact contains 71 wrong verdicts and eight T3 failures.
These verdicts are not final truth without transcript and live review.

The baseline cannot start while that review remains incomplete.
The Scout interval failure already stops it independently.

## Blocked work

The following work is blocked now:

1. The planned baseline 500-case arm is blocked.
2. The current candidate cannot enter `npm run eval:qa:paired`.
3. The candidate aggregate cannot become the current headline.
4. Both paid flip rejudge batches are blocked before a valid pair exists.
5. The canonical live-data and digest methods are blocked before a valid pair review.
6. Any candidate or baseline rerun needs a new authorization and review.
7. Production deployment remains blocked until the round closes and receives deployment authority.
8. Upstream filing for `sd-049` and `sk-021` still needs explicit owner authority.

The existing candidate authorization permits one method run.
That method completed and consumed `$190.1686672`.
Unused budget does not authorize a rerun or another method.

## Safe free work

The following work remains safe and authorized within the maintenance scope:

1. Preserve the candidate artifact and its SHA-256 as local evidence.
2. Review all 500 candidate answers, transcripts, verdicts, and evidence packs offline.
3. Recheck mutable wrong claims with free, read-only service operations.
4. Classify each confirmed issue with the `run-evals` root-cause table.
5. Run the free plan regrade on the stored candidate artifact.
6. Record the candidate T1 through T5 values without claiming a headline.
7. Regenerate and classify the full Scout `1.9.30` drift in an isolated worktree.
8. Audit Scout `1.9.30` across exposure, routing, schemas, goldens, findings, runtime, and documentation.
9. Run free routing, corpus, protocol-history, test, build, and secrets gates after scoped edits.
10. Add a local task for a machine-enforced remote identity guard.
11. Implement and test that guard without a paid call.
12. Obtain independent review for the guard and the Scout drift decision.
13. Update the round ledger, QA record, handoff, and task queue.
14. Reconcile owned panes and listeners through their owning agent.

Do not use offline review to rewrite the saved artifact.
Do not use a judge verdict alone to change a golden.
Do not file or comment on upstream issues without separate authority.

## Required remote identity guard

A future long live run needs a machine-enforced remote identity vector.
The vector must exclude volatile request timestamps.

At minimum, the vector must include these values:

- Scout OpenAPI version and canonical OpenAPI SHA-256
- Lumenloop advertised contract identity and canonical inventory SHA-256
- Stellar Docs index settings identity and canonical title-set SHA-256

The runner must capture the vector before and after each answering call.
The runner must compare it before the next paid call.

Any change must produce these effects:

1. Stop before the next paid call.
2. Preserve completed rows and unattempted IDs.
3. Set `meta.comparable: false`.
4. Suppress all aggregates.
5. Record the changed service and both identity vectors.
6. Forbid resume under the same method authorization.

The artifact must contain both endpoint-local and remote-service guard results.
`meta.comparable: true` must require both guard groups to pass.

## Deterministic future paired rerun criteria

A future paired rerun can start only after all criteria below pass.

### Before new authorization

1. Complete the Scout `1.9.30` drift decision from regenerated artifacts.
2. Reconcile every routing, schema, exposure, golden, finding, and documentation effect.
3. Land the machine-enforced remote identity guard with tests.
4. Record a clean immutable runner and candidate revision.
5. Complete an independent pre-spend review of the revised method.
6. Obtain new caps for the P6 check and both 500-case arms.

The review must resolve the placement of the full candidate row review.
The paired window stays open until the baseline postflight passes.
Any upstream change during an intermediate review invalidates the window.

### Before the candidate arm

1. Recompute every existing revision, surface, corpus, binary, environment, and register pin.
2. Require exactly 500 active and unique ordered IDs.
3. Require the same `claude-sonnet-5`, `v2.10`, and `p6` tuple.
4. Require `QA_AGENT_PROMPT_APPEND` to remain unset.
5. Capture the complete remote identity vector three times.
6. Separate the three probes by at least five minutes.
7. Require all three vectors to match exactly.
8. Run a newly authorized P6 self-test and retain its machine-readable result.
9. Require seven successful calls and complete costs.

### During both arms

1. Run the candidate before the baseline.
2. Use one runner revision, corpus, tuple, register, binary, environment, and adapter hash.
3. Capture remote identities before and after every answering call.
4. Stop immediately under the remote guard rules after any change.
5. Do not resume a stopped arm.
6. Do not change the stability register or panel cap.
7. Keep the full pair inside one continuous identity window.

### Before the baseline arm

1. Require a complete candidate structural audit.
2. Require 500 unique, answered, and judged candidate rows.
3. Require complete costs and zero unattempted IDs.
4. Require all local and remote guards to pass.
5. Require no aggregate suppression.
6. Recheck the same remote identity vector immediately before launch.
7. Stop if any candidate review confirms unsafe or fabricated output.

### After both arms

1. Require two complete and comparable 500-row artifacts.
2. Require identical ordered IDs and all shared method pins.
3. Require the remote identity vector to remain unchanged through both postflights.
4. Run the free paired printer with the baseline first.
5. Require at least 100 eligible IDs after the T4/T5 union exclusion.
6. Stop after `PASS` or `FAIL`.
7. Treat other `INDETERMINATE` results as unfinished evidence.
8. Request new authority before the one permitted statistical repeat.
9. Never take a third look.

## Deterministic closeout criteria

The round can close only after all criteria below pass.

1. Review every candidate and baseline row once.
2. Review every grade transition and every T3, T4, or T5 row.
3. Recheck every mutable disputed claim against current sources.
4. Route own-repository defects to `.agents/TODO.md`.
5. Route verified upstream defects to `improvements/`.
6. Use `golden-truth` for every golden change.
7. Update the relevant QA record with exact stamps and honest caveats.
8. Run all required free repository and lane gates.
9. Reconcile every independent review finding.
10. Record every owned pane and final agent state.
11. Obtain deployment authority before any production deploy.
12. Record the production version and smoke results after deployment.

An honestly blocked closeout can omit a valid pair.
It must record the stopped methods, consumed cost, evidence, and next authorization gate.

## Repository documentation updates

The following repository records now need updates:

- `.agents/rounds/2026-09-03-truth-maintenance.md`
  Record the candidate stamp, cost, raw counts, interval failure, and paid stop.
  Replace the stale statement that no candidate paid call started.
  Update the checklist and link this audit.

- `eval/qa/README.md`
  Record the artifact as a stopped mixed-upstream diagnostic.
  Do not promote its 199/230/71 aggregate to the current headline.

- `.agents/NEXT.md`
  Replace the pre-round handoff with the current stopped-round state.
  Record Scout `1.9.30`, the invalid pair, and the new authorization gate.

- `.agents/TODO.md`
  Add the machine-enforced remote identity guard.
  Update the `sd-049` and `sk-021` task because independent verification finished.
  Keep upstream filing blocked until the owner authorizes it.

- `.agents/skills/run-evals/SKILL.md`
  Add the remote identity vector to paid live-run comparability.
  Require the artifact to fail closed after any remote identity change.

- `eval/EVALS.md` and `eval/qa/README.md`
  Define remote-service stability as part of comparability for long live runs.
  Explain that listener stability alone is insufficient.

- `eval/README.md`
  Add a new Scout `1.9.30` decision only after full drift classification.
  Keep the dated Scout `1.9.23` rejection as historical evidence.

`PLAN.md` needs no immediate edit.
Its committed Scout `1.9.1` snapshot remains accurate until a new drift decision lands.

## Final verdict

`STOP`

The artifact passes its local and structural checks.
The planned comparison fails the remote upstream interval contract.
The baseline and all later paid methods must remain stopped.
