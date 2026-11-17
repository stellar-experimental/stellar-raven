# Item 7.1 executor brief, part 3: the Codex re-check

Codex's re-check (`/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/CODEX-RECHECK.md`) confirms the eight original findings fixed and finds four
more. Adopt all four, same rules as before:

1. `env -C DIR` (and any wrapper cwd shift) must carry into a nested shell script's analysis, before
   any relative `cd` inside it; unknown when it cannot be resolved. Deny tests for both commands in
   the finding, plus a safe scoped control.
2. `timeout`: parse options, then `--`, then the required duration, then the command. Deny
   `timeout -- 5 grep -r CANARY eval` and `timeout -k 1 -- 5 rg -u X`; pass a harmless wrapped command.
3. Brace globs: expand brace alternatives (bounded; nested braces fine, cap the count) before splitting
   into path components. If an active glob still cannot be compiled, treat that positional as an
   unknown, risky scope and deny the search segment rather than throwing. Deny
   `grep CANARY {eval/qa,src}/*.json` and `rg CANARY {eval/qa,src}/*.json`; pass `rg X {src,test}/*.ts`.
4. Heredoc substitution scanning: pass the scanned string to the substitution matcher and use offsets
   in that string. Pass the finding's interpolated `cat <<EOF_DOC` document; keep deny tests for a real
   search inside a heredoc substitution, for both `$()` and backticks.

Run Codex's two probe scripts (`tmp/codex-review-probes.mjs`, `tmp/codex-recheck-probes.mjs`, with
`PATH="$PWD/tmp/bin:$PATH"`) and record their verdicts, then the full gates bare, commit with the normal
hooks, and append a "Codex re-check reconciliation" section to `/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/EXEC.md`. When done:
`hc send t1wn '/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/EXEC.md'`
