# Protocol-history free evidence — 2026-09-02

## Scope and closure

This record uses local files and deterministic commands only.
It uses no provider, model, network service, or paid operation.
It changes no product, generated artifact, contract, gate, golden, TODO, or NEXT file.

The three-attempt box remains spent and closed.
Attempt three ended with a verified `FAIL`.
This record does not reopen an attempt.
This record does not decide or recommend PH2 or PH3.

## Source verification

The current source pins match the attempt-three brief.

| Source | Verified value |
| --- | --- |
| `inventory/stellar-light.json` | SHA-256 `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0`; `fetchedAt` `2026-08-28T12:50:57.417Z`; Scout `1.9.1` |
| Research `x-routing` object | SHA-256 `468a9d9834e8cb50cb905f80ccc42f9d3daa7a3d0ff2d8c5194d566812ba716b` from `JSON.stringify` |
| `catalog/manifest.json` | SHA-256 `4945c3117d464d7155fe6bc2bd2f2f42638ef83159435ae48a90bab046dc6789` |
| Target description | SHA-256 `80157277b8d9c834b1b3cc5a6aeab8ec89dea5ed2d449b434d8064cd4c798e43`; 176 routing keywords |
| Original contract | SHA-256 `df8218e1b3a5a1526859c4c33d9b565cfd23f38b9c835d22fd93322c8e5c8857` |
| Blind contract | SHA-256 `843aaa70c20eebe29d222a9f7e585a8ab6e722b88396b01c75079008d56446b3` |
| Attempt-two result | Stamp `2026-08-31T23-36-38-660Z-cross-encoder-fit-v1`; SHA-256 `529351b1562b14f68d18ef94b584ca37ae61290f68cfff7a5a1489e8b601ae0d`; `FAIL` |
| Attempt-three result | Stamp `2026-09-01T14-22-28-993Z-clause-support-fit-v1`; SHA-256 `a522bfa28ef4b06146c5f247ba64c08bfd6edaa4a81a0642c4010da2d6de479c`; `FAIL` |
| Shared attempt-two score cache | File `fa1252fc8bfbf62b6f69bb8ca431cf603d2b512e4d0299b2ca0de0d7c2cec0bc`; payload `44c274680cd324d00aa16d240e21d3260005766d507a430e93c423e9c16fcd55`; record `ecea4c6981eb22a59d59b4b9434cad57732309e28504574e7ed483a01512fca1`; 563 queries; 383,273 scores |

The retained attempt-two and attempt-three files match their result stamps.
The attempt-three source fields match the verified score cache.
The cache payload and record hashes also match.

The attempt-one result is absent from both known local result locations.
Those locations are `eval/vectorize/results/` and the retained cache root.
The documented stamp is `2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1`.
Its documented result hash is `17e75f0d1b13848aa2e0841624e8496c558624493d156c3cb2115301a6a9cda0`.
No local file permits verification of that stamp or hash.
This record does not reconstruct its captures.

## Per-control capture matrix

A rank from 1 through 5 is a target capture.
`-` means no target capture in the top five.
`NA` means that the retained attempt-one result is absent.

Attempt-two order is `I/P/G05/G10/G20`.
It means identity, pure-fit, and grids 0.05, 0.10, and 0.20.
Attempt-three order is `I/M/S`.
It means identity, max-clause, and support-fit.

The card-text column is independent of each result rank.
It is a pre-review literal screen, not a label verdict.
The independent review below supersedes this scope reading.
Every control has no exact `notFor` match.
`notFor` only excludes product discovery and GitHub code quality ranking.

| Control | Pre-review card-text signal | Attempt one | Attempt two ranks | Attempt three ranks |
| --- | --- | --- | --- | --- |
| `ph-control-current-protocol` | none | NA | 5/3/5/5/5 | 5/3/2 |
| `ph-control-validator-vote` | none | NA | -/5/-/-/- | -/5/2 |
| `ph-control-soroban-deploy` | `how does X work` | NA | -/-/-/-/- | -/-/- |
| `ph-control-clawback-cap` | `SEP/spec` | NA | -/-/-/-/- | -/-/- |
| `phb-control-protocol-xdr-bug` | none | NA | 5/-/5/5/5 | 5/-/5 |
| `phb-control-contract-fail-after-upgrade` | none | NA | -/-/-/-/- | -/-/5 |
| `phb-control-incident-runbook` | `incidents` | NA | 5/2/5/5/5 | 5/2/3 |
| `phb-control-contract-exploit-review` | `exploits` | NA | 4/-/4/4/4 | 4/-/- |
| `phb-control-sdk-version-history` | none | NA | 4/4/4/4/4 | 4/4/3 |
| `phb-control-cap-history-sep-support` | `SEP/spec` | NA | 1/-/1/1/1 | 1/-/- |
| `phb-control-kyc-breach-report` | `KYC` | NA | 3/3/3/3/3 | 3/3/3 |
| `phb-control-client-protocol-version-failure` | none | NA | -/-/-/-/- | -/-/1 |
| `phb-control-failed-deploy-post-mortem` | `post-mortems` | NA | -/2/-/-/- | -/2/4 |

The result data confirms all capture counts in the earlier closeout.
Attempt two pure-fit captured 2 original and 4 blind controls.
Attempt three support-fit captured 2 original and 7 blind controls.

## Pre-review literal screen

The target card has nine `useWhen` items and two `notFor` items.
This screen compares each control wording with those literal card statements.
It does not infer a new product rule.

Seven controls have a broad literal `useWhen` signal.
No control meets either literal `notFor` statement.
This explains why `notFor` alone cannot separate the frozen controls.
It does not change the frozen control labels.

The strongest literal overlaps are `SEP/spec`, `KYC`, `exploits`, and `post-mortems`.
These overlaps remain a label-scope risk.
They do not establish an owner contract decision.

## Independent label-review reconciliation

Review record: `.agents/rounds/2026-09-02-protocol-history-free-evidence/label-review-grok.md`.
Review SHA-256: `4812b5fc6f59e501222990bd11f5a86a2f4363ddd2b06512fb0e8d55c8fbb3f6`.
Reviewer: Grok, independent and blind to this ledger.
The review leaves every frozen label unchanged.

### Method

The reviewer read only the two frozen contracts, the Scout inventory card, and the target manifest entry.
The reviewer did not read this ledger or another worker report.
The reviewer used no provider, model, network service, or paid operation.
The primary test used `x-routing.useWhen` and `x-routing.notFor`.
The OpenAPI description, `source` filter text, and catalog note supported the test.

For each control, the reviewer asked whether `scout.searchResearch` belongs in the top five.
The reviewer called a control valid when the target does not belong there.
The reviewer called a control disputed when the target does belong there.
The review is a label verdict, not a routing measurement.

### Verdict

**REJECT** the frozen 13-control set as a combined exclude-top-five test.

The four disputed controls are:

- `ph-control-validator-vote`
- `ph-control-clawback-cap`
- `phb-control-sdk-version-history`
- `phb-control-cap-history-sep-support`

The target card assigns the first, second, and fourth asks through `useWhen`.
The same-card `source=release` text assigns SDK release history to the third ask.
Neither `notFor` statement excludes these four asks.

Nine controls remain valid, but each has a leakage risk:

- `ph-control-current-protocol`
- `ph-control-soroban-deploy`
- `phb-control-protocol-xdr-bug`
- `phb-control-contract-fail-after-upgrade`
- `phb-control-incident-runbook`
- `phb-control-contract-exploit-review`
- `phb-control-kyc-breach-report`
- `phb-control-client-protocol-version-failure`
- `phb-control-failed-deploy-post-mortem`

The review keeps all 19 positive labels in scope.
It relabels no positive.
The clawback CAP control is the strongest symmetry break.

The combined 13-control exclude-top-five rule is not a valid ship gate until owner re-adjudication.
This record does not re-adjudicate the labels.
It does not change a contract, a gate, or a product surface.

The three-attempt box remains spent and closed.
The review does not reopen an attempt or decide PH2 or PH3.

## Product-impact count

This count measures exposure only.
It does not measure answer quality or claim a QA score change.

The 76-case inventory includes a battery case when its top-level `surface` contains `scout.searchResearch`.
The sorted ID array hashes to `c88940063e3306f6afa279e9f004a0824fd9de5c674895aa98c09a657008e17a`.
The battery contains 500 files.

The protocol-history QA family includes every explicit `sourceCase` from the original frozen positive contract.
It contains four cases.
Two cases are in the 76-case inventory.
Two cases are outside it.
The union contains 78 unique QA cases.

### Included 76-case inventory

`q-aas-list-token-on-exchanges-aggregators`, `q-aas-trusted-asset-list-whitelist`, `q-anchor-list-builders-discovery`, `q-builder-by-scf-tier`, `q-builder-justin-rice-history`, `q-comp-finclusive-caas`, `q-comp-security-disclosure-programs`, `q-comp-yieldblox-oracle-incident`, `q-crp-custodial-vs-noncustodial-wallets`, `q-crp-oz-rwa-erc3643-trex`, `q-crp-remittance-founder-advisory`, `q-defi-bridge-evm-to-stellar-axelar`, `q-defi-etherfuse-stablebonds`, `q-defi-perps-whitespace`, `q-defi-provide-liquidity-impermanent-loss`, `q-defi-streaming-payments-prior-art`, `q-eco-most-active-defi-projects`, `q-edge-deep-full-history-report`, `q-edge-exhaustive-defi-deep-report`, `q-edge-factcheck-soroswap-first-amm`, `q-edge-fresh-latest-scf-round`, `q-edge-lumenloop-person-entity-empty`, `q-edge-noinfo-exact-tvl-figure`, `q-edge-open-world-recovery-after-narrow-miss`, `q-edge-retail-everyday-use-eli5`, `q-edge-scf-v7-centralization-myths`, `q-edge-strupey-ambiguous-stellar-history`, `q-gap-semantic-directory-fallback`, `q-hist-scp-rewrite-2015`, `q-hist-soroban-launch-protocol20`, `q-hist-unhcr-stellar-aid-assist`, `q-hot-sdf-transparency-wallets-reports`, `q-hot-sdf-xlm-holdings-sales`, `q-org-mazieres-chief-scientist`, `q-org-sdf-enterprise-fund`, `q-org-sdf-mandate-buckets`, `q-org-sdf-structure-mandate`, `q-pay-travel-rule-aid-flows`, `q-scf-academic-research-grant`, `q-scf-ambassador-program`, `q-scf-audit-bank`, `q-scf-build-award-cap`, `q-scf-build-tracks`, `q-scf-current-round`, `q-scf-ecosystem-listing-partner-jobs`, `q-scf-eligibility-criteria`, `q-scf-funding-by-category`, `q-scf-how-to-apply`, `q-scf-hummingbot-kelp-closed-rfp`, `q-scf-instawards`, `q-scf-nqg-voting`, `q-scf-open-rfps`, `q-scf-regional-india`, `q-scf-rfp-tooling`, `q-scf-sdf-bug-bounty`, `q-scf-sdf-marketing-grant`, `q-scf-submission-lifecycle-deadlines`, `q-scf-total-distributed`, `q-scf-v7-changes`, `q-scf-verified-members`, `q-scf-vs-sdf-enterprise-fund`, `q-sep-6-24-deprecation`, `q-sep6-sep24-sep31-choice`, `q-sor-reflector-integration-code`, `q-soroban-auth-recursion-dos-audit`, `q-soroban-instance-storage-dos`, `q-soroban-oracle-defensive-consumption`, `q-soroban-reentrancy`, `q-ti-openzeppelin-relayer`, `q-ti-rpc-gettransactions-pagination-xdr`, `q-token-circle-usdc-on-stellar`, `q-token-initial-supply-distribution`, `q-tool-cli-skills-discovery`, `q-tool-sep41-status-live`, `q-tool-smart-wallet-repos-discovery`, `q-tool-soroban-auth-audit-live`.

### Included protocol-history QA family

| Case | 76-case inventory |
| --- | --- |
| `q-comp-yieldblox-oracle-incident` | included |
| `q-protocol-24-whisk-incident` | outside inventory |
| `q-protocol-version-history-list` | outside inventory |
| `q-soroban-auth-recursion-dos-audit` | included |

This record does not use a QA result for the 78-case union.
The count is therefore a bounded product-exposure count.

## Commands and checks

The work used `git status`, `git rev-parse`, `ls`, `find`, `rg`, `shasum`, and Node local-file checks.
The Node check verified result stamps, result hashes, cache hashes, payload hashes, and record hashes.
`npm run eval:selftest` passed all checks.

## Blockers and unresolved risks

- The attempt-one result JSON is absent. Its control matrix remains unavailable.
- Broad `useWhen` terms overlap several frozen controls. No literal `notFor` term excludes them.
- Four controls are disputed by the independent review. The combined control rule cannot ship as a gate.
- Nine valid controls retain keyword and card-text leakage risks.
- The two retained result files do not measure QA answer-quality movement.
- The closure remains valid despite the missing attempt-one retained JSON.

## Outcome

This record completes the permitted free evidence.
The three-attempt closure remains unchanged.
T1 through T4 remain the existing trigger-only paths.

## 2026-09-02 reconciliation after the A/V catalog commit

Commit `d6efe5f` moved `catalog/manifest.json` from `4945c311…6789` to `4cd28f4b…fe8b`.
The target description hash remains `80157277…798e43`, so the label-review inputs still hold.
The capture matrix identity columns are historical for the earlier manifest.
`npm run eval:protocol-history` on the current manifest reads 4/8 original positives and 2/4
original controls. `ph-control-validator-vote` moved from a miss to rank five.
The blind set remains 3/11 positives and 6/9 controls.
`ph-control-validator-vote` is one of the four disputed controls.
The three-attempt box remains spent. This entry changes no label, contract, or gate.
