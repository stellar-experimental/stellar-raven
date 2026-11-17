# Item 7.1 executor brief, part 2: reconcile the Codex review

The required Codex frontier review (`/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/CODEX-REVIEW.md`, verdict FAIL) found seven major and one
minor defect. The lead adopts all of them with the decisions below. Same worktree, branch and rules as
`/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/briefs/exec.md` (read its "Rules" again; the hook now applies to you: search with
`rg --hidden -g '!.git'`). Codex's reproducer is `/home/tyler/code/raven-wt/np-7.1/tmp/codex-review-probes.mjs` (synthetic scratch
repo only); use it and turn every command in the review into a table or canary test.

Scope principle, to state in the hook's header and in eval/qa/README.md: the guard stops accidental,
ordinary command forms; a deliberate bypass is out of scope. Where the guard cannot establish scope,
it denies the risky form (positive glob, recursive grep, shell glob) rather than allowing it. Parse
errors still fail open.

1. **Env prefixes and wrappers.** Distinguish a quoted assignment value from a quoted command name;
   remove backslash-newline continuations; give each wrapper its own option table and modes
   (`command -p` runs, `command -v`/`-V` only queries and passes; `env -i`, `env -u NAME`;
   `xargs -r`, `-0`, `-n N`, `-I X`, `-P N`; `timeout`, `nice`, `sudo`). The opt-in uses the
   effective last assignment of `CASE_TEXT`. Deny all five forms in finding 1 plus the duplicate
   assignment case.
2. **Globs and paths.** Track unquoted metacharacters per token even when other parts are quoted
   (`"eval/qa/"*.json`). A positional with an active glob is denied when the pattern, resolved against
   the effective cwd, could match a protected entry or a path inside a protected folder, including
   wildcards in ancestor components (`*/*/*.json`). `$PWD`/`${PWD}` resolve to the cwd, `~`/`$HOME` to
   the home folder; any other unresolved expansion in a search path is an unknown scope, which counts
   as covering every entry for the glob rules. Keep `rg X src`, `rg -g '*.json' X src` passing.
3. **Working directory.** Be conservative: keep the set of every cwd the command line could have
   (the start cwd plus each `cd` target, including inside subshells and substitutions) and evaluate
   every segment and every substitution against each; deny if any denies. For git, apply every `-C`
   in order and consume global-option operands correctly; `:(top,exclude)` resolves only its own
   pathspec from the top.
4. **Heredocs into a shell.** When a heredoc (quoted or not) feeds a shell (`bash`, `sh`, `zsh`,
   `dash`, `ksh` without `-c` and without a script-file argument, or `bash -s`), analyze its body as
   commands, with the segment's env (so the opt-in propagates). Heredocs fed to `cat`, `git commit -F -`,
   `gh … --body-file -` and the like stay inert. Tests for both.
5. **Ratchet on malformed JSON.** Catch parse and validation errors per corpus file and replace them
   with a path-only diagnostic; never keep the original error as a printable cause; both the exported
   API and the CLI. Subprocess regression with a synthetic private marker: non-zero exit, marker absent
   from stdout and stderr.
6. **Ratchet file list.** `git ls-files -z -co --exclude-standard`, split on NUL; escape names in
   diagnostics; an unexpected read error fails the scan (a listed-but-deleted file is skipped
   explicitly). Synthetic tests for non-ASCII, quote and newline names.
7. **Runner errors.** Sanitize at the source: the protocol-history contract validation in
   `eval/lib/protocol-history-source-epoch.mjs` and the stale-list error in `eval/lib/confirmation-only.mjs`
   name file and position, never an id or question; case-file JSON parse errors in both runners name
   the file only. Keep exit 1. Synthetic tests that count leaked markers. Make `eval/README.md`
   "Row output" match exactly what the code guarantees.
8. **Minor.** Deny unambiguous abbreviations of `--recursive` and `--dereference-recursive` that GNU
   grep accepts (`--rec` and longer, `--dereference`… prefixes that are unambiguous); `command -V` /
   `-v` pass; `CASE_TEXT=maintenance bash -c '…'` passes (env propagates into the child script, not
   into outer command substitutions). Ordered negative globs (`rg -g '*.json' -g '!eval/**' …`): keep
   the conservative deny and document it as an accepted false positive; the message's `rg X src` form
   is the substitute.

Then: run the full gates again bare (typecheck, test, build, eval:selftest, the routing gate with the
id count over stdout and stderr, secrets scan), re-run Codex's probe script and record its new
verdicts, commit with the normal hooks, and append a "Codex reconciliation" section to `/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/EXEC.md`
(each finding: what changed, which tests, any deviation). If a fix would need a case file opened,
stop and report. When done: `hc send t1wn '/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/EXEC.md'`
