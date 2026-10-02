# Live loop check for the `ai` and `@ai-sdk/*` in-range bump — plan

Date: 2026-10-02. Author and operator: `raven-next` (Claude Fable 5.1). Status: awaits plan review.
The owner approved paid tests for this bump on 2026-10-02 and left the method to the lead.

## Question

Does the Playground chat loop behave the same on the new SDK versions as on `main`?
This is a transport and loop-integrity check. It is not an answer-quality comparison.
It reuses the reviewed instrument and case set of the 2026-10-01 source-authority plan
(`.agents/rounds/2026-10-01-backlog-closeout/authority-plan.md`).

## Arms

| arm | commit | generation (`eval:playground --print-generation`) | worktree |
| --- | --- | --- | --- |
| BASE | `a1b76548` (`origin/main`, deployed as Worker Version `92ccf13a`) | `7516337fb692502f7995abba65413750802b9e6efa7533efdb7a5f24a781c90b` | `stellar-raven-codemode-worktrees/raven-deploy` (detached) |
| CANDIDATE | `8f578ac8` (BASE plus one lockfile commit) | `081beeb15167c91b3d081ed56573d43c12ecdf3835fc122c7ced62399767e046` | `stellar-raven-codemode-worktrees/raven-next-ai` |

`git diff a1b76548 8f578ac8 --stat` lists only `package-lock.json` (34 insertions, 34 deletions).
The moved packages: `ai` 7.0.79 → 7.0.127, `@ai-sdk/anthropic` 4.0.42 → 4.0.71, `@ai-sdk/google`
4.0.51 → 4.0.87, `@ai-sdk/openai` 4.0.47 → 4.0.83, `@ai-sdk/provider` → 4.0.21,
`@ai-sdk/provider-utils` → 5.0.53 (its `undici` → 7.30.0), `@ai-sdk/gateway` → 4.0.103.

Free gates on CANDIDATE: `npm run typecheck` exit 0; `npm test` 134 files, 2360 passed, 3 expected
fail; `npm run build` exit 0 (7300.52 KiB against 7226.05 KiB on BASE); `npm run test:smoke` 100
passed; `npm audit` 0 findings.

## Why a live check, and what the source already settles

`ai` enters the Worker only through `src/demo/chat.ts` and `src/demo/tools.ts`. `src/executor`
imports the root of `@cloudflare/codemode`, which does not import `ai`. The MCP `search` and
`execute` path is therefore outside this change.

The changelog entry "prevent `streamText` from executing tool calls that violate tool choice"
(`ccf98e7`) does not reach the Playground. In `ai@7.0.127` `dist/index.js` the check runs only when
`toolChoice.type` is `required` or `tool`. The Playground sets no `toolChoice`; its final step sets
`activeTools: []` only.

Three things remain that only a live turn exercises: stream-completion handling in the Workers
runtime (`34d869e`), the packages' new ES2022 and tsdown build output, and the OpenAI Responses
provider code that the evaluation cost accounting reads raw responses from
(`eval/playground/README.md`, "Supported accounting transports").

## Instrument

`npm run eval:playground`, answer-only (`--no-judge`), the six frozen case IDs of the authority plan:

`q-anchor-list-builders-discovery`, `q-asset-stablecoin-issuers-discovery`,
`q-protocol-base-reserve-min-balance`, `q-scf-build-award-cap`, `q-sep-45-contract-auth`,
`q-soroban-storage-types`.

Model settings, both arms: `DEMO_MODEL_OVERRIDE=openai/gpt-5.6-terra` (the production primary),
`DEMO_OPENAI_API_MODE=responses`, `DEMO_REASONING_EFFORT_OVERRIDE=none`. The production fallback
`openai/gpt-5.6-luna` uses the same provider code. No Anthropic or Google model is in the production
chain, so those two providers are not exercised.

No judge runs. A patch-level SDK change threatens the loop, not the facts; a judge would add the
pinned-executable requirement and cost without measuring the risk. The lead and one independent
reader read all twelve answers against their goldens for gross regressions.

One run per arm: BASE first, then CANDIDATE. One Wrangler process at a time, started with:

```sh
npm run dev:eval -- --var DEMO_MODEL_OVERRIDE:openai/gpt-5.6-terra \
  --var DEMO_OPENAI_API_MODE:responses --var DEMO_REASONING_EFFORT_OVERRIDE:none
```

The startup line `eval server revision <sha>` must equal the arm's commit. Each server stops before
the other starts. Both worktrees stay clean.

## Budget

`--max-budget-usd 5` per run. One replacement run with a `$5` cap is pre-authorized for an HTTP,
SSE, or provider transport failure with intact cost accounting, on the failed arm only. Ceiling:
`$15`. The 2026-10-01 authority round ran 25 answers and 24 judge calls for `$3.23`, so 12
answer-only turns should cost about `$1` to `$2`. Cap files (contract
`playground-semantic-round-cap/v1`): planned 12 answers, absolute 18, judge 0, retry reserve 6.
At most 18 answer turns, under the 30-per-hour subject limit.

Assumption: the demo Gateway daily spend limit has headroom for `$15`. The 2026-10-01 round
confirmed headroom for a `$52` ceiling; this lead does not read the private figure. A Gateway
refusal stops the run as a transport failure.

Deadline: all servers stopped before 2026-10-02T23:00:00Z, the same limit the authority plan set
ahead of the owner's paired run. No paired launch is in progress
(`/private/tmp/stellar-raven-paired-launch` does not exist).

## Commands

```sh
export DEMO_MODEL_OVERRIDE=openai/gpt-5.6-terra DEMO_OPENAI_API_MODE=responses DEMO_REASONING_EFFORT_OVERRIDE=none
IDS=q-anchor-list-builders-discovery,q-asset-stablecoin-issuers-discovery,q-protocol-base-reserve-min-balance,q-scf-build-award-cap,q-sep-45-contract-auth,q-soroban-storage-types
node eval/qa/probe-remote-identities.mjs --sha256        # before and after each run
# BASE worktree, BASE server:
npm run eval:playground -- --confirm-paid --max-budget-usd 5 --url "$URL" --server-generation 7516337fb692502f7995abba65413750802b9e6efa7533efdb7a5f24a781c90b --round-cap-context "$B/caps/base.json" --ids "$IDS" --no-judge --out-dir "$B/results/base"
# CANDIDATE worktree, CANDIDATE server:
npm run eval:playground -- --confirm-paid --max-budget-usd 5 --url "$URL" --server-generation 081beeb15167c91b3d081ed56573d43c12ecdf3835fc122c7ced62399767e046 --round-cap-context "$B/caps/candidate.json" --ids "$IDS" --no-judge --out-dir "$B/results/candidate"
npm run eval:plan -- "<result file>"                    # free regrade of each result
```

`$B` is the lead's scratch directory, outside tracked paths. Results and caps are not committed;
the round ledger records the hashes, costs, and readings.

## Pass rule for CANDIDATE

1. All six rows complete: a terminal frame, no HTTP or SSE error, no fallback to the second model
   caused by an empty or failed stream that BASE does not also show.
2. Every row has a valid `eval-cost` frame: `error: null`, `reportedCalls === calls`,
   `costUsd > 0`, no missing cost. The method is not invalidated.
3. Every row has at least one successful `execute` with a service call, and its first-family
   class under the authority plan's rule is E or T (the three ecosystem cases expect Scout or
   Lumenloop; the three protocol controls expect Stellar Docs).
4. No row ends in a tool-loop defect: no invalid-tool-call or tool-choice error, no tool call
   executed on the final tools-disabled step, a non-empty final answer.
5. Loop shape is comparable to BASE: for each case, the count of `search` and `execute` calls
   and the terminal reason are reported side by side. A difference is acceptable when the answer
   is grounded and the row passes rules 1 to 4; model variance at temperature 0.1 is expected.
6. No gross answer regression: both readers find no candidate answer that contradicts its golden
   where the BASE answer does not. With one repetition this is a screen, not a measurement.

BASE must also satisfy rules 1 and 2; a BASE failure means the instrument is broken, and the round
stops without a verdict. A source-identity change across the two runs marks answer differences as
possible source drift. A CANDIDATE failure of rules 1 to 4 blocks the merge. The replacement run is
the only retry.

## Release

On a pass: independent result review, then merge the lockfile PR, deploy, and verify production
with one authenticated Playground-independent MCP check and the public routes. The live Playground
itself is exercised by this check on the same bundle input; no production Playground turn is run.
