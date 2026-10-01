# Agent model roster

`AGENTS.md` routes repository work to role tiers. This file maps each tier to an exact model ID
and its launch flags. When a CLI catalog changes, update this file only.

Verified 2026-09-30 against the installed CLIs: Codex `0.159.2`, Claude Code `2.1.286`,
Grok `1.0.44`, OpenCode `1.18.32`.

## Tier map

| Tier | `--kind` | Model ID | Efforts | Working context |
|---|---|---|---|---|
| Codex frontier | `codex` | `gpt-6-astra` | low, medium, high, xhigh, max, ultra | 272k |
| Codex workhorse | `codex` | `gpt-6.1-sol` | low, medium, high, xhigh, max, ultra | 272k |
| Claude Fable | `claude` | `claude-fable-5-1` (alias `fable`) | low, medium, high, xhigh, max | — |
| Claude Opus | `claude` | `claude-opus-5-5` (alias `opus`) | low, medium, high, xhigh, max | — |
| Grok | `grok` | `grok-4.7` | low, medium, high, xhigh | 256k |

Rules for the table:

- The Codex catalog reports a 272k `context_window` and an 872k `max_context_window`. Use the
  272k figure in fan-out guidance.
- `ultra` delegates to subagents. Treat it as a separate execution system, not as a higher effort.
- Other catalog entries are not tiers. Examples: `gpt-6-luna`, the older `gpt-5.6-*` slugs,
  `gpt-daybreak-blue-latest`, `grok-4.7-build-fast`, and hidden entries such as
  `codex-auto-review`. Add one only after `AGENTS.md` names a tier for it.
- QA answering and judge models are a separate measurement contract (see the `run-evals` skill).
  A change to this file never changes them.

## Launch lines

Split a pane first. Then start the agent in it. Everything after `--` goes to the CLI unchanged.

```sh
herdr agent start <name> --kind codex  --pane <id> -- -m gpt-6-astra -c 'model_reasoning_effort="high"'
herdr agent start <name> --kind codex  --pane <id> -- -m gpt-6.1-sol -c 'model_reasoning_effort="high"'
herdr agent start <name> --kind claude --pane <id> -- --model fable --effort high --permission-mode bypassPermissions
herdr agent start <name> --kind claude --pane <id> -- --model opus --effort high --permission-mode bypassPermissions
herdr agent start <name> --kind grok   --pane <id> -- --model grok-4.7 --reasoning-effort high --always-approve
```

Run `herdr agent` for the installed kind list. It is the authority, not this file.

Grok needs a real terminal. Output redirection to a file fails with `Device not configured`, so
launch Grok reviewers in a pane. A pane agent draws on the alternate screen, and rows that scroll
away are lost. For any review whose findings matter, tell the agent to write its findings to a
Markdown file and to reply with only the path.

## How to re-verify

Each ID, context window, and effort list comes from a catalog that the CLI caches on disk. Read
the catalogs directly:

```sh
codex --version && jq '.client_version, (.models[]|{slug, visibility, description, context_window, max_context_window, efforts:[.supported_reasoning_levels[].effort]})' ~/.codex/models_cache.json
grok --version && jq '.grok_version, (.models[].info|{id, description, context_window, efforts:[.reasoning_efforts[]|{id, default}]})' ~/.grok/models_cache.json
claude --version && claude --help | grep -A4 -- '--model\|--effort'
opencode --version
```

These reads are offline. `grok models` reaches the network. It is the only source for the Grok CLI
default model.

The catalog description tells you the tier. Codex family names change meaning between
generations: the same name can mark a frontier model in one generation and a workhorse in the next.
Map tiers from the description, not from the name.

The catalog shows that a model is selectable. It does not prove that a call works. Before you bind
a new ID to a tier, run one short review with it through a pane.

The public Playground models are a separate surface. `src/demo/model-config.ts` defines them.
