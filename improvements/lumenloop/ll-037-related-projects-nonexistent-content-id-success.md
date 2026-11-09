---
id: ll-037
service: lumenloop
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: get_related_projects reports a successful empty result for an unavailable content item
evidence:
  - 2026-11-02T22:36:14Z Raven recheck (read-only): POST https://api.lumenloop.com/v1/tools/get_related_projects {"content_id":99999999,"content_type":"article"} returned HTTP 200 with {"success":true,"data":[],"error":null}.
  - 2026-11-02 source calibration: lumenloop-mcp/src/tools/directory.ts at main acba0387f14acd35d875719b2cc268509616a184 checks source availability before looking up mentions. An unavailable source returns the text "[]". The same gate covers missing and unpublished content. The recommendation preserves that non-disclosure boundary.
  - 2026-11-02 adjacent check: inspected the source gate and successful mentions branch in directory.ts. Existing source rows reach the mentions lookup. A generic unavailable response can distinguish that case without exposing whether hidden content exists.
  - 2026-11-02 dedupe: gh search issues and gh search prs covered open and closed owner records. gh api --paginate issues?state=all supplied complete bodies. rg over improvements/ and improvements/resolved.json checked local records. No duplicate appeared among 30 issues and 17 PRs in lumenloop/lumenloop-backend. ll-029 records the same observation as a recurrence but requests output-schema corrections. This finding requests a generic source-unavailable result and preserves unpublished-source non-disclosure.
  - Affected golden case: eval/qa/corpus/battery/assets-anchors-seps/q-gap-related-projects-empty.json (truth.verified 2026-11-02). The golden credits an answer that treats the empty result as inconclusive
  - 2026-11-02T18:33:49Z earlier controls: get_document {"id":99999999,"collection":"articles"} returned HTTP 200 with a document-not-found message. get_related_projects {"content_id":690,"content_type":"article"} returned HTTP 200 and four project mentions.
  - upstream issue filed 2026-11-02: https://github.com/lumenloop/lumenloop-backend/issues/51
recurrences:
  - date: 2026-11-09
    evidence: "2026-11-09 sweep at 2026-11-09T20:31:15.127990+00:00: still-repro. Unavailable article99999999 still returns HTTP200 success=true,data=[],error=null from related-project lookup; same ID get_document says no document. Valid article690/10190 controls return4/1 mentions in text-content objects. Preserve the same generic unavailable behavior for missing and unpublished content. Read-only exact requests and response hashes: tmp/lane-lumenloop.md; upstream issue state/comments freshly read; no maintainer comments or claimed fix."
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: LL get_related_projects article99999999; get_document same id; related690/10190 controls — Unavailable article returns success:true,data:[],error:null; document says not found; valid controls return4/1 mentions. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-037."
---

## Finding

`get_related_projects` returns a successful empty result for the unavailable article id `99999999`.
The response contains `success: true`, `data: []`, and `error: null`.
Callers cannot distinguish an unavailable source from an existing source with no project mentions.

## Evidence

Raven repeated this request on 2026-11-02T22:36:14Z:

```text
POST /v1/tools/get_related_projects
{"content_id":99999999,"content_type":"article"}
```

The response returned HTTP 200:

```json
{"success":true,"data":[],"error":null}
```

An earlier same-day `get_document` request for that article id returned a document-not-found message.
An earlier control for article 690 returned four project mentions.

The source checks the public availability of the content before it looks up project mentions.
When that check returns no row, the handler returns the text `[]`.
This gate also protects unpublished content.
The correction must preserve that protection.

## Recommendation

Return a generic unavailable-source error when the existing source gate returns no row.
Use the same response for missing and unpublished content.
Do not expose whether unpublished content exists.

Reserve a successful zero-mentions result for a source that passes the availability check.
The separate output-schema correction does not resolve this missing-source distinction.
