# PR 4 OAuth 1.2.4 — independent diff security review

**Verdict: PASS.** No blocker or major runtime security finding. The implementation follows approved DESIGN.md revision 2.1. Reconcile the three minor documentation findings below before merging; none calls for a runtime design change.

Reviewed 2026-11-18 by the assigned Codex frontier security lane (`t1y2`), independently of the Claude Sonnet author and Claude Opus orchestrator. Scope: `fdd001a4...c341e0f10f524f2e95ce19963a6200454667d0c8`, the approved design, plan, execution record, previous Codex design reviews, installed provider source, and the changed tests. No tracked files edited, installs, commits, pushes, development server, production access, or paid/model calls. Mutations were applied only by a scratch Vite transform.

## Numbered findings

1. **minor — Consent and browser binding do not authenticate native-app ownership.** `ARCHITECTURE.md:58`; corresponding comment `src/auth/redirects.ts:12`.

   The architecture correctly says the allowlist does not authenticate the app that owns a scheme, then says the consent page and browser-bound state “do that work.” They do not establish that a client is Claude Code, Cursor, or Warp. Open registration permits a client to name an allowed callback scheme, and a malicious initiating client can choose its own PKCE verifier. Consent records the user's approval of the displayed, explicitly unverified client; the binding ties the WorkOS response to that browser flow. The source comment's “do that job's share” carries the same ambiguity. Runtime behavior and the unverified-client label are correct.

   **Fix:** say that native-app ownership remains unverified; consent and browser-bound state protect user approval and the login round trip. Retain the explicit distinction between callback transport policy and app identity.

2. **minor — The architecture omits the accepted old-access-token migration exception.** `ARCHITECTURE.md:31`.

   “Another origin refuses them” followed by “binds to the origin that first refreshes it” omits the distinction between binding the grant and invalidating an already-issued audience-free access token. The scratch migration case independently passed: the old token works on all three trusted origins both before and after refresh on `.buzz`; only its replacement is restricted to `.buzz`. DESIGN D1 explicitly accepts this until the old token expires, including after refresh.

   **Fix:** qualify cross-origin rejection as applying to bound tokens/grants and add that existing audience-free access tokens remain usable across the trusted origins until expiry, even after refresh binds their grant. Link the dated design/migration record for the rollout detail.

3. **minor — The unconditional unknown-origin 404 claim is broader than the approved dispatch order.** `ARCHITECTURE.md:34`.

   “A request to any other origin … gets 404” is not universal. Alias browser redirects happen first (for example `http://raven.stellar.buzz/playground/login` returns the canonical 308), and successful API-key and local-dev MCP bypasses also precede origin selection. The code matches PLAN step 5, and EXEC already records the API-key exception. The smoke tests explicitly recognize the alias redirect. This is a documentation issue, not a newly discovered auth bypass.

   **Fix:** describe the 404 as applying to requests reaching OAuth origin selection, after alias redirects and the existing MCP bypasses; preserve the accurate guarantee that unsupported origins cannot dispatch an OAuth provider or start their own WorkOS flow.

## Security boundaries checked

- Production providers are constructed at module scope from the shared production-host list. Selection uses only the parsed request URL, with exact production HTTPS origins and the intended HTTP loopback set. Loopback providers are not cached. The origin refusal precedes playground/provider work. Neither forwarding headers nor Host select an issuer.
- Both provider calls, including discovery aliases, use `providerEnv(env)`, which returns `{ ...env, OAUTH_PROVIDER: undefined }`. No shared-env assignment was introduced. Sequential and concurrent assembled-worker flows bind grants to their own resources.
- The native callback allowlist is exact; HTTPS and HTTP loopback remain supported. DCR refuses remote HTTP and requires at least one usable callback. Mixed lists, legacy clients and CIMD authorization still check the selected URI. Both authorization legs, error redirects and parked callbacks refuse disallowed transports locally. The parked check follows state consumption and binding validation and precedes the WorkOS exchange; refusal clears the cookie and emits no Location.
- Scheme logging is derived from parsed `URL.protocol`, bounded by the required syntax and length. `oauth_error` emits only status, code, category and reason. Its observability-skill field map matches the implementation. No new identity/token logging was introduced.
- Raven ownership and telemetry still derive from grant props. The real MCP/tool path passes only artifact owner and request/ray IDs into the execute runner; it does not consume SDK authInfo. The identity regression exercises differing and invalid subjects with real tokens.
- Provider options preserve lifetimes and CIMD, move advertised resource scopes to `requiredScopes`, remove `allowPlainPKCE`, and justify the native opt-in. No external-token resolver, token-exchange grant or enterprise-managed authorization is enabled. The lockfile changes only the provider dependency entries.
- The KV fake preserves JSON reads, key metadata and list pagination needed by these contract tests. It explicitly records rather than enforces expiry and does not model KV consistency. The successful registration-renewal and migration checks are appropriately bounded by those limits. Operations documentation correctly distinguishes 1.x-stamped registrations and includes assertion replay markers. The Devin follow-up matches the accepted compatibility cost.

## Independent verification

All normal checks below passed on the unmodified implementation:

| Check | Result |
|---|---|
| `npm run typecheck` | Exit 0 |
| `vitest run test/oauth-origins.test.ts test/auth.test.ts test/hosts.test.ts test/server.test.ts test/retention.test.ts` | 5 files, 307 passed |
| `vitest run --config test/smoke/vitest.config.ts test/smoke/oauth-identity.test.ts test/smoke/host-routing.test.ts test/smoke/auth-redirects.test.ts` | 3 files, 48 passed |
| `vitest run --config tmp/pr4-migration/vitest.config.ts tmp/pr4-migration/harness.test.ts` | 12 passed: real 0.10.4/1.2.4 migration, cross-host isolation, legacy exception and rollback |
| `npm run -s mcp:surface -- --json` | Unchanged surface `815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07`; instructions `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00` |
| `git diff --check fdd001a4...HEAD` | Exit 0 |

The two deliberate negative controls independently reproduced EXEC's claims:

- `providerEnv` transformed to `return env`: host-routing suite **4 failed / 23 passed**, with second-origin consent returning 303 instead of 200, including the concurrent-flow test.
- Ownership transformed from `authSubjectFromProps(authProps)` to `ctx.auth.userId`: identity suite **5 failed**, including every ownerless case.

Reproduce using `tmp/pr4-review-mutation.config.ts`; default is the env mutation, `PR4_REVIEW_MUTATION=identity` selects the identity mutation. These expected exit-1 runs did not edit source. The normal suites above establish the positive controls. No additional confirmation sweep is needed.

This review did not repeat the full build/test/secrets/audit sweep recorded by the executor, complete a real WorkOS login, test CIMD private-key authentication in workerd, or validate the exact deployed rollback artifact. Those are not represented as newly verified here. The prior caller's untracked review brief was left intact.
