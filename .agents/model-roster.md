# Agent model roster

`AGENTS.md` routes repository work to role tiers. This file maps each tier to an exact model ID
and its launch line. When a CLI catalog changes, update this file only.

Verified 2026-11-10 against the installed CLIs: Codex `0.167.0`, Claude Code `2.1.322`, Grok
`1.0.77`. The `fable` alias resolves to `claude-fable-5-2`. The same day, a Fable 5.2 lane reviewed
this file's revision and a `grok-4.7` lane checked it, both launched with the lines below. The
Codex tier models are unchanged since their 2026-09-30 review run
(`.agents/rounds/2026-09-30-skill-system-audit.md`).

## Tier map

| Tier | Model ID | Catalog description | Efforts (catalog default) | Working context |
|---|---|---|---|---|
| Codex frontier | `gpt-6-astra` | Frontier intelligence for the most demanding work. | low, medium, high, xhigh, max, ultra (medium) | 272k |
| Codex workhorse | `gpt-6.1-sol` | Latest workhorse model for coding and everyday work. | low, medium, high, xhigh, max, ultra (low) | 500k |
| Claude Fable | `claude-fable-5-2` (alias `fable`) | — | low, medium, high, xhigh, max | 1M |
| Claude Opus | `claude-opus-5-5` (alias `opus`) | — | low, medium, high, xhigh, max | 1M |
| Grok | `grok-4.7` (the `grok models` default) | SpaceXAI's latest frontier model | low, medium, high, xhigh (high) | 256k |

Rules for the table:

- Working context is the catalog's `context_window`, not its larger `max_context_window`. Claude
  figures come from the Anthropic model pages.
- Launch with the alias for Claude tiers. It follows the newest model in the family, so when
  Anthropic ships one, re-run "How to re-verify", run the short review it ends with, and record
  the resolved ID here. A review gate records the resolved ID, not the alias.
- This host's `~/.codex/config.toml` selects `gpt-6.1-sol` at high effort, and an unflagged
  Codex command inherits it. The repository does not set that default, so always pass `-m`.
- `ultra` delegates to subagents. Treat it as a separate execution system, not as a higher effort.
- Other catalog entries are not tiers: for example `gpt-6.1-terra`,
  `gpt-6-luna`, the previous-generation `gpt-6-sol` and `gpt-5.6-*`, `gpt-daybreak-blue-latest`,
  `grok-4.7-build-fast`, and hidden entries such as `codex-auto-review`. Add one only after
  `AGENTS.md` names a tier for it.
- QA answering and judge models are a separate measurement contract (see the `run-evals` skill).
  The public Playground models are another, defined in `src/demo/model-config.ts`. A change to
  this file changes neither.

## Launch lines

Each lane is a background `hc` child with its first task on the launch line. Replace `<lane>`,
`<worktree>`, and `<task>`; keep the task to one line that points at a brief file.

```sh
hc run --bg --name <lane> --cwd <worktree> codex --no-daemon -m gpt-6-astra -c 'model_reasoning_effort="high"' -c 'sandbox_workspace_write.network_access=true' -a never -s workspace-write "<task>"
hc run --bg --name <lane> --cwd <worktree> codex --no-daemon -m gpt-6.1-sol -c 'model_reasoning_effort="high"' -c 'sandbox_workspace_write.network_access=true' -a never -s workspace-write "<task>"
hc run --bg --name <lane> --cwd <worktree> claude --model fable --effort high --permission-mode bypassPermissions "<task>"
hc run --bg --name <lane> --cwd <worktree> claude --model opus --effort high --permission-mode bypassPermissions "<task>"
hc run --bg --name <lane> --cwd <worktree> grok --model grok-4.7 --reasoning-effort high --always-approve "<task>"
```

Per-CLI constraints:

- **Codex** needs `--no-daemon` under `hc`. Its `workspace-write` sandbox cannot write under
  `.agents/` or commit to the shared `.git`. Have it write findings to the ignored `tmp/`
  directory, then copy them into the round directory and commit yourself. With `-a never` it
  cannot approve MCP tool calls, so it cannot repeat an authenticated Raven connector check.
- **Grok** `--always-approve` can be denied as an unsafe launch when the Claude Code orchestrator
  runs in auto mode. Do not retry; treat the tier as unavailable and apply the fallback rule in
  `AGENTS.md`, or ask the owner to launch it.

## How to re-verify

The CLIs cache their catalogs on disk. These reads are offline:

```sh
codex --version && jq '.client_version, (.models[]|{slug, visibility, description, context_window, max_context_window, default_reasoning_level, efforts:[.supported_reasoning_levels[].effort]})' ~/.codex/models_cache.json
grok --version && jq '.grok_version, (.models[].info|{id, description, context_window, efforts:[.reasoning_efforts[]|{id, default}]})' ~/.grok/models_cache.json
claude --version && claude --help | grep -A4 -- '--model\|--effort'
grep -E '^(model|model_reasoning_effort)' ~/.codex/config.toml
```

Two reads use the network. `grok models` is the only source for the Grok CLI default; it can
print a harmless `Settings fetch failed` warning first. For a Claude alias, run
`claude -p --model fable --output-format json "Reply ok" | jq '.modelUsage|keys'` and read the
`claude-fable-*` key; auxiliary calls can add others.

Map tiers from the catalog description, not the name. Codex family names change meaning between
generations: the same name can mark a frontier model in one generation and a workhorse in the next.

A catalog entry proves a model is selectable, not that a call works. Before you bind a new ID to a
tier, run one short review with it as an `hc` lane.
