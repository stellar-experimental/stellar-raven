# Revised two-week impact measurement — revision 2, 2026-09-04

Lane: measurement design. Model: Claude Fable 5.1 at `xhigh`.

Revision history:

- Revision 1 was written on branch `codex/tm-impact-plan` at `898063e` and committed as `f101cee`.
  This branch carries it as `74e756d`.
- The independent review `revised-impact-measurement-review-sol.md` (Codex Sol high, commit
  `3ac5bac`) returned `CHANGES-REQUIRED` with findings S1 to S6 and P1 to P7.
- Revision 2 is this file. It was written in worktree `/private/tmp/stellar-raven-tm-final-synthesis`
  on branch `codex/tm-final-synthesis` at HEAD `e0df186ebfbaa4063f97b7845e76e288050df474`.
  It uses the final paired collection supervisor contract from that revision.

This revision awaits an independent re-review. Nobody has reviewed revision 2. It authorizes
nothing. I made no paid call, started no server, and changed no code. The only live read behind
this file is the public Scout changelog read for revision 1 on 2026-09-04.

## What changed from revision 1

| Finding | Revision 2 change |
| --- | --- |
| S1 ports | The printer now permits distinct port pairs across arms. Each arm keeps its own attested pair. The topology uses four pairwise-distinct ports. |
| S2 caps | Each arm is one cumulative ledger. Collection uses `$80`. Stored judging raises the same ledger to `$120`. The two-arm cumulative cap is `$240`. The method maximum stays `$273.50`. |
| S3 lockstep | The supervisor `npm run eval:qa:paired:collect` owns the row barrier, the shared cancellation, the four-hour deadline, and the bounded termination drain. Two independent runner processes are forbidden. |
| S4 stored judging | Stored judging requires `meta.comparable === true`. The paired tuple includes the stored-judge binary and environment stamps. |
| S5 stale facts | The probe makes seven HTTP requests per capture. A capture takes about 0.47 s. The process timeout is 145 s. R3 and R5 are closed. The HEAD reference is current. |
| S6 same-second stamps | Four distinct worktrees are a manifest requirement. Each runner writes its own results directory. Artifacts stay at their separate paths. |
| P1 isolation claim | The isolation claim is narrowed. Repository-owned state is isolated by the enforced four-worktree topology. External shared state is not proven safe. |
| P2 shared load | The manifest requires an accepted two-agent capacity record with free evidence. The receipt records monotonic release order and wall-clock timestamps. The estimand is under that concurrent load. |
| P3 stored judging | Retained. Stored judging runs sequentially, one arm after the other. |
| P4 pins | All hashes are recomputed at the launch revision. The manifest carries them. |
| P5 launch manifest | The manifest fields are listed. The `.dev.vars` identity is salted and value-free. |
| P6 machine-owned stops | The deadline and cross-arm stop are supervisor rules. The executor-fault rule is a post-run review rule. |
| P7 review coverage | All 400 selected answer rows are reviewed. The reviewer differs from the executor and from this author. |
| Corpus | The 200-ID and 150-ID hashes were recomputed at `e0df186`. The cases file and content hashes are recorded. |
| `--sample` | The supervisor forbids `--sample`. Each collection command carries the explicit ordered `--ids` list. The deterministic sampler only derives that list. |

## Recommendation

Run one supervised 200-case paired subset. Collect both arms at the same time on two isolated
server pairs under `npm run eval:qa:paired:collect`. Use answering only. Judge both stored
artifacts afterwards, one arm after the other. Keep the landed remote identity guard exactly as
reviewed. Launch inside a weekend UTC window.

This is the smallest design that can return a verdict other than `INDETERMINATE`. It can also
finish inside one Scout identity epoch with a useful probability. It keeps the exact common IDs,
the same tuple, the current corpus, the exact baseline revision, and the remote identity guard.

The full 500x2 sequential pair stays designed and unfunded. Under the landed guard it needs more
than 22 hours without a Scout release. Scout shipped 30 spec versions in the seven days before
2026-09-04.

## Facts that bound the design

| Fact | Value | Source |
| --- | --- | --- |
| Stopped candidate arm | 500 rows, about 11.19 h wall, `$190.1686672` (`$130.17` agent, `$60.00` judge) | artifact `2026-09-04T05-40-51-variantA.json`, SHA-256 `e629666b…5904f7` |
| Stopped arm status | diagnostic and non-comparable; Scout changed from `1.9.23` to `1.9.30` inside the arm | `post-candidate-stop-audit-sol.md` |
| Per-row answering time | mean 44 s, p50 36 s, p90 85 s | same artifact, `attempts.agent[].durationMs` |
| Per-row judge time | about 36 s | same artifact, wall minus agent time |
| Per-row cost | mean `$0.38`; agent `$0.26`; judge `$0.12`; p90 `$0.61`; max `$1.20` | same artifact |
| Executor fault in that arm | 380 of 500 rows and 493 occurrences of `Could not serialize object`; repaired by `795fa41` | row reviews; `envelope-serialization-fix-terra.md` |
| Scout spec cadence | `spec@1.9.0` on 2026-08-28 to `spec@1.9.30` on 2026-09-04: 30 releases in 7 days, mean gap 5.6 h | live `https://stellarlight.xyz/api/changelog`, 232 entries, read 2026-09-04 |
| Scout burst | `1.9.23` at 22:35Z on 09-03 to `1.9.30` by 04:34Z on 09-04: 7 releases in 6 h | stop audit |
| Scout quiet days | 0 releases on 08-22 and 08-30 (both weekend days); 1 on 08-23 | live changelog per-day counts |
| Guard semantics | before and after capture per answering call; every capture must equal the pre-arm vector; any change stops the arm; one postflight capture; printer requires one shared vector across both arms | `remote-identity-guard-review-opus.md`, final `PASS` |
| Guard cost | about 0.47 s and seven public HTTP requests per capture; seven Algolia search operations and one settings read per capture | guard bounds re-review, R2 |
| Guard timeout | 20 s per request, two retries, `Retry-After` capped at 5 s; 140 s network budget; 145 s process timeout | guard bounds re-review, R3 |
| Docs enumeration ceiling | the probe fails closed above 1,000 `lvl1` records; the live set has 650 | guard review, R4 |
| Supervisor deadline | `PAIRED_COLLECTION_DEADLINE_MS` = 14,400,000 ms (four hours) | `eval/qa/paired-collection-supervisor.mjs` |
| Supervisor drain | 30,000 ms drain, then `SIGTERM`, then `SIGKILL` after 5,000 ms; 1,000 ms IPC drain | same file |
| Printer floor | 100 eligible IDs after the T4 and T5 union exclusion | `MINIMUM_ELIGIBLE_IDS` |
| Look bound | one-sided `alpha = 0.007143`, `z = 2.4499904614`; radius `= z * SE` per cutpoint | `paired-verdict.mjs` |
| Corpus at `e0df186` | 500 active IDs; cases file SHA-256 `1842a188437ea0ae265f6ab6c897de00220de23f4b34b9fe7b6d93f80f142396`; content SHA-256 `c5d0c804ddd9ce241fae90398ee0d83808e5d847f049d118e4ad15903d07b43e`; ordered-ID SHA-256 `b557bcb5cff8a434ad684b90a60343358360330ca1f91072089ceb57a38310d0` | recomputed for this revision |
| Stability register | `/private/tmp/stellar-raven-tm-paired-stability.json`, SHA-256 `06d3835b63ae05f40f808b9890628add8b905f32f60a65df19cbee1a751f9480`, 538 cases | launch review pins |
| Baseline revision | `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`, adapter mode `add-missing` | ledger and launch review |

The sampler is deterministic and depends only on IDs and service tags. Golden text edits do not
move membership. Added or removed cases do. The supervisor forbids `--sample`, so the sampler only
derives the explicit `--ids` list that the manifest freezes.

## Options compared

Survival is `exp(-W / 5.6 h)` at the weekday mean gap and `exp(-W / 16 h)` at the observed
weekend rate. W is the exposed window: the pre-arm stable probe and preflights plus the answering
phase. These are planning estimates from the dated cadence above. They are not validated operating
characteristics.

| Option | Exposed window W | Survival weekday / weekend | Eligible n (expected) | Cost cap | Verdict |
| --- | --- | --- | --- | --- | --- |
| A. 500x2 sequential, judge inline | about 22.4 h | 2% / 25% | 485 | `$853.50` (spent method table) | Not feasible under the landed guard. Do not fund. |
| A2. 500x2 sequential, answer-only then stored judging | about 13.6 h | 9% / 43% | 485 | about `$900` | Still a coin flip at best. Do not fund now. |
| B. 200 subset sequential, answer-only then stored judging | about 5.5 h | 37% / 71% | 190 | `$273.50` | Feasible on a weekend only. Fallback if the owner refuses two server pairs. |
| C. 200 subset, two server pairs under the supervisor, answer-only then stored judging | 2.75 h to 4.25 h | 61% to 47% / 84% to 77% | 190 | `$273.50` | **Recommended.** |
| C2. 500 subset under the supervisor | 6.8 h or more | 30% / 65% | 485 | about `$600` | Powered upgrade. Fund only with an owner-accepted one-in-three weekday loss risk and a longer deadline decision. |
| D. No new spend | none | n/a | 0 pairs | `$0` | No two-arm evidence exists. Supports free search-layer deltas only. |
| E. Per-pair identity epochs with interleaving | 1.6 min per pair | 99.5% per pair | up to 485 | engineering first | The only route to a powered pair at Scout's cadence. Follow-up decision. |

Option C2 note. The supervisor deadline is a frozen four-hour constant. A 500-row lockstep arm
does not fit inside it. C2 therefore needs a reviewed constant change before it is an option.

Option D detail. The repository holds no baseline answers under the `v2.10` and `p6` tuple. The
2026-08-19 paid artifact is not in the repository. The 2026-08-26 reviewed artifacts hold eight
rows under pack `p5`. The stopped candidate artifact spans two Scout identities and a broken
executor. No stored data can form a pair. Free instruments still measure part of the change:
`npm run eval:routing -- --gate` at both revisions gives exact search-ranking deltas over 460
labeled routing cases, and the affected-case stratum records 215 top-five differences. Those
support a claim about search ranking. They cannot support a claim about answer quality.

Option E detail. The printer and the guard both assume one identity vector for the whole pair.
Interleaving per ID needs a runner mode that alternates two server pairs, records the vector per
row, excludes any pair whose two captures differ, and a printer rule for those exclusions. The
guard review found this need in R1 without prescribing a change. It is one to two agent days plus
an independent review. It is the correct long-term shape. It is not the smallest next measurement.

## Recommended design (Option C)

### Sample construction

- Derive the 200 IDs with the deterministic sampler at the launch revision. Pass them as the
  explicit ordered `--ids` list in both collection commands. `--sample` is forbidden.
- The sampler is proportional by service with even-spaced picks over id-sorted strata.
- Composition at `e0df186`: Docs 96, Scout 57, Lumenloop 25, skills 13, none 9. Freshness: stable
  84, scheduled 60, live 56. Traps: 16.
- Ordered 200-ID SHA-256 at `e0df186`:
  `8ba8e687ace17711cabb3932ca6d5e2edebede2bfbfcfbfd79ce3fca3bbd20da`.
- Selected 200-content SHA-256 at `e0df186`:
  `b8512352599ed9df760113cb86db8337ae3136a1cec4aea8461ef08d61e55ee1`.
- The 150-ID fallback hashes to `cbc850c65ad18709ae5a5d94c6ae009f041b78a6a11b0f51e5888959ca7001cc`
  with content `f0ffb53fb3a3312197310a9b157e7e6d6cbd66420d37596e8893fc6c763dcc0c`.
- Freeze the cases file bytes, the ordered 500 IDs, the ordered 200 IDs, and the selected content in
  the manifest before the first paid call. Recompute all four hashes at the launch revision. A
  mismatch stops the launch.
- The estimand covers the selected 200 IDs. It does not estimate all 500 IDs. The sampler
  stratifies by service only. It does not randomize cases or stratify freshness.
- The affected-case stratum selects 496 of 500 cases. It cannot narrow the sample. Report it as a
  descriptive view only.

### Tuple and pins

Both arms share every value below. The manifest records each value before spend.

| Pin | Value or rule |
| --- | --- |
| Runner revision | one clean 40-character commit that contains the remote identity guard, the envelope serialization repair, the coverage-metric retirement, and the paired supervisor; both runner worktrees must sit at this revision |
| Candidate service revision | the same commit as the runner; adapter mode `verify-native`; the candidate server worktree must sit at this revision |
| Baseline service revision | `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`; adapter mode `add-missing`; the baseline server worktree must sit at this revision |
| Adapter | `eval/qa/exact-old-runtime-adapter.mjs` SHA-256 recomputed at the runner revision; one `--adapter-revision` shared by both arms |
| Corpus | cases file SHA-256, selected content SHA-256, ordered 200-ID SHA-256; each `--cases` path resolves inside its own runner worktree |
| Answering and judge model | `claude-sonnet-5` |
| Rubric and pack | `v2.10` and `p6` |
| Variant, surface, search tool | `A`, `search-execute`, `search` |
| Judge tier | `stability-boundary-v1`, threshold `0.75`, `--max-panel-cases 34` on both phases; `--judge-panel` absent or equal on every command |
| Stability register | the frozen file above, same path and SHA-256 for both arms and both phases |
| Prompt append | `QA_AGENT_PROMPT_APPEND` unset |
| Claude binary and environment | one SHA-256 pair; the collection and judge pins are the same pair; recomputed in each runner worktree |
| Remote identity probe | committed `eval/qa/probe-remote-identities.mjs` bytes at the runner revision |
| Remote identity vector | one `--stable-sha256` result (three captures, five minutes apart) taken once, passed to both arms |
| Ports | four pairwise-distinct ports; example: candidate adapter 8788 with Wrangler 8790, baseline adapter 8789 with Wrangler 8791 |
| `.dev.vars` | identical names and salted name-value SHA-256 in both server worktrees; a fresh random 64-character salt per plan; no value recorded |
| Supervisor and control bytes | `eval/qa/paired-collection-supervisor.mjs` and `eval/qa/paired-collection-control.mjs` SHA-256 values; the executing copies and both runner copies must match |
| Runner and printer bytes | `eval/qa/run-qa.mjs` and `eval/qa/paired-verdict.mjs` SHA-256 values, equal across arms |

### Launch manifest fields

The manifest uses `qa-paired-collection-plan-v1`. It stays uncommitted. The operator deletes it
after success or failure. It must carry every field below.

- `schema`: `qa-paired-collection-plan-v1`.
- `deadlineMs`: `14400000`.
- `selected.ids`, `selected.idsSha256`, `selected.contentSha256`, `selected.casesFileSha256`.
- `worktrees.baselineRunner`, `worktrees.candidateRunner`, `worktrees.baselineServer`,
  `worktrees.candidateServer`: four distinct roots in one repository.
- `concurrentLoad.accepted: true`, `concurrentLoad.answeringAgents: 2`, `concurrentLoad.evidence`:
  the free capacity evidence text.
- `devVars.salt`, `devVars.names`, `devVars.sha256`.
- `caps.baseline.collectionUsd: 80`, `caps.baseline.cumulativeUsd: 120`,
  `caps.candidate.collectionUsd: 80`, `caps.candidate.cumulativeUsd: 120`,
  `caps.twoArmCumulativeUsd: 240`.
- `arms.baseline.collectionCommand`, `arms.baseline.judgeCommand`, `arms.baseline.inputHashes`.
- `arms.candidate.collectionCommand`, `arms.candidate.judgeCommand`, `arms.candidate.inputHashes`.
- `comparisonCommand`: `[process.execPath, "eval/qa/paired-verdict.mjs", "{baselineArtifact}",
  "{candidateArtifact}", "--json"]`.

Each `inputHashes` object carries twelve hashes: `agentBinarySha256`, `agentEnvironmentSha256`,
`judgeBinarySha256`, `judgeEnvironmentSha256`, `adapterImplementationSha256`,
`remoteIdentityProbeSha256`, `remoteIdentityVectorSha256`, `stabilityRegisterSha256`,
`runQaSha256`, `pairedVerdictSha256`, `pairedCollectionSupervisorSha256`, and
`pairedCollectionControlSha256`. Every hash must match across arms.

Each collection command uses the absolute `process.execPath`, `eval/qa/run-qa.mjs`, the explicit
`--ids` list, `--no-judge`, `--paired-control-arm <arm>`, `--max-budget-usd 80`, the arm's
`--adapter-mode`, `--server-revision`, `--expect-sha256`, `--adapter-revision`,
`--expect-adapter-sha256`, `--port`, `--upstream-port`, `--variant A`, `--surface search-execute`,
`--search-tool search`, `--model claude-sonnet-5`, `--judge-model claude-sonnet-5`,
`--max-panel-cases 34`, `--stability-register`, `--remote-identity-probe`,
`--expect-remote-identity-probe-sha256`, `--expect-remote-identity-sha256`,
`--expect-agent-binary-sha256`, and `--expect-agent-environment-sha256`.

Each judge command uses the absolute `process.execPath`, `eval/qa/run-qa.mjs`,
`--judge-stored {artifact}`, `--max-budget-usd 120`, `--judge-model claude-sonnet-5`,
`--max-panel-cases 34`, the same `--stability-register`, `--expect-agent-binary-sha256`, and
`--expect-agent-environment-sha256`. It must not carry `--paired-control-arm` or `--no-judge`.

### Topology and sequence

1. Create four clean worktrees: baseline runner, candidate runner, baseline server, candidate
   server. Both runners sit at the runner revision. Separate runner worktrees keep results
   directories, temporary directories, and result stamps apart.
2. Write identical `.dev.vars` bytes into both server worktrees. Record the salted identity only.
3. Start the baseline Wrangler and adapter pair, then the candidate pair, on the four frozen ports.
   Attest both listener pairs.
4. Run the free surface and source-revision probes through both adapters. Record both surface
   hashes. They must differ.
5. Run the free two-agent capacity check. Record its evidence in `concurrentLoad.evidence`.
6. Run the P6 judge self-test once with direct Node under the final pinned environment. Retain its
   machine-readable summary.
7. Run the formal `--stable-sha256` pre-arm probe once. Both arms take its hash.
8. Write the manifest with hashes recomputed at the launch revision. Run
   `npm run eval:qa:paired:collect -- --plan <absolute path>` from one runner worktree. The
   supervisor validates the manifest, spawns both children, releases rows in lockstep, alternates
   the first IPC send by row, and prints a `qa-paired-collection-receipt-v1` receipt only after both
   comparable artifacts exit cleanly.
9. After the receipt, stop both server pairs. Judging needs no server and no remote identity.
10. Run the frozen baseline judge command, then the frozen candidate judge command, one after the
    other, with `{artifact}` replaced by the receipt paths.
11. Run the frozen comparison command with the baseline artifact first.
12. Run both flip rejudge batches as stability evidence only.
13. Review every row of both artifacts before any claim leaves the round ledger.

### Deviations from the frozen full method

- The explicit 200-ID subset replaces the full corpus. The subset is not a current-quality
  headline.
- `--no-judge` and `--judge-stored` replace inline judging. This halves the window that upstream
  drift can break. The judge never touches MCP, so the guard review accepts stored judging.
- Two server pairs run at once under one supervisor. The earlier plan ran one Wrangler at a time
  for operator simplicity. Two pinned pairs on distinct ports change no measurement contract. The
  shared Lumenloop key and public rate limits now serve two agents at once. The result therefore
  estimates behavior under that accepted concurrent load. Do not describe throttling as symmetric.
- Candidate-first order becomes alternating lockstep. The candidate-first rule existed to bank the
  full current-quality result before baseline spend. A subset banks no headline, so the rule has no
  purpose here. The alternation orders two IPC writes in one event-loop turn. It does not control
  when each child issues its provider call.

## Detectable effects and uncertainty

The estimand is unchanged in form: `P(candidate=correct) - P(baseline=correct)` and
`P(candidate in {correct, partial}) - P(baseline in {correct, partial})` over eligible IDs. Its
population is the selected 200 IDs under the accepted concurrent load. Under no change, the per-ID
delta has variance close to the discordance rate `d`, so the look radius is `2.45 * sqrt(d / n)`.
The committed `0.10` and `0.08` rates are a mixed-tuple upper bound. The identical-input re-judge
floor alone is 15.6% pairwise, and two arms add answer variance, so `d` between 0.2 and 0.3 is the
honest planning range for the strict cutpoint. This pair recalibrates `d` through
`npm run eval:qa:paired:validate -- --recalibrate`.

| Eligible n | Radius at d = 0.10 | Radius at d = 0.20 | Radius at d = 0.30 | Loss detected at 80% power, d = 0.20 |
| ---: | ---: | ---: | ---: | ---: |
| 100 | 0.078 | 0.110 | 0.134 | 0.147 |
| 150 | 0.063 | 0.089 | 0.110 | 0.120 |
| 190 | 0.056 | 0.080 | 0.097 | 0.107 |
| 480 | 0.035 | 0.050 | 0.061 | 0.067 |

Reading rules for the recommended look at about 190 eligible IDs:

- `FAIL` demonstrates a loss. It needs a true loss near 11 points to fire with 80% power.
- `PASS` clears only the experimental `-0.08` radius. The statement that an exact no-change pair
  passes about half the time at `d = 0.2` is illustrative. The simulator does not test that joint
  case, so it is not a validated operating characteristic. `PASS` is not evidence of improvement
  and not a product tolerance.
- `INDETERMINATE` is the expected outcome for a single-digit true effect. It is unfinished
  evidence, not a null result.
- The service tuning ceiling is single-digit points. Only a 480-eligible pair can bound a
  single-digit effect, and only at radius 0.05 to 0.06. The 200 subset answers "is there a large
  regression or a large gain" and calibrates `d`. It does not resolve a small effect.
- The expected `n = 190` value has no same-tuple evidence. It is a planning assumption.

Per-service reads inside the sample are descriptive only. Docs 96, Scout 57, and Lumenloop 25 are
each below the powered floor.

## Wall time

Under lockstep, each row takes the longer of the two arms' row times plus about one second of guard
captures. The stopped arm gives the candidate distribution only. No same-tuple baseline timing
exists. The answering estimate is therefore a range.

| Phase | Expected | Maximum before a stop |
| --- | ---: | ---: |
| Pre-arm stable probe, capacity check, and preflights | 15 min | 30 min |
| Answering, both arms in lockstep | 2.5 h to 3.5 h | 4.0 h (supervisor deadline) |
| Stored judging, baseline then candidate | about 4.0 h | 6.0 h |
| Flip rejudges | 30 min | 1.5 h |
| Total inside one calendar day | about 7.5 h to 8.5 h | 12 h |

The answering phase is the only phase exposed to upstream drift. Launch it at the start of a
weekend UTC day. The guard stop ends the method. Rows collected before a stop stay non-comparable
and are not judged. The supervisor cancels both arms on any guard, budget, child, IPC, ordering,
artifact, or deadline failure. It prints no receipt on failure.

Guard load for the pair: 802 captures plus the three pre-arm captures. That is about 5,600 public
HTTP requests, about 5,600 Algolia search operations, and about 800 Algolia settings reads.

## Caps

Each command carries exactly one `--max-budget-usd`. No transfer, resume, or automatic repeat. The
supervisor validates the collection caps. The judge command must carry the cumulative arm cap.

| Method | Expected | Cap | Rule |
| --- | ---: | ---: | --- |
| P6 judge self-test | `$0.25` | `$3.50` | seven calls, `$0.50` each, no retry, direct Node |
| Baseline collection, 200 rows, `--no-judge` | `$52` | `$80` | one supervised `run-qa.mjs` child |
| Candidate collection, 200 rows, `--no-judge` | `$52` | `$80` | one supervised `run-qa.mjs` child |
| Baseline stored judging | `$24` | cumulative `$120` | one `--judge-stored` command on the same ledger |
| Candidate stored judging | `$24` | cumulative `$120` | one `--judge-stored` command on the same ledger |
| Two-arm cumulative total | `$152` | `$240` | `twoArmCumulativeUsd` |
| Baseline flip rejudge | `$7` | `$15` | one `re-judge.mjs --flips-vs` batch |
| Candidate flip rejudge | `$7` | `$15` | one `re-judge.mjs --flips-vs` batch |
| Method maximum | about `$166` | `$273.50` | no other method |

The exact command cap sequence is:

```text
baseline  --no-judge:      --max-budget-usd 80
candidate --no-judge:      --max-budget-usd 80
baseline  --judge-stored:  --max-budget-usd 120
candidate --judge-stored:  --max-budget-usd 120
```

The `$80` collection cap is 1.5 times the expected agent spend. The stopped arm spent 48% of its
`$400` cap, so this ratio is consistent with observed variance. A collection cap stop before the
last ID cancels both arms under the supervisor. A judge cap stop before the last row leaves the
artifact incomplete and ends the method.

## Stop rules

Before the first paid call, stop when any item below holds:

- Any of the four worktrees is dirty, or any revision is not 40 characters.
- The runner revision lacks the remote identity guard, the envelope serialization repair, the
  coverage-metric retirement, or the paired supervisor.
- Any hash in the pin table or the manifest differs from its recomputed value.
- The corpus does not hold exactly 500 unique active IDs, or the 200-ID, content, or cases-file
  hash differs.
- The `--stable-sha256` probe fails or returns two different vectors.
- The P6 self-test fails, exceeds `$3.50`, or lacks a retained machine-readable summary.
- Either surface probe or source-revision probe fails, or the two surface hashes are equal.
- Either listener pair or adapter attestation is missing or mismatched.
- The free capacity check has no recorded evidence, or the owner has not accepted the concurrent
  load.
- `QA_AGENT_PROMPT_APPEND` is set.
- The manifest fails `validatePairedCollectionPlan` for any reason.
- The independent re-review of this revision, the owner decisions, or the signed authorization is
  missing from the round ledger.

During collection, the supervisor stops both arms when any item below holds:

- The guard stops either arm for an identity change, a probe failure, or a pre-arm mismatch.
- Either arm reaches its `$80` cap, omits a reported cost, or loses the `raven` MCP connection.
- Either child exits before a successful completion, sends malformed IPC, breaks the row order,
  or reports a readiness record that does not match the manifest.
- The four-hour deadline fires.
- Either listener or adapter identity changes at postflight.
- Either reported artifact is not comparable, is outside its results directory, or does not match
  the frozen IDs, content, or server revision.

After collection, stop the method when any item below holds:

- The supervisor printed no receipt.
- Either artifact reports `meta.comparable: false` or suppressed aggregates.
- The two artifacts do not share identical ordered IDs, case hashes, pins, and pre-arm vector.
- Either postflight vector differs from the pre-arm vector.
- Two unrelated rows in the candidate arm show the same executor fault class as the stopped arm.
  This is a post-run review rule, not a supervisor rule.
- Either stored-judge command stops before its last row.
- Fewer than 100 IDs remain eligible after the T4 and T5 union exclusion.
- Any candidate-only T4 or T5 loss appears. It forces `INDETERMINATE` and ends the method.

After the printer: stop after `PASS` or `FAIL`. Treat statistical `INDETERMINATE` as unfinished
evidence. The one permitted repeat needs a new authorization and its own pre-spend review. There is
no third look.

## Result review requirements

- Review all 400 selected answer rows. Review every verdict and transcript.
- Review every grade transition and every T3, T4, or T5 row.
- Review all panel disagreements, skipped panels, cost entries, guard captures, and the receipt
  timeline.
- Verify the paired JSON, both flip batches, and the recalibrated simulator output.
- Live-check each mutable claim before confirming a wrong result.
- Classify each confirmed failure with the `run-evals` root-cause table. Route own-repo defects to
  `.agents/TODO.md` and verified upstream defects to `improvements/`.
- The result reviewer must differ from the executor and from this design author.
- The final reviewer must recompute counts, costs, hashes, exclusions, and transitions.
- Per-service results remain descriptive. No service stratum reaches the powered denominator.

## What the result can and cannot support

The pair can support these statements:

- A bounded paired difference between the final service revision and the 2026-08-19 revision on
  this 200-ID stratified sample, under the current corpus, the current live upstream state, the
  accepted concurrent load, and the `claude-sonnet-5`, `v2.10`, `p6` tuple.
- A `FAIL` demonstrates a loss on at least one cutpoint at the stated bound.
- A same-tuple discordance calibration for the printer.
- Per-row diagnostic leads after full review of both arms.

The pair cannot support these statements:

- Service quality on 2026-08-19. Upstream facts and the corpus have moved.
- A Scout release effect. Both arms call the same live Scout inside one identity epoch.
- Attribution to any single commit. The candidate is a composite treatment.
- A current-quality headline. That needs a full 500-case candidate arm under a separate
  authorization.
- A product improvement claim from `PASS`. The margin is a no-change radius.
- Any claim about all 500 cases. The estimand is the selected 200.
- Any claim about isolated production behavior. The estimate is under shared concurrent load.
- Any claim from rows collected before a guard stop.
- Any inference to other models, judges, binaries, production traffic, or latency.

The treatment also includes the executor repair that landed after the stopped arm. The stopped arm
measured a fault in 380 rows. The new candidate must be the repaired revision, and the stopped
artifact must not enter this comparison.

## Strict new-authorization block

This report authorizes no spend. The old `$882.50` authorization does not transfer to this method.
The owner must explicitly retire that plan. A new authorization is valid only when it states every
item below in the round ledger before the first paid call.

```text
AUTHORIZATION: two-week impact, supervised paired subset (Option C, revision 2)

Prior plan: the 2026-09-03 $882.50 plan is RETIRED. Its P6 and candidate methods are spent.
No other method from it may start. No unspent amount transfers.

Methods and caps, one run each, no transfer, no resume, no automatic repeat, no added method:
  P6 judge self-test              $3.50   (seven calls, $0.50 each, direct Node)
  baseline  --no-judge            $80     (supervised child)
  candidate --no-judge            $80     (supervised child)
  baseline  --judge-stored        $120    (cumulative on the same ledger)
  candidate --judge-stored        $120    (cumulative on the same ledger)
  two-arm cumulative              $240
  baseline  flip rejudge          $15
  candidate flip rejudge          $15
  method maximum                  $273.50

Denominator: explicit --ids, 200 selected IDs from the deterministic sampler.
  ordered-200 SHA-256: <recomputed at the launch revision>
  selected-content SHA-256: <recomputed>
  cases-file SHA-256: <recomputed>   ordered-500 SHA-256: <recomputed>
Tuple: claude-sonnet-5 / claude-sonnet-5 / v2.10 / p6 / stability-boundary-v1 / 0.75 / 34.
Flags: --variant A --surface search-execute --search-tool search; --judge-panel absent.
Baseline: 90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0, add-missing, surface <sha256>.
Candidate and runner: <one clean 40-character revision>, verify-native, surface <sha256>.
Register: /private/tmp/stellar-raven-tm-paired-stability.json <sha256>.
Adapter: <sha256>.  Probe: <sha256>.  Pre-arm vector: <sha256>.
Binary: <sha256>.  Environment: <sha256>.  Collection and judge pins are this same pair.
Runner bytes: run-qa <sha256>, paired-verdict <sha256>, supervisor <sha256>, control <sha256>.
Worktrees: baselineRunner <path>, candidateRunner <path>,
           baselineServer <path>, candidateServer <path>.
Ports: baseline <public>/<upstream>, candidate <public>/<upstream>, four distinct values.
.dev.vars: salt <64 hex>, names <list>, salted SHA-256 <sha256>; no value recorded.
Concurrent load: accepted, two answering agents, evidence: <free capacity check summary>.
Topology: npm run eval:qa:paired:collect -- --plan <absolute path>; answer-only; lockstep;
          alternating release; stored judging baseline then candidate; frozen comparison
          command with the baseline artifact first.
Window: weekend UTC start; four-hour supervisor deadline; one calendar day total.
Manifest: qa-paired-collection-plan-v1, uncommitted, deleted after the run.
Stop rules: the three lists in this report, copied verbatim into the ledger.
Reviews:
  - independent pre-spend re-review of revision 2 by a lane that is not Fable 5.1 and not
    the orchestrator, verdict LAUNCH-OK, every finding reconciled;
  - result review of all 400 rows by a lane that is not the executor and not Fable 5.1;
  - final recomputation of counts, costs, hashes, exclusions, and transitions.
Reporting: record the subset result in eval/qa/README.md as a labeled paired diagnostic,
           never as the current-quality headline.
Owner decisions 1 to 10 below: each recorded with its answer.
Signature: AUTHORIZED <date> <owner>   or   NOT AUTHORIZED
```

Any blank field, any changed cap, or any missing decision makes the authorization invalid.

## Exact owner decisions

1. Retire or retain the 2026-09-03 `$882.50` plan. Recommended: retire it. Its P6 and candidate
   methods are spent. Its baseline, flip, live-data, and digest methods are stopped.
2. Denominator. Recommended: 200 selected. Alternatives: 150 selected (floor, radius 0.09 at
   `d = 0.2`), or 500 selected under the supervisor (powered, needs a reviewed deadline change,
   about `$600`).
3. Two concurrent server pairs under the supervisor. Recommended: yes. If no, use Option B
   sequential with 37% weekday and 71% weekend survival and a revised command set.
4. Answer-only collection with stored judging. Recommended: yes. If no, the window grows by about
   two hours per arm and the supervisor contract does not apply.
5. Accept the concurrent-load estimand. Recommended: yes, after the free capacity check records
   its evidence. If capacity is uncertain, choose sequential Option B.
6. Guard semantics for this look. Recommended: keep the landed whole-arm stop. Decide separately
   whether to fund Option E (per-pair epochs and interleaving) before any powered 500 pair.
7. Launch window. Recommended: weekend UTC start, four-hour answering maximum, no retry inside the
   same authorization.
8. Product-loss margin. Recommended: keep `0.08` as the experimental no-change radius and print the
   `0.05` and `0.10` tables. Do not adopt a product tolerance from this look.
9. Candidate-only T4 or T5 rule. Recommended: keep it terminal.
10. P6 judge self-test. Recommended: run it once at `$3.50` with direct Node under the final pinned
    environment and retain the machine-readable summary.

Reporting is fixed by the authorization block. The subset result is a labeled paired diagnostic.
The full 500 candidate arm stays a separate future authorization.

## Risks

- Scout can still release inside the answering window. The design accepts a 16% to 53% chance of a
  guard stop, depending on the day and the window. A stop costs at most the two collection caps and
  returns no comparison.
- The Lumenloop key and the public Docs search key serve two agents at once. Throttling would raise
  transport failures in both arms. Those rows count as T1 outcomes inside answers, not as
  exclusions. The effect is not necessarily symmetric. The capacity record and the receipt timeline
  are the evidence for this condition.
- A supervised soft cancellation settles within 35 s. A hard cancellation settles within 5 s. An
  in-flight child may not flush a partial artifact. The no-new-spend marker survives forced
  settlement.
- The Docs title probe has a 1,000-record ceiling (R4). The set is at 650. Not a risk this month.
- Judge discordance may exceed 0.3. The look would then be `INDETERMINATE` under almost any true
  effect. The recalibration output is still useful and is the reason to run this look before any
  powered pair.
- A subset invites per-service over-reading. Every stratum is below the powered floor.
- The salt and the salted digest live in the same manifest. The handling rule, not the salt,
  protects the secrets. Keep the manifest uncommitted and delete it after the run.

## Blockers

- An independent re-review of this revision must return `LAUNCH-OK`. Revision 1 received
  `CHANGES-REQUIRED`. Nobody has reviewed revision 2.
- The owner must record decisions 1 to 10 and sign the authorization block.
- The launch revision must be one clean commit that contains the guard, the envelope repair, the
  coverage-metric retirement, and the supervisor. The branch `codex/tm-final-synthesis` at
  `e0df186` contains all four but is not merged.
- The manifest instance must be produced at that revision with a fresh salt and recomputed hashes.
- The free two-agent capacity check must record its evidence.
- The launch must start inside a weekend UTC window.
