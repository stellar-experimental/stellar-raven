# Execution: item 7.3 PR 3 (`wrangler` 4.164.0, `@cloudflare/vitest-plugin` 1.8.4, miniflare, `esbuild`)

Executor: Claude Sonnet 5.5, worktree `/home/tyler/code/raven-wt/np-7.3`, branch `np/7.3-deps-wrangler`
from `origin/main` `abd68c63`. Steps 1 to 8 of [PLAN.md](PLAN.md) ran in order. No stop condition
triggered. Nothing was pushed, merged or deployed. No model, paid, AI Gateway or Workers AI call was
made. Step 9 (independent review) is the lead's.

**Result: every gate is green, `mcp:surface` is unchanged, the Worker and collector bundles are
byte-identical to the baseline, and the handshake wire diff is empty. PR 3 changes no Worker bytes,
so it needs no deploy.**

## Environment

- `node -v` v26.13.0, `npm -v` 11.20.0 (`engines` says `>=24 <25`; CI on Node 24 is the authoritative
  run for the workerd lane, as the plan's "Needs" says).
- Installed before: `wrangler` 4.153.0, miniflare 5.20261023.0-beta, `workerd` 1.20261023.1,
  `esbuild` 0.28.1, pool 0.23.0. After: `wrangler` 4.164.0, miniflare 5.20261117.0-beta, `workerd`
  1.20261117.1, `esbuild` 0.28.2, plugin 1.8.4.

## Step 1: baseline (untouched tree)

| Measure | Baseline |
|---|---|
| `dist/server.js` | SHA-256 `01822c7b7277fc85874b506a4b3f2ed430484ada40d89b7671cea24b39b476f0`, 6,997,380 bytes (`server.js.map` SHA-256 starts `89499deb7d42f89d`) |
| `dist/usage/collector.js` | `d09b57299262038a100204313a6d4753807d05a5be829358a1c213468eeb41a7` |
| `dist/usage/collector.js.map` | `2fe1de7b62473968cd7e2503f831c171085caf77ed75197d517bf09b4680bff0` |
| `dist/usage/README.md` | `f585d75e…5587e` (wrangler writes a generation timestamp into it; see below) |
| `mcp:surface` | surface `815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07`, instructions `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00` |
| `npm ls workerd` | one version, 1.20261023.1 (under `miniflare` and `wrangler`) |
| `npm ls zod` | one version, 4.6.7, everywhere |
| `npm audit` | 8 high; packages `@cloudflare/vitest-pool-workers`, `@rolldown/plugin-babel`, `agents`, `fdir`, `picomatch`, `tinyglobby`, `vite`, `vitest`; one advisory, GHSA-fc5q-39xc-vjpf (picomatch <=4.0.7) |
| `npm run test:smoke` | 9 files, 149 tests passed. Output: the pool-rename banner (`@cloudflare/vitest-pool-workers has been renamed to @cloudflare/vitest-plugin`) and 9 lines `[vpw:warn] Tail consumer "stellar-raven-usage" was not found in your config. …` |
| Lockfile | 386 `packages` entries (the review's dry run counted 384; the dry run's 360 after-count matches mine) |

## Step 2: install and remove

Command order as written, all exit 0, no `ERESOLVE`:

1. `npm uninstall @cloudflare/vitest-pool-workers`
2. `npm install -D -E @cloudflare/vitest-plugin@1.8.4 wrangler@4.164.0 miniflare@5.20261117.0-beta esbuild@0.28.2`
3. Deleted the whole `overrides` block from `package.json` (it held `miniflare: $miniflare` and, under
   the pool, `wrangler: $wrangler` and `zod: $zod`).
4. `npm install` once more. It left `package-lock.json` byte-identical to the state after command 2, so
   all overrides were already dead once the plugin was in.

`package.json` devDependencies now: `@cloudflare/vitest-plugin` 1.8.4 (new), `esbuild` 0.28.2,
`miniflare` 5.20261117.0-beta, `wrangler` 4.164.0, all exact; the pool is gone; no `overrides`.

### Lockfile entry list (386 → 360)

- **Removed, 28:** `node_modules/@cloudflare/vitest-pool-workers` (0.23.0); the nested
  `node_modules/wrangler/node_modules/esbuild` (0.28.2) and its 26
  `node_modules/wrangler/node_modules/@esbuild/*` platform packages (all 0.28.2; they dedupe to the
  root copy now that the root is 0.28.2).
- **Added, 2:** `node_modules/@cloudflare/vitest-plugin` (1.8.4) and
  `node_modules/@cloudflare/vitest-plugin/node_modules/zod` (4.6.6, the expected nested dev-only copy).
  The plugin's other dependencies were already in the tree under the same versions.
- **Changed, 35:**
  - `wrangler` 4.153.0 → 4.164.0; `miniflare` 5.20261023.0-beta → 5.20261117.0-beta;
  - `workerd` 1.20261023.1 → 1.20261117.1, plus the five `@cloudflare/workerd-{darwin-64,
    darwin-arm64,linux-64,linux-arm64,windows-64}` packages, same versions;
  - root `esbuild` 0.28.1 → 0.28.2, plus 27 `@esbuild/*` platform packages 0.28.1 → 0.28.2.
- **Meta-only:** the root package's `devDependencies` record.
- Nothing else moved. No duplicate appeared, so `npm dedupe` was not needed.
- One lockfile key ends in `node_modules/workerd` (`node_modules/workerd`, 1.20261117.1); one
  `node_modules/esbuild` key (0.28.2).

`npm install` printed `install-scripts … not yet covered by allowScripts` notes for `esbuild`,
`workerd` and `core-js-pure`. They are npm 11.20 notices (the same packages were listed before the
change) and did not affect any gate.

## Step 3: code and config

- `test/smoke/vitest.config.ts`: import is now `import { cloudflareTest } from "@cloudflare/vitest-plugin"`;
  header comment names the plugin; the two history notes now describe current behavior with no version
  (`cloudflareTest` is a Vite plugin; `cloudflare:test` has no `fetchMock`, so the offline wall lives in
  `outboundService`); two further comment mentions ("pool-workers resolves a relative configPath",
  "the pool opens a Cloudflare remote-proxy session") now say "the plugin". Options unchanged.
- `test/usage-site-runtime.test.mjs:12`: `new Miniflare({ enableDevRegistry: false, workers: [{ … }] })`.
  Reason: miniflare 5.20261023.1-beta (workers-sdk #16494) turns the dev registry on by default for the
  native v5 options shape; without the key the test would register `usage-site-test` in a user-global
  directory that other local sessions can see. The test passes with it (1 test, 159 ms), and no
  `dev-registry` directory exists under `~/.config/.wrangler` or `~/.wrangler` afterward.
- `tsconfig.json`: `types` entry is `@cloudflare/vitest-plugin/types`; the comment names the plugin.
- `.github/workflows/ci.yml:92`: comment says `@cloudflare/vitest-plugin`.
- `rg --hidden -g '!.git' -n "vitest-pool-workers|pool-workers" .` after the edits: no live mention
  outside `.agents/TODO.md` (handled in step 6), dated records (`.agents/rounds/`) and this plan folder.
  No `package-lock.json` entry for the pool remains.

## Step 4: gates (each run bare, one at a time)

| Gate | Result |
|---|---|
| `npm run typegen` | exit 0; `env.d.ts` is git-ignored, tree not dirtied |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0: 173 files passed, 5 skipped; 4042 tests passed, 3 expected fail, 8 skipped |
| `npm run build` | exit 0; log identical to baseline except the `wrangler` version line and a new one-line telemetry notice ("Cloudflare collects anonymous telemetry about your usage of Wrangler") |
| `npm run test:smoke` | exit 0: 9 files, **149 passed**, equal to baseline |
| `npm run secrets:scan -- --tree` | exit 0, "clean — scanned all tracked files" |
| `npm run build:usage` | exit 0 |
| `npm run test:usage-report` | exit 0 |
| `npm run build:usage-report` | exit 0 |
| One `workerd` copy | exactly one lockfile key ends in `node_modules/workerd`; `npm ls workerd` shows 1.20261117.1 under `miniflare` and `wrangler` only |
| `npm run -s mcp:surface -- --json` | surface `815333b7…bd07` and instructions `67a6bd0b…6c00`, both unchanged; the whole JSON is byte-identical to the baseline capture |
| `npm run eval:selftest` | not run (optional; it names none of these packages and CI runs it) |

### `npm audit` against the paired baseline (same day, `origin/main` lockfile)

Both: 8 high, 0 other severities, **one advisory, GHSA-fc5q-39xc-vjpf** (picomatch <=4.0.7). The only
difference is a package name in the affected list: `@cloudflare/vitest-pool-workers` becomes
`@cloudflare/vitest-plugin` (the chain through the `vitest` peer). No new advisory, and none for the
nested `zod` 4.6.6. The command still exits 1 because of picomatch. For the TODO item's done criterion,
"`npm audit` passes" is read as "no new advisory against the paired baseline", as the plan says.

### Bundle comparison

| File | Baseline | After | Same? |
|---|---|---|---|
| `dist/server.js` | `01822c7b…b476f0`, 6,997,380 B | `01822c7b…b476f0`, 6,997,380 B | yes |
| `dist/server.js.map` | starts `89499deb7d42f89d` | starts `89499deb7d42f89d` | yes |
| `dist/usage/collector.js` | `d09b5729…468eeb41a7` | same | yes |
| `dist/usage/collector.js.map` | `2fe1de7b…680bff0` | same | yes |
| `dist/usage/README.md` | `f585d75e…5587e` | `a7efcad1…7a59` | no: it holds "generated at <timestamp>" and the file contains no code |

The Worker and collector bytes are identical, so no attribution is needed: `esbuild`, `unenv` and
wrangler's own templates produced the same output at 4.164.0 as at 4.153.0. **PR 3 needs no deploy.**

### Smoke warnings after the change

- The pool-rename banner is gone.
- The 9 tail-consumer lines are reworded as predicted:
  `[vpw:warn] Tail consumer "stellar-raven-usage" was not found in \`miniflare.workers\`. Make sure you add it if you'd like to simulate receiving tail events locally.`
  Not a stop.
- `Using secrets defined in .dev.vars` appears 9 times both before and after (I did not open
  `.dev.vars`).
- Pass count 149, equal to the baseline.

## Step 5: local dev check

- Pre-check `lsof -nP -iTCP -sTCP:LISTEN -a -c workerd`: nothing listening (exit 1).
- Started `hc run --bg --name 7.3-pr3-dev --cwd /home/tyler/code/raven-wt/np-7.3 -- npm run dev`
  (terminal `t1xs`, child of `t1xr`). `wrangler dev` printed `⎔ Establishing remote connection...`
  (the remote-only `ai` binding's proxy session, as in every dev start; the capture makes no model
  call) and `Ready on http://localhost:8787`.
- Ran `node tmp/handshake/capture.mjs old http://localhost:8787 tmp/pr3/out-old-4164.json`: both
  scenarios ran (`legacy-sdk-v1`, 6 exchanges; `v2-client-pinned-2026-07-28`, 4 exchanges, probe 200;
  raw GET 405).
- Wire diff against PR 2's run B (`tmp/handshake/out-old-upgraded.json`, same client set) with
  `tmp/handshake/diff.mjs` (masks artifact `id` and `expiresAt`):

  ```
  NO DIFFERENCES
  scenarios whose raw (un-normalised) wire bodies differ: 2
  ```

  The two raw-differing scenarios are the masked artifact ids and `expiresAt` values; PR 2's own
  B-versus-C comparison prints the same count (checked: it also prints `NO DIFFERENCES` and 2).
- Killed and removed `t1xs` (`hc kill`, `hc rm`); `lsof` shows no `workerd` listener afterward. The
  capture script and outputs stay under `tmp/` (git-ignored) and are not committed.

## Step 6: records

- `.agents/TODO.md` Dependencies: "Migrate the deprecated vitest pool and remove its overrides" is
  replaced by the standing note "Move `wrangler`, `miniflare`, and `@cloudflare/vitest-plugin`
  together". Its done criterion held: tests run on the plugin, no `overrides` remain, `npm audit` is no
  worse than the paired baseline, `npm test`, `npm run test:smoke` and the one-`workerd` check pass. The
  note records the move-together rule, the nested `zod`, the one-copy `workerd` check, and the pool's
  ceiling (`wrangler` 4.156.2, miniflare `5.20261102.0-beta`; it imports `getNodeCompat`, removed from
  miniflare in `5.20261103.0-beta`).
- The picomatch item's "Reach on …" list names `vitest`, `tinyglobby`, `fdir`, `agents`, `vite` and
  `@rolldown/plugin-babel`; the pool was not named there, so it is unchanged.
- I did not edit `../README.md` (the lead's file; row 3 still says "planned"). It is in the commit with
  the folder files as the brief says.

## Deviations and things to know

- No deviation from the plan's steps.
- The baseline lockfile had 386 entries, not the review's 384; the 360 after-count matches.
- `npm run build` now prints a one-line telemetry notice. Nothing else in the build log changed.
- Local gates ran on Node 26.13.0 (see Environment); CI on Node 24 is the authoritative workerd-lane run.
- **Check at the next deploy** (from the plan's "Needs"): `scripts/check-usage-deployment.mjs`,
  `scripts/mcp-key.mjs` and `scripts/usage-report.mjs` parse `wrangler` output and no free gate runs
  them. Since PR 3 needs no deploy, whoever deploys PR 4 runs them on `wrangler` 4.164.0 first.

## Commit

`wrangler 4.164.0 and @cloudflare/vitest-plugin 1.8.4; drop the pool overrides (round item 7.3)` on
`np/7.3-deps-wrangler`, with the plan folder (`../README.md`, `PLAN.md`, `REVIEW.md`, `briefs/`,
`EXEC.md`) in the same commit. The commit SHA is in the final report to the lead.
