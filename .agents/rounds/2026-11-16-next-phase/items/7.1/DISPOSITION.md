# Item 7.1 dispositions

Every file, folder or code path this item removes, under the owner's deletion rule in 7-COMMON
("be careful never to delete work that hasn't been considered or wrapped into the main project").

## Main checkout `tmp/` on agentpc (plan decision 7, option (g))

Source: `/home/tyler/code/stellar-raven-codemode/tmp/`, git-ignored, never in git. Newest file
2026-11-14; no process had its working directory there. Contents were not opened: the FP round's
own record (`.agents/rounds/2026-11-12-fp.md`, "Retained evidence") states that its evidence
archive excluded the row files and per-case data folders, so they were archived nowhere.

| Path | Files | Disposition |
|---|---|---|
| `tmp/fp/` (12 GB) | 6,824 files and 1 symlink | Archived with a reason: per-case FP round data that no archive held. Removed from the working tree. |
| `tmp/agentic/` (4.5 MB) | 123 | Archived: lane briefs and reports from the 2026-11-14 golden coverage audit. Removed. |
| `tmp/size-audit/` (168 KB) | 11 | Archived: 2026-11-12 size-audit working files. Removed. |

- Archive: `~/backups/raven-next-phase/7.1-main-tmp-2026-11-17.tar.zst` (agentpc, mode 600),
  537,831,078 bytes, SHA-256 `24d62f3ff0022e0eb404221aeffd3c2be965e048e9a976b61db2621a41f6e838`
  (also in `…tar.zst.sha256` beside it).
- Manifest of the source tree, taken before the archive: `…/7.1-main-tmp-2026-11-17.manifest.sha256`
  (6,958 lines, mode 600; its own SHA-256
  `3b107710ea4356c7091df1cdbf8eae91cd31cd1fa9b82cfc81d32b6544e29961`).
- Verification before removal: the archive was extracted to a private folder on the home volume,
  `sha256sum -c` passed for all 6,958 files (exit 0), and the one symlink
  (`fp/harness/draft/core.mjs`, pointing into the `fp-harness` worktree path) was present. The
  extraction was then deleted.
- The file that `.agents/rounds/2026-11-14-golden-coverage-audit/apply/RECONCILE.md` cites,
  `tmp/fp/fp-retrieve/procedural-facts-detail.json`, is in the archive at
  `fp/fp-retrieve/procedural-facts-detail.json` (manifest line present). The committed record is
  not edited.
- Not touched: the `gca-eval` worktree and its stored results, every split file under
  `~/backups/`, and the main checkout's other ignored files (`.dev.vars`, `ecosystem-skills/.cache/`,
  `node_modules/`).
- The Mac checkout was not inspected; if it holds a `tmp/fp/`, the same treatment applies there.

## Dated golden-round JSON (option (f))

Not removed by this item. See [PLAN.md](PLAN.md), reconciliation finding 1: the corpus cites 24 of
those files as per-case provenance. The report proposes a separate ledger-only pull request.

## Code paths

Recorded by the executor in [EXEC.md](EXEC.md).
