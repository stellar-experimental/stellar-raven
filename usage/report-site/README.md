# Private usage report

Public source code for the owner's private Sites dashboard (`.openai/hosting.json` holds the project ID; no production data lives here). Both the report API and Sites responses send `Cache-Control: no-store`. The browser never receives DB credentials or account IDs; `/report` and `/launch` require the independent `REPORT_TOKEN` bearer secret and refuse expired snapshots.

## Data

See [`usage/README.md`](../README.md) for collection, retention, and [the data boundary](../README.md#owner-data-stays-outside-the-repository). The CLI and API share `cloudflare/queries.js`. Never sum distinct account counts across months. Commit synthetic test fixtures only. Apply migration 0003 before deploying the report API or collector, and import trusted operator-generated launch JSON into D1 privately with bound parameters.

## Development and release

Run `npm test`, `npm run check`, and `npm run build` here. Copy `env.example` to gitignored `.env` for local settings. Configure `USAGE_REPORT_URL` and secret `USAGE_REPORT_TOKEN` in Sites, and `REPORT_TOKEN` on the report Worker (never reuse a Cloudflare or MCP token).

Land changes via Raven PRs; see [`usage/README.md`](../README.md#dashboard) for sync/publish steps and fork setup. After publishing, confirm owner-only access, authenticated dashboard/launch loads, and unauthenticated API rejection.
