# Item 7.3 PR 1 independent diff review

Verdict: **PASS, with minor evidence-record corrections below.** No blocker or major runtime defect found. This is a code-review verdict, not a substitute for the required Node 24 CI gates or the lead's deploy pre-check.

Reviewed 2026-11-18: `origin/main` `a0156b2b749c16b964608401b4a492aa8a354e20` to HEAD `7d41ecf963ba514639eaf2c1e7872ee17678c0d4`.
Reviewer: Codex, independent of the Sonnet author and Opus lead. The lead should record the exact model, tier and effort from this lane's launch record; PLAN step 9 has conflicting Opus/Codex wording. No other agent was spawned. No tracked files changed, installs, dev servers, model calls, paid calls, commits, pushes, or deploys. Scratch artifacts are under `tmp/`.

## Numbered findings

1. **Minor — `pr1-routine/EXEC.md`, Step 3; `tmp/capture/capture.test.ts:205`. The Grok capture supplies an explicit reasoning setting that the default production override does not.** The capture passes `DEMO_REASONING_EFFORT` (`none`) to `demoOpenAiProviderOptions` for xAI, producing `reasoning_effort: "none"`. Production `src/demo/chat.ts:293-296` leaves chat reasoning undefined unless the environment or model configuration explicitly supplies it. A plain `DEMO_MODEL_OVERRIDE=xai/grok-4.6` therefore omits this field. The comparison is valid for the explicitly configured `none` scenario, but “production values” overstates coverage of the default control configuration. **Fix:** qualify that scenario in EXEC, or capture the unset-effort variant using the same production selection rule. No runtime change is requested; this does not invalidate the primary or Anthropic comparison.

2. **Minor — `pr1-routine/EXEC.md`, Step 3 capture additions. The extra OpenAI request does not exercise the parallel-wrapper change cited as its reason.** `oaiToolStep` emits one ordinary `search` function call. The changed SDK path (`@ai-sdk/openai/dist/index.js:5696-5745`) recognizes a function named `parallel` with nested `tool_uses` and only emits the wrapper input on the first expanded call. Neither the capture nor `test/smoke/demo-openai-tool-request.test.ts` supplies that wrapper. The observed ordinary follow-up is unchanged; parallel-wrapper replay has not been demonstrated by this capture. **Fix:** qualify the claim to “ordinary function-call follow-up”; if the lead wants explicit coverage of 4.0.113, add a scratch before/after fixture containing a `parallel` wrapper with at least two declared recipients. No evidence here establishes a parallel replay regression.

3. **Minor — `pr1-routine/EXEC.md`, lockfile entry list, and `pr1-routine/PLAN.md`, later-PR references.** A full-object comparison of every `packages` entry, including `resolved` and `integrity`, finds **14 changed entries including root, 13 under node_modules**, not 15. No entries were added or removed; the table itself lists the correct set. PLAN calls the Wrangler/esbuild work PR 4 and OAuth 1.x PR 5, whereas the revised item README assigns them PR 3 and PR 4. **Fix:** correct the count and align the current plan's references with the README; retain historical review text as history.

4. **Note — `pr1-routine/EXEC.md`, audit evidence. The current registry reports nine high findings, but this is not a dependency-bump regression.** `npm audit` now includes `@vitest/mocker` in the same GHSA-fc5q-39xc-vjpf/picomatch chain. Running `npm audit --prefix tmp/review-baseline` with `origin/main`'s exact package and lock files returns the same nine affected packages and “No fix available.” Both commands exit 1. The saved `tmp/capture/audit-after.txt` does show the eight reported during execution. **Fix:** append the current paired-baseline result rather than silently rewriting the historical eight. The stop condition for a newly introduced vulnerability is not triggered by this paired comparison.

5. **Note — `pr1-routine/EXEC.md`, upstream security-change accounting.** `@ai-sdk/provider-utils` 5.0.80 explicitly removes default Node DNS-pinned downloading; 5.0.78/80 also tighten MCP OAuth discovery fetch requirements. This is more than an undici dependency-flag change, though I found no affected application path: `parseChatBody` accepts only user/assistant string content and reconstructs those messages, demo tools return ordinary results, the app uses no SDK MCP OAuth client, and `wrangler.jsonc` enables `global_fetch_strictly_public`. The execute workers still pin `globalOutbound: null`. Separately, `ai` 7.0.171 changes default UI-message tool-error redaction, but this app consumes `fullStream` directly and never calls `toUIMessageStream`/`toUIMessageChunk`. **Fix:** add these reachability conclusions to the dependency review record; no application change or new paid validation is justified by these changes.

## Independent checks

- Read the complete scoped diff, PLAN, REVIEW, EXEC and the brief; inspected installed changelog ranges for ai, all moved @ai-sdk packages and acorn, plus relevant installed implementation and app call sites.
- Nine direct ranges move as planned. Three SDK transitives move, and undici only gains `dev: true`. MCP SDK, esbuild and workerd versions remain unchanged. Downloaded each of the twelve changed-version tarballs directly from its exact npm registry `resolved` URL and recomputed SHA-512: every digest matches its lockfile integrity. Also verified the baseline runtime tarball digests before comparing their contents. No package lifecycle scripts ran.
- OAuth 0.10.3 to 0.10.4 runtime diff is exactly the new 60-second constant and JTI TTL floor. The app does not enable `enterpriseManagedAuthorization`; the new code is inactive. This patch does not supply the deferred OAuth 1.x hardening.
- All six workers-ai-provider runtime `.mjs` modules match after removing comments and normalizing generated chunk hashes. Its registry deprecation is real, already recorded, and not a runtime change.
- Acorn 8.19 adds Unicode 18 and tightens three malformed-expression cases; no sandbox/network policy change. SDK additions to provider tools, realtime, extraction and media APIs do not register new application tools or alter the MCP manifest.
- `npm run -s mcp:surface -- --json`: exit 0; surface `815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07`; instructions `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00`.
- `npm ls workerd`: exit 0; only 1.20261023.1, deduped through miniflare and wrangler.
- Capture rerun via owned hc terminal `t1xd` (`pr1-review-capture`): exit 0, one test passes. `tmp/review-capture.json` is identical to the author's after file. The saved before file SHA-256 matches EXEC. Comparing parsed before/after entries finds exactly the four documented user-agent changes. Counts are 2 primary, 2 Anthropic, 1 Grok, 1 Google, 1 Kimi. The stub error responses do not establish successful Google/Grok response parsing, which is outside this request-shape check.
- Existing `dist/server.js` is exactly 9,219,833 bytes with SHA-256 `365baa2a7ae3c6b9f40253a570104cc016613467b3edb94aa9c54dcfb5142e2a`, matching EXEC.
- The recorded OpenAI refusal behavior agrees with the installed changelog and the app's useful-output/fallback control flow. It remains an accepted response-side change, not a request-capture result.
- Did not rerun the full typecheck, unit, smoke, build or eval selftest lanes: the brief requests cheap independent checks and the author already reports those gates. Their execution success is not independently certified here. Node 24 CI remains the lockfile gate of record. No QA case text or QA lint was accessed.

## Cheap bundle-growth attribution

The 204,788-byte bundle increase is consistent with the bundled SDK growth, not a new dependency subtree. The current source map includes all of these packages. Published `dist/index.js` size deltas are:

| Package | Bytes added |
|---|---:|
| ai | 53,966 |
| @ai-sdk/openai | 41,334 |
| @ai-sdk/google | 20,547 |
| @ai-sdk/anthropic | 16,355 |
| @ai-sdk/gateway | 13,747 |
| @ai-sdk/provider-utils | 10,592 |
| Total of these six entry files | 156,546 |

Across all shipped JS modules, including their internal modules and alternate builds, these six packages grow by 276,697 bytes. OAuth adds 142 bytes; workers-ai-provider adds comments and changed chunk references. These are package-file measurements, **not exact generated-bundle contributions**: tree shaking, added internal modules, Zod Mini imports and bundler formatting affect the output. I did not rebuild an old dependency installation or spend longer obtaining a byte-exact attribution. Nothing in this check suggests a new bundled dependency, and size alone is not a blocker.
