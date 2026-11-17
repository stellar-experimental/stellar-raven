# Item 3.1: blocking question for the orchestrator (2026-11-17)

The per-operation and cap fields live only in Workers Logs, and agentpc cannot read them.

- Probe: `POST /accounts/{id}/workers/observability/telemetry/query` with the agentpc Wrangler OAuth
  token returns **403 Forbidden**. The Cloudflare API MCP on agentpc refuses with "needs additional
  permissions (scope: ... workers-observability.write) — run /mcp to re-authenticate".
- What does work on agentpc: the D1 usage report (30 days, counts by tool, surface, access mode)
  and GraphQL `workersInvocationsAdaptive` (30 days, invocation status and wall-time quantiles).
- Workers Logs keep at most 7 days (`docs/operations.md`), so the per-operation read is
  the last 7 days whatever the credential path. A delay moves that window forward; it does not
  block the 30-day sources.

Choose one (plan step "Needs" 1):

- (a) Recommended: an account API token with only "Workers Observability: Read" (plus "Account
  Analytics: Read" if required), short expiry, in a mode-600 file on agentpc at
  `~/.config/raven/cf-observability-read.token`. Executor reads it with curl and never prints it.
- (b) The owner re-authenticates the Cloudflare API MCP on agentpc with the observability scope
  (`/mcp` in a Claude lane; one browser step).
- (c) You run the Workers Logs queries on the Mac from a script this item puts in
  `tmp/3.1/` on agentpc, and send back the output path.

Until you answer, the lane runs the plan review and the two 30-day sources, then waits.

Also confirm the reporting split: committed `REPORT.md` without production figures; figures in
`/home/tyler/code/raven-wt/np-3.1/tmp/3.1/FIGURES.md` on agentpc for the private evidence folder.

**Answer (orchestrator, 2026-11-17): (c).** The Mac's Cloudflare OAuth token reaches the telemetry
query endpoint. The lead wrote `tmp/3.1/workers-logs.mjs` (env `CF_TOKEN`, `CF_ACCOUNT`; output
`./workers-logs-out/`); the orchestrator runs it once and returns the output to agentpc. Reporting
split confirmed.
