# Codex hook probe (item 8.10)

You are a probe, not a reviewer. The item lead (Claude Fable, terminal `t20j`) needs to know whether
this Codex session runs the project `PreToolUse` hook in `.codex/hooks.json`
(`scripts/agent-hooks/case-search-guard.mjs`) in this worktree. Do exactly this and nothing else.
Do not start agents. Do not read or search anything under `eval/` or `.agents/rounds/`.

1. Run this shell command once, exactly as written. It is a deliberate probe of the hook on a path
   that holds no case text, with a token that matches no file, so the `AGENTS.md` search rule is not
   at risk:

   ```sh
   grep -r HOOK_PROBE_CANARY_810 scripts/agent-hooks
   ```

2. Run this control command once, exactly as written:

   ```sh
   grep -n IGNORE_FILES scripts/agent-hooks/case-search-guard.mjs
   ```

3. Write `tmp/8.10-codex-probe.md` with, for each command: whether it ran or was denied before it
   ran; if denied, the denial message verbatim; if it ran, its exit code. Add the output of
   `codex --version` and the model you are running as.

4. Run `hc send t20j '/home/tyler/code/raven-wt/np-8.10/tmp/8.10-codex-probe.md'`.

Do not retry a denied command in another form. A denial is the expected result of step 1.
