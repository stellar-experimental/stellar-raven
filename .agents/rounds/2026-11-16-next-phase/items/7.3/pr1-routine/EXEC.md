# Exec: item 7.3 PR 1 (routine dependency patches)

Executor: Claude Sonnet 5.5. Worktree `/home/tyler/code/raven-wt/np-7.3`, branch `np/7.3-deps-routine`,
from `origin/main` `a0156b2b`. Steps 1 to 8 of [PLAN.md](PLAN.md) done as written, with the notes
under "Deviations and notes". No stop condition fired. Nothing pushed, no PR, no deploy, no
model-calling or paid call, no dev server.

## Environment

- `node -v` v26.13.0, `npm -v` 11.20.0 (no Node 24 on this box; `.nvmrc` and `engines` say 24). Every
  npm command prints `EBADENGINE`. Local gates are not CI parity; the CI run on Node 24 is the gate
  of record for the lockfile.
- Setup the worktree lacked: a placeholder `.dev.vars` (the six names from `ci.yml`, value `x`) and
  `npm run typegen`, both gitignored. Before them `npm run typecheck` failed with `Env` missing its
  secret and binding members (about 90 errors, none from the bump). I did not read `.dev.vars`.

## Step 1: baseline (untouched branch)

| Item | Value |
|---|---|
| `npm run build` | exit 0 |
| `dist/server.js` SHA-256 | `afb22e4cdd705629c762a2d1c8b2934b72efa591c18745d941ef602ee5911aff` |
| `dist/server.js` size | 9,015,045 B (wrangler "Total Upload" 8803.75 KiB, gzip 1741.45 KiB) |
| `mcp:surface` surfaceSha256 | `815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07` |
| `mcp:surface` instructionsSha256 | `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00` |

The baseline build ran before `.dev.vars` existed. `wrangler deploy --dry-run` does not bundle it, so I
treat the bytes as comparable; I did not test that.

## Step 2: install

Both commands exactly as in PLAN.md. `package.json` moved only the nine named ranges (diff in the
commit). The `npm install` output ended with the 8 high findings and an install-scripts note
(esbuild, workerd, core-js-pure), none new.

### Lockfile entry list

Compared `package-lock.json` before and after (`packages` keys, all fields except `resolved` and
`integrity`). 15 entries changed, none added, none removed. All are in the expected set.

| Entry | Change |
|---|---|
| `ai` | 7.0.162 to 7.0.176 |
| `@ai-sdk/anthropic` | 4.0.96 to 4.0.106 |
| `@ai-sdk/google` | 4.0.111 to 4.0.122 |
| `@ai-sdk/openai` | 4.0.108 to 4.0.121 |
| `@ai-sdk/gateway` (transitive) | 4.0.135 to 4.0.149 |
| `@ai-sdk/provider` (transitive) | 4.0.35 to 4.0.39 |
| `@ai-sdk/provider-utils` (transitive) | 5.0.74 to 5.0.82 |
| `workers-ai-provider` | 4.0.0 to 4.0.1 (gains a registry `deprecated` field, see notes) |
| `acorn` | 8.18.0 to 8.19.0 |
| `@cloudflare/workers-oauth-provider` | 0.10.3 to 0.10.4 |
| `@cloudflare/workers-types` | 5.20261026.1 to 5.20261117.1 |
| `@types/node` | 26.6.4 to 26.6.6 |
| `undici` | gains `dev: true`, as the plan expected |
| root `packages[""]` | the nine dependency ranges |

`@modelcontextprotocol/sdk` (1.32.1) and `esbuild` (0.28.1 root, 0.28.2 under wrangler) did not move.

## Step 3: Playground request capture (free, not committed)

Files, all under git-ignored `tmp/capture/`: `capture.test.ts`, `capture.config.ts`,
`out-before.json`, `out-after.json`. Run with
`CAPTURE_OUT=tmp/capture/out-<x>.json npx vitest run --config tmp/capture/capture.config.ts`.

Method as the plan says: `createWorkersAI` over a stub `binding` (`run` and `gateway(id).run`) with
`demoGatewayOptions`; production slugs and builders (`DEMO_PRIMARY_MODEL`, `DEMO_FALLBACK_MODEL`,
`DEMO_GROK_CONTROL_MODEL`, `DEMO_KIMI_CONTROL_MODEL`, `google/gemini-3.8-flash`, `demoModelSettings`,
`demoAnthropicProviderOptions`, `demoOpenAiProviderOptions`, `demoTemperatureFor`, `DEMO_SYSTEM_PROMPT`,
`buildDemoTools`, `prepareDemoStep`, `DEMO_CAPS`). `openAiResponses` is registered for the primary and
`workers-ai-provider/openai` for Grok; Anthropic and Google use their plugins. **`cloudflareAnthropic`
and `normalizeAnthropicFetch` are copied from `src/demo/chat.ts` into the script** (module-private
there), identical in both runs; nothing was exported from `src/`.

Two changes the plan did not spell out, both needed to run under plain Node and neither touching what
is captured:
- `src/executor/run.ts` is mocked (`vi.mock`) because it needs workerd. `buildDemoTools` still
  builds the real tool objects and schemas; only each tool's `execute` is replaced by a canned result
  so the follow-up request is deterministic.
- The primary (OpenAI Responses) was captured with two requests, not one (the plan only asks two for
  Anthropic). It is the production path and the 4.0.113 parallel-tool metadata change lands on the
  second request.

Entries recorded: endpoint, headers and whole body (gateway entry or `binding.run` slug, body and
options).

| Transport | Route | Requests captured |
|---|---|---|
| Primary `openai/gpt-6.1-terra` | `gateway.run`, `v1/responses` | 2 (tool call, follow-up) |
| Fallback `anthropic/claude-haiku-5.5` | `binding.run` (settings omit `transport`) | 2 (tool call with thinking and signature, follow-up with `tool_result`) |
| Grok `xai/grok-4.6` | `gateway.run`, `v1/chat/completions` | 1 |
| Google `google/gemini-3.8-flash` | `gateway.run`, `v1beta/models/...:streamGenerateContent?alt=sse` | 1 |
| Kimi `@cf/moonshotai/kimi-k2.7-code` | `binding.run` | 1 |

All five transports were captured; none skipped. Grok and Google got a stub 400 reply after the
request was recorded, so their `errors` entries read "captured"; that is the stub, not a failure.
Sanity of the content: the primary request 1 has `strict: false` on both tools, `tool_choice: auto`,
`reasoning.effort: none`, `store: false` and `include: ["reasoning.encrypted_content"]`; the
Anthropic request has `thinking: {type: adaptive}`, `output_config.effort: low`, `tool_choice: auto`
and both tools with `eager_input_streaming` and `strict`.

The before capture is deterministic (two runs byte-identical, SHA-256
`53df78493f7c95bb8a904a6e75759b2b37978dbb83fda1288e74dbfbeffa3de0`).

### Before and after diff (whole `diff` output)

```
13c13
<               "user-agent": "ai-sdk-openai/4.0.108 ai-sdk-provider-utils/5.0.74 node.js/26",
---
>               "user-agent": "ai-sdk-openai/4.0.121 ai-sdk-provider-utils/5.0.82 node.js/26",
143c143
<               "user-agent": "ai-sdk-openai/4.0.108 ai-sdk-provider-utils/5.0.74 node.js/26",
---
>               "user-agent": "ai-sdk-openai/4.0.121 ai-sdk-provider-utils/5.0.82 node.js/26",
568c568
<               "user-agent": "ai-sdk-openai/4.0.108 ai-sdk-provider-utils/5.0.74 node.js/26",
---
>               "user-agent": "ai-sdk-openai/4.0.121 ai-sdk-provider-utils/5.0.82 node.js/26",
702c702
<               "user-agent": "ai-sdk-google/4.0.111 ai-sdk-provider-utils/5.0.74 node.js/26",
---
>               "user-agent": "ai-sdk-google/4.0.122 ai-sdk-provider-utils/5.0.82 node.js/26",
```

Per transport:
- **OpenAI Responses primary (both requests):** identical except the `user-agent` version string
  (lines 13 and 143). Tools, schemas, `strict`, `tool_choice`, reasoning, `store`, `include` and the
  replayed `function_call` and `function_call_output` items are unchanged.
- **Anthropic fallback (both requests):** byte-identical. The `@ai-sdk/anthropic` 4.0.97 change to
  returned signature and metadata does not alter the follow-up in this scenario (a thinking block
  with a signature, then a tool use).
- **Grok chat:** version string only (line 568). The Grok entry carries `ai-sdk-openai/...`, because
  the OpenAI chat plugin builds it.
- **Google:** version string only (line 702).
- **Kimi (`binding.run`):** byte-identical. It sends no SDK header.

The only differences are the SDK identification strings that the version bump itself sets. They are
explained by the package versions in the lockfile table, not by a changelog item, and no model-facing
field moved. The `user-agent` also says `node.js/26` here; in the Worker it carries the runtime's own
value, which this capture cannot show.

Result for the deploy note: **all five transports captured; no request field changed except SDK
`user-agent` version strings.**

## Step 4: response-side change, recorded (no code change)

`@ai-sdk/openai` 4.0.110 parses refusals from the Responses API and Chat Completions. A refused
primary turn now streams the refusal text with finish reason `content-filter`; before, it ended empty
and the Playground fell back to Haiku (`src/demo/chat.ts:410-412`). The lead accepts this as upstream
behavior: the Playground shows a real refusal instead of hiding it. No listed gate shows it, and I
did not test it. The capture could not show it either, since it is a response-side change.

## Refusal note on `@cloudflare/workers-oauth-provider` 0.10.4

0.10.4 is the end of the 0.10 line. Its one change floors the ID-JAG replay marker's KV TTL at 60 s
(upstream #303); that code runs only with `enterpriseManagedAuthorization`, which `src/auth/gate.ts`
does not set. The token-endpoint hardening in 1.0 to 1.2.4 (for example #368 `invalid_scope`, #371
grant expiry, #374 registration body cap) is not backported to 0.10. That stays PR 5.

## Step 5: stale text

Two lines, wording otherwise unchanged:
- `eval/playground/README.md:77`: `workers-ai-provider@4.0.0` to `@4.0.1`
- `src/demo/eval-cost.ts:154`: the comment, `workers-ai-provider@4.0.0` to `@4.0.1`

Not touched: `src/demo/model-config.ts:212` says "22 keys in 4.0.0" about the slug registry. The plan
did not list it, and 4.0.1's runtime files differ from 4.0.0's only in JSDoc, so the count should
stand. I did not recount it.

## Step 6: gates (bare, on the final tree)

| Gate | Result |
|---|---|
| `npm run typecheck` | exit 0 (after `typegen`, see Environment) |
| `npm test` | exit 0: 173 files passed, 5 skipped (178); 4042 tests passed, 3 expected fail, 8 skipped. The skips are the files with `skipIf` or `.skip` (for example the gitleaks suite, no `gitleaks` binary on this box). I did not run a baseline `npm test`, so I cannot say the skips predate the bump. |
| `npm run build` | exit 0 |
| `npm run test:smoke` | exit 0: 9 files, 149 tests passed |
| `npm run secrets:scan -- --tree` | clean, all tracked files |
| `npm run eval:selftest` | exit 0: all checks passed |
| `npm ls workerd` | one `workerd` 1.20261023.1 (miniflare and wrangler, deduped) |
| `npm audit` | 8 high, all the picomatch chain (`picomatch`, `fdir`, `tinyglobby`, `vite`, `vitest`, `@cloudflare/vitest-pool-workers`, `@rolldown/plugin-babel`, `agents`); nothing else, 0 critical and 0 moderate. Same 8 as #473. |
| `mcp:surface --json` | surface `815333b7…bd07` and instructions `67a6bd0b…6c00`, both unchanged |

Not run: the QA lint, the routing gate (nothing under `src/catalog/`, `catalog/` or `specs/` changed;
CI runs it), any model-calling eval.

New `dist/server.js`: SHA-256 `365baa2a7ae3c6b9f40253a570104cc016613467b3edb94aa9c54dcfb5142e2a`,
9,219,833 B (wrangler "Total Upload" 9003.74 KiB, gzip 1781.77 KiB). Worker bytes changed, so a deploy
is needed. The bundle grew by 204,788 B (+2.3%), gzip by about 40 KiB. I did not attribute the growth
to a package (that needs a baseline sourcemap, which the second build overwrote). It is a lead call
whether that matters; the build and `wrangler --dry-run` accept it.

## Deviations and notes

1. **Setup, not a deviation:** placeholder `.dev.vars` and `npm run typegen` (see Environment).
2. **Capture additions:** `src/executor/run.ts` mocked and tool `execute` canned; two primary requests
   instead of one (see Step 3). Neither changes what is compared.
3. **New registry fact:** the lockfile entry for `workers-ai-provider@4.0.1` carries
   `deprecated: "Deprecated. Use createAI from agents/models/ai-sdk, or ai-search-provider for AI
   Search"`. The plan and REVIEW.md describe the 4.0.1 change as JSDoc-only; the registry deprecation
   flag is separate and comes with it. No code change here. A migration off `workers-ai-provider` is a
   later decision for the lead, not part of this PR, and I did not file it in `.agents/TODO.md`.
4. **Bundle growth** of 204,788 B, not attributed.
5. No package dropped.

## Commit

One commit on `np/7.3-deps-routine`, normal hooks, message
`Routine dependency patches: AI SDK, acorn, oauth-provider 0.10.4, types (round item 7.3)`. It carries
`package.json`, `package-lock.json`, the two stale-text lines and the plan folder files (`README.md`,
`PLAN.md`, `REVIEW.md`, `briefs/`, `EXEC.md`). `tmp/` and `.dev.vars` are git-ignored and not
committed. The independent diff review (step 9) is the lead's.
