# Final Scout 1.9.23 routing review

Date: 2026-09-03

## Decision

**REJECT DRIFT. Do not rebaseline.**

The final verify-only candidate has real routing regressions.
Its verified endpoint value does not offset those regressions.
The expired protocol-history readings provide no acceptance credit.

## Compared inputs

I compared the clean main result with the final verify-only result.

| Input | Clean main | Final candidate |
| --- | --- | --- |
| Result | `routing-2026-09-03T15-22-22-048Z.json` | `routing-2026-09-03T16-40-50-516Z.json` |
| Manifest SHA-256 | `4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b` | `4273c2990a48eac1b749afe07d4971d99c7d32117e7b6ee4bc823265cf22c476` |
| Routing cases SHA-256 | `9e863cedc1f1754f67b3955bfe744254da6ae0d069502aefc7964530493fafd3` | Same |
| Skills cases SHA-256 | `3ec4d90444489550f9ac9745384a4371cdbd0077dfc77a84597652d02f61ba1f` | Same |
| Holdout cases SHA-256 | `cb34d83be86f63a0a4ba06977659afa91d0fbaecbeab0e86b82bef9d73c4bbf5` | Same |

The final manifest exposes 31 Scout operations.
It includes `scout.verifyClaim` and excludes `scout.getQualityReport`.

## Lane results

| Lane | Clean main | Final candidate | Decision use |
| --- | ---: | ---: | --- |
| Legacy strict top 1 / 3 / 5 | 213 / 279 / 312 | 211 / 277 / 312 | Regression |
| Legacy card hits | 95 / 182 | 103 / 182 | Case-level review required |
| Extended strict top 1 / 3 / 5 | 90 / 110 / 116 | 90 / 109 / 114 | Regression |
| Skills top 1 / 3 / 5 | 16 / 23 / 23 | 16 / 22 / 23 | Regression |
| Holdout top 1 / 3 / 5 | 10 / 22 / 26 | 10 / 22 / 26 | Unchanged |
| Holdout forbidden / passed | 11 / 21 | 10 / 22 | One acceptable replacement |

The v1 protocol row changes from 4 / 4 / 4 to 7 / 7 / 7.
Its control captures change from two to three.
I gave it no credit.
Both v2 contracts are `source-expired` before scoring.

## Exhaustive result review

I compared every returned top-five row.

| Lane | Changed rows | Metric-changing rows | Score-only rows | Same-membership reorder | Membership change without a metric change |
| --- | ---: | ---: | ---: | ---: | ---: |
| Legacy strict | 110 | 16 | 34 | 10 | 50 |
| Extended | 32 | 2 | 10 | 3 | 17 |
| Skills | 9 | 1 | 2 | 0 | 6 |
| Holdout | 11 | 1 | 4 | 2 | 4 |

The non-metric rows preserve their declared result.
They do not support a routing gain or a routing loss claim.

### Legacy strict and card rows

| Case | Change | Classification |
| --- | --- | --- |
| `q-comp-yieldblox-oracle-incident` | `scout.searchResearch` drops from rank one to two. | Real regression |
| `q-defi-rwa-scf-similar` | The exact Lumenloop similar-submissions card leaves rank five. | Real regression |
| `q-eco-most-active-defi-projects` | `scout.getLeaderboard` enters rank five. | Real improvement |
| `q-edge-factcheck-soroswap-first-amm` | `scout.searchResearch` moves from absent to rank one. | Real improvement |
| `q-edge-fresh-latest-protocol-version` | Scout research replaces a lower Docs result. Docs remains rank one. | Acceptable replacement |
| `q-infra-testnet-vs-futurenet` | Scout research creates only an `expected_any` pass. | Label artifact |
| `q-protocol-19-preconditions-cap-0021` | Scout research replaces a lower Docs result. | Acceptable replacement |
| `q-protocol-23-whisk-caps` | Scout research replaces a lower skill result. Docs remains ranks one and two. | Acceptable replacement |
| `q-protocol-24-whisk-incident` | Docs drops from rank one; Scout research takes rank one. | No credit: expired protocol-history overlap |
| `q-protocol-bls12-381-cap59` | Scout research replaces rank four evidence. | Acceptable replacement |
| `q-protocol-network-passphrases-list` | Official Docs drops from rank three to four. | Real regression |
| `q-protocol-parallel-execution` | Official Docs drops from rank three to four. | Real regression |
| `q-protocol-state-archival-ttl` | Scout research enters rank three. Docs remains rank one. | Acceptable replacement |
| `q-protocol-version-history-list` | Docs drops from rank one; Scout research takes rank one. | No credit: expired protocol-history overlap |
| `q-scf-rfp-tooling` | Exact `scout.getRfps` enters rank four. | Real improvement |
| `q-soroban-reentrancy` | `scout.searchResearch` leaves rank five for `scout.explainRepo`. | Real regression |

The card count rises by eight.
Only three card changes are direct product improvements.
They are the leaderboard, Soroswap fact-check, and RFP rows.
Five card gains are acceptable supporting replacements.
Two apparent gains overlap expired protocol-history material.
Two card losses remove an exact routing target.

### Extended, skills, and holdout rows

| Case | Change | Classification |
| --- | --- | --- |
| `q-defi-build-staking-for-own-token` | Docs falls from rank three to absent. | Real regression |
| `q-pc-account-merge-reclaim-reserve` | Docs falls from rank five to absent. | Real regression |
| `q-skill-soroban-first-contract` | The smart-contract skill drops from rank three to four. | Real regression |
| `q-holdout-b-07-sep24-fields` | A forbidden standards skill leaves rank five. Docs remains rank one. | Acceptable replacement |

The holdout pass increase does not prove a product gain.
It removes an unrelated forbidden skill without improving the target result.

## Verified endpoint value

`scout.verifyClaim` has a read-only contract.
Its request and response claim-type enums both include `issued`.
The direct `type=issued`, `subject=EURC`, and `auditor=Circle` contract is tested.
The natural EURC query routes `scout.verifyClaim` into the top five.

This is useful new endpoint value.
It does not cause any metric-changing routing row.
It changes only two unrelated top-five memberships.
It cannot justify rebaselining unrelated Scout routing regressions.

## Required next action

Keep `scout.verifyClaim` available only after the Scout routing regressions receive an independent resolution.
Do not accept the full Scout 1.9.23 drift or change `eval/gates.json` yet.

No new baseline values are justified.
The candidate values must not become baseline values.

REJECT DRIFT

## Hybrid accepted-routing projection

I built a temporary manifest from the final current 1.9.23 manifest.
It retained 253 current entries, current schemas, current metadata, and `scout.verifyClaim`.
It excluded `scout.getQualityReport`.

For all 252 overlapping entries, I restored only these clean-main scorer inputs:

- `description`
- `keywords`
- `routingKeywords`
- `knownAliases`
- `knownAliasTriggers`
- `searchable`

The temporary result is `routing-2026-09-03T16-44-45-896Z.json`.
Its manifest SHA-256 is `346111c8ab9335b54f4b914e764ffa750ea1e39ec6303e9c0f641b817f537e1b`.

The hybrid matches clean main for every scored metric.

| Lane | Hybrid result | Clean main result |
| --- | ---: | ---: |
| Legacy strict top 1 / 3 / 5 | 213 / 279 / 312 | 213 / 279 / 312 |
| Legacy card hits | 95 / 182 | 95 / 182 |
| Extended strict top 1 / 3 / 5 | 90 / 110 / 116 | 90 / 110 / 116 |
| Extended card hits | 17 / 28 | 17 / 28 |
| Skills top 1 / 3 / 5 | 16 / 23 / 23 | 16 / 23 / 23 |
| Holdout top 1 / 3 / 5 | 10 / 22 / 26 | 10 / 22 / 26 |
| Holdout forbidden / passed | 11 / 21 | 11 / 21 |

Only two returned rows differ.
Neither row changes a metric.

| Lane | Case | Clean main | Hybrid |
| --- | --- | --- | --- |
| Legacy strict | `q-soroban-zk-bn254-poseidon` | `skills.stellar-dev.cross-chain` at rank five | `scout.verifyClaim` at rank three |
| Holdout | `q-holdout-c-14-aquarius-tweet` | `scout.listContracts` at rank five | `scout.verifyClaim` at rank three |

`verifyClaim` is the only remaining capture.
Both captures are unrelated to its closed claim grammar.
They do not change a grade, card result, or holdout result.

The experiment passes as a routing-isolation diagnostic.
I reject a committed accepted-routing projection as the current product design.

The projection is general and does not tune individual queries.
However, it creates a second, stale routing source beside current upstream contracts.
It would silently retain old upstream intent while exposing new schemas and endpoints.
That conflicts with the forward-only manifest policy.

Use this projection only as evidence that current routing text causes the regressions.
Do not commit it without an explicit owner policy for routing epochs, review, and retirement.

REJECT

## Verify-only isolation check

I removed only `scout.verifyClaim` from the final manifest in a temporary file.
All legacy, extended, skills, holdout, and card values stayed identical.
Only two ungraded top-five memberships changed.

- `q-soroban-zk-bn254-poseidon`
- `q-holdout-c-14-aquarius-tweet`

This confirms that `verifyClaim` does not cause the listed regressions.

REJECT DRIFT
