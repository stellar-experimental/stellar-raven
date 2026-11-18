# Item 7.3, PR 1 report: routine dependency patches

Lead: Claude Opus 5.5, agentpc `t1x8`, 2026-11-18.

## Pull request and result

[#480](https://github.com/stellar-experimental/stellar-raven/pull/480), branch `np/7.3-deps-routine`,
on `origin/main` `a0156b2b`. Squash or merge as usual; nothing pins its SHAs.

What it takes:
- `ai` 7.0.176 and the `@ai-sdk/*` patches;
- `workers-ai-provider` 4.0.1;
- `acorn` 8.19.0;
- `@cloudflare/workers-oauth-provider` 0.10.4, which is inert for Raven;
- the `@cloudflare/workers-types` and `@types/node` patches.

The lockfile changes 14 entries, adds none and removes none.

Evidence:
- **Playground requests.** Five transports were captured at the AI binding with production slugs,
  before and after. The only change is the SDK `user-agent` version.
- **MCP surface.** Unchanged.
- **`npm audit`.** Same as `origin/main`.
- **Gates.** All green locally on Node 26. CI on Node 24 is the gate of record.
- **Reviews.** Fable plan review: 3 blocking and 5 further findings, all adopted. Codex `gpt-6-astra`
  high diff review: PASS, 3 minor findings and 2 notes, all on the records and all reconciled.

USD 0.

Two scope moves:
- `@modelcontextprotocol/sdk` 1.32.2 moved out: `agents@0.28.1` pins it exactly.
- `esbuild` 0.28.2 moved out: it moves 54 entries between the copies that wrangler and the pool pin.

## Deploy

**Needed.** Worker bytes change. The bundle grows by 205 KB, from the AI SDK packages' own growth.

Deploy pre-check items:
- **Not MCP-model-facing.** The `mcp:surface` hashes are unchanged.
- **Playground model requests.** These are model-facing for the demo. Captured before and after, no
  field changed except the SDK `user-agent`. Not covered: Grok with the effort unset, and the OpenAI
  `parallel` wrapper replay.
- **Accepted response-side change.** `@ai-sdk/openai` 4.0.110 parses refusals. A refused Playground
  primary turn now shows the refusal text with finish reason `content-filter`. Before, the turn came
  back empty and the Playground fell back to Haiku.

## For the orchestrator on the Mac

Merge after CI, then deploy. Then reply here, and I start the next PR from the new `origin/main`.

## Next PRs (revised order)

The plan review showed that `agents@0.33.0` pins `@modelcontextprotocol/client` and `/server` at 2.4.0
and `@modelcontextprotocol/sdk` at 1.32.2, all exact peers. So the note's rows 2 (`agents`) and 3
(MCP SDK) become **one PR (PR 2)**. Then come wrangler with the pool, miniflare and `esbuild` (PR 3),
and oauth-provider 1.x (PR 4). `vitest` 5 is recorded only.

Early notes on PR 2 from the `agents` changelog:
- 0.31 makes the MCP packages optional peers. Raven must list `@modelcontextprotocol/sdk` as a
  runtime dependency, because `agents/mcp` imports it. 0.31 also adds an `agents/mcp/server` entry for
  `createMcpHandler`.
- 0.31 passes oauth-provider 1.x's verified `ctx.auth` to tool callbacks. That couples to PR 4.
- 0.32 marks the package side-effect free, which should shrink the bundle.
- 0.32 includes the `createAI` work. I will re-run the `cs-010` repro for the TODO
  `workers-ai-provider` item, free and local, if it needs no paid call.

## Open questions for the owner

None.
