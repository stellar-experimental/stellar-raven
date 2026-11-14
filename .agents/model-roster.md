# Agent model roster

`AGENTS.md` names role tiers and the eval and test model set. This file maps both to exact model
IDs and launch lines. When a CLI catalog changes, update this file only.

Verified 2026-11-14 against the installed CLI catalogs: Codex `0.167.0`, Claude Code `2.1.325`,
Grok `1.0.77`.

## Repo-work tiers

| Tier | Model ID | Efforts (catalog default) | Working context |
|---|---|---|---|
| Codex frontier | `gpt-6-astra` | low to max, ultra (medium) | 272k |
| Codex workhorse | `gpt-6.1-sol` | low to max, ultra (low) | 500k |
| Claude Fable | `claude-fable-5-2` (alias `fable`) | low to max | 1M |
| Claude Opus | `claude-opus-5-5` (alias `opus`) | low to max | 1M |
| Grok | `grok-4.7` | low to xhigh (high) | 256k |

- Always pass the model flag. An unflagged Codex command inherits the host's
  `~/.codex/config.toml`, which the repository does not set.
- Launch Claude tiers by alias. A review gate records the resolved ID, not the alias.
- `ultra` delegates to subagents. It is a separate execution system, not a higher effort.
- Any other catalog entry is not a tier until `AGENTS.md` names one for it.

## Models for evals and tests

Use this set when a test or an evaluation needs an answering client or a comparison across
clients.

| Role | Model | CLI | Model flag |
|---|---|---|---|
| Default | Claude Sonnet 5.5 | Claude Code | `--model sonnet` (`claude-sonnet-5-5`) |
| Default | GPT-6.1 Terra | Codex | `-m gpt-6.1-terra` |
| Default | Grok 4.7 | Grok | `--model grok-4.7` |
| Add where it helps | Claude Opus 5.5 | Claude Code | `--model opus` (`claude-opus-5-5`) |
| Add where it helps | GPT-6.1 Sol | Codex | `-m gpt-6.1-sol` |

- Haiku and GPT-6 Luna are out of every test and eval: they are less common and too inconsistent
  to weigh.
- **Run on `hc` agents first.** Drive these models through the subscription CLIs above, as `hc`
  children, against the local server (`npm run dev:eval`). Use an API-billed path (Cloudflare AI
  Gateway, a provider API) only when no CLI path can do the job, and record the reason in the
  round ledger.
- A frozen measurement contract keeps the models it names: a registered battery's answering set,
  a judge, and the public Playground models in `src/demo/model-config.ts`. Changing one is a
  reviewed measurement change under the `run-evals` skill, not a roster edit.

## Launch lines

Each lane is a background `hc` child with its first task on the launch line. Replace `<lane>`,
`<worktree>`, `<model>`, and `<task>`. Keep the task to one line that points at a brief file.

```sh
hc run --bg --name <lane> --cwd <worktree> codex --no-daemon -m <model> -c 'model_reasoning_effort="high"' -c 'sandbox_workspace_write.network_access=true' -a never -s workspace-write "<task>"
hc run --bg --name <lane> --cwd <worktree> claude --model <alias> --effort high --permission-mode bypassPermissions "<task>"
hc run --bg --name <lane> --cwd <worktree> grok --model grok-4.7 --reasoning-effort high --always-approve "<task>"
```

- **Codex** needs `--no-daemon` under `hc`. Its `workspace-write` sandbox cannot write under
  `.agents/` or commit to the shared `.git`. Have it write findings to the ignored `tmp/`
  directory, then copy and commit them yourself. With `-a never` it cannot approve MCP tool
  calls, so it cannot repeat an authenticated Raven connector check.
- **Grok** `--always-approve` can be denied as an unsafe launch when a Claude Code orchestrator
  runs in auto mode. Do not retry. Treat the tier as unavailable and apply the fallback rule in
  `AGENTS.md`, or ask the owner to launch it.

## How to re-verify

The CLIs cache their catalogs on disk. These reads are offline:

```sh
codex --version && jq '.client_version, (.models[]|{slug, visibility, description, context_window, default_reasoning_level, efforts:[.supported_reasoning_levels[].effort]})' ~/.codex/models_cache.json
grok --version && jq '.grok_version, (.models[].info|{id, description, context_window, efforts:[.reasoning_efforts[]|{id, default}]})' ~/.grok/models_cache.json
claude --version && claude --help | grep -A4 -- '--model\|--effort'
grep -E '^(model|model_reasoning_effort)' ~/.codex/config.toml
```

Two reads use the network. `grok models` is the only source for the Grok CLI default. For a
Claude alias, run `claude -p --model <alias> --output-format json "Reply ok" | jq '.modelUsage|keys'`
and read the `claude-<family>-*` key.

- Map tiers from the catalog description, not the name. Codex family names change meaning
  between generations.
- Working context is the catalog's `context_window`, not `max_context_window`.
- A catalog entry proves a model is selectable, not that a call works. Before you bind a new ID,
  run one short review with it as an `hc` lane.
