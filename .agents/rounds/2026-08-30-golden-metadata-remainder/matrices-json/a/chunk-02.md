## q-smart-wallet-fee-sponsorship — a — 2026-08-30
- keyFacts[0]: "Activation/trustline reserves apply only to unsponsored G-accounts in this comparison." → confirmed — A: https://developers.stellar.org/docs/tokens/stellar-asset-contract — "G-account issued balances use trustlines; contract-address balances use contract data." (as of 2026-08-30)
- keyFacts[1]: "Fee bumps or relayers pay transaction fees." → confirmed — A: https://developers.stellar.org/docs/build/guides/transactions/fee-bump-transactions — "Use fee-bump transactions to pay for transaction fees on behalf of another account." (as of 2026-08-30)
- keyFacts[2]: "beginSponsoringFutureReserves/endSponsoringFutureReserves assign reserve liability." → confirmed — A: https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves — "Both the Begin Sponsoring Future Reserves and End Sponsoring Future Reserves operations must appear." (as of 2026-08-30)
- keyFacts[3]: "USDC uses its Stellar Asset Contract interface and balance." → confirmed — A: https://developers.stellar.org/docs/tokens/stellar-asset-contract — "SAC is the built-in contract interface to assets on Stellar." (as of 2026-08-30)
- keyFacts[4]: "Token-relay or hosted-facilitator designs use caps, liquidity, and abuse controls." → confirmed — A: https://docs.openzeppelin.com/relayer/guides/stellar-sponsored-transactions-guide — "Monitor Relayer Balance; Configure Swap Schedule; Set Appropriate Limits." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep beginSponsoringFutureReserves|FeeForwarder|hosted facilitator → q-defi-x402-on-stellar-what, q-pc-sponsored-reserves, q-protocol-operation-types-list, q-x402-payment-verification; no contradiction
- Conflicts: none
- Result: DONE

## q-defi-blend-alternatives — a — 2026-08-30
- keyFacts[0]: "Names real Stellar lending and credit candidates." → confirmed-as-of — A: https://www.k2lend.com/ — "K2 brings sophisticated DeFi lending to Stellar through pooled, isolated, and gated markets." (as of 2026-08-30)
- keyFacts[1]: "Treats direct lenders, Blend-built pools, and yield routers as different categories." → confirmed — A: https://yieldblox.finance/ — "YieldBlox is a DAO-managed money market on Stellar, using Blend Protocol." (as of 2026-08-30)
- keyFacts[2]: "Treats CDPs and synthetic or cross-chain systems as different categories." → confirmed — A: https://orbitcdp.finance/ — "A transparent, on-chain CDP system governed by the community." (as of 2026-08-30)
- keyFacts[3]: "Treats lifecycle and market-rank claims as dated, source-relative claims." → confirmed-as-of — C: https://stellarlight.xyz/project/slender — "Inactive / archived" (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep Slender|Laina|K2 Lend|DeFindex|OrbitCDP → q-defi-defindex-honest, q-defi-flash-loans, q-defi-named-newer-protocols, q-eco-defi-market-map, q-eco-defi-projects-discovery; no contradiction
- Conflicts: none
- Result: DONE

## q-defi-etherfuse-stablebonds — a — 2026-08-30
- keyFacts[0]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed-as-of — A: https://app.etherfuse.com/bonds/USTRY — "Current Issuance Details" (as of 2026-08-30)
- keyFacts[1]: "Treats USTRY and CETES as different tokenized Etherfuse Stablebond products." → confirmed — A: https://etherfuse.com/products/stablebonds — "CETES ... Mexico ... MXN; USTRY ... United States ... USD." (as of 2026-08-30)
- keyFacts[2]: "Covers legal, redemption, custody, maturity, and currency risks." → confirmed — A: https://app.etherfuse.com/legal/stablebonds-overview — "Redemption occurs at the applicable NAV, subject to disclosed terms, fees, and settlement timing." (as of 2026-08-30)
- keyFacts[3]: "Covers liquidity, oracle, exposure, and operational risks." → confirmed — A: https://www.blockaid.io/blog/73-quarantined-how-blockaid-and-stellar-validators-contained-a-10m-price-manipulation-attack — "Liquidity conditions, oracle price feeds, and ecosystem dependencies are part of the attack surface." (as of 2026-08-30)
- keyFacts[4]: "Attributes the YieldBlox incident to the consumer/pool boundary." → confirmed — A: https://www.blockaid.io/blog/73-quarantined-how-blockaid-and-stellar-validators-contained-a-10m-price-manipulation-attack — "The affected pool was part of the YieldBlox DAO community deployment." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep Etherfuse|Stablebonds|USTRY|CETES|YieldBlox → q-ass-cross-bando-stablebonds-sac, q-ass-cross-etherfuse-cetes-controls, q-comp-yieldblox-oracle-incident, q-hist-yieldblox-v2-2026-exploit, q-soroban-oracle-defensive-consumption; no contradiction
- Conflicts: none
- Result: DONE

## q-defi-flash-loans — a — 2026-08-30
- keyFacts[0]: "Uses dated source observations for changeable claims." → confirmed-as-of — A: https://docs.blend.capital/mainnet-deployments — "v2 Mainnet Smart Contract Addresses" (as of 2026-08-30)
- keyFacts[1]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed-as-of — C: https://stellarlight.xyz/project/slender — "Inactive / archived" (as of 2026-08-30)
- keyFacts[2]: "Explains atomic Soroban cross-contract flash-loan mechanics and rollback constraints." → confirmed — A: https://developers.stellar.org/docs/build/smart-contracts/example-contracts/errors — "If an error is returned, anything the function has done is rolled back." (as of 2026-08-30)
- keyFacts[3]: "Treats Blend v2 as a verified deployed flash-loan implementation." → confirmed-as-of — A: https://docs.blend.capital/mainnet-deployments — "There are mainnet deployments of Blend smart contracts." (as of 2026-08-30)
- keyFacts[4]: "Treats XycLoans code/history and Slender marketing as different evidence tiers." → confirmed-as-of — B: https://github.com/xycloo/xycloans — "XycLoans is a flash loans protocol implemented for the Soroban Virtual Machine." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep flash.loan|XycLoans|Slender|Blend v2|atomic Soroban → q-defi-blend-alternatives; no contradiction
- Conflicts: none
- Result: DONE
