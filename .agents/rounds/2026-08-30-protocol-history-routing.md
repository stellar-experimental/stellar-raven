# Protocol-history routing round — 2026-08-30

## Scope

Implement `.agents/NEXT.md` block 3 without tuning one question.
Surface `scout.searchResearch` for protocol-history work while protecting direct technical searches.

This round uses only free, offline instruments. It does not authorize deployment, pushing, pull requests, or paid calls.
The round keeps measurement and product changes in separate commits.

## Initial pins

- Revision: `b53f62d3e6370231103b221e5474ecb6cbfd5627`
- Initial tree: clean
- Clean-tree digest: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- Manifest SHA-256: `4945c3117d464d7155fe6bc2bd2f2f42638ef83159435ae48a90bab046dc6789`
- Manifest inventory: 252 entries, 60 operations, 19 whole skills
- Initial routing runner SHA-256: `6f19371a3a68f2bd727c04be27df41ee4f2b56284f5ef0e3c7988305597b2b54`
- Routing corpus SHA-256: `9e863cedc1f1754f67b3955bfe744254da6ae0d069502aefc7964530493fafd3`
- Gate file SHA-256: `95a4f7c1afb9ee3d7de517549994da1986d50411719cecfbb03226ab1bbbb371`
- Gate contract: legacy 338, skills 23, holdout 49
- Accepted totals: legacy 208/279/311; skills 16/23/23; holdout 10/22/25
- Accepted holdout forbidden captures: 11

## Commit topology

The first local commit mixed measurement and product code. The independent review blocked it.
The branch rewrites that unpushed commit into two stages:

1. A measurement commit freezes the cases and adds no product behavior.
2. A later product commit lands only if it passes every frozen contract.

## Frozen measurement

`protocol-history-routing-v1` preserves the original eight positives and four controls.
Its case-content digest is
`5b8ee40f89c846c4e69fa91f5a483f9d224dd79628afa7f9ac45b522f9aaa8a8`.

`protocol-history-blind-v1` preserves 11 paraphrases and nine hostile controls.
The independent Grok 4.6 high review authored these cases before the replacement design.
Its case-content digest is
`b63cfb605bd98aeba6981535be7bd5ee968e1e8b48ee92a1d55e4d5b07521f53`.

`eval/self-test.mjs` pins both contracts, counts, IDs, and content digests.
The original 12 cases remain in the routing runner and its exact 495-case dump.
The standalone `npm run eval:protocol-history` command runs both contracts.

Positive cases require `scout.searchResearch` within the top five.
Controls forbid `scout.searchResearch` at every top-five rank.

## Untouched baseline

Routing trace: `routing-2026-08-30T13-35-41-541Z.json`.
Exact ranked dump: `/tmp/protocol-routing-measurement.json`.
Protocol-history trace: `protocol-history-2026-08-30T13-35-42-158Z.json`.

| lane | top-1 | top-3 | top-5 | card@5 |
|---|---:|---:|---:|---:|
| legacy strict, 338 | 208 | 279 | 311 | 95/182 |
| extended strict, 122 | 90 | 109 | 117 | 17/28 |
| skills, 23 | 16 | 23 | 23 | 23/23 |
| holdout, 49 | 10 | 22 | 25 | 25/49 |

The holdout has 11 forbidden captures. All existing routing gates pass.

| frozen diagnostic | positive top-5 | control top-5 captures | result |
|---|---:|---:|---|
| `protocol-history-routing-v1` | 4/8 | 1/4 | fail |
| `protocol-history-blind-v1` | 3/11 | 6/9 | fail |

The current search already captures six hostile controls through ordinary lexical scoring.
A safe product must remove those captures and improve unrelated positive paraphrases.

## Relevant extended cases

The full extended lane runs with every candidate. These four relevant cases form a focused read:

| case | baseline research rank | leading operation |
|---|---:|---|
| `q-pc-protocol-upgrade-timing` | 4 | `stellarDocs.search_meeting_notes` |
| `q-sor-p23-auto-restore-extendto` | miss | `stellarDocs.search_doc_titles` |
| `q-sor-x-ray-bn254-sdk-gap` | miss | `stellarDocs.search_protocol_concepts_docs` |
| `q-ti-run-tune-own-horizon` | 5 | `stellarDocs.search_rpc_horizon_data_docs` |

## Rejected first product attempt

Commit `10b30bd3a86698592b458ba998b96591408ba955` is no longer branch history.
The local review remains at `/tmp/protocol-routing-review.md`.

The rejected attempt changed seven of 495 rankings.
It raised the original diagnostic from 4/8 to 8/8 top-five.
It also copied case vocabulary, missed nine of ten unseen paraphrases, and caused eight broad rank-one captures.

It placed coverage-failed research hits in the gated tier.
That error let a 399-point research hit outrank a 500-point Docs backfill hit.
It also reduced legacy strict top-1 from 208 to 207.

## Replacement experiments

All replacements used manifest profiles and existing scores. None used query vocabulary.

### All corpus-scope entries as backfill

This candidate moved every `emptyScope: "corpus"` entry out of the gated tier.
It changed 243 of 495 rankings.

Legacy strict moved to 188/265/314, so the routing gate failed.
The original diagnostic reached 2/8 positives with zero control captures.
The blind set reached 3/11 positives with one control capture.

### Only the research corpus as backfill

This candidate applied the same rule only to the `research` and `corpus` profile pair.
It changed 126 of 495 rankings.

Legacy strict moved to 206/275/308, so the top-3 gate failed.
The original diagnostic reached 3/8 positives with one control capture.
The blind set reached 3/11 positives with three control captures.

### Full-page research backfill

This candidate kept true coverage passes in the gated tier.
It considered only a coverage-failed research entry on a full page.
The entry stayed in backfill and obeyed `TIER_INTERLEAVE_MARGIN`.

This candidate changed 15 of 495 rankings and kept all routing gates.
It surfaced `q-protocol-24-whisk-incident` at rank five.
It kept `q-protocol-version-history-list` strict top-1 unchanged.

The 15 changed queries were:

- `q-asset-clawback-cap-protocol`
- `q-comp-clawback-cap0035`
- `q-defi-aquarius-tvl-freshness`
- `q-edge-noinfo-cap-fake-sharding`
- `q-hist-remittance-corridors`
- `q-protocol-24-whisk-incident`
- `q-protocol-bls12-381-cap59`
- `q-scf-funding-by-category`
- `q-sep-clawback-prereq-flag`
- `q-tool-skill-detail-install`
- `q-tool-which-sdk-comparison`
- `q-skill-data-balances-history`
- `q-skill-scf-radar-positioning`
- `ph-protocol-24-archival-root-cause`
- `ph-control-clawback-cap`

However, the original controls worsened from 1/4 to 2/4 captures.
The blind hostile controls worsened from 6/9 to 8/9 captures.
The blind positives stayed at 3/11.

This is a precision failure. The named-case gain cannot justify it.

## Replacement acceptance

A product commit must meet all conditions:

- Keep the original and blind case content byte-stable.
- Pass every positive and control in both frozen contracts.
- Keep coverage-failed entries in the backfill tier.
- Preserve score order and `TIER_INTERLEAVE_MARGIN` across tiers.
- Restore `q-protocol-version-history-list` strict top-1.
- Add `searchCatalog` tests for all nine hostile shapes.
- Preserve every existing routing gate without a rebaseline.
- Record every changed query in the exact 495-case comparison.

If no small general mechanism meets these conditions, the branch will remain measurement-only.

## Review reconciliation

The branch reconciles every review finding:

- **F1:** Resolved. The copied classifier and its per-question vocabulary are absent.
- **F2:** Measured. The independent paraphrases are frozen before replacement work.
  Their 3/11 baseline remains red, so no generality claim ships.
- **F3:** Measured. All nine required hostile shapes call `searchCatalog` in the executable diagnostic.
  Six baseline captures remain red. No product code hides them.
- **F4:** Resolved. No coverage rescue enters the gated scorer.
  The rejected tiering prototypes kept rescued research in backfill.
- **F5:** Resolved honestly. The blind set contains a hyphenated historical post-mortem positive.
  It also contains a failed-deploy post-mortem control. A hyphen alone decides nothing.
- **F6:** Resolved. Diagnostic classes only describe measurement groups.
  No product classifier maps or collapses them.
- **F7:** Resolved. The 150-point bonus is absent.
  `TIER_INTERLEAVE_MARGIN` remains unchanged.
- **F8:** Resolved. Legacy totals return to 208/279/311 and card@5 returns to 95/182.
  `gates.json` needs no rebaseline.
- **F9:** Resolved in measurement. Controls now fail on any top-five capture.
  The original current-version control exposes the existing rank-five leak.
- **F10:** Deferred by the original task restriction.
  `.agents/TODO.md` and `.agents/NEXT.md` remain unchanged and correctly show open product work.
- **F11:** Resolved. No classifier reads `why` before the stopword scorer removes it.
- **F12:** Measured. No new description or keyword bonus amplifies catalog-note overlap.
  The frozen controls expose the current lexical overlap.

## Verification

Measurement-stage verification:

- `npm run eval:selftest`: pass, including both frozen content digests.
- `npm run eval:compile`: pass with 338 legacy and 122 extended cases.
- `npm run eval:routing -- --gate --dump-ranked /tmp/protocol-routing-measurement.json`: pass.
- `npm run eval:protocol-history`: expected diagnostic failure at the recorded baseline.
- Exact ranked dump size: 495 cases.

Final verification:

- `npm run eval:selftest`: pass.
- `npm run eval:compile`: pass with 338 legacy and 122 extended cases.
- `npm run eval:routing -- --gate --dump-ranked /tmp/protocol-routing-final.json`: pass.
- Final routing trace: `routing-2026-08-30T13-46-44-709Z.json`.
- Exact comparison: 495 cases before and after, with zero changed rankings.
- `q-protocol-version-history-list`: strict top-1 remains
  `stellarDocs.search_protocol_concepts_docs`.
- `npm run eval:protocol-history`: expected exit 1.
- Final diagnostic trace: `protocol-history-2026-08-30T13-46-49-159Z.json`.
- Original diagnostic: 4/8 positive top-five and 1/4 control captures.
- Blind diagnostic: 3/11 positive top-five and 6/9 control captures.
- `npm run typecheck`: pass.
- `npm test`: pass, 95 files and 1,506 tests.
- `npm run build`: pass.
- `npm run secrets:scan -- --tree`: pass.
- `git diff --check`: pass.

## Findings and spend

The review found an own-repo ranking defect, not an upstream service defect.
This round files no upstream improvement.

No paid measurement ran. A later paid plan requires separate authorization and adversarial review.

## Outcome

Ship measurement only. No product mechanism met the frozen precision and generality requirements.

The branch preserves the exact production search behavior from the initial revision.
It adds a reproducible red measurement for future semantic or upstream routing work.
No upstream finding is justified because the defect is in this repository's lexical router.
