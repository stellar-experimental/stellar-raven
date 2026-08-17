# MCP quality improvement results

Status: the measurement changes pass. The paid M1 matrix stopped on its control rule.

Date: 2026-08-17.

Baseline revision: `b5ba1a435328f3953ce5f3868b164bd70a895ca4`.

Historical answer revision: `70726884a723786c669283953f576277ce9d955b`.

Execution plan: `research/mcp-quality-improvement-execution-plan-2026-08-17.md`.

Solo evidence: scratchpad 812, revision 44.

## Outcome

The work improved the eval measurement layer.

The work did not change the MCP product surface.

The p5 evidence pack preserved exact source facts that p3 omitted.

The deterministic 117-row replay reports 55 improved packs and zero worsened packs.

The paid Indexer target improved from wrong to partial in both p5 judge passes.

The paid Beans target improved from wrong to correct in both p5 judge passes.

One control moved to a partial majority under p5 judging.

No stop condition fired under the approved fact-level amendment.

No product-quality claim follows from this result.

## Baseline findings

The clean QA set contains 117 rows.

- Stored verdicts are 59 correct, 39 partial, 18 wrong, and 1 error.
- The rows made 272 execute calls.
- It contains 82 truncated execute results across 64 rows.
- Fifteen rows contain static `codemode.artifact.read` call sites.
- Thirty-six read-containing executes ran.
- `readExecutes` partitions those 36 as 19 bounded, 6 truncated, 9 guard failures, 0 host
  denials, and 2 other failures.
- `readOutcomes` partitions the same 36 as 0 successful, 0 denied, and 36 indeterminate.
- `finalProjection` across the 117 rows is 102 none, 4 truncated, and 11 bounded.
- The run exposed no context overflow, timeout, or turn-cap failure.
- The median final-turn input was 83,560 tokens.
- The interpolated p95 was 118,804.8 tokens.
- The maximum was 174,145 tokens.

An earlier draft reported "25 successes and 11 failures" for those 36 executes. Both figures
described a superseded definition. The 25 were 19 bounded plus 6 truncated completions. The 11
were 9 guard failures plus 2 other failures.

Neither figure was a read success. A read is proven successful only when the execute completed
and its own visible result body parses as an object with `ok: true`. No saved execute meets that
bar, so `successful` is 0 and all 36 are indeterminate. The instrument under-claims by design. An
instrument that under-claims is repairable. One that invents evidence is not.

The evidence does not justify a larger result cap.

The evidence does not justify automatic artifact reads.

The single error was `q-n3-ssrf-metadata-endpoint`.

Two attempts produced a provider safeguard before any MCP call.

The error was not an MCP service failure.

## Accepted changes

The accepted changes improve measurement safety and diagnostic quality.

1. The evidence pack recognizes `--- SOURCE BASIS ---` results.
2. The p5 pack preserves identifiers, dates, URLs, amounts, and field names.
3. The pack keeps the 12,000-character limit.
4. The fixture verifier checks exact saved-row provenance.
5. The official matcher rejects contextual value mismatches.
6. The runner classifies provider safeguards and nonzero agent exits.
7. Stored judge artifacts report expected, reported, and missing costs.
8. Historical re-judging pins the exact corpus revision and case order.
9. The runbook states the paid self-test call count and cost limits. CI never runs that command.

The changes do not touch `src/`, `catalog/`, generated outputs, or the Playground.

## Free verification

All required free gates passed.

| Gate                 | Result                        |
| -------------------- | ----------------------------- |
| Focused review suite | 5 files and 106 tests passed  |
| Full unit suite      | 75 files and 950 tests passed |
| Smoke suite          | 4 files and 73 tests passed   |
| Typecheck            | Passed                        |
| Build                | Passed                        |
| Routing gate         | Passed                        |
| Eval self-test       | Passed                        |
| QA compile           | 492 cases compiled            |
| Secrets scan         | Clean                         |
| Generated parity     | Passed                        |
| Diff check           | Passed                        |

The focused suite is `test/compare-architecture-ab.test.mjs`,
`test/evidence-pack-per-operation.test.mjs`, `test/qa-judge-stored.test.mjs`,
`test/re-judge.test.ts`, and `test/qa-agent-result.test.mjs`.

The evidence-pack verifier passed all ten saved fixtures.

One free command reproduces both the fixture check and the replay.

```sh
node eval/qa/verify-evidence-pack-fixtures.mjs --portfolio
```

`--portfolio` reads the gitignored `eval/qa/results/` artifacts. It prints
`SKIP (no ignored result artifacts found)` on a machine without the 2026-08-14 run.

The 117-row replay reported these values.

| Measurement                     | Result |
| ------------------------------- | -----: |
| Eligible rows                   |     70 |
| Rows with source basis          |     64 |
| Eligible rows with source basis |     38 |
| Exact supported terms           |  1,156 |
| p3 omissions                    |    399 |
| p5 omissions                    |    114 |
| Improved packs                  |     55 |
| Tied packs                      |     15 |
| Worsened packs                  |      0 |

## Paid self-test

The paid judge self-test passed.

- Expected calls: 7.
- Actual calls: 7.
- Reported costs: 7.
- Missing costs: 0.
- Cost: `$0.9728457`.
- MCP calls: 0.
- Answering-agent calls: 0.

## Final p5 M1 matrix

M1 re-judged stored answers with `claude-sonnet-5`, rubric `v2.4`.

The source pack was p3. The candidate pack was p5.

Every pass used the historical corpus revision `70726884a723786c669283953f576277ce9d955b`.

The matrix judged the registered eight rows: two targets and six controls.

- `q-tool-indexer-repos-discovery` — target.
- `q-live-beans-cross-service-reconcile` — target.
- `q-comp-cross-moneygram-partnership-sep24` — control.
- `q-soroban-auth-delegation-p27` — control.
- `q-soroban-oz-token` — control.
- `q-live-zk-repos-current` — control.
- `q-live-fluxity-status-provenance` — control.
- `q-live-digest-blend-coverage` — control.

### Initial pass

- `eval/qa/results/2026-08-17T21-46-24-rejudge.json` —
  SHA-256 `629ed1905c94ee1c4c65244466964193f0c2640b177df9ffff03fbdba4c149c9`.
- `eval/qa/results/2026-08-17T21-48-02-rejudge.json` —
  SHA-256 `3b6b314ab41eea1a6324b3ae53e9a925ff82a5c1aeadb6b545c4f71b1fe7330e`.
- `eval/qa/results/2026-08-17T21-49-43-rejudge.json` —
  SHA-256 `d3209503931ca910621cf1cd1cfcdc1ec1ae5431ba3cd07f5e86bfba43e2d7f6`.

### Repeat pass

- `eval/qa/results/2026-08-17T22-05-20-rejudge.json` —
  SHA-256 `1f371cb2b40aa126a7ec608a0246f9dd65265639fd6f3e4ded8354ff27704217`.
- `eval/qa/results/2026-08-17T22-06-59-rejudge.json` —
  SHA-256 `f9dd24ec2e34fbb4d05bf630945e93fc3cc67032278e27e4ffaf06727f539fed`.
- `eval/qa/results/2026-08-17T22-08-58-rejudge.json` —
  SHA-256 `b557433682984f51518694d19046eff61f9dfc69d174e0c8c98ee7bed4291f20`.

### Tie-break

- `eval/qa/results/2026-08-17T22-26-02-rejudge.json` —
  SHA-256 `e2f6a80882febca394ac5cb3b0f920eee1f716d6d052d09b7435dc53b00764ca`.

### Accounting

- Initial: 8 calls, `$1.6608864`.
- Repeat: 8 calls, `$0.4486947`.
- Tie-break: 1 call, `$0.0478449`.
- Total: 17 of 17 calls reported, 0 missing costs, `$2.157426`.
- Answering-agent calls: 0.

## M1 row results

| Row                     | p3 stored | p5 initial | p5 repeat | p5 tie-break | Final   |
| ----------------------- | --------- | ---------- | --------- | ------------ | ------- |
| Indexer target          | wrong     | partial    | partial   | —            | partial |
| Beans target            | wrong     | correct    | correct   | —            | correct |
| OpenZeppelin control    | correct   | correct    | partial   | partial      | partial |
| MoneyGram control       | correct   | correct    | correct   | —            | correct |
| Auth delegation control | correct   | correct    | correct   | —            | correct |
| ZK repos control        | correct   | correct    | correct   | —            | correct |
| Fluxity control         | correct   | correct    | correct   | —            | correct |
| Blend digest control    | correct   | correct    | correct   | —            | correct |

### Indexer

Both p5 passes cleared the p3 wrong claims.

The remaining provenance and external-label omissions are real answer gaps.

The target therefore improved to partial, not correct.

The two passes enumerated the Galexie role differently. That difference is monitor-only.

### Beans

Both p5 passes returned correct with no missing facts and no wrong claims.

The p5 pack grounds the five specifics that p3 called unsupported.

### OpenZeppelin

The initial p5 pass scored correct. The repeat and the tie-break scored partial.

The final majority is partial.

The audit-scope caveat is an answer omission, not a pack fact loss.

Both p5 prompts hashed identically, so the two passes read byte-identical input.

This is judge severity variance at the correct-partial boundary.

## Stop decision

No stop condition fired under the approved fact-level amendment.

A fact-intact control verdict drop does not stop the matrix.

The live, digest, and tie-break lanes all ran.

The matrix changed QA measurement only.

The result rejects an unqualified benchmark improvement claim.

It does not reject the p5 evidence-pack repair.

## Superseded p4 M1 probe (historical)

This subsection preserves the earlier p4 probe as it ran. Every figure in it is a p4 figure. The
p5 matrix above supersedes it. Do not cite these rows as p5 evidence.

The probe judged four rows twice: `q-tool-indexer-repos-discovery` (target) plus the MoneyGram,
auth-delegation, and OpenZeppelin controls. That was one target and three controls against the
eight rows the execution plan registered, so it did not meet the plan's six-control Gate 3
acceptance rule.

- `eval/qa/results/2026-08-17T18-57-50-rejudge.json` —
  SHA-256 `da8dee8927048a608203c37464e88ededcef81e7aa97a6cea0ecd7e5a48fc8d6`, 4 calls,
  0 missing costs, `$0.805341`.
- `eval/qa/results/2026-08-17T19-00-00-rejudge.json` —
  SHA-256 `c0a87715e834651343e5e4e8f960b8ddce9026d147cddbd3017d03a787529886`, 4 calls,
  0 missing costs, `$0.1878951`.

That probe used eight judge calls and cost `$0.9932361`. With the paid self-test it used 15 judge
calls and cost `$1.9660818`.

| Row                     | p3 stored | p4 pass one | p4 pass two |
| ----------------------- | --------- | ----------- | ----------- |
| MoneyGram control       | correct   | correct     | correct     |
| Auth delegation control | correct   | correct     | partial     |
| OpenZeppelin control    | correct   | partial     | partial     |
| Indexer target          | wrong     | partial     | partial     |

Its predeclared stop rule ended the wider matrix after the repeated OpenZeppelin control loss, so
the live, digest, and tie-break lanes did not run under p4.

`eval/qa/evidence-pack.mjs` changed again after both p4 passes finished, while the label still read
`p4`. For a short window one label covered two pack builds. The Indexer pack measured 11,967
characters in these passes and 11,992 characters under the current build. That ambiguity is why
the pack moved to `p5`: a pack whose bytes change takes a new version.

## What this proves

The p5 pack fixes two exact evidence-loss mechanisms.

The Indexer result shows one repeatable judge-quality improvement.

The deterministic replay shows broad exact-term retention without pack growth beyond the limit.

The provider error does not indicate an MCP reliability failure.

The stored context data does not show window exhaustion.

The production and stored evidence do not prove truncation caused response misses.

## What this does not prove

The result does not prove that MCP responses improved.

The result does not support a larger execute-result limit.

The result does not support automatic artifact reads.

The result does not support a new successful result envelope.

The result does not support Playground coupling.

The result does not make the 2026-08-14 scores a current product baseline.

## Recommendations

1. Land the measurement repairs after final independent review.
2. Keep the MCP runtime unchanged for this work.
3. Treat p5 score changes as measurement changes, not product gains.
4. Prequalify future controls against their full golden requirements.
5. Reject a control when its answer omits a required golden fact.
6. Require two independent control reviews before paid launch.
7. Keep historical cases, case order, prompts, packs, and costs pinned.
8. Run Beans only under a new reviewed matrix with clean controls.
9. Keep the current result cap until an exclusive tail-loss case exists.
10. Keep artifact continuation on the existing fail-loud MCP contract.

The highest-value next step is control prequalification.

This step improves measurement validity without changing the MCP service.
