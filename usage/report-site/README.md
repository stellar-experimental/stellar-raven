# Private usage report

This directory contains public source code, not production usage data.
The owner's private Sites deployment renders current aggregates and historical snapshots
from the authenticated report API. `.openai/hosting.json` holds its hosting project ID.
The browser receives no database credentials or account identifiers.
The report API requires its independent `REPORT_TOKEN` before every query.
Both API and Sites responses use `Cache-Control: no-store` for private data.

## Data

[`usage/README.md`](../README.md) defines what the archive counts and how long it keeps it.
The CLI and API share `cloudflare/queries.js`. Distinct account counts must not be added across months.
Historical snapshots have an explicit expiry. They remain separate from exact archived response records.

Only synthetic test fixtures belong in this directory.
[`usage/README.md`](../README.md#owner-data-stays-outside-the-repository) defines the data boundary.
Apply migration 0003 before deploying the report API or collector. Import trusted operator-generated launch JSON into D1 privately with bound parameters.
The fixed `/launch` endpoint requires the same authentication as `/report` and refuses expired snapshots.

## Development and release

Run `npm test`, `npm run check`, and `npm run build` in this directory.
Copy `env.example` to `.env` for local settings. Git ignores `.env`.
Sites uses `USAGE_REPORT_URL` and secret `USAGE_REPORT_TOKEN`; configure them through Sites environment settings.
The report Worker uses secret `REPORT_TOKEN`. Never use a Cloudflare or MCP token for this connection.

Change source through a Raven pull request.
[`usage/README.md`](../README.md#dashboard) gives the publication steps and the fork setup.
After each publication, confirm the owner-only access policy, authenticated dashboard refresh, launch report, and unauthenticated API rejection.
The hourly health workflow checks canary freshness and possible collection gaps. Tail delivery remains best effort.
