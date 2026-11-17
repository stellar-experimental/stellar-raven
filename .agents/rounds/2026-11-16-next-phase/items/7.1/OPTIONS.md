# Item 7.1 options brief: keep agents out of the case folders

Written by the item lead (Claude Opus 5.5) from the repository at `131c6c1c`, without opening any
case file. Two assessors read this brief separately and write pros, cons and a recommendation.

## The problem

Three lanes exposed QA case content this round through repository-wide searches:

- 5.3: a Fable reviewer's recursive `grep -l` printed file names only (no amendment needed);
- 6.1: a lead's repo-wide `grep` printed one case's golden notes and source notes (split v10);
- 6.2: a lead's `grep -rn` printed one case path and two golden source lines (split v11).

All three were Claude lanes using `grep` through Bash. Each held-out exposure costs a split
amendment: a script, a new split file copied to the Mac, the dated-run briefs re-pointed, and the
held-out set one case smaller. Separately, `node eval/run-routing.mjs --gate` (and CI's
`npm run eval:routing -- --gate`) prints the routing holdout per-case table (ids, ranks, forbidden
hits) and the protocol-history per-case table on every run; `.agents/TODO.md` ("Stop the routing
gate run from printing the holdout rows") asks for aggregates only on stdout.

**Threat model.** The repository is public, so the case text is not secret from the world. The goal
is to keep held-out and reserve content out of the context of agents that tune Raven, during normal
work, so the held-out read stays a fair measurement. The split file is local-only
(`eval/qa/results/splits/`, and `~/backups/gca-2026-11-14-split-v11.json`); nothing in the
repository says which set a case is in, so any exposed case may be held-out.

## Measured facts

1. **`.ignore` coverage** (scratch git repo, ripgrep 14.1.1, a `.ignore` listing
   `/eval/qa/corpus/` and `/eval/qa/cases.json`):
   - `rg <pat>` from the root and `rg <pat> eval/qa`: ignored paths skipped.
   - `rg <pat> eval/qa/corpus` (explicit directory), `rg <pat> eval/qa/cases.json` (explicit
     file), and `cd eval/qa/corpus && rg <pat>`: searched. So an explicit path is a natural opt-in.
   - `git grep` and `grep -r`: `.ignore` has no effect; both print the ignored files.
   - Not yet tested: the Claude Code `Grep` and `Glob` tools (they are ripgrep-based; some Claude
     builds on this box do not expose them at all, and lanes then search through Bash), the Codex
     CLI's own search, the Grok CLI's search tool, VS Code search (honors `.ignore` by default).
2. **Nothing in the repository runs ripgrep.** Scripts walk the tree with Node `fs` or
   `git ls-files`/`git show`; CI workflows do not call `rg`. vitest, gitleaks (`.gitleaksignore`)
   and the secrets scan (`git ls-files`) do not read `.ignore`. To be confirmed by the executor.
3. **Case text lives far outside the case folders.** `items/7.1/casetext-scan.mjs` loads the 253
   battery cases, builds 8-word shingles from `question`, `golden.*` and `truth.notes` (keeping
   shingles unique to at most two cases), and counts matches in every tracked file outside
   `eval/qa/corpus/`, `eval/corpus/` and the three generated case files. It prints counts and paths
   only. Results ([all fields](scan-all-fields.txt), [golden and notes only](scan-golden-fields.txt)):
   - all fields: 336 of 2,225 tracked files match; 89 carry text from 5 or more cases;
   - golden and notes only: 294 files; 72 carry text from 5 or more cases;
   - golden text concentrates in two dated golden-maintenance rounds,
     `.agents/rounds/2026-11-02-golden-audit/` (67 files) and
     `.agents/rounds/2026-11-14-golden-coverage-audit/` (55 files; single JSON intermediates there
     carry 1,000 to 7,000 golden shingles across 15 to 71 cases), then `improvements/` (14),
     this round's records (12), `test/` (8), and a long tail of dated `research/audits/` and round
     folders;
   - live files: `eval/qa/consistency-register.json` (35 cases), `eval/routing-cases.json`
     (162 cases, question text: the routing corpus shares questions with the QA battery, which is
     what `eval/routing-qa-overlap.json` tracks), `eval/discovery/cases.json`,
     `eval/agentic/sample.json`, `eval/qa/source-sentinels.json` (anchor patterns from goldens).
   So a pathspec that excludes `eval/qa` and `eval/corpus` stops the incidents seen so far (the
   corpus files) but leaves hundreds of files where a repo-wide search can print golden text.
4. **The case folders hold more than cases.** `eval/qa/` holds about 60 scripts, the README, the
   claim-read brief and the taxonomy. A blanket `eval/qa` exclusion hides those from repo-wide
   search too. The case-bearing paths there are `eval/qa/corpus/`, `cases.json`, `sample.json`,
   `tool-cases.json`, `reviewed/`, `results/` (already git-ignored), and the register and sentinels
   files named above.
5. **Claude Code project settings are git-ignored.** `.gitignore` has `.claude/*` and
   `!.claude/skills`; a committed `.claude/settings.json` needs a `!.claude/settings.json` line.
   Hooks run in `--dangerously-skip-permissions` mode (to be confirmed by the executor). A committed
   hook also applies to the owner's own interactive sessions in this repository.
6. **Routing runner.** `eval/run-routing.mjs` prints, after the aggregates, a `console.table` of
   every holdout row (id, rank, top-1/3/5, forbidden hits, result) and of every protocol-history
   row (id, class, role, target rank, top hit). Confirmation-only rows already print a label
   instead of values (`eval/lib/confirmation-only.mjs`). The results file keeps every row.
7. **Local, ignored data.** The main checkout's `tmp/` (git-ignored) is 12 GB, almost all
   `tmp/fp/` from the 2026-11-12 FP round. That round's evidence archive
   (`~/backups/fp-2026-11-12-evidence.tar.zst`) deliberately excluded "row files, per-case data
   folders, anything that mentions a held-out or reserve case"; a second archive holds 21 held-out
   text files. So `tmp/fp/` still holds per-case data that is archived nowhere. `rg` and
   `git grep` skip it; `grep -r` from the main checkout's root walks it. One committed record
   (`2026-11-14-golden-coverage-audit/apply/RECONCILE.md`) cites a file under `tmp/fp/`. The
   `gca-eval` worktree holds stored QA results by item 0.3's decision and stays (a TODO item covers
   moving them).

## Options

- **(a) Rule.** An AGENTS.md hard rule: every repository-wide search excludes the case-bearing
  paths, with the exact pathspec for `git grep`, `grep -r` (`--exclude-dir`), `rg` and the Grep/Glob
  tools, and an explicit opt-in for golden-maintenance lanes. A rule, not enforcement. Costs
  nothing; the 6.1 and 6.2 incidents happened after the orchestrator had already given this rule
  in briefs.
- **(b) Ignore files.** A root `.ignore` (read by ripgrep, the Claude Grep/Glob tools if they are
  ripgrep-based, Codex's shell `rg`, VS Code) listing the case-bearing paths. An explicit path
  still searches them (fact 1), so maintenance lanes keep working. Does nothing for `grep -r` and
  `git grep`, the tools of all three incidents. Open: which paths it lists (fact 3 and 4), and
  whether a test keeps it in step with where case text lives.
- **(c) Hook.** A Claude Code `PreToolUse` hook in a committed `.claude/settings.json` that denies
  (with a message naming the pathspec) Bash `grep -r`, `git grep`, `rg -u`/`--no-ignore`,
  `find … | xargs grep`, and Grep/Glob calls whose search root contains a case-bearing path, unless
  the command opts in (an explicit case path, or a marker). Targets the observed failure mode
  directly. Costs: shell parsing is approximate (pipes, `cd`, subshells, variables); false
  positives on scoped searches unless the parser reads path arguments; Codex and Grok lanes are not
  covered (check whether Codex CLI or Grok CLI have an equivalent hook); it runs on every Bash call
  in this repo, including the owner's sessions; a broken hook blocks work, so it must fail open.
- **(d) Structural.** Held-out and reserve case text leaves the working tree: encrypted at rest, or
  kept in the owner's private evidence repository with only ids and hashes here. Costs: CI lint and
  compile need the key or lose coverage; the dated runs and the maintenance exception need the
  private copy; removing only held-out and reserve files would publish set membership (it is local
  today); git history and the public remote keep every old copy, and fact 3's 300 files would still
  carry the text. Encrypting all cases avoids the membership leak but every lane, script and test
  that reads a case then needs the key.
- **(e) Runner.** `run-routing.mjs` prints holdout and protocol-history aggregates only; per-row
  tables behind an explicit flag; rows stay in the results file. Tests for the default and the flag.
- **(f) Flush dated case-bearing records from the working tree.** Remove bulky dated intermediates
  that carry golden text (for example the golden-audit and coverage-audit round JSON) from `main`;
  they stay in git history and the round ledgers link to them by commit. Shrinks the search surface
  for every tool at once, including `grep -r` and `git grep`. Costs: the deletion rule (a written
  disposition per path), broken relative links to fix, and dated evidence moves one step further
  from readers. Does not touch live files (register, sentinels, routing cases, tests).
- **(g) Archive the main checkout's `tmp/fp/` and `tmp/agentic/`** to
  `~/backups/raven-next-phase/` (mode 600, verified listing and hash) and remove them from the
  working tree. Removes the largest unindexed store of per-case data from `grep -r`'s reach.
- **Combinations.** For example (e) + (b) + (a), with or without (c), (f) and (g).

## Questions for each assessor

1. Which option or combination, and why. Weigh cost (build, maintenance, friction on routine lanes,
   false positives) against the incidents it would have stopped and the ones it would not.
2. For (b): the exact path list. Whole `eval/qa`, or only the case-bearing files? Include the dated
   round and research records of fact 3, or not? Should a test keep `.ignore` in step with a
   counts-only scan like `casetext-scan.mjs`?
3. For (c): is a hook worth it given that Codex and Grok lanes are uncovered and parsing is
   approximate? If yes, block or rewrite, and what opt-in?
4. For (f) and (g): which paths, if any, should leave the working tree, and what must stay?
5. Anything this brief gets wrong, or a better option.

## Ground rules for assessors

- Never open a QA case or its content: `eval/qa/corpus/`, `eval/corpus/`, `eval/qa/cases.json`,
  `sample.json`, `tool-cases.json`, `eval/qa/results/`, `eval/qa/reviewed/`, and the dated records
  fact 3 names. Use counts, hashes, sizes, git history and script source.
- Every repository-wide search excludes the case folders, for example
  `git grep <pattern> -- ':!eval/qa' ':!eval/corpus'`. The Claude Code Grep and Glob tools search the
  whole tree too: pass a path or glob that excludes the case folders. Prefer naming the exact files
  you need.
- You may test tool behavior (your own Grep/Glob tools, `rg`, `git grep`) in a scratch directory
  outside the repository with canary files. Do not search the real repository to test them.
- You may run `node .agents/rounds/2026-11-16-next-phase/items/7.1/casetext-scan.mjs . 8`; it prints
  counts and paths only.
- No model-calling run, no network call to a paid service.
