# PR 4 OAuth 1.2.4 design security review

**Verdict: design FAIL as written.** D1 is viable after findings 1–2; D2 needs the policy decision and enforcement in finding 3. D3 and the D4 identity approach are sound. Storage compatibility does not require signing out every refreshed user on rollback.

Reviewer: Codex frontier, independent read-only security lane. Reviewed 2026-11-18 against the supplied DESIGN.md proposal, current source and tests, installed oauth-provider 0.10.4, and the npm-packed 1.2.4 distribution and declarations. No application edits, installs into node_modules, production reads, paid calls, server starts, commits, or pushes.

## Findings

### 1. blocker — Per-origin providers can inherit another provider's helpers through shared `env`

**Files:** DESIGN.md D1; `src/server.ts` provider dispatch; upstream 1.2.4 `dist/oauth-provider.js:2938`, `:4587`, `:4598`.

The library does `if (!env.OAUTH_PROVIDER) env.OAUTH_PROVIDER = this.createOAuthHelpers(env)`. The helper closes over that provider and its configured resource. D1 adds multiple providers but does not isolate this mutation. Passing a reused environment object through A and then B leaves B's WorkOS handler using A's helper. This does not require a race.

**Reproduced:** with real 1.2.4 providers and one in-memory environment, authorize on raven.stellar.org followed by raven.stellar.buzz, omitting `resource`, returns the .org resource on both requests while the second issuer is .buzz. Explicitly requesting the .buzz resource on the second request instead produces `invalid_target`. This can break alias sign-in and bind a newly approved grant to the wrong origin. This probe establishes the failure when env is reused; it is not a production observation.

**Fix:** each dispatch must pass a fresh environment object with no inherited `OAUTH_PROVIDER`, e.g. a request-local shallow copy with `OAUTH_PROVIDER: undefined` (adapt the typing), allowing the selected provider to populate only that copy. Do not clear/reassign the shared env field, which introduces concurrency problems. The same copy must reach default-handler routes and metadata aliases. Alternatively supply explicitly matched request-local helpers. Cache providers/options, not request environments or helper closures over request environments.

**Guard:** alternate A→B→A with the same outer env, both explicit and omitted resource; include concurrent calls. Assert parsed resource and completed grant resource match the selected origin. My request-local-copy probe passes A→B→A even with spoofed Host and X-Forwarded-Host headers.

### 2. major — Pick 404 for unknown origins; canonical-provider fallback does not canonicalize the issuer

**Files:** DESIGN.md D1; `src/server.ts`; upstream `dist/oauth-provider.js:2998` onward, `:3298–3330`, `:4499–4528`.

The combined provider derives its issuer and relative endpoints from `request.url`, not from `resourceMetadata.resource`. Selecting the canonical provider for an unrecognized URL is not an origin guard.

**Reproduced:** sending `https://attacker.example/.well-known/oauth-authorization-server` to the canonical provider advertises attacker.example as issuer, authorize endpoint and token endpoint, together with the canonical Raven protected resource. A valid canonical refresh token can be exchanged at that unknown request origin. The canonical access token is **not** accepted at unknown-origin `/mcp`: the additional request-audience check returns 401. Do not describe this as a demonstrated bearer-authentication bypass. Current `workers_dev: false` and deployed routes limit reachability, but do not make the proposed fallback correct.

**Fix:** reject unsupported request origins before provider dispatch and browser login work. Allow the three exact production HTTPS origins; do not accept a matching hostname with arbitrary scheme or nondefault port. Use `new URL(request.url).origin`, never Host, Forwarded or X-Forwarded-Host. Keep the loopback development exception explicit and bounded; do not accidentally broaden the unauthenticated bypass. `allowDevUnauthenticated` currently accepts 127.0.0.1, not the entire 127/8 range as D1 claims. Avoid an unbounded cache of loopback origins/ports.

**Guard:** unknown origin, HTTP production URL, unexpected port, spoofed forwarding headers, path-suffixed discovery and all three allowed origins. Arbitrary `resource` parameters must still fail the provider's exact-resource validation. Known per-origin metadata/challenges work as proposed.

### 3. major — The scheme denylist does not enforce “private-use callbacks only”

**Files:** DESIGN.md D2; `src/auth/redirects.ts`; `src/auth/gate.ts` registration callback; `src/auth/workos.ts` `resolveAuthRequest`, `authorizationErrorResponse`, `completeCallback`.

The flag accepts any parseable non-HTTP scheme outside the six upstream exclusions. D2's additional list still admits `smb:`, `nntp:`, `tel:` and OS handlers such as `ms-settings:`. A “simple app-name” syntax rule has the same problem: these names match it. I reproduced authorization/code exchange for these classes under 1.2.4, and DCR 201 for smb, nntp and ms-settings with the proposed denylist. The probe never launched an OS handler or contacted these URLs.

A malicious DCR client or CIMD document can select its own admitted return URI. On later authorization errors, Raven deliberately redirects before consent; that can launch an admitted protocol handler without a successful WorkOS login. After approval, it receives an authorization code. PKCE prevents a different app that merely intercepts an honest client's code from redeeming it without the verifier. It does not prevent a malicious initiating client, which chose the verifier, from redeeming a grant the user approved. Consent's unverified-client label, escaped full return URI, CSRF, Terms acknowledgement and browser-bound WorkOS state remain essential. The native scheme does not authenticate the application. This is not evidence of a WorkOS credential leak or a demonstrated OS-handler exploit.

**Fix:** retain the native opt-in justified by actual Claude Code/Cursor/Warp use, but use a positive callback policy: HTTPS, loopback HTTP, and explicitly approved native protocols (start with `claude:`, `cursor:`, `warp:`). If unknown native clients are a requirement, specify and review a reverse-domain scheme policy plus named exceptions; do not equate arbitrary simple names with private use. An allowlist restricts callback transports; it does not verify app ownership. Make the compatibility cost explicit in the proposal.

**Enforcement:** Raven's check already runs on DCR, successful GET/POST parsing, and provider error redirects. CIMD does not invoke `clientRegistrationCallback`, but both authorization legs still run the Raven check. Keep that arrangement. Also apply the same check to the parked MCP request in `completeCallback` before completing the grant: an already-parked pre-deploy request can otherwise use a newly forbidden network URI, because the provider's completion check with this flag on still accepts it. Test DCR, CIMD, legacy registrations, provider-error redirects and a parked forbidden callback, with no Location/WorkOS hop for refusals.

### 4. minor — D5 overstates two guarantees and assumes tests that are absent

**Files:** DESIGN.md D5/test plan; `test/auth.test.ts`; upstream `dist/oauth-provider.js:3387`, `:3530–3543`.

The stronger code-exchange check compares `redirect_uri` with the grant's original URI **when supplied**; PKCE exchanges can omit it. Registered grant-type enforcement expressly allows refresh when `authorization_code` is registered, even without an explicit `refresh_token` entry. State these exceptions. CIMD grant replacement also preserves distinct redirect destinations, so “one grant per user/client/resource” has a CIMD exception (`:5632`).

The current auth suite exercises registration, parse/error-redirect ordering, consent and a stubbed WorkOS completion; it does not exercise a real OAuth code exchange with the wrong registered redirect or real token-endpoint grant-type enforcement. Add those bounded provider contract tests rather than merely “confirming” existing coverage. Keep the OAuth code exchange distinct from the WorkOS authenticate POST.

### 5. note — Legacy audience-free tokens remain cross-origin during migration

**Files:** DESIGN.md D1; upstream `dist/oauth-provider.js:2799–2820`, `:4864–4890`.

For already-bound tokens, the proposed separate providers reject cross-origin access and refresh (reproduced 401/400). For old tokens without an audience, each provider supplies its own sole-resource migration default. The same unbound token therefore works on either trusted origin; the first successful refresh binds its grant to the origin used. Previously issued audience-free access tokens remain audience-free until expiry even after that refresh. This preserves the old unbound behavior, not strict origin separation.

**Fix:** explicitly accept this legacy migration exception for the three trusted aliases, or choose a fixed migration destination/re-authorization policy if strict separation is required. Do not promise universal cross-origin rejection in the test plan. The unknown-origin 404 remains necessary.

### 6. note — D4 is sound if its test exercises the actual host-to-tool path

**Files:** `src/server.ts:99–125`; `src/mcp/tools.ts:408`; `src/observability-request.ts:20`; agents `dist/handler-stateless-B5hU3dxK.js:33–52`.

Raven derives the subject and telemetry from `ctx.props`; its execute closure passes only artifact owner and request correlation IDs. It does not consume SDK `authInfo`. Agents maps provider `ctx.auth` into SDK AuthInfo, including the raw bearer token, but that mapping alone does not change Raven identity or expose it to model code.

**Fix/test:** the proposed ownership pin should invoke the real MCP handler/tool wiring with differing props and auth identity, and with absent/invalid props. An OAuth request with no valid props subject must remain ownerless despite valid-shaped authInfo. Check the runner context uses the props owner and contains no token/authInfo. A test calling only `resolveArtifactOwner` cannot detect a future source switch in `mcpHandler`.

### 7. note — Storage rollback succeeds; feature rollback has a separate CIMD limit

**Files:** DESIGN.md Rollback; installed 0.10.4 and packed 1.2.4 grant/token read/write paths.

The old version reads grant JSON, ignoring added KV list metadata. Token/key wrapping, grant keys, token keys, encrypted props and refresh rotation fields remain compatible. The scratch probe minted real 0.10.4 grants and tokens, served/refreshed them with 1.2.4, then served/refreshed the resulting tokens with 0.10.4:

| Stored resource | Upgrade access / refresh | Rollback access / refresh |
| --- | --- | --- |
| Each of the three origin `/mcp` resources | 200 / 200 | 200 / 200 |
| Absent resource | 200 / 200 | 200 / 200 |
| Canonical bare origin | 401 / 400 invalid_grant | Not migrated |
| Fresh 1.2.4 native-callback grant | Issued successfully | 200 / 200 |

Thus “every user who refreshed under 1.x must sign in again on rollback” is not supported. However 0.10.4 cannot authenticate a CIMD client that requires `private_key_jwt`; a client that started using it under 1.x needs supported-method fallback after rollback, and a private-key-only client cannot recover merely by signing in again. Existing bound access tokens remain readable. A rollback also removes the new security checks and may restore older cross-resource grant-replacement behavior. Do not roll KV back or resurrect pre-rotation tokens.

**Limit:** the proposed rollback identifier `fe3708cb` is not a local Git object (`git show` fails). This review proves package-level 0.10.4 compatibility, not the exact deployed artifact's unrelated app/config changes. Identify the actual rollback deployment/artifact before claiming it was validated.

## Confirmed design details and hardening

- D3 lifetimes are valid integers above 60: access 3,600; fixed grant 7,776,000; client registration 31,536,000 seconds. Leave sliding refresh expiry unset. Removing `allowPlainPKCE: false` and moving metadata scopes to `requiredScopes` is correct. `requiredScopes` advertises requirements; it does not itself enforce scope authorization (also not enforced by this old Raven/provider path).
- `clientRegistrationCallback`, `lookupClient`, `parseAuthRequest`, `completeAuthorization` and CIMD enablement retain the interfaces Raven uses. The derived hex subject satisfies the new nonempty/colon-free user-ID rule.
- Actual gains include mandatory audience binding, exact supplied code-exchange redirect binding, grant-type checks with the exception above, invalid_scope for wholly ungranted scope requests, client-helper validation, and fixed registration-callback error text. DCR's old cap read the full text and counted characters; 1.2.4 bounds the streamed bytes. Repeated-parameter and mixed-client-authentication rejection already existed in 0.10.4 and should not be counted as new gains.
- Native opt-in restores a broad old capability unless Raven narrows it. CIMD private_key_jwt adds an authentication surface, not a user identity source: verification checks asymmetric signature, client iss/sub, issuer/token-endpoint audience, lifetime and replay marker. Raven's unconditional S256 requirement must remain. No external-token resolver, token-exchange grant or enterprise-managed authorization should be enabled by this upgrade.

## Evidence and limits

Reproduce: `node tmp/oauth-security-review/probe.mjs`. Results: `tmp/oauth-security-review/probe-results.jsonl`. The probe runs the actual two package distributions, replacing only the `cloudflare:workers` WorkerEntrypoint import with an inert class for Node. KV is in-memory with JSON reads and list metadata; no real credentials, WorkOS request, Cloudflare runtime, expiry timing or KV eventual-consistency behavior is simulated. The lead's assembled Worker and migration gates still need to run after implementation. The initial scratch script had a syntax typo, corrected before the successful run; no failing checks were hidden.

Primary migration guidance was fetched with `gh api repos/cloudflare/workers-oauth-provider/contents/docs/migration-1.x.md` and saved under scratch: [upstream migration guide](https://github.com/cloudflare/workers-oauth-provider/blob/main/docs/migration-1.x.md). Behavioral conclusions above are checked against the pinned npm 1.2.4 source, not inferred solely from that moving guide.

Approval can proceed once findings 1–3 are resolved explicitly in the design, finding 4 updates its verification promises, and the migration/rollback limits above are recorded. No implementation approval is implied by this failed design verdict.
