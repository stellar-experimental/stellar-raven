---
id: sls-101
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "GET /api/analyze includes stale TVL rows without a stale-total warning"
evidence:
  - "2026-11-06 scope/progress reconciliation: .agents/rounds/2026-11-06-remaining-sweep/other.md, row sls-101; replay arguments and response hashes in research/audits/2026-11-06-remaining-sweep/other-receipt.json."
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/analyze?dimension=tvl returned tvl.totalTvlUSD 1980381301, trackedProjects 17, asOf 2026-11-02T13:19:15.688Z, provider DefiLlama. top10[0] is spiko tvlUSD 1653789314 with tvlAsOf 2026-09-14T10:30:21.591Z. top10[8] is sentora tvlUSD 10393904 with tvlAsOf 2026-08-10T06:16:01.283Z. Every other top-10 row has tvlAsOf 2026-11-02T13:19:15.688Z. Response sha256 4a9efbdbee06c0ae2a15f92fb9f383d68d88cc61ce12cbbdb6f21176dadf1142."
  - "The tvl.basis text says 'asOf = most recent per-project tvlAsOf'. Each row's tvlMethod says the value is 'refreshed weekly (tvlAsOf)'. Spiko is 83.5 percent of the total and was 49 days old; Sentora was 84 days old."
  - "2026-11-02T17:19Z GET https://api.llama.fi/protocols lists slug spiko with tvl None and chains []. GET https://api.llama.fi/protocol/spiko lists chains ['Polygon','Ethereum'] and no Stellar entry in currentChainTvls. The provider no longer publishes a Stellar value for Spiko."
  - "2026-11-02T17:19Z GET https://api.llama.fi/protocol/sentora returned currentChainTvls.Stellar 71442700, last series point 2026-11-02T16:30:59Z. Scout still carries 10393904 from 2026-08-10, so its refresh for this row stopped."
  - "Adjacent row: etherfuse carries tvlUSD 2 with tvlAsOf 2026-09-14T10:30:21.591Z, the same stale timestamp as Spiko; DefiLlama /protocols lists etherfuse with tvl None and chains []."
  - "Dedupe 2026-11-02: resolved sls-038 (rollup missing) and sls-031 (methodology provenance) were fixed on 2026-07-14. Declined sls-039 concerns in-API history. None covers stale rows inside the current total. GitHub search repo:Stellar-Light/stellarlight 'spiko tvl' returned 0 results."
  - "Golden consumer: eval/qa/corpus/battery case q-edge-noinfo-exact-tvl-figure records the stale rows and keeps its golden unchanged."
  - "2026-11-02T22:38Z recheck: curl -sS --max-time 50 'https://stellarlight.xyz/api/analyze?dimension=tvl' returned HTTP 200. totalTvlUSD=1980381301; trackedProjects=17; asOf=2026-11-02T13:19:15.688Z. Spiko=1653789314 dated 2026-09-14T10:30:21.591Z; Sentora=10393904 dated 2026-08-10T06:16:01.283Z. No staleRows or oldestTvlAsOf field appears."
  - "2026-11-02T22:38Z provider checks: curl -sS --max-time 50 https://api.llama.fi/protocols returned HTTP 200. Spiko and Etherfuse each have tvl=null, chains=[], and chainTvls={}. curl -sS --max-time 50 https://api.llama.fi/protocol/spiko returned HTTP 200 with currentChainTvls={}. curl -sS --max-time 50 https://api.llama.fi/protocol/sentora returned HTTP 200 with currentChainTvls.Stellar=71200916."
  - "2026-11-02 calibration: curl -sS --retry 2 --max-time 30 'https://stellarlight.xyz/api/projects/search?q=etherfuse&limit=3' returned HTTP 200. Etherfuse still has tvlUSD=2 and tvlAsOf=2026-09-14T10:30:21.591Z. Equivalent spiko and sentora queries returned HTTP 200. All three rows still say refreshed weekly. Grep of analyze/route.ts and scripts/enrich-tvl.ts confirms the sum lacks an age filter. These dates show last observations, not the first defective release."
  - "2026-11-02 dedupe: gh search issues and gh search prs searched Stellar-Light/stellarlight for spiko and 'tvl stale', across all states. No matching stale-total report appeared. Issue 494 covers provenance; issues 1710 and 1531 cover other defects; tracker 586 covers routine triage. PR results concern other data or TVL features. rg over improvements/ and improvements/resolved.json found related sls-031, sls-038, and declined sls-039, with different defects. Intake resolves to Stellar-Light/stellarlight without an override."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1912
recurrences:
  - date: 2026-11-06
    evidence: "`/api/analyze?dimension=tvl`, Spiko/Sentora/Etherfuse project reads, DefiLlama protocols and protocol reads — Partial for full record; warning fix is live. total1,980,381,301; staleTvlUSD1,664,183,220; oldestAsOf2026-08-10; explicit warning says3/17,84%; staleProjects names Spiko/Sentora/Etherfuse; their project rows carry tvlStale=true. Underlying old values remain: Spiko1,653,789,314 (09-14), Sentora10,393,904 (08-10), Etherfuse2 (09-14). Provider absence/remap must not become fresh zero. Next: Either keep narrowed residual or resolve warning-only original with a self-contained stale-refresh successor; do not claim refreshed values. Next: owner Sentora `stellar-defi-hub` remap/enrich and explicit unavailable-provider handling; repeat aggregate and three rows. Ledger: .agents/rounds/2026-11-05-truth-maintenance/scout.md."
---

## Finding

The stale-total warning is now deployed. On 2026-11-06,
`GET /api/analyze?dimension=tvl` reports `totalTvlUSD: 1980381301`,
`staleTvlUSD: 1664183220`, oldest observation 2026-08-10, and an explicit
warning that 3 of 17 projects supply 84% of the total. `staleProjects` names
Spiko, Sentora, and Etherfuse, and their project rows expose `tvlStale: true`.

The underlying stale values remain: Spiko 1653789314 dated 2026-09-14,
Sentora 10393904 dated 2026-08-10, and Etherfuse 2 dated 2026-09-14.
Thus the original warning gap has a live fix, while the original record's
refresh/unavailable-provider recommendation remains unresolved. Keep that
scope distinction explicit; this record is not a full-scope fixed candidate.

At discovery on 2026-11-02 there was no warning and the aggregate `asOf` was
the newest row date, obscuring most of the total's age. The provider values in
the dated evidence below are observations from that date, not today's values.

## Evidence

Read-only reproduction:

```sh
curl -sS --max-time 50 'https://stellarlight.xyz/api/analyze?dimension=tvl'
curl -sS --max-time 50 https://api.llama.fi/protocols
curl -sS --max-time 50 https://api.llama.fi/protocol/spiko
curl -sS --max-time 50 https://api.llama.fi/protocol/sentora
curl -sS --retry 2 --max-time 30 'https://stellarlight.xyz/api/projects/search?q=etherfuse&limit=3'
```

All commands returned HTTP 200 on 2026-11-02.
Spiko and Etherfuse have `tvl: null` in the provider list.
The adjacent Etherfuse row still reports `tvlUSD: 2`, dated 2026-09-14.
Sentora's current provider value differs from Scout's stored value.

## Recommendation

Preserve the deployed stale-total warning, stale contribution, oldest date,
and per-project stale flags. Refresh or remap Sentora using the current provider
identity and record unavailable provider values with a dated reason. Do not
convert missing provider data into a fresh zero. Apply the same availability
and freshness rules to project rows and the aggregate.

After a refresh change, repeat the aggregate and all three project reads.
If resolving only the original warning scope, first retain the stale-refresh
residual in a self-contained successor and independently verify the scope split;
warning deployment alone does not establish refreshed underlying values.
