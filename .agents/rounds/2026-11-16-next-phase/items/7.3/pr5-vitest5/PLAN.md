# Item 7.3, PR 5: `vitest` 5

Branch `np/7.3-deps-vitest5` in `/home/tyler/code/raven-wt/np-7.3`, from `origin/main` `b49675e3`
(PR 4, #484, merged and deployed as version `9f01ae3e`). The orchestrator approved this PR after
PR 4. Revised after the Fable plan review ([REVIEW.md](REVIEW.md)): every finding is adopted, and
the table at the end lists them.

## Decision

Move the test runner from `vitest` 4.1.12 to 5.1.0. The orchestrator's note said "vitest 5 waits,
unless the pool supports it by then". `@cloudflare/vitest-plugin` 1.8.4 (PR 3) declares the peer
range `vitest ^4.1.0 || ^5.0.0`, and has since 1.4.0.

The alternative is to stay on 4.1.12. Take the update if both lanes pass with no loss of coverage:
the same test count, and no assertion weakened to make a test pass.

This is a dev-only change. **The Worker bytes should not change, so no deploy should be needed**;
step 5 checks it. Expected cost: USD 0, about an hour.

The orchestrator also asked to record a CI flake (step 6).

## Packages

| Package | From | To |
|---|---|---|
| `vitest` (dev, caret) | ^4.1.12 | ^5.1.0 |

Transitive changes. These come from the reviewer's lock-only resolution; the real install must
confirm them, and any other change is a stop.

| Kind | Entries |
|---|---|
| Removed (8) | `@vitest/expect`, `@vitest/pretty-format`, `@vitest/runner`, `@vitest/snapshot`, `@vitest/utils`, `tinyrainbow`, `siginfo`, `stackback` |
| Added (1) | nested `vitest/node_modules/obug` 3.0.0 |
| Version changed | `@vitest/mocker` and `@vitest/spy` to 5.1.0; `magic-string` 1.4.5; `@jridgewell/sourcemap-codec` 1.6.0 (not bundled); `es-module-lexer` 2.3.2; `@types/estree` 1.0.10; `std-env` 4.3.0; `tinybench` 6.2.3; `tinyexec` 1.3.1; `why-is-node-running` 3.2.1 |
| Flag only | `vite` and 35 entries beneath it gain `peer: true` |
| Unchanged | one `workerd`; `picomatch` 4.0.7 |

## Upstream breaking changes to check

From `docs/guide/migration/index.md`, "Migrating to Vitest 5.0". Each needs a search and a result in
EXEC.md.

The reviewer already ran each check. The executor confirms each result in EXEC.md.

| Change | Reviewer's result |
|---|---|
| `fsModuleCache` on by default (`node_modules/.vitest-cache`); not in the guide | CI always runs cold and local reruns run warm. Plugin issue workers-sdk #16349 is open: a warm-module reply above 32 MiB kills the runner. Covered by the cold and warm runs in step 3 |
| `clearMocks` on by default. It clears recorded call history; implementations stay | A measured plain-Node run on 4.1.12 with `clearMocks: true` matched the baseline: 4190 passed. A hit is fixed by recording the call inside the test that asserts on it |
| Hoisted `vi.mock` must be at the top level | 24 `vi.mock` and 2 `vi.hoisted` calls, all at the top level |
| Class mocks keep prototype methods: `vi.fn(Class)`, `vi.spyOn(obj, "Class")`, `mockImplementation(class …)` | No hits |
| Unawaited asynchronous assertions fail | 140 `.resolves`/`.rejects`, all awaited or returned. Three are awaited after advancing fake timers (`test/demo-eval-cost.test.ts:244`, `test/usage.test.ts:121`, `:203`); 5.1.0 checks at test end, so they pass |
| `toThrow("")`, `expect.poll`, `sequential`, worker and pool IDs | None |
| Removed entry points | `test/` imports only `vitest` and `vitest/config`. The plugin's `vitest/runtime`, `/worker` and `/node` exist in 5.1.0 |
| Config lookup from parent directories | Not affected. `usage/report-site` uses `node --test` |
| `.vitest/` reports; `json` and `junit` reporters | Nothing writes there; no reporter is configured |
| DOM environment | No `@vitest-environment`; `happy-dom` is used as a library only |
| Fake timers mock `Temporal`; `pretty-format` titles; 5.1.0 fakes `node:timers` | No `Temporal` or `node:timers` use. About 40 `it.each` titles change name, not count |
| `-t` joined with ` > `; inline projects; benchmark API; assertion types; `resolveConfig`, `populateGlobal`; `vite` a required peer | Not used. npm installs `vite` |

Searches use `rg --hidden -g '!.git'` with plain paths.

## Steps

1. **Baseline** on the untouched branch. Node 24 is not on this box, so the local evidence is Node 26.
   Before the merge, the lead compares the CI log's counts with the baseline. Record:
   - `node -v` and `npm -v`;
   - the pass, skip and expected-fail counts for `npm test` and `npm run test:smoke`;
   - `sha256sum dist/server.js dist/server.js.map` after `npm run build`. Use the same Node and the
     same directory each time, because the map holds paths;
   - `npm audit` (the advisory set).
2. **Install:** `npm install -D vitest@5.1.0`, the exact version. npm writes `^5.1.0`. The
   unreviewed 5.1.1 changes source-map transport, the path the plugin proxies. Record the resolved
   version from the lockfile. `git diff package.json` must show one line. There must
   be no `ERESOLVE`. Check that `@cloudflare/vitest-plugin` accepts it with no peer warning.
3. **Run both lanes twice, cold then warm, and fix what the breaking changes explain.**
   - Run `rm -rf node_modules/.vitest-cache`, then `npm test`, `npm test`, `npm run test:smoke` and
     `npm run test:smoke`. Record all four counts.
   - Then run `git status --short`, which must be clean.
   - If the smoke lane fails, run `test/smoke/oauth-identity.test.ts` first and record its result by
     name. It has the factory mock and the on-demand `import()` that had 5.1 regressions upstream.
   - Edits stay in `test/`, the two vitest configs and, if needed, `.gitignore`.
   - No `src/` change. A `src/` change, or any failure the migration guide does not explain, is a
     stop.
   - Record each fix in EXEC.md with its migration-guide heading. The reviewer expects none.
   - Never delete or skip a test, and never weaken an assertion. If a test cannot be migrated
     faithfully, stop.
4. **Equal coverage.** The `npm test` and `test:smoke` counts (passed, expected fail, skipped) must
   equal the baseline. Explain any difference by name.
5. **Gates, bare, on the final tree:**
   - `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`,
     `npm run secrets:scan -- --tree`;
   - one `workerd` copy;
   - `npm audit` paired with `origin/main`: no new advisory. Record whether the picomatch chain
     changes; `vitest` 5 still depends on `picomatch` ^4.0.7;
   - `dist/server.js` and `dist/server.js.map` SHA-256 equal to the baseline, which also shows the
     MCP surface is unchanged. If they differ, stop: a test-runner bump must not change the Worker.
6. **The CI flake** (orchestrator, 2026-11-18). On #484's first CI run,
   `test/qa-judge-evidence.test.mjs:1519` failed: `largeMs / smallMs` was 8.41 against `< 8` (block
   lines 1505-1520). The rerun passed.

   Add a TODO item under "Eval instruments", "Stabilize the timing-ratio assertion in
   `test/qa-judge-evidence.test.mjs`". It gives:
   - **the observation:** the date, PR #484, the failed run's URL (`gh run list --branch
     np/7.3-deps-oauth`, then the failed attempt), the ratio, and the rerun pass;
   - **the scope:** line 1519, and line 1518 (`largeMs < 250`), which is also a single wall-clock
     sample. The other timed assertions in the file (lines 715, 1587, 1808, 1821) are named as out of
     scope;
   - **the approach:** count work instead of time where the scanner allows it. Otherwise use the
     minimum of several runs, because noise only adds time;
   - **done when** no assertion in that block compares a single timed sample.

   **Do not change the test in this PR.** A failure of this one assertion during step 5 or in CI is
   the known flake: rerun once and record it.
7. **Records.**
   - Write `EXEC.md`.
   - Add the step 6 TODO item.
   - In `.agents/TODO.md` Dependencies, the standing note "Move `wrangler`, `miniflare`, and
     `@cloudflare/vitest-plugin` together" gains a clause that `vitest` is on 5.x and within the
     plugin's peer range.
   - In `items/7.3/README.md`, row 4 becomes "merged, #484, deployed `9f01ae3e`", and row 5 gets
     the `pr5-vitest5` link and its status.
   - `test/README.md` does not name the version, so it needs no edit.
8. **Commit** on `np/7.3-deps-vitest5` with the normal hooks:
   `vitest 5.1.0 (round item 7.3, PR 5)`.
9. **Independent diff review** (the lead runs it): Codex `gpt-6-astra` at high effort. It checks
   that no assertion was weakened and that every fix maps to a migration-guide item.

## Stop rule

Stop and report to the lead if any of these happens:
- a failure the migration guide does not explain. The known flake at
  `test/qa-judge-evidence.test.mjs:1519` is excepted: rerun once and record it;
- workers-sdk #16349 symptoms: `Message is too large`, WebSocket status 1009, or
  `Worker exited unexpectedly during started state`. These are a stop, not a migration fix. The
  candidate workaround is `fsModuleCache: false` in `test/smoke/vitest.config.ts`. It works around
  a plugin bug, so the lead decides whether to take it or stay on 4.1.12;
- a needed `src/` change;
- a test that cannot be migrated without weakening it;
- a count difference that cannot be explained;
- a change in the `dist/server.js` or `dist/server.js.map` hash;
- a new `npm audit` advisory;
- an `ERESOLVE` or peer conflict with the plugin.

If `vitest` 5 cannot land cleanly, record why in the TODO Dependencies section and stay on 4.1.12.

## Model-facing check

None. The unchanged bundle hash shows it.

## Needs from the orchestrator

Merge. No deploy is expected; step 5 confirms it.

## Review reconciliation

| Finding | Disposition |
|---|---|
| 1 Cold and warm runs; #16349 (blocking) | Adopted: step 3 and the stop rule |
| 2 What `clearMocks` actually clears | Adopted: table |
| 3 Class-mock forms | Adopted: table |
| 4 Missing rows | Adopted: table |
| 5 Results per row | Adopted: table; the executor confirms each |
| 6 Transitive list | Adopted: Packages |
| 7 Exact version 5.1.0 | Adopted: step 2 |
| 8 Plugin issues; run `oauth-identity` first on a failure | Adopted: step 3 |
| 9 Node 26 locally | Adopted: step 1; the lead compares with the CI counts |
| 10 Hash the source map too | Adopted: steps 1 and 5 |
| 11 `eval:selftest` and `mcp:surface` add nothing here | Adopted: dropped |
| 12 Flake TODO wording; flake excepted from the stop rule | Adopted: step 6 and the stop rule |
| 13 README rows; commit title | Adopted: steps 7 and 8 |
