# Raven monthly usage retention

User authority: recover tool-response and distinct-user counts, then add thirteen-month usage retention.
Tool responses include errors and refusals. Correctness is outside the metric.
User identity uses the existing WorkOS-derived pseudonymous hash.

Branch: `codex/monthly-usage-retention`.
Base: `958c2bc`.
Owned Herdr workspace: `w3Q`; owned root pane: `w3Q:p1`.
No reviewer or parallel agent was requested or spawned.

## Work

- Historical findings: `research/audits/2026-09-11-usage-history.md`.
- Implemented a separate tail collector, D1 schema, bounded write retries, deduplication, and monthly reporting.
- Added a thirteen-month usage disclosure and an account deletion procedure.
- Database created in the SDF account: `bbf9bd3d-b80b-4e6c-a03b-d717d1c5e3fe`.
- The producer initially had no tail consumers and had Logpush disabled.
- The SDF Wrangler profile reads producer settings and manages D1.
- Cloudflare MCP queries historical telemetry. The Wrangler OAuth token cannot query that endpoint.

## Validation

The first full suite passed: 111 files and 2,051 tests.
The focused usage, server, and retention checks passed after the disclosure change: 86 tests.
Typecheck passed after creating CI placeholder secret names and regenerating `env.d.ts`.
The main Worker and the usage collector both passed dry-run builds.
The local D1 migration passed.
The CLI report was checked against an empty local database.

The CLI required separate D1 commands for its two report queries.
Wrangler returned only the last result for a multi-statement `--command`; the implementation now separates them.

## Deployment state

PR #151 merged at `2026-09-11T14:33:12Z`.
The merge commit is `5472c078d68499ba63d1b9711874b59eb0debe58`.
GitHub's tests, secret scan, and CodeQL checks passed before merge.
The producer deployment passed the normal clean-tree and `HEAD == origin/main` preflight.

- Collector version: `6e93bc0b-73fa-4204-8a5f-2c0d21228ed9`.
- Producer version: `7d303233-f3e6-4f91-af8c-4f8d07a0eb3c`.
- The live producer settings contain exactly `stellar-raven-usage` as the tail consumer.
- The collector binds the expected private D1 database and has no tail consumer itself.
- The daily cleanup schedule is `17 3 * * *`.
- The live `/terms` page returned 200 and showed the thirteen-month usage disclosure.

## Production acceptance

A normal API-key search and a deliberately failing execute both returned HTTP 200 with MCP results.
The execution result had `isError: true`, as intended.

| Tool | Ray ID | App request ID | Recorded rows |
|---|---|---|---:|
| search | `a3976579cc8deee7` | `4fe0f2db-ef39-424d-b8b5-de07e4bc0202` | 1 |
| execute error | `a397657d7edfb074` | `daa3cb8a-bb2d-477e-89f4-0f023771cf55` | 1 |

Cloudflare telemetry joined those Ray IDs to the app request IDs.
D1 returned exactly one row for each corresponding request prefix, classified as API-key traffic.
Two additional OAuth connector calls exercised search and execute.
The initial monthly report contained four MCP responses and one distinct account.
The two API-key responses did not increase the account count.
The report showed zero unattributed responses and zero truncated invocations.
These four verification responses remain in the archive and are part of the first partial month.

The first receipt timestamp is `2026-09-11 14:34:59 UTC`.
The first full calendar month of collection is October 2026, assuming uninterrupted operation.
The initial check occurred before the next hourly producer canary.
Its first receipt and the first scheduled cleanup remain future scheduled checks.
Retention cutoff tests and the deployed cleanup schedule passed verification.

The collector error query covered `2026-09-11T14:33:00Z` through the verification time.
It filtered service `stellar-raven-usage` and existing `$metadata.error` fields.
It returned zero error-tagged events at ABR level 1.
Private probe receipts and the aggregate live report are under `/tmp/raven-usage-2026-09-11/`.
No credentials, raw account identifiers, or IP addresses were included.
