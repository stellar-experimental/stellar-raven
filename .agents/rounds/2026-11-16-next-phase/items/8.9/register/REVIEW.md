# Review: item 8.9, lane `register`

- Reviewed: `git diff origin/main...HEAD` on `np/8.9-register`, one commit `1fadb3d9` on merge base
  `6f0bf84b` (equal to `origin/main` at review time). Files: `eval/qa/heldout-read.sh` (+2/-1 lines
  of code plus a 2-line comment), `eval/qa/README.md` (+2), `test/heldout-read.test.mjs` (+11).
- Reviewer: Claude Opus tier, Claude Opus 5.5, high effort, in Antigravity. It is not the author
  (Gemini 4 Neon) and not the orchestrator. The orchestrator assigned this tier. The Codex workhorse
  tier fits a routine change like this one, so Claude Opus served as the AGENTS.md fallback.
- Checked against: the TODO item "Move the pinned judge-stability register out of the `gca-eval`
  worktree" (`.agents/TODO.md:1165`), the `register` section of `orch/8.9-LANES.md`, and `AGENTS.md`.
- Rules held: I did not open, print, or diff the contents of any register or result file. I
  compared only paths, counts, byte totals, and SHA-256 values, and I printed no results filenames.

## Verdict

**Approve.** No critical, high, or medium findings. Two low findings and two nits follow. None
blocks the merge.

## Data copy verification (hashes only)

| Check | Result |
|---|---|
| `/home/tyler/raven-data/qa/judge-stability.json` exists | yes, 30922 bytes, mtime 2026-11-14 17:38 (preserved by `cp -a`) |
| `/home/tyler/raven-data/qa/results/` exists | yes |
| Register SHA-256, source vs copy | both `4322dd4d1ebfc30bc02a9def008039aba4f4b2395b1f9da5cabef56ec24bf458` |
| Pin in `eval/qa/heldout-read.sh` (lines 55 and 58) | `4322dd4d…f458`, which matches the copy |
| Files (register + `results/`), source vs copy | 25 vs 25 regular files. No symlinks or other special files on either side. No subdirectories under `results/` on either side |
| Per-file `sha256sum` manifest (sorted relative paths + hashes) | identical. Manifest SHA-256 is `3036a109494c1b21c734f0c9aa012da22cf753410065d83628e1de08ec732b54` on both sides |
| `results/` apparent bytes, source vs copy | 52953097 vs 52953097 |
| Ignored files in `gca-eval/eval/qa/` (`git status --ignored`) | only `judge-stability.json` and `results/`, so every stored QA artifact in that directory was copied |
| `/home/tyler/raven-data` is outside any Git worktree | yes (no `.git` there) |

### `gca-eval` was not removed or modified

- The worktree is still registered (`git worktree list`): `/home/tyler/code/raven-wt/gca-eval`, detached
  at `361ff2ef`. Its last HEAD move in the reflog was 2026-11-15 09:27.
- No file in the worktree (excluding `node_modules`) has an mtime on or after 2026-11-19.
  `eval/qa/judge-stability.json` (2026-11-14) and `eval/qa/results/` (2026-11-15) are untouched.
- `git status` shows one change there: ` D CLAUDE.md`. It is older than this lane. The worktree root's
  mtime is 2026-11-17 16:43, and deleting a file updates the parent directory's mtime. This lane
  started on 2026-11-19, so it did not cause the deletion. Reported for the orchestrator's later
  removal of the worktree. It is not a finding against this lane.

Reproduce the check without reading content:

```sh
for d in /home/tyler/code/raven-wt/gca-eval/eval/qa /home/tyler/raven-data/qa; do
  (cd "$d" && find judge-stability.json results -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum)
done   # both lines: 3036a109494c1b21c734f0c9aa012da22cf753410065d83628e1de08ec732b54
```

## Reference sweep

`rg --hidden -g '!.git' -g '!.agents/rounds/**' 'gca-eval|raven-wt/gca' .` finds only:

- `.agents/TODO.md:1165-1174`: the item itself. The orchestrator owns closing it, and the lane may
  not edit it.
- `test/heldout-read.test.mjs:127`: the new negative assertion `not.toMatch(/gca-eval|raven-wt/)`.

No active reference remains in `eval/qa/heldout-read.sh`, `eval/qa/heldout-read.mjs`,
`eval/qa/README.md`, `test/README.md`, `.agents/skills/**`, `docs/**`, or `scripts/**`. The remaining
`gca-eval` mentions are in dated round records and scan scripts under `.agents/rounds/`. Those are
evidence, so leaving them unchanged is correct under AGENTS.md. `judge-stability.mjs` and `run-qa.mjs`
keep their in-repo default (`eval/qa/judge-stability.json`, which is gitignored). That default belongs
to the general collection path, not to the held-out launcher, and is out of scope.

## Spec conformance

| Requirement | Status |
|---|---|
| Target `/home/tyler/raven-data/qa/` created; register and stored QA results copied with `cp -a`, each checked by SHA-256 | met (verified above) |
| Copy, do not move; `gca-eval` left in place | met |
| Script default points at the new path with the same pin | met. Only the `${STABILITY_REGISTER:-…}` default changed. The pin comparison, the `pins.txt` line, and the `--stability-register` pass-through are unchanged |
| Docs and tests updated | met: one README table row, one README sentence in the tiering section, and one source-level test |
| TODO "done when … `gca-eval` worktree is removed" | deferred by design. The lane brief gives the removal to the orchestrator after merge |
| Lane report with the file list (paths and hashes) and how to verify | nothing in this directory besides this review. The commit message has no hash list. The report may have gone straight to the orchestrator, but the orchestrator should confirm it has one, or use the table and command above |

## Gates run

- `npx vitest run test/heldout-read.test.mjs`: 9 of 9 passed. `bash -n` is covered inside it.
- `npx vitest run test/case-search-guard.test.mjs test/case-search-ignore.test.mjs`: 279 of 279
  passed. They reference `eval/qa/README.md`, and the edited sections do not touch the
  exclusion-pathspec text.
- `npm run secrets:scan -- --tree`: clean.
- Not run: full `npm test`, `typecheck`, and `build`. The diff is shell, Markdown, and one `.mjs`
  test, and CI runs those gates. Also not run: the `eval/` checks from the CONTRIBUTING table
  (`eval:qa:lint`, `eval:qa:register -- --check`). The diff changes no case, register, or lint input,
  and their output can name case ids.

## Findings

### Low 1: the new owner-private directory is not listed where AGENTS.md says private folders are listed

AGENTS.md: "The owner keeps private folders outside it; `usage/README.md` names them. Never depend
on them." `/home/tyler/raven-data/` is a new owner-private directory, and the held-out launcher now
defaults to it. The dependency itself is what the TODO prescribes. It replaces an earlier dependency
on another worktree, the script fails closed with a fixed message when the file is missing, and
`STABILITY_REGISTER` overrides the path. So this is a documentation gap, not a violation. Suggested
follow-up for the owner or orchestrator, not this lane: add a row for `/home/tyler/raven-data/qa` to
`usage/README.md` "Owner data stays outside the repository", or say there that the held-out launcher
is owner-machine-only.

### Low 2: the lane's file-list report is missing from this item directory

See the spec table. The brief asks for "the file list (paths and hashes only) and how to verify".
Nothing in this item directory or in the commit holds it. The verification in this review covers the
gap. Orchestrator: confirm you received the lane report before you remove `gca-eval`.

### Nit 1: the pin is now duplicated in `eval/qa/README.md` with no guard

`eval/qa/README.md:579` repeats the full register SHA-256. The new test checks the pin in the script
only, so a future re-pin could update the script and test and leave the README stale. Either drop the
hash from the README (the path is enough, and the script is the source of truth), or accept the
duplication.

### Nit 2: hard-coded `/home/tyler/` instead of `$HOME`

The new default (`heldout-read.sh:54`), the comment (lines 10-11), the README, and the test all use
`/home/tyler/raven-data/...`. This keeps the old default's style (`/home/tyler/code/raven-wt/...`)
and matches the brief's literal target, so it is consistent. `${HOME}/raven-data/qa/...` would carry
over to another account of the owner's. Optional.

## Reconciliation status

No finding needs a change in this PR before merge. Low 1 and Nit 1/2 are optional follow-ups. Low 2
is a process check for the orchestrator.
