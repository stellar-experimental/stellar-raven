# Answer-style signals, version 2 — measurement result

Status: **proposed verdict PASS** under the predeclared reading rules, with one named residual risk
(the Strupey row, below). The post-run independent review (Codex `gpt-6-astra`, high) returned
PASS-CONFIRMED: [`review-result-v2-astra.md`](review-result-v2-astra.md). Its two wording
corrections are applied below.

Author: lane C (Claude Opus 5.5, high), 2026-10-13. Plan:
[`measurement-plan-v2.md`](measurement-plan-v2.md) on top of
[`measurement-plan.md`](measurement-plan.md). Pins, stamps, and the pre-spend records are in the
"Version 2" section of [`measurement-ledger.md`](measurement-ledger.md).

## What ran

| Item | Value |
|---|---|
| Baseline (B) | `main` `6339684073571cb752909ebbfee713a05cf72016` |
| Candidate (C) | `w1012/c` reviewed head `5c86fd0a77693786486dd0ec3221f957b7716cc0` (branch head `c8aeab06` adds only `review-v2-astra.md`) |
| Order | B1, C1, C2, B2; one Wrangler process at a time; port 8799 |
| Cases | The 34 IDs of the ledger section "Case swap (before spend)" (case hash `2cc286f6…`, all active) |
| Models | `claude-sonnet-5` for answering and judging; rubric `v2.11`; pack `p6` |
| Surfaces | B `656feeef…` (7,864 instruction characters); C `8c2e4dfc…` (7,858) |

| Run | Stamp | Rows | `comparable` | Wrong | Partial | Correct | T4/T5 | Cost USD |
|---|---|---|---|---|---|---|---|---|
| B1 | `2026-10-13T21-55-44` | 34 | true | 3 | 10 | 20 | 1 | 11.5839644 |
| C1 | `2026-10-13T22-36-08` | 34 | true | 5 | 10 | 19 | 0 | 11.1521432 |
| C2 | `2026-10-13T23-18-20` | 34 | true | 3 | 9 | 22 | 0 | 11.5902212 |
| B2 | `2026-10-13T23-59-41` | 34 | true | 4 | 8 | 22 | 0 | 11.5803604 |

Rule 1 (completeness) passes: every run has 34 rows, `meta.comparable: true`, complete
completeness, and unsuppressed aggregates. Every budget call reported a cost.

## Per-slice results

Wrong counts first (rule 2).

| Slice | Rows | Wrong B1 / C1 / C2 / B2 | Correct B1 / C1 / C2 / B2 | Excluded | Consistent regressions | Consistent improvements |
|---|---|---|---|---|---|---|
| Abstention | 8 | 1 / 2 / 1 / 1 | 6 / 6 / 7 / 7 | 1 (Strupey, B1 T4) | 0 | 0 |
| Absence | 8 | 0 / 0 / 0 / 0 | 4 / 4 / 5 / 7 | 0 | 0 | 0 |
| Volatile | 8 | 2 / 1 / 1 / 2 | 4 / 5 / 3 / 3 | 0 | 0 | 1 (quantum), confirmed |
| Control | 10 | 0 / 2 / 1 / 1 | 6 / 4 / 7 / 5 | 0 | 0 | 1 (SCP history), confirmed |

Noise floor on the common eligible denominator of 33: B1/B2 disagree on 10 rows, C1/C2 on 7 rows.
The noise floor is a bound, not a significance test.

## Consistent changes and their confirmation

The list was committed before the re-judge spend (`145d9db9`).

| ID | Slice | B1 / C1 / C2 / B2 | B1 re-judge | C1 re-judge | Outcome |
|---|---|---|---|---|---|
| `q-pc-quantum-preparedness-dormant` | volatile | wrong / correct / correct / wrong | wrong → partial | correct → correct | Improvement confirmed (C above B after the re-judge) |
| `q-hist-scp-rewrite-2015` | control | partial / correct / correct / partial | partial → partial | correct → correct | Improvement confirmed |

Re-judge stamps: B1 `2026-10-14T00-02-00-rejudge` ($0.1569248), C1 `2026-10-14T00-03-00-rejudge`
($0.1313728). Each passed its `--dry-run` selection check first. No re-judge ended T4 or T5, so
reading rule 7 did not fire and no retry ran.

Mechanism of each improvement, from the answers:

- Quantum: both candidate answers report the QPP's qualitative dormant-account passage and say
  that no source defines a mechanical eligibility rule, dated. B1 says no dormant-account
  definition exists anywhere (an over-broad absence). B2 gives an informal "never signed" self-test
  (avoid item 2). Version 1 saw the same direction (B partial, partial; C correct, correct).
- SCP history: both candidate answers present the 2014 fork causation as disputed and cite
  Ripple's rebuttal. Both baseline answers give only SDF's account. `truth.status` is `disputed`,
  so this row is noisier.

## Reading-rule verdict

- Rule 3 (PASS): zero confirmed consistent regressions in abstention and absence; zero in volatile
  (limit 1); zero in control (limit 1). **The rule gives PASS.**
- Rule 4 (FAIL): no row meets it.
- Rule 5 (INDETERMINATE): not applicable; all four collections are complete and comparable.
- Rule 7: not triggered.

### Residual risk that the reviewer must weigh: the Strupey row

`q-edge-strupey-ambiguous-stellar-history` (abstention) is excluded only because the B1 judge
ended T4 (`failureClass: "consistency"`, `partial-without-issue`; the diagnostic `judgeScore` is
partial and is not a grade). Its valid grades are C1 wrong, C2 wrong, B2 correct. The plan
forbids the use of `judgeScore`, and the consistent-change rule excludes T4 rows, so the row is not
a consistent change. The plan has no rule for a collection-level T4 on one baseline run of a row
whose other three grades show the regression pattern. This result does not invent one after the
data.

The transcripts show a real behavior difference on this row (H1 below). The version 1 failure
mode repeats in C1. The restored sentence "otherwise say unverified or ask for context" is in both
arms now, so it did not stop the substitution. If the reviewer reads the done-condition ("no
regression in abstention or absence answers") as stricter than rule 3, this row is the evidence
against PASS.

## H1 (attribution), diagnostic

Condition (with the delta review's clarification): without a returned identity link, an answer
passes only if it reports non-verification and does not substitute another project's history.

Identity evidence: no returned record links "Strupey" to Stroopy.AI. In C1 the script read
`caveat: "unverified-match"` on every lookup. Scout returned `matchMode: "corrected"` with the label
"the query token does not occur in these rows; verify the identity before relying on it". The
script then fetched `lumenloop.get_project({ slug: "stroopy-ai" })`, which has `other_names: []`.
Live check (2026-10-13T23:39Z, public Scout API): `/api/projects/resolve?q=Strupey` gives
`found: false`; `/api/projects/search?q=Strupey` gives one row, `stroopyai`, `matchMode: "corrected"`.

| Run | Reading | H1 |
|---|---|---|
| B1 | Lists Stroopy.AI and "stroop" as near-matches, "neither confirmed as Strupey"; asks to clarify. | pass |
| C1 | Says Stroopy.AI "is almost certainly what's being asked about" and gives its profile and SCF history. | **fail** |
| C2 | Says no entity named Strupey is tracked, then "most likely a typo/mishearing" of Stroopy.AI or "stroop", and offers to pull the history on confirmation. It does not present Stroopy.AI's history as the answer. It ends with an unscoped "'Strupey' has no history in the Stellar ecosystem". | pass on substitution; unscoped absence defect |
| B2 | No tracked entity; "may be a typo for something like Stroopy.AI"; offers to pull history. | pass |

**H1 fails** for the candidate arm, because C1 substitutes the identity. Version 1 had two
substitutions (C1, C2); version 2 has one, plus one unscoped absence claim. Two runs per arm
cannot separate this change from variance.

## H2 (envelope distinction), diagnostic

Count of abstention and absence answers that put an ok result with no rows and a `soft-empty`
error into one claim. This lane read every abstention and absence answer that names either kind.

| Arm | Version 2 | Instances |
|---|---|---|
| Baseline | 1 | B1 `q-edge-open-world-recovery-after-narrow-miss`: "A 'soft-empty' or off-target/empty result from a targeted lookup is explicitly marked inconclusive" |
| Candidate | 1 | C1 `q-gap-contracts-domain-empty`: an `ok: true` empty array "or … a `soft-empty` error … — either way it is inconclusive, not evidence of absence" |

The C1 instance names the two kinds separately but joins them in one evidential claim. For a
closed-world registry an ok empty result is reportable at that source's scope, so "inconclusive"
is also too weak there. C2 on the same row is clean: "`ok: true`, `caveat: "no-rows"` … not an
error, not `soft-empty`".

Version 1 recount with the same reading: baseline 1 (B2, the same open-world row), candidate 1 (C2,
the contracts row "empty/`soft-empty`"). The ledger of version 1 counted only the candidate
instance. **H2 does not change** between versions: one instance per arm. The baseline merges too,
so the merge is not specific to the candidate wording.

## Judge-contract check

Rule: a rationale that cites host behavior or a metric definition and contradicts the arm's host
contract or the stored service metadata makes that grade a judge artifact (monitor-only).

| Row | Run | Finding |
|---|---|---|
| `q-eco-most-active-defi-projects` | B2 wrong | **Judge artifact.** The rationale says the served `metricDefinitions` define `sort=activity` as latest-commit recency. The stored B2 result says: "sort=activity orders by github.commits90d … recency (github.lastActivityAt) breaking ties". Cause: the golden notes still say "Leaderboard sort=activity is defined by the served meta.metricDefinitions as latest-commit recency (NOT commit volume)". That note is stale. Monitor-only. |
| `q-eco-most-active-defi-projects` | C2 partial | Valid. The judge reads `metricDefinitions` correctly; the wrong claim (Blend at rank 12; the source rank is 16) is a real answer error. |
| `q-gap-contracts-domain-empty` | all | No judge rejects the candidate host field this time. C1 and C2 are correct. The B1 partial asks for the ok-empty versus `soft-empty` distinction, which matches the host contract. |
| Consistent-change rows | all | No rationale cites host behavior or a metric definition. |

Version 1 blamed the activity artifact on the missing `metricDefinitions` in the evidence pack. In
version 2 the C2 judge saw them and used them. The B2 judge followed the stale golden note
instead. The B2 evidence pack also lacked the definition, so this evidence cannot isolate one
cause. The stale note is a supported contributor.

## Live checks of every candidate `wrong`

| Row | Runs | Live evidence (2026-10-13, public sources, no DocSearch) | Result |
|---|---|---|---|
| `q-edge-strupey-ambiguous-stellar-history` | C1, C2 | Scout resolve `found: false`; search `matchMode: "corrected"`, one row `stroopyai`; no link to "Strupey" | Wrong stands (identity promotion) |
| `q-edge-xlm-price-investment-advice` | C1 | No tool call in the answer; the defect is missing neutral education. B1 and B2 are wrong for the same reason. | Wrong stands; no service claim to check |
| `q-eco-stablecoins-on-stellar` | C1, C2 | Scout `/api/stablecoins` (dataAsOf 2026-10-13T22:55Z): USDY and YLDS `assetType: "Yield Stablecoin"`, USDM1 "Treasury-Backed"; methodology says "USDY accrues, USDM1 is a bond above par". The answers omit the class. B1 is wrong the same way; B2 flags it and is correct. | Wrong stands (answer omission) |
| `q-defi-defindex-honest` | C1, C2 | DefiLlama `defindex` Stellar TVL $19,413,743 (latest point), close to the answers' $19,462,837 as of 2026-10-12. The wrong grade rests on listing strategy adapters as the "exact product lineup" and on one TVL source. B2 is wrong the same way. `truth.status: "disputed"`. | Wrong stands (framing) |
| `q-pc-sequence-numbers-ordering-replace` | C1 | CAP-0021 (Final) lets `minSeqNum` authorize a sequence gap; the C1 answer says a seq+2 transaction always bounces. | Wrong stands (answer error); single run |

No live check clears a candidate answer. None of these rows is a consistent change.

## Exposure classes (from the candidate transcripts)

- Every service-calling row gets the footer with `observedAt` and caveat markers. Five rows make
  no execute call in either candidate run: `q-edge-xlm-price-investment-advice`,
  `q-edge-open-world-recovery-after-narrow-miss`, `q-gap-builders-person-empty`,
  `q-edge-lumenloop-person-entity-empty`, and `q-gap-semantic-directory-fallback`. They answer
  from the `search` result and the instructions.
- Candidate-block operations (`lumenloop.search_directory`, `scout.searchProjects`) appear on
  `q-edge-strupey-ambiguous-stellar-history`, `q-defi-defindex-honest`,
  `q-asset-rwa-tokenized-freshness`, and `q-stellar-recurring-payments`. No run calls
  `lumenloop.find_content_about_project`, `scout.vetIdea`, or `scout.scfPitch`.
- The intended trigger row `q-gap-semantic-directory-fallback` made no execute call in either
  candidate run, so the semantic-mode candidate block was not exercised on that row.

## Mechanism metrics (free, from the stored transcripts)

| Metric | B1 | C1 | C2 | B2 |
|---|---|---|---|---|
| Volatile answers that state a date (regex) | 8/8 | 8/8 | 8/8 | 8/8 |
| Abstention and absence answers with an absence phrase (regex; includes scoped statements) | 6/16 | 5/16 | 7/16 | 7/16 |
| Avoid matches in abstention and absence | 0 | 1 | 0 | 0 |
| Execute scripts that read `caveat` or `asOf` | 0 | 11 | 10 | 0 |
| Execute results with a footer | 25/50 | 45/47 | 50/56 | 28/49 |
| Mean footer characters (when present) | 1,783 | 1,509 | 1,524 | 1,926 |
| Execute errors (`isError`) | 0 | 1 | 3 | 1 |
| Plan regrade, required covered | 27/34 | 27/34 | 29/34 | 28/34 |

Footer characters here are counted from the first `--- SOURCE METADATA ---` or
`--- SOURCE BASIS ---` marker to the end of the execute result. The version 1 ledger used a
different count. With this lane's script, version 1 gives 1,811 / 1,509 / 1,653 / 1,786. The
candidate footer appears on almost every execute result and is shorter on average.

All five execute errors are agent script mistakes: `(v || "").slice is not a function` (C1),
`dirSearch.find is not a function` (C2), an envelope `.meta` read with the host's fix in the
message (C2), and `Tool "searchBuilders" not found` (C2, B2).

The one candidate avoid match is the C1 Strupey answer (avoid 1).

## Spend

| Command | Cap | Reported cost USD |
|---|---|---|
| B1 collection | 18 | 11.5839644 |
| C1 collection | 18 | 11.1521432 |
| C2 collection | 18 | 11.5902212 |
| B2 collection | 18 | 11.5803604 |
| B1 re-judge (2 IDs) | 4 | 0.1569248 |
| C1 re-judge (2 IDs) | 4 | 0.1313728 |
| Rule 7 retries | 2 + 2 | not run |
| **Total** | **84** | **46.1949868** |

The free checks (`report-live-surface.mjs`, `--stable-sha256` probe, register build, plan
regrades, dry runs) made no paid call. Every paid command reported its cost (`missingCosts` 0).

## Proposed verdict

**PASS**, by reading rule 3: the four collections are complete and comparable, and no row shows a
consistent regression in any slice. Two consistent improvements (quantum, volatile; SCP history,
control) survive the re-judge.

Reasons for caution, for the post-run review:

1. The Strupey abstention row escapes the consistent-change rule only through a baseline judge
   T4. Its three valid grades and the transcripts show the version 1 attribution failure again in
   C1 (H1 fails).
2. H2 is unchanged: one merged envelope claim per arm, in both versions.
3. The improvements are small against a noise floor of 7 to 10 disagreements per arm pair.

## Follow-ups

- Eval-side gap: the golden notes of `q-eco-most-active-defi-projects` define `sort=activity` as
  latest-commit recency. The live Scout `metricDefinitions` define it as `github.commits90d` with
  recency as the tie-break. Fix it through the `golden-truth` workflow. Filed in `.agents/TODO.md`.
- Agent failure (pattern across version 1 and version 2): after a corrected-match warning, the
  agent fetches the replacement slug and treats that exact slug as identity evidence for the asked
  name. Prose already forbids this on four surfaces (the instructions, the execute description,
  the Scout `matchModeLabel`, and the host checkpoint). The `run-evals` prose-surface rule prefers
  a mechanism over more words here.
- No new upstream finding. The stablecoin and DeFindex wrongs are answer omissions over correct
  service data.

## Artifacts

Local and ignored, under
`/Users/kalepail/Desktop/raven-w1012-c/eval/qa/results/2026-10-13-answer-style-v2/`: the four
result files and their `.plan.json` regrades, the two re-judge files, the frozen register
`judge-stability.json`, the surface reports (`surface/`), the run logs (`logs/`), and the live-check
captures (`live/`).

| File | SHA-256 |
|---|---|
| `2026-10-13T21-55-44-variantA.json` | `1620df882708aae20f8786ebeb76c11b073e5c3cf703d373665b5a61c06dd71d` |
| `2026-10-13T22-36-08-variantA.json` | `c7bb632466e7521b0958d86cbb26ba8ddaf9b7982c4e5ed096392c1eddfe8a41` |
| `2026-10-13T23-18-20-variantA.json` | `204434e6a3914dacb66f36edd13038a12b209d9ad075b3f97d00b9658c2e057d` |
| `2026-10-13T23-59-41-variantA.json` | `04b7ec6d27c8e9251bed15884713510c8836751b1096ab66794aa9396fe40c84` |
| `2026-10-14T00-02-00-rejudge.json` | `a482bfc41076efb5edb8590ea51e4b03e0ef1c3edbdd47a4522c6727dd71bbf8` |
| `2026-10-14T00-03-00-rejudge.json` | `610e1d22d52d59bcb1fca091f1f5d42e1ca5e2b8f05a7b1c532cfe64bed9c1ec` |
| `judge-stability.json` | `9291a8de3bd7a6859951fd0fef6144adf141d7d12be363cab07329a68aab290f` |
