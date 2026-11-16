# Review of the item 0.3 plan

Reviewer: Claude Fable 5.2, high. Independent of the lead (Claude Opus 5.5). Read-only: no ref,
worktree or file outside this folder was changed. No QA results file, held-out case or
`~/backups/*heldout*` path was opened; where a results or split file had to be compared, only its
SHA-256 was computed.

## Verdict

**Phase A can run after findings 3 and 5 are folded in. Phase B is not ready: finding 1 is content
with no disposition, and findings 2, 4 and 6 change the deletion steps.**

The inventory itself is sound. I recomputed the "not in `main` history" count for all 36 refs from
scratch and every number matches the plan. The dispositions hold for every ref except one asset on
`exp/family-decider` (finding 1). My view on `gca-eval` is finding 7: keep it.

## What checked out

- **Refs.** `origin` has 12 branches besides `main`; agentpc has 34 besides `main` and `np/*`
  (12 on `origin`, 12 gone, 10 never pushed); all 12 local tips equal their `origin` tips. No
  stash, no open pull request, no protected branch besides `main`.
- **Pull requests.** Every "On `main`: #N" tip equals that pull request's head in
  `gh pr list --state all`; #439 is closed unmerged at `b81e7a03`.
- **Counts.** `git rev-list --objects origin/main` against each tip's `git ls-tree -r`: all 36
  counts equal the plan's table.
- **Novel text.** For each archived ref I listed the Markdown lines it adds since its merge base
  that no Markdown blob in `main`'s history holds, and read them. Zero such lines on
  `research/client-text-limits`, `gca-eval` HEAD, both `audit/golden-coverage` tips,
  `golden/baseline-case-defects`, `evals/baseline-2026-11-14` and `research/mcp-peer-survey`.
- **stellar.org follow-ups.** The branch item "Finish the stellar.org source after merge" (the same
  text on `feat/stellar-org-source`, all five `exp/*` and `tune/loop-2-runs`) has five done-when
  clauses. All five are on `main` in `.agents/TODO.md` under "Prove the stellar.org source and
  settle its egress" (lines 376 to 406).
- **Stated reasons.** fp: `.agents/rounds/2026-11-12-fp.md` lines 30 to 34, 68 to 74 and 120.
  Loop 1 arms: `.agents/rounds/2026-11-14-baseline-tuning.md` lines 75, 100 to 112 and 138.
  Identifier pointer: `.agents/TODO.md` lines 688 to 700. Family decider:
  `research/audits/2026-11-14-family-decider.md` lines 3 to 4 and 175 to 212.
- **Outside copies, by hash.** 184 of 184 run files are in
  `~/backups/client-text-limits-2026-11-14/runs/`; all 18 and 20 scan files are in
  `~/backups/loop2-scans-2026-11-15/`. The decider worktree's ignored fixtures, which the record
  says to copy "before the worktree is removed", are in `~/backups/fd-2026-11-14/fixtures/` with
  the three recorded SHA-256 values. The split file in `gca` equals
  `~/backups/gca-2026-11-14-split.json`.
- **Cited commits.** `a49ee918`, `940dc013`, `3d65d0ff`, `bd9719fb`, `b8ea957d` are on
  `tune/loop-2`, `tune/loop-2-runs` and the `gca-eval` HEAD only.
- **Mac bundle.** SHA-256 `db7844a3…7b137` matches; `git bundle verify` reports complete history;
  `64580f3b` is an ancestor of `49ba5540`.
- **Outward-facing.** No tracked file links to a non-`main` branch of this repository; the
  workflows trigger on `main` only; no process has its working directory in a worktree that would
  be removed. GitHub keeps `refs/pull/436/head`, `439/head` and `447/head` at the expected tips, so
  the five cited commits also stay reachable there.

## Findings

### 1. Blocker for phase B: the FAM development rows have no disposition

- **Evidence.** `research/audits/2026-11-14-family-decider.md` lines 208 to 212 on `main`: the
  rows "stay on the branch at
  `.agents/rounds/2026-11-14-family-decider/sets/fam.development.discovery.json`. Move them once
  `stellarOrg` is in the manifest and the loader." That condition is now true: #447 merged the
  source, and `eval/discovery/lib.mjs:6` lists `stellarOrg` in `FAMILIES`.
- `.agents/TODO.md` line 333 makes the open item "Treat stellar.org routing reach as a lexical and
  description question" done when a change is "measured on FAM development". `main` has no TODO
  line for the move, and the rows exist only on `exp/family-decider` and in
  `~/backups/fd-2026-11-14/split/` (same SHA-256, `4092c3c9…` and `0246ad02…`).
- The plan archives the branch as "the experiment closed". That reason does not cover an asset
  that `main` says to move and that an open item needs as its instrument.
- **Fix.** Give it a disposition before phase B. Cheapest: in step 6, add to that TODO item the
  bundle ref, the two paths and the two SHA-256 values, and say the move into `eval/discovery/` is
  owed when the item is worked (it changes the routing set, so it needs its own gate run). Or
  record that the owner drops the move.

### 2. Should-fix: `git worktree remove` deletes ignored files without `--force`

- **Evidence.** Step 7 says "refuse `--force` unless the only blockers are the archived ignored
  files". Git's check is `git status --porcelain` without `--ignored`: ignored files never block,
  and a plain `git worktree remove` deletes them silently. Only untracked or modified tracked
  files make it refuse.
- So the guard protects nothing that matters here, and the one case where `--force` would be
  needed is new untracked or modified work.
- **Fix.** Never pass `--force`. A refusal means new work: stop and re-inventory that worktree.
  Immediately before each removal, re-hash the worktree's archived paths against the tarball
  manifest, and confirm `git status --porcelain --ignored` shows nothing outside the plan's
  "Not kept" list.

### 3. Should-fix: the tarball mixes held-out material into a shareable archive and is verified by name only

- **Evidence.** `gca/eval/qa/results/` holds one file under `splits/`, the held-out split
  (`eval/qa/README.md:228`). `gca-eval/eval/qa/results/` holds the 24 stored QA results. The plan
  puts both in `~/backups/raven-next-phase/raven-worktree-ignored-2026-11-16.tar.zst`, in a
  directory of mode 775, and has the orchestrator copy it to the Mac.
- The standing rule protects `eval/qa/results/` and `~/backups/*heldout*` by path. This tarball
  matches neither, so a later agent can open it without breaking a rule it can see. The fp round
  kept such files apart for this reason (`.agents/rounds/2026-11-12-fp.md` lines 90 to 91).
- Six worktrees hold the same relative paths (`eval/results/`). The plan does not state the
  archive root, so members can collide.
- "Verify by listing the tarball against the manifest" checks names, not bytes.
- **Fix.**
  - Two archives. Routing output (`eval/results/` from `gca`, `loop2`, `sorg`, `tune`) goes in the
    planned tarball. `eval/qa/results/` and `eval/qa/judge-stability.json` from `gca` and
    `gca-eval` go in a second tarball inside a mode-700 directory whose name contains `heldout`,
    with a one-line README stating the no-open rule.
  - Archive from `/home/tyler/code/raven-wt` so each member path starts with its worktree name.
  - Verify by content without reading it: `tar --zstd -df <archive> -C /home/tyler/code/raven-wt`
    must print nothing, and each member's SHA-256 from the stream must equal the manifest.
  - Record in the manifest that the pinned register's SHA-256 is `4322dd4d…bf458` (finding 7) and
    that `gca` holds a different register.

### 4. Should-fix: after step 7 the unmerged work has one copy on one disk

- **Evidence.** The Mac copy is an unordered orchestrator task at the end of the plan. Step 9
  pushes the record after step 7 deletes. Between them, the branches with no pull request
  (`exp/*`, `tune/loop-2-runs`, `tune/loop-1-arm*`, `research/client-text-limits`, all `fp/*`, the
  three backups) exist only in one bundle in `~/backups` on agentpc.
- **Fix.** Make both of these conditions of the phase B go:
  - the bundle and both tarballs are on the Mac, and their SHA-256 values there equal the
    recorded ones;
  - the step 6 commit is pushed and its pull request is open, so the record of where each ref
    went is on `origin` before the refs leave it.
- Do the remote deletion last, after the local deletions and the re-verify.

### 5. Should-fix: two local-only tags hold unmerged work and are not in the plan

- **Evidence.** `refs/tags/fp-archive/live-recipe-e1145497` and
  `refs/tags/fp-archive/read-body-7be04d03` exist on agentpc only (`git ls-remote --tags origin`
  lists four `archive/*` tags and neither of these). Each holds one commit that no branch contains
  (`e1145497`, `7be04d03`: `src/retrieve/*` and its tests, tagged "fp round archive" on
  2026-11-14). No ledger names them.
- Step 7 does not delete tags, so nothing is lost by the plan as written. But the decision says
  "every ref", the bundle list in step 1 omits them, and they have no second copy.
- **Fix.** Add `refs/tags/*` (all six) to the bundle and to `MANIFEST.md`. Give the two
  `fp-archive/*` tags the `fp/retrieve` disposition. State whether tags stay; I would keep all
  six, since the four `archive/*` tags on `origin` are the 2026-11-06 cleanup's record (#384).

### 6. Should-fix: make the stop rule a property of the delete commands

- **Evidence.** The stop rule says to halt if a tip moves or a branch appears, but
  `git push origin --delete` and `git branch -D` delete whatever is there.
- **Fix.**
  - Delete from the explicit name-and-SHA list in `MANIFEST.md`, never from a pattern or "all
    but".
  - Remote: `git push --force-with-lease=<branch>:<sha> origin :refs/heads/<branch>`.
  - Local: `git update-ref -d refs/heads/<branch> <sha>`.
  - Each fails if the tip is not the bundled one.
  - Step 8 should expect `main` plus `np/*`, not `np/0.3-branch-bundle` alone; another round
    lane's branch must not read as a failure or get deleted.

### 7. `gca-eval`: keep the worktree

- **Evidence.** `eval/qa/heldout-read.sh:52` on `main` defaults `STABILITY_REGISTER` to
  `/home/tyler/code/raven-wt/gca-eval/eval/qa/judge-stability.json`, and line 53 stops unless its
  SHA-256 is `4322dd4d…bf458`. The file there has that hash today. The copy in `gca` does not
  (`6cdbaf39…`).
- Removing the worktree breaks a committed script's default. Restoring the files into the main
  clone invites a register refresh there (`eval/qa/run-qa.mjs` lines 530 to 542), which would
  change the pinned bytes.
- The plan's reason overstates one point: `run-evals` and `eval/qa/README.md` do not name the
  worktree. The dependency is that script and the dated ledgers.
- **View.**
  - Keep it, untouched and detached at `361ff2ef`. The worktree HEAD keeps the commit alive, the
    bundle holds it as `refs/archive/worktree/gca-eval`, and no branch remains, so the "main only"
    checks pass.
  - Still put its ignored files in the held-out tarball as the second copy.
  - Record in the ledger that it stays by decision, as a data directory.
  - Add a TODO item: move the register and the stored results to a fixed path outside any
    worktree and change the script default, in a reviewed change. Then the worktree can go.

### 8. Note: fact corrections for the plan and `MANIFEST.md`

- `fp/confirm` is not "harness plus one commit". The two diverge by one commit each: `fp/harness`
  has `0ebc7988` (the arm B revision 2 gate record), `fp/confirm` has `3eccab81` (collector
  hooks). Both are bundled; the disposition stands.
- "In `gca-eval` the QA results": `gca` also has `eval/qa/results/` (the split file) and its own
  register.
- "`.dev.vars` (a secret, a copy of the main clone's)": true for `gca-eval`, `loop2` and
  `loop2-run`. `gca`, `sorg` and `tune` hold shorter files (133 to 136 bytes against 362) with the
  same variable names minus `MCP_ADMIN_TOKEN`. I compared names and sizes only. Nothing suggests a
  credential the main clone lacks.
- `.wrangler/` is local dev-server state (KV, D1, R2, cache; 26 MB in `gca-eval`), not something
  a script rebuilds. Dropping it is right; state the real reason. It may hold local session
  tokens, so it should not go in a tarball.

### 9. Note: commits reachable only from reflogs are not bundled

- **Evidence.** `git fsck --no-reflogs --unreachable` lists 31 commits. All are amended or
  pre-rebase versions of merged work, autostash entries, or heads of merged pull requests whose
  branches are already gone (#434, #435, #440, #450 to #452). Across them, 17 file versions exist
  in no ref.
- `git branch -D` drops the branch reflogs that keep some of them (for example `5c4cd684` and
  `927fc0ad` on `tune/loop-2`).
- **Fix.** None needed: each is a superseded draft of a commit that is bundled or merged. Say so
  in `MANIFEST.md` so the omission reads as a choice.

### 10. Note: step 6 wording and ownership

- `.agents/TODO.md` lines 309 to 311 say the routing-reach bullet sits on the branch and "When
  that branch merges, link that bullet". The bullet is already on `main` (line 388) and points
  back at this item. Delete those two sentences; a new pointer to "Prove the stellar.org source"
  would be circular.
- The round plan's lane table gives item 0.3 no write set in the tree and gives `.agents/TODO.md`
  and the two loop ledgers to item 0.4. Land these edits before 0.4 starts, or hand them to it.

### 11. Note: make the archive findable from the repository

- `MANIFEST.md` lives outside the repository, and the dated records that cite branches stay
  unchanged (`research/audits/2026-11-14-family-decider.md` "Where the evidence lives", the fp
  ledger's "Lanes" table, the baseline-tuning ledger). A reader who meets a missing branch has no
  live pointer.
- **Fix.**
  - Commit `MANIFEST.md`'s content as this folder's `DISPOSITION.md` (refs, SHAs, bundle path and
    hash).
  - Add one sentence to `.agents/README.md` saying where deleted branches are archived.
  - List in the manifest the sibling backups the dispositions rely on (`fd-2026-11-14/`,
    `client-text-limits-2026-11-14/`, `loop2-scans-2026-11-15/`, `fp-2026-11-12-evidence.tar.zst`,
    `gca-2026-11-14-split.json`), and include them in the Mac copy.
  - Copy `tmp/0.3-inventory/` beside the bundle; it is ignored and goes with this worktree.

### 12. Note: two cheap additions to step 2

- In the scratch clone, resolve the commits the records cite: the five above and `babdc090`
  (family-decider record, line 177). This tests the citation directly.
- Write the expected ref-and-SHA list to a file before bundling and diff `git bundle list-heads`
  against it. With SHA equality and `git fsck --full` in the clone, the three `ls-tree` spot
  checks add nothing; keep or drop them.
