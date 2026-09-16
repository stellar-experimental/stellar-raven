# Independent Scout combined review

Reviewer: Grok high (Grok 4.6). Distinct from Sol author.
Clock: `2026-09-16T21:47:38Z`.
Mode: read-only. **No mutations, paid calls, or publication.**

## Correction note (prior writes)

The 21:28:58 write used `21:27:36`, which is the **code-only** ablation against PR157 catalog `0cff03fd…`. It is **not** source-acceptance evidence. Later notes wrongly mixed that ablation with RWA exclusion as a reject of check 8. Those writes stay historical only.

This file now uses the **corrected freeze**: tracked diff `444dc190ba46be36c24bd233a4424375dd76ba9d158e46922e6b072ea22e768f`, RWA-inclusive result `21:42:48`, manifest `79a2c663…`. Protocol-history is a source-expired diagnostic and is **not** a required PASS.

**This is still not final source/gate acceptance.** Nineteen unit failures remain unclassified in a missing `scout-test-contract-review.md`; freeze inventory is used until that file exists. Conditional decision below.

## Frozen identity (independently hashed)

| Item | SHA-256 / value |
|---|---|
| Tracked diff vs `bb37bc50` | `444dc190ba46be36c24bd233a4424375dd76ba9d158e46922e6b072ea22e768f` |
| Accepted-policy catalog (RWA excluded) | `bc91f286b8c750a7c551253a84840d2c8e2634fb9e86db939f93b1eb13a5d361` |
| RWA-inclusive catalog | `79a2c66308c9daf7458063eff2068987022b42c71ea08326bb3c8d65d81c19ba` |
| Result `routing-2026-09-16T21-42-48-623Z.json` | `b867e0e2d7d2949cf8b281ff2ff40f1ad84c69153bbd28ad9ec6babb5e6af39d` |
| Movements vs accepted `20:37:40` | `50508782362ede69a18c30d59fe0dbe996786c7b115d74ad9f9906f350a02c72` (`scout-reviewer-all-movements.json`) |
| `scripts/description-notes.mjs` | host override present (`Escrow-as-a-service integration…`) |
| `scripts/build-catalog.mjs` | `skillDescription` + `assertSkillDescriptionOverrideIdsResolve` present |

Accepted main `bb37bc50` already ships that host override. Experimental drop of the builder call was **experimental-only**. Restoration is confirmed on this freeze.

RWA-inclusive `21:42:48` totals (match parent): legacy **217/295/326**, extended **92/111/117**, skills **17/23/23**, holdout **12/27/29**, forbidden **9**, passed **25**.

## Ordered-ID movements (544)

Independent count from reviewer JSON vs accepted `20:37:40`: **345** identity changes (229 legacy + 61 extended + 13 skills + 31 holdout + 11 protocol-history). Parent said 346; this packet has 345. Grades use `expectedService` plus `top1`/`top3`/`top5`/`cardHit5`/`pass` pairs. No empty expected-op arrays.

Holdout: **0** `pass` regressions; 4 pass improvements; forbidden 11→9.

Legacy `top1` `[True,False]` (expected service → new top):

| Case | expectedService | Accepted top | Candidate top |
|---|---|---|---|
| `q-builder-by-scf-tier` | scout | `scout.getBuilders` | `lumenloop.find_similar_scf_submissions` |
| `q-comp-yieldblox-oracle-incident` | scout | `scout.searchResearch` | `stellarDocs.search_docs_in_category` (research still rank 2) |
| `q-eco-defi-projects-discovery` | scout | `scout.searchProjects` | `skills.lumenloop.stellar-integration-finder` |
| `q-eco-dex-saturation` | scout | `scout.compareHackathons` | `skills.lumenloop.stellar-ecosystem-digest` |
| `q-protocol-24-whisk-incident` | stellarDocs | `stellarDocs.search_protocol_concepts_docs` | `scout.searchResearch` |
| `q-protocol-version-history-list` | stellarDocs | `stellarDocs.search_protocol_concepts_docs` | `scout.searchResearch` |
| `q-scf-nqg-voting` | scout | `scout.searchResearch` | `skills.lumenloop.scf-submission-radar` |
| `q-soroban-instance-storage-dos` | scout | `scout.searchResearch` | `stellarDocs.search_docs_in_category` |
| `q-aas-issuer-fees-supply-cap-freeze` (extended) | stellarDocs | `stellarDocs.search_doc_titles` | `scout.getRwaAssets` |

Meaningful service-grade losses: builder roster, DeFi directory, NQG voting, instance-storage DoS (Scout research → Docs). Protocol-history Docs→Scout follows a newer history contract; still a **stellarDocs** expectedService regression. Extended issuer-fee flags captured by RWA is a mixed protocol/RWA leak **if** RWA is exposed.

YieldBlox remains in top five (check 1). Top5-all-miss: `q-soroban-instance-storage-dos` (scout expected, no Scout in top 5), `q-token-circle-usdc-on-stellar`, `q-defi-bridge-evm-to-stellar-axelar`.

## Eleven original checks (RWA-inclusive catalog, independent probes)

| # | Independent result |
|---|---|
| 1 | PASS — YieldBlox keeps `scout.searchResearch` rank 2 |
| 2 | PASS — `through`/`network`/`each`/`walk through` omit `searchResearch` |
| 3 | PASS — `contract` omits `explainRepo`; repo wording ranks it 1 |
| 4 | PASS — account-merge has `search_docs_in_category`; no `hackathonBrief` |
| 5 | PASS (author freeze; prefix ratio 4 / 0.75) — not re-derived here beyond freeze tests |
| 6 | PASS — staking query still contains `search_asset_token_docs` in top 5 |
| 7 | PASS — eight-row family holds on focused tests per freeze; YieldBlox/merge sampled |
| 8 | **PASS on original contract** — four directory positives hit `getRwaAssets` (ranks 1,2,1,1). Eight technical/issuance negatives omit it (Friendbot, RPC, WASM, simulate, balances, issue custom asset, tokenization contract, walk-through issue). |
| 9 | PASS — leaderboard rank 3; RFP rank 3 |
| 10 | **Directionally improved** vs 213/279/312, 90/110/116, 16/23/23, 10/22/26. Gate still fails ±3 **upper** band. See baseline decision. |
| 11 | PASS — category query includes `get_categories` rank 4 |

Protocol-history diagnostic remains failed/expired. **Not required.**

## Numeric baseline

Improvements are real: +4/+16/+14 legacy vs recorded 213/279/312; extended 92/111/117 vs 90/110/116; skills 17 vs 16; holdout 12/27/29 vs 10/22/26; forbidden 11→9.

**They warrant an explicit `acceptedTotals` raise if this scoring change is accepted.** They do **not** require lowering hits back into the old ±3 band. They do **not** auto-pass the gate: `eval/gates.json` is unchanged and currently fails. Raising totals is a separate reviewed metadata edit after unit-test reconciliation.

## Mixed-subject implementation captures (not check 8)

Independent ranks on `79a2c663…`:

| Query | `getRwaAssets` rank | Lead |
|---|---|---|
| Simulate a transfer of a tokenized bond through Stellar RPC. | **3** | Docs RPC |
| How do I read a wallet balance for tokenized treasury assets? | **2** | Docs assets |
| Which assets does Ondo have on Stellar? | 4 | Docs (not a check-8 negative) |
| Write a Soroban contract for a real estate token. | absent | Docs/OZ |

**Not blocking original check 8.** They combine implementation verbs with RWA nouns. **They do block shipping `scout.getRwaAssets` as accepted surface** until those two mixed queries drop RWA from top 5 **or** an owner records the residual as accepted extra controls. Do not add them to check 8. Do not drop them from extra tests.

Author freeze still says keep `GET /api/rwa` excluded on the policy candidate. That is consistent with mixed-intent remaining.

## Nineteen unit failures

`scout-test-contract-review.md` was not in the packet. Freeze list (1–19) plus `scout-unit-results-final.json`:

- Fixture/contract likely: phrase-cap, routing blend/rescue, example totals, x-routing counts, compacted-operation set, tier membership/`total`, host/docs snapshots (items 1–6, 15–19).
- Behavior review likely: routing-quality name ranking, leaderboard intent, slot replacement, Scout-only/exact-id equality, source-drift control (items 7–14).

**Do not conclude final acceptance** until those 19 are individually fixture-update vs behavior-fix. Conditional:

| Track | Condition |
|---|---|
| Scoring + 1.9.52 inventory, RWA still excluded | Allowed only after (a) fixture updates for intentional contracts, (b) behavior fixes or accepted residuals for routing-quality failures, (c) reviewed `acceptedTotals` raise, (d) remaining Scout expectedService top-1 losses (`getBuilders`, `searchProjects`, NQG) either fixed or owner-accepted. |
| Expose `GET /api/rwa` | Original check 8 already passes. Mixed RPC/balance captures must be fixed or explicitly accepted as extra controls. Issuer-fee extended case must not silently become an RWA hit. |
| Light pin `3b587aa9` | Still separate source-content + filter pairing. Not granted here. |

## Decision (conditional, not final)

**No source, count, or gate acceptance.**

Eleven original checks pass on the RWA-inclusive **measurement** catalog, including check 8. Numeric gains support a **later** baseline raise, not a silent gate edit. Mixed-intent RWA hits are a **shipping** residual for `getRwaAssets`, not a check-8 failure. Nineteen unit failures block merge until classified and reconciled. Protocol-history is ignored as an acceptance gate.
