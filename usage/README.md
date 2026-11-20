# Monthly usage reports

Raven records each top-level `search` and `execute` response (including errors and refusals; MCP and Playground separately). Protocol messages, connection checks, internal `codemode.search` calls, upstream operations, auth rejections, input validation errors, and pre-log failures do not count. Counts do not measure correctness or client delivery.

A distinct active account has at least one recorded response in the UTC month, keyed by WorkOS-derived `subjectHash` (never email, IP, browser fingerprint, or OAuth client ID). Multiple clients for one account count as one; API keys never count as people (and internal API-key tests remain in API-key counts, while OAuth tests cannot be separated from that account's usage). Record `MCP_SERVER_SECRET` rotations before comparing user counts, as rotation splits hashes.

## Privacy rules

- Treat account hashes as pseudonymous personal data.
- Give every user-level dataset a defined purpose, restricted access, and retention and deletion rules.
- Never infer organizations from user, client, network, geo, TLS, or user-agent data.
- Never publish raw query previews or reversible short-query hashes as top-query reports.

## Storage

`stellar-raven-usage` is a Tail Worker attached to `stellar-raven-codemode` (no HTTP route or MCP operation). It extracts permitted fields from producer logs into D1; the separate report Worker requires its own bearer secret, runs fixed aggregate SELECTs, and returns no account hashes.

- `usage_responses`: one row per response (`timestamp`, `tool`, `surface`, `access_mode`, optional `subjectHash`), deduplicated by invocation ID + log index.
- `usage_receipts`: response counts, log truncation, and the hourly producer canary.
- Neither table stores headers, queries, answers, code, exceptions, or raw account IDs. Each database write gets up to three attempts total before logging permanent failure.
- Daily cleanup keeps `USAGE_RETENTION_MONTHS` UTC calendar months including the current month (`src/auth/retention.ts`; [operations guide](../docs/operations.md#data-retention)) and deletes older rows plus expired historical snapshots (migration 0003; served only after bearer auth). Account deletion also removes response rows ([deletion procedure](../docs/operations.md#account-data-deletion)).

## Report

```sh
node scripts/usage-report.mjs --from 2026-09 --to 2026-10
```

`--to` is exclusive. Uses `usage/wrangler.jsonc` (set `WRANGLER_PROFILE` for a named profile; add `--local` for the local test DB). Outputs MCP, Playground, and combined monthly rows (combined deduplicates accounts across surfaces).

Before sharing a report: state collection dates (missing months are unavailable data, not zero); separate API-key counts from OAuth users; check unattributed responses, truncated invocations, canary freshness, and collector write errors; keep a dated aggregate export for completed-month comparisons.

## Deploy and verify

Apply migrations before deploying the collector (add `--profile <name>` if needed):

```sh
npx wrangler d1 migrations apply stellar-raven-usage --config usage/wrangler.jsonc --remote
npx wrangler deploy --config usage/wrangler.jsonc
```

Attach via `tail_consumers: [{ service: "stellar-raven-usage" }]` in Raven's Wrangler config (preserving other consumers) after publishing matching usage disclosures, then deploy the producer with `npm run deploy` ([operations guide](../docs/operations.md#deploy); its `postdeploy` check authenticates via `wrangler auth token`: `CLOUDFLARE_API_TOKEN`, then `WRANGLER_PROFILE`, then checkout profile). Verify a known tool response in logs and D1, confirm hourly canaries arrive, run the monthly report, and inspect collector logs for write errors.

To stop collection, remove only this tail consumer and keep D1 for the retention period. The hourly `usage-health` workflow skips with a notice when `USAGE_REPORT_TOKEN` is unset.

## Dashboard

Source lives in [`report-site/`](report-site/README.md) (reviewed in Raven PRs; CI runs `npm run test:usage-report` and `npm run build:usage-report`). `.openai/hosting.json` holds the owner's private Sites project ID. After merging to `main`, sync to the separate Sites checkout and publish that exact copy (never edit the publication copy directly; `.raven-source.json` records the commit):

```sh
node scripts/sync-usage-site.mjs <path to the Sites checkout>
```

## Run your own usage archive on a fork

1. Put your Cloudflare `account_id` and new `stellar-raven-usage` D1 `database_id` in `usage/wrangler.jsonc` and `usage/report-site/cloudflare/wrangler.jsonc`.
2. Apply migrations, deploy the collector, and add `tail_consumers` to your producer config.
3. Deploy the report Worker (`npx wrangler deploy --config usage/report-site/cloudflare/wrangler.jsonc`) and set a fresh `REPORT_TOKEN` secret.
4. Optional dashboard: replace `usage/report-site/.openai/hosting.json` with your Sites project ID and configure `USAGE_REPORT_URL` and secret `USAGE_REPORT_TOKEN` in Sites.
5. Optional monitoring: set repo secret `USAGE_REPORT_TOKEN` and variable `USAGE_REPORT_URL` to enable `usage-health`. Without imported historical snapshots, `/launch` returns 404.

## Limits

Best-effort operational telemetry, not an exactly-once billing ledger. Producer crashes, truncated logs, or dropped tail events can leave gaps (receipts help spot gaps but cannot prove completeness), and events expired from Workers Logs before collection cannot be recovered.

- Interrupted invocations may hold computed responses the client never received; cancellation receipts add storage.
- Missing-ID and write-failure receipts use random IDs and may repeat on redelivery.
- Producer failure/truncation signals indicate possible gaps, not necessarily collector faults.
- The usage retention window covers D1 only, not Workers Logs or AI Gateway metadata.

## Owner data stays outside the repository

This repo works without any private directory. The owner keeps three private local directories outside it:

| Directory | Holds |
|---|---|
| `~/Desktop/stellar-raven-aux-priv-report` | Sites publication copy of `usage/report-site/`, written by `scripts/sync-usage-site.mjs` from clean `main`; never edit directly. |
| `~/Desktop/stellar-raven-aux-priv-evidence` | Production snapshots, dashboard exports, and audits with real figures. |
| `/home/tyler/raven-data/qa` (on agentpc) | Pinned judge-stability register and stored QA results with held-out verdicts (`eval/qa/heldout-read.sh` default). Never open or commit. |

Never commit production counts, request IDs, or account hashes; tests use synthetic fixtures only. Import historical snapshot JSON into D1 via bound parameters. `scripts/check-private-usage.mjs` (pre-commit and CI) blocks known export shapes, but prose still requires review.

Cloudflare docs: [Tail Workers](https://developers.cloudflare.com/workers/observability/logs/tail-workers/), [Tail handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/tail/), [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/).
