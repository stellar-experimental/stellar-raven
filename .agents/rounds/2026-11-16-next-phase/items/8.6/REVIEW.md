# Item 8.6 plan review

Reviewer: Claude Fable (`claude-fable-5-2`), high effort, agentpc, 2026-11-18. Read-only. No model
call, no paid call. Tree: `np/8.6-subs-first` at `3e490ec5`.

## Verdict

The plan is sound and can go to the executor after two fixes. Finding 1 is blocking: the OpenCode
probe as written cannot run and its login check passes an API-key credential. Finding 2 changes the
shape of step 4. The rest are "should" or "nit".

Commands run: `codex exec --help`, `codex features list`, `codex login status`, `grok --help`,
`opencode run|models|auth|debug --help`, `opencode debug agents --standalone`,
`opencode auth list [--standalone] --format json` (values scrubbed), `opencode models --standalone`,
`claude --help`, `claude auth status --json`. OpenCode ran under private `XDG_*` dirs in the scratchpad
except where a finding says otherwise.

## What checked out

- **File and line references.** All hold at `3e490ec5`: the four gateway files and their line counts
  (233, 222, 228; the `.md` is 151), `orchestrate.mjs:14,390,470,491`,
  `test/playground-final-orchestrator.test.mjs:9,358`, `eval/qa/README.md:697-700`,
  `run-evals/SKILL.md:61-68`, `test/README.md:42`, `eval/EVALS.md:12-14`, `judge.mjs:625`,
  `run-qa.mjs:811`, `run-agent-discovery.mjs:260`, `AGENTS.md:94`.
- **No npm script** runs the gateway judge: `package.json` has no `gateway` string.
- **Importer list is complete.** Outside the four files, only `orchestrate.mjs:14` and
  `test/playground-final-orchestrator.test.mjs:9` import them. No other file reads
  `gateway-rejudge-v1`, `gateway-judge-budget-v1` or `gateway-judge-plan-v1`.
  `blind-packets.mjs:69-70` reads Judge B rows without importing the judge.
- **Stored verdicts stay readable.** Step 2 keeps both functions the receipt validator needs. The
  producer (`createGatewayJudge`, `runGatewayRejudge`, the CLI) goes. `orchestrate.mjs` builds no
  command line for the deleted CLI.
- **No dependency on the gateway judge** in `judge.mjs`, `re-judge.mjs`, `run-qa.mjs`, `lib.mjs`,
  `judge-stability.mjs` or `run-p6-judge-self-test.mjs` (zero `gateway` matches each).
- **Inventory.** I found no model-call path the table lacks. Checked and empty: `.github/workflows`
  (no model step; `ci.yml:98` says the self-test stays outside CI), `test/smoke` (mocked `AI`
  binding, or a 400 before the model), `test/live` (MCP only), `usage/`, and `src/` outside
  `src/demo` (the `AI` binding is used only in `src/demo/chat.ts`).
- **CLI table.** Versions match (`codex-cli 0.169.0`, `grok 1.0.88`, `opencode v2.3.0`). Codex has
  `--disable` and per-feature switches (`shell_tool`, `sleep_tool`, `skill_search`, `tool_suggest`,
  `browser_use`, `computer_use`, `apps`, `code_mode_host`) and no all-tools-off control. Grok's
  `--tools` text is "Built-in tools to allow (comma-separated)". I reproduced the OpenCode check: a
  `judge` agent with `permission: {"*": "deny"}` resolves to `* * deny` after the four defaults, the
  same shape as the built-in hidden `title` and `summary` agents.
- **Step 4 moves no pin.** Every environment identity hashes the runner's inherited environment
  (`run-qa.mjs:1792-1793`, `run-agent-discovery.mjs:467-468`, `judge.mjs:1023`), not the child's. No
  existing test asserts the whole spawn-options object, so adding `env` breaks none
  (`test/qa-harness-preconditions.test.mjs:273-303`, `test/qa-budget.test.mjs:120-142`).
- **Step 7.** The clause is at `AGENTS.md:94`, and the 8.4 ledger row says the roster already
  dropped the same exception.

## Findings

### 1. Blocking: the OpenCode probe cannot run as written, and its login check passes an API key

The probe text goes into `eval/EVALS.md`, the roster and the TODO item (steps 5 and 8). Three parts
are wrong on OpenCode v2.3.0.

- **Private `XDG_*` dirs remove the login.** With all four dirs private,
  `opencode auth list --standalone --format json` prints `[]` and `opencode models --standalone`
  prints nothing. There is no `auth.json`; credentials live in `opencode.db` under the data dir.
  With only `XDG_CONFIG_HOME` private and `enabled_providers: ["openai"]`, `opencode models
  --standalone` lists 34 models, all `openai/*`. So the provider restriction works, but only when
  the data dir is the real one.
- **The `type` field does not tell a subscription from a key.** In `opencode auth list --format
  json`, every entry has `connections[].type: "credential"`. The field that differs is
  `connections[].method`: `oauth` for OpenAI and xAI, `key` for Cloudflare AI Gateway, Cloudflare
  Workers AI and OpenRouter. A check on `type` passes all five.
- **`--standalone` is missing.** Without it the CLI uses the shared background service, which runs
  on the default config with every provider. Under private dirs, `opencode auth list` instead tried
  to start a second service and failed: "Managed service port 49374 ... is already in use".

Change: write the probe as follows, in the one owning doc, and point the roster and TODO at it.

1. Private `XDG_CONFIG_HOME` only, holding `enabled_providers` set to the one provider. Keep the
   real data dir. Set `OPENCODE_DISABLE_PROJECT_CONFIG=1` and `OPENCODE_DISABLE_CLAUDE_CODE=1`.
2. Pass `--standalone` on every command.
3. `opencode auth list --standalone --format json`: the provider's `connections[].method` is
   `oauth`.
4. `opencode models --standalone` lists only that provider, and lists the exact model.
5. No provider key in the environment.

### 2. Should: step 4 strips three variables; a positive check is available and catches more

`claude auth status --json` makes no model call and reports the billing mode. On agentpc:

| Environment | `authMethod` | Other |
|---|---|---|
| Clean | `claude.ai` | `subscriptionType: "max"` |
| `ANTHROPIC_API_KEY` set | `api_key` | `apiKeySource: "ANTHROPIC_API_KEY"` |
| `ANTHROPIC_AUTH_TOKEN` set | `oauth_token` | |
| `CLAUDE_CODE_USE_BEDROCK=1` | `third_party` | |

This confirms the plan's claim that either variable moves a run off the subscription. It also shows
two gaps in a strip list:

- `CLAUDE_CODE_USE_BEDROCK` is not on it. `claude --help` names Vertex and Foundry as the same kind
  of provider; I tested Bedrock only.
- A stored Console login survives any strip. The 2026-11-06 audit already required the positive
  form (`prior-cohort.mjs:60`: `authMethod === 'claude.ai'` and a `subscriptionType`).

A strip list has the weakness the plan names for Codex's feature list: it goes stale when a release
adds a switch.

Stripping also makes the record misleading. The artifact's `agentEnvironment.inherited.variableNames`
would list `ANTHROPIC_API_KEY` for a run whose child never received it.

Change: make step 4 a fail-closed precondition, in the style of `answeringAgentIsolationArgs`
(`eval/lib/harness-guards.mjs:68-78`, "refusing paid calls"). One function runs `<claude> auth status
--json` with the child's environment and throws unless `authMethod` is `claude.ai` and
`subscriptionType` is set. Call it once per paid run beside `executableIdentity`, with an injectable
implementation. The fake `claude` in three fixture files needs an `auth status` case
(`test/qa-harness-preconditions.test.mjs:522`, `test/discovery-paid-run-guards.test.mjs:44`, and the
self-test fixture).

If the lead judges that too large for this item: keep the strip, add the three cloud-provider
switches, write the `claude auth status` line into "Model-call billing" as the operator's pre-run
check, and put the code assertion in TODO.

Step 4's open question has a definite answer either way: no identity is computed from the child
environment, so no pinned fixture moves.

### 3. Should: the guard sees neither exception and misses the cheapest way to call a provider

- **Empty allowlist.** After step 3, no in-scope file matches any listed pattern. E1 and E2 reach
  the Gateway through the local `/playground/chat` route and Wrangler vars, so they match nothing. A
  new eval script that posts to that route would pass.
  Change: add `playground/chat` and `DEMO_AI_GATEWAY_ID`. Three files match today and form the
  allowlist: `scripts/run-playground-semantic-eval.mjs`, `scripts/run-demo-model-gauntlet.mjs` and
  `eval/playground/artifact-contract.mjs`.
- **Installed SDKs.** `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google` and
  `workers-ai-provider` are dependencies. A script that imports one and reads a provider key
  contains none of the URL strings.
  Change: add import-anchored patterns (`from "ai"`, `@ai-sdk/`, `from "workers-ai-provider`). No
  in-scope file matches today. Anchor on the import: `scripts/improvements-lib.mjs:15,23` and
  `scripts/improvements-lint.mjs:183` use `workers-ai-provider` as a plain service ID.
- **`.agents/skills/` checks nothing.** It has no file with a listed extension; skills are Markdown.
  Change: drop it from the stated scope, or scan `.md` there and allowlist
  `cloudflare-observability-review/SKILL.md` (one match, a log read).
- **Scope.** `usage/report-site` (9 code files) and `ecosystem-skills` (2) are outside it. Scanning
  every tracked code file outside `src/`, `test/`, `research/` and `.agents/rounds/` costs the same.

### 4. Should: keep the "A paid method needs its own written authorization" bullet

Step 5 would drop it "if the new text covers it". The new text covers API-billed runs only. The
bullet at `AGENTS.md:80-81` also governs paid subscription runs (DECISIONS.md answer 1: "No paid QA
run without a new written authorization") and holds the rule that a diagnostic budget does not
transfer. Change: state in the plan that the bullet stays.

### 5. Should: the roster row conflicts with a standing decision and names the wrong check

- **Standing decision.** DECISIONS.md:84-87 and the TODO item "Keep OpenCode out of client
  diagnostics" (`.agents/TODO.md:1046-1057`) keep OpenCode out. A row with the role "Add where it
  helps" in "Models for evals and tests" reads as admitting it to the client set, which the AGENTS.md
  "Eval and test models" bullet does not name.
  Change: give the row a role such as "Only when a decision names it". Update that TODO item in the
  same step: it cites OpenCode 2.2.7, and it should point at the probe so the two OpenCode items
  agree.
- **Family name.** Through OpenCode the model is GPT Terra or Sol, not a Codex client. Name the
  model family, not "Codex Terra".
- **Wrong check.** `opencode models --help` prints no model form. `opencode run --help` documents
  `--model` as `provider/model#variant`. The resolver reads the Codex and Grok catalog caches, and
  OpenCode keeps its own catalog, so the real check is that `opencode models --standalone` lists
  `openai/$M`. It does today: `openai/gpt-6.1-terra` and `openai/gpt-6.2-sol` are both listed. I did
  not check `xai/grok-4.7`.
- **Launch form.** The row needs `--standalone`, and `--agent <name>` when tool denial matters.

### 6. Should: three live references the plan does not list

- `.agents/skills/run-evals/references/source-addition.md:12` tells the reader to use "a second
  judge for each cross-arm grade difference". After this item the only second judge is another
  Claude family through `re-judge.mjs`. Say so there.
- `eval/playground/README.md:9` says both lanes are API-billed and that run-evals owns the spend
  rules. Point it at "Model-call billing" as E1 and E2.
- `.agents/skills/run-evals/SKILL.md:102` labels the Playground row "paid, API-billed". Add the
  pointer there too.

### 7. Nit: Codex and Grok lanes have no login check

The inventory row says "Subscription when the login is a subscription", and nothing checks it.
`codex login status` prints "Logged in using ChatGPT" with no model call. Change: add it to the
roster's Codex bullet. I found no equivalent Grok command in `grok --help`; say that in the roster
or leave Grok to the lane's first run.

### 8. Nit: step 2 details

- The `prepare` throw assertions are on line 363, not 362. Lines 359-360 hold the two `prepared`
  expectations, and 356-357 define the plan fixture that becomes unused.
- The removed assertions were the only place the partial-recovery source ran through a judge-plan
  preparer. Name in DISPOSITION.md what covers `partialRecoverySource` now (line 347 of the same
  test, and the `diagnostic-rejudge-source*` tests).
- `orchestrate.mjs` keeps `freeze-judge-b` and the `judge-b` reservation code. With no producer they
  are inert bookkeeping. One line in DISPOSITION.md should say so.

### 9. Nit: smaller corrections

- The guard skips "the three `.ignore` files", but only `eval/.ignore` and `eval/qa/.ignore` are
  inside its scope.
- `test/README.md` needs a row for `model-call-billing*`; step 3 only edits line 42.
- In the inventory, only `src/demo/chat.ts` calls the `AI` binding. `model-config.ts` and
  `output.ts` make no call, and `eval-cost.ts` calls `ai.gateway(id).getLog`.
- Add an inventory row for CI and the test lanes ("none"), so the owner sees they were checked.
- The dated-record list omits some files that mention the judge: the 8.4 item records,
  `items/1.1/REVIEW-RETIRE.md`, `2026-11-14-baseline-tuning/TUNE-DIFF-REVIEW.md`,
  `research/audits/2026-11-03-playground-model-sweep.md`,
  `research/audits/2026-11-09-playground-product-decision.md`,
  `research/audits/2026-11-06-main-only-cleanup/playground-sweep.patch` and
  `research/qa-deep-dive-2026-08-25/`. None plans a future gateway-judged run in the lines I read.

## Goals and questions from the 8.6 note

| Item | Status |
|---|---|
| Goal 1, remove the gateway judge, keep readers | Met (steps 2 and 3); see finding 8 |
| Goal 2, hard rule in AGENTS.md, list in one doc | Met (step 5); see finding 4 |
| Goal 3, exception list with reasons | Met; E1 and E2 are the only exceptions I found |
| Goal 4, OpenCode with the probe as a precondition | Not met until finding 1 is fixed; see finding 5 |
| Headline judge after this | Answered: Claude Sonnet on the Claude Code CLI |
| Self-test and stability register depend on the gateway judge? | Answered: no; verified |
| Any future gateway-judged run planned? | Answered: no; I found none |
| Mechanical guard | Present (step 6); see finding 3 |
| Second judge on a subscription | Answered; the recommendation stands once finding 1 is fixed |
| Drop the dated-brief clause | Step 7; correct |
| OpenCode roster row | Step 8; see findings 1 and 5 |
