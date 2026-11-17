# Item 7.1 plan: keep agents out of the case folders

Lead: Claude Opus 5.5, agentpc `t1wn`. Branch `np/7.1-case-search-guard` from `131c6c1c`.
Binding: [7.1 note](/home/tyler/code/raven-wt/orch/7.1-NOTE.md) and 7-COMMON (orchestrator notes on
agentpc), over [ITEM-LEAD.md](../../briefs/ITEM-LEAD.md).

## Decision this item changes

How the repository keeps held-out and reserve case text out of the context of agents that search
it. Today that rests on a pathspec instruction in briefs, which failed twice this round (6.1, 6.2:
each a split amendment), and the routing runner prints holdout rows on every run, CI included.

## Inputs

- Options brief, written without opening a case: [OPTIONS.md](OPTIONS.md), with a counts-only
  case-text scan ([casetext-scan.mjs](casetext-scan.mjs), [all fields](scan-all-fields.txt),
  [golden fields](scan-golden-fields.txt)).
- Independent assessments, written apart: Claude Fable 5.2 high ([ASSESS-FABLE.md](ASSESS-FABLE.md),
  `t1wp`) and Claude Sonnet 5.5 high ([ASSESS-SONNET.md](ASSESS-SONNET.md), `t1wq`).

| Option | Fable | Sonnet | Decision |
|---|---|---|---|
| (a) AGENTS.md rule | Adopt, as a one-tool sentence | Adopt, reworded, point at `.ignore` | Adopt, Fable's form |
| (b) Ignore files | Adopt, parent-folder layout | Adopt, root `.ignore` | Adopt, parent-folder layout |
| (c) Claude hook | Adopt, deny recursive grep outright | Adopt, parse path args | Adopt, Fable's form |
| (d) Structural | Reject | Reject | Reject |
| (e) Runner rows | Adopt | Adopt | Adopt |
| (f) Flush dated records | Adopt in part, retention rule | Later, separate PR | Adopt in part, this PR, own commit |
| (g) Archive main `tmp/` | Adopt | Owner chore | Adopt, done by the lead |
| (h) Git attributes (Fable's new option) | First fallback | - | Fallback only |

## Decision and dispositions

1. **(b) parent-folder layout, not a root `.ignore`.** Lead re-test (scratch repo, rg 14.1.1): a
   root `.ignore` with `/eval/qa/corpus/` leaks from `rg PAT eval`, and with a round entry leaks
   from `rg PAT .agents`; the parent-folder layout leaked from no root or `cd`, and an explicit
   path still searches. Sonnet's root layout is rejected on that evidence. Files:
   - `eval/.ignore`: `/corpus/`, `/holdout-cases.json`, `/protocol-history-blind-cases.json`,
     `/protocol-history-blind-cases-v2.json`;
   - `eval/qa/.ignore`: `/corpus/`, `/reviewed/`, `/results/`, `/cases.json`, `/sample.json`,
     `/tool-cases.json`, `/consistency-register.json`, `/source-sentinels.json`;
   - `.agents/rounds/.ignore`: `/2026-11-02-golden-audit/`, `/2026-11-14-golden-coverage-audit/`.
   Not listed, by both assessors' reasoning: the question-only routing, discovery and agentic case
   files, `improvements/`, `test/`, and dated records outside the two golden rounds.
   **Known hole:** `rg -g '*.json'` re-includes a file-level entry (lead re-test confirms). Fable's
   fix, moving the three generated case files into `eval/qa/compiled/`, touches about 30
   references and the paths the 2026-11-23 dated runs read; deferred to a proposal in the report.
   The hook closes the hole for Claude's Grep tool; for other tools it is recorded.
2. **(c) hook, Fable's form.** Sonnet's path-argument parsing is rejected: more parser, more
   fail-open cases, and `rg PAT src` is an exact substitute for the scoped `grep -r` it would
   allow. `scripts/agent-hooks/case-search-guard.mjs`, wired by a committed
   `.claude/settings.json` (`PreToolUse`, matcher `Bash|Grep`), `.gitignore` gains
   `!.claude/settings.json`.
   - Bash: deny when a command segment runs `grep`/`egrep`/`fgrep` with `-r`, `-R` or `--recursive`
     (alone or in a combined short flag); `git … grep`; `xargs … grep`; `find … -exec grep`; or
     `rg` with `-u`, `-uu`, `--unrestricted` or any `--no-ignore*`. Must pass: `grep X file`,
     `ps aux | grep node`, `git log --grep=X`, `rg X`, `rg X src`, `rg X eval/qa/corpus`.
   - Grep tool: deny when `glob` is set, `path` is unset or an ancestor of a file-level `.ignore`
     entry, and the glob matches that entry's file name. Glob tool: not hooked (names only).
   - Opt-in: the command starts with the env prefix `CASE_TEXT=maintenance`. The deny message says
     to use `rg <pattern> [path]` and that only a golden-maintenance lane may opt in.
   - Path lists come from the three `.ignore` files at run time. Fail open on any error, with one
     stderr line. Block, never rewrite (both assessors).
   - It applies to the owner's own Claude sessions in this repository; the PR body says so.
   - Codex 0.169 has a hook mechanism. The executor reads its contract and records whether the
     same script could serve; wiring Codex is a report proposal, not this PR. Grok shows none.
3. **(a) rule.** One AGENTS.md hard rule (Fable's form): search with `rg` or the Grep tool, which
   skip the case-bearing paths through `.ignore`; never `grep -r`, `git grep`, or `rg -u` /
   `--no-ignore` here (a Claude hook denies them; Codex and Grok lanes rely on the rule); only a
   golden-maintenance lane opens case text, by naming the exact path. `eval/qa/README.md`
   ("Held-out split") gets the mechanism and the opt-in; the `golden-truth` skill gets one line on
   the opt-in. It supersedes the pathspec line in briefs.
4. **(e) runner.** `eval/run-routing.mjs` prints holdout and protocol-history aggregates only;
   `--rows` adds the per-row tables; the results file keeps every row; exit codes unchanged. The
   TODO item "Stop the routing gate run from printing the holdout rows" is done and leaves
   `.agents/TODO.md`; `eval/README.md` documents `--rows`.
5. **Case-text ratchet (both assessors asked for a scan test; Fable's form).** Promote the scan to
   `eval/qa/case-text-scan.mjs` (golden and `truth.notes` fields, 8-word shingles unique to at most
   two cases). A test fails when a tracked file outside the `.ignore` entries carries 50 or more
   golden shingles and is not in `eval/qa/case-text-baseline.json` (path and ceiling; ceilings
   only fall). It prints paths and counts, never text. Sonnet's narrower "live tree only" scope is
   rejected: the repository rule already forbids quoting judge-facing text outside the corpus, and
   the ratchet enforces that for new records. If the test costs more than about 5 s in `npm test`,
   the executor reports before going on.
6. **(f) flush, in this PR as its own commit.** The owner asked for it in this item, and
   `.agents/README.md` ("Retention") already says to delete intermediates no current artifact
   cites. Lead measurement: the two golden rounds hold 114 JSON files (8.1 MB; about 93% of the
   golden text outside the case folders). Current artifacts (`eval/qa/consistency-register.json`,
   `improvements/`, `.agents/TODO.md`, `research/services/`, `specs/`) cite five of them by path:
   `2026-11-14-golden-coverage-audit/gap/gap-1.json`, `gap/gap-3.json`, `gap/verify-gap.json`,
   `resweep/resweep-1.json`, `resweep/resweep-2.json`. Those stay. The other 109 are removed with
   `git rm` by explicit list (never opened). Markdown, txt and scripts in those rounds stay; their
   links to removed files resolve in history. Each round ledger (`.agents/rounds/<round>.md`) gets
   an appended "Retention (2026-11-17, round item 7.1)" note naming `131c6c1c` as the last commit
   with the full tree and the five kept files; appended with `cat >>`, without reading the ledger.
   Disposition: in git history at `131c6c1c` (no archive needed). Reviewers never open the
   deletion diff: use `git diff --stat` or `--diff-filter=d`.
7. **(g) main checkout `tmp/`.** The lead archives `tmp/fp/`, `tmp/agentic/` and `tmp/size-audit/`
   from `/home/tyler/code/stellar-raven-codemode/tmp/` to
   `~/backups/raven-next-phase/7.1-main-tmp-2026-11-17.tar.zst` (mode 600), verifies the listing
   count and SHA-256, then removes them. The owner's answer ("if there are files and folders or
   data that should just be flushed ... do so, just carefully") and the deletion rule (archive
   first) cover it; Fable's request for a fresh owner confirmation is not taken, because the
   archive keeps every byte. Not touched: `gca-eval`, any split file, the committed record that
   cites `tmp/fp/`.
8. **(d) rejected** by both. **(h) git attributes** is the first fallback if a `git grep` or
   `git diff` exposure happens or the hook probe fails.

## Steps (executor, Claude Sonnet 5.5)

1. Runner (e) and its test. Files: `eval/run-routing.mjs`, a test under `test/`, `eval/README.md`,
   `.agents/TODO.md`.
2. `.ignore` files (b) and a layout test (anchored one-component literal entries; each exists in the
   tree or is git-ignored), plus an rg behavior test skipped when `rg` is absent (canary tree with
   the three files: no canary prints from root, `eval`, `eval/qa`, `.agents`, `.agents/rounds`,
   with `--hidden` and by `cwd`; an explicit path prints one).
3. Hook (c): `scripts/agent-hooks/case-search-guard.mjs` with an exported pure decision function,
   `.claude/settings.json`, `.gitignore`, a table test (must-deny, must-pass, fail-open), a wiring
   test (settings parses, names a tracked script). Then one live probe: a Claude Sonnet 5.5 `hc`
   child under `--dangerously-skip-permissions` in a scratch git repo with the hook installed runs
   `grep -r CANARY .`; the deny must fire. Record the result.
4. Ratchet (5): `eval/qa/case-text-scan.mjs`, `eval/qa/case-text-baseline.json`, its test.
5. Rule text (a): AGENTS.md, `eval/qa/README.md`, `.agents/skills/golden-truth/SKILL.md`,
   CONTRIBUTING.md "Checks" if a new command is added.
6. Flush (f), its own commit, by the explicit list in step 6 above.
7. DECISIONS.md: the "Follow-up answers (2026-11-17, after item 6.3)" section with the owner's
   three answers, verbatim from 7-COMMON.

## Gates

`npm run typecheck`, `npm test`, `npm run build`, `npm run eval:selftest`,
`npm run eval:routing -- --gate` (stdout must hold no holdout or protocol-history case id;
checked by a count script, not by eye), `npm run secrets:scan -- --tree`. The QA lint is not run:
its behavior does not change. If the executor finds that `lint-corpus.mjs` reads any removed
path, it stops and reports. Each gate runs bare.

## Required review

Codex frontier (`gpt-6-astra`, high) reads the hook, the ignore files, the ratchet, the settings
wiring and the rule text: an integrity boundary. It writes to the worktree's `tmp/` and the lead
copies the file to `CODEX-REVIEW.md`. The executor reconciles every finding.

## Stop rule

- If the live probe shows the hook does not fire under `--dangerously-skip-permissions`, stop and
  report to the lead; (c) leaves the PR and (h) is decided then.
- If any step needs a case file opened, stop.
- The item ends at the PR and the report. No model-calling eval; the one probe is a tool check.

## Risks

- The committed `.claude/settings.json` conflicts with an untracked one in another checkout (the
  Mac). The report asks the orchestrator to check `.claude/` before pulling.
- Hook false positives on routine work (scoped `grep -r`). Accepted: the message names `rg`.
- The PR's deletion diff shows golden text. Mitigation: the PR body warns; all reviews use
  `--stat` for deletions.
- Ratchet false failures from shared public phrasing. Mitigation: the 50-shingle floor and the
  two-case uniqueness filter (the scan's tail under 10 shingles is mostly shared phrasing).

## Needed from the orchestrator or owner

Nothing to start. The report carries: no deploy expected (no Worker bytes change; confirm with
`npm run build` hash), the Mac `.claude/` check, and the deferred proposals (move the generated
case files into a folder; Codex hook wiring; `gca-eval` results move, already in TODO).

## Reconciliation with REVIEW.md

Reviewer: Claude Fable 5.2, high, `t1wr` ([REVIEW.md](REVIEW.md)). Verdict "reconcile before
execution". Every finding is adopted except where stated. This section overrides the plan above.

1. **Blocker, flush keep-list.** Adopted by removing (f) from this item. The corpus cites 24 of the
   109 files as per-case provenance (and `sd-108` cites a 25th), so only 84 files (31.5% of the
   outside golden text) could go, the folder is already covered by `.agents/rounds/.ignore` and the
   hook, and main is squash-merged (finding 2), so the deletion would land in the code commit.
   Step 6 is dropped. The report proposes a separate ledger-only PR that builds its list with a
   committed token-only script searching the case folders too.
2. **Squash merge.** Moot with (f) out.
3. **`rg` is a Claude shell function here.** Adopted:
   - CI installs ripgrep in the job that runs `npm test` (`command -v rg ||` an apt install), and
     the rg behavior test fails, not skips, when `CI` is set and `rg` is missing; locally it skips
     with a printed reason.
   - The executor records `command -v rg` for a plain `bash -c`, and whether the installed Codex
     and Grok CLIs ship their own ripgrep (package contents, no model call).
   - Rule text: lanes search with `rg`; where `rg` is missing they use `git grep` with the full
     exclusion pathspec that `eval/qa/README.md` prints. The hook allows a `git grep` that carries
     an exclusion for every `.ignore` entry (`:!<path>` or `:(exclude)<path>`), and denies other
     `git grep`.
4. **Bash `rg` globs and file lists.** Adopted. The hook denies, for `rg` and `grep` segments: a
   positive `-g`/`--glob`/`--iglob` whose pattern matches a file-level `.ignore` entry's name
   (negated globs pass); a positional argument with a shell glob character under `eval/`,
   `./eval/`, `.agents/`, `./.agents/`; `$(git ls-files…)` or backtick file lists; `xargs … rg`;
   `find … -exec rg`. The rule gains: never pass a shell glob over `eval/` or `.agents/rounds/` to
   a search. All in the table test.
5. **Plain `rg` skips hidden folders.** Adopted: the rule, the README and the deny message name
   `rg --hidden -g '!.git' <pattern> [path]`; the hook passes it.
6. **Parser and contract.** Adopted in full: quote-aware segmentation on `;`, `&&`, `||`, `|`,
   newlines; `grep`/`rg` must be the command word (after env assignments, `sudo`, `command`,
   `xargs`, `env`, `time`), or git's subcommand after git's global options. Must-pass additions:
   `git commit -m "… git grep … grep -r …"`, `gh pr create --body "…grep -r…"`, `echo`, a heredoc
   body, `git log --grep X`, `rg -trust X`. Also deny `--dereference-recursive` and `-d recurse` /
   `--directories=recurse`. `CASE_TEXT=maintenance` is a per-segment env prefix
   (`cd x && CASE_TEXT=maintenance grep -r …` passes that segment). Internal errors exit 0; a deny
   uses the documented `PreToolUse` deny JSON for Claude Code 2.1.326 (the executor records the
   contract it used). A subprocess test pipes real payloads. The settings command uses
   `"$CLAUDE_PROJECT_DIR"/scripts/agent-hooks/case-search-guard.mjs` with a short `timeout`. The
   script imports Node built-ins only.
7. **Runners.** Adopted: `eval/run-protocol-history.mjs` gets the same aggregate-only default and
   `--rows`, with a test. `test/run-routing-manifest-evidence.test.mjs` is rewritten so it asserts
   the new default, on derived values only. The `run-routing.mjs:261` error names no case id
   (index and card count instead). The stdout check takes ids from `holdout-cases.json`, the
   protocol-history case files, and checks stdout and stderr, printing counts only.
8. **Ratchet.** Adopted: baseline ceilings carry headroom (current + 25%, at least +10); a PR that
   changes the corpus may raise a ceiling with a `reason` field; the failure message says to cite
   the case id and field instead of quoting, and prints paths and counts only; explicit test
   timeout (30 s); the scan reads `git ls-files -co --exclude-standard`; the layout test pins the
   exact entry list of each `.ignore` file. The 50-shingle floor is accepted as a bulk-copy guard
   only; the README says so.
9. **Layout test trap.** Adopted: check ignored folders with a trailing slash.
10. **(g) verification.** Adopted in a stronger form: the lead extracts the archive to a private
    scratch folder and checks every file against a SHA-256 manifest taken from the source before
    `rm`. Archive and manifest are mode 600 under `umask 077`. Dispositions get their own lines
    for `fp`, `agentic` and `size-audit`, and name where the file `apply/RECONCILE.md` cites lives.
11. **Real wiring probe.** Adopted: replaces the scratch-repo probe. After the hook commit, a new
    Claude Sonnet 5.5 child started in the worktree (with `--dangerously-skip-permissions`) runs
    `grep -r CANARY scripts/agent-hooks` and `rg --hidden -g '*.json' CANARY eval` with Bash; both
    must be denied. The rule names `rg` only; the README says the Grep tool is untested.
12. **Deny message and residuals.** Adopted: the message points to `eval/qa/README.md`
    ("Held-out split") and does not print the opt-in. The README lists what the guard does not
    stop: `grep X eval/qa/*.json` without `-r` is covered by finding 4's glob rule, but `cat`,
    Read, `git diff`, `git show`, `git log -p`, and any non-Claude lane are not.
13. **Report items.** Adopted: the orchestrator replaces the 7-COMMON pathspec line for 7.2 and
    7.3; the Codex review covers the hook as repository code run in every Claude session (including
    a checked-out PR branch); worktrees branched before the merge have no hook.

Revised steps for the executor: 1 runners (both) and tests; 2 `.ignore` files, layout and rg tests,
CI ripgrep; 3 hook, settings, `.gitignore`, table and subprocess tests; 4 ratchet; 5 rule text;
6 DECISIONS.md; 7 commit, then the real-wiring probe; 8 EXEC.md. One commit or several, all in
this PR.
