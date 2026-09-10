# Independent review — OAuth consent and redirect

Reviewer: Grok 4.6 high (vendor-diverse technical). Authors: Sol (auth), GPT-6 (UI). Base: `origin/main`. Scope: source, installed `@cloudflare/workers-oauth-provider` 0.10.3, local defensive tests, parent-reported gates. No live probes, exploits, source edits, or broad re-runs.

## Verdict

**No blocking bugs.** The patch closes the typed-error HTTP redirect hole, adds CSRF-gated Cancel with `access_denied`, and keeps Terms on the approval path only. Ship the auth behavior. Optional items below are hardening and coverage, not merge blockers.

Parent evidence: 2040 unit tests and 93 smoke tests passed before the UI href correction; five focused consent-page tests pass after it. I did not re-run those suites.

## What holds

**Final redirect boundary.** Provider `parseAuthRequest` (dist 3481–3524) validates client and registered redirect, then attaches that URI to later resource, response-type, and PKCE errors via `withAuthorizationRedirect`. CIMD (`resolveClientIdMetadataDocument`, dist 364–384) never hits `clientRegistrationCallback`. The Worker now refuses insecure URIs on successful parse (`src/auth/workos.ts:473–477`) and again in `authorizationErrorResponse` (`507–516`). An insecure typed error becomes a local 400 with no `Location`. That matches RFC 9700 §2.1 and Terra’s required fix 1.

**DCR.** `clientRegistrationCallback` (`src/auth/gate.ts:70–80`) runs after provider metadata parse and before KV write (dist 2560–2614). Non-loopback HTTP is rejected as `invalid_client_metadata`. HTTPS, loopback HTTP, and native schemes remain allowed. Loopback hosts match the provider (`isLoopbackUri`, dist 3247–3256): `127/8`, `::1`, `localhost`.

**Cancel.** CSRF is checked first (`workos.ts:190–194`). A single `decision=deny` then returns 303 `access_denied` with validated `state` and `iss`, clears `__Host-MCP_CONSENT_CSRF`, and does not park `login:*`, call WorkOS, or `completeAuthorization` (`196–206`). Terms run only after that (`215–217`). The Cancel control is a submit button with `formnovalidate` (`src/site.ts:997`). Unknown, duplicate, or conflicting `decision` values retry consent (`208–211`) and cannot approve.

**CSRF and Terms.** Invalid CSRF on deny retries to `/authorize…` and does not emit `access_denied` (`test/auth.test.ts` invalid-CSRF case). Approval still requires `tos_agree`. Display of the return address is escaped text, not a link. The client name is labeled unverified.

**Destination serialization.** `consentPage` shows `new URL(args.redirectDestination).href` then `escapeHtml` (`site.ts:959, 985`). Authorize only reaches this after `hasAllowedRedirectTransport`, so `new URL` cannot throw on that path. Punycode/path encoding matches browser navigation, which is the right disclosure for IDN. Native path+query is still shown in full (`test/consent-page.test.ts:27–31`).

## Blocking

None.

## Optional ideas

1. **Suggestion — `src/auth/redirects.ts:12`.** Any non-`http:` protocol returns true. Dangerous pseudo-schemes are already rejected by `validateRedirectUriScheme` (dist 251–268) before a redirect is attached, so this is not a current bypass. A same-boundary denylist would be defense in depth only.

2. **Suggestion — `test/smoke/auth-redirects.test.ts`.** Smoke covers DCR and both authorize legs for legacy HTTP and typed errors. It does not exercise assembled-worker Cancel. Unit tests already pin Cancel, CSRF failure, and fail-closed decisions.

3. **Nit — `src/site.ts:903–905`.** Cancel is a full-width control under Sign in, not beside it. Research asked for a visible secondary action beside approval. Function is correct.

## Coverage

Meaningful for the two required fixes: real-provider DCR allow/deny, GET/POST unsafe parse errors, loopback and native allow, CSRF-valid deny, CSRF-invalid deny, ambiguous decisions, transport table, consent XSS/IDN/Cancel markup. Gaps above are optional.

## Limits

I did not send live CIMD or WorkOS traffic. CIMD HTTP is enforced at authorize time, not at document fetch; seeded KV clients cover the same Worker boundary.
