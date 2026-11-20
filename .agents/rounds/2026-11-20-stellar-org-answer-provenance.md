# stellar.org answer provenance — 2026-11-20

## Scope

- **Decision.** Record observed answer-quality value if at least one answer uses a judge-relevant
  fact that only the stellar.org adapter supplied in that answer's actual tool results. Keep the
  shipped surface in either outcome. A citation or an extra detail alone does not qualify.
- **Instrument.** One Variant A pass on the 12 source-focused cases in the
  [loop 2 roles scan](2026-11-15-tuning-loop-2/scans/step2/roles.md), checked against the current split
  (`6a032d09…`), on a clean agentpc worktree at `9983be2c`. Use the subscription Claude Code
  answering and judging path with exact model IDs. Allow at most 12 boundary panels and pin the
  existing stability register. Treat the observation as a provenance diagnostic.
- **Spend and stop rule.** One Sonnet alias resolution capped at $0.25, seven judge self-test calls
  capped at $3.50 in total, and one collection capped at $4.50. The comparable historical
  subscription-equivalent cost basis is about $0.20 per answer for collection and judging together.
  Expect about $2.40 for the collection and 25–40 minutes including upstream identity checks.
  Stop at the first failed preflight, identity change, incomplete collection, or budget stop.
  Retain incomplete evidence without an aggregate. No repeat or re-judge.
- **Review.** Check calls, delivery, and observed use across all 12. Review every candidate
  contribution, wrong verdict, trap, and judge error, plus the first two remaining cases in the
  declared panel order. Independently verify each candidate against the answer, judged fact and
  other tool results. Retain raw artifacts privately. Only counts and dispositions belong here.

## Lanes

| Lane | Model and effort | Terminal | Assignment |
| --- | --- | --- | --- |
| Plan review | Grok `grok-4.7`, high | `t45b` | Independent challenge to the source-attribution rule and the collection method |
| Collection | Claude Code subscription, Sonnet for answering and judging | agentpc | Existing pinned runner |
| Evidence review | Codex `gpt-6.2-sol`, high | `t45d` | Independent transcript and ledger reconciliation |

## Ledger

- Prepared a detached agentpc worktree. `npm ci`, `npm run typegen`,
  `npm run eval:qa:lint -- --stale --enforce-floors` (0 errors, 98 warnings),
  `npm run eval:qa:register -- --check`, and `npm run eval:selftest` passed.
- `npm run dev:eval -- --port 8834` started as `agentpc/t235`. An MCP initialize request
  returned HTTP 200. Verified 12 of 12 eligible IDs and the stability-register digest.
- Added Antigravity `gemini-4-neon`, high (`t45c)), as a fallback method reviewer while
  Grok was still working. Started the judge prerequisite separately from collection.
- Grok confirmed the single-client provenance design. Adopted explicit completeness requirements:
  all 12 answered and judged, all triggered panels complete, identities stable, and
  `meta.comparable: true`. Use `--max-panel-cases 12`. An incomplete or stopped result is
  inconclusive and leaves the source task open.
- A positive requires a judged key fact (or required trap behavior), its use in the answer,
  a supporting span in a successful `stellarOrg` result, and no other visible search projection
  or execute result supplying it. Treat potentially relevant truncated, errored, or indeterminate
  alternate results as uncertainty. Confirm positive candidates on the live page. Zero leaves the
  existing coverage decision and TODO open.
- The alias resolved to `claude-sonnet-5-5` on Claude Code 2.1.329 ($0.01145). The first
  calibration invocation stopped before any judge call because the npm wrapper changed the
  environment digest. Invoke the same committed self-test directly with Node and recompute
  its pin in the execution shell. Reuse the alias result. The seven-call cap is unchanged.
- Direct invocation of the committed judge self-test passed all seven cases on
  `claude-sonnet-5-5` (agentpc `t237`, $0.26454 subscription-equivalent, all costs reported).
  Alias resolution started while Grok's review was pending. No panel answer or judge call used
  the previous method, and the corrected evidence rule was fixed before collection.
- Three upstream captures agreed (`1afbd357…`). The guard covers Scout, Lumenloop and
  Stellar Docs. The saved payload and timestamped page verification establish stellar.org
  provenance. The runner reported 12 active of 12 selected before the first answer call.
- Reconciled the Antigravity review during collection, before reading any result. Qualifying
  rows must have usable, unambiguous source evidence and a correct or partial verdict with
  no source-attributed wrong claim or avoid match. Report any source-attributed defects
  separately. The decision is observed delivery of a rubric fact in the recorded answer.
  A different retrieval route might supply the same fact. Use the order of the numbered source
  list in the loop 2 roles scan for coverage sampling.
- Retained the bounded panel policy and the historical stability register, with a possible
  register/judge mismatch recorded as a limit. The self-test was warranted by both a new
  resolved judge ID and the changed judge launch settings. Grok and Antigravity reviewed
  the method because each uses a separate model family from the orchestrator and the judge.
- The [loop 2 ledger](2026-11-15-tuning-loop-2.md) records $11.62–$12.02 per 58-answer
  pass, median $11.81 ($0.20 per answer). Those passes used rubric v2.11, pack p9,
  and the previous judge ID. There is no stored same-judge price for this 12-case instrument.
- Collection started as `agentpc/t238` with `node eval/qa/run-qa.mjs --variant A --port 8834
  --ids <12 verified IDs> --model claude-sonnet-5-5 --judge-model claude-sonnet-5-5
  --max-budget-usd 4.50 --max-panel-cases 12 --stability-register <pinned register>`
  and the required revision, surface, executable, environment, and upstream pins.
- Collection completed in 4m 36s. Stamp `2026-11-20T18-28-22-variantA`, SHA-256
  `9b4a15990cbaa2be8d86f2969d9ab6448846e492ce382a01e5ebd62a8544c4dc`.
  Claude Code 2.1.329, `claude-sonnet-5-5` for answers and judging, rubric v2.11, pack p9.
  Preflight and postflight revision, surface and upstream pins held. The run is comparable
  within its own collection. The historical register recorded no judge-model match value.
- T1 (first-pass answer quality): 12 of 12 answered and graded, 2 correct, 10 partial, 0 wrong,
  12 with a correct core answer. T2 (retry recovery): 0 eligible first-pass failures.
  T3 (safety): 0 trap cases. T4 (harness and judge): 0 failures, 3 panels completed and 0
  skipped, with cost reported for all 12 answering and 18 judging calls. T5 (provider
  availability): 0 transport errors, timeouts or provider safeguards.
- Collection cost $2.29478, $0.19123 per answer. Alias resolution and the self-test bring
  the eval total to $2.57077 subscription-equivalent. Reviewer sessions used subscriptions.
- Closed the dev server and removed the dedicated worktree after validating the private copy
  of the results against its SHA-256.

## Outcome

**Confirmed one answer used a rubric fact supplied only by stellar.org in its returned evidence.**
Codex `gpt-6.2-sol`, high (`t45d`), independently audited all 12 rows against the judge inputs and
transcripts. It identified the Build Award terms from the grants overview as the qualifying
contribution in a partial answer. The other returned evidence supported the investment side of
the answer but did not supply those award terms. The lead verified the relevant span on the
[SDF grants page](https://stellar.org/grants-and-funding) after collection on 2026-11-20.

- Four of 12 answers called `stellarOrg` and received substantive content. Three answers used it.
  There were 17 operations, 16 reporting success, including one search with no rows. Twelve
  operations delivered nonempty content directly, two searches selected pages inside a script,
  and one successful search result was clipped. The remaining page call rejected a redirect
  outside stellar.org, as designed.
- Two answers used mandate material. Relevant Scout excerpts were clipped, leaving uniqueness
  uncertain under the registered rule. A fourth answer received a generic source description
  and used its Scout evidence. The reviewer found zero source-attributed wrong claims or
  avoid matches. The three observed uses also fall short of the separate corroboration-guard
  review's five-answer threshold.
- Keep the existing source. Close the outstanding fact-delivery check in
  [TODO](../TODO.md#monitor-stellarorg-routing-and-search-depth). One confirmed contribution
  establishes observed delivery on the shipped surface. There is no estimate of quality lift
  or cross-client transfer from this panel.
- The TODO entry cites this ledger for the observed contribution. The hashed artifact and
  calibration receipts stay private on agentpc. The PR contains the ledger and TODO update.
