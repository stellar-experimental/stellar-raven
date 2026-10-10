# Ledger: pack p7 paired re-judge

Plan: [measurement-plan.md](measurement-plan.md). Operator: Claude Opus 5.5 (lane R author).
Authorization: the owner's weekend spend approval, confirmed by the orchestrator on 2026-10-10.
Total authorized cap: $55.00. No other paid call is authorized.

## Pins (recorded before spend)

| Pin | Value |
|---|---|
| Arm A commit | `d15a4ce5` (detached worktree `/Users/kalepail/Desktop/raven-p6-arm`, pack `p6`) |
| Arm B commit | `7e00ede2` (detached worktree `/Users/kalepail/Desktop/raven-p7-arm`, pack `p7`) |
| Judge | `claude-sonnet-5`, rubric `v2.11`, panel 3 |
| `--claude-path` | `/private/tmp/claude-501/w1010/r-pin/bin/claude` (a link; the only entry in the first `PATH` directory) |
| Real executable | `/Users/kalepail/.local/share/claude/versions/2.1.296`, version `2.1.296 (Claude Code)` |
| Binary SHA-256 | `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937` |
| Environment SHA-256 | `ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac` (variables `HOME`, `PATH`, `SHELL`, `TMPDIR`) |
| Shell | `env -i` with `HOME`, `USER`, `LOGNAME`, `SHELL`, `TMPDIR`, a fixed `PATH`, and `DISABLE_AUTOUPDATER=1`; `node` called directly |

The frozen shell drops every `CLAUDE_*` variable of the operator's own session. Both arms use
the same launcher, so both see the same environment. `claude auth status` in that shell reported
a logged-in first-party account before spend.

## Preflight (free)

- 24 dry runs (12 invocations × 2 arms): all exit 0, and all report `goldenTime.violations: []`.
- Revision mode, `cases.matches: true`: S1b, S1c, S2a, S2c, S2d, S2e, S3c, S3d.
- Worktree mode, `cases.matches: false` (expected for the incomplete files): S1a, S2b, S3a, S3b.
  The observed cases SHA-256 depends on the source file:
  - S1a, S2b, and S3b (the 94-row `2026-10-07T19-43-18` source):
    `55831c3cd80f93316a5ca1dff2c8e5dc9e717ede1b70d4050d9742ebe162196f`.
  - S3a (the 20-row `2026-10-07T16-51-53` source):
    `7a3401a19f524e0a4f0d8f619c85aecf469cc5404da1d5b2fb7532fc33490017`.
  - Both arms record the same hash for each invocation. The first version of this ledger gave the
    94-row hash for all four; the post-run review corrected it.
- `node eval/qa/judge.mjs --self-test-static`: GREEN in both arm worktrees.
- A dry run does not check the pins. The paid run checks them before its first call.

## Invocations

| ID | Source file | Rows | Cap per arm | Cases mode |
|---|---|---|---|---|
| S1a | `2026-10-07-tool-surface-qa/2026-10-07T19-43-18-variantA.json` | 1 | $0.85 | worktree |
| S1b | `2026-10-07-tool-surface-qa/2026-10-07T23-25-14-variantA.json` | 3 | $2.45 | revision |
| S1c | `2026-10-07-tool-surface-qa/2026-10-08T02-40-37-variantA.json` | 2 | $1.65 | revision |
| S2a | `2026-10-07-tool-surface-qa/2026-10-08T02-40-37-variantA.json` | 13 | $10.55 | revision |
| S2b | `2026-10-07-tool-surface-qa/2026-10-07T19-43-18-variantA.json` | 3 | $2.45 | worktree |
| S2c | `2026-10-07-tool-surface-qa/2026-10-07T23-25-14-variantA.json` | 2 | $1.65 | revision |
| S2d | `2026-10-08-flagged-rows/2026-10-08T19-04-23-variantA.json` | 1 | $0.85 | revision |
| S2e | `2026-10-08-flagged-rows/2026-10-08T19-21-27-variantA.json` | 1 | $0.85 | revision |
| S3a | `2026-10-07-tool-surface-qa/2026-10-07T16-51-53-variantA.json` | 1 | $0.85 | worktree |
| S3b | `2026-10-07-tool-surface-qa/2026-10-07T19-43-18-variantA.json` | 1 | $0.85 | worktree |
| S3c | `2026-10-07-tool-surface-qa/2026-10-07T23-25-14-variantA.json` | 1 | $0.85 | revision |
| S3d | `2026-10-07-tool-surface-qa/2026-10-08T02-40-37-variantA.json` | 3 | $2.45 | revision |

Row IDs per invocation are in the plan's row-selection tables.

## Run log

- 16:06Z: Stage 1 started (both arms). 16:19Z: Stage 1 done, 36 calls, $3.7438.
- 16:19Z: Stage 2 started. 16:48Z: Stage 2 done, 120 calls, $10.6642.
- 16:48Z: Stage 3 started. 17:02Z: Stage 3 done, 36 calls, $3.7797.
- Total: 24 invocations, 192 calls, $18.1876 of the $55.00 cap. No other paid call.
- Stop decisions: none. After each file, a checker read the artifact for status, missing costs,
  a call over $0.60, more than two errors, and (arm A) the stored p6 pack hash. No check fired.
- All 24 artifacts report postflight `passed`, with no binary or environment change.
- Artifact paths and SHA-256 values: [rejudge-artifacts.json](rejudge-artifacts.json).
- Reading and verdict: [results.md](results.md).
- Post-run review: [post-run-review/rr3-review.md](post-run-review/rr3-review.md) (Codex frontier
  `gpt-6-astra`, high effort). `POST-RUN: DISPUTED` on five items; it confirms the p7 block.
  `results.md` carries the five corrections.
