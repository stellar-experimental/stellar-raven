# Item 0.3: go request for phase B (nothing deleted yet)

Lead: Claude Opus 5.5, agentpc `t1qw`. Plan: [PLAN.md](PLAN.md) (its "Reconciliation" section
governs). Fable review: [REVIEW.md](REVIEW.md): 12 findings, all adopted (one blocker: the FAM
development rows `main` says to move; now "archived, move owed" with a TODO bullet). Phase A record:
[EXEC.md](EXEC.md). Full name-and-SHA list: `/home/tyler/backups/raven-next-phase/MANIFEST.md`
(agentpc).

## Bundle and archives (verified; I re-ran the checks myself)

| File (agentpc, `/home/tyler/backups/raven-next-phase/`) | SHA-256 |
|---|---|
| `raven-branches-2026-11-16.bundle` (55 refs, 60,868,289 bytes) | `15f6ff8390c52e259c4fdc97621d2b6278b84d397451c5329d234e88a0138ce7` |
| `raven-wt-routing-results-2026-11-16.tar.zst` (230 files) | `9aa2884f1abd953be198198bfb096c149273ee814141572360e1eab2a00bc21a` |
| `heldout-private/raven-wt-qa-results-2026-11-16.tar.zst` (27 files, mode 700, no agent opens it) | `60819728a949141c0fe881207d4a90983d0d112893f595d61f2e62824ad68b2e` |
| `mac-audit-golden-coverage.bundle` (yours; also inside the new bundle as `refs/archive/mac/audit/golden-coverage`) | `db7844a3bc8dda67bcc01ddf57e183b8216a5be8443cfec9fcde2c3f7497b137` |

Checks: `git bundle verify` reports complete history (`origin/main` is inside, so no
prerequisites); `list-heads` equals the live refs (55: 34 local branches, 12 `origin` branches plus
`origin/main`, 2 `refs/archive/*`, 6 tags); a `git clone --mirror` from the bundle passes
`git fsck --full`, has every ref at its SHA, and resolves the cited commits `a49ee918`, `940dc013`,
`3d65d0ff`, `bd9719fb`, `b8ea957d`, `babdc090`. Both tarballs: `tar -d` against the live files
prints nothing, and every member's SHA-256 equals its manifest.

## Per-branch disposition

"Not in `main`" = files whose exact content no commit on `main` ever held.

| Branch (local, and `origin` where marked ●) | Tip | Not in `main` | Disposition |
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
| `tune/loop-2` | `31dfa566` | 0 | On `main`: #447 |
| `evals/baseline-2026-11-14` ● | `fd1b02e3` | 0 | On `main`: all content in `main` history |
| `research/mcp-peer-survey` ● | `2fea25c4` | 0 | On `main`: all content in `main` history |
| `fp/plan` | `8cb76750` | 0 | On `main`: ancestor |
| Mac `audit/golden-coverage` | `49ba5540` | 0 | On `main`: #436 (licensing case retired in #438, in history) |
| agentpc `audit/golden-coverage` | `64580f3b` | 1 | On `main`: ancestor of the Mac tip, #436 |
| `golden/baseline-case-defects` | `5298ca14` | 2 | On `main`: #442 (TODO and INDEX differ by merge resolution) |
| `feat/stellar-org-source` ● | `b81e7a03` | 20 | Archived: #439 closed; source merged via #447; its follow-ups are on `main` |
| `exp/family-decider` ● | `9667ac34` | 78 | Archived, **move owed**: experiment closed (#445). The FAM development rows get a TODO bullet (bundle ref, path, SHA-256) on the stellar.org routing-reach item |
| `exp/fd-lab-a`, `fd-lab-b`, `fd-sets`, `fd-st` ● | `885c9908`, `45e47e71`, `39ee9445`, `a0d20c1e` | 26 to 28 | Archived: lanes of the closed experiment |
| `fp/harness`, `fp/confirm` | `0ebc7988`, `3eccab81` | 32 each | Archived: fp round closed; arm B shipped via #430. Reusable loop and spend ledger only through their own reviewed PR. Resolves the TODO owner decision "The round's prototype branches" |
| `fp/retrieve` (+ local tags `fp-archive/*`, kept) | `4b36ee69` | 20 | Archived: prototype not built; 11 variants below arm A |
| `fp/surface` | `bc71a018` | 17 | Archived: shipped form is #430 |
| `fp/brief`, `fp/calib` | `24307e8f`, `eb898412` | 1 each | Archived: screen-only scripts |
| `tune-final-backup`, `2`, `3` | `1f60d651`, `a462813c`, `ddb84764` | 9 to 12 | Archived: rebase snapshots, superseded by #446 |
| `tune/loop-1-arm2` ● | `cf874a0f` | 12 | Archived: measured arm; shipped in #446 |
| `tune/loop-1-arm3` ● | `d4919118` | 18 | Archived: measured arm; micro-map removal shipped in #447 |
| `tune/loop-2-runs` ● | `431cfbe0` | 42 | Archived: identifier pointer and replay tooling (the five cited commits), not shipped by the loop 2 rule; scans also in `~/backups/loop2-scans-2026-11-15/` |
| `research/client-text-limits` ● | `61f53e97` | 185 | Archived: 184 run files, hash-identical to `~/backups/client-text-limits-2026-11-14/runs/` |

The 12 `origin` branches (●, plus `tune/loop-2-runs`'s pair) have local tips equal to `origin`.
Tags: all six stay. Worktrees: six are removed (no `--force`; ignored run output is in the
tarballs); **`gca-eval` stays**, detached, as a data directory, because `eval/qa/heldout-read.sh`
defaults to and pins its judge-stability register. A TODO bullet records moving that register out
of the worktree in a reviewed change.

## What I need from you

1. **Mac second copy (F4 precondition).** Copy to the Mac backup folder and confirm SHA-256 there:
   the three files above, `MANIFEST.md`, `expected-refs.txt`, both `.manifest.sha256` files,
   `heldout-private/` (keep it mode 700), `0.3-inventory/`, and the sibling backups the dispositions
   rely on: `~/backups/fd-2026-11-14/`, `client-text-limits-2026-11-14/`, `loop2-scans-2026-11-15/`,
   `fp-2026-11-12-evidence.tar.zst`, `gca-2026-11-14-split.json` (hashes in `MANIFEST.md`).
2. **Your explicit go for phase B.** Meanwhile I push the record commit (TODO fixes, ledger row,
   `DISPOSITION.md`, `.agents/README.md` pointer) and open its pull request; F4 makes that PR open
   a precondition too, and I will send you its URL. Nothing is deleted before your go. After it:
   local deletions by name and SHA, worktree removals, re-verify, then the 12 remote deletions last
   with `--force-with-lease`.
3. **After phase B**, delete the Mac's local `audit/golden-coverage` (`49ba5540`).
