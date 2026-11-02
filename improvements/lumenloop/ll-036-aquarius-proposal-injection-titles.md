---
id: ll-036
service: lumenloop
status: verified
discovered: 2026-11-02
upstreamTitle: Seven Aquarius proposal rows carry an HTML-injection title and no longer exist at the source
evidence:
  - "2026-11-02T17:19:01Z authenticated POST https://api.lumenloop.com/v1/tools/list_documents with {\"collection\":\"proposals\",\"search\":\"onerror\",\"limit\":20}: pagination.total 7; ids 192-198 all have title \"<img src=x onerror=alert(1)> w50c\", status processed, created_at 2026-09-30T01:27:07Z, urls https://aqua.network/governance/proposal/693/ through /699/"
  - "2026-11-02T17:19:01Z POST /v1/tools/search_content_semantic with {\"query\":\"img src onerror alert w50c\",\"types\":[\"proposals\"],\"limit\":20}: returns the same seven rows; each summary describes a different asset-registry proposal (for example id 195 USDY, id 196 Bitcoin, id 193 XRP)"
  - "2026-11-02T17:19:30Z GET https://governance-api.aqua.network/api/proposal/{693..699}/: HTTP 404 {\"detail\":\"No Proposal matches the given query.\"} for each id; GET /api/proposal/677/ returns HTTP 200; the list endpoint reports count 94 and highest id 677"
  - "2026-11-02T17:21:52Z POST /v1/tools/get_related_projects with {\"content_id\":198,\"content_type\":\"proposal\"}: success true, 1 project (aquarius)"
  - "Affected golden case: eval/qa/corpus/battery/defi-ecosystem/q-gap-semantic-similar-projects.json (the answering lane met these rows in search_content_semantic proposal results)"
---

## Finding

Seven Lumenloop proposal rows have the same title:
`<img src=x onerror=alert(1)> w50c`. This string is an HTML-injection test
payload. It is not a proposal title. The rows are ids 192 through 198.

Each row links to an Aquarius proposal page from 693 to 699. The Aquarius
governance API returns HTTP 404 for each of those proposal ids. The current
highest proposal id at the source is 677. The source does not serve those
seven proposals today.

Each row has a generated summary of a different asset-registry proposal. The
title and the summary do not agree. The rows are still `processed` and the
search and related-project tools return them.

A client that renders the title as HTML can run the payload. An agent can cite
a proposal that the source does not serve.

## Evidence

All calls ran on 2026-11-02 with read-only requests.

| Request | Result |
|---|---|
| `list_documents` `{"collection":"proposals","search":"onerror"}` | 7 rows, ids 192-198, one shared title |
| `search_content_semantic` proposals query | Same 7 rows with 7 different summaries |
| `GET governance-api.aqua.network/api/proposal/693/` through `699/` | HTTP 404 for each id |
| `GET governance-api.aqua.network/api/proposal/677/` | HTTP 200 |
| `get_related_projects` `{"content_id":198,"content_type":"proposal"}` | 1 project, `aquarius` |

All seven rows have `created_at` between `2026-09-30T01:27:07.541Z` and
`2026-09-30T01:27:07.570Z`.

## Recommendation

Remove or tombstone proposal rows whose source proposal returns HTTP 404.
Re-check proposal sources on a schedule so that deleted proposals leave the
index.

Treat titles as plain text. Reject or flag a title that contains HTML markup.
Do not publish a generated summary when it does not describe the stored title.
