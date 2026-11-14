# ADR-0011: The tool surface stays `search` + `execute`, trimmed for cost

Status: accepted, 2026-11-14.

Raven keeps code mode: a ranked `search` over operations and skills, and an `execute` that runs
model-written JavaScript in the sandbox. It does not add an evidence-returning `retrieve` tool.
It ships the trimmed surface measured as arm B-fixed-2: shorter tool descriptions and server
instructions, five compact cards per search where there were ten full entries, and no output
schema on `search`. The operations, the sandbox, and the security rules do not change.

The evidence is the first-principles round of November 12 to 14, 2026:
[`research/audits/2026-11-12-first-principles-round.md`](../audits/2026-11-12-first-principles-round.md).

## Evidence

| Comparison against today's surface | Cases | Score | Wrong answers | Client tokens |
|---|---|---|---|---|
| Best `retrieve` variant, first call replayed from storage | 61 tuning, four clients | 0.633 against 0.672 | 17 against 11 | 20% |
| The same variant served live | 61 tuning, four clients | 0.598 against 0.672; difference −0.074 (95% interval −0.127 to −0.025) | 20 against 11 | 20% |
| Trimmed surface, held-out first look | 100 unseen, three decisive clients | 0.632 against 0.662; difference **−0.030** (99% interval −0.070 to 0.007) | **35 against 30** of 300 | **59%** (41% fewer) |

The trimmed surface on the held-out look, in full:

| Measure | Today's surface | Trimmed | Reading |
|---|---:|---:|---|
| Client tokens per question | 113,829 | 66,876 | 41% fewer |
| Measured cost per answer, judge included | USD 0.195 | USD 0.149 | About 24% cheaper |
| Median / 95th percentile seconds | 21.6 / 78.9 | 21.2 / 55.6 | No slower |
| Answers whose citations were all returned or fetched | 71.0% | 77.3% | Better |
| Questions with a failed `execute`; top-level misuse; non-exposed operations reached | 10; 0; 0 | 11; 0; 0 | Level |
| Cases tagged as needing live data: score, wrong answers (99 answers) | 0.707, 6 | 0.646, 12 | **Weaker** |

## Reasons

- **No `retrieve` design answered better, and the best one failed live.** Eleven variants were
  screened; all scored below today's surface. The best was 0.074 lower when its calls ran live,
  gave nearly twice the wrong answers, and took 36.7 s at the median against 20.3 s. Its token
  saving of 80% did not survive the rule fixed in advance.
- **The surface's shape is not what limits accuracy.** About half of the golden facts in the
  tuning set are stated in no passage Raven retrieves. Ranking, packing, and scoring changes each
  moved fact support by one or two points.
- **The trim buys a large, well-measured saving for a small, poorly resolved loss.** The token
  saving is 41%, with an interval of 38% to 44%. The accuracy loss is about 0.03, with an interval
  from 0.07 worse to 0.007 better.
- **The owner's cost principle decides between them.** Correctness wins only when the alternative
  is far less correct. A path that is much cheaper and only slightly less correct can be the
  better product: two calls for the price of one leave room for clarification and refinement.

## What the test did and did not show

The registered rule asked whether the trimmed surface was as good as today's within 0.05 on the
mean of three clients (Claude Sonnet 5.5, GPT-6.1 Terra, Grok 4.7). After one look of 100 unseen
cases the answer was **not shown**: the interval crosses −0.05, and the wrong-answer guard missed
by one answer. The owner stopped the second look as poor value, and the round first recorded
"keep today's surface". The owner then applied the cost principle and chose to ship the trim.

So this decision does not rest on a passed equivalence test. It rests on a measured trade that the
owner judged worth taking. Anyone who reads "−0.030" as "equal" is misreading it.

## Known weakness

The trimmed surface was weaker on questions that need live data: 12 wrong answers against 6. That
stratum was reported, not tested, and the round did not isolate which part of the trim causes it.
Finding that out is the first follow-up.

## Reopening

Reopen the trim if any of these is measured on unseen cases with the three decisive clients:

1. A loss against the previous surface whose point estimate is below −0.05.
2. An excess of wrong answers clearly above the 5 per 300 accepted here.
3. A fix for the live-data weakness that gives back most of the token saving.

Reopen the `retrieve` question only with a design that returns evidence in a few seconds without a
model-written brief in the request, and only after the golden-truth pass has separated facts about
Stellar from requirements on procedure. Until then a new surface cannot be compared fairly with
this one.
