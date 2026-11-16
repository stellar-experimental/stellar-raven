# Brief: item 0.3, phase B (deletions), after the orchestrator's go

The orchestrator gave the explicit go for phase B on 2026-11-16 (relayed by the lead `t1qw`). Its
preconditions: the record pull request is open (yours, from `exec-b1.md`), and the Mac second copy
is done and verified. Start only after that pull request is open.

Follow PLAN.md's "Reconciliation" (F2, F4, F6, F7) exactly. The authority list is
`/home/tyler/backups/raven-next-phase/MANIFEST.md`: delete only refs whose Action there says
delete, by name and SHA, never by pattern. Work in the main clone
`/home/tyler/code/stellar-raven-codemode` for refs.

## 0. Record the Mac copy

Add to `/home/tyler/backups/raven-next-phase/MANIFEST.md` and to `items/0.3/DISPOSITION.md`: "Second
copy: Mac, `/Users/kalepail/Backups/stellar-raven/` (`raven-next-phase/` with `heldout-private/` at
mode 700, plus `fd-2026-11-14/`, `client-text-limits-2026-11-14/`, `loop2-scans-2026-11-15/`,
`fp-2026-11-12-evidence.tar.zst`, `gca-2026-11-14-split.json`). Verified by the orchestrator on
2026-11-16: the three archive SHA-256 values and the Mac bundle hash match, `git bundle verify` ok
with 55 heads, all 853 sibling files match per-file SHA-256."

## 1. Pre-check

Re-list every ref and diff against `expected-refs.txt`. If any tip moved or a new non-`main`,
non-`np/*` branch appeared, stop and report; do not delete.

## 2. Worktrees (six; `gca-eval` stays)

For each of `client-text-limits`, `gca`, `loop2`, `loop2-run`, `sorg`, `tune` under
`/home/tyler/code/raven-wt/`: re-hash its archived paths against the routing and QA manifests
(hash only, never open the QA files); check `git -C <wt> status --porcelain --ignored` shows nothing
beyond the archived paths and the not-kept list; then `git worktree remove <wt>` **without
`--force`**. A refusal means new work: stop and report. Then `git worktree prune`. Leave `gca-eval`
untouched.

## 3. Local refs

For each of the 34 local branches in MANIFEST.md: `git update-ref -d refs/heads/<branch> <sha>`.
Then the temporary refs: `refs/np03-mac/audit/golden-coverage` and both `refs/archive/*` with
`git update-ref -d <ref> <sha>`. Tags stay. Do not touch `main` or any `np/*` branch.

## 4. Re-verify

`git branch` shows `main` and `np/*` only; `git worktree list` shows the main clone, `gca-eval` and
`np-0.3`; the bundle still verifies, and a fresh `git clone --mirror` of it in an empty scratch dir
passes `git fsck --full` with 55 refs at their SHAs.

## 5. Remote, last

For each of the 12 `origin` branches in MANIFEST.md:
`git push --force-with-lease=<branch>:<sha> origin :refs/heads/<branch>`. Then
`git fetch --prune origin` and `git ls-remote --heads origin`: expect `main` and `np/*` only.

## 6. Record and push

Add a "Phase B" section to `EXEC.md` (commands, each result, final ref and worktree lists), update
the 0.3 ledger row's Result to say phase B is done (branches deleted, `gca-eval` kept), commit with
the normal hooks (`Record phase B of round item 0.3: branches deleted`, Co-Authored-By Sonnet 5.5),
run the four gates bare, push, and update the PR body's "phase B pending" line to "done". Report
with `hc send t1qw '<abs path of EXEC.md>'`.
