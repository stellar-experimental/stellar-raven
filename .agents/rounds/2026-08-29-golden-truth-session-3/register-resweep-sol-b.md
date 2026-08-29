# Consistency-register re-sweep

Worker: `gt3-sol-b`

Date: `2026-08-29`

Scope: 11 reopened clusters from the P3 brief.

I read every listed member file. I compared each changed member with `origin/main` through `git show`.

No cluster has a contradiction. Two clusters retain an explicit source tension.

## Verdict summary

- `cluster-008`: consistent
- `cluster-013`: consistent
- `cluster-017`: tension
- `cluster-018`: tension
- `cluster-065`: consistent
- `cluster-086`: consistent
- `cluster-100`: consistent
- `cluster-114`: tension
- `cluster-120`: consistent
- `cluster-123`: consistent
- `cluster-135`: consistent

`cluster-017` and `cluster-114` carry the same minimum-balance source tension. The official page and Core use different formula boundaries.

## cluster-008 — consistent

The changed member is `q-ti-rpc-gettransactions-pagination-xdr`. Its answer and key facts did not change from `origin/main`.

Only its caution changed. The new sentence is exact:

> Canonical-page caution: The official getTransactions page calls the cap hardcoded.

That sentence has no CAP status or protocol assignment.

The member comparison used these exact statements:

- `q-comp-clawback-cap0035`: “Clawback was introduced by CAP-0035 in Protocol 17.”
- `q-comp-clawback-holder-risk`: “Clawback is intentional and issuer-only for clawback-enabled assets.”
- `q-edge-factcheck-soroswap-first-amm`: “Corrects the first-AMM claim using SDEX and CAP-0038/Protocol-18 chronology.”
- `q-infra-secp256r1-passkeys`: “CAP-0051/P21 supplies native P-256 verification for contract-account authorization.”
- `q-protocol-23-whisk-caps`: “Lists the complete eight-CAP P23 set: 0062, 0063, 0065, 0066, 0067, 0068, 0069, and 0070.”
- `q-protocol-27-cap-0071`: “Distinguishes the CAP's Final registry status from implementation and network activation.”
- `q-protocol-bls12-381-cap59`: “States BLS12-381 host functions landed in Protocol 22 via CAP-0059.”
- `q-protocol-bn254-poseidon-xray`: “Pairs CAP-0074 with the exact three P25 BN254 functions.”
- `q-sep-41-token-interface`: “Names CAP-0046-06 as the SAC interface specification related to SEP-41.”
- `q-sor-confidential-tokens`: “Phase 3 verified CAP-0059 is Final/Protocol 22 and CAP-0074/0075 are Final/Protocol 25 in stellar-protocol on 2026-06-29.”
- `q-sor-contract-trustlines-c-address`: “Protocol 26 SAC `trust` (CAP-0073, Implemented) wording is grounded in the current SAC integration docs.”
- `q-soroban-auth-delegation-p27`: “Protocol 27/CAP-0071 adds first-class authentication delegation for custom accounts.”
- `q-soroban-constructor-lifecycle`: “Constructor support was added at the protocol level via CAP-0058 (Protocol 22).”
- `q-ti-rpc-gettransactions-pagination-xdr`: This case has no CAP status or protocol assignment.

The mappings remain compatible. The changed caution cannot change this cluster's claim.

## cluster-013 — consistent

`q-comp-security-disclosure-programs` changed its HackerOne intake observation. Its incident boundary did not change.

The exact unchanged boundary is:

> Keep those protocol/core events distinct from application incidents such as YieldBlox/Blend, and date any incident claim.

The member comparison used these exact statements:

- `q-comp-security-disclosure-programs`: “NOTE: a YieldBlox/Blend POOL exploit (~$10M, Feb 2026) did occur, but that is an app/pool-config issue, not a Stellar-protocol-level funds-loss.”
- `q-comp-yieldblox-oracle-incident`: “The two exploit transactions transferred **61,249,278.3064502 XLM** and **1,000,196.7040837 USDC**.”
- `q-defi-etherfuse-stablebonds`: “The February YieldBlox incident was a thin-market/oracle-consumer failure involving USTRY collateral; it was not shown to be an Etherfuse issuer-contract exploit.”
- `q-defi-reflector-oracle`: “Treat that as the observed implementation, not a timeless security guarantee.”
- `q-hist-yieldblox-v2-2026-exploit`: “Blockaid separately reports 48,069,094 XLM quarantined, which is a subset of the XLM leg and does not mean recovered or reimbursed.”
- `q-soroban-oracle-defensive-consumption`: “The YieldBlox incident used a five-minute VWAP and two fresh poisoned rounds that passed a local deviation check.”

The cases separate transfers, valuations, quarantine, and remediation. They also preserve the application-level incident boundary.

## cluster-017 — tension

`q-protocol-base-reserve-min-balance` changed only its notes from `origin/main`. Its answer and key facts did not change.

The new exact caution is:

> Canonical-page caution: The official Sponsored Reserves page states a liabilities term.

The member comparison used these exact statements:

- `q-asset-amm-fee-reserve`: “States a pool-share trustline consumes two base reserves (1.0 XLM).”
- `q-asset-path-payment-ops`: “It settles in roughly one ledger close (~5 s) at the normal low network fee.”
- `q-asset-sdex-vs-amm`: “AMM swaps charge a fixed 30 basis points (0.30%) fee.”
- `q-asset-trustline-basics`: “A trustline raises the account's minimum balance by **one base reserve (0.5 XLM)**.”
- `q-edge-1xlm-activation-fee`: “Names 0.5 XLM as the base reserve and 1 XLM as the empty-account minimum.”
- `q-edge-noinfo-stellar-pos-staking-rewards`: “States SCP/FBA is not PoS and validators receive no native monetary/staking rewards.”
- `q-hot-fee-pool-burn-deflation`: “Treats fee-pool sequestration and total supply as different accounting concepts.”
- `q-pc-account-activation-not-found`: “For the ordinary **unsponsored** path, an empty account needs two base reserves—**1 XLM as of 2026-07-10** with a 0.5 XLM base reserve.”
- `q-pc-practical-fee-setting`: “**As of 2026-07-10**, the effective base-fee floor is 100 stroops per operation, but 100 does not guarantee inclusion under surge; a low bid can be delayed or discarded.”
- `q-pc-sponsored-reserves`: “The docs give the sponsored-reserve minimum balance formula as `(2 base reserves + numSubEntries + numSponsoring - numSponsored) * baseReserve + liabilities.selling`.”
- `q-protocol-base-reserve-min-balance`: “Liabilities are not a term in Core's minimum-balance formula.”
- `q-protocol-ledger-close-time`: “Stellar ledgers currently close in roughly **5–7 seconds**, not a fixed 3–5-second consensus constant.”
- `q-sor-doc-timestamping-manage-data`: “Ledger close time is network-recorded evidence, not a trusted wall-clock notarization by itself.”
- `q-soroban-simulate-resource-fee`: “Apply the returned Soroban transaction data/footprint and resource fee, include required authorization, handle any `restorePreamble`, and add the transaction's inclusion bid separately from the minimum resource fee.”
- `q-token-initial-supply-distribution`: “States 100B genesis creation without mining and the historical 50/25/20/5 allocation plan.”

The numeric facts remain compatible. The source boundary retains a tension about the term `minimum balance`.

`q-pc-sponsored-reserves` immediately explains the boundary:

> Stellar Core calculates these boundaries separately: `getMinBalance` excludes liabilities, and `getAvailableBalance` subtracts selling liabilities after subtracting the minimum balance.

Thus, no member directly contradicts another. The tension remains explicit and source-specific.

## cluster-018 — tension

`q-ti-rpc-gettransactions-pagination-xdr` changed only its canonical-page caution. Its answer and key facts did not change.

The member comparison used these exact statements:

- `q-infra-horizon-vs-rpc`: “Official pages currently dispute whether Horizon is already 'deprecated' versus nearing EOL, so state that conflict rather than pinning either label.”
- `q-infra-hubble-bigquery`: “It is for bulk historical queries, not transaction submission or low-latency current-state reads.”
- `q-infra-rpc-methods-list`: “`getEvents` is likewise bounded by provider-configured retention.”
- `q-infra-rpc-provider-archive-tier`: “Archive does not extend `getEvents`, `getTransaction(s)`, or `getLedgerEntries`.”
- `q-infra-which-indexer`: “You need an **indexer** rather than RPC alone for historical cross-account filtering.”
- `q-soroban-event-indexing-design`: “Do NOT dedupe by transaction hash, infer authenticity solely from topic count, call direct SAC three-topic, or assume RPC retains all history.”
- `q-soroban-publish-events`: “RPC query history is bounded and provider/configuration dependent.”
- `q-ti-compute-token-lp-market-data`: “RPC is not an unbounded historical index, Hubble is historical SQL rather than guaranteed real-time.”
- `q-ti-enumerate-holders-airdrop`: “A multi-page live crawl is not an atomic exact-ledger snapshot.”
- `q-ti-historical-pointintime-balances`: “Current Horizon account reads and RPC `getLedgerEntries` do not provide an account-balance-at-ledger parameter.”
- `q-ti-rpc-gettransactions-pagination-xdr`: “Treats RPC limits as dated stock defaults that providers can configure.”
- `q-ti-self-host-retention-backfill`: “RPC retention is a positive ledger count; zero is invalid, and current source does not impose a seven-day maximum.”

The new exact caution is:

> The official getTransactions page calls the cap hardcoded.

The same case says the source exposes configurable options. This official-page versus source-code conflict remains a tension.

The Horizon lifecycle pages also remain in tension. Every member preserves the endpoint-specific data boundary.

## cluster-065 — consistent

`q-protocol-max-tx-set-size` re-formed key facts and added one avoid item. Its answer did not change from `origin/main`.

The exact capacity statement remains:

> As observed **2026-08-21**, current official Docs and live Mainnet configuration report **1,000 classic operations per ledger** and **2,000 smart-contract transactions per ledger**.

`q-protocol-ledger-close-time` states:

> Stellar ledgers currently close in roughly **5–7 seconds**, not a fixed 3–5-second consensus constant.

Capacity and cadence are separate dimensions. Both statements are dated and compatible.

## cluster-086 — consistent

`q-comp-security-disclosure-programs` replaced the old intake-pause observation. The exact current statement is:

> The public HackerOne profile no longer displays the earlier intake-pause notice.

It also says:

> Recheck the live profile before submitting because intake availability can change.

`q-scf-sdf-bug-bounty` states:

> For new general SDF reports, use the **Stellar HackerOne policy**.

The second case does not claim that intake is accepting submissions. The dated program route remains compatible.

## cluster-100 — consistent

`q-asset-deploy-sac-cli` corrected `CONTRACT_ID_FROM_ASSET` from `origin/main`. It now states:

> The SAC's contract ID is **deterministically derived from the asset** with the `CONTRACT_ID_PREIMAGE_FROM_ASSET` XDR variant; it represents the *same* classic asset, not a copy.

`q-sor-sac-introspection` states:

> A classic asset has a deterministic, network-specific reserved SAC address derived from `ENVELOPE_TYPE_CONTRACT_ID` plus network ID and nested `CONTRACT_ID_PREIMAGE_FROM_ASSET`.

Both cases now use the same XDR variant. Both retain network-bound deterministic derivation.

## cluster-114 — tension

`q-protocol-base-reserve-min-balance` changed only its canonical-page caution. Its formula and key facts did not change.

The exact member statements are:

- `q-asset-amm-fee-reserve`: “States a pool-share trustline consumes two base reserves (1.0 XLM).”
- `q-pc-account-activation-not-found`: “Distinguishes the dated unsponsored minimum from CAP-0033 sponsored zero-balance creation.”
- `q-pc-sponsored-reserves`: “The docs give the sponsored-reserve minimum balance formula as `(2 base reserves + numSubEntries + numSponsoring - numSponsored) * baseReserve + liabilities.selling`.”
- `q-protocol-base-reserve-min-balance`: “Liabilities are not a term in Core's minimum-balance formula.”

The source tension is explicit. `q-pc-sponsored-reserves` also says Core calculates these boundaries separately.

The members can all be true with source attribution. The cluster retains a tension, not a contradiction.

## cluster-120 — consistent

`q-pc-protocol-27-zipper` changed its activation wording from `origin/main`. Its current exact statements are:

> The official software-versions page records Protocol 27 Zipper on Mainnet from July 8, 2026, the scheduled upgrade-vote date.

> Live Horizon independently reported protocol version 27 on July 11.

The member comparison used these exact statements:

- `q-edge-fresh-latest-protocol-version`: “Live Horizon shows the P26→P27 boundary at ledger **63386819** on **2026-07-08 17:00:10 UTC**.”
- `q-pc-protocol-27-zipper`: “Gives July 8, 2026 as the official Protocol 27 Mainnet date.”
- `q-pc-protocol-upgrade-timing`: “Live Horizon shows the network changed from Protocol 26 at ledger **63386818** (17:00:05 UTC) to **Protocol 27** at ledger **63386819** (17:00:10 UTC).”
- `q-protocol-27-cap-0071`: “Protocol 27 (Zipper) has been live on Stellar Mainnet since ledger 63386819, closed 2026-07-08 at 17:00:10 UTC.”
- `q-protocol-version-history-list`: “P27/Zipper (2026-07-08) activated CAP-0071 authentication delegation/address-bound credentials at ledger 63386819.”
- `q-soroban-auth-delegation-p27`: “Protocol 27 is live on Mainnet since 2026-07-08.”

July 11 remains a live check date. Every activation statement identifies July 8 as the Mainnet date.

## cluster-123 — consistent

`q-protocol-base-reserve-min-balance` changed only its notes. Its reserve values did not change.

The member comparison used these exact statements:

- `q-asset-amm-fee-reserve`: “States a pool-share trustline consumes two base reserves (1.0 XLM).”
- `q-asset-trustline-basics`: “A trustline raises the account's minimum balance by **one base reserve (0.5 XLM)**.”
- `q-edge-1xlm-activation-fee`: “Names 0.5 XLM as the base reserve and 1 XLM as the empty-account minimum.”
- `q-pc-account-activation-not-found`: “For the ordinary **unsponsored** path, an empty account needs two base reserves—**1 XLM as of 2026-07-10** with a 0.5 XLM base reserve.”
- `q-protocol-base-reserve-min-balance`: “A pool-share trustline is the important exception to 'one trustline, one reserve': it consumes **two reserve units**.”
- `q-raph-low-xlm-transfer-fail`: “Do not assume ‘balance minus 1 XLM’ is universally spendable.”

The ordinary trustline, pool-share trustline, and empty-account values agree. The low-balance case avoids a timeless formula.

## cluster-135 — consistent

`q-anchor-sdp-vs-anchor-platform` removed SEP-31 from the Wallet SDK list. That change does not alter the SDP architecture claim.

The exact shared SDP statements are:

- `q-anchor-sdp-what`: “Current SDP implements native SEP-10/24.”
- `q-anchor-sdp-vs-anchor-platform`: “SDP Core implements native SEP-10/24 with optional downstream anchor rails.”
- `q-crp-sdp-operation`: “Current SDP is an open-source bulk-disbursement stack whose **Core implements native SEP-10 and SEP-24** and publishes its own stellar.toml endpoints; it does not require an external Anchor Platform.”
- `q-pay-sdp-disbursement`: “Current SDP publishes its own stellar.toml and does not require external Anchor Platform integration.”

The cases treat downstream anchors as optional. They do not treat the advertised 10,000-payment figure as a hard invariant.

## Closeout

All 11 clusters were re-swept. No minimal golden-truth fix is required.

This was a read-only review. I changed no repository file.
