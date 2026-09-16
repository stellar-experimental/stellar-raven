# Scout issue #141 quality repair freeze

Date: 2026-09-16

Status: **FROZEN FOR INDEPENDENT QUALITY REVIEW. RELEASE BLOCKED.**

The release candidate keeps `GET /api/rwa` excluded. The quality repair changes four ranked lists.
It restores all three reported `expectedAny` intents. It adds one relevant DEX directory result.
It adds no technical directory capture. It changes no gate, label, exposure, or accepted baseline.

Issue #141 remains open. This report does not accept the source or the RWA operation.

## Frozen candidate

- Worktree: `/tmp/raven-execution-2026-09-16/drift-combined-accepted`
- Branch: `fix/scout-routing-accepted-main`
- Base and `HEAD`: `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d`
- Current main metadata: `1d9fa2f20e498e441ba0428c1a6fdbac306710f7`
- Working tree: uncommitted
- Tracked binary diff SHA-256: `ec19de4f662dd209de2f3846c18f7d73e4df9af6e561b56b7dde9e7d661388e5`
- Release manifest: 282 entries and 30 exposed Scout operations
- `scout.getRwaAssets`: absent from the release manifest
- `eval/gates.json`: unchanged

The PR #166 main change affects metadata only. Its runtime and catalog equal the candidate base.
Final integration must preserve the newer main TODO wording.

## Final runtime hashes

| File | SHA-256 |
|---|---|
| `src/catalog/search.ts` | `8a264911a38ced92503e11d844d793cb85004d79387ef878ce8e5ecd710605cc` |
| `src/catalog/scoring.ts` | `32fc2be48aeed6973f77ce9a3fa89d145f02db3f005b48b5f14f4cc4dd8a5b6a` |
| `src/catalog/extract-routing-phrases.ts` | `943251c31eb5ce37ea27ee960ad7aa707a80793df0dfdda8c77df7d16b247812` |
| `scripts/build-catalog.mjs` | `85918fc2347adca30461288dcabe2d225624ac5873e41bc32d55dafb2e8ce124` |
| `src/catalog/types.ts` | `50568a81bc822b07f618338c72d831d4cc7cc586abb66c16e76e5f258d9f180b` |
| `catalog/manifest.json` | `bc91f286b8c750a7c551253a84840d2c8e2634fb9e86db939f93b1eb13a5d361` |
| `inventory/stellar-light.json` | `0e99b00af91f2336869af8c8a28be4dbd1317cf24755ac445b95ff43997210c1` |
| `specs/super-spec.json` | `7ae72e7913074ec5b1e8b4cee30f51c44bd59615e2b58a2438b43086b893b109` |
| `src/policy/scout-exposure.ts` | `dc9238321e396646a5080db5b86b622c82a79ecdcbac2375dc53672cfe29a6bb` |
| `eval/gates.json` | `d25251f2409c85a34233f0bfca3d0dfd1e5fd4ab76dfa4f7272b4f43ab8f6722` |

## Final test hashes

| File | SHA-256 |
|---|---|
| `test/drift-141-routing.test.ts` | `7bde7ccabd7cb1abac0bca51db2035c61749a762f6deb2edce29f98c0c3ffc75` |
| `test/routing-evidence.test.ts` | `724edc34e76573a630dd0239f6731dc4eae6c04fae30ba239352e74567ee451e` |
| `test/search.test.ts` | `8449e5eecbbcf5d00620af9ef795d5e669a75c9fbe562dccc0882e7e36d67ef2` |
| `test/scoring.test.ts` | `4e84a4e37ac572de2e6c1b1a1f34491508bcd408a348ce28f7c5701c131b6e9f` |
| `test/extract-routing-phrases.test.ts` | `1073d16b62bf9d2647eaf2a4becb61613c4c55ed32a2416c42a5a2d7f941d14c` |

## Exact quality repair

The repair adds four general rules to the earlier frozen scorer.

1. A source `non-X` modifier does not reject a positive `X` query.
2. The shared canonicalizer maps an `x` plus `es` plural to its singular token.
3. A bounded directory witness can admit split source evidence.
4. A selected dated semantic lane can lead adjacent title-only search for clear freshness intent.

The negative modifier rule uses the source token `non`. It does not parse general English negation.
The rule leaves genuine governance, utility, and token negatives effective.

The directory witness has five requirements:

- The operation uses the `directory` retrieval lane.
- An exact token occurs in only one complete catalog entry.
- The source repeats that token in `useWhen` and `exampleQuestions`.
- A different complete input enum also matches the query.
- No source negative clause matches.

Generic routing actions cannot become the exact-token witness. The rule ignores case and word order.
It uses no query ID, operation ID, holdout identity, or description sentence.

The freshness rule requires two freshness tokens. It changes only selected page order.
It moves a dated semantic result only above an adjacent exact-title result.
The dated semantic operation must accept both `date_start` and `date_end`.

The 140-list broad directory experiment was rejected. It is not in the frozen runtime.
The rejected named-project casing experiment is also absent.

## Source capability

`scout.getStablecoins` is the purpose-built stablecoin directory. Its source states a live, curated basis.
The source measures the directory every six hours. This route is more truthful than generic content search.

`scout.searchProjects` supports named project lookup. Its source explicitly names Soroswap and the `DEX` type.
The operation returns directory facts and verified inline metrics. It does not answer implementation questions.

`lumenloop.search_content_semantic` searches dated content. It accepts `date_start` and `date_end`.
Its source recommends it for current ecosystem facts. It is a retrieval lane, not a live TVL oracle.

`scout.searchResearch` is a cited static corpus. It is not a live TVL oracle.
`scout.searchProjects` carries a weekly DefiLlama point through `tvlUSD` and `tvlAsOf`.
The final Blend route uses dated semantic retrieval instead of restoring a false live-oracle claim.

## Source-only and code-only attribution

The source-only and code-only dumps use the pre-quality attribution packet.

| Row | Source-only | Code-only | Frozen combined | Final |
|---|---|---|---|---|
| Stablecoins | `getStablecoins` rank 1 | `getStablecoins` rank 1 | absent | rank 1 |
| Soroswap | `searchProjects` rank 2 | absent | absent | rank 5 |
| Blend TVL | `searchResearch` rank 1 | `searchResearch` rank 2 | dated semantic rank 2 | dated semantic rank 1 |

The stablecoin loss was a combined source and admission interaction. A source negative included `non-stablecoin issued assets`.
Bag matching incorrectly treated `stablecoins ... issued` as that negative.

The Soroswap loss was code-only. The source named Soroswap and supplied a separate `DEX` enum witness.
The coherent same-phrase rule discarded valid split evidence.

The Blend loss was a combined source and selection interaction. The repair does not restore `searchResearch`.

Attribution artifacts:

- `/tmp/raven-execution-2026-09-16/scout-final-source-only-ranked.json`
- `/tmp/raven-execution-2026-09-16/scout-final-code-only-ranked.json`
- `/tmp/raven-execution-2026-09-16/scout-final2-accepted-ranked.json`
- `/tmp/raven-execution-2026-09-16/scout-quality-release-ranked.json`

## Four ranked-list changes

The final repair changes four of 495 non-holdout ranked lists.

| Row | Before | After | Decision |
|---|---|---|---|
| `q-defi-soroswap-what-is` | Docs title, three skills, Docs protocol | Same first four, then `scout.searchProjects` | Relevant directory restore |
| `q-eco-dex-saturation` | Digest, radar, `vetIdea`, Docs, analysis | Digest, `searchProjects`, radar, `vetIdea`, Docs | Relevant directory improvement |
| `q-eco-stablecoins-on-stellar` | Docs, Docs title, two skills, semantic | `getStablecoins`, Docs, Docs title, two skills | Purpose-built directory restore |
| `q-edge-fresh-latest-blend-tvl` | Docs title, dated semantic, three others | Dated semantic, Docs title, same three | Truthful freshness order |

The final set contains no extended, skills, holdout, or protocol-history identity change.
The three technical captures from the intermediate eight-list experiment are gone.

The movement artifact is
`/tmp/raven-execution-2026-09-16/scout-quality-final-vs-frozen-movements.json`.
Its SHA-256 is `4ae2e6ee5d9b5bd53f80002902d16881eb8a048a169649b97a76bf31997a72c6`.

## Aggregate measurement

The accepted-policy result is `routing-2026-09-16T22-58-35-214Z.json`.
Its SHA-256 is `941618e5a632819ca5abcf0e6a52613857c2624c22158448497b3bf5bc8ad887`.

The ranked dump is `/tmp/raven-execution-2026-09-16/scout-quality-release-ranked.json`.
Its SHA-256 is `a4cb3548c120814915739daa7bfb9adc932666fbdcfeb8aebefb71387173c90b`.

| Lane | Accepted main run | Frozen candidate | Quality candidate |
|---|---:|---:|---:|
| Legacy strict | 213 / 280 / 314 | 218 / 298 / 327 | 219 / 298 / 326 |
| Extended strict | 90 / 111 / 116 | 93 / 111 / 117 | 93 / 111 / 117 |
| Skills strict | 16 / 23 / 23 | 17 / 23 / 23 | 17 / 23 / 23 |
| Holdout strict | 10 / 22 / 27 | 12 / 27 / 29 | 12 / 27 / 29 |
| Holdout forbidden | 11 | 10 | 10 |

Legacy `acceptEither` changes from 252 / 320 / 336 to 254 / 321 / 337.
Extended `acceptEither` stays 102 / 118 / 121.

Legacy `cardHit5` changes from 113 to 112. The stablecoin row causes this strict-card loss.
Its accepted alternatives include Scout. The purpose-built Scout directory now ranks first.
Independent review must decide whether this truthful strict-label loss is acceptable.

The unchanged gate fails four conditions:

1. The manifest SHA-256 differs from the committed evidence.
2. Legacy top-one 219 exceeds the symmetric band around 213.
3. Legacy top-three 298 exceeds the symmetric band around 279.
4. Legacy top-five 326 exceeds the symmetric band around 312.

These are improvements above the old upper bands, except the disclosed stablecoin strict loss.
No gate or baseline changed.

## Eleven issue #141 checks

The focused original cases pass in the applicable policy variant.
Check 10 remains pending review. These results do not establish source acceptance.

| Check | Result | Evidence |
|---:|---|---|
| 1 | PASS | YieldBlox and Reflector research stays in the top five. |
| 2 | PASS | Four generic words do not admit research alone. |
| 3 | PASS | `contract` alone does not admit `explainRepo`. |
| 4 | PASS | Account-merge Docs stays present. `hackathonBrief` stays absent. |
| 5 | PASS | Short unrelated prefixes remain distinct. |
| 6 | PASS | Strong Docs evidence survives five weak Scout candidates. |
| 7 | PASS | All eight attributed rows meet their top-five grade. |
| 8 | N/A release; PASS experimental | RWA is absent from release. The original inclusive positives and unrelated controls pass. |
| 9 | PASS | Leaderboard and exact RFP intent remain reachable. |
| 10 | PENDING REVIEW | All strict lanes improve against accepted main. The unchanged symmetric gate still fails. |
| 11 | PASS | Category and region vocabulary operations remain reachable. |

Check 8 does not authorize RWA exposure. The experimental manifest exists only for measurement.

## RWA-inclusive experiment

The inclusive result is `routing-2026-09-16T22-55-04-273Z.json`.
Its SHA-256 is `4d15edfed81e67ec3c986a48491d2b0dd1939567de998eeb1afdfc4bf1510ee5`.

The inclusive ranked dump is
`/tmp/raven-execution-2026-09-16/scout-quality-rwa-inclusive-ranked.json`.
Its SHA-256 is `c2983ea5d7dc070ae16c2091858ab87544e6ab90577d128a0bf963c9816f1e1d`.

The inclusive manifest SHA-256 is
`79a2c66308c9daf7458063eff2068987022b42c71ea08326bb3c8d65d81c19ba`.

| Lane | Inclusive result |
|---|---:|
| Legacy strict | 219 / 296 / 325 |
| Extended strict | 92 / 111 / 117 |
| Skills strict | 17 / 23 / 23 |
| Holdout strict | 12 / 27 / 29 |
| Holdout forbidden | 9 |

The focused inclusive run passes 47 tests and fails two added controls.
Those failures are not original check 8 cases.

The unresolved captures remain:

1. Tokenized-bond RPC simulation ranks `getRwaAssets` third.
2. Tokenized-treasury wallet balance ranks it second.
3. Issuer fees, supply cap, and holder freeze ranks it first.

These are Raven routing defects. They are not established upstream schema defects.
The release manifest excludes RWA, so these captures cannot occur in release.

The existing issue handoff is
<https://github.com/stellar-experimental/stellar-raven/issues/141#issuecomment-5705390743>.
This lane did not duplicate it.

## Fresh controls

Stablecoin positives:

- `Which stablecoins are issued or live on Stellar?`
- `Which fiat-pegged stablecoins are issued on Stellar?`

Stablecoin negatives:

- `Which non-stablecoin governance tokens are issued on Stellar?`
- `List utility tokens issued on Stellar that are not stablecoins.`

Soroswap positives use lowercase, uppercase, and name-first order.
The SDK bindings negative does not route to `searchProjects`.

Blend positives use `current`, `today`, `recently`, `trend`, and `quarter` forms.
RPC, USDC, CLI, and SEP technical controls keep their Docs operation first.
None of those controls add `scout.searchProjects`.

## Runtime review

The separate runtime review found no broad p95 regression.
It measured pooled median increases of 3.4% and 3.9% in two runs.
The controlled-vocabulary query median increased 51.5%, or 3.65 ms.
The broad gated query increased 25.5%.

The current search always computes an ungated pass. It also repeats query preparation.
These costs remain release concerns. The separate runtime optimization requires its own integration review.

Runtime evidence:

- `/tmp/raven-execution-2026-09-16/scout-search-runtime-review.md`
- SHA-256 `e5371494a46840aaa46b4e7bf695c599bab16d368f25f1c147a27e22b5be76af`

## Baseline verification

| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm test -- --reporter=dot` | PASS: 2,152 tests; 3 skipped |
| `npm run test:smoke -- --reporter=dot` | PASS: 94 tests |
| `npm run build` | PASS |
| `npm run secrets:scan -- --tree` | PASS |
| Focused release routing | PASS: 46 tests; 3 RWA-only skips |
| Focused inclusive routing | 47 pass; 2 added mixed-intent failures |
| Accepted-policy routing gate | Expected FAIL: fingerprint and three upper bands |
| Inclusive routing gate | Expected FAIL: fingerprint and three upper bands |

The first smoke attempt failed inside the filesystem sandbox. Wrangler could not write its log.
It also could not bind `127.0.0.1`. The permitted rerun passed all 94 tests.

The protocol-history diagnostic remains 7 / 7 / 7 for eight positives.
It captures three of four controls. This diagnostic is not an acceptance gate.

## Tracking

The candidate updates these local records:

- `.agents/TODO.md`
- `.agents/rounds/2026-09-16-truth-maintenance/scout-routing-deferrals.md`

They record the three RWA defects, three former `expectedAny` losses, and runtime cost.
They also record this quality repair as pending review.

## Required next gates

1. An independent reviewer must assess all four ranked-list changes.
2. The reviewer must decide the stablecoin strict-label tradeoff.
3. The reviewer must assess the directory witness and freshness reorder.
4. Runtime optimization must integrate without changing the reviewed four-row set.
5. Source integration must preserve the separate Docs and Light attribution.
6. The release must keep RWA excluded.
7. A later reviewed decision may update gate evidence. This candidate does not.
8. Issue #141 must remain open until these gates finish.

No commit, push, deployment, paid evaluation, or external comment occurred in this lane.
