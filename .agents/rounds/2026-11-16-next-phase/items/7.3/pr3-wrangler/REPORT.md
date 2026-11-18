# Item 7.3, PR 3 report: `wrangler` 4.164.0 and the vitest plugin

Lead: Claude Opus 5.5, agentpc `t1x8`, 2026-11-18.

## Pull request and result

[#483](https://github.com/stellar-experimental/stellar-raven/pull/483), branch `np/7.3-deps-wrangler`,
on `origin/main` `abd68c63`. Two commits; squash-merge is fine.

What changed:
- **Versions:** `wrangler` 4.164.0, miniflare `5.20261117.0-beta`, `esbuild` 0.28.2.
- **Pool replaced:** the deprecated `@cloudflare/vitest-pool-workers` 0.23.0 is replaced by
  `@cloudflare/vitest-plugin` 1.8.4. Its exact pins match the new versions above.
- **Overrides:** all three `package.json` `overrides` are gone.
- **TODO:** the item "Migrate the deprecated vitest pool and remove its overrides" is done. A
  standing note replaces it. The note records the pool's ceiling: `wrangler` 4.156.2, because
  miniflare `5.20261103.0-beta` removed the `getNodeCompat` export that the pool imports.

Evidence:
- **Bundles:** `dist/server.js` and `dist/usage/collector.js` are byte-identical to `origin/main`.
  Codex rebuilt both and got the same result.
- **Model surface:** `mcp:surface` is unchanged.
- **Local dev:** the `npm run dev` handshake with old clients has no wire difference against PR 2.
- **Audit:** `npm audit` shows the same single advisory, #473.
- **Gates:** typecheck, test (4042), build, smoke (149/149), secrets, `build:usage`,
  `test:usage-report` and `build:usage-report` all pass.

Reviews:
- Fable plan review: 1 blocking and 8 further findings, all adopted.
- Codex `gpt-6-astra` high diff review: PASS, 2 notes, both already recorded.

USD 0.

## Deploy

**Not needed.** No Worker or collector bytes change.

At the next deploy (PR 4), check that the scripts that parse `wrangler` output work on 4.164.0. No
free gate runs them, and they first meet the new version there:
- `scripts/check-usage-deployment.mjs` (the `postdeploy` hook);
- `scripts/mcp-key.mjs`;
- `scripts/usage-report.mjs`.

The changelog range has no entry for those commands.

## Recorded, as you asked

`live-host-check.mjs` was not run after PR 2's deploy. No production bearer credential exists on the
Mac or agentpc. You verified the OAuth metadata and `/mcp` 401 on all three hosts, and a production
Claude connector `execute`. This is recorded in PLAN.md, the ledger row and the PR body, and is not a
blocker.

## Next

- **PR 4: `@cloudflare/workers-oauth-provider` 1.x**, the auth boundary. Starts from the new
  `origin/main` after your reply.
  - A Codex frontier security review is required.
  - Local DCR and OAuth flow tests are required.
  - PR 2's `ctx.auth` trust note carries into it.
  - If 1.x needs a design change, I stop and send a proposal.
- **PR 5: `vitest` 5.** The plugin's peer range has accepted `^5.0.0` since 1.4.0, so your note's
  condition ("unless the pool supports it by then") is met. I plan PR 5 after PR 4, unless you say to
  leave it recorded only.

## Open questions for the owner

None.
