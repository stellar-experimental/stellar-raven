# Legacy MCP host restoration — 2026-11-06

## Result and scope

Restored the MCP/OAuth route policy for `raven.stellar.buzz` and `agents.stellar.buzz`.
The owner explicitly reversed the preceding all-path redirect requirement. This change restores
the policy present in `a44aaa4c` (retained through `fec1c79f`) while preserving the safe redirect
construction added in `a73e0b25`: set `target.pathname` and `target.search` on a canonical URL,
so a path beginning `//` cannot change the redirect host.

- `/mcp`, its descendants, and `/.well-known/` stay on the requested alias.
- Exact `/register`, `/authorize`, `/callback`, and `/token` stay on the alias for both request
  methods where supported. The existing provider and WorkOS handlers still own these routes.
- Browser pages continue to redirect with 308, preserving the path and query.
- Discovery, protected resources, consent cookies, WorkOS callback URLs, authorization response
  issuers, and token requests retain the origin originally configured by the client.
- No provider configuration, grant storage, secret, issuer, lifetime, or refresh-token format
  migration was introduced. Existing `OAUTH_KV` grants remain usable on their original host.
- README, architecture, public connection guidance, and Wrangler route comments describe the
  restored support. Wrangler custom-domain definitions are unchanged.

Files changed: `src/hosts.ts`, `src/server.ts`, `test/hosts.test.ts`,
`test/smoke/server.test.ts`, new `test/smoke/host-routing.test.ts`, `README.md`,
`ARCHITECTURE.md`, `src/site.ts`, `wrangler.jsonc`, and this report. The actual existing alias
smoke tests were in `test/smoke/server.test.ts`; they were moved and expanded into the requested
focused host-routing file. Unrelated round notes and audit files were left untouched.

## Live observations

Read-only probes on 2026-11-06 around 13:54–13:59 UTC:

| Host | Result |
| --- | --- |
| `raven.stellar.buzz` | Resolves; `/mcp`, authorization-server and protected-resource discovery, `/authorize`, `/callback`, `/token`, and `/register` each returned 308 to the corresponding canonical path. |
| `agents.stellar.buzz` | Same resolving host and all-path 308 behavior. |
| `agent.stellar.buzz` | Not live: system resolver failed and `dig @1.1.1.1 agent.stellar.buzz A` returned authoritative-zone NXDOMAIN, with no answer. |

The coordinator separately confirmed via an authenticated Cloudflare read that exactly the two
plural/custom hosts above are assigned to this Worker, and recorded
`tmp/sweep-2026-11-06/domains.json`. No singular hostname was added to the application or config.
Initial Python urllib probes received Cloudflare 403/1010; normal curl requests reached the
application and established the 308 behavior. The 403s are not evidence about application routing.

These observations describe the deployed version before restoration. This lane did not deploy,
mutate Cloudflare, exercise real user refresh credentials, or change production data.

## Verification

All commands ran in owned `hc` command terminals. No Wrangler dev server was started. The smoke
suite uses its configured isolated workerd pool with remote bindings disabled.

- `npm run typecheck`: passed.
- Focused units (`hosts`, `auth`, `server`, `html`, `consent-page`): passed.
- Full `npm test`: **145 files passed; 3,134 tests passed, 3 expected failures**.
- `npm run build`: passed, Wrangler dry-run only; generated tracked outputs unchanged.
- `npm run test:smoke -- test/smoke/host-routing.test.ts test/smoke/server.test.ts test/smoke/auth-redirects.test.ts`:
  **3 files, 48 tests passed**.
- `git diff --check`: passed.

The new smoke file verifies both literal alias hosts independently of the implementation's set:
same-origin challenge/discovery, canonical browser redirects, the double-slash redirect guard,
named API-key authentication, and a full new OAuth flow on all three production origins. Only
the WorkOS authentication upstream is stubbed; registration, consent, CSRF cookies, parked login
state, provider code exchange, and authenticated MCP initialization run through the real worker.
Test-only secrets are explicitly injected, independent of `.dev.vars`.

For existing clients, tests first create clients and grants through the unchanged provider
directly, without using the restored router. Both grants with an explicit alias resource and
older grants without a resource then use their original bearer on the assembled worker, refresh
on the alias, and initialize MCP with the rotated access token. Refresh tokens rotate and the
existing grant expiry remains unchanged. The fixture shortens the original expiry by one day,
so a regression that resets the lifetime cannot pass because requests share the same second.

The first typecheck found two test-only type mismatches (provider-injected environment field and
synthetic incoming Request); these were corrected before the passing runs. Non-failing smoke
output includes the existing `@workflow/serde` missing-source sourcemap warning.

Final baseline terminal: `t2sd`; full output saved to the ignored
`tmp/sweep-2026-11-06/alias-baseline.log` before terminal cleanup. Earlier owned terminals were
`t2s6` and `t2sb`. No unrelated terminals were controlled or removed.

No nested agents, commit/push, or GitHub comments were used. Independent review and deployment
remain with the coordinating lane. The prepared coordinator live-host-check script was read;
no obvious issue was found in its same-origin metadata and authenticated MCP checks. It was not
executed by this lane.
