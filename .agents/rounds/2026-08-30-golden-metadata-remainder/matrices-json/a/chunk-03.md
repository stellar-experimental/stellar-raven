## q-defi-liquid-staking-whitespace — a — 2026-08-30
+- keyFacts[0]: "Explains Stellar's SCP and lack of protocol validator rewards." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/stellar-consensus-protocol — "There are no monetary rewards for being a validator on the Stellar network." (as of 2026-08-30)
+- keyFacts[1]: "Reports no live native-XLM LST in the dated source universe." → confirmed-as-of — A: https://stellar.org/blog/ecosystem/becoming-a-stellar-validator — "As validators on Stellar, they will receive no block rewards, no staking yield, no MEV awards, and no share of transaction fees." (as of 2026-08-30)
+- keyFacts[2]: "Treats issuer-funded XLM yield and lending/LP/vault positions as non-LSTs." → confirmed — A: https://ultracapital.xyz/.well-known/stellar.toml — "yXLM is an interest earning XLM tethered token. ... 1 yXLM is always redeemable for 1 XLM through Ultra Capital anchor." (as of 2026-08-30)
+- keyFacts[3]: "Treats external ETH staking wrappers as different from native validator staking." → confirmed — A: https://communityfund.stellar.org/submissions/reclPkvuD4iqLs6E5 — "Chrysalis enables users to convert their XLM into ETH, which is then staked on Lido ... on Ethereum." (as of 2026-08-30)
+- Sibling sweep 2026-08-30: grep liquid staking|native-XLM|yXLM|Chrysalis|sXLM → q-defi-liquid-staking-whitespace, q-eco-defi-market-map, q-edge-noinfo-stellar-pos-staking-rewards, and five incidental hits; no contradiction to the dated claim
+- Conflicts: none
+- Result: DONE
+
+## q-defi-provide-liquidity-impermanent-loss — a — 2026-08-30
+- keyFacts[0]: "Dates each source-supported roster, status, version, measurement, or current observation." → confirmed — A: https://www.defindex.io/terms — "Past performance of any Strategy or Vault ... is not indicative of future results." (as of 2026-08-30)
+- keyFacts[1]: "Gives a venue-specific deposit/withdraw checklist." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools — "There are two operations that facilitate participation in a liquidity pool: `LiquidityPoolDeposit` and `LiquidityPoolWithdraw`." (as of 2026-08-30)
+- keyFacts[2]: "Treats Classic pool-share operations and Soroban contract/vault flows as distinct." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools — "This section is scoped specifically to liquidity regarding the AMM and SDEX built into the Stellar protocol and does not include information regarding smart contracts." (as of 2026-08-30)
+- keyFacts[3]: "Covers liquidity, issuer, contract/admin, oracle/keeper, and reward-token risks." → confirmed — A: https://www.defindex.io/terms — "Strategies may experience negative returns or total loss ... due to ... low liquidity, changes in reward rates ... improper harvest execution, curation or misconfiguration." (as of 2026-08-30)
+- keyFacts[4]: "Covers lock/queue and withdrawal risks." → confirmed — B: https://github.com/blend-capital/docs-v2/blob/main/blend-whitepaper.md — "Initiating a withdrawal places the funds into a withdrawal queue, where they remain for 17 days." (as of 2026-08-30)
+- Sibling sweep 2026-08-30: grep impermanent loss|LiquidityPoolDeposit|pool-share|withdrawal queue → q-asset-amm-fee-reserve, q-asset-sdex-vs-amm, q-asset-trustline-basics, q-protocol-base-reserve-min-balance, q-protocol-operation-types-list; no contradiction
+- Conflicts: none
+- Result: DONE
+
+## q-defi-rwa-scf-similar — a — 2026-08-30
+- keyFacts[0]: "Uses current or dated sources for specific changeable claims." → confirmed-as-of — A: https://communityfund.stellar.org/submissions/rec2QeA1y7ln6D3Ii — "status: Awarded; roundName: SCF #43; title: Lend - Tokenized real estate on Stellar; budget: 120560" (as of 2026-08-30)
+- keyFacts[1]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed-as-of — A: https://communityfund.stellar.org/projects — "Talwex ... SCF #43; TERWA ... SCF #43; lend.xyz ... SCF #43" (as of 2026-08-30)
+- keyFacts[2]: "Uses official URLs and statuses for representative Awarded RWA/tokenization work." → confirmed-as-of — A: https://communityfund.stellar.org/submissions/recK1Xh6hgHosxmbt — "status: Awarded; roundName: SCF #43; title: Stellar Vault for Real-World Bonds; budget: 150000" (as of 2026-08-30)
+- keyFacts[3]: "Treats official status, award_type, and directory status as distinct fields." → confirmed — A: https://communityfund.stellar.org/submissions/rec2QeA1y7ln6D3Ii — "status: Awarded; awardType: Build; roundName: SCF #43; budget: 120560" (as of 2026-08-30)
+- keyFacts[4]: "Treats semantic similarity and reconstructed totals as distinct from official status." → confirmed — A: https://communityfund.stellar.org/submissions/rec2QeA1y7ln6D3Ii — "submission budget: 120560; project totalAwarded: 120560; project totalPaid: 72336; submission status: Awarded" (as of 2026-08-30)
+- Sibling sweep 2026-08-30: grep Talwex|TERWA|lend.xyz|award_type|totalPaid → q-defi-rwa-scf-similar, q-scf-history-soroswap, q-scf-skill-submission-radar, and four incidental field-name hits; no contradiction
+- Conflicts: none
+- Result: DONE
+
+## q-defi-soroswap-vs-stellarx — a — 2026-08-30
+- keyFacts[0]: "Treats Soroswap-owned Soroban contracts/API and the StellarX UI as different roles." → confirmed — B: https://github.com/soroswap/docs — "Soroswap operates as: An Automated Market Maker (AMM) ... An AMM Aggregator ... An API via Soroswap Swap Route API." (as of 2026-08-30)
+- keyFacts[1]: "Treats API routing, on-chain aggregation, and UI access as three layers." → confirmed — B: https://github.com/soroswap/docs — "Soroswap operates as: An Automated Market Maker (AMM) ... An AMM Aggregator ... An API." (as of 2026-08-30)
+- keyFacts[2]: "Names Ultra Stellar as StellarX's builder." → confirmed — A: https://ultrastellar.com/ — "Our products ... StellarX ... StellarX is a powerful trading platform built on the Stellar network." (as of 2026-08-30)
+- keyFacts[3]: "Describes StellarX as a non-custodial Classic-liquidity trading UI." → confirmed — A: https://www.stellarx.com/legal/terms — "The Website is a user interface for the XLM decentralized exchange. ... StellarX is not a custodian of your assets." (as of 2026-08-30)
+- Sibling sweep 2026-08-30: grep Soroswap|StellarX|Ultra Stellar|API routing → q-defi-soroswap-what-is, q-eco-dex-saturation, q-edge-factcheck-soroswap-first-amm, q-scf-history-soroswap, and related product cases; no contradiction
+- Conflicts: none
+- Result: DONE
