# Item 7.3, PR 4: execution plan, oauth-provider 1.2.4

Branch `np/7.3-deps-oauth` in `/home/tyler/code/raven-wt/np-7.3`, on `origin/main` `fdd001a4`, after
the design commit. **[DESIGN.md](DESIGN.md), revision 2.1, is the specification.** This plan only
orders the work. Where the two differ, DESIGN.md wins.

## Approval (orchestrator for the owner, 2026-11-18)

The approval falls under the owner's "research, review, test and eval and decide and execute what
sticks".

- **D1, per-origin providers:** approved.
  - Accept that the fewer than 10 Devin CLI sessions bound to the bare origin sign in again.
  - Record that in the PR body and in `.agents/TODO.md`, with a post-deploy re-check of the
    `auth_reject` and `onError` reasons for Devin CLI.
- **D2, `allowPrivateUseRedirectUris: true`:** approved, with the reason recorded beside the flag in
  code.
- **D2, the allowlist:** approved. Callbacks at authorization are limited to https, loopback http,
  `claude:`, `cursor:` and `warp:`. Registration needs at least one allowlisted URI.
- **Rollback target:** Worker version `fe3708cb-4d35-4c53-a0e0-a27071e5e9c0` (`abd68c63`,
  oauth-provider 0.10.4).

The plan review is the design review. Fable ([REVIEW.md](REVIEW.md)), Codex
([CODEX-DESIGN-REVIEW.md](CODEX-DESIGN-REVIEW.md)) and the Codex re-check
([CODEX-DESIGN-RECHECK.md](CODEX-DESIGN-RECHECK.md)) reviewed DESIGN.md. This plan adds no decision,
so no second Fable round.

## Steps

1. **Baseline:**
   - `node -v`, `npm -v`;
   - the `dist/server.js` SHA-256 after `npm run build`;
   - the `mcp:surface` hashes (surface `815333b7…bd07`, instructions `67a6bd0b…6c00`);
   - the `npm test` and `test:smoke` pass counts.
2. **Install:** `npm install @cloudflare/workers-oauth-provider@^1.2.4`. Only that entry may change
   in the lockfile; list it.
3. **Pure host and callback rules.**
   - In `src/hosts.ts`, or a new small pure module, add:
     - the production origin list, derived from the existing `HOST` and `ALIAS_HOSTNAMES` (one
       source);
     - `selectOAuthOrigin(url: URL)`. It returns the production origin when `url.origin` is exactly
       one of the three `https://` origins, a loopback origin for `localhost`, `127.0.0.1` or `::1`
       over `http:`, and otherwise `null`. It reads `url.origin` only, never a header.
   - In `src/auth/redirects.ts`, replace `hasAllowedRedirectTransport` with an allowlist (DESIGN D2):
     - `https:`;
     - `http:` on loopback (`localhost`, `127.0.0.0/8`, `::1`, as today);
     - `claude:`, `cursor:` and `warp:` by exact scheme.
   - Add a helper that turns a refused URI into a bounded scheme token: `URL.protocol` with the
     colon removed, matching `^[a-z][a-z0-9+.-]{0,31}$`, else `other`.
4. **Provider options (`src/auth/gate.ts`).** `oauthProviderOptions(mcpHandler, resource)`:
   - `resourceMetadata: { resource, resource_name }`;
   - `requiredScopes: [MCP_SCOPE]`, moved out of `resourceMetadata.scopes_supported`;
   - delete `allowPlainPKCE`;
   - `allowPrivateUseRedirectUris: true`, with a comment giving the reason: Claude Code `claude:`,
     Cursor `cursor:` and Warp `warp:` callbacks measured in production grants on 2026-11-18. It
     deviates from upstream's "leave off for MCP servers". Raven's allowlist narrows what it admits.
     Cite DESIGN.md;
   - `clientRegistrationCallback`: refuse any remote `http:` URI (as today), and refuse a
     registration with no allowlisted URI;
   - `onError`: log `internal.category` and `internal.reason` (plus status and code) through
     `logEvent`. Never log `description` or `detail`. Return nothing.

   Keep the lifetimes and CIMD as they are. Enable no external-token resolver, token exchange or
   enterprise-managed authorization.
5. **Dispatch (`src/server.ts`).**
   - Build the three production providers at module scope.
   - Build a loopback provider per request; do not cache it.
   - Order of the fetch handler:
     1. the alias redirect, unchanged;
     2. the MCP API-key and dev-bypass paths, unchanged;
     3. `selectOAuthOrigin`. `null` gives 404 before `/playground` and before any provider or WorkOS
        work;
     4. the playground;
     5. the metadata alias;
     6. the provider.
   - Every provider call passes `{ ...env, OAUTH_PROVIDER: undefined }`, with typing adapted. Never
     mutate the shared `env`.
6. **Callback checks (`src/auth/workos.ts`).**
   - The existing `hasAllowedRedirectTransport` call sites use the allowlist: both `/authorize` legs
     and the error redirect.
   - Add the same check to the parked MCP request in `completeCallback`. Place it after the state and
     browser-binding validation and before the WorkOS code exchange, keeping state consumption and
     cookie cleanup.
   - A refusal gets a local 400 with no `Location` and no WorkOS hop.
   - Each refusal logs `auth_reject` with the scheme token.
7. **Tests:** DESIGN.md "Test plan" items 1 and 2, all committed. Update the existing tests that
   1.x changes:
   - `test/auth.test.ts` and `test/smoke/host-routing.test.ts` callers of `oauthProviderOptions`;
   - the root protected-resource document, which now gives 404;
   - the token response, which now always carries `resource`.

   Give the plain-Node KV fake `list` and key metadata. The smoke test for the fresh `env` must be
   shown to fail with the fix removed: revert the fix temporarily, run the test, restore it, and
   record both runs in EXEC.md.
8. **Migration harness and local flow** (DESIGN.md test plan items 3 and 4, scratch under `tmp/`, not
   committed).
   - The Codex probes under `tmp/oauth-security-review/` and `tmp/oauth-security-recheck/` are
     starting points.
   - The local flow runs against one `npm run dev` `hc` child, after the `lsof` pre-check; kill it
     afterwards.
   - It goes up to the WorkOS redirect and never completes a real WorkOS login.
   - Record the result tables in EXEC.md.
9. **Docs and records.**
   - `ARCHITECTURE.md` (auth sections): per-origin providers, the callback allowlist and the 404 for
     unknown origins.
   - `docs/operations.md` retention table: client registrations renew in use. Add a
     `client-assertion-jti:<hash>` row.
   - The comment in `src/auth/retention.ts`.
   - `test/retention.test.ts` must stay green.
   - **Do not edit public legal or privacy pages.** List every public page that states the client
     registration lifetime in EXEC.md; the lead decides.
   - `.agents/TODO.md`: a new item, "Re-check Devin CLI sign-in after the oauth-provider 1.x
     deploy". It reads `auth_reject` and `onError` reasons for Devin CLI and the bare-origin class.
     Done when a Devin CLI sign-in has succeeded, or its failure is understood and recorded.
10. **Gates, bare, on the final tree:**
    - `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`,
      `npm run secrets:scan -- --tree`;
    - one `workerd` copy;
    - `npm audit` paired with `origin/main`, with no new advisory;
    - `mcp:surface`, expected unchanged.

    The routing gate and `eval:selftest` are not needed. CI runs them.
11. **Commit** on `np/7.3-deps-oauth` with the normal hooks:
    `oauth-provider 1.2.4: per-origin providers, native-callback allowlist (round item 7.3)`.
    Include EXEC.md and the plan folder.
12. **Independent review (the lead runs it):** a Codex frontier `gpt-6-astra` high security review
    of the diff and the auth flow. The executor reconciles its findings in a follow-up commit.

## Stop rule

Stop and report to the lead, changing nothing further, if:
- a gate fails and the fix is not plainly within DESIGN.md;
- the migration harness shows a stored-grant class behaving other than DESIGN.md predicts;
- the fresh-`env` smoke test passes even without the fix (so it does not test the fix);
- `mcp:surface` changes;
- the lockfile moves more than the provider entry;
- a design question arises that DESIGN.md does not answer.

## Needs from the orchestrator

- Merge, then deploy. Worker bytes change.
- Post-deploy checks: DESIGN.md "Deploy note".
- Rollback target: `fe3708cb-4d35-4c53-a0e0-a27071e5e9c0`.
