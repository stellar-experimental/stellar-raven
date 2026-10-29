The title-only diagnostic fails check 6. Keep the title absorb held. Zero changed corpus grades do not remove the focused wallet loss.

Inputs: main Scout 1.9.61, the main stellar-light pin 3b587aa9f23d21fc572f6e93cb6d11031dbc24e6, and the fresh 682-title Docs inventory. No new Scout operation is exposed.

The scorer, selector, and vendor scorer match baseline-main byte-for-byte. No candidate code enters this diagnostic. The scorer SHA-256 is `5c2d39dbefae23a89abd07a07eba61f05a3116f9477900f0b1324f1aa086781a`.

All 544 rows replay against their saved inputs: 338 legacy, 122 extended, 23 skills, 49 holdout, and 12 protocol-history rows. All 149 supplied probes also run.

| Label | Legacy top1/top3/top5/cardHit5 | Extended top1/top3/top5/cardHit5 | Skills top1/top3/top5/cardHit5 | Holdout top1/top3/top5/captures |
| --- | --- | --- | --- | --- |
| baseline-main | 219/298/326/112 | 93/111/117/16 | 17/23/23/23 | 12/26/29/10 |
| src-titles | 219/298/326/112 | 93/111/117/16 | 17/23/23/23 | 12/26/29/10 |

| Check | Verdict |
| --- | --- |
| 1 | PASS |
| 2 | PASS |
| 3 | PASS |
| 4 | PASS |
| 5 | FAIL |
| 6 | FAIL |
| 7 | PASS |
| 8 | FAIL |
| 9 | PASS |
| 10 | PASS |
| 11 | PASS |
| 12 | FAIL |
| 12 strict diagnostic | FAIL |

Check 12 compares this source-only result with baseline-main. D1 permits source-text gains and rejects graded losses on all 532 graded rows. The four named regressions retain baseline-main grades.

Literal check 12 fails because Scout remains at 1.9.61, below its required 1.9.71 epoch. The title-only comparison has zero changed grades and passes the separate loss-only comparison. Its strict zero-grade-change comparison also passes. The full strict check 12 verdict remains FAIL because of the Scout epoch condition.

Raw gate failures: catalog/manifest.json SHA-256 does not match the committed gate evidence — re-baseline gates.json explicitly. No numeric threshold fails. The helper leaves the fingerprint failure visible.

The addendum-2 table below contains every graded change against baseline-main.

| Row | Grade changes | Losses | Source-text cause |
| --- | --- | --- | --- |
| none | none | none | No graded row changes |

The diagnostics retain complete pages and score traces for each changed row. Causal probes restore each changed source entry’s main scoring fields.

| D2 guard | Baseline-fresh captures | Diagnostic captures | New rows | Promoted rows | Verdict |
| --- | --- | --- | --- | --- | --- |
| hackathon | 7 | 0 | none | none | PASS |
| locator | 6 | 0 | none | none | PASS |

| Captured operation | Poor-fit row | Rank |
| --- | --- | --- |

The D2 reference is baseline-fresh, as the lead requires. Passing D2 permits its existing poor-fit rows. It does not establish that those rows are suitable.

| Focused wallet result | Ranked page |
| --- | --- |
| q-tool-wallets-kit | 1: stellarDocs.search_docs (465, gated); 2: scout.vetIdea (298, gated); 3: scout.searchProjects (262, gated); 4: scout.searchResearch (253, gated); 5: stellarDocs.search_soroban_contract_docs (178, gated) |

| Soroban Docs probe | With approach | Without approach |
| --- | --- | --- |
| How do I support multiple Stellar wallets (Freighter, LOBSTR, xBull, hardware wallets) in one dApp with a single integration? | 178 | null |

The new title keyword approach supports a prefix match for app after dApp splits into d and app. Soroban Docs enter the fifth gated slot at 178. The unchanged wallet Docs score is 565, but the full-page admission path excludes that result. This is a Raven routing defect triggered by valid source text.

The published fixture remains the check 8 basis. The builder-emitted RWA entry is also measured on all 544 rows. RWA remains excluded.

| RWA form | Discovery positives | Ordinary negatives | Mixed controls | No builder graded cost |
| --- | --- | --- | --- | --- |
| fixture | PASS | PASS | FAIL | — |
| builder | PASS | PASS | FAIL | FAIL |

| Builder RWA lost row | Lost grades |
| --- | --- |
| q-defi-rwa-overview | top3 |
| q-defi-rwa-scf-similar | top3, cardHit5 |
| q-eco-2025-defi-launches | top5, cardHit5 |
| q-aas-issuer-fees-supply-cap-freeze | top1 |

| Probe group | n | Watched captures | Builder captures |
| --- | --- | --- | --- |
| shortTokens | 20 | 20 | — |
| hackathonNegatives | 22 | 3 | — |
| hackathonPositives | 12 | 12 | — |
| locateNegatives | 20 | 0 | — |
| locatePositives | 5 | 0 | — |
| rwaDiscovery | 10 | 8 | 8 |
| rwaImplementation | 20 | 9 | 10 |
| schemaWords | 20 | 20 | — |
| taxonomyPositives | 12 | 10 | — |
| taxonomyNegatives | 8 | 0 | — |

Zero locator captures follow its exclusion. They do not prove a successful locator admission repair.

| Global short query | Actual gated entries |
| --- | --- |
| through | 2 |
| each | 8 |
| network | 6 |
| is | 24 |
| an | 28 |
| also | 21 |
| app | 21 |

The initial helper adaptation stopped on an undefined pair variable. The corrected helper replays the saved routing run. The initial log remains in source-diagnostics-initial.log. No failed measurement was hidden.

Evidence: `tmp/impl/runs/src-titles/`, [command record](source-diagnostic-commands.json), and [source input differences](source-input-diff.json).

The tracked tree stays unchanged. This diagnostic uses no model call and adds USD 0 spend.

