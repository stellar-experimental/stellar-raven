# Item 7.3, PR 4: design proposal for oauth-provider 1.x (approval needed)

Lead: Claude Opus 5.5, agentpc `t1x8`, 2026-11-18. Branch `np/7.3-deps-oauth` (records only, no code,
no PR yet). Proposal: [DESIGN.md](DESIGN.md), revision 2.1.

## Why this is a proposal and not a PR

Your note said to stop with a proposal if 1.x needs a design change. It does. A read-only check of
production `OAUTH_KV` (aggregates only; no key, ID or count is committed; the dumps were shredded)
shows two things the upgrade must handle:

1. **Grants are bound to three per-host resources**, plus some with no resource and fewer than 10
   (Devin CLI) on the bare origin. 1.x requires a canonical resource that matches stored grants, or
   it signs users out. Proposed fix (D1): one provider per served origin.
2. **Claude Code (`claude:`), Cursor (`cursor:`) and Warp (`warp:`) sign in through native-app
   callbacks.** 1.2 refuses those unless `allowPrivateUseRedirectUris: true`, which upstream advises
   MCP servers to leave off. Proposed fix (D2): enable the flag, and restrict callbacks at
   authorization to an allowlist: https, loopback http, `claude:`, `cursor:` and `warp:`.

   Today Raven admits any non-http scheme, which leaves OS protocol handlers open, so D2 also
   closes an existing gap.

## Reviews

| Reviewer | Verdict |
|---|---|
| Claude Fable (`t1xx`), design | Not ready as written: 2 blocking findings and 7 more; all reconciled |
| Codex frontier `gpt-6-astra` high (`t1xy`), security | Design FAIL as written: 1 blocker, 2 major, 1 minor, 3 notes; all reconciled |
| Codex re-check of revision 2 (`t1xz`) | **Design PASS.** Its 3 minor findings and 2 notes are folded into revision 2.1 |

**The blocker, found by both reviewers independently.** 1.2.4 stores its helpers on the shared
`env`. With per-host providers, the first host an isolate serves would pin its helpers, and sign-in
on the other hosts would fail or bind to the wrong host. The fix is a fresh request-local `env` per
dispatch, plus a smoke test that fails without it.

**Rollback is safe; both reviewers ran it.** 0.10.4 reads and refreshes grants and tokens that 1.2.4
wrote. One limit: a CIMD client that starts using `private_key_jwt` under 1.x stops working after a
rollback. The rollback target is the Worker version `fe3708cb` (from `abd68c63`, oauth-provider
0.10.4). Please confirm that version ID.

## Questions for the owner (the lead recommends yes to all)

1. **D1, Devin CLI.** Fewer than 10 Devin CLI sessions are bound to the bare origin and stop working
   at the deploy. Accept it?
   - 1.x no longer serves the root protected-resource document those sessions came from.
   - If Devin CLI follows the 401 challenge, it signs in again once. If it re-derives the bare origin,
     it cannot sign in to `raven.stellar.org` until Devin changes it.
   - Aliasing the root document would break strict RFC 9728 clients.
2. **D2, the flag.** Keep native-app callbacks (`allowPrivateUseRedirectUris: true`) against
   upstream's MCP advice, because Claude Code, Cursor and Warp use them?
3. **D2, the allowlist.** Restrict callbacks to https, loopback http and the named schemes `claude:`,
   `cursor:` and `warp:`?
   - Cost: a future native client whose only callback is an unlisted scheme fails until its scheme
     is added. Refused schemes are logged as bounded tokens.

## After approval

The lead writes the execution plan from DESIGN.md. Sonnet executes it, with:
- unit, smoke and migration-harness tests;
- the local DCR and OAuth flow with the real redirect classes;
- a Codex frontier security review of the diff.

**Deploy note for later:** not model-facing. After the deploy:
- check the OAuth metadata and 401 on all three hosts;
- check a Claude connector `execute`;
- check a Claude Code sign-in (`claude:`), plus Cursor and Devin CLI if possible;
- watch the `onError` internal reasons.

## Side checks you asked for

- `scripts/usage-report.mjs` on `wrangler` 4.164.0: exit 0, with the expected JSON
  (`source: production`). It is read-only D1 and needs no secret. The counts were not kept.
- `scripts/mcp-key.mjs` stays unchecked. It writes API keys, so it is not a read-only check.
