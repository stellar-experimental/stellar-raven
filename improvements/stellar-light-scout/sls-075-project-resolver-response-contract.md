---
id: sls-075
service: stellar-light-scout
status: verified
discovered: 2026-08-25
upstreamTitle: Type the project resolver identity, evidence, and meta response fields
evidence:
  - 2026-08-25 live OpenAPI 1.8.87 declares resolveProject subject, current, and evidence only as type object with no properties
  - the same response schema omits the live meta envelope and its source, generatedAt, searched, and methodology fields
  - 2026-08-25 live GET https://stellarlight.xyz/api/projects/resolve?q=StellarX returned subject.slug/name/status, current.slug/name/status/url, evidence.statusAsOf/statusBasis/statusSourceUrl/unsourced, and meta provenance fields
  - the pinned Stellar Scout API reference lists slug, canonical-slug, alias, and name for matchedOn but omits the live repo value allowed by OpenAPI
  - Raven keeps GET /api/projects/resolve unexposed until the model-facing contract names the fields a caller must project
---

## Finding

Scout OpenAPI 1.8.87 adds `GET /api/projects/resolve`, but its core nested
response objects are opaque. `subject`, `current`, and `evidence` declare only
`type: object`. They do not declare their properties.

The live response also includes a `meta` envelope that the response schema
does not declare. A model can call the operation, but it cannot derive a safe
projection for the resolved identity, status evidence, or response provenance
from the published contract.

The pinned Scout API reference has one related vocabulary gap. It omits
`repo` from the allowed `matchedOn` values even though live OpenAPI includes
that enum member.

## Evidence

On 2026-08-25, the live schema declared `subject`, `current`, and `evidence` as
nullable objects without `properties`. It declared the top-level `found`,
`matchedOn`, `note`, `query`, and `superseded` fields. It did not declare
`meta`.

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
