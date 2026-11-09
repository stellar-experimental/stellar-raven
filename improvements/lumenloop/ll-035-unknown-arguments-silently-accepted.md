---
id: ll-035
service: lumenloop
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: list_documents silently ignores unknown argument names despite additionalProperties false
evidence:
  - 2026-11-02T22:36:14Z Raven recheck (read-only): POST https://api.lumenloop.com/v1/tools/list_documents returned HTTP 200 and success=true for all three bodies. {"collection":"events","time_period":"upcoming","limit":1} returned pagination.total=1192. The period="upcoming" control returned total=13. The bogus_arg="x" control returned total=1192. The earlier count of 14 upcoming events changed to 13.
  - 2026-11-02 source calibration: lumenloop/lumenloop-backend main acba0387f14acd35d875719b2cc268509616a184, lumenloop-mcp/src/api/router.ts. Schema publication uses z.object(tool.schema ?? {}); request validation uses the same object without .strict(). package.json declares zod ^3.24.0.
  - 2026-11-02 executable calibration: a local check with zod 3.24.0: z.object(...).safeParse accepted time_period and removed it from parsed data. Adding .strict() rejected time_period with code unrecognized_keys.
  - 2026-11-02 adjacent check: rg -n "safeParse|z.object|additionalProperties" in router.ts and registry.ts found one shared request-validation point. The correction can cover the tool registry without separate checks for each tool.
  - 2026-11-02 dedupe: gh search issues and gh search prs covered open and closed owner records. gh api --paginate issues?state=all supplied complete bodies. rg over improvements/ and improvements/resolved.json checked local records. No duplicate appeared among 30 issues and 17 PRs in lumenloop/lumenloop-backend. Existing issue 43 and ll-028 concern invalid sort values; unknown key names require the shared object-validation correction.
  - Affected golden case: eval/qa/corpus/battery/tooling-infra/q-gap-lumen-documents-browse.json
  - 2026-11-02T17:18:13Z earlier verification: search_directory and get_project accepted bogus_arg="x" with HTTP 200 and no warning. The no-filter list_documents control returned total=1192. Published list_documents and search_directory schemas set additionalProperties=false.
  - upstream issue filed 2026-11-02: https://github.com/lumenloop/lumenloop-backend/issues/49
recurrences:
  - date: 2026-11-09
    evidence: "2026-11-09 sweep at 2026-11-09T20:31:13.269042+00:00: still-repro. events time_period=upcoming, bogus_arg=x, and no filter return HTTP200 total1210; correct period=upcoming returns23. Directory and project bogus_arg controls also succeed without warning. Current schemas retain additionalProperties=false. Read-only exact requests and response hashes: tmp/lane-lumenloop.md; upstream issue state/comments freshly read; no maintainer comments or claimed fix."
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: LL list_documents events time_period upcoming vs period upcoming vs bogus_arg vs no filter; directory/project bogus_arg controls — All HTTP200. Misspelled/unknown/no filter total1201; proper period total17. Published additionalProperties=false; unknown keys silently accepted on directory/project too. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-035."
---

## Finding

`list_documents` silently ignores unknown argument names, although its published schema sets `additionalProperties: false`.
A request with `time_period: "upcoming"` returns all 1192 events.
The correct argument, `period: "upcoming"`, returns 13 events.
Both requests return HTTP 200 with `success: true`.

The response does not warn callers that it discarded their filter.
Earlier checks also accepted `bogus_arg` on `search_directory` and `get_project`.

## Evidence

Raven repeated these read-only requests on 2026-11-02T22:36:14Z.
Each request used `POST /v1/tools/list_documents` and returned HTTP 200.

| Body | `pagination.total` |
|---|---:|
| `{"collection":"events","time_period":"upcoming","limit":1}` | 1192 |
| `{"collection":"events","period":"upcoming","limit":1}` | 13 |
| `{"collection":"events","bogus_arg":"x","limit":1}` | 1192 |

The upcoming count changed from 14 in the earlier check to 13 in this check.
The defect still reproduces.

The source publishes a JSON Schema from `z.object(tool.schema ?? {})`.
The request path validates through `z.object(tool.schema ?? {}).safeParse(req.body ?? {})`.
With `zod 3.24.0`, within the declared `^3.24.0` range, this object schema accepts and removes unknown keys.
A dependency-matched local check confirmed that `.strict()` rejects `time_period` with `unrecognized_keys`.

## Recommendation

Reject unknown keys at the shared request-validation point.
For the current Zod object schema, add `.strict()` before `.safeParse()`.
Return HTTP 400 `invalid_arguments` and name the unknown argument in the error.
Add a contract check that sends an unknown argument to each tool.

Unknown values for a recognized argument require a separate value-validation correction.
