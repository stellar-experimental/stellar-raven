# Item 0.2: fresh Docs titles A/B (decision 3)

Run by the Sonnet executor on 2026-11-16, free and local, against the final phase A tree (Scout
1.9.150, Docs inventory and anchors, skill re-pins; titles held). The fresh titles were fetched in
the same `refresh-inventory.mjs` run (982 page titles) and saved to `tmp/0.2-titles-fresh.json`.
The tree was not moved: the fresh arm was built with `build-catalog.mjs --out`, then the hold
was restored with `git checkout HEAD -- inventory/stellar-docs-titles.json`, and
`sha256sum catalog/manifest.json` was re-asserted equal to the stamped value
`8bbfb864eb37988d968d56a18b7a10291e31fda4f5eb25f3d25d82cc0642fc38`.

Arms, each run with `node eval/run-routing.mjs --manifest <file>`, compared per case:

- `main`: `origin/main` manifest.
- Held: final tree, titles held (the manifest that is being committed).
- Fresh: the final tree's inputs with the fresh titles.

## Totals

Holdout lane counts only, as the held-out rule requires.

| Arm | Legacy t1/t3/t5/card@5 | Extended t1/t3/t5 | Skills t1/t3/t5 | Holdout t1/t3/t5, captures, passed | Protocol history t1/t3/t5, control captures |
|---|---|---|---|---|---|
| `main` | 220/293/327/113 | 93/112/117 | 17/23/23 | 12/27/30, 10, 25 | 6/7/7, 3 |
| Held | 220/293/327/113 | 93/112/117 | 17/23/23 | 12/27/30, 10, 25 | 6/7/7, 3 |
| Fresh | 219/293/326/113 | 93/112/117 | 17/23/23 | 12/26/30, 10, 25 | 6/7/7, 3 |

## Graded changes, fresh against held

Legacy (338 rows): 2 losses, 0 gains.

| Row | Grade change | Detail |
|---|---|---|
| `q-edge-exhaustive-defi-deep-report` | top5 true to false | `stellarDocs.search_anchor_sep_docs` (235) enters at rank 4 and pushes `scout.searchResearch` (232) out of the top five |
| `q-infra-hubble-vs-rpc-layer` | top1 true to false (any1 too) | `stellarDocs.search_rpc_horizon_data_docs` falls from 433 at rank 1 to 180 at rank 5 |

Extended (122 rows): 0 graded changes. 24 top-five list changes and 29 score-only moves.
Skills (23 rows): 0 graded changes (2 list changes, 3 score-only moves).
Protocol history (12 rows): 0 changes.

Holdout lane (49 cases), counts only: 0 pass changes, 0 gains, 1 top-3 loss (27 to 26), and 3
further cases whose expected-card rank moved without a grade change. 5 top-five list changes and
7 score-only moves in total.

`q-tool-wallets-kit`, the row the earlier titles run lost, does not change in this comparison
(top-1 in both arms).

## Verdict against decision 3

Decision 3's rule: absorb the fresh titles only if they lose at most the one known row on the gates
and nothing on the off-golden sets.

**Fails on the gates.** Three rows lose a grade (2 legacy, 1 holdout lane by count), none of them
the known `q-tool-wallets-kit` row, and no row gains. **The hold stays.** This matches the lead's
verdict in PLAN.md. Per the stop rule, the first failing condition ends the A/B; the off-golden 40
and FAM rows were not run. `scripts/summarize-live-drift.mjs` and its hold message are unchanged.

Raw runs and the compare script stay in `tmp/` (`0.2-final-run.json`, `0.2-fresh-run.json`,
`0.2-main-run.json`, `0.2-fresh-titles-manifest.json`, `0.2-compare-*.json`); they are ignored.
