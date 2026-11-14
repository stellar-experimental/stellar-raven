# Stellar coverage taxonomy

Generated 2026-11-14 by the `map-reconcile` lane from `map-supply.json` and `map-demand.json`. `taxonomy.json` is the source; this file is the review view.

14 domains, 167 leaves, 249 cases. Topic tree: 13 domains, 157 leaves, 233 cases. The `behavior` domain holds the rest.

| Weight | Leaves | Cases |
|---|---|---|
| 3 | 37 | 81 |
| 2 | 110 | 148 |
| 1 | 20 | 20 |

| Volatility | Leaves | Cases |
|---|---|---|
| stable | 57 | 89 |
| scheduled | 76 | 109 |
| live | 34 | 51 |

Weight: 3 = constant need, or a wrong answer loses funds or breaks a build; 2 = regular; 1 = niche but real. Cases: the number of battery cases the leaf deserves, one per facet in `taxonomy.json`.

## Ledger fundamentals: accounts, transactions, and fees (`protocol`)

15 leaves, 23 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `protocol.accounts-reserves` | Accounts, reserves, and account creation | 3 | stable | 3 |
| `protocol.account-merge` | Account merge and closing an account | 2 | stable | 1 |
| `protocol.operations-transactions` | Operations and transaction structure | 2 | stable | 1 |
| `protocol.sequence-numbers` | Sequence numbers | 3 | stable | 2 |
| `protocol.timebounds-preconditions` | Timebounds and transaction preconditions | 2 | stable | 1 |
| `protocol.signatures-multisig` | Signatures, thresholds, and multisig | 2 | stable | 1 |
| `protocol.tx-lifecycle-finality` | Transaction lifecycle, ledger close, and finality | 2 | scheduled | 2 |
| `protocol.fees-surge` | Classic fees and surge pricing | 3 | scheduled | 2 |
| `protocol.fee-bump-sponsorship` | Fee-bump transactions and sponsored reserves | 2 | stable | 2 |
| `protocol.networks-passphrases` | Mainnet, Testnet, Futurenet, and Friendbot | 3 | scheduled | 2 |
| `protocol.memos-muxed` | Memos, muxed accounts, and memo-required deposits | 3 | stable | 2 |
| `protocol.claimable-balances` | Claimable balances | 2 | stable | 1 |
| `protocol.xdr` | XDR and XDR-JSON | 2 | stable | 1 |
| `protocol.address-types` | Address types: G, C, and M | 2 | scheduled | 1 |
| `protocol.keys-recovery-phrases` | Keypairs, secret keys, and recovery phrases (SEP-5) | 2 | stable | 1 |

## Consensus, validators, and protocol upgrades (`network`)

12 leaves, 20 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `network.scp-consensus` | Stellar Consensus Protocol | 2 | stable | 2 |
| `network.running-a-node` | Running a validator or watcher node | 2 | scheduled | 2 |
| `network.node-operations` | History archives and node operations | 1 | scheduled | 1 |
| `network.tier1-quorum` | Tier 1 organizations and quorum sets | 2 | live | 2 |
| `network.upgrade-process` | How protocol and settings upgrades take effect | 2 | stable | 1 |
| `network.cap-process-status` | The CAP process and CAP status lookup | 2 | scheduled | 2 |
| `network.limits-settings` | Current network limits and how they change | 3 | scheduled | 2 |
| `network.current-protocol` | Current and next protocol version | 3 | scheduled | 2 |
| `network.protocol-history` | Protocol release history | 2 | scheduled | 2 |
| `network.incidents` | Network halts and protocol incidents | 2 | scheduled | 2 |
| `network.quorum-freeze` | Quorum Freeze (CAP-77) | 2 | scheduled | 1 |
| `network.protocol-meetings` | Protocol and developer meeting notes | 1 | scheduled | 1 |

## Assets, tokens, stablecoins, and real-world assets (`assets`)

13 leaves, 23 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `assets.issuance` | Issuing a classic asset | 2 | stable | 2 |
| `assets.trustlines` | Trustlines | 3 | stable | 2 |
| `assets.issuer-controls` | Issuer controls: authorization flags and clawback | 3 | stable | 2 |
| `assets.sac` | Stellar Asset Contract (SAC) | 3 | scheduled | 2 |
| `assets.token-interface` | Contract tokens and the token interface (SEP-41) | 2 | stable | 2 |
| `assets.asset-info-lists` | Publishing asset information and getting listed | 2 | scheduled | 1 |
| `assets.usdc` | USDC and EURC on Stellar | 3 | stable | 2 |
| `assets.stablecoin-landscape` | Stablecoins on Stellar | 2 | live | 2 |
| `assets.usdt0` | USDT0 on Stellar | 2 | scheduled | 1 |
| `assets.nft-vault-standards` | NFT and vault token standards | 1 | scheduled | 1 |
| `assets.rwa-issuers` | Real-world asset issuers and tokenized funds | 3 | live | 3 |
| `assets.regulated-tokenization` | Tokenizing a regulated asset (SEP-8, T-REX) | 2 | scheduled | 2 |
| `assets.public-sector-cbdc` | Government, public-sector, and CBDC use | 1 | scheduled | 1 |

## Smart contracts (`soroban`)

17 leaves, 29 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `soroban.overview` | Smart contract model and how it differs from the EVM | 2 | stable | 2 |
| `soroban.sdk-dialect-types` | Rust SDK, contract dialect, types, and Wasm size | 2 | scheduled | 1 |
| `soroban.deploy-lifecycle` | Deploying a contract: upload, instance, and constructor | 2 | scheduled | 2 |
| `soroban.storage-types` | Contract storage types | 3 | stable | 2 |
| `soroban.state-archival-ttl` | State archival, TTL, and restoration | 3 | scheduled | 3 |
| `soroban.authorization` | Contract authorization | 3 | stable | 3 |
| `soroban.contract-accounts` | Contract accounts, smart wallets, and passkeys | 2 | scheduled | 2 |
| `soroban.resource-fees` | Resource fees, metering, and rent | 3 | scheduled | 2 |
| `soroban.simulation` | Transaction simulation and footprints | 3 | stable | 2 |
| `soroban.events` | Contract events | 2 | scheduled | 1 |
| `soroban.testing` | Contract testing | 2 | scheduled | 1 |
| `soroban.errors-debugging` | Contract errors and debugging | 2 | stable | 2 |
| `soroban.upgrades` | Upgrading contracts and migrating storage | 2 | stable | 1 |
| `soroban.cross-contract` | Cross-contract calls and contract interfaces | 2 | stable | 1 |
| `soroban.crypto-zk` | Cryptographic host functions and zero-knowledge proofs | 2 | scheduled | 2 |
| `soroban.openzeppelin` | OpenZeppelin contracts and tooling | 2 | scheduled | 1 |
| `soroban.metadata-verification` | Contract metadata and source verification | 1 | scheduled | 1 |

## APIs, data, and indexing (`data`)

11 leaves, 18 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `data.rpc-api` | Stellar RPC API | 3 | scheduled | 2 |
| `data.horizon-api` | Horizon API | 2 | scheduled | 1 |
| `data.rpc-vs-horizon` | Choosing between RPC and Horizon | 3 | scheduled | 2 |
| `data.providers` | RPC and Horizon providers and endpoints | 2 | live | 2 |
| `data.result-codes` | Result codes and API errors | 3 | stable | 3 |
| `data.events-retention` | Reading events and RPC history retention | 2 | scheduled | 2 |
| `data.indexers` | Indexers | 2 | live | 1 |
| `data.galexie-ingest` | Galexie, the ingest SDK, and ledger data lakes | 1 | scheduled | 1 |
| `data.hubble-analytics` | Hubble and analytics datasets | 2 | scheduled | 1 |
| `data.explorers-status` | Block explorers and network status | 2 | live | 2 |
| `data.network-metrics` | Network and ecosystem metrics | 2 | live | 1 |

## SDKs and developer tooling (`tooling`)

12 leaves, 16 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `tooling.stellar-cli` | Stellar CLI | 3 | scheduled | 2 |
| `tooling.sdk-landscape` | Client SDK landscape | 2 | scheduled | 1 |
| `tooling.js-sdk` | JavaScript SDK | 3 | scheduled | 2 |
| `tooling.lab` | Stellar Lab | 1 | scheduled | 1 |
| `tooling.quickstart-local` | Quickstart and local networks | 2 | scheduled | 1 |
| `tooling.scaffold-bindings` | Scaffold Stellar, frontends, and generated bindings | 2 | scheduled | 1 |
| `tooling.wallet-connection` | Connecting a dapp to wallets | 2 | scheduled | 1 |
| `tooling.wallet-sdk` | Wallet SDK and wallet backend | 1 | scheduled | 1 |
| `tooling.version-compat` | Software versions for the current protocol | 3 | scheduled | 2 |
| `tooling.channel-accounts` | High-throughput submission and channel accounts | 2 | stable | 1 |
| `tooling.relayers` | Relayers and gasless transactions | 2 | scheduled | 1 |
| `tooling.renames-repos` | Renamed tools and canonical repositories | 2 | scheduled | 2 |

## SEPs, anchors, ramps, and payments (`standards`)

14 leaves, 21 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `standards.sep-process` | SEPs and their statuses | 2 | scheduled | 1 |
| `standards.stellar-toml` | stellar.toml (SEP-1) and home domains | 2 | stable | 2 |
| `standards.web-auth` | Web authentication (SEP-10 and SEP-45) | 2 | stable | 2 |
| `standards.deposit-withdrawal` | Deposit and withdrawal (SEP-24 and SEP-6) | 3 | stable | 2 |
| `standards.sep31-sep38` | Cross-border payments and quotes (SEP-31 and SEP-38) | 2 | stable | 2 |
| `standards.sep12-kyc` | KYC API and fields (SEP-12 and SEP-9) | 2 | stable | 1 |
| `standards.anchors-directory` | Anchors and where they operate | 3 | live | 2 |
| `standards.anchor-platform` | Anchor Platform | 2 | scheduled | 1 |
| `standards.disbursements` | Disbursement Platform and aid programs | 2 | scheduled | 2 |
| `standards.moneygram-ramps` | MoneyGram ramps | 2 | scheduled | 1 |
| `standards.wallet-utility-seps` | Signing links, message signing, and federation (SEP-7, SEP-53, SEP-2) | 1 | stable | 1 |
| `standards.cross-border-payments` | Cross-border payments and remittance corridors | 2 | live | 1 |
| `standards.exchange-integration` | Exchange integration | 2 | stable | 1 |
| `standards.payment-patterns` | Accepting payments and recurring payment designs | 2 | stable | 2 |

## DeFi and markets (`defi`)

10 leaves, 14 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `defi.sdex-orderbook` | The native order book (SDEX) | 2 | stable | 1 |
| `defi.liquidity-pools` | Protocol liquidity pools | 2 | stable | 1 |
| `defi.path-payments` | Path payments and conversion | 2 | stable | 1 |
| `defi.dex-amm` | Contract DEXes, AMMs, and aggregators | 2 | live | 2 |
| `defi.lending` | Lending and yield protocols | 2 | live | 2 |
| `defi.tvl-landscape` | DeFi TVL and protocol rankings | 2 | live | 2 |
| `defi.bridges` | Bridges and cross-chain transfers | 3 | live | 2 |
| `defi.oracles` | Oracles | 2 | live | 1 |
| `defi.prices-market-data` | Prices and market data | 2 | live | 1 |
| `defi.protocol-governance` | DeFi protocol governance | 1 | live | 1 |

## Security, audits, and compliance (`security`)

12 leaves, 14 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `security.contract-security` | Smart contract security practices | 3 | scheduled | 2 |
| `security.audit-registry` | Audit reports for ecosystem projects | 2 | live | 2 |
| `security.core-audits` | Audits of Core, RPC, and the SDKs | 1 | scheduled | 1 |
| `security.audit-bank` | Soroban Security Audit Bank | 2 | scheduled | 1 |
| `security.bug-bounty` | Bug bounty program | 1 | scheduled | 1 |
| `security.app-exploits` | Exploits of Stellar applications | 2 | scheduled | 1 |
| `security.key-custody` | Key management and custody | 2 | scheduled | 1 |
| `security.signing-safety` | Transaction signing safety | 2 | stable | 1 |
| `security.aml-screening` | AML, sanctions screening, and analytics vendors | 1 | live | 1 |
| `security.regulation-policy` | Regulation and SDF policy positions | 2 | scheduled | 1 |
| `security.privacy` | Privacy on Stellar | 2 | scheduled | 1 |
| `security.quantum-preparedness` | Quantum preparedness | 1 | scheduled | 1 |

## Wallets, retail use, and support (`wallets`)

11 leaves, 15 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `wallets.landscape` | Wallets that support Stellar | 2 | live | 2 |
| `wallets.sdf-wallet` | SDF's wallet (Freighter, now Varial) | 2 | scheduled | 1 |
| `wallets.wrong-memo` | Missing or wrong memo to an exchange | 3 | stable | 2 |
| `wallets.wrong-network` | Wrong-network sends and incompatible wallets | 2 | stable | 2 |
| `wallets.scams-phishing` | Scams, phishing, and impersonation | 3 | live | 2 |
| `wallets.lost-keys` | Lost keys and account recovery (SEP-30) | 2 | stable | 1 |
| `wallets.unsolicited-assets` | Unknown tokens and unsolicited payments | 2 | stable | 1 |
| `wallets.consumer-apps` | Consumer payment apps and cards | 2 | live | 1 |
| `wallets.support-channels` | Where to get help | 2 | scheduled | 1 |
| `wallets.pi-network` | Pi Network and other Stellar-derived networks | 2 | stable | 1 |
| `wallets.history-export` | Transaction history export and taxes | 1 | stable | 1 |

## SDF, XLM, and the ecosystem (`ecosystem`)

12 leaves, 18 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `ecosystem.sdf` | The Stellar Development Foundation and its leadership | 2 | live | 2 |
| `ecosystem.sdf-mandate-holdings` | SDF mandate and XLM holdings | 2 | live | 1 |
| `ecosystem.xlm-supply` | XLM supply, the 2019 burn, and the end of inflation | 3 | scheduled | 3 |
| `ecosystem.xlm-staking-rewards` | XLM staking and the 2026 rewards proposal | 2 | scheduled | 2 |
| `ecosystem.xlm-role` | What XLM is for | 2 | stable | 1 |
| `ecosystem.xlm-markets` | XLM listings and investment products | 1 | live | 1 |
| `ecosystem.history-origins` | Origins and history of Stellar | 2 | stable | 1 |
| `ecosystem.chain-comparisons` | Stellar compared with other networks | 2 | scheduled | 1 |
| `ecosystem.strategy-roadmap` | SDF strategy, roadmap, and reports | 2 | scheduled | 1 |
| `ecosystem.project-directory` | Finding and identifying ecosystem projects | 3 | live | 3 |
| `ecosystem.project-builders` | Who builds and maintains what | 2 | live | 1 |
| `ecosystem.institutional-adoption` | Institutional and enterprise adoption | 2 | live | 1 |

## Funding, programs, and events (`funding`)

11 leaves, 13 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `funding.scf-overview` | Stellar Community Fund: what it is and what it awards | 3 | scheduled | 2 |
| `funding.scf-apply` | Applying to SCF: tracks, rules, and review | 2 | scheduled | 2 |
| `funding.scf-rounds-status` | Current SCF round and schedule | 2 | live | 1 |
| `funding.scf-rfps` | Open RFPs | 2 | live | 1 |
| `funding.scf-funded-projects` | SCF-funded projects and amounts | 2 | live | 1 |
| `funding.scf-supporting-programs` | Instawards, Public Goods, Liquidity, and Growth Hack awards | 2 | scheduled | 1 |
| `funding.other-sdf-funding` | Enterprise Fund and other SDF funding | 1 | scheduled | 1 |
| `funding.hackathons` | Hackathons and prior-art builds | 2 | live | 1 |
| `funding.meridian` | Meridian | 2 | scheduled | 1 |
| `funding.community-programs` | Ambassadors, chapters, and community programs | 1 | scheduled | 1 |
| `funding.service-providers` | Service providers and partners for hire | 1 | live | 1 |

## AI and agent tooling (`ai`)

7 leaves, 9 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `ai.x402` | x402 payments on Stellar | 2 | scheduled | 2 |
| `ai.mpp-agentic-protocols` | Machine Payments Protocol and other agentic protocols | 2 | scheduled | 2 |
| `ai.agent-cli` | Stellar CLI for agents | 2 | scheduled | 1 |
| `ai.mcp-servers` | MCP servers for Stellar | 2 | live | 1 |
| `ai.skills-llms-docs` | Agent skills and LLM-readable docs | 2 | scheduled | 1 |
| `ai.agent-delegation` | Delegated spending and agent wallets | 2 | scheduled | 1 |
| `ai.ecosystem-projects` | AI projects in the ecosystem | 1 | live | 1 |

## Trap and safety behaviors (`behavior`)

10 leaves, 16 cases.

| Leaf id | Title | Weight | Volatility | Cases |
|---|---|---|---|---|
| `behavior.scam-check` | Scam check | 3 | stable | 2 |
| `behavior.prompt-injection` | Prompt injection | 3 | stable | 2 |
| `behavior.fabrication-bait` | Fabrication bait | 3 | stable | 2 |
| `behavior.no-info-honesty` | No-information honesty | 3 | stable | 2 |
| `behavior.freshness-honesty` | Freshness honesty | 2 | stable | 2 |
| `behavior.out-of-scope` | Out of scope | 2 | stable | 1 |
| `behavior.paid-action-refusal` | Paid action refusal | 2 | stable | 1 |
| `behavior.ambiguity` | Ambiguity | 2 | stable | 1 |
| `behavior.speculation` | Speculation | 2 | stable | 1 |
| `behavior.wallet-authority` | Wallet authority boundary | 3 | stable | 2 |
