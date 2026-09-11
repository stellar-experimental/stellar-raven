# Raven usage history — 2026-09-11

## Result

The retained interval is **2026-09-04 15:00 UTC through 2026-09-11 14:00 UTC**: 167 hours.
This is partial September evidence, not a monthly total.

| Instrument | Search responses | Execute responses | Total |
|---|---:|---:|---:|
| Six-hour aggregate queries | 1,231 | 1,376 | 2,607 |
| One-hour individual-event queries | 1,227 | 1,378 | 2,605 |

The two instruments differ slightly. Report **about 2,600 responses**, not an exact historical total.
Both exclude internal `codemode.search` events and include execution error responses.
These figures cover the MCP tools. Separate aggregate counts show 143 playground search responses,
including one refusal, and 53 playground execute responses.

The individual-event joins found:

- **61 distinct accounts** with at least one attributable MCP tool response.
- **1,277 OAuth responses**, **1,320 API-key responses**, and **8 responses without an auth-summary join**.
- **172 distinct accounts** across successful OAuth MCP requests, including background protocol traffic.

Use **at least 61 tool-using accounts** for this interval. Do not call 172 active tool users.
The API-key responses include automation; these queries do not prove that all API-key traffic is internal.
OAuth tests remain indistinguishable from ordinary activity by the same account.
The eight missing joins remained absent in targeted invocation queries.

## Historical limits

Cloudflare documents a seven-day maximum for detailed Workers Logs.
Production settings showed 100% log sampling, `logpush: false`, and no tail consumers.
The producer had no usage database or archive binding.
The repository's R2 observability archive remained a research proposal.
The account-level Logpush listing returned an authentication error, so unrelated or external archives remain unverified.
No complete July or August response/user history was recovered.

Worker request metrics have a longer window, but they do not supply these two product metrics.
Do not substitute server requests, signups, or OAuth connection checks for tool responses and active users.

## Queries

Account: `ba55b7ae9acfb3ed152103e3497c0752`.
Dataset: `cloudflare-workers`.
Endpoint: `/accounts/{account_id}/workers/observability/telemetry/query`.
Every query used `dry: true`.
Common filters:

```json
[
  {"key":"$metadata.service","operation":"eq","type":"string","value":"stellar-raven-codemode"},
  {"key":"$metadata.type","operation":"eq","type":"string","value":"cf-worker"}
]
```

Twenty-eight adjacent windows, each at most six hours, used `view: "calculations"`,
`chartType: "aggregate"`, `limit: 2000`, and `parameters.limit: 2000`.
One calculation grouped `count` by `evt`.
Another filtered `evt = search` and grouped by `source`; only `source = tool` counted.
Another filtered successful OAuth `mcp_request` events and grouped by `subjectHash`.
The account union deduplicated hashes across windows.

The individual-event check used 167 adjacent one-hour windows, `view: "events"`, and `limit: 2000`.
It selected `search,execute,execute_unavailable,mcp_request`, deduplicated event IDs within each daily batch,
and joined tool events to auth summaries through `$workers.requestId`.
All these one-hour queries reported ABR level 1. No one-hour result reached the page limit.
The aggregate tool rows reported sample interval 1. Some other event categories reported non-unit intervals.
These indicators did not eliminate the small disagreement between instruments.

The broad six-hour event query reported ABR level 10 and omitted most matching events.
It was discarded. Narrowing to one hour restored ABR level 1.
Grouping by both `evt` and `source` omitted events without `source`.
The final counts therefore use separate grouping queries.
The default top-ten grouping also omitted `mcp_request`; the final queries explicitly raised both limits.

The aggregate artifact beside this report contains no pseudonymous identifiers.
Private temporary evidence is in `/tmp/raven-usage-2026-09-11/`.
It contains projected hashes and counts, not raw request headers or user content.
No IP addresses or network fingerprints were needed.

## Forward collection

`usage/README.md` specifies the separate usage collector and thirteen-month policy.
Historical estimates remain separate from new response rows.
Live collection started on 2026-09-11; its first receipt is 14:34:59 UTC.
The first archive month has partial coverage. October 2026 is the first possible complete month.
PR #151 merged the collector. The deployment ledger is `.agents/rounds/2026-09-11-usage-retention.md`.

Sources checked on 2026-09-11:

- [Workers Logs retention](https://developers.cloudflare.com/workers/observability/logs/workers-logs/#limits)
- [Worker metric retention](https://developers.cloudflare.com/workers/observability/metrics-and-analytics/#metrics-retention)
- [Tail Workers](https://developers.cloudflare.com/workers/observability/logs/tail-workers/)
