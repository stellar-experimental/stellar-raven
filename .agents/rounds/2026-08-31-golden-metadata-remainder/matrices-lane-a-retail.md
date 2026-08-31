# Golden metadata remainder — Lane A retail report

Date: 2026-08-31
Scope: Group P3-S1 S1-H, all 23 case IDs
Mode: research only
Paid Lumenloop research: not used

## Summary

The lane contains 23 cases and 52 golden.keyFacts claims.

Case verdicts:

| Verdict | Count |
| --- | ---: |
| confirmed | 6 |
| confirmed-as-of | 16 |
| disputed | 1 |
| contradicted | 0 |
| unverifiable | 0 |
| unreached | 0 |

Claim verdicts:

| Verdict | Count |
| --- | ---: |
| confirmed | 20 |
| confirmed-as-of | 31 |
| disputed | 1 |
| contradicted | 0 |
| unverifiable | 0 |
| unreached | 0 |

Twenty-two cases meet the provenance replacement rule.

One case remains a conflict: q-raph-lobstr-legitimacy.

The replacement line for each eligible case is:

> Independent Lane A review (temporary path, unrecoverable); its claims were re-verified live on 2026-08-31 — see the Live re-check lines.

The report does not recommend a judge-facing change.

## Method

Each matrix uses the source classes from golden-truth.

- Class A is an official primary site or documentation page.
- Class B is official source code or a repository.
- Class D is a dated general-web sweep or an independent public authority.
- Class F is a free empirical execution.

The report treats an aggregator as a discovery source only.

The report uses 2026-08-31 as the observation date.

The repository sweeps use these pinned commits:

- stellar/stellar-protocol: 8912a8047931453bb5d6a631e10a9d7125c570f3
- stellar/stellar-xdr: 03cbf40cec4d89f82171bf895ef7598458d83e1b

## Evidence catalog

Every matrix evidence code expands to the exact evidence below.

### Official primary sources

**A1 — Lumens and reserves.** Observed 2026-08-31.
URL: https://developers.stellar.org/docs/learn/fundamentals/lumens
Exact quote: “Lumens (XLM) are the native currency of the Stellar network. The lumen is the only token that doesn’t require an issuer or trustline.”
Exact quote: “They are used to pay all transaction fees, fund rent, and to cover minimum balance requirements on the network.”
Exact quote: “When you close a subentry, the associated base reserve will be added to your available balance.”

**A2 — Accounts and trustlines.** Observed 2026-08-31.
URL: https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts
Exact quote: “Trustlines are an explicit opt-in for an account to hold a particular asset.”
Exact quote: “A trustline must be established for an account to receive any asset except lumens (XLM).”
Exact quote: “A trustline also tracks liabilities.”

**A3 — Transaction failure.** Observed 2026-08-31.
URL: https://developers.stellar.org/docs/learn/fundamentals/transactions/transaction-lifecycle
Exact quote: “The entire transaction will fail if any operation fails, and all previous operations will be rolled back.”

**A4 — Pooled accounts and memos.** Observed 2026-08-31.
URL: https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos
Exact quote: “A pooled account allows a single Stellar account ID to be shared across many users.”
Exact quote: “Prior to the introduction of muxed accounts, products and services that relied on pooled accounts often used transaction memos to differentiate between users.”

**A5 — Claimable balances.** Observed 2026-08-31.
URL: https://developers.stellar.org/docs/build/guides/transactions/claimable-balances
Exact quote: “Claimable balances were introduced in CAP-23 and are used to split a payment into two parts.”
Exact quote: “A trustline must be established by the claimant to the asset before it can claim the claimable balance, otherwise, the claim will result in an op_no_trust error.”
Exact quote: “This operation will load the ClaimableBalanceEntry that corresponds to the Balance ID and then search for the source account of this operation in the list of claimants on the entry.”

**A6 — Path payments.** Observed 2026-08-31.
URL: https://developers.stellar.org/docs/build/guides/transactions/path-payments
Exact quote: “In a path payment, the asset received differs from the asset sent.”
Exact quote: “For the path payment to succeed, there has to be a DEX offer or liquidity pool exchange path in existence.”
Exact quote: “Balances are settled at the very end of the operation.”

**A7 — Public account lookup.** Page date 2026-08-25. Observed 2026-08-31.
URL: https://developers.stellar.org/docs/data/apis/horizon/api-reference/retrieve-an-account
Exact quote: “The single account endpoint provides information on a specific account.”
Exact quote: “This account’s public key encoded in a base32 string representation.”

**A8 — Payments and compliance.** Observed 2026-08-31.
URL: https://stellar.org/use-cases/payments
Exact quote: “Each anchor or payment service provider offers their own fee structure.”
Exact quote: “The Anchor Directory allows you to filter by asset type, interoperability standards, country, and name.”
Exact quote: “Businesses operating on Stellar are responsible for determining their own compliance obligations based on the nature of their services and the countries they operate in.”

**A9 — Ramps.** Observed 2026-08-31.
URL: https://stellar.org/use-cases/ramps
Exact quote: “On and off-ramps are payment services that enable users to convert value between fiat and cryptocurrencies.”
Exact quote: “Supported fiat payment methods will differ depending on the on and off-ramp institution.”
Exact quote: “Enable seamless user onboarding and KYC through user-friendly interfaces built either by your application or an anchor.”

**A10 — Current ramp snapshot.** Observed 2026-08-31.
URL: https://stellar.org/use-cases/payments
Exact quote: “Maximize the speed and low transaction costs of the Stellar network’s payment rails to access over 475,000 global cash to crypto on and off ramp locations.”

**A11 — SDF scam boundaries.** Page says “updated july 2022.” Observed 2026-08-31.
URL: https://stellar.org/blog/foundation-news/how-to-protect-yourself-from-scammers
Exact quote: “DOES NOT have the capability to freeze or return XLM held in a Stellar account.”
Exact quote: “NEVER ask you for your private keys.”
Exact quote: “NEVER ask you to deposit funds to any wallet address.”
Exact quote: “NEVER host staking initiatives and competitions.”
Exact quote: “NEVER cold direct-message (DM) people to participate in airdrops and giveaways.”

**A12 — SCP and validator rewards.** Observed 2026-08-31.
URL: https://developers.stellar.org/docs/learn/fundamentals/stellar-consensus-protocol
Exact quote: “The Stellar network reaches consensus using the Stellar Consensus Protocol (SCP), which is a construction of the Federated Byzantine Agreement (FBA).”
Exact quote: “There are no monetary rewards for being a validator on the Stellar network.”

**A13 — Current LOBSTR custody model.** Observed 2026-08-31.
URL: https://lobstr.freshdesk.com/support/solutions/articles/151000169419-security-of-your-wallet-on-lobstr
Exact quote: “We store the encrypted version of the Recovery phrase/Secret key on our server.”
Exact quote: “The keys themselves can only be decrypted and accessed by users on-device.”
Exact quote: “The transaction signing also happens locally on-device.”

**A14 — LOBSTR restore and legacy exception.** Observed 2026-08-31.
URL: https://lobstr.freshdesk.com/support/solutions/articles/151000001291-how-to-restore-my-secret-key-
Exact quote: “If your account was created before LOBSTR switched to local key storage (before September 1, 2020) and you haven’t migrated your account to on-device key storage, you can view and backup the secret key of your Stellar wallet only in the Settings of the LOBSTR website.”
Exact quote: “We (the LOBSTR team) do not have access to users' Recovery phrases, Secret keys, Recovery codes, or Account passwords for security reasons.”
Conflict quote: “Only share your Recovery Phrase with trusted services.”

**A15 — LOBSTR phrase safety.** Observed 2026-08-31.
URL: https://lobstr.freshdesk.com/support/solutions/articles/151000001252-what-is-a-recovery-phrase-on-lobstr-
Exact quote: “You are the only one who has access to your Recovery Phrase.”
Exact quote: “Anybody else who discovers the phrase can access your Stellar wallet and its private key, so it must be kept safe like your other valuables.”

**A16 — Ultra Stellar identity.** Observed 2026-08-31.
URL: https://ultrastellar.com/
Exact quote: “Ultra Stellar is building the future of money on the Stellar network.”
Exact quote: “LOBSTR is the best way to get started with Stellar.”
Exact quote: “Available as web and mobile app.”

**A17 — Ledger security boundary.** Observed 2026-08-31.
URL: https://www.ledger.com/coin/wallet/stellar
Exact quote: “Protects your crypto wallets, keeping your private keys offline, far from hackers’ reach and resistant to online threats.”
URL: https://support.ledger.com/article/360007223753-zd
Page date: 2026-07-17.
Exact quote: “Ledger will never ask for the 24 words of your recovery phrase. Never share them.”

**A18 — Trustline removal and AccountMerge.** Observed 2026-08-31.
URL: https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations
Exact quote: “Creates, updates, or deletes a trustline.”
Exact quote: “The limit is not sufficient to hold the current balance of the trustline and still satisfy its buying liabilities.”
Exact quote: “Transfers the XLM balance of an account to another account and removes the source account from the ledger.”
Exact quote: “A source account can only be merged once it holds no non-signer subentries.”

**A19 — Exchange memo recovery.** Page date 2026-07-01. Observed 2026-08-31.
URL: https://support.kraken.com/articles/360000184543-memo-for-stellar-lumens-xlm-deposits
Exact quote: “On Kraken, the Memo is used to determine what account a given transaction should be assigned and credited to.”
Exact quote: “If you forgot to include the memo, please start a chat with the chatbot.”

**A20 — USDC on Stellar.** Page date 2026-07-10. Observed 2026-08-31.
URL: https://www.circle.com/multi-chain-usdc/stellar
Exact quote: “USDC on Stellar combines the power and inclusivity of the Stellar network with one of the world’s most widely used dollar digital currencies.”
Exact quote: “Choose USDC on Stellar.”
Exact quote: “Swap across blockchains through your Circle Mint account and via API.”

**A21 — Official USDC issuer.** Observed 2026-08-31.
URL: https://developers.circle.com/stablecoins/usdc-contract-addresses
Exact quote: “Stellar USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN.”

### Source code and repository evidence

**B1 — Asset identity.** Observed 2026-08-31.
URL: https://github.com/stellar/stellar-xdr/blob/03cbf40cec4d89f82171bf895ef7598458d83e1b/Stellar-ledger-entries.x#L24-L62
Exact quote: “ASSET_TYPE_NATIVE = 0.”
Exact quote: “AssetCode4 assetCode; AccountID issuer;”
The XDR makes code and issuer separate fields for credit assets.

**B2 — Memo types.** Observed 2026-08-31.
URL: https://github.com/stellar/stellar-xdr/blob/03cbf40cec4d89f82171bf895ef7598458d83e1b/Stellar-transaction.x#L764-L785
Exact quote: “MEMO_NONE = 0, MEMO_TEXT = 1, MEMO_ID = 2, MEMO_HASH = 3, MEMO_RETURN = 4.”

**B3 — Claimable balances.** Observed 2026-08-31.
URL: https://github.com/stellar/stellar-protocol/blob/8912a8047931453bb5d6a631e10a9d7125c570f3/core/cap-0023.md
Exact quote: “We introduce ClaimableBalanceEntry as a new type of LedgerEntry which represents the transfer of ownership of some amount of an asset.”
Exact quote: “CLAIM_CLAIMABLE_BALANCE_NO_TRUST = -4.”

**B4 — Required memos.** Observed 2026-08-31.
URL: https://github.com/stellar/stellar-protocol/blob/8912a8047931453bb5d6a631e10a9d7125c570f3/ecosystem/sep-0029.md
Exact quote: “Users frequently forget to fill in a memo in their deposit transactions.”
Exact quote: “Dealing with missing memos may result in lost funds and requires manual intervention on the receiving side.”

**B5 — Key derivation.** Observed 2026-08-31.
URL: https://github.com/stellar/stellar-protocol/blob/8912a8047931453bb5d6a631e10a9d7125c570f3/ecosystem/sep-0005.md
Exact quote: “This Stellar Ecosystem Proposal describes methods for key derivation for Stellar.”
Exact quote: “The following path should be used to generate keys: m/44'/148'/x'.”

**B6 — Clawback scope.** Observed 2026-08-31.
URL: https://github.com/stellar/stellar-protocol/blob/8912a8047931453bb5d6a631e10a9d7125c570f3/core/cap-0035.md
Exact quote: “This proposal provides the Issuer with a means to clawback (and reissue if desired) assets.”
Exact quote: “The ClawbackOp and ClawbackClaimableBalanceOp operations only apply to assets issued by the source account.”

**B7 — Current staking absence sweep.** Observed 2026-08-31.
URL: https://github.com/stellar/stellar-protocol/tree/8912a8047931453bb5d6a631e10a9d7125c570f3
Terms: “native staking,” “validator reward,” “protocol reward,” and “proof of stake.”
Result: no accepted or proposed CAP defines native XLM staking or validator rewards.
False positives concerned liquidity-pool stake, scam-address reporting, and generic DeFi vault terminology.

**B8 — Transaction rollback implementation.** Observed 2026-08-31.
URL: https://github.com/stellar/stellar-core/blob/master/src/transactions/TransactionFrame.cpp#L2251-L2382
Exact quote: “shield outer scope of any side effects with LedgerTxn.”
Exact implementation: the code calls “ltxTx.commit()” only on the success path.
The failure path sets “txFAILED” without that commit.

**B9 — Trustline deletion and account merge implementation.** Observed 2026-08-31.
URL: https://github.com/stellar/stellar-core/blob/master/src/transactions/ChangeTrustOpFrame.cpp#L188-L224
Exact quote: “Can't drop the limit below the balance you are holding with them.”
Exact quote: “if (mChangeTrust.limit == 0) { // we are deleting a trustline”.
URL: https://github.com/stellar/stellar-core/blob/master/src/transactions/MergeOpFrame.cpp#L117-L192
Exact code: “ACCOUNT_MERGE_HAS_SUB_ENTRIES” applies when non-signer subentries remain.
Exact code: the success path moves “sourceBalance” and calls “sourceAccountEntry.erase()”.

**B10 — Anchor deposit and withdrawal protocol.** Observed 2026-08-31.
URL: https://github.com/stellar/stellar-protocol/blob/8912a8047931453bb5d6a631e10a9d7125c570f3/ecosystem/sep-0006.md#L28-L40
Exact quote: “Deposit external assets with an anchor.”
Exact quote: “Withdraw assets from an anchor.”
Exact quote: “Communicate deposit & withdrawal fee structure for an anchor to the user.”
Exact quote: “Handle anchor KYC needs.”

**B11 — Path-payment implementation.** Observed 2026-08-31.
URL: https://github.com/stellar/stellar-core/blob/master/src/transactions/PathPaymentStrictReceiveOpFrame.cpp#L39-L140
Exact implementation: the code builds a full asset path and calls “convert” for each hop.
Exact implementation: any failed conversion returns false before success.

### Independent web and public-authority evidence

**D1 — Recovery fraud.** Published 2021-10-01. Observed 2026-08-31.
URL: https://www.fbi.gov/how-we-can-help-you/victim-services/national-crimes-and-victim-resources/cryptocurrency-investment-fraud
Exact quote: “Almost all victims, after they lost their money, are contacted by scammers conducting recovery fraud schemes.”
Exact quote: “Do not pay for services that claim to be able to recover lost funds.”
Exact quote: “Transaction details include cryptocurrency addresses, amount and type of cryptocurrency, date and time, and transaction ID (hash).”

**D2 — Phishing controls.** Observed 2026-08-31.
URL: https://www.cisa.gov/secure-our-world/recognize-and-report-phishing
Exact quote: “Phishing occurs when criminals try to get us to open harmful links, emails or attachments.”
Exact quote: “If you suspect phishing, resist the temptation to click on links or attachments.”
Exact quote: “Look up another way to contact the company or person directly.”

**D3 — LOBSTR activity probe.** Observed 2026-08-31.
URL: https://itunes.apple.com/lookup?id=1404357892&country=us
Exact response fields: “sellerName”: “ULTRA STELLAR, LLC”; “version”: “15.6.0”; “currentVersionReleaseDate”: “2026-08-19T12:06:08Z”.

**D4 — Scam and phishing sweep.** Observed 2026-08-31.
Search terms: “Stellar claimable balance phishing scam unsolicited token”; “Stellar fake airdrop pending XLM pay to release”; “Stellar recovery agent scam return stolen XLM.”
Direct result URL: https://stellar.org/blog/foundation-news/how-to-protect-yourself-from-scammers
Direct result URL: https://www.reddit.com/r/Stellar/comments/10s9m8s/claimable_balances_fraud_spam_situation/
Result: the sweep found real abuse reports and legitimate protocol documentation.
Result: the sweep did not support an absolute claim that every claimable balance is fraudulent.

**D5 — Native-staking absence sweep.** Observed 2026-08-31.
Search terms: “Stellar native staking validator rewards proposal CAP”; “site:stellar.org Stellar staking validator rewards”; “site:github.com/stellar/stellar-protocol validator rewards proof of stake.”
Direct result URL: https://stellar.org/blog/ecosystem/the-hidden-risks-of-proof-of-stake
Exact quote: “The Stellar network provides no monetary rewards for validators.”
Direct result URL: https://www.stakingrewards.com/asset/stellar
Exact quote: “There is no way to stake XLM, the only way to earn a return on your XLM is to lend them out to custodial providers.”
Result: no current official native-staking proposal appeared.
Several third-party pages used “staking” for lending or yield products.

**D6 — LOBSTR identity sweep.** Observed 2026-08-31.
Search terms: “LOBSTR wallet Ultra Stellar current version”; “LOBSTR wallet recovery phrase local device pre-2020”; “LOBSTR wallet scam breach security incident.”
Direct result URL: https://apps.apple.com/us/app/lobstr-wallet-buy-xlm-xrp/id1404357892
Exact quote: “Developer ULTRA STELLAR, LLC.”
Result: the sweep confirmed an active publisher and current application.
User allegations did not prove cryptographic safety or provider fraud.

**D7 — Independent ramp-provider sweep.** Observed 2026-08-31.
Search terms: “MoneyGram Stellar cash ramp supported countries fees USDC”; “Stellar anchor off ramp supported countries provider terms”; “USDC Stellar offramp bank country eligibility.”
Direct result URL: https://developer.moneygram.com/moneygram-developer/docs/integrate-moneygram-ramps
Page update: 2026-08-11.
Exact quote: “MoneyGram Ramps lets wallets and exchanges offer USDC cash-in and cash-out at MoneyGram locations worldwide.”
Direct result URL: https://xramps.moneygram.com/
Exact quote: “USDC on Solana and Stellar at 470000+ MoneyGram locations across 170+ countries and territories.”
The current provider numbers differ from Stellar’s broader page snapshot.

**D8 — Hardware-threshold sweep.** Observed 2026-08-31.
Search terms: “hardware wallet recommended amount threshold Ledger”; “when to buy hardware wallet balance threshold”; “site:cisa.gov hardware wallet recovery phrase.”
Direct result URL: https://thaibitcast.com/en/blogs/articles/when-to-buy-hardware-wallet
The result used several portfolio and behavior factors.
Other results used different thresholds or no threshold.
The sweep found no authoritative universal balance threshold.

### Free empirical probes

**F1 — Current ledger settings.** Observed 2026-08-31T13:15:45Z.
URL: https://horizon.stellar.org/ledgers?order=desc&limit=1
Exact response fields: “sequence”: 64209416; “base_fee_in_stroops”: 100; “base_reserve_in_stroops”: 5000000; “protocol_version”: 27.
The page-level values remain dated snapshots.

**F2 — Live memo transaction.** Observed 2026-08-31.
URL: https://horizon.stellar.org/transactions/ff79aa13cdcc4437fbcf9d5e6177573644afc5ac6ae99b6aa87b7f5617743882
Exact response fields: “memo_type”: “text”; “memo”: “bridge_adds”; “successful”: true.

**F3 — Public account and history.** Observed 2026-08-31.
URL: https://horizon.stellar.org/accounts/GAAEUUIRRREW2MOCLXWNBOLUBBQNJSYLRBXCT47MPCF5OHD6ETDPOMNY
Exact response fields: “account_id”: “GAAEUUIRRREW2MOCLXWNBOLUBBQNJSYLRBXCT47MPCF5OHD6ETDPOMNY”; native “balance”: “3.9885550”.
URL: https://horizon.stellar.org/accounts/GAAEUUIRRREW2MOCLXWNBOLUBBQNJSYLRBXCT47MPCF5OHD6ETDPOMNY/transactions?order=desc&limit=2
Exact response fields included two public hashes and their ledger times.

**F4 — Live claimable balance.** Observed 2026-08-31T13:15:04Z.
URL: https://horizon.stellar.org/claimable_balances?order=desc&limit=1
Exact response fields: “asset”: “LITHIUM:GCCEJZIVZPRNHUYLXFMNHTEIJZHSGYJFT7QWM6CME3YSH7C6UNXQZX5B”; “amount”: “21859.2000000”.
The response also contained two claimants and two predicates.

**F5 — Duplicate USDC codes.** Observed 2026-08-31.
URL: https://horizon.stellar.org/assets?asset_code=USDC&limit=10&order=desc
Exact result: ten returned records used the code “USDC” with ten different issuer accounts.
This probe proves that the asset code alone does not identify Circle USDC.

## Per-case corroboration matrices

### q-raph-stolen-wallet-recovery

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| States the network/SDF cannot simply reverse a completed theft. | mixed | confirmed-as-of | A11 directly denies SDF freeze or return capability. B1 and B6 limit clawback to issuer-specific assets. D4 found no contrary primary mechanism. |
| Gives safe evidence-preservation and account-security steps. | mixed | confirmed-as-of | D1 requires transaction hashes and reporting. A11 says SDF never requests private keys. |

Negative-claim rule: primary absence plus the D4 web sweep passed.

Sibling terms: “reverse,” “freeze,” “drained,” “clawback,” “recovery agent.”
Relevant siblings: q-edge-validators-reverse-tx-fork-detection, q-comp-clawback-cap0035, q-n3-wallet-hacked-support-redirect, q-raph-missing-exchange-memo.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-jutsu-cash-crypto-ramps

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Treats any network-wide ramp count as a dated snapshot. | mixed | confirmed-as-of | A10 shows “over 475,000” on 2026-08-31. D7 shows a current provider’s different 470000+ count. |
| Explains that availability is corridor- and provider-specific. | mixed | confirmed-as-of | A9 says payment methods differ by institution. D7 reports a provider-specific country and network footprint. |

Sibling terms: “cash-to-crypto,” “off-ramp,” “Anchor Directory,” “corridor.”
Relevant siblings: q-crp-anchors-by-corridor, q-anchor-moneygram-ramps, q-raph-offramp-xlm-usdc, q-pay-anchor-msb-licensing.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-jutsu-check-account-history

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Uses public address/transaction hash, never a secret key. | real-world | confirmed | A7 requires an account public key. F3 retrieved balances and transactions without a secret. |
| Calls out correct network selection and public on-chain history. | real-world | confirmed | A7 documents the testnet endpoint. F3 used the separate public mainnet endpoint without authentication. |

Sibling terms: “account balances,” “transaction history,” “public key,” “block explorer.”
Relevant siblings: q-ti-block-explorer-basics, q-crp-export-tx-history-taxes, q-ti-historical-pointintime-balances.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-jutsu-what-is-a-memo

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Defines a memo as transaction metadata with several types. | real-world | confirmed | B2 defines five memo variants. F2 shows a live text memo. |
| Explains the pooled-service crediting use and exact supplied value. | real-world | confirmed | A4 explains pooled-user differentiation. B4 explains required memo checks. A19 gives a current exchange example. |

Sibling terms: “memo type,” “pooled account,” “memo ID,” “memo text.”
Relevant siblings: q-pc-memos-reference, q-raph-exchange-memo, q-raph-missing-exchange-memo.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-claimable-balance-safety

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Defines a claimable balance as a distinct conditional ledger-entry flow. | mixed | confirmed | A5 defines the two-part flow. B3 defines ClaimableBalanceEntry. F4 shows claimants and predicates. |
| Requires the matching trustline for a non-XLM claim. | mixed | confirmed | A5 states the trustline requirement and op_no_trust result. B3 defines CLAIM_CLAIMABLE_BALANCE_NO_TRUST. |

Negative scam boundary: A5 documents legitimate use. D4 found both abuse reports and legitimate uses.

Sibling terms: “claimable balance,” “op_no_trust,” “ClaimableBalanceEntry.”
Relevant siblings: q-asset-claimable-balance, q-aas-claim-received-claimable-balances, q-raph-phishing-pending-claim, q-raph-unsolicited-airdrop.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-exchange-memo

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Uses the exchange-supplied destination and exact memo. | mixed | confirmed | A19 requires the correct memo. B4 defines the receiver-side memo requirement. |
| Explains that a pooled address needs the memo to credit the individual customer. | mixed | confirmed | A4 describes pooled customer differentiation. B4 describes memo disambiguation. A19 gives a current exchange example. |

Sibling terms: “exchange memo,” “pooled address,” “memo_required,” “memo-less.”
Relevant siblings: q-edge-exchange-memo-lost-funds, q-pc-memos-reference, q-raph-missing-exchange-memo.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-hardware-wallet

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Explains the security boundary without claiming absolute protection. | mixed | confirmed | A17 says private keys stay offline. A17 also warns that the phrase must stay secret. D2 covers malicious links. |
| Treats any investment-size threshold as non-universal. | mixed | confirmed | A17 describes a security control, not a balance threshold. D8 found differing thresholds and no authoritative universal amount. |

Sibling terms: “hardware wallet,” “Ledger device,” “recovery phrase,” “private key device.”
Relevant siblings: q-tool-wallets-comparison, q-ti-secret-key-vs-mnemonic-derivation, q-raph-restore-wallet.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-lobstr-legitimacy

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Identifies LOBSTR as an active Ultra Stellar third-party wallet. | mixed | confirmed-as-of | A16 names LOBSTR as an Ultra Stellar product. D3 names ULTRA STELLAR, LLC as the seller. |
| Dates the LOBSTR activity assessment to an observation date. | mixed | confirmed-as-of | D3 reports version 15.6.0 released on 2026-08-19. |
| Attributes local/on-device storage to current LOBSTR documentation. | mixed | confirmed-as-of | A13 says encrypted data is server-backed. D6 independently found the current storage page and app footprint. |
| Preserves the pre-2020 unmigrated-account exception. | mixed | confirmed-as-of | A14 states the September 1, 2020 exception exactly. D6 found the same current recovery lineage. |
| Requires credentials to remain unshared and support-unrecoverable per current LOBSTR docs. | mixed | disputed | A15 says only the user has phrase access. A14 says support lacks access. D6 found no external resolution. A14 also says “Only share your Recovery Phrase with trusted services.” |

Unresolved conflict: two current LOBSTR pages give incompatible sharing guidance.

The golden safety advice remains prudent.

The metadata claim says current LOBSTR docs require credentials to remain unshared.

That metadata claim cannot receive a clean confirmation.

Sibling terms: “LOBSTR,” “Ultra Stellar,” “Recovery code,” “September 1, 2020.”
Relevant siblings: q-eco-lobstr-wallet, q-eco-stellar-wallets-list, q-tool-wallets-comparison.

Replacement status: **KEEP — CONFLICT**. Keep the temporary path line unchanged.

### q-raph-low-xlm-transfer-fail

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Explains reserves and fees as reasons low-XLM operations fail. | real-world | confirmed-as-of | A1 defines fees and reserves. F1 measured 100 stroops and 5000000 stroops. |
| Says a failed transaction does not normally transfer the intended funds. | real-world | confirmed | A3 says all previous operations roll back. B8 commits the operation ledger only on success. |
| States eligible subentry cleanup lowers reserve. | real-world | confirmed | A1 says closing a subentry restores the reserve. B9 releases reserves before trustline erasure. |
| Treats Account Merge as a conditional account-closing path. | real-world | confirmed | A18 defines the transfer and deletion. B9 implements blockers, balance transfer, and account erasure. |

Sibling terms: “minimum balance,” “base reserve,” “AccountMerge,” “low XLM.”
Relevant siblings: q-protocol-base-reserve-min-balance, q-pc-account-merge-reclaim-reserve, q-edge-1xlm-activation-fee.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-merchant-payments

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Treats payment acceptance, holding, and off-ramping as distinct choices. | mixed | confirmed-as-of | A8 separates network settlement from providers. B10 defines separate anchor deposits and withdrawals. |
| Requires local compliance and operational checks. | mixed | confirmed-as-of | A8 assigns compliance to the business. B10 defines anchor fees and KYC handling. |

Sibling terms: “merchant,” “small shop,” “accept XLM,” “payment provider,” “off-ramp.”
Relevant siblings: q-raph-offramp-xlm-usdc, q-pay-anchor-msb-licensing, q-stellar-recurring-payments.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-missing-exchange-memo

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Recovery is an exchange support/accounting process, not a network reversal. | mixed | confirmed-as-of | A19 directs the user to exchange chat. B4 says manual receiver intervention is required. A11 denies SDF reversal. |
| Names the transaction hash and deposit details as useful recovery evidence. | mixed | confirmed-as-of | D1 lists transaction hashes, addresses, amounts, dates, and times. F2 shows those fields exist publicly. |

Sibling terms: “missing memo,” “forgot memo,” “memo-less,” “deposit recovery.”
Relevant siblings: q-edge-exchange-memo-lost-funds, q-jutsu-what-is-a-memo, q-raph-exchange-memo.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-offramp-xlm-usdc

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Explains that off-ramping uses a country-eligible exchange or anchor. | mixed | confirmed-as-of | A9 defines off-ramps. B10 maps the user’s country to an anchor. D7 shows a current provider footprint. |
| Requires checking the exact asset/network and deposit instructions. | mixed | confirmed-as-of | A20 requires choosing USDC on Stellar. A21 names the exact issuer. F5 shows code-only ambiguity. |

Sibling terms: “cash out,” “off-ramp,” “bank account,” “anchor.”
Relevant siblings: q-crp-anchors-by-corridor, q-asset-usdc-eurc-issuer, q-jutsu-cash-crypto-ramps.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-phishing-pending-claim

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Sets a safe boundary: no link, payment, signature, or secret disclosure. | mixed | confirmed-as-of | A11 rejects key and deposit requests. D2 says not to click suspicious links. |
| Does not falsely equate every claimable balance with a scam. | mixed | confirmed-as-of | A5 documents legitimate claimable-balance uses. B3 defines the protocol entry. D4 found abuse without proving universal fraud. |

Negative-claim rule: A5 and B3 establish legitimate primary records. D4 supplies the explicit web sweep.

Sibling terms: “pending XLM,” “phishing,” “claimable balance,” “rectification.”
Relevant siblings: q-raph-claimable-balance-safety, q-raph-unsolicited-airdrop, q-edge-asset-site-scam-detection.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-remittance-path-payment

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Describes anchor/on-off-ramp endpoints plus a path payment where liquidity exists. | mixed | confirmed-as-of | A9 defines ramp endpoints. B10 defines anchor deposit and withdrawal APIs. B11 implements path conversion hops. |
| States that the on-chain payment is atomic but provider and FX conditions remain. | mixed | confirmed | A6 says balances settle at the operation end. B8 and B11 return without commit on failure. A8 preserves provider conditions. |

Sibling terms: “remittance,” “path payment,” “cross-border,” “FX.”
Relevant siblings: q-asset-path-payment-ops, q-asset-usdc-eurc-path-fx, q-crp-anchors-by-corridor.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-remove-scam-token

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Uses code plus issuer as the asset identity check. | mixed | confirmed | B1 defines code and issuer fields. A21 names the official USDC issuer. F5 shows duplicate USDC codes. |
| Qualifies removal on zero balance/no liabilities and wallet support. | mixed | confirmed | A18 says ChangeTrust deletes a trustline. B9 implements balance and liquidity-pool blockers before erasure. |

Negative scam boundary: A11 documents look-alike assets. D4 found abuse but no universal ticker rule.

Sibling terms: “scam token,” “fake token,” “ChangeTrust,” “trustline remove,” “issuer.”
Relevant siblings: q-edge-asset-site-scam-detection, q-aas-trustline-limit-lifecycle, q-ti-enumerate-holders-airdrop.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-restore-wallet

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Separates a Stellar secret key from wallet-specific recovery-phrase compatibility. | mixed | confirmed-as-of | B5 defines a standard derivation path. Current Freighter issues show import-format differences. A14 documents LOBSTR-specific recovery formats. |
| Requires official wallet recovery instructions and credential safety. | mixed | confirmed-as-of | A14 gives vendor recovery steps. A15 and A17 require phrase secrecy. D2 rejects message links. |

Sibling terms: “restore wallet,” “recovery phrase,” “derivation path,” “secret key.”
Relevant siblings: q-ti-secret-key-vs-mnemonic-derivation, q-tool-passkey-wallet-recovery, q-raph-hardware-wallet.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-scam-spam-tokens

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Explains the open-network premise without calling every unsolicited asset fraudulent. | mixed | confirmed-as-of | A5 documents legitimate unsolicited-capable mechanics. B3 defines the ledger entry. D4 found abuse and legitimate protocol uses. |
| States the trustline distinction for non-XLM assets. | mixed | confirmed | A2 requires trustlines for non-XLM assets. B1 separates native and issued assets. |

Negative-claim rule: A5 and B3 establish non-fraudulent uses. D4 supplies the explicit web sweep.

Sibling terms: “spam token,” “scam token,” “weird claimable,” “unsolicited asset.”
Relevant siblings: q-raph-unsolicited-airdrop, q-raph-remove-scam-token, q-ti-enumerate-holders-airdrop.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-unsolicited-airdrop

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Treats real claimable-balance mechanics and unsolicited-offer legitimacy as distinct. | mixed | confirmed-as-of | A5 and B3 establish a legitimate protocol feature. D4 shows that attackers also abuse it. |
| Tells the user not to sign, pay, or disclose credentials because of it. | mixed | confirmed-as-of | A11 rejects private-key and deposit requests. D2 rejects suspicious links. |

Negative-claim rule: the primary records prove legitimate mechanics. D4 supplies the explicit abuse sweep.

Sibling terms: “unsolicited,” “airdrop,” “claimable balance,” “unlock charge.”
Relevant siblings: q-raph-phishing-pending-claim, q-raph-scam-spam-tokens, q-asset-claimable-balance.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-usdc-onto-stellar

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Distinguishes Ethereum ERC-20 USDC from a Stellar-network withdrawal. | real-world | confirmed-as-of | A20 requires choosing USDC on Stellar and a chain swap. B1 shows Stellar’s distinct native asset representation. |
| Requires the exact supported issuer asset and trustline. | real-world | confirmed-as-of | A21 names Circle’s issuer. A2 requires the trustline. F5 proves the code alone is ambiguous. |

Sibling terms: “USDC Stellar,” “ERC-20,” “Circle issuer,” “trustline.”
Relevant siblings: q-asset-usdc-eurc-issuer, q-token-circle-usdc-on-stellar, q-cctp-v2-usdc-stellar.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-withdraw-exchange-self-custody

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Uses the wallet public address and the exchange's Stellar/XLM withdrawal network. | mixed | confirmed-as-of | A7 defines the account public key. B1 defines native XLM. D7 shows a provider’s separate Stellar network route. |
| Keeps the wallet secret/recovery material private. | mixed | confirmed-as-of | A15 says phrase discovery gives full wallet control. A17 says never share it. |

Sibling terms: “self-custody,” “exchange withdrawal,” “public address,” “recovery material.”
Relevant siblings: q-crp-custodial-vs-noncustodial-wallets, q-ti-find-export-secret-key, q-raph-restore-wallet.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-xlm-network-role

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Names XLM's fee and reserve roles. | real-world | confirmed-as-of | A1 names both roles. F1 measured current fee and reserve settings. |
| Distinguishes native XLM from issuer-specific trustline assets. | real-world | confirmed | A1 says XLM needs no issuer or trustline. B1 gives issued assets code and issuer fields. |

Sibling terms: “native asset,” “XLM fee,” “XLM reserve,” “gas.”
Relevant siblings: q-raph-xlm-simple, q-protocol-base-reserve-min-balance, q-edge-metamask-evm-mental-model.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-xlm-simple

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| Identifies XLM as Stellar's native asset. | real-world | confirmed | A1 says XLM is the native currency. B1 defines ASSET_TYPE_NATIVE. |
| Names fees and reserves as XLM network roles. | real-world | confirmed-as-of | A1 names both roles. F1 measured the current settings. |
| Distinguishes XLM from issuer-backed Stellar assets. | real-world | confirmed | A1 says XLM has no issuer. B1 requires an issuer for credit assets. |

Sibling terms: “XLM,” “lumen,” “native asset,” “issuer-backed.”
Relevant siblings: q-raph-xlm-network-role, q-edge-ambig-stellar-token-meaning, q-asset-trustline-basics.

Replacement status: **REPLACE** with the exact Lane A replacement line.

### q-raph-xlm-staking

| golden.keyFacts claim | Domain | Verdict | Independent evidence |
| --- | --- | --- | --- |
| States that Stellar has no native proof-of-stake reward for holding XLM. | mixed | confirmed-as-of | A12 says SCP uses FBA and pays no validator rewards. B7 found no native-staking CAP. D5 found no contrary official proposal. |
| Treats a third-party yield product as different from native staking. | mixed | confirmed-as-of | A12 defines the native protocol. D5 found third-party lending and yield products labeled as “staking.” |

Negative absence rule: B7 checked primary governance records. D5 supplied the explicit web sweep.

The current sweep advances the observation date to 2026-08-31.

The existing 2026-07-11 statement remains a valid dated statement.

Sibling terms: “XLM staking,” “native staking,” “validator reward,” “proof-of-stake.”
Relevant siblings: q-edge-noinfo-stellar-pos-staking-rewards, q-defi-liquid-staking-whitespace, q-protocol-scp-consensus-algorithm.

Replacement status: **REPLACE** with the exact Lane A replacement line.

## Unresolved conflicts

### q-raph-lobstr-legitimacy

LOBSTR’s current phrase page says only the user has phrase access.

LOBSTR’s current restore page says support lacks phrase access.

The same restore page says users may share the phrase with “trusted services.”

That sentence conflicts with the case’s unshared-credential metadata claim.

The report marks that keyFact disputed.

The case must keep its temporary path line.

No other case has an unresolved two-class conflict.

## Recommended provenance replacement status

| Case ID | Case verdict | Status |
| --- | --- | --- |
| q-raph-stolen-wallet-recovery | confirmed-as-of | REPLACE |
| q-jutsu-cash-crypto-ramps | confirmed-as-of | REPLACE |
| q-jutsu-check-account-history | confirmed | REPLACE |
| q-jutsu-what-is-a-memo | confirmed | REPLACE |
| q-raph-claimable-balance-safety | confirmed | REPLACE |
| q-raph-exchange-memo | confirmed | REPLACE |
| q-raph-hardware-wallet | confirmed | REPLACE |
| q-raph-lobstr-legitimacy | disputed | KEEP — CONFLICT |
| q-raph-low-xlm-transfer-fail | confirmed-as-of | REPLACE |
| q-raph-merchant-payments | confirmed-as-of | REPLACE |
| q-raph-missing-exchange-memo | confirmed-as-of | REPLACE |
| q-raph-offramp-xlm-usdc | confirmed-as-of | REPLACE |
| q-raph-phishing-pending-claim | confirmed-as-of | REPLACE |
| q-raph-remittance-path-payment | confirmed-as-of | REPLACE |
| q-raph-remove-scam-token | confirmed | REPLACE |
| q-raph-restore-wallet | confirmed-as-of | REPLACE |
| q-raph-scam-spam-tokens | confirmed-as-of | REPLACE |
| q-raph-unsolicited-airdrop | confirmed-as-of | REPLACE |
| q-raph-usdc-onto-stellar | confirmed-as-of | REPLACE |
| q-raph-withdraw-exchange-self-custody | confirmed-as-of | REPLACE |
| q-raph-xlm-network-role | confirmed-as-of | REPLACE |
| q-raph-xlm-simple | confirmed-as-of | REPLACE |
| q-raph-xlm-staking | confirmed-as-of | REPLACE |

For each REPLACE row, use this exact line:

> Independent Lane A review (temporary path, unrecoverable); its claims were re-verified live on 2026-08-31 — see the Live re-check lines.

For q-raph-lobstr-legitimacy, retain the existing temporary path evidence.

## Research artifacts

The following temporary files preserve the web-search and extraction payloads:

- /tmp/gmr-protocol.json
- /tmp/gmr-wallets.json
- /tmp/gmr-safety.json
- /tmp/gmr-payments.json
- /tmp/gmr-scam-sweep.json
- /tmp/gmr-staking-sweep.json
- /tmp/gmr-lobstr-sweep.json
- /tmp/gmr-gap-search.json
- /tmp/gmr-core-source-search.json
- /tmp/gmr-ramp-provider-sweep.json
- /tmp/gmr-hardware-threshold-sweep.json
- /tmp/gmr-core-lumens.json
- /tmp/gmr-core-accounts.json
- /tmp/gmr-core-lifecycle.json
- /tmp/gmr-op-memos.json
- /tmp/gmr-op-claimable.json
- /tmp/gmr-op-path.json
- /tmp/gmr-api-account.json
- /tmp/gmr-lobstr-security.json
- /tmp/gmr-lobstr-restore.json
- /tmp/gmr-lobstr-phrase.json
- /tmp/gmr-stellar-scams.json
- /tmp/gmr-fbi-recovery.json
- /tmp/gmr-cisa-phishing.json
- /tmp/gmr-ramps.json
- /tmp/gmr-circle-stellar.json
- /tmp/gmr-scp.json

The report made no repository edit.
