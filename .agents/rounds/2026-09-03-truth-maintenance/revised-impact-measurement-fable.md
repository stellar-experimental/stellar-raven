# Revised two-week impact measurement — 2026-09-04

Lane: measurement design. Model: Claude Fable 5.1 at `xhigh`.
Worktree `/private/tmp/stellar-raven-tm-impact-plan`, branch `codex/tm-impact-plan`, HEAD `898063e`.

Inputs read: `AGENTS.md`; the `run-evals` and `truth-maintenance` skills; the round ledger
`2026-09-03-truth-maintenance.md`; `two-week-impact-prespend-sol.md`; `final-prespend-launch-sol.md`;
`post-candidate-stop-audit-sol.md`; `post-candidate-measurement-fable.md` (revision 2); the three
candidate row reviews (Sol, Terra, Fable); `post-candidate-scout-drift-terra.md`; the Scout 1.9.30
drift audit on branch `codex/tm-scout-1930`; the remote identity guard implementation and its Opus
review with findings R1 to R5 on branch `codex/tm-remote-identity-guard`; `eval/qa/README.md`
(paired section); `eval/qa/paired-verdict.mjs`; `eval/qa/validate-paired-verdict.mjs`;
`eval/qa/run-qa.mjs`; `.agents/NEXT.md`; `.agents/TODO.md`.

This report authorizes nothing. I made no paid call, started no server, and changed no code.
The only free live read was the public Scout changelog, used for release cadence.

## Recommendation

Run one deterministic 200-case paired subset. Collect both arms at the same time on two isolated
server pairs, in the same ID order, with answering only. Judge both stored artifacts afterwards.
Keep the landed remote identity guard exactly as reviewed. Launch inside a weekend window.

This is the smallest design that can still return a verdict other than `INDETERMINATE` and that can
finish inside one Scout identity epoch with a useful probability. It keeps the exact common IDs,
the same tuple, the current corpus, the exact baseline revision, and the remote identity guard.

The full 500x2 sequential pair stays designed and unfunded. Under the landed guard it needs more
than 22 hours without a Scout release. Scout shipped 30 spec versions in the last seven days.

## Facts that bound the design

| Fact | Value | Source |
| --- | --- | --- |
| Stopped candidate arm | 500 rows, 11.19 h wall, `$190.17` (`$130.17` agent, `$60.00` judge) | artifact `2026-09-04T05-40-51-variantA.json` |
| Per-row answering time | mean 44 s, p50 36 s, p90 85 s | same artifact, `attempts.agent[].durationMs` |
| Per-row judge time | mean about 36 s (wall minus agent time) | same artifact |
| Per-row cost | mean `$0.38`; agent `$0.26`; judge `$0.12`; p90 `$0.61`; max `$1.20` | same artifact |
| Executor fault in that arm | 380 of 500 transcripts carry `Could not serialize object`; 220 of 239 Docs rows | row reviews; fixed by the envelope serialization repair |
| Scout spec cadence | `spec@1.9.0` on 2026-08-28 to `spec@1.9.30` on 2026-09-04: 30 releases in 7 days, mean gap 5.6 h | live `https://stellarlight.xyz/api/changelog`, 232 entries |
| Scout burst | `1.9.23` at 22:35Z on 09-03 to `1.9.30` by 04:34Z on 09-04: 7 releases in 6 h | stop audit rows 173 and 450 |
| Scout quiet days | 0 releases on 08-22 and 08-30 (both weekend days); 1 on 08-23 | live changelog per-day counts |
| Guard semantics | before and after capture per answering call; every capture must equal the pre-arm vector; any change stops the arm; printer requires one shared vector across both arms | guard review, blockers B1 to B3 reconciled |
| Guard cost | about 0.36 s and six public requests per capture | guard review R2 |
| Printer floor | 100 eligible IDs after the T4 and T5 union exclusion | `MINIMUM_ELIGIBLE_IDS` |
| Look bound | one-sided `alpha = 0.007143`, `z = 2.45`; radius `= z * SE` per cutpoint | `paired-verdict.mjs` |
| Corpus | 500 active IDs; ordered-ID SHA-256 `b557bcb5…8310d0`; content digest `c5d0c804…7b43e` at HEAD | `eval/qa/cases.json` |
| Stability register | `/private/tmp/stellar-raven-tm-paired-stability.json`, SHA-256 `06d3835b…1f9480`, 538 cases | launch review pins; file present |
| Baseline revision | `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`, adapter mode `add-missing` | ledger and launch review |

The sampler is deterministic and depends only on IDs and service tags. The 200-ID selection hashes
identically from the HEAD corpus and from the `80aaf52` corpus, so golden text edits do not move
membership. Added or removed cases do.

## Options compared

Wall time uses 47 s per answering row (44 s mean plus two probes and spawn overhead) and 36 s per
judged row. Survival is `exp(-W / 5.6 h)` at the weekday mean gap and `exp(-W / 16 h)` at the
observed weekend rate. W is the answering window plus 15 minutes of pre-arm probes and preflights.

| Option | Exposed window W | Survival weekday / weekend | Eligible n (expected) | Cost cap | Verdict |
| --- | --- | --- | --- | --- | --- |
| A. 500x2 sequential, judge inline | 22.4 h | 2% / 25% | 485 | `$853.50` (existing table) | Not feasible under the landed guard. Do not fund. |
| A2. 500x2 sequential, answer-only then stored judging | 13.6 h | 9% / 43% | 485 | about `$900` | Still a coin flip at best. Do not fund now. |
| B. 200 subset sequential, answer-only then stored judging | 5.5 h | 37% / 71% | 190 | `$273.50` | Feasible on a weekend only. Fallback if two server pairs are refused. |
| C. 200 subset, two server pairs in lockstep, answer-only then stored judging | 2.9 h | 60% / 83% | 190 | `$273.50` | **Recommended.** |
| C2. 500 subset, two server pairs in lockstep, answer-only then stored judging | 6.8 h | 30% / 65% | 485 | about `$600` | Powered upgrade. Fund only with an owner-accepted one-in-three weekday loss risk. |
| D. No new spend | none | n/a | 0 pairs | `$0` | No two-arm evidence exists. Supports free search-layer deltas only. |
| E. Per-pair identity epochs with interleaving | 1.6 min per pair | 99.5% per pair | up to 485 | engineering first | The only route to a powered pair at Scout's cadence. Follow-up decision. |

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
guard review already found this need in R1 without prescribing a change. It is one to two agent
days plus an independent review. It is the correct long-term shape. It is not the smallest next
measurement.

## Recommended design (Option C)

### Sample construction

- Run both arms with `--sample 200` against the frozen `eval/qa/cases.json`.
- The sampler is proportional by service with even-spaced picks over id-sorted strata.
- Provisional composition at HEAD: Docs 96, Scout 57, Lumenloop 25, skills 13, none 9; traps 16;
  stable 84, scheduled and live 116.
- Provisional ordered-ID SHA-256 of the 200 IDs:
  `8ba8e687ace17711cabb3932ca6d5e2edebede2bfbfcfbfd79ce3fca3bbd20da`.
- The 150-ID fallback hashes to `cbc850c65ad18709ae5a5d94c6ae009f041b78a6a11b0f51e5888959ca7001cc`.
- Freeze the corpus bytes, the ordered 500 IDs, and the ordered 200 IDs before the first paid call.
  Recompute all three hashes at the launch revision. A mismatch stops the launch.
- The affected-case stratum selects 496 of 500 cases. It cannot narrow the sample. Report it as a
  descriptive view only.

### Tuple and pins

Both arms share every value below. Record each value before spend.

| Pin | Value or rule |
| --- | --- |
| Runner revision | one clean 40-character commit that contains the merged remote identity guard and the envelope serialization repair |
| Candidate service revision | the same commit as the runner; adapter mode `verify-native` |
| Baseline service revision | `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`; adapter mode `add-missing` |
| Adapter | one implementation SHA-256 recomputed at the runner revision |
| Corpus | `eval/qa/cases.json` bytes, ordered 500 IDs, ordered 200 IDs |
| Answering and judge model | `claude-sonnet-5` |
| Rubric and pack | `v2.10` and `p6` |
| Judge tier | `stability-boundary-v1`, threshold `0.75`, `--max-panel-cases 34` on both phases |
| Stability register | the frozen file above, same path and SHA-256 for both arms and both phases |
| Prompt append | `QA_AGENT_PROMPT_APPEND` unset |
| Claude binary and environment | one SHA-256 pair, recomputed in the owned runner pane |
| Remote identity probe | committed `eval/qa/probe-remote-identities.mjs` bytes at the runner revision |
| Remote identity vector | one `--stable-sha256` result (three captures, five minutes apart) taken once, passed to both arms |
| Ports | candidate adapter 8788 with Wrangler 8790; baseline adapter 8789 with Wrangler 8791 |
| `.dev.vars` | identical bytes in both server worktrees; secret-safe equality attestation only |

### Topology and sequence

1. Create or reuse four clean worktrees: runner A, runner B, candidate server, baseline server.
   Runner A and runner B are the same revision. Separate worktrees keep results directories,
   temporary directories, and result stamps apart.
2. Start the candidate Wrangler on 8790 and its adapter on 8788. Start the baseline Wrangler on 8791
   and its adapter on 8789. Attest both listener pairs.
3. Run the free surface and source-revision probes through both adapters. Record both surface hashes.
4. Run the P6 judge self-test once. Retain its machine-readable record.
5. Run the formal `--stable-sha256` pre-arm probe once. Both arms take its hash.
6. Start the candidate collection, then the baseline collection within 60 seconds. Both use
   `--no-judge`, `--sample 200`, and the full pin set. They walk the same ordered IDs.
7. Watch both arms. If either arm stops for any reason, interrupt the other arm before its next
   answering call. The in-flight call is the only loss.
8. After both postflights pass, stop both server pairs.
9. Judge each artifact with `--judge-stored`, the pinned register, `--max-panel-cases 34`, and its
   own cap. Judging needs no server and no remote identity.
10. Run `npm run eval:qa:paired -- <baseline> <candidate> --json` with the baseline first.
11. Run both flip rejudge batches as stability evidence only.
12. Review every row of both artifacts before any claim leaves the round ledger.

### Deviations from the frozen full method

- `--sample 200` replaces the full corpus. The subset is not a current-quality headline.
- `--no-judge` and `--judge-stored` replace inline judging. This halves the window that upstream
  drift can break. The judge never touches MCP, so the guard review accepts stored judging.
- Two server pairs run at once. The earlier plan ran one Wrangler at a time for operator
  simplicity. Two pinned pairs on distinct ports change no measurement contract. The shared
  Lumenloop key and public rate limits now serve two agents at once; any throttling lands on both
  arms with the same expectation.
- Candidate-first order becomes lockstep. The candidate-first rule existed to bank the full
  current-quality result before baseline spend. A subset banks no headline, so the rule has no
  purpose here.

## Detectable effects and uncertainty

The estimand is unchanged: `P(candidate=correct) - P(baseline=correct)` and
`P(candidate in {correct, partial}) - P(baseline in {correct, partial})` over eligible IDs. Under no
change, the per-ID delta has variance close to the discordance rate `d`, so the look radius is
`2.45 * sqrt(d / n)`. The committed `0.10` and `0.08` rates are a mixed-tuple upper bound. The
identical-input re-judge floor alone is 15.6% pairwise, and two arms add answer variance, so `d`
between 0.2 and 0.3 is the honest planning range for the strict cutpoint. This pair recalibrates
`d` through `npm run eval:qa:paired:validate -- --recalibrate`.

| Eligible n | Radius at d = 0.10 | Radius at d = 0.20 | Radius at d = 0.30 | Loss detected at 80% power, d = 0.20 |
| ---: | ---: | ---: | ---: | ---: |
| 100 | 0.078 | 0.110 | 0.134 | 0.147 |
| 150 | 0.063 | 0.089 | 0.110 | 0.120 |
| 190 | 0.056 | 0.080 | 0.097 | 0.107 |
| 480 | 0.035 | 0.050 | 0.061 | 0.067 |

Reading rules for the recommended look at about 190 eligible IDs:

- `FAIL` demonstrates a loss. It needs a true loss near 11 points to fire with 80% power.
- `PASS` clears only the experimental `-0.08` radius. At `d = 0.2` an exact no-change pair passes
  about half the time. `PASS` is not evidence of improvement and not a product tolerance.
- `INDETERMINATE` is the expected outcome for a single-digit true effect. It is unfinished
  evidence, not a null result.
- The service tuning ceiling is single-digit points. Only the 480-eligible pair can bound a
  single-digit effect, and only at radius 0.05 to 0.06. The 200 subset therefore answers "is there a
  large regression or a large gain" and calibrates `d`. It does not resolve a small effect.

Per-service reads inside the sample are descriptive only. Docs 96, Scout 57, and Lumenloop 25 are
each below the powered floor.

## Maximum wall time

| Phase | Expected | Maximum before a stop |
| --- | ---: | ---: |
| Pre-arm stable probe and preflights | 15 min | 30 min |
| Answering, both arms in parallel | 2.6 h | 4.0 h |
| Stored judging, both arms | 2.0 h in parallel, 4.0 h sequential | 6.0 h |
| Flip rejudges | 30 min | 1.5 h |
| Total inside one calendar day | about 5.5 h | 12 h |

The answering phase is the only phase exposed to upstream drift. Launch it at the start of a
weekend UTC day. The observed weekend Scout rate raises survival from 60% to 83%. A stop by the
guard ends the method. The rows collected before the stop stay non-comparable and are not judged.

## Caps

Each command carries exactly one `--max-budget-usd`. No transfer, resume, or automatic repeat.

| Method | Expected | Cap | Rule |
| --- | ---: | ---: | --- |
| P6 judge self-test | `$0.25` | `$3.50` | seven calls, `$0.50` each, no retry |
| Candidate collection, 200 rows, `--no-judge` | `$52` | `$80` | one `run-qa.mjs` command |
| Baseline collection, 200 rows, `--no-judge` | `$52` | `$80` | one `run-qa.mjs` command |
| Candidate stored judging | `$24` | `$40` | one `--judge-stored` command |
| Baseline stored judging | `$24` | `$40` | one `--judge-stored` command |
| Candidate flip rejudge | `$7` | `$15` | one `re-judge.mjs --flips-vs` batch |
| Baseline flip rejudge | `$7` | `$15` | one `re-judge.mjs --flips-vs` batch |
| Method maximum | about `$166` | `$273.50` | no other method |

The `$80` collection cap is 1.5 times the expected agent spend. The stopped arm spent 48% of its
`$400` cap, so this ratio is consistent with observed variance. The baseline surface may need more
tool calls per answer; its cap is the same by design. A cap stop before the last ID ends the method
under the incomplete-run rule.

## Stop rules

Before the first paid call, stop when any item below holds:

- The runner, candidate, or baseline worktree is dirty, or any revision is not 40 characters.
- The merged runner revision lacks the remote identity guard or the envelope serialization repair.
- Any hash in the pin table differs from its recorded value.
- The corpus does not hold exactly 500 unique active IDs, or the 200-ID hash differs.
- The `--stable-sha256` probe fails or returns two different vectors.
- The P6 self-test fails, exceeds `$3.50`, or lacks a retained machine-readable record.
- Either surface probe or source-revision probe fails.
- Either listener pair or adapter attestation is missing or mismatched.
- `QA_AGENT_PROMPT_APPEND` is set.
- The Scout 1.9.30 drift decision or the candidate row review is not recorded as closed.

During collection, stop both arms when any item below holds:

- The guard stops either arm for an identity change, a probe failure, or a pre-arm mismatch.
- Either arm reaches its cap, omits a reported cost, or loses the `raven` MCP connection on a row.
- Either arm exceeds the 4-hour answering maximum.
- Either listener or adapter identity changes.
- Two unrelated rows in the candidate arm show the same executor fault class as the stopped arm.

After collection, stop the method when any item below holds:

- Either artifact reports `meta.comparable: false` or suppressed aggregates.
- The two artifacts do not share identical ordered IDs, case hashes, pins, and pre-arm vector.
- Either postflight vector differs from the pre-arm vector.
- Fewer than 100 IDs remain eligible after the T4 and T5 union exclusion.
- Any candidate-only T4 or T5 loss appears. It forces `INDETERMINATE` and ends the method.

After the printer: stop after `PASS` or `FAIL`. Treat statistical `INDETERMINATE` as unfinished
evidence. The one permitted repeat needs a new authorization and its own pre-spend review. There is
no third look.

## What the result can and cannot support

The pair can support these statements:

- A bounded paired difference between the final service revision and the 2026-08-19 revision on
  this 200-ID stratified sample, under the current corpus, the current live upstream state, and the
  `claude-sonnet-5`, `v2.10`, `p6` tuple.
- A `FAIL` demonstrates a loss on at least one cutpoint at the stated bound.
- A same-tuple discordance calibration for the printer.
- Per-row diagnostic leads after full review of both arms.

The pair cannot support these statements:

- Service quality on 2026-08-19. Upstream facts and the corpus have moved.
- A Scout release effect. Both arms call the same live Scout inside one identity epoch.
- Attribution to any single commit. The candidate is a composite treatment.
- A current-quality headline. That needs a full 500-case candidate arm under a separate authorization.
- A product improvement claim from `PASS`. The margin is a no-change radius.
- Any claim from rows collected before a guard stop.
- Any inference to other models, judges, binaries, production traffic, or latency.

The treatment also includes the executor repair that landed after the stopped arm. The stopped arm
measured a fault in 380 rows. The new candidate must be the repaired revision, and the stopped
artifact must not enter this comparison.

## Strict new-authorization block

This report authorizes no spend. A new authorization is valid only when it states every item below
in the round ledger before the first paid call.

```
AUTHORIZATION: two-week impact, paired subset (Option C)
Methods and caps: exactly the seven-line cap table above, $273.50 maximum.
One run per method. No transfer. No resume. No automatic repeat. No added method.
Denominator: --sample 200; ordered-ID SHA-256 recorded at the launch revision.
Tuple: claude-sonnet-5 / claude-sonnet-5 / v2.10 / p6 / stability-boundary-v1 / 0.75 / 34.
Baseline: 90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0, add-missing.
Candidate and runner: <one clean 40-character revision>, verify-native.
Register: <path> <sha256>.  Adapter: <sha256>.  Probe: <sha256>.  Pre-arm vector: <sha256>.
Binary: <sha256>.  Environment: <sha256>.  Corpus: <cases sha256> <ordered-500 sha256>.
Topology: two server pairs, ports 8788/8790 and 8789/8791, lockstep, answer-only, stored judging.
Window: weekend UTC start; 4-hour answering maximum; one calendar day total.
Stop rules: the three lists above, verbatim.
Reviews: independent pre-spend review of this design by a lane that is not its author;
         result review by a lane that is not the executor; every finding reconciled.
Owner decisions 1 to 9 below: each recorded with its answer.
Signature: AUTHORIZED <date> <owner>   or   NOT AUTHORIZED
```

Any blank field, any changed cap, or any missing decision makes the authorization invalid.

## Exact owner decisions

1. Denominator. Recommended: 200 selected. Alternatives: 150 selected (floor, radius 0.09 at
   `d = 0.2`), or 500 selected in lockstep (powered, 30% weekday and 65% weekend survival, about
   `$600`).
2. Two concurrent server pairs. Recommended: yes. If no, use Option B sequential with 37% weekday
   and 71% weekend survival.
3. Answer-only collection with stored judging. Recommended: yes. If no, the window grows by 2 hours
   per arm.
4. Guard semantics for this look. Recommended: keep the landed whole-arm stop. Decide separately
   whether to fund Option E (per-pair epochs and interleaving) before any powered 500 pair.
5. Launch window. Recommended: weekend UTC start, 4-hour answering maximum, no retry inside the same
   authorization.
6. Product-loss margin. Recommended: keep `0.08` as the experimental no-change radius and print the
   `0.05` and `0.10` tables. Do not adopt a product tolerance from this look.
7. Candidate-only T4 rule. Recommended: keep it terminal.
8. P6 judge self-test. Recommended: run it once at `$3.50` and retain the machine-readable record.
   The judge prompt is unchanged since the last pass, so this is a record requirement only.
9. Reporting. Recommended: record the subset result in `eval/qa/README.md` as a labeled paired
   diagnostic, never as the current-quality headline. Keep the full 500 candidate arm as a separate
   future authorization.

## Risks

- Scout can still release inside a 2.9-hour window. The design accepts a 17% to 40% chance of a
  guard stop. A stop costs at most the two collection caps and returns no comparison.
- The Lumenloop key and the public Docs search key serve two agents at once. Throttling would raise
  transport failures in both arms. Those rows count as T1 outcomes inside answers, not as
  exclusions, so they lower both arms together rather than one.
- Two runners started in the same second would share a result stamp. Separate runner worktrees and
  a 60-second stagger remove this.
- The guard review left R3 (retry bound 1.25 s over the harness timeout) and R5 (one misleading
  reason string) open as non-blocking. Neither changes a verdict. Fix both before launch if the
  merge window allows.
- The Docs title probe has a 1,000-record ceiling (R4). The set is at 650. Not a risk this month.
- Judge discordance may exceed 0.3. The look would then be `INDETERMINATE` under almost any true
  effect. The recalibration output is still useful and is the reason to run this look before any
  powered pair.
- A subset invites per-service over-reading. Every stratum is below the powered floor.

## Blockers

- The remote identity guard branch must merge and the runner worktree must be clean at one revision.
- The Scout 1.9.30 drift decision and the candidate closeout must be recorded as closed in the ledger.
- An independent pre-spend review of this design must return `LAUNCH-OK`.
- The owner must record decisions 1 to 9 and sign the authorization block.
