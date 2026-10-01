# Playground semantic evaluation

`scripts/run-demo-model-gauntlet.mjs` remains the eight-case transport and tool-loop smoke test. It checks that models can complete the SSE chat path cleanly; it does not establish factual answer quality. It prints the validated matrix first and will not create artifacts, read `.dev.vars`, mint cookies, or start Wrangler unless the operator explicitly supplies `--confirm-paid` (for example: `node scripts/run-demo-model-gauntlet.mjs --models openai/gpt-5.4 --confirm-paid`). The printed total is planned Playground chat turns, not guaranteed provider calls.

`npm run eval:playground` is the complementary semantic lane. It sends existing QA cases to the real `POST /playground/chat` SSE route, captures the final assistant text, search/execute outcomes, terminal reason, latency, HTTP/SSE errors, and grades the final answer with the existing `eval/qa` golden, evidence-pack, and judge contract. It introduces no new quality rubric and does not change corpus or golden content.

Use a pane already running `npm run dev` and its bound loopback URL; do not start Wrangler for this command.

```sh
# Free validation: default seeded, stratified five-case selection; no HTTP/model/judge calls.
npm run eval:playground -- --dry-run

# Free route-auth validation: signed run cookie reaches body validation before throttle/model work.
npm run eval:playground -- --preflight

# Print the source-tree generation after the reviewed tree is frozen.
npm run eval:playground -- --print-generation

# Small paid run. Both provenance assertions are mandatory before model spend.
npm run eval:playground -- --confirm-paid --max-budget-usd 10 --url http://localhost:8787 \
  --server-generation <sha256-from-print-generation> \
  --round-cap-context /tmp/playground-round-cap.json \
  --sample 5 --seed baseline-a

# Targeted reproduction.
npm run eval:playground -- --confirm-paid --max-budget-usd 10 \
  --server-generation <sha256-from-print-generation> \
  --round-cap-context /tmp/playground-round-cap.json \
  --ids q-aas-burn-clawback-redemption-mechanics

# Whole named contract, only when it stays within the one-subject 30/hour cap.
npm run eval:playground -- --confirm-paid --max-budget-usd 10 \
  --server-generation <sha256-from-print-generation> \
  --round-cap-context /tmp/playground-round-cap.json \
  --cases eval/qa/corpus/live/live-cases.json --full
```

## Dollar accounting

Each paid invocation requires exactly one spaced `--max-budget-usd USD` flag.
The existing runner counts answer costs and judge costs in one sequential ledger.
It sends the remaining amount to each answer turn and each judge call.
The next call stops when the reported costs exhaust the amount.
An excess cost invalidates the method and stops further calls.
A provider can exceed the remaining amount within its last call.
This checkpoint limit does not reserve funds or guarantee a provider-side dollar ceiling.

Loopback requests carry `x-raven-eval-max-budget-usd` to the existing chat route.
The route records each provider response's `cf-aig-log-id`.
It reads the reported USD cost with `AI.gateway(id).getLog(logId)` after the stream finishes.
It settles each previous call before the next provider call, including fallback calls.
It disables automatic SDK retries and permits one Gateway attempt per provider call.
It enables Gateway metadata logging and disables payload logging for these evaluation requests.
Ordinary Playground requests keep their existing logging settings.
The [Gateway log API](https://developers.cloudflare.com/api/resources/ai_gateway/subresources/logs/methods/get/) defines the reported cost field.

The route emits one `eval-cost` frame before stream closure, after any terminal frame.
The runner reads through stream closure to collect this frame.
Missing log identities, missing costs, duplicate identities, and failed requests never imply zero cost.
Five bounded log reads permit a short reporting delay.
A missing cost invalidates the method and prevents the next answer or judge call.
The current accounting path requires a provider transport that returns raw responses with Gateway log identities.
An unsupported transport stops before its provider call.
Live cost reporting remains a measurement prerequisite; offline mocks cannot prove Gateway availability.

Results retain `budget.selectedCaseIds`, `incompleteCaseIds`, and `unattemptedCaseIds`.
The ledger records each authorization and reported cost.
`meta.totalCostUsd` sums reported complete-call costs; invalid methods can have additional unknown costs.
Each row retains the answer-cost frame, including any reported partial amount.
Missing or excessive costs produce an invalid method with exit code 1.
Budget exhaustion with unfinished cases produces an incomplete method with exit code 1.
Both suppress the aggregate and block downstream grading.
Generation quarantines also retain the budget ledger for cost reconciliation.
The judge tuple records the executable path, real path, version, and SHA-256 before spend.

`--server-generation` is deliberately an operator assertion, not runtime introspection. The
harness requires it, checks it against the complete local working-tree generation before the
first model call, checks that the tree stayed unchanged before writing, and records the limit
honestly: this does not prove that an already-running Worker loaded those bytes. The reviewed
operator must ensure the reused `dev` pane represents that generation. A generation is
machine-local, not a portable build or deployment identity; the value only attests to the named
operator's local tree at the harness checkpoints.

`--round-cap-context` is a JSON `playground-semantic-round-cap/v1` input. A reviewed round uses
non-negative integer ceilings and consumption counters; the harness refuses before spend when
the selected answer/judge calls would exceed an absolute cap:

```json
{
  "contract": "playground-semantic-round-cap/v1",
  "experimentId": "2026-07-15-playground-round-a",
  "kind": "reviewed-round",
  "runAllocation": "planned",
  "plannedAnswerCalls": 10,
  "absoluteAnswerCallCap": 12,
  "answerCallsConsumedBeforeRun": 0,
  "plannedJudgeCalls": 10,
  "absoluteJudgeCallCap": 12,
  "judgeCallsConsumedBeforeRun": 0,
  "infraRetryReserve": 2,
  "infraRetryConsumedBeforeRun": 0,
  "savedAnswerRejudgeReserve": 3,
  "savedAnswerRejudgesConsumedBeforeRun": 0
}
```

Do not copy those example numbers into a real run: encode the independently reviewed round's
actual authorization and current consumption. Set `runAllocation` to `planned` for ordinary calls
or `infra-retry` for a transcript-proven retry; the latter is bounded by the remaining retry
reserve. A one-off unreviewed diagnostic must instead use `kind: "not-applicable"`, a non-empty
`reason`, `runAllocation: null`, and all ten numeric cap fields present as explicit `null`; such an
artifact is labeled diagnostic and is not evidence for a reviewed eval-round conclusion.

The cap context is an operator-maintained cumulative ledger, not a shared transactional counter:
the named round owner updates `*ConsumedBeforeRun` between invocations and verifies the next
projection before spending. The harness fail-closes an inconsistent or over-cap input, but cannot
account for model calls made outside the supplied machine-local context.

`--no-judge` captures a route/trace diagnostic only; omit it for the semantic result. Results are timestamped JSON below `eval/local-lanes/playground-semantic/`, which is gitignored. Newly produced files use metadata contract `playground-semantic-result/v2` and input snapshot `playground-semantic-input/v1`. They pin the ordered configured primary/fallback models, effective/requested API mode, reasoning effort, answering temperature, explicit judge model/rubric/pack/unpinned-temperature semantics, demo/evaluator/round caps, local tree generation, and raw corpus/manifest/super-spec plus evaluator-source hashes. The answering block also records that the route does not expose actual attempted models in SSE; configured fallback is pinned, fallback activation is not claimed. Internal hashes are revalidated by the re-judge reader; omission or mismatch fails. Historical artifacts remain untouched.

If a required local generation checkpoint observes a mismatch after an answer call has started, or the checkpoint itself fails after spend, the invocation fails closed (exit 1) without writing a normal result. It instead makes a best-effort local-only `playground-semantic-quarantine/v1` file at `<out-dir>/quarantine/<runId>-playground-semantic-quarantine.json`. A quarantine has `quarantinedMeta` and `quarantinedRows`, never normal top-level `meta`, `rows`, or `summary`; it is non-promotable and may be used only for spend reconciliation and runner forensics. It cannot support factual, upstream, eval, causal, scoring, re-judge, aggregate, or comparison claims. A quarantined transcript may motivate an investigation, but any finding needs fresh non-quarantined evidence from a clean rerun or recurrence probe.

Quarantined spend still increments the operator ledger's `*ConsumedBeforeRun` counters by the saved started-call minimums. Exit 1 with a quarantine file means update the ledger from its `spend` block; exit 1 without one means reconstruct the conservative counts from the stderr marker. `infraRetryAuthorized: false` is not a retry authorization: any retry needs a new reviewed cap context. The harness checks before each answer, after each answer before any judge, and before normal finalization; it does not prove the bytes loaded by an already-running Worker or continuously observe edit/revert cycles.

Their saved transcript uses `mcp__playground__search` / `mcp__playground__execute` aliases with full JSON-stringified inputs and results, so the existing plan grader works directly:

```sh
npm run eval:plan -- eval/local-lanes/playground-semantic/<stamp>-playground-semantic.json
```

Run that regrade after playground prompt or tool-loop changes. Treat this as a separate playground lane: do not merge its denominator or scores with the main MCP QA battery.

For live loopback runs, the harness reads `MCP_SERVER_SECRET` from the environment or `.dev.vars` without logging it and mints an ephemeral run-scoped demo cookie. This exercises the normal cookie-authenticated per-subject throttle while avoiding collisions in the shared `dev-loopback` bucket; it never uses this cookie against a non-loopback URL.

One run-scoped subject is intentionally limited to the real `DEMO_CAPS.chatsPerHour` ceiling (currently 30). Selection over that cap, including `--full` against the main battery, is rejected before the harness mints a cookie or sends a request. Use `--sample 30`, a <=30-case named contract, or an explicit `--ids` shard; it never rotates subjects to evade the safeguard.
