# Item 7.3, PR 4 report: oauth-provider 1.2.4

Lead: Claude Opus 5.5, agentpc `t1x8`, 2026-11-18.

## Pull request and result

[#484](https://github.com/stellar-experimental/stellar-raven/pull/484), branch `np/7.3-deps-oauth`, on
`origin/main` `fdd001a4`, five commits. **Squash-merge**, and do not rebase.

It implements the approved [DESIGN.md](DESIGN.md) revision 2.1:

- **D1, one provider per origin.**
  - Selection uses the request URL's origin only.
  - An unknown origin gets a 404.
  - Every dispatch gets a fresh `env` with `OAUTH_PROVIDER` cleared.
- **D2, native callbacks.**
  - `allowPrivateUseRedirectUris: true`, with the reason in code.
  - Raven's allowlist admits only https, loopback http, `claude:`, `cursor:` and `warp:`.
  - It is enforced on both `/authorize` legs, the error redirect and the parked `/callback`.
  - Registration needs at least one allowlisted URI.
- **D3:**
  - `requiredScopes` replaces `scopes_supported`;
  - `allowPlainPKCE` is removed;
  - `onError` logs category and reason only.
- **D4:** identity stays on `ctx.props`.
- **Devin CLI:** the TODO item for the post-deploy re-check is added, as you asked. The acceptance is
  stated in the PR body.

## Evidence

- **Fresh-`env` smoke test.** It fails 4 of 27 without the fix. Codex reproduced that.
- **Migration harness,** with the real 0.10.4 and 1.2.4 packages: 12 of 12. Bound and absent
  grants: 200. Bare origin: 401 / `invalid_grant`. Cross-host: refused. Rollback: 200.
- **Local DCR and authorize flow:** 30 of 30.
- **Not model-facing:** `mcp:surface` is unchanged.
- **Tests:** 4190 unit, 173 smoke.
- **Gates:** green locally on Node 26.
- **Reviews:**
  - Fable design review;
  - Codex design read (FAIL as written), then its re-check (PASS);
  - Codex frontier `gpt-6-astra` high diff security review: **PASS**, with 3 minor documentation
    findings, fixed.

USD 0.

## Deploy

**Needed.** This is the auth boundary, and Worker bytes change.

After the deploy:

1. On all three hosts, check that `/.well-known/oauth-protected-resource/mcp` reports
   `<origin>/mcp`, that `/mcp` answers 401 with `resource_metadata` pointing there, and that the root
   protected-resource document answers 404.
2. Run a Claude connector `execute`. Existing sessions should keep working without signing in again.
3. If you can: sign in with Claude Code (`claude:` callback), Cursor and Devin CLI.
4. In Workers Logs, watch the `oauth_error` reasons. `grant_audience_unbound` and
   `token_audience_unbound` should appear only for the bare-origin class. Also watch for
   `legacy_grant_resource_mismatch` or `resource_not_configured`, and for any `auth_reject`
   `redirect_refused:*`. A new native client's scheme would show up there.
5. **Rollback:** Worker version `fe3708cb-4d35-4c53-a0e0-a27071e5e9c0`. It is storage-compatible.
   One limit: a CIMD `private_key_jwt` client that started under 1.x stops working after a rollback.

## Notes

- `scripts/usage-report.mjs` works read-only on `wrangler` 4.164.0. `scripts/mcp-key.mjs` is
  unchecked; it writes API keys.
- An API-key request to an unserved origin still reaches `/mcp`, as today. Only the three hosts
  route to the Worker.
- Registration renewal applies only to records written by 1.x. Older registrations keep their
  original expiry and re-register once.

## Next

PR 5, `vitest` 5. It is approved and starts from the new `origin/main` after this merges.

## Open questions for the owner

None.
