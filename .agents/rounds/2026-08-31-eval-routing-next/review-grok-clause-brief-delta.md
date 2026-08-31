# Bounded delta review — repaired `implementation-brief-fable.md`

Date: 2026-08-31
Reviewer: Grok 4.6 high
Source review: `.agents/rounds/2026-08-31-eval-routing-next/review-grok-clause-brief.md` (BLOCK)
Reconciliation: `.agents/rounds/2026-08-31-eval-routing-next/clause-brief-reconciliation-fable.md`
Repaired file: `.agents/rounds/2026-08-31-eval-routing-next/implementation-brief-fable.md` sections 5, 6, 9, and 11
Status: complete. No model fetch ran. No artifact build ran. No paid call ran. This reviewer wrote only this file.

This delta does not authorize a product commit. It does not authorize a paid QA arm.

## Verdict

**PASS**

H1 through H4 and M1 through M6 are repaired in substance. Every frozen positive now has `scout.searchResearch` in `B` under the documented projection.

Two residual record nits remain. They do not reopen H1. Fix them in the next brief edit. They do not need a full re-review.

## Union membership check

The documented projection is `{ id, name: entry.id, service, kind, description, keywords, routingKeywords }`.

`B = P5 ++ R`, where `R` is every remaining searchable entry with a non-null `scoreEntryWeightedUngated` score, ordered by that score descending then id ascending.

| Frozen positive | In P5 | In `B` | Ungated score | `R` tier |
| --- | --- | --- | ---: | --- |
| `ph-protocol-24-archival-root-cause` | no | yes | 186 | backfill |
| `ph-protocol-corrective-upgrade-history` | no | yes | 169 | backfill |
| `ph-protocol-upgrade-chronology` | no | yes | 124 | backfill |
| `ph-protocol-regression-remediation` | yes | yes | 236 | P5 |
| `ph-yieldblox-oracle-incident` | yes | yes | 272 | P5 |
| `ph-security-incident-postmortems` | yes | yes | 268 | P5 |
| `ph-soroban-auth-audit-history` | yes | yes | 233 | P5 |
| `ph-protocol-feature-origin` | no | yes | 209 | backfill |
| `phb-whisk-forced-follow-up` | no | yes | 101 | backfill |
| `phb-archival-defect-network-upgrade` | no | yes | 105 | backfill |
| `phb-auth-recursion-auditors` | yes | yes | 167 | P5 |
| `phb-core-upgrades-dates-features` | no | yes | 157 | backfill |
| `phb-yieldblox-reflector-manipulation` | yes | yes | 142 | P5 |
| `phb-network-upgrades-reasons` | no | yes | 93 | backfill |
| `phb-second-cut-after-whisk` | no | yes | 88 | backfill |
| `phb-cap-archival-fee-repair` | no | yes | 143 | backfill |
| `phb-auditor-auth-recursion-follow-up` | no | yes | 135 | backfill |
| `phb-clawback-origin-emergency-changes` | no | yes | 101 | gated |
| `phb-whisk-post-mortem` | yes | yes | 116 | P5 |

Missing from `B`: none. Count: 19 of 19.

The two former U50 misses now enter `R` as backfill. Across all 32 frozen questions, `B` has no duplicate ids. Every `R` entry with a null gated score is marked `backfill`.

## Original issue status

| Issue | Status | Evidence |
| --- | --- | --- |
| H1 | repaired | Section 5 no longer uses `searchCatalog` limit 50. All 19 positives reach `B`. |
| H2 | repaired | Section 6 swaps only when `fit >= fit(prev) + m` and `fit !== fit(prev)`. Tests 14, 15, and 18 match. |
| H3 | repaired | The "mirrors" sentence is gone. Sections 1, 5, 6, and 14 say this measurement replaces lexical 1.6×. `186 < 1.6 × 207` is recorded. Production margin policy is deferred. |
| H4 | repaired | Section 11 requires holdout 10/22/25 and at most 11 forbidden captures. Legacy uses the integer ±3 band. |
| M1 | repaired | Tests 8 and 9 require target membership and backfill marks. Sections 10 and 12 run them before the first build. |
| M2 | repaired | Section 2 pins 373 raw splits and 343 after the `Returns:` drop. The estimate is about 680. |
| M3 | repaired | Section 2 says `~/.cache/huggingface` exists and the pinned revision is absent. |
| M4 | repaired | Section 11 lists the six inspection ids. |
| M5 | repaired | `PARTIAL` is a ledger label. The referee still exits 1 and prints exact positive misses. |
| M6 | repaired | Join is 26 matched ops. The four unmatched ids are listed, stored as `unmatchedScoutOps`, and covered by test 6. |

Supporting free checks:

- `scoreEntryWeighted` and `scoreEntryWeightedUngated` export from `src/catalog/scoring.ts`.
- Holdout floors in `eval/gates.json` are 10/22/25 and at most 11 captures.
- Legacy band is `round(338 × 1%) = 3`.
- Matched Scout `x-routing` count is 26. Unmatched ids match the brief.
- Description sentences are 373 raw and 343 after the drop.
- The Hugging Face cache directory exists. The pinned Qwen revision is absent.

## Residual findings

These are record nits. They do not reopen H1–H4.

### R1 — "every searchable entry" overstates `R`

Section 5 says `B` can hold every searchable entry. `R` still drops an entry with a null ungated score.

Independent count: `|B|` is 79 for 17 of 19 positives and 78 for `phb-auth-recursion-auditors` and `phb-whisk-post-mortem`. The target still sits in those two unions.

Repair: say `B` holds P5 plus every remaining searchable entry with a non-null ungated score.

### R2 — name projection is documented, not production-identical

Section 5 sets `name: entry.id`. Production uses the last id segment plus aliases. Identity still returns the P5 prefix, so calibration is safe.

No further repair is required. Keep the projection frozen.

## What this PASS allows

- Close the original clause-brief BLOCK.
- Run the offline membership tests.
- Fetch the pinned model revision and build the clause artifact, under the brief's one-build stop.

## What this PASS does not allow

- A second clause-set or a second `m` grid.
- Any `src/` change.
- A product commit.
- A paid QA arm.
- A claim that production already preserves `TIER_INTERLEAVE_MARGIN`.

The post-implementation review remains `.agents/rounds/2026-08-31-eval-routing-next/review-grok-clause-fit.md`.
