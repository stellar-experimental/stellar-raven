# Monthly usage reports

Raven records each top-level `search` and `execute` response, including errors and refusals.
The count does not assess correctness or prove that the client received every byte.
Protocol messages, connection checks, internal `codemode.search` calls, and upstream operations do not count.
Authentication rejections, input validation errors, and failures before a response log do not count.
Playground tool responses appear separately from MCP responses.

A distinct active account has at least one recorded tool response in the selected UTC month.
The collector uses Raven's existing WorkOS-derived `subjectHash`.
It does not use an email address, IP address, browser fingerprint, or OAuth client identifier.
Several clients belonging to one account count as one account.
API keys have no WorkOS identity and never count as people.
Internal tests using an API key remain visible in the API-key response count.
Tests using a real OAuth account cannot be distinguished from that account's other usage.
Rotating `MCP_SERVER_SECRET` can split an account's hash. Record rotations before comparing user counts.

## Privacy rules

- Account hashes are pseudonymous personal data. Treat them as personal data.
- Each user-level dataset has a defined purpose, restricted access, and rules for retention and deletion.
- Never infer an organization from user, client, network, geographic, TLS, or user-agent data.
- Never publish raw query previews or reversible short-query hashes as top-query reports.

## Storage

`stellar-raven-usage` is a Tail Worker attached to `stellar-raven-codemode`.
It extracts permitted fields from existing logs after the producer invocation finishes.
The collector and the separate aggregate report Worker access the usage D1 database.
The collector exposes no HTTP route or MCP operation.
The report Worker requires its own bearer secret and runs fixed aggregate SELECT queries.
It returns no account hashes.

`usage_responses` stores one row per response with its log timestamp, tool, surface, access mode,
and optional pseudonymous account hash. An invocation identifier plus log index deduplicates retries.
`usage_receipts` records response counts, log truncation, and the producer's hourly canary.
Neither table stores request headers, queries, answers, code, exceptions, or raw account identifiers.
The collector tries each database write up to three times and reports permanent failures.

The daily cleanup retains thirteen UTC monthly periods: the current month and the previous twelve.
The collector imports `USAGE_RETENTION_MONTHS` from `src/auth/retention.ts`.
An account-data deletion also removes the account's response rows.
[The operations guide](../docs/operations.md) gives the deletion procedure and the other retention periods.

Migration 0003 stores historical report snapshots in D1. Each snapshot has an explicit expiry
timestamp, and the daily cleanup deletes expired snapshots. The report API returns the launch
snapshot only after bearer authentication.

## Report

```sh
node scripts/usage-report.mjs --from 2026-09 --to 2026-10
```

`--to` is exclusive. The command uses the account in this directory's config. Set `WRANGLER_PROFILE` to pick a
named Wrangler profile; without it, Wrangler uses your default login.
Add `--local` to query the local test database.
The JSON output contains MCP, playground, and combined monthly rows.
The combined account count deduplicates users across both surfaces.

Before sharing a report:

- State the actual collection dates. Missing months mean unavailable data, not zero usage.
- Separate API-key response counts from OAuth user activity.
- Inspect unattributed responses and truncated invocations.
- Check the producer canary timestamps and collector errors. A missing canary can signal a collection gap.
- Retain a dated aggregate export when comparing completed months.

## Deploy and verify

Apply migrations before deploying the collector:

```sh
npx wrangler d1 migrations apply stellar-raven-usage --config usage/wrangler.jsonc --remote
npx wrangler deploy --config usage/wrangler.jsonc
```

Add `--profile <name>` when your Wrangler login for the account is a named profile.

Attach the collector with `tail_consumers: [{ service: "stellar-raven-usage" }]` in Raven's Wrangler config.
Publish the matching usage disclosure before starting collection.
Verify the live producer settings after deployment. Preserve any other tail consumers.
Check a known tool response in both the retained logs and D1, then verify the hourly canary arrives.
Run the monthly report and inspect the collector's logs for failed writes.

Deploy the producer with `npm run deploy`. Direct Wrangler commands skip its `postdeploy` check.
That check uses `CLOUDFLARE_API_TOKEN` when it is set. Otherwise it tries the Wrangler OAuth
profiles `WRANGLER_PROFILE`, `default`, and `sdf`, in that order.

To stop new collection, remove only this tail consumer from the producer settings and config.
Preserve the database for the agreed retention period.

The hourly `usage-health` workflow and the `postdeploy` check skip with a notice when the report
token or a Cloudflare credential is absent. They never fail a fork that has not configured its own archive.

## Dashboard

The dashboard source is in [`report-site/`](report-site/README.md). It is reviewed in Raven pull
requests. The owner publishes it as an OpenAI Sites project, which `report-site/.openai/hosting.json`
names. The Sites deployment adds owner-only access.

After a report change merges, sync the reviewed main branch to the separate Sites publication checkout:

```sh
node scripts/sync-usage-site.mjs <path to the Sites checkout>
```

Build, validate, and publish that exact copy through Sites. Its `.raven-source.json` records the Raven commit.
Do not edit the publication copy independently. `npm run test:usage-report` and `npm run build:usage-report`
run in CI alongside the collector checks.

## Run your own usage archive on a fork

The repository owner operates the public service. A fork gets the full collection and reporting
stack and needs none of the owner's data. Set it up in this order:

1. Put your Cloudflare `account_id` in `usage/wrangler.jsonc` and `usage/report-site/cloudflare/wrangler.jsonc`.
   Create a D1 database named `stellar-raven-usage` and put its `database_id` in both files.
2. Apply the migrations and deploy the collector as shown above. Add `tail_consumers` to your producer config.
3. Deploy the report Worker: `npx wrangler deploy --config usage/report-site/cloudflare/wrangler.jsonc`.
   Set its `REPORT_TOKEN` secret to a fresh random value.
4. Optional dashboard: create your own Sites project and replace `usage/report-site/.openai/hosting.json`
   with its project id. Configure `USAGE_REPORT_URL` and secret `USAGE_REPORT_TOKEN` in Sites.
5. Optional monitoring: set the repository secret `USAGE_REPORT_TOKEN` and the variable `USAGE_REPORT_URL`
   so the hourly health workflow runs. Until then, it skips with a notice.
6. Historical snapshots are optional. If you import none, the `/launch` page shows 404.

## Limits

This is an operational usage measure. Worker logs and tail delivery are not an exactly-once billing ledger.
Database writes are idempotent, but producer crashes, truncated logs, or undelivered tail events can leave gaps.
The receipt table helps identify gaps; it cannot prove that no event was lost.
The archive cannot recreate tool events that expired from Workers Logs before collection started.

- Interrupted invocations are informational. They can contain computed responses that did not reach the client.
- Cancellation receipts can increase storage volume.
- Receipt presence indicates observed invocations, not complete tool coverage.
- Missing-identifier and write-failure receipts use random identifiers; redelivery can repeat these diagnostic counts.
- Producer failure and truncation checks indicate possible missing responses, not necessarily a collector fault.
- The 13-month retention applies to D1 usage records. It does not apply to Workers Logs or AI Gateway metadata.

## Owner data stays outside the repository

The owner keeps production snapshots, audit exports, and the Sites publication copy in private
directories outside this repository. This repository works without them.

Never commit production counts, request identifiers, or account hashes. Public tests use explicitly
synthetic fixtures. Import historical snapshot JSON into D1 with a bound parameter through the
Cloudflare API. `scripts/check-private-usage.mjs` runs in the pre-commit hook and in CI. It refuses
known snapshot and export shapes, but prose still needs review.

Cloudflare references:

- [Tail Workers](https://developers.cloudflare.com/workers/observability/logs/tail-workers/)
- [Tail handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/tail/)
- [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
