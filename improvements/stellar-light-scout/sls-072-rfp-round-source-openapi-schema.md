---
id: sls-072
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-08-19
upstreamTitle: Add the live RFP round source field to the OpenAPI response schema
evidence:
  - 2026-08-19 live Scout 1.8.73 returned meta.scfRound.source with value live
  - the same OpenAPI response schema declared currentPhase and roundsInProgress but omitted source
  - this is the response-contract residual successor to resolved finding sls-067
  - upstream issue filed 2026-08-19: https://github.com/Stellar-Light/stellarlight/issues/976
  - 2026-08-25 live Scout OpenAPI 1.8.87 declared meta.scfRound.source with enum live|unavailable, and GET https://stellarlight.xyz/api/rfps?limit=1 returned source live
---

## Finding

Scout 1.8.73 resolves the fundability and stale-phase defects from `sls-067`.
The response and the official awards page agree on the current phase.

One response-schema gap remains. The live `meta.scfRound` object contains
`source: "live"`. Its OpenAPI schema does not declare `source`.

Generated types based on the published contract omit this provenance field.
Strict closed-world validation can also reject the undeclared field.

## Evidence

The 2026-08-19 live response contained `meta.scfRound.source: "live"`. The same
object contained `currentPhase: "Panel Review"` and one `roundsInProgress` row.

The OpenAPI schema declared `currentPhase`, `roundsInProgress`, `verifyAt`, and
the other returned round fields. Its property list did not contain `source`.

## Recommendation

Add `source` to the `meta.scfRound` response schema. Define its accepted values
and provenance meaning. Generate the handler and OpenAPI schema from one
contract.
