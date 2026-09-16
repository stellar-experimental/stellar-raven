# Worktree disposition before cleanup

This is a historical snapshot before cleanup. The report file was finalized at `2026-09-16T23:39:47.698330+00:00`.
The [release record](../2026-09-16-scout-release.md) and cleanup receipts supersede its pending checks and retained controls.
Its removal restriction applied to the read-only reviewer, which had no deletion authority.
The coordinator later verified production and authorized removal of the three clean task checkouts.

**Pre-cleanup verdict: no removal is authorized.**

This corrected snapshot follows PR #168 merge commit
`022970d5995e74487f69f8f985961eb5da48a978` and deployed version `f3e66eed`.
Production checks remain pending.

Mode: read-only Git metadata audit. No branch, worktree, pane, or repository file changed.
The audit did not read secret file contents.

The prior pre-merge audit observed `main` at `1d9fa2f`. That state is historical.
Current `main` and the detached `deploy` worktree are clean at `022970d5`.
The source-integration worktree is now clean at `022970d5` on `docs/scout-release-evidence`.

## Pre-cleanup worktree state

`tracked` excludes untracked files. All dirty changes are unstaged.
No worktree has staged changes.

| Worktree | HEAD | Ref | State | Disposition |
| --- | --- | --- | --- | --- |
| `/Users/kalepail/Desktop/stellar-raven-codemode` | `022970d` | `main` | clean | Keep. This is the original user worktree. |
| `raven-execution-2026-09-16/deploy` | `022970d` | detached | clean | Keep until production checks and owner confirmation complete. |
| `raven-execution-2026-09-16/docs-title-drift` | `cd87615` | detached | 3 tracked | Retain. It holds a Docs-title source snapshot. |
| `raven-execution-2026-09-16/drift` | `722eef5` | `fix/scout-routing-acceptance` | 12 tracked, 1 untracked | Retain. It holds early routing evidence. |
| `raven-execution-2026-09-16/drift-combined` | `a83b3c5` | `fix/scout-routing-combined` | 13 tracked, 2 untracked | Retain. It holds combined routing and scrub evidence. |
| `raven-execution-2026-09-16/drift-combined-accepted` | `bb37bc5` | `fix/scout-routing-accepted-main` | 19 tracked, 3 untracked | Retain. It holds accepted pre-runtime evidence. |
| `raven-execution-2026-09-16/drift-combined-main` | `58954b6` | `fix/scout-routing-combined-main` | 12 tracked, 1 untracked | Retain. It includes a routing probe. |
| `raven-execution-2026-09-16/pr157` | `b447ff4` | `fix/trustless-work-review` | 22 tracked, 6 untracked | Retain. It holds Trustless Work review work. |
| `raven-execution-2026-09-16/pr157-integrated` | `cd87615` | `pr157-integrated-prep` | clean | Keep. Its retained history needs owner reconciliation. |
| `raven-execution-2026-09-16/routing-ablation` | `722eef5` | detached | 8 tracked, 1 untracked | Retain. It holds ablation evidence. |
| `raven-execution-2026-09-16/scout-runtime-accepted` | `bb37bc5` | detached | clean | Keep until production checks and owner confirmation complete. |
| `raven-execution-2026-09-16/scout-runtime-audit` | `bb37bc5` | detached | clean | Keep until production checks and owner confirmation complete. |
| `raven-execution-2026-09-16/scout-runtime-frozen` | `bb37bc5` | detached | 19 tracked, 3 untracked | Retain. It holds frozen runtime evidence. |
| `raven-execution-2026-09-16/scout-runtime-opt` | `bb37bc5` | detached | 20 tracked, 3 untracked | Retain. It holds optimization evidence. |
| `raven-execution-2026-09-16/source-integration` | `022970d` | `docs/scout-release-evidence` | clean | Keep through production verification. |
| `raven-execution-2026-09-16/source-integration-pre-runtime-tree` | `1d9fa2f` | detached | 24 tracked | Retain. It preserves the pre-runtime state. |
| `stellar-raven-drift-0916.mOmBFJ/repo` | `ac1769f` | detached | 9 tracked | Retain. It preserves earlier drift material. |

## Branch history and exact-tree proof

Commit-count divergence does not prove unmerged content. Squash merges retain distinct branch history.
The following independently compared tips have the same tree as the listed commit.

| Retained branch tip | Tree-equivalent commit | Content disposition |
| --- | --- | --- |
| `fix/docs-findings-resolve` `84ab1e4` | `c4b2ff` | Content landed. Retain branch history. |
| `docs/propose-trustless-work-case` `042084a` | `a83b3c5` | Content landed. Retain branch history. |
| `fix/scout-skill-reference-filter` `b31718a` | `bb37bc5` | Content landed. Retain branch history. |
| `docs/maintenance-evidence-2026-09-16` `e1832d1` | `1d9fa2f` | Content landed. Retain branch history. |
| `fix/scout-source-integration` `edb1421` | `022970d` | PR #168 content landed. Retain branch history. |

Keep `main` and `docs/cleanup-current-guidance` under the earlier user instruction.
Keep all remaining branch tips until their owners reconcile their separate histories.
This includes `docs/scout-release-evidence`, which now points at `022970d`.

## Cleanup boundary at the time of this snapshot

Do not delete any branch, worktree, pane, dirty evidence, or untracked evidence.
After production verification, the clean detached controls can receive a separate owner decision.
Those controls are `deploy`, `scout-runtime-accepted`, and `scout-runtime-audit`.
The clean source-integration worktree also requires a separate owner decision.

The earlier audit found no stale worktree registration and no stash.
This corrected audit makes no cleanup action.
