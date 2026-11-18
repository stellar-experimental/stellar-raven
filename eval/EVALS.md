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
| [Playground](playground/README.md) | The public `/playground/chat` model and tool loop | Paid and API-billed through AI Gateway (exception E1 in [Model-call billing](#model-call-billing)); uses selected QA cases | Diagnostic; keep its denominator separate from MCP QA |
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
- [The run-evals skill](../.agents/skills/run-evals/SKILL.md) owns round coordination and required approval steps.

## Evaluation rules

1. Keep one headline and three routing gates. Keep all other instruments diagnostic unless an explicit decision changes their status.
2. Keep each instrument's denominator separate. Compare matched case IDs, case content, judge contracts, and service identities.
3. Fix general mechanisms. Do not tune the implementation to individual questions or alter failed holdout labels.
4. Grade volatile facts through behavioral goldens. Use the golden-truth workflow for changes to expected answers.
5. Edit source case files, then regenerate outputs. Never edit generated cases, samples, or lifecycle registries by hand.
6. Treat results as local evidence under ignored `results/` directories. Prune results older than 30 days after investigations end.
7. A comparison across a change of resolved model (answering or judge) is not like for like. A gate or QA baseline re-baselines when its resolved model changes. Eval defaults are family aliases, so every artifact records the exact ID that ran beside the alias requested. A new resolved judge model needs the paid seven-case self-test, under its own authorization, before its first headline judged run, and that run sets the new baseline.
8. Preserve dated evidence. A historical score does not establish current correctness or authorize another paid run.

When a round establishes an upstream defect, file or update evidence-backed findings in [improvements/](../improvements/README.md).
Record problems in this repository in [.agents/TODO.md](../.agents/TODO.md).
The [improvements workflow](../.agents/skills/improvements-pipeline/SKILL.md) defines evidence and status requirements.

Dated audit records live under [research/audits/](../research/audits/).

## Model-call billing

Evals, judging, testing and building run on subscription CLIs as `hc` children: Claude Code, Codex,
Grok, and OpenCode only after the probe below. There is no AI Gateway judge. AI Gateway or a provider
API is allowed only for an exception in this section. Any other API-billed run needs the owner's
written approval naming the run. A paid subscription run still needs its own written authorization
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

**Exceptions.** Each reaches a model only through the Playground's own transport.

| ID | Path | Reason | A subscription CLI instead? |
|---|---|---|---|
| E1 | `scripts/run-playground-semantic-eval.mjs` (`npm run eval:playground`) | It answers through the local `/playground/chat` route, which calls the model through AI Gateway. The subject under test is the Playground's own model and transport. Its judge half is Claude Code on the subscription. | No: a CLI would test a different client. |
| E2 | `scripts/run-demo-model-gauntlet.mjs` | The eight-case transport and tool-loop smoke test on the same route. | No, same reason. |

[`eval/playground/`](playground/README.md) holds the contract for both.

**Not exceptions.** The product's runtime is not an eval or a build step: `src/demo/chat.ts` calls AI
Gateway and Workers AI for the public Playground, and `src/demo/eval-cost.ts` reads Gateway logs for
the eval cost frame. The `cloudflare-observability-review` skill reads Gateway logs and Workers
telemetry through the Cloudflare API and makes no model call. CI, `test/smoke` (a mocked `AI`
binding), `test/live` and `usage/` make none.

`test/model-call-billing.test.mjs` fails when a code file, skill document or GitHub Actions workflow
outside the exceptions names a provider endpoint, an AI Gateway token, an `AI.run(` or `AI.gateway(`
call, the Playground chat route or an AI SDK import.
