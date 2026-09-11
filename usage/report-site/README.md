# Raven usage report

Raven's `usage/report-site/` is the canonical source for this private dashboard.
Change it through a Raven pull request. The separate Sites checkout is a publication copy.
The page refreshes every minute.
It shows monthly and daily `search` and `execute` response counts, distinct active accounts,
API-key attribution, collection checks, CSV export, and a separate historical estimate.

`/launch` shows a dated launch-to-date report through September 11, 2026 at 15:14:22 UTC.
It combines all recoverable evidence without presenting partial tool counts as lifetime totals.
`/launch.csv` and `/launch-report.md` export the same snapshot.
The request series covers July 2 onward. It measures all Worker activity, not answers or people.
The launch report is a fixed snapshot; the original monthly dashboard continues to refresh.
Source aggregates and verification notes are in `evidence/`. The build derives report assets from
`public/launch-data.json` through `src/launch.js`.

## Data and access

The Sites access policy limits the report to its owner. The Sites Worker proxies a fixed
aggregate endpoint through `USAGE_REPORT_URL` and the secret `USAGE_REPORT_TOKEN`.
Neither the browser nor the Sites source receives Cloudflare credentials or account hashes.

The separate `stellar-raven-usage-report` Worker uses the existing `stellar-raven-usage` D1 binding.
Its only endpoint, `GET /report`, requires the independent `REPORT_TOKEN` secret.
The code executes four fixed SELECT queries. It accepts no SQL or date parameters.
The D1 binding itself supports writes; read-only access is enforced by this Worker's code.
This Worker does not change the Raven producer, collector, retention, or database schema.

The endpoint caches aggregate results for 60 seconds after authentication. It returns only counts
and collection timestamps. It returns no pseudonymous identifiers. The Sites server keeps its
connection token private and never forwards user-supplied URLs, headers, or query parameters.

## Metric contract

The CLI and report API share `cloudflare/queries.js`.
Counts include logged handler responses, including errors and refusals.
They exclude authentication rejection, input validation errors, and failures before a response log.
They do not measure correctness or confirm delivery.
Combined accounts use COUNT DISTINCT across both sources. Daily or monthly distinct counts
must never be summed to obtain unique accounts over a larger period.
An absent monthly row with receipt coverage means zero archived responses for that source.
An absent monthly row without receipt coverage means unavailable data.

Retention covers the current UTC month and the previous twelve. The collector controls deletion.
The archive began September 11, 2026 at 14:34:59 UTC. The first possible full month is October.
The report checks hourly canary coverage against Raven's minute-7 schedule, with ten minutes
of ingestion tolerance. Coverage checks cannot prove lossless response collection.

The historical panel shows rounded, partial MCP estimates from Raven's committed
`research/audits/2026-09-11-usage-history.md`. The 167-hour window ends before archive collection.
It is not added to archive totals or CSV exports. July and August were not recovered.

## Development

No package dependencies are required. Node.js 22 or later is sufficient.

```sh
npm test
npm run check
npm run build
```

`build.mjs` bundles the three public assets into a Cloudflare Worker under `dist/server/index.js`.
Sites owns the private deployment. Its manifest is `.openai/hosting.json`.
Set the two production environment values with the Sites connector before publishing.
Copy `env.example` to `.env` for local development values. Git ignores `.env`.

Deploy the aggregate endpoint from the Raven checkout, which has Wrangler installed:

```sh
npx wrangler deploy --config usage/report-site/cloudflare/wrangler.jsonc --profile sdf
```

Configure `REPORT_TOKEN` with Wrangler's secret command. Generate an independent random token.
Use the same value for the Sites secret `USAGE_REPORT_TOKEN`. Never use an MCP or Cloudflare token.
Rotate both values together. A missing token blocks access. Deploy Sites after environment changes.
To remove the dashboard, disable the Sites deployment and delete only the report Worker.
Keep the usage collector and database intact.

## Collection checks and release

Apply `usage/migrations/0002_collection_health.sql` before deploying the collector and report API.
The report includes interrupted invocations, missing response identifiers, and failed write counts.
Older receipts have an unknown outcome. A complete database outage cannot record its own failure.
The hourly GitHub usage-health workflow checks recent receipts and the hourly canary.
Configure its `USAGE_REPORT_TOKEN` secret with the aggregate endpoint token.
The producer postdeploy check verifies the tail attachment and the daily cleanup schedule.
Tail delivery remains best effort. A canceled invocation can contain a computed response that never reaches its client.
Transactions contain up to fifty statements; a failed transaction can separate responses from their receipt.
Failure diagnostics report this risk; collection checks do not prove complete delivery.

After the Raven PR merges, fetch main and run `node scripts/sync-usage-site.mjs <Sites checkout>`.
The script rejects independent changes in the publication copy. Build and publish that reviewed copy through Sites.
Verify the private dashboard loads, its API returns 200, and the launch report retains its dated evidence.
