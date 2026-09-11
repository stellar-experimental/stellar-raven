# Raven usage reporting and analytics storage — independent review

Reviewer: Claude Fable 5.1 (model id `claude-fable-5-1`), high effort. Read-only. No source, production, auth, or secret changes.
Baseline read: stellar-raven `main` `8279fc6` (the checkout later moved to `codex/usage-audit`; all code statements below are about the `8279fc6` versions). Report site: `stellar-raven-report` `3523623`.
Evidence tools: Cloudflare API MCP (telemetry, GraphQL, settings, KV, R2, AI Gateway, D1 metadata) and Wrangler `--profile sdf` (D1 remote queries). Time of review: 2026-09-11 15:27–15:50 UTC.

## 1. Independently checked numbers

### Tool responses (retained Workers Logs, exact events, ABR 1, no window reached the 2,000 limit)

Window 2026-09-04 12:00 → 2026-09-11 14:34:59 UTC, one-hour windows, joined on `$workers.requestId`:

| Measure | This review | Prior audit (Sep 4 15:00 → Sep 11 14:34:59) |
|---|---:|---:|
| MCP `search` (source=tool) | 1,232 | 1,227 + 6 = 1,233 |
| MCP `execute` | 1,388 | 1,378 + 11 = 1,389 |
| Joined OAuth | 1,293 | 1,277 |
| Joined API key | 1,319 | 1,320 |
| Unjoined | 8 | 8 |
| Distinct tool-using accounts | **61** | 61 |

Six-hour aggregate windows (Sep 4 12:00 → Sep 11 14:00) gave search 1,228 / execute 1,377 (audit 1,231 / 1,376). Sample intervals above 1 appeared in a few windows, so aggregates are estimates. Playground aggregates: 143 search (incl. 1 refusal) and 55 execute (audit: 53).

Sep 11 14:00 → 14:34:59: search 6, execute 11 (matches). Archive period 14:34:59 → 15:36: logs show search 6, execute 7, 3 accounts; D1 holds exactly 13 rows, 3 distinct hashes, all ids UUID-based, 13 receipts with responses=1, 1 canary receipt (15:07:46 UTC), 0 truncated. One additional account appeared after the archive start (62 distinct across both spans). Only 33 of the 61 accounts appear on two or more days.

Boundary: D1 has no row before 14:34:59.886 UTC, the extra log window ends at 14:34:59.000, so nothing is double counted between the log estimate and the archive.

### Worker request metrics (GraphQL `workersInvocationsAdaptive`, by status)

| Month | success | clientDisconnected | total | Report value |
|---|---:|---:|---:|---:|
| 2026-07 | 90,410 | 6,500 | 96,910 | 96,910 |
| 2026-08 | 554,730 | 21,330 | 576,060 | 576,060 |
| 2026-09 to 15:36 UTC | 187,253 | 21,204 | 208,457 | 208,248 at 15:14 cutoff |

Errors: 0 in all months. GraphQL refuses data older than 12w6d, so July metrics stop being queryable around 2026-09-30; the committed `evidence/2026-09-11-worker-requests.json` becomes the only durable record.

Invocation outcomes over the retained week: about 10–15% of producer invocations per six-hour window end `canceled` (client disconnect, mostly SSE streams); 0 `exception`/`exceededCpu` observed in the grouped outcome queries.

### Collector and cleanup

- Tail worker: 737 `tail` invocations since 14:30 UTC in logs (646 in September GraphQL), all outcome ok, zero app-log lines (so `usage_missing_request_id` never fired), zero errors.
- Live producer settings: `tail_consumers = [stellar-raven-usage]`, `logpush = false`, logs and traces at 100% head sampling. Collector binds only D1 `bbf9bd3d…` and has no tail consumer. Cron `17 3 * * *` registered at 14:31:15 UTC; the first cleanup run (2026-09-12 03:17 UTC) has not happened yet.
- Producer cron `7 * * * *` present; one `skill_canary` receipt recorded.

### Supporting activity (separately labeled, never a substitute for responses or active users)

- OAuth grants in `OAUTH_KV`: 417 `grant:` keys over **263 distinct subjects** (90-day TTL covers the whole launch period, so this is a lower bound on accounts that completed authorization since launch and still hold a grant); 74 `token:` keys over 59 subjects (1-hour TTL, momentary); 2,406 registered OAuth clients (`client:`).
- OAuth-attributed MCP requests per day (protocol traffic included): 102–129 distinct accounts per day-chunk; the prior audit's 7-day union was 172. Most connected accounts never call a tool in a given week.
- AI Gateway `stellar-raven-demo`: **5,715 metadata rows**, 2026-07-07 13:11 → 2026-09-11 11:48 UTC (Jul 2,649; Aug 2,704; Sep 1–11 362). Status 200: 5,476. Bodies not retrievable for sampled rows. The oldest rows carry user agent `node` (43 of 50), so this series mixes local eval runs with playground traffic and cannot be read as user activity.

### Sources checked and empty

- R2 `raven-traces`: 230 objects, all 2026-06-16 → 06-20 (pre-launch experiment). No launch-era history.
- Logpush job listing: authentication error for this token (unverified, as in the prior audit). Producer `logpush=false`.
- No other D1, KV, or Analytics Engine dataset holds Raven usage.
- Instrumentation history: `search`/`execute` events exist since the 2026-07-03 snapshot; `mcp_request` with `accessMode`/`subjectHash` only since 2026-07-12 (`dcdf0e6`); demo telemetry since 07-06/07-08. Even a full log archive could not attribute users before 2026-07-12.

Conclusion: July and August tool responses and active users are unrecoverable. The prior audit's figures hold within a few responses.

## 2. Prioritized findings

### P0 — Live dashboard is broken
`https://raven-usage-report.kalepail.chatgpt.site/` renders "The archive is unavailable"; `/api/report` returns **502**. The report Worker received no request from the Sites server during the refresh (its logs show only curl/node tests at 15:05–15:06 and 15:44). Either the Sites environment values are wrong or Sites egress to `*.workers.dev` is blocked. `/launch` (static) renders correctly.
Acceptance: a browser load of `/` shows counts; the report Worker log shows a 200 with the Sites user agent; a wrong token still yields 401.

### P1 — Poison batch and no per-trace isolation (confirmed by parent)
`collectUsage` throws on the first trace with `missingRequestId` before any write, dropping every other trace in the tail batch. After three failed D1 attempts the whole batch is also lost; Cloudflare does not retry tail invocations and the only signal is a console line with 7-day retention.
Acceptance: regression test `collectUsage([valid, badTrace])` writes the valid rows; bad traces increment a counter row or a receipt flag rather than throwing; a D1 failure test shows the batch is retried per chunk and the failure is logged with counts.

### P1 — Silent collection stop has no detector
Nothing alerts if the tail consumer detaches, the cron stops, or D1 writes fail. The dashboard shows canary coverage only when someone looks, and it is currently down (P0).
Acceptance: `refresh.yml` (or a new workflow) queries D1 with the sdf token and fails when the last canary receipt is older than 3h or when `usage_receipts` has no row in the last 24h while the producer served tool traffic; `deploy-preflight` (or a post-deploy check) asserts the live `tail_consumers` list equals `["stellar-raven-usage"]`.

### P1 — Metric definition is narrower than the wording
"Responses including errors and refusals" excludes: JSON-RPC/zod validation errors (handler never runs), auth-rejected calls, and invocations that crash or exceed limits before `logEvent("execute")`. Receipts do not record `trace.outcome`, so a crash-induced undercount is invisible.
Acceptance: `usage_receipts` gains an `outcome` column (or a receipts row per non-ok outcome); README/terms say "handler-completed responses"; a test covers a trace with `outcome: "exceededCpu"` and no tool event.

### P2 — Disclosure drift on AI Gateway logs
README says playground requests set the per-request logging override off, yet 5,715 gateway metadata rows exist through 2026-09-11 11:48 UTC (payload collection is off; metadata rows persist). Fix the wording or turn gateway log retention off and purge, per policy.
Acceptance: README/privacy text matches the observed gateway state; if purged, the gateway log count is 0 and stays 0 after a playground turn.

### P2 — Report Worker exposure and duplication
`stellar-raven-usage-report` is reachable on public `workers.dev` (token-gated, constant-time compare, correct 401/404/405). Its D1 binding is read-write; read-only is by code only. The SQL is duplicated between `scripts/usage-report.mjs` and `cloudflare/worker.js` with a contract pinned to commit `8279fc6`; the collector fix will drift it.
Acceptance: one shared SQL module (now feasible under `usage/report-site/`); a test asserts both entry points produce identical SQL; decide and document whether workers.dev stays or a custom hostname replaces it.

### P2 — Release and maintenance gaps in the report site
Separate Git repo with no CI, no remote, hand-deployed Sites and Worker, static `launch-data.json`, `ARCHIVE_START` hard-coded, snapshot totals asserted in tests. The parent's move to `usage/report-site/` plus a sync script addresses tracking; still needed: a documented sync direction, a Sites deploy checklist, and a note that July request metrics expire from GraphQL around 2026-09-30.
Acceptance: `npm run test:usage-report` and `build:usage-report` run in CI (present on the branch); the sync script is idempotent and refuses to overwrite newer Sites-side edits; the evidence JSON is committed in the main repo.

### P3 — Smaller code observations (baseline `8279fc6`)
- Batches of 50 statements can split a trace's receipt from its responses; a mid-batch failure leaves responses without a receipt (coverage undercount, no data loss).
- `usage_receipts` rows exist only for traces with responses, truncation, or canary; protocol-only invocations leave no receipt, which is fine but should be stated in `usage/README.md`.
- The `canceled` outcome share (10–15%) means some computed tool results are never delivered; consistent with "returned responses", worth one sentence in the README.
- Test gaps: multi-trace isolation; playground trace without `cf-ray`; truncated trace that still has responses; receipt/response split; `retentionCutoff` on Feb 29.
- Playground attribution is sound: the cookie subject is the same WorkOS-derived subject and `hashPrefix` is shared, so cross-surface distinct counts are valid.

## 3. Unresolved evidence limits

- Logpush jobs cannot be listed with this token; an external archive remains unverified (as before).
- Tail Worker delivery guarantees are not documented by Cloudflare; the receipt table cannot prove no loss.
- The half-second boundary is resolved (no archive rows before 14:34:59.886), but any response between the tail attach (14:33:52) and the first receipt would have been counted only in the log estimate.
- The first scheduled cleanup and the first full-month report have not run.

## 4. Acceptance checks for the follow-up review

1. `curl` the Sites `/api/report` through a logged-in browser: 200 with `schema: 1`; report Worker log shows the Sites user agent.
2. `npx vitest run test/usage.test.ts` includes the multi-trace isolation test and passes; `npm test`, `npm run typecheck`, `npm run build`, `npm run build:usage` pass.
3. Wrangler remote D1: `SELECT COUNT(*) FROM usage_responses` equals the log count of tool events since 14:34:59 UTC within the same window (today: 13 = 13).
4. Live settings via Cloudflare API: producer `tail_consumers` unchanged after the next deploy; collector cron present; first cleanup at 2026-09-12 03:17 UTC leaves all September rows intact.
5. A monitoring job that fails when the last canary receipt is older than 3h.
6. README/terms wording matches the gateway metadata retention and the "handler-completed responses" definition.
