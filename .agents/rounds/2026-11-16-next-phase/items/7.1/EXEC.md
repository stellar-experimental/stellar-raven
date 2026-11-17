# Item 7.1 execution record (Claude Sonnet 5.5)

Branch `np/7.1-case-search-guard`, five commits on `131c6c1c`, not pushed, no pull request. I opened no
case file, ran no QA lint and no model-calling eval; the one model call was the hook probe. This
folder (`items/7.1/`) is still untracked, as it was at the start; the lead decides what to commit
from it.

| Commit | Step |
|---|---|
| `a4729160` | 1 runners |
| `d93a34fd` | 2 `.ignore` files, layout and rg tests, CI ripgrep |
| `7b048e4c` | 3 hook, settings, `.gitignore`, tests |
| `d42f829f` | 4 ratchet |
| `215598c4` | 5 rule text and 6 DECISIONS.md |

## Per step

**1. Runners.** `eval/run-routing.mjs` and `eval/run-protocol-history.mjs` print aggregates only;
`--rows` adds the holdout and protocol-history per-row tables. The results file still holds every
row; exit codes are unchanged. The holdout card-resolution error now names a case position and card
position, never a case id or card (it was `run-routing.mjs:261`). `test/run-routing-manifest-evidence.test.mjs`
is rewritten: it derives the held-out ids from the five case files, counts exact-token occurrences
in stdout plus stderr, and asserts 0 by default and more than 0 under `--rows`; the assertions hold
counts only. `eval/README.md` gained "Row output". The TODO item is removed from `.agents/TODO.md`.
Verified the counter on the old runner: 61 occurrences before, 0 after.

**2. `.ignore` files.** Exactly the plan's three files and entries. `test/case-search-ignore.test.mjs`:
layout (exact entry lists, anchored one-component entries, each present or git-ignored, checked with
a trailing slash) and a real-ripgrep canary-tree behavior test (no ignored path from root, `eval`,
`eval/qa`, `.agents`, `.agents/rounds`, by argument and by cwd, with and without `--hidden`; the
visible files still print; an explicit path prints). It fails when `CI` is set and `rg` is missing,
and skips with a printed reason locally. I confirmed it fails when an entry is dropped. CI
(`.github/workflows/ci.yml`) gets an "ensure ripgrep" step before `npm test`
(`command -v rg || { sudo apt-get update && sudo apt-get install -y ripgrep; }`).

**3. Hook.** `scripts/agent-hooks/case-search-guard.mjs` (Node built-ins only), `.claude/settings.json`
(`PreToolUse`, matcher `Bash|Grep`, `node "$CLAUDE_PROJECT_DIR"/scripts/agent-hooks/case-search-guard.mjs`,
`timeout` 5), `.gitignore` negation `!.claude/settings.json`. All finding 4 and 6 rules are in:
quote-aware segmentation, `grep`/`rg` as command word after env assignments and wrappers, the
per-segment `CASE_TEXT=maintenance` opt-in, `--dereference-recursive` and `-d recurse`, positive
`-g`/`--glob`/`--iglob` matching a listed name (negated pass), shell globs over `eval/` and
`.agents/`, `$(...)`/backtick file lists, `xargs` and `find -exec`, and `git grep` allowed only with
an exclusion for every entry (`:!` or `:(exclude)`). Entries load from the three `.ignore` files at
run time. Tests (`test/case-search-guard.test.mjs`, 132 table rows plus process and wiring tests):
must-deny and must-pass tables including every addition the plan names, per-segment opt-in, cwd
effects, the Grep tool branch, fail-open input, a subprocess test piping real payloads (deny JSON,
empty output on pass, exit 0 and at most one stderr line on garbage), and wiring (settings parse, one
group, `$CLAUDE_PROJECT_DIR` command, short timeout, script and settings tracked and not ignored,
built-in imports only).

Contract used (Claude Code 2.1.326): payload on stdin with `tool_name`, `tool_input`, `cwd`; a deny
is exit 0 with `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"..."}}`;
internal errors exit 0 with one stderr line. The live probe below confirms it.

**4. Ratchet.** `eval/qa/case-text-scan.mjs` (golden and `truth.notes`, 8-word shingles in at most
two cases, `git ls-files -co --exclude-standard`, paths under the `.ignore` entries skipped, output
paths and counts), `eval/qa/case-text-baseline.json` (the five files at or above 50, ceilings
current + 25%, at least +10: 407, 188, 142, 102, 65), `test/case-text-scan.test.mjs` (repository check
with a 30 s timeout; synthetic corpus for counting, the three-case filter, `.ignore` skipping,
breach messages, headroom). The failure help says to cite the case id and field and that a
corpus-changing PR may raise a ceiling with a `reason`. Cost in `npm test`: about 3 s, under the 5 s
line, so no stop.

**5. Rule text.** `AGENTS.md` hard rule (the `rg --hidden -g '!.git'` form, the never-list, the
`git grep` fallback with the README pathspec, maintenance-lane-only opt-in); `eval/qa/README.md`
new section "Searching without reading case text" under "Held-out split" (layout table, how to search,
the exact `git grep` exclusion, the hook, the opt-in, what the guard does not stop, the ratchet and
its 50-shingle limit); one paragraph in the `golden-truth` skill; one line in `scripts/README.md`.
No new npm command, so `CONTRIBUTING.md` "Checks" is unchanged.

**6. DECISIONS.md.** New section "Follow-up answers (2026-11-17, after item 6.3)" with the three
owner answers verbatim from 7-COMMON, before "Timing".

## Gates (each run bare; output captured to files under `tmp/`)

- `npm run typegen` first (a fresh worktree has no `env.d.ts`), then `npm run typecheck`: exit 0.
- `npm test`: exit 0. 172 files passed, 5 skipped; 3894 tests passed, 3 expected fail, 5 skipped.
  I ran it with a `tmp/bin/rg` shim on `PATH` (the Claude binary as `rg`, as the shell function does),
  so the ripgrep behavior test ran; without a real `rg` those tests skip locally.
- `npm run build`: exit 0 (dry run, Total Upload 8803.75 KiB). `git diff 131c6c1c HEAD -- src catalog wrangler.jsonc package.json package-lock.json public`
  is empty, so no Worker bytes change; no deploy needed.
- `npm run eval:selftest`: exit 0, all checks passed.
- `npm run eval:routing -- --gate`: exit 0, GATE PASS. Count script over stdout and stderr (81 ids from
  `holdout-cases.json` and the four protocol-history files, exact-token match): 0 occurrences.
- `npm run secrets:scan -- --tree`: exit 0, clean. Every commit also passed the pre-commit scan.
- The QA lint was not run.

## Live hook probe

After the hook commit I started `hc` child `7.1-hook-probe` (`t1wt`, Claude Sonnet 5.5, high,
`--dangerously-skip-permissions`) in the worktree, with the brief's launch line and prompt. It ran
`grep -r CANARY scripts/agent-hooks` and `rg --hidden -g '*.json' CANARY eval` with Bash. **Both were
denied**: "PreToolUse:Bash hook error: Blocked: this search would reach case-bearing paths ... See
eval/qa/README.md, "Held-out split". (rule: recursive grep)" and "(rule: positive rg glob that reaches
a listed path)". It reported `/home/tyler/code/raven-wt/np-7.1/tmp/probe-result.txt` (exact results
there). No trust dialog appeared. I killed and removed the child (`t1wt`, my own). The Grep tool
branch was not probed live (no Claude session on this box has the tool); the README says so and the
rule names `rg`.

## Tool findings (no model call)

- Plain `bash -c 'command -v rg'` finds nothing; `rg` is a Claude Code shell function (Claude binary
  as ripgrep 14.1.1). Node `spawnSync("rg")` is `ENOENT` here.
- Codex 0.169.0 ships `rg` 15.2.0 at `.../codex-linux-x64/vendor/.../codex-path/rg`; I did not verify
  that it is on a Codex shell's `PATH`. Grok 1.0.88 ships no separate `rg` file; its binary
  references ripgrep internally (search tool), not verified for a lane's shell.
- **Codex hook contract.** Codex 0.169.0 has a Claude-shaped hook mechanism: events `pre-tool-use`,
  `permission-request`, `post-tool-use`, others; `hooks.json` and a `CodexHooks` feature flag; hook
  trust baseline. A `PreToolUse` hook returns `hookSpecificOutput` with
  `permissionDecision: "deny"`; per the strings embedded in the binary, `deny` needs a non-empty
  `permissionDecisionReason`, and `allow`, `ask`, `decision: approve`, `continue: false`, `stopReason`
  and `suppressOutput` are rejected as unsupported. The guard's output
  already has that shape, so the same script could serve if Codex's payload carries `tool_name`
  `Bash` and `tool_input.command`. I could not confirm Codex's shell tool name or payload fields
  without a model call or its docs. Wiring Codex stays a report proposal.
- Grok 1.0.88's binary contains a hooks dispatcher (`xai_grok_hooks`); the plan said Grok shows none.
  Not investigated further.

## Deviations from the plan

1. **`eval/lib/protocol-history-report.mjs` (new).** The two v2 protocol-history contracts are
   `source-expired` against the current manifest, so the runner scores nothing and cannot be tested
   end to end. I moved the console report into a small module and tested it with synthetic sets
   (`test/protocol-history-report.test.mjs`). Behavior is as planned.
2. **Holdout error text.** It names a case position and card position and the match count; it drops
   the card string as well as the id (the plan said index and card count).
3. **Hook scope beyond the plan's list**, all fail-safe: `bash -c`/`sh -c`/`eval` strings and
   command substitutions (including in unquoted heredoc bodies) are analyzed as commands; a literal
   `cd` updates the working directory for later segments; globs match case-insensitively and test
   every path suffix of an entry, and a glob counts only when the search scope is an unset or
   ancestor path of the listed entry (so `rg -g '*.json' X src` and an explicit path into a case
   folder pass). The glob rule covers folder entries as well as file entries.
4. **Ratchet CLI.** `--check` exists but has no npm script and no CI line; `npm test` is the gate.
5. **Imported guard module.** `case-text-scan.mjs` imports `loadEntries` from the guard so the
   `.ignore` list has one reader.

## Residuals and report items

- Existing error texts outside this diff can still carry a case id: malformed-contract throws in
  `eval/lib/protocol-history-source-epoch.mjs` (`${path} ${testCase.id} ...`) and the stale-list throw
  in `eval/lib/confirmation-only.mjs` (`lists "${id}"`). They fire only on a malformed contract or a
  stale overlap list.
- The hook does not stop `cat`, Read, `git diff`/`show`/`log -p`, an explicit path, or non-Claude
  lanes (README lists them). `ag`, `ack` and `ugrep` are not covered.
- For the lead's report, as the plan lists: replace the 7-COMMON pathspec line for 7.2 and 7.3 (the
  hook now denies `git grep` without the full exclusion; `rg --hidden -g '!.git' <pattern> [path]`
  is the form); check `.claude/` on the Mac before pulling (committed `settings.json` vs an
  untracked one); worktrees branched before merge have no hook; the Codex review should read the hook
  as repository code that runs in every Claude session, including a checked-out PR branch. Deferred
  proposals: move the generated case files into one folder (closes the `rg -g` file-entry hole at the
  source), Codex hook wiring, the ledger-only flush PR, `gca-eval` results move. The flush (old step 6)
  and the main-checkout `tmp/` archive (g) were not part of this work.

## Codex reconciliation

Commit `6bcee358`. The brief's decisions are adopted for all eight findings. Scope principle stated in
the hook header and in `eval/qa/README.md`: the guard stops accidental, ordinary forms; a deliberate
bypass is out of scope; where scope cannot be established it denies the risky form; parse errors
fail open.

1. **Env prefixes and wrappers.** The tokenizer now marks an assignment only when its name was
   unquoted, so `LC_ALL="C"` stays an assignment and a quoted command name stays a command;
   backslash-newline is removed (also inside double quotes). Each wrapper has its own option table
   and mode (`sudo`, `doas`, `command` with `-v`/`-V` as a query that passes and `-p` as a run,
   `builtin`, `exec`, `nohup`, `setsid`, `nice`, `ionice`, `stdbuf`, `timeout` with its duration,
   `time`, `xargs`, `env` with `-i`, `-u`, `-C`, `-S`, `-P`). The opt-in is the last effective
   `CASE_TEXT` assignment; `env -i`/`-u` clear it. Tests: all five forms in the review plus the
   duplicate-assignment case, `xargs -0/-n/-P/-I`, `timeout`, `nice`, `sudo -u`, `env -S`, `env -C`.
2. **Globs and paths.** Each token keeps a glob pattern in which quoted metacharacters are escaped, so
   `"eval/qa/"*.json` is active. A positional with an active glob is denied when its pattern, resolved
   per working directory, could match a listed entry or a path inside a listed folder, component by
   component (so `*/*/*.json` and `eval/*/cases.json` deny, `rg X eval/discovery/*.mjs` and `rg X src/*`
   pass). `$PWD`/`${PWD}` resolve to the cwd, `~`/`$HOME` to the home folder; any other expansion is a
   wildcard, and an unresolved expansion in a search path counts as covering every entry for the glob
   rule (`rg -g '*.json' X "$SOMEWHERE"` denies). Tests include safe `src` scopes. Deviation: a plain
   `rg X .agents/*` now passes (it expands to `.agents/rounds` and files, a folder rg traverses with the
   `.ignore`); `.agents/rounds/*` still denies because it names the listed folders. The 7.1 table had
   the former as a deny.
3. **Working directory.** The hook collects every cwd the line could have (the start directory and each
   `cd`/`pushd` target, anywhere: subshells, substitutions, `bash -c` strings; an unresolvable target is
   an unknown directory) and tries every segment and substitution against each; any deny denies. `git`
   applies every `-C` in order with correct operand handling; `:(top,exclude)` resolves only its own
   pathspec from the top. Tests: the review's two commands, nested `cd`, `env -C`, unknown cd target,
   git `-C . -C eval`, and `-C eval` with top-resolved pathspecs. Accepted cost: `cd /tmp && rg -g
   '*.json' X` denies because the start directory is also tried.
4. **Heredocs into a shell.** A heredoc is attached to its command. For `bash`, `sh`, `zsh`, `dash`, `ksh`
   without `-c` and without a script file (or with `-s`), its body, quoted or not, and a `<<<` here-string
   are analyzed as commands with the segment's env, so the opt-in propagates. Heredocs fed to `cat`,
   `git commit -F -`, `gh ... --body-file -`, `tee`, `bash script.sh` and `bash -c '...'` stay inert.
   Tests for both.
5. **Ratchet on malformed JSON.** Each corpus file is parsed in a try/catch that throws a fresh error
   without a cause: "malformed battery case file #N of M in folder <category>". Deviation: position and
   category folder instead of the path, because a corpus file name is a case id. The CLI catches it and
   prints `case-text scan failed: ...`, exit 1. A `--repo <dir>` flag lets the tests scan a synthetic
   checkout. Tests: in-process error (no marker, no cause) and subprocess through the API and the CLI
   (`--check` too), plus valid JSON that is not a case; marker absent from stdout and stderr.
6. **Ratchet file list.** `git ls-files -z -co --exclude-standard`, split on NUL. A listed file that was
   deleted from the working tree is skipped explicitly (ENOENT); symlinks and folders are skipped by
   `lstat` (this repository tracks `.claude/skills` as a symlink); any other stat or read error fails the
   scan. Diagnostics print a file name as is when it is plain printable ASCII and JSON-quoted otherwise,
   so no raw newline or quote forges a line. Tests: non-ASCII, quote, newline and space names each count 63;
   deleted file and symlink skipped; diagnostic lines hold no newline.
7. **Runner errors.** `eval/lib/read-json.mjs` makes every runner JSON read name the file only (both
   runners, every case, gate, manifest and overlay-list read, and the confirmation-only list).
   `protocol-history-source-epoch.mjs` validation errors name a file and `<role>Cases[<index>]`;
   the confirmation-only stale-list error names a set and a list position; `--dump-ranked` no longer prints
   a repeated id. Tests (`test/runner-error-text.test.mjs`): marker counts over each error, plus the real
   runner on an invalid manifest file (exit 1, marker absent). `confirmationOnlyFor` takes an optional
   `list` so the test can pass a synthetic one. `eval/README.md` "Row output" now says exactly this, and
   names the residual: an overlay (`build-question-overlay.json`) warning or duplicate-id error still
   prints a legacy routing case id, which is not a held-out id; result files, `--rows` output and a
   `--dump-ranked` file hold ids.
8. **Minor.** `grep` long options accept any unambiguous prefix (`--rec`, `--recur`, `--dereference`,
   `--dir=recurse`); `command -v`/`-V` pass; `CASE_TEXT=maintenance bash -c '...'` passes, and does not reach
   outer command substitutions (tested). Ordered negative globs keep the conservative deny, documented in
   the hook header and the README as an accepted false positive.

Tests added or extended: `test/case-search-guard.test.mjs` (now 237 table rows plus process and wiring
tests), `test/case-text-scan.test.mjs`, `test/runner-error-text.test.mjs` (new).

Gates (bare, captured to `tmp/`): `npm run typecheck` 0; `npm test` 0 (173 files passed, 5 skipped; 4012
tests passed, 3 expected fail, 5 skipped; run with the `tmp/bin/rg` shim on `PATH`, as before); `npm run
build` 0; `npm run eval:selftest` 0; `npm run eval:routing -- --gate` 0, GATE PASS, id count over stdout
and stderr 0; `npm run secrets:scan -- --tree` 0. `git diff 131c6c1c HEAD -- src catalog wrangler.jsonc
package.json package-lock.json public` is still empty, so no deploy.

Codex's probe (`node tmp/codex-review-probes.mjs`), new verdicts: all 13 command forms from the review
now deny (the hook verdict is `deny:true`; rules: recursive grep, xargs, shell glob, positive rg glob,
rg flag that drops ignore, git grep without an exclusion); the control `rg --hidden -g "*.md" CANARY
.agents` passes. Ratchet counts: `plain.md` 63, `résumé.md` 63, `quoted"name.md` 63 (were 63, 0, 0).
Malformed corpus file: exit 1, synthetic marker absent from stderr (was present). The probe's `exit` and
`canaryOccurrences` fields show 0 for `rg` forms because bare `bash -c` has no `rg` on this box.

No fix needed a case file opened. Not re-probed live: the hook was not re-run in a model child; the live
probe from the first pass covered the committed wiring, which this change does not touch.

## Codex re-check reconciliation

Commit after `6bcee358` (`git log` on the branch); all four findings adopted as the brief decided.
Changes are in `scripts/agent-hooks/case-search-guard.mjs` and `test/case-search-guard.test.mjs`.

1. **`env -C` into a nested shell.** `cwdShift` is now `cwdShifts`, a list applied in order (so
   `env -C src env -C ../eval ...` resolves to `eval`). The analysis is scoped: `scopeVerdict` collects
   `cd` targets of a text, then tries every segment against every directory; a script run by a command
   that shifts the directory (`env -C ... bash -c`, a heredoc fed to a shell, `env -S`) is its own scope that
   starts from the shifted directories, so the shift resolves before any relative `cd` inside it. An
   unresolvable shift (`env -C "$X"`) makes the directory unknown (null), which counts as covering
   every entry. Tests: both commands in the finding, the double `env -C`, `cd ..` inside the script, a
   heredoc under `env -C`, the unknown shift; safe controls `env -C src bash -c 'rg X .'` (with and without
   a `-g` glob) and `env -C eval/qa bash -c 'echo hi'`.
2. **`timeout`.** Wrapper option parsing is separate from the required operand: after the options and an
   optional `--`, `timeout` consumes its duration, then the command resolves. Tests: `timeout -- 5 grep -r`,
   `timeout -k 1 -- 5 rg -u X`, `timeout --foreground -- 5 grep -r`; passes `timeout -- 5 npm test`,
   `timeout -k 1 -- 5 echo hi`, `timeout 5 npm test`.
3. **Brace globs.** `expandBraces` expands alternatives (nested groups included, a group needs a top-level
   comma, escaped braces skipped, capped at 64 results; over the cap is an unknown, risky scope) on the
   token's glob pattern before the path resolves and splits into components, for shell-glob positionals
   and for `-g` scope paths. `globToRegExp` treats a `{` with no later `}` as a literal, and every compile
   goes through `safeRegExp`: a glob that cannot be compiled is a risky, unknown scope (deny), never an
   exception. Tests: `grep`/`rg CANARY {eval/qa,src}/*.json`, nested braces, `rg -g '*.json' X {src,eval}`,
   an over-cap expansion deny; pass `rg X {src,test}/*.ts`, `grep X {src,test}/*.ts`,
   `rg -g '*.json' X {src,test}`, nested safe braces, an unmatched `{`; and a never-throws test over odd
   glob syntax.
4. **Heredoc substitution offsets.** `skipSubstitution` now takes the string it scans, so the matcher
   used for an unquoted heredoc body works on offsets into that body. Tests: the finding's interpolated
   `cat <<EOF_DOC` document passes (also with backticks and with two substitutions); deny for a real
   `grep -r` in a heredoc `$()` and in backticks, after a benign substitution, and `rg -u` in backticks.

Gates (bare, captured to `tmp/`): `npm run typecheck` 0; `npm test` 0 (173 files passed, 5 skipped; 4045
tests passed, 3 expected fail, 5 skipped; `tmp/bin/rg` shim on `PATH`); `npm run build` 0; `npm run
eval:selftest` 0; `npm run eval:routing -- --gate` 0 with GATE PASS and an id count of 0 over stdout and
stderr; `npm run secrets:scan -- --tree` 0. `src`, `catalog`, `wrangler.jsonc`, the package files and
`public` are still unchanged against `131c6c1c`: no deploy.

Probe verdicts (`PATH="$PWD/tmp/bin:$PATH"`; real `rg` through the shim):
- `tmp/codex-review-probes.mjs`: all 14 command rows deny, the `.agents` Markdown control passes; ratchet
  counts 63, 63, 63; malformed corpus exits 1 with no marker in stderr.
- `tmp/codex-recheck-probes.mjs`: the four re-check commands deny and the hook process matches the pure
  decision (`hookDeny` true, `failedOpen` false): both `env -C ... bash -c` forms, `timeout -- 5 grep -r`,
  both brace globs and `eval/{qa,discovery}/*.json`. The interpolated `cat <<EOF` document passes (no
  search runs, 0 canaries); the three heredoc-substitution searches, with and without a benign
  substitution first, deny. Expected passes, unchanged: the control `rg -g '*.json' CANARY src`, the
  quoted-document heredoc, `git -Csrc -C../eval grep ...` (git rejects the glued form; 0 canaries), and
  `CASE_TEXT=maintenance bash -c 'unset CASE_TEXT; grep -r ...'` (an explicit opt-in followed by an unset,
  a deliberate bypass the scope principle leaves out). Timings: decisions 0.1 to 1.5 ms, hook processes 24 to 35 ms for 200-line
  commands; no timeouts, no stderr.

No fix needed a case file opened.
