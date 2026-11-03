# Independent Review: `cs-010` (`cloudflare/agents`)

Verdict: **APPROVE**

Reviewer: Gemini 4 Argon (`openrouter/google/gemini-4-argon`).

## Numbered Findings and Evidence

1. **Technical claims and `file:line` citations match `agents@0.32.0`, `agents@0.33.0`, and `main`.**
   - I compared the four cited source files against GitHub tags `agents@0.32.0`, `agents@0.33.0`, and `main` commit `1f3bd9215239ccd973da87506d4771ac13a20bd2`.
   - All four files are byte-identical across all three refs:
     - `packages/agents/src/models/ai-sdk/models/language.ts`: `#send` (lines 421-434) hardcodes `format: "chat-completions"` at line 428. `buildRequest` (lines 144-156; cited as `145-157`, where line 157 is blank) forwards only `chatTemplateKwargs`, `modelId`, `reasoningEffort`, and `stream`.
     - `packages/agents/src/models/ai-sdk/wires/chat-completions.ts`: `reasoningEffortField` and `buildOpenAIRequest` (lines 389-450) read `context.reasoningEffort` and `options.reasoning`. They never read `providerOptions.anthropic`.
     - `packages/agents/src/models/core/settings.ts`: line 138 types `reasoningEffort` as `"low" | "medium" | "high" | null` (enforced by `asReasoningEffort` at lines 383-389).
     - `packages/agents/src/models/core/transport.ts`: `OPENAI_ENDPOINTS` (lines 393-397) maps `messages` to `"/v1/messages"`. `withResume` (lines 359-386, called at line 544) wraps every `2xx` `text/event-stream` response that has `cf-aig-run-id`.
   - I verified in `packages/agents/src/models/pi-ai/wires/anthropic.ts:123-129` and `packages/agents/src/models/pi-ai/wires/shared.ts:424-436` that `agents/models/pi-ai` sends catalog `anthropic/*` models to `transport.run` with `format: "messages"`.
   - I verified that `npm view workers-ai-provider@4.0.1 deprecated` returns `Deprecated. Use createAI from agents/models/ai-sdk, or ai-search-provider for AI Search: https://developers.cloudflare.com/agents/models/ai-sdk/`.
   - I verified in `node_modules/workers-ai-provider/src/gateway-delegate.ts:458-460` and `src/demo/chat.ts:270` that `workers-ai-provider` routes `anthropic/*` catalog IDs through `@ai-sdk/anthropic` (`runWireFormat: "anthropic"`), which preserves `thinking` and `output_config.effort` on `/run`.
   - I copied `.agents/rounds/2026-11-03-demo-createai/repro/` to a temporary directory under `tmp/` and ran `npm ci --ignore-scripts && npm run repro`. It exited `0` with `agents@0.32.0` and with `agents@0.33.0`, and both outputs matched `observed.jsonl` byte for byte.

2. **The ask is smallest and correct.**
   - Recommendation 1 states the goal (preserve `providerOptions.anthropic` on the binding `/run` path) and offers two valid options without over-constraining the maintainer: send `anthropic/*` catalog IDs in Messages format, or let a native `@ai-sdk/anthropic` model select `transport.run`.
   - This flexibility matters because `@ai-sdk/anthropic` is currently an optional peer in `agents/models/ai-sdk`, and `CloudflareLanguageModel.doGenerate` currently parses non-streaming responses with `parseOpenAIGeneration`.
   - Recommendation 2 gives the smallest interim fix: emit a warning when a string catalog model drops `providerOptions.anthropic`, and document which provider options each wire format forwards.
   - Recommendation 3 keeps the stream-resume opt-out as lower priority behind `#2790`.

3. **The report does not duplicate or contradict `cloudflare/agents#2790` or `#2631`.**
   - I inspected both issues via `gh api`:
     - `cloudflare/agents#2790` (open, filed 2026-11-02 by `MRCORD`) asks for a no-gateway mode and a stream-resume opt-out. It does not mention `providerOptions.anthropic`, `thinking`, or `output_config`. `cs-010` cites `#2790` and avoids filing a second resume issue.
     - `cloudflare/agents#2631` (open, filed 2026-10-20 by `mattzcarey`) reports that `agents/models/pi-ai` sends an array `system` prompt on `/run` with `openaiEndpoint: "/v1/messages"`, which AI Gateway `/run` may reject with code `7003`. `cs-010` cites `#2631` as a caveat for the Messages-on-`/run` option.

4. **Style, claims, and reproduction steps meet the upstream bar.**
   - All prose sentences in `cs-010` use active voice, simple tenses, and 20 words or fewer, with at most 6 sentences per paragraph, matching `.agents/skills/improvements-pipeline/references/upstream-writing-style.md`.
   - The report contains no internal workflow jargon (`gauntlet`, `lane`, or internal review history).
   - Claims are bounded: the August 2026 Unified Billing observation on the provider-native route is dated and notes that it was not re-tested with `createAI`; the `resume: false` check explicitly notes that `resume` is not in the public TypeScript types; automatic resume is described as one inference call and one resume request (`?from=1`), not a second inference.
   - Pre-filing operational note (non-blocking): commit and push `cs-010` and `.agents/rounds/2026-11-03-demo-createai/repro/` to `main` before running `npm run improvements:file` without `--dry-run`. That ensures the `tree/main` repro link resolves on GitHub, `scripts/improvements-file-issue.mjs` emits the commit-pinned `Immutable source snapshot:` link, and `.agents/rounds/2026-11-03-demo-createai/repro/` stays retained while `cs-010` cites it.

5. **No secrets or account identifiers appear in any file.**
   - I checked `improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md`, `.agents/rounds/2026-11-03-demo-createai/dry-run.md`, and all files in `.agents/rounds/2026-11-03-demo-createai/repro/`.
   - They contain no credentials, tokens, account IDs, or production gateway names (`gateway.id` is `"test"`, `apiKey` is `"unused"`, and `cf-aig-run-id` is `"existing-run"`).
