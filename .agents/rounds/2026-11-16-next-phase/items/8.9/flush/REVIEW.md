# Review: round item 8.9, lane `flush` ("Flush the uncited golden-round JSON")

- Branch: `np/8.9-flush` at `580afbf8`, compared against `origin/main` (`origin/main...HEAD`)
- Reviewer: independent reviewer (Antigravity, Claude Opus, high effort); read-only apart from this file
- Spec: `.agents/TODO.md` § "Flush the uncited golden-round JSON" (lines 1193–1208); `AGENTS.md`

## Case-text boundary I kept

I never opened, printed or diffed a deleted golden-round file, a case file, or any file under the
two golden-round folders. I read deleted files through `git diff --stat` and `--name-status` only.
I read the content of `scripts/find-uncited-golden-round-json.mjs`,
`test/find-uncited-golden-round-json.test.mjs`, `AGENTS.md`, `.agents/TODO.md`, `vitest.config`,
`.github/workflows/ci.yml` (ripgrep step) and `scripts/README.md`. Every probe into the case scopes
returned only counts or round-folder path tokens (`rg --no-filename --count-matches`, `rg -l … | wc -l`,
`comm … | wc -l`). I built the pre-deletion tree as a temporary detached `git worktree` of
`origin/main` outside the repo and removed it afterwards.

## What the branch does

| | |
|---|---|
| Commits | 1 (`580afbf8`) |
| Added | `scripts/find-uncited-golden-round-json.mjs` (294 lines), `test/find-uncited-golden-round-json.test.mjs` (196 lines) |
| Deleted | 84 `.json` files: 63 under `2026-11-02-golden-audit/`, 21 under `2026-11-14-golden-coverage-audit/` (102,773 lines) |
| Modified | none. `AGENTS.md` and `.agents/TODO.md` are unchanged |

## Verification I ran

| Check | Result |
|---|---|
| `node scripts/find-uncited-golden-round-json.mjs --check` on HEAD | `30 total, 30 cited, 0 uncited`, exit 0, 0.6 s |
| Same script with `--repo <origin/main worktree>` | `114 total, 30 cited, 84 uncited` |
| `--uncited` list on `origin/main` vs `git diff --name-only --diff-filter=D` | **identical** (84 = 84, `diff` empty) |
| `--cited` set on `origin/main` vs on HEAD | **identical** (30 = 30); each of the 30 still exists on disk |
| Deleted non-JSON files | 0 |
| `npx vitest run test/find-uncited-golden-round-json.test.mjs` | 7/7 pass, 1.1 s |
| JSON-escaped (`\/`) round-path references in the scopes | 0 |
| Bare-basename references (not preceded by a directory) to any deleted file | 0 for all 84 |
| Directory-level references (`<round>/<dir>/` followed by a terminator) | 0 for every deleted directory **except `gap/`: 75 matches** (36 in `eval/qa/corpus`, 36 in `eval/qa/cases.json`, 3 in `eval/qa/sample.json`). See M1 |
| Hidden files inside the scopes (the script does not pass `--hidden`) | 11, all in `eval/qa/corpus`. 0 contain a golden-round reference. See N1 |
| CI installs ripgrep | yes (`.github/workflows/ci.yml:88-89`) |

By the script's file-level definition, only uncited files were removed and no cited file was
dropped. Its 84 matches the TODO's "84 could go". Its totals differ from the TODO's
109 candidates and 25 cited: the scan found 114 and 30. The five extra files are all cited, which
is the safe direction. The likely cause is the broader scope list (the compiled case files, the
consistency register, and the lifecycle and sentinel registries). The lane report should say this,
because the TODO's numbers will otherwise look wrong.

## Findings

### M1 — major — Directory citations are not treated as citations, and 24 corpus cases cite `gap/` only as a directory

**Where:** `scripts/find-uncited-golden-round-json.mjs:59-61` (`citationPattern`) and `:171-186`
(classification). The deleted files concerned are
`.agents/rounds/2026-11-14-golden-coverage-audit/gap/{gap-1.slots.json, gap-2.json, gap-2.slots.json, gap-3.slots.json}`.

**What:** The scanner counts a file as cited only when its round-relative file path appears. A
citation of the containing directory, here `.agents/rounds/2026-11-14-golden-coverage-audit/gap/`
followed by a closing quote, matches no candidate. On the pre-deletion tree:

- 36 corpus case files cite the bare `gap/` directory.
- All 36 also cite `gap/verify-gap.json` explicitly. That file is kept.
- 12 of the 36 also cite `gap/gap-3.json`, which is kept. None cites `gap/gap-1.json`.
- **24 of the 36 cite only the directory plus `verify-gap.json`.** Their gap-lane draft is not
  pinned by file name, and `gap-2.json` is a lane draft that sits in that cited directory. It was
  deleted. `gap-1.json` survived only because an `improvements/` finding happens to cite it.

The TODO's done-when line says the script must prove "nothing cited by the corpus … went". A case
that cites `gap/` as its provenance arguably cites what that folder held. The flush removed four of
the seven JSON files in it. History keeps the bytes, so nothing is lost, but the script fails open
on this citation form, and the proof the TODO asks for does not cover it. No other deleted directory
has a directory-level citation (all 0), so the exposure is limited to these four files.

**Fix:**
1. In the scanner, treat a directory citation as citing every candidate under it. Example: for each
   candidate, also test each ancestor directory with
   `(^|[^A-Za-z0-9._-])<ancestorRel>/($|[^A-Za-z0-9._*{-])`, or run one extra `rg` per distinct
   directory and mark all of its JSON children cited. Report these as a separate `byScope` reason,
   for example `dir:`, so the evidence stays visible.
2. Add a synthetic test: a case cites `<round>/gap/` and the `gap/*.json` siblings stay cited.
3. Restore the four `gap/` files on the branch (`git checkout origin/main -- <4 paths>`), or record
   an explicit owner decision that a bare directory citation co-cited with `verify-gap.json` does
   not pin its siblings. The conservative default is to restore them. That makes the flush 80
   files, and the TODO text should then be updated to match.

### m1 — minor — Missing search scopes are silently dropped (fail-open)

**Where:** `scripts/find-uncited-golden-round-json.mjs:161-165`.

**What:** `existingScopes` filters out any default scope that does not exist and throws only when
**all** of them are missing. The next TODO item (§ "Move the compiled case files into
`eval/qa/compiled/`", line 1210) will move `eval/qa/cases.json`, `sample.json` and
`tool-cases.json`. After that move, those scopes vanish from the scan without a warning. The corpus
still covers those files today, but the same silent drop would apply if `eval/qa/corpus` or
`improvements` moved. A file cited only there would then be reported as uncited and become a flush
candidate.

**Fix:** Throw when any default scope is missing, or at least when a core scope (`eval/qa/corpus`,
`improvements`) is missing. Also print the skipped scopes in summary mode. When a caller passes
explicit `searchScopes`, require that they all exist. Add a test.

### m2 — minor — The script and the deletion share one commit, though the TODO asked for a records-only PR

**Where:** commit `580afbf8`; `.agents/TODO.md:1197-1205`.

**What:** The TODO splits the work into two steps: a committed token-only script, then "one
records-only pull request" that removes the files. It also notes that round item 7.1 kept the flush
out of a code commit on purpose. This branch puts the script, its test and 84 deletions in a single
commit. Reverting or cherry-picking the tool would also revert or carry 102k lines of case-bearing
JSON. Anyone who runs `git show 580afbf8` without a path filter prints those lines, which is the
exposure the `--stat`-only rule exists to prevent.

**Fix:** Split the branch into two commits: (a) script and test, with the repository-invariant test
added in (b) or skipped until then; (b) `git rm` of the listed files plus the invariant test. If
squash-merge is used, land them as two PRs, or record the deviation and its reason in the PR body.

### m3 — minor — The proof the TODO requires is not recorded, and the TODO item is not updated

**Where:** `.agents/rounds/2026-11-16-next-phase/items/8.9/flush/` (contains no report);
`.agents/TODO.md:1193-1208`.

**What:** The committed invariant test proves that 0 uncited files *remain*. It cannot prove that
nothing cited *went*, because the deleted files are no longer on HEAD for it to scan. That proof
needs the pre-deletion run I did above: `--repo <origin/main>`, uncited list equal to the deletion
list, cited set unchanged. The branch records neither that run nor the 109/25 vs 114/30 explanation.
The TODO item stays as written, still saying "Next: write … script".

**Fix:** Add a lane `REPORT.md` with the base-tree command, the counts, and the "uncited list ==
deleted list" result. After M1 is settled, update or remove the TODO item in the same PR, following
the repo's convention for closing items.

### m4 — minor — Test gaps

**Where:** `test/find-uncited-golden-round-json.test.mjs`.

**What:** Coverage of the main paths is good: citation forms, lookalike rejection, the real
`.ignore` layout, a never-opened non-JSON canary, symlink and non-JSON exclusion, leak checks across
all four output modes, `--check` exit codes, and malformed-argument errors. These cases are
missing:

- a directory-level citation (M1);
- a missing scope, partial or total (m1). The "no search scopes exist" throw is never exercised;
- the `rg` failure path (exit status 2, or `rg` missing). For example, run with
  `PATH` pointing to a stub, or pass a scope that is an unreadable file, and assert a non-zero exit
  and no leak in stderr;
- `--help`.

**Fix:** Add one case for each. The first two need the fixes in M1 and m1.

### n1 — nit — `rg` runs without `--hidden`

**Where:** `scripts/find-uncited-golden-round-json.mjs:111`.

**What:** Dotfiles inside the scopes are not searched. Today that is 11 files in `eval/qa/corpus`,
and none contains a golden-round reference, so the result does not change. A citation added later
in a dotfile would be missed, which is the fail-open direction.

**Fix:** Add `--hidden` and `-g '!.git'`. The `.ignore` rules already keep the case boundary.

### n2 — nit — CLI argument edge cases

**Where:** `scripts/find-uncited-golden-round-json.mjs:224-227, 236-237`.

**What:** `--help --json` runs the full scan and prints JSON (confirmed), while `--json --help`
prints usage, because `--help` overwrites `mode` without setting `explicitMode`. `--repo --check`
takes `--check` as the directory path.

**Fix:** Handle help as a separate boolean that short-circuits before the scan. Reject a `--repo`
value that starts with `--`.

### n3 — nit — `rg` stderr is discarded

**Where:** `scripts/find-uncited-golden-round-json.mjs:123-125`.

**What:** On exit status 2, the error says only "rg exited with status 2". Hiding stderr is
reasonable, because it can name a case path. The cost is that an operator has no hint about the
cause.

**Fix:** Keep stderr hidden, but report a count of stderr lines or the first error class (for
example "permission denied") with any path removed. Or leave it as is and add a comment explaining
why.

### n4 — nit — Synthetic fixtures are built at collection time

**Where:** `test/find-uncited-golden-round-json.test.mjs:63-112`.

**What:** The temp repo, the `.ignore` copies, the symlink and `git init` run when vitest collects
the file, not in `beforeAll`. This happens even when every test in the block is skipped. If setup
throws (for example, a platform without symlink support), the failure shows up as a collection
error instead of a test failure.

**Fix:** Move the setup into `beforeAll`.

### n5 — nit (information) — Dated records still name the deleted paths

Full repo paths of deleted files still appear in dated records:
`research/audits/2026-11-09-improvements-sweep/*.md` (4 files),
`research/audits/2026-11-12-truth-maintenance/review-retire-astra.md`,
`.agents/rounds/2026-11-02-upstream-followup/rv-fu-review.md` and
`.agents/rounds/2026-11-16-next-phase/items/7.1/scan-*.txt`. These are dated evidence, and
`AGENTS.md` leaves dated records unchanged, so no edit is needed. A one-line note in the lane report
("paths in dated records now resolve through git history") would prevent a later "dangling link"
cleanup pass.

## Things checked and found sound

- **No content or case-path leakage.** The script never opens a candidate. It uses `readdirSync`
  with `withFileTypes` and reads names only. `rg --count-matches` output is reduced to scope names
  and integers, and the matched paths are never stored or printed. Errors print no `rg` output. The
  test proves this with canaries in both case and round bodies, across every mode.
- **Ripgrep invocation.** It uses `spawnSync` with an argument array (no shell injection), `-e`
  before `--`, and `--color never`. `RIPGREP_CONFIG_PATH=""` neutralises user config. There is no
  `-u` or `--no-ignore`. It fails closed on exit status ≥ 2 and on spawn error. Explicit directory
  scopes still reach files inside the `.ignore`d case folders: the real run counts 473 corpus files
  for `coverage/coverage.json`, and the synthetic test checks the same with the real `.ignore` files.
- **Regex.** The boundaries reject `.slots`, `.bak`, `.jsonl`, prefixed names (`other-gap/`,
  `foo_gap/`, `v2.gap/`) and lookalikes such as `eval/qa/taxonomy.json`. A trailing sentence period
  is accepted. Rust and JS regex semantics agree for this pattern. A path that is ambiguous across
  rounds stays cited, the documented safe direction.
- **Symlinks.** Symlinked files and directories in the round folders are skipped. Skipping excludes
  them from flushing, which is the safe direction.
- **Scope.** Only the two new files and the 84 listed deletions changed. No generated file, ledger
  or unrelated file was touched. Every remaining file in the two rounds is cited.
- **CI.** The invariant test runs in `npm test` (default vitest include), CI installs ripgrep, and a
  missing `rg` in CI fails instead of skipping.

## Verdict

**Request changes.** The script is careful and its boundary is clean. By its own file-level
definition the flush is exact: the deleted set equals the uncited set on `origin/main`, and the
cited set is unchanged. The blocking issue is M1. Twenty-four corpus cases cite the
`2026-11-14-golden-coverage-audit/gap/` directory as provenance without naming their lane draft, and
the flush removed four JSON files from that directory, `gap-2.json` among them. So the TODO's
"nothing cited by the corpus went" is not proven for directory citations. To resolve it, either
teach the script about directory citations and restore the four `gap/` files (flush 80), or record
an owner decision that the directory citation does not pin them. Then address m1 through m3. The
nits are optional.
