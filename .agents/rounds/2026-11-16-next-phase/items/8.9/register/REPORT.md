# Report: item 8.9, lane `register`

- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/499
- **Branch:** `np/8.9-register`
- **Worktree:** `/home/tyler/code/raven-wt/np-8.9-register`
- **TODO item closed:** "Move the pinned judge-stability register out of the `gca-eval` worktree" (`.agents/TODO.md`; not edited by this lane per `8.9-COMMON.md` — orchestrator updates `.agents/TODO.md` and removes the `gca-eval` worktree after merge).
- **Worker bytes changed:** No (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty).

## What changed

### Repository changes

- `eval/qa/heldout-read.sh`:
  - Changed the default `STABILITY_REGISTER` path from `/home/tyler/code/raven-wt/gca-eval/eval/qa/judge-stability.json` to `/home/tyler/raven-data/qa/judge-stability.json`.
  - Preserved the pinned SHA-256 (`4322dd4d1ebfc30bc02a9def008039aba4f4b2395b1f9da5cabef56ec24bf458`) in both the verification check and `pins.txt`.
  - Documented the `STABILITY_REGISTER` override and default path in the script header comment.
- `eval/qa/README.md`:
  - Added `heldout-read.sh`, `heldout-read.mjs` to the Directory / lane map table.
  - Documented the out-of-worktree default register path (`/home/tyler/raven-data/qa/judge-stability.json`) and archived stored QA results directory (`/home/tyler/raven-data/qa/results/`) under "Judge-tier contract".
- `test/heldout-read.test.mjs`:
  - Added a unit test asserting that `eval/qa/heldout-read.sh` defaults `STABILITY_REGISTER` to `/home/tyler/raven-data/qa/judge-stability.json`, contains no `gca-eval` or `raven-wt` references, and preserves the pinned SHA-256 in both the verification check and `pins.txt`.
- `.agents/rounds/2026-11-16-next-phase/items/8.9/register/REVIEW.md` and `REPORT.md`:
  - Added the independent review and this lane report.

### Out-of-repo data copy

Copied (`cp -a`, never moving or deleting sources, and never opening file contents) the pinned register and all 24 stored QA result/plan files from `/home/tyler/code/raven-wt/gca-eval/eval/qa/` into `/home/tyler/raven-data/qa/`:

- Source worktree `/home/tyler/code/raven-wt/gca-eval` was **not** removed or modified (confirmed by independent review).
- Every copied file's SHA-256 matches its source byte-for-byte (25/25 files `OK`; combined sorted manifest SHA-256 `3036a109494c1b21c734f0c9aa012da22cf753410065d83628e1de08ec732b54` on both sides).

#### Copied file list (paths and SHA-256 hashes only)

| Destination path | SHA-256 |
|---|---|
| `/home/tyler/raven-data/qa/judge-stability.json` | `4322dd4d1ebfc30bc02a9def008039aba4f4b2395b1f9da5cabef56ec24bf458` |
| `/home/tyler/raven-data/qa/results/2026-11-14T06-06-31-variantA.json` | `fdf9aa7f62522bd6a9989ca6ce0795d4b72190a73f0b99e799fd84a54f6f461e` |
| `/home/tyler/raven-data/qa/results/2026-11-14T20-13-51-variantA.json` | `81c59225996eacb3a930bc343f0f016f26cafd7c815377eef2c58be2cd5ced56` |
| `/home/tyler/raven-data/qa/results/2026-11-14T20-13-51-variantA.plan.json` | `b1010733122bb39a3d06198930e7458f568782936064e190308c0a6bc8c9d71e` |
| `/home/tyler/raven-data/qa/results/2026-11-14T22-18-17-variantA.json` | `d8048d25d8720d5a192abe354f8df8e00bdb867504b18f26f10ee2535394284f` |
| `/home/tyler/raven-data/qa/results/2026-11-14T22-18-17-variantA.plan.json` | `07d649f8af3d045e93d60fc77f6f56261cfde86195a0278c778323082ca29b56` |
| `/home/tyler/raven-data/qa/results/2026-11-14T23-04-27-variantA.json` | `8ba993fefe919c5ee50364e260927b209a2fbb7e8bc34c8a9614b4a033317bc7` |
| `/home/tyler/raven-data/qa/results/2026-11-14T23-04-27-variantA.plan.json` | `22913c5874934d227ff3027a1ce981ada24588531aa3198c64f7b82498e0e5ee` |
| `/home/tyler/raven-data/qa/results/2026-11-14T23-27-33-variantA.json` | `1898d715b24bf083cc9a95525d4a77427ca93346a30073b32fba3ffe89e1d82e` |
| `/home/tyler/raven-data/qa/results/2026-11-14T23-30-06-variantA.json` | `2c1423c6529a907dd9a59d345d81fb94181b7cbc00e96fce1b822bb1de70eb4d` |
| `/home/tyler/raven-data/qa/results/2026-11-14T23-33-28-variantA.json` | `4fb818dc3f339566ac938dc542343054eda073282120083fbdd6a5cec5823d03` |
| `/home/tyler/raven-data/qa/results/2026-11-15T00-32-53-variantA.json` | `b43f13e09cdcd1e980b4552bd4411a7d9fc15b744a9646608a543e7c46ff3c9b` |
| `/home/tyler/raven-data/qa/results/2026-11-15T00-32-53-variantA.plan.json` | `cfbb8c0be7a962457b21e62efa4f9213ac96006e6368181adf9895144a9b70e7` |
| `/home/tyler/raven-data/qa/results/2026-11-15T04-31-41-variantA.json` | `b84feaee83e98791833e11544e8a7f88bcaeb2d4c355c8d1b8fb56b12d3f8e5f` |
| `/home/tyler/raven-data/qa/results/2026-11-15T04-31-41-variantA.plan.json` | `6c6a66a5d4f12f556ea618b87a4a2f5aa45e8a91bae7f089bc1f84395440f69a` |
| `/home/tyler/raven-data/qa/results/2026-11-15T05-28-42-variantA.json` | `8da193d12c33e4cf0533d058a639dbf29edc98b46e524b3a963cdbd6f2a458e7` |
| `/home/tyler/raven-data/qa/results/2026-11-15T05-28-42-variantA.plan.json` | `4baf2b11d7a574c420978f4698761455ef4874e2c9d76c12de91cd9a7951fa48` |
| `/home/tyler/raven-data/qa/results/2026-11-15T05-38-45-variantA.json` | `197e1bc34d9b000b5528cfe5d2ab45bc4a805ef9c1eb137769485f1bf024778a` |
| `/home/tyler/raven-data/qa/results/2026-11-15T05-45-31-variantA.json` | `c8a4be67761475870f502fa0ea15fb07941dfdb23fde6b9196db62d549b427b1` |
| `/home/tyler/raven-data/qa/results/2026-11-15T07-33-40-variantA.json` | `0fbcfe33b8f99d76cc102e4bdf38abc8425e392b43c33989a7bc7b8241b6fb71` |
| `/home/tyler/raven-data/qa/results/2026-11-15T07-33-40-variantA.plan.json` | `4f0ecef6db7097844c3065f832a67c36f455374bd8821c6ede78fe3cdb03621c` |
| `/home/tyler/raven-data/qa/results/2026-11-15T08-55-41-variantA.json` | `702171365ffa7b847235c5c8aaf0da8118a2a4c69f0c518f3f255bc3a0330b6d` |
| `/home/tyler/raven-data/qa/results/2026-11-15T08-55-41-variantA.plan.json` | `e81151a80a10eb89300804371df1866ab793945084da0b4bd0440d9c21555371` |
| `/home/tyler/raven-data/qa/results/2026-11-15T09-08-35-variantA.json` | `a531bb253f650e0cf99bba2e96a269b05423d7da0e6aef4e5c6bb8ad6800c585` |
| `/home/tyler/raven-data/qa/results/2026-11-15T09-08-35-variantA.plan.json` | `18adbc48bacfdc100e33b0a4c03155bc2a2fe1d731b1e6fef0ba025cd795b2d1` |

#### How to verify before removing `gca-eval`

Verify all 25 copies against `gca-eval` without opening any file content:

```sh
for d in /home/tyler/code/raven-wt/gca-eval/eval/qa /home/tyler/raven-data/qa; do
  (cd "$d" && find judge-stability.json results -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum)
done
# Expected (both lines): 3036a109494c1b21c734f0c9aa012da22cf753410065d83628e1de08ec732b54  -
```

Verify the register pin directly:

```sh
sha256sum /home/tyler/raven-data/qa/judge-stability.json
# Expected: 4322dd4d1ebfc30bc02a9def008039aba4f4b2395b1f9da5cabef56ec24bf458  /home/tyler/raven-data/qa/judge-stability.json
```

## Gates (final post-review state)

All gates were run bare (no pipes) in `/home/tyler/code/raven-wt/np-8.9-register` after applying the accepted review fix:

| Gate | Exit code | Result |
|---|---|---|
| `npm run typecheck` | `0` | Clean (`tsc --noEmit`) |
| `npm test` | `0` | `177 passed \| 5 skipped (182)` files; `4297 passed \| 3 expected fail \| 5 skipped (4305)` tests (`40.12s`). Note: the first run under 8-lane CPU contention hit a 5000 ms timeout in unrelated `test/qa-paired-verdict.test.mjs:1293` (`runs reduced deterministic operating-characteristic gates under npm test`); the immediate rerun passed all 4297 tests. |
| `npm run build` | `0` | Worker dry-run clean (`6918.57 KiB / gzip: 1375.14 KiB`) |
| `npm run secrets:scan -- --tree` | `0` | Clean across all tracked files |
| `npm run eval:selftest` | `0` | All checks passed |
| `npm run eval:qa:lint -- --stale --enforce-floors` | `0` | `0 error(s), 98 warning(s)` |
| `npm run eval:qa:register -- --check` | `0` | `[register-helper] up to date` |

## Independent review and reconciliation

- **Reviewer:** Claude Opus tier (`claude-opus-5-5`, high effort, Antigravity CLI). Differs from author (Gemini 4 Neon) and orchestrator; assigned by orchestrator (Claude Opus fallback for routine change).
- **Status:** `SUCCESS` (`REVIEW.md` verdict: **Approve** — 0 critical, 0 high, 0 medium, 2 low, 2 nits).
- **Record:** `.agents/rounds/2026-11-16-next-phase/items/8.9/register/REVIEW.md`

| Finding | Severity | Disposition | Rationale |
|---|---|---|---|
| Low 1: `/home/tyler/raven-data/` is not listed in `usage/README.md` | Low | Declined for this lane (open question for orchestrator) | `usage/README.md` is outside this lane's allowed file set (`eval/qa/heldout-read.sh` and its docs and tests). |
| Low 2: Lane report with file list and hashes not yet in item directory | Low | Resolved | Expected by workflow order (`8.9-COMMON.md` step 3 precedes step 4); this `REPORT.md` now records all 25 paths, SHA-256 hashes, and verification commands. |
| Nit 1: `eval/qa/README.md:579` repeats the pin SHA-256 without a test guard | Nit | **Accepted & fixed** | Removed the duplicated SHA-256 literal from `eval/qa/README.md` so `eval/qa/heldout-read.sh` (guarded by `test/heldout-read.test.mjs`) remains the single source of truth; re-ran all gates. |
| Nit 2: Hard-coded `/home/tyler/` instead of `$HOME` | Nit | Declined | Matches the prior default style (`/home/tyler/code/raven-wt/...`) and the literal target path in `8.9-LANES.md` (`/home/tyler/raven-data/qa/`); `STABILITY_REGISTER` remains overridable via environment variable. |

## Model calls made

| CLI | Model ID | Effort | Purpose | Billing |
|---|---|---|---|---|
| `agy` | `claude-opus-5-5` | `high` | Independent code review (`REVIEW.md`) | Subscription (no API-billed call) |

## Open questions / orchestrator follow-ups

1. **Removing `gca-eval` after merge:** The independent review noted a pre-existing ` D CLAUDE.md` deletion in `/home/tyler/code/raven-wt/gca-eval` (worktree root mtime `2026-11-17 16:43`, before this lane started). `git worktree remove` without `--force` may warn on that deleted file; verify it matches `main` (which removed `CLAUDE.md`) before removing the worktree.
2. **Owner private-folders list (Review Low 1):** Consider adding `/home/tyler/raven-data/qa` to the owner private-folders table in `usage/README.md` in a small docs follow-up.
