# Item 7.3, PR 1: routine in-range patches

Branch `np/7.3-deps-routine` in `/home/tyler/code/raven-wt/np-7.3`, from `origin/main` `a0156b2b`.
Revised after the Fable plan review ([REVIEW.md](REVIEW.md)). The reconciliation table is at the end.

## Decision

Take the in-range patch and minor updates below if every gate stays green and no model-facing request
changes without a reason we accept. The alternative is to stay on the current versions. Expected
cost: USD 0, under an hour of executor time. No model-calling run.

## Packages

| Package | Kind | From | To | Bundled in the Worker |
|---|---|---|---|---|
| `ai` | dep, caret | 7.0.162 | 7.0.176 | yes (Playground) |
| `@ai-sdk/anthropic` | dep, caret | 4.0.96 | 4.0.106 | yes (Playground fallback) |
| `@ai-sdk/google` | dep, caret | 4.0.111 | 4.0.122 | yes (`workers-ai-provider/google`, `src/demo/chat.ts:19`) |
| `@ai-sdk/openai` | dep, caret | 4.0.108 | 4.0.121 | yes (Playground primary, Grok control) |
| `workers-ai-provider` | dep, caret | 4.0.0 | 4.0.1 | yes (JSDoc-only change) |
| `acorn` | dep, caret | 8.18.0 | 8.19.0 | yes (`normalize.ts` on the execute path, `src/demo/tools.ts`, codemode) |
| `@cloudflare/workers-oauth-provider` | dep, caret | 0.10.3 | 0.10.4 | yes (auth) |
| `@cloudflare/workers-types` | dev, caret | 5.20261026.1 | 5.20261117.1 | no |
| `@types/node` | dev, caret | 26.6.4 | 26.6.6 | no |

Transitive packages expected to move: `@ai-sdk/provider` 4.0.35 to 4.0.39, `@ai-sdk/provider-utils`
5.0.74 to 5.0.82, `@ai-sdk/gateway` 4.0.135 to 4.0.149, and `undici` 7.30.1, which gains the `dev`
flag because `provider-utils` 5.0.80 dropped it. Other entries are allowed only if one of the named
packages pulls them in.

Moved out of PR 1:
- `@modelcontextprotocol/sdk` 1.32.2 goes to PR 2. It is bundled through `agents/mcp`, and
  `agents@0.28.1` pins its peer at 1.32.1 exactly.
- `esbuild` 0.28.2 goes to PR 4. It moves 54 lockfile entries between the copies that wrangler and
  the vitest pool pin.

`@cloudflare/workers-oauth-provider` 0.10.4 has one change (upstream #303): the ID-JAG replay
marker's KV TTL is floored at 60 s. That code runs only with `enterpriseManagedAuthorization`, which
`src/auth/gate.ts` does not set. 0.10.4 ends the 0.10 line. The 1.x token-endpoint hardening is not
backported to it; that is PR 5.

## Steps

1. **Baseline.** On the untouched branch, record:
   - `node -v` and `npm -v` (this box has Node 26 and no Node 24; CI on Node 24 is the gate of record
     for the lockfile);
   - `npm run build`, then the SHA-256 and size of `dist/server.js`;
   - the `mcp:surface` hashes: surface `815333b7…bd07`, instructions `67a6bd0b…6c00`.

   Run the step 3 capture before any install.
2. **Install.** Use exact target versions so nothing else gets picked:
   - `npm install ai@^7.0.176 @ai-sdk/anthropic@^4.0.106 @ai-sdk/google@^4.0.122 @ai-sdk/openai@^4.0.121 workers-ai-provider@^4.0.1 acorn@^8.19.0 @cloudflare/workers-oauth-provider@^0.10.4`
   - `npm install -D @cloudflare/workers-types@^5.20261117.1 @types/node@^26.6.6`

   These change `package.json` and `package-lock.json`. List every changed `node_modules/…` entry in
   the lockfile diff and check it against the expected set above.
3. **Playground request capture (free, not committed).** Capture at the AI binding, not at `fetch`.
   `test/demo-model-config.test.ts:373-527` has the pattern:
   - Give `createWorkersAI` a stub binding with `run` (Kimi, and Anthropic, whose settings omit
     `transport`) and `gateway(id).run` (OpenAI, xAI, Google), plus `demoGatewayOptions`.
   - Build each request from production values: the slugs `DEMO_PRIMARY_MODEL`,
     `DEMO_FALLBACK_MODEL`, `DEMO_GROK_CONTROL_MODEL`, `DEMO_KIMI_CONTROL_MODEL` and one `google/`
     slug; `demoModelSettings`, `demoAnthropicProviderOptions`, `demoOpenAiProviderOptions`,
     `DEMO_SYSTEM_PROMPT`, `buildDemoTools` and `prepareDemoStep`.
   - Register `openAiResponses` for the primary and the `workers-ai-provider/openai` plugin for Grok.
     `demoEffectiveOpenAiApiMode` returns `chat` once an `xai/` slug is in the list.
   - Copy the module-private `cloudflareAnthropic` and `normalizeAnthropicFetch` from
     `src/demo/chat.ts` into the script, and say so in EXEC.md. Do not export them from `src/`.
   - Capture two requests for the Anthropic fallback: one canned tool call, then the follow-up.
     Capture the first request only for Grok, Kimi and Google.
   - Record each whole captured entry: endpoint, headers and body.
   - Runner: put the file and a one-off vitest config under `tmp/` (git-ignored), reuse the root
     `cloudflare:workers` alias, and run `npx vitest run --config tmp/<name>.config.ts`. Neither
     regular lane picks up `tmp/`.

   Run it before step 2 and after, then diff. Record each difference in EXEC.md with the upstream
   changelog line that explains it. An unexplained difference in a tool schema, `strict`,
   `tool_choice`, reasoning or provider-options field stops the PR for the lead's decision. If a
   transport still cannot be captured, record which one and why. The lead's deploy note depends on
   this per-transport result.
4. **Response-side change, recorded.** `@ai-sdk/openai` 4.0.110 parses refusals from the Responses
   API and Chat Completions. A refused primary turn now streams the refusal text with finish reason
   `content-filter`; before, it ended empty and the Playground fell back to Haiku
   (`src/demo/chat.ts:410-412`). The lead accepts this as upstream behavior: the Playground shows a
   real refusal instead of hiding it. Record it in EXEC.md. No code change.
5. **Stale text.** Update `eval/playground/README.md:77` ("the installed
   `workers-ai-provider@4.0.0`") and the comment at `src/demo/eval-cost.ts:154` to 4.0.1, keeping the
   wording otherwise.
6. **Gates, bare, on the final tree:** `npm run typecheck`, `npm test`, `npm run build`,
   `npm run test:smoke` and `npm run secrets:scan -- --tree`. Because step 5 touches `eval/`, also
   run `npm run eval:selftest`. Never run the QA lint; CI runs it. Then check:
   - `npm ls workerd` shows one `workerd`;
   - `npm audit` shows the same 8 high findings (#473, picomatch) and nothing new;
   - `npm run -s mcp:surface -- --json` gives the same two hashes;
   - the new `dist/server.js` SHA-256 and size are recorded. Worker bytes change, so a deploy is needed.

   The routing gate is not needed: nothing under `src/catalog/`, `catalog/` or `specs/` changes.
   CI runs it anyway.
7. **Records.** Write `items/7.3/pr1-routine/EXEC.md`, with Node and npm versions, the lockfile entry
   list, the per-transport capture result, the step 4 note and each gate's result.
8. **Commit** on `np/7.3-deps-routine` with the normal hooks:
   `Routine dependency patches: AI SDK, acorn, oauth-provider 0.10.4, types (round item 7.3)`.
9. **Independent diff review** (the lead runs it after the executor): a Claude Opus 5.5 child, high
   effort, reads the diff and EXEC.md and writes `DIFF-REVIEW.md` here. The author is Sonnet and
   the orchestrator and lead are Opus, so the matched tier for a dependency change is Codex
   workhorse; the lead uses Codex `gpt-6-astra` at high instead of Opus if it is available. The
   executor reconciles the findings.

## Stop rule

Stop and report to the lead, changing nothing further, if any of these happens:
- a gate fails and the fix is more than a one-line type adjustment;
- a Playground request field changes and the changelog does not explain it;
- the lockfile moves an entry outside the expected set;
- `npm audit` gains a finding.

If one package causes the failure, drop that package and keep the rest. Record the dropped package
in EXEC.md and in `.agents/TODO.md` Dependencies.

## Model-facing check

The MCP surface does not change unless the hashes move. If they move, PR 1 stops. If they do not
move, there is no Sonnet spot check. The Playground requests are model-facing for the demo; step 3
checks them. A paid Playground run is not authorized.

## Risks

- AI SDK patches have changed wire shapes before (`@ai-sdk/openai` 4.0.77 and 4.0.88). The smoke
  pins use `gpt-5.6-terra`, while production uses `gpt-6.1-terra`. Step 3 uses the production slugs.
- `provider-utils` 5.0.79 moves internal schemas to Zod Mini. Tool input validation is covered by
  `npm test` and the smoke lane.
- `@cloudflare/workers-types` can tighten types. A typecheck failure there is a type fix, not a
  runtime change.

## Needs from the orchestrator

Merge, then deploy (Worker bytes change). The deploy note gives the step 3 result per transport. No
owner question.

## Review reconciliation

| Finding | Disposition |
|---|---|
| 1 MCP SDK is bundled and pinned by `agents` | Adopted: moved to PR 2 |
| 2 `esbuild` moves 54 entries | Adopted: moved to PR 4 |
| 3 Capture at the binding, production slugs | Adopted: step 3 |
| 4 Follow-up requests; refusal parsing | Adopted: two Anthropic requests; step 4 accepts and records the refusal change |
| 5 Table and text corrections, stale `4.0.0` lines | Adopted: table, transitive set, step 5 |
| 6 oauth 0.10.4 inert | Adopted: the note on the end of the 0.10 line |
| 7 Node 26 locally; diff review; deploy note | Adopted: step 1, step 9, Needs |
| 8 `agents` and MCP 2.4 are coupled | Adopted: README merges PRs 2 and 3 |
