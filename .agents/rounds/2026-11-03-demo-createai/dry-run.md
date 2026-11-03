# cs-010 filing dry run (2026-11-03)

Command: `npm run improvements:file -- --file improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md --dry-run` (exit 0).
Intake resolves cs-010 to `cloudflare/agents` through the per-finding override. Nothing was posted.

````markdown
# createAI: string catalog models drop Anthropic adaptive thinking and effort providerOptions

<!-- generated-by-stellar-raven -->

> [!NOTE]
> **Automated notice:** [Stellar Raven](https://github.com/stellar-experimental/stellar-raven) filed this issue from its automated evaluation pipeline. The issue includes evidence and a public source record. Please verify the live surface before you act.

## Finding

`createAI` from `agents/models/ai-sdk` drops Anthropic provider options for string catalog models.
A call to `ai("anthropic/claude-fable-5")` can set `providerOptions.anthropic.thinking` and `providerOptions.anthropic.effort`.
The binding `AI.run` request then contains no `thinking`, no `output_config`, and no `reasoning_effort`.
`createAI` emits no warning for the dropped options.

The cause is the wire format.
`CloudflareLanguageModel` always sends `format: "chat-completions"` to the run transport.
The Chat Completions request builder reads only the unified reasoning settings.
It does not read `providerOptions.anthropic`.
The per-model `reasoningEffort` setting accepts only `"low"`, `"medium"`, `"high"`, or `null`.
It has no field for Anthropic's adaptive thinking mode.

This blocks a direct migration from `workers-ai-provider`.
`workers-ai-provider@4.0.1` is deprecated and names `createAI` as its replacement.
Its run transport sends `anthropic/*` catalog IDs through `@ai-sdk/anthropic` in the Messages format.
That path keeps `thinking` and `output_config.effort` on the Unified Billing `/run` route.
After a move to `createAI`, the same call silently loses both settings.

### Native Anthropic models use a different route

`createAI` also accepts a native model, such as `createAnthropic(...)("claude-fable-5")`.
That model keeps `thinking.type: "adaptive"` and `output_config.effort: "xhigh"`.
However, `createAI` sends it through `AI.fetch` to `/ai-gateway/gateways/<id>/anthropic/v1/messages`.
That is the provider-native route, not the catalog `/run` route.
In August 2026, the provider-native route did not serve `claude-fable-5` through Unified Billing for us.
We did not repeat that check with `createAI`.

### Second, lower-priority gap: stream resume has no opt-out

The binding transport resumes every catalog stream that returns `cf-aig-run-id`.
No public setting turns this off.
[cloudflare/agents#2790](https://github.com/cloudflare/agents/issues/2790) already requests an opt-out.
We have one more use case for it: our current `workers-ai-provider` configuration sets `resume: false`.
We have not seen any failure that automatic resume causes.
Our reproduction shows one inference call and one resume request, not a second inference.
Thus we support #2790 and do not file a separate request.

## Evidence

The reproduction uses only public package entry points.
It replaces global `fetch` with a function that throws, and it uses fake `AI.run` and `AI.fetch` bindings.
It needs no account, credential, deployment, or paid model call.
Use Node.js 24 or later:

```sh
npm ci --ignore-scripts
npm run repro
```

The script and lockfile are in [`.agents/rounds/2026-11-03-demo-createai/repro/`](https://github.com/stellar-experimental/stellar-raven/tree/main/.agents/rounds/2026-11-03-demo-createai/repro).
Exit code `0` confirms the three behaviors below.

| Check | Captured request |
| --- | --- |
| String `anthropic/claude-fable-5`, `providerOptions.anthropic` with `thinking: { type: "adaptive" }` and effort `low`, then `xhigh` | `AI.run("anthropic/claude-fable-5", { messages }, { openaiEndpoint: "/v1/chat/completions", ... })`. The body has no `thinking`, `output_config`, or `reasoning_effort`. |
| Native `createAnthropic({ apiKey: "unused" })("claude-fable-5")`, same options with effort `xhigh` | `AI.fetch("https://workers-binding.ai/ai-gateway/gateways/test/anthropic/v1/messages")`. The body has `thinking: { type: "adaptive" }` and `output_config: { effort: "xhigh" }`. |
| String `moonshotai/kimi-k3` stream that fails after its first chunk, with `maxRetries: 0` | Text `beforeafter`. One `AI.run` call and one `AI.fetch` to `/run/existing-run/resume?from=1`. |

The script passes `resume: false` to `createAI` as an unknown JavaScript field.
The public TypeScript settings do not declare it, so the third check shows a missing control, not a broken one.
`agents@0.33.0` gives byte-identical output.

Source lines at tag `agents@0.32.0`, unchanged on `main` at `1f3bd921`:

| Source | Lines | Behavior |
| --- | --- | --- |
| [`models/ai-sdk/models/language.ts`](https://github.com/cloudflare/agents/blob/agents%400.32.0/packages/agents/src/models/ai-sdk/models/language.ts#L421-L432) | 421-432 | `#send` always passes `format: "chat-completions"` to `transport.run`. |
| [`models/ai-sdk/models/language.ts`](https://github.com/cloudflare/agents/blob/agents%400.32.0/packages/agents/src/models/ai-sdk/models/language.ts#L145-L157) | 145-157 | From the resolved settings, the request builder receives only `reasoningEffort` and `chatTemplateKwargs`. |
| [`models/ai-sdk/wires/chat-completions.ts`](https://github.com/cloudflare/agents/blob/agents%400.32.0/packages/agents/src/models/ai-sdk/wires/chat-completions.ts#L389-L450) | 389-450 | The body uses `reasoning_effort` from unified settings. It does not read `providerOptions.anthropic`. |
| [`models/core/settings.ts`](https://github.com/cloudflare/agents/blob/agents%400.32.0/packages/agents/src/models/core/settings.ts#L138) | 138 | `reasoningEffort` accepts `"low" \| "medium" \| "high" \| null`. |
| [`models/core/transport.ts`](https://github.com/cloudflare/agents/blob/agents%400.32.0/packages/agents/src/models/core/transport.ts#L393-L397) | 393-397 | The run transport already maps `format: "messages"` to `/v1/messages`. |
| [`models/core/transport.ts`](https://github.com/cloudflare/agents/blob/agents%400.32.0/packages/agents/src/models/core/transport.ts#L359-L386) | 359-386 | `withResume` wraps every successful SSE response that has `cf-aig-run-id`, with no disable check. |

Additional recorded evidence:

- 2026-11-03: npm view workers-ai-provider@4.0.1 deprecated returns 'Deprecated. Use createAI from agents/models/ai-sdk, or ai-search-provider for AI Search'.
- 2026-11-03: .agents/rounds/2026-11-03-demo-createai/repro/ (npm ci --ignore-scripts && npm run repro) exited 0 with agents@0.32.0, ai@7.0.137, and @ai-sdk/anthropic@4.0.78. observed.jsonl holds the captured requests.
- 2026-11-03: the same script with agents@0.33.0 (released 2026-11-03) produced byte-identical output.
- 2026-11-03: cloudflare/agents main at 1f3bd9215239ccd973da87506d4771ac13a20bd2 still sets format: "chat-completions" in packages/agents/src/models/ai-sdk/models/language.ts:428 and still wraps binding streams with withResume in packages/agents/src/models/core/transport.ts:359.
- Tagged source: https://github.com/cloudflare/agents/blob/agents%400.32.0/packages/agents/src/models/ai-sdk/models/language.ts#L421-L432
- Tagged source: https://github.com/cloudflare/agents/blob/agents%400.32.0/packages/agents/src/models/ai-sdk/wires/chat-completions.ts#L389-L450
- Tagged source: https://github.com/cloudflare/agents/blob/agents%400.32.0/packages/agents/src/models/core/transport.ts#L393-L397
- 2026-11-03 dedupe: searched cloudflare/agents issues for createAI, resume, adaptive thinking, anthropic effort, providerOptions anthropic, and output_config. No open issue covers the Anthropic options. An open issue from another user already requests the resume opt-out (see Finding).
- Consumer impact: Raven's demo chat sends providerOptions.anthropic { thinking: { type: "adaptive" }, effort } for Claude 5 catalog IDs (src/demo/model-config.ts demoAnthropicProviderOptions). It reaches catalog /run today through workers-ai-provider's anthropic run wire (runWireFormat: "anthropic").

## Recommendation

1. Forward Anthropic provider options for `anthropic/*` string catalog models on the binding `/run` path.
   The run transport already supports `format: "messages"`, which `agents/models/pi-ai` uses for Anthropic catalog IDs.
   One option: send `anthropic/*` catalog IDs in the Messages format with a body from `@ai-sdk/anthropic`.
   That keeps the SDK's own `thinking` and `output_config` rules, the catalog model ID, and Unified Billing.
   Another option: let a caller pass a native Anthropic SDK model and select the run transport for it.
   Note that [cloudflare/agents#2631](https://github.com/cloudflare/agents/issues/2631) reports that `/run` may reject an array `system` in a Messages body.
   Add captured-request tests for `thinking: { type: "adaptive" }` and effort `low` and `xhigh`.
2. Until then, warn when `providerOptions.anthropic` is present on a string catalog model and the request drops it.
   Document which provider options each wire format forwards.
3. Lower priority: add the stream-resume opt-out that #2790 requests.
   A stream with that option must surface its connection failure without a resume request.

## Source Record

Raven recorded this finding as cs-010 (canonical-source, discovered 2026-11-03).

Public source record: [improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md](https://github.com/stellar-experimental/stellar-raven/blob/main/improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md)

## Resolution Handoff

When you deploy a fix, link the resolving issue or pull request to the source record.
Then notify Raven through:

https://github.com/stellar-experimental/stellar-raven/issues/new?template=upstream-improvement-ready.yml&title=%5Bupstream-ready%5D%20cs-010%3A%20

Include the finding ID and the resolving issue or pull request.
Include the deployed version or timestamp. Include the smallest live recheck.
Raven verifies the live surface before it sets the finding to `fixed-upstream`.
An issue closure or merged pull request does not prove the fix.
A separate reviewer repeats the live check before Raven retires the active finding.
Raven keeps a commit-pinned snapshot when one is available.

````
