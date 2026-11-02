---
id: sls-113
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "venueRole is null on 31 of 38 Live DEX rows, and project search cannot filter by it"
evidence:
  - "2026-11-02T21:37:08Z live GET https://stellarlight.xyz/api/projects/search?type=DEX (paged) returned 47 rows, 38 Live. venueRole counts on Live rows: null 31, amm 4 (Soroswap, Aquarius, Phoenix, Sushi), trading-ui 2 (StellarTerm, StellarX), wallet-integrated 1 (Scopuly). No row carries native-orderbook or aggregator-router."
  - "Examples with venueRole null: LumAgg, Lumenswap, CLOB, Zenex, Ichi, Wombat, Balanced, LI.FI, SODAX, Stellarport, SwiftEx, Interstellar."
  - "OpenAPI 1.9.116 Project.venueRole enum ['amm','native-orderbook','aggregator-router','trading-ui','wallet-integrated']: 'count venueRole in ('amm','native-orderbook') for independent venues. Null = not yet classified (unknown, NOT 'not a venue').'"
  - "2026-11-02 GET /api/projects/search?type=DEX&venueRole=amm returned meta.warnings 'Unknown parameter(s) ignored: venueRole. Results are NOT filtered by them. Supported: q, category, type, status, scfAwarded, limit, offset.'"
  - "Related: sls-085 (Soroswap contract role; resolved 2026-11-02) and sls-099 (Soroswap aggregator venue list) cover single records, not taxonomy coverage."
  - "Dedupe 2026-11-02: no Stellar-Light/stellarlight issue names venueRole coverage."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' item Q6."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1905
---

## Finding

The `venueRole` field gives the DEX sub-type: AMM, native order book, aggregator, trading UI, or wallet-integrated.
On 2026-11-02 it is null on 31 of 38 Live DEX rows.
No row uses `native-orderbook` or `aggregator-router`.
The schema tells callers to count independent venues by `venueRole`, so any count from the current data is too low.

`GET /api/projects/search` also ignores a `venueRole` parameter, so a caller cannot list AMMs or aggregators directly.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/search?type=DEX&limit=100'
curl -sS 'https://stellarlight.xyz/api/projects/search?type=DEX&venueRole=amm&limit=3'
```

## Recommendation

Classify the remaining Live DEX rows.
Use `aggregator-router` for routers such as LumAgg, and decide the role for cross-chain routers such as LI.FI.
Add `venueRole` as a supported filter on `/api/projects/search`.
