# Raven launch-to-date report

Period: July 2, 2026 through 2026-09-11 15:14:22 UTC.

Complete lifetime tool-response and active-account totals are unavailable.
Cloudflare returned approximately 881,218 Worker requests across the full period.
Worker requests include website traffic, protocol traffic, checks, automation, and tool traffic.
They do not measure answers or people.

| Month | Estimated Worker requests | Tool-response history |
|---|---:|---|
| 2026-07 | 96,910 | Unavailable |
| 2026-08 | 576,060 | Unavailable |
| 2026-09 | 208,248 | Partial: September 4 onward |

## Recovered tool responses

The available MCP evidence contains approximately 1,243 search and 1,394 execute responses.
This is approximately 2,637 MCP responses, with at least 61 active accounts.
These values cover the recovered September windows, not the full launch period.
The separate playground evidence contains 143 search and 53 execute responses.

| Evidence | From UTC | To UTC, exclusive | Search | Execute | Accounts |
|---|---|---|---:|---:|---|
| Recovered logs · MCP (estimate) | 2026-09-04 15:00:00 UTC | 2026-09-11 14:00:00 UTC | 1231 | 1376 | At least 61 |
| Recovered logs · playground (estimate) | 2026-09-04 15:00:00 UTC | 2026-09-11 14:00:00 UTC | 143 | 53 | Unknown |
| Additional logs · MCP (estimate) | 2026-09-11 14:00:00 UTC | 2026-09-11 14:34:59 UTC | 6 | 11 | Unknown |
| Retained archive · MCP (recorded) | 2026-09-11 14:34:59 UTC | 2026-09-11 15:14:22 UTC | 6 | 7 | 3 |

## Limits

- Tool totals before September 4 at 15:00 UTC are unavailable.
- Account counts cannot be added across windows because accounts can recur.
- Historical log queries disagree slightly; historical counts remain estimates.
- The additional log window stops at 14:34:59.000 UTC. The first archive receipt is 14:34:59.490 UTC; this half-second boundary remains unverified.
- Historical event joins classified 1,320 API-key, 1,277 OAuth, and 8 unjoined responses.
- The archive includes the four verification responses recorded during collector deployment.

## Sources and checks

- [Launch date](https://github.com/stellar-experimental/stellar-raven/blob/8279fc6d3c636d88a00ed54332561d33255178f1/README.md).
- [Cloudflare request metric](https://developers.cloudflare.com/analytics/graphql-api/tutorials/querying-workers-metrics/).
- Historical tools: stellar-raven research/audits/2026-09-11-usage-history.md and matching JSON.
- Additional tools: September 11 14:00–14:34:59 UTC; Cloudflare app logs, ABR 1, sample interval 1.
- Archive: production D1, response timestamps before the report cutoff.
- Request queries use workersInvocationsAdaptive, scriptName stellar-raven-codemode, and exclusive end times.
- Three monthly queries returned 30 July dates, 31 August dates, and 11 September dates.
- Daily sums matched independent monthly aggregate queries. Sampling can still affect these estimates.

The live monthly dashboard continues to refresh. This launch report is a dated snapshot.
