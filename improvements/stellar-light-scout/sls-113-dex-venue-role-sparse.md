---
id: sls-113
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-11-02
upstreamTitle: "venueRole is null on 31 of 38 Live DEX rows, and project search cannot filter by it"
evidence:
  - "2026-11-09T19:10:38Z live recheck: GET /api/projects/search?type=DEX&limit=100 returns all 38 DEX rows (returned=total=38), including 15 Live; all 15 Live rows have venueRole (4 amm, 5 trading-ui, 3 aggregator-router, 3 wallet-integrated). GET with type=DEX&status=Live&limit=100 independently returns those 15 rows. Both report partial=false and failedReads=[]."
  - "2026-11-09 live filter recheck: GET /api/projects/search?type=DEX&venueRole=amm&limit=100 returns exactly Soroswap, Aquarius, Phoenix, Comet and Sushi (returned=total=5), all amm, with meta.filters.venueRole=amm and no ignored-parameter warning. Comet is Inactive, so the all-status filter correctly differs from the four Live AMMs. An invalid venueRole returns HTTP 400 and validVenueRoles. Full original coverage and filter triggers no longer reproduce."
  - "Upstream issue #1905 is closed/completed; maintainer theboycoder's 2026-11-07 resolution identifies PR1924 (filter, spec 1.9.123), PR1939 (taxonomy/curation, spec 1.9.127), and the deployed 2026-11-07 curation: https://github.com/Stellar-Light/stellarlight/issues/1905#issuecomment-6714007888."
  - "2026-11-09T19:18:30Z independent recheck (Claude Fable high): 38 DEX rows, 15 Live, no Live row with null venueRole; type=DEX&venueRole=amm returns exactly 5 rows; venueRole=bogus returns HTTP 400 with validVenueRoles. 22 non-Live DEX rows keep null venueRole, which the finding's Live-row scope and the schema's not-yet-classified meaning allow."
  - "2026-11-02T21:37:08Z live GET https://stellarlight.xyz/api/projects/search?type=DEX (paged) returned 47 rows, 38 Live. venueRole counts on Live rows: null 31, amm 4 (Soroswap, Aquarius, Phoenix, Sushi), trading-ui 2 (StellarTerm, StellarX), wallet-integrated 1 (Scopuly). No row carries native-orderbook or aggregator-router."
  - "Examples with venueRole null: LumAgg, Lumenswap, CLOB, Zenex, Ichi, Wombat, Balanced, LI.FI, SODAX, Stellarport, SwiftEx, Interstellar."
  - "OpenAPI 1.9.116 Project.venueRole enum ['amm','native-orderbook','aggregator-router','trading-ui','wallet-integrated']: 'count venueRole in ('amm','native-orderbook') for independent venues. Null = not yet classified (unknown, NOT 'not a venue').'"
  - "2026-11-02 GET /api/projects/search?type=DEX&venueRole=amm returned meta.warnings 'Unknown parameter(s) ignored: venueRole. Results are NOT filtered by them. Supported: q, category, type, status, scfAwarded, limit, offset.'"
  - "Related: sls-085 (Soroswap contract role; resolved 2026-11-02) and sls-099 (Soroswap aggregator venue list) cover single records, not taxonomy coverage."
  - "Dedupe 2026-11-02: no Stellar-Light/stellarlight issue names venueRole coverage."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' item Q6."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1905
recurrences:
  - date: 2026-11-06
    evidence: "`/api/projects/search?type=DEX&limit=100`; `type=DEX&venueRole=amm&limit=100` — Still-repro.47 DEX rows,38 Live,31 Live venueRole null. venueRole param ignored with explicit warning; returned47 unfiltered. PR proposes five classifications, which alone will not close whole original coverage scope. Next: Keep. Next after deploy + curation: supported filter membership/counts plus remaining live classification review; do not treat filter-only fix as complete. Ledger: .agents/rounds/2026-11-05-truth-maintenance/scout.md."
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
