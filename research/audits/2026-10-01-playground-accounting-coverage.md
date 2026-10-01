# Playground accounting coverage review

Date: 2026-10-01.
Reviewer: GPT-6.1-Sol at high.
Verdict: ACCEPT WITH FIXES; one P2 coverage finding.
The coordinator deferred the extension and retained refusal before spend for this measurement round.

## Evidence

The reviewer used `workers-ai-provider@4.0.0` with fake upstream services.
The reviewer retained the real handler, AI SDK, provider plugins, and installed transport delegate.
No paid model call or live Gateway log read ran.

The reviewed repair had SHA-256 `e9ebc6cc3058df6d99024f7d1d9a749d57d2ae82cda527cca1b5f9cc9eb5e7a2` for `src/demo/eval-cost.ts`.
The worktree HEAD was `2cc020de4e5fc35b716c77c038d2bd3fe8ec69a5`; the accounting repair remained uncommitted.

The reviewer confirmed accounting for OpenAI Responses, OpenAI Chat, explicit OpenAI run transport, Anthropic, Google, and Grok dispatch.
The configured Terra/Luna fallback produced two counted calls, two owned log reads, and a complete numeric receipt.
Those local costs came from fake logs; they do not establish live prices or availability.

Two real-handler cases failed before upstream dispatch:

- Native Workers AI: `@cf/moonshotai/kimi-k2.7-code`.
- No-plugin catalog path: `moonshotai/kimi-k3`.

The installed native parser calls `binding.run` without `returnRawResponse`.
The no-plugin factory selects that parser too.
The existing raw-response guard therefore rejected both cases before their upstream calls.
Both receipts contained `calls: 0`, `reportedCalls: 0`, and `costUsd: null`.
This is an unsupported accounting path, not evidence of an uncounted paid dispatch.

The retained regressions are in [`test/smoke/demo-eval-cost.test.ts`](../../test/smoke/demo-eval-cost.test.ts).
They require the explanatory error and verify zero upstream calls for both named models.
The [current guide](../../eval/playground/README.md#supported-accounting-transports) states the supported and unsupported paths.

## Required extension

Adapt native and no-plugin chat calls to the raw-response accounting path.
Request `returnRawResponse: true`, capture its log identifier, and preserve the shared settlement and budget checks.
Then return the response body stream or parsed JSON that the installed native parser expects.
Keep returning the full `Response` for existing raw-response callers.
Do not remove the guard and dispatch without a captured log identifier.
Add real-handler regressions for both models and a fallback into a native model.
Require an answer, captured log reads, and a complete numeric receipt.

The [Eval instruments queue](../../.agents/TODO.md#extend-playground-eval-accounting-to-native-and-no-plugin-model-paths) owns this extension.
The current measurement retains the OpenAI configuration and needs a new bounded receipt GO after review.
