# Next actionable blocks

Date: 2026-09-01
Status: complete
Branch: `eval/answering-agent-environment-pin`
Base: `9d4362f73ae51e495ac75ee6160593fa2738ef03` from PR #112

## Scope

This round starts the next work that does not need a new paid-eval, live-read, deployment, or
upstream-message authorization.

The round has three outputs:

1. Add the fail-closed answering-agent environment pin and its tests.
2. Produce the free Raven capability prevalence and prose-surface evidence.
3. Produce the local production comparison and a proposed read-only query plan.

The round does not run paid evals, live production reads, deployments, production edits, golden
changes, routing mechanisms, or upstream messages.

## Route cards

### Environment-pin implementation

Lane: implement and test `--expect-agent-environment-sha256`.
Worker CLI: Codex.
Model: GPT-5.6 Sol.
Effort: high.
Reason: the lane changes a paid-run safety boundary and needs difficult test construction.
Verified: Herdr started `env-pin-sol` with the exact model and effort controls.
Fallback: Claude Fable 5 at high.
Reviewer: Claude Opus 5 at high.
Report contract: changed paths, red-green evidence, commands, results, risks, and blockers.

### Raven free evidence

Lane: scan stored answers and inventory every no-tool prose surface.
Worker CLI: Codex.
Model: GPT-5.6 Terra.
Effort: high.
Reason: this is a bounded repository sweep and local data-collection lane.
Verified: Herdr started `raven-evidence-terra` with the exact model and effort controls.
Fallback: GPT-5.6 Sol at high.
Reviewer: Claude Opus 5 at high.
Report contract: method, denominator, every adjudicated hit, surface reachability, hashes, and gaps.

### Production local plan

Lane: compare local revisions and write the proposed read-only production query plan.
Worker CLI: Claude.
Model: Fable 5.
Effort: high.
Reason: this is an ambiguous planning and technical-prose lane with an authorization boundary.
Verified: Herdr started `production-plan-fable` with the exact model and effort controls.
Fallback: GPT-5.6 Sol at high.
Reviewer: Claude Opus 5 at high.
Report contract: local diff, query inputs, expected evidence, privacy limits, gates, risks, and blockers.

### Review repairs

Lane: repair the environment-pin findings.
Worker CLI: Codex.
Model: GPT-5.6 Sol.
Effort: high.
Reason: the findings change a paid-run safety boundary and its process tests.
Verified: Herdr started `env-pin-review-fixes-sol` with the exact model and effort controls.

Lane: expand and repair the Raven evidence.
Worker CLI: Codex.
Model: GPT-5.6 Terra.
Effort: high.
Reason: the lane is a bounded full-corpus scan and evidence rewrite.
Verified: Herdr started `raven-full-scan-terra` with the exact model and effort controls.

### Independent review

Standards and reviewability reviewer: Claude Opus 5 at high.
Specification reviewer: Claude Opus 5 at high.
Verified: Herdr started both reviewers with exact model and effort controls in separate read-only
panes. The orchestrator transcribed their Markdown results because the permission guard denied
direct report writes.
Matched-lane skip: Opus cannot satisfy the round's different-family gate for the Fable-authored
production report. Grok 4.6 at high owns the final combined follow-up review.

## Authorization ledger

| Action | State |
| --- | --- |
| Local code, tests, stored-artifact reads, and repository scans | authorized by this round |
| Local `main` and PR #99 comparison | authorized by this round |
| Live production read | blocked pending explicit owner authorization |
| Paid answering, judge, or rejudge call | blocked pending a reviewed plan and a new cap |
| Deployment or production edit | blocked pending live verification and a separate owner decision |
| Upstream issue comment, filing, or reminder | blocked in this round |

## Completion gates

- The public CLI fails before any paid-call attempt on absent, duplicate, missing, malformed,
  mismatched, or equals-form pins.
- A matching pin proceeds and stamps expected and observed identities.
- Narrow tests, `npm run eval:selftest`, the baseline checks, and the secret scan pass.
- The Raven report records its complete stored-answer denominator and adjudicates every hit.
- The production report stays local-only and defines the exact future query without running it.
- A different-family reviewer passes the combined diff and both reports.

## Outcome

### Environment pin

Every `eval/qa/run-qa.mjs` mode now requires `--expect-agent-environment-sha256`. The flag must
occur once and carry a 64-character lowercase SHA-256. The runner compares it with the inherited
Claude environment before any answering-agent or judge call. A match stamps `expectedSha256` and
`matches: true` beside the observed identity.

Public CLI process tests use a local fake Claude executable. They cover a match and every rejected
flag form. Each rejected stored-judge case records zero paid-call attempts. A collection-mode
mismatch records zero answering-agent calls.

The first implementation lane recorded 48 passing and 4 failing tests before the initial change.
It then recorded 52 passing narrow tests. Independent review found that the option remained
fail-open when absent. The repair lane recorded 52 passing and 1 failing test before its repair.
It then recorded 57 passing narrow tests, a passing eval self-test, and 1,588 passing unit tests.

The operator workflow now computes the environment SHA-256 after the Claude environment is final.
All paid QA examples in `run-evals` pass the expected hash.

### Raven evidence

The local scan covered 338 result files, 4,891 rows, and 2,406 non-empty answers. The all-answer
screen returned 51 candidates. The lane adjudicated all candidates and found 6 unsupported Raven
lookup offers. The separate 44-answer no-tool screen returned and adjudicated 17 candidates. It
found the same 6 offers. Five repeat
`q-n3-missing-funds-account-support`. One appears in `q-edge-send-me-free-xlm`.

The Terra lane first reported 104 explicit no-tool answers. The orchestrator reproduced the scan,
found 44, and corrected the denominator before review. The orchestrator also reproduced all 17
candidates and verified the three base-file SHA-256 values.

The prose inventory found no direct shipped text that advertises an account or transaction lookup.
The generated micro-map gives Docs and skill guidance for Data/RPC indexing. It exposes no Raven
account-query adapter, but it can prime a mistaken capability assumption. The evidence shows
repeated QA behavior. It does not identify a shipped Raven cause. The owner still selects an
eval-harness defect, a shipped Raven defect, or monitor-only. The safe default is monitor-only.

### Production plan

The local comparison found two conflicting recorded Worker Version IDs. Only
`2dc2afcb-2449-4553-8b65-a6c082950a0d` has a deployment ledger. The queue also recorded
`6282fe2a-54d8-471e-9f0a-0a2565110af1` without a deployment ledger. Local evidence cannot identify
the active version.

The plan maps local bundle-equivalence classes and the PR #99 behavior. It defines future Wrangler,
Cloudflare API, telemetry, and public HTTP read paths. It also defines privacy rules, version
mapping, deployment preflight, checks, hold gates, and rollback evidence. No live read or deployment
occurred.

The Fable lane found stale Playground input-limit text in `ARCHITECTURE.md`. This round repaired
the row to describe the current 8,000-character rejection behavior.

### First independent review

The standards reviewer returned 5 findings. The specification reviewer returned 6 findings. The
reports are `review-standards-opus.md` and `review-spec-opus.md` in this round directory.

This round reconciled every finding. It made the environment pin mandatory, rejected the equals
form, consolidated identity assertion code, expanded process tests, and repaired the operator
documentation. It screened all 2,406 answers, added the generated micro-map to the prose inventory,
and corrected stale queue and production-plan text. The validation section records the final
command results.

### Final validation

- `./node_modules/.bin/vitest run test/qa-harness-preconditions.test.mjs`: 57 passed.
- `npm run eval:selftest`: passed.
- `npm run typecheck`: passed.
- `npm test`: 99 files and 1,588 tests passed.
- `npm run build`: passed.
- `npm run test:smoke`: 4 files and 82 tests passed.
- `git diff --check`: passed.
- `npm run secrets:scan -- --tree`: passed.
- Raven reproduction: 2,406 answers, 51 all-answer candidates, 44 no-tool answers, and 17
  no-tool candidates. Both report tables have their stated row counts.

The first smoke attempt failed because the sandbox blocked the local listener and Wrangler log.
The approved rerun passed. The failure did not reach an external service.

### Final independent review

Grok 4.6 at high completed the different-family follow-up review. Its first pass found one low
stale tree-snapshot sentence in the production plan. This round repaired that sentence. Grok then
returned `PASS` with zero findings.

Status: complete.
