# Item 7.3, PR 4: `@cloudflare/workers-oauth-provider` 0.10.4 to 1.2.4 — design proposal

Lead: Claude Opus 5.5, agentpc `t1x8`, 2026-11-18. Branch `np/7.3-deps-oauth` from `origin/main`
`fdd001a4`. Status: **proposal for approval, revision 2.1. No code is written.** Revision 2
reconciles two independent design reviews (reconciliation at the end):
- Claude Fable, [REVIEW.md](REVIEW.md);
- Codex frontier `gpt-6-astra`, [CODEX-DESIGN-REVIEW.md](CODEX-DESIGN-REVIEW.md), which returned
  "design FAIL as written".

Both reviewers ran the real 0.10.4 and 1.2.4 `dist` files against an in-memory KV. The orchestrator's note says to stop
and send a proposal if 1.x needs a design change. It does: see decisions D1 and D2.

## Why 1.x needs a design change

Read-only production evidence, 2026-11-18, from `OAUTH_KV` (`wrangler kv … --remote`). Only aggregates
were printed. No key, user ID or count is committed; buckets are "many" (50 or more), "10-49" and
"<10".

| Stored data | Classes found |
|---|---|
| Grant `resource` | `https://raven.stellar.org/mcp` (many), `https://raven.stellar.buzz/mcp` (many), absent (10-49), `https://raven.stellar.org` (<10), `https://agents.stellar.buzz/mcp` (<10) |
| Clients holding the bare-origin grants | Devin CLI only |
| Clients holding absent-resource grants | Codex, `claude.ai` (CIMD), mcp-cli, Command Code CLI and others, each <10 |
| Clients whose `grantTypes` lacks `authorization_code` | <10, all `client_credentials` only, and none holds a grant |
| Grant `redirectUri` actually used | https (many), loopback http (many), `claude:` (10-49; client "Claude Code (stellar-raven)"), `cursor:` (<10; "Cursor"), `warp:` (<10; "Warp") |
| DCR client redirect sets | https, loopback http, or both (many); https + loopback + `cursor:` (many); `cursor:` only and `claude:` only (10-49 each); `ftp:`, `ws:`, `wss:`, `vscode:`, `stellar:`, remote http and other probe schemes (<10 each, almost all named `probe`, `abuse-*`, `test` or a security-review label) |

The upstream migration guide (`docs/migration-1.x.md`) states the two constraints that collide with
this data:

1. **1.0: a canonical resource is required.** It must equal what existing grants carry. A mismatch
   signs every affected user out (`token_audience_unbound`, `grant_audience_unbound`). Raven serves
   MCP and the whole OAuth flow on three hosts (`src/hosts.ts`), and its grants carry three
   per-host resources.
2. **1.2: redirect URIs must be https or loopback http.** Private-use schemes (RFC 8252) are refused
   at authorization unless `allowPrivateUseRedirectUris: true`. Upstream's example comments
   "native apps only; leave off for MCP servers". Claude Code, Cursor and Warp authorize Raven today
   through `claude:`, `cursor:` and `warp:` callbacks.

## Decisions proposed

### D1. One provider per served origin, each with its own canonical resource

- **Providers.** One `OAuthProvider` per served origin, each with
  `resourceMetadata.resource = <origin>/mcp`. The upstream guide names this pattern for a Worker
  served on several hostnames.
  - Construct the three production providers **at module scope** (`https://raven.stellar.org`,
    `https://raven.stellar.buzz`, `https://agents.stellar.buzz`). 1.x validates options in its
    constructor, and a lazy cache would turn a bad option into a 500 on the first request.
  - Build loopback providers per request, for `http://localhost:<port>`,
    `http://127.0.0.1:<port>` and `http://[::1]:<port>` only. These are the hosts
    `allowDevUnauthenticated` already allows, not all of `127.0.0.0/8`.
    - They are not cached. Any port gives a large origin space, and a dev-only per-request
      construction costs nothing that matters (Codex re-check 3).
  - Put provider selection in a pure module (`src/hosts.ts` or `src/auth/gate.ts`) so plain-Node
    tests reach it. Keep one source for the host list, now spread across `src/server.ts`,
    `src/hosts.ts`, `src/auth/gate.ts` and `wrangler.jsonc`.
  - `oauthProviderOptions` takes the resource as a parameter. Update its callers in
    `test/auth.test.ts` and `test/smoke/host-routing.test.ts`.
- **Selection by exact origin, from `new URL(request.url).origin` only.**
  - Never use `Host`, `Forwarded` or `X-Forwarded-Host`. A production hostname with another scheme
    or a non-default port does not match.
  - **An unknown origin gets 404**, before provider dispatch and before any browser login work,
    including `/playground/login`.
    Both reviewers showed that the canonical-provider fallback advertises the request's own origin
    as issuer. `wrangler.jsonc` routes only the three hosts with `workers_dev: false`, so this path
    is local and test-only.
  - The API-key and dev-bypass checks stay where they are, before provider selection.
- **A fresh request-local `env` per dispatch (both reviews: blocker).**
  - 1.2.4 does `if (!env.OAUTH_PROVIDER) env.OAUTH_PROVIDER = this.createOAuthHelpers(env)`, and the
    helpers are bound to the provider that made them. With a shared `env`, the first host an isolate
    serves pins its helpers. Every later `/authorize` on another host then validates against the
    wrong resource: `invalid_target`, or a grant bound to the other host. Both reviewers reproduced
    this.
  - Fix: call `provider.fetch(request, { ...env, OAUTH_PROVIDER: undefined }, ctx)` for the main
    call and for the metadata-alias call, with typing adapted.
  - Never clear or reassign the field on the shared object. Cache providers, never request `env`
    objects or helper closures.
- **What happens to stored grants:**
  - **bound to a host's `/mcp` resource:** they keep working on that host. On another host they
    get 401 or `invalid_grant`, and the grant stays usable on its own host;
  - **absent resource:** these grants bind to the serving host's resource on their first refresh.
    An audience-free access token already issued stays usable on any of the three trusted origins
    **until it expires, even after that refresh**. Each old token's missing audience resolves
    independently. The replacement token is bound.

    This is the old unbound behavior. It is accepted as a migration exception for the three aliases
    and lasts at most one access-token lifetime, 3,600 s (Codex finding 5, re-check 2);
  - **bare origin `https://raven.stellar.org`:** fewer than 10, all **Devin CLI**. They fail at once,
    with a 401 on the access token and `invalid_grant` on refresh.
    - 1.2.4 also drops the root document `/.well-known/oauth-protected-resource`, which 0.10.4
      served with `resource: <origin>`. That root document is where those grants came from.
    - A client that re-derives the bare origin gets `invalid_target` and cannot sign in.
    - A client that follows the 401 challenge (`…/oauth-protected-resource/mcp`) or sends no
      `resource` signs in once.
    - Which of these Devin CLI does is not known from here. See owner question 1.
- **Issuer and metadata stay per origin, as today** (confirmed from source by both reviewers):
  - the issuer and endpoints follow the request origin;
  - `/.well-known/oauth-protected-resource/mcp` reports `<origin>/mcp`;
  - the 401 on `/mcp`, `/mcp/` and `/mcp/nested` points there;
  - Raven's metadata aliases still resolve.
- **Rejected alternatives:**
  - an `OAuthAuthorizationServer` with three resources: more code for no gain on three fixed hosts;
  - serving the root protected-resource document as an alias of the `/mcp` one: RFC 9728 clients
    check that `resource` matches the URL they derived, so strict clients would refuse it.

### D2. Keep native-app callbacks, with a positive allowlist at authorization

- Set `allowPrivateUseRedirectUris: true`. Without it, 1.2.4 refuses a registration that lists only
  `claude:` or `cursor:` URIs, and refuses every authorization that uses one. Claude Code, Cursor and
  Warp could then not sign in again.
  - This deviates from upstream's "leave off for MCP servers".
  - It rests on measured client use.
- **Replace the denylist with an allowlist.** Both reviewers showed that a denylist leaves OS
  protocol handlers open (`smb:`, `tel:`, `ms-settings:`, `search-ms:`, `ms-msdt:` …). Codex
  reproduced DCR 201 and code issuance for several of them. Raven redirects to a registered URI with
  no user interaction on some error paths (a PKCE-less `GET /authorize` gets a 303). Registration is
  open, so a Raven link could hand attacker-chosen input to any admitted handler. That is today's
  behavior; the upgrade is the moment to close it.
- **The rule, applied at authorization**, in `hasAllowedRedirectTransport`. Today it runs on both
  `/authorize` legs and the provider-error redirect; add the parked MCP request in `completeCallback`
  before completing the grant. Codex: a request parked before the deploy could otherwise use a newly
  forbidden URI. The parked check goes after the state and browser-binding validation and before the
  WorkOS code exchange, so state consumption and cookie cleanup stay as they are. Allowed:
  - `https:`;
  - `http:` on loopback (`localhost`, `127.0.0.0/8`, `::1`, as today);
  - the measured native schemes, by exact name: `claude:`, `cursor:` and `warp:`.
- **Not admitted: reverse-domain schemes with a period** (Fable's option). Codex found that a
  simple-name or period rule still admits OS handlers, for example `x-apple.systempreferences:`.
  A new native client is added by name after its scheme shows up in the logs.
- **At registration.** DCR keeps today's rule (refuse remote `http:`) and adds one condition: at
  least one URI must be on the allowlist. Other listed URIs are tolerated, as upstream intends
  (Cursor lists `cursor:` beside https and loopback). This rejects registrations with no usable
  callback; it is not an abuse control, since adding an https URI satisfies it. CIMD does not run
  `clientRegistrationCallback`; its authorization legs still run the check.
- **Refusals.**
  - A refused callback gets a local 400, with no `Location` and no WorkOS hop.
  - The refused scheme is logged in `auth_reject` as a bounded token, so a new client's scheme
    shows up there. The token is built from the parsed `URL.protocol` with the colon removed, and
    must match `^[a-z][a-z0-9+.-]{0,31}$`; anything else logs as `other`. The full URI is never
    logged.
  - A logged scheme is a lead for review. It is not proof of real client demand.
- **The trade.** A new native client whose only callback is an unlisted scheme fails sign-in until
  its scheme is added. That client can still use loopback http, which RFC 8252 recommends anyway.
- **What the allowlist does not do.** It restricts callback transports, not app identity. A native
  scheme does not authenticate the application. The consent page (unverified-client label, escaped
  full return URI, CSRF, terms) and the browser-bound WorkOS state remain the controls.

### D3. Mechanical option changes

- `resourceMetadata.scopes_supported: ["mcp"]` becomes `requiredScopes: ["mcp"]`. The wire is
  unchanged: protected-resource metadata `scopes_supported` and the 401 challenge's scope.
  `resource_name` stays.
- Delete `allowPlainPKCE: false`. 1.2 removed the option, and S256-only is now the only behavior.
- Move the scope from `resourceMetadata.scopes_supported` to `requiredScopes`; do not copy it.
  Setting both throws. `requiredScopes` advertises the scope and does not enforce it, as today.
- The lifetimes pass the 1.2 construction checks. Both reviewers constructed providers with them:
  3,600, 7,776,000 and 31,536,000 seconds. Leave `refreshTokenIdleTTL` unset.
- **Add `onError`.** Log `internal.category` and `internal.reason` through `logEvent`, never
  `description` or `detail`, and return nothing. Watch for:
  - `grant_audience_unbound` and `token_audience_unbound`;
  - `legacy_grant_resource_mismatch` and `resource_not_configured`: both answer `invalid_target`,
    which clients do not recover from.
- The library now validates redirect URIs before `clientRegistrationCallback` runs. A single
  remote-`http:` registration is refused with the library's own description, still
  `invalid_client_metadata`.
- Enable no external-token resolver, token-exchange grant or enterprise-managed authorization.
- `clientRegistrationCallback`, `clientIdMetadataDocumentEnabled`, `lookupClient`,
  `parseAuthRequest`, `completeAuthorization` and the `AuthorizationError` constructor keep the
  signatures Raven uses (both reviewers). `parseAuthRequest` now always returns a `resource`. The
  derived hex `userId` satisfies the non-empty, colon-free rule.

### D4. `ctx.auth` stays out of Raven's identity path

1.x sets `ctx.auth` on API requests, and `agents` 0.33.0 passes it to tools as
`context.http.authInfo`. Raven derives every identity from `ctx.props` through the host closure in
`src/server.ts` (`authSubjectFromProps`, `resolveArtifactOwner`), and `src/mcp/tools.ts` reads no
`authInfo`. This design keeps it that way (PR 2's Codex note 1).
- `ctx.auth.token` is the raw bearer token.
- The pin goes through the real MCP handler and tool wiring, not only `resolveArtifactOwner`.
- It covers differing props and auth identities, and absent or invalid props. An OAuth request with
  no valid props subject must stay ownerless even with valid-shaped `authInfo`.
- It asserts that the execute call context carries no token and no field from `ctx.auth`.

### D5. Behavior changes accepted without code

Corrected by both reviews.

- **Code exchange.** The `redirect_uri` must equal the authorization request's **when supplied**.
  A PKCE exchange can omit it.
- **Grant types.** Registered grant types are enforced, but `refresh_token` is implied by
  `authorization_code`. The clients that lack `authorization_code` hold no grant.
- **Grant replacement.** There is one grant per user, client and resource. A CIMD client's grants
  for distinct redirect destinations are an exception.
- **Scopes.** A request that names only ungranted scopes gets `invalid_scope`.
- **Registration.** DCR bodies are capped at 1 MiB of streamed bytes. A throwing
  `clientRegistrationCallback` gets a fixed description. Registrations in use renew themselves: a
  token request in the second half of `clientRegistrationTTL` rewrites the record for another 365
  days. Update `docs/operations.md` ("365 days") and the comment in `src/auth/retention.ts`.
- **Root document.** `/.well-known/oauth-protected-resource` at the root now returns 404. Update
  `test/smoke/host-routing.test.ts`, which asserts 200.
- **Token responses** always carry `resource`. `test/smoke/host-routing.test.ts` expects it absent
  when the client sent none.
- **Authorization-server metadata** gains `protected_resources` and, with CIMD on,
  `private_key_jwt`.
- **New `OAUTH_KV` key class:** `client-assertion-jti:<hash>`, for CIMD `private_key_jwt`, with a TTL
  of the assertion lifetime plus 60 seconds. Add it to the retention table.
- **Exact resource match.** Only host case and an empty path are folded, so `<origin>/mcp/` gets
  `invalid_target`. No stored grant has that form.
- **CORS.** Handler-set CORS headers are kept.
- **Not new in 1.x:** the rejection of repeated parameters and of mixed client authentication.

## Rollback

**Storage rollback is safe; both reviewers ran it.**
- Token format, key wrapping and props encryption are byte-identical between the versions.
- 0.10.4 ignores the added KV key metadata and `redirectUri`.
- After 1.2.4 has served and refreshed grants of the bound and absent classes, 0.10.4 serves and
  refreshes them with 200. The same holds for a grant created wholly under 1.2.4.
- A rollback also restores the bare-origin sessions, if the client kept its tokens.

Limits of a rollback:
- a CIMD client that started using `private_key_jwt` under 1.x stops authenticating;
- absent-resource grants that 1.2.4 bound stay bound;
- the 1.x security checks go away;
- never roll KV back.

The rollback target is a **Cloudflare Worker version ID**, not a git object: the current production
version, `fe3708cb`, deployed from `abd68c63` (PR 2). It bundles oauth-provider 0.10.4. PR 3 deployed
nothing. The orchestrator confirms the version ID before the deploy.

## Test plan (for the execution step, after approval)

1. **Unit, plain Node.** Use a KV fake with `list` and key metadata; today's fake drops `put`
   options and returns an empty `list()`.
   - **Provider selection:**
     - each of the three origins and loopback;
     - an unknown request URL, an http production URL and an unexpected port give 404;
     - forwarding and `Host` headers are ignored: an allowed request URL with an unknown-looking
       header still works, and an unknown request URL with an allowed-looking header still gets 404.
   - **Metadata:** per-origin metadata and the 401 challenge. The root document gives 404.
     `/authorize?resource=<bare origin>` gets a redirected `invalid_target`.
   - **D2 at authorization:**
     - `claude:`, `cursor:` and `warp:` authorize;
     - `smb:`, `ms-settings:`, `ftp:`, `ws:`, a period scheme and remote `http:` get a local 400
       with no `Location`. This covers both `/authorize` legs, the provider-error redirect, a
       PKCE-less GET and a parked `completeCallback`;
     - DCR with no allowlisted URI is refused; Cursor's https + loopback + `cursor:` set registers;
     - a mixed registration (https + `smb:`) registers, and its `smb:` authorization gets a local
       400 on both legs and the error path;
     - the same authorization checks for a CIMD client and for a seeded legacy (pre-upgrade)
       registration.
   - **Token endpoint:** a code exchange with a different registered `redirect_uri` gets
     `invalid_grant`; a client registered with narrow `grant_types` is refused.
   - **D4 pin** through the real handler, as above.
2. **Smoke (`SELF.fetch`, the real shared `env`).** Complete `/authorize` on `raven.stellar.org`,
   then on each alias, then in reverse order, with an explicit and an omitted `resource`. Assert
   each grant's `resource` is its own host's `/mcp`. **This test must fail without the fresh-`env`
   fix.** Also run concurrent calls.
3. **Migration harness (scratch, not committed;** the reviewers' probes are the base).
   - Write 0.10.4 grants of each stored class.
   - Serve them with 1.2.4 under D1 and assert:
     - access and refresh: 200 for the bound and absent classes, 401 and `invalid_grant` for the
       bare origin;
     - absent-resource refresh with `resource=<origin>/mcp`: 200; with another value:
       `invalid_target`;
     - cross-host, for bound tokens and grants: 401 or `invalid_grant`, with the grant still usable
       on its own host;
     - an old audience-free access token after its grant's refresh on another host: still 200 until
       it expires (the accepted exception).
   - Then the rollback direction.
4. **Local DCR and OAuth flow** against one `npm run dev`. Use the real redirect classes:
   - https only, loopback only, https + loopback + `cursor:`;
   - `claude:` only, `cursor:` only, `warp:` only;
   - the refused classes.

   Go up to the WorkOS redirect. Run the code exchange with a stubbed completion where the unit
   tests cannot reach it.
5. **Gates:** typecheck, test, build, `test:smoke`, secrets, and `mcp:surface` (expected unchanged).
6. **Required review:** a Codex frontier security review of the diff and the auth flow.

## Deploy note (for later)

- **Model-facing:** no.
- **After the deploy:**
  - check the OAuth metadata and `/mcp` 401 on all three hosts, with the `resource` in each
    `WWW-Authenticate`;
  - a Claude connector `execute`;
  - a Claude Code sign-in (`claude:` callback) and a Cursor sign-in, if the owner can run them;
  - watch `onError` internal reasons for `grant_audience_unbound` and `token_audience_unbound`
    (expected: only the bare-origin class).

## Side checks done

- `scripts/usage-report.mjs --from 2026-10 --to 2026-11` on `wrangler` 4.164.0: exit 0, with the
  expected JSON shape (`source: production`). It is read-only D1 `SELECT`s and needs no secret. The
  counts stayed in the lead's scratchpad.
- `scripts/check-usage-deployment.mjs` was checked by the orchestrator. `scripts/mcp-key.mjs` stays
  unchecked: it writes API keys.

## Questions for the owner

1. **D1, Devin CLI.** Fewer than 10 Devin CLI sessions are bound to the bare origin and stop working
   at the deploy. Accept it?
   - Devin CLI signs in again if it follows the 401 challenge. It cannot sign in to
     `raven.stellar.org` at all if it re-derives the bare origin from the root document, which 1.x
     no longer serves.
   - Serving that root document as an alias would break strict RFC 9728 clients. The lead
     recommends accepting it, and trying a Devin CLI sign-in after the deploy if the owner can.
2. **D2, native callbacks.**
   - Keep `allowPrivateUseRedirectUris: true` against upstream's MCP advice, for Claude Code,
     Cursor and Warp?
   - Restrict callbacks at authorization to https, loopback http and the named schemes `claude:`,
     `cursor:` and `warp:`? A future native client with an unlisted scheme then fails until its
     scheme is added.

   The lead recommends yes to both.

## Review reconciliation (revision 2)

| Finding | Disposition |
|---|---|
| Both: shared `env.OAUTH_PROVIDER` pins one provider's helpers (blocker) | Adopted: a fresh request-local `env` per dispatch; smoke test that fails without it |
| Both: unknown origin should get 404 | Adopted |
| Both: denylist leaves OS handlers open | Adopted: allowlist of https, loopback http, `claude:`, `cursor:`, `warp:` at authorization, plus at least one allowlisted URI at registration |
| Fable 5: admit reverse-domain (period) schemes | Not adopted: Codex showed period rules admit OS handlers. Clients are added by name, and refused schemes are logged |
| Codex 3: check the parked request in `completeCallback` | Adopted |
| Fable 2: root document 404; bare-origin clients may not recover | Adopted: D1, D5, owner question 1 (Devin CLI) |
| Codex 4 / Fable 8: D5 overstated; omissions | Adopted: D5 rewritten |
| Codex 5: audience-free tokens work across trusted origins until bound | Accepted as a migration exception (D1) |
| Codex 6 / Fable 9: D4 pin through the real handler; no token or `ctx.auth` field in context | Adopted |
| Both: rollback is safe; CIMD `private_key_jwt` limit; `fe3708cb` is a Worker version | Adopted: Rollback |
| Fable 6: module-scope production providers; loopback set; pure selection module; one host list | Adopted: D1 |
| Fable 7: `onError` internal reasons; move, not copy, `requiredScopes`; registration order | Adopted: D3 |
| Fable 9: token-endpoint tests; KV fake; harness cases | Adopted: test plan |

## Codex re-check of revision 2

Verdict **design PASS** ([CODEX-DESIGN-RECHECK.md](CODEX-DESIGN-RECHECK.md)). Findings 1 to 3 are
resolved, and there is no new blocker or major finding. Its minor items are folded in (revision 2.1):

| Item | Disposition |
|---|---|
| 1 Placement of the parked check; origin selection before `/playground/login` | Adopted: D2, D1 |
| 2 Audience-free tokens stay usable until they expire, not until refresh | Adopted: D1, harness |
| 3 Loopback cache is not small | Adopted: loopback providers are not cached |
| 4 CIMD, legacy and mixed-registration cases; header-spoof wording | Adopted: test plan |
| 5 Registration-rule wording; scheme token from `URL.protocol` | Adopted: D2 |
