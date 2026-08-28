---
id: sls-077
service: stellar-light-scout
status: verified
discovered: 2026-08-27
upstreamTitle: Declare issued in the verify response claim type enum
evidence:
  - 2026-08-28T13:38:25Z live GET https://stellarlight.xyz/api/verify?type=issued&subject=EURC&auditor=Circle returned claim.type issued and verdict supported
  - 2026-08-28T13:38:25Z live OpenAPI 1.9.1 accepts issued in the type query parameter enum but omits it from the 200 response claim.type enum
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

## Recommendation

Use one shared claim-type enum for the request and response schemas. Include
`issued` in the `200` response `claim.type` enum.

Add a contract test for `type=issued&subject=EURC&auditor=Circle`. The test must
validate the live response against the published `200` schema.
