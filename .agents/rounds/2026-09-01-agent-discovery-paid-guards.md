# Agent-discovery paid-run guards

Date: 2026-09-01
Status: complete
Branch: `codex/agent-discovery-guards`
Pull request: `#116`
Base: `8c0f0069dff2f5b1d8d69666bd779dff994c6f08`
Author and orchestrator: Codex GPT-5.6 Sol

## Scope

This round hardens `eval/discovery/run-agent-discovery.mjs` without a provider call.
It adds required binary, environment, total-budget, server-revision, and surface preconditions.
It uses one sequential spend ledger across all cases and repeats.
It records complete identity, authorization, cost, failure, and remaining-budget evidence.

The round changes no product runtime, golden answer, corpus membership, routing score, or upstream
service. It runs no paid evaluation and creates no upstream finding.

## Route cards

### Implementation

Lane: implement and test the paid-run safety boundary.
Worker CLI: Codex.
Model: GPT-5.6 Terra.
Effort: high.
Reason: this was a bounded implementation and test-construction lane.
Verified: Herdr started `discovery_impl` in worktree pane `w1K:p1` with explicit controls.
Fallback: GPT-5.6 Sol at high.
Report contract: changed files, free tests, remaining risks, and no provider calls.

### Independent review

Lane: review the final safety boundary, test proof, and operator documentation.
Worker CLI: Claude.
Model: Opus 5.
Effort: high.
Reason: this needed precision review after Codex-authored implementation and reconciliation.
Verified: Herdr started `discovery_final_review` in owned pane `w16:p17` with explicit controls.
Fallback: Grok 4.6 at high.
Report contract: findings, evidence, verdict, and closure checks in Markdown.
Durable output:
`.agents/rounds/2026-09-01-agent-discovery-paid-guards/review-opus-closure.md`.

## Authorization

| Action | State |
| --- | --- |
| Local code, documentation, and free tests | authorized |
| Provider-backed discovery run | not used and not required |
| Paid answering or judging | not used and not required |
| Golden or corpus changes | out of scope |
| Product deployment | not required because runtime code is unchanged |

## Implementation

- All five required flags reject absent, duplicate, empty, value-missing, and equals forms before
  any runner action.
- The binary and environment identities must match their expected SHA-256 values before collection.
- One spend ledger authorizes each call with only its remaining budget.
- Missing, invalid, excessive, and invocation-failure costs stop the method.
- The artifact stores binary, environment, budget, per-call cost, missing-cost, and stop evidence.
- A paid invocation failure keeps its original cause in persisted comparability evidence.
- The README and `run-evals` skill show the required command contract.

## Review reconciliation

The first Opus pass found duplicate server and surface pins, a discarded invocation cause, and a
weak zero-call proof. The round routed both pins through the shared required-flag parser, persisted
the cause, and placed all runner work behind `withPaidRunPreconditions`.

The delta review found a synchronous parse-error stack trace and under-described documentation.
The round made `main` asynchronous, added a clean shared error path, and named all five flags.
The closure review returned `PASS — CLOSED` with every finding reconciled.

The review also found that both paid runners silently ignore `--ids=a,b` and accept duplicate
`--ids`. This is an optional selector issue across two runners. It is filed as the next own-repo
item in `.agents/TODO.md` and ranked in `.agents/NEXT.md`.

## Herdr accounting

| Agent | Pane | Accounted result |
| --- | --- | --- |
| `discovery_impl` | `w1K:p1` | Submitted the implementation, tests, documentation, and this ledger in the task worktree. |
| `paid-guards-review` | `w1K:p2` | No durable standalone report was found. The parent reconciliation and the complete independent Opus review supersede this missing handoff. |
| `discovery_final_review` | `w16:p17` | Wrote the full, delta, and closure reports under `/tmp`. The final closure and all finding states now live in `review-opus-closure.md`. |
| `discovery_audit2` | `w16:p1A` | Produced no repository artifact and changed no file. It is excluded from completion evidence. |

The missing child-review file is now explicit. No unsubmitted code or test change was found.
The durable Opus closure covers the complete final diff and reconciles every named finding.

## Validation

- Focused guard and budget tests: 3 files and 116 tests passed.
- Provider calls during implementation, testing, and review: 0.
- Full release baseline: 100 files and 1,627 tests passed; typecheck, build, secret scan, and diff
  check passed.
- Independent review: passed after all findings were reconciled.
- Upstream findings: none. This round changed only an own-repo eval instrument.

## Outcome

The implementation, independent review, and release validation are complete.
Pull request `#116` is the release vehicle. No product deployment is required.
