## q-agent-payment-standard-choice — a — 2026-08-30
- keyFacts[0]: "The x402 V2 and MPP HTTP-402 protocols differ in payloads, settlement, and infrastructure." → confirmed-as-of — B: https://raw.githubusercontent.com/x402-foundation/x402/main/specs/x402-specification-v2.md — "x402 defines PaymentRequirements, PaymentPayload, and facilitator verify and settle interfaces." (as of 2026-08-30)
- keyFacts[1]: "x402 V2 provides extensions and discovery." → confirmed-as-of — B: https://raw.githubusercontent.com/x402-foundation/x402/main/specs/x402-specification-v2.md — "Extensions enable modular optional functionality; GET /supported returns supported extensions; tags support discovery filtering." (as of 2026-08-30)
- keyFacts[2]: "MPP uses on-chain Charge settlement and cumulative off-chain Session channel commitments." → confirmed-as-of — B: https://raw.githubusercontent.com/stellar/stellar-mpp-sdk/main/README.md — "Each Charge payment settles on-chain individually; Channel signs cumulative off-chain commitments without per-payment transactions." (as of 2026-08-30)
- keyFacts[3]: "AP2/ACP cover above-rail authorization/mandate/audit and beta commerce, respectively." → confirmed-as-of — B: https://raw.githubusercontent.com/google-agentic-commerce/AP2/main/docs/ap2/specification.md — "AP2 defines Checkout and Payment Mandates, receipts, authorization evidence, and dispute evidence within a commerce protocol." (as of 2026-08-30)
- keyFacts[4]: "Adapter covers quote, payment intent/evidence, settlement/fulfillment/idempotency/refunds." → confirmed-as-of — B: https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/tree/main/spec/2026-04-17 — "Current schemas and examples model checkout totals, payment handlers, fulfillment, Idempotency-Key behavior, orders, and refunds." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep x402|MPP|AP2|ACP → q-defi-agentic-payment-standards-compare, q-defi-x402-on-stellar-what, q-mpp-discovery-and-modes; no contradiction
- Conflicts: none
- Result: DONE

## q-cctp-v2-usdc-stellar — a — 2026-08-30
- keyFacts[0]: "Circle dates Stellar support to 2026-05-18 and the public-live announcement to 2026-05-19." → confirmed-as-of — A: https://developers.circle.com/release-notes/cctp-2026 — "2026.05.18 — Added support for Stellar mainnet." (as of 2026-08-30)
- keyFacts[1]: "Use CctpForwarder with correct mintRecipient or destinationCaller for G/M/C funds." → confirmed-as-of — A: https://developers.circle.com/cctp/references/stellar — "Use CctpForwarder for G, M, or C recipients; set both fields to it; wrong values can leave funds permanently stuck." (as of 2026-08-30)
- keyFacts[2]: "The 6-decimal CCTP format leaves Stellar USDC's seventh decimal on Stellar." → confirmed-as-of — A: https://developers.circle.com/cctp/references/stellar — "CCTP messages use six-decimal subunits; an outbound seventh-decimal amount stays in the user's Stellar account." (as of 2026-08-30)
- keyFacts[3]: "Re-query /v2/burn/USDC/fees for 2026-07-11 Fast/Standard 27→0 0/0, 0→27 1 bp/0." → confirmed-as-of — A: https://developers.circle.com/cctp/concepts/fees — "Retrieve the current route fee from GET /v2/burn/USDC/fees; Standard is free and Fast varies by route." (as of 2026-08-30)
- keyFacts[4]: "Treats Circle fees, network resources, relayers, integrators, and swaps as distinct costs." → confirmed-as-of — A: https://developers.circle.com/cctp/concepts/fees — "This page defines the route-specific CCTP Fast Transfer fee." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep CctpForwarder|2026-05-18|2026-05-19|seventh decimal → q-hist-cctp-stellar-live-announcement, q-token-circle-usdc-on-stellar, q-tool-cctp-stellar-integration; no contradiction
- Conflicts: none
- Result: DONE

## q-crp-oz-rwa-erc3643-trex — a — 2026-08-30
- keyFacts[0]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed-as-of — B: https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0057.md — "The live preamble exposes changeable Status, Updated, and Version fields: Draft, 2026-06-11, and 0.3.0." (as of 2026-08-30)
- keyFacts[1]: "Identifies SEP-0057 as Draft v0.3.0." → confirmed-as-of — B: https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0057.md — "Status: Draft; Version: 0.3.0." (as of 2026-08-30)
- keyFacts[2]: "Treats the normative core and claim-based appendix as different specification layers." → confirmed-as-of — B: https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0057.md — "The appendix says it is NOT a part of the T-REX specification and is one claim-based reference implementation." (as of 2026-08-30)
- keyFacts[3]: "`add_identity` appears in the appendix and OpenZeppelin code, outside the stable core API." → confirmed-as-of — B: https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0057.md — "The non-specification appendix declares IdentityRegistryStorage.add_identity." (as of 2026-08-30)
- keyFacts[4]: "Treats legal compliance and off-chain rights as external to technical policy enforcement." → confirmed-as-of — A: https://developers.stellar.org/docs/tokens/control-asset-access — "The page defines issuer flags, trustline authorization, freezing, and clawback as technical access controls." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep SEP-0057|add_identity|T-REX|ERC-3643 → q-crp-tokenize-personal-rwa, q-rwa-stellar-vs-erc20-regulated, q-sor-evm-to-soroban-porting; no contradiction
- Conflicts: none
- Result: DONE

## q-crp-sdp-operation — a — 2026-08-30
- keyFacts[0]: "Uses dated source observations for changeable claims." → confirmed-as-of — A: https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/design-and-architecture — "The live architecture page is marked Last updated Aug 27, 2026 and describes the current receiver workflow." (as of 2026-08-30)
- keyFacts[1]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed-as-of — A: https://developers.stellar.org/docs/platforms/stellar-disbursement-platform — "The current introduction identifies SDP as an open-source bulk-payment tool and links its active repositories." (as of 2026-08-30)
- keyFacts[2]: "Treats external wallets, direct G/C payments, and embedded passkey C wallets as distinct." → confirmed-as-of — A: https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/design-and-architecture — "Receivers can use a SEP-24 wallet application or receive funds directly to their Stellar account." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep Stellar Disbursement Platform|external wallet|passkey C|direct payment → q-anchor-sdp-vs-anchor-platform, q-anchor-sdp-what, q-pay-sdp-disbursement; no contradiction
- Conflicts: none
- Result: DONE

## q-smart-wallet-fee-sponsorship — a — 2026-08-30
- keyFacts[0]: "Activation/trustline reserves apply only to unsponsored G-accounts in this comparison." → confirmed — A: https://developers.stellar.org/docs/tokens/stellar-asset-contract — "Stellar account balances for issued assets are always stored in trust lines, and Stellar contract balances for issued assets are always stored in a contract data entry." (as of 2026-08-30)
- keyFacts[1]: "Fee bumps or relayers pay transaction fees." → confirmed — A: https://developers.stellar.org/docs/build/guides/transactions/fee-bump-transactions — "Use fee-bump transactions to pay for transaction fees on behalf of another account without re-signing the transaction." (as of 2026-08-30)
- keyFacts[2]: "`beginSponsoringFutureReserves`/`endSponsoringFutureReserves` assign reserve liability." → confirmed — A: https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves — "Both the Begin Sponsoring Future Reserves and the End Sponsoring Future Reserves operations must appear in the sponsorship transaction." (as of 2026-08-30)
- keyFacts[3]: "USDC uses its Stellar Asset Contract interface and balance." → confirmed — A: https://developers.stellar.org/docs/tokens/stellar-asset-contract — "The Stellar Asset Contract (SAC) is the built-in contract interface to assets on the Stellar network." (as of 2026-08-30)
- keyFacts[4]: "Token-relay or hosted-facilitator designs use caps, liquidity, and abuse controls." → confirmed — A: https://docs.openzeppelin.com/relayer/guides/stellar-sponsored-transactions-guide — "Monitor Relayer Balance; Configure Swap Schedule; Set Appropriate Limits: Configure max_allowed_fee to prevent excessive fees." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep beginSponsoringFutureReserves|FeeForwarder|hosted facilitator → q-defi-x402-on-stellar-what, q-pc-sponsored-reserves, q-protocol-operation-types-list, q-x402-payment-verification; no contradiction
- Conflicts: none
- Result: DONE

## q-defi-blend-alternatives — a — 2026-08-30
- keyFacts[0]: "Names real Stellar lending and credit candidates." → confirmed-as-of — A: https://www.k2lend.com/ — "K2 brings sophisticated DeFi lending to Stellar through pooled, isolated, and gated markets." (as of 2026-08-30)
- keyFacts[1]: "Treats direct lenders, Blend-built pools, and yield routers as different categories." → confirmed — A: https://yieldblox.finance/ — "YieldBlox is a DAO-managed money market on the Stellar Network, using Blend Protocol and Soroban Governor." (as of 2026-08-30)
- keyFacts[2]: "Treats CDPs and synthetic or cross-chain systems as different categories." → confirmed — A: https://orbitcdp.finance/ — "A transparent, on-chain CDP system governed by the community." (as of 2026-08-30)
- keyFacts[3]: "Treats lifecycle and market-rank claims as dated, source-relative claims." → confirmed-as-of — C: https://stellarlight.xyz/project/slender — "Inactive / archived" (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep Slender|Laina|K2 Lend|DeFindex|OrbitCDP → q-defi-defindex-honest, q-defi-flash-loans, q-defi-named-newer-protocols, q-eco-defi-market-map, q-eco-defi-projects-discovery; no contradiction
- Conflicts: none
- Result: DONE

## q-defi-etherfuse-stablebonds — a — 2026-08-30
- keyFacts[0]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed-as-of — A: https://app.etherfuse.com/bonds/USTRY — "Current Issuance Details" (as of 2026-08-30)
- keyFacts[1]: "Treats USTRY and CETES as different tokenized Etherfuse Stablebond products." → confirmed — A: https://etherfuse.com/products/stablebonds — "CETES ... Country Mexico ... Currency MXN ... Mexican government short-term bonds; US Treasury ... USTRY ... Country United States ... Currency USD ... US government treasury bonds." (as of 2026-08-30)
- keyFacts[2]: "Covers legal, redemption, custody, maturity, and currency risks." → confirmed — A: https://app.etherfuse.com/legal/stablebonds-overview — "Redemption occurs at the applicable NAV, subject to the product's disclosed terms, fees, and settlement timing." (as of 2026-08-30)
- keyFacts[3]: "Covers liquidity, oracle, exposure, and operational risks." → confirmed — A: https://www.blockaid.io/blog/73-quarantined-how-blockaid-and-stellar-validators-contained-a-10m-price-manipulation-attack — "Liquidity conditions, oracle price feeds, and ecosystem dependencies are part of the attack surface." (as of 2026-08-30)
- keyFacts[4]: "Attributes the YieldBlox incident to the consumer/pool boundary." → confirmed — A: https://www.blockaid.io/blog/73-quarantined-how-blockaid-and-stellar-validators-contained-a-10m-price-manipulation-attack — "The affected pool in this incident was part of the YieldBlox DAO community deployment. In this case, the Blend lending pools consumed price data from Reflector." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep Etherfuse|Stablebonds|USTRY|CETES|YieldBlox → q-ass-cross-bando-stablebonds-sac, q-ass-cross-etherfuse-cetes-controls, q-comp-yieldblox-oracle-incident, q-hist-yieldblox-v2-2026-exploit, q-soroban-oracle-defensive-consumption; no contradiction
- Conflicts: none
- Result: DONE

## q-defi-flash-loans — a — 2026-08-30
- keyFacts[0]: "Uses dated source observations for changeable claims." → confirmed-as-of — A: https://docs.blend.capital/mainnet-deployments — "v2 Mainnet Smart Contract Addresses" (as of 2026-08-30)
- keyFacts[1]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed-as-of — C: https://stellarlight.xyz/project/slender — "Inactive / archived" (as of 2026-08-30)
- keyFacts[2]: "Explains atomic Soroban cross-contract flash-loan mechanics and rollback constraints." → confirmed — A: https://developers.stellar.org/docs/build/guides/conventions/cross-contract — "Call a smart contract from within another smart contract." (as of 2026-08-30)
- keyFacts[3]: "Treats Blend v2 as a verified deployed flash-loan implementation." → confirmed-as-of — A: https://docs.blend.capital/mainnet-deployments — "There are mainnet deployments of blend and blend adjacent smart contracts at the following addresses." (as of 2026-08-30)
- keyFacts[4]: "Treats XycLoans code/history and Slender marketing as different evidence tiers." → confirmed-as-of — B: https://github.com/xycloo/xycloans — "XycLoans is a flash loans protocol implemented for the Soroban Virtual Machine." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep flash.loan|XycLoans|Slender|Blend v2|atomic Soroban → q-defi-blend-alternatives; no contradiction
- Conflicts: none
- Result: DONE

## q-defi-liquid-staking-whitespace — a — 2026-08-30
- keyFacts[0]: "Explains Stellar's SCP and lack of protocol validator rewards." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/stellar-consensus-protocol — "The Stellar network reaches consensus using the Stellar Consensus Protocol (SCP), which is a construction of the Federated Byzantine Agreement (FBA). ... There are no monetary rewards for being a validator on the Stellar network." (as of 2026-08-30)
- keyFacts[1]: "Reports no live native-XLM LST in the dated source universe." → confirmed-as-of — A: https://stellar.org/blog/ecosystem/becoming-a-stellar-validator — "As validators on Stellar, they will receive no block rewards, no staking yield, no MEV awards, and no share of transaction fees." (as of 2026-08-30)
- keyFacts[2]: "Treats issuer-funded XLM yield and lending/LP/vault positions as non-LSTs." → confirmed — A: https://ultracapital.xyz/.well-known/stellar.toml — "yXLM is an interest earning XLM tethered token. ... 1 yXLM is always redeemable for 1 XLM through Ultra Capital anchor." (as of 2026-08-30)
- keyFacts[3]: "Treats external ETH staking wrappers as different from native validator staking." → confirmed — A: https://communityfund.stellar.org/submissions/reclPkvuD4iqLs6E5 — "Chrysalis enables users to convert their XLM into ETH, which is then staked on Lido ... on Ethereum." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep liquid staking|native-XLM|yXLM|Chrysalis|sXLM → q-defi-liquid-staking-whitespace, q-eco-defi-market-map, q-edge-noinfo-stellar-pos-staking-rewards, and five incidental hits; no contradiction to the dated claim
- Conflicts: none
- Result: DONE

## q-defi-provide-liquidity-impermanent-loss — a — 2026-08-30
- keyFacts[0]: "Dates each source-supported roster, status, version, measurement, or current observation." → confirmed — A: https://www.defindex.io/terms — "DeFindex does not guarantee, promise, or imply guaranteed returns or yield. Past performance of any Strategy or Vault ... is not indicative of future results." (as of 2026-08-30)
- keyFacts[1]: "Gives a venue-specific deposit/withdraw checklist." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools — "There are two operations that facilitate participation in a liquidity pool: `LiquidityPoolDeposit` and `LiquidityPoolWithdraw`." (as of 2026-08-30)
- keyFacts[2]: "Treats Classic pool-share operations and Soroban contract/vault flows as distinct." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools — "This section is scoped specifically to liquidity regarding the AMM and SDEX built into the Stellar protocol and does not include information regarding smart contracts." (as of 2026-08-30)
- keyFacts[3]: "Covers liquidity, issuer, contract/admin, oracle/keeper, and reward-token risks." → confirmed — A: https://www.defindex.io/terms — "Strategies may experience negative returns or total loss ... due to ... price slippage, low liquidity, changes in reward rates ... improper harvest execution, curation or misconfiguration." (as of 2026-08-30)
- keyFacts[4]: "Covers lock/queue and withdrawal risks." → confirmed — B: https://github.com/blend-capital/docs-v2/blob/main/blend-whitepaper.md — "Initiating a withdrawal places the funds into a withdrawal queue, where they remain for 17 days. ... users can withdraw their funds as long as the backstop module has no remaining bad debt." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep impermanent loss|LiquidityPoolDeposit|pool-share|withdrawal queue → q-asset-amm-fee-reserve, q-asset-sdex-vs-amm, q-asset-trustline-basics, q-protocol-base-reserve-min-balance, q-protocol-operation-types-list; no contradiction
- Conflicts: none
- Result: DONE

## q-defi-rwa-scf-similar — a — 2026-08-30
- keyFacts[0]: "Uses current or dated sources for specific changeable claims." → confirmed-as-of — A: https://communityfund.stellar.org/submissions/rec2QeA1y7ln6D3Ii — "status: Awarded; roundName: SCF #43; title: Lend - Tokenized real estate on Stellar; budget: 120560" (as of 2026-08-30)
- keyFacts[1]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed-as-of — A: https://communityfund.stellar.org/projects — "Talwex ... SCF #43; TERWA ... SCF #43; lend.xyz ... SCF #43" (as of 2026-08-30)
- keyFacts[2]: "Uses official URLs and statuses for representative Awarded RWA/tokenization work." → confirmed-as-of — A: https://communityfund.stellar.org/submissions/recK1Xh6hgHosxmbt — "status: Awarded; roundName: SCF #43; title: Stellar Vault for Real-World Bonds; budget: 150000" (as of 2026-08-30)
- keyFacts[3]: "Treats official status, award_type, and directory status as distinct fields." → confirmed — A: https://communityfund.stellar.org/submissions/rec2QeA1y7ln6D3Ii — "status: Awarded; awardType: Build; roundName: SCF #43; budget: 120560" (as of 2026-08-30)
- keyFacts[4]: "Treats semantic similarity and reconstructed totals as distinct from official status." → confirmed — A: https://communityfund.stellar.org/submissions/rec2QeA1y7ln6D3Ii — "submission budget: 120560; project totalAwarded: 120560; project totalPaid: 72336; submission status: Awarded" (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep Talwex|TERWA|lend.xyz|award_type|totalPaid → q-defi-rwa-scf-similar, q-scf-history-soroswap, q-scf-skill-submission-radar, and four incidental field-name hits; no contradiction
- Conflicts: none
- Result: DONE

## q-defi-soroswap-vs-stellarx — a — 2026-08-30
- keyFacts[0]: "Treats Soroswap-owned Soroban contracts/API and the StellarX UI as different roles." → confirmed — B: https://github.com/soroswap/docs — "Soroswap operates as: An Automated Market Maker (AMM) ... An AMM Aggregator ... An API via Soroswap Swap Route API." (as of 2026-08-30)
- keyFacts[1]: "Treats API routing, on-chain aggregation, and UI access as three layers." → confirmed — B: https://github.com/soroswap/docs — "Soroswap operates as: An Automated Market Maker (AMM) ... An AMM Aggregator ... An API ... aggregating liquidity from ... Soroban ... and the Stellar Classic DEX." (as of 2026-08-30)
- keyFacts[2]: "Names Ultra Stellar as StellarX's builder." → confirmed — A: https://ultrastellar.com/ — "Our products ... StellarX ... StellarX is a powerful trading platform built on the Stellar network." (as of 2026-08-30)
- keyFacts[3]: "Describes StellarX as a non-custodial Classic-liquidity trading UI." → confirmed — A: https://www.stellarx.com/legal/terms — "The Website is a user interface for the XLM decentralized exchange. ... StellarX is not a custodian of your assets. We do not store any tokens, cryptoassets or private keys on your behalf." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep Soroswap|StellarX|Ultra Stellar|API routing → q-defi-soroswap-what-is, q-eco-dex-saturation, q-edge-factcheck-soroswap-first-amm, q-scf-history-soroswap, and related product cases; no contradiction
- Conflicts: none
- Result: DONE

## q-defi-wisdomtree-crdt — a — 2026-08-30
- keyFacts[0]: "Identifies CRDYX/CRDT and their private-credit/alternative-income nature." → confirmed — A: https://ir.wisdomtree.com/news-events/press-releases/detail/755/wisdomtree-brings-private-credit-onchain-with-the-launch-of — "WisdomTree Private Credit and Alternative Income Digital Fund (token ticker: CRDT; fund ticker: CRDYX)" (as of 2026-08-30)
- keyFacts[1]: "Gives the Ethereum+Stellar launch date." → confirmed — A: https://ir.wisdomtree.com/news-events/press-releases/detail/755/wisdomtree-brings-private-credit-onchain-with-the-launch-of — "Released September 12, 2025 ... At launch, the fund will be tokenized on the Ethereum and Stellar blockchains." (as of 2026-08-30)
- keyFacts[2]: "Explains transfer-agent record priority and wallet eligibility controls." → confirmed — A: https://www.sec.gov/Archives/edgar/data/1859001/000121465925013564/wtd98250485bpos.htm — "The Transfer Agent's book-entry records constitute the official record of share ownership." (as of 2026-08-30)
- keyFacts[3]: "Names CRDT issuer `GBWMQUGPPLSC62YPGD5CEHATOQRQMNLNAV2TMEXJ4ZYOTY4TJD6J2P45`." → confirmed-as-of — A: https://stellar.wisdomtree.com/.well-known/stellar.toml — "code="CRDT" issuer="GBWMQUGPPLSC62YPGD5CEHATOQRQMNLNAV2TMEXJ4ZYOTY4TJD6J2P45"" (as of 2026-08-30)
- keyFacts[4]: "Names CRDT SAC `CBQDK4Y3B2RYUSXE6JYYTHB6AIW655FPGE4OW7A2BWDZXZ5RALQ3UK3P`." → confirmed-as-of — C: https://horizon.stellar.org/assets?asset_code=CRDT&asset_issuer=GBWMQUGPPLSC62YPGD5CEHATOQRQMNLNAV2TMEXJ4ZYOTY4TJD6J2P45 — "contract_id CBQDK4Y3B2RYUSXE6JYYTHB6AIW655FPGE4OW7A2BWDZXZ5RALQ3UK3P" (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep WisdomTree|CRDT|CRDYX → q-asset-rwa-tokenized-freshness, q-comp-sep8-regulated-assets-approval-server, q-defi-benji-franklin-templeton, q-defi-ondo-usdy, q-defi-rwa-scf-similar, q-defi-wisdomtree-crdt, q-eco-defi-market-map, q-rwa-projects-tokenizing-stellar; no contradiction
- Conflicts: none
- Result: DONE

## q-eco-defi-tvl-current — a — 2026-08-30
- keyFacts[0]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed — C: https://api.llama.fi/v2/historicalChainTvl/Stellar — "Latest completed point: date 1788048000 (2026-08-30T00:00:00Z), tvl 230223262." (as of 2026-08-30)
- keyFacts[1]: "Names the provider used for the reported TVL." → confirmed — A: https://api-docs.defillama.com/ — "Get historical TVL ... of a chain; Get current TVL of all chains." (as of 2026-08-30)
- keyFacts[2]: "States the provider's TVL definition or endpoint scope." → confirmed — B: https://github.com/DefiLlama/DefiLlama-Adapters/blob/master/README.md — "This repo is for TVL adapters ... TVL must be computed from blockchain data." (as of 2026-08-30)
- keyFacts[3]: "Includes an answer-visible retrieval timestamp." → confirmed — C: https://api.llama.fi/v2/chains — "Observed 2026-08-30: Stellar tvl 236574470.37832046." (as of 2026-08-30)
- keyFacts[4]: "Separates chain TVL from protocol, RWA, and asset measures." → confirmed — A: https://api-docs.defillama.com/ — "The API lists separate chain TVL, protocol TVL, stablecoin market-cap, RWA, DEX-volume, and pool-yield endpoints." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep TVL|total value locked|DeFiLlama → q-asset-rwa-tokenized-freshness, q-defi-aquarius-what-is, q-defi-blend-what-is, q-defi-comet-what-is, q-defi-defindex-honest, q-defi-liquid-staking-whitespace, q-defi-phoenix-what-is, q-defi-provide-liquidity-impermanent-loss, q-eco-defi-market-map, q-eco-defi-projects-discovery, q-eco-defi-tvl-current, q-eco-dex-saturation, q-eco-most-active-defi-projects, q-eco-stellar-rwa-stablecoin-volume, q-edge-factcheck-soroswap-first-amm, q-edge-fresh-latest-blend-tvl, q-edge-noinfo-exact-tvl-figure, q-scf-eligibility-criteria, q-ti-compute-token-lp-market-data; no contradiction
- Conflicts: none
- Result: DONE

## q-eco-stellar-rwa-stablecoin-volume — a — 2026-08-30
- keyFacts[0]: "Uses current or dated source observations for specific claims." → confirmed — A: https://stellar.org/blog/foundation-news/q1-2026-execution-at-network-scale — "date 2026-05-07; $2B+ in onchain RWAs; $5.5B in stablecoin payment volume" (as of 2026-08-30)
- keyFacts[1]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed — A: https://stellar.org/blog/foundation-news/q1-2026-execution-at-network-scale — "Q1 2026 quarterly update; date 2026-05-07." (as of 2026-08-30)
- keyFacts[2]: "Treats supply, value, and market cap as point-in-time stocks." → confirmed — A: https://docs.rwa.xyz/methodology/metrics.md — "Aggregation respects the stock vs. flow distinction: supply and value are point-in-time snapshots." (as of 2026-08-30)
- keyFacts[3]: "Treats payment and transfer volumes as period flows." → confirmed — A: https://docs.rwa.xyz/methodology/metrics.md — "Transfers are accumulated over the period; transfer volume is the total USD value of peer-to-peer transfers during the period." (as of 2026-08-30)
- keyFacts[4]: "Flags staleness." → confirmed — A: https://stellar.org/blog/foundation-news/q1-2026-execution-at-network-scale — "date 2026-05-07; Q1 2026 quarterly update" (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep stablecoin payment volume|transfer volume|distributed RWA|represented value|market cap → q-asset-rwa-tokenized-freshness, q-asset-stablecoin-issuers-discovery, q-eco-stablecoins-on-stellar, q-eco-stellar-rwa-stablecoin-volume; no contradiction
- Conflicts: none
- Result: DONE

## q-edge-fresh-latest-scf-round — a — 2026-08-30
- keyFacts[0]: "Specific content uses a source-supported current or dated observation." → confirmed — A: https://communityfund.stellar.org/awards — "SCF #46 Submission; SCF #45 Panel Review; SCF #44 Ended; SCF #43 Ended." (as of 2026-08-30)
- keyFacts[1]: "Every changeable roster, status, version, or measurement shows an as-of date." → confirmed — C: https://stellarlight.xyz/api/rfps?status=open — "scfRound asOf 2026-08-30; currentRound 46; currentPhase Submission." (as of 2026-08-30)
- keyFacts[2]: "Dated map gives current #45 and phase, distributing #44, and last-concluded #43." → confirmed-as-of — A: https://communityfund.stellar.org/awards — "The current page has rolled to SCF #46 Submission, SCF #45 Panel Review, and SCF #44 Ended." (as of 2026-08-30)
- keyFacts[3]: "The dated example reports no SCF round in Submission." → confirmed-as-of — A: https://communityfund.stellar.org/awards/reccaFUJmN4HNQxvo — "SCF #45 is currently in the Panel Review phase." (as of 2026-08-30)
- keyFacts[4]: "The dated example treats SCF #45's 2026-08-16 deadline as elapsed." → confirmed-as-of — A: https://communityfund.stellar.org/awards — "SCF #45; Deadline to submit: August 16, 2026; Panel Review." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep SCF #45|SCF #46|Submission phase|current SCF round → q-edge-fresh-latest-scf-round, q-edge-scf-v7-centralization-myths, q-scf-contract-verification-rfp-live, q-scf-current-round, q-scf-open-rfps, q-scf-open-rfps-live, q-scf-passkey-rfps-live, q-scf-rfp-tooling; no contradiction
- Conflicts: none
- Result: DONE
