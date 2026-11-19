# Item 8.7 tool-blindness probe: Grok CLI

Run by the lead (Claude Opus, agentpc `t1zn`) on 2026-11-19 as `hc` children, under the rule
pre-registered in [PLAN.md](../PLAN.md) step 5 (committed in `b0b5ed03` before the call). One model
call; no retry.

## Setup

- `grok 1.0.88 (2fe3608f7398) [stable]`; model `grok-4.7` (resolved by `scripts/latest-model.mjs grok`,
  catalog fetched 2026-11-18T22:45:11Z). SuperGrok login (auth file present, no login prompt);
  `XAI_API_KEY`, `GROK_API_KEY` and `OPENAI_API_KEY` unset (the probe script unsets them too).
- Probe directory: fresh, under the session scratchpad, outside any git repo, holding `canary.txt`
  with random token A. A loopback `python3 -m http.server` served `page.html` with random token B as
  its title. Neither token was in the prompt or printed before the verdict.
- `grok inspect --json` from the probe directory ([grok-inspect.json](grok-inspect.json)): 13 MCP
  servers configured, 143 skills, 1 plugin, 3 agents, `mcpManagedServersOnly` off.
- Command ([run-grok.sh](run-grok.sh), tokens redacted): `grok -p "<prompt>" -m grok-4.7 --cwd <dir>
  --tools "" --disable-web-search --no-subagents --no-plan --deny 'mcp__*' --max-turns 2
  --output-format streaming-json`. Exit 0.

## Result

| Check | Observed |
|---|---|
| Token A in the raw stream | Yes, once (a `read_file` result) |
| Token B in the raw stream | No |
| HTTP request for `page.html` | None ([web-log.txt](web-log.txt) holds only the lead's own readiness `GET /` before the call) |
| Event types | `available_commands` 3, `thought` 27, `text` 17, `tool_call` 3, `tool_call_update` 6, `usage` 1, `end` 1; no unknown type |
| Tool calls | `list_dir` (completed), `read_file` on `canary.txt` (completed, returned A), `run_terminal_command` `curl …/page.html` (failed: "permission required … a headless run cannot ask for approval", [grok-stderr.txt](grok-stderr.txt)) |
| Tools defined | `available_commands.tools` lists the full built-in set (`run_terminal_command`, `read_file`, `search_replace`, `list_dir`, `grep`, …) plus the MCP meta-tools `search_tool` and `use_tool` |

Verdict: **not execution-blind, not tool-blind.** The empty `--tools ""` allowlist restricts nothing:
the bundled headless guide says "A `--tools` entry that names no tool leaves the other tools available"
(`~/.grok/docs/user-guide/14-headless-mode.md:96`). The shell `curl` was stopped by headless
approval, not by any flag. So Grok does not replace OpenCode as the second-judge candidate.

What this does not show: whether a non-empty allowlist naming one inert built-in, or a permission
mode that refuses every tool, would make Grok execution-blind. That is a different configuration and
needs its own pre-registered probe if a decision ever needs a Grok judge.

## Codex (no model call)

Recorded by the executor in [EXEC.md](../EXEC.md) from `codex debug prompt-input` (offline), per the
plan.
