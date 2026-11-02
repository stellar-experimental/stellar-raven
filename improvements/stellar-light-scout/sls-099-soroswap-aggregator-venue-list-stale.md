---
id: sls-099
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "Soroswap and Phoenix descriptions list an outdated Soroswap Aggregator venue set"
probe:
  type: http-text
  url: https://stellarlight.xyz/api/projects/search?q=soroswap&limit=3
  expect:
    status: 200
    contains:
      - "(Soroswap, Phoenix, Aquarius)"
evidence:
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/projects/search?q=soroswap&limit=3 returned row soroswap with shortDescription '... with an aggregator that routes trades across Soroban AMMs (Soroswap, Phoenix, Aquarius) for best on-chain execution. Its swap Route API returns quotes and optimal routing across Stellar DEXs, including the Stellar classic DEX (SDEX).'"
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/projects/search?q=phoenix&limit=3 returned row phoenix with shortDescription ending 'One of the AMM liquidity sources aggregated by Soroswap.'"
  - "Operator source 2026-11-02: https://docs.soroswap.finance/aggregator/supported-amms.md (HTTP 200, sha256 ccccaa2ec102b87ba323a8f8e7a87498f50196d6c78f3e18d6c5b8bfa5ab491f) says 'The venues the Soroswap Aggregator API routes through and their protocols values: soroswap, aqua (Aquarius), sushi (SushiSwap V3), comet and sdex'. Its venue table has five rows: Soroswap AMM, Aquarius, SushiSwap V3, Comet, SDEX. Phoenix is not listed."
  - "Operator source 2026-11-02: https://docs.soroswap.finance/aggregator/technical-reference/contracts/aggregator-v3.md (sha256 47a601c5c67d9937133a36615686a06b26884aca27eb88b0ef7f1d3acc55784f) names mainnet Aggregator v3 CARVQXFP4JF5ELLXUMQ6DALR346YVGBMQOHB4ENA7SSVXAYABXLBDDC4. Its Hop enum has Soroswap, Aqua, Sushi, Phoenix, and Comet variants, but the per-venue table documents only Soroswap, Aquarius, SushiSwap V3, and Comet. The contract can encode a Phoenix hop; the API venue list does not offer Phoenix."
  - "Ambiguity recorded honestly: whether Phoenix counts as an aggregated venue depends on contract-level versus API-level scope. The SushiSwap V3 and Comet omissions are unambiguous."
  - "Dedupe 2026-11-02: active sls-085 covers the Soroswap contract-role label (AMM router labelled aggregator router), not the venue list in descriptions. No resolved finding covers it. GitHub search repo:Stellar-Light/stellarlight supported-amms returned 0 results."
  - "Golden consumers: eval/qa/corpus/battery cases q-defi-phoenix-what-is, q-defi-soroswap-what-is, q-defi-soroswap-vs-stellarx, and q-defi-provide-liquidity-impermanent-loss cite the operator venue page."
---

## Finding

The Soroswap description says its aggregator routes across "Soroswap, Phoenix, Aquarius".
The Phoenix description calls Phoenix "One of the AMM liquidity sources aggregated by Soroswap."
The Soroswap docs list the Aggregator API venues as Soroswap, Aquarius, SushiSwap V3, Comet, and SDEX.
The descriptions omit SushiSwap V3 and Comet.
The API venue list does not include Phoenix.
Agents repeat the outdated venue set as the current routing scope.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/search?q=soroswap&limit=3'
curl -sS 'https://stellarlight.xyz/api/projects/search?q=phoenix&limit=3'
curl -sSL https://docs.soroswap.finance/aggregator/supported-amms.md
```

The Supported venues page has five rows: Soroswap AMM, Aquarius, SushiSwap V3, Comet, and SDEX.
It gives the `protocols` values `soroswap`, `aqua`, `sushi`, `comet`, and `sdex`.

The Aggregator v3 contract reference has a `Phoenix(PhoenixHop)` variant in its `Hop` enum.
Its per-venue table and the API venue list do not include Phoenix.
So the contract can encode a Phoenix hop, but the API does not offer Phoenix as a venue.

## Recommendation

Update the Soroswap shortDescription to the operator venue list.
Name Soroswap, Aquarius, SushiSwap V3, and Comet for Soroban routes, and SDEX as the classic path.
Remove "aggregated by Soroswap" from the Phoenix description, or qualify it as contract-level support.
Cite `https://docs.soroswap.finance/aggregator/supported-amms` as the source for the venue list.
