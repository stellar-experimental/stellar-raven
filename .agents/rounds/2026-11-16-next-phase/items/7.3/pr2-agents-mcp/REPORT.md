# Item 7.3, PR 2 report: `agents` 0.33.0 with the MCP packages

Lead: Claude Opus 5.5, agentpc `t1x8`, 2026-11-18.

## Pull request and result

PR: [#482](https://github.com/stellar-experimental/stellar-raven/pull/482), branch
`np/7.3-deps-agents-mcp`, on `origin/main` `0683d266`. There are four commits: the import switch, the
version bump and records, the review reconciliation, and the ledger row. Squash-merge is fine.

What changed:
- **Versions.** `agents` 0.33.0, `@modelcontextprotocol/server` and `/client` 2.4.0,
  `@modelcontextprotocol/sdk` 1.32.2. All are exact pins.
- **Upstream stateless entry adopted.** `createMcpHandler` now comes from `agents/mcp/server`. It is
  the same function Raven already reached through `agents/mcp`.
- **Bundle.** 9.22 MB to 7.00 MB. The Worker no longer bundles 28 `agents` modules (the Agent and
  Durable Object runtime, email, scheduler), SDK v1, the MCP client or `ajv`.

Evidence:
- **Wire.** Identical for unchanged old clients in both MCP eras, baseline against upgraded (local
  `npm run dev`, free). New clients are identical too.
- **Surface.** `mcp:surface` is byte-identical.
- **Audit.** `npm audit` is the same as `origin/main`, and there is one `workerd`.
- **Gates.** All green locally.

Reviews:
- Fable plan review: 3 blocking and 6 further findings, all adopted.
- Codex `gpt-6-astra` (high) security review: PASS, 2 notes, reconciled.

USD 0.

## Deploy

**Needed.** Worker bytes change, and the bundle is 2.2 MB smaller.

- **Model-facing?** No. The `mcp:surface` hashes and the `tools/list`, `initialize` and
  `server/discover` bodies are identical.
- **Before the deploy:** the AGENTS.md pre-check (the ledger of any active eval round that holds
  deploys).
- **After the deploy:**
  - run `node research/audits/2026-11-06-remaining-sweep/live-host-check.mjs <credential-file> <out.json>`.
    It is free, uses no model, and covers both wire eras on all three hosts;
  - check a connector search.
- **Rollback** to `35c3b860` if either check fails, or if a real client (Claude, ChatGPT, Cursor)
  reports a connection failure. Those clients are seen only in production.

## For the orchestrator on the Mac

1. Merge after CI, then deploy and run the two checks above.
2. **Pre-existing failures, not from this PR.**
   - The two `test/live/` suites fail against a local server: 3 execute checks and spec-search case 4.
   - The failures are identical on `origin/main` `0683d266`.
   - They are filed as a TODO item ("Repair the `test/live/` suites against current code", Eval
     instruments).
   - Its owner and priority are your call.

## Next

PR 3: `wrangler` 4.153 to 4.164, with `@cloudflare/vitest-pool-workers`, the pinned miniflare and
`esbuild` 0.28.2. I start it from the new `origin/main` after your reply.

PR 4: oauth-provider 1.x carries the security note from this review. `agents` 0.33.0 reads
`ctx.auth` once 1.x sets it. Before Raven relies on it, PR 4 must check what 1.x writes there.
Artifact ownership must stay on the host-side `ctx.props` path.

## Proposal for the owner, not started

**Publish Raven's pinned ecosystem skills through the MCP Skills extension** (SEP-2640, SDK 2.4).
This would give clients native skill listing and reading. Its `attach` is experimental, and the new
client-visible surface falls under ADR-0003. It would need an owner decision, a design study and a
measured A/B.

## Open questions for the owner

None blocking.
