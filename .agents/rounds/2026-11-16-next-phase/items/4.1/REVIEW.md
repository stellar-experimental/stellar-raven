# Review of the item 4.1 plan

Reviewer: Claude Fable (`claude-fable-5-2`), 2026-11-17, on agentpc. Read-only: no model call, no
server, no `codex exec`, `grok -p` or `opencode run`. No split set, case or `auth.json` was opened.
Evidence is the plan, its binding inputs, `--help` output, `codex features list`, the offline model
catalogs, strings of the installed binaries, and `~/.grok/docs/user-guide/`.

**Verdict.** The plan stays inside decision 7 and the note once findings 1 to 3 are fixed. They are
blocking because each row runs once and nothing may be repeated, so a contaminated or mis-costed
pass cannot be bought again. Row selection, the same 24 rows per client, golden handling and the
raw-transcript location are sound as written.

## Blocking

1. **Codex isolation is incomplete: web search, apps, plugins and user skills stay on.**
   - Evidence: `codex features list` shows `apps stable true`, `plugins stable true`,
     `multi_agent stable true`, and `web_search_request` / `web_search_cached` as `deprecated`, so
     no feature flag turns search off. `--ignore-user-config` only skips `$CODEX_HOME/config.toml`
     (`codex exec --help`). The plan says web search is "disabled" (step 3) but names no key. The
     binary has a `.agents/skills` / `user-agent-skills` root, `~/.agents/skills` holds `hc-fleet`
     and `herdr-core`, and the audit harness leaves `HOME` real for Codex (`adapters.py` lines
     27-33). With a ChatGPT login, `apps` is a second tool surface beside `raven`.
   - Fix: add `-c web_search="disabled" --disable apps --disable plugins --disable multi_agent
     --skip-git-repo-check --strict-config`, and set `HOME` to an empty directory with `CODEX_HOME`
     explicit. `--strict-config` makes a wrong key fail at the smoke instead of passing silently; I
     could not confirm the `web_search` value from `--help`. The smoke asserts from the rollout: no
     skill listed, no tool namespace but `raven`, no web search tool.

2. **The OpenCode smoke does not show "not billed per token" (decision 7, note lines 24-26).**
   - Evidence: step 4 proves `type: oauth`, no key in the environment, and a successful run. None
     of the three restricts the provider. The binary supports `enabled_providers` and
     `small_model`, and reads `OPENCODE_API_KEY` and `OPENCODE_CONFIG_CONTENT`; the plan's
     environment list (step 3) removes neither. A model-resolution fallback or the session-title
     call can therefore leave the Anthropic login. `opencode run --auto` approves everything "not
     explicitly denied", so "web search and fetch disabled" needs a deny rule the plan does not
     name. The harness also cannot see how Anthropic meters OAuth use from a third-party client;
     only the account's usage page shows that.
   - Fix, in `briefs/opencode-mac.md` and the driver: a private `opencode.json` with
     `enabled_providers: ["anthropic"]`, `small_model` set to the same Sonnet 5.5 ID, and explicit
     denies for `websearch` and `webfetch`. The smoke asserts every assistant message in the export
     has provider `anthropic`. The orchestrator reads the Anthropic account's usage page before and
     after the smoke. If per-token or extra-usage spend moved, or the page cannot be read, OpenCode
     drops out and that is recorded.

3. **The cost formula double-counts, so the cap stop can end a client many rows early.**
   - Evidence: step 5 multiplies "input, cached input, output and reasoning tokens" by list price.
     Grok's `input_tokens` is uncached only, and its documented total is `input + cache_read +
     cache_creation + output` with reasoning inside output (`14-headless-mode.md` lines 194-200,
     231-234). Codex reports `cached_input_tokens` as part of `input_tokens` and
     `reasoning_output_tokens` as part of `output_tokens`; that is from my knowledge of the Codex
     source, not from `--help`. Summing all four fields prices cached input twice for Codex and
     reasoning twice for both. An agent loop is mostly cached input, so the overstatement is large.
   - Fix: per-CLI formulas. Codex: `(input − cached) × input price + cached × cached price +
     output × output price`. Grok: `input × input price + cache_read × cached price + output ×
     output price`. On the smoke, assert `total_tokens == input + output` for Codex and the
     documented identity for Grok; a failed identity stops the client before row 1. For Grok, the
     cap uses the larger of the computed cost and the CLI's `total_cost_usd`.

## Should

4. **A killed or timed-out row is under-costed.** Codex prints usage only on `turn.completed`. A
   stopped Grok turn sets `usage_is_incomplete` and its usage is "a lower bound"
   (`14-headless-mode.md` line 804). The plan costs such a row at "the largest row cost so far"
   (Risks), but a 12-minute row is likely the largest yet. Fix: send SIGTERM, wait 15 seconds
   (Grok can hold its closing line 10 seconds, line 803), then SIGKILL. Cost the row at the larger
   of the largest row so far and the partial sum: Grok's per-response `usage` lines, Codex's last
   `token_count` in the rollout. State in the record that the cap stop is an estimate.

5. **Build the child environment from an allowlist, not a denylist.** The plan removes six names.
   The Codex binary also reads `CODEX_API_KEY`, `CODEX_ACCESS_TOKEN`, `OPENAI_BASE_URL` and `AWS_*`.
   Grok reads `GROK_CLI_CHAT_PROXY_BASE_URL`, `GROK_AUTH_PROVIDER_COMMAND`, and
   `GROK_MAX_MCP_OUTPUT_BYTES` / `MAX_MCP_OUTPUT_BYTES`, which move the 20,000-byte clip M2 depends
   on (`07-mcp-servers.md` lines 45-61). agentpc's shell has none of these today; the Mac is
   unchecked. Fix: pass only `PATH`, `LANG`, `TERM`, `HOME` and the client's own home variables.
   Before each smoke, assert `CODEX_HOME=<private> codex login status` says ChatGPT, and that the
   private Grok `config.toml` has no `[model.*]` table (auth precedence 1, `02-authentication.md`).

6. **The symlinked login may not survive a token refresh.** "Refreshed in place" (Risks) is an
   assumption. A CLI that writes by rename replaces the symlink with a private file and leaves the
   owner's real login holding a spent refresh token. Fix: `lstat` each login file after the smoke
   and after every row; if one is no longer a symlink, stop that client and tell the lead. For
   OpenCode, the binary does read `$XDG_DATA_HOME/opencode/auth.json`, but it also carries keychain
   code and agentpc has no such file to compare. The brief should say: if the Mac has no
   `auth.json`, OpenCode drops out; never use `opencode auth export`, which prints secrets.

7. **B3 and the M2 rule lean toward "costs answers".**
   - Item 3.4 called a fact "cited" when the stored answer states it (`read-boundary.mjs`
     `answerCandidates`), and a reader then classed each candidate `cited` or `incidental`
     (`RESULT.md` line 110). The plan uses golden candidates instead. That is the right proxy for a
     live clip, since the answer cannot state what it never received. But the extractor takes any
     URL, date or three-digit number, and step 8 opens M2 on one such token in one row, with no
     judge.
   - Fix: the executor hand-reads every row flagged lost-without-recovery, not three sampled rows,
     and classes each lost candidate as needed by a key fact or incidental. "Costs answers" needs
     one hand-confirmed needed fact. Flags that are all incidental give "inconclusive". Fix this
     wording in the plan before the run.
   - Pair each clip event to its tap result by prefix: assert the delivered text equals the start
     of the tap's `content[0].text`, in UTF-8 bytes. Do not assume 20,000, and do not match on the
     SSE frame. `search` also returns `structuredContent` (`src/mcp/tools.ts` line 310), so the
     reader must state which field each client delivered.

8. **Both file-reading clients can read the whole disk.** Grok with read-only file tools and
   Codex's `-s read-only` shell can open `eval/qa/cases.json` and its goldens. B4 counts "any call
   to a non-raven tool" as a failure, while B3 needs the spill-file read to stay allowed. Fix: the
   reader lists every local path read. A read of the client's own spill path is B3 data. Any other
   read marks the row contaminated in the record.

9. **B1 probes will miss on formatting, and the OpenCode log source is wrong.** Grok turns newlines
   in the instructions into spaces (audit, "Grok CLI" bullet). A Codex script that prints
   `ALL_TOOLS` through `JSON.stringify` escapes the backticks and newlines in the description tail.
   Fix: normalise whitespace and JSON escapes on both sides before matching, and run the B1 reader
   on the smoke log as part of the smoke. For OpenCode, the audit read the system prompt and tool
   listing from the session database, not an export ("OpenCode: what the session database
   holds"). The Mac lane should keep the private `opencode.db` and read it the same way.

10. **M2 may be inconclusive by design.** The rule needs five Grok clip events on three rows. Item
    3.4 found 119 of 939 stored `execute` results over 20,000 bytes, about one in eight. A 24-row
    pass could land near the threshold. Fix: before the run, count how many of the 24 ids are among
    3.4's exposed rows (committed, tuning only) and write the expected clip count in the plan. If
    it is below the threshold, either accept "inconclusive" in advance or ask the orchestrator
    whether rows may be stratified; the note says selection is by id alone, so do not change it
    unasked.

## Nit

11. **Name the row work-dir root.** `tmp/4.1/` is ignored (`.gitignore` line 43) but inside the
    repository, and Grok loads `AGENTS.md` and `CLAUDE.md` from the repository root down to the
    working directory (`12-project-rules.md`, "How Discovery Works"). The plan's assertion covers
    this; name a root outside every repository so client homes and work dirs are not confused. For
    OpenCode on the Mac, set `OPENCODE_DISABLE_CLAUDE_CODE=1` and `OPENCODE_DISABLE_PROJECT_CONFIG=1`
    (both in the binary), or the owner's `~/.claude/CLAUDE.md` reaches the model.

12. **Grok approvals.** A headless tool call that needs approval is refused with exit code 0
    (`14-headless-mode.md` line 606). Name the flags the audit used: `--permission-mode
    bypassPermissions --allow 'mcp__raven*' --allow use_tool --allow search_tool`. `--tools` keeps
    the MCP meta-tools (line 35), so `--tools read_file,grep,list_dir` is safe.

13. **Tap.** Forward GET and DELETE as well as POST, and every path including `/.well-known/*`.
    Pass `mcp-session-id` both ways, stream SSE without buffering, send `accept-encoding: identity`
    upstream, accept a JSON reply as well as SSE, and log the JSON-RPC id. Run the `run-evals`
    section 5 `initialize` probe through the tap before the first smoke; it is free.

14. **Mac server.** Use a detached worktree at `c8cfb437`, as on agentpc. The alternative's path
    list omits `package.json` and `package-lock.json`, which decide the bundled dependencies.
    Record both server revisions.

15. **Pass efforts explicitly and add the estimate.** Use `-c model_reasoning_effort="low"` and
    `--reasoning-effort high` so the record does not depend on a catalog default. Terra at low
    beside Grok at high is acceptable only because no comparison is drawn; say so in the record.
    `run-evals` section 1 also asks for expected time and cost. At USD 0.19 to 0.33 per row that is
    USD 5 to 8 per client, and up to 4.8 hours per client at the 12-minute limit, against the round
    plan's "about 2 hours".

## Checked and sound

- Rows: ids only, through `tuningIdsOf`, with the split SHA-256 asserted and a fixed seed. Pass
  `{ sets: { tuning: split.sets.tuning } }` as 3.4's `select-tuning.mjs` does. Committing 24 tuning
  ids has precedent in 3.4's `RESULT.md`.
- Golden text is read only by the reader for the 24 rows, and committed outputs hold counts and
  ids. Keep lost-candidate strings out of `summary-<client>.json`; they are golden text.
- `dev:eval` refuses any untracked file (`scripts/run-eval-server.mjs` lines 18-21), so the second
  worktree is needed. Its `--host localhost` satisfies the local bypass whatever port the tap
  listens on (`src/auth/gate.ts`).
- Flags confirmed in `--help`: Codex `--ignore-user-config`, `-s read-only`, `--json`, `-c`,
  `--disable`; Grok `--no-subagents`, `--no-plan`, `--disable-web-search`, `--tools`,
  `--output-format streaming-json`, `grok usage <session>`; OpenCode `run --standalone --auto
  --format json -m`, `session export`. Catalog defaults match the plan: Terra `low`, Grok 4.7
  `high`.
