# ChatGPT subscription login for `/playground`

Status: research note only. Worth a bounded prototype; do not ship until the production gates below
are satisfied.

Recorded: 2026-07-15 from product feedback proposing
[`opencoredev/login-with-chatgpt`](https://github.com/opencoredev/login-with-chatgpt) so playground
users can spend their own ChatGPT/Codex allowance.

## Decision

The playground-only scope materially improves the idea. It is a plausible optional path for the
developer audience already paying for ChatGPT/Codex, and it can remove Raven-funded inference from
those sessions without changing `/mcp`, its WorkOS OAuth contract, or the sandbox's secret boundary.

Do not treat it as generic social login and do not require two logins. If shipped, the playground
would offer two explicit choices:

- **Try with Raven credits** — existing WorkOS login, current AI Gateway model path, current caps.
- **Use my ChatGPT plan** — ChatGPT device-code login serves as both playground identity and model
  billing. Copy must say that Raven receives prompts, stores a refreshable credential server-side,
  and consumes the user's ChatGPT/Codex allowance.

Keep this as an idea until a small spike clears the support, storage, budget, and quality gates.
One feedback item is enough to research, not enough to add a second production auth system.

## What changed from the initial assessment

This is no longer best characterized as an unsupported direction. OpenAI's current Codex
app-server documentation explicitly describes app-server as the interface for deep integration in
another product, including ChatGPT-managed browser and device-code login, token persistence and
refresh, plan details, and rate-limit reads
([Codex App Server](https://learn.chatgpt.com/docs/app-server)). The Codex SDK documentation also
names integration inside an application as a supported use case, though its TypeScript library is
server-side Node rather than a Workers runtime
([Codex SDK](https://learn.chatgpt.com/docs/codex-sdk)). OpenAI product leadership has also publicly
described using Codex subscriptions in OpenCode, Pi, Claude Code, and other clients as intentional;
the statement and source links are preserved in
[Simon Willison's contemporary write-up](https://simonwillison.net/2026/Apr/23/gpt-5-5/).

The unresolved distinction is **hosted multi-tenant credential custody**. Most named integrations
are local clients. Raven would retain encrypted refresh tokens on its infrastructure for a public
website. Official app-server supports host applications that own auth, and asks enterprise-facing
integrations to contact OpenAI for a known client identity, but the linked SDK is not an official
OpenAI SDK and directly mirrors the Codex wire protocol. Confirm this exact hosted use before
production.

## Linked SDK assessment

Reviewed commit
[`7b3deeb`](https://github.com/opencoredev/login-with-chatgpt/tree/7b3deeb6e6bd539d594947f258a2fc26cf8fe866)
and npm `0.2.0` on 2026-07-15.

Strengths:

- Web-standard core and server packages use `Request`, `Response`, `fetch`, and `crypto.subtle`, and
  explicitly support Cloudflare Workers
  ([server reference](https://github.com/opencoredev/login-with-chatgpt/blob/7b3deeb6e6bd539d594947f258a2fc26cf8fe866/docs/content/docs/reference/server.mdx)).
- Device-code polling is request-driven, so no background loop or Durable Object alarm is required.
- Tokens stay behind an HttpOnly session cookie, are AES-GCM encrypted at rest when a secret is
  configured, and raw token export is disabled by default
  ([security model](https://github.com/opencoredev/login-with-chatgpt/blob/7b3deeb6e6bd539d594947f258a2fc26cf8fe866/docs/content/docs/concepts/security.mdx)).
- Model discovery, token refresh, same-origin checks, body limits, model allowlists, and per-session
  request limiting already exist. The server package has one runtime dependency: its core package.
- Fresh local verification passed all 76 upstream tests, typecheck, and build. No open GitHub issues
  existed at review time.

Risks:

- Project was created 2026-07-08 and published three versions that day. Good first implementation;
  insufficient maintenance history for an auth dependency.
- It hardcodes the public Codex client id, `auth.openai.com`,
  `chatgpt.com/backend-api/codex`, `originator: codex_cli_rs`, and a Codex client version
  ([wire constants](https://github.com/opencoredev/login-with-chatgpt/blob/7b3deeb6e6bd539d594947f258a2fc26cf8fe866/packages/core/src/constants.ts)).
  These mirror the open-source client but remain more change-sensitive than the Platform API.
- OAuth has no narrow Raven-specific scope. A compromised Raven server could spend the user's plan
  and read profile claims; informed consent and a short session lifetime are mandatory.
- Logout deletes Raven's stored session but does not provide a narrow OpenAI-side grant-revocation
  control. Treat stored refresh tokens like passwords.

Use the linked packages for a spike rather than copying their protocol code. Pin an exact version
until maintenance history exists. Do not install the React package: the playground already owns a
small vanilla browser client.

## Fit with current playground

The current design in [`research/demo-playground-design.md`](../research/demo-playground-design.md)
remains valid for the Raven-funded path: same-worker stateless SSE, WorkOS access, AI Gateway,
per-turn tool/step/output caps, whole-turn abort, and best-effort hourly throttling.

ChatGPT-funded sessions would change only authentication and model transport:

1. Mount narrow `/playground/chatgpt/{login,status,session,logout}` routes.
2. Use a distinct `__Host-` HttpOnly, Secure, SameSite=Strict cookie.
3. Derive the existing privacy-safe playground subject from the ChatGPT account id plus Raven's
   server secret. Never log the raw account id, email, token, prompt, or attachment.
4. Select a model from live account discovery. Never assume one slug exists for every plan.
5. Run the existing `streamText` loop, system prompt, `search`/`execute` tools, trace frames,
   history clamp, tool counters, code-size limit, and timeout through a ChatGPT-backed provider.
6. Never silently fall back from an exhausted or broken ChatGPT session to Raven-funded inference.
   Offer an explicit switch instead.
7. Preserve the existing per-subject hourly chat throttle because `execute` still consumes Raven
   Worker Loader and upstream-service capacity even when model inference is user-funded.

Direct Codex traffic bypasses Raven's AI Gateway, so gateway analytics, spend rules, model fallback,
and session affinity do not apply to this branch. Emit equivalent privacy-safe app telemetry for
model, duration, finish reason, tool counts, upstream status, and returned usage when available.

## Production blockers

### 1. Strongly consistent session refresh

Do not use the existing `OAUTH_KV` binding as the canonical ChatGPT token store. Workers KV is
eventually consistent, changes may take 60 seconds or more to appear elsewhere, and Cloudflare says
it is unsuitable for atomic read/write transactions
([How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)). Device-code polling,
rotating refresh tokens, multiple tabs, and concurrent chat requests can otherwise read stale state
or race token rotation.

A thin `KeyValueStore` adapter does not fix this because the SDK performs read/refresh/write as
separate calls. Production shape needs one of:

- route each ChatGPT session through a per-session Durable Object and run the whole session manager
  operation there, gaining serialized requests; or
- use a storage/service design with a tested compare-and-swap or transaction around refresh.

This is the largest architectural cost. It reopens the playground's deliberate no-Durable-Object
decision for one narrow auth requirement. Do not add the primitive until demand justifies it.

### 2. Output-budget regression

The linked transport removes `max_output_tokens` and `max_completion_tokens` because the
ChatGPT-backed Codex endpoint rejects them
([response proxy](https://github.com/opencoredev/login-with-chatgpt/blob/7b3deeb6e6bd539d594947f258a2fc26cf8fe866/docs/content/docs/concepts/response-proxy.mdx)).
Therefore the current `DEMO_CAPS.maxOutputTokens = 4096` is not enforced on this path.

The whole-turn `AbortSignal`, maximum steps, tool counters, history clamp, and user subscription
limit still bound damage, but hidden reasoning and output can consume more allowance than Raven's
UI promises. A spike must prove cancellation propagation and either establish an effective output
ceiling or present a separate honest budget contract for ChatGPT-funded sessions. Do not retain UI
copy claiming the existing output cap when transport strips it.

### 3. Hosted-use and enterprise confirmation

Before public launch, ask OpenAI to confirm that a hosted public playground may use the Codex public
client/device flow and retain per-user refresh tokens. Register a Raven client identity if offered.
For Business/Enterprise support, follow app-server's guidance to obtain a known client identity so
workspace compliance logs can attribute Raven correctly
([Codex App Server: initialization](https://learn.chatgpt.com/docs/app-server#initialization)).

### 4. Security and lifecycle

- Keep refresh/access/id tokens encrypted host-side and outside all model, sandbox, logs, artifacts,
  browser JavaScript, and observability payloads.
- Use a short explicit session lifetime, visible sign-out, account-deletion cleanup, edge limits on
  unauthenticated login/status routes, origin checks, and an operator kill switch.
- Preserve consent explaining that prompts and attachments pass through Raven and usage counts
  against the user's plan. OpenAI's own auth docs say file-backed Codex credentials must be treated
  like a password ([Authentication](https://learn.chatgpt.com/docs/auth#credential-storage)).
- Run dependency and protocol drift review on every upgrade. No floating client-version workaround.

## Bounded spike and ship gate

Run only after hosted-use confirmation or explicit acceptance that the spike is disposable:

1. Add a local/dev-only route behind a flag, using an in-memory store. No production deployment.
2. Exercise login, cancelled/expired device code, model discovery, one turn, multi-turn encrypted
   reasoning continuity, logout, and forced token refresh.
3. Run the existing playground semantic corpus through the ChatGPT path. Require tool-call and final
   answer quality no worse than the current GPT-5.4 path on reviewed cases.
4. Test simultaneous tabs and refresh-at-expiry. Production storage design must demonstrate one
   refresh winner and no stale-token replay.
5. Verify abort on timeout/client disconnect and measure actual usage. Reconcile the missing output
   token field before writing budget copy.
6. Verify no raw identity or credential reaches `logEvent`, AI Gateway, Dynamic Worker bindings,
   trace frames, or error bodies.
7. Test 401, 429, model disappearance, workspace restriction, dependency drift, and kill-switch
   behavior. No automatic Raven-funded fallback.

Production remains blocked until every item passes, a strongly consistent session design exists,
privacy/consent copy is reviewed, and `npm run typecheck`, `npm test`, `npm run build`, the narrow
playground eval, and secrets scan pass.

## Trigger to revisit

Reopen when one of these becomes true:

- repeated users ask for ChatGPT-funded playground access;
- Raven-funded playground inference becomes a meaningful operating cost;
- OpenAI publishes a Worker-compatible official auth/transport library; or
- a planned Durable Object already exists and can safely own per-session token refresh.

Until then, improve the lower-risk paths: clear “Connect Raven to Codex” and “Use Raven in ChatGPT”
onboarding lets users spend their own ChatGPT allowance without Raven storing ChatGPT credentials.

## References

- [Codex App Server](https://learn.chatgpt.com/docs/app-server)
- [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk)
- [Authentication](https://learn.chatgpt.com/docs/auth)
- [Codex pricing and limits](https://learn.chatgpt.com/docs/pricing)
- [`opencoredev/login-with-chatgpt`](https://github.com/opencoredev/login-with-chatgpt)
- [Cline: Bring your ChatGPT subscription to Cline](https://cline.bot/blog/introducing-openai-codex-oauth)
- [OpenClaw OAuth storage model](https://docs.openclaw.ai/concepts/oauth)
- [Cloudflare Workers KV consistency](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/)
