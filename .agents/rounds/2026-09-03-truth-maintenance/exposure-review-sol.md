# Scout exposure independent review

Date: 2026-09-03

## Verdict

**SHIP ONE: expose `scout.verifyClaim` and keep `scout.getQualityReport` hidden.**

`scout.verifyClaim` changes no routing aggregate in either factorial comparison.
It also routes the supported issued-claim probe at rank one.

`scout.getQualityReport` causes every measured aggregate movement.
It also causes the focused structural test failure.
The operation captures 90 unrelated cases across the complete 544-case routing corpus.

The current committed gate fingerprint still needs separate reconciliation.
That gate issue includes Scout 1.9.23 inventory changes outside these exposure candidates.

## Method and fixed inputs

I read `exposure-implementation-terra.md` and re-derived the routing result.
I made no repository implementation edit.
I used no paid operation.

I copied the current 254-entry manifest to a temporary directory.
I made three variants by removing only the two candidate entries.
All variants therefore use the same Scout 1.9.23 final inventory and all other entries.

The fixed source hashes were:

| Input | SHA-256 |
| --- | --- |
| `inventory/stellar-light.json` | `1bfe9d6ada6518d834a3893bb9df039ed77e1a16499897af6bdcbed878c0fc4f` |
| `catalog/manifest.json` | `39fcb76a4dfaaaa1c39b8e8a16071688d242af6da1600e2e76c1afb38735e63e` |
| `eval/routing-cases.json` | `9e863cedc1f1754f67b3955bfe744254da6ae0d069502aefc7964530493fafd3` |
| `eval/skills-cases.json` | `3ec4d90444489550f9ac9745384a4371cdbd0077dfc77a84597652d02f61ba1f` |
| `eval/holdout-cases.json` | `cb34d83be86f63a0a4ba06977659afa91d0fbaecbeab0e86b82bef9d73c4bbf5` |
| `eval/build-question-overlay.json` | `f48107dc458c9eeaf127fdb6ca9f6ba23a3c3b9039b7f93fbbff0712b7318235` |
| `src/catalog/search.ts` | `cbec29322f6853de5a90a5d6b2ada2ea91fad0693ab1d9d9789c3d8183519c76` |

I ran the unchanged routing runner for each temporary manifest.
Each run used `--manifest` and `--dump-ranked`.
The runner evaluated 338 strict, 122 extended, 23 skills, 49 holdout, and 12 protocol-history cases.

| State | Entries | Candidate entries | Manifest SHA-256 | Local result stamp |
| --- | ---: | --- | --- | --- |
| both exposed | 254 | both | `39fcb76a4dfaaaa1c39b8e8a16071688d242af6da1600e2e76c1afb38735e63e` | `routing-2026-09-03T16-22-40-860Z.json` |
| verify only | 253 | `scout.verifyClaim` | `86f3531844055c0f754a77ad1e2f5b00082e9b032de01636ba65b5d0cb6a8007` | `routing-2026-09-03T16-22-46-471Z.json` |
| quality only | 253 | `scout.getQualityReport` | `02b92b7ca8143b664e1e6e5dd171accc6d3f316af6144b8dc0bb35f95457ea1b` | `routing-2026-09-03T16-22-52-039Z.json` |
| both hidden | 252 | none | `0932fe42893f2ba36bad17e4ef0ecf8e3d255599232d8284626d7e7b9a26aa4f` | `routing-2026-09-03T16-22-57-492Z.json` |

## Four-state results

The table shows exact hit counts.
The card column shows `cardHit5/cardN`.

| State | Strict top 1/3/5 | Strict card | Skills top 1/3/5 | Skills card | Holdout top 1/3/5 | Holdout card | Holdout forbidden/pass | Extended top 1/3/5 | Extended card |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| both exposed | 212/279/312 | 102/182 | 16/22/23 | 23/23 | 10/22/26 | 26/49 | 10/22 | 87/110/113 | 17/28 |
| verify only | 211/277/312 | 103/182 | 16/22/23 | 23/23 | 10/22/26 | 26/49 | 10/22 | 90/109/114 | 17/28 |
| quality only | 212/279/312 | 102/182 | 16/22/23 | 23/23 | 10/22/26 | 26/49 | 10/22 | 87/110/113 | 17/28 |
| both hidden | 211/277/312 | 103/182 | 16/22/23 | 23/23 | 10/22/26 | 26/49 | 10/22 | 90/109/114 | 17/28 |

The both-exposed result equals the quality-only result for every shown measure.
The verify-only result equals the both-hidden result for every shown measure.
The factorial interaction is zero.

## Exact movement attribution

### `scout.verifyClaim`

This operation changes no strict, card, skills, holdout, or extended aggregate.
The result holds for both `hidden → verify-only` and `quality-only → both`.

It changes two top-five memberships without changing a grade:

| Lane | Case | Change |
| --- | --- | --- |
| strict | `q-soroban-zk-bn254-poseidon` | `scout.verifyClaim` enters rank 3 and removes `skills.stellar-dev.cross-chain` from rank 5. |
| holdout | `q-holdout-c-14-aquarius-tweet` | `scout.verifyClaim` enters rank 3 and removes `scout.listContracts` from rank 5. |

Both captures are unrelated to the operation's closed claim types.
The first query asks about cryptographic proof verification.
The second query asks for a general tweet fact-check.

### `scout.getQualityReport`

This operation causes all aggregate movements in both independent comparisons.
The movements are identical for `hidden → quality-only` and `verify-only → both`.

| Lane | Exact case changes | Net movement |
| --- | --- | --- |
| strict | `q-edge-deep-no-budget-limit`: top 1/3/5 fail→pass. `q-edge-fresh-most-recent-news`: top 3 fail→pass. `q-defi-comet-content`: top 5 and card pass→fail. | top 1 `+1`; top 3 `+2`; top 5 `0`; card `-1` |
| skills | No case grade changes. | `0/0/0`; card `0` |
| holdout | No expected rank, grade, forbidden capture, or pass changes. | `0/0/0`; card `0`; forbidden `0`; pass `0` |
| extended | `q-aas-trustline-limit-lifecycle`, `q-pc-muxed-accounts`, and `q-ti-testnet-usdc-faucet`: top 1 pass→fail. `q-edge-scf-v7-centralization-myths`: top 3 fail→pass. `q-edge-exchange-memo-lost-funds`: top 5 pass→fail. | top 1 `-3`; top 3 `+1`; top 5 `-1`; card `0` |

The protocol diagnostic also moves.
`ph-soroban-auth-audit-history` moves `scout.searchResearch` from rank one to rank two.
`scout.getQualityReport` takes rank one.

The strict gains do not show useful quality routing.
`q-edge-deep-no-budget-limit` asks for an exhaustive anchor report.
`q-edge-fresh-most-recent-news` asks for recent ecosystem news.
Neither query asks about Scout's data quality.

## Full-corpus quality capture audit

I inspected every top-five `scout.getQualityReport` capture in all five routing lanes.
No captured query asks about Scout's own data quality, limitations, gaps, or guards.
Therefore, all 90 captures are unrelated.

| Lane | Top 1 | Top 3 | Top 5 |
| --- | ---: | ---: | ---: |
| strict | 3 | 23 | 60 |
| extended | 5 | 13 | 24 |
| skills | 0 | 0 | 1 |
| holdout | 1 | 2 | 4 |
| protocol history | 1 | 1 | 1 |
| total | 10 | 39 | 90 |

The exact captures follow.
Each suffix gives the rank.

### Strict captures

`q-anchor-platform-what@5`, `q-anchor-sdp-what@4`,
`q-asset-establish-trustline-howto@5`, `q-asset-rwa-tokenized-freshness@4`,
`q-asset-sac-functions@5`, `q-asset-sdex-vs-amm@5`, `q-asset-wallet-sdk-seps@4`,
`q-comp-anchor-platform@3`, `q-comp-auth-flags-overview@4`,
`q-comp-sep12-kyc-anchors@2`, `q-defi-agentic-payment-standards-compare@5`,
`q-defi-allbridge-what-is@4`, `q-defi-comet-content@4`, `q-defi-ondo-usdy@5`,
`q-defi-reflector-alternatives@5`, `q-defi-soroswap-content@5`,
`q-defi-x402-on-stellar-what@4`, `q-eco-freighter-wallet@4`,
`q-eco-stellar-rwa-stablecoin-volume@3`, `q-eco-xbull-wallet@2`,
`q-edge-deep-leave-no-stone-unturned-defi@5`, `q-edge-deep-no-budget-limit@1`,
`q-edge-fresh-latest-blend-tvl@2`, `q-edge-fresh-most-recent-news@5`,
`q-edge-noinfo-cap-fake-sharding@4`, `q-edge-noinfo-sep-9999@1`,
`q-hist-remittance-corridors@5`, `q-infra-disbursement-platform@3`,
`q-infra-galexie-what-is@3`, `q-infra-simulate-transaction-howto@3`,
`q-infra-what-is-stellar-rpc@5`, `q-org-sdf-enterprise-fund@2`,
`q-org-sdf-mandate-buckets@5`, `q-pay-moneygram-ramps@2`,
`q-protocol-accounts-signers-thresholds@3`, `q-protocol-base-reserve-min-balance@5`,
`q-protocol-latest-stellar-core-release@5`, `q-protocol-ledger-entry-types@4`,
`q-protocol-max-tx-set-size@3`, `q-protocol-stellar-core-what-is@5`,
`q-scf-ambassador-program@4`, `q-scf-exhaustive-funding-report@3`,
`q-scf-hackathons-dorahacks@5`, `q-scf-instawards@2`,
`q-scf-liquidity-award-amount@4`, `q-scf-verified-members@4`,
`q-scf-vs-sdf-enterprise-fund@4`, `q-sep-1-toml@4`, `q-sep-12-kyc@3`,
`q-sep-31-cross-border@3`, `q-sep-53-sign-verify-message@1`,
`q-sep-8-regulated-assets@4`, `q-sep-clawback-prereq-flag@2`,
`q-sep-interactive-deposit-withdraw@2`, `q-soroban-add-signer-smart-wallet-howto@5`,
`q-soroban-auth-delegation-p27@3`, `q-soroban-contract-build-verification@3`,
`q-soroban-oracle-defensive-consumption@4`, `q-soroban-token-transfer-pattern@5`,
`q-tool-python-sdk@5`.

### Extended captures

`q-aas-claim-received-claimable-balances@4`, `q-aas-sep30-recoverable-wallets@3`,
`q-aas-trustline-limit-lifecycle@1`, `q-crp-anchors-by-corridor@1`,
`q-crp-tokenize-personal-rwa@1`, `q-edge-asset-site-scam-detection@2`,
`q-edge-exchange-memo-lost-funds@5`, `q-edge-scf-v7-centralization-myths@2`,
`q-hot-sdf-transparency-wallets-reports@2`, `q-hot-sdf-xlm-holdings-sales@5`,
`q-pc-account-merge-reclaim-reserve@4`, `q-pc-fee-bump-channel-accounts-feepool@4`,
`q-pc-l2-payment-channels-starlight@4`, `q-pc-muxed-accounts@1`,
`q-scf-nontechnical-participation@3`, `q-sor-msg-sender-equivalent@2`,
`q-sor-native-xlm-sac-address@5`, `q-sor-p23-auto-restore-extendto@2`,
`q-ti-fetch-all-balances-classic-sac@4`, `q-ti-find-export-secret-key@4`,
`q-ti-freighter-localhost-not-detected@4`, `q-ti-provision-wallet-per-user@3`,
`q-ti-testnet-mainnet-migration@4`, `q-ti-testnet-usdc-faucet@1`.

### Skills, holdout, and protocol captures

Skills: `q-skill-assets-stablecoin-issuance@4`.

Holdout: `q-holdout-a-17-audit-registry@1`,
`q-holdout-b-02-asset-metadata-standard@4`,
`q-holdout-b-04-regulated-asset@3`, and `q-holdout-b-10-nextjs-payment@4`.

Protocol history: `ph-soroban-auth-audit-history@1`.

The four focused negative controls do not capture the quality operation.
However, those controls do not represent the full routing corpus.

The manifest explains the wider capture.
Its `keywords` include broad schema terms such as `response`, `issues`, `records`, and `failure`.
They also include `verified`, `flow`, `links`, `rows`, `field`, and `evidence`.
The `notFor` text does not become a negative scoring rule.
The scorer therefore rewards common output-schema words despite the source-specific description.

## Verification-intent audit

The full corpus contains no direct issued claim with one subject and issuer.
The only issued positive is the added focused query, not a compiled routing case.

Five compiled questions contain a direct supported `live` or `maintained` sub-intent.
`scout.verifyClaim` is absent from the first 50 results for all five questions.

| Case | Supported sub-intent | Current top result |
| --- | --- | --- |
| `q-defi-comet-what-is` | Is Comet live? | `skills.lumenloop.stellar-integration-finder` |
| `q-eco-pyusd-stellar-freshness` | Is PYUSD live on Stellar? | `skills.stellar-dev.agentic-payments` |
| `q-defi-market-making-kelp` | Is Kelp maintained? | `scout.searchProjects` |
| `q-pc-l2-payment-channels-starlight` | Is Starlight live? | `stellarDocs.search_asset_token_docs` |
| `q-ti-openzeppelin-relayer` | Is the OpenZeppelin Relayer live? | `scout.searchProjects` |

This miss has a structural contract cause.
The operation description and type enum support `audited`, `live`, `maintained`, and `issued`.
The current `x-routing` purpose and examples still describe only audit claims.
Its `notFor` list sends live questions to project search.
It also sends maintenance questions to `scout.getRepoTrust`.

The focused and natural probes produced these results:

| Query | `scout.verifyClaim` rank |
| --- | ---: |
| `Verify an issued stablecoin claim` | 1 |
| `Is EURC issued by Circle?` | 2 |
| `Is Blend audited?` | 2 |
| `Was Soroswap audited by OtterSec?` | 1 |
| `Is Kelp maintained?` | 3 |
| `Is Comet live?` | absent from top 5 |

The focused positive proves a keyword route.
It does not contain the subject required for an executable issued verification.
The natural EURC claim still places the operation at rank two.

These misses reduce recall, but they do not create a measured regression.
The natural audit and issued probes show immediate usable value.
The exposure can ship while the upstream routing contract receives separate correction.

## Structural wider-candidates failure

The failing assertion is not a `widerCandidates` projection defect.
It tests the backfill tier inside the same structural test group.

The query is:

`What functions does the Stellar Asset Contract expose, and which are restricted to the asset issuer/admin?`

With both candidates hidden, four entries pass the gated scorer.
The short page activates the ungated backfill pass.
`stellarDocs.search_asset_token_docs` scores 495 and enters rank two as `backfill`.

With `scout.getQualityReport` exposed, it scores 206 as the fifth gated entry.
The five-entry gated page prevents the backfill pass.
`stellarDocs.search_docs` becomes rank two as `gated` with score 306.

| State | Rank-one tier/id/score | Rank-two tier/id/score | Gated page entries before backfill |
| --- | --- | --- | ---: |
| both exposed | gated / `stellarDocs.search_doc_titles` / 316 | gated / `stellarDocs.search_docs` / 306 | 5 |
| verify only | gated / `stellarDocs.search_doc_titles` / 316 | backfill / `stellarDocs.search_asset_token_docs` / 495 | 4 |
| quality only | gated / `stellarDocs.search_doc_titles` / 316 | gated / `stellarDocs.search_docs` / 306 | 5 |
| both hidden | gated / `stellarDocs.search_doc_titles` / 316 | backfill / `stellarDocs.search_asset_token_docs` / 495 | 4 |

The temporary-manifest probe isolates the failure to `scout.getQualityReport`.
`scout.verifyClaim` does not score for this query.

The focused test command returned one failure and 77 skipped tests:

`./node_modules/.bin/vitest run test/search.test.ts -t "reports an absolute gap with tier context when gated order leads a higher score"`

The assertion at `test/search.test.ts:298` expected `backfill` and received `gated`.

## Final recommendation

**SHIP ONE: `scout.verifyClaim`.**

Keep `scout.getQualityReport` hidden.
Its source-specific prose does not control its broad schema-keyword captures.
It harms extended coverage and causes the focused structural failure.

`scout.verifyClaim` has no aggregate routing cost in this fixed-inventory comparison.
It routes natural audit and issued claims within the first two results.
Its live-claim recall and two unrelated captures remain documented follow-up risks.

Do not use this review to approve a routing baseline.
The remaining Scout 1.9.23 inventory movement needs its own accepted gate decision.
