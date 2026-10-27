# 2026-10-27 issue batch

## Scope

The owner asked to work every clear and relevant open issue, with PRs, review, and merge.
Lanes run under Herdr. The orchestrator is Claude Opus 5.5. This round makes no paid model call.

| Issue | Decision |
|---|---|
| #296 npm audit findings | Lane D (Codex `gpt-6.1-sol` high): PR #300 |
| #295 sk-026 upstream-ready | Lane I (orchestrator): fixed upstream; residual successor `sk-029` |
| #293 sls-094 upstream-ready | Lane I (orchestrator): fixed upstream |
| #223 Live service drift | Not worked. The four stale goldens pass on `main` 72fbb2da. The Scout 1.9.71 hold waits on the general routing repair in `.agents/TODO.md` |
| #167 RWA exclusion | Not worked. It needs the same general routing repair |
| #294 Jev ranking proposal | Not worked. Paid ranking with an external data transfer is an owner decision |

## Ledger

- **Lane I, sk-026.** 2026-10-27T00:41Z: `errors/token-trustline-missing` and
  `errors/escrow-receiver-trustline-missing` each redirect once to a 200 grouped page. The skill
  at `80e2467f` keeps one literal URL, which now resolves. The first sweep read only 3 of the 8
  error groups. The review sweep covered all 211 documented pages: 207 resolve at the ungrouped
  path and 4 return 404 (3 `stellar-tx-deploy-*` codes and `generic-http/query-too-complex`).
  That residual is `sk-029`.
- **Lane I, sls-094.** 2026-10-27T00:41Z, Scout 1.9.111: `q=frieghter`, `freightr`, `soroswapp`,
  and `blendd` return `corrected` with the recovery label; controls `freighter` and `lobstr` return
  `strict`. The existing `CANDIDATE_MATCH_MODES` rule now attaches `unverified-match`, so the
  `didYouMean` TODO paragraph no longer needs an own-repo mechanism.
- **Lane D.** PR #300 merged as `3d0dee01`. `npm audit` reports 0. The `zod` MCP schema output is
  byte-identical across 4.4.3 and 4.6.7. Production deploy 2026-10-27T01:03Z: version
  `2cb4d28b-9877-41f3-bada-8cbaec042937` at 100%. `/mcp` returns 401 without a token, the
  protected-resource metadata returns 200, and an authenticated connector `search` returned hits.
- **Live lint.** `npm run improvements:lint -- --live` fails on `cs-002`: `soroswap/docs` and its
  issue 47 return 404. The failure is on `main` too. `.agents/TODO.md` tracks it.

## State table

| finding | trigger | upstream ref | ref state | PR checks/reviews/blocker | live re-check | repo action | next wake-up |
|---|---|---|---|---|---|---|---|
| `sk-026` | two ungrouped error URLs | Trustless-Work/trustlesswork-skill#16 | closed completed 2026-10-19 | n/a (site configuration, no PR) | fixed | retired 2026-10-27 | none |
| `sls-094` | `q=frieghter` reports `strict` | Stellar-Light/stellarlight#1829, PR #1831 | closed; merged `fe4f5da3` | merged, checks passed | fixed | retired 2026-10-27 | none |
| `sk-029` | 4 ungrouped error URLs return 404 | Trustless-Work/trustlesswork-skill#20 | open, filed 2026-10-27 | — | still-repro | `reported-upstream` | the filed issue's handoff |

## Reviews

- **PR #300.** Codex `gpt-6-astra` at high: APPROVE. It differs from the author (`gpt-6.1-sol`) and
  the orchestrator. One low finding, the reason for each override, was fixed in `de36d0ef`.
- **PR #301.** Claude Fable 5.1 at high: RETIRE `sk-026` and `sls-094`; REVISE `sk-029`. Fable is
  the matched tier for documentation and differs from the author and orchestrator (Claude Opus 5.5).
  It re-ran both triggers, confirmed deployment, swept 8 Scout search endpoints with typo queries
  (no `sls-094` residual), and checked the `providers.ts` claim. Its findings and their resolution:
  1. The `sk-029` sweep missed 5 groups and `query-too-complex`: rewritten to 4 codes; the
     orchestrator reproduced the 211 / 207 / 4 counts.
  2. `sk-029` called `sk-026` resolved too early: reworded.
  3. Wrong counts in `sk-026` and this ledger: corrected.
  4. The TODO said `sls-094` was resolved: reworded to "fixed upstream".
  5. Pre-existing `cs-002` live-lint failure: new TODO entry.
  6. Resolution comments and handoff closure: done after merge, recorded below.
  7. Missing state-table columns: added.

## Outcome

PR #301 merged as `6d796128`. The following URLs were read back from GitHub with `gh api`:

- `sk-029` filed: https://github.com/Trustless-Work/trustlesswork-skill/issues/20
- `sk-026` resolution comment, pinned to `6d796128`:
  https://github.com/Trustless-Work/trustlesswork-skill/issues/16#issuecomment-6431221485
- `sls-094` resolution comment, pinned to `6d796128`:
  https://github.com/Stellar-Light/stellarlight/issues/1829#issuecomment-6431221707
- Handoffs #295 and #293 were acknowledged and closed as completed.

`npm run improvements:resolve` then retired `sk-026` and `sls-094`. Their receipts in
`improvements/resolved.json` carry `sourceCommit` `6d796128`. #296 closed with PR #300.
