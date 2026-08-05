# /demo agent playground — research synthesis + design

Status: design accepted 2026-07-06 — adversarial review passed
(APPROVE-WITH-CHANGES, codex gpt-5.5 high reasoning; findings incorporated
below, full review archived at
`research/audits/demo-playground-design-review-2026-07-06.md`); promoted from
`ideas/agent-playground.md` (Solo todo 847). Research run: 7 parallel lanes
(live Cloudflare API model catalog, Cloudflare docs sweep, cloudflare/agents +
agents-starter code inventory, Perplexity + Parallel web sweeps, codex gpt-5.5
high-reasoning architecture review against this repo, local repo recon), all
lanes 2026-07-06. Numbers below are live-verified where marked; re-verify
before trusting after ~2026-08.

## What we're building

A chat playground at `GET /demo` on the existing worker: the user types intent,
a gateway-routed tool-calling model drives Raven's real `search` and
`execute` tools, and every tool call renders as an inspectable trace — search
query → ranked hits → execute script → response envelope (`ok/data` vs
`error.kind: "error" | "soft-empty"`; there is **no** "denied" envelope state —
ADR-0003 removed runtime denial surfaces, correcting a stale line in the
original idea note).

The point is to *prove what Raven does for an agent*, not to teach users to
hand-author JSON (per the idea note). A manual console is explicitly out of
scope for v1.

## Decision 1 — Architecture: same-worker stateless SSE loop, no Durable Object

Verdict shared by four independent lanes (docs, codex-arch, parallel-web, repo
recon): **do not adopt the Agents SDK chat stack; do not spin a separate demo
worker.**

- `AIChatAgent`/`useAgentChat` hard-require a Durable Object + SQLite migration
  (docs state "Agents require Cloudflare Durable Objects"; verified in every
  example's wrangler.jsonc, and via DeepWiki on cloudflare/agents). This worker
  deliberately pins **no DOs** (wrangler.jsonc, PLAN §1). The demo needs none of
  the DO-gated features (server-side persistence, resumable streams, cross-tab
  sync), so reversing the pin buys nothing we need.
- A separate demo worker has the best blast-radius story but requires a
  privileged caller into `/mcp` (admin token or a second OAuth client) — a new
  internet-facing proxy to the hardened MCP surface. Fallback only if /demo
  ever becomes high-volume/public enough that isolation beats simplicity.
- The DO-free path is first-party-documented: plain `fetch` handler +
  AI SDK `streamText({ model, tools, stopWhen })` (see
  https://developers.cloudflare.com/agents/tools/codemode/ai-sdk/ — a complete
  non-Agent, non-DO example that even uses `worker_loaders`, which we already
  have).

Shape:

- `GET /demo` — server-rendered page (site.ts idiom: vanilla HTML/CSS/JS, fonts
  and theme reused; **no React/Vite toolchain added** — the repo ships one JS
  bundle and the trace UI is small enough to hand-roll like site.ts does).
- `POST /demo/chat` — SSE response. Chat history is client-held and replayed
  per request; the worker stays stateless per-request. In the bundled browser
  client, only `user` messages and the assistant's final visible text are
  replayed. Tool trace frames (`search`/`execute` inputs, outputs, logs, and
  cards) are display-only and do not carry into later turns except to the
  extent the final answer summarized them.
- Server iterates `streamText(...).fullStream` and emits **our own small SSE
  frame schema** (`token`, `tool-start`, `tool-result`, `step`, `done`,
  `error`) rather than the AI SDK UI-message protocol, since we own both ends
  and have no `useChat` client. Trace states mirror the AI SDK vocabulary
  (input-streaming → input-available → output-available / output-error) and the
  client must render a distinct *stalled* state if a tool-start never resolves
  (a real, since-fixed vercel/ai bug class — don't trust stream well-formedness).

## Decision 2 — Tools call Raven internals in-process (labeled honestly)

The demo's `search`/`execute` tool definitions call the same functions the MCP
handlers use — not an HTTP round-trip to `/mcp` with a token:

- search: `searchCatalogPage(getCatalog(), opts)` (`src/catalog/search.ts`,
  pure/sync) + the same unknown-service validation the tool handler does
  (`src/mcp/tools.ts`).
- execute: `createExecuteRunner(env)` (`src/executor/run.ts`, worker-only
  import; cache one runner per isolate like `src/server.ts` does).
- Reuse the exported `SEARCH_DESCRIPTION` / `EXECUTE_DESCRIPTION` /
  `SERVER_INSTRUCTIONS` strings verbatim as tool/system text so the demo drives
  the exact production contract and cannot drift from it. Reproduce the
  handlers' `truncateLogsForModel`/`truncateForModel` shaping and `logEvent`
  observability calls. One deliberate demo-vs-MCP payload delta (added during
  live testing): search RESULT pages are compacted for the demo model — 5-hit
  default page, per-hit description/signature clipped (~8KB vs ~19KB) —
  because full pages blew up a reasoning model's follow-up prefill past the
  turn timeout. Tool ids, input schemas, and descriptions stay identical; the
  trace shows the compacted payload the model actually received.
- UI copy states plainly: the playground exercises the same server-side Raven
  tool implementations as `/mcp`; it does not exercise MCP OAuth transport.

## Decision 3 — Model: via AI binding + AI Gateway; GPT-5.4 primary

> **Revision 2026-07-07 (live `/demo/chat` gauntlet):** use
> `openai/gpt-5.4` as the primary model and `openai/gpt-5.4-mini` as the
> fallback, with `xai/grok-4.3` and `@cf/moonshotai/kimi-k2.7-code` kept as
> future-gauntlet controls. The measured matrix is in
> `research/demo-model-gauntlet-2026-07-07.md`; the code source of truth is
> `src/demo/model-config.ts`. GPT-5.4 had the best reliability/latency balance
> under the exact Worker + SSE + AI Gateway + `workers-ai-provider` + Raven
> `search`/`execute` path. GPT-5.4 Mini was faster and cheaper but had more
> tool-budget failures, so it remains fallback rather than primary. Search
> payloads stay compacted (5-hit default page, clipped description/signature)
> to keep reasoning-model prefill small.

Historical note: the original 2026-07-06 price-first pass considered Workers
AI `@cf/*` models first, and Kimi was briefly the best live-browser candidate
after cheaper models failed streaming tool calls. That is no longer the active
default.

Live account catalog (26 text-gen models, `/ai/models/search`, 2026-07-06):

| candidate | $/M in/out | ctx | function calling | note |
|---|---|---|---|---|
| `@cf/zai-org/glm-4.7-flash` | 0.0605 / 0.40 | 131k | yes (+reasoning) | historical price-first candidate; failed the live tool-call path in later testing |
| `@cf/openai/gpt-oss-20b` | 0.20 / 0.30 | 128k | yes | cheapest strong output pricing, but binding I/O is Responses-API-shaped (`input`, not `messages`) — verify provider conversion before use |
| `@cf/google/gemma-4-26b-a4b-it` | 0.10 / 0.30 | 256k | yes | newer, less battle-tested — A/B candidate |
| `openai/gpt-5.4` / `openai/gpt-5.4-mini` | see live AI Gateway pricing | ~1.1M for mini; verify catalog for exact context | yes | active primary/fallback from the 2026-07-07 gauntlet |

Rejected: `@hf/nousresearch/hermes-2-pro-mistral-7b` (**deprecated, gone from
live catalog** — appears in stale docs/blog posts, do not build on it);
`@cf/meta/llama-3.3-70b-instruct-fp8-fast` (live ctx only **24k** — Raven trace
payloads overflow it; $2.25/M out); `qwen2.5-coder-32b` (no function_calling
property).

Billing facts that matter (live docs 2026-06-22):
- `env.AI.run()` / `workers-ai-provider` with a `@cf/*` model bills as ordinary
  Workers AI (Neurons, $0.011/1k, 10k/day free) — **not** Unified Billing, no
  credits needed. Third-party model strings (`openai/…`) on the same call
  surface bill via Unified Billing credits (5% purchase fee, list-price
  pass-through). No BYOK either way — BYOK is structurally unsupported through
  the binding, which satisfies our constraint by default.
- Route through an AI Gateway (`gateway: { id }` on the provider) for free
  per-model cost analytics + spend-limit rules (up to 20/gateway, 429 on trip).
  Gateway logs cap at 100k–1M/mo with no overage — the gateway log viewer is
  NOT the durable trace store; our own `logEvent` calls remain the record.
- There is **no hard dollar cap** primitive — budget enforcement is ours
  (Decision 5).

Deps (from cloudflare/agents-starter, the only repo with real pinned semver):
`ai@^6`, `workers-ai-provider@^3.2` (v3.0+ mandatory — earlier versions
silently fell back to non-streaming when tools were defined and had tool-call
ID/history bugs), `zod@^4` (already present).

## Decision 4 — Auth: WorkOS-gated, reusing the existing `/callback`

The idea note requires the existing WorkOS posture and no client-side
credentials. Today there is no browser session concept — the WorkOS flow only
mints MCP OAuth tokens. So:

- `GET /demo` unauthenticated renders the page in **locked** state with a
  sign-in button (and can show canned example traces).
- `GET /demo/login` → WorkOS AuthKit redirect, parking state in `OAUTH_KV`
  — **reusing the registered `${origin}/callback`** redirect URI (a separate
  `/demo/callback` would require a WorkOS dashboard change). Review-required
  shape: the parked KV value becomes a **validated discriminated union**
  (`{ type: "mcp", oauthReq, binding } | { type: "demo", binding, returnTo }`;
  today it is untyped `{ oauthReq, binding }` and the callback parses it
  unconditionally). Unknown/malformed state is rejected; state is deleted
  single-use **before** the code exchange; the demo branch redirects only to
  fixed same-origin paths.
- Callback (demo branch) exchanges the code, derives the peppered subject
  (same `deriveSubject` pattern), drops WorkOS tokens, sets a signed
  `__Host-RAVEN_DEMO` cookie (HMAC via `MCP_SERVER_SECRET`, short TTL,
  **`SameSite=Strict`** — the existing MCP-flow cookie is Lax, the demo cookie
  must be stricter). Implementation note (build review): the callback returns
  a **same-origin interstitial page** (meta-refresh to `/demo`) rather than a
  302 — a Strict cookie is not sent on the cross-site redirect chain arriving
  from WorkOS, so the interstitial starts a fresh same-origin navigation.
  Verified working in a real browser against production on 2026-07-07
  (first deploy, version 087049b7).
- `POST /demo/chat` requires that cookie **plus explicit CSRF/origin defense**
  (review finding: a cookie alone is insufficient across two same-site custom
  domains): require the `Origin` header to equal the request origin, reject
  unsafe `Sec-Fetch-Site` values where present. MCP OAuth paths are untouched.
- No anonymous live chat until a rate-limit story exists. Local dev keeps the
  loopback-only `DEV_ALLOW_UNAUTHENTICATED` bypass for the chat endpoint.

## Decision 5 — Cost control: per-request caps (in-request enforced) + best-effort throttling

Stateless = no cross-request session budget without new state. The real,
enforceable limits are **in-request closure counters** inside the chat handler;
everything cross-request is honest best-effort (review finding 3 — Workers KV
has no atomic consume, and `stepCountIs` alone does not cap multiple tool calls
emitted in a single model step):

- `stopWhen: stepCountIs(5)`; `maxOutputTokens` 4096 (sized for reasoning
  models, where hidden reasoning can consume output budget before visible text;
  worst case ≈ 1.6¢ of output per turn at the GPT-5.4 output rate used by the
  2026-07-07 gauntlet); abort/timeout on the whole turn (120s, tied to client
  disconnect).
- In-request counters enforced inside the tool `execute:` closures: ≤ 2
  `execute` calls and ≤ 2 `search` calls per turn (counted per call, not per
  step), search result limit clamped to ≤ 6 (default page 5, per-hit prose
  clipped — see Decision 2 note), execute code length capped at 8000 chars,
  replayed history first clamped to the newest 20 `user`/`assistant` messages
  and then trimmed by dropping oldest messages until it is within the 24k
  total-content budget when possible; the final new message is always kept.
  The per-message 4000-char cap applies to user-role messages only —
  truncating replayed assistant answers corrupts the model's view of its own
  replies (PR #5 review); with 4096-token answers, the 24k-char history budget
  holds roughly one to two long turns of memory, which is the cost guard
  working as intended. In the bundled browser client, tool trace frames are not
  replayed; the next turn gets only prior user text plus final assistant text
  after clamping.
- Per-subject KV token-bucket (N chats/hour on `OAUTH_KV`) — **best-effort
  coarse throttling only**, racy by design; acceptable because the WorkOS gate
  bounds the audience.
- AI Gateway spend-limit rule is a **mandatory backstop**, not optional; every
  execute is also a Worker Loader isolate spin-up (open beta, Workers Paid) —
  the per-turn execute counter bounds it.
  Updated 2026-07-07: the demo routes through the dedicated
  `stellar-raven-demo` gateway (`DEMO_AI_GATEWAY_ID` in `wrangler.jsonc`, with
  the same fallback in code) so rate-limit / spend-limit posture can live on a
  demo-specific control plane. Read-only Cloudflare verification on
  2026-07-07 found authentication enabled, `collect_logs: false`, no stored
  provider configs, no dynamic routes, a gateway rate limit of 50 requests per
  60 seconds, one enabled gateway spend-limit rule (`cost` limit 100 over a
  86400-second sliding window), and the account-level daily sliding spending
  limit still enabled. The public-demo logging policy is no retained AI
  Gateway prompt/response logs; revisit that posture if the gate ever loosens.
  Read-only verification on 2026-08-05 found the gateway-wide default had drifted to
  `collect_logs: true`; the Worker now sets `cf-aig-collect-log: false` on every
  playground model request, so privacy does not depend on that mutable default.
- If a hard cross-request cap ever becomes a requirement, that is an explicit
  new design (atomic limiter: DO or Cloudflare rate-limiting product) — not a
  KV patch.

## Implementation map

- `wrangler.jsonc`: add `"ai": { "binding": "AI" }` — the only config change.
  No DO, no migrations, no assets binding. `npm run typegen` regenerates
  `env.d.ts`.
- Prerequisite export refactors (review findings 4–5 — these constants are
  module-private today, the doc previously claimed they were exported):
  export `SEARCH_DESCRIPTION` / `EXECUTE_DESCRIPTION` from `src/mcp/tools.ts`
  (`SERVER_INSTRUCTIONS` already is), and export `FONT_FACE` / `TOKENS` /
  `BASE` from `src/site.ts` (page-specific CSS stays private).
- `src/server.ts`: intercept demo routes **before `oauthProvider.fetch`** via
  an `isDemoPath(url)` helper with **exact matching** (`/demo`, `/demo/`,
  `/demo/login`, `/demo/chat` — no `startsWith` that would catch
  `/demolition`); GET+HEAD for the page, 405 on unsupported methods. Extend the
  existing `/callback` handler in `src/auth/workos.ts` with the validated
  demo state-type branch (Decision 4).
- `src/demo/page.ts` — server-rendered playground page; reuses `FONT_FACE`,
  `TOKENS`, `BASE`, terminal chrome (`.term`, `pre.code` syntax tints), tabs,
  buttons from `src/site.ts`; **own header set** (LANDING_HEADERS' CSP has
  `connect-src 'none'` which would block our own SSE — demo needs
  `connect-src 'self'`, hashed/inline script allowance, `no-store` on the API).
  `noindex` + `robots.txt` disallow `/demo`. GET+HEAD both answered.
- `src/demo/auth.ts` — cookie mint/verify + login redirect + callback branch
  helper.
- `src/demo/chat.ts` — request validation, history clamp, `streamText` loop,
  fullStream → SSE frame translation.
- `src/demo/tools.ts` — the two AI SDK `tool()` defs wrapping in-process
  internals + trace emission + truncation shaping. (Named to avoid colliding
  with `src/mcp/tools.ts`.)
- `src/demo/budget.ts` — cap constants + clamp helpers + KV token bucket.
- ADR-0003 discipline: demo page copy and the demo system prompt are emitted
  text — they must not reference non-exposed ops or retired skills (e.g. the
  paid Lumenloop research lane). The build guard does not cover site pages
  and a one-off grep can miss service-qualified names (review finding 7):
  factor a reusable `assertNoNonExposedRefsInText()` helper backed by
  `scripts/exposure.mjs` and run it in tests over the rendered demo HTML and
  the demo system/tool prompt strings.
- Dependency verification (review finding 8): pin **exact** versions of `ai`
  and `workers-ai-provider` (no carets initially), run `npm run build`
  (dry-run deploy) and record bundle size + import-graph warnings in the PR,
  and add a workerd smoke test that imports the demo route module.
- Worker-only import discipline: `src/demo/chat.ts`/`tools.ts` import
  `src/executor/run.ts` — keep them out of the plain-Node vitest import graph;
  route dispatch/wiring tests go in `test/smoke/` (workerd lane), pure pieces
  (frame encoding, clamps, cookie HMAC) in plain-Node tests.

## Risks (top 5)

1. **Cost abuse** — per-request caps only; mitigated by WorkOS gate + KV bucket
   + gateway spend limit; no public anonymous access in v1.
2. **Blast radius on the hardened worker** — new deps (`ai`,
   `workers-ai-provider`) and a public streaming route beside `/mcp`; keep
   `src/demo/` isolated, zero changes to MCP auth behavior, review the diff for
   route-order regressions.
3. **Model reliability** — provider-specific tool-call behavior still varies;
   `DEMO_MODEL_OVERRIDE` and the gauntlet runner exist so model changes prove
   themselves in the real Worker/SSE/tool path before promotion.
4. **Trace leakage** — traces show model code + tool results; the executor's
   existing redaction/truncation runs on everything displayed; don't log full
   trace payloads server-side.
5. **Demo honesty drift** — in-process calls bypass MCP transport; mitigated by
   reusing the exact exported descriptions/helpers + honest UI labeling.

## Rejected alternatives (for the record)

- **Agents SDK / agents-starter fork** — DO requirement (see Decision 1); also
  drags in React/Vite/Kumo, a second frontend toolchain this repo deliberately
  lacks. Used as UX reference only (its debug-mode JSON inspector and
  playground's `ToolCard` Code/Result/Console/Error layout inform our trace
  cards; `extractFunctionCalls`-style regex summarizes execute scripts in
  collapsed headers).
- **Separate demo worker** — privileged-caller problem; fallback if traffic
  justifies it.
- **MCP-client-to-self (`this.mcp.addMcpServer` or raw MCP HTTP)** — redundant
  OAuth dance against ourselves, DO-bound anyway via `this.mcp`, and pointless
  overhead vs in-process calls.
- **assistant-ui / agent-chat-ui component libraries** — React-bound; their
  tool-render state machines informed the SSE frame schema instead.
- **`@cloudflare/ai-utils` `runWithTools`** — leanest loop, but AI SDK v6
  `streamText` gives us streaming + typed tool parts + `stopWhen` and matches
  the provider that Cloudflare now actively maintains for exactly this
  (workers-ai-provider v3).

## Sources

Live account API `/ai/models/search` (2026-07-06); developers.cloudflare.com:
`agents/examples/chat-agent/`, `agents/communication-channels/chat/chat-agents/`,
`agents/runtime/agents-api/`, `agents/tools/codemode/ai-sdk/`,
`agents/model-context-protocol/apis/handler-api/`,
`workers-ai/features/function-calling/`, `workers-ai/platform/pricing/`,
`ai-gateway/features/unified-billing/`, `ai-gateway/features/spend-limits/`,
`ai-gateway/changelog/` (2026-05-21 unified endpoint), `workers/static-assets/`;
github.com/cloudflare/agents (examples/ai-chat, examples/playground demos/ai/*,
examples/mcp-client), github.com/cloudflare/agents-starter (pinned dep
baseline); blog.cloudflare.com `code-mode`, `embedded-function-calling`,
`building-ai-agents-with-mcp-authn-authz-and-durable-objects`;
community.cloudflare.com t/871672 (SDK v0.3.0 / AI SDK v6 breaking changes);
vercel/ai#10980 (tool_result pairing bug class). Full lane reports archived in
Solo scratchpad `demo-playground-coordination` session notes.
