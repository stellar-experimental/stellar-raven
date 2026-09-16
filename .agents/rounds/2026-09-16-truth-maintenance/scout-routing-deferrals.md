# Scout structured-routing deferrals

Date: 2026-09-16

This record covers Raven routing only. It does not report an upstream schema defect.

The release candidate excludes `GET /api/rwa`. The experimental RWA-inclusive manifest exists
only for routing measurement. The original issue #141 RWA discovery checks pass against it.

Three additional controls remain unresolved:

1. `Simulate a transfer of a tokenized bond through Stellar RPC.` ranks `scout.getRwaAssets` third.
2. `How do I read a wallet balance for tokenized treasury assets?` ranks it second.
3. `As a Stellar asset issuer, can I charge transfer fees, cap supply, or freeze a holder, and
   what is actually possible at the protocol level?` ranks it first.

The first two queries mix implementation intent with an explicit RWA subject. The third query asks
about protocol controls. Stellar Docs leads the first two queries and remains present for the third.

The token diagnosis shows why a larger negative weight is insufficient. The mixed queries match
zero or one source negative token. The issuer query gets incidental positive matches from
`actually` and `level`. The source uses `level` for verification, not protocol controls.

These controls need a general structured-intent mechanism. Do not add query exceptions, operation
exceptions, or a fabricated upstream issue. Do not expose RWA until final routing review accepts
the mechanism and the operation surface.

The issue handoff is
<https://github.com/stellar-experimental/stellar-raven/issues/141#issuecomment-5705390743>.
The root coordinator posted and read back that comment. This lane did not post a duplicate.

Evidence:

- `/tmp/raven-execution-2026-09-16/scout-parent-admission-diagnosis.md`
- `/tmp/raven-execution-2026-09-16/scout-parent-fresh-probes.json`
- `/tmp/raven-execution-2026-09-16/scout-final2-focused-rwa-inclusive.json`
- `/tmp/raven-execution-2026-09-16/scout-final2-rwa-inclusive-ranked.json`
- `eval/results/routing-2026-09-16T22-22-22-464Z.json`

The accepted-policy candidate restores `q-scf-nqg-voting` at rank one. A dense exact-vocabulary
witness changes three of 495 ranked lists. It does not add a query or operation identity rule.

## Existing-operation quality and runtime

The first frozen candidate lost three `expectedAny` routes. They were stablecoin discovery,
Soroswap directory lookup, and fresh Blend TVL research. The final quality candidate changes four
of 495 ranked lists against that freeze:

1. `scout.getStablecoins` becomes first for the stablecoin discovery query.
2. `scout.searchProjects` becomes fifth for the Soroswap query.
3. `lumenloop.search_content_semantic` moves from second to first for the Blend freshness query.
4. `scout.searchProjects` becomes second for the DEX saturation query.

The stablecoin operation is the purpose-built live directory. The Soroswap token appears in two
source routing fields. The query also matches the `DEX` input enum. The Blend repair prefers an
already-selected dated semantic lane over an adjacent title-only lane. It does not treat
`scout.searchResearch` as a live TVL oracle.

The rejected broad directory rule changed 140 ranked lists. The bounded rule has no capitalization
or query identity check. It requires a catalog-unique exact source token in both `useWhen` and
`exampleQuestions`, plus a different complete input-enum witness. Source negatives still win.
Generic routing actions cannot become the exact-token witness.

The runtime review found no broad p95 regression. It measured pooled median changes of 3.4% and
3.9% across two runs. The controlled-vocabulary query median increased 51.5%, or 3.65 ms. The
current implementation always computes an ungated pass. Keep this scaling cost open until the
runtime optimization receives separate review.

Evidence:

- `/tmp/raven-execution-2026-09-16/scout-final-existing-operations-review.md`
- `/tmp/raven-execution-2026-09-16/scout-search-runtime-review.md`
- `/tmp/raven-execution-2026-09-16/scout-quality-final3-ranked.json`
- `eval/results/routing-2026-09-16T22-54-12-494Z.json`

The release manifest still excludes RWA. The three RWA residual controls above remain unchanged.

## Final disposition

Issue #167 tracks the three RWA controls: <https://github.com/stellar-experimental/stellar-raven/issues/167>.
The source-acceptance release keeps RWA excluded.
Final semantic and code reviews accepted the existing-operation repairs.
The runtime repair resolved the measured slowdown. Both final runs improve all 13 query medians.
See [the acceptance ledger](../2026-09-16-scout-acceptance.md) for current results.
The earlier timing description above records the rejected predecessor.
