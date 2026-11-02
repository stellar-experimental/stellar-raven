---
id: sls-102
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "Blend tvlMethodUrl links to the V1 child page, not the series that produces tvlUSD"
probe:
  type: http-text
  url: https://stellarlight.xyz/api/projects/search?q=blend&limit=3
  expect:
    status: 200
    contains:
      - "\"tvlMethodUrl\":\"https://defillama.com/protocol/blend-pools\""
evidence:
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/projects/search?q=blend&limit=3 returned row blend with tvlUSD 129334939, tvlAsOf 2026-11-02T13:19:15.688Z, llamaSlugs ['blend-pools','blend-pools-v2','blend-backstop','blend-backstop-v2'], and tvlMethodUrl 'https://defillama.com/protocol/blend-pools'. Its tvlMethod says the value is the 'sum of the project's mapped DefiLlama protocol rows (see llamaSlugs; e.g. Blend = pools + backstops)'."
  - "2026-11-02T17:19Z GET https://api.llama.fi/protocols: blend-pools (V1) Stellar 43517, blend-pools-v2 Stellar 129348788, blend-backstop 0, blend-backstop-v2 0. All four have parentProtocol 'parent#blend'."
  - "2026-11-02T17:20Z GET https://api.llama.fi/protocol/blend returned name Blend with currentChainTvls.Stellar 129392305, the parent series that matches tvlUSD."
  - "Prevalence: a scan of 22 TVL-bearing DeFi and RWA queries found one row with more than one llamaSlug (blend). Every single-slug row links to its own slug."
  - "Dedupe 2026-11-02: declined sls-039 accepts provider-hosted history and routes trend questions to tvlMethodUrl; a wrong tvlMethodUrl undermines that accepted boundary but is a different defect. Resolved sls-031 added tvlMethodUrl. GitHub search repo:Stellar-Light/stellarlight tvlMethodUrl returned only closed #522 and #494, which predate this mapping."
  - "Golden consumer: eval/qa/corpus/battery case q-edge-fresh-latest-blend-tvl records the V1 child URL as class C evidence."
---

## Finding

The Blend row reports `tvlUSD: 129334939` from four mapped DefiLlama rows.
Its `tvlMethodUrl` is `https://defillama.com/protocol/blend-pools`.
That page is the Blend V1 child, which held about 43517 USD on Stellar on 2026-11-02.
The value comes almost entirely from `blend-pools-v2`.
A reader who opens the method URL sees a figure about 3000 times smaller than `tvlUSD`.
The accepted design sends trend and peak questions to this URL, so the wrong page gives wrong trends.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/search?q=blend&limit=3'
curl -sS https://api.llama.fi/protocols
curl -sS https://api.llama.fi/protocol/blend
```

The four `llamaSlugs` all have `parentProtocol: "parent#blend"`.
The parent `blend` series reports 129392305 on Stellar, which matches `tvlUSD`.

## Recommendation

When all mapped slugs share one DefiLlama parent, set `tvlMethodUrl` to the parent page.
For Blend this is `https://defillama.com/protocol/blend`.
When the slugs have no common parent, list one URL for each slug instead of the first slug only.
