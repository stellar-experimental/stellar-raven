# Production deployment closeout — 2026-09-04

## Record

Terra author pane: `w16:p2J`.

PR #125 merged at `2026-09-04T12:27:17Z` as
`50bf5518860584ec1e5d352acbe11033515a0b7f`.
The Copilot comment `3933695212` was fixed in `ab5388e` and resolved.

Final CI passed Analyze in 49 seconds. CodeQL passed in 3 seconds.
Secrets passed in 23 seconds. Tests passed in 1 minute 33 seconds.

## Preflight and deployment

Deployment preflight proved that clean `HEAD` equals `origin/main`.
`npm audit --omit=dev` found zero vulnerabilities.

Wrangler deployed at `2026-09-04T12:29:24.371Z`.
Worker Version `8022e211-c731-49cc-aef1-a20f1da798b9` is at 100 percent.
Rollback Version `f62b64fa-1fb7-4c25-970d-7f98c83ab302` remains available.

## Public verification

| Check | HTTP status | Ray ID |
|---|---:|---|
| root | 200 | `a35d047f8a266c9d-ATL` |
| docs | 200 | `a35d047fd90f675b-ATL` |
| terms | 200 | `a35d048409b83495-ATL` |
| playground | 200 | `a35d04845b07875e-ATL` |
| health | 200 | `a35d0484c813a1cc-ATL` |
| well-known | 200 | `a35d048a4a72b23a-ATL` |
| aliases | 200 | `a35d048acecdc1d4-ATL`, `a35d048b3d5d5627-ATL` |

`/health/skills` returned `ok: true` and `checked: 41`.
It reported `checkedAt: 2026-09-04T12:07:53.530Z`.
The `/playground` CSP remains `sha256-ZB8MB5SKhRnJx0CaegzHU7J/JhdbqAhUdhGgxaO8z+o=`.

## Authentication and MCP verification

Unauthenticated `initialize` returned 401. Its Ray ID was `a35d048baf859877-ATL`.
Authenticated `initialize` returned 200. Its Ray ID was `a35d048bf9700eef-ATL`.

The authenticated MCP surface exposed `search` and `execute`.
Its surface SHA-256 was
`21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af`.

Production does not define the eval-only `sourceRevision` field.
The first strict source pin correctly reported none.
Wrangler Version evidence binds this deployment.

## Runtime verification

Search returned three hits. The top hit was `stellarDocs.search_soroban_contract_docs`.
Its Ray ID was `a35d03a369b1dcbf-ATL`.

Execute returned a raw Lumenloop envelope and payload through the Dynamic Worker boundary.
It returned HTTP 200 with raw `ok: true` and `count: 1`.
Its Ray ID was `a35d03a40fccaa0c-ATL`.

The digest input was `{ "subject": "Blend", "subjectType": "entity", "days": 90,
"perTypeLimit": 10 }`.
It returned 10 articles, 7 A/V, and 17 total.
It made one successful constituent call. All A/V dates were null.
Its Ray ID was `a35d05e68906291e-ATL`.

## Telemetry

Cloudflare telemetry used the `cloudflare-workers` dataset from `2026-09-04T12:00:00Z` through
`2026-09-04T13:00:00Z`. The query filtered `$metadata.service` to
`stellar-raven-codemode`. It selected events whose `$metadata.rayId` matched the four stripped Ray
IDs. The query matched 14 events for the search, raw execute, authenticated initialize, and digest
probes.
Every platform event named Worker Version `8022e211-c731-49cc-aef1-a20f1da798b9`.
Search was 200. Raw-envelope execute was `ok: true`, 149 ms, and untruncated.
`lumenloop.search_directory` was `ok` at 143 ms.
Digest execute was `ok` at 166 ms.
Its `skill_run` and `lumenloop.find_content_by_entity` events were `ok` at 160 ms.

## Closeout state

The production deployment is complete. Open work is trigger-only or owner-blocked.
It is not deployment work. Herdr cleanup remains open.
