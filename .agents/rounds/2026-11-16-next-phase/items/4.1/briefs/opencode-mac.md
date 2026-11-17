# OpenCode lane for the Mac (item 4.1)

Run by the orchestrator on the Mac. It answers the same 24 tuning rows as the agentpc lanes with
OpenCode v2.2.7 and Claude Sonnet 5.5 through the Mac's Anthropic OAuth login, and returns one
counts-only file, `summary-opencode.json`. Nothing here deploys, pushes or edits the repository.
OpenCode drops out, and the record says so, if any step of "Smoke" fails. Do not work around a
failure.

Spend: USD 8 subscription-equivalent (tokens times Sonnet 5.5 list price, `prices.json`). Subscription
login only. No API key in the environment, no AI Gateway, no OpenRouter.

## Inputs

- The item branch `np/4.1-client-diagnostic` for the scripts: `mcp-tap.mjs`, `run-client.mjs`,
  `client-parse.mjs`, `read-behaviours.mjs`, `prices.json`, `rows.json` (all under
  `.agents/rounds/2026-11-16-next-phase/items/4.1/`), and `eval/qa/cases.json` (read by the driver for
  the 24 questions and by the reader for the golden, only for those rows, never printed).
- Node 22.5 or newer (the reader opens `opencode.db` with `node:sqlite`).
- The Mac's OpenCode login file `~/.local/share/opencode/auth.json` (or `$XDG_DATA_HOME/opencode/auth.json`).
  The driver symlinks it into each row's private data directory. Never run `opencode auth export` or
  anything else that prints it.
- A scratch directory `<scratch>` outside every git repository, for the raw files. It stays on the Mac.

## The server under test

1. A second, detached worktree at the same revision the agentpc lanes used:
   `git worktree add --detach <server-wt> c8cfb437 && cd <server-wt> && npm ci`, with `.dev.vars`
   copied (mode 600) from the main checkout.
2. `npm run dev:eval -- --port 8941` there (it needs a clean tree and binds `localhost`). Check
   readiness with the `initialize` POST of `run-evals` section 5; expect 200.
3. The tap in front of it, from the item branch checkout:
   `node .agents/rounds/2026-11-16-next-phase/items/4.1/mcp-tap.mjs --listen 8954 --upstream http://localhost:8941 --log <scratch>/opencode/tap.jsonl`
4. Record both revisions in the return note: the server worktree's `git rev-parse HEAD` and the
   item branch checkout's.

## Smoke (first, counted against the cap)

Run `node run-client.mjs --client opencode --rows rows.json --mcp-url http://127.0.0.1:8954/mcp --out <scratch>/opencode --smoke`
with the same `PATH` as an interactive shell, `ANTHROPIC_API_KEY` and `ANTHROPIC_AUTH_TOKEN` unset.

Before and after it, read the Anthropic account's usage page. Per-token or extra-usage spend must not
move; if it moves, or the page cannot be read, OpenCode drops out.

The smoke passes only if all of these hold:

- the run exits 0 and the smoke answer names two ids that the tap returned for `search`;
- the tap `<scratch>/opencode/tap.jsonl` shows `initialize`, `tools/list` and one `tools/call search`;
- the `anthropic` entry of `auth.json` has `type` `oauth` (read the `type` field only, for example
  `jq '.anthropic.type' <auth.json>`), and no provider key is in the environment;
- every assistant message in `<scratch>/opencode/smoke/smoke/xdg-data/opencode/opencode.db` has
  provider `anthropic` and model `claude-sonnet-5-5`, and no web search or fetch tool ran;
- the login file in the private data directory is still a symlink after the run;
- `node read-behaviours.mjs --client opencode --dir <scratch>/opencode --smoke` runs and prints a B1 class;
- the smoke result reports tokens and `identityOk: true`.

If the driver or reader needs a fix, tell the lead with the exact error; do not edit the scripts.

## Rows

`node run-client.mjs --client opencode --rows rows.json --mcp-url http://127.0.0.1:8954/mcp --out <scratch>/opencode --cap-usd 8`
as a long-running background process. It runs the 24 rows in `rows.json` order, once each, stops by
itself at the cap, and writes `<scratch>/opencode/ledger.json`. A row that fails is data; never re-run
it. Expect 2 to 5 minutes per row.

## Outputs

- Raw files stay on the Mac under `<scratch>/opencode/` (rows, `opencode.db` per row, `tap.jsonl`, `ledger.json`).
- After the run: `node read-behaviours.mjs --client opencode --dir <scratch>/opencode --rows rows.json --summary <scratch>/opencode/summary-opencode.json`.
- Return `summary-opencode.json` (counts and tuning ids only), the two revisions, the usage-page
  readings before and after, and `ledger.json` totals. Do not return raw transcripts, `opencode.db`
  or any golden text.
