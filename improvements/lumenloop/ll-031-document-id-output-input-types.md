---
id: ll-031
service: lumenloop
status: reported-upstream
discovered: 2026-10-09
upstreamTitle: Document reads reject the string IDs returned by search and document responses
evidence:
  - eval/qa/results/2026-10-07-tool-surface-qa/2026-10-08T02-40-37-variantA.json; q-gap-related-projects-empty and q-scf-verified-members
  - "2026-10-09 host-side direct API probes, 2026-10-09T14:30:27.600Z through 2026-10-09T14:30:27.839Z: search_documents and get_document emit string ID 10190; both lookup operations accept numbers and reject strings."
  - 2026-10-09 current input schemas require numbers; https://api.lumenloop.com/v1/openapi.json
  - upstream issue filed 2026-10-09: https://github.com/lumenloop/lumenloop-backend/issues/46
---

## Finding

`search_documents` returns a string ID that `get_document` and `get_related_projects` reject.
`get_document` also returns that ID as a string after accepting its numeric form.
Clients cannot pass the returned ID into either lookup unchanged.
Both operations return HTTP 400 with `invalid_arguments` for the numeric string.
The same operations succeed with the number.

This is a direct upstream contract mismatch.
The live API does not accept numeric strings for either tested input.

## Evidence

Five direct authenticated requests on 2026-10-09 produced the results below.
The requests used `POST https://api.lumenloop.com/v1/tools/{tool}`.
These bodies reproduce the comparison:

| Tool | JSON body | HTTP status | Response |
|---|---|---:|---|
| `search_documents` | `{"collection":"articles","query":"2+ Years of Neural Quorum Governance","limit":5}` | 200 | `success: true`; one item with `id: "10190"`. |
| `get_document` | `{"collection":"articles","id":10190}` | 200 | `success: true`; the same document with `data.id: "10190"`. |
| `get_document` | `{"collection":"articles","id":"10190"}` | 400 | `success: false`; `code: "invalid_arguments"`; path `id`. |
| `get_related_projects` | `{"content_id":10190,"content_type":"article"}` | 200 | `success: true`; one project, `stellar-development-foundation`. |
| `get_related_projects` | `{"content_id":"10190","content_type":"article"}` | 400 | `success: false`; `code: "invalid_arguments"`; path `content_id`. |

Both rejected responses give the same validation message:

```text
Expected number, received string
```

The document title is `2+ Years of Neural Quorum Governance`.
Both successful document responses identify [the same source article](https://medium.com/stellar-community/2-years-of-neural-quorum-governance-7bddd319a8cb).
The rejected document request has request ID `a47e1556eb36dcbf-ATL`.
The rejected related-project request has request ID `a47e1557ddb5dcbf-ATL`.

The current input schemas declare `type: number` for `id` and `content_id`.
The host-side results confirm actual rejection, beyond that declared schema.

The live comparison covers one article and both lookup operations.
It does not establish the type of every collection's IDs or every listing operation.
The service response gives no API version.
The observation date does not establish when the mismatch began.

## Recommendation

Use one document-ID type across search responses, document responses, and lookup inputs.
Ensure that both lookup operations accept the returned ID unchanged.
Define the shared ID type in the request and response schemas.
Preserve identifier precision when choosing the canonical representation.

Add a round-trip check that passes a search ID directly into both operations.
Check other listing operations and collections for the same mismatch.
Keep validation errors distinct from successful empty related-project results.
