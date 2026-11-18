# Item 7.3, PR 5 report: `vitest` 5.1.0, and the item's close

Lead: Claude Opus 5.5, agentpc `t1x8`, 2026-11-18.

## Pull request and result

[#485](https://github.com/stellar-experimental/stellar-raven/pull/485), branch `np/7.3-deps-vitest5`,
on `origin/main` `b49675e3`.

- **Version:** `vitest` 4.1.12 to 5.1.0.
- **No `src/` or `test/` change.** None of the 13 rows in the migration guide applies to this repo.
- **Cold and warm runs.** Both lanes ran with a cold and then a warm module cache, plus one truly
  cold smoke run. All passed, with counts equal to the baseline: 4190 / 3 / 8, and 173 smoke. The
  plugin bug workers-sdk #16349 did not appear.
- **Worker unchanged.** The bundle and its map are byte-identical.
- **Reviews.** Fable plan review: 1 blocking and 12 more findings, all adopted. Codex `gpt-6-astra`
  high diff review: PASS, no findings.
- **Cost:** USD 0.

**Before merging,** compare the CI counts on Node 24 with the local Node 26 baseline. CI ran 4 more
tests that are environment-gated here, and the total of 4201 is the same. The flake at
`test/qa-judge-evidence.test.mjs:1519` is known: if it fails, rerun once.

## Deploy

**Not needed.** No Worker bytes change.

## The CI flake you asked for

`.agents/TODO.md`, Eval instruments, has the new item "Stabilize the timing-ratio assertion in
`test/qa-judge-evidence.test.mjs`":
- the ratio was 8.41 against `< 8`, on run 44223760712, attempt 1; attempt 2 passed;
- scope: lines 1518 and 1519;
- approach: count work, or take the minimum of several runs;
- done when no assertion in that block compares a single timed sample.

The test is not changed in this PR.

## Item 7.3 is complete

| PR | Change | Deploy |
|---|---|---|
| [#480](https://github.com/stellar-experimental/stellar-raven/pull/480) | AI SDK, `acorn`, oauth-provider 0.10.4, types | Deployed, `35c3b860` |
| [#482](https://github.com/stellar-experimental/stellar-raven/pull/482) | `agents` 0.33.0, MCP server and client 2.4.0, SDK 1.32.2; `agents/mcp/server` import (bundle 9.2 to 7.0 MB) | Deployed, `fe3708cb` |
| [#483](https://github.com/stellar-experimental/stellar-raven/pull/483) | `wrangler` 4.164.0, `@cloudflare/vitest-plugin` 1.8.4, miniflare, `esbuild`; overrides removed | None needed |
| [#484](https://github.com/stellar-experimental/stellar-raven/pull/484) | oauth-provider 1.2.4: per-origin providers, native-callback allowlist | Deployed, `9f01ae3e` |
| [#485](https://github.com/stellar-experimental/stellar-raven/pull/485) | `vitest` 5.1.0 | None needed |

What did not stick, or waits:
- **picomatch (#473).** It waits for an upstream fix; the TODO item stands.
- **`workers-ai-provider` to `createAI`.** Still blocked by `cs-010`.

None of the five PRs was model-facing: the `mcp:surface` hashes are unchanged throughout.

Follow-ups left in the TODO:
- the Devin CLI sign-in re-check, after the PR 4 deploy;
- the `test/live/` suite repair (found in PR 2);
- the timing flake;
- the MCP Skills extension proposal (PR 2 report), which is for the owner.

`scripts/mcp-key.mjs` was never checked on `wrangler` 4.164.0, because it writes API keys.

## Open questions for the owner

None.
