# Saved-miss fact-stage classification

This record classifies reviewed QA misses by their first missing stage.
It does not report a new evaluation run.
Each row resolves to two independent records.
The case file holds the exact claims that define the fact.
A dated review record holds the grade and the saved disposition for that case.

## Classification

| Case | Fact | First missing stage | Grade | Graded review record |
|---|---|---|---|---|
| `q-live-ll-active-jobs-recency` | `distinct-active-job-listing-identities` | `contradicted` | `W / W` | `2026-07-12-live-v3-baseline.md#new-case-behavioral-review` records that the saved answer collapsed 30 distinct returned ids and URLs into 16 title groups. |
| `q-hist-quantum-preparedness-plan` | `dated-quantum-plan-publication` | `contradicted` | `wrong` | `2026-07-super-corpus-baseline.md#wrong-and-partial-triage` records that the called source returned the dated plan and the saved answer denied that it existed. |

## Scope

The benchmark keeps these labels as a diagnostic instrument.
The labels do not change product behavior or score a current run.
