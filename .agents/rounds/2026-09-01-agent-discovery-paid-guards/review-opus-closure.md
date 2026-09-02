# Agent-discovery paid guards — independent closure review

Date: 2026-09-01
Reviewer CLI: Claude
Model: Opus 5
Effort: high
Branch: `codex/agent-discovery-guards`

This file preserves the final reviewer closure that was first written under `/tmp`.
The reviewer edited no repository file.

## Verdict

**PASS — CLOSED.**

Every finding from the full review and its delta is resolved. The paid-run guard meets its exit
gate. The separate optional `--ids` selector issue remains correctly queued for both paid runners.

## Finding reconciliation

| Finding | State | Closure evidence |
| --- | --- | --- |
| F1 duplicate `--expect-sha256` and `--server-revision` | closed | Both flags use `requiredPaidFlag`; ten focused malformed-form cases pass. |
| F2 invocation failure cause was not persisted | closed | `formatRunFailure` reaches `comparabilityReasons` and console output. |
| F3 zero-call assertion was structurally vacuous | closed | `withPaidRunPreconditions` is the only continuation boundary, with positive and negative controls. |
| D1 synchronous parse errors escaped `main().catch` | closed | `main` is async and every parse error uses the clean top-level error path. |
| D2 the README named only three guarded values | closed | The README names all five required space-separated values. |

## Direct closure checks

The reviewer tested six malformed forms against the real runner with an isolated environment and a
fake `claude` executable. Every form exited 1, printed one clean error line, and logged zero paid
calls. The forms covered budget equals, revision duplicate, surface empty, surface equals, missing
revision value, and absent surface pin.

The reviewer also confirmed that a downstream revision-format error uses the same clean error path.
The valid-preconditions test proves the continuation runs exactly once and forwards its return
value. The malformed-preconditions tests prove the continuation never runs.

## Gates

| Gate | Result |
| --- | --- |
| Focused guard, precondition, and budget tests | pass — 3 files, 116 tests |
| Full test suite | pass — 100 files, 1,627 tests |
| Type generation and typecheck | pass |
| Build | pass |
| Secret scan | pass |
| Provider calls | 0 |

## Separate queued issue

Both paid runners still accept duplicate `--ids` and silently ignore `--ids=a,b`. The total budget
limits cost, but it does not preserve the intended case scope. `.agents/TODO.md` and
`.agents/NEXT.md` track one shared follow-up for both runners.

## Final decision

The required pins fail before spend. One ledger controls the total budget. The artifact records
identity, authorization, costs, failures, and remaining budget. The implementation and operator
documentation agree. No finding remains open for this block.
