# Scout 1.9.49 candidate review — Terra high — 2026-09-09

## Scope and boundary

This is an independent, read-only review against `b6913d1`.
It inspected the candidate working tree and both supplied routing receipts.
No paid call, external write, rebaseline, source edit, golden edit, or catalog edit occurred.
This report and the receipt-time correction in the prior Terra report are the only writes.

## Verdict

**Do not accept the candidate.**

This is an operation-surface and routing-relevant drift.
It is not a mechanical Scout `1.9.49` bump.
The candidate automatically exposes `scout.getRwaAssets` without a documented acceptance decision.
It also changes 29 existing operation objects and nine shared schemas.

The candidate loses legacy, extended, and skills routing grades.
It introduces 61 `scout.getRwaAssets` top-five captures.
Several captures displace Docs or Lumenloop on unrelated implementation questions.
The frozen protocol-history lane gets a third control capture.

The concrete blocker is the existing general scoring-repair gate in `.agents/TODO.md`.
It requires an RWA query to reach the operation.
It also forbids Friendbot, RPC, WASM, simulation, and balance captures.
The candidate fails that condition.

Do not rebaseline `eval/gates.json`.
The candidate receipt itself fails its fingerprint gate.
Its worse grade totals also make rebaselining unsupported.

## Candidate identity and artifact changes

| Artifact | `b6913d1` SHA-256 | Candidate SHA-256 |
|---|---|---|
| `inventory/stellar-light.json` | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` | `ba32c7f94e17f16fdfc8fbe9f47295b5edc4c74fab8f27c8e65c95d269e910bb` |
| `catalog/manifest.json` | `83d9998f984cae38c363524e0592c6d035e80ba09cc27003f7a65e11bb0350f9` | `dd55dea7f5e00047d467644c51a5905416926d387e579405b097655d18e34a63` |
| `specs/super-spec.json` | `c52898bbcbe0ed2e790dcc602a4d91d42efd235a571b305a62eca7045d860e01` | `308738154c6949b5c5912874a3645ce7c2318488fb4af8c03ce2e1c6a105ae1d` |
| `eval/plan/op-classes.json` | `4cda9783f098c9e55cfb399ad3d1c77ced8acf3f81f37d6170b1d82048b196bb` | `0f3b603263daf74e35e0bf0baa5ae8522aa602b764b606ff50c1d2380f0d47eb` |

The inventory moves from OpenAPI `1.9.1` to `1.9.49`.
Its `fetchedAt` moves from `2026-08-28T12:50:57.417Z` to `2026-09-09T18:17:24.796Z`.
The upstream operation count moves from 37 to 38.
The manifest moves from 253 to 254 entries.
The exposed Scout operation count moves from 30 to 31.
The full exposed service-operation count moves from 60 to 61.

## Exposure policy and runner intersection

The only added path-method pair is `GET /api/rwa`.
Its operation ID is `getRwaAssets`.
The generated manifest exposes it as `scout.getRwaAssets`.
The generated spec exposes `/scout/getRwaAssets`.
The generated operation class is `detail`.

`src/policy/scout-exposure.ts` does not exclude `GET /api/rwa`.
The unchanged exclusions remain `POST /api/feedback`, `GET /api/feedback`, three partner writes, `GET /api/quality`, and `GET /api/verify`.
Therefore the candidate makes a new model-callable surface by default.

The RWA operation is read-only by its upstream `GET` contract.
That does not decide exposure policy.
It supplies financial-asset discovery, issuer, holder, supply, controls, and verification data.
It needs an explicit exposure or exclusion decision with its routing evidence.

`RUNNERS` declares only Lumenloop operation IDs.
Its declared operations do not intersect `getRwaAssets` or any 29 changed Scout operations.
No runner smoke follows from this candidate alone.

## Whole-contract diff

The Scout path-method set adds one operation and removes none.
Twenty-nine existing operations change.
Twenty-two change responses.
Seventeen change `x-routing`.
Four change parameters.
Six change descriptions.
One changes its summary.
One changes its request body.

| Change kind | Operations |
|---|---|
| Added | `getRwaAssets` |
| Description or summary | `getLeaderboard`, `getPartners`, `searchProjects`, `getQualityReport`, `explainRepo`, `getRfps` |
| Parameters | `listContracts`, `getLeaderboard`, `getPartners`, `searchProjects` |
| Request body | `submitPartnerListing` |
| Response and other contract fields | `analyzeEcosystem`, `listAudits`, `getBuilders`, `getChangelog`, `getChanges`, `getFeedbackSchema`, `hackathonBrief`, `searchHackathonBuilds`, `compareHackathons`, `getLeaderboard`, `partnerAssistant`, `matchPartners`, `partnerOnboard`, `getPartner`, `getQualityReport`, `explainRepo`, `getRepoTrust`, `getRfps`, `scfPitch`, `getSkill`, `verifyClaim`, `vetIdea` |

The inventory changes nine component schemas.
They are `Builder`, `HackathonDetailResponse`, `LeaderboardProject`, `Meta`, `Partner`, `PartnersResponse`, `Project`, `Repo`, and `Stablecoin`.
`Project` adds `deployment` and `productsCoverage`.
`Repo` adds `deprecatedAt`, `kind`, `kindBasis`, `supersededBy`, `supersessionKind`, `tierChangedAt`, and `tierReason`.
`Stablecoin` adds `logoSource` and `logoUrl`.

The generated super-spec moves from 64 to 65 paths.
Its component count remains two because Scout response schemas are inlined.
The micro-map still routes asset and anchor coverage to stablecoins, partners, directory, Docs, and asset skills.
It does not add a distinct RWA workflow.

## Golden, eval, and documentation impact

No candidate diff changes `eval/corpus/**`, routing cases, skills cases, holdout cases, or `eval/gates.json`.
No golden answer or expected routing label therefore moved.
The current test corpus has no `getRwaAssets` expectation.

The candidate changes `eval/plan/op-classes.json` only by adding `scout.getRwaAssets: detail`.
It also changes three QA-instrument files from 60 to 61 operations.
Those files are `eval/qa/README.md`, `eval/qa/plain-operation-harness.mjs`, and `eval/qa/run-qa.mjs`.
They are not generated inventory artifacts.
They need separate scope and review before any acceptance.

The candidate also changes the generated catalog, super-spec, micro-map, and test expectations.
Those changes reflect the wider upstream contract drift.
They do not establish that the new exposure is safe.

## Stellar Scout skill pin review

The candidate changes the `stellar-light` source commit from `d25b9f6bd842159b5a33aa6125ecb62373c2d8b5` to `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`.
The source commit dates are `2026-08-28T02:07:13Z` and `2026-09-08T00:38:50Z`.
I read both changed bodies at both pinned commits.

| File | Old git blob / SHA-256 | New git blob / SHA-256 | Result |
|---|---|---|---|
| `SKILL.md` | `54f214d228b665bd1f0579ed79dd39226dd9621e` / `fa73296b22afcf5398f0a94775c2609df43ab0f1aff15e729b923e61caa3669a` | `de459e784e9e927f42662aa53ab22c8dedab04b7` / `9f8a107a85b8796b18d6c7803cd14d9af16e66ff288726b551267bd66811b36c` | Both recorded hashes match the fetched bodies. |
| `references/api-reference.md` | `14f9c9c817ff853089e42333e35a7d60ca7a258a` / `9221a08fec8bcb4a7c417025b3b5f46bab1a5093b1fee228604b678aa2ea8359` | `5035cc98f1e0a7339ab9837e2dee19e7da0616cb` / `5e17ecaaa7f875f8d87170ba16a70c74c221a1dfc717f159e6594043ab7200cf` | Both recorded hashes match the fetched bodies. |

`README.md` and `references/examples.md` retain their old blob hashes.

The `SKILL.md` changes are narrow.
They state that an open RFP may not have an open submission window.
They expand repository-ranking provenance.
These are safety and accuracy improvements.
They add no side-effecting workflow.

The API reference adds correct uncertainty guidance for unknown hackathon submissions.
It distinguishes stored repository rows from curated search rows.
It documents the new partner filter behavior.
It adds `GET /api/rwa` and says `issued-single-holder` is not a live market.

The RWA description remains a routing hazard.
It contains broad asset, contract, issuer, supply, holder, controls, and verification terms.
Those terms capture unrelated implementation queries in the routing receipts.
The skill pin is hash-valid, but hash validity does not approve its new callable operation.

## Routing receipts

The baseline receipt is `routing-2026-09-09T16-44-14-655Z.json`.
It ran at `2026-09-09T16:44:14.656Z` on manifest `83d9998f`.
The candidate receipt is `routing-2026-09-09T18-24-30-719Z.json`.
It ran at `2026-09-09T18:24:30.719Z` on manifest `dd55dea7`.

Both receipts fail only their manifest-fingerprint gate.
The candidate must not use that fingerprint failure to conceal its routing losses.

| Lane | Baseline | Candidate | Change |
|---|---|---|---|
| Legacy top-1 / top-3 / top-5 | 213 / 279 / 312 | 211 / 277 / 311 | -2 / -2 / -1 |
| Legacy card hits | 95 | 103 | +8, but with lost expected routing rows |
| Extended strict top-1 / top-3 / top-5 | 90 / 110 / 116 | 88 / 109 / 114 | -2 / -1 / -2 |
| Skills top-1 / top-3 / top-5 | 16 / 23 / 23 | 16 / 22 / 23 | 0 / -1 / 0 |
| Holdout top-1 / top-3 / top-5 | 10 / 22 / 26 | 11 / 23 / 27 | +1 / +1 / +1 |
| Holdout forbidden captures / passed | 11 / 21 | 10 / 23 | -1 / +2 |
| Protocol-history positives top-1 | 4 of 8 | 7 of 8 | +3 |
| Protocol-history controls captured in top five | 2 of 4 | 3 of 4 | +1 |

The legacy lane has 139 changed result rows.
One hundred nine change the top-five membership or order.
Thirty change scores only.
The extended lane has 41 changed rows, the skills lane has 10, and the holdout lane has 21.

### Grade regressions by case

| Lane | Case | Regression |
|---|---|---|
| Legacy | `q-comp-yieldblox-oracle-incident` | Scout top-1 becomes false. |
| Legacy | `q-defi-rwa-overview` | Lumenloop top-3 becomes false after RWA ranks first. |
| Legacy | `q-defi-rwa-scf-similar` | Lumenloop top-3 and card hit become false after RWA ranks first. |
| Legacy | `q-eco-2025-defi-launches` | Lumenloop top-5 and card hit become false. |
| Legacy | `q-protocol-24-whisk-incident` | Docs top-1, top-3, and top-5 become false. `scout.searchResearch` ranks first. |
| Legacy | `q-protocol-network-passphrases-list` | Docs top-3 becomes false. |
| Legacy | `q-protocol-parallel-execution` | Docs top-3 becomes false. |
| Legacy | `q-protocol-version-history-list` | Docs top-1 becomes false. `scout.searchResearch` ranks first. |
| Legacy | `q-soroban-reentrancy` | A card hit becomes false. |
| Legacy | `q-soroban-sac-balance-storage` | Docs top-1 becomes false after RWA ranks first. |
| Extended | `q-aas-issuer-fees-supply-cap-freeze` | Docs top-1 becomes false after RWA ranks first. |
| Extended | `q-defi-build-staking-for-own-token` | Docs top-3 and top-5 become false. |
| Extended | `q-pc-account-merge-reclaim-reserve` | Docs top-5 becomes false. |
| Extended | `q-ti-fetch-all-balances-classic-sac` | Docs top-1 becomes false after RWA ranks first. |
| Skills | `q-skill-soroban-first-contract` | Skills top-3 becomes false. |

### New RWA captures by case

The candidate places `scout.getRwaAssets` in 61 top-five lists.
The rank follows each case ID.

- Legacy, 39: `q-asset-clawback-decentralization@1`, `q-asset-deploy-sac-cli@3`, `q-asset-issue-asset-howto@1`, `q-asset-rwa-tokenized-freshness@3`, `q-asset-sac-functions@4`, `q-asset-trustline-vs-sac@3`, `q-asset-two-account-issuer@5`, `q-builder-by-scf-tier@5`, `q-comp-auth-flags-overview@3`, `q-comp-sac-inherits-flags@3`, `q-comp-sep8-number-lookup-no-deepresearch@5`, `q-comp-sep8-regulated-assets-approval-server@2`, `q-defi-benji-franklin-templeton@3`, `q-defi-blend-repo@4`, `q-defi-rwa-overview@1`, `q-defi-rwa-scf-similar@1`, `q-defi-soroswap-content@5`, `q-defi-wisdomtree-crdt@4`, `q-eco-2025-defi-launches@3`, `q-eco-stellar-rwa-stablecoin-volume@1`, `q-edge-deep-comprehensive-sep-audit@5`, `q-hist-franklin-templeton-benji@1`, `q-hist-remittance-corridors@5`, `q-infra-friendbot-fund-testnet@4`, `q-infra-hubble-vs-rpc-layer@4`, `q-infra-query-contract-events-rpc-howto@5`, `q-infra-simulate-transaction-howto@3`, `q-infra-what-is-stellar-rpc@2`, `q-rwa-projects-tokenizing-stellar@5`, `q-scf-academic-research-grant@2`, `q-sep-8-regulated-assets@3`, `q-sep-clawback-prereq-flag@5`, `q-soroban-add-signer-smart-wallet-howto@3`, `q-soroban-reentrancy@5`, `q-soroban-sac-balance-storage@1`, `q-soroban-sac-what-is@3`, `q-soroban-simulate-resource-fee@4`, `q-soroban-wasm-size-limit@1`, `q-tool-python-sdk@4`.
- Extended, 11: `q-aas-burn-clawback-redemption-mechanics@4`, `q-aas-issuer-fees-supply-cap-freeze@1`, `q-crp-tokenize-personal-rwa@1`, `q-sor-classic-dex-from-contract@5`, `q-sor-contract-as-claimable-arbiter@4`, `q-sor-contract-trustlines-c-address@3`, `q-sor-recurring-escrow-patterns@5`, `q-sor-sac-introspection@3`, `q-ti-enumerate-all-contracts@5`, `q-ti-fetch-all-balances-classic-sac@1`, `q-ti-historical-pointintime-balances@4`.
- Skills, 2: `q-skill-assets-stablecoin-issuance@4`, `q-skill-eco-scout-rwa-landscape@4`.
- Holdout, 9: `q-holdout-a-09-oz-pausable-ownable@4`, `q-holdout-a-13-zk-replay@2`, `q-holdout-a-15-resource-profiling@2`, `q-holdout-b-01-sep-asset-metadata@1`, `q-holdout-b-02-asset-metadata-standard@1`, `q-holdout-b-03-clawback-stablecoin@4`, `q-holdout-b-04-regulated-asset@2`, `q-holdout-b-05-classic-or-sep41@3`, `q-holdout-b-06-sac-or-sep41@3`.

The strongest harmful RWA captures are not RWA lookup questions.
They are `q-asset-issue-asset-howto@1`, `q-soroban-sac-balance-storage@1`, `q-soroban-wasm-size-limit@1`, `q-ti-fetch-all-balances-classic-sac@1`, and `q-infra-what-is-stellar-rpc@2`.
They require Docs or skills, not a curated RWA registry.

### Current-protocol and history captures

`scout.searchResearch` moves into three protocol-history controls.
`ph-control-current-protocol` moves from rank 5 to rank 3.
`ph-control-validator-vote` moves from rank 5 to rank 3.
`ph-control-clawback-cap` moves from absent to rank 5.

The candidate improves three history positives to rank 1.
It also moves `q-protocol-24-whisk-incident` and `q-protocol-version-history-list` away from the required Docs route.
The frozen protocol-history contract remains failed.
This is a harmful trade, not an acceptance result.

## Required owner decisions

1. Keep `GET /api/rwa` excluded until the existing general scoring repair passes all eleven acceptance checks.
2. Do not change routing baselines or frozen protocol-history labels.
3. Separate non-generated QA harness edits from generated Scout drift output.
4. Re-run the routing, holdout, skills, extended, and protocol-history gates after a general scoring repair.
5. Reconsider `scout.getRwaAssets` exposure only after the unrelated captures disappear.
