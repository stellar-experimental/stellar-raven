# Ledger: pack p8 re-measurement

Plan: [measurement-plan-p8.md](measurement-plan-p8.md). Status: not run. No paid call is authorized
until the owner approves and the bounded delta re-review of the revised plan passes.

## Commits

| Item | Value |
|---|---|
| Reviewed p8 code commit (arm B, runner revision) | `36e77d4067e1a0d0c5156c0eaf1ee2904200b21b` |
| Arm A (reused p6 verdicts) | `d15a4ce5`, artifacts in [rejudge-artifacts.json](rejudge-artifacts.json) |
| Arm-B worktree | `/Users/kalepail/Desktop/raven-p8-arm`, detached at the reviewed commit |
| Preflight replay tree | `/Users/kalepail/Desktop/raven-w1010-r`, where `pack-p7/post-run-review/saved-data/` exists |

`--runner-revision` for the self-test takes the full 40-character SHA above.

## Pins (recorded before spend; checked again on 2026-10-10)

| Pin | Value |
|---|---|
| `--claude-path` | `/private/tmp/claude-501/w1010/r-pin/bin/claude`, a link that is the only entry in the first `PATH` directory |
| Real executable | `/Users/kalepail/.local/share/claude/versions/2.1.296`, version `2.1.296 (Claude Code)` |
| Binary SHA-256 | `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937` |
| Environment SHA-256 | `ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac` (variables `HOME`, `PATH`, `SHELL`, `TMPDIR`) |

The frozen shell runs `env -i` with exactly these values. None of them is a secret.

| Variable | Value |
|---|---|
| `HOME` | `/Users/kalepail` |
| `USER` | `kalepail` |
| `LOGNAME` | `kalepail` |
| `SHELL` | `/bin/zsh` |
| `TMPDIR` | `/var/folders/j9/g5kf8n6j6js86_zvj2lcr8kh0000gn/T/` |
| `PATH` | `/private/tmp/claude-501/w1010/r-pin/bin:/usr/bin:/bin:/usr/sbin:/sbin` |
| `DISABLE_AUTOUPDATER` | `1` |
| `node` | `/usr/local/bin/node`, called directly |

These are the same values as the p7 run, so arm-A reuse keeps the same pins. On 2026-10-10 the
committed launcher reproduced both hashes above.

## Launcher

[launcher/](launcher/) holds the committed copy that the paid run uses:

- [run-node.sh](launcher/run-node.sh): the frozen `env -i` shell above.
- [run-inv-p8.sh](launcher/run-inv-p8.sh): one arm-B invocation, `dry` or `paid`. It points arm B
  at `/Users/kalepail/Desktop/raven-p8-arm` and refuses any HEAD other than the reviewed commit.
  It has no arm-A path, because arm A makes no call.
- [invocations.tsv](launcher/invocations.tsv): the 12 invocations, with source files, IDs, file caps,
  and case modes. It is the same table as the p7 run.

The p7 launcher under `/private/tmp/claude-501/w1010/r-pin/` points arm B at `raven-p7-arm`.
Do not use it for p8.

## Preflight (free, 2026-10-10)

- `../raven-p8-arm` was created detached at `36e77d4067e1a0d0c5156c0eaf1ee2904200b21b`.
- 12 of 12 launcher dry runs exit 0 with `goldenTime.violations: []` and tuple
  `claude-sonnet-5` / `v2.11` / `p8`. Revision mode with `cases.matches: true`: S1b, S1c, S2a,
  S2c, S2d, S2e, S3c, S3d. Worktree mode with `cases.matches: false` (expected): S1a, S2b, S3a, S3b.
- `node eval/qa/judge.mjs --self-test-static` through the launcher in `../raven-p8-arm`: GREEN.
- The replay and the reading script ran in `raven-w1010-r` (see the plan for the checks).
- A dry run does not check the pins. Repeat this preflight on the day of the paid run.

## Reading

[analyze-rejudge-p8.mjs](analyze-rejudge-p8.mjs) is the predeclared reading. Before spend, it reads
the 32 reused arm-A rows and rebuilds every arm-A pack to its recorded hash. After the run, the
operator adds one arm-B entry per invocation (path and SHA-256) to
[rejudge-artifacts.json](rejudge-artifacts.json) and runs the script unchanged.

## Run log

Not run.
