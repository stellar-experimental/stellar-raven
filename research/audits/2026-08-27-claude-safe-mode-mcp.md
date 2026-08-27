# Claude safe mode and explicit MCP — 2026-08-27

## Finding

Claude Code 2.1.247 drops explicit HTTP MCP servers when `--safe-mode` is active.
The local help states that safe mode disables MCP servers.
Inspection of the installed bundle confirms that it drops non-SDK servers from `--mcp-config`.

The connector qualification used both flags and failed after one paid call.
The saved row reported no MCP servers and a protocol failure for the required `raven` server.
The call cost `$0.0479258`, and the harness suppressed all aggregates.

## Decision

Answering and discovery agents use an empty temporary directory outside the repository.
They use `--setting-sources ""`, `--disable-slash-commands`, and `--strict-mcp-config`.
They do not use `--safe-mode`.

Judge agents keep `--safe-mode` because they do not use MCP.
The artifact schema is `qa-agent-result-v4` for this isolation contract.
