---
id: sls-099
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "Scout Soroswap descriptions omit current API venues and do not distinguish Phoenix contract support"
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
  - "Operator source 2026-11-02: https://docs.soroswap.finance/aggregator/technical-reference/contracts/aggregator-v3.md (sha256 47a601c5c67d9937133a36615686a06b26884aca27eb88b0ef7f1d3acc55784f) names mainnet Aggregator v3 CARVQXFP4JF5ELLXUMQ6DALR346YVGBMQOHB4ENA7SSVXAYABXLBDDC4. Its Hop enum has Soroswap, Aqua, Sushi, Phoenix, and Comet variants, but the per-venue table documents only Soroswap, Aquarius, SushiSwap V3, and Comet. The contract reference includes a Phoenix hop; the API venue documentation does not list Phoenix."
  - "Ambiguity recorded honestly: whether Phoenix counts as an aggregated venue depends on contract-level versus API-level scope. The SushiSwap V3 and Comet omissions are unambiguous."
  - "Golden consumers: eval/qa/corpus/battery cases q-defi-phoenix-what-is, q-defi-soroswap-what-is, q-defi-soroswap-vs-stellarx, and q-defi-provide-liquidity-impermanent-loss cite the operator venue page."
  - "2026-11-02T22:37Z recheck: curl -sS 'https://stellarlight.xyz/api/projects/search?q=soroswap&limit=100' and the phoenix equivalent returned HTTP 200. Soroswap retains '(Soroswap, Phoenix, Aquarius)'; Phoenix retains 'One of the AMM liquidity sources aggregated by Soroswap.' The Soroswap query returned 20 rows; the Phoenix query returned 6."
  - "2026-11-02T22:37Z source check: curl -sS https://docs.soroswap.finance/aggregator/supported-amms.md returned HTTP 200. Its protocols values are soroswap, aqua, sushi, comet, and sdex. curl -sS https://docs.soroswap.finance/aggregator/technical-reference/contracts/aggregator-v3.md returned HTTP 200 and includes Phoenix(PhoenixHop). This proves a documentation-scope mismatch, not an authenticated quote result or a Phoenix contract failure."
  - "2026-11-02 calibration: rg -n -i 'Phoenix|Sushi|Comet|protocols|SDEX' over both fetched operator pages confirms the API/contract distinction. A scan of shortDescription across both Scout searches found the two relevant Soroswap aggregation claims. Other products describe their own routing. No first-bad release or executable dependency snippet is claimed."
  - "2026-11-02 dedupe: gh search issues Soroswap and gh search prs Soroswap, each with --repo Stellar-Light/stellarlight and --state open/closed, found no duplicate venue-description report. Additional issue/PR searches for 'supported-amms' and the exact 'aggregated by Soroswap' phrase found none. rg -n -i 'Soroswap.*venue|supported-amms|aggregated by Soroswap|SushiSwap|Phoenix' improvements/ found sls-085 for a contract-role label (fixed upstream and resolved 2026-11-02; see improvements/resolved.json) and active sls-113 for taxonomy coverage. Neither covers the venue list; no merge is needed."
  - "2026-11-02 owner check: improvements/intake.json resolves this API finding to Stellar-Light/stellarlight. gh api repos/Stellar-Light/stellarlight confirms archived false and has_issues true. No override is needed."
---

## Finding

The Scout Soroswap description omits current API venues and does not distinguish API support from contract support.
It names "Soroswap, Phoenix, Aquarius" as the aggregator venue set.
The operator's current API documentation lists Soroswap, Aquarius, SushiSwap V3, Comet, and SDEX.
The Scout description omits SushiSwap V3 and Comet.
The Phoenix description also calls Phoenix an aggregated liquidity source without a scope qualification.
Readers can mistake contract support for the current API venue list.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/search?q=soroswap&limit=100'
curl -sS 'https://stellarlight.xyz/api/projects/search?q=phoenix&limit=100'
curl -sS https://docs.soroswap.finance/aggregator/supported-amms.md
curl -sS https://docs.soroswap.finance/aggregator/technical-reference/contracts/aggregator-v3.md
```

The live checks at 2026-11-02T22:37Z returned HTTP 200 for all four sources.
The Soroswap `shortDescription` retained "(Soroswap, Phoenix, Aquarius)".
The Phoenix `shortDescription` retained "One of the AMM liquidity sources aggregated by Soroswap."

The operator API documentation gives the `protocols` values `soroswap`, `aqua`, `sushi`, `comet`, and `sdex`.
It describes SDEX as a separate classic path.
It does not list Phoenix as an API venue.
The Aggregator v3 contract reference includes `Phoenix(PhoenixHop)` in its `Hop` enum.
That reference does not prove that the current API offers Phoenix.
These checks compare published descriptions; they do not test authenticated API quotes.

The adjacent Scout search results include other products with their own venue descriptions.
Those descriptions do not establish the Soroswap Aggregator API venue set.
The introducing change date remains unknown.
This finding concerns the documentation available on 2026-11-02.

## Recommendation

Update the Soroswap `shortDescription` to match the operator's current API venue documentation.
Name Soroswap, Aquarius, SushiSwap V3, and Comet for Soroban routes.
Describe SDEX as the separate classic path.
Qualify the Phoenix description as contract-level support, or remove its unqualified Soroswap aggregation claim.
Cite `https://docs.soroswap.finance/aggregator/supported-amms` for the API venue list.
