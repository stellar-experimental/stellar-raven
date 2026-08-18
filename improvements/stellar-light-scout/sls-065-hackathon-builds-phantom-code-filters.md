---
id: sls-065
service: stellar-light-scout
status: verified
discovered: 2026-08-18
upstreamTitle: searchHackathonBuilds OpenAPI advertises three code filters that the live endpoint rejects
evidence:
  - inventory/stellar-light.json OpenAPI 1.8.67 fetched 2026-08-18T14:06:26.988Z advertises capability, domain, and dependsOn on GET /api/hackathons/builds
  - 2026-08-18 deployed searchHackathonBuilds probes returned HTTP 400 Unsupported query parameter(s) for capability, domain, and dependsOn
  - 2026-08-18 control probes with q, track, and winnersOnly returned successful data rows
  - Solo scratchpad 816 coverage-gap probe
---

## Finding

The OpenAPI contract for `GET /api/hackathons/builds` advertises three code-derived filters:
`capability`, `domain`, and `dependsOn`. The catalog exposes them to agents through
`scout.searchHackathonBuilds`.

The live endpoint rejects each advertised parameter before it searches. Each request returns HTTP
400 and names the supplied parameter as unsupported. The same endpoint accepts its documented
`q`, `track`, and `winnersOnly` parameters.

This mismatch causes an agent to write a valid call from `codemode.describe`, then spend a recovery
call removing the advertised filter. It also prevents the endpoint from answering the structural
code questions promised by those parameter descriptions.

## Evidence

The 2026-08-18 inventory snapshot records Scout OpenAPI version 1.8.67. Its
`/api/hackathons/builds` operation defines all three parameters with detailed schemas.

The following read-only deployed calls reproduced the mismatch:

- `searchHackathonBuilds({ capability: "x402", limit: 2 })` returned HTTP 400.
- `searchHackathonBuilds({ domain: "payments-x402", limit: 2 })` returned HTTP 400.
- `searchHackathonBuilds({ dependsOn: "@blend-capital/blend-sdk", limit: 2 })` returned HTTP 400.

Controls with `q: "x402"`, `track: "DeFi"`, and `winnersOnly: "true"` returned data. The defect is
therefore specific to the three code-derived filters.

## Recommendation

Choose one current contract and make both layers match.

- If hackathon rows support the code-evidence joins, implement all three filters and echo them in
  `meta.filters`.
- Otherwise, remove the three parameters and their routing vocabulary from this operation's
  OpenAPI definition.

Add a contract test that executes every advertised query parameter against the live handler. Keep
the repository-code filters on `searchRepos` unless this endpoint performs the required join.
