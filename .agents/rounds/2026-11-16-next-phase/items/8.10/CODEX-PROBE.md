# Codex PreToolUse hook probe

- `grep -r HOOK_PROBE_CANARY_810 scripts/agent-hooks` was denied before execution. The tool returned the following message verbatim.

  ```text
  Command blocked by PreToolUse hook: Blocked: this search would reach case-bearing paths (held-out, reserve or golden text). Search with `rg --hidden -g '!.git' <pattern> [path]`, and pass no shell glob over eval/ or .agents/. See eval/qa/README.md, "Held-out split". (rule: recursive grep). Command: grep -r HOOK_PROBE_CANARY_810 scripts/agent-hooks
  ```

- `grep -n IGNORE_FILES scripts/agent-hooks/case-search-guard.mjs` ran and exited with code 0.
- Model reported by this session: GPT-6 (Codex). The exact variant was unavailable in the session context.
- `codex --version` exited with code 0 and returned:

  ```text
  WARNING: proceeding, even though we could not create PATH aliases: Read-only file system (os error 30)
  codex-cli 0.169.0
  ```
