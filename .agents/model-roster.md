# Agent model roster

`AGENTS.md` names role tiers and the eval and test model set by family. This file maps each family
to how a launch line selects its newest model. Nothing here pins a version: a run takes the
family's newest model and records the exact ID it resolved. A run on a different resolved model is
a different measurement.

## Repo-work tiers

| Tier | Family | Efforts | Working context |
|---|---|---|---|
| Codex frontier | Astra (`scripts/latest-model.mjs astra`) | per catalog | per catalog |
| Codex workhorse | Sol (`scripts/latest-model.mjs sol`) | per catalog | per catalog |
| Claude Fable | `fable` alias | per catalog | per catalog |
| Claude Opus | `opus` alias | per catalog | per catalog |
| Grok | `scripts/latest-model.mjs grok` | per catalog | per catalog |

- Always pass the model flag. An unflagged Codex command inherits the host's
  `~/.codex/config.toml`, which the repository does not set.
- Claude Code takes the family alias and serves the newest model. Codex and Grok have no alias, so
  `scripts/latest-model.mjs <family>` reads the CLI's offline catalog cache and prints one ID. It
  exits non-zero with a reason when the cache is missing or has no match, and prints the cache's
  `fetched_at` on stderr.
- **Record the resolved ID for every run, and for a review gate.** Claude: the `modelUsage` key of
  `--output-format json`, or `model` on the stream-json `system/init` line. Codex: the resolver's
  output. Grok: the resolver's output plus the `modelUsage` key it reports, which can be a
  server-side name.
- `ultra` delegates to subagents. It is a separate execution system, not a higher effort.
- Any other catalog entry is not a tier until `AGENTS.md` names one for it.

## Models for evals and tests

Use this set when a test or an evaluation needs an answering client or a comparison across
clients.

| Role | Family | CLI | Model flag |
|---|---|---|---|
| Default | Claude Sonnet | Claude Code | `--model sonnet` |
| Default | Codex Terra | Codex | `-m "$M"`, with `M` from `scripts/latest-model.mjs terra` in the two-step form below |
| Default | Grok | Grok | `--model "$M"`, with `M` from `scripts/latest-model.mjs grok` in the two-step form below |
| Add where it helps | Claude Opus | Claude Code | `--model opus` |
| Add where it helps | Codex Sol | Codex | `-m "$M"`, with `M` from `scripts/latest-model.mjs sol` in the two-step form below |

- Haiku and Codex Luna are out of every test and eval: they are less common and too inconsistent
  to weigh. The Playground fallback model is the one exception (`src/demo/model-config.ts`).
- The eval defaults are family aliases. A run's identity is the exact ID it resolved, stored beside
  the alias it requested (`eval/EVALS.md`). A change of resolved answering or judge model starts a
  new baseline, under the `run-evals` skill.

## Launch lines

Each lane is a background `hc` child with its first task on the launch line. Replace `<lane>`,
`<worktree>`, `<family>`, `<alias>`, and `<task>`. Keep the task to one line that points at a brief
file.

Codex and Grok use the two-step form. A resolver failure then stops the launch. A command
substitution inside the launch line would pass `-m ""`, and an empty Codex model inherits
`~/.codex/config.toml`. The `echo` prints the resolved ID for the orchestrator to record.

```sh
M=$(node <worktree>/scripts/latest-model.mjs <sol|astra|terra>) && echo "resolved: $M" && hc run --bg --name <lane> --cwd <worktree> codex --no-daemon -m "$M" -c 'model_reasoning_effort="high"' -c 'sandbox_workspace_write.network_access=true' -a never -s workspace-write "<task>"
hc run --bg --name <lane> --cwd <worktree> claude --model <sonnet|opus|fable> --effort high --permission-mode bypassPermissions "<task>"
M=$(node <worktree>/scripts/latest-model.mjs grok) && echo "resolved: $M" && hc run --bg --name <lane> --cwd <worktree> grok --model "$M" --reasoning-effort high --always-approve "<task>"
```

- **Codex** needs `--no-daemon` under `hc`. Its `workspace-write` sandbox cannot write under
  `.agents/` or commit to the shared `.git`. Have it write findings to the ignored `tmp/`
  directory, then copy and commit them yourself. With `-a never` it cannot approve MCP tool
  calls, so it cannot repeat an authenticated Raven connector check.
- **Grok** `--always-approve` can be denied as an unsafe launch when a Claude Code orchestrator
  runs in auto mode. Do not retry. Treat the tier as unavailable and apply the fallback rule in
  `AGENTS.md`, or ask the owner to launch it.

## How to re-verify

A family move needs no edit here. Check that the resolver still finds each family when a CLI
renames one:

```sh
for f in sol astra terra grok; do node scripts/latest-model.mjs $f; done
```

The CLIs cache their catalogs on disk. These reads are offline and select model fields only, never
the credential fields the caches also hold:

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
  between generations. Read the description when a new generation lands.
- Working context is the catalog's `context_window`, not `max_context_window`.
- A catalog entry proves a model is selectable, not that a call works. The first lane on a newly
  resolved ID is that check. When resolution or the launch fails, record the reason and take the
  lane's tier fallback.
