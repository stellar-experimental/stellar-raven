# Corroboration classification — Sol lane

Date: 2026-08-29  
Scope: the 56 requested warnings.  
Method: I fetched each cited primary source live on 2026-08-29. Evidence keys expand below the classification table.

| id | class | exact negative sentence(s) | proposed disposition | evidence (live URL, exact quote, date, verdict) |
|---|---|---|---|---|
| q-aas-burn-clawback-redemption-mechanics | negative-claim | For a classic issued asset, the issuer account is the asset's authority, not a normal holder of its own credit.<br>It is not a normal user payment, does not require the affected holder's signature, and does not create a spendable issuer balance. | add-corroboration-row | E01, E02, E10 — confirmed |
| q-aas-claim-received-claimable-balances | mixed | A listed balance is not necessarily claimable at this ledger close.<br>The operation fails with `CLAIM_CLAIMABLE_BALANCE_CANNOT_CLAIM` if no claimant matches the source account or the matched claimant's predicate is false. | add-corroboration-row | E03 — confirmed |
| q-aas-claimable-predicates-expiry-reserves | mixed | Expiry is not automatic deletion.<br>If you list yourself (the sender/creator) as a claimant, that does NOT give you an at-will reclaim right: you can only claim when your own predicate evaluates true, and listing yourself never overrides another claimant's predicate.<br>A claimable balance is not a custodial balance the creator can pull back at will, and the predicate set — not an issuer clawback flag — is the control surface.<br>(Issuer clawback under CAP-35 is a separate regulated-asset feature, not the creator's ordinary reclaim mechanism.) | add-corroboration-row | E03, E10 — confirmed |
| q-aas-issuer-fees-supply-cap-freeze | negative-claim | Classic Stellar assets do not have a protocol-level per-transfer issuer-fee hook like a custom token tax.<br>If an issuer needs custom transfer logic, that is a separate Soroban/custom-token design question, not a classic asset flag.<br>The issuer can stop minting, lock or disable issuer signing authority, and document supply commitments, but there is no immutable max-supply field attached to an arbitrary issued asset.<br>These controls are about authorization and issuer governance, not hidden transfer fees. | downgrade-or-reword | E01, E02, E20 — unverifiable. The fetched primary pages enumerate asset operations and flags. No exact primary quote states either protocol-wide absence. |
| q-aas-trustline-limit-lifecycle | grammar-only | n/a | no-edit | n/a |
| q-anchor-list-builders-discovery | grammar-only | n/a | no-edit | n/a |
| q-anchor-moneygram-ramps | negative-claim | MoneyGram Access / Ramps is an anchor (built on Stellar) that lets wallet/exchange users cash-in (deposit) and cash-out (withdraw) physical cash at MoneyGram locations, settling in Stellar USDC — no bank account required.<br>It runs on the Stellar Ramps standard, so a single integration reaches the operator guide's dated 170+ off-ramp countries without per-anchor custom work.<br>The wallet never deals with the underlying bank/cash rails; MoneyGram abstracts them behind the SEP flow. | add-corroboration-row | E06, E07 — confirmed-as-of |
| q-asset-claimable-balance | mixed | This is a native protocol feature, not a Soroban escrow contract. | add-corroboration-row | E03 — confirmed |
| q-asset-deploy-sac-cli | mixed | You deploy the asset's reserved built-in SAC — you do not write a new token contract.<br>Anyone can deploy it (no authorization required); after deployment the asset's issuer is automatically the admin. | add-corroboration-row | E05 — confirmed |
| q-asset-issue-asset-howto | negative-claim | There is no 'create asset' operation — a classic asset is defined by its `(asset_code, issuer account)` pair and simply comes into existence the first time the issuer pays it out. | add-corroboration-row | E01 — confirmed |
| q-asset-path-payment-ops | negative-claim | It settles in roughly one ledger close (~5 s) at the normal low network fee — no off-chain bridge or third-party DEX router is involved. | add-corroboration-row | E08 — confirmed for the no-bridge/router clause. The time and fee claims need separate evidence. |
| q-asset-sdex-vs-amm | negative-claim | Both live in-ledger (no off-chain matching engine), and a single path payment can route across both offers and pools in one atomic transaction. | add-corroboration-row | E08, E09, E18 — confirmed |
| q-asset-trustline-vs-sac | negative-claim | They are two views of the same asset, not two different tokens.<br>There is no separate "USDC-on-Soroban" to migrate to.<br>You never redeploy, bridge, or wrap the asset to use it in Soroban. | add-corroboration-row | E05 — confirmed |
| q-asset-two-account-issuer | grammar-only | n/a | no-edit | n/a |
| q-asset-usdc-eurc-path-fx | negative-claim | The wallet never has to hold XLM or the intermediate hop asset. | add-corroboration-row | E08 — confirmed |
| q-comp-clawback-cap0035 | negative-claim | Clawback lets an asset issuer burn a specified amount of a clawback-enabled asset from any holder's trustline (or claimable balance) — without the holder's cooperation; the assets are burned, not returned to the issuer.<br>It needs no Soroban contract, and no arbitrary account can claw back another's funds — only the issuer of that asset. | add-corroboration-row | E10 — confirmed |
| q-comp-clawback-holder-risk | negative-claim | Clawback is an intentional, issuer-only feature of clawback-enabled assets — a regulatory tool, not a protocol bug/exploit.<br>XLM and ordinary assets without the flag are not clawbackable, and no arbitrary account can claw back another's funds — only that asset's issuer. | add-corroboration-row | E05, E10 — confirmed |
| q-crp-custodial-vs-noncustodial-wallets | mixed | Non-custodial means the user controls signing authority and the app cannot move funds without user authorization.<br>Non-custodial designs reduce custody risk but still do not remove KYC/AML, sanctions, travel-rule, fraud, or support obligations for regulated remittance flows.<br>The official TypeScript Wallet SDK is a build tool, not a custody provider. | downgrade-or-reword | E07, E11 — unverifiable as written. The sources confirm the private-key and SDK boundaries. They do not prove the global legal-obligations clause. |
| q-crp-regional-offramp-mobilemoney | mixed | Stellar lacks local-bank, debit-card, M-Pesa, Wave, Orange Money, MoMo, or USSD rails. | add-corroboration-row | E12 — confirmed as an architectural boundary. Anchors provide the external rails. |
| q-crp-remittance-founder-advisory | mixed | Stellar can be a good settlement layer for a remittance business because it gives fast settlement, standardized anchor protocols, and liquid stablecoin rails, but it is not a complete remittance company by itself. | add-corroboration-row | E11, E12 — confirmed |
| q-defi-arbitrage-pathpayment-bots | mixed | Stellar supports path payments through `PathPaymentStrictSend` and `PathPaymentStrictReceive`; path payments can traverse orderbook liquidity, but the protocol does not make arbitrage or market making profitable.<br>For a small-capital bot, the defensible answer is "possible to build, not reliably profitable." | downgrade-or-reword | E08, E09 — unverifiable. The sources describe routing and liquidity. They do not establish profitability or its absence. |
| q-defi-build-staking-for-own-token | negative-claim | XLM does not have native protocol staking rewards.<br>Stellar reaches consensus with SCP/FBA rather than proof-of-stake, and official docs state validators do not receive monetary rewards. | add-corroboration-row | E21 — confirmed |
| q-defi-market-making-kelp | grammar-only | n/a | no-edit | n/a |
| q-edge-ambig-best-wallet | grammar-only | n/a | no-edit | n/a |
| q-edge-doc-category-filter-empty | grammar-only | n/a | no-edit | n/a |
| q-edge-doc-page-sections-soft-empty | grammar-only | n/a | no-edit | n/a |
| q-edge-doc-title-zero-hits | grammar-only | n/a | no-edit | n/a |
| q-edge-partner-detail-soft-empty | grammar-only | n/a | no-edit | n/a |
| q-edge-retail-everyday-use-eli5 | grammar-only | n/a | no-edit | n/a |
| q-pc-address-types-strkey | mixed | StrKey is not base58 or raw hex: SEP-0023 defines it as a version byte whose top 5 bits pick the type, followed by the binary payload, a CRC16 checksum, and RFC4648 base32 without padding.<br>C-addresses are Stellar contract addresses, not EVM `0x` addresses. | add-corroboration-row | E14 — confirmed |
| q-pc-doc-category-validator-search | negative-claim | Category restriction is adapter-side because the upstream hierarchy field is not a reliable facet; use only the operation's supported category values. | add-corroboration-row | E13 — confirmed-as-of |
| q-pc-surge-griefing-threat-model | mixed | The abuse model is not "steal funds with fees"; it is availability and operations pressure.<br>Wallet docs note that a simple retry path may not gracefully handle fee surge and that rebuilding/re-signing with updated fees is a deliberate strategy. | add-corroboration-row | E15, E16 — confirmed |
| q-protocol-amm-cap-0038 | negative-claim | It is **not** a smart contract. | add-corroboration-row | E18 — confirmed |
| q-protocol-network-passphrases-list | negative-claim | There is no separate "mainnet" passphrase distinct from the public-network one. | add-corroboration-row | E19 — confirmed |
| q-protocol-operation-types-list | negative-claim | There are **no** ERC-style `Transfer`/`Mint`/`Burn` classic operations. | add-corroboration-row | E20 — confirmed from the exhaustive official operation list |
| q-protocol-operations-vs-transactions | negative-claim | The containment is operations ⊂ transaction — operations are not independently signed/submitted units. | add-corroboration-row | E22 — confirmed |
| q-protocol-quorum-slice-vs-quorum | negative-claim | Quorums form through nodes' overlapping / intersecting slices, which enables open membership — each node configures its own quorum set, with no central authority assigning it. | add-corroboration-row | E21 — confirmed |
| q-protocol-scp-consensus-algorithm | negative-claim | There are no monetary or block rewards for running a Stellar validator; participation is not incentivized by staking or mining. | add-corroboration-row | E21 — confirmed |
| q-protocol-tier1-requirements | negative-claim | Tier 1 status is earned by other Tier 1 orgs including you in their quorum sets (trust / invitation) — not granted by application to SDF, and not by staking XLM or paying a fee. | add-corroboration-row | E21, E23 — confirmed |
| q-protocol-validator-node-roles | negative-claim | Watcher: reads the network but does not vote in consensus.<br>The key Basic-vs-Full distinction: a Full Validator additionally publishes a public history archive; a Basic Validator does not.<br>There is no staking and no block rewards — Basic vs Full is not a stake-size difference. | add-corroboration-row | E21, E24, E25 — confirmed |
| q-protocol-validator-upgrade-vote | negative-claim | This is not a token-holder vote, not a hard-fork download, and not an off-chain SDF switch — the software is installed beforehand, and the version bump itself is an in-band SCP vote. | add-corroboration-row | E26 — confirmed |
| q-scf-ambassador-program | negative-claim | Under SCF v7, ambassadors can recommend Instawards, up to $15,000 in XLM per project, for early-stage builders; there is no open Instaward application.<br>This is a pipeline, not automatic progression or funding.<br>Ambassadors do not approve the $150K SCF Build award. | add-corroboration-row | E27, E28 — confirmed-as-of |
| q-scf-hummingbot-kelp-closed-rfp | negative-claim | In the June 25, 2026 live RFP feed it is `status: closed`, `quarter: q1-2026`, category `defi`, so it is not currently fundable / not open for application. | downgrade-or-reword | E29 — disputed. The fetched live page invites the reader to apply for an SCF grant. It does not expose the claimed closed status. |
| q-scf-skill-stellar-scout | grammar-only | n/a | no-edit | n/a |
| q-scf-skill-submission-radar | mixed | It researches and positions; it does not submit an application. | add-corroboration-row | E30 — confirmed-as-of |
| q-sep-clawback-prereq-flag | negative-claim | Clawback enablement does not stick on its own.<br>Existing trustlines are not made clawback-able retroactively.<br>**XLM/native balances are never clawback-able**. | add-corroboration-row | E05, E10 — confirmed |
| q-sor-doc-page-sections-followup | grammar-only | n/a | no-edit | n/a |
| q-sor-doc-title-discovery | grammar-only | n/a | no-edit | n/a |
| q-soroban-contract-id-derivation | negative-claim | The address is **NOT** derived from the Wasm hash.<br>Therefore upgrading the Wasm does not change the contract address — the instance address is preserved; only the executable behind it changes. | add-corroboration-row | E31 — confirmed |
| q-soroban-factory-pattern | negative-claim | Soroban contracts can deploy other contracts, no off-chain CLI step required.<br>The factory references the child by hash, not by re-embedding bytecode each deploy.<br>The Wasm hash selects the executable code used for the deployment; it is not part of the contract ID/address derivation.<br>This is not Solidity `new Contract()` / `CREATE2` — it is the native `env.deployer()` mechanism. | add-corroboration-row | E31, E32 — confirmed |
| q-ti-explain-repo-payload-status | grammar-only | n/a | no-edit | n/a |
| q-ti-related-projects-from-content | grammar-only | n/a | no-edit | n/a |
| q-ti-scout-changelog-contract-check | grammar-only | n/a | no-edit | n/a |
| q-ti-vocab-project-categories-live | grammar-only | n/a | no-edit | n/a |
| q-ti-vocab-regions-live | grammar-only | n/a | no-edit | n/a |
| q-tool-js-sdk-package | negative-claim | As of v16, the former `@stellar/stellar-base` package was folded into `@stellar/stellar-sdk` — no separate base install is needed. | add-corroboration-row | E33 — confirmed-as-of |

## Evidence key

All sources were fetched live on 2026-08-29. Class A is official documentation. Class B is owner source code or a specification.

| key | class | primary-source URL | exact supporting quote |
|---|---|---|---|
| E01 | A | https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/assets | “There is no dedicated operation to create an asset on Stellar.” “To delete, or ‘burn’, an asset, you must send it back to the account that issued it.” |
| E02 | A | https://developers.stellar.org/docs/tokens/control-asset-access | “an issuing account can’t actually hold a balance of its own asset.” |
| E03 | A | https://developers.stellar.org/docs/build/guides/transactions/claimable-balances | “must evaluate to true for the claim to succeed.” “there is no recovery mechanism for a claimable balance in general.” |
| E04 | A | https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes/operation-specific/change-trust | “The limit is not sufficient to hold the current balance of the trustline and still satisfy its buying liabilities.” |
| E05 | A | https://developers.stellar.org/docs/tokens/stellar-asset-contract | “No bridging is required and no intermediary tokens are needed.” “Anyone can initiate the deploy.” “It also cannot be burned.” |
| E06 | A | https://stellar.org/moneygram?locale=en | “Deposit or withdraw cash from their digital wallets via Stellar USDC without needing a bank account.” |
| E07 | A | https://developers.stellar.org/docs/build/apps/moneygram-access-integration-guide | “the application does not have access to the private keys.” “MoneyGram ... enables ... cash-in ... and cash-out ... of Stellar USDC.” |
| E08 | A | https://developers.stellar.org/docs/build/guides/transactions/path-payments | “path payments cross through the SDEX and/or liquidity pools.” “Balances are settled at the very end of the operation.” |
| E09 | A | https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools | “Stellar uses order books to operate its decentralized exchange.” |
| E10 | A | https://developers.stellar.org/docs/build/guides/transactions/clawbacks | “allow an asset issuer to burn a specific amount of a clawback-enabled asset.” “every subsequent trustline ... [has] the `TRUSTLINE_CLAWBACK_ENABLED_FLAG`.” |
| E11 | A | https://developers.stellar.org/docs/build/apps/overview | “This documentation includes sections on how to build applications ... with the Wallet SDK.” |
| E12 | A | https://developers.stellar.org/docs/learn/fundamentals/anchors | “on and off-ramps that connect the Stellar network to traditional financial rails.” |
| E13 | B | https://raw.githubusercontent.com/stellar-experimental/stellar-raven/main/specs/stellar-docs.json | “Category restriction must happen adapter-side.” “are NOT in the index.” “zero hits means definitely not in corpus.” |
| E14 | B | https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0023.md | “STRKEY_CONTRACT ... C.” “the first character of the base-32 encoding.” |
| E15 | A | https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering | “This helps prevent spam and prioritizes transactions during traffic surges.” |
| E16 | A | https://developers.stellar.org/docs/build/apps/wallet/stellar#submit-transaction | “the method above doesn't handle fee surge pricing ... gracefully.” |
| E18 | B | https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md | “LiquidityPoolEntry is introduced as a new type of LedgerEntry.” “New operations ... are introduced.” |
| E19 | A | https://developers.stellar.org/docs/learn/fundamentals/networks | “Public Global Stellar Network ; September 2015.” |
| E20 | A | https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations | “Below is a complete list of the operations available on Stellar.” |
| E21 | A | https://developers.stellar.org/docs/learn/fundamentals/stellar-consensus-protocol | “no central authority dictates whose vote is required.” “There are no monetary rewards for being a validator.” |
| E22 | A | https://developers.stellar.org/docs/learn/fundamentals/transactions/operations-and-transactions | “compose operations, bundle them into a transaction, and then sign and submit the transaction.” |
| E23 | A | https://developers.stellar.org/docs/validators/tier-1-orgs | “Joining is not a unilateral SDF decision.” “Expect a process measured in months, not weeks.” |
| E24 | A | https://developers.stellar.org/docs/validators | “A Basic Validator does not publish a history archive; a Full Validator does.” |
| E25 | A | https://developers.stellar.org/docs/validators/admin-guide/configuring | “If you don't intend for your node to participate in consensus votes.” |
| E26 | A | https://developers.stellar.org/docs/validators/admin-guide/network-upgrades | “performed by validators voting for and agreeing to new values.” |
| E27 | A | https://stellar.gitbook.io/scf-handbook/scf-awards/instawards | “rather than a standard open application process.” |
| E28 | A | https://stellar.gitbook.io/scf-handbook/scf-awards/build-award.md | “Verified SCF community members vote on all eligible projects.” |
| E29 | A | https://stellarlight.xyz/ideas/hummingbot-integration | “Ready to build this? Apply for an SCF grant to fund your project.” |
| E30 | B | https://raw.githubusercontent.com/lumenloop/lumenloop-skills/d92c56bda17ab702d3202335cfe814d64e70e191/skills/scf-submission-radar/SKILL.md | “This is research and positioning only — it does not submit anything to SCF.” |
| E31 | A | https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction | “contract identifier is based on contractIDPreimage value and the network identifier.” |
| E32 | A | https://developers.stellar.org/docs/build/smart-contracts/example-contracts/deployer | “demonstrates how to deploy contracts using a contract.” “Deploy the contract using the uploaded Wasm with given hash.” |
| E33 | B | https://github.com/stellar/js-stellar-sdk | “`@stellar/stellar-base` is now folded into `@stellar/stellar-sdk`.” |

## Counts

| class | count |
|---|---:|
| grammar-only | 18 |
| negative-claim | 27 |
| mixed | 11 |
| **total** | **56** |

| proposed disposition | count |
|---|---:|
| no-edit | 18 |
| add-corroboration-row | 34 |
| downgrade-or-reword | 4 |
| **total** | **56** |
