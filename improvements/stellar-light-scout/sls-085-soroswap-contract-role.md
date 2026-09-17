---
id: sls-085
service: stellar-light-scout
status: verified
discovered: 2026-09-17
upstreamTitle: Soroswap onchain contract label calls the AMM router an aggregator router
evidence:
  - "2026-09-17T02:32Z live GET https://stellarlight.xyz/api/projects/search?q=soroswap&limit=3 returned HTTP 200. Row slug soroswap, onchain.contracts[0] = address CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH, label \"aggregator router\", events 267684, createdAt 2024-03-11T16:23:45.000Z; onchain.source stellar.expert. Response sha256 443aa30452ae29c874b4c4dadd9ec966daca80a920fc9ad13914eef3fc9476a3. The mainnet aggregator CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO does not appear in the row."
  - "Owner deployment record: https://github.com/soroswap/core/blob/42483fc4c1fc65d1a64b4b460383a3d937cf45e7/public/mainnet.contracts.json lists ids.router CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH with hashes.router 4c3db3ebd2d6a2ab23de1f622eaabb39501539b4611b68622ec4e47f76c4ba07 and ids.factory CA4HEQTL2WPEUYKYKCDOHCDNIV4QHNJ7EL4J4NQ6VADP7SYHVRYZ7AW2. The file is unchanged at soroswap/core main 6eade008ee6794075ad941609e0fef0d1124d3eb."
  - "Owner deployment record: https://github.com/soroswap/aggregator/blob/82c15fd2483ed9a7ba7132fb2499147650a5286b/public/mainnet.contracts.json lists ids.aggregator CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO with hashes.aggregator 5e0bff5a29e2473b5289fe96aeb59b48ac335e5e87c46632b53be1f662447d2c. The file is unchanged at soroswap/aggregator main 84de10e0f8d26168b4a76f8c23b963e50917517c."
  - "2026-09-17T02:33Z read-only mainnet checks through https://mainnet.sorobanrpc.com at ledger 64465323, unsigned and never submitted: CAG5LRYQ… instance WASM hash 4c3db3eb… (core router); get_factory returns CA4HEQTL…; get_adapters fails with Error(WasmVm, MissingValue). CAYP3UWL… instance WASM hash 5e0bff5a… (aggregator); get_factory fails with Error(WasmVm, MissingValue); get_adapters returns protocol_id 0 router CAG5LRYQ…, 1 CCLZRD4E72T7JCZCN3P7KNPYNXFYKQCL64ECLX7WP5GNVYPYJGU2IO2G, 2 CBQDHNBFBZYE4MKPWBSJOPIYLW4SFSXAXUTSXJN76GNKYVYPCKWC6QUK, all paused false."
  - "Cited label source: GET https://api.stellar.expert/explorer/directory/CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH returns name \"SoroSwap Router\", domain soroswap.finance, tags [defi]. The same endpoint for CAYP3UWL… returns 404. The \"aggregator\" wording is not in the cited source."
  - "Consumer impact: Raven QA artifact eval/qa/results/2026-09-17T02-31-40-variantA.json (sha256 7ee79dd9a76b313f3ba6c2110fbeda6176daabcfd459bbf01cb36c61ccc8e0a7; routing-audit M2-B1a, q-defi-soroswap-what-is) repeats the label verbatim as \"Aggregator router contract: CAG5LRYQ… (267,684 events observed on-chain)\"."
  - "Prevalence: one project row (soroswap) confirmed. Other rows' onchain.contracts[].label values were not surveyed."
  - "Dedupe 2026-09-17: no active or resolved Raven finding covers onchain.contracts labels (resolved sls-035 concerns DEX taxonomy; sls-046 concerns isDeployableContract). GitHub search repo:Stellar-Light/stellarlight CAG5LRYQ returned 0 results; \"aggregator router\" results are unrelated data-wave and taxonomy PRs."
  - "Independent coordinator reproduction at 2026-09-17T02:36Z, ledger 64465357: Scout repeats the aggregator-router label; the AMM router exposes get_factory, and the aggregator exposes get_adapters with that AMM router under protocol 0. Both on-chain WASM hashes match the owner deployment records."
  - "Raw evidence: research/audits/2026-09-17-routing-audit/soroswap-contract-role.md."
---

## Finding

The Soroswap project record labels contract `CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH` as `aggregator router`.
That address is the Soroswap AMM router.
The Soroswap mainnet aggregator is a different contract, `CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO`.
A recorded answer repeats the label as "Aggregator router contract".

## Evidence

The live `projects/search` response for `q=soroswap` contains this contract row:

```json
{"address": "CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH", "label": "aggregator router", "events": 267684, "createdAt": "2024-03-11T16:23:45.000Z"}
```

The owner deployment records assign the two addresses to different roles:

- [`soroswap/core` `public/mainnet.contracts.json` at `42483fc4c1fc65d1a64b4b460383a3d937cf45e7`](https://github.com/soroswap/core/blob/42483fc4c1fc65d1a64b4b460383a3d937cf45e7/public/mainnet.contracts.json)
  lists `CAG5LRYQ…` as `router` with hash `4c3db3eb…`.
- [`soroswap/aggregator` `public/mainnet.contracts.json` at `82c15fd2483ed9a7ba7132fb2499147650a5286b`](https://github.com/soroswap/aggregator/blob/82c15fd2483ed9a7ba7132fb2499147650a5286b/public/mainnet.contracts.json)
  lists `CAYP3UWL…` as `aggregator` with hash `5e0bff5a…`.

Mainnet state agrees with those records:

| Check | `CAG5LRYQ…` | `CAYP3UWL…` |
|---|---|---|
| Instance WASM hash | `4c3db3eb…` (core router) | `5e0bff5a…` (aggregator) |
| `get_factory` | returns `CA4HEQTL…` (core factory) | fails: `MissingValue` |
| `get_adapters` | fails: `MissingValue` | returns protocol 0 router `CAG5LRYQ…`, plus Phoenix and Aqua routers |

The aggregator calls `CAG5LRYQ…` through its Soroswap adapter. The router is not the aggregator.

The record cites stellar.expert as its on-chain source. The stellar.expert directory names `CAG5LRYQ…` `SoroSwap Router`
and has no entry for `CAYP3UWL…`. The `aggregator` wording does not come from that source.

Read-only reproduction. The transaction is unsigned and never submitted.

```sh
curl -s "https://stellarlight.xyz/api/projects/search?q=soroswap&limit=3" \
  | jq '.. | objects | select(.slug? == "soroswap" and has("onchain")) | .onchain.contracts'
```

```js
// npm i @stellar/stellar-sdk@17.1.0
import { Account, Contract, Keypair, Networks, TransactionBuilder, BASE_FEE, rpc, scValToNative } from "@stellar/stellar-sdk";
const server = new rpc.Server("https://mainnet.sorobanrpc.com");
for (const [id, fn] of [
  ["CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH", "get_factory"],
  ["CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO", "get_adapters"]
]) {
  const tx = new TransactionBuilder(new Account(Keypair.random().publicKey(), "0"), { fee: BASE_FEE, networkPassphrase: Networks.PUBLIC })
    .addOperation(new Contract(id).call(fn)).setTimeout(30).build();
  const sim = await server.simulateTransaction(tx);
  console.log(id, fn, rpc.Api.isSimulationError(sim) ? sim.error : scValToNative(sim.result.retval));
}
```

Expected output: `get_factory` on `CAG5LRYQ…` returns `CA4HEQTL…`. `get_adapters` on `CAYP3UWL…` lists `CAG5LRYQ…` as the
protocol 0 router.

This report confirms one project row. Labels in other project rows were not surveyed.

## Recommendation

Label `CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH` as the Soroswap AMM router.
If the Soroswap row lists aggregator contracts, add `CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO` with the
aggregator role.
Derive contract role labels from owner deployment records or contract interfaces, not from product descriptions.
