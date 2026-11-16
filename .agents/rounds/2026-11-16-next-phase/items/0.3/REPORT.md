# Item 0.3 report: branches bundled, then deleted

Lead: Claude Opus 5.5, agentpc `t1qw`. Plan review: Claude Fable 5.2, high (12 findings, all
adopted; one blocker, the FAM development rows, now "archived, move owed" in the TODO). Executor:
Claude Sonnet 5.5, high.

## Result

- Pull request: https://github.com/stellar-experimental/stellar-raven/pull/453 (docs-only; the
  record, the TODO fixes, the ledger row, `DISPOSITION.md`). Not merged.
- Bundle: agentpc `~/backups/raven-next-phase/raven-branches-2026-11-16.bundle`, 55 refs, SHA-256
  `15f6ff8390c52e259c4fdc97621d2b6278b84d397451c5329d234e88a0138ce7`. It still verifies after the
  deletions. Second copy on the Mac at `/Users/kalepail/Backups/stellar-raven/`, verified by the
  orchestrator.
- Phase B done after the orchestrator's go. Deletions were by exact name and SHA, with remote
  deletions last under `--force-with-lease`. No refusal, lease failure or deviation.
  - Deleted: 34 local branches and 12 `origin` branches.
  - Removed: six worktrees, without `--force`. Their ignored run output is in the two tarballs.
  - Kept: all six tags, and `gca-eval` (detached, by decision, as a data directory).
  - Dropped: the temporary `refs/archive/*` and `refs/np03-mac/*`, which are in the bundle.
- What remains, which I re-checked myself:
  - `origin`: `main` and `np/0.3-branch-bundle`.
  - agentpc: `main` and `np/0.3-branch-bundle`.
  - Worktrees: the main clone, `gca-eval` and `np-0.3`.
- Gates on the final tip, bare: typecheck 0, test 0 (3,608 passed), build 0, secrets scan clean.

## Deploy

Not needed: no Worker bytes change.

## For the orchestrator on the Mac

1. Delete the Mac's local `audit/golden-coverage` (`49ba5540`). It is in both bundles.
2. Merge #453. After the merge, `np/0.3-branch-bundle` (remote and agentpc) and the `np-0.3`
   worktree can go; I have not removed them, because the pull request still needs them.

## Open questions for the owner

None. Two follow-ups are on the TODO:
- Move the FAM development rows into `eval/discovery/` when the stellar.org routing-reach item is
  worked.
- Move the pinned judge-stability register out of `gca-eval`, then remove that worktree.
