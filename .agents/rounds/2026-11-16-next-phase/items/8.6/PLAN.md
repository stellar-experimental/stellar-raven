# Item 8.6 plan: subscriptions first, no AI Gateway judging

Lead: Claude Opus 5.5, agentpc `t1zf`. Branch `np/8.6-subs-first`, rebased onto `origin/main` at `3e490ec5` (#495, item 8.4, merged).
Binding: [8.6 note](/home/tyler/code/raven-wt/orch/8.6-NOTE.md), [7-COMMON](/home/tyler/code/raven-wt/orch/7-COMMON.md),
the orchestrator's two additions of 2026-11-18 (second judge on a subscription; AGENTS.md launch-line clause and the OpenCode roster row), and DECISIONS.md.

## Decision this item changes

Evals, judging, testing and building of the service run only on subscription CLIs as `hc` children.
AI Gateway and provider APIs are allowed only for a listed exception with its reason; anything else
needs the owner's written approval naming the run. The repository loses the ability to produce new
AI Gateway judge verdicts. Stored gateway verdicts stay readable as records.

No model call, paid call, Gateway call or Workers AI call in this item. No Worker byte changes
(`src/` is untouched).

## Facts re-checked on `b623d5ac`

- Gateway judge files: `eval/qa/gateway-judge.md`, `eval/qa/gateway-judge.mjs` (233 lines),
  `eval/qa/gateway-rejudge.mjs` (222), `test/gateway-judge.test.mjs` (228). **No npm script** runs them
  (the note expected some; there are none).
- Importers outside that set:
  - `research/audits/2026-11-06-playground-final-resolution/orchestrate.mjs:14` imports
    `isSettledJudgeRowFailure` and `gatewayJudgeConfig` from `gateway-judge.mjs`. They validate stored
    `gateway-rejudge-v1` receipts (lines 390, 470, 491). This is the only reader of stored gateway
    verdicts. The study is closed (`.agents/rounds/2026-11-09-playground-resumption.md`, "Current
    decision": "No more B collection or recovery is planned").
  - `test/playground-final-orchestrator.test.mjs:9,358` calls `prepareGatewayRejudge` inside one test
    ("verifies all25 source cases ... plans exactly two B calls"). That call exercises the producing
    path, not the reader.
- `eval/qa/diagnostic-rejudge-source.mjs` is imported by `re-judge.mjs` (the Claude re-judge) and the
  orchestrator. Its "Gateway" strings check the **Playground answer** cost proof, not a judge. It stays.
- `judge-stability.mjs`, `run-p6-judge-self-test.mjs`, `judge.mjs`, `run-qa.mjs`, `re-judge.mjs` and
  `lib.mjs` contain no gateway reference. The seven-case self-test and the stability register do not
  depend on the gateway judge (`gateway-judge.md` only reused the same seven fixtures for its own
  calibration).
- Live references to remove or rewrite: `eval/qa/README.md:697-700`, `.agents/skills/run-evals/SKILL.md:61-68`,
  `test/README.md:42` (`gateway-judge*`). `scripts/README.md` and `eval/EVALS.md` name no gateway judge
  (EVALS.md lines 12-14 point at run-evals for "the API-billed exceptions"). `.agents/TODO.md` has no
  gateway-judge item.
- No TODO item, ledger or current brief plans a future gateway-judged run. Dated records that describe
  past Judge B / gateway runs (list only, not edited): `.agents/rounds/2026-11-03-playground-model-sweep.md`,
  `.agents/rounds/2026-11-06-playground-final-resolution.md`, `.agents/rounds/2026-11-06-playground-resume.md`,
  `.agents/rounds/2026-11-09-playground-resumption.md`, `.agents/rounds/2026-11-06-main-only-cleanup/playground-review.md`,
  `research/audits/2026-11-06-playground-final-resolution/`, `research/audits/2026-11-03-playground-model-sweep.md`,
  `research/audits/2026-11-09-playground-product-decision.md`,
  `research/audits/2026-11-06-main-only-cleanup/playground-sweep.patch`, `research/qa-deep-dive-2026-08-25/`,
  `.agents/rounds/2026-11-14-baseline-tuning/TUNE-DIFF-REVIEW.md`, and items 1.1 (`REVIEW-RETIRE.md`),
  8.2, 8.3 and 8.4 of this round, which cite the files as they stood.
- Nothing in `eval/` or `scripts/` strips `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN` before it spawns
  `claude -p` (judge `judge.mjs:625` via `buildJudgeEnv`, answerer `run-qa.mjs:811` `buildAgentSpawn`,
  discovery `run-agent-discovery.mjs:260`). With either variable set, a "subscription" run bills the API.

## Model-call inventory and exception list

| Path | Calls | Class | Disposition |
|---|---|---|---|
| `src/demo/chat.ts` (config in `model-config.ts`, `output.ts`, which make no call) | AI Gateway (`AI.gateway(id).run`) and Workers AI (`AI.run`) | Product runtime: the public Playground | Allowed; not an eval |
| `src/demo/eval-cost.ts` | `ai.gateway(id).getLog` for the eval cost frame | Product runtime | Allowed; no model call of its own |
| `scripts/run-playground-semantic-eval.mjs` (`npm run eval:playground`) | Answers through the local `/playground/chat` route, which calls the Gateway; judges with `eval/qa/judge.mjs` (Claude Code CLI, subscription) | Test of the product that reaches the product's models only through the Gateway | **Exception E1.** A subscription CLI cannot stand in: the subject under test is the Playground's own model and transport. The judge half is already subscription |
| `scripts/run-demo-model-gauntlet.mjs` (8.4 owns) | Same route, transport and tool-loop smoke | Same as E1 | **Exception E2**, same reason |
| `eval/playground/` | Contract and guide for E1/E2 | Docs and validator | Follows E1/E2 |
| `eval/qa/gateway-judge.mjs`, `gateway-rejudge.mjs` | OpenAI Responses through AI Gateway | Eval judging | **Removed** by this item |
| `research/audits/2026-11-06-playground-final-resolution/` | None at runtime (offline accounting of a closed study) | Dated record | Keeps reading stored receipts (step 2) |
| `.agents/skills/cloudflare-observability-review` | Reads Gateway logs and Workers telemetry through the Cloudflare API | Observability read, no model call | Not a model-call path; no change |
| `usage/`, `.github/workflows` (CI), `test/smoke` (mocked `AI`), `test/live` (MCP only) | None | — | Checked; no change |
| QA runner, judge, re-judge, self-test, discovery agent arm, agentic workflow | Claude Code CLI (`claude -p`) | Subscription | Standard path; step 4 hardens it |
| Codex, Grok, OpenCode lanes | Their CLIs | Subscription when the login is a subscription | Standard path; OpenCode needs the probe below |

The exception list lives in `eval/EVALS.md` (new section "Model-call billing"), linked from AGENTS.md
and run-evals. E1 and E2 are the only standing exceptions. The product's own runtime is not an
exception because it is not an eval or a build step.

## Second, non-Claude judge on a subscription (orchestrator addition)

The gateway judge exists because the Codex CLI could not be shown tool-blind (#387). Offline checks
on agentpc, 2026-11-18, from each CLI's own help and resolved config, no model call:

| CLI | Version | Documented tool control | Tool-blind? |
|---|---|---|---|
| Codex | `codex-cli 0.169.0` | `codex exec --help`: `--disable <FEATURE>` and `-c` overrides. `codex features list` has per-tool switches (`shell_tool`, `browser_use`, `computer_use`, `apps`, `code_mode_host`, `sleep_tool`, `skill_search`, `tool_suggest`, ...) but no single all-tools-off control | **No.** A deny-list of features goes stale when a release adds a tool. The #387 finding stands |
| Grok | `grok 1.0.88` | `grok --help`: `--tools <TOOLS>` "Built-in tools to allow" (an allowlist), `--disallowed-tools`, `--deny <RULE>`, `--disable-web-search`, `--no-subagents`, `--no-plan` | **Unproven.** Help does not say what an empty `--tools` means, and user MCP servers still load. Settling it needs a subscription smoke |
| OpenCode | `opencode v2.3.0` | Agent `permission` rules. Checked offline: a scratch config with `agent.judge.permission = {"*": "deny"}` under private `XDG_*` dirs; `opencode debug agents --standalone` resolves the judge agent with `{"action":"*","resource":"*","effect":"deny"}` after the defaults, plus browser denies. `--auto` approves only what is not explicitly denied | **Yes at the execution boundary, offline-verified in config.** Denied calls never execute. The tool definitions may still reach the model; a run is also checked after the fact (no tool part in `opencode.db`) |

Agentpc's OpenCode also holds Cloudflare AI Gateway, Workers AI and OpenRouter credentials
(`opencode auth list`, names only). An OpenCode judge must therefore set `enabled_providers` to the one
subscription provider (`openai` for ChatGPT or `xai` for SuperGrok) and confirm that provider's stored
login is a subscription login (`connections[].method` is `oauth`, from `opencode auth list --standalone --format json`) before any call; the full probe is in step 5.

**Recommendation: no second judge now; OpenCode on the ChatGPT subscription when a decision needs one.**
No current decision needs judge-vendor diversity: the headline judge is Claude Sonnet on the Claude
Code subscription, and its pending seven-case self-test (TODO "Run the judge self-test on the
resolved judge model") is single-judge. Building an adapter now would be unmeasured code. Step 5 writes
a TODO item with the verified OpenCode configuration, the preconditions (offline `debug agents`
check, the probe, the seven self-test fixtures as calibration under their
own authorization, and the after-run no-tool-part check) and the trigger. Codex stays unsupported;
Grok is the fallback candidate if OpenCode's smoke fails.

## Steps

1. **DECISIONS.md.** Add "Follow-up answers (2026-11-18, subscriptions first)" with the owner's
   instruction verbatim (from the 8.6 note), the standing OpenCode rule quoted from answer 7, and a
   line that item 8.6 applies it. File: `.agents/rounds/2026-11-16-next-phase/DECISIONS.md`.
2. **Keep the stored-receipt reader.** Create
   `research/audits/2026-11-06-playground-final-resolution/gateway-receipt.mjs` holding verbatim copies
   of `isSettledJudgeRowFailure` (with its `ROW_FAILURES` set) and `gatewayJudgeConfig` (with
   `finiteCost`), headed by one line: frozen reader for stored `gateway-rejudge-v1` receipts; the
   producer was removed in round item 8.6. Point `orchestrate.mjs:14` at it. In
   `test/playground-final-orchestrator.test.mjs`, drop the import (line 9) and the
   `prepareGatewayRejudge` use inside the "verifies all25 source cases" test (the plan fixture at
   356-357, `prepare` at 358, the `prepared` expectations at 359-360, the `prepare` throws at 363); keep its `verifySourceCases` assertions and
   rename the test to drop "plans exactly two B calls".
3. **Delete the producer.** `git rm` `eval/qa/gateway-judge.md`, `eval/qa/gateway-judge.mjs`,
   `eval/qa/gateway-rejudge.mjs`, `test/gateway-judge.test.mjs`. Update `test/README.md:42` (drop
   `gateway-judge*`). Write `items/8.6/DISPOSITION.md`: each removed file, its last commit, and what
   covers its job now (judging: `judge.mjs` on the Claude Code CLI; second judge: the TODO item from
   step 5; stored receipts: `gateway-receipt.mjs`; offline tests of the reader: the orchestrator test).
   Also name what covers `partialRecoverySource` after the step-2 assertions go (line 347 of the same
   test and the `diagnostic-rejudge-source*` tests), and note that `orchestrate.mjs`'s
   `freeze-judge-b` and `judge-b` reservation code is now inert bookkeeping for a closed study.
   All four files are in git history; nothing needs the `~/backups` archive.
4. **Claude Code runs must be on the subscription (fail closed)** (review 2). Add
   `assertClaudeSubscription({ claudePath, env, impl })` to `eval/lib/harness-guards.mjs`, beside
   `answeringAgentIsolationArgs`. It runs `<claude> auth status --json` (no model call) with the
   environment the child will get, and throws unless `authMethod === "claude.ai"` and
   `subscriptionType` is a non-empty string. Precedent: `prior-cohort.mjs:60`. Call it once per paid
   run, beside `executableIdentity`, in every runner that spawns `claude -p` for answers or judging:
   `eval/qa/run-qa.mjs`, `eval/qa/re-judge.mjs`, `eval/qa/run-p6-judge-self-test.mjs`,
   `eval/discovery/run-agent-discovery.mjs`, and the judge half of
   `scripts/run-playground-semantic-eval.mjs` (skipped with `--no-judge`). The implementation is
   injectable for tests. Give the fake `claude` in the fixtures an `auth status` case
   (`test/qa-harness-preconditions.test.mjs:522`, `test/discovery-paid-run-guards.test.mjs:44`, the
   self-test fixture, and any other fake the suite shows). Add tests: `claude.ai` + subscription passes;
   `api_key`, `oauth_token`, `third_party`, missing `subscriptionType`, non-zero exit and bad JSON each
   refuse before any paid call. No environment strip: the record's inherited variable names stay
   truthful. No identity pin moves (identities hash the runner's environment, review "What checked
   out").
5. **Docs and rules.**
   - `AGENTS.md` "Spend and evidence": replace the "Run here, on `hc`, first" bullet with a bold hard
     rule, kept to about five lines: evals, judging, testing and building run on subscription CLIs as
     `hc` children (Claude Code, Codex, Grok, OpenCode only with a probed subscription provider, never
     OpenCode on API keys); AI Gateway or a provider API only for an exception listed in
     `eval/EVALS.md` "Model-call billing", with its reason; any other API-billed run needs the owner's
     written approval naming the run. The bullet "A paid method needs its own written
     authorization" (`AGENTS.md:80-81`) stays: it also governs paid subscription runs (review 4).
   - `eval/EVALS.md`: new section "Model-call billing" with the standard path, E1 and E2 with reasons,
     the not-an-exception rows (product runtime, observability reads), the pre-run billing checks
     (Claude: `claude auth status --json` shows `authMethod` `claude.ai`, enforced by step 4; Codex:
     `codex login status` prints "Logged in using ChatGPT"; Grok: no offline check in `grok --help`,
     the lane's first run records it), and "no AI Gateway judging". The **OpenCode probe** (review 1),
     every command with `--standalone`: (1) a private `XDG_CONFIG_HOME` only, whose `opencode.json` sets
     `enabled_providers` to the one subscription provider; keep the real data dir (the login lives in
     `opencode.db` there); set `OPENCODE_DISABLE_PROJECT_CONFIG=1` and `OPENCODE_DISABLE_CLAUDE_CODE=1`;
     (2) `opencode auth list --standalone --format json`: that provider's `connections[].method` is
     `oauth` (never `key`; `type` is `credential` for every entry and proves nothing); (3)
     `opencode models --standalone` lists only that provider and lists the exact model; (4) no provider
     key in the environment. Anthropic through OpenCode is key-only: never. Fix lines 12-14 and the
     Playground row to point at it.
   - `.agents/skills/run-evals/SKILL.md` section 2: rewrite the "Run here, on `hc`" bullet to point at
     the EVALS.md section; remove the gateway-judge sentence; state that judges run on the Claude Code
     CLI and that a second judge follows the TODO item.
   - `eval/playground/README.md:9` and `.agents/skills/run-evals/SKILL.md:102`: point at "Model-call
     billing" E1/E2 (review 6).
   - `.agents/skills/run-evals/references/source-addition.md:12`: the second judge for a cross-arm
     grade difference is another Claude family through `re-judge.mjs` (review 6).
   - `eval/qa/README.md:697-700`: replace the paragraph with two sentences: judging runs on the Claude
     Code CLI; there is no AI Gateway judge (round item 8.6); a non-Claude second judge follows the TODO
     item.
   - `.agents/TODO.md`: add "Build a subscription second judge on OpenCode when a decision needs one"
     with the table facts above, the probe by reference, `--agent <judge>` with `{"*":"deny"}`, the
     seven self-test fixtures as calibration under their own authorization, the after-run no-tool-part
     check, trigger and done-when. Update "Keep OpenCode out of client diagnostics"
     (`.agents/TODO.md:1046-1057`): it cites v2.2.7; point it at the probe so both items agree.
6. **Mechanical guard (cheap)** (review 3). Add `test/model-call-billing.test.mjs`. It lists tracked
   code files (`.mjs .js .cjs .ts .mts .sh`) with `git ls-files`, excluding `src/`, `test/`,
   `research/`, `.agents/rounds/` and every entry in `eval/.ignore` and `eval/qa/.ignore`, plus the
   `.md` files under `.agents/skills/`. It fails if a file outside the allowlist matches
   `gateway.ai.cloudflare.com`, `CF_AIG_TOKEN`, `cf-aig-`, `AI.gateway(`, `.gateway(` + `getLog`,
   `api.openai.com`, `api.anthropic.com`, `api.x.ai`, `openrouter.ai`, `/ai/run`, `playground/chat`,
   `DEMO_AI_GATEWAY_ID`, or an import of `ai`, `@ai-sdk/*` or `workers-ai-provider` (anchored on
   `from "…"` / `import("…")`, since `improvements-lib.mjs` and `improvements-lint.mjs` use
   `workers-ai-provider` as a plain service ID). Allowlist, each entry with a comment naming its
   EVALS.md exception or reason: `scripts/run-playground-semantic-eval.mjs` (E1),
   `scripts/run-demo-model-gauntlet.mjs` (E2), `eval/playground/artifact-contract.mjs` (E1/E2 contract),
   `.agents/skills/cloudflare-observability-review/SKILL.md` (log read). Adjust to what actually
   matches; a stale allowlist entry that no longer matches also fails. On failure it prints path and
   pattern, never the line. Show it passes on the tree and fails on a planted temporary file. Add its
   row to `test/README.md` (review 9).
7. **AGENTS.md launch-line clause.** In "Spend and evidence", drop "a dated brief's explicit launch
   line stays as written" (`AGENTS.md:94`): since #495 the roster and dated briefs use the family
   resolver form, so the clause contradicts them. Keep the rest of that sentence.
8. **OpenCode roster row** (`.agents/model-roster.md`, this row, its bullet and the Codex login
   bullet only; 8.4 is closed) (review 5, 7). In "Models for evals and tests" add:
   `| Only when a decision names it | GPT Terra or Sol, or Grok, through OpenCode | OpenCode | --standalone -m openai/$M or -m xai/$M (M from scripts/latest-model.mjs <terra|sol|grok>), --agent <name> where tools must be denied |`
   and one bullet: OpenCode runs only after the probe in `eval/EVALS.md` "Model-call billing", and
   `opencode models --standalone` must list `<provider>/$M` (OpenCode keeps its own catalog); OpenCode
   stays out of client diagnostics (TODO "Keep OpenCode out of client diagnostics"). Add to the Codex
   launch bullet: check `codex login status` prints "Logged in using ChatGPT" before a paid lane.
9. **Ledger row** in `.agents/rounds/2026-11-16-next-phase.md` (lead adds after verification).

Out of scope: `scripts/run-demo-model-gauntlet.mjs` and `src/demo/model-config.ts` (no change needed).

## Gates

`npm run typecheck`, `npm test`, `npm run build`, `npm run eval:selftest`,
`npm run secrets:scan -- --tree`, each run bare. `dist/server.js` byte-compared with `origin/main`
(expected identical). No `test:smoke`: `src/` is untouched. No QA lint, no model-calling command.

## Reviews

- Fable plan review (`8.6-review`) writes `items/8.6/REVIEW.md`.
- Sonnet executor (`8.6-exec`) writes `items/8.6/EXEC.md` and commits.
- Codex diff review, latest Sol (`scripts/latest-model.mjs sol` resolved `gpt-6.2-sol` today), high
  effort, writes `tmp/8.6-codex-review.md`, copied to `items/8.6/CODEX-REVIEW.md`. Executor reconciles.

## Stop rule

Stop and report if: a stored-verdict reader other than `orchestrate.mjs` turns out to need the deleted
code; step 4 moves a pinned identity in a way that would invalidate stored results; or any step would
need a model call. No step here calls a model.

## Risks

- Other items may touch DECISIONS.md and the round ledger. Keep edits to a new section and one row.
- Step 4 refuses every paid Claude run that is not on the claude.ai subscription, including one with
  `ANTHROPIC_API_KEY` set or a Console login. That is the intended behavior.
- The guard test is a deny-list of strings; it catches the obvious forms, not every API client.

## Needed from the orchestrator or owner

## Review reconciliation

Fable review (`REVIEW.md`, `claude-fable-5-2`, high): all nine findings adopted. 1 (blocking, OpenCode
probe) in step 5; 2 (positive subscription check instead of a strip) in step 4; 3 (guard scope,
allowlist, SDK imports) in step 6; 4 (keep the paid-authorization bullet) in step 5; 5 and 7 (roster
row role, family name, catalog check, Codex login) in steps 5 and 8; 6 (three more live references)
in step 5; 8 and 9 (test line numbers, disposition notes, inventory rows, dated-record list) in steps
2, 3, 6 and the facts.

## Needed (continued)

- Owner (in the report, no block): confirm "no second judge now; OpenCode on ChatGPT when needed".
