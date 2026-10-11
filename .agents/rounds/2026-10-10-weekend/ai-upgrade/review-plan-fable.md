# Review S: `ai` upgrade, tool strictness, and the pre-spend plan

Reviewer: Claude Fable 5.1, independent of the author (Claude Opus 5.5, lane S).
Worktree: `/Users/kalepail/Desktop/raven-w1010-s`, branch `w1010/s`, head `3bf1e239`.
Diff reviewed: `git diff d15a4ce5..w1010/s`. I re-derived each claim from the branch and the installed packages.
No paid call ran. No server started. The worktree is clean after the review (`git status --porcelain` prints nothing).

## Gates I ran

| Command | Exit | Result |
| --- | --- | --- |
| `npm run typecheck` | 0 | clean |
| `npm run test:smoke` | 0 | 8 files, 120 tests passed |
| `npx vitest run --config test/smoke/vitest.config.ts test/smoke/demo-openai-tool-request.test.ts` | 0 | 3 tests passed |
| `npx vitest run test/demo-chat.test.ts test/demo-steps.test.ts test/demo-model-config.test.ts test/demo-eval-cost.test.ts test/demo-budget.test.ts` | 0 | 5 files, 87 tests passed |
| `node .agents/rounds/2026-10-10-weekend/ai-upgrade/demo-steps.mjs <synthetic log>` | 0 clean log; 1 with one usage mismatch | the helper reads a prefixed line and reports the mismatch |

I did not run `npm test` or `npm run build`. The author reports both at exit 0. The brief asked for the smoke and focused lanes.
I did not reinstall the BASE lockfile. The author's claim that the new smoke test fails on BASE is consistent with the changelog and the provider code cited below, but I did not re-run it.

Installed versions in this worktree match the report: `ai` 7.0.137, `@ai-sdk/openai` 4.0.91, `@ai-sdk/anthropic` 4.0.78, `@ai-sdk/google` 4.0.93, `@ai-sdk/gateway` 4.0.110, `@ai-sdk/provider` 4.0.26, `@ai-sdk/provider-utils` 5.0.58, `workers-ai-provider` 4.0.0.

## Part A: code review

### A1. Is explicit `strict: false` the right decision? Yes.

Evidence from the installed SDK:

- `node_modules/@ai-sdk/openai/dist/index.js:5928` sends `strict: tool.strict ?? false` for every Responses function tool. An omitted value cannot reach the wire with this provider. The choice is `false` or `true`.
- `node_modules/@ai-sdk/openai/CHANGELOG.md`, 4.0.77 `2abd503`: "Default OpenAI Responses function tools to `strict: false` when tool strict mode is omitted."
- `node_modules/@ai-sdk/openai/dist/index.js:1110` sends `strict` on Chat Completions only when the tool sets it. With the branch, chat mode now sends `strict: false` too. Chat Completions is non-strict by default, so this is not a behavior change for OpenAI.
- `node_modules/@ai-sdk/anthropic/dist/index.js:1504` sends `strict: false` only to models with strict tool support. `node_modules/@ai-sdk/google/dist/index.js:1050` acts only on `strict: true`. Neither vendor is in the production chain.

Evidence from OpenAI's documentation (fetched 2026-10-10):

- Function-calling guide: "If you omit `strict`, the default depends on the API: Responses requests will attempt to normalize your schema into strict mode when possible ... and will fall back to non-strict, best-effort function calling if the schema cannot be made compatible with strict mode." And: "To opt out of strict mode in Responses and keep non-strict, best-effort function calling, explicitly set `strict: false`."
- Structured-outputs guide, supported schemas: strings support only `pattern` and `format`; `minLength` and `maxLength` are not listed. "All fields or function parameters must be specified as `required`." Optional fields need a `null` type union.

The `search` schema has 6 properties and 1 required, and both schemas use `minLength`. So `strict: true` on the current schemas is not supported by the documented rules, and a Playground-only strict schema would change what the model sees. `strict: false` is the documented explicit opt-out. The decision at `src/demo/tools.ts:159`, `:280`, and `:420` is correct, and the comment states the reasons accurately.

One nuance the plan should keep: the guide says that when the server falls back, "the response tool will show `strict: false`". The BASE server mode is therefore visible in the Responses `response.created` payload, but `src/demo/chat.ts` does not log raw chunks, and BASE is frozen. The plan's inference from null-valued inputs is the available path. No fix required.

### A2. Does the upgrade change any other active Playground path?

I read the `ai` 7.0.80–7.0.137 and `@ai-sdk/openai` 4.0.48–4.0.91 changelogs against `src/demo/chat.ts`. The plan's change inventory matches what I found. Points I verified:

- **Tool-error output** (`openai` 4.0.88 `32ff7ad`; `dist/index.js:4593` wraps `error-text` as `{"error": …}`). Model-visible. The smoke test pins it and the plan counts it as a strictness diagnostic. Covered.
- **Usage** (`ai` 7.0.129 `73d8343`). `node_modules/ai/dist/index.js:2546-2569` sums step usage into `totalUsage`, including `totalTokens`. `src/demo/chat.ts:385-393` reads `part.totalUsage` once per attempt, and `demo-step` logs each step's usage. So the helper's invariant "step sums equal turn totals" holds for one model attempt. The receipt gate checks it live. Covered.
- **Tool-choice check** (`ai` 7.0.108 `ccf98e7`). `node_modules/ai/dist/index.js:389-392` throws only for `toolChoice` `required` or a named tool. The Playground sets neither. Excluded correctly.
- **Abort** (`ai` 7.0.130 `6f6b9c0`). `chat.ts` consumes `fullStream` only and handles the `abort` part at `:363-367`. `test/demo-chat.test.ts:211` exercises a client abort on the new SDK and passes. The plan lists abort as conditional and unexercised live. Acceptable; the claim stays narrow.
- **Stream error classification** (`openai` 4.0.74 `4cf5a99`; `ai` 7.0.80). Conditional, handled by the `error` part at `chat.ts:369-376`. Not covered live; the plan says so.
- **Schema normalization** (`openai` 4.0.66, 4.0.72, 4.0.81). The two schema hashes in the smoke test are unchanged context lines in the diff, so the normalized parameters are byte-identical. Covered.
- The MCP `search` and `execute` path does not import `ai` (`grep -rl 'from "ai"' src` lists only `src/demo/chat.ts` and `src/demo/tools.ts`). Confirmed.

Finding A2-1 (low). `strict: false` now reaches every OpenAI-compatible chat transport that `buildDemoTools` feeds, including `workers-ai-provider/openai` (`dist/openai.mjs:19-23` uses `createOpenAI(...).chat`). The Grok control model (`xai/grok-4.6`) therefore receives a `strict` field it did not receive before. xAI acceptance of `strict: false` is unverified. This is a control-lane model, not production. Verify it in the gauntlet before the next control-model lane.

### A3. Do the smoke tests pin the reviewed request shape? Partly.

`test/smoke/demo-openai-tool-request.test.ts` pins `strict === false` (`:151`), the two parameter-schema hashes, and the tool-loop history items. These are the model-facing parts that changed. Good.

Finding A3-1 (medium). The loop test uses `toMatchObject` at `:172` and `:176`. A partial match passes when the provider adds a new top-level field (for example `store`, `include`, `parallel_tool_calls`, or `instructions`). The history filter at `:180` drops every item without a `type`, so the system and user messages in the final request are not pinned either. The test name "sends the reviewed tool-loop requests" promises more than it checks. Fix: assert the exact top-level key set of both bodies, or hash each body after removing volatile fields, and assert that the final request's system text contains the final-step policy sentence. This is a test-strength fix, not a defect in the shipped code.

Finding A3-2 (low). The loop test rebuilds the `streamText` call instead of running `runTurn`. It omits `abortSignal`, `onStepFinish`, and `stopWhen: stepCountIs(7)`. The pinned shape is therefore the tool builder, the model factory, and `prepareDemoStep`, not `chat.ts` itself. `test/smoke/server.test.ts` covers the assembled route separately. Acceptable; note it in the test header.

### A4. Other code observations

- `package.json` floors equal the locked versions. The lockfile diff is limited to the seven packages. Good.
- The `.agents/TODO.md` item describes the current state and keeps the paired-window rule. Good.
- Forward-only: no shims, no dual paths. Good.

**CODE: APPROVE-WITH-FIXES: A3-1 pin the exact top-level key set (or a body hash) and the final-step system text in `test/smoke/demo-openai-tool-request.test.ts`; A2-1 record the Grok chat-transport `strict: false` as an unverified control-lane change in the TODO item.**

## Part B: pre-spend plan review

Plan: `.agents/rounds/2026-10-10-weekend/ai-upgrade/measurement-plan.md`. I applied the `run-evals` pre-spend checks (`.agents/skills/run-evals/SKILL.md:90-121`).

### What passes

- **Independent review scheduled as mandatory.** Lines 3-4 and the release conditions at `:551-561`. Pass.
- **Attribution predeclared.** The interval holds only the SDK bump and `strict: false` (`:19-40`). The plan states that strictness can affect any case and claims a six-case screen, not proof (`:563-566`). Pass.
- **Noise floor.** Two repetitions per arm; regressions need both CANDIDATE repetitions to fail and both BASE repetitions to pass (`:524-535`). The plan says two repetitions do not establish significance (`:548-549`). Pass.
- **Pins asserted before spend.** `--server-generation` is compared with the local tree before the first paid turn (`scripts/run-playground-semantic-eval.mjs:744-748`). The server prints `eval server revision <sha>` and refuses a dirty tree (`scripts/run-eval-server.mjs:18-27`). Diff and worktree checks sit in checkpoint 4 (`:237-239`). Pass, with one gap in B-2 below.
- **Enforceable caps and counted costs.** Each paid command carries exactly one `--max-budget-usd`. The sum of the seven commands is 2 × $1 + 4 × $5 + $5 = $27, which equals the ceiling (`:280-286`). The runner sends the remainder to each call (`run-playground-semantic-eval.mjs:434-520`). The cap files validate against `eval/playground/artifact-contract.mjs:544-618`: probe files pass with `judgeCallsThisRun = 0`; the four planned files pass at consumed 0, 6, 12, 18 with 6 calls each; the replacement file passes as `infra-retry` with reserve 6. Costs come from the stored 2026-10-01 result. Pass.
- **Call-count authorization per method run.** One file per run; the replacement has its own bounded file (`:339-355`). Pass.
- **Incomplete-lane handling.** Method completeness rules, denominators kept, no row merging (`:493-508`, `:357-369`). Pass.
- **Stop rules.** Failed probe, cost above $0.30, failed source probe, second failed run, missed checkpoint (`:244-267`, `:371-379`). Pass.
- **Exact commands.** Every flag in the plan exists in `parseArgs` (`run-playground-semantic-eval.mjs:109-116`): `--confirm-paid`, `--max-budget-usd`, `--url`, `--server-generation`, `--round-cap-context`, `--ids`, `--no-judge`, `--judge-model`, `--out-dir`, `--dry-run`, `--print-generation`. `eval/qa/probe-remote-identities.mjs --sha256` exists (`:388-404`). `cf ai-gateway gateways get <gateway-id>` exists. `npm run dev:eval -- --var KEY:VALUE` passes through to `wrangler dev` (`run-eval-server.mjs:28-40`). `npm run eval:plan -- <file>` takes a results path (`eval/plan/grade-plan.mjs:370-385`). `--judge-model claude-sonnet-5` equals the default `JUDGE_MODEL` (`eval/qa/judge.mjs:58`). Pass.
- **Production.** `--url` must be loopback (`run-playground-semantic-eval.mjs:302-309`). No deploy, no merge, no upstream post. The Gateway `stellar-raven-demo` is shared with the public Playground, and checkpoint 3 reads headroom first (`:233-235`). Pass.
- **Ceiling.** Spend cannot pass $27 by more than one provider call, which the plan states (`:288-290`). Pass.
- **`demo-steps.mjs`.** Field names match `src/demo/chat.ts` (`demo-step` at `:325-330` via `demoStepTelemetry` in `src/demo/steps.ts:258-276`; `demo-chat` at `:450-497`). `step` is one-based, so step 7 is the tools-disabled step (`steps.ts:136`, `DEMO_CAPS.maxSteps` 7). The log parser tolerates a prefix (`demo-steps.mjs:20`). Verified on a synthetic log. Pass.

### Findings

**B-1 (medium). The judge executable pin steps are missing from the commands.** `run-evals` requires, before a paid method: a private directory first on `PATH` that holds only a link to the versioned Claude executable, `DISABLE_AUTOUPDATER=1` in the collection shell, and a re-check before each paid command (`SKILL.md:114-121`). The plan names "the pinned Claude CLI judge executable" (`:176`) and records identity afterwards (`:488`), but step 0 of the commands (`:406-416`) sets up neither the `PATH` pin nor `DISABLE_AUTOUPDATER`. `executableIdentity("claude")` resolves at run time (`run-playground-semantic-eval.mjs:741`), so another session's update can move the link between runs. Fix: add the pin steps to step 0, record the resolved path and hash, and re-check it before each judged command. A changed pin stops the method.

**B-2 (medium). The generation does not cover `node_modules`, so the installed SDK version in each arm is unpinned.** `workingTreeSnapshot` hashes HEAD, status, the tracked diff, and untracked non-ignored files (`run-playground-semantic-eval.mjs:147-166`). `node_modules` is ignored. The whole measurement is a comparison of two installed SDK versions, and `wrangler dev` bundles whatever is installed at server start. Fix: before each server start, record a receipt from that worktree, for example `node -e 'for (const p of ["ai","@ai-sdk/openai"]) console.log(p, require(p+"/package.json").version)'`, and require 7.0.79 / 4.0.47 for BASE and 7.0.137 / 4.0.91 for CANDIDATE. Add it to checkpoint 4.

**B-3 (low). A usage-sum mismatch makes a method run incomplete with no reconciliation path.** Method completeness requires `demo-steps.mjs` exit 0 (`:502`), and the helper exits 1 on any step-sum mismatch or a missing step count (`demo-steps.mjs:75-79`). The invariant holds for one model attempt (A2 above), but an errored step without usage, or a provider quirk, would mark the run incomplete, and that cause is not a transport failure, so the replacement cannot be used. Fix: keep the exit-1 signal for the receipt probes, and for method runs make a usage mismatch a reviewer reconciliation item, while a tool call on step 7 and an unfinished turn stay hard failures.

**B-4 (low). The log-to-row mapping assumes no other turns on the eval server.** The plan maps turns by order (`:393-398`). A browser turn against the loopback Playground, or a `--preflight` call, would shift the mapping. The count cross-check catches most cases. Fix: state in "Order and server slots" that nobody sends a manual or browser turn to the eval server during collection.

**B-5 (info). Steps that are not needed.** Every paid step is needed. The BASE receipt probe is needed because `#255` changed the Playground accounting after the last proven probe on 2026-10-01 (`git log c7e8c0f2..d15a4ce5 -- src/demo` lists `ff5be052`). The CANDIDATE probe protects a $5 judged run from a transport break in the new SDK. Both cost under one cent at stored rates. The free steps (`--dry-run`, `--print-generation`, `test:smoke`, the `cf` read) spend nothing.

**B-6 (info). The paired window.** The plan keeps `/private/tmp/stellar-raven-paired-launch` absent as a checkpoint and sets a stop deadline (`:224-229`). This review created nothing there.

**PLAN: LAUNCH-OK-WITH-FIXES: B-1 add the judge executable pin steps (`PATH` link directory, `DISABLE_AUTOUPDATER=1`, re-check before each judged command) to step 0 and the launch checkpoints; B-2 add an installed-SDK version receipt for each arm before each server start; B-3 make a usage-sum mismatch on a method run a reviewer item instead of an automatic incomplete method; B-4 forbid manual turns on the eval server during collection.**
