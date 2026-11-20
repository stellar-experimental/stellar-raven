# ChatGPT subscription login for `/playground`

Status: held research note (recorded 2026-07-15 from feedback proposing
[`opencoredev/login-with-chatgpt`](https://github.com/opencoredev/login-with-chatgpt)). Reopen only
when a trigger below fires; re-verify all external facts before any spike.

## Decision

Restricting this to `/playground` makes it a viable optional path for developers already paying for
ChatGPT/Codex without touching `/mcp`, WorkOS OAuth, or sandbox secret isolation. Never require two
logins or treat it as generic social login; offer two explicit choices:

- **Try with Raven credits:** existing WorkOS login, AI Gateway path, current caps.
- **Use my ChatGPT plan:** ChatGPT device-code login serves as both playground identity and model
  billing, with explicit consent that Raven receives prompts, stores an encrypted refresh token
  server-side, and spends the user's ChatGPT/Codex allowance.

OpenAI documents Codex app-server and SDK integration for host apps
([App Server](https://learn.chatgpt.com/docs/app-server),
[Codex SDK](https://learn.chatgpt.com/docs/codex-sdk)), but hosted multi-tenant refresh-token
custody via a third-party SDK mirroring the Codex wire protocol (`0.2.0`, commit `7b3deeb`) is
unconfirmed for a public website.

## Linked SDK summary (reviewed 2026-07-15, `0.2.0`)

- **Strengths:** Web-standard (`Request`/`Response`/`fetch`/`crypto.subtle`), Workers-compatible,
  request-driven device-code polling (no alarm loop), AES-GCM encrypted tokens behind HttpOnly
  cookies, built-in model discovery/refresh/origin checks, 1 runtime dependency (`core`).
- **Risks:** Brand-new auth dependency; hardcodes public Codex client ID, `auth.openai.com`,
  `chatgpt.com/backend-api/codex`, and client version (fragile to wire drift); broad OAuth scope
  with no narrow Raven-side revocation on OpenAI. Use the pinned packages for a spike (never copy
  protocol code, never install the React package).

## Playground fit

Change only auth and model transport (keep stateless SSE, system prompt, `search`/`execute`, trace
frames, history clamp, tool counters, code-size cap, timeout, and per-subject hourly throttle):

1. Mount narrow `/playground/chatgpt/{login,status,session,logout}` routes with a distinct
   `__Host-` HttpOnly, Secure, SameSite=Strict cookie.
2. Derive the privacy-safe subject from ChatGPT account ID + Raven's server secret (never log raw
   account ID, email, token, prompt, or attachment).
3. Discover models per account (never hardcode one slug for all plans).
4. Never silently fall back from an exhausted/broken ChatGPT session to Raven credits; offer an
   explicit switch.
5. Direct Codex traffic bypasses AI Gateway (no gateway analytics/spend rules/affinity); emit
   equivalent privacy-safe app telemetry.

## Production blockers

1. **Strongly consistent token refresh:** `OAUTH_KV` is eventually consistent and unsafe for
   rotating refresh tokens or concurrent tabs ([KV consistency](https://developers.cloudflare.com/kv/concepts/how-kv-works/)).
   Production needs a per-session Durable Object or transactional CAS store, reopening the
   playground's no-DO decision.
2. **Output-budget regression:** The transport strips `max_output_tokens` / `max_completion_tokens`
   (rejected by the Codex endpoint), disabling `DEMO_CAPS.maxOutputTokens = 4096`. A spike must
   prove abort propagation and reconcile budget copy honestly.
3. **Hosted-use confirmation:** Confirm hosted multi-tenant refresh-token custody with OpenAI and
   register a known client identity if offered (required for Business/Enterprise compliance logs).
4. **Security and lifecycle:** Host-side encrypted tokens only (never in sandbox, logs, artifacts,
   or browser JS), short session lifetime, visible logout, account-deletion cleanup, edge rate
   limits on unauthenticated routes, origin checks, operator kill switch, and protocol drift review
   on upgrades.

## Spike and ship gate

Run only after hosted-use confirmation (or accepting a disposable spike): dev-only flagged route
with in-memory store; exercise login, cancel/expiry, model discovery, multi-turn reasoning
continuity, logout, forced refresh, simultaneous tabs, abort/timeout, 401/429/kill-switch, and
secret-isolation checks; pass playground semantic corpus with quality ≥ shipped primary, plus
standard repo gates and secrets scan.

## Triggers to revisit

Reopen when one holds:

- Repeated users request ChatGPT-funded playground access.
- Raven-funded playground inference becomes a meaningful operating cost.
- OpenAI ships an official Workers-compatible auth/transport library.
- A planned Durable Object already exists that can safely own per-session token refresh.

Until then, prefer "Connect Raven to Codex" / "Use Raven in ChatGPT" onboarding (no credential
custody).

## References

- [Codex App Server](https://learn.chatgpt.com/docs/app-server),
  [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk),
  [Authentication](https://learn.chatgpt.com/docs/auth),
  [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/)
- [`opencoredev/login-with-chatgpt`](https://github.com/opencoredev/login-with-chatgpt),
  [`research/demo-playground-design.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/demo-playground-design.md)
