# Item 4.1 record: client diagnostic on GPT-6.1 Terra, Grok 4.7 and OpenCode

Counts only: tuning ids and numbers, no question, golden or lost-candidate text. Raw transcripts, tap
logs and client homes stay under `tmp/4.1/` (git-ignored). Plan: [PLAN.md](PLAN.md). Executor log:
[EXEC.md](EXEC.md). Counts files: [`summary-codex.json`](summary-codex.json),
[`summary-grok.json`](summary-grok.json). One pass, no judge, no repeat, no score comparison.

## Setup

| | Codex | Grok | OpenCode |
|---|---|---|---|
| CLI | Codex `0.167.0` | Grok `1.0.77` | v2.2.7, not run on agentpc (Mac lane, [brief](briefs/opencode-mac.md)) |
| Model | `gpt-6.1-terra` | `grok-4.7` (log shows `grok-4.7-build`) | `claude-sonnet-5-5` |
| Effort | `low` (catalog default) | `high` (catalog default) | provider default |
| Login | ChatGPT (`plan_type` pro) | xAI OIDC | Anthropic OAuth, Mac: invalid (401) |
| Rows | 24 of 24 | 20 of 24 (cap stop) | 0: dropped out at the smoke |

Efforts differ by client (their catalog defaults). No comparison between clients is drawn.

- Rows: the 24 lowest `sha256("np-4.1|" + id)` of the 88 tuning ids of split v7 (SHA-256
  `d5e56748dfdf2ce9…`), the same ids for every client ([`rows.json`](rows.json)).
- Server: detached worktree at `c8cfb437`, `npm run dev:eval -- --port 8941`, one tap per client in front.
  Item branch revision of the scripts: the commit that carries this file.
- Prompt: `agentPrompt` of `eval/qa/run-qa.mjs` (search-execute) with the tool names written as the `raven`
  MCP server's `search` and `execute` and the last rule reworded (plan step 3). Head SHA-256 `0a86ad0293898a67…`.
- Script hashes (SHA-256, first 12): `mcp-tap.mjs` a618c2c915e9, `run-client.mjs` 7ff4628a6626,
  `client-parse.mjs` b037cff2b3a8, `read-behaviours.mjs` ebf35d61aec5, `candidates.mjs` b7b3140911c0,
  `select-rows.mjs` 858a1198e2fb, `prices.json` a9d33b36e817, `rows.json` ce418ad4fd28.
- Prices, read 2026-11-17 ([`prices.json`](prices.json)): Terra $1 / $0.05 cached / $5 per 1M tokens
  (<https://developers.openai.com/api/docs/models/gpt-6.1-terra>); Grok 4.7 $2 / $0.50 / $6
  (<https://docs.x.ai/developers/pricing>); Sonnet 5.5 $2 / $0.10 / $10, cache write $2.50
  (<https://platform.claude.com/docs/en/models/sonnet-5-5/overview>).

## Spend

| | Codex | Grok |
|---|---|---|
| Rows run | 24 | 20 (cap stop before the 21st) |
| Smoke (two attempts) | $0.016 | $0.058 |
| Rows, list price | $0.744 | $7.663 |
| Total counted against the cap | $0.760 | $7.721 |
| Largest row | $0.054 | $0.935 |
| Tokens (input, cached, output) | 2,360,712 incl. 1,794,176 cached, 17,557 | 1,835,157, 5,040,896 cache read, 245,395 |
| Wall time | 10.2 min | 59.2 min |

Grok's own CLI figure sums to $2.605 over the 20 rows; the cap used the larger list-price figure, as the
plan says. Every identity held (`total = input + output` on Codex; `total = input + cache_read +
cache_creation + output` on Grok), every login symlink was intact after the smoke and after every row,
no row was killed, every exit was 0. All spend is subscription-equivalent; no API key was used.

## The four behaviours

| | Codex (24 rows) | Grok (20 rows) |
|---|---|---|
| B1 reaches the descriptions: full / partial / none | 9 / 2 / 13 | 20 / 0 / 0 |
| B1 instructions reached | 11 | 20 |
| B2 `search` calls / with `limit` | 38 / 4 (4 rows; values 10, 10, 10, 20) | 167 / 167 (20 rows; values 3 to 20) |
| B3 clip events / rows with one | 0 / 0 | 61 / 17 |
| B3 paired to a tap result | 0 | 61 of 61 |
| B3 golden candidates (rows total) | 42 | 30 |
| B3 candidates in a lost region | 0 | 29 |
| B3 of those, delivered elsewhere in the row | 0 | 29 |
| B3 lost cited facts (needed / incidental) | 0 / 0 | 0 / 0 |
| B3 spill-file reads | n/a | 2 |
| B4 HTTP / JSON-RPC errors | 0 / 0 | 0 / 0 |
| B4 `isError` results | 3 (3 rows) | 1 (1 row, an `Execution failed`) |
| B4 refused approvals, web, non-`raven` calls, sub-agent use | 0, 0, 0, 0 | 0, 0, 0, 0 |
| B4 rows with no final answer, killed, non-zero exit | 0, 0, 0 | 0, 0, 0 |
| Contaminated rows (a non-spill local read) | 0 | 0 |

What each number means here:

- **B1.** Codex defers every MCP tool behind its `exec` tool. In 13 of 24 rows the model never printed the
  descriptions: it saw only the catalogue line (the first sentence of the server instructions) and called
  `search` and `execute` from that. In 9 rows it printed `ALL_TOOLS` and saw both descriptions whole. In the three
  rows with an `isError` result (all Codex's), `execute` failed input validation: no `code` argument was sent. Grok showed the whole descriptions and the instructions in all 20 rows.
- **B2.** Grok passed a `limit` on every `search` call. Codex passed one on 4 of 38.
- **B3, Codex.** The 10,000-token exec budget never cut a Raven result: the largest printed output is 36,019
  characters and no `tokens truncated` marker appears. No event, so nothing to check.
- **B3, Grok.** Every one of the 61 events is a 20,000-byte head clip (`showing first 19.5 KB`); the delivered text
  equals the first 20,000 bytes of the tap result's `content[0].text` in all 61 events, which is the pairing test.
  All 29 golden candidates that sit in a lost region also appear in a text the model received elsewhere in that
  row, so none is lost. Only 2 spill-file reads happened: Grok's clip notice tells the model to use `bash`, and
  this lane gave it `read_file`, `grep` and `list_dir` only. The models recovered by running more `execute` calls
  (5.8 per row on Grok, 2.3 on Codex). The golden carries few extractable candidates (30 over the 20 rows; 42 over
  the 24 Codex rows), so this reads loss through the method's candidate rule, not every fact in a key-fact sentence.
- **Grok cost.** The clip is not free in spend: Grok ran about 155 s and $0.38 per row at list price (median wall
  time) against Codex's 25 s and $0.03.

Per row (`B1 class`; `search calls/with limit`; clip events; error count; wall seconds). The error
count sums the row's `isError` results, `Execution failed` results and client-reported errors, so one
failure can count more than once (Grok's first row: one failed `execute`, counted 3 times):

| Row | Codex B1 | search/limit | clips | err | s | Grok B1 | search/limit | clips | err | s |
|---|---|---|---|---|---|---|---|---|---|---|
| `q-ti-enumerate-holders-airdrop` | none | 2/0 | 0 | 0 | 52 | full | 15/15 | 3 | 3 | 431 |
| `q-pc-sponsored-reserves` | none | 2/0 | 0 | 0 | 35 | full | 7/7 | 4 | 0 | 153 |
| `q-protocol-validator-node-roles` | none | 1/0 | 0 | 0 | 24 | full | 3/3 | 0 | 0 | 52 |
| `q-protocol-accounts-signers-thresholds` | none | 1/0 | 0 | 1 | 23 | full | 3/3 | 1 | 0 | 99 |
| `q-edge-inject-ignore-instructions` | full | 1/0 | 0 | 0 | 13 | full | 3/3 | 2 | 0 | 50 |
| `q-scf-instawards` | none | 1/0 | 0 | 0 | 27 | full | 12/12 | 3 | 0 | 206 |
| `q-tool-js-sdk-package` | full | 1/0 | 0 | 0 | 13 | full | 3/3 | 0 | 0 | 37 |
| `q-sep-43-web-wallet-api` | none | 2/1 | 0 | 0 | 14 | full | 8/8 | 4 | 0 | 131 |
| `q-edge-oos-solana-vs-aptos` | full | 2/0 | 0 | 0 | 13 | full | 4/4 | 0 | 0 | 51 |
| `q-sor-deploy-invoke-from-js-sdk` | none | 1/0 | 0 | 1 | 48 | full | 5/5 | 9 | 0 | 295 |
| `q-pc-sequence-numbers-ordering-replace` | full | 1/0 | 0 | 0 | 23 | full | 4/4 | 3 | 0 | 252 |
| `q-n3-issues-842-backup-faucet-wallet` | full | 2/0 | 0 | 0 | 14 | full | 13/13 | 2 | 0 | 141 |
| `q-smart-wallet-fee-sponsorship` | partial | 1/0 | 0 | 0 | 22 | full | 8/8 | 5 | 0 | 156 |
| `q-hist-quantum-preparedness-plan` | none | 1/0 | 0 | 0 | 21 | full | 13/13 | 1 | 0 | 134 |
| `q-zk-host-functions-status` | full | 2/1 | 0 | 0 | 29 | full | 9/9 | 3 | 0 | 331 |
| `q-comp-sep8-regulated-assets-approval-server` | partial | 1/0 | 0 | 0 | 18 | full | 12/12 | 5 | 0 | 168 |
| `q-edge-asset-site-scam-detection` | none | 1/0 | 0 | 1 | 29 | full | 14/14 | 4 | 0 | 250 |
| `q-tool-cli-skills-discovery` | none | 2/0 | 0 | 0 | 34 | full | 7/7 | 2 | 0 | 171 |
| `q-raph-phishing-pending-claim` | none | 1/0 | 0 | 0 | 13 | full | 11/11 | 3 | 0 | 125 |
| `q-smart-account-scoped-policy-signers` | full | 2/1 | 0 | 0 | 28 | full | 13/13 | 7 | 0 | 322 |
| `q-asset-usdt0-layerzero-oft` | full | 3/0 | 0 | 0 | 26 | not run | | | | |
| `q-ti-classic-submission-errors` | none | 1/0 | 0 | 0 | 37 | not run | | | | |
| `q-infra-which-indexer` | full | 4/0 | 0 | 0 | 28 | not run | | | | |
| `q-defi-agentic-payment-standards-compare` | none | 2/1 | 0 | 0 | 26 | not run | | | | |

## Decisions

- **M2 (Grok clip), by the fixed rule.** Grok logged 61 paired clip events on 17 rows (at least 5 on at least 3).
  No uncontaminated row has a lost cited fact that a key fact depends on (0 flagged, so no hand read was needed).
  Grok **costs no answer** on this pass, and M2 closes by its done-when ("item 4.1 shows the clip costs no Grok
  answer"). The rule counts events whether or not the row's golden yields a candidate; 7 of the 17
  clipped rows yield none, so the instrument cannot see a loss there. On the 10 clipped rows that do
  yield one, Grok still logged 36 events, so the rule's threshold holds on the rows it can see (lead
  check). Limits to read with it: 20 of 24 rows (cap stop), 30 golden candidates, one pass, the model recovered by
  re-querying, and the recovery cost spend and time. A bound under the clip would save that spend; it is not needed
  to protect an answer.
- **Runner rule.** No behaviour failed in a way a code change would fix and a before-and-after measurement would
  need. The record keeps the hand-run lanes, and the TODO item "Add a runner for Codex and Grok" closes by its
  recorded-decision branch. OpenCode dropped out (below), so no OpenCode reading stands behind it.
- **Defects for the TODO, none fixed here.** (1) Codex reaches the full descriptions in 9 of 24 rows only and
  omitted `execute`'s `code` argument in 3; the first sentence of the instructions is all most Codex runs see.
  (2) Grok's `search` calls carry a `limit` every time, Codex's almost never, so what seven cards do for Codex is
  decided by the default. (3) Grok clips 61 results at 20,000 bytes, with no answer loss but real spend.
  (4) Grok speaks the 2026-07-28 protocol (`server/discover` instead of `initialize`); the server answered it with 200.

## OpenCode

**Excluded in this round.** The Mac's Anthropic OAuth login in OpenCode is invalid (HTTP 401). It can
rejoin after the owner logs in again and the smoke passes. Nothing was worked around. The orchestrator
ran the Mac lane ([`briefs/opencode-mac.md`](briefs/opencode-mac.md)) on 2026-11-17:

- **Versions.** OpenCode v2.2.7 and Node v24.13.0. The server worktree was at `c8cfb437`, the same
  server revision as the agentpc lanes. The item branch checkout was at `6cfe7d1f`.
- **Environment.** No `ANTHROPIC_*`, `OPENAI_*`, `XAI_*` or `OPENROUTER_*` variable was set. The
  `anthropic` entry of `auth.json` has type `oauth`.
- **Smoke.** The driver exited 0. OpenCode exited 1 after 1.3 s at its first model call. The stdout
  event was `provider.auth` with HTTP 401, Anthropic `authentication_error` "OAuth access token is
  invalid."
  - The stored access token expired on 2026-01-30, and the login file was last written on
    2026-09-01, so OpenCode had not refreshed it.
  - There was no usage and no answer. The login symlink stayed intact.
- **MCP side.** It worked. The tap logged `initialize` 200, `notifications/initialized` 202 and
  `tools/list` 200. No `tools/call` was made, because the model never ran.
- **Spend.** USD 0. The ledger holds the smoke only, with no tokens. The claude.ai usage page was the
  same before and after the smoke: weekly 25% used, usage credits $0, monthly spend $0.00.
- **Reader.** Not run, because `opencode.db` holds no assistant message. The reader's OpenCode path
  is still untested on a real transcript.
