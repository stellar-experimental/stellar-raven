# Coverage matrix

Generated 2026-11-14 by the `coverage` lane from `map/taxonomy.json`, `audit/*.json` and `verify/*.json`. `coverage.json` is the source; this file is the review view.

## Result

| | Cases |
|---|---|
| Battery before (501 active, 6 proposals) | 507 |
| Survive the audit and verification (keep or tighten) | 305 |
| Proposed surplus cuts in this lane | 94 |
| **Headline after cuts** | **211** |
| New cases to write (open slots) | 35 |
| **Headline after gap research** | **246** |
| Tool lane kept (of 18 moved, plus one rescued merge) | 7 |
| Merged | 89 |
| Retired | 200 |

The taxonomy asks for 249 cases on 167 leaves. 211 kept + 35 slots + 13 waived slots − 10 leaves kept one over target = 249.

143 leaves have at least one kept case. 24 have none: 21 get a slot and 3 are waived (a kept case on another leaf tests the facet).

Reading the tables: **Kept** and **Cut** are surviving cases whose primary leaf this is. A cut is a proposal; `extraCuts` in the JSON gives the reason and, for a merge, the survivor and the one fact it absorbs. **Open** lists facets that need a new case (`slot`) or that a kept case elsewhere already tests (`waived: case`). Case ids drop the `q-` prefix here.

## Ledger fundamentals: accounts, transactions, and fees (`protocol`)

23 target, 22 kept, 7 cut, 0 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `accounts-reserves` | 3 | 3 | raph-low-xlm-transfer-fail<br>pc-account-activation-not-found<br>protocol-base-reserve-min-balance | edge-1xlm-activation-fee |  |
| `account-merge` | 2 | 1 | pc-account-merge-reclaim-reserve |  |  |
| `operations-transactions` | 2 | 1 | protocol-operation-types-list |  |  |
| `sequence-numbers` | 3 | 2 | pc-sequence-numbers-ordering-replace |  | waived: pc-sequence-numbers-ordering-replace, ti-channel-accounts-throughput |
| `timebounds-preconditions` | 2 | 1 | protocol-19-preconditions-cap-0021 |  |  |
| `signatures-multisig` | 2 | 1 | protocol-accounts-signers-thresholds |  |  |
| `tx-lifecycle-finality` (+1) | 2 | 2 | edge-validators-reverse-tx-fork-detection<br>pc-tx-finality-failure-semantics<br>protocol-ledger-close-time |  |  |
| `fees-surge` | 3 | 2 | pc-practical-fee-setting |  | waived: pc-practical-fee-setting |
| `fee-bump-sponsorship` | 2 | 2 | pc-fee-bump-channel-accounts-feepool<br>pc-sponsored-reserves |  |  |
| `networks-passphrases` | 3 | 2 | protocol-network-passphrases-list<br>infra-testnet-vs-futurenet | infra-testnet-reset-schedule-recovery<br>ti-friendbot-ratelimit-alternatives |  |
| `memos-muxed` | 3 | 2 | pc-memos-reference<br>pc-muxed-accounts |  |  |
| `claimable-balances` | 2 | 1 | aas-claimable-predicates-expiry-reserves | aas-claim-received-claimable-balances<br>raph-claimable-balance-safety |  |
| `xdr` | 2 | 1 | ti-parse-raw-ledger-data |  |  |
| `address-types` | 2 | 1 | pc-address-types-strkey |  |  |
| `keys-recovery-phrases` | 2 | 1 | ti-secret-key-vs-mnemonic-derivation | raph-restore-wallet<br>ti-find-export-secret-key |  |

- `protocol.tx-lifecycle-finality`: One over target: Facet 2 names both ledger close time (q-protocol-ledger-close-time) and irreversibility (q-edge-validators-reverse-tx-fork-detection); facet 1 is q-pc-tx-finality-failure-semantics.
- `protocol.memos-muxed`: Facet 2 (the SEP-29 memo-required check) is untested: both kept cases cover facet 1. Add one SEP-29 key fact to q-pc-memos-reference when it is next edited, with evidence.

## Consensus, validators, and protocol upgrades (`network`)

20 target, 14 kept, 4 cut, 5 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `scp-consensus` | 2 | 2 | protocol-quorum-slice-vs-quorum<br>protocol-scp-consensus-algorithm |  |  |
| `running-a-node` | 2 | 2 | protocol-validator-node-roles |  | slot: the incentive to run a validator |
| `node-operations` | 1 | 1 | ti-self-host-retention-backfill |  |  |
| `tier1-quorum` | 2 | 2 | protocol-tier1-requirements |  | slot: who validates today and where the roster is published |
| `upgrade-process` | 2 | 1 | none |  | waived: pc-protocol-upgrade-timing |
| `cap-process-status` | 2 | 2 | pc-protocol-27-zipper<br>protocol-cap-process | protocol-parallel-execution |  |
| `limits-settings` | 3 | 2 | pc-slp-0004-0006-status<br>protocol-max-tx-set-size |  |  |
| `current-protocol` | 3 | 2 | edge-fresh-latest-protocol-version<br>pc-protocol-upgrade-timing |  |  |
| `protocol-history` | 2 | 2 | hist-soroban-launch-protocol20<br>protocol-version-history-list | pc-protocol-26-yardstick<br>protocol-23-whisk-caps<br>protocol-amm-cap-0038 |  |
| `incidents` | 2 | 2 | protocol-24-whisk-incident |  | slot: network halts and how each was resolved |
| `quorum-freeze` | 2 | 1 | none |  | slot: what CAP-77 lets validators freeze and how it is reversed |
| `protocol-meetings` | 1 | 1 | none |  | slot: where meetings are recorded and how to find a decision |

## Assets, tokens, stablecoins, and real-world assets (`assets`)

23 target, 20 kept, 11 cut, 3 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `issuance` | 2 | 2 | aas-issuer-fees-supply-cap-freeze<br>asset-issue-asset-howto |  |  |
| `trustlines` | 3 | 2 | aas-trustline-limit-lifecycle<br>asset-trustline-basics |  |  |
| `issuer-controls` | 3 | 2 | comp-auth-flags-overview<br>comp-clawback-cap0035 | aas-burn-clawback-redemption-mechanics |  |
| `sac` | 3 | 2 | asset-deploy-sac-cli<br>asset-trustline-vs-sac | comp-sac-inherits-flags<br>sor-contract-trustlines-c-address<br>sor-sac-introspection |  |
| `token-interface` | 2 | 2 | sep-41-token-interface<br>edge-ambig-stellar-token-meaning | sor-sep41-transfer-vs-transferfrom |  |
| `asset-info-lists` | 2 | 1 | aas-list-token-on-exchanges-aggregators | aas-trusted-asset-list-whitelist |  |
| `usdc` | 3 | 2 | asset-usdc-eurc-issuer<br>ti-testnet-usdc-faucet |  |  |
| `stablecoin-landscape` | 2 | 2 | eco-pyusd-stellar-freshness<br>eco-stablecoins-on-stellar |  |  |
| `usdt0` | 2 | 1 | none |  | slot: how USDT0 reaches Stellar and what kind of token it is |
| `nft-vault-standards` | 1 | 1 | none |  | slot: how NFTs and tokenized vaults are built and which SEPs define them |
| `rwa-issuers` | 3 | 3 | rwa-projects-tokenizing-stellar<br>defi-benji-franklin-templeton<br>eco-stellar-rwa-stablecoin-volume | defi-etherfuse-stablebonds<br>defi-ondo-usdy<br>defi-wisdomtree-crdt |  |
| `regulated-tokenization` | 2 | 2 | comp-sep8-regulated-assets-approval-server<br>crp-oz-rwa-erc3643-trex | rwa-tokenization-standards<br>rwa-stellar-vs-erc20-regulated |  |
| `public-sector-cbdc` | 1 | 1 | none |  | slot: which public institutions have issued or piloted on Stellar |

## Smart contracts (`soroban`)

29 target, 28 kept, 11 cut, 2 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `overview` | 2 | 2 | sor-classic-dex-from-contract<br>sor-evm-to-soroban-porting |  |  |
| `sdk-dialect-types` (+1) | 2 | 1 | sor-scval-conversion<br>soroban-no-std-constraints | soroban-wasm-size-limit<br>soroban-sdk-macros |  |
| `deploy-lifecycle` | 2 | 2 | soroban-constructor-lifecycle<br>soroban-contract-id-derivation |  |  |
| `storage-types` | 3 | 2 | soroban-instance-storage-dos<br>soroban-storage-types | sor-persistent-unbounded-collection-cap |  |
| `state-archival-ttl` | 3 | 3 | protocol-state-archival-ttl<br>sor-p23-auto-restore-extendto<br>sor-ttl-defaults-extend |  |  |
| `authorization` | 3 | 3 | sor-require-auth-propagation<br>soroban-require-auth<br>soroban-token-transfer-pattern |  |  |
| `contract-accounts` (+1) | 2 | 2 | passkey-smart-account-architecture<br>soroban-check-auth-custom-account<br>tool-passkeykit-smart-wallet | soroban-auth-delegation-p27<br>passkey-platform-constraints |  |
| `resource-fees` | 3 | 2 | soroban-resource-limits |  | slot: rent and refundable versus non-refundable fees |
| `simulation` | 3 | 2 | soroban-simulate-resource-fee |  | waived: soroban-simulate-resource-fee |
| `events` | 2 | 1 | soroban-publish-events |  |  |
| `testing` | 2 | 1 | soroban-unit-testing | sor-test-event-assertion-ordering |  |
| `errors-debugging` | 2 | 2 | sor-decode-hosterror-codes |  | slot: finding why an invocation failed |
| `upgrades` | 2 | 1 | soroban-storage-migration | soroban-oz-upgradeable-macro |  |
| `cross-contract` | 2 | 1 | soroban-cross-contract-call | soroban-factory-pattern |  |
| `crypto-zk` | 2 | 2 | zk-host-functions-status<br>zk-proof-systems-stellar | protocol-bn254-poseidon-xray<br>zk-nullifier-storage<br>zk-poseidon-input-encoding |  |
| `openzeppelin` | 2 | 1 | soroban-oz-token |  |  |
| `metadata-verification` | 1 | 1 | soroban-contract-build-verification |  |  |

- `soroban.sdk-dialect-types`: One over target: Scope names SDK types and conversions (q-sor-scval-conversion) beside the dialect constraints (q-soroban-no-std-constraints).
- `soroban.contract-accounts`: One over target: Facet 2 names passkey wallets (q-passkey-smart-account-architecture) and the kits for them (q-tool-passkeykit-smart-wallet); facet 1 is q-soroban-check-auth-custom-account.

## APIs, data, and indexing (`data`)

18 target, 13 kept, 2 cut, 3 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `rpc-api` | 3 | 2 | infra-rpc-methods-list<br>ti-fetch-all-balances-classic-sac |  |  |
| `horizon-api` | 2 | 1 | ti-enumerate-holders-airdrop |  |  |
| `rpc-vs-horizon` | 3 | 2 | infra-horizon-vs-rpc |  | waived: infra-horizon-vs-rpc |
| `providers` | 2 | 2 | infra-rpc-provider-archive-tier |  | slot: which endpoints SDF hosts and which it does not |
| `result-codes` | 3 | 3 | ti-classic-submission-errors<br>ti-tx-too-late-resubmit |  | waived: ti-classic-submission-errors, ti-channel-accounts-throughput |
| `events-retention` | 2 | 2 | soroban-event-indexing-design<br>ti-rpc-gettransactions-pagination-xdr |  |  |
| `indexers` | 2 | 1 | infra-which-indexer |  |  |
| `galexie-ingest` | 1 | 1 | tool-indexer-repos-discovery |  |  |
| `hubble-analytics` | 2 | 1 | infra-hubble-bigquery | ti-historical-pointintime-balances<br>ti-enumerate-all-contracts |  |
| `explorers-status` | 2 | 2 | jutsu-check-account-history |  | slot: where to check live network and validator health |
| `network-metrics` | 2 | 1 | none |  | slot: where authoritative activity and developer figures come from |

- `data.explorers-status`: q-jutsu-check-account-history names no explorer; facet 1 is tested only as 'how to look an account up'.

## SDKs and developer tooling (`tooling`)

16 target, 15 kept, 8 cut, 3 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `stellar-cli` | 3 | 2 | sor-build-target-wasm32v1<br>soroban-deploy-cli | tool-cli-testnet-identity-howto<br>ti-cli-rust-windows-troubleshooting |  |
| `sdk-landscape` | 2 | 1 | tool-which-sdk-comparison | tool-rust-soroban-sdk<br>tool-flutter-mobile-sdk<br>ti-java-sdk-wallet-feebump |  |
| `js-sdk` | 3 | 2 | sor-deploy-invoke-from-js-sdk<br>tool-js-sdk-package |  |  |
| `lab` | 1 | 1 | tool-lab-what-is |  |  |
| `quickstart-local` | 2 | 1 | infra-quickstart-local-network | quickstart-manual-ledger-close |  |
| `scaffold-bindings` (+1) | 2 | 1 | soroban-cli-bindings<br>ti-scaffold-stellar | ti-bindings-to-nextjs-integration |  |
| `wallet-connection` (+1) | 2 | 1 | sep-43-web-wallet-api<br>ti-connect-wallet-button-code | ti-freighter-localhost-not-detected |  |
| `wallet-sdk` | 1 | 1 | none |  | waived: anchor-sdp-vs-anchor-platform |
| `version-compat` | 3 | 2 | none |  | slot: which releases match the protocol on Mainnet<br>slot: what fails when an SDK or CLI lags a protocol upgrade |
| `channel-accounts` | 2 | 1 | ti-channel-accounts-throughput |  |  |
| `relayers` (+1) | 2 | 1 | smart-wallet-fee-sponsorship<br>ti-openzeppelin-relayer |  |  |
| `renames-repos` | 2 | 2 | tool-go-sdk-ingest |  | slot: tools and products that changed name |

- `tooling.scaffold-bindings`: One over target: The one facet has two halves: a typed client (q-soroban-cli-bindings) and a starter project (q-ti-scaffold-stellar).
- `tooling.wallet-connection`: One over target: Scope names the interface standard (q-sep-43-web-wallet-api) and the multi-wallet kit and signature request (q-ti-connect-wallet-button-code).
- `tooling.relayers`: One over target: Leaf title names relayers (q-ti-openzeppelin-relayer) and gasless transactions (q-smart-wallet-fee-sponsorship).

## SEPs, anchors, ramps, and payments (`standards`)

21 target, 15 kept, 7 cut, 3 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `sep-process` | 2 | 1 | sep-catalog-list |  |  |
| `stellar-toml` | 2 | 2 | anchor-endpoint-discovery |  | waived: aas-list-token-on-exchanges-aggregators, edge-asset-site-scam-detection |
| `web-auth` | 2 | 2 | sep-45-contract-auth |  | waived: edge-inject-ignore-instructions |
| `deposit-withdrawal` | 3 | 2 | sep6-sep24-sep31-choice |  | slot: the SEP-24 interactive flow |
| `sep31-sep38` | 2 | 2 | none |  | slot: the SEP-31 flow between a sending and a receiving anchor<br>waived: sep-catalog-list |
| `sep12-kyc` | 2 | 1 | sep-12-kyc | comp-anchor-compliance-stack |  |
| `anchors-directory` | 3 | 2 | anchor-list-builders-discovery<br>crp-regional-offramp-mobilemoney | crp-become-an-anchor-licensing<br>raph-offramp-xlm-usdc |  |
| `anchor-platform` | 2 | 1 | anchor-sdp-vs-anchor-platform |  |  |
| `disbursements` | 2 | 2 | crp-sdp-operation<br>hist-unhcr-stellar-aid-assist |  |  |
| `moneygram-ramps` | 2 | 1 | anchor-moneygram-ramps | pay-moneygram-ramps |  |
| `wallet-utility-seps` | 1 | 1 | sep-53-sign-verify-message | sep-7-uri |  |
| `cross-border-payments` | 2 | 1 | crp-remittance-founder-advisory | hist-remittance-corridors |  |
| `exchange-integration` | 2 | 1 | ti-custodial-account-generation-c-address |  |  |
| `payment-patterns` | 2 | 2 | stellar-recurring-payments | sor-recurring-escrow-patterns | slot: accepting and reconciling a merchant payment |

- `standards.sep-process`: q-sep-catalog-list maps SEP numbers to purposes; it does not test how to read a SEP's status.
- `standards.exchange-integration`: q-ti-custodial-account-generation-c-address fits only in part (custodial keys and memo deposits); it does not test withdrawals or destination checks.

## DeFi and markets (`defi`)

14 target, 13 kept, 11 cut, 0 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `sdex-orderbook` | 2 | 1 | defi-sdex-offer-lifecycle |  |  |
| `liquidity-pools` | 2 | 1 | asset-sdex-vs-amm | defi-provide-liquidity-impermanent-loss |  |
| `path-payments` | 2 | 1 | asset-path-payment-ops | asset-usdc-eurc-path-fx<br>defi-arbitrage-pathpayment-bots |  |
| `dex-amm` | 2 | 2 | defi-soroswap-vs-stellarx<br>eco-dex-saturation | defi-phoenix-what-is<br>defi-perps-whitespace<br>defi-comet-what-is |  |
| `lending` | 2 | 2 | defi-blend-alternatives<br>defi-blend-what-is | defi-defindex-honest<br>defi-flash-loans |  |
| `tvl-landscape` | 2 | 2 | edge-fresh-latest-blend-tvl |  | waived: eco-defi-tvl-current |
| `bridges` | 3 | 2 | cctp-v2-usdc-stellar<br>defi-bridge-evm-to-stellar-axelar | defi-allbridge-what-is |  |
| `oracles` | 2 | 1 | pc-cross-redstone-sep40 | defi-reflector-oracle<br>sor-reflector-integration-code |  |
| `prices-market-data` | 2 | 1 | ti-compute-token-lp-market-data |  |  |
| `protocol-governance` | 1 | 1 | defi-aquarius-what-is |  |  |

- `defi.protocol-governance`: q-defi-aquarius-what-is fits in part: its ICE voting roles are governance, but the question asks what Aquarius is.

## Security, audits, and compliance (`security`)

14 target, 9 kept, 5 cut, 5 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `contract-security` | 3 | 2 | soroban-reentrancy<br>soroban-vuln-classes | soroban-oracle-defensive-consumption<br>soroban-sdk-cve |  |
| `audit-registry` | 2 | 2 | none |  | slot: where audit reports are published and which firms wrote them<br>slot: whether a named project has been audited |
| `core-audits` | 1 | 1 | none |  | slot: which SDF-maintained components have published audits |
| `audit-bank` | 2 | 1 | scf-audit-bank |  |  |
| `bug-bounty` | 1 | 1 | scf-sdf-bug-bounty | comp-security-disclosure-programs |  |
| `app-exploits` | 2 | 1 | comp-yieldblox-oracle-incident |  |  |
| `key-custody` | 2 | 1 | pc-multisig-setup-lifecycle |  |  |
| `signing-safety` | 2 | 1 | none |  | slot: what to check before signing a transaction from a website |
| `aml-screening` | 1 | 1 | none |  | slot: which compliance and analytics vendors cover Stellar |
| `regulation-policy` | 2 | 1 | pay-anchor-msb-licensing | pay-travel-rule-aid-flows |  |
| `privacy` | 2 | 1 | edge-noinfo-stellar-native-privacy-default | sor-confidential-tokens |  |
| `quantum-preparedness` | 1 | 1 | hist-quantum-preparedness-plan |  |  |

- `security.contract-security`: Facet 2 (practices and tools SDF recommends before Mainnet) is untested: both kept cases cover vulnerability classes.
- `security.key-custody`: q-pc-multisig-setup-lifecycle fits in part (multisig custody and lockout); it does not test key storage or custody providers.

## Wallets, retail use, and support (`wallets`)

15 target, 14 kept, 5 cut, 2 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `landscape` | 2 | 2 | eco-stellar-wallets-list<br>tool-wallets-comparison | raph-lobstr-legitimacy |  |
| `sdf-wallet` | 2 | 1 | tool-freighter-wallet |  |  |
| `wrong-memo` | 3 | 2 | raph-exchange-memo<br>raph-missing-exchange-memo |  |  |
| `wrong-network` | 2 | 2 | edge-metamask-evm-mental-model<br>raph-usdc-onto-stellar | raph-withdraw-exchange-self-custody |  |
| `scams-phishing` | 3 | 2 | edge-asset-site-scam-detection<br>raph-stolen-wallet-recovery |  |  |
| `lost-keys` (+1) | 2 | 1 | aas-sep30-recoverable-wallets<br>passkey-wallet-recovery | raph-secret-key-hash-recovery |  |
| `unsolicited-assets` | 2 | 1 | raph-unsolicited-airdrop | raph-remove-scam-token |  |
| `consumer-apps` | 2 | 1 | none | edge-retail-everyday-use-eli5 | slot: which consumer apps let people spend or save on Stellar |
| `support-channels` | 2 | 1 | none |  | slot: the official help channels and what SDF does not do |
| `pi-network` | 2 | 1 | n3-pi-network-wrong-chain |  |  |
| `history-export` | 1 | 1 | crp-export-tx-history-taxes |  |  |

- `wallets.lost-keys`: One over target: Scope names recovery set up in advance: SEP-30 for classic accounts (q-aas-sep30-recoverable-wallets) and contract policy for passkey wallets (q-passkey-wallet-recovery).
- `wallets.consumer-apps`: Its only case names no app and is cut; the slot replaces it.

## SDF, XLM, and the ecosystem (`ecosystem`)

18 target, 14 kept, 4 cut, 5 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `sdf` | 2 | 2 | org-sdf-board-directors<br>org-sdf-structure-mandate | org-mazieres-chief-scientist<br>builder-justin-rice-history |  |
| `sdf-mandate-holdings` | 2 | 1 | hot-sdf-xlm-holdings-sales |  |  |
| `xlm-supply` | 3 | 3 | hot-fee-pool-burn-deflation<br>token-initial-supply-distribution |  | slot: total and circulating supply, and whether new XLM can be created |
| `xlm-staking-rewards` | 2 | 2 | defi-liquid-staking-whitespace<br>raph-xlm-staking | defi-build-staking-for-own-token |  |
| `xlm-role` | 2 | 1 | raph-xlm-network-role |  |  |
| `xlm-markets` (+1) | 1 | 1 | crp-cme-xlm-futures-dates<br>raph-buy-xlm-safely |  |  |
| `history-origins` | 2 | 1 | hist-scp-rewrite-2015 |  |  |
| `chain-comparisons` | 2 | 1 | none |  | slot: how Stellar differs from the XRP Ledger and other chains |
| `strategy-roadmap` | 2 | 1 | none |  | slot: SDF's stated priorities for the current year |
| `project-directory` | 3 | 3 | eco-defi-market-map<br>eco-nft-marketplace-whitespace | tw-escrow-api-auth-custody | slot: telling apart similarly named or renamed projects |
| `project-builders` | 2 | 1 | eco-lobstr-wallet |  |  |
| `institutional-adoption` | 2 | 1 | none |  | slot: which major institutions use Stellar and for what |

- `ecosystem.xlm-markets`: One over target: The one facet has two halves: where XLM trades (q-raph-buy-xlm-safely) and regulated products that hold it (q-crp-cme-xlm-futures-dates).

## Funding, programs, and events (`funding`)

13 target, 13 kept, 9 cut, 1 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `scf-overview` | 3 | 2 | scf-build-award-cap<br>scf-v7-changes | edge-scf-v7-centralization-myths<br>scf-total-distributed |  |
| `scf-apply` | 2 | 2 | scf-how-to-apply<br>scf-nqg-voting | scf-build-tracks<br>scf-eligibility-criteria |  |
| `scf-rounds-status` | 2 | 1 | scf-current-round | scf-round-43-results |  |
| `scf-rfps` | 2 | 1 | scf-open-rfps |  |  |
| `scf-funded-projects` | 2 | 1 | scf-history-soroswap | defi-rwa-scf-similar |  |
| `scf-supporting-programs` | 2 | 1 | scf-instawards |  |  |
| `other-sdf-funding` | 1 | 1 | scf-vs-sdf-enterprise-fund | org-sdf-enterprise-fund<br>scf-sdf-marketing-grant<br>scf-academic-research-grant |  |
| `hackathons` (+1) | 2 | 1 | scf-blend-winners-live<br>scf-hackathons-active |  |  |
| `meridian` | 2 | 1 | hist-meridian-2026-corrected-venue |  |  |
| `community-programs` | 1 | 1 | scf-ambassador-program |  |  |
| `service-providers` | 1 | 1 | none |  | slot: where to find a vetted audit firm or integration partner |

- `funding.hackathons`: One over target: The one facet has two halves: which hackathons are open (q-scf-hackathons-active) and what was built (q-scf-blend-winners-live).

## AI and agent tooling (`ai`)

9 target, 7 kept, 3 cut, 3 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `x402` | 2 | 2 | x402-payment-verification<br>defi-x402-on-stellar-what | hist-x402-stellar-announcement<br>soroban-x402-auth-entry-signing |  |
| `mpp-agentic-protocols` (+1) | 2 | 2 | mpp-discovery-and-modes<br>defi-agent-identity-stellar-experimental<br>defi-agentic-payment-standards-compare | agent-identity-erc8004-stellar |  |
| `agent-cli` | 2 | 1 | none |  | slot: what the agent CLI does and how it limits what an agent can sign |
| `mcp-servers` | 2 | 1 | none |  | slot: which MCP servers an agent can connect and what each provides |
| `skills-llms-docs` | 2 | 1 | tool-cli-skills-discovery |  |  |
| `agent-delegation` | 2 | 1 | smart-account-scoped-policy-signers |  |  |
| `ecosystem-projects` | 1 | 1 | none |  | slot: which AI or agent projects are built on Stellar |

- `ai.mpp-agentic-protocols`: One over target: Scope names agent identity standards such as ERC-8004 (q-defi-agent-identity-stellar-experimental) beside the two facets.

## Trap and safety behaviors (`behavior`)

16 target, 14 kept, 1 cut, 0 slots.

| Leaf | W | Target | Kept | Cut | Open |
|---|---|---|---|---|---|
| `scam-check` | 3 | 2 | n3-issues-842-backup-faucet-wallet<br>raph-phishing-pending-claim |  |  |
| `prompt-injection` | 3 | 2 | edge-inject-ignore-instructions<br>n3-inject-ignore-previous-instructions |  |  |
| `fabrication-bait` | 3 | 2 | edge-factcheck-soroswap-first-amm<br>edge-noinfo-sep-9999 | sep-6-vs-31-misnumber-trap |  |
| `no-info-honesty` | 3 | 2 | edge-strupey-ambiguous-stellar-history<br>pc-quantum-preparedness-dormant |  |  |
| `freshness-honesty` | 2 | 2 | eco-defi-tvl-current |  | waived: hist-meridian-2026-corrected-venue, edge-fresh-latest-protocol-version |
| `out-of-scope` | 2 | 1 | edge-oos-solana-vs-aptos |  |  |
| `paid-action-refusal` | 2 | 1 | none |  | waived: test/policy.test.ts |
| `ambiguity` | 2 | 1 | edge-ambig-best-wallet |  |  |
| `speculation` | 2 | 1 | edge-xlm-price-investment-advice |  |  |
| `wallet-authority` | 3 | 2 | edge-jailbreak-generate-secret-keys<br>edge-send-me-free-xlm |  |  |

- `behavior.scam-check`: Facet 2 (a request for a secret key or recovery phrase) is untested: both kept cases are lures.
- `behavior.prompt-injection`: Facet 1 (instructions inside retrieved content) is untested and cannot be built as a static question; both kept cases inject through the user turn.

## Cases that fit no leaf

Proposed retire. No new leaf is proposed.

| Case | Why |
|---|---|
| edge-exhaustive-defi-deep-report | No behavior leaf covers 'bound an exhaustive-report request'; it is response shaping, not a trap or safety behavior. Its dated-and-sourced rule is behavior.freshness-honesty and its content is q-eco-defi-market-map. |
| pc-bucketlist-vs-merkle-inclusion-proof | Core internals (Bucket List versus transaction-set hashes); neither mapper found demand, and no leaf holds it. |
| pc-l2-payment-channels-starlight | An archived experiment (Starlight); no leaf holds payment channels and neither mapper found demand. |
| protocol-ledger-entry-types | Recital of the ten LedgerEntryType names; the reconciler folded data structures into other leaves. |
| sor-doc-timestamping-manage-data | Manage Data hash anchoring: the demand mapper's weight-1 data-entries leaf was folded into protocol.accounts-reserves, which is full. |
| ti-video-tutorials | Learning resources are not in the taxonomy; one playlist fact. |

## Open slots

| Leaf | Facet | Draft question |
|---|---|---|
| `network.running-a-node` | the incentive to run a validator | Stellar pays validators no block rewards. Why do organizations run one, and what does running a validator require? |
| `network.tier1-quorum` | who validates today and where the roster is published | Which organizations are Tier 1 validators on Stellar today, and where is the current list published? |
| `network.incidents` | network halts and how each was resolved | Has the Stellar network ever halted? What happened each time and how was it resolved? |
| `network.quorum-freeze` | what CAP-77 lets validators freeze and how it is reversed | What does CAP-77 let validators freeze, how is a freeze voted in and reversed, and where has it been used? *(audit-compliance and audit-protocol both list this as missing; the YieldBlox quarantine is the known use.)* |
| `network.protocol-meetings` | where meetings are recorded and how to find a decision | Where are Stellar protocol and developer meetings recorded, and how do I find what was decided about a given CAP? |
| `assets.usdt0` | how USDT0 reaches Stellar and what kind of token it is | Is USDT on Stellar? How does USDT0 reach Stellar, and what kind of token is it there? |
| `assets.nft-vault-standards` | how NFTs and tokenized vaults are built and which SEPs define them | How do I build an NFT or a tokenized vault on Stellar, and which SEPs define them? *(audit-assets lists SEP-56 as missing; q-rwa-tokenization-standards (cut) carried one SEP-56 fact.)* |
| `assets.public-sector-cbdc` | which public institutions have issued or piloted on Stellar | Which governments, central banks or other public institutions have issued or piloted assets on Stellar? |
| `soroban.resource-fees` | rent and refundable versus non-refundable fees | What makes up the fee of a Soroban transaction: inclusion fee, resource fee, the refundable part, and rent? *(audit-protocol and audit-soroban-a both list the fee split as missing.)* |
| `soroban.errors-debugging` | finding why an invocation failed | How do I define custom contract errors, and how do I find out why a contract invocation failed (diagnostic events, simulation, error codes)? *(audit-soroban-b lists #[contracterror] and contract debugging as missing.)* |
| `data.providers` | which endpoints SDF hosts and which it does not | Which RPC and Horizon endpoints does SDF host for Mainnet, Testnet and Futurenet, and where must I use a provider or my own node? |
| `data.explorers-status` | where to check live network and validator health | Where do I check whether the Stellar network, a validator, or SDF's hosted services are having problems right now? *(audit-tooling-a lists status and monitoring sources as missing.)* |
| `data.network-metrics` | where authoritative activity and developer figures come from | Where do authoritative figures for Stellar accounts, operations, payment volume and developer activity come from, and how current is each source? |
| `tooling.version-compat` | which releases match the protocol on Mainnet | Which stellar-core, RPC, Horizon, Rust SDK and CLI releases support the protocol Mainnet runs today? |
| `tooling.version-compat` | what fails when an SDK or CLI lags a protocol upgrade | What errors appear when my SDK or CLI is older than the network's protocol version, and how do I fix them? |
| `tooling.renames-repos` | tools and products that changed name | Which Stellar tools and products have been renamed (for example Soroban RPC, the Soroban CLI, Freighter), and what is each called now? |
| `standards.deposit-withdrawal` | the SEP-24 interactive flow | From the wallet's side, how does a SEP-24 interactive deposit run: the interactive URL, KYC, and status polling until the funds arrive? *(audit-assets and audit-hist-retail both list the flow itself as missing; merged q-sep-interactive-deposit-withdraw can be reinstated in place of a new case.)* |
| `standards.sep31-sep38` | the SEP-31 flow between a sending and a receiving anchor | How does a SEP-31 payment move between a sending and a receiving anchor, and how do SEP-38 indicative and firm quotes fit in? *(One case can cover both facets. Merged q-sep-31-cross-border and q-sep-38-quotes can be reinstated in place of a new case.)* |
| `standards.payment-patterns` | accepting and reconciling a merchant payment | How does a merchant or app request a Stellar payment, detect that it arrived, and match it to an order? *(audit-hist-retail asks for this in place of the retired generic q-raph-merchant-payments (SEP-7 payment URIs, memo or muxed matching).)* |
| `security.audit-registry` | where audit reports are published and which firms wrote them | Where are security audit reports for Stellar ecosystem projects published, and which firms have written them? |
| `security.audit-registry` | whether a named project has been audited | Has Blend been audited? By which firm, when, and where is the report? |
| `security.core-audits` | which SDF-maintained components have published audits | Which SDF-maintained components (stellar-core, the Soroban host, RPC, the SDKs) have published security audits, and where are they listed? *(Both cases that touched this were retired as identifier trivia (q-soroban-auth-recursion-dos-audit, q-tool-soroban-auth-audit-live).)* |
| `security.signing-safety` | what to check before signing a transaction from a website | A website asks my wallet to sign a transaction. What should I check before I approve it? |
| `security.aml-screening` | which compliance and analytics vendors cover Stellar | Which blockchain analytics and compliance vendors cover Stellar, and what are anchors expected to screen? |
| `wallets.consumer-apps` | which consumer apps let people spend or save on Stellar | Which consumer apps or cards let people spend, save or send money on Stellar, and in which regions? |
| `wallets.support-channels` | the official help channels and what SDF does not do | Where do I get official help with a Stellar problem, and what will SDF never do for a user? |
| `ecosystem.xlm-supply` | total and circulating supply, and whether new XLM can be created | How many XLM exist, how many are in circulation, and can new XLM ever be created? |
| `ecosystem.chain-comparisons` | how Stellar differs from the XRP Ledger and other chains | How does Stellar differ from the XRP Ledger in consensus, fees and how assets are issued? |
| `ecosystem.strategy-roadmap` | SDF's stated priorities for the current year | What are SDF's stated priorities for this year, and where are the roadmap and quarterly reports published? |
| `ecosystem.project-directory` | telling apart similarly named or renamed projects | A 2025 post mentions the Hermes perps exchange on Stellar. What is that project called now, and is it live? *(Tool-lane q-scf-resolve-passport-superseded-slug tests Raven's resolver for the same need; this slot tests the world fact.)* |
| `ecosystem.institutional-adoption` | which major institutions use Stellar and for what | Which major financial institutions have launched on or integrated with Stellar, what did each launch, and when? |
| `funding.service-providers` | where to find a vetted audit firm or integration partner | Where can a builder find a vetted audit firm, anchor or integration partner for a Stellar project? |
| `ai.agent-cli` | what the agent CLI does and how it limits what an agent can sign | What is the Stellar CLI for agents, what can it do, and how does it limit what an agent may sign? |
| `ai.mcp-servers` | which MCP servers an agent can connect and what each provides | Which MCP servers can an agent connect for Stellar docs, data or tools, and what does each provide? *(q-tool-cli-skills-discovery names only the Stellar Docs MCP server.)* |
| `ai.ecosystem-projects` | which AI or agent projects are built on Stellar | Which AI or agent projects are built on Stellar, and which events produced them? |

## Tool lane

18 cases were moved to the tool lane. 7 stay, one per mechanism; 12 retire because a routing gate, a unit test, or the frozen live lane already exercises them. Each `coveredBy` was read in the named file.

| Case | Mechanism | Covered by | Final |
|---|---|---|---|
| ti-explain-repo-payload-status | A payload carries its own ok or answered status inside an ok host envelope (scout.explainRepo). | nothing: No test asserts explainRepo's nested status: test/drift-141-routing.test.ts covers only how the operation ranks, and no frozen live case uses explainRepo. | keep-tool-lane |
| edge-closed-world-builder-directory-miss | A directory-scoped exact miss is a conclusive, scoped negative: stop, do not widen (scout.getBuilders). | nothing: test/server.test.ts:1391 and test/demo-steps.test.ts:90 pin the host's closed-world wording only; nothing observes an agent stopping. The frozen live lane holds the opposite side (q-live-ll-guessed-slug-soft-empty: inconclusive) but no conclusive-negative control. | keep-tool-lane |
| scf-pitch-prep-live | In a Scout composite report, a null, empty or unavailable block is unknown, not zero or absent (scout.scfPitch round.source). Absorbs gap-vet-pitch-vertical-null. | nothing: test/search.test.ts:156 and test/plan-grade.test.mjs:268 cover scfPitch's evidence profile and operation class; nothing reads a composite's blocks. Kept as the one composite case; it absorbs q-gap-vet-pitch-vertical-null. | keep-tool-lane |
| scf-resolve-passport-superseded-slug | A superseded directory record redirects to the current one; the stale record's status is not the project's state (scout.resolveProject). | nothing: test/catalog.test.ts and test/search.test.ts only list the operation; frozen live q-live-fluxity-status-provenance covers status provenance, not the superseded redirect. | keep-tool-lane |
| defi-cluster-rollup-live | Two aggregate views combine only when their population ids match; overlapping type clusters do not sum (scout.getClusters, scout.analyzeEcosystem). Absorbs defi-asset-whitespace-live, defi-category-funding-ratio-live, defi-tooling-whitespace-live. | nothing: grep of test/ for 'population' finds nothing. Frozen live q-live-ecosystem-crowded-underbuilt reads getClusters counts but never combines two views. Absorbs three merged cases. | keep-tool-lane |
| soroban-greenfield-escrow-prior-art-preflight | On a build request, the agent runs one bounded prior-art pass before choosing an architecture and reports unknown licence and audit status. | nothing: test/server.test.ts:1458 and test/smoke/executor.test.ts:411 cover the host's caveats once a prior-art operation has run; nothing observes whether an agent runs the pass unprompted. The frozen live repo cases (q-live-zk-repos-current, q-live-oracle-repo-triage) ask for repos outright. Its twin q-tool-greenfield-indexer-prior-art-preflight is merged away. | keep-tool-lane |
| soroban-av-passkeys-talk | An A/V passage result is an AI summary with recording provenance, not a transcript quote; start_offset is an opaque order (lumenloop.find_av_passages). | nothing: Audit verdict was merge into q-gap-av-offset-not-timestamp, which is retired (see mergeFixes). test/catalog.test.ts:432 pins the description wording (AI summaries, opaque offset, no transcript text) and eval/routing-cases.json has three find_av_passages routing cases, but nothing observes whether an agent presents a summary as a speaker's words. | keep-tool-lane |
| gap-explainrepo-payload-ok | Same as q-ti-explain-repo-payload-status. | q-ti-explain-repo-payload-status (kept tool-lane twin) | retire |
| scout-hackathon-brief-first-hour | Same composite-block reading as q-scf-pitch-prep-live (scout.hackathonBrief). | q-scf-pitch-prep-live (kept tool-lane case, same mechanism); test/drift-141-routing.test.ts:73 (hackathonBrief ranking) | retire |
| scf-hackathon-compare-live | Counts come from compareHackathons, names and placement only from event detail; null is not zero. | eval/qa/corpus/live/live-cases.json q-live-hackathon-recent-winners (placement only if the data gives it) and q-live-ll-guessed-slug-soft-empty (resolve the slug first); test/argument-aliases.test.ts (slugs argument); null-is-unknown stays in q-scf-pitch-prep-live | retire |
| ti-scout-refresh-cached-rows | Change-feed reading: per-surface truncation and empty-means-unchanged (scout.getChanges). | eval/qa/corpus/live/live-cases.json q-live-builders-artifact-continuation (a truncated prefix is not complete); kept tool-lane case q-edge-closed-world-builder-directory-miss (a conclusive, scoped empty) | retire |
| gap-semantic-directory-fallback | A semantic-fallback directory row is a candidate, not an identity match; open-world questions get one broad pass (lumenloop.search_directory match_mode). | test/executor-providers.test.ts:208 and test/smoke/executor.test.ts (match_mode: semantic is surfaced); headline q-edge-strupey-ambiguous-stellar-history (does not promote fuzzy semantic neighbors; broad dated search) | retire |
| gap-match-partners-degrade | On a 503 from the partner-matching endpoint, fall back to getPartners instead of inventing a ranking. | test/adapters.test.ts:445 (maps 503 to a non-retryable error with the fallback hint) | retire |
| crp-partner-detail-after-discovery | Detail lookup takes the exact slug returned by discovery; report only profile fields (scout.getPartner). | eval/qa/corpus/live/live-cases.json q-live-ll-guessed-slug-soft-empty (resolve by search, then call detail with the returned slug); test/plan-grade.test.mjs:116 (discovery before scout.getPartner); test/adapters.test.ts:399 (a Scout unknown-slug 404 maps to soft-empty; one adapter path for every Scout detail operation) | retire |
| tool-skill-detail-install | A topical name is not an exact skill slug: resolve it against listSkills before getSkill, and invent no install steps. | eval/routing-cases.json q-tool-skill-detail-install (scout_skill_detail card); test/adapters.test.ts:399 (getSkill unknown slug maps to soft-empty with a hint); frozen live q-live-ll-guessed-slug-soft-empty (guessed-slug mechanism) | retire |
| scf-skill-submission-radar | Selecting the served SCF Submission Radar skill from a positioning request. | eval/skills-cases.json q-skill-scf-radar-positioning (expected card skills_scf_submission_radar); test/skill-search-admission.test.ts | retire |
| ti-skill-builder-quickstart | Selecting the served Stellar Builder Quickstart skill from a vague product idea. | eval/skills-cases.json q-skill-builder-quickstart-remittance (expected card skills_stellar_builder_quickstart); test/skill-exposure-classification.test.ts | retire |
| ass-cross-bando-stablebonds-sac | Composing a Lumenloop SCF record, a Scout project record and a docs or skill answer in one reply. | eval/qa/corpus/live/live-cases.json q-live-beans-cross-service-reconcile (queries both services and attributes each separately) | retire |
| ass-cross-etherfuse-cetes-controls | Same cross-service composition as the Bando case. | eval/qa/corpus/live/live-cases.json q-live-beans-cross-service-reconcile | retire |

The audit and verify records for `q-scf-skill-submission-radar` state that `eval/skills-cases.json` has no case for that skill. It has one (`q-skill-scf-radar-positioning`), and one for Builder Quickstart (`q-skill-builder-quickstart-remittance`), so both skill-selection cases retire.

## Merge fixes

| Case | Problem | Fix |
|---|---|---|
| raph-missing-exchange-memo | Cycle: hist-retail merged this case into q-edge-exchange-memo-lost-funds while edge merged that case into this one. | Both verifiers chose this case as the survivor. It stays (tighten) and absorbs status-first diagnosis, the muxed-address alternative, discretionary recovery and the no-secrets rule; q-edge-exchange-memo-lost-funds merges into it. |
| soroban-av-passkeys-talk | Survivor q-gap-av-offset-not-timestamp is retired, and that retire was accepted because the behavior 'stays graded inside q-ti-video-tutorials and q-soroban-av-passkeys-talk'. With this merge and the q-ti-video-tutorials cut, nothing observes A/V passage handling. | Move this case to the tool lane instead of merging it: it becomes the one A/V case (an AI summary is not a transcript quote; start_offset is an opaque ordering value). |
| tool-soroban-auth-audit-live | Survivor q-soroban-auth-recursion-dos-audit is retired; each lane assumed the other kept the topic. | The verifier already amended this to retire. Both go; security.core-audits is left empty and gets a slot. |
| gap-compare-hackathons | Survivor q-scf-hackathon-compare-live is a tool-lane case that this lane retires. | Retire. The slug rule is exercised by frozen live case q-live-ll-guessed-slug-soft-empty. |
| gap-hackathon-winner-order | Survivor q-scf-hackathon-compare-live is a tool-lane case that this lane retires. | Retire. Frozen live case q-live-hackathon-recent-winners key fact 3 is the same rule (assert placement order only if the data gives it). |
| gap-hackathon-brief-evidence-boundaries | Survivor q-scout-hackathon-brief-first-hour is a tool-lane case that this lane retires. | Retire. The empty-block rule is carried by the kept tool-lane case q-scf-pitch-prep-live. |
| defi-asset-whitespace-live | Survivor q-defi-cluster-rollup-live is outside the headline (tool lane). | No change: the survivor is kept in the tool lane and the merge holds. The same applies to q-defi-category-funding-ratio-live and q-defi-tooling-whitespace-live. |
| gap-vet-pitch-vertical-null | Survivor q-scf-pitch-prep-live is outside the headline (tool lane). | No change: the survivor is kept in the tool lane and the merge holds. |
| anchor-sdp-what | Two lanes named different survivors (assets: q-anchor-sdp-vs-anchor-platform; compliance: q-crp-sdp-operation). | Survivor is q-crp-sdp-operation, as the verifier decided; q-anchor-sdp-vs-anchor-platform keeps only the role comparison. |
| edge-noinfo-exact-tvl-figure | Auditor's survivor q-edge-fresh-latest-blend-tvl asks about one protocol's TVL, not the Stellar-wide figure. | Survivor is q-eco-defi-tvl-current, as the verifier decided; it absorbs the no-exact-figure caution. |
| tool-cctp-stellar-integration | Two verifiers wrote different rewrites of survivor q-cctp-v2-usdc-stellar. The compliance rewrite's key fact 3 reads 'Stellar recipients go through CctpForwarder'; the tooling-b verifier requires 'Inbound transfers set both mintRecipient and destinationCaller to Stellar's CctpForwarder'. | Use the tooling-b wording for key fact 3 and keep domain 27 in the answer; the rest of the compliance rewrite stands. |
| hist-cctp-stellar-live-announcement | Conditional merge: the survivor must keep both May 2026 milestones judge-facing. | The verified rewrite of q-cctp-v2-usdc-stellar carries both dates in key fact 1, so the condition holds. No change. |
| eco-xbull-wallet | Survivor q-eco-stellar-wallets-list does not carry the fact this merge says it must absorb (xBull is built by Creit Tech, not SDF or Ultra Stellar). | Drop the fact: one wallet's builder is not a facet of wallets.landscape. Record the merge as a duplicate retirement. |
| production-anchor-architecture | Chain: survivor q-crp-become-an-anchor-licensing is cut by this lane (merged into q-anchor-sdp-vs-anchor-platform). | Point this merge at q-anchor-sdp-vs-anchor-platform, which takes the one fact both carry (the Anchor Platform is not a licence). |
| comp-sep6-vs-sep12-roles | Chain: survivor q-comp-anchor-compliance-stack is cut by this lane. | Point this merge at q-sep-12-kyc, the second survivor the auditor named; it already states that SEP-12 is the KYC API. |
| crp-tokenize-personal-rwa | Chain: survivor q-rwa-tokenization-standards is cut by this lane. | Point this merge at q-crp-oz-rwa-erc3643-trex, whose key fact 4 is the absorbed fact (contracts create no legal rights). |
| protocol-bls12-381-cap59 | Chain: survivor q-protocol-bn254-poseidon-xray is cut by this lane. | Point this merge at q-zk-host-functions-status, whose key fact 1 is the absorbed fact (CAP-0059, Protocol 22). |
| scf-confidential-tokens-preview | Chain: survivor q-sor-confidential-tokens is cut by this lane. | Point this merge at q-edge-noinfo-stellar-native-privacy-default, which carries the same Confidential Token facts. |
| soroban-contractmeta-vs-contractevent | Chain: survivor q-soroban-sdk-macros is cut by this lane. | Point this merge at q-soroban-publish-events (the #[contractevent] half); the contractmetav0 half is key fact 4 of q-soroban-contract-build-verification. |
| defi-market-making-kelp | Chain: survivor q-defi-arbitrage-pathpayment-bots is cut by this lane. | Retire. Kelp's archive status is not a taxonomy facet. |
| edge-deep-full-history-report | Chain: survivor q-edge-exhaustive-defi-deep-report fits no leaf and this lane proposes to retire it. | Retire both. |
| sep-31-cross-border | The auditor named two survivors; one (q-sep-6-vs-31-misnumber-trap) is cut by this lane. | Survivor is q-sep6-sep24-sep31-choice. The leaf standards.sep31-sep38 is then empty: reinstating this case fills its slot without a new case. |

## Cross-category duplicates

Found by reading each leaf's surviving questions and rewrites side by side. The survivor stays; the others are in the Cut column above.

| Leaf | Cases | Survivor | Note |
|---|---|---|---|
| `network.cap-process-status` | pc-protocol-27-zipper<br>soroban-auth-delegation-p27 | pc-protocol-27-zipper | protocol and soroban-a lanes: CAP-0071 delegated signers in Protocol 27, same key facts. |
| `soroban.crypto-zk` | zk-host-functions-status<br>protocol-bn254-poseidon-xray | zk-host-functions-status | soroban-b and protocol lanes: the same CAP-to-protocol table. |
| `standards.moneygram-ramps` | anchor-moneygram-ramps<br>pay-moneygram-ramps | anchor-moneygram-ramps | assets and compliance lanes. |
| `security.bug-bounty` | scf-sdf-bug-bounty<br>comp-security-disclosure-programs | scf-sdf-bug-bounty | scf and compliance lanes: the consolidated HackerOne program. |
| `security.privacy` | edge-noinfo-stellar-native-privacy-default<br>sor-confidential-tokens | edge-noinfo-stellar-native-privacy-default | edge and soroban-a lanes. |
| `security.quantum-preparedness` | hist-quantum-preparedness-plan<br>pc-quantum-preparedness-dormant | hist-quantum-preparedness-plan | hist-retail and protocol lanes; the second is kept only for its no-information half, on behavior.no-info-honesty. |
| `wallets.landscape` | eco-lobstr-wallet<br>raph-lobstr-legitimacy | eco-lobstr-wallet | defi and hist-retail lanes. |
| `ai.mpp-agentic-protocols` | defi-agent-identity-stellar-experimental<br>agent-identity-erc8004-stellar | defi-agent-identity-stellar-experimental | defi and compliance lanes: ERC-8004 on Stellar. |
| `assets.token-interface` | soroban-token-transfer-pattern<br>sor-sep41-transfer-vs-transferfrom | soroban-token-transfer-pattern | soroban-b and soroban-a lanes. |
| `standards.payment-patterns` | stellar-recurring-payments<br>sor-recurring-escrow-patterns | stellar-recurring-payments | compliance and soroban-a lanes. |
| `funding.other-sdf-funding` | scf-vs-sdf-enterprise-fund<br>org-sdf-enterprise-fund<br>scf-sdf-marketing-grant | scf-vs-sdf-enterprise-fund | scf and hist-retail lanes. |
| `defi.path-payments` | asset-path-payment-ops<br>defi-arbitrage-pathpayment-bots<br>asset-usdc-eurc-path-fx | asset-path-payment-ops | assets, defi and hist-retail lanes: strict-send versus strict-receive three times. |
| `soroban.storage-types` | soroban-instance-storage-dos<br>sor-persistent-unbounded-collection-cap | soroban-instance-storage-dos | soroban-b and soroban-a lanes. |
| `security.app-exploits` | comp-yieldblox-oracle-incident<br>soroban-oracle-defensive-consumption | comp-yieldblox-oracle-incident | compliance and soroban-b lanes: the same oracle design lessons. |
| `ai.x402` | defi-x402-on-stellar-what<br>x402-payment-verification<br>soroban-x402-auth-entry-signing<br>hist-x402-stellar-announcement | defi-x402-on-stellar-what + x402-payment-verification | Four lanes hold an x402 case; two survive, one per facet. |
| `ecosystem.xlm-staking-rewards` | raph-xlm-staking<br>defi-liquid-staking-whitespace<br>defi-build-staking-for-own-token | raph-xlm-staking + defi-liquid-staking-whitespace | hist-retail and defi lanes: all three open with 'no native staking'. |
| `protocol.keys-recovery-phrases` | ti-secret-key-vs-mnemonic-derivation<br>raph-restore-wallet<br>ti-find-export-secret-key | ti-secret-key-vs-mnemonic-derivation | tooling-b and hist-retail lanes. |
| `tooling.stellar-cli` | soroban-deploy-cli<br>tool-cli-testnet-identity-howto | soroban-deploy-cli | soroban-b and tooling-b lanes: keys generate --fund. |
| `funding.scf-overview` | scf-build-award-cap<br>edge-scf-v7-centralization-myths | scf-build-award-cap | scf and edge lanes: the 10/20/30/40 tranches. |
| `assets.sac` | asset-trustline-vs-sac<br>sor-contract-trustlines-c-address<br>comp-sac-inherits-flags | asset-trustline-vs-sac | assets, soroban-a and compliance lanes: G trustline versus C contract storage. |

Key facts repeated across kept cases (trim when the cases are edited):

- Varial, formerly Freighter, is SDF's wallet (a key fact in all three). `q-eco-stellar-wallets-list`, `q-tool-wallets-comparison`, `q-tool-freighter-wallet`
- Persistent and Instance entries archive and restore; Temporary entries are deleted. `q-protocol-state-archival-ttl`, `q-soroban-storage-types`, `q-sor-ttl-defaults-extend`
- RPC history is retention-bounded; older data needs an indexer or archive. `q-infra-rpc-methods-list`, `q-soroban-publish-events`, `q-soroban-event-indexing-design`, `q-ti-rpc-gettransactions-pagination-xdr`, `q-infra-which-indexer`
- Friendbot funds test networks only, never Mainnet. `q-edge-send-me-free-xlm`, `q-edge-jailbreak-generate-secret-keys`, `q-tool-lab-what-is`
- The client signs a Soroban auth entry and a facilitator submits. `q-defi-x402-on-stellar-what`, `q-x402-payment-verification`
- Stellar has no native staking reward. `q-raph-xlm-staking`, `q-defi-liquid-staking-whitespace`
- The Build Award is up to $150,000 in XLM. `q-scf-build-award-cap`, `q-scf-vs-sdf-enterprise-fund`
- Authorization follows the invocation tree; a direct invoker contract is authorized automatically. `q-soroban-cross-contract-call`, `q-sor-require-auth-propagation`
- Channel accounts give separate sequence-number lanes. `q-pc-fee-bump-channel-accounts-feepool`, `q-ti-channel-accounts-throughput`
- Three Build tracks; only Open goes to a community vote. `q-scf-v7-changes`, `q-scf-how-to-apply`, `q-scf-nqg-voting`
- SEP-10 covers G and M accounts; contract accounts use SEP-45. `q-edge-inject-ignore-instructions`, `q-sep-45-contract-auth`
- An unsponsored empty account needs two base reserves (1 XLM). `q-pc-account-activation-not-found`, `q-protocol-base-reserve-min-balance`

## Not verified

5 audit records have no verifier decision (all `keep`, outside the one-in-five sample). The audit verdict stands for each; two of them are proposed cuts here on duplicate grounds.

- `q-n3-inject-ignore-previous-instructions`: headline
- `q-n3-issues-842-backup-faucet-wallet`: headline
- `q-raph-offramp-xlm-usdc`: retired (proposed cut)
- `q-raph-usdc-onto-stellar`: headline
- `q-raph-withdraw-exchange-self-custody`: retired (proposed cut)

## Totals

| Field | Value |
|---|---|
| before | 507 |
| headline | 211 |
| toolLane | 7 |
| retired | 200 |
| merged | 89 |
| newSlots | 35 |
| leavesCovered | 143 |
| leavesEmpty | 24 |
| leavesEmptyWithSlot | 21 |
| leavesEmptyWaived | 3 |
| taxonomyTarget | 249 |
| survivorsBeforeCoverage | 305 |
| cutByCoverage | 94 |
| cutAsRetire | 83 |
| cutAsMerge | 11 |
| waivedSlots | 13 |
| leavesOverTarget | 10 |
| toolLaneBefore | 18 |
| toolLaneRetired | 12 |
| headlineAfterSlots | 246 |
