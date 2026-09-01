# Review: first paid method record and second paid method authorization

- Reviewer: Claude Fable 5.1, high effort
- Author and orchestrator under review: Codex GPT-5.6 Sol
- Brief: `.agents/rounds/2026-09-01-release-closeout.md` (modified, uncommitted; last commit `003ae4e`)
- Scope: only the sections "First paid method" and "Second paid method authorization"
- Evidence: `eval/qa/results/2026-09-01T21-27-42-variantA.json` (read-only), harness source at `003ae4e`, 2,207 stored rows in the main checkout for history
- Mode: read-only. No repository file was edited. No paid call ran.

## Part 1 — Is the first timeout classified honestly?

Yes, with two wording corrections required. Every factual claim in the section matches the
artifact. Two sentences understate what happened.

### Claims checked against the artifact

| Brief claim | Artifact evidence | Result |
| --- | --- | --- |
| Server revision `003ae4ea…` | `sourceRevisionPin` expected and actual both `003ae4ea…`, `matches: true`; bound `workerd` listener on port 8788 at the same revision, `dirty: false` | Confirmed |
| Result file `2026-09-01T21-27-42-variantA.json` | Present under `eval/qa/results/`, `finishedAt 2026-09-01T21:27:42.766Z` | Confirmed |
| One active case of one selected | `lifecycle.activeCount 1`, `selectedCount 1`, no quarantined IDs | Confirmed |
| 600-second wall-clock limit reached | `durationMs 600205`; `failure.class "timeout"`, reason "agent process exceeded its wall-clock budget", `exitStatus 143`; harness constant `AGENT_TIMEOUT_MS = 10 * 60_000` | Confirmed |
| One successful Raven search, no answer | Transcript has one `mcp__raven__search` call, `isError: false`, 30,088 result chars, 10 hits; `answer ""` | Confirmed |
| Judge made no call | `expectedJudgeCalls 0`, `verdict.score "error"`, `promptSha256 null` | Confirmed |
| Cost completeness failed | `costAccounting.complete false`, `missingAgentCosts 1`; ledger call recorded with `costUsd null` | Confirmed |
| T5 one answering timeout | `tracks.t5.timeouts` count 1, `byMethod.agent.timeouts` 1, judge 0 | Confirmed |
| T1 no answered row or valid grade | `answeredFirstAttempts 0/1`, `validGradesOverSelected 0/1`, `agentLimitFailures 0` | Confirmed |
| T4 complete collection, incomplete cost | `completeness.complete true`, `collectedRows 1`, `costCompleteness.complete false` | Confirmed |
| Aggregates suppressed | `aggregatesSuppressed true`, `comparable false`, reason "budgeted agent call ... did not report costUsd" | Confirmed |
| Executable matched | `agentBinary.matches true`, SHA `64590d7d…`, version `2.1.257` | Confirmed |
| Environment matched | `inherited.matches true`, SHA `7a1b4ae2…`, four names: `HOME`, `PATH`, `SHELL`, `TMPDIR`; no `CLAUDE_*` names, so the shell was not nested | Confirmed |
| `safeMode` false | `isolation.safeMode false`, `settingSources []`, `strictMcpConfig true` | Confirmed |
| Working directory outside repo | `cwdOutsideRepository true` | Confirmed |
| `raven` connected | `mcpServers [{name: "raven", status: "connected"}]` | Confirmed |
| Post-collection guards | `sourceIdentityGuard matches`, `serverProcessGuard matches` with no changed fields, `surfacePinAfter` and `sourceRevisionPinAfter` match, `postflightError null` | Confirmed |

### The classification is contract-correct

`eval/qa/README.md` defines `timeout` as a T5 class that never retries. The five-track builder
puts an agent `timeout` under T5 provider availability. The brief's "T5 records one
answering-provider timeout" is the harness's own label. That is honest under the contract.

The evidence also supports "no actionable Raven defect". The parser records every `tool_use`
block when the assistant message arrives, before any result. The transcript holds one tool call,
and it completed. No `execute` call was ever issued. The per-turn usage shows the third assistant
turn saw the search result (cache creation and cache read grew by roughly the result size) and then
emitted nothing further. Total output tokens across all turns are 6. The stall sits between the
Raven result and the next model output. That is the provider stream or the Claude CLI, not a
Raven call. The harness cannot separate those two, and the brief should say so.

### Two corrections required before the commit

**C1. "The provider reported no cost" understates real spend.** The CLI was killed by the harness
at the limit before it could emit its final cost frame. The provider did serve three assistant
turns. Recorded usage is 27,713 cache-creation input tokens, 80,092 cache-read input tokens, and
6 output tokens. That is real, billed, unrecorded spend. The ledger shows `reportedSpendUsd 0` and
`remainingUsd 1.5`. Write: "The killed CLI process reported no cost. Unrecorded provider spend
occurred (three turns; tokens listed in the artifact). It counts against neither `$1.50` cap. The
owner's true total for the lane is two caps plus that unknown amount."

**C2. Name the novelty and the ambiguity.** Across 2,207 stored answering rows in the main
checkout, this is the first `timeout` class ever recorded. Write that. Also replace
"answering-provider timeout" with "answering-side timeout (T5 class `timeout`; provider stream or
CLI, indistinguishable by the harness)". Keep "monitor-only". A first single-case event belongs in
the do-not-act bucket per the skill.

## Part 2 — Second paid method authorization

| Requirement | Brief text | Verified against harness | Result |
| --- | --- | --- | --- |
| Separate call authorization | "one answering call and up to three judge calls"; "permits no third method run" | A fresh `run-qa.mjs` invocation creates a new ledger; the tiered judge can spend up to three calls (stability register absent in this worktree, so the boundary path applies) | Pass |
| Separate dollar authorization | "Its independent total cap is `$1.50`"; "does not reuse the first method authorization" | One `--max-budget-usd` per invocation; worst observed case $0.65 + 3 × $0.16 = $1.13 | Pass |
| Fixed membership | "repeats the same single selected ID"; earlier "No case replacement is permitted" still applies | `--ids q-protocol-bn254-poseidon-xray`; active 1 of 1 | Pass |
| Separate artifacts | "cannot repair or replace the first artifact"; "two artifacts will remain separate"; "No combined aggregate or variance claim" | A new collection writes a new stamp. `timeout` is not T2-eligible, so `--judge-stored` or a retry path cannot touch the first row anyway | Pass |
| Complete pins | "new external prelaunch receipt must pin that exact commit and surface"; "Every first-method identity and artifact check applies again"; "brief, both reviews, and this authorization must enter one clean commit" | Runner asserts server revision, surface SHA, binary SHA, environment SHA, clean tree, and re-checks after collection. First-method guard list covers the skill's four artifact checks | Pass |
| Safe stop rules | "Stop after another timeout, incomplete cost, provider safeguard, or harness failure"; "Stop after any pin, clean-tree, revision, or surface mismatch"; "Do not launch a third method" | Matches the skill: one method run per authorization, no ad hoc retry, timeouts never retry | Pass |
| Skill rule on re-runs | "This section creates a separate bounded method authorization" | Skill: "Any method re-run needs its own bounded authorization before launch" | Pass |

### Two amendments required before the commit

**A1. Resolve the internal contradiction.** The top "Authorization" section still says "This
brief limits the paid method to one run" and "This brief authorizes no rerun". The "Stop rules"
section still says "Stop after the single authorized run". Those sentences now conflict with the
second section. Qualify them as the first method's terms and point to the second section. A
ledger that contradicts itself is not a clean authorization record.

**A2. State the owner receipt.** "The owner already authorized continued paid work" carries no
evidence in the brief. Add one line naming where and when the owner said so. I cannot verify it
from the repository.

### Recommended, not required

- Add "a fresh `run-qa.mjs` collection, never `--judge-stored` or `re-judge.mjs` against the
  first artifact" to remove any doubt about method separation.
- Before spend, read the Wrangler dev pane output for 21:17 to 21:27 UTC. This is free. It
  confirms no server-side stall coincided with the timeout. The artifact already shows no Raven
  call was in flight, so this is a belt-and-braces check.
- Record the second receipt's location. The prior delta review noted it must sit outside the
  tracked tree or under the gitignored `eval/qa/results/` directory.

## Result

The first timeout is classified honestly under the harness contract. The second authorization is
separate, bounded, membership-fixed, artifact-separate, fully pinned, and safely stopped.
Corrections C1, C2, A1, and A2 are text changes that must land in the same clean commit the brief
already requires before the second launch.

PASS
