# Item 4.1 plan: client diagnostic on GPT-6.1 Terra, Grok 4.7 and OpenCode

Lead: Claude Opus 5.5, agentpc `t1sy`. Worktree `/home/tyler/code/raven-wt/np-4.1`, branch
`np/4.1-client-diagnostic`, base `origin/main` `c8cfb437` (after #465). Binding inputs: round
[PLAN.md](../../PLAN.md) 4.1, [DECISIONS.md](../../DECISIONS.md) decision 7, the orchestrator note
`/home/tyler/code/raven-wt/orch/4.1-NOTE.md` (binds where it differs), `.agents/TODO.md` "M2" and
"Add a runner for Codex and Grok as QA answering clients". Plan review: [REVIEW.md](REVIEW.md).

## Decision

1. Whether Raven's shipped surface works on two real non-Claude clients (Codex CLI with GPT-6.1
   Terra, Grok CLI with Grok 4.7), and on OpenCode with Claude Sonnet 5.5 if its subscription login
   works. Read as four behaviours per client (step 6). A failed behaviour is a defect for the
   report and the TODO; this item fixes nothing.
2. TODO M2: whether the Grok CLI's 20,000-byte result clip costs a Grok answer (rule in step 8).
3. TODO "Add a runner for Codex and Grok": keep the hand-run lanes, or build a committed runner
   (only if a defect needs a before-and-after measurement).

This is the only model-calling run the round authorizes: USD 8 per client,
subscription-equivalent (tokens times vendor list price), subscription logins only. Never AI
Gateway, Workers AI, OpenRouter or any API key. One pass of 24 rows per client; no judge, no
repeat, no score comparison.

## Facts re-checked on `c8cfb437`

- Split v7 `~/backups/gca-2026-11-14-split-v7.json`, SHA-256 `d5e56748…6c8a` (matches), 88 tuning
  ids; `eval/qa/tuning-rows.mjs` `TUNING_ROW_COUNT` 88, `tuningIdsOf`, `selectById`. Questions are in
  the committed `eval/qa/cases.json` (`cases[]`: `id`, `question`, `golden` object, …).
- CLIs on agentpc: Codex `0.167.0` (`codex login status`: ChatGPT login; catalog default effort for
  `gpt-6.1-terra` is `low`), Grok `1.0.77` (xAI OIDC login; `grok-4.7` default effort `high`;
  `--output-format streaming-json`, `grok usage <session>` gives persisted tokens and cost). Both
  user configs register about ten other MCP servers, so isolation is required (step 3).
- `research/audits/2026-11-14-client-text-limits.md` and its frozen harness
  (`research/audits/2026-11-14-client-text-limits/probe/adapters.py`) already ran these clients
  isolated: Codex with a private `CODEX_HOME` holding symlinks to `auth.json`,
  `.credentials.json`, `installation_id`, plus `--ignore-user-config`, `-c mcp_servers.<n>.url=…`;
  Grok with a private `GROK_HOME` (symlinked `auth.json`, `agent_id`, a one-server `config.toml`)
  and an empty `HOME`; OpenCode with private `XDG_*` dirs. Delivery facts from that audit: Codex
  defers every MCP tool behind a JavaScript `exec` tool (the model sees a ~230-character catalogue
  line; full descriptions only if it prints `ALL_TOOLS`; exec output budget 10,000 tokens, middle
  cut). Grok reaches MCP tools only through `search_tool`/`use_tool`, cuts descriptions at 2,033
  characters (Raven's are 1,899 / 1,960 / 1,964, so whole), and clips a result at 20,000 bytes,
  writing the full output to a file it names. OpenCode lists each tool at 120 characters up front;
  the full text needs its sandbox `search`; a result over 400 lines is clipped to a file.
- `npm run dev:eval` (`scripts/run-eval-server.mjs`) refuses a dirty tree (untracked files
  included; ignored files are fine) and binds `--host localhost`. No `dev:eval` runs on agentpc now.
- Stored Sonnet QA runs cost about USD 0.19 per row (e.g. `2026-11-15T07-33-40`, 58 rows,
  USD 11.62, judge included). Item 3.4: 119 of 939 stored tuning `execute` results exceed 20,000
  bytes; the head clip would lose a cited fact on 23 of 38 exposed rows.

## Steps

All item scripts live in this folder and are committed. Raw transcripts, proxy logs and client
homes go under the worktree's `tmp/4.1/` (git-ignored), never committed. Answering agents never
run inside a git repository (step 3).

1. **Rows** (`select-rows.mjs`, output `rows.json`). Reads the split's `sets.tuning` only, passed
   to `tuningIdsOf` as `{ sets: { tuning: split.sets.tuning } }` as 3.4's selector does, asserts the split's SHA-256, orders the 88 ids by
   `sha256("np-4.1|" + id)` ascending and takes the first 24. No other field of anything is read.
   `rows.json` holds the split SHA-256, the seed string and the 24 ids. The same 24 ids for every
   client. Every later script reads cases by `selectById(cases, rows.ids, 24)` first.
2. **Server.** A second worktree `/home/tyler/code/raven-wt/np-4.1-server`, detached at
   `c8cfb437`, `npm ci`, `.dev.vars` copied mode 600; one `npm run dev:eval -- --port 8941` as an
   `hc` child of the executor; readiness by the `initialize` POST in `run-evals` section 5 (expect
   200). The item worktree stays free to change. Killed, and the server worktree removed by the
   lead, at the end.
3. **Tap and isolation** (`mcp-tap.mjs`, `run-client.mjs`).
   - `mcp-tap.mjs`: a dependency-free Node HTTP proxy on its own port per client, forwarding every
     method (GET, POST, DELETE) and every path (including `/.well-known/*`) to the server, passing
     `mcp-session-id` both ways, streaming SSE unbuffered, sending `accept-encoding: identity`
     upstream, accepting a JSON or an SSE reply (review 13). It appends each exchange to JSONL:
     time, JSON-RPC id and method, tool name, arguments, HTTP status, and the full response body
     (SSE frames decoded). No request headers are logged. It is the client-independent record of
     tool calls, arguments and full results. The `run-evals` section 5 `initialize` probe runs
     through the tap before the first smoke (expect 200).
   - `run-client.mjs --client codex|grok|opencode --rows rows.json --mcp-url <tap url> --out <dir>
     --cap-usd 8`. Per row: a fresh empty work dir under `/home/tyler/.cache/raven-4.1/work/` (on
     the Mac, a root the orchestrator names), outside every repository (asserted:
     `git -C <dir> rev-parse` fails); a fresh private client home and an empty `HOME` (as the audit
     harness: symlinks to the login files only, never copied, never printed); the only MCP server
     `raven` = the tap URL; `-p`/`exec` headless mode, stdin closed. Kill: SIGTERM at 12 minutes,
     SIGKILL 15 seconds later (review 4).
   - **Environment by allowlist** (review 5): only `PATH`, `LANG`, `TERM`, `HOME` (the empty one)
     and the client's own home variables (`CODEX_HOME`, `GROK_HOME`, `XDG_*`) reach the child; on
     the Mac also `OPENCODE_DISABLE_CLAUDE_CODE=1` and `OPENCODE_DISABLE_PROJECT_CONFIG=1` (review
     11). Before each smoke: `CODEX_HOME=<private> codex login status` says ChatGPT; the private Grok
     `config.toml` has only the `[mcp_servers.raven]` table (no `[model.*]`).
   - **Codex** (review 1, 15): `codex exec --json --ignore-user-config --strict-config
     --skip-git-repo-check -C <work> -s read-only -m gpt-6.1-terra -c model_reasoning_effort="low"
     -c web_search="disabled" --disable apps --disable plugins --disable multi_agent
     -c mcp_servers.raven.url=<tap> -c mcp_servers.raven.default_tools_approval_mode="approve"`.
     If `--strict-config` rejects a key, the smoke finds the right one from `--help`, the binary's
     config schema or the docs; it never runs a row with a key unconfirmed.
   - **Grok** (review 12, 15): `grok -p <prompt> --model grok-4.7 --reasoning-effort high
     --output-format streaming-json --no-subagents --no-plan --disable-web-search
     --tools read_file,grep,list_dir --permission-mode bypassPermissions --allow 'mcp__raven*'
     --allow use_tool --allow search_tool` (tool names confirmed in the smoke).
   - **OpenCode** (review 2, 9): `opencode run --standalone --auto --format json -m
     anthropic/claude-sonnet-5-5`, private `XDG_*` with a private `opencode.json`:
     `enabled_providers: ["anthropic"]`, `small_model` the same Sonnet 5.5 ID, the `raven` remote
     server only, and explicit denies for `websearch` and `webfetch`. Login by symlink to the Mac's
     `$XDG_DATA_HOME/opencode/auth.json` (default `~/.local/share/opencode/auth.json`); if that file
     does not exist, OpenCode drops out. Never `opencode auth export` or anything that prints it.
     The private `opencode.db` is kept for the reader.
   - **Login files** (review 6): after the smoke and after every row, `lstat` each symlinked login
     file; if one is no longer a symlink, that client stops and the executor tells the lead.
   - Outputs per row: the client's stdout events, its own session log (Codex rollout, Grok
     `chat_history.jsonl`, OpenCode `opencode.db`), the final answer, tokens, wall time, exit.
     Efforts differ between clients (Terra `low`, Grok `high`, their catalog defaults); that is
     acceptable only because no comparison is drawn, and the record says so.
   - The prompt is `agentPrompt` of `eval/qa/run-qa.mjs` (search-execute surface) with the tool
     names written as "the `raven` MCP server's `search` and `execute` tools" and the rule "Do not
     use any tool other than the two named above" replaced by "Do not use web search, web fetch, or
     any MCP server other than `raven`", so a client's own way to read a clipped result stays open.
     The exact prompt template and its SHA-256 go in the record.
4. **Smoke, per client, before row 1** (counted against the cap). One trivial prompt: "Use the
   raven `search` tool once with the query `soroban events`, then reply with the ids of the first
   two hits." Pass: the client log shows the `raven` server and no other MCP server, the tap
   records `initialize`, `tools/list` and one `tools/call search`, the answer names two ids the tap
   returned, and tokens are parsed. Also asserted from the client's own log (review 1, 9): no tool
   namespace but `raven` and the client's own built-ins, no skill listed, no web search tool, no
   `AGENTS.md` or `CLAUDE.md` content; the B1 reader (step 6) runs on the smoke log; the token
   identity holds (step 5). A harness fault found here is fixed and the smoke repeated (no row has
   run). OpenCode's smoke also proves the login: its `auth.json` entry for `anthropic` has type
   `oauth` (read the type field only), no provider key is in the environment, every assistant
   message in `opencode.db` has provider `anthropic`, and the run succeeds. The orchestrator reads
   the Anthropic account's usage page before and after the smoke; if per-token or extra-usage spend
   moved, or the page cannot be read, OpenCode drops out (review 2). Any failure: OpenCode drops out
   and that is recorded, not worked around.
5. **Run.** Codex and Grok run in parallel as two `hc` children, rows in `rows.json` order, each
   row attempted once. After each row the driver adds the row's subscription-equivalent cost, at
   the vendor list prices for that model (source URL and read date from the vendor's public pricing
   page, in the record). Per-CLI formulas (review 3), never a sum of every field:
   - Codex (`turn.completed` usage): `(input − cached_input) × input price + cached_input × cached
     price + output × output price` (`cached_input_tokens` is inside `input_tokens`,
     `reasoning_output_tokens` inside `output_tokens`). Smoke asserts the reported total equals
     `input + output` where a total is reported.
   - Grok (`usage`): `input × input price + cache_read × cached price + cache_creation × input price
     + output × output price` (reasoning is inside output). Smoke asserts the documented identity
     `total = input + cache_read + cache_creation + output`. The cap uses the larger of this and the
     CLI's own cost figure.
   - OpenCode: the per-step token parts at Sonnet 5.5 list prices, by the same rule (cached read at
     the cached price, cache write at the write price, reasoning not added twice).
   - A failed identity stops the client before row 1. A killed row (review 4) is costed at the larger
     of the largest row so far and its partial sum (Grok's per-response `usage` lines, Codex's last
     `token_count` in the rollout); the record says the cap stop is an estimate.
   **Cap stop:** before a row, if spent + 1.5 × the largest row cost so far (USD 0.40 before the
   first row) would pass USD 8, the client stops and the record states the row count reached. A row
   that fails or times out is data (behaviour 4), never re-run.
   **Estimate** (review 15): USD 0.19 to 0.33 per row, so USD 5 to 8 per client; wall time about
   2 to 4 minutes per row, so 1 to 2 hours with the two clients in parallel, up to 4.8 hours per
   client if every row hit the 12-minute kill.
6. **Four behaviours** (`read-behaviours.mjs`; inputs: `rows.json`, the tap log, the client logs;
   output: `tmp/4.1/<client>/behaviours.json` and a counts-only `summary-<client>.json` committed
   here). Per row, then totals:
   - **B1, the client reaches the tool descriptions.** Probes: the last 60 characters of the
     `search` description, of the `execute` description and of the server instructions, as served
     by the tap's `tools/list` and `initialize`. A probe is reached when it occurs in any item the
     client's own log shows the model received (Codex: rollout items, including exec output that
     printed `ALL_TOOLS`; Grok: the `search_tool` result and the "MCP servers connected" message;
     OpenCode: the system prompt and tool listing in `opencode.db`, and tool outputs). Both sides are
     normalized before matching: JSON string escapes decoded, whitespace runs collapsed to one space
     (review 9). Class per row: `full` (both description tails),
     `partial` (a description head only, such as Codex's catalogue line or OpenCode's 120
     characters), `none`. Instructions reach is reported apart.
   - **B2, the client passes a search `limit`.** From the tap: `search` calls, calls with `limit`,
     the values; per row and total.
   - **B3, a result is clipped and a cited fact is lost.** A clip event is a client's own marker on
     a Raven result or on output carrying one: Grok `[MCP output truncated`, OpenCode `full output
     saved to`, Codex `tokens truncated`. For each event: the full text (the tap's result; for a
     Codex exec cut, only when the printed text is recoverable from a tap result, else "not
     checkable"), the delivered part, the lost region. Cited facts are the case's golden facts
     (candidate extraction of item 3.4's `read-boundary.mjs` applied to the golden answer and key
     facts: URLs, numbers of three or more digits, dates, dotted versions, backticked spans, strkeys
     and hex). A **lost cited fact**: a golden candidate that occurs in the lost region and in no
     delivered text of the row (all tool outputs the client log shows, plus a spill-file read) and
     not in the answer. A **recovered** event: the model read the spill file or re-fetched, and the
     answer states a golden candidate from the lost region. The golden is read only here, only for
     the 24 rows, never printed; the committed outputs hold counts and row ids, no golden text and
     no lost-candidate strings (they are golden text).
     Pairing (review 7): each clip event is paired to its tap result by prefix: the delivered text
     must equal the start of the tap result's `content[0].text` in UTF-8 bytes (no assumed 20,000,
     no SSE-frame match); the reader states which field each client delivered (`content` text or
     `structuredContent`). An unpaired event is "not checkable".
     **Hand read** (review 7): the executor reads every row flagged lost-without-recovery and
     classes each lost candidate `needed` (a key fact of the golden depends on it) or `incidental`.
     Only a hand-confirmed `needed` candidate counts as a lost cited fact.
   - **Local reads** (review 8): the reader lists every local path a client read. A read of the
     client's own spill path is B3 data; any other read (for example `eval/qa/cases.json`) marks
     the row contaminated in the record, and its B3 result is not counted.
   - **B4, the connection and calls succeed.** Tap: `initialize` and `tools/list` status, HTTP
     errors, JSON-RPC errors, `isError` results, `Execution failed` results. Client: MCP connect or
     auth errors, tool timeouts (Codex `tool_timeout_sec` 60 against Raven's 60-second execute),
     a refused tool approval (Grok exits 0 on one), a row with no final answer, a kill at 12
     minutes, any call to an MCP tool outside `raven` or to web search or fetch.
   The executor checks the reader by hand on three rows per client (one clipped if any): reads the
   transcript and confirms each behaviour's class. A disagreement fixes the reader, then it re-runs
   on all rows; no client call is repeated.
7. **OpenCode lane for the Mac** (`briefs/opencode-mac.md`, committed, plus the same
   `run-client.mjs` with `--client opencode`). It names inputs (the committed `rows.json`,
   `eval/qa/cases.json`, a server URL), outputs (raw files under a scratch dir the orchestrator
   names; `summary-opencode.json` counts only), and the server: a detached worktree at `c8cfb437` on
   the Mac running `npm run dev:eval -- --port <p>`, with the tap in front (review 14). Both server
   revisions go in the record. Step 4's login smoke first, with the usage-page check. The
   orchestrator commits `summary-opencode.json` to the branch or sends it to me; I add it to the
   record.
8. **Record** (`RECORD.md`, short, counts only): versions, models and efforts, prompt hash, server
   revision, tap/driver/reader hashes, price sources, per-client rows run, cost (tokens and USD
   subscription-equivalent), the four behaviours per client (row-level table by tuning id, no
   question or golden text), clip events, lost and recovered facts, failures, and the decisions:
   - **M2 rule (fixed now).** Grok "costs answers" if any uncontaminated row has a hand-confirmed
     `needed` lost cited fact without recovery: M2 stays open with the rows as evidence for a
     reviewed bound. Flags that are all `incidental` are not a cost. Grok "costs no answer" if no
     row has one and Grok logged at least 5 paired clip events on at least 3 rows: M2 closes by its
     done-when. Fewer clip events: inconclusive, M2 stays open with the count.
     Expected exposure (review 10, counted by the lead before the run, ids only): of the 24 rows, 11
     had a stored Claude `execute` result over 20,000 bytes in some run; 32 of 171 stored units
     (19%) had one. A single pass therefore expects about 4 to 5 clip events, near the threshold.
     "Inconclusive" is accepted in advance; rows are not stratified, because the note fixes
     selection by id alone.
   - **Runner rule.** A committed runner is recommended only if a behaviour fails in a way a code
     change would fix and a before-and-after measurement would need; otherwise the record keeps
     the hand-run lanes and the TODO item closes by its done-when.
   - TODO edits: M2 per its rule; "Add a runner" closed or reduced; any defect as a new TODO item
     (own-repo) or a note for `improvements/` (upstream client behaviour is not an `improvements/`
     target; it goes to the TODO's client-gap item).

## Gates

`npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`, each bare.
`node --check` on the four scripts. The reader re-run on the stored outputs reproduces the
committed summaries. No `src/` change, so no smoke lane.

## Stop rule

Per client: 24 rows run, or the cap stop. No repeat, no judge, no score comparison, no second
look. A no-defect result closes the item.

## Risks

- **Spend accounting.** Subscription-equivalent cost depends on the token fields each CLI reports
  (reasoning and cached tokens). If a CLI reports no tokens for a row, that row is costed at the
  largest row cost so far and the record says so.
- **Login state.** A CLI may refresh a login by rename and break the symlink; the `lstat` check in
  step 3 stops that client. Nothing copies or prints a login file. A failed login stops that client
  and is recorded.
- **Data.** Only `id` is read before selection; golden text is read only by the reader for the 24
  rows and never printed or committed. Raw transcripts stay in `tmp/4.1/` and on the Mac.
- **Isolation leaks.** A client loading another MCP server, a global rules file, or the repo's
  `AGENTS.md` would contaminate the run; the smoke checks the first, the neutral directory and
  private home the others.
- **Live upstream variance.** Results differ from the stored Claude runs; no comparison is drawn.
- **Codex B3.** Codex clips the model's printed output, not the MCP result; some events may be
  "not checkable".

## Needs

- From the orchestrator: running the OpenCode lane on the Mac (step 7) and returning
  `summary-opencode.json`. Nothing else before execution.
- No deploy: no Worker bytes change.

## Reconciliation of REVIEW.md

Reviewer: Claude Fable `claude-fable-5-2`, high, agentpc `t1sz`. 15 findings, all adopted.

| # | Disposition |
|---|---|
| 1 | Adopted: Codex flags, `--strict-config`, empty `HOME`, smoke asserts no other tool surface (steps 3, 4). |
| 2 | Adopted: private `opencode.json` with `enabled_providers`, `small_model`, web denies; provider check in `opencode.db`; usage-page check by the orchestrator (steps 3, 4). |
| 3 | Adopted: per-CLI cost formulas and token identities checked in the smoke (step 5). |
| 4 | Adopted: SIGTERM then SIGKILL; killed rows costed at the larger of partial sum and largest row (steps 3, 5). |
| 5 | Adopted: environment allowlist and login checks before each smoke (step 3). |
| 6 | Adopted: `lstat` after smoke and every row; no `opencode auth export`; no `auth.json`, no OpenCode (step 3). |
| 7 | Adopted: hand read of every lost-without-recovery row, `needed`/`incidental`; prefix pairing in bytes; field delivered stated (step 6, M2 rule). |
| 8 | Adopted: local-read listing; non-spill reads mark the row contaminated (step 6). |
| 9 | Adopted: normalization on both sides; B1 on the smoke log; OpenCode read from `opencode.db` (steps 3, 4, 6). |
| 10 | Adopted: exposure counted (11 of 24 rows, about 4 to 5 expected events); inconclusive accepted in advance, no stratification (step 8). |
| 11 | Adopted: work root outside every repository; OpenCode disable flags (step 3). |
| 12 | Adopted: the audit's Grok permission flags and `--tools` list (step 3). |
| 13 | Adopted: tap forwards all methods and paths, session id, unbuffered SSE, identity encoding, JSON-RPC id; `initialize` probe through the tap (step 3). |
| 14 | Adopted: the Mac server is a detached worktree at `c8cfb437`; both revisions recorded (step 7). |
| 15 | Adopted: explicit efforts, the effort difference stated, estimate added (steps 3, 5). |
