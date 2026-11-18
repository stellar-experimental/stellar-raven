# Review: item 7.3 PR 1 plan (routine dependency patches)

Reviewer: Claude Fable 5.2 (tier "Claude Fable", high effort), read-only plan review, 2026-11-18.
Reviewed `PLAN.md` at `origin/main` `a0156b2b` against the repository, the npm registry and the
upstream release notes.

## How the findings were checked

- Registry metadata with `npm view`. All eleven target versions exist and are the `latest`
  dist-tags, except `@cloudflare/workers-oauth-provider`, where 0.10.4 is the last 0.10 release and
  `latest` is 1.2.4.
- The three install commands from step 2, run with `--package-lock-only --ignore-scripts` on a
  copy of `package.json` and `package-lock.json` in the session scratchpad. Nothing was installed and
  the worktree was not touched. Findings 1, 2 and 6 come from that resolved lockfile.
- Target tarballs unpacked in the scratchpad and diffed against the installed `node_modules` copies
  (`workers-ai-provider`, `@cloudflare/workers-oauth-provider`, `@modelcontextprotocol/sdk`), plus
  the shipped `CHANGELOG.md` files for the AI SDK packages and acorn, and the GitHub release notes
  for esbuild and the OAuth provider.
- Not run: `npm run build`, any test lane, the Playground capture itself. `dist/` does not exist in
  this worktree, so "bundled in the Worker" below is read from import chains, not from a bundle.
- One slip to report: an early `rg` call passed the shell glob `eval/*.mjs`. It expanded only to
  top-level script files and returned no eval lines. Later searches used plain paths.

## Findings

### 1. Blocking: `@modelcontextprotocol/sdk` 1.32.2 is in the Worker and breaks the `agents` peer pin

The table says "no (eval harness)". Three facts contradict it:

- `src/server.ts:11` imports `createMcpHandler` from `agents/mcp`, and
  `node_modules/agents/dist/mcp/index.js:7-11` imports `@modelcontextprotocol/sdk/types.js`,
  `server/mcp.js`, `server/index.js` and `server/webStandardStreamableHttp.js`. The lockfile entry
  for the SDK carries no `dev` flag for the same reason.
- `agents@0.28.1` declares the non-optional peer `"@modelcontextprotocol/sdk": "1.32.1"`, an exact
  pin. The step 2 command resolves, but with
  `npm warn ERESOLVE overriding peer dependency ... peer @modelcontextprotocol/sdk@"1.32.1" from agents@0.28.1`.
- 1.32.2 is not type-only. `dist/esm/server/mcp.js` gains constructor code that registers the
  tool, resource and prompt request handlers when the options declare those capabilities. The rest
  of the diff is `| undefined` on optional members in `shared/transport.d.ts`.

`agents@0.33.0` pins the SDK peer at `1.32.2`, so the bump belongs with PR 2.

Fix: remove `@modelcontextprotocol/sdk` from the table and from the third `npm install` line of
step 2. Add it to the PR 2 scope in `items/7.3/README.md`.

### 2. Blocking (plan text): the `esbuild` bump moves 54 lockfile entries outside the named set

Resolved lockfile after `npm install -D -E esbuild@0.28.2`:

- removed: `node_modules/wrangler/node_modules/esbuild` and its 26 `@esbuild/*` platform packages
  (0.28.2). `wrangler@4.153.0` pins `esbuild` `0.28.2`, so its copy dedupes to the root.
- added: `node_modules/@cloudflare/vitest-pool-workers/node_modules/esbuild` and 26 `@esbuild/*`
  packages at 0.28.1. The pool pins `esbuild` `0.28.1` exactly.

As written, step 2 ("explain any other entry, or revert it") and the third stop-rule bullet both
fire on this. The bump also buys little: the Worker is already bundled with 0.28.2 through
wrangler's own copy, the nested copy only changes owner, and the test pool stays on 0.28.1. The
root copy serves `scripts/run-mcp-surface.mjs:7`, `scripts/lib/stellar-community.mjs:4`, `agents`
and `vite`.

Fix (recommended): drop `esbuild` from PR 1 and take it in PR 4, where the `wrangler` and pool pins
move together. Alternative: keep it, and list these 54 entries in step 2 as expected and exempt
from the stop rule.

### 3. Blocking: step 3 as written cannot reach four of the five transports with production code

The plan says to use a stubbed `fetch` and the production builders "as
`test/smoke/demo-openai-tool-request.test.ts` does". That pattern works for one transport only.

- Only the OpenAI Responses factory is exported (`openAiResponses`, `src/demo/model-config.ts:33`).
  The Anthropic factory `cloudflareAnthropic` and its `normalizeAnthropicFetch` body rewrite are
  module-private (`src/demo/chat.ts:505-548`). Grok and Gemini go through the
  `workers-ai-provider/openai` and `workers-ai-provider/google` plugins (`chat.ts:18-19`,
  `273-277`). Kimi has no `fetch` at all: it is `binding.run` (`chat.ts:283-286`).
- The smoke file calls the factory with `modelId: "gpt-5.6-terra"` (line 60). Production sends
  `openai/gpt-6.1-terra` (`model-config.ts:14`). `@ai-sdk/openai` carries separate literals for
  `gpt-5.6-terra` and `gpt-6.1-terra` in both 4.0.108 and 4.0.121, and this range refactors that
  model catalog (4.0.110, 4.0.118, 4.0.120). I did not trace whether the two ids get different
  request fields, so the Risks line "the smoke pins cover the OpenAI primary" is unproven for the
  production id.
- With "if a transport cannot be captured cheaply, say so and skip it", the likely result is that
  the Anthropic fallback, which production reaches, gets skipped.

Fix: capture at the AI binding, not at `fetch`. `test/demo-model-config.test.ts:373-527` already
shows the pattern: a stub binding with `run` (Kimi, and Anthropic, whose settings omit `transport`)
and `gateway(id).run` (OpenAI, xAI, Google), passed to `createWorkersAI` with
`demoGatewayOptions`, the production slugs (`DEMO_PRIMARY_MODEL`, `DEMO_FALLBACK_MODEL`,
`DEMO_GROK_CONTROL_MODEL`, `DEMO_KIMI_CONTROL_MODEL`, one `google/` slug), `demoModelSettings`,
`demoAnthropicProviderOptions`, `demoOpenAiProviderOptions`, `DEMO_SYSTEM_PROMPT`,
`buildDemoTools` and `prepareDemoStep`. Record the whole captured entry (endpoint, headers, body).
Details the plan should state:

- Register `openAiResponses` for the primary and the `workers-ai-provider/openai` plugin for Grok:
  `demoEffectiveOpenAiApiMode` returns `chat` once an `xai/` slug is in the list.
- Copy `cloudflareAnthropic` and `normalizeAnthropicFetch` into the script, and say so in EXEC.md.
  The copy is identical in both runs, so the before/after diff stays valid. Do not export them from
  `src/` for a throwaway script.
- Runner: root `vitest.config.ts:20` excludes `tmp/**` and the smoke config includes only
  `test/smoke/**/*.test.ts`, so neither lane picks up a file under `tmp/`. Use a one-off config in
  `tmp/` that reuses the root `cloudflare:workers` alias and includes the capture file, and run
  `npx vitest run --config tmp/<name>.config.ts`. `test/demo-chat.test.ts` shows `buildDemoTools`
  works in plain-Node vitest with a stub env.

### 4. Non-blocking: a first-request diff misses two kinds of change in this range

- Follow-up requests. `@ai-sdk/openai` 4.0.113 changes parallel-tool wrapper metadata that is
  replayed on later Responses requests, and `ai` 7.0.163 / `@ai-sdk/anthropic` 4.0.97 (`fd7e8a7`)
  change which provider metadata and signature text go back in the next request. The smoke file
  pins the OpenAI tool loop. Nothing pins the Anthropic one.
  Fix: for the Anthropic fallback, capture two requests (one canned tool call, then the follow-up).
  First request only is enough for the Grok, Kimi and Google controls, which run only under
  `DEMO_MODEL_OVERRIDE`.
- Response handling, which no request diff shows. `@ai-sdk/openai` 4.0.110 (`6b97088`) parses
  Responses API refusals: the refusal becomes text and the finish reason becomes `content-filter`.
  Before, the streamed refusal events were dropped and the text was empty. In `src/demo/chat.ts`
  that turns a refused primary turn from "no useful output, fall back to Haiku" (`chat.ts:410-412`)
  into "show the refusal and finish" (`text-delta` sets useful output; the `done` frame carries
  `content-filter`, which `src/demo/page.ts:768-771` does not special-case). The same release does
  the equivalent for Chat Completions, which the Grok control uses.
  Fix: record this in EXEC.md as an accepted Playground behavior change, or stop for the lead if it
  is not wanted. No listed gate will show it.

### 5. Non-blocking: table and step 4 statements to correct

- `@ai-sdk/google` is "yes", not "yes, if imported": `src/demo/chat.ts:19` imports
  `workers-ai-provider/google` and registers it at line 276.
- The table omits three bundled transitive packages that move: `@ai-sdk/provider` 4.0.35 to
  4.0.39, `@ai-sdk/provider-utils` 5.0.74 to 5.0.82 and `@ai-sdk/gateway` 4.0.135 to 4.0.149.
  `provider-utils` holds the tool-schema conversion and input validation (5.0.79 moves internal
  schemas to Zod Mini; 5.0.82 fixes Standard Schema results). List them so step 2 has an expected
  set.
- `undici` 7.30.1 gains the `dev` flag: `provider-utils` 5.0.80 dropped its `undici` dependency and
  only `miniflare` still needs it. Expected; list it.
- "`acorn` is used only by the vendored `normalizeCode`" is wrong. It is also imported by
  `src/demo/tools.ts:27`, reached by `src/executor/spec-sandbox.ts` through `normalize.ts` (the
  `execute` path), required by `@cloudflare/codemode` 0.5.6 (`acorn ^8.17.0`, deduped to the root
  copy) and by `scripts/lib/stellar-community.mjs:3`. The listed gates already cover these
  (`npm test` includes `test/stellar-community.test.mjs`; `test:smoke` covers the executor), so
  only the sentence changes. 8.19.0 is Unicode 18 plus three stricter-parse fixes.
- `workers-ai-provider` 4.0.1 changes no runtime code: the `dist/*.mjs` files differ from 4.0.0
  only in `@deprecated` JSDoc. After the bump, `eval/playground/README.md:77` ("the installed
  `workers-ai-provider@4.0.0`") and the comment at `src/demo/eval-cost.ts:154` are stale.
  Fix: update both lines in this PR. The README is under `eval/`; CI's eval lane
  (`ci.yml:100-102`) covers that edit.

### 6. Non-blocking: `@cloudflare/workers-oauth-provider` 0.10.4 carries no auth-boundary risk

The plan's claim holds. The whole 0.10.3 to 0.10.4 diff in `dist/oauth-provider.js` is a new
constant `EMA_JTI_MIN_TTL_SECONDS = 60` and `Math.max(EMA_JTI_MIN_TTL_SECONDS, exp - now)` for the
ID-JAG replay marker. The floor only lengthens the marker's life. The code runs only when
`options.enterpriseManagedAuthorization` is set (`dist/oauth-provider.js:1360-1366`), and
`oauthProviderOptions` in `src/auth/gate.ts:46-90` does not set it. The repository's published
advisories (two, both fixed in 0.0.5) do not affect 0.10.x.

One sentence for EXEC.md, so the PR is not read as more than it is: 0.10.4 is the end of the 0.10
line, and the token-endpoint hardening in 1.0 to 1.2.4 (for example #368 `invalid_scope`, #371
grant expiry, #374 registration body cap) is not backported. That stays PR 5.

### 7. Non-blocking: gates and AGENTS.md items

- Node version. This machine has only Node v26.13.0 with npm 11.20.0. `.nvmrc` says 24, `engines`
  says `>=24 <25`, and CI runs Node 24. Every npm command prints `EBADENGINE`, and local gates are
  not CI parity. Fix: record the Node and npm versions in EXEC.md and name the CI run as the gate
  of record for the lockfile.
- The steps end at "Commit". AGENTS.md makes the independent review of the diff a completion gate
  and wants the reviewer's tier, model and effort recorded. Add that step, and say which file holds
  it, since this file is the plan review.
- Deploy pre-check. AGENTS.md names "a dependency update that changes the model-facing request
  while free gates stay green" as a thing to report before deploy. "Merge, then deploy. No owner
  question." should depend on EXEC.md stating the step 3 result per transport, including any
  transport that was skipped.
- Skipping the routing gate and `eval:selftest` locally is fine: CI runs both on every PR
  (`ci.yml:100`, `114`).
- The lockfile resolves to a single copy each of `@ai-sdk/provider` and `@ai-sdk/provider-utils`,
  and `workerd` does not move, so no extra duplicate-package gate is needed.

### 8. Non-blocking, outside PR 1: README rows 2 and 3 are coupled

`agents@0.33.0` pins `@modelcontextprotocol/client` and `/server` at `2.4.0` and the SDK at
`1.32.2`, all exact peers. Row 2 (`agents`) cannot land before row 3 (MCP 2.4.0) without the same
peer override as finding 1. Merge rows 2 and 3, with the SDK bump, into one PR.

## Verdict

Not ready as written: fix findings 1, 2 and 3 in PLAN.md (drop the MCP SDK and esbuild bumps,
capture at the AI binding with production slugs), then the remaining nine packages are fine to
execute.
