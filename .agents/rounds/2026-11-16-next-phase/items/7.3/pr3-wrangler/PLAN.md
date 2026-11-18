# Item 7.3, PR 3: `wrangler` 4.164.0, the vitest plugin, miniflare and `esbuild`

Branch `np/7.3-deps-wrangler` in `/home/tyler/code/raven-wt/np-7.3`, from `origin/main` `abd68c63`
(PR 2, #482, merged and deployed as version `fe3708cb`). Revised after the Fable plan review
([REVIEW.md](REVIEW.md)); the reconciliation table is at the end.

## Decision

1. Move the toolchain to `wrangler` 4.164.0.
2. In the same PR, finish the TODO item "Migrate the deprecated vitest pool and remove its
   overrides".
   - `@cloudflare/vitest-pool-workers` 0.23.0 is deprecated, renamed to `@cloudflare/vitest-plugin`,
     and will get no updates. Its own pins (`wrangler` 4.124.0, miniflare `5.20260815.0-alpha`,
     `esbuild` 0.28.1, `zod` 4.4.3) are why `package.json` keeps three `overrides`.
   - `@cloudflare/vitest-plugin` 1.8.4 (2026-11-17) pins `wrangler` 4.164.0, miniflare
     `5.20261117.0-beta` and `esbuild` 0.28.2. Those are exactly this PR's targets, so the migration
     fits.

The plugin migration is required for the 4.164.0 target. It is not one of two options:
- the pool 0.23.0 imports `getNodeCompat` from miniflare;
- miniflare removed that export in `5.20261103.0-beta` (workers-sdk #16651);
- the pool's ceiling is therefore `wrangler` 4.156.2 with miniflare `5.20261102.0-beta`, and even that
  is unverified.

The alternative is to stay on 4.153.0. Expected cost: USD 0, about an hour of executor time.

## Packages (all dev, exact)

| Package | From | To |
|---|---|---|
| `wrangler` | 4.153.0 | 4.164.0 |
| `@cloudflare/vitest-pool-workers` | ^0.23.0 | removed |
| `@cloudflare/vitest-plugin` | (none) | 1.8.4 |
| `miniflare` | 5.20261023.0-beta | 5.20261117.0-beta (`test/usage-site-runtime.test.mjs` imports it directly) |
| `esbuild` | 0.28.1 | 0.28.2 |

`workerd` should move to the single version 1.20261117.1. The plugin pins `zod` 4.6.6 exactly while
the root has `zod` ^4.6.7, so a nested dev-only `zod` 4.6.6 copy is expected once the `zod` override
goes. It is accepted if `npm audit` shows no finding for it. The plugin and `wrangler` must move
together in later bumps. Add that to the TODO Dependencies section as a standing note, in place of
the finished migration item. The note also records the pool's ceiling (`wrangler` 4.156.2, miniflare
`5.20261102.0-beta`), so nobody tries the override route later.

## Upstream facts

From the `wrangler` CHANGELOG 4.154.0 to 4.164.0:
- Most changes touch `cf` delegates, Artifacts, Workflows, D1, VPC, containers and dispatch
  namespaces. Raven uses none of them; its bindings are `worker_loaders`, `ai`, KV, R2 and a tail
  consumer.
- `DEFAULT_COMPAT_DATE` bumps do not matter: `wrangler.jsonc` sets `compatibility_date`.
- Signal termination now exits non-zero (before, it exited 0). This is a correctness fix for
  `npm run deploy` callers.
- Package metadata at deploy now includes nested-`package.json` packages. This is informational.

The plugin's package exports `cloudflareTest` (same name) from `.`, and `./types` for
`cloudflare:test`. It supports `vitest` `^4.1.0 || ^5.0.0`.

## Steps

1. **Baseline** on the untouched branch. Record:
   - `node -v` and `npm -v`;
   - the `dist/server.js` SHA-256 and size after `npm run build`;
   - the `mcp:surface` hashes (surface `815333b7…bd07`, instructions `67a6bd0b…6c00`);
   - `npm ls workerd`, `npm ls zod` and `npm audit --json` (the vulnerable-package names);
   - the smoke lane's warning lines (`[vpw:warn]` and the pool-rename warning) and its pass count;
   - the SHA-256 of every file under `dist/usage/` after `npm run build:usage`.
2. **Install and remove.** Keep this command order. Applying every `package.json` edit at once and
   then running one install gave two nested `workerd` copies in the reviewer's dry run.
   - `npm uninstall @cloudflare/vitest-pool-workers`
   - `npm install -D -E @cloudflare/vitest-plugin@1.8.4 wrangler@4.164.0 miniflare@5.20261117.0-beta esbuild@0.28.2`
   - Delete the whole `overrides` block from `package.json`, then run `npm install` once more so
     the lockfile settles without it.
   - Files: `package.json` and `package-lock.json`. There must be no `ERESOLVE`.
   - List every lockfile entry that is added, removed or changed. Check the list against these
     expectations and stop on anything unexplained:
     - the pool and its nested copies go;
     - the plugin and its dependencies come in;
     - `wrangler`, miniflare, `workerd`, `esbuild` and the `@esbuild/*` platform packages move;
     - the nested `zod` 4.6.6 appears.

     The reviewer's dry run went from 384 to 360 entries, with one hoisted `workerd` 1.20261117.1,
     one `esbuild` 0.28.2 and nothing else moved. If a duplicate appears, do not run `npm dedupe`
     (it churns unrelated packages); stop and report.
3. **Code and config.** Only mechanical renames:
   - `test/smoke/vitest.config.ts`:
     - change the import to `import { cloudflareTest } from "@cloudflare/vitest-plugin"`;
     - on lines 3 and 55, replace the name with the plugin's;
     - rewrite the history notes on lines 15 and 84 to describe current behavior, with no version:
       `cloudflareTest` is a Vite plugin, and `cloudflare:test` has no `fetchMock`, so the offline
       wall lives in `outboundService`;
     - keep the options as they are. The reviewer confirmed the option schema is the pool's plus an
       optional `config`.
   - `test/usage-site-runtime.test.mjs:12`: add `enableDevRegistry: false` as a top-level key next to
     `workers`. From miniflare `5.20261023.1-beta` (workers-sdk #16494) the native v5 options shape
     turns the dev registry on by default. The test would then register `usage-site-test` in a
     user-global directory that other local sessions can see. Record this in EXEC.md with #16494.
   - `tsconfig.json`: `@cloudflare/vitest-pool-workers/types` becomes
     `@cloudflare/vitest-plugin/types`, plus the comment on line 21.
   - `.github/workflows/ci.yml:92`: the comment's name.
   - Then search for remaining live mentions with
     `rg --hidden -g '!.git' -n "vitest-pool-workers|pool-workers" .`. Leave dated records
     (`research/`, `.agents/rounds/`, `improvements/` evidence) unchanged.
4. **Gates, bare, on the final tree:**
   - `npm run typegen`, then `npm run typecheck`;
   - `npm test`, `npm run build`, `npm run test:smoke`;
   - `npm run secrets:scan -- --tree`;
   - `npm run build:usage`, `npm run test:usage-report` and `npm run build:usage-report`. CI runs
     them and they use the root `wrangler`. `usage/report-site` has no dependencies and no lockfile,
     so there is no `npm ci` there;
   - one `workerd` copy: exactly one lockfile key ends in `node_modules/workerd`;
   - `npm audit`: a paired comparison with `origin/main`'s lockfile on the same day. Compare by
     advisory, not by package name: the pool's name becomes the plugin's in the picomatch chain.
     No new advisory is allowed;
   - `npm run -s mcp:surface -- --json`, which must show both hashes unchanged;
   - **`dist/server.js`**: compare its SHA-256 and size with step 1. The same goes for the
     `dist/usage/` files.
     - `wrangler` 4.153.0 and 4.164.0 pin the same `esbuild` (0.28.2), `unenv` (2.0.0-rc.24) and
       `@cloudflare/unenv-preset` (2.16.2). The root `esbuild` serves only scripts.
     - So a byte difference can only come from `wrangler`'s own bundling code or its injected
       templates. Find it and record it. A difference attributed to `esbuild` or `unenv` is
       unexplained, and the stop rule applies.
     - If the bytes are identical, PR 3 needs no deploy.
   - **Smoke warnings after the change:**
     - the pool-rename warning should be gone;
     - the tail-consumer `[vpw:warn]` line may be reworded (``… was not found in `miniflare.workers` ``),
       and that is not a stop;
     - the pass count must equal the step 1 baseline.
   - `npm run eval:selftest` is optional. It names none of these packages, and CI runs it.
5. **Local dev check (free, no model).**
   - Before starting, run `lsof -nP -iTCP -sTCP:LISTEN -a -c workerd`. If anything listens, stop and
     report to the lead: reusing that server tests the wrong toolchain, and killing it would break
     terminal ownership.
   - Start one `npm run dev` as an `hc` child, using the worktree's `.dev.vars`; do not print it.
   - Run `tmp/handshake/capture.mjs` with the **old** client set.
   - Diff the result against PR 2's run B (`tmp/handshake/out-old-upgraded.json`) with
     `tmp/handshake/diff.mjs`. It masks both the artifact `id` and `expiresAt`.
   - Kill the server.

   This checks that the new `wrangler dev`, miniflare and `workerd` serve the Worker as before.
6. **Records.**
   - Write `EXEC.md` with the steps, the lockfile list, the gates, the bundle comparison and the dev
     check.
   - In `.agents/TODO.md` Dependencies:
     - delete "Migrate the deprecated vitest pool and remove its overrides" when its done criterion
       holds: tests on the plugin, all three overrides gone, `npm audit` no worse than the paired
       baseline, `npm test`, `test:smoke` and one `workerd`. Put the standing note in its place.
       EXEC.md says that "`npm audit` passes" is read as "no new advisory", because the picomatch
       advisory keeps the command non-zero.
     - In the picomatch item, update the "Reach on …" package list only if the chain's package
       names changed (for example, the plugin in place of the pool).
7. **No fallback inside this PR.** If the plugin migration does not fit in step 3, stop and report
   to the lead. That covers a renamed option, a changed `cloudflare:test` API, or a smoke test that
   needs more than a one-line fix. The pool cannot load miniflare `5.20261103.0-beta` or later, so a
   pool-based bump is a different, smaller PR, capped at `wrangler` 4.156.2. The lead decides on it.
8. **Commit** on `np/7.3-deps-wrangler` with the normal hooks:
   `wrangler 4.164.0 and @cloudflare/vitest-plugin 1.8.4; drop the pool overrides (round item 7.3)`.
9. **Independent diff review** (the lead runs it): Codex frontier, `gpt-6-astra`, at high. The
   executor is Claude Sonnet 5.5 and the lead and orchestrator are Claude Opus 5.5, so the reviewer
   differs from all three. This is toolchain-only, but it ships the Worker bundle.

## Stop rule

Stop and report to the lead, changing nothing further, if any of these happens:
- a gate fails, and the fix is more than a rename or a one-line type adjustment;
- an `ERESOLVE` or a second `workerd` appears;
- `npm audit` gains an advisory over the paired baseline;
- `mcp:surface` changes;
- the dev check's wire diff differs from PR 2's;
- the bundle differs in a way the step 4 attribution cannot explain.

## Model-facing check

None expected. Toolchain changes do not change tool text. The `mcp:surface` hashes and the dev wire
diff are the check. A changed hash stops the PR.

## `vitest` 5

`@cloudflare/vitest-plugin` 1.8.4 accepts `vitest` ^5.0.0, so the blocker the orchestrator's note
names (the pool) is gone once this PR lands. `vitest` 5 is not in this PR. The lead proposes it as
PR 5, after the oauth-provider PR.

## Risks

- **The smoke lane runs on the plugin.** A behavior difference there could hide or create
  failures. The pass count must match the baseline: 149 passed.
- **Dropping the overrides changes resolution for every package that depended on them.** The
  lockfile list in step 2 is the check.
- **Production runtime.** The deployed runtime is Cloudflare's, not npm `workerd`. The bundle
  comparison decides whether anything ships.

## Live-host check (orchestrator's note, 2026-11-18)

After PR 2's deploy, `research/audits/2026-11-06-remaining-sweep/live-host-check.mjs` was not run. It
needs a production bearer credential, and none exists on the Mac or agentpc. The orchestrator
verified the OAuth metadata and `/mcp` 401 on all three hosts, and a Claude connector `execute` call
in production. Not a blocker.

## Needs from the orchestrator

- **Merge**, then deploy only if step 4 shows changed Worker bytes (`dist/server.js`, or
  `dist/usage/` for the collector).
- **Local gates ran on Node 26.** CI on Node 24 is the authoritative run for the workerd lane.
- **Check at the next deploy:**
  - **Scripts no free gate runs.** `scripts/check-usage-deployment.mjs` (`wrangler auth token
    --json`), `scripts/mcp-key.mjs` and `scripts/usage-report.mjs` parse `wrangler` output. If PR 3
    merges without a deploy, whoever deploys PR 4 runs them on 4.164.0 for the first time. The
    changelog range has no entry for those commands.

## Review reconciliation

| Finding | Disposition |
|---|---|
| 1 The fallback cannot load miniflare 5.20261103+ | Adopted: Decision, step 7 (stop instead) and the TODO note record the pool's ceiling |
| 2 Dev registry on by default for `usage-site-runtime` | Adopted: `enableDevRegistry: false` in step 3 |
| 3 Wrong run in the handshake pairing; second mask; listener present | Adopted: step 5 |
| 4 Count `workerd` copies; install order | Adopted: steps 2 and 4 |
| 5 History comments | Adopted: step 3 |
| 6 Bundle attribution; `dist/usage/` | Adopted: steps 1 and 4 |
| 7 Gate list corrections | Adopted: step 4 |
| 8 Records: reviewer tier, README row 5, audit reading | Adopted: step 9, README, step 6 |
| 9 Node 26 locally | Adopted: Needs |
