# Review: item 7.3 PR 5 plan (`vitest` 5)

Reviewer: Claude Fable 5.2 (tier: Claude Fable), read-only, 2026-11-18. Plan reviewed: `PLAN.md` in
this folder at branch `np/7.3-deps-vitest5`, `b49675e3`.

## Summary

The plan is sound and the bump looks clean for this repository. I found no test that needs an edit.
One finding is blocking: the plan runs each lane once, and `vitest` 5 turns on a disk module cache
that CI never exercises. The rest are corrections to the plan's table and gates.

What I did not do: I did not install or run `vitest` 5. Everything about the smoke lane under
`vitest` 5 comes from reading the plugin tarball, the changelog and upstream issues.

## Evidence gathered

- **Sources read.** The migration guide, the release notes for 5.0.0 to 5.1.0 and for the 5.1.1
  tag, and the `@cloudflare/vitest-plugin` 1.8.4 and `vitest` 5.1.0 tarballs.
- **Lockfile.** `npm install -D vitest@^5.1.0 --package-lock-only --ignore-scripts` on a scratch
  copy exits 0, with no `ERESOLVE` and no peer warning. `package.json` changes on one line.
  Finding 6 lists the lockfile changes.
- **`clearMocks`, measured.** I ran the plain-Node lane on the installed `vitest` 4.1.12 with a
  scratch config identical to `vitest.config.ts` plus `clearMocks: true`. Result on Node 26.13.0:
  174 files passed and 5 skipped (179); 4190 tests passed, 3 expected fail, 8 skipped (4201);
  exit 0; 43 seconds. The log has no "not awaited" or hoisting warning. If the lead's step 1
  baseline shows the same counts, the new default costs this lane nothing.
- **Bundle.** `dist/server.js.map` lists 22 bundled packages. None of them is a package the lockfile
  changes or removes.

## Findings

### 1. Run each lane twice, cold cache then warm cache (blocking)

`vitest` 5 enables `fsModuleCache` by default and stores it in `node_modules/.vitest-cache`. CI
installs with `npm ci` and caches only the npm download cache, so CI always runs cold. Every local
rerun runs warm. The plan's single run per lane therefore covers only the path CI sees.

The plugin handles cached modules in its own code (`inlineCachedModules` in `dist/pool/index.mjs`),
and that code has a bug history under `vitest` 5:

- workers-sdk #16237 (closed, fixed in plugin 1.4.3): every test file failed under the default
  `fsModuleCache`.
- workers-sdk #16349 (open, reproduced on plugin 1.8.1 with `vitest` 5.1.0): the warm-module reply
  has no size limit, and a reply above workerd's 32 MiB WebSocket limit kills the runner from the
  second test file on. Plugin 1.8.4 still has no limit; I checked the tarball.

This repository is a candidate for #16349. All ten smoke files load the full Worker graph, which
builds to a 7.1 MB bundle with a 13.6 MB source map. I cannot tell from reading whether the reply
crosses 32 MiB.

Fix, in step 3 and step 5 of `PLAN.md`:

- Run `npm test` twice and `npm run test:smoke` twice in a row on the final tree. Record the counts
  of all four runs.
- Name the #16349 symptoms in the stop rule: `Message is too large`, WebSocket status 1009, or
  `Worker exited unexpectedly during started state`. That failure is a stop, not a migration fix.
  The candidate workaround is `fsModuleCache: false` in `test/smoke/vitest.config.ts`. It is a
  plugin-bug workaround, so the lead decides whether to take it or stay on 4.1.12.
- Run `git status --short` after the four runs and record that it is clean.

### 2. The `clearMocks` row describes the wrong effect (non-blocking)

`PLAN.md`, table row 1, says the change hits tests that set implementations or `mockReturnValue`
outside a test. The guide says the opposite: `clearMocks` clears recorded call history and leaves
implementations intact. The tests at risk assert on calls recorded outside the test body (module
top level, `beforeAll`, a setup file) or on calls carried over from an earlier test.

Fix: reword the row. The correct repair for a hit is to record the call inside the test that
asserts on it. Moving setup into `beforeEach` does not restore cleared history.

Tests hit:

- Plain-Node lane: none, by the measured run above. That run includes the files with module-scope
  or hoisted mocks: `test/server.test.ts`, `test/search-page-size.test.ts`,
  `test/demo-chat.test.ts` and `test/site-lazy-counts.test.ts`.
- Smoke lane: none, by reading only. Every `vi.fn` and `vi.spyOn` in `test/smoke/` is created
  inside a test or a per-test fixture (`demo-eval-cost.test.ts`, `demo-tools.test.ts`,
  `executor-fixes.test.ts`, `host-routing.test.ts`). `oauth-identity.test.ts` records into a plain
  array, which `clearMocks` does not touch.

### 3. The class-mock row names classes the change cannot reach (non-blocking)

`PLAN.md`, table row 3, points at `vi.mock` of `DynamicWorkerExecutor`, `OAuthProvider` and
`WorkerEntrypoint`. The change applies to `vi.fn(Class)`, `vi.spyOn(obj, "Class")` and
`.mockImplementation(class ...)`. The repository's mocks of those three are plain classes returned
from `vi.mock` factories. A search of `test/` finds no `vi.fn(class`, no `vi.fn(SomeClass)` and no
`mockImplementation(class`.

Fix: change the row's check to those three forms and record "no hits".

### 4. Rows the table is missing (non-blocking)

Add these rows to the table in `PLAN.md`. Each has a result already, so they cost EXEC.md one line
each.

| Change | Result in this repository |
|---|---|
| `fsModuleCache` is on by default (not in the migration guide) | See finding 1 |
| `-t` matches the name joined with ` > ` | No `-t` or `testNamePattern` in `package.json`, CI, `docs/`, `test/README.md` or the skills |
| Inline projects inherit the root config and share the Vite server | Neither config defines `projects` |
| Benchmark API rewrite | No `bench(` call |
| Assertion types take two parameters; `jest.Matchers` is not read | No `expect.extend`, `Assertion<`, `MockInstance` or `Mock<` in `test/`. `npm run typecheck` covers `test/**/*.ts`, not the `.test.mjs` files |
| `json` and `junit` reporters write to `.vitest/` instead of stdout | No reporter is configured in either config, the scripts or CI |
| `vite` is a required peer, no longer a dependency | npm installs it. The lockfile marks `vite` and 35 entries beneath it `peer: true` |
| `resolveConfig` and `populateGlobal` changes | Not used |
| 5.1.0 fakes `node:timers` and `node:timers/promises` | No `node:timers` import in `src/`, `test/`, `scripts/`, `eval/` or `usage/` |

### 5. Results for the rows the table already has (non-blocking)

Step 3 asks for a search and a result per row. These are mine, for the lead to confirm.

| Row | Result |
|---|---|
| Hoisted calls at the top level | 24 `vi.mock` and 2 `vi.hoisted` calls in 10 files. All start at column 0. No hit |
| Unawaited asynchronous assertions | 140 `.resolves` or `.rejects` uses. All are awaited or returned. Three store the assertion and await it after advancing fake timers: `test/demo-eval-cost.test.ts:244`, `test/usage.test.ts:121` and `:203`. `vitest` 5.1.0 checks at test end, so these pass. No hit |
| `toThrow("")`, `expect.poll` | None. `test/demo-page-browser.test.ts` uses `vi.waitFor`, which did not change |
| `sequential` | None |
| Worker and pool IDs | No `VITEST_WORKER_ID` or `VITEST_POOL_ID` use |
| Removed entry points | `test/` imports only `vitest` (188 times) and `vitest/config` (2). `scripts/`, `eval/`, `usage/` and `src/` import nothing from `vitest`. The plugin imports `vitest/runtime`, `vitest/worker` and `vitest/node`; all three exist in 5.1.0 |
| Config lookup from parent directories | Both scripts run from the repository root; the smoke lane passes `--config`. `npm --prefix usage/report-site test` runs `node --test`, not `vitest`, so it is not affected |
| `.vitest/` reports | Nothing writes there. The module cache goes to `node_modules/.vitest-cache`, which is ignored |
| DOM environment | No `@vitest-environment` and no `environment` option. `test/demo-page-browser.test.ts` imports `Window` from `happy-dom` as a library. No hit |
| Fake timers mock `Temporal`; `pretty-format` titles | Nine files use fake timers; none uses `Temporal`. No snapshot file and no snapshot matcher. About 40 `it.each` sites get new titles, which changes names and not counts |

### 6. The transitive list is incomplete (non-blocking)

`PLAN.md`, "Packages". The scratch resolution gives 360 lockfile packages before and 353 after.

- Removed (8): `@vitest/expect`, `@vitest/pretty-format`, `@vitest/runner`, `@vitest/snapshot`,
  `@vitest/utils`, `tinyrainbow`, `siginfo`, `stackback`. The plan expects only two or three of
  these, and says "`@vitest/*` move to 5.1.0"; only `@vitest/mocker` and `@vitest/spy` remain.
- Added (1): a nested `vitest/node_modules/obug` 3.0.0. The top-level `obug` 2.1.3 stays for Babel.
- Version changes: `vitest`, `@vitest/mocker`, `@vitest/spy` to 5.1.0; `magic-string` 0.30.21 to
  1.4.5; `@jridgewell/sourcemap-codec` 1.5.5 to 1.6.0; `es-module-lexer` 2.3.0 to 2.3.2;
  `@types/estree` 1.0.9 to 1.0.10; `std-env` 4.1.0 to 4.3.0; `tinybench` 2.9.0 to 6.2.3; `tinyexec`
  1.2.4 to 1.3.1; `why-is-node-running` 2.3.0 to 3.2.1.
- Flag only: `vite` and 35 entries beneath it gain `peer: true`.
- Unchanged: one `workerd` copy (1.20261117.1), `picomatch` 4.0.7, and `npm audit` at 8 high, all
  through GHSA-fc5q-39xc-vjpf.

`@jridgewell/sourcemap-codec` is the one changed package that is not dev-only. It is reached
through `agents`, `@rolldown/plugin-babel` and Babel, and it is not in the Worker bundle.

Fix: replace the transitive list with this one after the real install confirms it.

### 7. Install the exact version (non-blocking)

`PLAN.md`, step 2. GitHub has a `v5.1.1` release dated 2026-11-17. npm did not serve it at review
time; `latest` is 5.1.0. Once npm serves it, `npm install -D vitest@^5.1.0` resolves 5.1.1. That
version changes how source maps are sent to workers, which is the path the plugin proxies, and
nobody has reviewed it here.

Fix: run `npm install -D vitest@5.1.0`. npm still writes `^5.1.0` to `package.json`. Record the
resolved version from the lockfile in EXEC.md.

### 8. The plugin runs under 5.1.0, with one test to watch (non-blocking)

Support is real. The plugin's peer range accepts `^5.0.0`, its code branches on the `vitest` major
version, and its changelog carries `vitest` 5 fixes through 1.8.0. Its own development dependency
is `vitest` 5.0.4, so 5.1.0 is inside the declared range and outside what it is built against.

Upstream issues checked against this repository:

| Issue | State | Applies here |
|---|---|---|
| #16668, `vi.mock` factories fail under 5.1 | Fixed in 1.6.1 | Fixed. `test/smoke/oauth-identity.test.ts:17` is the one smoke test with a factory |
| #16252, CommonJS in inline projects | Fixed in 1.8.0 | No inline projects |
| #16331, `cloudflare:test` in a setup file | Open | No `setupFiles` |
| #16850, Durable Object on-demand `import()` under 5.1 | Open | No Durable Objects and no `setupFiles` |
| #16349, warm-module reply above 32 MiB | Open | Possible; see finding 1 |

`test/smoke/oauth-identity.test.ts` is the most exposed test. It mocks `src/executor/run` with a
factory, and `src/server.ts:70` loads that module with an on-demand `import()` inside the fetch
handler. Both mechanisms had 5.1 regressions upstream.

Fix: in step 3, run that file first when the smoke lane fails, and record its result by name in
EXEC.md. The plugin adds the `weak_ref` requirement for `vitest` 5; the Worker's compatibility date
of 2026-06-11 already satisfies it, so `wrangler.jsonc` needs no change.

### 9. Local Node is 26; CI and `.nvmrc` are 24 (non-blocking)

`node -v` in this worktree prints v26.13.0. `package.json` `engines` is `>=24 <25`, `.nvmrc` is 24
and `ci.yml` uses 24. `vitest` 5 behaves differently across the two: Node 26 has a global
`Temporal`, which fake timers now mock, and 5.0.0 changed worker start-up handling on Node 26.

Fix: run steps 1 to 5 under Node 24 if it is available. If not, say in EXEC.md that the local
evidence is Node 26 and compare the counts in the CI log with the baseline before merging.

### 10. Hash the source map with the bundle (non-blocking)

`PLAN.md`, steps 1 and 5. The "no deploy" expectation is sound: `src/` is untouched and no changed
package is bundled. The check is the right one. `wrangler.jsonc` sets `upload_source_maps: true`, so
a deploy uploads `dist/server.js.map` too.

Fix: record `sha256sum dist/server.js dist/server.js.map` before and after. Build both on the same
Node version and in the same directory, because the map holds paths.

### 11. Two gates add no visibility here (non-blocking)

`PLAN.md`, step 5.

- `npm run eval:selftest`. The stated reason does not hold: nothing in `eval/` or `scripts/` imports
  `vitest`. CI runs it on the PR anyway.
- `mcp:surface`. `src/` is untouched, and identical bundle bytes already show an identical surface.

Fix: drop both from the local sweep, or keep them and remove the reason given for the first. The
other gates are right. No gate is missing apart from finding 1.

### 12. The flake TODO wording (non-blocking)

`PLAN.md`, step 6. The assertion is at `test/qa-judge-evidence.test.mjs:1519`; the block is lines
1505 to 1520.

- **Scope.** Line 1518 (`largeMs < 250`) is also a single wall-clock sample, and the same file has
  more at lines 715, 1587, 1808 and 1821. Name line 1518 in the item and say the others are out of
  scope, or the fix will be one line.
- **Estimator.** Prefer the minimum of several runs to the median. Timing noise from garbage
  collection and preemption only adds time, so the minimum is the stable estimate. Counting work
  instead of time is better still, where the scanner allows it.
- **Done criterion.** "CI runs it green repeatedly" cannot be checked. Give a number, for example
  20 consecutive local runs under load, or make the criterion "no assertion compares one timed
  sample".
- **Observation.** Add the failed CI run's URL, so the 8.41 is checkable.
- **Local repeat.** Drop "note whether the flake reproduces locally under `vitest` 5". A few runs
  on an idle machine cannot reproduce a shared-runner flake, and the result changes no decision.
- **Stop rule.** State that a failure of this one assertion during step 5 or in CI is the known
  flake: rerun once and record it. Without that sentence the stop rule treats it as an unexplained
  failure.

### 13. Records (non-blocking)

- `.agents/rounds/2026-11-16-next-phase/items/7.3/README.md`: row 4 still says "design approved; PR
  open" and row 5 has no folder link. Add both updates to step 7.
- Step 8: earlier commits end "(round item 7.3, PR N)". Use "(round item 7.3, PR 5)".
- `test/README.md` does not name the `vitest` version, so that part of step 7 needs no edit.

## Verdict

Approve with changes: fix finding 1 before running the plan; findings 2 to 13 are corrections that
do not change the decision to take `vitest` 5.1.0.
