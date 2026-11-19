# Evaluation map

The QA evaluation measures whether an agent gives a correct, current answer through `search` and `execute`.
It is the headline measure. Other instruments test routing, discovery, tool use, or specific behavior.

Choose instruments to resolve the stated decision at proportionate cost and risk. Reuse compatible
stored results and accepted checks before collecting more. A bounded product comparison is distinct
from an all-model superiority study: predeclare its sample, acceptance and stopping rules, and keep
historical incomplete cohorts separate. The [run-evals skill](../.agents/skills/run-evals/SKILL.md)
owns this scoping and review workflow; required CI and release gates remain unchanged.

Scope each paid run with the [run-evals skill](../.agents/skills/run-evals/SKILL.md): it owns the decision, the smallest run, the stop
rule and the cost estimate. [Model-call billing](#model-call-billing) lists the API-billed exceptions.
The client set is in [the roster](../.agents/model-roster.md#models-for-evals-and-tests).

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

Evals, judging, testing and building run on subscription CLIs as `hc` children: Claude Code, Codex,
Grok, and OpenCode only after the probe below. There is no AI Gateway judge. AI Gateway or a provider
API is allowed only for an exception in this section. An API-billed path outside the list first
becomes a listed exception, with its reason in this section and, if code names the endpoint, its
entry in the allowlist in `test/model-call-billing.test.mjs`, in a reviewed pull request; then it runs
under a dollar cap. AI Gateway judging stays out without exception (owner, 2026-11-18). No run needs
anyone's approval: the checks below are automatic and a subscription run needs none of any kind
(`AGENTS.md`, "Spend and evidence").

**Pre-run billing checks.** Make each check before a paid lane. None makes a model call. Every CLI's
launch environment also has no provider API key set.

| CLI | Check |
|---|---|
| Claude Code | `claude auth status --json` shows `authMethod` `claude.ai`, `apiProvider` exactly `firstParty` and a `subscriptionType`, and the environment sets no model-endpoint override (`ANTHROPIC_BASE_URL` and its Bedrock, Vertex, Foundry, AWS, Google Cloud and Mantle variants, or a `CLAUDE_CODE_USE_*` provider switch). `assertClaudeSubscription` (`eval/lib/harness-guards.mjs`) enforces both once per paid entry point before its first model call: `run-qa.mjs`, `re-judge.mjs`, the judge self-test and its candidates, the discovery runner and the judge half of `npm run eval:playground`. It probes the way the child runs: the child's environment and working directory, and the root flags that change which settings load (`--setting-sources`, `--disable-slash-commands`, `--safe-mode`, `--strict-mcp-config`). `auth status` accepts them only before the subcommand. An API key, an auth token, a cloud provider or a Console login each refuse the run. Judges and answering agents launch with `--setting-sources ""` and load no settings file, and the probe uses the same flags, so a settings file cannot change the endpoint, the provider or the login they see. |
| Codex | `codex login status` prints "Logged in using ChatGPT", and `OPENAI_API_KEY` is unset. |
| Grok | `grok usage` cannot show the plan in this version, so no command checks the login offline. Establish the SuperGrok login interactively before launch, and keep `XAI_API_KEY` unset. |
| OpenCode | The probe below. |

**OpenCode probe.** OpenCode also holds API-key providers (Cloudflare AI Gateway, Workers AI,
OpenRouter), so restrict it to one subscription provider before any call. Pass `--standalone` on every
command: without it the CLI uses a shared background service that runs on the default config.

1. Set a private `XDG_CONFIG_HOME` only. Its `opencode.json` sets `enabled_providers` to the one
   provider: `openai` for ChatGPT or `xai` for SuperGrok. Keep the real data dir: the login lives in
   `opencode.db` there, and private data dirs remove it. Set `OPENCODE_DISABLE_PROJECT_CONFIG=1` and
   `OPENCODE_DISABLE_CLAUDE_CODE=1`.
2. `opencode auth list --standalone --format json`: that provider's `connections[].method` is `oauth`,
   never `key`. Read only the `method` fields; `type` is `credential` for every entry and proves
   nothing.
3. `opencode models --standalone` lists only that provider and lists the exact model.
4. No provider API key is set in the environment.

Anthropic through OpenCode is API-key only: never.

**Exceptions.** E1 (`scripts/run-playground-semantic-eval.mjs`, `npm run eval:playground`) and E2
(`scripts/run-demo-model-gauntlet.mjs`) answer through the local `/playground/chat` route, which calls
the model through AI Gateway. E1's judge half is Claude Code on the subscription. Each question goes
to the cheapest path that measures it accurately. A subscription CLI differs from the Playground in its
system prompt, tool presentation, tool-result clips, effort, temperature, loop limits and transport,
so it decides a question only when none of those differences is what the question measures.

| Question | Path | Reason |
|---|---|---|
| Does a model route through the Playground's Gateway transport (slug, provider quirks, tool `strict` on xAI)? | E2 with `--models` | Gateway routing and the AI SDK transport are not reachable from a CLI |
| Which model ID does the Gateway log for a configured model? | A matching saved receipt or log first ([`research/gauntlets/2026-11-03-sweep-probe-summary.md`](../research/gauntlets/2026-11-03-sweep-probe-summary.md) has exact IDs). Live: E2 with `--models` and a `--max-budget-usd` cap, then compare the observed IDs with the configured ID | E2 reports observed IDs only through the accounting header, and the launch plan prints the configured ID, which is independent of what the Gateway logged |
| Does the route's cost accounting settle for a model? | Offline tests. Live settlement only inside a product run that is happening anyway | `--max-budget-usd` is a cap and a measurement, not a separate cost test |
| Does each shipped model, run alone, complete the stream and tool loop after a model-path change? | E2 default: the shipped primary and fallback | The Playground route itself. It verifies isolated per-model requests on the configured test Gateway (`stellar-raven-demo`) with slug-only overrides |
| Should a candidate replace the Playground primary or fallback? | E2 on the candidate, then E1 paired | The decision is about the prompt, loop, caps, effort, temperature and model together |
| Did a Playground-specific change (`DEMO_PREAMBLE`, the caps, the tool loop) move answer quality or plan? | E1 on both arms. A plan-only question uses stored matched traces where possible, else E1 with `--no-judge` plus `npm run eval:plan`; run the judge only when the decision needs answer grades | `DEMO_PREAMBLE`, the caps and the loop exist only in the Playground |
| Does a model that only the Gateway or Workers AI reaches (such as Kimi) fit the Playground? | E2 and E1, as above | No subscription CLI exists |
| Which model family answers Raven questions best, or how does it use `search` and `execute`? | Subscription: the QA runner, and Codex and Grok `hc` lanes | The MCP client and model decide it, not the Playground |
| Did a tool description, MCP instruction, catalog or executor change help or hurt answers? | Subscription QA first. Add an E1 sample only when the changed shared text is about the constraint the Playground caps or overrides (call counts, step order, the search-evidence rule), or matched stored transcripts show the change moves top-level MCP `search` and `execute` calls per answer across a Playground cap. Count those calls directly: the plan report's `searchQueries` also counts searches nested inside `execute` | The MCP surface decides it; the Playground shares that text but adds its own caps |
| Does the fallback hand-off, the harness contract or a deployed Playground read healthy? | Free: offline tests, `--dry-run`, `--preflight`, and the Gateway log read in `cloudflare-observability-review` | No model call is needed |

Sizing. Each tier runs under the default cap below; record the run and its cost. A cap above a default
is the lead's call: the ledger row records the cap, the reason and the reported cost. Both lanes require
exactly one `--max-budget-usd` on every model-backed launch; there is no built-in default, so these are
documented defaults. Without the flag E2 prints its launch plan and refuses before any Wrangler work,
and E1 refuses before any request. A cap stops the next call once the reported spend reaches it; one
in-flight call can overshoot it (`eval/playground/README.md`, "Dollar accounting"), so size caps with
that headroom.

| Run | Cap (`--max-budget-usd`) | Basis |
|---|---|---|
| E2 shipped-tuple gauntlet | USD 1 | 16 turns, USD 0.40 to 0.45 measured. The capped path is stricter than production: SDK retries are off, each call gets one Gateway attempt, and a turn with no reported cost stops the matrix |
| E2 on one candidate model | USD 1 | Terra, 8 turns, USD 0.355 |
| E1 run | USD 0.20 per selected case, rounded up to a whole dollar, minimum USD 2 (5 cases: 2; 30 cases: 6) | About USD 0.11 per case measured (30 cases: answers 1.383 plus judge 2.016) |
| One candidate, all in | Two invocations: gauntlet 1, E1 on 30 cases 6; expected total USD 3.75; the ledger row records the sum | [2026-11-10 worked example](../research/audits/2026-11-10-playground-gpt61-terra-recheck.md) |
| QA runner, re-judge, discovery (subscription) | Required `--max-budget-usd`, sized from stored runs (`run-evals` section 5) | An existing cost guard |
| Judge self-test (subscription) | Its fixed 7 calls at USD 0.50 | An existing cost guard |

1. **Shipped-tuple gauntlet.** Primary and fallback, each alone, 8 prompts each: 16 turns, about USD 0.40
   to 0.45, run with `--max-budget-usd 1`. Run it for a model-path change only (`src/demo/model-config.ts`,
   the request building in `src/demo/chat.ts`, an `ai`, `@ai-sdk/*`, `workers-ai-provider` or `agents`
   bump, a catalog ID bump). `npm run test:smoke` gates other `src/demo` changes. The default verifies
   isolated per-model requests on the configured test Gateway (`stellar-raven-demo`) with slug-only
   overrides. For a tuple change, run the offline request-equivalence tests (`test/demo-chat.test.ts`,
   "preserves each measured request in the shipped mixed tuple") and pin `--openai-api-mode` and
   `--reasoning-effort` wherever the shipped tuple's mode or effort differs from the per-model default.
   E2 cannot verify a change of the Gateway ID or a Gateway setting, because it forces its own test
   Gateway; check those with the post-deploy Gateway log read in `cloudflare-observability-review`.
2. **E1 sample.** 5 cases by default, at most 30 (the `chatsPerHour` cap, not a target). Pair on the
   same case IDs. Reuse a stored run when its identities match; a prompt or loop change needs both
   arms on one tree.
3. **Model selection.** One candidate: the gauntlet plus one paired E1 run on the shipped model's case
   IDs. Several candidates: the gauntlet on each, then a paired screen and a disjoint confirmation for
   the one that advances. No full matrix, and no eval-client matrix through the Gateway.

Haiku is out of every test and eval except as the Playground fallback
([roster](../.agents/model-roster.md#models-for-evals-and-tests)). [`eval/playground/`](playground/README.md)
holds the contract for both lanes.

**Not exceptions.** The product's runtime is not an eval or a build step: `src/demo/chat.ts` calls AI
Gateway and Workers AI for the public Playground, and `src/demo/eval-cost.ts` reads Gateway logs for
the eval cost frame. The `cloudflare-observability-review` skill reads Gateway logs and Workers
telemetry through the Cloudflare API and makes no model call. CI, `test/smoke` (a mocked `AI`
binding), `test/live` and `usage/` make none.

`test/model-call-billing.test.mjs` fails when a code file, skill document or GitHub Actions workflow
outside the exceptions names a provider endpoint, an AI Gateway token, an `AI.run(` or `AI.gateway(`
call, the Playground chat route or an AI SDK import.
