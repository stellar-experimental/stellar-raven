# Fix review — codex/usage-audit (uncommitted working tree, read 2026-09-11 15:55–16:02 UTC)

Reviewer: Claude Fable 5.1 (`claude-fable-5-1`), high effort. Read-only. The tree was still changing while I read it (19 dirty paths); statements below name the version I saw.
Companion files in the same directory:
- `2026-09-11-usage-audit-fable-review.md` — baseline audit.
- `2026-09-11-usage-audit-independent-counts.json` — sanitized counts and provenance for the audit evidence panel (counts, timestamps, methods; no hashes, ids, or credentials).

## Verification I ran on the branch

| Gate | Result |
|---|---|
| `npx vitest run test/usage.test.ts test/usage-health.test.mjs test/usage-site-runtime.test.mjs` | 3 files, 15 tests pass |
| `npm run test:usage-report` | 11 node tests pass, `check` passes |
| `npm run typecheck` | pass |
| `npm run build:usage` (dry run) | pass, binds only `USAGE` |
| `npm run build:usage-report` (dry run) | pass, 5.16 KiB |
| `npm run secrets:scan -- --tree` | clean |
| `node scripts/check-usage-deployment.mjs` (live, read-only) | pass: tail consumer and cron present |
| `wrangler d1 migrations list --remote` | **`0002_collection_health.sql` is NOT applied in production** |
| `diff` of `usage/report-site/` vs Sites repo `3523623` | identical except the reviewed edits (`queries.js`, `worker.js`, `server.js`, `app.js`, `index.html`, `README.md`) |

## What the fixes resolve (confirmed by reading)

- **Poison batch (P1):** `collectUsage` no longer throws on a missing id; valid traces in the same batch are written, the missing count is logged and persisted as a receipt with `responses = 0`. Regression test places valid traces on both sides of the bad one. Resolved.
- **Chunk failure (P1):** `writeBatch` retries each 50-statement chunk three times, continues to later chunks, records `failed_statements` in a `write-failure:` receipt, then throws so the tail invocation shows as an error in metrics. Test asserts call shape `[50,50,50,2,1]`. Resolved.
- **Outcome coverage (P1):** receipts now carry `outcome`; interrupted invocations produce a receipt with zero responses. Test covers `exceededCpu`. Resolved.
- **Definition wording (P1):** README, terms page, and dashboard footer now say "logged, handler-completed responses" and list the exclusions. Resolved.
- **Gateway disclosure (P2):** README now says payload collection is off and metadata can persist. Resolved as wording; retention decision still open (see B4).
- **Shared SQL (P2):** `queries.js` is the single source; `scripts/usage-report.mjs` imports it and substitutes bound integers validated by `monthTimestamp`. Report tests assert no write verbs. Resolved.
- **Monitoring (P1):** hourly `usage-health.yml` checks canary age, `missing_response_ids`, `failed_statements`, `truncated_invocations`, `failed_invocations`; `postdeploy` verifies tail consumer and cron. Resolved pending secrets (B2).
- **P0 root cause:** `redirect: 'error'` is unsupported in workerd and throws before any request leaves, which matches my observation that the report Worker received zero requests from Sites. `redirect: 'manual'` plus the non-OK check is the right fix. The Miniflare test proves the request now leaves with the bearer header and that a 302 becomes 502. Live acceptance still required after the Sites publish.
- **Canonical source and sync:** `sync-usage-site.mjs` refuses dirty trees, non-main, mismatched `project_id`, independent Sites edits (hash guard), and any bootstrap commit other than `3523623`. Sound.

## Remaining blockers (must clear before deploy or merge)

**B1. Migration order couples schema to data loss.** The new `INSERT_RECEIPT` names three columns that production does not have yet. If the collector deploys before `0002` is applied, every chunk containing a receipt fails all three attempts and the *response rows in that chunk are lost too* (one transaction per 50 statements). The write-failure receipt also fails for the same reason, so the only trace is a tail error count.
Acceptance: `npx wrangler d1 migrations apply stellar-raven-usage --config usage/wrangler.jsonc --profile sdf --remote` completes and `migrations list --remote` shows nothing pending **before** `wrangler deploy --config usage/wrangler.jsonc`; then a D1 query shows a receipt with a non-null `outcome` written after the deploy timestamp. Consider (not required now) splitting response and receipt statements into separate chunks so a receipt failure can never discard responses.

**B2. Health workflow cannot run yet.** `usage-health.yml` needs the GitHub secret `USAGE_REPORT_TOKEN`; it is not referenced anywhere else in CI, so it is presumably unset. Until set, the hourly job fails with "not configured" and the new detector is dark.
Acceptance: a `workflow_dispatch` run of "Usage archive health" is green and its log prints the healthy line.

**B3. Live acceptance of the Sites page is still open.** The Sites publication copy has not been synced or published, and the report Worker is still the pre-fix version. `/api/report` returned 502 at 15:47 UTC.
Acceptance: after sync + publish + Worker deploy, a browser load of `/` shows counts; the report Worker log shows a 200 with user agent `Raven-Usage-Report/1.0`; `/launch` still renders; a wrong token yields 401.

**B4. Decision on gateway metadata retention.** Wording is fixed, but 5,715 metadata rows remain in gateway `stellar-raven-demo` and new rows still accrue (last 11:48 UTC today). Either accept and disclose the retention period, or turn gateway log storage off and purge. Not a code blocker; a policy decision the parent should record in the round ledger.

## Non-blocking findings (fix in this PR or file in `.agents/TODO.md`)

1. **Receipt volume and semantics changed.** Every non-ok invocation now writes a receipt, and 10–15% of producer invocations end `canceled` (mostly SSE streams). Expect roughly 2,000 receipt rows per day, 60k per month. D1 handles it, but `usage/README.md` should state it, and the "receipt coverage" status now turns green on days with only protocol traffic. Consider recording only `canceled` traces that contain tool events, or exclude `canceled` from receipts entirely (health already ignores it).
2. **Health noise from producer failures.** `failed_invocations` counts any producer `exception`/`exceededCpu`, including a failing hourly skill-canary cron, and `truncated_invocations` counts any 256 KB log overflow. Both are "possible undercount" signals, not collector faults. Keep them, but label the failure message accordingly and consider a threshold above zero for `truncated_invocations`.
3. **Non-idempotent receipt ids.** `unidentified:` and `write-failure:` receipts use random UUIDs, so a redelivered batch double-counts them. Acceptable, but say so in the README.
4. **Stale contract text.** `usage/report-site/README.md` still says the SQL "follows `scripts/usage-report.mjs` … commit 8279fc6"; the relationship is now reversed (the script imports `queries.js`). Update to name `queries.js` as the source.
5. **`check-usage-deployment.mjs` parses the Wrangler profile file for an OAuth token.** It never prints it, but the regex assumes `oauth_token`; an API-token profile silently reports "No Cloudflare credential". Prefer `CLOUDFLARE_API_TOKEN` in CI and document the local fallback.
6. **`postdeploy` only fires through `npm run deploy`.** A direct `wrangler deploy` skips the check. `deploy-preflight` is the enforced path today; note it in `usage/README.md`.
7. **`app.js` status logic.** `interrupted` is displayed but does not affect `status`; `missing`/`failed` do. That is the right call, but the footer copy should say interrupted invocations are informational.
8. **Round ledger says "Status: audit in progress" and lists the wrong reviewer session line as a Herdr fact.** Update on close with the gates above and the lane/effort used.

## Acceptance checklist for the deployment review

1. Migration `0002` applied remotely before the collector deploy (B1), then one receipt with `outcome` visible in D1.
2. Collector deploy, then `node scripts/check-usage-deployment.mjs` passes and the next hourly canary receipt lands within 70 minutes.
3. Report Worker deploy; `curl` without token → 401; health JSON contains `health.last_canary_ms`.
4. Sites sync via `sync-usage-site.mjs` from a clean `main == origin/main`; `.raven-source.json` records the merge commit; Sites publish; browser check per B3.
5. `USAGE_REPORT_TOKEN` set in GitHub; manual run of `usage-health.yml` green (B2).
6. D1 reconciliation: rows in `usage_responses` since 14:34:59 UTC equal the log count of tool events in the same window (13 = 13 at 15:36 UTC today; recheck after deploy).
7. Full gates on the final commit: `npm run typecheck`, `npm test`, `npm run build`, `npm run build:usage`, `npm run test:usage-report`, `npm run build:usage-report`, `npm run secrets:scan -- --tree`.
