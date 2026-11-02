---
id: sls-101
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "analyze TVL total includes rows that stopped refreshing, with no staleness signal"
evidence:
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/analyze?dimension=tvl returned tvl.totalTvlUSD 1980381301, trackedProjects 17, asOf 2026-11-02T13:19:15.688Z, provider DefiLlama. top10[0] is spiko tvlUSD 1653789314 with tvlAsOf 2026-09-14T10:30:21.591Z. top10[8] is sentora tvlUSD 10393904 with tvlAsOf 2026-08-10T06:16:01.283Z. Every other top-10 row has tvlAsOf 2026-11-02T13:19:15.688Z. Response sha256 4a9efbdbee06c0ae2a15f92fb9f383d68d88cc61ce12cbbdb6f21176dadf1142."
  - "The tvl.basis text says 'asOf = most recent per-project tvlAsOf'. Each row's tvlMethod says the value is 'refreshed weekly (tvlAsOf)'. Spiko is 83.5 percent of the total and was 49 days old; Sentora was 84 days old."
  - "2026-11-02T17:19Z GET https://api.llama.fi/protocols lists slug spiko with tvl None and chains []. GET https://api.llama.fi/protocol/spiko lists chains ['Polygon','Ethereum'] and no Stellar entry in currentChainTvls. The provider no longer publishes a Stellar value for Spiko."
  - "2026-11-02T17:19Z GET https://api.llama.fi/protocol/sentora returned currentChainTvls.Stellar 71442700, last series point 2026-11-02T16:30:59Z. Scout still carries 10393904 from 2026-08-10, so its refresh for this row stopped."
  - "Adjacent row: etherfuse carries tvlUSD 2 with tvlAsOf 2026-09-14T10:30:21.591Z, the same stale timestamp as Spiko; DefiLlama /protocols lists etherfuse with tvl None and chains []."
  - "Dedupe 2026-11-02: resolved sls-038 (rollup missing) and sls-031 (methodology provenance) were fixed on 2026-07-14. Declined sls-039 concerns in-API history. None covers stale rows inside the current total. GitHub search repo:Stellar-Light/stellarlight 'spiko tvl' returned 0 results."
  - "Golden consumer: eval/qa/corpus/battery case q-edge-noinfo-exact-tvl-figure records the stale rows and keeps its golden unchanged."
---

## Finding

`GET /api/analyze?dimension=tvl` reports `totalTvlUSD: 1980381301` with `asOf: 2026-11-02T13:19:15.688Z`.
The total includes a Spiko row of 1653789314 dated 2026-09-14 and a Sentora row dated 2026-08-10.
Spiko is 83.5 percent of the total.
DefiLlama no longer publishes a Stellar value for Spiko.
DefiLlama now reports 71442700 for Sentora on Stellar, but Scout still serves 10393904.
The response gives no signal that these rows stopped refreshing, although each row says "refreshed weekly".

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/analyze?dimension=tvl'
curl -sS https://api.llama.fi/protocol/spiko
curl -sS https://api.llama.fi/protocol/sentora
```

The top-level `asOf` is the newest row date, as the `basis` text says.
So a 49-day-old value contributes most of a total that is dated today.
The `etherfuse` row has the same stale 2026-09-14 timestamp with `tvlUSD: 2`.

## Recommendation

Exclude a row from `totalTvlUSD` when its `tvlAsOf` is older than the stated refresh cadence.
Alternatively, keep the row and add `staleRows` and `oldestTvlAsOf` to the TVL object.
When the provider drops the Stellar slice, set `tvlUSD` to null with a dated reason.
Fix the refresh job for Sentora, which the provider still publishes.
