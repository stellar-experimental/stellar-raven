# Item 7.1 plan review (Fable)

Reviewer: Claude Fable 5.2, high effort, worktree `np-7.1` at `131c6c1c`. No model call, no
subagent, no other file edited, nothing committed.

**Verdict: reconcile before execution.** One blocker (the flush keep-list), seven major findings,
five minor. The decision itself (b + c + a + e, d rejected) is sound.

**Method.** Counts, sizes, script source, `git grep -l/-c/-o`, and a canary repository in my
scratch directory. No case file was opened. One search went into the case folders on purpose: a
token-only `git grep -o -h` for the two round folder names, because check 2 asks whether a current
artifact cites the files to be removed and the corpus is the main current artifact. Its output was
repository paths and counts; case ids showed as `#<id>` link fragments and as file names. No
question, golden or note text was printed.

## Blocker

**1. The flush removes 25 JSON files that current artifacts cite; the keep-list is 30, not 5.**
- Evidence. The plan's citation search left out the case folders. Inside `eval/qa/corpus/`, 540
  files name the two rounds. `battery/` (238 files) and `retired/` (292 files) cite, as per-case
  provenance (`<file>.json#<case id>`): all 11 `audit/audit-*.json`, all 11 `verify/audit-*.json`,
  `coverage/coverage.json` (182 battery files, 291 retired) and
  `2026-11-02-golden-audit/pass1/soroban-04.json` (1 battery file). `cases.json`, `sample.json`
  and `tool-cases.json` carry the same. That is 24 files on the removal list. A 25th:
  `improvements/stellar-docs/sd-108-…md` cites `map/taxonomy.json` in relative form.
- `.agents/README.md` ("Retention") keeps a record "while a current artifact cites it". The QA
  lint does not test that these paths exist, so CI would stay green and about 530 case files would
  point at nothing.
- Effect on the benefit. The 24 corpus-cited files hold 24,635 of the 40,695 golden shingles
  outside the case folders (60.5%). The files that can go are 84, holding 12,824 shingles (31.5%),
  not 109 files and 92%.
- Fix. Either keep 30 files and remove 84, or take (f) out of this item. Build the list with a
  script that also searches the case folders, token-only, for full, relative and bare-name forms,
  and commit the script and its count output. I lean to taking (f) out: most of the text stays
  anyway, inside a folder that `.ignore` and the hook already cover. Re-pointing corpus provenance
  to a commit would edit about 530 case files; that is a golden-maintenance decision, not this item.

## Major

**2. "Its own commit" does not survive the merge.** `main` is squash-merged (every recent commit
has one parent and a PR number). The code and the deletion would become one commit, so
`git show <sha>`, `gh pr diff` and any diff-reading review tool print megabytes of golden text.
Fix: if (f) stays, give it its own PR after the code PR (both assessors proposed that). Put an
exact diff command with the two round folders excluded in the Codex review brief.

**3. `rg` is not installed on this box.** In a Claude Code Bash session `rg` is a shell function
that runs the Claude binary as ripgrep. `command -v rg` in a plain `bash -c` finds nothing, and
Node `spawnSync("rg")` returns `ENOENT`. CI does not install ripgrep.
- The step 2 test "skipped when `rg` is absent" would skip on this box and, unless the runner image
  ships ripgrep (not checked), in CI. The layout that the whole design rests on would be tested
  nowhere.
- `xargs rg` and `find -exec rg` fail outright here. "Codex and Grok lanes rely on the rule" holds
  only if those CLIs bring their own `rg`.
- Fix: install ripgrep in the CI job and make the test fail, not skip, when `CI` is set and `rg` is
  missing; print the skip reason locally. The executor records `command -v rg` and its version
  from a Codex shell and a Grok shell, and the rule text says what a lane without `rg` does.

**4. The `-g` hole is open for Claude lanes through Bash, and explicit file lists bypass `.ignore`.**
- No Claude session on this box has the Grep tool (both assessors and this review: Bash only). So
  the hook's Grep branch protects nothing here, and searches go through Bash `rg`, which the plan
  leaves unchecked for globs.
- Canary, bundled rg 14.1.1, parent-folder layout. These print the file-level entries
  (`eval/qa/cases.json`, `eval/holdout-cases.json`): `rg -g '*.json' X`, `rg --glob '*.json' X eval`,
  `rg -g '*cases*' X`, `rg --files -g '*.json'`. These print ignored files or folders through
  shell expansion: `rg X eval/qa/*`, `rg X eval/*`, `rg X eval/qa/*.json`,
  `rg --hidden X .agents/rounds/*`, `rg X $(git ls-files)`. Safe: `rg -tjson X`, `rg -g '!*.ts' X`.
- Fix: apply the Grep-branch test to Bash `rg` too (deny a positive `-g`, `--glob` or `--iglob`
  whose pattern matches a file-level entry name; pass negated globs). Add `xargs … rg`,
  `find … -exec rg` and `rg … $(git ls-files)` to the deny list, since a lane denied `git grep`
  will reach for them. Add one clause to the rule: never pass a shell glob over `eval/` or
  `.agents/rounds/` to a search. Add all of these to the table test.

**5. The rule sends lanes to plain `rg`, which never searches `.agents/`, `.github/` or `.claude/`.**
Canary: `rg X` skipped `.agents/TODO.md` and `.github/ci.yml`; `rg --hidden X` found both and still
skipped the listed round. A lane that swaps `git grep` for `rg` gets a silent false "no match" for
TODO, skills, rounds and workflows. The citation check in finding 1 would have missed every
`.agents/` hit that way. `--hidden` alone also walks `.git/` in the main checkout (22 files matched
in the canary). Fix: the rule and the deny message name the repo-wide form
`rg --hidden -g '!.git' <pattern> [path]`, and the hook passes it.

**6. The hook spec leaves the parser and the command-line contract open.**
- Command position. "`git … grep`" as written also matches
  `git commit -m "deny git grep and grep -r"`, a `gh pr create --body` text, an `echo`, and a
  heredoc that writes the rule. This PR's own commits and docs carry those words. Require a
  quote-aware split into segments; `grep` or `rg` must be the command word, or git's subcommand.
  Must-pass additions: those four forms, `git log --grep X`, and `rg -trust X` (`-t rust`).
- Exit codes. In Claude Code only exit 2 blocks. Say: internal errors exit 0, never 2; a deny uses
  the documented deny output for the installed version (2.1.326), which the executor records.
- The table test covers the pure function only. Add a subprocess test that pipes a real
  `PreToolUse` payload to the script and asserts the deny output and a fail-open exit 0.
- Wiring: the settings command must use `"$CLAUDE_PROJECT_DIR"/scripts/…`, not a relative path
  (a session that has run `cd` would otherwise fail open without notice), and set a short `timeout`.
- Also deny `grep --dereference-recursive` and `-d recurse`. State whether `CASE_TEXT=maintenance`
  must lead the whole command or the segment, and test `cd x && CASE_TEXT=maintenance …`.

**7. (e) leaves the blind rows printing, and an existing test would pass without proving anything.**
- `eval/run-routing.mjs` reads `protocol-history-cases.json` (line 73), the frozen v1 diagnostic,
  not a blind file. The blind v2 rows print from `eval/run-protocol-history.mjs` lines 92-99
  (`npm run eval:protocol-history`): id, role, target rank, top hit. The plan does not touch it.
  Fix: same default and `--rows` there, with a test, or a recorded reason.
- `test/run-routing-manifest-evidence.test.mjs` asserts `rawHasPerCaseTable` is true (line 39).
  Its check is the lane heading plus any `┌`, which the aggregate tables still satisfy. Rewrite the
  test and its comments; assert on derived values only, as it does now.
- The gate's count script must take ids from `holdout-cases.json` and `protocol-history-cases.json`
  and check stderr too. `run-routing.mjs:261` throws with a holdout case id (the residual that test
  already names). Fix it or record it.

**8. The ratchet can fail on a pull request that changes no file outside the corpus.**
- Counts depend on the corpus. A golden edit, or a retirement (a shingle shared by three cases
  becomes "unique to two"), raises counts in old records. "Ceilings only fall" then blocks a
  routine corpus change, and the author cannot see why without printing text. Fix: ceilings carry
  headroom, a corpus-changing PR may raise one with a stated reason, and the failure message says
  what to do: cite the case id and field, do not quote, never print the matched text.
- Runtime: 3.7 s standalone on this box (my run; both assessors measured the same).
  `vitest.config.ts` sets no `testTimeout`, so the default 5 s applies. Give the test an explicit
  timeout and decide now whether about 4 to 8 s in `npm test` is accepted.
- The scan reads `git ls-files`, so an unstaged new record passes locally and fails in CI. Scan
  `git ls-files -co --exclude-standard`.
- The ratchet's exclusions come from the `.ignore` files, so adding an entry silences it. The
  layout test should pin the exact entry list (Fable's "required entries are present" was dropped).
- The 50-shingle floor guards against bulk copies only: one quoted golden of 55 words passes.

## Minor

**9. Layout test trap.** `eval/qa/results` does not exist in a fresh checkout or in CI.
`git check-ignore -q eval/qa/results` returns 1 there; with a trailing slash it returns 0.

**10. (g) verification is weaker than it reads.** A listing count and the archive's own SHA-256 do
not show the archive matches the tree. Run `tar --zstd -d` (compare) against the source before
`rm`, and create the file under `umask 077`. Measured: `tmp/fp` 12 GB and 6,824 files,
`tmp/agentic` 4.5 MB and 123, `tmp/size-audit` 168 KB and 11; newest file 2026-11-14; 737 GB free;
no tracked live file names these paths. One symlink (`tmp/fp/harness/draft/core.mjs`) points into
the `fp-harness` worktree and is archived as a link. Give `size-audit` its own disposition line,
and say where the file that `apply/RECONCILE.md` cites now lives. The owner's answer plus the
archive rule in 7-COMMON cover the removal.

**11. Probe the real wiring, and do not claim Grep-tool coverage untested.** A scratch-repo probe
skips the committed settings, the `.gitignore` negation and the worktree. After the commit, start
a new child in the worktree (hooks load at session start) and have it run
`grep -r CANARY scripts/agent-hooks`: the hook must deny it, and the target holds no case text if it
does not. The AGENTS.md sentence "`rg` or the Grep tool … skip the case-bearing paths" is unverified
for the Grep tool on every lane so far. Verify it where the tool exists (the Mac) or name `rg` only.

**12. Deny message and residual list.** A message that prints the opt-in marker teaches every
denied lane the bypass; point to `eval/qa/README.md` instead. Record the readers the hook does not
stop: `grep X eval/qa/*.json` without `-r` (canary: prints both file-level entries), `cat`, Read,
`git diff`, `git show`, `git log -p`.

**13. Report items the plan omits.** (i) 7-COMMON tells every child to run
`git grep … -- ':!eval/qa' ':!eval/corpus'`, which the hook will deny; the orchestrator must
replace that line for 7.2 and 7.3. No tracked instruction file carries it. (ii) A committed hook
runs repository code in every Claude session in a checkout, including a checked-out pull request
branch; the Codex review should cover that, and the script should import Node built-ins only.
(iii) Worktrees branched before the merge have no hook. (iv) `2026-11-02-golden-audit.md` has no
Outcome heading. Both ledgers end with a newline, so `cat >>` is safe.

## Confirmed as stated

- 114 JSON files in the two rounds (64 + 50), 8,091,050 bytes, 93.4% of outside golden shingles.
  Exactly five files outside the ignore entries carry 50 or more (the baseline list).
- Outside the case folders, no test, script, CI file or `src/` file names either round.
- Parent-layout behavior, the explicit-path opt-in and `--hidden` honoring `.agents/rounds/.ignore`:
  reproduced. All 14 `.ignore` entries exist or are git-ignored.
- `.gitignore` lines 31-32; no `.ignore` or `.gitattributes` today; no `.claude/settings*.json` in
  the three agentpc worktrees. Runner tables at `run-routing.mjs:480` and `:495`; `ci.yml:110`.
- `gpt-6-astra` is the roster's Codex frontier; Codex 0.169.0 mentions hooks, Grok 1.0.88 does not.
- Not checked: the hook under `--dangerously-skip-permissions`, the Grep and Glob tools, the split
  amendment history, and whether the CI runner image ships ripgrep.
