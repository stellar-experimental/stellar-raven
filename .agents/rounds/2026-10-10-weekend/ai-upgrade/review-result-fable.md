# Result review S3: the `ai` upgrade measurement

Reviewer: Claude Fable 5.1, not the author (Claude Opus 5.5, lane S) and not the blind second reader.
Worktree: `/Users/kalepail/Desktop/raven-w1010-s`, branch `w1010/s`, head `3fb5d8c9`.
Inputs: the plan with amendment 1, `results.md`, the raw artifacts under `/private/tmp/raven-ai-upgrade`,
the six golden corpus files, and the earlier reviews `sr-review.md`, `sr2-review.md`, and `s-reader2.md`.
I re-derived every number below from the raw artifacts with my own scripts. I did not trust the author report.
No paid call ran. No server started. I made no commit and changed no tracked file.
I printed no environment block, no process argument, and no secret. I counted secret-shaped patterns only.

## 1. Method, caps, pins, receipts, and costs

### Artifacts and identities

- The six result files hash to the values in `results.md`. I recomputed each SHA-256.
- Both arms report `tree.dirty: false` and an empty-string status hash. The freeze held for every run.
- BASE runs record head `0dc353b9…` and generation `9a441ba6…`. CANDIDATE runs record head `32d22a71…` and generation `aa104042…`.
- The server logs hold exactly one `eval server revision` line each, with the matching commit.
- All four judged runs record judge `claude-sonnet-5`, rubric `v2.11`, pack `p6`, and executable SHA-256 `c9b53416…`.
  That SHA-256 equals `judge-pin.json`. The pin link resolves to the `2.1.296` executable file.
- The cases SHA-256 `207ca631…` is the same in all four judged runs. Both probes share `0f4ea7ff…`.
- Every turn in every server log has `attemptedModels` equal to `["openai/gpt-5.6-terra"]`. No fallback ran.
- The source probe value `1a927dce…c0c7b` appears in the ledger before each run and after the last run.

### Checkpoints against the raw artifacts

| Checkpoint | Evidence in the artifacts | State |
| --- | --- | --- |
| 1. Paired window | No ledger line. No artifact records the owner confirmation or the 23:00Z deadline. The directory is absent now. | **Not recorded.** Rests on the author's statement. |
| 2. Server slot | Ledger: fail at 15:49:18Z (another Wrangler, not the collector's), pass at 15:49:50Z with count 0. Count 0 after each stop. | Recorded. |
| 3. Gateway headroom | Ledger at 14:31:36Z, 78 minutes before the first paid call. No later re-read. | Recorded once. Low risk: the round spent $3.41 of $27. |
| 4. Freeze | Result files show clean trees and recorded generations. Smoke logs: BASE 119 tests, CANDIDATE 120 tests, all pass. | Recorded. |
| 5. Dry runs | Four dry-run logs select the expected IDs and make no request. | Recorded. |
| 6. Judge pin | `judge-pin.json` and the four result files agree. The ledger records a pin check before each judged run. | Recorded. |
| 7. SDK receipt | Ledger lines at each of the three server starts: `7.0.79 4.0.47` twice and `7.0.137 4.0.91` once. | Recorded in the ledger only. The BASE worktree is gone, so I cannot re-read it. |

The two failed `base-a` start logs hold zero `demo-chat-start` events. No request ran before the deviations.
The deviations (`script -q` instead of `tee`, the `cf` token wrapper) do not change the measured path.

### Receipt probes

| Probe | Status | Cost (USD) | Calls | Tokens in / out / total | Steps | Finish | Helper |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BASE | complete, no error | 0.0849925 | 1 of 1 | 30202 / 791 / 30993 | 3 | stop | exit 0, no usage mismatch |
| CANDIDATE | complete, no error | 0.0848785 | 1 of 1 | 30526 / 714 / 31240 | 3 | stop | exit 0, no usage mismatch |

Both probes pass every gate item. Each is turn 1 of its server log. Each has one `eval-cost` frame with `error: null`.

### Method completeness

All four judged runs: `budget.status` complete, `error` null, 12 of 12 calls reported, 0 missing costs, 0 incomplete IDs,
0 unattempted IDs, no `nonPromotable` key anywhere in the file. Every row: `finishReason` stop, HTTP 200, no `httpError`,
empty `sseErrors`, no `clientError`, 0 failed and 0 unfinished tool calls, one `eval-cost` frame, non-empty answer.
I re-ran `demo-steps.mjs` on the three logs: exit 0, `finalStepCoverage` 0, no problems, no usage mismatches.
Every turn has 3 steps. The log-to-row mapping matches on `searchCalls` and `executeCalls` for all 24 rows.
The step-7 rule is unexercised, as the plan requires the report to say.

### Caps and costs

The seven cap files match the plan. Consumed counts step 0, 6, 12, 18 for both call kinds. The replacement file
starts at 24 and 24 with `infra-retry`. It was not used.

| Invocation | Answer | Judge | Total | Max call |
| --- | --- | --- | --- | --- |
| Receipt BASE | 0.0849925 | 0 | 0.0849925 | 0.0849925 |
| Baseline 1 | 0.3509812 | 0.4525498 | 0.8035310 | 0.0953058 |
| Receipt CANDIDATE | 0.0848785 | 0 | 0.0848785 | 0.0848785 |
| Candidate 1 | 0.3776007 | 0.4717124 | 0.8493131 | 0.0935484 |
| Candidate 2 | 0.3599647 | 0.4742696 | 0.8342343 | 0.1073384 |
| Baseline 2 | 0.3233162 | 0.4324464 | 0.7557626 | 0.0924004 |
| Round | 1.5817338 | 1.8309782 | 3.4127120 | — |

My sums equal the `results.md` table. No call is at or above $0.30. No call has a zero or missing cost.
The round made 26 answer turns between 15:50Z and 16:06Z, below 30 in any hour.

## 2. Row-by-row reading

### Routing classes

I classified all 24 rows with the plan's regex on the first successful `execute` entry.
My classes equal the author's and the blind reader's on all 24 rows.

| Case | Baseline 1 | Baseline 2 | Candidate 1 | Candidate 2 |
| --- | --- | --- | --- | --- |
| anchor | T | T | T | T |
| stablecoin | T | T | T | T |
| SCF award | E | E | T | E |
| reserve | E | E | E | E |
| SEP-45 | E | E | E | E |
| storage | E | E | E | E |

BASE: E 8, T 4. CANDIDATE: E 7, T 5. No O or N row. The first `search` service is the same across the four runs for each case.
The one E-to-T change is a real `stellarDocs.search_docs` call in candidate 1's SCF row. It passes.
No routing regression. The protocol controls pass in both CANDIDATE repetitions.

### Answers against the goldens

**Anchor (the historically disputed `correct`).** All four answers are `correct`, and I accept that grade.
Each answer dates the roster (2026-10-10) and names the source. Each refuses completeness.
I checked every project name in each answer against a `name`, `title`, or `slug` field in that run's own `execute` result.
Every name is present, in all four runs. This includes candidate 2's Alfred Pay, Blox Global, Trace Finance,
FinClusive, CLPX, Zeam Money, and Etherfuse, which the judge called "unverified". They are in the model-visible evidence.
The answers' count of 15 comes from `scout.searchProjects data.meta.counts.total=15` in the source metadata.
The golden's 27 counts partner-directory anchor profiles on 2026-07-11, a different scope and date. No fabricated name. No must-avoid item fires.

**Stablecoin.** All four are `partial` for the same reason: no answer names Circle as the dominant issuer.
All four date the registry (2026-10-10), separate Circle's EURC from MyKobo's EURC, and refuse completeness. Same grade, same gap.

**SCF award.** All four answers give "up to US$150,000, paid in XLM, in four installments".
The evidence string is the same SCF Handbook FAQ text in all four runs. Grades differ. See the next section.

**Reserve.** All four give 0.5 XLM as current, the pool-share two-unit rule, and the selling-liability boundary.
None gives the reserve shift when sponsorship ends or the Soroban rent model (the known `sd-046` area). Grades differ. See the next section.

**SEP-45.** All four are `partial` for the same two omissions: no as-of date and no Draft status. Candidate 1 is shorter but holds the same facts.

**Storage.** All four are `partial` for the same two omissions: the two-variant XDR durability and the Protocol 23 restore mechanics.

### The two grade differences

**SCF award: judge variance and answering variance, not the SDK.**

| Run | Date given | Source given | Grade |
| --- | --- | --- | --- |
| Baseline 1 | yes | yes | correct |
| Candidate 1 | yes | yes | partial |
| Baseline 2 | no | yes | wrong |
| Candidate 2 | no | no | wrong |

- Baseline 1 and candidate 1 carry the same "four installments" phrase, the same date, and the same source.
  The judge accepted the phrase as milestone-based once and rejected it once. That is judge variance.
- The two `wrong` grades come from must-avoid item 3 (an undated measurement). One undated answer sits in each arm.
  The evidence is the same in all four runs, so the date flip is answering variance.
  The 2026-10-01 authority round showed the same date-driven pattern on this case.
- Not SDK-caused: the arms are symmetric (one dated, one undated each), and the evidence does not differ.

**Reserve: answering variance in BASE, not the SDK.**

| Run | Docs calls in `execute` | Sponsored-reserves page in evidence | Formula given | Grade |
| --- | --- | --- | --- | --- |
| Baseline 1 | 1 | no | simple formula, unscoped | wrong (avoid item 1) |
| Baseline 2 | 2 | yes | sponsorship-aware formula | partial |
| Candidate 1 | 2 | yes | simple formula, scoped to non-sponsored accounts | partial |
| Candidate 2 | 1 | no | simple formula, scoped to non-sponsored accounts | partial |

- Baseline 1 and baseline 2 sent the same two search queries. Their `execute` code differs: baseline 1 called one docs
  operation and never saw the sponsored-reserves page. It then stated the simple formula as universal. The judge applied
  must-avoid item 1 correctly. This is the model's own retrieval and wording choice, so it is answering variance.
- Both CANDIDATE answers scope the simple formula to non-sponsored accounts. Candidate 2 did so without the sponsored page.
- CANDIDATE is equal to or better than BASE on this case. No regression. The `sd-046` omissions appear in all four.

Verdict on the rule: no case has both CANDIDATE grades worse than both BASE grades. No verified answer regression.

### Other observations from the transcripts

- Inner service errors inside `execute` appear in both arms: `stellarDocs.search_anchor_sep_docs` fails in every anchor row,
  and `search_asset_token_docs` fails in one stablecoin row per arm, with the message "invalid arguments … no call was made".
  The model omits the required `query`. The host reports these as failed evidence; they are not tool errors and not loop defects.
  Both arms show them, so they are not SDK-caused. I found no `improvements/` entry for this pattern. It is a candidate finding, not a merge item.
- The judge's temperature is `provider-default-unpinned` in all four runs. That is the existing judge contract.

## 3. The strict-to-non-strict inference

**Counts, re-derived.** BASE: 28 of 28 method `search` calls, and both probe calls, set all six properties with
`recoverFrom: []` and `reason: "partial"`. CANDIDATE: 0 of 30 method calls, and 0 of 2 probe calls, set `recoverFrom` or `reason`.
One CANDIDATE call also omits `service`; its input is valid. No arm has a `null` input, an invalid-input error, a tool error, or an `{"error": …}` output.
`kind` and `limit` are set on every call in both arms, with the same values (`operation` or `skill`, limit 10).

**Is the inference sound? Yes, with one caveat.**
The smoke test pins the parameter schema hashes, and they are the same on both lockfiles. So the wire request differs only in `strict: false`.
A model at temperature 0.1 does not emit an empty recovery list and a fixed enum value 30 times in one arm and 0 times in the other by chance.
The server therefore decoded the two arms differently. The plan's expected strict signals (a `null` value or a "received null" error) did not appear.
The signal that did appear is the all-keys-present fingerprint, which is what strict mode requires. The label "strict mode" is the best
explanation, but no request log shows the mode. The product conclusion does not depend on the label: omitted `strict` and `strict: false` decode differently.

**Is the CANDIDATE behavior acceptable or better? Acceptable, and slightly better.**
The BASE filler was semantically empty. `src/demo/tools.ts` treats an empty `recoverFrom` as no recovery and then ignores `reason`, so BASE gained nothing from the two fields.
If a strict-mode model had ever sent a non-empty `recoverFrom`, the fixed `"partial"` reason would have been a guess, not a report.
CANDIDATE calls carry only the fields the model means, which is the MCP contract the Playground is meant to measure, and they cost fewer output tokens.
The cost of non-strict decoding is the chance of an invalid input. This screen saw 0 in 32 CANDIDATE calls. The `{"error": …}` recovery path is pinned by the smoke test but is unexercised live.

**Is `strict: false` still right? Yes.** `strict: true` needs a Playground-only schema: every field required and nullable, and `minLength` removed from `query` and `recoverFrom`.
That is a model-visible change on its own and would split the Playground schema from the MCP schema. This evidence shows no cost of `false` on six cases.
Keep the invalid-input count as a standing diagnostic in later Playground rounds, because 32 calls is a narrow screen.

## 4. Release conditions and the TODO item

| Condition | My reading |
| --- | --- |
| Accepted independent review of the plan and the diff | Met. `sr-review.md` ends `LAUNCH-OK-WITH-FIXES`; `sr2-review.md` ends `DELTA: LAUNCH-OK`; commit `23d3e595` reconciles the fixes. |
| Unchanged judge pin and matching SDK receipts for every start | Met. The pin is identical in all four results. The SDK receipts rest on ledger lines (see checkpoint 7). |
| Two passing receipt probes | Met, re-derived. |
| Four complete analysis slots with intact pins and complete costs | Met, re-derived. No replacement. |
| No routing regression, no verified answer regression | Met, re-derived. |
| Protocol controls pass in both CANDIDATE repetitions | Met: 6 of 6 class E. |
| No tool-loop defect in a CANDIDATE row | Met: 0 tool errors, 0 step-7 turns, every turn ends with `stop`. |
| Reconciled source drift, judge differences, upstream findings | Met by this review for drift and judge differences. The missing-`query` service error is a candidate upstream finding for `improvements/`, both arms, not blocking. |
| Merge outside the paired collection window | For the merger at merge time. The paired-launch directory is absent now. |

TODO done criteria: the measurement shows no routing regression and no verified answer regression, so the first criterion is met.
The request-shape test is a reviewed update (`23d3e595`, delta review LAUNCH-OK), so the second criterion is met at merge.

## 5. Findings

1. **Record gap, checkpoint 1.** The ledger has no line for the paired window, the owner confirmation, or the stop deadline.
   The plan requires each checkpoint result and time in the ledger. Fix: add the fact to `results.md`, with the time if known, or state that it was not recorded.
2. **Record gap, checkpoint 3.** The Gateway headroom was read 78 minutes before the first paid call and not re-read at 15:49Z.
   The spend was far below the ceiling, so the risk was low. Fix: state the single read time in `results.md`.
3. **`results.md` still says the non-author review has not run.** Fix: close the open row and the "Two items stay open" list with a pointer to this review.
4. **Anchor judge remark.** Candidate 2's "unverified" names are in the evidence. Fix (optional): note this in the anchor trace in `results.md`.
5. **Credential exposure incident.** The rotation of the three credentials is an owner action outside this merge. Its status is unknown to me.

These fixes change documentation only. No code, test, or measurement change is needed.

RESULT: MERGE-OK-WITH-FIXES: record checkpoint 1 and the checkpoint-3 read time in results.md; close the open review rows in results.md with a pointer to this review; optionally note that candidate 2's anchor names are in the evidence.
