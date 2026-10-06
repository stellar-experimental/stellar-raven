---
id: sls-089
service: stellar-light-scout
status: reported-upstream
discovered: 2026-10-01
upstreamTitle: Project search returns a successful zero count after a backend read timeout
evidence:
  - 2026-10-01 independent public-API replay reproduced one failed backend read in a 65-request burst. The response returned HTTP 200, zero rows, counts.total 0, and two backend-read timeout warnings.
  - .agents/rounds/2026-10-01-backlog-closeout/sd-measure/evidence/burst-burst-1790895846790.json
  - .agents/rounds/2026-10-01-backlog-closeout/sd-measure/evidence/burst-seq-1790895810834.json
  - .agents/rounds/2026-10-01-backlog-closeout/sd-measure/evidence/burst-seq-1790895847511.json
  - .agents/rounds/2026-10-01-backlog-closeout/sd-measure/evidence/burst.mjs
  - .agents/rounds/2026-10-01-backlog-closeout/sd-measure/evidence/scout-openapi-contract.json
  - https://stellarlight.xyz/api/openapi.json
  - .agents/rounds/2026-10-01-backlog-closeout/sd-measure/review-result.md
  - Dedupe 2026-10-01 found no local finding and no Stellar-Light/stellarlight issue for a failed backend read, an incomplete-results warning, or a zero count after a timeout.
  - upstream issue filed 2026-10-01: https://github.com/Stellar-Light/stellarlight/issues/1751
  - 2026-10-02 recheck at Scout API 1.9.61 (inventory refresh): the contract gap persists. GET /api/projects/search still declares only a 200 ProjectSearchResponse. The release adds a RetryableError schema (HTTP 503 with retryAfterSeconds and an advisory) referenced by GET /api/research for 429 and 503; GET /api/hackathon-brief has description-only 400, 429, and 503 entries. Runtime recurrence was not re-tested; the burst trigger was not re-run. The upstream issue is open with no comment.
  - "2026-10-06 recheck at Scout API 1.9.71: fixed-upstream candidate only; the status does not change. Spec 1.9.62 (changelog 2026-10-03) added meta.partial and meta.failedReads to searchProjects and five other operations. A stalled read now ends as a partial page or as HTTP 503. The live Meta schema says to count loss on partial, not on the 200 status. The spec does not define counts.total when partial is true."
  - "2026-10-06T14:17Z replay of the saved burst.mjs sent 65 concurrent read-only requests. No search returned HTTP 200 with counts.total 0. 52 searches returned HTTP 503 with retry-after 2. One request failed in the client. Two returned HTTP 200 with partial true and nonzero totals: type=Payments 303 and type=Social Impact 21. Output SHA-256 ad43ce20b03753307d1afefb446970b03755f218baf3f7ce189ab8fc3952f38c; live spec SHA-256 42031cdb1134e3916c8be8244e09f0d72eddca3c149e669f978710ac12efbd06."
  - "One replay is not proof of a fix, because the result depends on load. A distinct reviewer must repeat the burst before a status change. Issue 1751 is open with no comment, and the 1.9.62 change does not cite it."
---

## Finding

`GET /api/projects/search` returns HTTP 200 and `meta.counts.total: 0` after a backend read timeout.
The same response reports the failed read through `meta.warnings` and returns no project rows.
Clients can mistake this result for a successful search with no matches.

The shared OpenAPI `Meta.warnings` description limits the field to unread query parameters.
It states that the request still succeeds.
The backend failure does not match that contract.
The search response references this shared metadata schema without a warning override.

## Evidence

An independent public-API replay ran on 2026-10-01.
It sent 65 requests together: one status request and 64 project searches.
The searches used seven categories and 25 types, each with and without `status=Live`.
Every search used `limit=1`.
The saved [request script](https://github.com/stellar-experimental/stellar-raven/blob/main/.agents/rounds/2026-10-01-backlog-closeout/sd-measure/evidence/burst.mjs) preserves the exact inputs.

One response failed after `25264` milliseconds:

```text
GET https://stellarlight.xyz/api/projects/search?category=Infrastructure&limit=1
HTTP 200
meta.generatedAt: 2026-10-01T23:03:56.187Z
meta.counts: {"returned":0,"total":0,"semantic":0}
project rows: 0
meta.error: absent
meta.warnings:
- backend read failed: projects candidate fetch — results may be incomplete (timeout after 8000ms)
- backend read failed: projects candidate fetch (retry without structured clauses) — results may be incomplete (timeout after 8000ms)
```

The [burst capture](https://github.com/stellar-experimental/stellar-raven/blob/main/.agents/rounds/2026-10-01-backlog-closeout/sd-measure/evidence/burst-burst-1790895846790.json) retains the complete failure metadata.
Sequential controls before and after returned Tooling `184`, User-Facing App `407`, and Payments `303`.
Those controls cover different filters from the failed Infrastructure request.
The failure metadata itself proves the failed read.
In the same burst, `category=Infrastructure&status=Live` returned `167`, so the category is not empty.

One burst reproduced one failure. This observation does not estimate a failure rate.
Earlier model traces contained eleven zero counts under a similar burst; this replay did not reproduce all eleven.
The affected answer called two populated categories unused.
The Raven Scout adapter now classifies a `backend read failed` warning as a failed read (`src/adapters/scout.ts`).
Before that repair, it accepted these warnings as successful data.

The saved [OpenAPI excerpt](https://github.com/stellar-experimental/stellar-raven/blob/main/.agents/rounds/2026-10-01-backlog-closeout/sd-measure/evidence/scout-openapi-contract.json) records version `1.9.54` and the document hash.
It includes the shared warning definition and the project-search response reference.
The live contract read confirmed the mismatch during closeout.

No automatic recurrence probe is attached.
A cheap deterministic request cannot force this backend timeout.
The saved burst script provides manual reproduction inputs, but its result depends on load and cache state.
Do not treat a successful isolated request as proof of a fix.

## Recommendation

Return an explicit failure when a backend read cannot establish the search result.
Do not return a confirmed zero total for an unknown result.
If partial results remain supported, give clients a machine-readable failure state and an unknown total.
Document backend-failure warnings separately from unread-parameter warnings.
Keep harmless unread-parameter warnings distinguishable from failed reads.

Test an injected backend timeout and verify the response cannot claim a complete empty search.
Keep a successful empty-search control and an unread-parameter warning control.
