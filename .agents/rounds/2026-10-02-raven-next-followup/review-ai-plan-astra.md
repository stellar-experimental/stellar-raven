NO-LAUNCH

The lockfile change has no demonstrated code defect. The measurement plan needs the fixes below before paid collection.
This verdict covers the reviewed plan, not permission to spend, merge, or deploy.

Review scope: `a1b765488da1e4f778cd1dfc177629c7f4b32940` to `8f578ac8d53f16ee127f205bdec7a204cdf83e74`.
The reviewed worktree is `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/raven-next-ai`.

In this report, `plan` means:
`/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/e0458147-7f27-43a1-a99f-931d74bf4ad9/scratchpad/ai-bump/ai-bump-plan.md`.
`authority-plan` means `.agents/rounds/2026-10-01-backlog-closeout/authority-plan.md`.
All repository evidence refers to CANDIDATE unless stated otherwise.

## Numbered findings

1. **P1 — The saved artifact cannot prove the final-step rule. The fallback rule tests a disabled configuration.**

   Plan lines 107–115 require no new fallback and no execution during the final tools-disabled step.
   The runner saves frames and tool transcripts, but these contain no step numbers or actual attempted models.
   `src/demo/chat.ts:355–359` deliberately omits step frames.
   `scripts/run-playground-semantic-eval.mjs:391–408,817–837` saves tool events without step attribution.
   `eval/playground/README.md:144` explicitly limits attempted-model evidence.

   The plan also sets a single-model override.
   `src/demo/model-config.ts:37–44` replaces the entire model list with that override.
   Therefore, these runs have no fallback model. A no-fallback result cannot establish production fallback behavior.

   **Expected fix:** State that this instrument tests only the primary model.
   Remove the fallback comparison or explicitly configure and review the intended model chain.
   Save correlated `demo-step` and `demo-chat` events for each case, outside tracked paths.
   `src/demo/chat.ts:324–328,450–475` already emits the needed step and attempted-model information.
   Check final-step tool counts from those events.
   Report final-step coverage as unexercised when no case reaches that step.
   Do not infer step coverage from an aggregate tool count.

2. **P1 — Restore current launch checks instead of assuming earlier capacity and accounting evidence still apply.**

   Plan lines 81–83 assume Gateway headroom from the earlier round.
   Authority-plan lines 123–125 require a current private check that preserves room for public traffic.
   A Gateway refusal after collection starts does not replace that check.

   The new plan also omits the receipt-and-usage checkpoint from authority-plan lines 166–184.
   Its end-of-run cost checks cover dollars, but do not preserve the corresponding token-usage evidence.
   This omission matters because the changed OpenAI package also changes Responses usage handling.
   See `node_modules/@ai-sdk/openai/CHANGELOG.md:264,286`.

   Plan lines 85–87 record a deadline and an absent paired-launch directory.
   They do not preserve the prohibition during paired capacity/signature and collection intervals.
   Authority-plan lines 113–122 also require the server-slot release signal and prevent concurrent paid measurement.
   Directory absence alone does not prove those conditions.

   **Expected fix:** Add named, current checkpoints for Gateway headroom, server ownership, paired collection, and the remaining calendar window.
   Keep private figures out of committed records.
   Restore the accounting receipt gate, including correlated usage, or document a reviewed replacement before launch.
   A separate paid probe needs its own bounded authorization and revised caps.
   The old description-quotation diagnostic does not apply to this lockfile change.
   Require successful source probes before the next paid invocation, including any replacement.
   Plan line 94 schedules probes, but does not specify failure handling or saved timestamps.
   Authority-plan lines 393–399 supply those requirements.

3. **P2 — The SDK risk inventory omits active-path behavior changes.**

   Plan lines 40–43 reduce the remaining risks to completion handling, build output, and raw-response accounting.
   Plan lines 58–60 also assume the SDK change threatens the loop rather than factual output.
   Tool serialization and schema changes can change the evidence that the model receives.

   The clearest omission is OpenAI Responses tool strictness.
   `@ai-sdk/openai@4.0.77`, commit `2abd503`, now defaults omitted tool strictness to `false`.
   Evidence: `node_modules/@ai-sdk/openai/CHANGELOG.md:68` and `dist/index.js:5682–5695`.
   Raven omits `strict` in both tool definitions (`src/demo/tools.ts:268–270,407–409`).
   A local request-capture fixture confirmed this difference without network access:
   BASE omits the `strict` field; CANDIDATE sends `"strict": false`.
   The fixture used each arm's installed OpenAI provider and replaced `fetch` with a capture function.

   Other relevant omissions follow:

   | Package change | Active-path relevance |
   |---|---|
   | `ai@7.0.80`, `35841f5` | Changes mid-stream provider error normalization. Raven consumes `fullStream` error events. |
   | `ai@7.0.92`, `d1904d3` | Changes empty HTTP-body error handling, which can affect failed attempts. |
   | `ai@7.0.101`, `6aa7c54` | Changes JSON tool-output serialization between tool steps. |
   | `ai@7.0.106`, `1aef01e` | Preserves prototype-named properties in serialized tool outputs. |
   | `ai@7.0.83`, `ce6849a` | Changes cancellation before an inner stream exists. Raven supplies an abort signal. |
   | `ai@7.0.93`, `ee8391e` | Changes abort-signal handling in runtimes without a constructor-valued global `AbortSignal`. |
   | `openai@4.0.48`, `eee6200`, `35841f5` | Changes malformed Responses stream events, error normalization, and error finish reasons. |
   | `openai@4.0.54`, `f6fac50`; `4.0.57`, `7243530` | Changes null and raw Responses usage handling. |
   | `openai@4.0.70`, `1f5bb62` | Changes assistant-text serialization in Responses history, including later tool-loop requests. |
   | `openai@4.0.66`, `d5e3024`; `4.0.72`, `411b3f2`; `4.0.81`, `4e94782` | Changes schema normalization. Record which Raven schemas reach these transformations. |

   Evidence: `node_modules/ai/CHANGELOG.md:262,356,453,462,554,581` and the named OpenAI changelog version sections.
   These are risk inventory entries, not demonstrated regressions.
   Conditional cancellation and malformed-stream behavior will not necessarily occur during six normal turns.

   Two nearby entries need explicit exclusions rather than more paid cases.
   `ai@7.0.91` adds optional stream retries; the default remains zero (`dist/index.js:9228–9233`).
   Raven supplies neither `streamRetries` nor retry-directed `onError` (`src/demo/chat.ts:315–336`).
   The `7.0.106` prepareStep model fixes concern model selection and metadata.
   Raven's prepareStep changes the system prompt and active tools, not the model.
   UI stream helpers, approvals, tool search, speech, images, and realtime APIs are outside this tested path.

   **Expected fix:** Add this inventory and distinguish exercised behavior from conditional or excluded behavior.
   Preserve human review of executed evidence and answers.
   Describe the result as a six-case primary-model screen, not proof of unchanged SDK behavior.
   No extra judge or paid repetition is necessary for that limited claim.

4. **P2 — Define completion with the runner's complete-method state.**

   Plan lines 107–110 require a terminal frame and a method that is not invalidated.
   These conditions do not exclude an incomplete method.
   The route can emit `done` with `reason: "incomplete"` after an unexpected exit or an `other` finish reason.
   Evidence: `src/demo/chat.ts:207–210,409–411`.
   The runner also marks non-`stop` reasons as incomplete (`scripts/run-playground-semantic-eval.mjs:603–620`).
   An incomplete method is distinct from an invalid method.

   **Expected fix:** Require exit 0, `budget.status === "complete"`, and no `nonPromotable` flag.
   Require exactly the six frozen IDs, no incomplete or unattempted IDs, and `finishReason === "stop"` for every row.
   Also require no `clientError`, no unfinished tool calls, and exactly one valid cost frame per row.
   Keep the existing HTTP, SSE, finite positive cost, and answer checks.
   Apply the complete-method rule to both arms.
   These checks use fields already present in the artifact.

5. **P2 — The cap files are valid, but the replacement procedure leaves consumption and timing ambiguous.**

   All three requested dry runs passed.
   However, dry-run returns before reading cap files (`scripts/run-playground-semantic-eval.mjs:704–706,774`).
   I also checked the files through `buildPlaygroundArtifactMeta`, using the repository's offline fixture.
   The six-answer, zero-judge projections passed: BASE `0 + 6`, CANDIDATE `6 + 6`, replacement `12 + 6`.
   An exhausted six-call retry reserve was correctly rejected.

   Plan lines 74–79 permit replacement on either failed arm.
   Lines 122–125 instead stop the round on a BASE failure.
   The plan does not specify replacement order or actual consumption updates after partial runs.
   An early replacement can consume the planned allocation and prevent the remaining planned arm from launching.
   The contract checks planned consumption separately (`eval/playground/artifact-contract.mjs:597–617`).
   Authority-plan lines 219–280 already resolve these issues for the earlier experiment.

   **Expected fix:** Define the BASE-failure rule and replacement order explicitly.
   Reconcile actual started answers after every invocation and update the later cap files.
   Preserve the failed artifact and the complete replacement separately; do not combine rows.
   Explicitly exclude missing-cost, excess-cost, generation, source-pin, and answer-quality failures from the retry authorization.
   A second failed run ends collection, even when reserve remains.
   Describe `$15` as a checkpoint authorization limit.
   One provider call can exceed its remaining allowance (`eval/playground/README.md:43–45`).
   Keep the 18-turn ceiling and the deadline; do not equate answer turns with provider calls.

## Verified scope and source claims

- Only `package-lock.json` differs between the reviewed commits: 34 insertions and 34 deletions.
- `package.json` is unchanged. Exactly seven package entries changed.
- The changed entries are `ai`, `@ai-sdk/anthropic`, `gateway`, `google`, `openai`, `provider`, and `provider-utils`.
- No other resolution moved. `undici` remains `7.30.0` in both arms.
- Plan line 23 should distinguish the changed `undici` dependency range from its unchanged resolved version.
- BASE and CANDIDATE worktrees were clean. Both commit IDs and generation hashes matched the plan.
- The paired-launch directory was absent during this review. This is a point-in-time observation only.
- `src/executor/run.ts:18` imports the root `@cloudflare/codemode` export.
- `src/server.ts:11` imports `createMcpHandler` from `agents/mcp`.
- Neither installed import graph contains an `ai` or `@ai-sdk/*` runtime input.
- I checked the distributed imports and confirmed both graphs with an esbuild metadata probe using `write:false`.
- Other `agents` subpaths import `ai`; those subpaths are not reached by this MCP import graph.
- Raven's direct `ai` imports are in `src/demo/chat.ts` and `src/demo/tools.ts`.
- The common Worker still bundles the Playground. The MCP import result does not prove complete Worker isolation from packaging defects.
- The required/tool choice claim is correct: `node_modules/ai/dist/index.js:8292–8312` limits that violation check accordingly.
- The SDK defaults an omitted choice to `auto` (`dist/index.js:1928–1932`).
- Raven supplies no `toolChoice`; its final step returns `activeTools: []` (`src/demo/steps.ts:138–142`).
- This source check does not prove that every live final-step response respects the tools-disabled policy.
- I read the full `ai` changelog range `7.0.80–7.0.127` and OpenAI range `4.0.48–4.0.83`.
- The OpenAI Responses path runs through `src/demo/model-config.ts:31–34` and the Workers AI provider registration.

Answer-only, one run per arm, and six cases are proportionate for a bounded transport and tool-loop screen.
They do not establish behavioral equivalence, fallback coverage, failure-path coverage, or a statistical regression rate.
The family classification is checkable from saved execute inputs and results.
It measures written service calls, not factual grounding or SDK causality.
Two readers must review returned evidence separately, as authority-plan lines 338–357 require.
A one-case family change can reflect model variation; do not label it an SDK regression without further evidence.
The existing rule may conservatively block release, but it cannot identify the cause by itself.

## Free verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed in the reviewed worktree. |
| Three requested `eval:playground --dry-run` commands | Passed; selected the same six cases in corpus order, with the judge disabled. |
| Offline `buildPlaygroundArtifactMeta` cap checks | All three passed; exhausted retry reserve failed as required. |
| `npm run build` | Passed in an isolated archive of CANDIDATE, using its installed dependencies. |
| `npm run test:smoke` | Passed in that archive: 6 files, 100 tests. Remote bindings were disabled. |
| `npm test` | 133 files passed; only `test/qa-paired-launch.test.mjs` failed. |
| Unit test counts | 2331 passed, 29 failed, 3 expected failures. |

The unit failures report `spawnSync ps EPERM`, matching the stated sandbox limit.
The failing test and its implementation are unchanged by this lockfile-only diff.
I did not independently run the baseline unit suite.
An initial archive-only unit run also lacked Git history; I replaced that evidence with the worktree run above.

The build archive was `/private/tmp/review-ai-astra-pwvj0vcg`.
It excluded credential files and used a symlink to CANDIDATE's installed dependencies.
Build output was `7346.73 KiB`, gzip `1448.44 KiB`.
This archive build does not reproduce the plan's exact `7300.52 KiB` measurement environment.
Wrangler initially reported a denied log write outside the sandbox.
The final build passed with `WRANGLER_LOG_PATH` set inside `/private/tmp`.
The smoke suite also reported the log-write restriction, but all tests passed.

Logs:

- `/private/tmp/review-ai-astra-pwvj0vcg-build-verified.log`
- `/private/tmp/review-ai-astra-pwvj0vcg-smoke.log`
- `/private/tmp/review-ai-astra-worktree-test.log`

I started no evaluation server and ran no paid command.
The authorized smoke tests used their isolated workerd test runtime.
I did not read credential files, deploy, or change tracked repository files.
Only this requested report was written under the worktree root.
Live billing, current Gateway headroom, remote source identities, and production deployment identity remain unverified here.
