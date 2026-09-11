# Live acceptance — Raven usage collection and report (2026-09-11 16:10–16:15 UTC)

Reviewer: Claude Fable 5.1 (`claude-fable-5-1`), high effort. Read-only. Two acceptance probes were the parent's; I sent only unauthenticated and wrong-token requests to the report Worker. No headers, hashes, or credentials recorded here.

## Verdict

**Accepted.** Every requested check passed. One item is deferred to operational monitoring by design: the first post-deploy scheduled canary (due 17:07 UTC). Reasoning in section 4.

## 1. Deployment state (Cloudflare API, read-only)

| Item | Observed |
|---|---|
| `origin/main` | `75ee0315…` "Fix usage collection gaps and publish reviewed analytics report (#153)" |
| GitHub checks on that SHA | CI success, CodeQL success, "Usage archive health" dispatch success (created 16:09:19 UTC) |
| Collector deployment | version `83e85b9d…`, created 16:07:25 UTC |
| Report API deployment | version `0c23f267…`, created 16:07:30 UTC |
| Producer deployment | version `f981db0e…`, created 16:07:38 UTC |
| Producer `tail_consumers` | exactly `stellar-raven-usage` |
| Collector cron | `17 3 * * *` present |
| D1 `d1_migrations` | `0001_usage.sql`, `0002_collection_health.sql` (applied before the collector deploy; 0002 predates 16:07:25 by the parent's ordering and the post-deploy receipts prove the columns exist) |
| Collector invocations since 16:00 | 103, all outcome ok |

## 2. Report Worker and Sites

| Check | Result |
|---|---|
| `GET /report` no token (curl) | 401 |
| `GET /report` wrong token (curl) | 401 |
| Report Worker log, 16:09:27 | 200, user agent `Raven-Usage-Monitor/1.0` (health workflow) |
| Report Worker log, 16:09:54 and 16:09:55 | 200, user agent `Raven-Usage-Report/1.0` (Sites proxy) |
| Report Worker log, 16:10:00 | 401, curl (my probe) |
| Sites root, anonymous curl | 401 (owner-only policy intact) |
| Sites root in owner browser | renders "Updated Sep 11, 16:10 UTC"; September 2026: 17 total, 7 search, 10 execute, 4 accounts; August and July "Unavailable"; partial-month banner shown |
| "Refresh data" click | `/api/report` → **200** in the tab's network log; page re-rendered |
| Sites `/launch` | renders; "Independent audit · September 11, 15:36 UTC" section present with heading and all paragraphs (1,232 search, 1,388 execute, 61 accounts, archive 6 and 7, limits list); original evidence table unchanged (1,231 / 1,376 / ≥61; 143 / 53; 6 / 11; 6 / 7 / 3) |

## 3. D1 versus logs at an exact shared cutoff

Window: 2026-09-11 14:34:59.000 UTC (archive start, inclusive) to **16:10:00.000 UTC (exclusive)**. Logs: one-hour windows, events view, ABR level 1, no window at the limit, joined on the platform invocation id.

| Measure | Workers Logs | D1 `usage_responses` |
|---|---:|---:|
| search | 7 | 7 |
| execute | 10 | 10 |
| OAuth | 13 | 13 |
| API key | 4 | 4 |
| unjoined / unknown | 0 | 0 |
| distinct accounts | 4 | 4 |
| rows after cutoff | — | 0 (total 17, last 16:07:55 UTC) |

Exact match. Log minute buckets: 14:34 (1), 14:35 (2), 14:36 (1), 14:38 (3), 14:43 (3), 14:44 (3), 16:00 (2), 16:07 (2).

Receipts by era (collector deploy 16:07:25.588 UTC as the boundary):

| Era | outcome | canary | rows | responses |
|---|---|---:|---:|---:|
| pre-deploy | unknown (column default) | 0 | 15 | 15 |
| pre-deploy | unknown | 1 | 2 (15:07:46, 16:07:15) | 0 |
| post-deploy | **ok** | 0 | 2 (16:07:53, 16:07:54) | 2 |

`missing_response_ids` and `failed_statements` are 0 everywhere. The two post-deploy receipts prove the new collector writes the eight-column receipt against the migrated schema and that response rows and receipts land together.

## 4. Canary question: accept now or wait for 17:07?

Accept now, with the 17:07 UTC canary retained as operational monitoring. Reasons:

- The scheduled path and the fetch path share `projectUsage` and `collectUsage`; the only code that changed at the storage boundary is `INSERT_RECEIPT`, and the post-deploy fetch receipts exercised it against production D1 with the new columns.
- The scheduled-specific branch (no `request` on the event, `canary:<timestamp>` id) is unchanged from the version that produced the 15:07 and 16:07 canary receipts.
- The health dispatch was green, but it was satisfied by the 16:07:15 pre-deploy canary, so it does not yet prove a post-deploy canary. Because the health rule is "no canary in three hours", a missed 17:07 canary would only fail the hourly workflow from about 19:23 UTC. A human or agent check after 17:10 UTC is therefore the right first confirmation, not the workflow.

Operational monitoring to retain, in order:

1. After 17:10 UTC: D1 shows a receipt with `canary = 1` and `outcome = 'ok'` at 17:07, or the dashboard health line shows a 17:07 check.
2. 2026-09-12 03:17 UTC: first daily cleanup; all September rows must remain (cutoff is 2025-09-01).
3. Hourly "Usage archive health" stays green; first alert path proven if it ever turns red.
4. October 2026 is the first complete month; compare `scripts/usage-report.mjs --from 2026-10 --to 2026-11` with the dashboard on 2026-11-01.

## 5. Residual notes (non-blocking, already recorded in the merged README or ledger)

- Receipt and response statements share 50-statement chunks; a future schema change must again apply the migration before the collector deploy.
- `failed_invocations` in health also counts producer-side exceptions, including a failing skill-canary cron; informational by design.
- Gateway metadata retention unchanged; the 13-month D1 policy does not cover it.
- The wrong-token curl at 16:10 had not yet appeared in the report Worker log when I queried (ingestion lag); the no-token 401 had. Not a defect.
