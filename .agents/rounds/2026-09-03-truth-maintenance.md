# Truth maintenance 2026-09-03

## Scope

This round checks current service quality and the measurable effect of work since 2026-08-19.
It covers live drift, routing, end-to-end QA, live-data execution, golden health, upstream findings,
production smoke checks, and issue or pull-request follow-up.

The final measured candidate revision is `65d2f98dd80305e9a2b9000c46e9a91ba0557cbc`.
The last recorded deployment state, from 2026-09-02, is `0c71b99c02425307be5ef5c5c4ff1ef05935663d`.
It stays the deployed runtime until this round merges and deploys.
Nobody re-verified the live Worker after that record.
The whole round lives on branch `codex/truth-maintenance-2026-09-03`. It contains the work
through `dc0761d`.

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

Superseded on 2026-09-04: the fresh 500-case candidate arm ran and then stopped as a diagnostic.
It is not a current-quality measurement. The paired comparison did not happen.
See `## Candidate arm result and stop (2026-09-04)` and `## Measurement state (2026-09-04)`.

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
The clean runner and candidate revision is `65d2f98dd80305e9a2b9000c46e9a91ba0557cbc`.
The exact-old-runtime proof passed for both service arms.
The final independent launch review returned `LAUNCH-OK`.

The frozen stability register has SHA-256
`06d3835b63ae05f40f808b9890628add8b905f32f60a65df19cbee1a751f9480`.
It contains 538 cases from 197 prior artifacts.
The paid P6 self-test passed all seven calls and reported complete costs.
It spent `$0.2536528` against the `$3.50` cap.
The first `npm` invocation stopped before payment because its wrapper changed the environment pin.
The reviewed direct-Node correction preserved the full-arm environment pin and passed.

The live pre-arm refresh stayed stable for Lumenloop, Stellar Docs settings, and 650 Docs titles.
Scout advertised `1.9.23` with canonical inventory SHA-256
`ec0c345b297220e8225c211adcc8c8eae91d07c24f33b645ad0142f2abd4fee5`.
Both paired arms must use this same live upstream interval.
The committed routing inventory intentionally remains Scout `1.9.1` after the recorded rejection.

The candidate arm did not start a paid call.
The external approval service requires explicit permission to send repository QA cases and service
transcripts to Anthropic Claude Sonnet 5 for answering and judging.

Superseded on 2026-09-04: the permission was later granted. The candidate arm ran from
`2026-09-03T18:29:30.879Z` to `2026-09-04T05:40:51.010Z` and completed all 500 rows.
The independent stop audit then stopped the baseline arm and every later paid method.
See `## Candidate arm result and stop (2026-09-04)`.

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
| `sls-073` | perps `vet-idea` parity | `Stellar-Light/stellarlight#1025` | closed 2026-08-25 | four fixes merged; [Raven comment](https://github.com/Stellar-Light/stellarlight/issues/1025#issuecomment-5529711483) | live call returns matched project rows with `matchMode: scored` | resolved and drained | regression |
| `sls-077` | issued claim response enum | `Stellar-Light/stellarlight#1086` | closed 2026-09-01 | fix shipped in `1.9.13`; [Raven comment](https://github.com/Stellar-Light/stellarlight/issues/1086#issuecomment-5529711476) | `1.9.23` includes `issued`; live call returns it | resolved and drained | regression |
| `sls-078` | quality routing capture | `Stellar-Light/stellarlight#1087` | closed 2026-09-01 | route fix shipped in `1.9.13`; [Raven comment](https://github.com/Stellar-Light/stellarlight/issues/1087#issuecomment-5529711487) | eight self-referential phrases replace broad terms | resolved; local scorer TODO retained | regression |
| `sls-079` | lifecycle and deployment conflation | no upstream issue | never filed | no comment applies | Stellars Finance is `Pre-Release` with separate Testnet deployment | resolved and drained | regression |
| `sls-023` | RWA product deployments | `Stellar-Light/stellarlight#494` | closed 2026-08-11 | residual comment remains | DTCC product exists; generic deployment remains `unknown`; assets remain absent | partial; keep active | next drift or owner activity |
| `sls-033` | wallet taxonomy and availability | `Stellar-Light/stellarlight#742` | closed 2026-08-13 | residual comment remains | 71 exact wallet rows; 9 lack `productKind`; 38 lack availability | recurrence; keep active | next drift or owner activity |

The required free `sls-080` monitor passed on 2026-09-03.
It returned `MaxSupportedProtocolVersion uint32 = 28`, `answerSource: knowledge-note`,
`generatedAt: 2026-09-03T18:20:47.059Z`, and
`scannedRef: 82660510ecda7fd365a14d08badb9d85fa22bc32`.
The source file at that exact revision also defines the value as `28`.

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

Consumption record, 2026-09-04: the P6 self-test spent `$0.2536528`. The candidate arm spent
`$190.1686672`. Both methods are spent. The baseline arm, both flip rejudges, the canonical
live-data method, and the digest method are stopped by `post-candidate-stop-audit-sol.md`.
The unspent remainder does not transfer to any new method. A new paired method needs its own
authorization. See `## Measurement state (2026-09-04)`.

Herdr note: the first read-only pane listing failed in the external approval service with HTTP 404.
The restricted retry failed with `Operation not permitted`.
A later approved retry succeeded. This round created panes `w16:p1N`, `w16:p1P`, and `w16:p1Q`.
The approval service blocked repository sharing with Fable and Opus under their normal launch.
The idle Claude panes `w16:p1N` and `w16:p1Q` were closed without receiving repository content.
Replacement Codex panes `w16:p1R` and `w16:p1S` now hold the pre-spend and golden reviews.

## Final checklist

Updated 2026-09-04.

- [x] Final pre-spend delta review returns `LAUNCH-OK` after the real-runtime proof.
- [ ] Spawned pane IDs and final agent states are recorded. Known panes: `w16:p1N`, `w16:p1P`,
      `w16:p1Q`, `w16:p1R`, `w16:p1S`, and the runner pane `w2R:p2`. The later repair lanes ran in
      separate worktrees and did not record pane IDs in this ledger. This item stays open.
- [x] Drift artifacts are generated and classified. Scout 1.9.23 and 1.9.30 are rejected.
- [x] Routing and protocol-history results are recorded.
- [x] The paired full battery, live-data, and digest contracts are honestly blocked. The candidate
      arm completed as a non-comparable diagnostic. The baseline, flip, live-data, and digest
      methods are stopped. See `## Measurement state (2026-09-04)`.
- [x] Every candidate row is reviewed once by an independent shard. Disagreements are recorded
      and left for adjudication. See `## Candidate row review (2026-09-04)`.
- [x] Golden changes carry independent source classes and root-cause records.
- [x] Proposed and reported improvements have live state and deterministic next actions. See
      `## Improvements state (2026-09-04)`.
- [ ] Production smoke checks pass. No deployment happened. The last recorded deployment state,
      from 2026-09-02, is `0c71b99`. Nobody re-verified the live Worker after that record.
- [x] Baseline repository validation and secrets scanning passed on each repair branch. The
      launch-contract repair lane ran the full baseline validation at `e5c835e` before `1847ffd`
      landed here. See `launch-contract-repair-sol.md`.
- [x] Fresh full validation after `1847ffd`. The orchestrator completed it on the root branch
      `codex/truth-maintenance-2026-09-03` with the work through `dc0761d`. Results:
      `npm run typecheck` passed; `npm test` passed with 108 files and 1,971 tests;
      `npm run test:smoke` passed with 4 files and 83 tests; `npm run build` passed;
      `eval:selftest` passed; `eval:compile` passed; `eval:qa:compile` produced 500 cases with
      content SHA-256 `c5d0c804…7b43e`; `eval:qa:lint -- --stale` passed with 0 errors and 62
      warnings; `eval:qa:register -- --check` passed; `eval:routing` passed its gate;
      `eval:qa:paired:validate` passed; `eval:protocol-history` stopped correctly as
      `source-expired` with no scored question; `improvements:index` produced 70 findings;
      `improvements:lint` passed. The final repair full run also passed with 108 files and 1,974
      tests. Its repair report records the remaining checks.
- [x] The Scout 1.9.30 rejection is recorded in `eval/README.md` beside the 1.9.23 decision
      (commit `bd8d2d2`).
- [x] The free two-agent capacity check is complete. The authoritative v2 `PASS` artifact is
      recorded in `paired-capacity-check-terra.md` (commit `dc0761d`).
- [x] Independent review of measurement design revision 2: `final-synthesis-review-sol.md`
      returned `CHANGES-REQUIRED` (commit `f766893`). P1 to P3 are repaired in `1847ffd`. S1 to
      S3 are repaired in this documentation pass.
- [x] Independent confirmation review returns `LAUNCH-OK`. The final Opus review inspected
      revision 3 and first withheld the verdict on L1. Its appended confirmation grants the verdict
      after repair.
- [x] Independent confirmation review returns `CLOSEOUT-OK`. The final Opus review first withheld
      the verdict on C1 to C3. Its appended confirmation grants the verdict after repair.
- [ ] Owned Herdr panes and agents are closed without touching unrelated resources.

## Candidate arm result and stop (2026-09-04)

The candidate arm completed all 500 rows and then stopped as a diagnostic.
It is non-comparable. It is not a current-quality headline. It cannot enter the paired printer.

| Item | Value |
|---|---|
| Artifact | `/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json` |
| Artifact SHA-256 | `e629666bf476244d350840069094a8a579757724c101830d6d6727685b5904f7` |
| Runner and candidate revision | `65d2f98dd80305e9a2b9000c46e9a91ba0557cbc`, adapter `verify-native` |
| Baseline arm | never started |
| Window | `2026-09-03T18:29:30.879Z` to `2026-09-04T05:40:51.010Z`, about 11 h 11 min |
| Raw verdicts | 199 correct, 230 partial, 71 wrong, 0 error |
| Raw shares | strict 39.8%, half-credit 62.8%, core-answer-correct 92.6% |
| Cost | `$190.1686672` of the `$400` cap; `$130.17` agent and `$60.00` judge; 500 agent calls and 790 judge calls |
| Traps (T3) | 41 answered, 33 pass, 8 fail; every failure is a safe answer with a missing required behavior |
| T2, T4, T5 | zero |
| Judge tuple | `claude-sonnet-5`, rubric `v2.10`, pack `p6`, `stability-boundary-v1`, panel cap 34 |
| Local pins | every runner, server, adapter, surface, corpus, binary, environment, and register pin matched |

The arm is diagnostic and non-comparable for two independent reasons.

1. Scout changed identity inside the arm. Row `q-gap-scout-status-envelope` recorded
   `apiVersion 1.9.23` at `2026-09-03T22:35:38.445Z`. Row `q-ti-scout-changelog-contract-check`
   recorded `apiVersion 1.9.30` at `2026-09-04T04:34:02.708Z`. The post-run refresh confirmed
   `1.9.30` at `2026-09-04T05:42:52.877Z`. The registered launch assertion 6 required a stop after
   any advertised upstream identity change. The runner had no machine guard for remote identity,
   so collection continued. The switch time is unknown inside a 5 h 41 min window. Row order is
   alphabetical, so the Scout regime correlates with category. No per-regime read is valid.
2. The executor rejected raw service envelope returns. `Could not serialize object of type
   "Object"` appeared on 380 of 500 rows with 493 occurrences. It hit 220 of 239 Docs rows. Every
   row recovered at the cost of at least one paid turn. The cause was a Proxy prototype set by the
   envelope guard in `src/executor/providers.ts`, present since `0f2a700` and absent at the
   baseline revision `90d0ba75`. The deployed runtime `0c71b99` carries this fault.

The raw counts describe this artifact only. They do not describe the service under one upstream
state. They support no improvement or regression claim against 2026-08-19 or against the exact
baseline revision.

The artifact `meta` carries `meanContinuousCoverage: 0.5601952380952382`. That metric was
invalid. `verdict.missingFacts` is judge prose, not an index into `golden.keyFacts`. Panel rows
union three judges' paraphrases, so 49 panel rows went negative. The metric is retired in
`74a3c70` and `728182f`. Do not quote the stored value as a valid metric.

The independent stop audit `post-candidate-stop-audit-sol.md` returned `STOP`. The independent
measurement audit `post-candidate-measurement-fable.md` (revision 2) concurs. The Scout drift
classification `post-candidate-scout-drift-terra.md` classifies `1.9.23` to `1.9.30` as mixed
routing-text and schema drift with no operation-surface change.

## Candidate row review (2026-09-04)

All 500 rows received one independent sharded review. The three selectors partition the selected
IDs with no overlap and no gap.

| Shard | Reviewer | Rows | Correct / partial / wrong | Report |
|---|---|---:|---|---|
| `stellarDocs` | Codex Terra | 239 | 91 / 112 / 36 | `candidate-row-review-stellar-docs-terra.md` |
| `scout` and `lumenloop` | Codex Sol | 206 | 82 / 97 / 27 | `candidate-row-review-scout-lumenloop-sol.md` |
| `skills` and `none` | Claude Fable 5.1 | 55 | 26 / 21 / 8 | `candidate-row-review-skills-none-fable.md` |
| all rows, audit | Claude Fable 5.1 `xhigh` | 500 | programmatic recompute of every aggregate, hash, cost, and rule | `post-candidate-measurement-fable.md` |

The reviews changed no grade and rewrote no artifact. They recorded these disagreements for
adjudication. Each is a human judgment or a paid rejudge. None is resolved here.

- Four verdict sentences that the raw transcript refutes: `q-comp-finclusive-caas`,
  `q-edge-scf-v7-centralization-myths`, `q-ti-stellar-lab-usage-and-new-ui`, and
  `q-ti-scout-refresh-cached-rows`. The first three could move to partial on adjudication.
- Nine `correct` grades disputed by the Scout and Lumenloop shard: `q-anchor-list-builders-discovery`,
  `q-asset-rwa-tokenized-freshness`, `q-defi-cross-blend-rivool-sac`, `q-defi-lending-landscape-live`,
  `q-hist-quantum-preparedness-plan`, `q-scf-academic-research-grant`, `q-scf-blend-winners-live`,
  `q-tool-leaderboard-open-issues`, and `q-tool-zk-repo-live`.
- Two disputed avoid matches from the skills shard: `q-edge-send-me-free-xlm` (avoid 1 fired on an
  omission) and `q-soroban-x402-auth-entry-signing` (avoid 2; the grade holds on avoid 3).
- Two three-way panel ties resolved to wrong by the tie rule: `q-eco-dex-saturation` and
  `q-eco-stablecoins-on-stellar`.

Own-repo observations from the reviews: the executor fault above; the `search` miss for
`lumenloop.get_categories` on general category queries; the shared envelope `ok` versus
`data.ok` miss on four rows. The category miss now lives in the general scoring item in
`.agents/TODO.md`. The envelope guidance check `envelope-guidance-routing-terra.md` found the
current catalog text already covers the `data.ok` distinction, so no code change followed.

Recurrence evidence for existing findings: `sd-046` (two rows), `sd-044`, `sd-037`, `ll-030`, and
`sls-023`. Each recurrence was re-derived live and recorded in `improvements/` on 2026-09-04.

## Repairs after the stop (2026-09-04)

Each repair landed on its own branch and was carried onto `codex/truth-maintenance-2026-09-03`.
That branch is the actual whole-round branch. It contains the work through `dc0761d`. The branch
`codex/tm-final-synthesis` stopped at `cbdfc5b`. It does not contain `a5ac32f`, `5603d6d`,
`1847ffd`, or `dc0761d`. The table names the commit on the round branch and the reviewed commit
in the report.

| Repair | This branch | Report commit | Independent review | Verdict |
|---|---|---|---|---|
| Dynamic Worker envelope serialization | `795fa41` | `99583d1` | Sol high, `envelope-serialization-review-sol.md` | `PASS`; real-RPC smoke test added; `npm run test:smoke` 83 tests |
| Envelope guidance and category routing check | `e926c9b` | same | none needed; no code change | category defect recorded in the general scoring item |
| Retire the invalid coverage share | `74a3c70`, `728182f` | `d1fddb9`, `a21fd5b` | Sol high, `coverage-metric-review-sol.md` | `PASS` after R1 and R2 |
| Evidence-support diagnostic prose probes | `0e95b10` | `37264f9` | Fable 5.1 `xhigh`, `evidence-support-review-fable.md` | `PASS`, five non-blocking notes |
| Golden follow-up, `q-raph-lobstr-legitimacy` | `6806fa7`, `280fd9f` | `4308f6c`, `cdbbf57` | Sol high, `golden-followup-review-sol.md` | `PASS` after F1; corpus content `c5d0c804…7b43e` |
| Verified Docs findings `sd-050`, `sd-051`, `sd-052`, `sk-022` | `c9a4afa`, `ef4e618`, `0eb3a28`, `f1c6f77` | `8012adb` | Opus 5 `xhigh`, `upstream-docs-findings-review-opus.md` | corrected and `PASS`; not filed |
| Verified skill findings `sk-023`, `sk-024` | `8d1b50a`, `f19bf6a` | same | Fable 5.1 `xhigh`, `upstream-skill-findings-review-fable.md` | corrected and ready; not filed |
| Finding recurrences and intake readiness | `887ea4d` to `a967721` | `88f08ec`, `bd7330b`, `bf198b0`, `1d08120` | Fable 5.1 `xhigh`, `finding-recurrences-review-fable.md` | `PASS`; ten filing dry runs pass |
| Scout 1.9.30 free drift audit | `cf4aa8d`, `148b9ed` | `3fed7cf`, `cf29cc9` | Sol high, `scout-1.9.30-drift-review-sol.md` | corrections applied; re-review `PASS`; drift rejected |
| Remote identity guard | `de9af0a`, `14a6f66`, `c781866`, `e3fe47a` | `2ca5880`, `8cd724d`, `5d47ab6`, `f2e2d10` | Opus 5 `xhigh`, `remote-identity-guard-review-opus.md` | final `PASS`; R1 and R4 stay as operational items |
| Revised impact measurement, revision 1 | `74e756d` | `f101cee` | Sol high, `revised-impact-measurement-review-sol.md` | `CHANGES-REQUIRED`, S1 to S6 and P1 to P7 |
| Paired collection supervisor and launch gate | `9bbcdbd`, `d36aa05`, `6934e1c`, `e0df186` | `79080bd`, `9cf49a4`, `1292b60` | Opus 5 `xhigh`, `paired-collection-supervisor-review-opus.md` | `CHANGES-REQUIRED` then `PASS` twice; H1 to H3 closed |
| Remaining-work audit | `2e4f028` | same | none needed | one documentation reconciliation remained; the synthesis at `b5dca1c` performed it |
| Paired artifact content identity (I1) | `a5ac32f` | same | Opus 5 `xhigh`, `paired-collection-supervisor-review-opus.md` I1 closure, `5603d6d` | `PASS`; `meta.inputSnapshot.casesSha256` is mandatory |
| Free two-agent capacity check, v1 instrument | `bd8d2d2` | same | orchestrator verification, `paired-capacity-check-terra.md` | `TECHNICAL PASS`; the v1 artifact is provisional and cannot enter a v2 plan; also records Scout 1.9.30 in `eval/README.md` |
| Independent review of measurement revision 2 | `f766893` | same | Sol high, `final-synthesis-review-sol.md` | `CHANGES-REQUIRED`, P1 to P3 and S1 to S3 |
| Launch contract enforcement, P1 to P3 | `1847ffd` | `e5c835e` | none recorded; `launch-contract-repair-sol.md` is the implementation report | plan schema `qa-paired-collection-plan-v2`; external authorized plan hash; fixed capacity contract; corpus counts; flip identity pins |
| Authoritative v2 capacity evidence | `dc0761d` | same | orchestrator verification, `paired-capacity-check-terra.md` | `accepted: true`; artifact `f9466339…56c2423`; expires `2026-09-05T10:25:17.815Z` |
| Measurement design revision 3 and documentation repair | this pass | same | Opus 5 `high`, final review and appended confirmation | `LAUNCH-OK` was first withheld on L1, then granted after repair. Paid execution stays unauthorized. |
| Final Opus review findings repair | this repair | same | Opus 5 `high`, final review and appended confirmation | Historical verdicts stay unchanged. The confirmation grants `LAUNCH-OK` and `CLOSEOUT-OK` after repair. |

Remote identity guard contract, as landed: the committed probe `eval/qa/probe-remote-identities.mjs`
hashes the Scout OpenAPI document, the Lumenloop tool, skill, and OpenAPI inventory, and the Stellar
Docs index settings and full `lvl1` title set. It makes seven public HTTP requests per capture in
about 0.47 s with a 145 s process timeout. The runner captures before and after every answering
call and once at postflight. Any change stops before the next paid call, keeps completed rows,
sets `meta.comparable: false`, suppresses aggregates, and forbids resume. The `--stable-sha256`
command takes three captures five minutes apart for the pre-arm pin. The last development capture
returned vector `afd993854a981d4a5a3026ad047347c7a62a1b731b887ec08d48d5b9e07bbc7f` for Scout
`1.9.30`. Two operational items remain: R1, Scout release cadence can prevent a valid long pair;
R4, the Docs enumeration fails closed above 1,000 records while the live set has 650.

Launch-enforcement base, as landed at `1847ffd`. The launch command is
`npm run eval:qa:paired:collect -- --plan <plan.json> --authorized-plan-sha256 <sha256>`. The
supervisor validates a `qa-paired-collection-plan-v2` manifest against the supplied canonical
SHA-256. It spawns both `--no-judge` children and enforces a row barrier with alternating release
order. It shares one cancellation marker and applies a four-hour deadline with a bounded drain.
It prints a `qa-paired-collection-receipt-v1` receipt only after both comparable artifacts exit
cleanly.

The manifest freezes exactly 200 selected IDs and exactly 500 unique active corpus IDs. It
records all four corpus hashes, four distinct worktrees, and twelve input hashes. It records a
salted value-free `.dev.vars` identity. It binds the fixed capacity contract with its instrument
bytes, artifact bytes, and 24-hour freshness. It freezes the exact P6 wrapper command and the
exact comparison command. It freezes both exact flip re-judge commands with Claude path, binary,
and environment pins. It sets cumulative caps of `$80` collection and `$120` stored judging per
arm. The owner authorization record stays outside the plan. The owner signature covers the
canonical hash and every command array. The Opus review record names Opus 5 at `xhigh` for all
three supervisor reviews and the I1 closure. The final Opus review inspected this base and revision
3. It first withheld `LAUNCH-OK` because the canonical runbook still published v1. The confirmed
repair updates that runbook. Its R1/R2 changes form the current diagnostic layer.

## Final Opus finding repairs (2026-09-04)

The final Opus review keeps its original withheld verdicts. This repair changes no historical
verdict. Its appended confirmation grants `LAUNCH-OK` and `CLOSEOUT-OK` after repair.

- L1: `run-evals` now publishes the v2 paired launch command. It points to the full contract in
  `eval/qa/README.md`.
- C1 and C2: `launch-contract-repair-sol.md` now states the exact tree difference. It labels the
  1,961-test result as a restricted-sandbox measurement.
- C3: `revised-impact-measurement-fable.md` now says the branch contains work through `dc0761d`.
- R1: failed paid re-judges now persist postflight identity evidence and explicit terminal states.
  A postflight failure cannot replace the original judging failure.
- R2: a flip-command mismatch now gives the first differing index. It gives bounded JSON values
  for the expected and actual arguments.
- R3: `paired-capacity-check-terra.md` now separates the `env -i` wrapper from the frozen command
  array.

No paid call, live collection, external write, filing, or deployment occurred in this repair.
Every owner decision and paid action remains blocked.

## Scout 1.9.30 decision (2026-09-04)

The round rejected the Scout 1.9.30 generated surface. The committed inventory remains Scout
OpenAPI 1.9.1 with SHA-256 `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0`.
The accepted manifest remains `b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729`.

| Surface | Version | Inventory SHA-256 | Sorted OpenAPI SHA-256 |
|---|---|---|---|
| Accepted commit | 1.9.1 | `1a261c4a…d8671b0` | `cce10918…fd753d4` |
| Rejected 2026-09-03 candidate | 1.9.23 | `1bfe9d6a…c0fc4f` | `662a54f1…8d2320` |
| Rejected 2026-09-04 live refresh | 1.9.30 | `0cbc081a…144d45` | `2acc43c4…311571` |

The 1.9.1 to 1.9.30 comparison has 36 paths and 37 operations, no added or removed operation, 27
changed operation objects, 15 changed `x-routing` blocks, 22 changed direct schemas, and six
changed shared schemas. The generated 1.9.30 manifest met the numeric routing floors but lacked an
accepted fingerprint. Both protocol-history v2 contracts stop as `source-expired` on the accepted
manifest, so no protocol-history score can support a 1.9.30 decision. The rejection rests on
mixed routing and response-contract drift without an accepted intent decision. No policy, golden,
finding, or baseline changed. `GET /api/quality` and `GET /api/verify` remain excluded.

## Improvements state (2026-09-04)

`improvements/` contains 70 active findings: 57 `reported-upstream`, 10 `verified`, and 3
`declined-upstream`. `npm run improvements:lint` passes with 70 findings.

The ten verified findings are `ll-030`, `sd-046`, `sd-049`, `sd-050`, `sd-051`, `sd-052`,
`sk-021`, `sk-022`, `sk-023`, and `sk-024`. Each passed `npm run improvements:file -- --dry-run`
with a resolved owner. Filing writes to external trackers and needs separate owner authority. No
finding was filed this round. Before filing, re-run the `sk-023` and `sk-024` dry runs at the merged
revision so the immutable snapshot points at the corrected text.

External states at the last recorded reads:

| Reference | State | Last read | Next action |
|---|---|---|---|
| `stellar/stellar-docs` PR #2806 (`sd-047`) | open, checks pass, review required | 2026-09-04 live lint | re-check `sd-047` only after merge |
| `stellar/stellar-docs` issue #2805 (`sd-047`) | open | 2026-09-04 live lint | none until PR merge |
| `lumenloop/lumenloop-backend` issue #35 (`ll-019`, `ll-029`) | open, no maintainer activity since 2026-08-19 | 2026-09-04 live lint | silent until substantive owner activity |
| `stellar/stellar-docs` issue #2772 (`sd-044`) | open, zero comments since 2026-08-19 | 2026-09-04 | silent |
| `stellar/stellar-protocol` issue #1981 (`sd-037`) | open, stale-bot notice on 2026-08-14 | 2026-09-04 | state read after 2026-09-13 |

The four Scout resolutions of 2026-09-03 (`sls-073`, `sls-077`, `sls-078`, `sls-079`) stand with
their receipts and comment URLs above.

## Measurement state (2026-09-04)

No valid two-week causal measurement exists. No baseline artifact exists. The candidate artifact is
non-comparable. The `$882.50` plan is spent for P6 and the candidate and stopped for every other
method. Its remainder does not transfer.

The revised design is `revised-impact-measurement-fable.md`, revision 3. It proposes a supervised
200-case paired subset under a `$273.50` maximum with cumulative per-arm caps. Revision 2 received
`CHANGES-REQUIRED` from Sol in `final-synthesis-review-sol.md` (P1 to P3, S1 to S3). Commit
`1847ffd` repaired P1 to P3 in the launch contract. Revision 3 binds the design to that contract.
The plan schema is `qa-paired-collection-plan-v2`. The launch requires an external authorized
canonical plan SHA-256. The plan freezes every paid command array and the flip Claude pins. It
binds the fixed capacity contract with 24-hour freshness. It requires exactly 200 selected and
500 active corpus IDs. Both runners recompute all four corpus hashes.

The final Opus review inspected revision 3 and first withheld `LAUNCH-OK` on L1. Its appended
confirmation grants `LAUNCH-OK` after repair. The method is not approved for paid execution. The
owner's general approval does not supply the strict paid authorization. The owner has not accepted
the concurrent-load estimand. The method still needs the ten owner decisions. It also needs the
signed external authorization that names the plan hash. It needs a final manifest at one clean
launch revision, a current capacity artifact, and a weekend window.

## Decisions (2026-09-04)

- The 2026-09-04 candidate artifact is a stopped mixed-upstream diagnostic. Its raw counts never
  become a headline or a paired input.
- `meanContinuousCoverage` was invalid and is retired. No record quotes it as a valid metric.
- No golden changes from judge verdicts alone. Every golden question below stays with the owner.
- Upstream filing waits for explicit owner authority. Reported findings stay silent.
- Scout 1.9.30 is rejected. Scout 1.9.1 stays committed.
- The remote identity guard is a launch requirement for every future paid live run.
- The paired supervisor is the only permitted way to collect two arms at once.
- The revised paired method is unapproved. The old plan does not transfer. The general round
  approval of 2026-09-03 is not the strict paid authorization for revision 3. Only a signed
  external record that names the canonical plan SHA-256 and covers every command array is.
- The owner acceptance of the concurrent-load estimand stays open. The free v2 capacity artifact
  proves the technical gate only.
- Production deployment waits for round closeout and explicit deployment authority. The last
  recorded deployment state, from 2026-09-02, carries the envelope serialization fault that
  `795fa41` repairs.
- The review gate is closed. PR integration, deployment verification, and owned-resource cleanup
  remain. Merge and deployment still need explicit owner authority.
- Monitor-only programs stay monitor-only. The PH2 and Raven capability-boundary decisions from
  `.agents/rounds/2026-09-03-owner-decisions.md` are unchanged.

## Outcome

| Lane | Verdict | Evidence |
|---|---|---|
| Pre-spend plan review | `LAUNCH-OK` for the sequential 500x2 method on 2026-09-03; that method is now spent and stopped | `final-prespend-launch-sol.md` |
| Drift and routing | Docs-only title refresh accepted with a mechanical fingerprint rebaseline; Scout 1.9.23 and 1.9.30 rejected | `drift-terra.md`, `docs-drift-review-sol.md`, `scout-1.9.30-drift-terra.md` |
| Improvements and upstream state | four Scout findings resolved with receipts; recurrences recorded; ten findings verified and owner-mapped; none filed | `improvements-terra.md`, `finding-recurrences-terra.md`, `verified-intake-readiness-terra.md` |
| Golden health | 15 cases reverified on 2026-09-03; one LOBSTR correction on 2026-09-04; 14 cases hold with named human blockers | `golden-sol.md`, `golden-followup-fable.md` |
| Paid eval execution | P6 passed; candidate arm completed and stopped as a diagnostic; baseline never started | artifact `2026-09-04T05-40-51-variantA.json`, `post-candidate-stop-audit-sol.md` |
| Eval result review | all 500 rows reviewed once; disagreements recorded for adjudication | the three shard reviews and `post-candidate-measurement-fable.md` |
| Repairs | envelope, coverage metric, evidence support, remote guard, and supervisor landed with independent `PASS` reviews on the branch | `## Repairs after the stop (2026-09-04)` |
| Measurement design | Opus checked revision 3 and first withheld `LAUNCH-OK` on L1. The confirmation granted it after repair. Paid execution stays unauthorized. | `revised-impact-measurement-fable.md`, `final-synthesis-review-sol.md`, `final-launch-contract-repair-sol.md` |
| Launch contract repair | P1 to P3 use the `1847ffd` launch-enforcement base. The reviewed R1/R2 repair is the current diagnostic layer. | `launch-contract-repair-sol.md`, `final-launch-contract-repair-sol.md` |
| Free capacity check | complete; authoritative v2 `PASS` artifact recorded at `dc0761d`; owner acceptance open | `paired-capacity-check-terra.md` |
| Final independent closeout review | Opus first withheld both verdicts. Its appended confirmation grants both after repair. | `final-launch-contract-review-opus.md` |

Remaining risk: the branch `codex/truth-maintenance-2026-09-03` is unmerged and undeployed. The
last recorded deployment state, from 2026-09-02, is `0c71b99` with the envelope fault. The final
repair validation passed with 108 files and 1,974 tests. The handoff and owner decisions are in
`.agents/NEXT.md`. The queue is in `.agents/TODO.md`.
