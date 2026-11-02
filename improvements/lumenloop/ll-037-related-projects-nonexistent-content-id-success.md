---
id: ll-037
service: lumenloop
status: verified
discovered: 2026-11-02
upstreamTitle: get_related_projects returns success with an empty list for a content ID that does not exist
evidence:
  - "2026-11-02T18:33:49Z authenticated POST https://api.lumenloop.com/v1/tools/get_related_projects with {\"content_id\":99999999,\"content_type\":\"article\"}: HTTP 200, {\"success\":true,\"data\":[],\"error\":null}. The same body with content_id 1 and with content_type event gave the same response"
  - "2026-11-02T18:33:49Z POST https://api.lumenloop.com/v1/tools/get_document with {\"id\":99999999,\"collection\":\"articles\"}: HTTP 200, data.text \"No document found with ID 99999999 in articles\". The golden audit pass 1 call with id 1 returned \"No document found with ID 1 in articles\""
  - "2026-11-02T18:33:49Z POST get_related_projects with {\"content_id\":690,\"content_type\":\"article\"}: HTTP 200, data.content text \"4 project(s) mentioned by article 690\". Articles 680 to 695 (except 690) each returned between 1 and 7 projects, and get_document returned a title for each"
  - "Related records: ll-029 records the two payload shapes of this tool (top-level [] against a content object) and its 2026-11-02 recurrence notes the same not-found gap. ll-035 records that unknown arguments are accepted silently. This finding covers only the not-found semantics"
  - "Affected golden case: eval/qa/corpus/battery/assets-anchors-seps/q-gap-related-projects-empty.json (truth.verified 2026-11-02). The golden credits an answer that treats the empty result as inconclusive"
---

## Finding

`get_related_projects` returns `success: true` and `data: []` when the content
ID does not exist. The response has no not-found error and no message.

The caller cannot tell from the response whether the content item exists. An
agent can read the empty list as "this item mentions no directory projects".
That reading is wrong when the ID is wrong.

`get_document` handles the same missing ID differently. It returns the text "No
document found with ID 99999999 in articles". The two tools therefore report a
missing item in two different ways.

## Evidence

All calls ran on 2026-11-02 with read-only requests to
`POST /v1/tools/get_related_projects` and `POST /v1/tools/get_document`.

| Call | Response |
|---|---|
| `get_related_projects` `{"content_id":99999999,"content_type":"article"}` | `{"success":true,"data":[]}` |
| `get_related_projects` `{"content_id":1,"content_type":"article"}` | `{"success":true,"data":[]}` |
| `get_related_projects` `{"content_id":99999999,"content_type":"event"}` | `{"success":true,"data":[]}` |
| `get_document` `{"id":99999999,"collection":"articles"}` | `No document found with ID 99999999 in articles` |
| `get_related_projects` `{"content_id":690,"content_type":"article"}` | `4 project(s) mentioned by article 690` |

## Recommendation

Check that the content item exists before the tool looks up mentions. When the
item does not exist, return `success: false` with a not-found error code. Name
the `content_id` and `content_type` in the error message.

When the item exists and mentions no projects, return the normal content shape
with a count of zero. For example: "0 project(s) mentioned by article 690".
