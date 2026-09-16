# Branch and worktree review

Observed on 2026-09-16, before review agents created isolated candidates.

## Verdict

Keep both local branches and the original worktree.
No stale registration or stash needs cleanup.
PR #157 uses an external fork. Its branch is not missing from the origin repository.

## Branches

| Ref | Exact commit | Comparison | Disposition |
|---|---|---|---|
| `main` | `722eef5f2a81845ebdd8206e17ee100344eabd58` | Matches `origin/main` and live remote | Keep |
| `docs/cleanup-current-guidance` | `ac1769f75f72ba41622534f5f53b9c8944aeb69d` | Matches origin; two commits ahead of `main` | Keep for PR #156 |
| Fork `armandocodecr/stellar-raven:feat/trustless-work-source` | `b447ff403f82734a0297b56c78a1a5515aa1f824` | PR #157 targets `main` at `722eef5` | Review through PR #157 |

`git rev-list --left-right --count main...docs/cleanup-current-guidance` returned `0 2`.
The documentation branch contains `4d194bd` and `ac1769f` after `main`.
Its diff changes 13 files, with 197 insertions and 695 deletions.
The origin repository exposes only `main` and `docs/cleanup-current-guidance`.
GitHub reports `main` as protected.

## Worktrees and stored work

The initial registry contains one worktree: `/Users/kalepail/Desktop/stellar-raven-codemode`.
It uses `docs/cleanup-current-guidance` at `ac1769f75f72ba41622534f5f53b9c8944aeb69d`.
Its initial index and working tree were clean.
`git stash list` returned no entries.
`git worktree prune --dry-run --verbose` reported no stale registration.
The review did not delete branches, tags, worktrees, or stored work.
The final round ledger records any new candidate worktrees separately.

## Evidence commands

```sh
git status --short
git fetch origin --no-recurse-submodules
git for-each-ref --format='%(refname) %(objectname) %(upstream) %(upstream:track)' refs/heads refs/remotes
git ls-remote --heads origin
git rev-list --left-right --count main...docs/cleanup-current-guidance
git log --oneline origin/main..HEAD
git log --oneline HEAD..origin/main
git diff --stat main...docs/cleanup-current-guidance
git worktree list --porcelain
git worktree prune --dry-run --verbose
git stash list
gh api repos/stellar-experimental/stellar-raven/branches --paginate
gh pr view 157 --repo stellar-experimental/stellar-raven --json headRefName,headRefOid,baseRefOid,headRepository,isCrossRepository
```

## Next action

Complete the PR reviews before changing either feature branch.
After a future merge, verify ancestry and worktree cleanliness again before deletion.
