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
  at `80e2467f` keeps one literal URL, which now resolves. A sweep of all 145 grouped pages found
  3 `stellar-tx-deploy-*` codes with a 404 at the ungrouped path. That residual is `sk-029`.
- **Lane I, sls-094.** 2026-10-27T00:41Z, Scout 1.9.111: `q=frieghter`, `freightr`, `soroswapp`,
  and `blendd` return `corrected` with the recovery label; controls `freighter` and `lobstr` return
  `strict`. The existing `CANDIDATE_MATCH_MODES` rule now attaches `unverified-match`, so the
  `didYouMean` TODO paragraph no longer needs an own-repo mechanism.
- **Lane D.** See PR #300. `npm audit` reports 0. The `zod` MCP schema output is byte-identical
  across 4.4.3 and 4.6.7.

## State table

| finding | trigger | upstream ref | ref state | live re-check | repo action |
|---|---|---|---|---|---|
| `sk-026` | two ungrouped error URLs | Trustless-Work/trustlesswork-skill#16 | closed completed 2026-10-19 | fixed | `fixed-upstream`; retire after review |
| `sls-094` | `q=frieghter` reports `strict` | Stellar-Light/stellarlight#1829, PR #1831 | closed; merged `fe4f5da3` | fixed | `fixed-upstream`; retire after review |
| `sk-029` | 3 deploy codes 404 | none yet | — | still-repro | `verified`; file after review |

## Reviews

Pending.
