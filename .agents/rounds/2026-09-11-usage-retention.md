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

Pending collector deployment, producer attachment, and production receipt verification.
