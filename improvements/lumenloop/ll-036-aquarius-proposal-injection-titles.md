---
id: ll-036
service: lumenloop
status: verified
discovered: 2026-11-02
upstreamTitle: Seven indexed Aquarius proposals contain an HTML payload title and have missing source pages
evidence:
  - 2026-11-02T22:36:31Z Raven recheck (read-only): POST https://api.lumenloop.com/v1/tools/list_documents {"collection":"proposals","search":"onerror","limit":20} returned HTTP 200. pagination.total=7; ids 192-198 each retain title "<img src=x onerror=alert(1)> w50c" and status="processed". Their source proposal ids are 693-699.
  - 2026-11-02 independent public recheck: curl -sS -L https://governance-api.aqua.network/api/proposal/{693..699}/ returned HTTP 404 for all seven ids. Each body says "No Proposal matches the given query." The control /api/proposal/677/ returned HTTP 200. This check does not establish when the proposals disappeared.
  - 2026-11-02 adjacent check: all seven onerror rows share the title and processed status. Their created_at values span 2026-09-30T01:27:07.541Z to 2026-09-30T01:27:07.570Z. Those timestamps do not establish the first public exposure date. No rendering exploit was executed or established.
  - 2026-11-02 dedupe: gh search issues and gh search prs covered open and closed owner records. gh api --paginate issues?state=all supplied complete bodies. rg over improvements/ and improvements/resolved.json checked local records. No duplicate appeared among 30 issues and 17 PRs in lumenloop/lumenloop-backend. PR 17 concerns rediscovery after local deletion and explicitly exempts proposals. It does not correct these proposal rows.
  - Affected golden case: eval/qa/corpus/battery/defi-ecosystem/q-gap-semantic-similar-projects.json (the answering lane met these rows in search_content_semantic proposal results)
  - 2026-11-02T17:19:01Z earlier verification: search_content_semantic returned the same seven rows with different asset-registry summaries. Example summary subjects: id 195 USDY, id 196 Bitcoin, id 193 XRP.
---

## Finding

Seven indexed Aquarius proposal rows contain the title `<img src=x onerror=alert(1)> w50c` and reference unavailable source proposals.
The rows have ids 192 through 198 and retain `status: "processed"`.
All seven source proposal requests return HTTP 404.
Callers can therefore cite processed records whose current sources do not exist.

The stored title contains an HTML event-handler payload.
The evidence establishes contaminated source text, without a demonstrated rendering exploit.

## Evidence

Raven repeated this request on 2026-11-02T22:36:31Z:

```text
POST /v1/tools/list_documents
{"collection":"proposals","search":"onerror","limit":20}
```

The response returned HTTP 200, `pagination.total: 7`, and the same payload title on every row.
The rows link to proposal ids 693 through 699 at Aquarius.
Fresh public requests to `https://governance-api.aqua.network/api/proposal/{id}/` returned HTTP 404 for all seven ids.
Each error body contained `No Proposal matches the given query.`
The control request for proposal 677 returned HTTP 200.

The rows have creation timestamps on 2026-09-30, within a 29-millisecond interval.
These timestamps do not establish when Aquarius removed the proposals.
Earlier same-day semantic results also supplied unrelated asset-registry summaries for these rows.

## Recommendation

Remove or mark rows 192 through 198 unavailable after confirming their missing sources.
Prevent search results from presenting these rows as valid processed proposals.
Check related generated summaries before restoring any row.

Treat titles as plain text and flag unexpected HTML markup during ingestion.
Add source-availability checks for indexed proposals.
