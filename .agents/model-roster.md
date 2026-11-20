# Agent model roster

`AGENTS.md` names role tiers and the eval and test model set by family. This file maps each family
to how a launch line selects its newest model. Nothing here pins a version: a run takes the
family's newest model and records the exact ID it resolved. A run on a different resolved model is
a different measurement.

## Repo-work tiers

| Tier | Family |
|---|---|
| Gemini Neon | Antigravity (`agy`), newest `gemini-<v>-neon` in `agy models` |
| Codex frontier | Astra (`scripts/latest-model.mjs astra`) |
| Codex workhorse | Sol (`scripts/latest-model.mjs sol`) |
| Claude Fable | `fable` alias |
| Claude Opus | `opus` alias |
| Grok | `scripts/latest-model.mjs grok` |

- Always pass the model flag; unflagged Codex inherits `~/.codex/config.toml`.
- Claude Code resolves family aliases directly. Codex and Grok use `scripts/latest-model.mjs <family>`, which reads the CLI's offline catalog cache, prints one ID (and `fetched_at` on stderr when present), and exits non-zero if missing or unmatched.
- **Record the resolved ID for every run and review gate.** Claude: `modelUsage` key of `--output-format json` or `model` on stream-json `system/init`. Codex: resolver output. Grok: resolver output plus reported `modelUsage` key (which can be a server-side name).
- `ultra` delegates to subagents; it is a separate execution system, not a higher effort.
- Unlisted catalog entries are not tiers until `AGENTS.md` names them.

## Models for evals and tests

Use this set for answering clients or cross-client comparisons. Codex and Grok flags use the two-step resolver form below.

| Role | Family | CLI | Model flag |
|---|---|---|---|
| Default | Claude Sonnet | Claude Code | `--model sonnet` |
| Default | Codex Terra | Codex | `-m "$M"` (`terra`) |
| Default | Grok | Grok | `--model "$M"` (`grok`) |
| Add where it helps | Claude Opus | Claude Code | `--model opus` |
| Add where it helps | Codex Sol | Codex | `-m "$M"` (`sol`) |
| Only when a decision names it | GPT Terra/Sol or Grok via OpenCode | OpenCode | `--standalone -m openai/$M` or `--standalone -m xai/$M` (`terra`/`sol`/`grok`); add `--agent <name>` where tools must be denied |

- OpenCode requires the probe in [`eval/EVALS.md`](../eval/EVALS.md#model-call-billing), and `opencode models --standalone` must list `<provider>/$M` (OpenCode keeps its own catalog). OpenCode stays out of client diagnostics (TODO, "Keep OpenCode out of client diagnostics").
- Haiku and Codex Luna stay out of all tests and evals except as the Playground fallback (`src/demo/model-config.ts`).
- A change of resolved answering or judge model starts a new baseline (`eval/EVALS.md#evaluation-rules`).

## Launch lines

Launch each lane as a background `hc` child with a one-line task pointing to a brief file. Use the two-step form for Codex and Grok so a resolver failure stops the launch (command substitution would pass `-m ""` and fall back to `~/.codex/config.toml`), and record the printed `resolved:` ID.

```sh
M=$(node <worktree>/scripts/latest-model.mjs <sol|astra|terra>) && echo "resolved: $M" && hc run --bg --name <lane> --cwd <worktree> codex --no-daemon --dangerously-bypass-hook-trust -m "$M" -c 'model_reasoning_effort="high"' -c 'sandbox_workspace_write.network_access=true' -a never -s workspace-write "<task>"
hc run --bg --name <lane> --cwd <worktree> claude --model <sonnet|opus|fable> --effort high --permission-mode bypassPermissions "<task>"
M=$(node <worktree>/scripts/latest-model.mjs grok) && echo "resolved: $M" && hc run --bg --name <lane> --cwd <worktree> grok --model "$M" --reasoning-effort high --always-approve "<task>"
M=$(agy models | awk '{print $1}' | grep -E '^gemini-[0-9.]+-neon-high$' | sort -V | tail -1 | sed 's/-high$//') && [ -n "$M" ] && echo "resolved: $M" && hc run --bg --name <lane> --cwd <worktree> agy --model "$M" --effort high --dangerously-skip-permissions --output-format json --print-timeout 0 -p "<task>"
```

- **Codex**: needs `--no-daemon` under `hc`. `workspace-write` cannot write under `.agents/` or commit to shared `.git` (have it write findings to ignored `tmp/`, then copy and commit yourself). `-a never` cannot approve MCP tool calls. Before a paid lane, confirm `codex login status` prints "Logged in using ChatGPT" and keep `OPENAI_API_KEY` unset. `--dangerously-bypass-hook-trust` enables `.codex/hooks.json` (the case-search guard) without `/hooks` approval. Antigravity (`agy`) runs `.agents/hooks.json` with no extra flag; Grok runs `.grok/hooks/` in a trusted folder.
- **Antigravity**: headless `-p` runs one task and exits, so a lane must run long gates in the foreground (it exits if it goes idle while a background command runs). Resume a lane with `--conversation <conversation_id>` from its JSON output. On agentpc wrap it in `systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0`. The Neon resolver needs GNU `sort -V`.
- **Grok**: no offline login check; establish SuperGrok login interactively and keep `XAI_API_KEY` unset. If a Claude Code auto-mode orchestrator rejects `--always-approve`, do not retry—use the `AGENTS.md` tier fallback or ask the owner to launch it.

## How to re-verify

Check that the resolver still finds each family when a CLI renames one:

```sh
for f in sol astra terra grok; do node scripts/latest-model.mjs $f; done
```

Offline catalog inspection (selects model fields only, never cached credentials):

```sh
codex --version && jq '.client_version, (.models[]|{slug, visibility, description, context_window, default_reasoning_level, efforts:[.supported_reasoning_levels[].effort]})' ~/.codex/models_cache.json
grok --version && jq '.grok_version, (.models[].info|{id, description, context_window, efforts:[.reasoning_efforts[]|{id, default}]})' ~/.grok/models_cache.json
claude --version && claude --help | grep -A4 -- '--model\|--effort'
grep -E '^(model|model_reasoning_effort)' ~/.codex/config.toml
```

Network reads: `grok models` for the Grok CLI default; `claude -p --model <alias> --output-format json "Reply ok" | jq '.modelUsage|keys'` for a Claude alias's resolved `claude-<family>-*` key.

- Map Codex tiers from catalog descriptions, not names (names change meaning across generations).
- Working context is `context_window`, not `max_context_window`.
- Catalog presence proves selectability, not a working call; the first lane on a new ID verifies it. On failure, record the reason and take the tier fallback.
