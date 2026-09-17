# Soroswap contract-role verification

- Checked: 2026-09-17T02:32–02:35Z.
- Mode: read-only. No paid calls, repo edits, filings, or external messages.
- Workspace: `/tmp/raven-routing-audit-2026-09-17/code/soroswap-role/`.
- Candidate repo unchanged (clean at `c6968e74`).

## Verdict

- **Proven source defect.** Scout mislabels the Soroswap AMM router contract `CAG5LRYQ…` as "aggregator router".
  The M2-B1a answer copied the label verbatim, so the root cause is Scout's data, not model conflation.
- **SCF $346,750:** no defect. The Scout record and the official SCF page agree, and awarded equals paid.

## 1. Exact Scout field (live)

Request: `GET https://stellarlight.xyz/api/projects/search?q=soroswap&limit=3` → HTTP 200.
Saved as `scout-search-soroswap.json`, sha256 `443aa30452ae29c874b4c4dadd9ec966daca80a920fc9ad13914eef3fc9476a3`.

Row `slug: "soroswap"`, field `onchain.contracts[0]`:

```json
{"address": "CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH", "label": "aggregator router",
 "events": 267684, "eventsDelta": 2978, "subinvocationsDelta": 767, "subinvocations": 215208,
 "storageEntries": 1, "createdAt": "2024-03-11T16:23:45.000Z", "verifiedRepo": null}
```

Related fields in the same row:

- `onchain.source`: `stellar.expert`.
- `statusSourceUrl`: `https://stellar.expert/explorer/public/contract/CAG5LRYQ…`.
- `statusBasis`: `onchain-activity`.
- `deployment.asOf`: `2026-08-28T20:58:13.695Z`.
- `CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO` (the aggregator) appears nowhere in the row.

## 2. Primary role evidence

| Source | `CAG5LRYQ…` | `CAYP3UWL…` |
|---|---|---|
| `soroswap/core` `public/mainnet.contracts.json` (last changed `42483fc4`, "Mainnet & Testnet Soroswap Deployment", 2024-03-11T16:44:46Z; core `main` `6eade008`) | `ids.router`; `hashes.router` `4c3db3eb…` (factory `CA4HEQTL…`) | absent |
| `soroswap/aggregator` `public/mainnet.contracts.json` (`82c15fd2`, "Deploy Aggregator with Aqua", 2025-06-16) | absent | `ids.aggregator`; hash `5e0bff5a…` |
| On-chain instance WASM (`mainnet.sorobanrpc.com`, ledger 64465323) | `4c3db3ebd2d6a2ab23de1f622eaabb39501539b4611b68622ec4e47f76c4ba07`, equal to the core router hash | `5e0bff5a29e2473b5289fe96aeb59b48ac335e5e87c46632b53be1f662447d2c`, equal to the aggregator hash |
| Read-only unsigned `simulateTransaction` `get_factory` | ok → `CA4HEQTL2WPEUYKYKCDOHCDNIV4QHNJ7EL4J4NQ6VADP7SYHVRYZ7AW2` (the core factory) | `HostError: Error(WasmVm, MissingValue)` |
| Read-only unsigned `simulateTransaction` `get_adapters` | `HostError: Error(WasmVm, MissingValue)` | ok → protocol 0 Soroswap router `CAG5LRYQ…`, 1 Phoenix `CCLZRD4E…`, 2 Aqua `CBQDHNBF…`; all `paused: false` |
| stellar.expert directory API | `name: "SoroSwap Router"`, `domain: soroswap.finance`, `tags: ["defi"]` | 404 (no directory entry) |

- `CAG5LRYQ…` is the Soroswap AMM router, created 2024-03-11, the same day as the core mainnet deployment.
- The aggregator only calls it through the protocol 0 adapter.
- The upstream label source (stellar.expert) says "SoroSwap Router" without "aggregator", so the "aggregator router"
  wording is Scout's own.

Artifacts: `roles.mjs` (runner copy in `../soroswap/`), `roles-result.json`, `core-mainnet.contracts.json`,
`aggregator-mainnet.contracts.json`.

## 3. M2-B1a answer

Artifact `repo/eval/qa/results/2026-09-17T02-31-40-variantA.json`, the single row:

> - Aggregator router contract: `CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH` (267,684 events observed on-chain) — https://stellar.expert/explorer/public/contract/CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH

> Phoenix … is also one of the liquidity sources Soroswap's router pulls from.

- The address, the label, and the 267,684 event count match Scout's `onchain.contracts[0]` exactly.
- The first claim is a faithful copy of a wrong source label.
- The second sentence builds on that label: the Soroswap router does not route to Phoenix; the aggregator does,
  through adapters. It is secondary synthesis.

## 4. SCF basis ($346,750)

Scout row:

- `scfTotalAwardedUSD: 346750`, `scfAmountStatus: disclosed`, `scfBasis: official-record`, `scfAsOf: 2026-09-04`.
- `scfRoundAwards`: R15 $57,600; R17 $139,150; R21 $100,000; "Liquidity Award - '24 Q1" $50,000. The sum is
  $346,750.

Official page `https://communityfund.stellar.org/project/soroswapfinance-yax` (HTTP 200, 73,006 bytes, sha256
`839e25e501d303aba07333c775318348d41b74bdbbbf0d3a40f53abeefde21eb`):

- `"totalAwarded":346750,"totalPaid":346750`;
- it contains 57600, 139150, 100000, and 50000.

The answer ("$346,750 total across rounds 15, 17, and 21 plus a Q1'24 Liquidity Award") matches both. There is no
awarded-versus-paid ambiguity. **No finding.**

## 5. Dedupe

- Repo: `CAG5LRYQ` or "aggregator router" appear only in `improvements/canonical-source/cs-002-…`, where the
  contract is correctly the Soroswap adapter router. No active or resolved `sls` finding covers `onchain.contracts`
  labels.
- Related resolved findings: `sls-035` (DEX taxonomy conflates venues and aggregators) is a different field, and
  `sls-046` (deployable-contract flag) is unrelated.
- Upstream (`gh api search/issues`, read-only):
  - `repo:Stellar-Light/stellarlight CAG5LRYQ`: 0 results.
  - "aggregator router": 8 results, all data-wave or taxonomy PRs (for example #517 for sls-035), none about
    this label.
- Next free ID: active plus resolved maximum is `sls-084`, so the next is `sls-085`.

## 6. Proposed finding (not recorded; coordinator decides)

- `sls-085`, service `stellar-light-scout`, status `verified`.
- Owner: `Stellar-Light/stellarlight` (API and data).
- `upstreamTitle`: "Soroswap onchain contract label calls the AMM router an aggregator router" (70 chars).
- Finding: `searchProjects` Soroswap `onchain.contracts[0]` labels `CAG5LRYQ…` "aggregator router". That address
  is the Soroswap AMM router (core router WASM `4c3db3eb…`, `get_factory` → core factory). The mainnet aggregator
  is `CAYP3UWL…`, which calls this router as its protocol 0 adapter.
- Recommendation:
  - Label the address as the Soroswap AMM router.
  - If the project row enumerates aggregator contracts, list `CAYP3UWL…` separately with its own role.
  - Derive contract role labels from owner deployment records or contract interfaces, not from product naming.
- Prevalence: one row confirmed. Other rows' `onchain.contracts[].label` values were not surveyed.

## Independent checks and reproduction

The coordinator repeated the unsigned checks at ledger 64465357. Fable repeated them at ledgers 64465425 and 64465426.
All checks matched the owner deployment roles. No transaction was signed or submitted.
The complete SDK 17.1.0 reproduction is in [sls-085](../../../improvements/stellar-light-scout/sls-085-soroswap-contract-role.md).
