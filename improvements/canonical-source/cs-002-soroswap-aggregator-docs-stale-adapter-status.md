---
id: cs-002
service: canonical-source
status: verified
discovered: 2026-09-17
upstreamTitle: "Aggregator docs say Phoenix and Aqua are on Testnet or coming soon; mainnet adapters are configured and unpaused"
evidence:
  - "Docs source: soroswap/docs main 1d7a3c8a85616918415056ad2a0f6d2177fc1948 (2026-09-06). concepts/aggregator.mdx:13-14 marks Phoenix Protocol AMM and Aqua AMM as (currently on Testnet). aggregator/supported-amms.mdx:12 marks Aquarius AMM (Coming Soon); its frontmatter description says Aquarius is coming soon. Both files were last changed in 0da69fc2 (2026-09-01)."
  - "Scope: concepts/aggregator.mdx:10 describes AMMs currently deployed on the Soroban-Stellar Mainnet that the aggregator currently uses. The aggregator/index.mdx card says supported-amms lists the protocols the aggregator currently routes through. Both pages are in docs.json navigation. On 2026-09-17, both pages returned HTTP 200 and rendered the stale labels."
  - "Adjacent docs: api/index.mdx:19 already names Soroswap, Phoenix, Aqua and SDEX for API quotes and routes. That page describes the API, which also covers SDEX."
  - "Deployment record: soroswap/aggregator public/mainnet.contracts.json, last changed in 82c15fd2 (Deploy Aggregator with Aqua, 2025-06-16), lists aggregator CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO with WASM hash 5e0bff5a29e2473b5289fe96aeb59b48ac335e5e87c46632b53be1f662447d2c. The on-chain instance has the same hash. contracts/aggregator/src/models.rs maps Soroswap=0, Phoenix=1, Aqua=2, Comet=3 at both 82c15fd2 and main 84de10e0."
  - "2026-09-17T01:30Z read-only simulateTransaction of get_adapters on that aggregator, unsigned and never submitted, through https://mainnet.sorobanrpc.com and https://rpc.lightsail.network at ledger 64464571: protocol_id 0, 1, and 2 are configured with paused false. Routers: Soroswap CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH, Phoenix CCLZRD4E72T7JCZCN3P7KNPYNXFYKQCL64ECLX7WP5GNVYPYJGU2IO2G, Aqua CBQDHNBFBZYE4MKPWBSJOPIYLW4SFSXAXUTSXJN76GNKYVYPCKWC6QUK. All three router contract instances exist on mainnet."
  - An independent coordinator reproduction through both RPC providers at ledger 64464708 returned the same three unpaused adapters.
  - "No swap was simulated or submitted. This evidence shows adapter configuration and pause state, not swap success or liquidity."
  - "Dedupe 2026-09-17: no soroswap/docs or soroswap/aggregator issue or PR covers Phoenix, Aqua, testnet status, or supported AMMs. Open soroswap/docs #39 (generic upgrade checklist) and #42 (deployed contracts, empty body) do not cover adapter status."
---

## Finding

Two published Soroswap docs pages give a stale status for aggregator liquidity sources.
`concepts/aggregator.mdx` labels Phoenix Protocol AMM and Aqua AMM as "(currently on Testnet)".
`aggregator/supported-amms.mdx` labels Aquarius AMM "(Coming Soon)".
The mainnet aggregator already has registered, unpaused Phoenix and Aqua adapters.

## Evidence

Both pages describe the aggregator's current sources. `concepts/aggregator.mdx:10` refers to AMMs
"currently deployed on the Soroban-Stellar Mainnet". The aggregator index card describes
`supported-amms` as "Which protocols the aggregator currently routes through."

`public/mainnet.contracts.json` in `soroswap/aggregator` names aggregator
`CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO`. The on-chain WASM hash matches that record.
A read-only `simulateTransaction` of `get_adapters()` returns:

| protocol_id | Protocol (`models.rs`) | router | paused |
|---|---|---|---|
| 0 | Soroswap | `CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH` | false |
| 1 | Phoenix | `CCLZRD4E72T7JCZCN3P7KNPYNXFYKQCL64ECLX7WP5GNVYPYJGU2IO2G` | false |
| 2 | Aqua | `CBQDHNBFBZYE4MKPWBSJOPIYLW4SFSXAXUTSXJN76GNKYVYPCKWC6QUK` | false |

Reproduce with `@stellar/stellar-sdk` 17.1.0. The transaction is unsigned and not submitted:

```js
import { Account, Contract, Keypair, Networks, TransactionBuilder, BASE_FEE, rpc, scValToNative } from "@stellar/stellar-sdk";
const server = new rpc.Server("https://mainnet.sorobanrpc.com");
const tx = new TransactionBuilder(new Account(Keypair.random().publicKey(), "0"), { fee: BASE_FEE, networkPassphrase: Networks.PUBLIC })
  .addOperation(new Contract("CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO").call("get_adapters"))
  .setTimeout(30).build();
const sim = await server.simulateTransaction(tx);
console.log(scValToNative(sim.result.retval));
```

This check shows configuration and pause state only. It does not show a successful swap.

## Recommendation

Update `concepts/aggregator.mdx` and `aggregator/supported-amms.mdx` to list Soroswap, Phoenix, and
Aqua/Aquarius as current mainnet aggregator sources. Remove the "(currently on Testnet)" and
"(Coming Soon)" labels and the matching frontmatter description. Link
`soroswap/aggregator` `public/mainnet.contracts.json` so readers can verify the configuration.
