---
id: ll-035
service: lumenloop
status: verified
discovered: 2026-11-02
upstreamTitle: Tools accept unknown argument names although their input schemas set additionalProperties false
evidence:
  - "2026-11-02T17:18:02Z authenticated POST https://api.lumenloop.com/v1/tools/list_documents with {\"collection\":\"events\",\"time_period\":\"upcoming\",\"limit\":1}: HTTP 200, success true, pagination.total 1192"
  - "2026-11-02T17:18:02Z same tool with {\"collection\":\"events\",\"period\":\"upcoming\",\"limit\":1}: HTTP 200, pagination.total 14"
  - "2026-11-02T17:18:02Z-17:18:03Z same tool with no filter, and with {\"bogus_arg\":\"x\"}: HTTP 200, pagination.total 1192 for both"
  - "2026-11-02T17:18:13Z search_directory with {\"query\":\"Blend\",\"limit\":1,\"bogus_arg\":\"x\"} and get_project with {\"slug\":\"blend\",\"bogus_arg\":\"x\"}: HTTP 200, success true, no warning"
  - "2026-11-02 GET https://api.lumenloop.com/v1/tools/list_documents and /v1/tools/search_directory: each input_schema sets \"additionalProperties\": false"
  - "Contrast 2026-11-02: the same validator rejects a wrong type (get_related_projects content_id string, HTTP 400 invalid_arguments) and a missing required field (find_similar_projects_semantic without slug, HTTP 400)"
  - "Related, distinct: ll-028 tracks an unknown value of the known sort argument"
  - "Affected golden case: eval/qa/corpus/battery/tooling-infra/q-gap-lumen-documents-browse.json"
---

## Finding

Lumenloop tools accept argument names that are not in their input schemas. The
call returns `success: true` with no error and no warning. The service ignores
the unknown argument.

Each published input schema sets `"additionalProperties": false`. The live
validator does not apply that rule. It does reject a wrong type and a missing
required field.

The result is a silent filter loss. A caller that sends `time_period` instead
of `period` to `list_documents` gets all 1192 events, not the 14 upcoming
events. The caller then treats past events as upcoming events.

`ll-028` tracks an unknown value of the known `sort` argument. This finding
covers unknown argument names on several tools.

## Evidence

All calls ran on 2026-11-02 with read-only requests to
`POST https://api.lumenloop.com/v1/tools/{tool}`.

| Tool | Body | HTTP | Result |
|---|---|---:|---|
| `list_documents` | `{"collection":"events","time_period":"upcoming","limit":1}` | 200 | `total: 1192` |
| `list_documents` | `{"collection":"events","period":"upcoming","limit":1}` | 200 | `total: 14` |
| `list_documents` | `{"collection":"events","limit":1}` | 200 | `total: 1192` |
| `list_documents` | `{"collection":"events","bogus_arg":"x","limit":1}` | 200 | `total: 1192` |
| `search_directory` | `{"query":"Blend","limit":1,"bogus_arg":"x"}` | 200 | one row, no warning |
| `get_project` | `{"slug":"blend","bogus_arg":"x"}` | 200 | full record, no warning |

The same validator returns HTTP 400 `invalid_arguments` for
`get_related_projects` with a string `content_id`. It also returns HTTP 400
for `find_similar_projects_semantic` without `slug`.

## Recommendation

Apply `additionalProperties: false` in the live validator. Return HTTP 400
`invalid_arguments` for an unknown argument name. Name the unknown argument and
list the accepted names in `details`.

Apply the rule to every tool. Add a contract test that sends one unknown
argument to each tool and expects HTTP 400.
