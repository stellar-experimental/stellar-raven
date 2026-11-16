# Item 0.3 execution record

Executor: Claude Sonnet 5.5, high. Lead: `t1qw`. Plan: [PLAN.md](PLAN.md) (its "Reconciliation"
section governs); review: [REVIEW.md](REVIEW.md).

## Phase A: bundle and archive (2026-11-16, nothing deleted)

Outputs are in `/home/tyler/backups/raven-next-phase/` (`B` below). Git work ran in the main clone
`/home/tyler/code/stellar-raven-codemode`. No ref was deleted, pushed, checked out or reset; the only
refs created are `refs/archive/mac/audit/golden-coverage` (`49ba5540`) and
`refs/archive/worktree/gca-eval` (`361ff2ef452cc2b9ed61329470b70b26313dca8a`). No worktree was
removed. No model call, paid call or local server. No results file was opened: the QA archive was
only hashed, byte-compared by `tar -d` (which prints nothing on a match) and counted.

### Files

| File | Bytes | SHA-256 |
|---|---|---|
| `B/raven-branches-2026-11-16.bundle` (55 refs) | 60868289 | `15f6ff8390c52e259c4fdc97621d2b6278b84d397451c5329d234e88a0138ce7` |
| `B/raven-wt-routing-results-2026-11-16.tar.zst` (230 files) | 1042829 | `9aa2884f1abd953be198198bfb096c149273ee814141572360e1eab2a00bc21a` |
| `B/heldout-private/raven-wt-qa-results-2026-11-16.tar.zst` (27 files; directory mode 700, file mode 600) | 5605658 | `60819728a949141c0fe881207d4a90983d0d112893f595d61f2e62824ad68b2e` |

`MANIFEST.md`: `/home/tyler/backups/raven-next-phase/MANIFEST.md` (refs, SHAs, dispositions and
actions; worktrees; not-kept list; reflog-only commits; sibling backups with hashes). Also beside the
bundle: `expected-refs.txt` (55 lines), `0.3-inventory/` (copy of `tmp/0.3-inventory/`, 70 files),
`raven-wt-routing-results-2026-11-16.manifest.sha256` (230 lines),
`heldout-private/raven-wt-qa-results-2026-11-16.manifest.sha256` (27 lines) and
`heldout-private/README` (the no-open rule).

### Step 1: re-list, then bundle

Re-list (matches the plan): 34 local branches besides `main` and `np/*`; 12 `origin` branches
besides `main` (`git ls-remote --heads origin` tips equal the tracking refs; every local tip equals
its `origin` tip); 6 tags; Mac tip `49ba5540` in `refs/np03-mac/`; `gca-eval` HEAD `361ff2ef`; seven
worktrees besides the main clone and `np-0.3`. No tip moved and no ref appeared.

```
git update-ref refs/archive/mac/audit/golden-coverage 49ba554015b0b8245a3578d83f789c0cd70b1cdb
git update-ref refs/archive/worktree/gca-eval 361ff2ef452cc2b9ed61329470b70b26313dca8a
# expected list: refs/heads/* (not main, not np/*), refs/remotes/origin/* (not HEAD),
#                refs/archive/*, refs/tags/*  -> B/expected-refs.txt, sorted by ref name
git bundle create B/raven-branches-2026-11-16.bundle --stdin < <(awk '{print $2}' B/expected-refs.txt)
```

Ref count: **55** = 34 local branches + 13 `origin` refs (12 branches and `origin/main`) + 2
`refs/archive/*` + 6 tags. `origin/main` (`0bfbc8f4`) is in the bundle, so it has no prerequisites.

### Step 2: bundle verification

| Check | Result |
|---|---|
| `git bundle verify` | "The bundle records a complete history." (sha1) |
| `git bundle list-heads` (sorted) against `expected-refs.txt` | identical; 55 lines |
| `git clone --mirror <bundle>` into an empty scratch directory | succeeded |
| `git fsck --full` in the clone | no output, exit 0 |
| every ref and SHA in the clone against `expected-refs.txt` | identical (55) |
| cited commits resolve in the clone | `a49ee918`, `940dc013`, `3d65d0ff`, `bd9719fb`, `b8ea957d`, `babdc090`: all resolve to commits |
| refs unchanged after the bundle | re-listed: no tip moved |

The three `ls-tree` spot checks were dropped (F12). Scratch clone:
`<scratchpad>/verify/mirror` (not kept).

### Step 3: ignored run output, two archives (F3)

Archived from `/home/tyler/code/raven-wt`, so each member starts with its worktree name. Existence
check over all seven worktrees found paths only where the plan said; none is tracked, none is a
symlink.

```
cd /home/tyler/code/raven-wt
find gca/eval/results loop2/eval/results sorg/eval/results tune/eval/results -type f -print0 | sort -z > routing.list0
{ find gca/eval/qa/results gca-eval/eval/qa/results -type f -print0
  printf '%s\0' gca/eval/qa/judge-stability.json gca-eval/eval/qa/judge-stability.json; } | sort -z > qa.list0
xargs -0 sha256sum < routing.list0 > B/raven-wt-routing-results-2026-11-16.manifest.sha256
xargs -0 sha256sum < qa.list0     > B/heldout-private/raven-wt-qa-results-2026-11-16.manifest.sha256
tar --null -T routing.list0 --zstd -cf B/raven-wt-routing-results-2026-11-16.tar.zst
tar --null -T qa.list0      --zstd -cf B/heldout-private/raven-wt-qa-results-2026-11-16.tar.zst
```

| Archive | Members | Source files (live) |
|---|---|---|
| routing | 230 | `gca` 35, `loop2` 82, `sorg` 51, `tune` 62 under `eval/results/` |
| QA (held out) | 27 | `gca/eval/qa/results/` 1, `gca-eval/eval/qa/results/` 24, plus the two `judge-stability.json` |

Verification, each archive:

| Check | Result |
|---|---|
| `tar --zstd -df <archive> -C /home/tyler/code/raven-wt` | printed nothing, exit 0 (both) |
| each member's SHA-256 hashed from the stream (`tar -x --to-command`) against the manifest | all equal: 230 of 230 and 27 of 27 |
| member count in the archive against the manifest | 230 and 27 |

Registers: `gca-eval/eval/qa/judge-stability.json` is `4322dd4d…bf458`, the value
`eval/qa/heldout-read.sh` pins; `gca`'s is a different file, `6cdbaf39…44036`. Both are in the QA
archive; `MANIFEST.md` records this.

### Step 4: `MANIFEST.md`

Written from the expected-refs list plus the plan's table and reconciliation. A check pulling every
`refs/…` row's SHA out of `MANIFEST.md` and comparing with `expected-refs.txt` found them identical
(55 rows). It records the six tags (four `archive/*` kept; two local `fp-archive/*` take the
`fp/retrieve` disposition and are kept), the `exp/family-decider` "archived, move owed" disposition
(F1), the delete actions as name-and-SHA only with the lease commands (F6), the not-bundled 31
reflog-only commits (F9), the worktree plan with `gca-eval` staying (F7), the not-kept list with the
`.wrangler/` reason (F8) and the five sibling backups with hashes (F11).

Sibling backup hashes (from `/home/tyler/backups/`; "tree" is the SHA-256 of the sorted per-file
`sha256sum` listing):

| Path | Files | SHA-256 |
|---|---|---|
| `fd-2026-11-14/` | 578 | tree `5861651a04b84de9b5602fe3738da186ef30e159bd3140d530ba277a3c4e668a` |
| `client-text-limits-2026-11-14/` | 184 | tree `15f711b21dc754795fe0c639c7d95afc858ed4b1f11a02e02a838469fa0bf45a` |
| `loop2-scans-2026-11-15/` | 89 | tree `546cf40483e0ba933aa13b55bad5602c0b51e2445ca0d949282a3fa653f3eeec` |
| `fp-2026-11-12-evidence.tar.zst` | 1 | `4484ac837d779e584feeff22cc859fef27cc84d5b964274118093d684897c857` |
| `gca-2026-11-14-split.json` | 1 | `f683852ee2922dce1b73504582fca7109a21b5cdff89d72a219c51d6f9890efa` |

### Deviations and notes

- **None from the reconciled plan's steps 1 to 4.** Choices the plan left open:
  - zstd default level; the routing archive is small (1 MB for 130 MB of JSON).
  - The QA manifest and README live inside `heldout-private/` (mode 700), because the manifest names
    held-out paths; the routing manifest sits beside its tarball.
  - `0.3-inventory/` was copied from the worktree's ignored `tmp/` (the main clone has none).
  - Temporary scratch lists (`routing.list0`, `qa.list0`) were removed from `B/`.
- The temporary refs `refs/archive/*` and `refs/np03-mac/*` still exist in the main clone; phase B
  deletes them after the bundle's final re-verify.
- `EXEC.md` and the rest of this folder are untracked and uncommitted, as instructed.
- Still owed before phase B (not done here, by the brief): the Mac copy of the bundle, both archives,
  `MANIFEST.md` and the sibling backups (F4), and the step 6 commit and pull request.

## Step 6: the record commit (nothing deleted)

Worktree `/home/tyler/code/raven-wt/np-0.3`, branch `np/0.3-branch-bundle`. Brief:
[briefs/exec-b1.md](briefs/exec-b1.md). No ref, worktree, tag or file outside this worktree was
deleted.

Edits:

- `.agents/TODO.md`:
  - The identifier-pointer item now says the implementation is archived in the bundle at
    `refs/heads/tune/loop-2-runs` (commits `a49ee918`, `940dc013`, `3d65d0ff`) and gives the restore
    command.
  - "Treat stellar.org routing reach as a lexical and description question": the two sentences about
    the bullet sitting on `feat/stellar-org-source` are replaced by one pointing at "Prove the
    stellar.org source and settle its egress" and the family decider record (F10). A paragraph
    states where the FAM development rows are archived (bundle ref `refs/heads/exp/family-decider`,
    path `.agents/rounds/2026-11-14-family-decider/sets/fam.development.discovery.json`, and
    `~/backups/fd-2026-11-14/split/`) and that moving them into `eval/discovery/` is owed with its
    own gate run (F1). SHA-256 of `git cat-file -p exp/family-decider:<path>` and of the backup copy
    are both `0246ad022163f1d67247671b8ed640d7bb61f1aec6cad65a937ffa33b56cf89c`: they match.
  - New item under "Eval instruments": move the pinned judge-stability register and the stored QA
    results out of the `gca-eval` worktree, change `eval/qa/heldout-read.sh`'s default, then remove
    the worktree (F7).
  - Deleted the owner decision "The round's prototype branches" (answered by decision 8, recorded in
    the ledger row). The section now reads "None open."
- `.agents/rounds/2026-11-16-next-phase.md`: the 0.3 row (bundle and both tarball SHA-256 values,
  `gca-eval` stays, phase B pending, no Worker bytes change). The PR column links #453 (filled in by a
  follow-up commit).
- `.agents/rounds/2026-11-15-tuning-loop-2.md`: one paragraph under the header naming the bundle and
  linking `DISPOSITION.md`.
- `.agents/README.md`: one Retention bullet saying deleted branches are archived in dated bundles
  outside the repository and that `DISPOSITION.md` lists each ref, SHA and bundle.
- `DISPOSITION.md`: the content of `/home/tyler/backups/raven-next-phase/MANIFEST.md` under a
  one-line header. A grep for `heldout`, `held-out`, `split` finds only the archive names, the
  register note and the sealed-split backup path; no line names which QA set a case is in.
- `PLAN.md`, `REVIEW.md`, `GO-REQUEST.md`, `briefs/`, this file: in the commit.

Gates, bare, from this worktree. The worktree had no `.dev.vars` or `env.d.ts`, so I created the
placeholder `.dev.vars` from the CI stub (names only, value `x`; ignored, not committed) and ran
`npm run typegen` first, as `README.md` says.

| Gate | Result |
|---|---|
| `npm run typecheck` | exit 0 (the first run, before typegen, failed on `OAUTH_KV` missing from `Env`, the documented symptom) |
| `npm test` | exit 0: 164 files passed, 5 skipped; 3608 tests passed, 3 expected fail, 5 skipped |
| `npm run build` | exit 0 (dry run) |
| `npm run secrets:scan -- --tree` | clean: all tracked files |

`CONTRIBUTING.md`'s Checks table has no command for `.agents/`, so no docs lint was run. The
pre-commit secrets hook ran on the commit. `test:smoke` was not run: no `src/executor` or `src/demo`
change.

Pull request: https://github.com/stellar-experimental/stellar-raven/pull/453 (branch pushed at
`6575e1e7`; a follow-up commit adds the PR link to the ledger row). Nothing was deleted.

## Phase B: deletions (2026-11-16, after the orchestrator's go)

Brief: [briefs/exec-b2.md](briefs/exec-b2.md). Preconditions held: pull request #453 open at
`cc84a77a`, and the Mac second copy verified by the orchestrator (recorded in `MANIFEST.md` and
`DISPOSITION.md`, section "Second copy"). Refs were worked in the main clone, from the name-and-SHA
list in `MANIFEST.md`, never by pattern.

| Step | Command and result |
|---|---|
| 0. Record the Mac copy | Appended the "Second copy" paragraph to `MANIFEST.md` and `DISPOSITION.md` |
| 1. Pre-check | Local refs (branches, `origin/*`, `refs/archive/*`, tags) diffed against `expected-refs.txt`: identical, except `refs/remotes/origin/np/0.3-branch-bundle` (this item's own pushed branch, `np/*`, out of scope). `git fetch origin`; `ls-remote --heads origin` equals the expected `origin` tips; no new non-`main`, non-`np/*` branch |
| 2. Worktrees | For `client-text-limits`, `gca`, `loop2`, `loop2-run`, `sorg`, `tune`: archived paths re-hashed against both manifests (`gca` 37, `loop2` 82, `sorg` 51, `tune` 62 files; all equal; the other two hold none; no QA file opened); `git status --porcelain --ignored` showed only the archived paths and the not-kept list (`.dev.vars`, `node_modules/`, `.wrangler/`, `dist/`, `ecosystem-skills/.cache/`, `env.d.ts`); `git worktree remove <wt>` without `--force`: six exit 0, no refusal; `git worktree prune`. `gca-eval` untouched |
| 3. Local refs | `git update-ref -d refs/heads/<branch> <sha>` for the 34 branches (34 of 34 succeeded), then `refs/np03-mac/audit/golden-coverage` and the two `refs/archive/*` the same way. Tags, `main` and `np/*` untouched |
| 4. Re-verify | `git branch`: `main` and `np/0.3-branch-bundle`. `git worktree list`: main clone (`0bfbc8f4`), `gca-eval` (detached `361ff2ef`), `np-0.3`. `git bundle verify`: complete history, SHA-256 still `15f6ff83…38ce7`. Fresh `git clone --mirror` of the bundle: `git fsck --full` clean, 55 refs, every SHA equals `expected-refs.txt`. Six tags unchanged |
| 5. Remote | `git push --force-with-lease=<branch>:<sha> origin :refs/heads/<branch>` for the 12 branches: 12 of 12 `[deleted]`, no lease failure. `git fetch --prune origin`. `git ls-remote --heads origin`: `main` (`0bfbc8f4`) and `np/0.3-branch-bundle` (`cc84a77a`) only |

Notes:

- A count of live result files per worktree read one higher than the manifest (`gca` 37 against 36,
  and so on). The extra file is the tracked `eval/qa/corpus/retired/q-scf-round-43-results.json`,
  matched by my `*results*` pattern; the status check had already shown nothing but archived paths
  and the not-kept list. I caught this after the removals, from the same file in this worktree.
- Pull request #453 stayed open: the deletions did not touch `np/*`.

Final state: refs `main` and `np/0.3-branch-bundle` locally and on `origin`; six tags; worktrees
main clone, `gca-eval`, `np-0.3`. The bundle and both tarballs on agentpc and the Mac copy are the
only archive of the deleted branches.

Gates after phase B, bare, from this worktree: `npm run typecheck`, `npm test`, `npm run build` and
`npm run secrets:scan -- --tree` all exit 0.
