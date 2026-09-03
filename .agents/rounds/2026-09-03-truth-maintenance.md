# Truth maintenance 2026-09-03

## Scope

This round checks current service quality and the measurable effect of work since 2026-08-19.
It covers live drift, routing, end-to-end QA, live-data execution, golden health, upstream findings,
production smoke checks, and issue or pull-request follow-up.

The current repository revision is `2ee801f80d626e68f010392a7d541aab7997349d`.
The deployed runtime remains `0c71b99c02425307be5ef5c5c4ff1ef05935663d` because later changes are evaluation records only.

The primary current-quality measurement is a fresh full 500-case QA collection.
The designed sample-30 headline remains separate.
The 15-case canonical live-data and two-case digest contracts remain separate diagnostics.
Routing gates and protocol-history v2 remain free, separate instruments.

The historical 2026-08-19 497-case round remains context only.
The impact comparison collects fresh answers from the exact 2026-08-19 service revision and the
final candidate. Both arms use the final 500-case corpus, current runner, current live upstream state,
and the same judge tuple. This estimates the current-task service-revision effect. It does not
reconstruct service quality on 2026-08-19.

The owner authorized paid eval and golden-QA work for this round.
Each method still uses an enforceable local cap.
One method authorization permits one run only.

## Lane plan

| lane | owner route | evidence and completion check | report destination |
|---|---|---|---|
| Pre-spend plan review | Claude, Fable 5.1, `xhigh` | Re-derive comparability, budgets, pins, stop rules, and review coverage. Return `LAUNCH-OK` or exact repairs. | This ledger, `## Decisions` |
| Drift and routing | Codex, GPT-5.6 Terra, `high` | Refresh generated surfaces, classify every diff, run routing gates, and record exact hashes. Do not edit hand-authored files. | This ledger, `## Drift verdict` |
| Improvements and upstream state | Codex, GPT-5.6 Sol, `high` | Recheck three proposed findings, all material upstream activity, probes, intake, and the `sls-080` monitor. | This ledger, `## Improvements/issues/PR verdict` |
| Golden health | Claude, Opus 5, `xhigh` | Check stale and near-due cases, consistency clusters, date traps, and a refute-first sample. Research only until a corroboration matrix exists. | This ledger, `## Golden verdict` |
| Paid eval execution | Codex, GPT-5.6 Sol, `high` | Run only the reviewed commands against a pinned clean server. Preserve every result stamp and cost. | This ledger, `## Eval verdict` |
| Eval result review | Claude, Fable 5.1, `xhigh` | Review every non-correct row and surprising passes. Recheck disputed claims live. | This ledger, `## Eval verdict` |
| Final independent review | Claude, Opus 5, `xhigh` | Re-derive the diff, result claims, finding lifecycles, tests, and remaining risks. | This ledger, `## Final checklist` |

Route cards:

- Lane: pre-spend plan review.
  Worker CLI: Claude. Model: Fable 5.1. Effort: `xhigh`.
  Reason: the lane requires ambiguous planning and measurement-contract review.
  Verified: pending targeted Herdr start.
  Fallback: Claude Opus 5 at `xhigh`.
  Reviewer: not applicable because this lane is the independent gate.
  Report contract: verdict, exact repairs, invalid comparisons, budget risks, and blockers.
- Lane: drift and routing verification.
  Worker CLI: Codex. Model: GPT-5.6 Terra. Effort: `high`.
  Reason: this is bounded data collection and deterministic repository verification.
  Verified: pending targeted Herdr start.
  Fallback: GPT-5.6 Sol at `high`.
  Reviewer: Fable 5.1 at `xhigh` if drift is not pure provenance.
  Report contract: changed files, drift class, exact commands, hashes, gate results, and blockers.
- Lane: improvements and upstream state.
  Worker CLI: Codex. Model: GPT-5.6 Sol. Effort: `high`.
  Reason: the lane acts on live evidence and can drive consequential lifecycle changes.
  Verified: pending targeted Herdr start.
  Fallback: Claude Opus 5 at `high`.
  Reviewer: Opus 5 at `xhigh` for any deletion candidate.
  Report contract: deterministic state table, live rechecks, proposed edits, and external writes.
- Lane: golden health.
  Worker CLI: Claude. Model: Opus 5. Effort: `xhigh`.
  Reason: the lane needs precision review and quality-first technical judgment.
  Verified: pending targeted Herdr start.
  Fallback: Fable 5.1 at `xhigh`.
  Reviewer: GPT-5.6 Sol at `high` for each material gospel change.
  Report contract: corroboration matrices, affected IDs, source classes, and honest unresolved facts.
- Lane: paid eval execution.
  Worker CLI: Codex. Model: GPT-5.6 Sol. Effort: `high`.
  Reason: this is a long terminal workflow with strict environment and revision pins.
  Verified: pending targeted Herdr start.
  Fallback: Claude Opus 5 at `high`.
  Reviewer: Fable 5.1 at `xhigh`.
  Report contract: result stamps, costs, pins, T1 through T5, failures, and blockers.

Superseded paid method caps before review:

| method | contract | maximum |
|---|---|---:|
| Judge behavior self-test | seven `claude-sonnet-5` judge calls, current rubric and pack | `$10` |
| Designed headline | variant A, deterministic sample 30 | `$40` |
| Full current battery | variant A, all 500 active cases | `$500` |
| Canonical live data | `live-data-canonical-v3`, 15 cases | `$20` |
| Digest supplement | `live-digest-supplement-v2`, two cases | `$5` |
| Historical-answer rejudge | only a guard-valid common-ID set under the current tuple | `$150` |
| Targeted rejudges | one identical-input pass for disputed current rows | `$75` |
| Agentic routing | the existing exact-primary contract, complete expected job count | `$75` |

This `$875` table is superseded by the reviewed amendment below.
Unused capacity does not authorize a method rerun.
The pre-spend reviewer can lower a cap or remove an invalid method.
It cannot add another method without a reviewed ledger amendment.

The answering and judge models remain `claude-sonnet-5`.
The current judge tuple is expected to be rubric `v2.10` and pack `p6`.
The runner must assert the clean server revision, surface SHA-256, agent binary SHA-256, and agent
environment SHA-256 before each collection.

## Drift verdict

Scout changed from OpenAPI `1.9.1` to `1.9.23`. The operation set stays at 37.
The change is routing-relevant and schema-relevant. It is not a mechanical provenance bump.

The generated candidate contains 252 manifest entries and 64 callable super-spec paths.
The Scout inventory changed from `1a261c4a…d8671b0` to `1bfe9d6a…c0fc4f`.
The manifest changed from `4cd28f4b…4fe8b` to `ad9491b2…b69ff1`.
The research `x-routing` block changed from `468a9d98…ba716b` to `65117331…caf781`.
Therefore, protocol-history trigger PH1 fired.

Thirteen operations changed routing text. Twenty-six operation objects changed.
The changed schema components are `Meta`, `Partner`, `Project`, `Repo`, and `Stablecoin`.
No Scout operation intersects the only runnable skill, `skills.lumenloop.stellar-ecosystem-digest`.
No runner smoke is required for this drift.

The committed routing gate passed before refresh. The generated candidate changed its metrics:

| lane | committed | candidate | delta |
|---|---:|---:|---:|
| legacy top 1 / 3 / 5 | 213 / 279 / 312 | 211 / 277 / 312 | -2 / -2 / 0 |
| extended top 1 / 3 / 5 | 90 / 110 / 116 | 90 / 109 / 114 | 0 / -1 / -2 |
| skills top 1 / 3 / 5 | 16 / 23 / 23 | 16 / 22 / 23 | 0 / -1 / 0 |
| holdout passes | 21 | 22 | +1 |
| holdout forbidden captures | 11 | 10 | -1 |

The candidate routing result is `eval/results/routing-2026-09-03T15-25-17-326Z.json`.
It failed only because the candidate manifest does not match the committed gate hash.
The routing baseline must not move while strict losses and leakage remain unresolved.

Protocol-history v2 changed from 7/19 to 14/19 required top-five hits.
Forbidden captures changed from 5/9 to 6/9. Neutral rows changed from 3/4 to 4/4.
Both contracts still fail.

Scout now publishes an exact frozen Protocol 24 question in `x-routing.exampleQuestions`.
It also publishes a near-copy of the frozen protocol-history question.
The exact string breaks the clause-artifact leakage guard.
These gains receive no product credit without uncontaminated evidence.

`npm test` found ten candidate failures. The compact super spec is 308,091 bytes.
It exceeds the fixed 300 KiB limit by 891 bytes.
The other failures cover four new routed operations, three newly oversized signatures, and the
stale or contaminated vector artifact.

`npm run typecheck`, `npm run build`, and `npm run secrets:scan -- --tree` passed.
The independent Terra review returned `CHANGES-REQUIRED` in
`2026-09-03-truth-maintenance/drift-terra.md`.

### Final drift decision

The round rejected the Scout 1.9.23 drift and both proposed operation exposures.
The accepted Scout inventory remains OpenAPI 1.9.1.
No Scout routing baseline changed.

The round accepted the Docs-only title refresh.
It added `/docs/tokens/usdt0-layerzero` and increased the title count from 649 to 650.
All 544 ordered top-five routing lists and every gate total remain unchanged.
Five asset-token Docs scores increased without a rank change.
The independent review authorized a mechanical manifest-fingerprint update only.
The final routing gate passes with manifest SHA-256
`b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729`.

The protocol-history v2 contracts now stop as `source-expired` before scoring.
The full-manifest epoch guard intentionally treats the accepted Docs drift as a source change.
The frozen epoch, builder guard, and normalized leakage tests passed independent review.

## Eval verdict

The free harness checks passed:

- `npm run eval:selftest`
- `npm run eval:compile` with 338 legacy and 122 extended cases
- `npm run eval:qa:compile` with 500 cases and content SHA-256 `623cd658…d915`
- `npm run eval:qa:lint -- --stale` with 0 errors and 62 warnings
- `npm run eval:qa:register` with no reopenings

The independent pre-spend review approved the full paired method after its launch blockers clear.
The historical aggregate remains context only: 187 correct, 226 partial, and 84 wrong across 497.
The repository contains the exact historical service revision, but not its old paid result artifact.

The final paid plan now uses two fresh 500-case arms.
The exact service baseline is `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`.
Both arms use the final current corpus and one current runner revision.
The candidate arm also supplies the current-quality result.

The exact-old-runtime adapter and P6 self-test wrapper passed bounded code review.
The paired printer now rejects any missing, reversed, mixed, or drifting adapter topology.
No paid call has started.
The remaining launch gates are clean revisions, real-runtime proof, final pins, and one delta review.

## Golden verdict

Corpus lint reports no overdue cases under its strict stale rule.
The round reverified these five same-day cases:

- `q-scf-current-round`
- `q-tool-cli-skills-discovery`
- `q-tool-indexer-repos-discovery`
- `q-tool-leaderboard-open-issues`
- `q-tool-sdk-repos-discovery`

The round also reverified ten near-due cases and refreshed the related consistency records.
All 15 changed cases passed an independent golden review.
The compiled corpus contains 500 active cases.
Its content SHA-256 is `623cd65816979285338865d7e62043bbe2247f083f5b1492d94b5c8805a1d915`.
Two source conflicts remain honestly marked as disputed.
The round added proposed findings `sd-049` and `sk-021` for those verified upstream gaps.

## Improvements/issues/PR verdict

| finding | trigger | upstream ref | ref state | PR checks/reviews/blocker | live re-check | repo action | next wake-up |
|---|---|---|---|---|---|---|---|
| `sd-047` | cadence conflict | `stellar/stellar-docs#2805`, PR `#2806` | PR open on 2026-09-03 | checks pass; review required | blocked until merge | no comment | PR merge |
| `ll-019` and `ll-029` | response contract drift | `lumenloop/lumenloop-backend#35` | open on 2026-09-03 | no maintainer activity since 2026-08-19 | pending | no comment | substantive owner activity |
| `sls-073` | perps `vet-idea` parity | `Stellar-Light/stellarlight#1025` | closed 2026-08-25 | four fixes merged | live call returns matched project rows with `matchMode: scored` | `fixed-upstream`; comment and resolver pending | committed source record |
| `sls-077` | issued claim response enum | `Stellar-Light/stellarlight#1086` | closed 2026-09-01 | fix shipped in `1.9.13` | `1.9.23` includes `issued`; live call returns it | `fixed-upstream`; comment and resolver pending | committed source record |
| `sls-078` | quality routing capture | `Stellar-Light/stellarlight#1087` | closed 2026-09-01 | route fix shipped in `1.9.13` | eight self-referential phrases replace broad terms | `fixed-upstream`; local scorer TODO retained | committed source record |
| `sls-079` | lifecycle and deployment conflation | no upstream issue | never filed | no comment applies | Stellars Finance is `Pre-Release` with separate Testnet deployment | `fixed-upstream`; resolver pending | committed source record |
| `sls-023` | RWA product deployments | `Stellar-Light/stellarlight#494` | closed 2026-08-11 | residual comment remains | DTCC product exists; generic deployment remains `unknown`; assets remain absent | partial; keep active | next drift or owner activity |
| `sls-033` | wallet taxonomy and availability | `Stellar-Light/stellarlight#742` | closed 2026-08-13 | residual comment remains | 71 exact wallet rows; 9 lack `productKind`; 38 lack availability | recurrence; keep active | next drift or owner activity |

## Own-repo todos

- `.agents/TODO.md` now records the general structured-routing and schema-keyword repair.
- The repair must preserve phrase boundaries and specific intent across extraction caps.
- It must also stop weak schema words from suppressing stronger cross-service results.
- No operation-specific exception, new Scout finding, or routing-baseline change is authorized.

## Decisions

- The round measures current quality even if the result does not show improvement.
- Corpus-health changes never count as product gains.
- Historical aggregate movement receives no causal credit without exact common-ID and judge-tuple guards.
- Reported upstream issues stay silent without substantive owner activity.
- No golden changes occur from judge scores alone.
- No routing baseline moves merely to make a gate pass.
- Exact or near-exact upstream eval questions contaminate the matching rows.
- Contaminated rows cannot support an improvement claim.
- The full 500-case run remains useful for current quality after the candidate passes local gates.

## Paid measurement amendment

The independent plan review in `two-week-impact-prespend-sol.md` replaces the superseded `$875`
table. Both full arms use fresh answers and judgments. The exact baseline revision is
`90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`. The final candidate and runner revisions must be clean
and immutable before any paid call.

| method | cap | rule |
|---|---:|---|
| P6 judge self-test | `$3.50` | Seven calls at `$0.50` each. No retry. |
| Final candidate, full 500 | `$400` | One complete current-quality arm. |
| Exact old revision, full 500 | `$400` | One complete paired baseline arm. |
| Candidate flip rejudge | `$25` | One batch after the paired printer. |
| Baseline flip rejudge | `$25` | One batch after the paired printer. |
| Paired-method maximum | `$853.50` | No transfer, resume, or automatic repeat. |

The independent live-data review in `live-data-prespend-sol.md` adds candidate-only diagnostics.
Run these methods only after both 500-case arms and their paired review pass the stated stop rules.

| method | cap | rule |
|---|---:|---|
| Canonical live collection | `$20` | One complete 15-case method. |
| Canonical verdict rejudge | `$3` | One batch for review-disputed IDs only. |
| Digest supplement collection | `$5` | One complete two-case method. |
| Digest verdict rejudge | `$1` | One batch for review-disputed IDs only. |
| Live amendment maximum | `$29` | No transfer, resume, repeat, or added method. |

The total authorized maximum is `$882.50`.
The owner approved this spend for measured product quality.
Unused money authorizes no additional method or rerun.
Every method still requires the exact caps, pins, and stop rules in its independent review.

Herdr note: the first read-only pane listing failed in the external approval service with HTTP 404.
The restricted retry failed with `Operation not permitted`.
A later approved retry succeeded. This round created panes `w16:p1N`, `w16:p1P`, and `w16:p1Q`.
The approval service blocked repository sharing with Fable and Opus under their normal launch.
The idle Claude panes `w16:p1N` and `w16:p1Q` were closed without receiving repository content.
Replacement Codex panes `w16:p1R` and `w16:p1S` now hold the pre-spend and golden reviews.

## Final checklist

- [ ] Final pre-spend delta review returns `LAUNCH-OK` after the real-runtime proof.
- [ ] Spawned pane IDs and final agent states are recorded.
- [x] Drift artifacts are generated and classified.
- [x] Routing and protocol-history results are recorded.
- [ ] The paired full battery, live-data, and digest contracts are complete or honestly blocked.
- [ ] Every non-correct result and surprising pass is reviewed.
- [x] Golden changes carry independent source classes and root-cause records.
- [ ] Proposed and reported improvements have live state and deterministic next actions.
- [ ] Production smoke checks pass.
- [ ] Baseline repository validation and secrets scanning pass.
- [ ] Independent closeout review passes.
- [ ] Owned Herdr panes and agents are closed without touching unrelated resources.
