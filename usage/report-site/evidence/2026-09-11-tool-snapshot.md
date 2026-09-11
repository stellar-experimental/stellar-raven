# Tool snapshot verification

Cutoff: 2026-09-11T15:14:22.382Z.

The historical input is the committed Raven audit at
`research/audits/2026-09-11-usage-history.json`, revision
`8279fc6d3c636d88a00ed54332561d33255178f1`.

The additional retained-log window is September 11, 14:00:00–14:34:59 UTC.
Cloudflare dataset: `cloudflare-workers`; Worker: `stellar-raven-codemode`.
Filters: `$metadata.service = stellar-raven-codemode`, `$metadata.type = cf-worker`.
The event aggregate returned `execute = 11`. The `evt = search` query returned `source = tool: 6`.
Both queries used `dry: true`, `chartType: aggregate`, `view: calculations`, and both limits at 2000.
Both returned ABR 1 and sampleInterval 1. These are log estimates, not delivery acknowledgements.
Query runs: `90f9sim300qh38yoa4o5r04c` and `z2cbiougsg6dabyabrks76k7`.

The production D1 snapshot used `reportSql('2026-07', '2026-10')` from Raven's
`scripts/usage-report.mjs`, replacing the exclusive end bound with the cutoff above.
The MCP and combined rows both returned search 6, execute 7, total 13, unique_accounts 3,
api_key_responses 2, dev_responses 0, and unattributed_responses 0.
There was no playground row.

The first archive receipt is 14:34:59.490 UTC. The half-second boundary after the extra log window
remains unverified. No claim of continuous or lossless tool-response coverage is made.
No account identifiers, query bodies, answer text, request headers, or credentials were exported.

The lower bound across windows is the maximum observed distinct count, 61. It is not their sum.
MCP response counts from the disjoint windows total an estimated 1,243 search and 1,394 execute responses.
The public headline rounds the combined 2,637 to about 2,640.
