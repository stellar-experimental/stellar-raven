---
id: sls-077
service: stellar-light-scout
status: verified
discovered: 2026-08-27
upstreamTitle: Declare issued in the verify response claim type enum
evidence:
  - 2026-08-28T02:16:53.866Z live GET https://stellarlight.xyz/api/verify?type=issued&subject=EURC&auditor=Circle returned claim.type issued and verdict supported
  - OpenAPI 1.8.109 accepts issued in the type query parameter enum
  - OpenAPI 1.8.109 omits issued from the 200 response claim.type enum
  - An independent live OpenAPI 1.8.110 recheck still omits issued from the 200 response claim.type enum
  - Raven keeps GET /api/verify unexposed until the model-facing response contract includes every live claim type
---

## Finding

Scout OpenAPI 1.8.109 accepts `issued` in the `type` query parameter. The live
operation also returns `claim.type: "issued"` for a supported issuer claim.

The same operation's `200` response schema restricts `claim.type` to `audited`,
`live`, and `maintained`. A generated consumer cannot project every valid live
response from the published contract.

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
