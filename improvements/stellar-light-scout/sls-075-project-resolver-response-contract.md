---
id: sls-075
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-08-25
upstreamTitle: Type the project resolver identity, evidence, and meta response fields
evidence:
  - 2026-08-25 live OpenAPI 1.8.87 declares resolveProject subject, current, and evidence only as type object with no properties
  - the same response schema omits the live meta envelope and its source, generatedAt, searched, and methodology fields
  - 2026-08-25 live GET https://stellarlight.xyz/api/projects/resolve?q=StellarX returned subject.slug/name/status, current.slug/name/status/url, evidence.statusAsOf/statusBasis/statusSourceUrl/unsourced, and meta provenance fields
  - pin 2e4e412f0ae71a81424b02354d4bcff3835c80ff adds repo to the Stellar Scout API reference matchedOn values and closes that reference gap
  - Raven keeps GET /api/projects/resolve unexposed until the model-facing contract names the fields a caller must project
  - upstream issue filed 2026-08-25: https://github.com/Stellar-Light/stellarlight/issues/1030
  - upstream commit dd2dfdb74ae2e285f1555b47aa24af870b9a5f90 declares the resolver identity, evidence, and meta fields
  - 2026-08-28T02:16:55.527Z live GET https://stellarlight.xyz/api/projects/resolve?q=StellarX returned subject, current, evidence, and meta fields matching OpenAPI 1.8.109
  - upstream issue 1030 was closed as completed on 2026-08-25
---

## Finding

Scout OpenAPI 1.8.87 adds `GET /api/projects/resolve`, but its core nested
response objects are opaque. `subject`, `current`, and `evidence` declare only
`type: object`. They do not declare their properties.

The live response also includes a `meta` envelope that the response schema
does not declare. A model can call the operation, but it cannot derive a safe
projection for the resolved identity, status evidence, or response provenance
from the published contract.

The previous Scout API reference had one related vocabulary gap. Pin
`2e4e412f0ae71a81424b02354d4bcff3835c80ff` adds `repo` to the allowed
`matchedOn` values and closes that part of the finding.

## Evidence

On 2026-08-25, the live schema declared `subject`, `current`, and `evidence` as
nullable objects without `properties`. It declared the top-level `found`,
`matchedOn`, `note`, `query`, and `superseded` fields. It did not declare
`meta`.

The current pinned API reference includes `repo` in its `matchedOn` values.
The remaining finding concerns the opaque OpenAPI response objects and the
missing `meta` schema.

A live `q=StellarX` response returned the following nested fields:

- `subject.slug`, `subject.name`, and `subject.status`;
- `current.slug`, `current.name`, `current.status`, and `current.url`;
- `evidence.statusAsOf`, `evidence.statusBasis`,
  `evidence.statusSourceUrl`, and `evidence.unsourced`; and
- `meta.source`, `meta.generatedAt`, `meta.searched`, and `meta.methodology`.

The operation description says callers should use these values to reconcile
old names and weigh unsourced lifecycle claims. The missing property contracts
are therefore on the primary use path, not optional decoration.

## Recommendation

Declare reusable schemas for the resolved subject, current identity, status
evidence, and meta envelope. Include nullability and required fields for found
and miss responses.

Keep the OpenAPI `matchedOn` enum and the Scout API reference generated from
one vocabulary source. Add a contract test that compares those values.
