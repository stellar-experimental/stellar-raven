# Playground semantic evaluation

Two API-billed AI Gateway lanes—exceptions E1 and E2 in [Model-call billing](../EVALS.md#model-call-billing), which owns the question→path table, sizing caps, and selection tiers. Use them only for Playground product questions (transport, prompt, loop, caps, effort/temperature, fallback, or Gateway-only models). Scope runs with [run-evals](../../.agents/skills/run-evals/SKILL.md).

- **E2 (`scripts/run-demo-model-gauntlet.mjs`):** 8-case SSE transport and tool-loop smoke test (does not measure factual quality or fallback hand-off). Starts its own Wrangler per model; defaults to the shipped tuple (`DEMO_MODELS`), each model alone; pass `--models <provider>/<catalog-id>` for other models. When `--max-budget-usd` is omitted, prints the launch plan and exits non-zero without spending or starting Wrangler (duplicate or invalid cap flags fail before printing a plan).
- **E1 (`npm run eval:playground`):** sends QA cases to the running local `npm run dev` server's `POST /playground/chat` route (never starts Wrangler) and grades answers with the `eval/qa` golden, evidence-pack, and subscription Claude judge contract. Keep its denominator separate from MCP QA.

```sh
# Free checks: seeded 5-case dry run, route-auth preflight, and local source-tree generation.
npm run eval:playground -- --dry-run
npm run eval:playground -- --preflight
npm run eval:playground -- --print-generation

# Paid run: --max-budget-usd and --server-generation are mandatory (see eval/EVALS.md "Sizing").
npm run eval:playground -- --max-budget-usd 2 --url http://localhost:8787 \
  --server-generation <sha256-from-print-generation> --sample 5 --seed baseline-a

# Targeted single-case reproduction:
npm run eval:playground -- --max-budget-usd 2 \
  --server-generation <sha256-from-print-generation> \
  --ids q-aas-burn-clawback-redemption-mechanics

# Whole <=30-case named contract with optional cumulative round cap file:
npm run eval:playground -- --max-budget-usd 6 \
  --server-generation <sha256-from-print-generation> \
  --round-cap-context /tmp/playground-round-cap.json \
  --cases eval/qa/corpus/live/live-cases.json --full
```

## Comparing candidate models

Follow the candidate tiers and caps in [Model-call billing](../EVALS.md#model-call-billing). Run each candidate at effort `none` if supported, else its lowest supported effort (set `DEMO_MODEL_OVERRIDE` and `DEMO_REASONING_EFFORT_OVERRIDE` identically on server and harness, and record effort beside results). Switch only if the candidate passes E2 with no E1 tool-loop regressions; then decide on cost and latency unless the cheaper option is far less correct (report new wrong answers beside cost and latency).

## Dollar accounting

Every paid invocation requires one spaced `--max-budget-usd USD` flag. One sequential ledger tracks answer and judge costs, sending remaining budget on each loopback request (`x-raven-eval-max-budget-usd`) and stopping the next call when exhausted (one in-flight call can overshoot; this is a checkpoint, not a provider hard ceiling).

The chat route disables SDK retries, allows one Gateway attempt per provider call, enables metadata logging (no payload logging), reads `cf-aig-log-id` costs via `AI.gateway(id).getLog(logId)` (up to 5 bounded retries; [Gateway log API](https://developers.cloudflare.com/api/resources/ai_gateway/subresources/logs/methods/get/)), settles each call before the next (including fallbacks), and emits one final `eval-cost` frame with ordered `logIds` and logged `models`. Missing/duplicate log IDs, missing/excess costs, or unsupported transports stop further calls and invalidate the method (exit 1, aggregates suppressed).

### Supported accounting transports

In `workers-ai-provider@4.0.1` ([coverage audit](../../research/audits/2026-10-01-playground-accounting-coverage.md)):

| Path | Supported configurations |
|---|---|
| `AI.gateway(id).run` | OpenAI Responses, OpenAI Chat, and Grok with production transport settings |
| `AI.run` with `returnRawResponse: true` | Plugin-based run transport (Anthropic, Google, explicit OpenAI Chat run transport) |
| Native chat through `AI.run` | Native Workers AI / no-plugin catalog chat (e.g., `@cf/moonshotai/kimi-k2.7-code`, `moonshotai/kimi-k3`) |

The shipped tuple (OpenAI Responses primary + Anthropic run-path fallback) shares one accounting ledger. Evaluation accounting rejects hidden server-side fallback entries and non-chat calls without raw-response support. Native chat captures log IDs before handing `text/event-stream` or `application/json` to the native parser (other content types fail with `unsupported-answer-content-type` while retaining cost). Live cost availability still requires live verification.

### Results and provenance

- **Artifacts:** gitignored timestamped JSON under `eval/local-lanes/playground-semantic/` (`playground-semantic-result/v3`, `playground-semantic-input/v1`). `--no-judge` captures route/trace diagnostics only. Internal hashes are revalidated by `re-judge.mjs`; older result contracts are refused. Exhausting the budget with unfinished cases also exits 1, sets `nonPromotable: true`, and suppresses `summary`.
- **Model provenance:** the harness verifies Gateway-logged `models` against the configured tuple (exact string match; non-OpenAI live IDs are listed in [`2026-11-03-sweep-probe-summary.md`](../../research/gauntlets/2026-11-03-sweep-probe-summary.md)) and stops with `observed-model-mismatch` before judging if a turn reports an unconfigured model or none. Always match `DEMO_MODEL_OVERRIDE` between server and harness.
- **`--server-generation`:** machine-local assertion checked against the working tree before spend and before writing; does not prove the running Worker loaded those bytes (operator verifies the reused `dev` terminal). A post-spend mismatch or generation-check error fails closed (exit 1) and makes a best-effort `playground-semantic-quarantine/v1` file under `<out-dir>/quarantine/` for spend reconciliation and forensics only—never for factual, eval, or comparison claims.
- **`--round-cap-context` (optional):** operator-maintained `playground-semantic-round-cap/v1` JSON tracking cumulative ceilings and `*ConsumedBeforeRun` counters across multi-run rounds (`runAllocation: "planned"` or transcript-proven `"infra-retry"`; see `eval/playground/artifact-contract.mjs` for schema). Update `*ConsumedBeforeRun` after quarantined runs too (from the quarantine `spend` block, or from the stderr marker if the quarantine write failed); quarantine does not authorize `infra-retry`.
- **Auth & throttle:** loopback runs read `MCP_SERVER_SECRET` from env/`.dev.vars` (never logged) to mint an ephemeral run-scoped cookie, enforcing the real `DEMO_CAPS.chatsPerHour` ceiling (30). Selections above 30 fail before any request.
- **Plan grading:** saved transcripts use `mcp__playground__search`/`execute`, so `npm run eval:plan -- <result.json>` works directly; run it after Playground prompt or tool-loop changes.
