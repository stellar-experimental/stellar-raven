# Source-authority result — 2026-10-01

## Verdict

**PASS.** The coordinator accepted the result under the [predeclared rule](authority-plan.md).
Neither arm comparison shows a routing regression or a verified answer regression.
The blind second reader agrees on all 24 rows.
The candidate deletes the contradictory clause without replacement wording.

| Arm | Commit |
|---|---|
| BASE | `5ebffbac3c8bb33657c1f57fb1c5a494770e5d3f` |
| CANDIDATE | `894f5fea589ecb836c3db7b1ed7c0511b50ebe38` |

Collection order: receipt probe, baseline 1, candidate 1, candidate 2, baseline 2.
Collection ended at `2026-10-01T23:14:54.739Z`.
The server stopped at `2026-10-01T23:15:41.263825Z`.

## Per-case results

Cells show the saved judge grade and the first successful execute script's routing class.
E means expected families only. T means expected and other families together. Both classes pass.

| Case | Baseline 1 | Baseline 2 | Candidate 1 | Candidate 2 |
|---|---|---|---|---|
| `q-anchor-list-builders-discovery` | correct / T | correct / T | correct / T | correct / T |
| `q-asset-stablecoin-issuers-discovery` | partial / T | correct / T | partial / T | partial / T |
| `q-protocol-base-reserve-min-balance` | partial / E | partial / E | partial / E | partial / E |
| `q-scf-build-award-cap` | wrong / E | partial / E | wrong / E | partial / E |
| `q-sep-45-contract-auth` | partial / E | partial / E | partial / E | partial / E |
| `q-soroban-storage-types` | partial / E | partial / E | partial / E | partial / E |

Each arm has **E: 8, T: 4, O: 0, N: 0** across 12 rows.
Each arm passes six ecosystem rows and six protocol-control rows.
All candidate protocol controls pass. No case shows a routing gain.
The SCF scripts change from Scout plus Lumenloop to Scout alone; both remain class E.

Both readers attribute the stablecoin grade differences to judge variance.
Baseline 1's judge misattributes USDM1's approximate $1.12 million market cap to APSUSDM.
The saved APSUSDM value is `171508051.0211`.
The judge also treats Circle's prominence inconsistently across equivalent issuer answers.
The SCF grade differences follow observation dates: both second repetitions include a date.
Shared reserve, SEP-45, and storage omissions do not meet the answer-regression rule.
The saved grades remain unchanged.

## Spend and accounting

GO 2 cost **$3.23**; the exact total is **$3.2317497**, including its $0.0028798 receipt probe.
Answer costs total $1.3999487. Judge costs total $1.8318010.
All costs are complete: 25 answer turns, 73 provider calls, and 24 judge calls.
The selected ceiling stayed $52. No replacement or paid rejudge ran.
The first failed probe's charge remains **unknown** and is excluded from the GO 2 total.

The first probe stopped because its receipt had no cost despite positive token usage.
Accounting wrapped `AI.run` but missed the OpenAI Responses path through `AI.gateway(id).run`.
The repair accounts for both paths and preserves shared settlement and budget checks.
After independent review, GO 2 authorized a new probe against the repaired arms.
That probe reported one call, one reported call, positive cost, and no accounting error.
It also confirmed all three model overrides and visibility of the original baseline clause.
The [accounting coverage review](../../../research/audits/2026-10-01-playground-accounting-coverage.md) retains the unsupported native and no-plugin paths.
Their separate [TODO item](../../TODO.md#extend-playground-eval-accounting-to-native-and-no-plugin-model-paths) remains open.

## Reviews and limits

| Review | Reviewer | Verdict |
|---|---|---|
| Initial code | Grok 4.7, high | ACCEPT |
| Amended plan and clause deletion | Claude Fable 5.1, high | LAUNCH-OK |
| Accounting repair | GPT-6.1-Sol, high | ACCEPT WITH FIXES; finding reconciled; delta CONFIRMED |
| Blind second transcript reading | Grok 4.7, high | BOUNDED PASS; all 24 rows agree |
| Release decision | Coordinator | PASS under the predeclared rule |

The [independent reader report](authority-reader-grok.md) records the classification and answer review.
Five source identity checks matched. Matching identities do not prove that every upstream page stayed unchanged.
The instrument used `openai/gpt-5.6-terra` and judge `claude-sonnet-5`, with rubric `v2.10` and evidence pack `p6`.
The result covers complete-description Playground clients only.
Two repetitions do not establish statistical significance.
The result does not cover clipped clients or establish an MCP headline result.
Some returned evidence was truncated. The routing class measures written calls, not factual support.

## Outcome

The source-authority TODO is complete and removed.
This result record retains the blind reader report as evidence for the coordinator's release decision.
The native and no-plugin accounting extension remains separate open work.
