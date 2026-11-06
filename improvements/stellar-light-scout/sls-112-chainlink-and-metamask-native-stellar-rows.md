---
id: sls-112
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Directory has no record for Chainlink Data Feeds on Stellar or for MetaMask's native Stellar support"
evidence:
  - "2026-11-02T21:36:20Z live GET https://stellarlight.xyz/api/projects/resolve?q=Chainlink and ?q=MetaMask both returned found false: 'No project in this directory is named ...'."
  - "2026-11-02 GET /api/projects/search?q=chainlink returned total 1 strict match: 'Chainlink Oracles Relayer' (slug chainlink-oracles-relayer, shortDescription 'Provable, Manipulation Resistant Random Numbers From Chainlink Oracles on Soroban.', statusSourceUrl https://docs.relink.services/). It is a third-party VRF relayer, not Chainlink Data Feeds."
  - "2026-11-02 GET /api/projects/search?q=metamask returned 'Stellar-MetaMask' (shortDescription 'The Stellar Integration on MetaMask. Utilizing the MetaMask Snaps Platform.', statusSourceUrl https://snaps.metamask.io/snap/npm/stellar-snap/, productKind integration-kit). No row describes MetaMask's built-in Stellar network."
  - "Chainlink, class A: https://docs.chain.link/data-feeds/stellar 'Chainlink Data Feeds are available on the following Stellar networks: Stellar Testnet, Stellar Mainnet (Pubnet)'. Proxy contracts: Testnet CBUF6IADAWPWIDWRTHJNINKXHG2UTIQ6TU2F2HRAXWAI7OT3KJPKK6O4, Mainnet CDQBHEUGLDHMSUHG4IH33RJBUTMNCZOT4JIAQR4WZFRDZW6DR6S32ZLZ. Changelog https://docs.chain.link/changelog/data-feeds-expands-to-stellar-24429 'Data Feeds expands to Stellar', Sep 29, 2026."
  - "MetaMask, class A: https://support.metamask.io/configure/networks/stellar 'MetaMask supports Stellar as a default network, allowing you to manage XLM and other assets.' Lumenloop articles collection has 'MetaMask makes Stellar a default network, bringing global payments int...' created 2026-10-29."
  - "Related: active sls-029 (oracle product and network evidence) names Chainlink Data Streams as unverified on 2026-07-10. It does not cover a missing provider record. Active sls-033 covers wallet enumeration semantics, not a missing wallet record."
  - "Dedupe 2026-11-02: gh issue search 'chainlink' and 'metamask' on Stellar-Light/stellarlight found closed #514 (oracle evidence) and #519 (wallet semantics) only; open #562 is a generic coverage watch."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' items Q2 and Q18. Golden follow-up: TODO item 'Add golden cases for the confirmed HackMeridian gaps' (Q18 testnet oracle addresses)."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1904
recurrences:
  - date: 2026-11-06
    evidence: "Resolve/search Chainlink and MetaMask; primary Chainlink Stellar feed docs and MetaMask support page — Still-repro. Both exact resolves false. Chainlink search gives third-party VRF relayer; MetaMask gives Snap/integration rows. Primary docs still identify native MetaMask Stellar and Chainlink testnet/mainnet proxy IDs `CBUF6IADAWPWIDWRTHJNINKXHG2UTIQ6TU2F2HRAXWAI7OT3KJPKK6O4` / `CDQBHEUGLDHMSUHG4IH33RJBUTMNCZOT4JIAQR4WZFRDZW6DR6S32ZLZ`. Next: Keep. Next after seed application: provider/product/network addresses and native-wallet-vs-Snap distinction, not brand-only name recall. Ledger: .agents/rounds/2026-11-05-truth-maintenance/scout.md."
---

## Finding

The directory has no record for two first-party Stellar launches from September and October 2026.

- Chainlink Data Feeds run on Stellar Testnet and Mainnet through one proxy contract per network.
  The only "Chainlink" row is a third-party randomness relayer.
- MetaMask supports Stellar as a default network.
  The only MetaMask row is the older community Snap.

An agent that asks for oracles with testnet addresses, or for wallets with native Stellar support, misses both.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/resolve?q=Chainlink'
curl -sS 'https://stellarlight.xyz/api/projects/search?q=chainlink&limit=5'
curl -sS 'https://stellarlight.xyz/api/projects/search?q=metamask&limit=5'
```

Chainlink's Stellar page gives the proxy contracts:
Testnet `CBUF6IADAWPWIDWRTHJNINKXHG2UTIQ6TU2F2HRAXWAI7OT3KJPKK6O4` and
Mainnet `CDQBHEUGLDHMSUHG4IH33RJBUTMNCZOT4JIAQR4WZFRDZW6DR6S32ZLZ`.

## Recommendation

Add a Chainlink record with type Oracle, both networks, and the two proxy contract IDs as deployments.
Add a MetaMask record (or product) for its native Stellar network, separate from the Snap row.
Mark the Snap row's relation to the native support, so callers can tell the two apart.
