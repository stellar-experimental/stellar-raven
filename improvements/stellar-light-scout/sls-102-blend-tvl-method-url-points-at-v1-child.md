---
id: sls-102
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-11-02
upstreamTitle: "Blend tvlMethodUrl points to one V1 child while tvlUSD sums four protocol rows"
probe:
  type: http-text
  url: https://stellarlight.xyz/api/projects/search?q=blend&limit=3
  expect:
    status: 200
    contains:
      - "\"tvlMethodUrl\":\"https://defillama.com/protocol/blend-pools\""
evidence:
  - "2026-11-09T20:31:56Z deployed fix verified: Blend tvlMethodUrl=https://defillama.com/protocol/blend and four mapped pool/backstop V1/V2 llamaSlugs. Both statusChecks sourceUrl values use the parent. Live DefiLlama protocol list puts all four children under parent#blend; parent endpoint has Stellar TVL/history, with borrowed and pool2 separate. Single-slug Soroswap still cites soroswap-amm. Different observation times do not imply exact numeric equality. theboycoder reports enrich-tvl execution at https://github.com/Stellar-Light/stellarlight/issues/1913#issuecomment-6701318370. Author-side fixed candidate. Receipts: research/audits/2026-11-09-improvements-sweep/lane-scout.md."
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/projects/search?q=blend&limit=3 returned row blend with tvlUSD 129334939, tvlAsOf 2026-11-02T13:19:15.688Z, llamaSlugs ['blend-pools','blend-pools-v2','blend-backstop','blend-backstop-v2'], and tvlMethodUrl 'https://defillama.com/protocol/blend-pools'. Its tvlMethod says the value is the 'sum of the project's mapped DefiLlama protocol rows (see llamaSlugs; e.g. Blend = pools + backstops)'."
  - "2026-11-02T17:19Z GET https://api.llama.fi/protocols: blend-pools (V1) Stellar 43517, blend-pools-v2 Stellar 129348788, blend-backstop 0, blend-backstop-v2 0. All four have parentProtocol 'parent#blend'."
  - "2026-11-02T17:20Z GET https://api.llama.fi/protocol/blend returned name Blend with currentChainTvls.Stellar 129392305, the parent series for the mapped children."
  - "Prevalence: a scan of 22 TVL-bearing DeFi and RWA queries found one row with more than one llamaSlug (blend). Every single-slug row links to its own slug."
  - "Dedupe 2026-11-02: declined sls-039 accepts provider-hosted history and routes trend questions to tvlMethodUrl; a wrong tvlMethodUrl undermines that accepted boundary but is a different defect. Resolved sls-031 added tvlMethodUrl. GitHub search repo:Stellar-Light/stellarlight tvlMethodUrl returned only closed #522 and #494, which describe the original provenance feature."
  - "Golden consumer: eval/qa/corpus/battery case q-edge-fresh-latest-blend-tvl records the V1 child URL as class C evidence."
  - "2026-11-02T22:38Z recheck: curl -sS --max-time 50 'https://stellarlight.xyz/api/projects/search?q=blend&limit=3' returned HTTP 200. Blend has tvlUSD=129334939, tvlAsOf=2026-11-02T13:19:15.688Z, four llamaSlugs, and tvlMethodUrl=https://defillama.com/protocol/blend-pools."
  - "2026-11-02T22:38Z: curl -sS --max-time 50 https://api.llama.fi/protocols returned HTTP 200. Stellar values: blend-pools=42836.071317956426; blend-pools-v2=127720821.97049162; both backstop base values=0. All four share parentProtocol=parent#blend. curl -sS --max-time 50 https://api.llama.fi/protocol/blend returned HTTP 200 with currentChainTvls.Stellar=127763657. Values have different observation times; they are not exact matches to Scout's stored amount."
  - "2026-11-02 calibration: rg -n 'tvlMethodUrl|tvlMethodUrlFor' over the current upstream projects/search/route.ts found one helper and three callers. The helper selects slugs[0]. Correcting the shared helper covers the repeated response paths. No dependency-based code snippet or first-bad version claim applies."
  - "2026-11-02 dedupe: gh search issues and gh search prs searched Stellar-Light/stellarlight for tvlMethodUrl and 'blend pools', across all states. Issues 494 and 522 and merged PRs 530 and 531 describe the original provenance feature. PR 1234 concerns stablecoin display. Issue 522 explicitly keeps history at the provider; this finding requests a citation matching the existing aggregate. rg over improvements/ and improvements/resolved.json found related sls-031 and declined sls-039, without this aggregate-link correction. Intake resolves to Stellar-Light/stellarlight without an override."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1913
recurrences:
  - date: 2026-11-06
    evidence: "Blend project search; DefiLlama `/protocols` and `/protocol/blend` — Still-repro. Four mapped Blend pool/backstop V1/V2 slugs; tvlMethodUrl still `https://defillama.com/protocol/blend-pools`. Provider children share parent#blend; parent series is available. No equality claim between independently timed amounts. Next: Keep. Next after deploy+enrich: URL should be common parent Blend, not null or V1 child; verify mapped inputs still reconcile to parent accounting. Ledger: .agents/rounds/2026-11-05-truth-maintenance/scout.md."
---

## Finding

The Blend row in `GET /api/projects/search` links `tvlMethodUrl` to one child protocol instead of its four-row aggregate.
It reports `tvlUSD: 129334939` from four `llamaSlugs`.
Its method URL is `https://defillama.com/protocol/blend-pools`, the V1 child.
Most current TVL comes from `blend-pools-v2`.
A reader following the URL sees a much smaller value and a different history.

## Evidence

Read-only reproduction:

```sh
curl -sS --max-time 50 'https://stellarlight.xyz/api/projects/search?q=blend&limit=3'
curl -sS --max-time 50 https://api.llama.fi/protocols
curl -sS --max-time 50 https://api.llama.fi/protocol/blend
```

All commands returned HTTP 200 on 2026-11-02.
The four mapped slugs share `parentProtocol: "parent#blend"`.
The V1 and V2 pool values were 42836.071317956426 and 127720821.97049162 on Stellar.
The parent endpoint reported `currentChainTvls.Stellar: 127763657`.
Scout's stored value and the live provider values have different observation times.
The shared `tvlMethodUrlFor` helper selects `slugs[0]` for three response paths.

## Recommendation

Set Blend's method URL to `https://defillama.com/protocol/blend` after confirming the parent covers the mapped TVL inputs.
Use the common parent for other multi-slug rows when its accounting matches their inputs.
Otherwise, expose each contributing URL and explain the aggregate.
Keep borrowed amounts and pool2 amounts separate from base TVL.
