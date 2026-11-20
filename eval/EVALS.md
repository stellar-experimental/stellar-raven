# Evaluation map

The QA evaluation is the headline measure: whether an agent gives a correct, current answer through `search` and `execute`. Other instruments measure routing, discovery, tool use, or targeted behaviors.

Scope every paid run with the [run-evals skill](../.agents/skills/run-evals/SKILL.md) (decision, smallest run, stop rule, cost estimate). Reuse compatible stored results before collecting more; predeclare sample, acceptance, and stopping rules for bounded comparisons and keep incomplete historical cohorts separate. [Model-call billing](#model-call-billing) lists the API-billed exceptions; [the roster](../.agents/model-roster.md#models-for-evals-and-tests) owns the client set.

## Instruments

| Instrument | Measure | Cost and use | Status |
|---|---|---|---|
| [Routing: legacy](README.md) | Service ranking on the legacy set | Offline; run after catalog or scoring changes | Gate: top-1/3/5 baseline band |
| [Routing: skills](README.md) | Skill ranking on the skills set | Offline; same routing run | Gate: top-1 floor |
| [Routing: holdout](README.md) | Blind routing on the holdout set | Offline; same routing run | Gate: top-1/3/5 floors and forbidden-capture ceiling |
| [Routing: extended](README.md) | Service ranking on the extended set | Offline; same routing run | Diagnostic |
| [Routing: accept-either](README.md) | Routing with declared alternate service labels | Offline; same routing run | Diagnostic; keep separate from strict scores |
| [Protocol-history v1](protocol-history-cases.json) | Eight positive cases and four controls | Offline; same routing run | Frozen diagnostic |
| [Protocol-history v2](run-protocol-history.mjs) | 19 required, nine forbidden, and four neutral cases | Offline; `npm run eval:protocol-history` | Frozen diagnostic; source mismatches produce `source-expired` |
| [Discovery](discovery/README.md) | Source-family and usable-operation discovery on 43 cases; 91-query replay | One-shot and replay call a live MCP server without model calls; the agent arm is paid | Diagnostic; [ADR-0009](../research/decisions/0009-discovery-stays-lexical.md) |
| [Agentic routing](agentic/README.md) | Agent query reformulation and service selection on 30 cases | Paid; requires the Claude Code Workflow tool and a live server | Diagnostic |
| [QA battery](qa/README.md) | Final-answer correctness | Paid; use matched cases before and after substantial changes | Headline; membership comes from the [registry](qa/lifecycle-registry.json) |
| [Canonical live QA](qa/corpus/live/live-cases.json) | Live-data behavior on 15 cases | Paid; test grounding after executor or adapter changes | Separate diagnostic: `live-data-canonical-v3` |
| [Digest QA](qa/corpus/live/live-digest-supplement-cases.json) | Recency-digest grounding on two cases | Paid; test digest or skill-run questions | Separate diagnostic: `live-digest-supplement-v2` |
| [Playground](playground/README.md) | The public `/playground/chat` model and tool loop | Paid and API-billed through AI Gateway for Playground product questions only (exceptions E1 and E2 in [Model-call billing](#model-call-billing)); uses selected QA cases | Diagnostic; keep its denominator separate from MCP QA |
| [Plan](plan/README.md) | Service coverage and broad-to-detail call order | Offline; grades stored QA transcripts | Diagnostic; progression is informational |
| [Temporal](temporal/README.md) | Answer behavior for temporal questions | Offline; grades stored results | Diagnostic |
| [Partner docs](partner-docs/README.md) | Required facts in partner documentation | Live source checks; see the instrument guide | Diagnostic |
| [Composition](qa/analyze-composition.mjs) | Tool composition in stored transcripts | Offline; accepts a saved result file | Diagnostic |
| [Missing-fact clusters](qa/cluster-missing-facts.mjs) | Repeated omissions in stored verdicts | Offline; accepts a saved result file | Diagnostic |

## Contract ownership

- [gates.json](gates.json) owns routing thresholds, accepted totals, input fingerprints, and baseline decisions.
- [The routing guide](README.md) owns routing commands, label normalization, gate semantics, and the confirmation-only rows that match a QA headline question.
- [The QA guide](qa/README.md) owns QA flags, judge contracts, the current evidence pack (`p9`), comparison rules, and paired collection requirements.
- [The lifecycle registry](qa/lifecycle-registry.json) owns battery membership and case identity.
- [The corpus guide](qa/corpus/README.md) owns case authoring and lifecycle inputs.
- [The corpus provenance guide](corpus/PROVENANCE.md) identifies routing inputs and retained source material.
- [The run-evals skill](../.agents/skills/run-evals/SKILL.md) owns round coordination and run sizing.

## Evaluation rules

1. Keep one headline and three routing gates. Keep all other instruments diagnostic unless an explicit decision changes their status.
2. Keep each instrument's denominator separate. Compare matched case IDs, case content, judge contracts, and service identities.
3. Fix general mechanisms. Do not tune the implementation to individual questions or alter failed holdout labels.
4. Grade volatile facts through behavioral goldens. Use the golden-truth workflow for changes to expected answers.
5. Edit source case files, then regenerate outputs. Never edit generated cases, samples, or lifecycle registries by hand.
6. Treat results as local evidence under ignored `results/` directories. Prune results older than 30 days after investigations end.
7. A comparison across a change of resolved model (answering or judge) is not like for like. A gate or QA baseline re-baselines when its resolved model changes. Eval defaults are family aliases, so every artifact records the exact ID that ran beside the alias requested. A new resolved judge model needs the paid seven-case self-test before its first headline judged run, and that run sets the new baseline.
8. Preserve dated evidence. A historical score does not establish current correctness or decide that another paid run is needed.

When a round establishes an upstream defect, file or update evidence-backed findings in [improvements/](../improvements/README.md).
Record problems in this repository in [.agents/TODO.md](../.agents/TODO.md).
The [improvements workflow](../.agents/skills/improvements-pipeline/SKILL.md) defines evidence and status requirements.

Dated audit records live under [research/audits/](../research/audits/).

## Model-call billing

Evals, judging, testing, and building run on subscription CLIs as `hc` children (Claude Code, Codex, Grok, and OpenCode after the probe below). AI Gateway judging stays out without exception. Any other API-billed path requires a reviewed PR adding its reason here and (if code names the endpoint) an entry in `test/model-call-billing.test.mjs`, then runs under a dollar cap. No per-run approval is needed (`AGENTS.md`, "Spend and evidence").

**Pre-run billing checks** (no model call; unset all provider API keys in the launch env):

| CLI | Check |
|---|---|
| Claude Code | `claude auth status --json` shows `authMethod: "claude.ai"`, `apiProvider: "firstParty"`, and a `subscriptionType`, with no model-endpoint override (`ANTHROPIC_BASE_URL`, cloud variants, or `CLAUDE_CODE_USE_*`). `assertClaudeSubscription` (`eval/lib/harness-guards.mjs`) enforces this before the first model call in every paid Claude harness using the child's env, cwd, and root settings/isolation flags (`--setting-sources ""`, `--disable-slash-commands`, `--safe-mode`, `--strict-mcp-config`, passed before `auth status`). |
| Codex | `codex login status` prints "Logged in using ChatGPT"; `OPENAI_API_KEY` unset. |
| Grok | Establish SuperGrok login interactively (no offline CLI check); `XAI_API_KEY` unset. |
| OpenCode | Run the probe below. |

**OpenCode probe** (always pass `--standalone` so OpenCode does not use a shared daemon on the default config; never use Anthropic through OpenCode—it is API-key only):

1. Set a private `XDG_CONFIG_HOME` whose `opencode.json` sets `enabled_providers` to `openai` (ChatGPT) or `xai` (SuperGrok), keeping the real data dir (`opencode.db`). Set `OPENCODE_DISABLE_PROJECT_CONFIG=1` and `OPENCODE_DISABLE_CLAUDE_CODE=1`.
2. `opencode auth list --standalone --format json`: read only `connections[].method` and verify it is `oauth` (never `key`; `type: "credential"` proves nothing).
3. `opencode models --standalone` lists only that provider and the exact model; no provider API key is set.

**Exceptions.** E1 (`scripts/run-playground-semantic-eval.mjs`, `npm run eval:playground`) and E2 (`scripts/run-demo-model-gauntlet.mjs`) answer through local `/playground/chat` (AI Gateway); E1 judges via subscription Claude Code. Route each question to the cheapest accurate path:

| Question | Path | Reason |
|---|---|---|
| Does a model route through the Playground's Gateway transport (slug, provider quirks, tool `strict` on xAI)? | E2 with `--models` | Gateway routing and AI SDK transport are unreachable from a CLI |
| Which model ID does the Gateway log for a configured model? | Saved receipt/log first ([`2026-11-03-sweep-probe-summary.md`](../research/gauntlets/2026-11-03-sweep-probe-summary.md)); else E2 with `--models` and `--max-budget-usd` | Observed IDs come only from the accounting header, not the launch plan |
| Does the route's cost accounting settle for a model? | Offline tests; live check only inside a real product run | `--max-budget-usd` is a cap, not a standalone cost test |
| Does each shipped model complete the stream and tool loop alone after a model-path change? | E2 default (shipped primary + fallback) | Verifies isolated per-model requests on test Gateway `stellar-raven-demo` with slug-only overrides |
| Should a candidate replace the Playground primary or fallback? | E2 on candidate, then paired E1 | Tests prompt, loop, caps, effort, temperature, and model together |
| Did a Playground-specific change (`DEMO_PREAMBLE`, caps, loop) move quality or plan? | Paired E1 (for plan-only, prefer matched stored traces where possible, else E1 `--no-judge` + `eval:plan`) | Exists only in Playground |
| Does a Gateway/Workers-AI-only model (e.g., Kimi) fit the Playground? | E2 then E1 | No subscription CLI exists |
| Which model family answers best, or how does it use `search` and `execute`? | Subscription QA runner and Codex/Grok `hc` lanes | MCP client and model decide it, not Playground |
| Did a tool description, MCP instruction, catalog, or executor change help or hurt answers? | Subscription QA first; add E1 only if changed text affects Playground-overridden constraints or matched stored transcripts show top-level MCP `search`/`execute` calls per answer crossing a Playground cap (count directly; `eval:plan`'s `searchQueries` also counts nested `codemode.search`) | MCP surface decides it; Playground shares text with its own caps |
| Does fallback hand-off, harness contract, or deployed Playground look healthy? | Free: offline tests, `--dry-run`, `--preflight`, Gateway log read (`cloudflare-observability-review`) | No model call needed |

**Sizing.** Both E1 and E2 require exactly one `--max-budget-usd` (no built-in default; missing flag refuses before spend). Caps stop the next call once reported spend reaches the limit—one in-flight call can overshoot ([`eval/playground/README.md`](playground/README.md#dollar-accounting)). Raising a default cap is the lead's call; record cap, reason, and cost in the ledger.

| Run | Default `--max-budget-usd` | Basis |
|---|---|---|
| E2 shipped-tuple gauntlet | 1 | 16 turns (primary + fallback alone, 8 prompts each), ~USD 0.40–0.45 measured; SDK retries off, 1 Gateway attempt/call, missing cost stops matrix |
| E2 one candidate model | 1 | 8 turns, ~USD 0.36 measured |
| E1 run | `ceil(0.20 * cases)`, min 2 (5→2, 30→6) | ~USD 0.11/case measured (30 cases: ~1.38 answer + ~2.02 judge) |
| One candidate, all in | E2 (1) + E1 30 cases (6) | ~USD 3.75 expected ([worked example](../research/audits/2026-11-10-playground-gpt61-terra-recheck.md)) |
| QA runner, re-judge, discovery (subscription) | Required, sized from stored runs (`run-evals` §5) | Existing cost guard |
| Judge self-test (subscription) | Fixed 7 calls × USD 0.50 | Existing cost guard |

1. **Shipped-tuple gauntlet (E2 default):** run only for model-path changes (`src/demo/model-config.ts`, request building in `src/demo/chat.ts`, `ai`/`@ai-sdk/*`/`workers-ai-provider`/`agents` or catalog ID bumps); `npm run test:smoke` gates other `src/demo` changes. For tuple changes, also run `test/demo-chat.test.ts` ("preserves each measured request in the shipped mixed tuple") and pin `--openai-api-mode` / `--reasoning-effort` when they differ from defaults. Check Gateway ID/setting changes post-deploy via `cloudflare-observability-review` (E2 forces its test Gateway).
2. **E1 sample:** 5 cases default, max 30 (`chatsPerHour` cap). Pair on identical IDs; reuse stored runs only when identities match; run both arms on one tree for prompt/loop changes.
3. **Model selection:** one candidate = E2 + paired E1 on shipped IDs; several candidates = E2 each, then paired screen + disjoint confirmation for the winner. Never run a full matrix. Haiku stays out of every eval except as Playground fallback ([roster](../.agents/model-roster.md#models-for-evals-and-tests)). See [`eval/playground/README.md`](playground/README.md) for lane contracts.

**Not exceptions:** runtime Playground (`src/demo/chat.ts`, `src/demo/eval-cost.ts`) and read-only Gateway log reads (`cloudflare-observability-review`) are not model-calling evals. CI, `test/smoke`, `test/live`, and `usage/` make no model calls. `test/model-call-billing.test.mjs` enforces the allowlist across code files, skills, and workflows.
