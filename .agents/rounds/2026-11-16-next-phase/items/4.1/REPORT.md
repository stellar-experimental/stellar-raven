# Item 4.1 report to the orchestrator

Lead: Claude Opus 5.5, agentpc `t1sy`. Pull request:
[#466](https://github.com/stellar-experimental/stellar-raven/pull/466), branch
`np/4.1-client-diagnostic`. Not merged, not deployed.

## Result

One pass of 24 split-v7 tuning rows, no judge, no repeat, against a local `dev:eval` at `c8cfb437`
behind a logging tap. Each client was isolated: `raven` was its only MCP server, web search was off,
and it ran with a private home, an empty `HOME` and an environment allowlist.

| | Codex GPT-6.1 Terra (`low`) | Grok 4.7 (`high`) |
|---|---|---|
| Rows | 24 of 24 | 20 of 24, cap stop |
| Spend, list-price equivalent | USD 0.76 | USD 7.72 (Grok's own figure USD 2.61) |
| B1 descriptions reached, full / partial / none | 9 / 2 / 13 | 20 / 0 / 0 |
| B2 `search` with `limit` | 4 of 38 calls | 167 of 167 |
| B3 clip events / rows; lost cited facts | 0 / 0; 0 | 61 / 17; 0 |
| B4 errors | no HTTP/RPC error; 3 `execute` calls without `code` | no HTTP/RPC error; 1 `Execution failed` |

- **M2 closes** by its fixed rule. All 29 golden candidates that fell in a clipped region reached
  the model in another result of the same row, because Grok re-queries. The threshold also holds on
  the 10 clipped rows the golden can see, with 36 events. I checked that myself and added it to the
  record. The clip costs time and spend, not answers.
- **The runner TODO item** is reduced to "Return the OpenCode lane": the hand-run lanes stay for
  Codex and Grok.
- **New client findings** are in the TODO's client-gap item:
  - Codex usually works from the catalogue line alone.
  - Codex sometimes omits `execute.code`.
  - Codex rarely passes `limit`.
- Plan review: Fable 5.2, high, 15 findings, all adopted. Gates pass bare: `typecheck`, `test`,
  `build`, `secrets:scan --tree`.
- Spend: subscription logins only. No API key, Gateway, Workers AI or OpenRouter.

## Deploy

Not needed: no Worker bytes change.

## For you on the Mac

1. **Run the OpenCode lane** with
   [briefs/opencode-mac.md](briefs/opencode-mac.md), using the scripts on the branch.
   - It starts with a login smoke run. Read the Anthropic usage page before and after the smoke. If
     anything fails, OpenCode drops out.
   - The cap is USD 8 at Sonnet 5.5 list price.
   - The reader's OpenCode path has never seen a real `opencode.db`. If the smoke shows a reader
     fault, send me the exact error and I will fix it.
2. **Return `summary-opencode.json`** and the two revisions to me (`hc send`) or commit it to the
   branch. I will fold it into RECORD.md and close the TODO item.
3. If you would rather merge without OpenCode, the record and TODO already say the lane is pending.

## Open questions for the owner

None blocking. One judgement to see: M2 closes on a thin instrument (one pass, 20 Grok rows, 30
golden candidates, and 7 of the 17 clipped rows have none). The rule was fixed before the run and is
met. Reopen M2 if a production Grok answer is found missing a fact that its own clipped result held.

## Housekeeping

- Children `t1sz` (Fable review) and `t1t0` (Sonnet executor) are killed and removed.
- The server worktree `np-4.1-server` is removed.
- The item worktree `/home/tyler/code/raven-wt/np-4.1` stays for fixes.
- Raw transcripts are in its git-ignored `tmp/4.1/`.

## Addendum: the OpenCode lane

The orchestrator's Mac return was folded in on 2026-11-17. OpenCode dropped out at the smoke: the
Anthropic OAuth login in OpenCode is invalid (401) at the first model call, after an MCP handshake
that worked. It cost USD 0, and no rows ran.

- `RECORD.md` "OpenCode" holds the evidence.
- The TODO item is now "Run the OpenCode lane of round item 4.1 after a re-login (owner)". Rejoining
  needs an owner re-login and a new spend authorization.
- The ledger row is updated.
- Gates were re-run bare on the change: `npm test` and `npm run secrets:scan -- --tree`.
