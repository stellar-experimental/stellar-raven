# Review of the item 7.3 PR 4 design (oauth-provider 0.10.4 to 1.2.4)

Reviewer: Claude Fable 5.2 (tier: Claude Fable, product and API), `t1xx`, 2026-11-18. Read-only.
Reviewed `DESIGN.md` against `src/server.ts`, `src/hosts.ts`, `src/auth/`, `ARCHITECTURE.md`,
`test/auth.test.ts`, `test/smoke/auth-redirects.test.ts`, `test/smoke/host-routing.test.ts`, and the
published 1.2.4, 0.10.4 and 0.10.3 packages (`dist/oauth-provider.js`, the `.d.ts`,
`docs/migration-1.x.md`).

**Summary.** D1 is the right shape, but as written it breaks sign-in on two of the three hosts
(finding 1). Owner question 1 understates what happens to the bare-origin sessions (finding 2).
Rollback is safe: 0.10.4 reads everything 1.2.4 writes (finding 3). For D2, keep the flag and replace
the denylist with an allowlist (finding 5).

**What I ran.** One scratch script drives the real 0.10.4 (and 0.10.3) and 1.2.4 `dist` files in
plain Node against an in-memory KV. It is the source for every "ran" below.

- Script: `/tmp/claude-1000/-home-tyler-code-raven-wt-np-7-3/ee61b192-3628-4f7d-b52f-bbffa1c44437/scratchpad/harness/run.mjs`
- Run it from that `harness/` directory:
  `node --import ./register.mjs run.mjs <old dist/oauth-provider.js> <new dist/oauth-provider.js>`
- The scratchpad is not durable. Copy the three files in `harness/` if you want to reuse them.

I did not run workerd, a dev server, the repository's test suites, or anything against production.

## Findings

### 1. Blocking. Per-origin providers share one `env.OAUTH_PROVIDER`, so the first host served wins

- **Where:** 1.2.4 `dist/oauth-provider.js:2938` and `:4587`:
  `if (!env.OAUTH_PROVIDER) env.OAUTH_PROVIDER = this.createOAuthHelpers(env);`. The helpers are
  bound to the provider that created them (`:5526`). `src/auth/workos.ts:116` reads
  `env.OAUTH_PROVIDER` for `/authorize` and `/callback`.
- **What happens under D1:** the first request an isolate serves through any provider pins that
  provider's helpers on `env`. Every later `/authorize` on another host then validates against the
  wrong resource.
- **Ran** (two 1.2.4 providers, one shared `env`, `raven.stellar.org` served first):
  - `raven.stellar.buzz/authorize` with `resource=https://raven.stellar.buzz/mcp`: `invalid_target`.
  - the same request with no `resource`: accepted, but bound to `https://raven.stellar.org/mcp`.
    The code exchange on the buzz `/token` then fails, because that provider does not serve the
    grant's resource.
  - with a fresh `{ ...env }` per request: bound to `https://raven.stellar.buzz/mcp`, as intended.
- **Not verified:** that workerd passes the same `env` object to every request in an isolate. I
  expect it does: the library's `if (!env.OAUTH_PROVIDER)` guard and `getRunner(env)` in
  `src/server.ts:67` both rely on it. The test below settles it in one smoke run.
- **Why the suites would not catch it:** `test/auth.test.ts` builds a new `testEnv()` per call, and
  `test/smoke/host-routing.test.ts:16` spreads `env` into a new object per test. Production would
  fail intermittently, by which host an isolate saw first.
- **Fix:** in `src/server.ts`, call the selected provider with a per-request copy:
  `provider.fetch(request, { ...env }, ctx)`, for both the alias-metadata call and the main call.
  Do not clear `env.OAUTH_PROVIDER` on the shared object instead; that is only safe by accident of
  where the library awaits.
- **Test:** a `SELF.fetch` smoke test (real shared `env`) that completes `/authorize` on
  `raven.stellar.org`, then on each alias, then in the reverse order, and asserts each grant's
  `resource` is its own host's `/mcp`. It must fail without the fix.

### 2. Blocking for owner question 1. The bare-origin sessions may not be able to "sign in once"

- **Where:** `DESIGN.md` D1, "Accepted cost: fewer than 10 sessions sign in once."
- **Missing behavior change:** in 1.2.4 the root document
  `/.well-known/oauth-protected-resource` returns `404`. Only
  `/.well-known/oauth-protected-resource/mcp` is served (`:3048`, exact path and origin). 0.10.4
  served the root with `resource: <origin>` (`deriveResourceIdentifier`), which is where the
  bare-origin grants came from. D5 does not list this. `test/smoke/host-routing.test.ts:117-121`
  asserts the root returns `200` today.
- **Ran:**
  - a bare-origin access token: `401 invalid_token` at once, not only at refresh;
  - its refresh: `400 invalid_grant`;
  - a new sign-in that again sends `resource=https://raven.stellar.org`: `invalid_target`.
- **Consequence:** a client that still derives the bare origin after the upgrade cannot sign in on
  that host at all. A client that falls back to the `401` challenge or sends no `resource` signs in
  once, as the design says. Which case applies depends on the client.
- **Fix:**
  1. From the aggregates already gathered, name the client(s) holding the bare-origin grants, as
     was done for `claude:`, `cursor:` and `warp:`.
  2. State in D5 that the root document goes away, and reword owner question 1 to say what those
     clients do next.
  3. Add tests: root document `404`; `/authorize?resource=<bare origin>` gives a redirected
     `invalid_target`.
- A rollback restores these sessions if the client kept its tokens: 1.2.4 refuses the refresh
  before it writes, and 0.10.4 then refreshed the same grant with `200` (ran).

### 3. Non-blocking. Rollback question answered: 0.10.4 can read what 1.2.4 writes

- **From source:** the token format, token-ID hash, key wrapping and props encryption are
  byte-identical between the versions (diffed). Grant and token records keep the same fields.
  1.2.4 adds `redirectUri` and KV key metadata, which 0.10.4 ignores. With no configured resource,
  0.10.4 accepts a stored string `resource` and a string `audience` (`resolveTokenResource`,
  `audienceMatches`).
- **Ran**, for the bound `/mcp` and absent classes, and for a grant created wholly under 1.2.4:

  | Step under 0.10.4 after 1.2.4 touched the grant | Result |
  |---|---|
  | API call with a 1.2.4 access token | 200 |
  | Refresh of a 1.2.4-written grant | 200 |
  | API call with the new 0.10.4 token | 200 |
  | New authorization for a user whose grant 1.2.4 wrote | 200 |
  | 1.2.4 refresh again after the rollback | 200 |

  The same run against 0.10.3 gave the same results.
- **Side effects of a rollback, none of them a sign-out:**
  - an absent-resource grant that 1.2.4 bound stays bound to that host's `/mcp`;
  - 0.10.4 rewrites a grant without key metadata, and 1.2.4 then reads it as a legacy grant;
  - a CIMD client that authenticated with `private_key_jwt` (new in 1.x) stops working.
- **Fix for `DESIGN.md` "Rollback":** replace the open question with this answer. Also say what
  `fe3708cb` is. It is not a commit in this repository (`git log -1 fe3708cb` fails), so if it is a
  Worker version ID, name it as one and state which provider version it bundles.

### 4. Non-blocking. Unknown hosts: answer `404`, not the canonical provider

- **Ran** the canonical provider on `https://unknown.example`:
  - `/mcp`: `401` whose challenge has no `resource_metadata`;
  - protected-resource metadata: `404`;
  - authorization-server metadata: `200` with `issuer: https://unknown.example`.
- That is an issuer derived from an arbitrary `Host`, which D1 says must never happen, on a server
  whose tokens can never validate there.
- **Fix:** when no provider matches the origin, return `404` for the request. Keep the API-key and
  dev-bypass checks where they are, before provider selection. `wrangler.jsonc:73-91` routes only
  the three hosts with `workers_dev: false`, so this is a local and test path. Add one test.

### 5. Non-blocking, with a recommendation. D2: keep the flag, use an allowlist

- **`allowPrivateUseRedirectUris: true` is correct.** Without it 1.2.4 refuses a registration that
  lists only `claude:` or `cursor:` URIs, and refuses every authorization that uses one
  (`validateRedirectUri`, `:1214`).
- **The denylist is the wrong shape.**
  - It names schemes browsers no longer navigate (`ftp:`, `gopher:`, `ws:`), and leaves every
    OS protocol handler open (`ms-msdt:`, `search-ms:`, `tel:`, `itms-services:`, `smb:`, and so
    on).
  - Raven redirects to a registered URI without user interaction: a PKCE-less `GET /authorize`
    returns `303` to it (`src/auth/workos.ts:478-485`, `:507-527`). Registration is open, so a
    `raven.stellar.org` link can hand attacker-chosen input to any admitted handler.
  - This is today's behavior, not a regression from the upgrade.
- **Recommended rule, at authorization** (both `/authorize` legs and the error redirect, where
  `hasAllowedRedirectTransport` already runs):
  - `https:`;
  - `http:` on loopback;
  - a scheme containing a period, the RFC 8252 §7.1 reverse-domain form
    (`org.example.app:` in the current tests);
  - the measured client schemes by name: `claude`, `cursor`, `warp`.
- **At registration**, keep today's rule (refuse remote `http:`) and do not apply the allowlist. A
  client that lists an unknown scheme beside a loopback URI should still register, as upstream
  intends.
- **Trade:** a new native client whose only callback is a period-less scheme fails sign-in until
  its scheme is added. Log the refused scheme as a bounded token (for example
  `^[a-z][a-z0-9+.-]{0,31}$`) so that shows up in `auth_reject`.
- If the owner prefers zero maintenance, the denylist is acceptable as no worse than today, but
  `DESIGN.md` should not present it as a security control.

### 6. Non-blocking. D1 construction and allow-list details

- **Construct the three production providers at module scope**, and only loopback ones lazily. 1.x
  validates the resource, routes and lifetimes in the constructor; today a bad option fails at
  import, and a lazy cache would turn that into a `500` on the first request.
- **Loopback set:** D1 says `127.0.0.0/8` "as `allowDevUnauthenticated` already does". It does not:
  `src/auth/gate.ts:92` allows `localhost`, `127.0.0.1` and `::1` only. Use that set, which also
  bounds the cache.
- **Never build a provider from an unlisted origin.** The constructor refuses
  `http://192.168.1.5:8787/mcp` (ran), so an unlisted LAN host would throw at request time.
  `http://localhost`, `http://127.0.0.1` and `http://[::1]` with a port are accepted (ran).
- **One source for the host list.** It now exists in `src/server.ts:48`, `src/hosts.ts:11`,
  `src/auth/gate.ts:92` and `wrangler.jsonc`. Put provider selection in a pure module
  (`src/hosts.ts` or `src/auth/gate.ts`) so plain-Node tests can reach it; `src/server.ts` cannot
  load there.
- **Confirmed for D1** (source and ran): the issuer and endpoints follow the request origin; the
  `/mcp` document reports `<origin>/mcp`; the `401` challenge on `/mcp`, `/mcp/` and `/mcp/nested`
  points at `<origin>/.well-known/oauth-protected-resource/mcp`; the metadata aliases in
  `src/auth/gate.ts:115` still resolve. A token or refresh presented on another host gets `401` or
  `invalid_grant` and leaves the grant usable on its own host.

### 7. Non-blocking. D3 option details

- **Lifetimes pass:** 3600, 7,776,000 and 31,536,000 are integers of at least 60 (constructed with
  these values in the script).
- **`allowPlainPKCE: false`** does not throw at runtime but is gone from the type. Delete it.
- **`requiredScopes`** and `resourceMetadata.scopes_supported` together throw. Move, do not copy.
- **`oauthProviderOptions` needs the resource as a parameter.** Callers to update:
  `test/auth.test.ts:284` and `test/smoke/host-routing.test.ts:135`.
- **Signatures used by `src/auth/workos.ts` are unchanged:** `AuthorizationError(code,
  { description, redirectUri, state, issuer })`, `parseAuthRequest`, `lookupClient`,
  `completeAuthorization`. `parseAuthRequest` now always returns a `resource`.
- **Registration order changed:** the library validates redirect URIs before
  `clientRegistrationCallback` runs. A single remote-`http:` registration is refused by the
  library with its own description; the code stays `invalid_client_metadata`.
- **Add `onError`.** The deploy note says to watch internal reasons, but the default hook logs
  only status, code and description. Log `internal.category` and `internal.reason` through
  `logEvent`, never `description` or `detail`, and return nothing. Also watch
  `legacy_grant_resource_mismatch` and `resource_not_configured`: both answer `invalid_target`,
  which clients do not recover from.

### 8. Non-blocking. D5 omissions

- **Registered clients now renew.** A successful token request in the second half of
  `clientRegistrationTTL` rewrites the record with a fresh 365 days (`:4685`). An in-use
  registration no longer expires. Update `docs/operations.md:109` ("365 days") and the comment in
  `src/auth/retention.ts:36`.
- **New `OAUTH_KV` key class:** `client-assertion-jti:<hash>`, written for CIMD clients that use
  `private_key_jwt`, with a TTL of the assertion lifetime plus 60 seconds (`:492`, `:797`). Add it
  to the retention table.
- **Token responses always carry `resource`.** `test/smoke/host-routing.test.ts:173` expects it to
  be absent when the client sent none.
- **Authorization-server metadata gains** `protected_resources` and, with CIMD on,
  `private_key_jwt`.
- **Resource matching is exact** apart from host case and an empty path. A client that sends
  `<origin>/mcp/` gets `invalid_target`. No stored grant shows this form.

### 9. Non-blocking. Test-plan gaps

- **No token-endpoint test exists in the plain-Node suite.** `test/auth.test.ts` never calls
  `/token`; only the smoke lane's happy path does. D5 leaves "the first two" items to existing
  coverage that is not there. Add: a code exchange with a different registered `redirect_uri`
  (`invalid_grant`), and a client registered with a narrow `grant_types`.
- **The KV fake hides two paths.** `test/auth.test.ts:74-82` drops `put` options and returns an
  empty `list()`, so key metadata and the replace-earlier-grant scan never run. Use the smoke
  lane's KV, or a fake with `list` and metadata, for the migration harness.
- **Migration harness additions:** an absent-resource grant whose refresh sends
  `resource=<origin>/mcp` (expect 200) and one that sends another value (expect `invalid_target`);
  the cross-host cases in finding 6; the rollback direction in finding 3.
- **D2:** a PKCE-less `GET /authorize` for a registered client with a refused scheme must answer a
  local `400` with no `Location`.
- **D4:** `ctx.auth.token` is the raw bearer token. Extend the ownership pin to assert the execute
  call context carries no field from `ctx.auth`.
- **Count one more aggregate before deploy:** stored clients whose `grantTypes` lacks
  `authorization_code`. 1.x now refuses them with `unauthorized_client`.

## Verdict

Not ready to approve as written: fix finding 1 in the design, correct owner question 1 per finding 2, then D1 and D2 (with the flag) can go ahead; rollback is safe.
