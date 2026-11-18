# Exec: item 7.3 PR 5 (`vitest` 5.1.0)

Executor: Claude Sonnet 5.5, 2026-11-18. Branch `np/7.3-deps-vitest5` in
`/home/tyler/code/raven-wt/np-7.3`, from `origin/main` `b49675e3`. Plan steps 1 to 8 done; step 9 is the
lead's. **No stop condition fired.** No `src/` or `test/` change, no model call, no dev server, no push.

## Result

`vitest` 4.1.12 to 5.1.0. Both lanes pass cold and warm with counts equal to the baseline. The
`dist/server.js` and `dist/server.js.map` hashes are unchanged, so no deploy is needed. `npm audit` is
unchanged. No migration fix was needed.

## Environment

- `node -v` v26.13.0, `npm -v` 11.20.0. Node 24 is not on this box, so the local evidence is Node 26.
  `npm install` prints the existing `EBADENGINE` warning (`engines` is `>=24 <25`); it is not new.
- **For the lead's CI comparison.** CI on `vitest` 4.1.12 and Node 24 (failed attempt 1 of run
  44223760712, which is otherwise the same suite) reported 179 files: 174 passed, 4 skipped, 1 failed
  (the flake); tests: 4193 passed, 1 failed, 3 expected fail, 4 skipped (4201). The local baseline
  skips 5 files and 8 tests. CI therefore runs 4 more tests than this box (env-gated skips), and
  the total, 4201, is the same. Compare CI's 4194 passed (4193 plus the flake) with 4190 here only
  after allowing for those 4.

## Step 1: baseline (untouched tree, `vitest` 4.1.12)

| Item | Result |
|---|---|
| `npm test` | exit 0. 174 files passed, 5 skipped (179). 4190 tests passed, 3 expected fail, 8 skipped (4201). 37.6 s |
| `npm run test:smoke` | exit 0. 10 files passed. 173 tests passed. 7.1 s |
| `dist/server.js` SHA-256 | `1afc5293b761b9478aa4f956d6c9ef17bb15bc3313687d41fbc55d013ded32a0` |
| `dist/server.js.map` SHA-256 | `e3b6c6b18e6639b544b71b3a674da5f3111cd28b8a4c97e0c9fb2171713ba602` |
| `npm audit` | 8 high, one advisory, GHSA-fc5q-39xc-vjpf, through `picomatch` 4.0.7 |
| `workerd` | one copy, 1.20261117.1 (`npm ls workerd`: miniflare, wrangler, unenv-preset, all deduped) |

The baseline matches the reviewer's measured `clearMocks` run (4190 passed, 3 expected fail, 8 skipped).

## Step 2: install

`npm install -D vitest@5.1.0` exit 0: "added 1 package, removed 8 packages, changed 11 packages". No
`ERESOLVE`, no peer warning. `git diff package.json` is one line, `"vitest": "^4.1.12"` to
`"vitest": "^5.1.0"`. The lockfile resolves `vitest` 5.1.0
(`https://registry.npmjs.org/vitest/-/vitest-5.1.0.tgz`, peer `vite ^6.4.0 || ^7.0.0 || ^8.0.0`;
`vite` 8.3.5 is installed). `npm ls` shows `@cloudflare/vitest-plugin@1.8.4` with `vitest@5.1.0
deduped` and no invalid or missing peer. Plugin peer range: `vitest ^4.1.0 || ^5.0.0`. Lockfile
packages: 360 before, 353 after.

### Lockfile entry list (computed from the before and after lockfiles)

Equal to the plan's list, with no other change.

| Kind | Entries |
|---|---|
| Removed (8) | `@vitest/expect` 4.1.12, `@vitest/pretty-format` 4.1.12, `@vitest/runner` 4.1.12, `@vitest/snapshot` 4.1.12, `@vitest/utils` 4.1.12, `siginfo` 2.0.0, `stackback` 0.0.2, `tinyrainbow` 3.1.0 |
| Added (1) | `node_modules/vitest/node_modules/obug` 3.0.0 |
| Version changed (11) | `vitest` 4.1.12 to 5.1.0; `@vitest/mocker` and `@vitest/spy` to 5.1.0; `magic-string` 0.30.21 to 1.4.5; `@jridgewell/sourcemap-codec` 1.5.5 to 1.6.0; `es-module-lexer` 2.3.0 to 2.3.2; `@types/estree` 1.0.9 to 1.0.10; `std-env` 4.1.0 to 4.3.0; `tinybench` 2.9.0 to 6.2.3; `tinyexec` 1.2.4 to 1.3.1; `why-is-node-running` 2.3.0 to 3.2.1 |
| Flag only | 36 entries gain `peer: true`: `vite` and 35 beneath it |
| Unchanged | one `workerd` (1.20261117.1); `picomatch` 4.0.7 |

## Step 3: four runs, cold then warm

Ran `rm -rf node_modules/.vitest-cache`, then the four commands in order. Every run exited 0. No
`Message is too large`, WebSocket 1009, `Worker exited unexpectedly`, or "not awaited" line appears in any log.

| # | Command | Cache | Files | Tests | Time |
|---|---|---|---|---|---|
| 1 | `npm test` | cold | 174 passed, 5 skipped (179) | 4190 passed, 3 expected fail, 8 skipped (4201) | 42.5 s |
| 2 | `npm test` | warm | 174 passed, 5 skipped (179) | 4190 passed, 3 expected fail, 8 skipped (4201) | 37.6 s |
| 3 | `npm run test:smoke` | cold by the plan's sequence (see below) | 10 passed | 173 passed | 7.5 s |
| 4 | `npm run test:smoke` | warm | 10 passed | 173 passed | 5.8 s |

Run 3 followed two `npm test` runs, which had already written to `node_modules/.vitest-cache`, so it may
not have been truly cold for the smoke lane. After the other gates I added **one extra run, 5: `rm -rf
node_modules/.vitest-cache`, then `npm run test:smoke` alone**: exit 0, 10 files, 173 tests passed, 7.5 s.
The smoke lane, which is the #16349 candidate, is clean with a truly cold cache. After the cache is warm
it is 5.8 s. The cache directory holds about 66 MB after the lanes.

After the runs, `git status --short` shows only `package.json`, `package-lock.json`, and the plan folder
(untracked): no generated or stray file. `node_modules/.vitest-cache` is ignored.

No fix was needed, so the `oauth-identity` first-run clause did not apply. `test/smoke/oauth-identity.test.ts`
passes within the smoke lane (cold and warm).

## Step 4: equal coverage

Equal, with no difference to explain.

| Lane | Baseline (4.1.12) | 5.1.0, cold | 5.1.0, warm |
|---|---|---|---|
| `npm test` | 4190 passed, 3 expected fail, 8 skipped | same | same |
| `npm run test:smoke` | 173 passed | same | same |

## Step 5: gates on the final tree

The runs above used the final dependency tree. Only `.agents/` documents changed afterwards.

| Gate | Result |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0 (runs 1 and 2) |
| `npm run build` | exit 0 |
| `npm run test:smoke` | exit 0 (runs 3 to 5) |
| `npm run secrets:scan -- --tree` | exit 0, "clean — scanned all tracked files" |
| `workerd` copies | one: 1.20261117.1 |
| `npm audit` vs `origin/main` | exit 1 as before. 8 high, one advisory, GHSA-fc5q-39xc-vjpf. No new advisory. The text differs from the baseline only in indentation: `vitest` now sits under `vite` in the dependency tree, because `vite` is a peer. The picomatch chain is unchanged: `vitest` 5.1.0 still depends on `picomatch` ^4.0.7, which resolves to 4.0.7, and `tinyglobby` 0.2.17 and `fdir` 6.5.0 are unchanged |
| `dist/server.js` SHA-256 | `1afc5293b761b9478aa4f956d6c9ef17bb15bc3313687d41fbc55d013ded32a0`. **Equal to baseline** |
| `dist/server.js.map` SHA-256 | `e3b6c6b18e6639b544b71b3a674da5f3111cd28b8a4c97e0c9fb2171713ba602`. **Equal to baseline** |

Same Node and same directory for both builds. The identical bundle shows the MCP surface is unchanged,
and so no deploy is needed. I ran no separate handshake or `mcp:surface` capture: this plan has none
(REVIEW finding 11), so there is no wire diff to copy.

## Breaking-change table: confirmation of each row

Searches use `rg --hidden -g '!.git'`. Each row matches the reviewer's result.

| Change | Confirmed result |
|---|---|
| `fsModuleCache` on by default; plugin issue #16349 | Covered by runs 1 to 5. Cold and warm, both lanes pass; the symptoms never appeared (none of `Message is too large`, 1009, `Worker exited unexpectedly`). The smoke lane with a truly cold cache (run 5) also passes. No hit |
| `clearMocks` on by default | Both lanes' counts equal the baseline, so no test depends on call history recorded outside a test body. No hit |
| Hoisted `vi.mock` at top level | 24 `vi.mock` calls, all at column 0 (a search for an indented `vi.mock(` or `vi.hoisted(` finds none). 2 `vi.hoisted` calls. No hit |
| Class mocks (`vi.fn(Class)`, `vi.spyOn(obj, "Class")`, `mockImplementation(class …)`) | No match for any of the three forms in `test/`. No hit |
| Unawaited asynchronous assertions | 140 `.resolves` or `.rejects` uses in `test/`. No "not awaited" output in any run. The three that are awaited after advancing fake timers (`test/demo-eval-cost.test.ts:244`, `test/usage.test.ts:121`, `:203`) pass. No hit |
| `toThrow("")`, `expect.poll`, `sequential`, worker and pool IDs | No match for `toThrow("")`, `expect.poll`, `.sequential`, `VITEST_WORKER_ID`, `VITEST_POOL_ID`, `poolId` or `workerId` in `test/`, `package.json` or either config. No hit |
| Removed entry points | `test/` imports `vitest` 188 times and `vitest/config` once; there is no other `vitest/…` import. No file in `src/`, `scripts/`, `eval/` or `usage/` imports `vitest`. `vitest` 5.1.0's exports include `./runtime`, `./worker` and `./node`, which the plugin uses, and `dist/` has `runtime.js`, `worker.js` and `node.js`. No hit |
| Config lookup from parent directories | Both scripts run from the repository root and the smoke lane passes `--config`. `usage/report-site/package.json` does not use `vitest` (the plan says `node --test`). No hit |
| `.vitest/` reports; `json` and `junit` reporters | No `reporter`, `outputFile` or `.vitest/` reference in either config, `package.json` or `.github`. There is no `.vitest/` directory in the tree. No hit |
| DOM environment | No `@vitest-environment` comment and no `environment` option in either config. The `environment:` matches in `test/` are data fields (for example `re-judge.test.ts`), not the option. `happy-dom` is a library import only. No hit |
| Fake timers mock `Temporal`; `pretty-format` titles; `node:timers` | Nine test files use `vi.useFakeTimers`. No `Temporal.Now`, `Temporal.Instant` or `globalThis.Temporal` use in `src/`, `test/`, `scripts/`, `eval/`, `usage/`. No `node:timers` match in those. Test counts are equal, so title changes did not change the count. No hit |
| `-t` joined with ` > `; inline projects; benchmark API; assertion types; `resolveConfig`, `populateGlobal`; `vite` a required peer | No `-t`, `--testNamePattern` or `testNamePattern` in `package.json`, `.github`, `docs`, `test/README.md` or `.agents/skills`. No `projects` or `workspace` in either config. No `bench(` call. No `expect.extend`, `Assertion<`, `MockInstance` or `Mock<` in `test/`. No `resolveConfig` or `populateGlobal` in `test/` or `scripts/`. No `setupFiles` or `globalSetup` in either config. `npm install` provides `vite` 8.3.5 and `npm ls` shows no peer problem. No hit |

## Step 6: the CI flake

Recorded as a TODO item, with no test change. The failed run is **attempt 1 of run 44223760712**
(PR #484, head `997f8e30`, 2026-11-18T02:32:43Z). Its log reads `AssertionError: expected 8.409216499032048
to be less than 8` at `test/qa-judge-evidence.test.mjs:1519:33`. Attempt 2 of the same run passed. Run
44223703183 (the other `np/7.3-deps-oauth` run) passed on its first attempt. `gh run list` shows only the
latest attempt, so the item links `.../runs/44223760712/attempts/1`. The assertion did not fail in
any of my runs here (runs 1 and 2, `npm test`).

## Step 7: records

- This file.
- `.agents/TODO.md`: new item "Stabilize the timing-ratio assertion in `test/qa-judge-evidence.test.mjs`"
  at the end of "Eval instruments" (observation, scope, approach, done criterion as the plan gives them).
  In "Dependencies", a paragraph added to "Move `wrangler`, `miniflare`, and `@cloudflare/vitest-plugin`
  together": `vitest` is on 5.x, within the plugin's peer range `^4.1.0 || ^5.0.0`.
- `items/7.3/README.md`: row 4 is "merged, #484, deployed `9f01ae3e`". Row 5 links `pr5-vitest5` with the
  status "executed on `np/7.3-deps-vitest5`; lead review and PR pending". The lead should update that
  status after the PR opens or merges.
- `test/README.md`: no edit, as planned.

## Deviations

1. One extra run (run 5, truly cold smoke). It costs seconds and removes the doubt in run 3.
2. The brief's mention of a capture script and a handshake wire diff does not apply: the plan has no
   such step, so none was run.
3. The log files, the baseline and after-install audit text, and the lockfile copy are under `tmp/`
   (git-ignored) and not committed.

No other deviation.

## Independent diff review (lead)

Reviewer: Codex frontier, `gpt-6-astra`, high effort, agentpc `t1yc`. Verdict **PASS**, with no
blocker, major or minor finding and 4 confirming notes ([DIFF-REVIEW.md](DIFF-REVIEW.md)):
- the lockfile matches this record, with registry integrity checked for all 12 added or updated
  entries;
- a rebuild gives the same `dist/server.js` and `.map` hashes;
- `test:smoke` passes 173 tests, and no test is edited;
- the flake TODO checks out against CI run 44223760712, attempt 1.

Nothing to reconcile.

The lead re-ran the gates bare on the final tree:
- typecheck;
- test (4190 passed);
- build (same bundle hash);
- smoke (173 passed);
- secrets.

All exit 0.
