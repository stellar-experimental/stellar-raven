# Monthly usage reports

Raven records each top-level `search` and `execute` response, including errors and refusals.
The count does not assess correctness or prove that the client received every byte.
Protocol messages, connection checks, internal `codemode.search` calls, and upstream operations do not count.
Playground tool responses appear separately from MCP responses.

A distinct active account has at least one recorded tool response in the selected UTC month.
The collector uses Raven's existing WorkOS-derived `subjectHash`.
It does not use an email address, IP address, browser fingerprint, or OAuth client identifier.
Several clients belonging to one account count as one account.
API keys have no WorkOS identity and never count as people.
Internal tests using an API key remain visible in the API-key response count.
Tests using a real OAuth account cannot be distinguished from that account's other usage.
Rotating `MCP_SERVER_SECRET` can split an account's hash. Record rotations before comparing user counts.

## Storage

`stellar-raven-usage` is a Tail Worker attached to `stellar-raven-codemode`.
It extracts permitted fields from existing logs after the producer invocation finishes.
The collector and the separate aggregate report Worker access the usage D1 database.
The collector exposes no HTTP route or MCP operation.
The report Worker requires its own bearer secret and runs fixed aggregate SELECT queries.
It returns no account hashes. The Sites dashboard adds owner-only access.

`usage_responses` stores one row per response with its log timestamp, tool, surface, access mode,
and optional pseudonymous account hash. An invocation identifier plus log index deduplicates retries.
`usage_receipts` records response counts, log truncation, and the producer's hourly canary.
Neither table stores request headers, queries, answers, code, exceptions, or raw account identifiers.
The collector retries transient database failures three times and reports permanent failures.

The daily cleanup retains thirteen UTC monthly periods: the current month and the previous twelve.
The collector imports `USAGE_RETENTION_MONTHS` from `src/auth/retention.ts`.
Deletion requests also remove the matching account's response rows. See the root README runbook.
D1 recovery copies follow Cloudflare's Time Travel window; repeat requested deletions after any restore.

## Report

```sh
node scripts/usage-report.mjs --from 2026-09 --to 2026-10
```

`--to` is exclusive. The command uses the account in this directory's config. Set `WRANGLER_PROFILE` to pick a
named Wrangler profile; without it Wrangler uses your default login.
Add `--local` to query the local test database.
The JSON output contains MCP, playground, and combined monthly rows.
The combined account count deduplicates users across both surfaces.

Before sharing a report:

- State the actual collection dates. Missing months mean unavailable data, not zero usage.
- Separate API-key response counts from OAuth user activity.
- Inspect unattributed responses and truncated invocations.
- Check the producer canary timestamps and collector errors. A missing canary can signal a collection gap.
- Retain a dated aggregate export when comparing completed months.

This is an operational usage measure. Worker logs and tail delivery are not an exactly-once billing ledger.
Database writes are idempotent, but producer crashes, truncated logs, or undelivered tail events can leave gaps.
The receipt table helps identify gaps; it cannot prove that no event was lost.
The diagnostic Workers Logs still follow Cloudflare's seven-day retention limit.

## Setup and verification

The database and collector use the same SDF account as Raven.
Apply migrations before deploying the collector:

```sh
npx wrangler d1 migrations apply stellar-raven-usage --config usage/wrangler.jsonc --remote
npx wrangler deploy --config usage/wrangler.jsonc
```

Add `--profile <name>` when your Wrangler login for this account is a named profile.

Attach the collector with `tail_consumers: [{ service: "stellar-raven-usage" }]` in Raven's Wrangler config.
Publish the matching usage disclosure before starting collection.
Verify the live producer settings after deployment. Preserve any other tail consumers.
Check a known tool response in both the retained logs and D1, then verify the hourly canary arrives.
Run the monthly report and inspect the collector's logs for failed writes.

To stop new collection, remove only this tail consumer from the producer settings and config.
Preserve the database for the agreed retention period.

## Historical coverage

The report source is maintained under [`report-site/`](report-site/README.md) and reviewed in Raven pull requests.
After merging a report change, sync the reviewed main branch to the separate Sites publication checkout:

```sh
node scripts/sync-usage-site.mjs ~/Desktop/stellar-raven-aux-priv-report
```

Build, validate, and publish that exact copy through Sites. Its `.raven-source.json` records the Raven commit.
Do not edit the publication copy independently. `npm run test:usage-report` and `npm run build:usage-report`
run in CI alongside the collector checks.

The 2026-09-11 investigation recovered partial September usage from retained Workers Logs.
The archive cannot recreate expired July or August tool events.
Historical log aggregates and individual-event queries differ slightly, even with ABR level 1.
Do not import these estimates as exact response rows.
Historical results and query evidence remain in private storage. Do not commit production counts or request identifiers.

The hourly `usage-health` workflow and the `postdeploy` check skip with a notice when the report token or a
Cloudflare credential is absent. They never fail a fork that has not configured its own archive.

## Run your own usage archive on a fork

The public service is operated by the repo owner. A fork gets the full collection and reporting stack and
needs none of the owner's data. Set it up in this order:

1. Put your Cloudflare `account_id` in `usage/wrangler.jsonc` and `usage/report-site/cloudflare/wrangler.jsonc`.
   Create a D1 database named `stellar-raven-usage` and put its `database_id` in both files.
2. Apply the migrations and deploy the collector as shown above. Add `tail_consumers` to your producer config.
3. Deploy the report Worker: `npx wrangler deploy --config usage/report-site/cloudflare/wrangler.jsonc`.
   Set its `REPORT_TOKEN` secret to a fresh random value.
4. Optional dashboard: create your own Sites project and replace `usage/report-site/.openai/hosting.json`
   with its project id. Configure `USAGE_REPORT_URL` and secret `USAGE_REPORT_TOKEN` in Sites.
5. Optional monitoring: set the repository secret `USAGE_REPORT_TOKEN` and the variable `USAGE_REPORT_URL`
   so the hourly health workflow runs. Until then it skips with a notice.
6. Historical snapshots are optional. Skip migration 0003 imports and the `/launch` page shows 404.

## Owner directories outside this repo

The owner keeps two private sibling directories. They are auxiliary; this repo works without them.

| Directory | Holds |
|---|---|
| `stellar-raven-aux-priv-report` (local git, no remote) | The owner's Sites publication checkout. `scripts/sync-usage-site.mjs` refreshes it from clean `main`; it is never edited directly. |
| `stellar-raven-aux-priv-evidence` (local git, no remote) | Production snapshots, audit exports, reviewer verdicts with figures, and the record of the abandoned history rewrite. |

Never commit production counts, request identifiers, or account hashes here. File them in the evidence
directory. `scripts/check-private-usage.mjs` runs in the pre-commit hook and CI and refuses known
snapshot and export shapes; prose still needs review.

Public Git history and PRs #151 through #155 still show earlier copies and figures. The owner decided
on 2026-09-17 not to rewrite that history.

Cloudflare references:

- [Tail Workers](https://developers.cloudflare.com/workers/observability/logs/tail-workers/)
- [Tail handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/tail/)
- [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)

### Audit limits and monitoring

Interrupted invocations are informational. They can contain computed responses that did not reach the client.
Cancellation receipts can increase storage volume.
Receipt presence indicates observed invocations, not complete tool coverage.
Missing-identifier and write-failure receipts use random identifiers; redelivery can repeat these diagnostic counts.
Producer failure and truncation checks indicate possible missing responses, not necessarily a collector fault.
Use `npm run deploy` for the producer; direct Wrangler commands skip its postdeploy check.
The check uses `CLOUDFLARE_API_TOKEN` when supplied, or the local Wrangler `sdf` OAuth profile.

AI Gateway payload collection is disabled, but request metadata remains stored under the gateway configuration.
The gateway uses a configured row-count policy with oldest-first deletion.
This is a row-count policy, not a fixed retention period in days.
This release preserves those existing records. It does not purge evidence or change gateway retention.
The 13-month usage retention applies to D1 usage records, not the separate gateway metadata store.

### Private historical snapshots

Migration 0003 stores historical report snapshots in D1. Import the JSON with a bound parameter through the Cloudflare API.
Each snapshot has an explicit expiry timestamp. The daily collector cleanup deletes expired snapshots.
The report API exposes the launch snapshot only after bearer authentication. Sites renders it at request time.
Keep production evidence outside Git. Public tests use explicitly synthetic fixtures.
