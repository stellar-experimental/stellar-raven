# Auth design research — WorkOS OAuth for /mcp (feeds PLAN Phase 8)

Live-verified against the prior-art repos 2026-07-02 (read-only; learn, don't clone).
Decision context: user directive — WorkOS OAuth for everything **except admin keys or local**,
which bypass; implement as simply as possible.

## How the prior art does it (both repos, near-identical)

- **The server is its own OAuth 2.1 authorization server** via
  `@cloudflare/workers-oauth-provider` (^0.8.1). WorkOS is only the upstream IdP that
  authenticates the human; MCP clients never talk to WorkOS.
- No `@workos-inc/*` SDK, no JWT/JWKS library. WorkOS AuthKit is driven with two raw fetches:
  redirect to `https://api.workos.com/user_management/authorize` (`provider=authkit`,
  `redirect_uri=${origin}/callback` — origin-derived, no env switch), then
  `POST https://api.workos.com/user_management/authenticate` with
  `{client_id, client_secret: WORKOS_API_KEY, grant_type: "authorization_code", code}`.
- `OAuthProvider({ apiHandlers: {"/mcp": …}, authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token", clientRegistrationEndpoint: "/register", defaultHandler })`
  serves /token, /register, and both `.well-known` discovery docs automatically. The
  defaultHandler implements GET/POST /authorize (consent page + double-submit CSRF cookie),
  /callback (parked-state lookup in KV `login:${state}`, 10-min TTL, browser-binding cookie),
  then `provider.completeAuthorization({request, userId, scope, props})` mints the server's
  OWN opaque token (90-day TTL in prior art).
- **Bearer validation at /mcp is entirely inside the provider** — opaque token lookup in KV
  (`OAUTH_KV` namespace), not JWKS/introspection. Props (`{tenantKey, subject, scopes, plan}`)
  flow to the handler. WorkOS tokens are dropped after the code exchange, never stored
  (their ADR-0016).
- **Admin bypass** (only bypass they have): one static bearer credential, compared as a
  SHA-256 digest with `timingSafeEqual`; a match short-circuits the provider. No localhost
  bypass in prior art (we ADD one, per user directive — via an explicit local-only var, not
  a hostname check).
- `-next` extras worth keeping: `resourceMetadata`/`scopesSupported` for connector discovery,
  `allowPlainPKCE: false`, and an alias rewrite for the path-suffixed
  `/.well-known/oauth-authorization-server/*` form some clients request.

## Secrets (names only; values in .env / Worker secrets — never print or commit)

Runtime reads exactly `WORKOS_CLIENT_ID` + `WORKOS_API_KEY`. Our `.env` keeps
`WORKOS_{STAGING,PRODUCTION}_{CLIENT_ID,API_KEY}` as the operator sheet; staging vs production
is chosen at deploy time by which value the operator loads into the single runtime secret pair
(same pattern as prior art). Also needed: a server secret (hash pepper for subject/tenant
derivation). Named API-key token digests live in `OAUTH_KV`, not Worker secrets.

## What we adopt for stellar-raven-codemode (simplest faithful shape)

1. `@cloudflare/workers-oauth-provider` wrapping our existing stateless `createMcpHandler`
   fetch at /mcp; defaultHandler = a single small `src/auth/workos.ts` (authorize/callback +
   consent + CSRF, modeled on `-next`'s wiring with `raven`'s rationale comments in mind).
2. KV namespace `OAUTH_KV` — a NEW namespace for this project (the prior-art namespace
   `473fc625531d4687b0e353e069092afa` is shared by both old workers and dies with the teardown).
3. Named API-key bypass: non-expiring `Authorization: Bearer <name>:<token>` credentials;
   store only SHA-256 token digests under `raven:api-key:v1:<name>` in `OAUTH_KV`.
4. Local bypass: `DEV_ALLOW_UNAUTHENTICATED=true` set ONLY in `.dev.vars` (never a deployed
   secret).

> **Shipped (supersedes the original item 4 design above).** The local bypass that shipped in
> `src/auth/gate.ts` (`allowDevUnauthenticated`, ~lines 92–98) is stricter than "explicit, not
> hostname-sniffing": it requires the var to be the exact string `"true"` **AND** the request
> hostname to be loopback (`localhost` / `127.0.0.1` / `::1`). The hostname check is a hard
> second factor — the var is inert even if it is ever mistakenly deployed, because the public
> hosts (`raven.stellar.org`, its `raven.stellar.buzz` / `agents.stellar.buzz` aliases) are not
> loopback. The historical
> reasoning above (explicit local-only var, no bypass in prior art) still stands as the *why*;
> the loopback gate is the belt-and-braces we added on top.

## Spec-compliance review (2026-07-02, live-verified against the deployment — default route raven.stellar.buzz, agents.stellar.buzz alias)

Deep-dive across the MCP authorization spec (2025-06-18 + 2025-11-25 revisions, 2026 release
candidate), WorkOS docs/blog, and Cloudflare docs. Verdict: **our discovery surface is
spec-compliant and normatively correct; our architecture is the Cloudflare pattern, not the
WorkOS-recommended pattern — a deliberate, compliant choice.**

### What the MCP spec makes normative (and how we comply — all verified live)

- **RFC 9728 protected-resource metadata is a MUST** (since 2025-06-18): serve
  `/.well-known/oauth-protected-resource` and advertise it via `resource_metadata` in the 401
  `WWW-Authenticate` header (RFC 9728 §5.1). ✅ Lib 0.8.1 does both natively, including the
  path-suffixed `/.well-known/oauth-protected-resource/mcp` form (RFC 9728 §3.1 path
  insertion) — verified in its dist AND live (all endpoints 200; 401 header carries
  `resource_metadata="…/.well-known/oauth-protected-resource/mcp"`). Note: a 2026-07 DeepWiki
  read of the lib claimed no path-suffix support — stale snapshot; trust the dist.
- **AS metadata**: 2025-06-18 required RFC 8414 (`/.well-known/oauth-authorization-server`);
  2025-11-25 relaxed to "RFC 8414 **or** OIDC discovery (`/.well-known/openid-configuration`)"
  and requires CLIENTS to support both, trying `oauth-authorization-server` first for
  path-less issuers. ✅ We serve RFC 8414 at the exact path; since this review we ALSO alias
  the OIDC-discovery path onto it (RFC 8414 §5 sanctions an OAuth-only AS publishing there;
  covers clients that only probe OIDC discovery).
- **Path-suffixed well-known forms**: clients doing RFC 8414 §3.1 path insertion only need
  them when the issuer has a path component — ours (`https://raven.stellar.buzz`, and its
  `agents.stellar.buzz` alias) doesn't,
  so the `/.well-known/oauth-authorization-server/mcp` alias in `src/auth/gate.ts` is purely
  defensive for non-conforming clients that append the resource path. Metadata `issuer` must
  equal the URL used to construct the well-known request (clients reject otherwise) — ours
  does.
- **Own-AS vs delegated AS**: the spec is explicitly topology-neutral — "a single MCP server
  could list its own host as an authorization server, effectively serving both roles."
  Co-locating AS+RS (our design) is compliant. DCR went SHOULD→MAY in 2025-11-25; CIMD
  (URL client_ids) was added there as the preferred registration mechanism — we enable both
  (`clientRegistrationEndpoint` + `clientIdMetadataDocumentEnabled`, commit d494e6d).
- Other normative bits we satisfy: OAuth 2.1 posture with S256-only PKCE; audience
  validation on tokens (lib enforces "Invalid audience"); single scope `mcp` in both
  metadata docs.

### WorkOS best practice vs our architecture (the honest delta)

WorkOS's current recommendation (workos.com/docs/authkit/mcp) is **AuthKit as the
authorization server**, MCP server as pure resource server: verify AuthKit JWTs via JWKS,
serve PRM pointing at the AuthKit domain, and treat serving RFC 8414 metadata from the MCP
server itself as a legacy-client proxy shim. Their 2026-05 provider comparison dings bare
`workers-oauth-provider` (2025 OAuth-proxy CVE history, "CIMD ❌" — outdated, 0.8.1 has it).

We instead run Cloudflare's documented "bring your own OAuth provider" pattern: the Worker
IS the AS, mints its own opaque KV-backed tokens, WorkOS is upstream IdP only and its tokens
are dropped post-exchange. Trade-offs, eyes open:

- Ours: opaque server-owned tokens (no JWKS/JWT surface), small named-key/dev bypasses,
  mirrors Cloudflare upstream (memory rule: deviate only with conviction), no per-request
  WorkOS dependency at /mcp.
- Theirs: deletes most of `src/auth/`, WorkOS absorbs future spec drift (CIMD, XAA/ID-JAG
  enterprise SSO, resource indicators), managed consent UI.

No forcing function to switch; revisit only if enterprise SSO/XAA or spec-drift maintenance
becomes real.

### Watch items

- **RFC 9207 `iss` in authorization responses**: the 2026 spec RC has clients validating
  `iss`; workers-oauth-provider 0.8.1 emits only `code`+`state` and doesn't advertise
  `authorization_response_iss_parameter_supported`, so nothing breaks today — watch upstream
  releases.
- WorkOS provider-comparison blog is part sales collateral; verify claims against the lib
  dist before reacting.

Key sources: modelcontextprotocol.io/specification/2025-06-18/basic/authorization (and
2025-11-25), workos.com/docs/authkit/mcp, workos.com/blog/best-mcp-server-authentication-providers,
developers.cloudflare.com/agents/model-context-protocol/protocol/authorization/, RFC 9728/8414/9207.

## Teardown facts (historical — for the agents.stellar.buzz cutover)

> Current state (2026-08-04): this Worker serves the canonical host **raven.stellar.org** with
> **raven.stellar.buzz** and **agents.stellar.buzz** as aliases (all three in `wrangler.jsonc`
> routes). The notes below are the historical cutover record for releasing the
> `agents.stellar.buzz` domain from the retired prior-art workers.

Account `ba55b7ae9acfb3ed152103e3497c0752`. Two workers: `stellar-raven-next` and
`stellar-raven`; both declare custom domain `agents.stellar.buzz` (only the last-deployed owns
it — verify in dashboard before deleting); shared KV `473fc625531d4687b0e353e069092afa`;
workflows `raven-workflow` / `raven-pipeline`; DO classes (`RavenRun`, `RavenMcp`,
`ThinkAgent_RavenCoordinator`, `RunLedger`, `BudgetLedger`) die with their workers; six secrets
each; no D1/R2/queues/cron. Order: delete workers → release custom domain → delete KV namespace.
