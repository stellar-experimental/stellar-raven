# Item 4.1 executor log

Executor: Claude Sonnet 5.5 (high), agentpc `t1t0`, lead `t1sy`. Branch `np/4.1-client-diagnostic`.
The numbers are in [RECORD.md](RECORD.md); this file is what was done and where it left the plan.

## Steps

1. **Rows.** `select-rows.mjs` read `sets.tuning` of the split only, asserted the SHA-256 and wrote
   [`rows.json`](rows.json) (24 ids by `sha256("np-4.1|" + id)`). Every later script selects cases with
   `selectById` first.
2. **Server.** Worktree `/home/tyler/code/raven-wt/np-4.1-server`, detached at `c8cfb437`, `npm ci` as an `hc`
   child, `.dev.vars` copied mode 600, `npm run dev:eval -- --port 8941` as `hc` child `4.1-server`. Readiness:
   the `initialize` POST returned 200 directly and through the tap. The server child and both taps were killed and
   removed; the server worktree is left for the lead to remove.
3. **Tap and isolation.** `mcp-tap.mjs` (ports 8952 Codex, 8953 Grok) and `run-client.mjs`. Per row: fresh empty work
   directory under `/home/tyler/.cache/raven-4.1/work/<client>/<id>` (asserted outside every git repository), a
   private client home, an empty `HOME`, symlinked login files, an environment allowlist (`PATH`, `LANG`, `TERM`,
   `HOME` and the client's home variable), stdin closed, SIGTERM at 12 minutes and SIGKILL 15 seconds later.
   Before the smoke `CODEX_HOME=<private> codex login status` said "Logged in using ChatGPT" and the private Grok
   `config.toml` held the `raven` server only (see deviation 2).
4. **Smoke.** Two attempts per client, both counted against the cap.
   - Attempt 1 found two harness faults, both about the plan's "no skill listed" assertion: Codex listed its
     bundled system skills, and Grok listed its bundled skills and a bundled workflow. Fixed in the driver
     (deviation 1 and 2); no row had run.
   - Attempt 2, Codex: exit 0; the log shows the `raven` server only, no web search tool, no skills, no
     `AGENTS.md` or `CLAUDE.md` content; the tap shows `initialize`, `notifications/initialized`, `tools/list` and one
     `tools/call search`; the answer names two ids the tap returned; usage parsed and
     `total_tokens = input + output` held (rollout `token_count`). B1 on the smoke log: `partial`.
   - Attempt 2, Grok: exit 0; built-in tools only (`read_file`, `list_dir`, `grep`, `search_tool`, `use_tool`) plus
     `raven__search` and `raven__execute`; no skills, no workflow, no project rules; the tap shows `server/discover`,
     `tools/list` and one `tools/call search` (Grok speaks the 2026-07-28 protocol and sends no `initialize`);
     the answer names two returned ids; the identity `total = input + cache_read + cache_creation + output` held. B1:
     `full`.
5. **Run.** `run-client.mjs` as `hc` children `4.1-run-codex` and `4.1-run-grok`, in parallel, rows in `rows.json`
   order, each attempted once. Codex finished all 24 rows. Grok stopped by the cap rule after 20 rows: "spent 7.7206 +
   1.5 x largest 0.9347 would pass 8". No row failed, none was killed, every exit was 0, every login stayed a
   symlink after the smoke and after every row.
6. **Behaviours.** `read-behaviours.mjs` read both clients; the committed counts are
   [`summary-codex.json`](summary-codex.json) and [`summary-grok.json`](summary-grok.json). Hand check, three rows
   per client:
   - Codex: `q-edge-inject-ignore-instructions` (the model printed `ALL_TOOLS`: `full`),
     `q-ti-enumerate-holders-airdrop` (never printed the descriptions: `none`) and
     `q-protocol-accounts-signers-thresholds` (an `isError` result: the tap shows the validation error). I read each
     rollout's calls and outputs; every class and count matched.
   - Grok: `q-ti-enumerate-holders-airdrop` (3 events), `q-pc-sponsored-reserves` (4),
     `q-protocol-accounts-signers-thresholds` (1). An independent script recomputed each pairing: the delivered text is
     the first 20,000 bytes of one tap result, and the marker's "19.5 KB of N KB" agrees with the tap length. 8 of 8
     events matched the reader.
   No disagreement, so the reader was not changed after the check (it changed earlier, while the rows ran, to
   split "covered elsewhere" from "recovered by a spill read").
7. **OpenCode lane.** [`briefs/opencode-mac.md`](briefs/opencode-mac.md), plus the same driver with
   `--client opencode`. The private `opencode.json` was resolved on agentpc with `opencode --standalone debug config`
   (v2.2.7): `enabled_providers`, `small_model`, the `raven` remote server and the two web denies all parse. No model
   call, no login on agentpc.
8. **Record and TODO.** [RECORD.md](RECORD.md); TODO edits: "M2" removed (closed by its rule), "Add a runner for
   Codex and Grok" replaced by "Return the OpenCode lane of round item 4.1", and the Codex and Grok findings added
   to "Triage the runtime and client gaps".

## Spend

| Client | Rows | Smoke | Rows, list price | Counted against USD 8 |
|---|---|---|---|---|
| Codex, GPT-6.1 Terra | 24 | $0.016 | $0.744 | $0.760 |
| Grok 4.7 | 20 (cap stop) | $0.058 | $7.663 | $7.721 |

Both clients ran on subscription logins (Codex `plan_type` pro; Grok xAI OIDC). No API key, AI Gateway, Workers AI or
OpenRouter was used, and nothing billed per token. Grok's own cost figure is $2.605 over the 20 rows; the cap used the
larger list-price figure.

## Gates

Run bare, in an `hc` child: `npm run typecheck`, `npm test`, `npm run build` (results below),
`npm run secrets:scan -- --tree` (below). `node --check` passes on the six scripts. The reader re-run on the stored
outputs reproduces both committed summaries byte for byte.

| Gate | Result |
|---|---|
| `npm run typecheck` | First run failed: `env.d.ts` was never generated in this fresh worktree (`OAUTH_KV`, `OAUTH_PROVIDER` missing on `Env`). After `npm run typegen` (README "Run locally"): exit 0. |
| `npm test` | exit 0: 168 files passed, 5 skipped; 3,725 tests passed, 3 expected fail, 5 skipped. |
| `npm run build` | exit 0 (wrangler dry run). |
| `npm run secrets:scan -- --tree` | exit 0: "clean — scanned all tracked files". The pre-commit hook scans the staged files. |

## Deviations from the plan, and why

1. **Codex flags.** Added `--disable goals`, `--disable image_generation`, `--disable skill_search` and
   `-c skills.bundled.enabled=false` to the plan's line. Without them the rollout listed Codex's bundled system skills
   (a "skills" block in the developer message), which the smoke must not see. `--strict-config` accepted every key
   (a bogus key was rejected, which shows the check works). Not removable: `--disable multi_agent` did not remove the
   `collaboration` tool namespace (`spawn_agent` and friends) from the model's tool list. The developer message says
   not to spawn sub-agents, and no row used one (0 sub-agent calls in 24 rows). The login links are `auth.json` and
   `installation_id` only; `.credentials.json` is not linked, and login worked without it.
2. **Grok config.** The private `config.toml` also holds `[skills] disabled = [...]` (the 22 bundled skill names) and
   `[workflows] enabled = false`, not the `raven` table alone. The smoke showed the model receiving a skills list and
   a workflow description otherwise. The plan's real check (no `[model.*]` table) holds.
3. **Hand read replaced.** The plan has the executor hand-class every row flagged lost-without-recovery. No row was
   flagged (0 of 20 Grok rows, 0 of 24 Codex rows), so there was nothing to read, and golden text was never printed. Had
   a row been flagged, the reader's classification (candidate from a key-fact sentence is `needed`, from the answer
   alone `incidental`) would have stood in for the hand read, because the rule forbids printing golden text.
4. **Recovered vs covered.** The plan defines a "recovered" event by a spill-file read or a re-fetch. The reader counts
   three separate things per candidate in a lost region: delivered elsewhere in the row ("covered elsewhere", 29 of 29),
   recovered by a spill read (0), stated in the answer without being delivered (0).
5. **Smoke repeated.** Attempt 1 of each smoke is kept in `tmp/4.1/<client>/smoke-attempt1` and counted ($0.007
   Codex, $0.033 Grok). The cap's "USD 0.40 before the first row" rule used the smoke cost (the largest cost so far
   was $0.033), which only tightens the first row's check and changed nothing.
6. **Grok model name.** The session log reports `grok-4.7-build` as the primary model for `--model grok-4.7`. It is
   the same model; recorded as seen.
7. **Pairing field.** Both clients deliver the clipped text as MCP `content[0].text`; the reader says so per event.
   Codex has no clip events, so its "not checkable" case never came up.
8. **Tool restriction effect.** The plan's Grok line limits built-ins to `read_file,grep,list_dir`. Grok's clip notice
   tells the model to use `bash` on the spill file, which this lane forbids; so the spill path was read in only 2 of 61
   events. The record says so; it does not change the "no answer lost" finding.
9. **OpenCode not run here.** Out of scope on agentpc by the plan; waits for the Mac lane.

## Questions for the lead

None blocking. Two judgement calls to confirm: (a) closing M2 on 30 golden candidates over 20 Grok rows is a thin
instrument; the record states the limit and the rule's thresholds are met (61 events on 17 rows). (b) the record keeps
the "runner" TODO as a reduced "Return the OpenCode lane" item rather than closing it, because the plan's done-when
names OpenCode.
