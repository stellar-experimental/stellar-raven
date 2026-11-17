# Item 3.1 plan: read production once

Lead: Claude Opus 5.5, agentpc `t1s6`. Worktree `/home/tyler/code/raven-wt/np-3.1`, branch
`np/3.1-production-read`, from `main` at `4a0534f9`. Revised after the Fable review
([REVIEW.md](REVIEW.md)); the reconciliation is at the end.

## Decision this item changes

1. The four caps in the TODO section "Read the free telemetry before changing four caps": public
   `MAX_SEARCH_LIMIT` (50), Lumenloop and Scout per-call timeouts (none today), the artifact caps
   (`ARTIFACT_INFO_CAP` 8, `ARTIFACT_READ_CAP` 4), and `EXECUTE_TIMEOUT_MS` (60 s).
2. Decision 6(b): whether production shows demand for a Dashboard lumens API source or a release
   and package-version source.
3. Which product item comes next, with application development and audits read first.

The item ends in edits to `.agents/TODO.md`, this folder and the round ledger. It changes no code.
A cap change the read supports is recorded as a decision and ships in its own item (3.2 for
timeouts; a separate reviewed change for the model-facing `MAX_SEARCH_LIMIT` text).

## Facts re-checked on 2026-11-17

- Constants: `MAX_SEARCH_LIMIT = 50` and `DEFAULT_SEARCH_LIMIT = 10` (`src/catalog/search.ts:191-192`),
  `EXECUTE_TIMEOUT_MS = 60_000` (`src/executor/run.ts:301`), `ARTIFACT_INFO_CAP = 8`,
  `ARTIFACT_READ_CAP = 4` (`src/executor/providers.ts:106`). Stellar Docs has a 24 s operation
  budget (`src/adapters/stellar-docs.ts:36`); Lumenloop and Scout have none.
- Workers Logs keep at most 7 days (`docs/operations.md`, "Data retention"). The per-operation
  and cap fields come from the retained 7 days; the 30-day window comes from D1 and GraphQL.
- Query, code, result and answer text are not logged (`ARCHITECTURE.md` §9). Question areas are
  read only from proxies: `op` ids, `skill_read` ids and search `top` ids.
- The Playground shares the runner (`src/demo/tools.ts`), so `op`, `skill_read`, `artifact_read`
  and `codemode` searches mix `/mcp` and Playground traffic unless split by path.
- Access: agentpc reads D1 (Wrangler `d1` scope), GraphQL `workersInvocationsAdaptive` and
  `wrangler deployments list`. It cannot read Workers Logs (403). Orchestrator answer (c): the
  orchestrator runs `tmp/3.1/workers-logs.mjs` once on the Mac and returns its output to
  `tmp/3.1/workers-logs-out/`. (Cloudflare names the needed permission "Workers Observability"
  Write even for these reads.)

## Windows

- **W7**: the script's window, the full 6-hour UTC slices inside retention at run time, recorded
  in `workers-logs-out/manifest.json` (`window.fromMs`, `toMs`).
- **W30**: the 30 days ending at W7's `toMs`. Sources: D1 usage, GraphQL.
- **Regimes inside W7.** Record the deploy times from `wrangler deployments list` and the merged
  PRs behind them. `986ffbaa` (11-15: seven cards, `stellarOrg` added) changes `responseChars`, the
  meaning of a null `requestedLimit` and `stellarOrg` volume mid-window. Cap 1's size figures and
  `stellarOrg` volume are read from the slices after the deploy that shipped it; state how many
  days that covers. Counts that a deploy did not change are read over all of W7.

## Steps

Raw output stays in `/home/tyler/code/raven-wt/np-3.1/tmp/3.1/` (ignored by `/tmp/` in
`.gitignore`, mode 700). Nothing in it is committed.

1. **D1, W30** (`node scripts/usage-report.mjs` for receipts and canary, plus read-only
   `npx wrangler d1 execute stellar-raven-usage --config usage/wrangler.jsonc --remote --json`
   SELECTs): tool responses per tool, surface and access mode; distinct OAuth accounts; per-day
   volume; receipt gaps, `usage_receipts.outcome` (cancelled invocations) and the last canary.
   Also, in SQL that returns no hash: the API-key share of tool responses over W7's days, and the
   largest single OAuth account's share of W7 tool responses (`MAX(n) / SUM(n)` over a grouped
   subquery).
2. **GraphQL, W30**: invocations by status, including `clientDisconnected`; wall-time P50, P99,
   P999 by status. Context for cap 4; it cannot split by path.
3. **Deploy times** in W7: `npx wrangler deployments list --name stellar-raven-codemode`.
4. **Workers Logs, W7**: the orchestrator's run of `tmp/3.1/workers-logs.mjs`. It discovers keys
   for every event family, takes types from discovery, stops before the slice loop when a key a cap
   depends on is missing, and stops when `search`, `execute` or `op` are absent. Queries: per-slice
   counts, threshold counts for tails, per-slice percentiles (reference only), user-agent groupings
   and request-id joins (all in the script's comments).
5. **Summarise** with a script `tmp/3.1/summarise.mjs` that refuses any query with a failed slice
   (ask the lead for a one-slice re-run) and sums counts across slices. API-key traffic: if D1's
   API-key share of W7 tool responses is under 5%, read unsplit; otherwise exclude API-key
   requests by joining `join-mcp-access` on request id, including for `op`. Playground traffic is
   split out by path wherever app rows carry the path; otherwise say the figure mixes both.
6. **Per client**: software family from the user-agent (Claude Code, Codex, Grok, Claude.ai
   connector, Cursor, OpenCode, other, unknown). Fold a family with fewer than 3 distinct clients
   (from `client-distinct`, when present) into "other". A null `clientHash` is "unattributed" and
   is never split by user-agent. Report families only; raw user-agent strings stay in tmp.
7. **Question areas**: map each `op` id, `skill_read` id and search `top` id to an area in a tmp
   map: application development, audits and security, ecosystem and projects, network and asset
   data, content and news, protocol history, other, and **shared** for an id that serves more than
   one (for example `stellarDocs.*` and `skills.stellar-dev.smart-contracts`). Report application
   development and audits first: volume, error and soft-empty rates, and the ops that carry them.
8. **Decide** by the rules below. Write `tmp/3.1/FIGURES.md` (every number, the windows, the
   `abr_level` per query, the deploy regimes, the caveats). The executor writes the decisions,
   without production figures, into `EXEC.md`; the lead's `REPORT.md` carries them to the
   orchestrator.
9. **Edit the repo**: the TODO cap section gets one recorded decision per cap and keeps only the
   remaining ship work (its "default 5, max 50" text is corrected); the 6(b) lines in "Add a release
   and package-version source" and the source-test item get the outcome; "Priorities" names the
   next product item; the round ledger gets the 3.1 row.

## Decision rules, fixed before the read

Thresholds are design constants, not production figures, and may be quoted in the repo. Sizes are
characters (`responseChars` is UTF-16 length), not bytes.

- **Cap 1, `MAX_SEARCH_LIMIT`.** Lower the public limit to 10 (keep 50 inside `execute`) if at most
  5% of top-level searches after the seven-card deploy request more than 10, and no client family
  with at least 20 searches (and at least 3 distinct clients, where computable) requests more than
  10 on a majority of its searches. Otherwise keep 50. The model-facing text change is its own
  reviewed change.
- **Cap 2, per-call timeouts.** On `outcome = "ok"` calls only, per Lumenloop and Scout operation:
  timeout = the smallest of 10, 15, 20, 24 s for which at most 1% of ok calls exceed half of it.
  An operation under 20 ok calls takes its adapter's largest value. If more than 1% of ok calls
  exceed the chosen value, record a question for 3.2, not a value. State the censoring: a call still
  pending when the sandbox hits 60 s never logs an `op` event, so hung calls are missing from the
  tail; `op` `ms` also includes host queueing.
- **Cap 3, artifact caps.** Keep 8 and 4 if no `info-cap` or `read-cap` refusal occurred in W7, and
  record the `readCount` headroom. Any refusal: record "reached" and leave a TODO item to read the
  affected runs; no change from this read alone.
- **Cap 4, `execute` timeout.** T = `execute` with `ok = false` over 59 s, plus `POST /mcp`
  invocations over 59 s wall time with a cancelled or disconnected outcome (clients that gave up).
  S = `execute` with `ok = true` over 55 s (runs a 55 s limit would newly kill). Keep 60 s if T is
  zero; lower to 55 s (for 3.2) if T is at least S; otherwise keep 60 s and record both. Report how
  much of T falls in requests where an `op` exceeded 10 s, since a per-call timeout (cap 2) would
  have ended those first.
- **Next product item.** Rank the open product items (3.2, 3.3, the release source, a Dashboard
  source, an other-chain source, the HackMeridian triage bullets) by the W7 evidence that touches
  them: error and soft-empty volume on the ops they fix, failed `execute` without any operation
  (script failures), client 401 or 404 loops, `recoveryHint` on ok executes, Playground
  `finishReason`, and the share of application-development and audit traffic they serve. Recommend
  one; the owner or orchestrator confirms. A single account holding the majority of W7 tool
  responses makes cap 1 and this ranking "not decided: one account".
- **6(b).** The Dashboard lumens API has no proxy here (`stellarOrg` is two generic operations and
  arguments are not logged): record "not measurable from telemetry". The release proxy is an upper
  bound only (`scout.searchResearch` volume, which the server instructions drive for history, and
  search `top` containing `scout.getChangelog`); silence there is "no measured demand", not
  absence. Cite the committed evidence that can decide 6(b) (the 1.3 classification, the
  HackMeridian probes Q5, R23, R33, R35) and say whether the read added anything.

## Gates

`npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`, run bare. The
pre-commit hook runs `scripts/check-private-usage.mjs`. The lead reads the full diff for any
production figure, hash, Ray ID or request ID before pushing. The skill asks for Ray IDs in the
ledger; `usage/README.md` forbids committing request identifiers, and this item follows the
stricter rule.

## Stop rule

One read of each source over its window. A re-query only repairs a failed slice (the script's
`ONLY`/`SLICE` mode). A source that cannot be read records its decisions as "not read", and the item
still finishes with what the others decide.

## Risks

- W7 may be too small for some operations; the rules handle low volume.
- The owner's OAuth traffic cannot be told apart from other users (`usage/README.md`).
- User-agent families can be wrong or absent; report "unknown" rather than guess.
- Platform wall-time units are taken from the key the script resolved (`manifest.resolved.pWall`);
  check them against the GraphQL wall times before using the platform thresholds.
- The telemetry API stores each query's `queryId` (not `dry`); nothing else is written.

## Needs

Done: the orchestrator runs the Workers Logs script on the Mac (answer (c)) and confirmed the
reporting split (committed `REPORT.md` without production figures; figures in
`tmp/3.1/FIGURES.md` for the private evidence folder).

## Review reconciliation

| # | Finding | Disposition |
|---|---|---|
| 1 | Token permission is "Write" | Moot after answer (c): the Mac token works. Noted under Facts and in the script header. |
| 2 | `keys` body shape | Adopted: `from`/`to` top level. |
| 3 | No key/type preflight | Adopted: discovery for every family, discovered types, stop on missing critical keys or absent core events, `source` fallback grouping, non-null sibling groupings. |
| 4 | API-key and Playground split | Adopted: D1 decides the API-key rule; request-id joins run unconditionally, including `op`; path groupings for `op`, `skill_read`, `artifact_read`, `execute`, `search`. |
| 5 | Missing queries | Adopted all: platform wall time and outcome, `resultOriginalChars` 6,000/16,000/18,000/24,000 and `resultReturnedChars` 20,000, failed `execute` by operation total, `recoveryHint` presence, `demo-chat` `finishReason`, platform user-agent/method/status and `auth_reject`, `artifact_read` `readCount`, `skill_run`, search `hits`, `op` thresholds 7,500 and 12,000, `op-pct` by id and outcome. |
| 6 | Cap 4 rule | Adopted (T and S rule). |
| 7 | Cap 2 rule | Adopted (ok-only, grid, guard, censoring). |
| 8 | W7 regimes and window | Adopted: deploy times recorded; cap 1 sizes after the seven-card deploy; W30 ends at W7's end. |
| 9 | API-key unit | Adopted: D1 tool-response share. |
| 10 | Concentration | Adopted: family thresholds and the single-account share in SQL. |
| 11 | Family guards | Adopted. |
| 12 | 6(b) and area honesty | Adopted: "not measurable" for the Dashboard, upper bound for release, a shared area, committed evidence cited. |
| 13 | Output handling | Adopted: refuses a git work tree, 0700/0600, failed slices recorded and refused by the summariser, one-slice re-run mode, adaptive splitting for user-agent and join groupings. The orchestrator asked for `./workers-logs-out/` under the cwd, so the path stays fixed. |
| 14–19 | Nits | Adopted: characters, `REPORT.md` only, stricter identifier rule, TODO text fix, account-id fragment dropped, `dry` noted. |
