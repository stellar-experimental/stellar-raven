---
id: sls-077
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-08-27
upstreamTitle: Declare issued in the verify response claim type enum
evidence:
  - 2026-08-28T13:38:25Z live GET https://stellarlight.xyz/api/verify?type=issued&subject=EURC&auditor=Circle returned claim.type issued and verdict supported
  - 2026-08-28T13:38:25Z live OpenAPI 1.9.1 accepts issued in the type query parameter enum but omits it from the 200 response claim.type enum
  - upstream issue filed 2026-08-28: https://github.com/Stellar-Light/stellarlight/issues/1086
  - 2026-09-03T15:44:38.321Z live GET https://stellarlight.xyz/api/verify?type=issued&subject=EURC&auditor=Circle returned claim.type issued and verdict supported
  - 2026-09-03 live OpenAPI 1.9.23 lists audited, live, maintained, and issued in both the request and 200 response claim.type enums
recurrences:
  - date: 2026-08-28
    evidence: OpenAPI 1.9.1 still accepts issued in the request enum and omits it from the 200 response enum; a live issued EURC request returned claim.type issued and verdict supported at 2026-08-28T12:55:15.187Z
---

## Finding

Scout OpenAPI 1.9.1 omits `issued` from the `200` response `claim.type` enum.
The same endpoint accepts `issued` in the `type` query parameter. The live
operation returns `claim.type: "issued"` for a supported issuer claim.

The `200` response schema restricts `claim.type` to `audited`, `live`, and
`maintained`. A generated consumer cannot project every valid live response.

## Evidence

On 2026-08-28, this live request returned a supported verdict:

`GET /api/verify?type=issued&subject=EURC&auditor=Circle`

The response contained `claim.type: "issued"`, `claim.subject: "EURC"`, and
`claim.auditor: "Circle"`. The request schema includes `issued`. The response
schema omits it.

The defect is limited to the published response enum. The live operation
correctly refuses an issued claim without the claimed issuer and explains the
required form.

### Fixed upstream recheck (2026-09-03)

At 2026-09-03T15:44:38.321Z, the original issued EURC request returned
`claim.type: "issued"` and `verdict: "supported"`. Live Scout OpenAPI 1.9.23
lists `audited`, `live`, `maintained`, and `issued` in both claim-type enums.
Upstream issue #1086 is closed as completed. Scout shipped the shared enum in
1.9.13.

## Recommendation

Use one shared claim-type enum for the request and response schemas. Include
`issued` in the `200` response `claim.type` enum.

Add a contract test for `type=issued&subject=EURC&auditor=Circle`. The test must
validate the live response against the published `200` schema.
