# Item 7.3, PR 4: execution record, oauth-provider 1.2.4

Executor: Claude Sonnet 5.5 (`t1y0`, lane `7.3-pr4-exec`), 2026-11-18, worktree
`/home/tyler/code/raven-wt/np-7.3`, branch `np/7.3-deps-oauth`, on the design commit `191e7be0`.
Specification: [DESIGN.md](DESIGN.md) revision 2.1. Order: [PLAN.md](PLAN.md) steps 1 to 11. The
lead runs step 12 (the independent security review). Nothing was pushed, merged or deployed, no
model or paid call ran, and nothing touched production.

**Result: steps 1 to 11 are done. No stop condition fired.** Every gate passes, `mcp:surface` is
unchanged, the lockfile moved only the provider entry, and the migration harness matched DESIGN.md's
prediction for every stored class.

## Environment

| | |
|---|---|
| Node | v26.13.0 |
| npm | 11.20.0 |
| wrangler / workerd | 4.164.0 / 1.20261117.1 (one `workerd` copy, deduped) |
| `@cloudflare/workers-oauth-provider` | 0.10.4 before, 1.2.4 after |

## What changed

Source (`src/`):

- `src/hosts.ts`: `PRODUCTION_HOSTNAMES`, `PRODUCTION_ORIGINS` and `LOOPBACK_HOSTNAMES`, all derived
  from the existing `HOST` and `ALIAS_HOSTNAMES`, plus `selectOAuthOrigin(url)`. It reads
  `url.origin` only. The MCP allowed-origin list in `src/server.ts` and the dev-bypass host set in
  `src/auth/gate.ts` now come from the same lists.
- `src/auth/redirects.ts`: `hasAllowedRedirectTransport` is now an allowlist (`https:`, loopback
  `http:`, and exactly `claude:`, `cursor:`, `warp:`). New `isRegistrableRedirect` (registration
  refuses remote `http:`, malformed and non-string entries) and `redirectSchemeToken` (bounded
  `^[a-z][a-z0-9+.-]{0,31}$` token, else `other`).
- `src/auth/gate.ts`: `oauthProviderOptions(mcpHandler, resource)`; new `mcpResource(origin)`.
  `resourceMetadata: { resource, resource_name }`, `requiredScopes: ["mcp"]` (moved, not copied),
  `allowPlainPKCE` deleted, `allowPrivateUseRedirectUris: true` with the reason recorded beside it,
  registration callback adds "at least one allowlisted URI", and an `onError` hook that logs
  `oauth_error` with `status`, `code`, `internal.category` and `internal.reason` only.
- `src/server.ts`: three production providers at module scope (a `Map` keyed by origin); a loopback
  provider per request, never cached; `selectOAuthOrigin` gives `404` before the playground and any
  provider or WorkOS work; every provider call, including the metadata alias, passes
  `{ ...env, OAUTH_PROVIDER: undefined }`. The API-key and dev-bypass paths stay ahead of selection.
- `src/auth/workos.ts`: refusals on both `/authorize` legs and the error redirect become a local
  `400` through one `refusedRedirectResponse`. The parked MCP request in `completeCallback` gets the
  same check after the state and binding checks and before the WorkOS exchange.
- `src/auth/retention.ts`: comment only.

Docs and records: `ARCHITECTURE.md` (host, provider, allowlist and `404` paragraphs),
`docs/operations.md` (retention table: renewal wording and a `client-assertion-jti:<hash>` row),
`.agents/TODO.md` (new "Re-check Devin CLI sign-in after the oauth-provider 1.x deploy"), and the
`cloudflare-observability-review` skill's field map (`oauth_error`, `redirect_refused:<scheme>`).

## Gates (bare, one at a time, final tree)

| Gate | Result |
|---|---|
| Baseline (before any change) | `npm test` 4042 passed, 3 expected fail, 8 skipped; `test:smoke` 149 passed |
| `npm run typecheck` | exit 0 |
| `npm test` | 174 files passed, 5 skipped; **4190 passed**, 3 expected fail, 8 skipped. The first run failed 2 tests: `test/server.test.ts` sent an OAuth fall-through request to `https://mcp.test`, which now gets `404`; the second failure was the first's un-restored `console.log` spy. The test now uses `https://raven.stellar.org`, and the rerun is green. |
| `npm run build` | exit 0 (the `prebuild` emitted-text guard ran). Upload 6833.38 KiB to 6918.33 KiB. |
| `npm run test:smoke` | 10 files, **173 passed** (149 before) |
| `npm run secrets:scan -- --tree` | clean, all tracked files |
| `workerd` copies | one: 1.20261117.1 |
| `npm audit`, paired | the committed lockfile before and after: 8 high, 0 other, identical advisory set. No new advisory. |
| `npm run mcp:surface` | **unchanged**: surface `815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07`, instructions `67a6bd0b57da…` |
| `dist/server.js` SHA-256 | before `01822c7b7277fc85874b506a4b3f2ed430484ada40d89b7671cea24b39b476f0`, after `1afc5293b761b9478aa4f956d6c9ef17bb15bc3313687d41fbc55d013ded32a0` |

The routing gate and `eval:selftest` were not run, as the plan says. No `test/live/` suite ran.

## Lockfile entries (only these changed)

`package.json`: `dependencies["@cloudflare/workers-oauth-provider"]` `^0.10.4` to `^1.2.4`.

`package-lock.json`, 8 changed lines in two entries:

1. `packages[""].dependencies["@cloudflare/workers-oauth-provider"]`: `^0.10.4` to `^1.2.4`.
2. `packages["node_modules/@cloudflare/workers-oauth-provider"]`: `version` 0.10.4 to 1.2.4,
   `resolved` to `…/workers-oauth-provider-1.2.4.tgz`, `integrity` to
   `sha512-ayo6Z8DBHdAxwDpplFU8BrEoxoSn6wNo+E7ypTENRHUOc8R89A8/+nZ+a8pMZjjXzF0JXfpYXhw/7qqG+DC18Q==`.

`npm install` printed its usual "3 packages have install scripts not yet covered by allowScripts"
notice (`core-js-pure`, `esbuild`, `workerd`). It is not new and changed nothing.

## Tests

Changed or new, all committed:

| File | Lane | Tests now | What it holds |
|---|---|---|---|
| `test/helpers/memory-kv.ts` (new) | Node | n/a | The KV fake: `put` options and key metadata, `list` with prefix, limit and cursor, recorded expiry |
| `test/oauth-origins.test.ts` (new) | Node | 85 | Real 1.2.4 provider per origin (3 production + loopback): metadata, root `404`, `401` challenge with `scope`, bare-origin `invalid_target`, grant binding with explicit and omitted `resource`, cross-origin `401` and `invalid_grant` with the grant usable at home, `onError` log shape; registration matrix (7 accepted, 7 refused); authorization for `claude:`, `cursor:`, `warp:` and loopback; mixed registrations (https plus `smb:`, `ms-settings:`, `ftp:`, `ws:`, period scheme) on both legs, PKCE-less GET and the error redirect; seeded legacy registrations; a CIMD client; code exchange with another `redirect_uri` (`invalid_grant`), a client without `authorization_code` (`unauthorized_client`), refresh implied by `authorization_code`, and registration renewal |
| `test/smoke/oauth-identity.test.ts` (new) | workerd | 5 | D4 pin through the real handler and tool wiring: props subject wins over a differing auth identity, no token or `ctx.auth` field in the execute context, and ownerless for absent, empty, non-string and wrongly named subjects. Only the sandbox runner is replaced. A mutation check (reading `ctx.auth.userId`) failed all 5. |
| `test/smoke/host-routing.test.ts` | workerd | 27 | Refactored into `completeOAuthFlow`; one-isolate tests through `SELF.fetch` (three orders, explicit and omitted `resource`, concurrent flows); `404` for six unserved origins across twelve routes, including `/playground/login`, with the `login:` key count unchanged; Host and forwarding headers ignored in both directions; root document `404`; `resource` always in token responses |
| `test/smoke/auth-redirects.test.ts` | workerd | 16 | Native callbacks accepted, refusals at registration, mixed registration refused on both legs |
| `test/auth.test.ts` | Node | 110 | Allowlist table, scheme token, registrable redirect, stub-level refusals on both legs, error redirect, PKCE-less GET, parked callback (refused: no WorkOS call, state consumed, cookie cleared; allowed: completes), log shape without the URI. The local `memoryKv` moved to the helper. |
| `test/hosts.test.ts` | Node | 24 | `selectOAuthOrigin`: three origins, loopback spellings and ports, 11 unserved forms |
| `test/server.test.ts` | Node | 85 | One origin changed (see the gates table) |

## Fresh-`env` fail and pass proof

The fix is `providerEnv(env)` in `src/server.ts`. I replaced its body with `return env;`, ran
`test/smoke/host-routing.test.ts`, then restored it from a saved copy (log in
`tmp/pr4-fresh-env-without-fix.log`).

| Run | Result |
|---|---|
| Fix removed | **4 failed**, 23 passed: "binds each grant to its own host's /mcp" for all three orders, and the concurrent flow. The first request on a second origin got `303` where consent (`200`) was expected, so helpers from the first origin were pinned on the shared `env`. |
| Fix restored | 27 passed |

This confirms that workerd shares one `env` object across requests in an isolate, which both design
reviews expected but had not verified. The suite then passed again in full.

## Migration harness (scratch, `tmp/pr4-migration/`, not committed)

Real 0.10.4 (the tarball, integrity checked against the old lockfile) writes the grants under
Raven's old options. Real 1.2.4 serves them under the real new `oauthProviderOptions`, one provider
per origin. The harness asserts DESIGN.md's predictions; 12 of 12 passed. Result rows are in
`tmp/pr4-migration/results.jsonl`.

| Stored class | Access on 1.2.4 | Refresh on 1.2.4 | Rollback to 0.10.4 (access / refresh) | 1.2.4 again |
|---|---|---|---|---|
| bound `raven.stellar.org/mcp` | 200 | 200 | 200 / 200 | 200 |
| bound `raven.stellar.buzz/mcp` | 200 | 200 | 200 / 200 | 200 |
| bound `agents.stellar.buzz/mcp` | 200 | 200 | 200 / 200 | 200 |
| absent `resource` | 200 | 200 | 200 / 200 | 200 |
| bare origin | **401** | **400 `invalid_grant`** | 200 / 200 (old tokens, nothing written by 1.2.4) | n/a |

Cross-host, for each bound class on each of the other two origins: access `401`, refresh `400`
`invalid_grant`. Afterwards the grant refreshed with `200` on its home origin.

Absent-resource refresh on the canonical origin:

| `resource` sent | Result |
|---|---|
| `https://raven.stellar.org/mcp` | 200 (binds the grant) |
| `https://raven.stellar.buzz/mcp` | 400 `invalid_target` |
| `https://raven.stellar.org` | 400 `invalid_target` |
| `https://raven.stellar.org/mcp/` | 400 `invalid_target` |

Accepted exception, reproduced: an old audience-free access token returned `200, 200, 200` on the
three origins before its grant was refreshed on `raven.stellar.buzz`, and `200, 200, 200` after. The
replacement token returned `401, 200, 401`. The grant's `resource` became
`https://raven.stellar.buzz/mcp`, and refreshing it on the canonical origin gave `invalid_grant`.

Also: a 0.10.4 grant has no KV key metadata, and a re-authorization under 1.2.4 still replaced it
(the old grant was revoked). A grant created wholly under 1.2.4 with a `claude:` callback served and
refreshed with `200` under 0.10.4.

**Discovery wire diff, 0.10.4 to 1.2.4** (one origin, Raven's options; `tmp/pr4-migration/wire-diff.md`):

| Document | Diff |
|---|---|
| authorization-server metadata | adds `protected_resources: ["https://raven.stellar.org/mcp"]` |
| protected-resource metadata `/mcp` | identical |
| protected-resource metadata, bare origin | `200` with `resource: <origin>` to `404` |
| `401` challenge, no token and bad token | identical |

I did not run `tmp/handshake`. It captures the MCP `initialize` handshake for the SDK upgrade. This
PR does not touch it, and the `mcp:surface` hashes did not move. CIMD `private_key_jwt` metadata
appears only in workerd with the compatibility flag; the plain-Node runs cannot show it.

## Local flow (one `npm run dev`, `hc` child `t1y1`, killed and removed afterwards)

The `lsof` pre-check found no `workerd` listener first. The driver is
`tmp/pr4-migration/local-flow.mjs`. It stops at the WorkOS redirect and never follows it. 0 of 30
rows failed.

| Registration | Result |
|---|---|
| https only; loopback only; https + loopback + `cursor:`; `claude:` only; `cursor:` only; `warp:` only; https + `smb:` | 201 |
| `smb:` only; `ms-settings:` only; `ftp:` only; `ws:` only; reverse-domain only; remote `http:` only; https + remote `http:` | 400 `invalid_client_metadata` |

| Authorization, then consent POST | Result |
|---|---|
| each of the seven registered classes, on its usable callback | consent `200`, POST `302` to `https://api.workos.com`, `redirect_uri` is the server's own `/callback`, state present |
| mixed registration, `smb:` callback: GET; POST; PKCE-less GET; error redirect (`response_type=token`) | `400` on all four, no `Location`, no cookie |
| `resource=<bare origin>` | `303` with `error=invalid_target` |
| `/.well-known/oauth-protected-resource` | `404`; `/mcp` document reports `<issuer>/mcp` |
| `/playground/login` | `302` to WorkOS |

Findings from the run:

- `wrangler dev` reports the request URL as `http://localhost` with no port, whichever loopback
  spelling the client used, so the issuer and WorkOS `redirect_uri` have no port. That is the
  existing behavior. `selectOAuthOrigin` accepts it, and my driver's first pass assumed a port.
- `[::1]` refused the connection: the dev server binds IPv4 loopback. The unit tests cover it.
- The loopback `/mcp` answered `406`, not `401`, because the dev bypass (`.dev.vars`) is on. The `401`
  challenge is covered by the plain-Node and smoke tests.
- The code exchange with a stubbed WorkOS completion cannot run on the dev server. The smoke
  `completeOAuthFlow` and the stub-level callback tests cover it.
- The log lines showed `redirect_refused:smb` (8), `oauth_error` `client-registration/callback_denied`
  (12) and `metadata_invalid` (2), and `auth_reject` `invalid_target` (2). No URI or description appeared.

## Public pages that state the client registration lifetime

**None.** I searched `src/site.ts`, `public/`, `docs/`, `README.md`, `SECURITY.md` and `PLAN.md`. Three
pages state a related, unchanged lifetime and need no edit:

- `/docs` (`src/site.ts` around lines 1371 and 1442): access tokens last 1 hour, grants run in a fixed
  90-day window.
- `/terms` section 9: names no OAuth client record.
- The privacy policy is not in this repo.

The only repository statements of the 365-day registration lifetime are `docs/operations.md`,
`src/auth/retention.ts` and `RETENTION.clientRegistrationSeconds`, all updated. The lead decides whether
any outside page needs a change. I edited no public legal or privacy page.

## Deviations and things to know

1. **Renewal applies only to registrations written by 1.x.** DESIGN D5 says registrations in use renew.
   1.2.4 renews only records stamped `registrationExpiresAt`; a record from 0.10.x "cannot be told from
   a permanent one, so it keeps its original schedule and re-registers once" (library comment, and a
   committed test). The docs say so. No client is signed out early by this.
2. **Log shape for a refused callback.** I used `reason: "redirect_refused:<scheme>"` on the existing
   `auth_reject` event instead of a new field, so the skill's `status` and `reason` field map still
   holds. The design left the shape open.
3. **`onError` event name** is `oauth_error`. The provider calls it for every error response, including
   an unauthenticated probe's `401`, so expect one line each; none carries request text.
4. **Extra edit.** I updated `.agents/skills/cloudflare-observability-review/SKILL.md`, which the plan
   did not list, because it names the auth log fields.
5. **Test layout.** The KV fake moved to `test/helpers/memory-kv.ts` so two files share it. One old test
   (`test/server.test.ts`) needed its origin changed, as the gates table says.
6. **Not exercised:** CIMD `private_key_jwt` in workerd, and any real WorkOS login. The CIMD contract
   test stubs the document in plain Node.
7. The 404 for an unserved origin comes after the API-key and dev-bypass paths, as the design says. An
   API-key request to an unserved origin still reaches `/mcp`. That is today's behavior.

## Files left for the lead

Scratch under `tmp/` (git-ignored, not committed): `tmp/pr4-migration/` (harness, wire diff, local-flow
driver and results, the 0.10.4 tarball), `tmp/pr4-fresh-env-without-fix.log`,
`tmp/pr4-audit-new.json`, `tmp/pr4-audit-base.json`, and the pre-change `package*.json` copies.

Before step 12, the reviewer reads the diff against `origin/main` (`fdd001a4`), not `HEAD`, because the
commit lands underneath it. The rollback target remains Worker version
`fe3708cb-4d35-4c53-a0e0-a27071e5e9c0`. The deploy note and post-deploy checks are in DESIGN.md.
