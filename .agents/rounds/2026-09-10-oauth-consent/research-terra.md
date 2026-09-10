# OAuth consent completion research

Date: 2026-09-10. Scope: source review and defensive design only. I did not use the unavailable H1 report.

## Decision

Do not merge candidate `700d60e` unchanged. It has one substantive redirect transport bypass. It also lacks a Cancel action.

### Required fix 1: check typed error redirects

`resolveAuthRequest()` checks `parsed.redirectUri` only after `parseAuthRequest()` returns. Its `catch` then passes any typed error with `error.redirectUri` to `authorizationErrorResponse()`.

The installed `@cloudflare/workers-oauth-provider` is `0.10.3`. Its bundled source first validates the client and registered redirect. It then attaches that redirect to later resource, response-type, and PKCE errors. See `node_modules/@cloudflare/workers-oauth-provider/dist/oauth-provider.js`, `parseAuthRequest()` source region 3481-3524.

Therefore, a later parser error can carry an already-registered plain-HTTP redirect. This happens before the candidate check runs. `authorizationErrorResponse()` then sends a 303 to it.

The DCR callback does not close this path. It runs only after DCR metadata parsing. It runs before KV storage. It does not run for CIMD resolution or `createClient()`. The installed source shows this ordering in `handleClientRegistration()`, source region 2530-2615.

CIMD is enabled in `src/auth/gate.ts`. Its installed resolver accepts redirect schemes except dangerous pseudo-schemes. It does not apply the candidate TLS policy. See `resolveClientIdMetadataDocument()`, source region 364-384, and `validateRedirectUriScheme()`, source region 247-273.

Apply the transport rule at the final redirect boundary. If a typed error has an insecure `redirectUri`, return the local 400 response. Do not use its URI, state, or issuer. Keep the existing successful-request check as defense in depth.

Add local unit coverage for a parser rejection that carries a non-loopback HTTP `redirectUri`. Verify no `Location`, no consent cookie, no parked state, and no WorkOS call. This is source-level guidance only.

This boundary follows [RFC 9700 section 2.1](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.1). It says authorization responses must not use HTTP, except native loopback redirects. The current [MCP security rules](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations) also require precautions against redirects to untrusted URIs.

### Required fix 2: implement Cancel

The candidate has only an approval submit control. It has no Cancel control or `access_denied` path.

A Cancel action is safe when it uses the same POST form and CSRF validation. After request parsing and CSRF validation, handle Cancel before the terms check, state parking, and WorkOS redirect.

Build a 303 error redirect from the validated `AuthRequest`. Set `error=access_denied`. Preserve `state` when present. Include `iss` when present. Clear the consent CSRF cookie. Do not call `completeAuthorization()`. Do not write `login:*`. Do not call WorkOS.

The provider documentation gives this terminal-error pattern after `parseAuthRequest()` validation. It requires the validated redirect, state, and issuer. See the installed [provider authorization documentation](https://github.com/cloudflare/workers-oauth-provider#authorization-response-issuer).

Add tests for valid Cancel and invalid CSRF Cancel. The valid case must show `access_denied`, preserve state and issuer, and avoid KV, WorkOS, and grant creation.

### Cancel UX guidance

Use the parent implementation's `decision=deny` submit button in the existing CSRF-protected form. Make Cancel a real `<button type="submit">`. Keep it a visible secondary action beside approval.

Do not use a link for cancellation. A link cannot carry the form CSRF token. Do not require the terms acknowledgement for Cancel.

Keep the validated callback destination near the controls. Keep the client-name qualifier near the client name. GitHub tells users to review the application developer and requested data before authorization. See [GitHub OAuth authorization guidance](https://docs.github.com/articles/authorizing-oauth-apps).

Keep both controls usable at 320 CSS pixels and 400% zoom. Do not require horizontal scrolling. This follows [W3C WCAG 2.2 Reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow).

### Dependency audit boundary

I inspected `/tmp/raven-oauth-dependency-audit.json`. It reports one indirect moderate Hono 4.13.1 finding. It also reports high transitive `sharp` and `adm-zip` findings through test and tooling dependencies.

The OAuth implementation does not import or call Hono. `src/` has no Hono use. The lockfile brings Hono through `@modelcontextprotocol/sdk` 1.30.0. OAuth validation uses Workers request handling and `@cloudflare/workers-oauth-provider`.

Therefore, the consent validation path does not rely on Hono. This report makes no dependency-upgrade recommendation. The audit results do not change the redirect or Cancel findings.

### Redirect policy assessment

The candidate correctly rejects non-loopback HTTP during DCR. It also checks successful `/authorize` results. It correctly renders its own rejection locally, without a redirect.

The permitted loopback set includes `127/8`, `::1`, and `localhost`. The installed provider uses the same set. It permits port variation only when scheme, host, path, and query match. See its `isLoopbackUri()` and `isValidRedirectUri()` source regions 3243-3273.

[RFC 8252 section 7.3](https://datatracker.ietf.org/doc/html/rfc8252#section-7.3) requires variable ports for loopback IP redirects. It advises against `localhost`. [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.1.3) requires exact matching outside the native loopback port exception.

The current MCP rules require a visible redirect hostname for CIMD. Candidate `700d60e` shows the full validated destination. This satisfies that display requirement. See [MCP client metadata security](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations#localhost-redirect-uri-risks).

Custom native schemes remain allowed. That preserves native clients. However, `myapp://` has no period. [RFC 8252 section 8.4](https://datatracker.ietf.org/doc/html/rfc8252#section-8.4) says private-use schemes should be reverse-domain based. It says schemes without a period should be rejected. This is a SHOULD-level policy decision. Either enforce it consistently at registration and authorization, or correct the comments to state the explicit compatibility exception.

### Client identity disclosure assessment

The candidate displays the exact validated redirect. It marks the displayed client name as unverified. This is necessary for DCR and CIMD.

[RFC 7591 section 5](https://datatracker.ietf.org/doc/html/rfc7591#section-5) requires servers to treat client metadata as self-asserted without a software-statement claim. It gives client-name and logo impersonation as examples. The fixed disclosure is therefore appropriate. Do not describe the name as an identity proof.

## Sources

- [RFC 9700: OAuth 2.0 Security Best Current Practice](https://www.rfc-editor.org/rfc/rfc9700.html), checked 2026-09-10.
- [RFC 8252: OAuth 2.0 for Native Apps](https://datatracker.ietf.org/doc/html/rfc8252), checked 2026-09-10.
- [RFC 7591: OAuth 2.0 Dynamic Client Registration](https://datatracker.ietf.org/doc/html/rfc7591), checked 2026-09-10.
- [MCP Authorization Security Considerations, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations), checked 2026-09-10.
- [GitHub OAuth app authorization guidance](https://docs.github.com/articles/authorizing-oauth-apps), checked 2026-09-10.
- [W3C WCAG 2.2 Reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow), checked 2026-09-10.
- Installed `@cloudflare/workers-oauth-provider` 0.10.3 bundled source and README, checked 2026-09-10.

## Addendum: private schemes and Hono

This addendum supersedes the earlier custom-scheme policy recommendation. Do not add a new period-only naming restriction in this change.

[RFC 8252 section 8.4](https://datatracker.ietf.org/doc/html/rfc8252#section-8.4) says an authorization server **SHOULD** enforce reverse-domain scheme names. It says a server **SHOULD** reject a scheme without a period. The app-side rule in [section 7.1](https://datatracker.ietf.org/doc/html/rfc8252#section-7.1) is stronger.

Official VS Code documents the editor's registered custom URI scheme through [`vscode.env.uriScheme`](https://code.visualstudio.com/api/references/vscode-api#env). Its URI-handler API accepts a browser redirect only for that editor scheme and an extension-ID authority. See [the VS Code API reference](https://code.visualstudio.com/api/references/vscode-api#UriHandler).

This is not OAuth redirect evidence. It does show that an official native platform uses a documented single-label scheme. Therefore, a generic period check can reject valid platform behavior without proving ownership.

Keep the provider's scheme safety validation and exact registered-URI matching. Keep the application transport check limited to HTTP. Add stronger private-scheme rules only with a platform-specific trust or attestation design.

The Hono finding has no OAuth validation reachability. The audit lists Hono 4.13.1 as indirect through `@modelcontextprotocol/sdk`. Source inspection found no Hono import or call in `src/`. The OAuth path uses Workers APIs and `@cloudflare/workers-oauth-provider`.
