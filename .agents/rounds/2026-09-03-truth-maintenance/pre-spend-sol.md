# Independent pre-spend review

Date: 2026-09-03

Role: independent reviewer

## Decision

No paid method can start.

The candidate fails local gates and has no clean revision.
The paid plan also lacks a real baseline-versus-candidate method.
The historical-answer method cannot run because its local artifacts are absent.

## Evidence reviewed

I read these instruction and measurement files:

- `AGENTS.md`
- `.agents/skills/truth-maintenance/SKILL.md`
- `.agents/skills/run-evals/SKILL.md`
- `eval/EVALS.md`
- `eval/qa/README.md`
- `research/audits/2026-07-11-eval-round-orchestration.md`
- `.agents/rounds/2026-09-03-truth-maintenance.md`
- `.agents/rounds/2026-09-03-truth-maintenance/drift-terra.md`

I inspected the current diff and all four free result files.
I made no paid call, deployment, or source change.

`HEAD` and `main` both resolve to `2ee801f80d626e68f010392a7d541aab7997349d`.
The candidate exists only as a dirty generated diff.

The diff changes these generated files:

- `inventory/stellar-light.json`
- `inventory/stellar-docs-titles.json`
- `catalog/manifest.json`
- `specs/super-spec.json`

Scout changes from OpenAPI `1.9.1` to `1.9.23`.
The Scout operation count stays at 37.
The manifest keeps 252 entries.

The diff also adds the Docs title `USDT0 Transfers with LayerZero`.
That title changes `stellarDocs.search_asset_token_docs` keywords.
Therefore, the present candidate is not a Scout-only treatment.

The main manifest SHA-256 is `4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b`.
The dirty candidate manifest SHA-256 is `ad9491b2deb51c63bae9db9231dda95d790672b216a833342c38182cb9b69ff1`.

## Free result review

The free result roles follow from their times and manifest behavior.
The ledger must still record the complete role mapping and hashes.

| role | result | SHA-256 |
| --- | --- | --- |
| main routing | `eval/results/routing-2026-09-03T15-22-22-048Z.json` | `c950ad72e7a0293e4a7eb95a91d53f15ed3b7770afc2d73e2decbeedb4bb7596` |
| candidate routing | `eval/results/routing-2026-09-03T15-25-17-326Z.json` | `ef21aff2bf09470031fd1ce2a436016988171d2be07bfa59dfa51d8bec171856` |
| main protocol history | `eval/results/protocol-history-2026-09-03T15-22-26-521Z.json` | `c062d76169d948ae8f11d57289211b300407db7883fc1b30165727385a7d0028` |
| candidate protocol history | `eval/results/protocol-history-2026-09-03T15-25-22-707Z.json` | `46cb1d8e399c9d1f49274f796eb9180756717c6b031b1f31244446980d4d008f` |

The main routing gate passes.
The candidate routing gate fails because the manifest hash changed.

| lane | main | candidate | delta |
| --- | ---: | ---: | ---: |
| legacy top 1 / 3 / 5 | 213 / 279 / 312 | 211 / 277 / 312 | -2 / -2 / 0 |
| extended top 1 / 3 / 5 | 90 / 110 / 116 | 90 / 109 / 114 | 0 / -1 / -2 |
| skills top 1 / 3 / 5 | 16 / 23 / 23 | 16 / 22 / 23 | 0 / -1 / 0 |
| holdout passes | 21 | 22 | +1 |
| holdout forbidden captures | 11 | 10 | -1 |

The legacy top-five order changes on 75 cases.
The extended top-five order changes on 22 cases.
The skills top-five order changes on seven cases.
The holdout top-five order changes on six cases.

The changed manifest can reach 262 active QA cases through current top-five results.
This count is provisional because required candidate repairs will change the surface.

Protocol-history results also move in both directions.

| contract | required top-five | forbidden captures | result |
| --- | ---: | ---: | --- |
| `protocol-history-routing-v2` | 4/8 to 7/8 | 1/2 to 1/2 | fail to fail |
| `protocol-history-blind-v2` | 3/11 to 7/11 | 4/7 to 5/7 | fail to fail |

Scout now carries exact or near-exact frozen questions.
These strings contaminate the visible protocol-history gains.
The gains receive no product credit.

The candidate also has ten test failures.
The compact super spec is 308,091 bytes.
It exceeds the 300 KiB limit by 891 bytes.
Other failures cover exposure counts, signature compaction, and contaminated routing artifacts.

These failures block every paid method against this candidate.

## Re-derived measurement questions

The round needs two separate measurements.

First, the round needs a fresh 500-case candidate snapshot.
This measurement reports current candidate quality only.
It does not report an improvement from 2026-08-19.

Second, the round needs a fresh baseline-versus-candidate comparison.
This measurement estimates the effect of the refreshed Raven surface.

Both arms will call the current live Scout service.
Therefore, the comparison does not estimate the full Scout release effect.
It estimates the Raven catalog, schema, and description effect.

The present diff also contains a Docs title change.
The round must call the treatment a composite drift candidate.
Alternatively, the coordinator must create a Scout-only candidate revision.

The 2026-08-19 497-case result remains historical context.
Its tuple was `claude-sonnet-5` / `v2.4` / `p5`.
The current tuple is `claude-sonnet-5` / `v2.10` / `p6`.
The denominator and case content also changed.

No local 2026-08-19 result artifact exists now.
I found zero matching files in the repository or ignored result store.
Thus, the proposed historical-answer rejudge cannot run.

## Comparability contract

The baseline-versus-candidate method needs fresh collection on both arms.
The two arms must use one exact ordered case list.

The final affected set must be derived after all candidate repairs.
It must include every active case with either condition below:

- A changed operation appears in either arm's top-five results.
- The ordered top-five operation list differs between arms.

The current dirty candidate produces 262 such cases.
The coordinator must record the final list and its SHA-256 before spend.

Both arms must share these values:

- the exact case content and ordered IDs
- `claude-sonnet-5` answering
- `claude-sonnet-5` judging
- rubric `v2.10`
- pack `p6`
- an empty prompt append
- the agent binary SHA-256
- the agent environment SHA-256
- the QA implementation SHA-256
- the result and case identity schemas
- one pinned stability-register path and SHA-256
- the judge-tier policy and explicit panel cap

Each arm must use its own expected server revision and surface SHA-256.
The surface hashes must differ only for the reviewed treatment.

Use `--max-panel-cases 34` for each affected-set arm.
Use the same pinned stability register for both arms.
Generate that register before the first paid call.

Run the free paired printer with `--json` after both arms finish.
Its default `0.08` margin is only a no-change radius.
It is not a product tolerance or ship gate.

Do not run a second paired look in this authorization.
An `INDETERMINATE` result stays indeterminate.

The full 500-case result must use all 500 active cases.
The current compiled battery contains exactly 500 active cases.
Its current SHA-256 is `8e144123aae5bb8162bae23347c7f061890b501df62acc4d04ccec7f0b4c97d4`.

Golden work can change this hash before launch.
Therefore, the ledger must record the final hash after golden reconciliation.

The full run must name its measured revision.
I recommend the final candidate revision.
This choice makes the result a pre-landing current-quality snapshot.

Never compare its aggregate with the 497-case historical aggregate.
Report the historical value only as separate context.

The noise floor is 23.3% per-row any-flip.
It bounds expected variance.
It is not a significance threshold.

## Paid method decisions

| proposed method | decision | reason |
| --- | --- | --- |
| Judge behavior self-test | Keep after repair | Pack `p6` changed on 2026-09-02. No paid `p6` self-test is recorded. |
| Designed sample 30 | Remove | It adds another stochastic view. It does not answer the main comparison. |
| Full current battery | Keep after repair | It is the required 500-case current-quality measurement. |
| Canonical live data | Keep after repair | It measures current execution behavior on the frozen 15-case contract. |
| Digest supplement | Remove | The candidate does not change the Lumenloop digest path. |
| Historical-answer rejudge | Remove | The artifacts are absent. Rejudging would not create a fresh Scout baseline. |
| Targeted rejudges | Replace | Use one bounded flip batch for each fresh comparison arm. |
| Agentic routing | Remove | The Workflow method lacks the required total-cap contract. The fresh QA comparison is stronger. |

The revised method ledger should use these maximums:

| method | maximum | enforcement |
| --- | ---: | --- |
| Judge behavior self-test | `$3.50` | seven calls, `$0.50` per call, no retry |
| Fresh main affected-set arm | `$140` | one `run-qa.mjs` total cap |
| Fresh candidate affected-set arm | `$140` | one `run-qa.mjs` total cap |
| Full 500-case candidate | `$500` | one `run-qa.mjs` total cap |
| Canonical live 15 | `$20` | one `run-qa.mjs` total cap |
| Main flip rejudge batch | `$25` | one `re-judge.mjs` total cap |
| Candidate flip rejudge batch | `$25` | one `re-judge.mjs` total cap |

The revised maximum is `$853.50`.
Unused capacity authorizes no rerun or added method.

The self-test has no native total-cap flag.
Use a hashed wrapper that injects `--max-budget-usd 0.50` into each judge call.
Record the real binary path, version, wrapper path, and wrapper SHA-256.

The `$140` affected-set cap uses current evidence.
The stored same-100 run cost `$40.9579502`.
The current provisional set has 262 cases.
The cap gives approximately 30% reserve over linear scaling.

The full-run `$500` cap matches the current ledger.
The prior 497-case collection cost `$303.86782035`.
The prior tuple differs, so this value is only a cost reference.

The live-15 `$20` cap exceeds the recorded `$9.54` maximum.
It still provides a bounded reserve.

## Clean-server requirements

No paid collection can use the current dirty workspace.

The baseline server must use clean revision `2ee801f80d626e68f010392a7d541aab7997349d`.
The candidate server must use one clean reviewed commit.
That commit must include every approved generated artifact.

Do not use a partial overlay.
Do not use two concurrent Wrangler processes.
Use one owned server pane and one port sequentially.

For each arm, record these items before spend:

- the 40-character server revision
- the server surface SHA-256
- a real MCP `initialize` response of 200
- the listening process identity
- the clean-worktree result
- the agent binary path, version, and SHA-256
- the final agent environment SHA-256
- the case-list SHA-256
- the stability-register SHA-256

Run the postflight checks after every collection.
Reject any changed listener, revision, source revision, surface, binary, or environment.

Every row must report the `raven` MCP server as `connected`.
Every expected and observed SHA-256 pair must match.

## Stop rules

The following events stop the next paid call:

- Any free preflight or candidate gate fails.
- The server readiness probe does not return 200.
- Any required revision or SHA-256 value is absent.
- The candidate worktree is dirty.
- The result becomes non-comparable.
- Any paid call omits its cost.
- A method reaches its budget cap.
- A method returns an incomplete denominator.
- Any arm has a candidate-only T4 or T5 loss.
- The paired printer reports `FAIL`.
- Review confirms a new unsafe or fabricated candidate answer.
- Two unrelated rows show the same candidate-caused regression.

An incomplete lane remains incomplete.
Do not report a smaller denominator as the planned method.

Do not rerun any stopped method.
A rerun needs a ledger amendment and another pre-spend review.

Run the candidate affected-set arm first.
This order avoids a baseline charge for a broken candidate.
Run the main arm only after the candidate arm passes all collection guards.

An `INDETERMINATE` paired result does not stop the current-quality snapshot.
It also does not support an improvement claim.

## Review coverage

The current checklist is too weak for a full closeout.
It requires non-correct rows and undefined surprising passes.

Review every row in both affected-set arms.
Review every row in the full 500-case result.
Record each selected ID exactly once in a coverage table.

For every affected-set grade difference, run both bounded rejudge batches.
One batch rejudges the main answers.
The other batch rejudges the candidate answers.

Review tool choices, missing facts, wrong claims, and source provenance.
Do not count a grade flip without transcript evidence or stable rejudging.

Live-verify every `wrong` result before calling it an agent failure.
Review every `partial`, T3, T4, and T5 row.
Review all `correct` rows for unsupported claims and hidden omissions.

Run the free plan regrade on every completed QA artifact.
Keep plan results separate from answer-quality results.

Classify every failure with the `run-evals` root-cause table.
Send own-repo defects to `.agents/TODO.md`.
Send verified upstream defects to `improvements/`.
Use `golden-truth` for each gospel change.

The final reviewer must differ from the coordinator and paid executor.
The final reviewer must recompute all counts, costs, hashes, and exclusions.

## Exact repairs before launch

1. Resolve the frozen-question leakage upstream or remove the candidate drift.
2. Keep both protocol-history contracts failed until uncontaminated evidence exists.
3. Reduce the compact super spec below 300 KiB with a general rule.
4. Resolve the two Scout exposure decisions before the final surface freezes.
5. Rebuild every generated artifact through its script.
6. Make `npm test`, typecheck, build, routing, and artifact-sync checks pass.
7. Do not rebaseline while strict losses or leakage remain unresolved.
8. Commit the final candidate and record its 40-character revision.
9. Label the treatment as composite, or produce a Scout-only candidate.
10. Rerun all four free instruments after the candidate freezes.
11. Record each free result path, role, SHA-256, and surface input hash.
12. Recompute and freeze the affected case list after that rerun.
13. Record the exact paid commands and the revised `$853.50` method ledger.
14. Record all clean-server, binary, environment, case, and stability pins.
15. Replace the historical rejudge with fresh main and candidate arms.
16. Remove the sample-30, digest, and agentic methods from this spend.
17. Expand review coverage to every affected-arm and full-battery row.
18. Add the stop rules above to the round ledger.
19. Run a bounded delta review after these repairs.
20. Start no paid call until that delta review returns `LAUNCH-OK`.

CHANGES-REQUIRED
