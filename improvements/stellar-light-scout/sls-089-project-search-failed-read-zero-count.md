---
id: sls-089
service: stellar-light-scout
status: fixed-upstream
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
  - "2026-10-15 author recheck confirmed the original failure is fixed. A distinct reviewer remains required before retirement."
  - "2026-10-15T17:42:57Z live OpenAPI reports 1.9.78. Project search declares HTTP 200 and 503. https://stellarlight.xyz/api/openapi.json"
  - "2026-10-15 resolving PRs: https://github.com/Stellar-Light/stellarlight/pull/1815 and https://github.com/Stellar-Light/stellarlight/pull/1826. Merge commits are f9e66babb30f20607c7df749cef89985a9f6c3cd and 46d6e1ad4c02a4639bbe14ed4736316fb215af5c."
  - "2026-10-15 inbound handoff and timeout-test update came from theboycoder: https://github.com/stellar-experimental/stellar-raven/issues/283#issuecomment-6196580069"
  - "2026-10-15T17:43:28Z original 65-request burst returned 55 search failures as HTTP 503 with Retry-After 2. No search claimed zero."
  - "2026-10-15 burst returned nine successful searches. Three reported decoration-read failures with known positive totals; six reported complete reads."
  - "2026-10-15T17:44:38Z empty-filter control returned HTTP 200, zero rows, total 0, partial false, and failedReads []."
  - "2026-10-15T17:43:13Z unread-parameter control returned HTTP 200, total 205, partial false, and an ignored-parameter warning."
  - "2026-10-15 pinned route tests cover a timed-out candidate read, null partial totals, HTTP 503, and both controls. https://github.com/Stellar-Light/stellarlight/blob/46d6e1ad4c02a4639bbe14ed4736316fb215af5c/src/app/api/projects/search/__tests__/route.test.ts"
  - "2026-10-15 raw responses and exact URLs are in tmp/lane-a/*.raw.json and tmp/lane-a/burst-all.json. This local evidence is uncommitted."
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
The Raven Scout adapter now classifies `meta.partial: true` or a `backend read failed` warning as a failed read (`src/adapters/scout.ts`).
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

## Live recheck — 2026-10-15

The author repeated the original 65-request burst at `2026-10-15T17:43:28Z`.
The API reported OpenAPI `1.9.78`.
The replay returned 55 search failures as HTTP `503`, with `Retry-After: 2`.
Their bodies stated that the outage did not prove a missing project.
No search returned HTTP `200` with a zero total after a failed read.

Nine searches returned HTTP `200`.
Six had complete reads.
Three had decoration-read failures and positive totals: Lending `43`, NFT `33`, and live Bridge `26`.
Their `partial: true` fields and `failedReads` arrays disclosed those failures.
The failed reads did not supply the match count.

An empty-filter control returned zero rows, `total: 0`, `partial: false`, and `failedReads: []`.
An unread-parameter control retained total `205` and `partial: false`.
Its warning named the ignored parameter.
The live schema now distinguishes failed-read warnings from ignored-parameter warnings.

The replay did not produce a successful page after a candidate-read failure.
The pinned route tests cover that branch with `total: null` and `totalBasis: "partial-read"`.
Those tests use a fake clock and a mocked database.
The author read the tests but did not run the upstream test suite.
A distinct reviewer must repeat the live trigger before retirement.
