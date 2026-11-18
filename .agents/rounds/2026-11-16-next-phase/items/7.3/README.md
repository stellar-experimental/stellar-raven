# Item 7.3: dependency updates

Lead: Claude Opus 5.5, agentpc `t1x8`. Bound by the orchestrator's `7.3-NOTE.md` and `7-COMMON.md`
(2026-11-17). Owner answer (DECISIONS.md, "Follow-up answers (2026-11-17, after item 6.3)"):
"sounds good, research, review, test and eval and decide and execute what sticks".

One pull request per risk class, in order. Each starts from the `origin/main` that the previous one
merged into. Each has its own folder (PLAN, REVIEW, EXEC, REPORT).

| # | Class | Folder | Status |
|---|---|---|---|
| 1 | Routine in-range patches | [pr1-routine](pr1-routine/) | merged, #480, deployed `35c3b860` |
| 2 | `agents` 0.28.1 to 0.33.0, with `@modelcontextprotocol/server` and `/client` 2.3.1 to 2.4.0 and `@modelcontextprotocol/sdk` 1.32.1 to 1.32.2 | [pr2-agents-mcp](pr2-agents-mcp/) | merged, #482, deployed `fe3708cb` |
| 3 | `wrangler` 4.153 to 4.164, the vitest pool, miniflare and `esbuild` 0.28.2, and the move from the deprecated pool to `@cloudflare/vitest-plugin` | [pr3-wrangler](pr3-wrangler/) | merged, #483, no deploy |
| 4 | `@cloudflare/workers-oauth-provider` 1.x | [pr4-oauth](pr4-oauth/) | merged, #484, deployed `9f01ae3e` |
| 5 | `vitest` 4.1.12 to 5.1.0 | [pr5-vitest5](pr5-vitest5/) | executed on `np/7.3-deps-vitest5`; lead review and PR pending |

The orchestrator's rows 2 (`agents`) and 3 (MCP SDK 2.4) are one PR: `agents@0.33.0` pins
`@modelcontextprotocol/client` and `/server` at 2.4.0 and `@modelcontextprotocol/sdk` at 1.32.2 as
exact peers (PR 1 plan review, finding 8). The SDK 1.32.2 bump moved out of PR 1 for the same reason,
and `esbuild` moved to the wrangler PR (finding 2).

Starting state (2026-11-18, `origin/main` `a0156b2b`): `npm outdated` matches item 6.1's table, with
newer patch numbers. `npm audit`: 8 high, all GHSA-fc5q-39xc-vjpf through picomatch (#473).
`mcp:surface`: surface `815333b7…bd07`, instructions `67a6bd0b…6c00`.
