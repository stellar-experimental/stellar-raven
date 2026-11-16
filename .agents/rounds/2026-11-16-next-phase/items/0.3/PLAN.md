# Item 0.3 plan: bundle the branches, then delete them

Lead: Claude Opus 5.5, agentpc `t1qw`. Worktree `/home/tyler/code/raven-wt/np-0.3`, branch
`np/0.3-branch-bundle` from `origin/main` at `0bfbc8f4`. Binding inputs: round
[PLAN.md](../../PLAN.md) item 0.3 and [DECISIONS.md](../../DECISIONS.md) answer 8.

## Decision

The repository ends "main only" (no other branch on `origin`, on agentpc, or on the Mac) with no
work lost. Every ref's content absent from `main` gets a written disposition (already on `main`,
brought into `main`, or archived in the bundle with a reason) before anything is deleted, and the
bundle verifies first.

## Facts re-checked (2026-11-16, after `git fetch --prune`)

PLAN.md counted 13 refs from the Mac. agentpc holds more:

- `origin`: 12 branches besides `main`. The fetch pruned three remote-tracking refs
  (`tune/loop-1`, `tune/loop-2`, `research/family-decider-close`); their local tips equal their
  merged pull-request heads (#446, #447, #445), so nothing was lost there.
- agentpc local: 34 branches besides `main`: the 12 that exist on `origin`, 12 whose remote is
  gone, and 10 that never had one (the seven `fp/*` and the three `tune-final-backup*`).
- agentpc worktrees: seven besides the main clone and this one. Six have a branch checked out; `gca-eval`
  is detached at `361ff2ef`. None has a live terminal or process. None has untracked files. Their
  ignored files hold run output: `eval/results/` (routing evals, 19 to 43 MB each), and in
  `gca-eval` the QA results (`eval/qa/results/`, 51 MB, 24 files) and the judge-stability register
  that several ledgers name as living there.
- Mac (from `~/backups/raven-next-phase/mac-inventory.md`): local `audit/golden-coverage` at
  `49ba5540`, one commit ahead of agentpc's `64580f3b` (agentpc's tip is its ancestor). It is
  the head of #436. One worktree (the main clone), no stash. Mac bundle
  `/home/tyler/backups/raven-next-phase/mac-audit-golden-coverage.bundle` verifies (complete
  history, one ref), SHA-256 `db7844a3bc8dda67bcc01ddf57e183b8216a5be8443cfec9fcde2c3f7497b137`.
- Already outside the repository, hash-identical to the branch files: the 184 client-text-limits
  run files (`~/backups/client-text-limits-2026-11-14/runs/`) and every loop 2 scan file on
  `tune/loop-2-runs` and `gca-eval` (`~/backups/loop2-scans-2026-11-15/scans/`).
- The five commits cited as "in git history" (`a49ee918`, `940dc013`, `3d65d0ff`, `bd9719fb`,
  `b8ea957d`) are reachable only from `tune/loop-2-runs` and `tune/loop-2`.

Method: for each ref, the files it changed since its merge base with `origin/main`, and for each
file whether its blob is reachable from `origin/main` history (any path, any commit). The raw lists
are in `tmp/0.3-inventory/` (ignored): `nh-<ref>.txt` lists the files whose content is nowhere in
`main`'s history; `br-<ref>.tsv` classes each touched file against `main`'s tip.

## Draft disposition (the reviewer checks it)

"Not in `main` history" counts files whose exact content `main` never held. A merged pull request
whose head equals the local tip counts as considered; later `main` edits explain the differences.

| Ref | Tip | Not in `main` history | Disposition |
|---|---|---|---|
| `audit/scope-decisions` | `a21b9c4c` | 0 | On `main`: #438 |
| `chore/fp-round-record` | `860e8085` | 0 | On `main`: #431 |
| `docs/agentic-rewrite` | `595d926d` | 0 | On `main`: #433 |
| `docs/skills-eval-policy` | `63894532` | 0 | On `main`: #432 |
| `feat/trimmed-surface` | `17138cf3` | 0 | On `main`: #430 |
| `research/caps-audit` | `4946d7d7` | 0 | On `main`: #441 |
| `research/client-limits-and-peers` | `d5e3afcf` | 0 | On `main`: #444 |
| `research/family-decider-close` | `fab34dc2` | 0 | On `main`: #445 |
| `tune/loop-1` | `aaffbbb4` | 0 | On `main`: #446 |
| `tune/loop-2` | `31dfa566` | 0 | On `main`: #447 (it also holds the five cited commits; see `tune/loop-2-runs`) |
| `evals/baseline-2026-11-14` | `fd1b02e3` | 0 | On `main`: every file's content is in `main` history |
| `research/mcp-peer-survey` | `2fea25c4` | 0 | On `main`: every file's content is in `main` history |
| `fp/plan` | `8cb76750` | 0 | On `main`: ancestor of `main` |
| Mac `audit/golden-coverage` | `49ba5540` | 0 | On `main`: #436 (the licensing case it adds was retired in #438 and stays in `main` history) |
| agentpc `audit/golden-coverage` | `64580f3b` | 1 (a ledger draft) | On `main`: ancestor of the Mac tip, #436 |
| `golden/baseline-case-defects` | `5298ca14` | 2 (`TODO.md`, `improvements/INDEX.md`) | On `main`: #442; the two differ by the squash merge's conflict resolution and index rebuild |
| `feat/stellar-org-source` | `b81e7a03` | 20 | Archived: #439 closed unmerged; the source merged through tuning loop 2 (#447), and its TODO follow-ups are on `main` as "Prove the stellar.org source and settle its egress". The 20 files are pre-loop-2 versions |
| `exp/family-decider` | `9667ac34` | 78 | Archived: the experiment closed in #445 ("an engine is not the fix"); the record is `research/audits/2026-11-14-family-decider.md`. Harness, FAM development set and Jev bundle stay in the bundle; the sealed split is in `~/backups/fd-2026-11-14/` |
| `exp/fd-lab-a`, `fd-lab-b`, `fd-sets`, `fd-st` | `885c9908`, `45e47e71`, `39ee9445`, `a0d20c1e` | 26 to 28 each | Archived: lanes of the same closed experiment (labels, sets, statements) |
| `fp/harness`, `fp/confirm` | `0ebc7988`, `3eccab81` (harness plus one commit) | 32 each | Archived: the fp round is closed (`.agents/rounds/2026-11-12-fp.md`); arm B shipped through #430 from a fresh branch. The generic agent loop, spend ledger and paired analysis are reusable only through their own reviewed pull request; restore from the bundle then. This answers the TODO owner decision "The round's prototype branches" under decision 8 |
| `fp/retrieve` | `4b36ee69` | 20 | Archived: the `retrieve`/`read` prototype was not built; all eleven variants scored below arm A |
| `fp/surface` | `bc71a018` | 17 | Archived: arm B and its revisions; the shipped form is #430 |
| `fp/brief`, `fp/calib` | `24307e8f`, `eb898412` | 1 each | Archived: screen-only scripts of the closed fp round |
| `tune-final-backup`, `2`, `3` | `1f60d651`, `a462813c`, `ddb84764` | 9 to 12 | Archived: snapshots taken while loop 1 was rebased (2026-11-14 21:17 to 21:28 UTC); superseded by `tune/loop-1` (#446) |
| `tune/loop-1-arm2` | `cf874a0f` | 12 | Archived: the measured arm 2 branch; arm 2 shipped in #446, its record is `ARM-2.md` |
| `tune/loop-1-arm3` | `d4919118` | 18 | Archived: the measured arm 3 branch; the micro-map removal shipped in #447, its record is `ARM-3.md` |
| `tune/loop-2-runs` | `431cfbe0` | 42 | Archived: the identifier pointer (`a49ee918`, `940dc013`), its replay tooling (`3d65d0ff`) and `bd9719fb`/`b8ea957d`; not shipped by the loop 2 rule (revert). The 18 scan files are also in `~/backups/loop2-scans-2026-11-15/` |
| `research/client-text-limits` | `61f53e97` | 185 | Archived: 184 run files, hash-identical to `~/backups/client-text-limits-2026-11-14/runs/`; the README line that names that folder is the only other difference, and `main` already says the same |
| `gca-eval` worktree HEAD (detached) | `361ff2ef` | 21 | Archived: 20 scan files (also in `~/backups/loop2-scans-2026-11-15/`) and one ledger draft |
| Worktree ignored files | | | Archived in a tarball (below). Not kept: `.dev.vars` (a secret, a copy of the main clone's), `node_modules/`, `.wrangler/`, `dist/`, `ecosystem-skills/.cache/`, `env.d.ts`, empty `tmp/` (all rebuilt by scripts) |

Nothing is brought into `main` as code. The only `main` edits are the citation and TODO fixes in
step 6.

## Steps

Phase A (the executor; deletes nothing):

1. **Bundle.** In the main clone, create
   `/home/tyler/backups/raven-next-phase/raven-branches-2026-11-16.bundle` from: every local
   branch except `main` and `np/*`; every `refs/remotes/origin/*` except `HEAD`; the Mac tip as
   `refs/archive/mac/audit/golden-coverage` (already fetched into `refs/np03-mac/…`; recreate it
   under `refs/archive/…`); the `gca-eval` HEAD as `refs/archive/worktree/gca-eval`; and
   `refs/remotes/origin/main` so the bundle has no prerequisites.
2. **Verify the bundle.** `git bundle verify`; `git bundle list-heads` equals the expected ref list
   and SHAs; `git clone --mirror` into an empty scratch directory, `git fsck --full` there, and
   compare every ref SHA again; and for three spot refs (`tune/loop-2-runs`, `exp/family-decider`,
   `fp/harness`) compare `git ls-tree -r` of the clone with the original. Record `sha256sum`.
3. **Tarball the ignored run output.** From the seven worktrees, the existing paths among
   `eval/results/`, `eval/qa/results/`, `eval/qa/judge-stability.json` into
   `/home/tyler/backups/raven-next-phase/raven-worktree-ignored-2026-11-16.tar.zst`, with a
   path-and-SHA-256 manifest beside it. Do not open any results file (QA results may hold
   held-out rows). Verify by listing the tarball against the manifest. Record `sha256sum`.
4. **Write `MANIFEST.md`** beside the bundle: every ref, its SHA, and its disposition from the
   table; the tarball's manifest path; both SHA-256 values.
5. **Stop.** The lead reports the disposition table, both paths and SHA-256 values to the
   orchestrator and waits for an explicit go.

Phase B (only after the orchestrator's go):

6. **Repository edits** on `np/0.3-branch-bundle` (one commit):
   - `.agents/TODO.md`: the "in git history" line in the identifier-pointer item cites the bundle
     and ref; the stellar.org routing-reach item stops naming `feat/stellar-org-source` and points
     at "Prove the stellar.org source and settle its egress"; delete the owner decision "The
     round's prototype branches" (answered by decision 8; recorded in the round ledger).
   - Round ledger `.agents/rounds/2026-11-16-next-phase.md`: the 0.3 row, with the bundle path and
     SHA-256 and the tarball path and SHA-256.
   - `.agents/rounds/2026-11-15-tuning-loop-2.md`: one line under its header saying the round's
     branches and the cited commits are in the bundle. Other dated ledgers stay unchanged; the
     bundle's `MANIFEST.md` resolves any branch name or SHA they cite.
   - This folder: `PLAN.md`, `REVIEW.md`, `EXEC.md`, `DISPOSITION.md` (the final table), and the
     report.
7. **Delete.** Remote: `git push origin --delete` for the 12 branches. agentpc: `git worktree
   remove` the six branch worktrees (refuse `--force` unless the only blockers are the archived
   ignored files), then `git branch -D` the 34 branches, delete `refs/np03-mac/*` and the
   temporary `refs/archive/*` (they live in the bundle), `git worktree prune`. `gca-eval`: see the
   open question.
8. **Re-verify after deletion.** `git ls-remote --heads origin` shows `main` and
   `np/0.3-branch-bundle` only; `git branch` shows `main` and `np/0.3-branch-bundle`; the bundle
   still verifies from an empty directory.
9. **Gates, push, pull request.** `npm run typecheck`, `npm test`, `npm run build`,
   `npm run secrets:scan -- --tree`, bare. Pull request `Refs #` none (no issue); docs-only.

Mac (the orchestrator): delete the local `audit/golden-coverage`, and copy the new bundle and
tarball to the Mac backup folder as the second copy.

## Gates

The four standard gates, bare. No model call, no paid call, no local server.

## Stop rule

- If the bundle or the tarball does not verify, delete nothing and report.
- If any ref's tip moves between the bundle and the deletion, or a new branch appears, stop and
  re-bundle that ref before deleting it.
- If the reviewer finds content with no disposition, it gets one before phase B.

## Risks

- **Unconsidered TODO or ledger text on a branch.** Thirteen branches carry a `TODO.md` that
  differs from `main`; on merged branches the merge was the consideration, but the unmerged ones
  (`exp/*`, `feat/stellar-org-source`, `tune/loop-2-runs`, `tune/loop-1-arm*`,
  `tune-final-backup*`, `research/client-text-limits`) need a read of their `TODO.md` and ledger
  additions. The reviewer does that read.
- **Remote deletion is outward-facing and not reversible from GitHub.** The bundle restores every
  ref; the orchestrator's go authorizes it.
- **Ledger citations of worktree paths** (`raven-wt/gca-eval/eval/qa/results/…`) go stale once a
  worktree is removed. The tarball keeps the files; the dated records stay as written.

## Needed from the orchestrator

1. The go for phase B after the report.
2. **`gca-eval`.** Recommendation: keep the worktree, detached and with no branch, because the
   stored QA results and the judge-stability register that `run-evals` and the ledgers read live
   in its ignored files, and it is the clean eval worktree the procedures use. Its HEAD is in the
   bundle either way. The alternative is to remove it and restore its files from the tarball into
   the main clone's ignored `eval/qa/results/` when needed.
3. The Mac branch deletion and the second copy of the bundle and tarball.

## Reconciliation with REVIEW.md

Every finding is adopted. This section overrides the steps, table and question above where they
differ.

- **F1 (blocker), FAM development rows.** New disposition: "Archived, move owed". In step 6, the
  TODO item "Treat stellar.org routing reach as a lexical and description question" gains one
  bullet: the FAM development rows are in the bundle at ref `exp/family-decider`, path
  `.agents/rounds/2026-11-14-family-decider/sets/fam.development.discovery.json` (and the copy under
  `~/backups/fd-2026-11-14/split/`), with both SHA-256 values; moving them into `eval/discovery/`
  is owed when the item is worked, because the loader now accepts `stellarOrg` and the move changes
  the routing set, so it needs its own gate run.
- **F2, worktree removal.** Never pass `--force`. A refusal means new work: stop and re-inventory.
  Just before each removal, re-hash that worktree's archived paths against the tarball manifest and
  check that `git status --porcelain --ignored` shows nothing outside the "Not kept" list.
- **F3, two archives, verified by content.** Archive from `/home/tyler/code/raven-wt` so each
  member starts with its worktree name.
  - `raven-wt-routing-results-2026-11-16.tar.zst`: `eval/results/` from `gca`, `loop2`, `sorg`,
    `tune`.
  - `heldout-private/raven-wt-qa-results-2026-11-16.tar.zst` in a mode-700 directory, with a
    one-line `README` stating that no agent opens it: `eval/qa/results/` and
    `eval/qa/judge-stability.json` from `gca` and `gca-eval`.
  - Each has a path-and-SHA-256 manifest. Verify with `tar --zstd -df <archive> -C
    /home/tyler/code/raven-wt` (prints nothing) and by hashing each member from the stream against
    the manifest. The manifest records that the pinned register is `gca-eval`'s
    (`4322dd4d…bf458`) and that `gca` holds a different one.
- **F4, two copies and the record first.** Phase B's go needs both: the bundle, both tarballs, the
  manifest and the sibling backups (F11) are on the Mac with matching SHA-256 values; and the
  step 6 commit is pushed with its pull request open. Order inside phase B: step 6 and the pull
  request, then the Mac copy, then the go, then local deletions, the re-verify, and the remote
  deletions last.
- **F5, tags.** All six tags go into the bundle and the manifest. The two local-only
  `fp-archive/*` tags (`e1145497`, `7be04d03`) take the `fp/retrieve` disposition. All tags stay;
  this item deletes no tag.
- **F6, lease-protected deletes.** Delete from the explicit name-and-SHA list in the manifest, never
  by pattern. Remote: `git push --force-with-lease=<branch>:<sha> origin :refs/heads/<branch>`.
  Local: `git update-ref -d refs/heads/<branch> <sha>`. The re-verify expects `main` plus `np/*`.
- **F7, `gca-eval` stays.** Untouched, detached at `361ff2ef`, as a data directory:
  `eval/qa/heldout-read.sh` defaults its register to that worktree and pins its SHA-256. Its ignored
  files still go in the held-out tarball. Step 6 adds a TODO item: move the register and stored
  results to a fixed path outside any worktree and change the script default in a reviewed change;
  then the worktree can go. The ledger row records that it stays by decision.
- **F8, corrections.** `fp/confirm` and `fp/harness` diverge by one commit each (`3eccab81`,
  `0ebc7988`). `gca` also holds `eval/qa/results/` (the split file) and its own register.
  `.dev.vars` in `gca`, `sorg`, `tune` are shorter files with a subset of the variable names; none
  is archived. `.wrangler/` is local dev-server state, dropped because it is state, not product,
  and may hold local tokens.
- **F9, reflog-only commits.** Not bundled by choice: the 31 are superseded drafts, autostashes or
  heads of merged pull requests. `MANIFEST.md` says so.
- **F10, TODO wording.** Delete the two sentences at `.agents/TODO.md` lines 309 to 311 about the
  bullet sitting on the branch. Items run one at a time, so these edits land before item 0.4 starts.
- **F11, findable archive.** Commit the manifest's content as `DISPOSITION.md` here; add one
  sentence to `.agents/README.md` naming where deleted branches are archived; list the sibling
  backups the dispositions rely on (`fd-2026-11-14/`, `client-text-limits-2026-11-14/`,
  `loop2-scans-2026-11-15/`, `fp-2026-11-12-evidence.tar.zst`, `gca-2026-11-14-split.json`) in the
  manifest and the Mac copy list; copy `tmp/0.3-inventory/` beside the bundle.
- **F12, verification.** Write the expected ref-and-SHA list to a file before bundling and diff
  `git bundle list-heads` against it. In the scratch clone, `git fsck --full`, compare every ref,
  and resolve the cited commits `a49ee918`, `940dc013`, `3d65d0ff`, `bd9719fb`, `b8ea957d`,
  `babdc090`. The `ls-tree` spot checks are dropped.
