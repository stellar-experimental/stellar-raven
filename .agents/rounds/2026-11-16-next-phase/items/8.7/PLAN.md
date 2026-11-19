# Item 8.7 plan: subscriptions or AI Gateway for each Playground test question

Lead: Claude Opus (`claude-opus-5-5`), agentpc `t1zn`. Branch `np/8.7-playground-billing` from
`origin/main` at `48f034d3` (#496). Binding notes: the orchestrator's `8.7-NOTE.md` and
`7-COMMON.md`. Revision 2: reconciles the Fable review ([REVIEW.md](REVIEW.md), 17 findings); the
table at the end says what happened to each.

## Decision this item changes

Which billing path each Playground test question uses. Today `eval/EVALS.md` "Model-call billing"
lists E1 (`npm run eval:playground`) and E2 (the demo gauntlet) as blanket exceptions ("No: a CLI
would test a different client"), and the gauntlet's default matrix is the three *eval clients*
(Sonnet, Terra, Grok) through AI Gateway. The owner wants each question on the cheapest path that
measures it accurately: subscriptions where the question is about the model or the Raven tool
surface, AI Gateway only where it is about the Playground product.

## Facts re-checked on `48f034d3`

- Shipped Playground tuple: primary `DEMO_CATALOG_LATEST.terra` (`openai/gpt-6.1-terra`), fallback
  `DEMO_CATALOG_LATEST.haiku` (`anthropic/claude-haiku-5.5`), effort `none`, temperature 0.1
  (`src/demo/model-config.ts:19-40`). `DEMO_GROK_CONTROL_MODEL` is exported and read by tests only.
- The Playground system prompt is `SERVER_INSTRUCTIONS` plus `DEMO_PREAMBLE` (`src/demo/prompt.ts:28`).
  Tools are the exported MCP descriptions and schemas plus a demo evidence appendix, through AI SDK
  `tool()` with `strict: false` (`src/demo/tools.ts:301-304,441-444`). Caps (`src/demo/budget.ts:21-51`):
  7 steps with the final one tool-free, 3 `search` and 3 `execute` calls and 6 tool steps per turn,
  search limit 6, 4096 output tokens, history 20 messages / 24,000 chars, 30 chats per hour.
- Gauntlet `DEFAULT_MODELS` = `anthropic/claude-sonnet-5.5`, Terra, Grok
  (`scripts/run-demo-model-gauntlet.mjs:88-92`); `test/demo-model-config.test.ts:82-88` pins "three eval
  clients and no Haiku". The Worker never uses Sonnet; the shipped fallback is not in the default. Each
  gauntlet model runs alone on its own server (`DEMO_MODEL_OVERRIDE:${model}`, lines 239-245), so the
  gauntlet never exercises the hand-off.
- `.agents/model-roster.md:49-50` already says Haiku is out of every test and eval except as "the
  Playground fallback model". No owner question needed.
- Subscription paths that exist: `eval/qa/run-qa.mjs` (Claude Code, `--model`); Codex and Grok as `hc`
  lanes with the roster launch lines (no committed runner; item 4.1 ran both against `dev:eval`). Kimi
  and other Workers AI models have no subscription CLI.
- Measured Gateway cost: gauntlet 8 turns on Terra USD 0.355
  (`research/audits/2026-11-10-playground-gpt61-terra-recheck.md:29-31`); Haiku USD 0.101 for 16 turns
  (`research/audits/2026-11-09-playground-product-decision.md:74`); 30-case semantic answers USD 1.38
  against a USD 2.02 subscription judge, gauntlet plus paired run USD 3.75 all in (recheck, line 84).
  The 2026-11 full matrix (1,616 cells) was superseded as incomplete; a 16-case screen plus a 24-case
  confirmation decided the fallback instead.
- CLIs on agentpc: `codex-cli 0.169.0`, `grok 1.0.88`, Claude Code 2.1.328, `opencode v2.3.0`.

## Step 1. Inventory: question → path

| # | Question | What decides it | Path |
|---|---|---|---|
| Q1 | Does a model route through the Playground's Gateway transport (slug, passthrough or run path, provider quirks such as Kimi's temperature, the tool `strict` field on xAI, the Gateway logging the model under the configured ID for non-OpenAI vendors)? | Gateway routing and the AI SDK transport, which no CLI touches. The same model went from 0/8 to 8/8 on an SDK bump alone (2026-11-10 recheck) | **Gateway**: E2 with `--models` |
| Q2 | Does each shipped model, run alone, complete the SSE stream and tool loop after a model-path change? | The Playground route itself | **Gateway**: E2 default (the shipped tuple) |
| Q3 | Should a candidate replace the Playground primary or fallback? | The product configuration: Playground prompt + loop + caps + effort `none` + temperature + the model together | **Gateway**: E2 on the candidate, then E1 paired |
| Q4 | Did a Playground prompt, preamble, tool-loop or cap change move answer quality or plan? | `DEMO_PREAMBLE`, caps and the loop exist only in the Playground | **Gateway**: E1 on both arms on one tree; plan regrade (`npm run eval:plan`) free |
| Q5 | Does the eval-cost frame settle Gateway costs? | Gateway log API | Offline mocks (free); live only inside a Q1 to Q4 run, never its own run |
| Q6 | Does the fallback hand-off keep history, budget and per-attempt effort? | The chat handler | **Free**: offline tests; no live instrument exists (the gauntlet runs each model alone) |
| Q7 | Does the harness and artifact contract hold (selection, cookie, generation, round caps, artifacts)? | Harness code | **Free**: `test/playground-*`, `--dry-run`, `--preflight`, `--print-generation` |
| Q8 | Is the deployed Playground healthy after a deploy? | Production Gateway logs | **Free of model calls**: Gateway log read through the `cloudflare-observability-review` skill (as the 2026-11-10 production check did) |
| Q9 | Which model family answers Raven questions best through MCP; how does a family use `search`/`execute`? | The MCP client and model, not the Playground | **Subscription**: QA runner (Claude), Codex and Grok `hc` lanes |
| Q10 | Did a tool description, MCP instruction, catalog or executor change help or hurt answers? | The MCP surface | **Subscription** QA run is the verdict. Add an E1 sample (Q4) only on the trigger below |
| Q11 | A model only reachable through Workers AI or the Gateway (Kimi, other catalog-only models) for the Playground | No subscription exists | **Gateway**, as Q1/Q3 |

Q10 trigger (free to evaluate): add the E1 sample only when (a) the changed shared text is about call
counts, step order or the search-evidence rule, which the Playground caps or overrides, or (b) the
stored subscription QA transcripts (`npm run eval:plan`, free) show the change moves tool calls per
answer past the Playground caps (3 `search`, 3 `execute`, 6 tool steps).

What the old gauntlet default did, and what guards it now: it never measured which family answers
best (the gauntlet "does not establish factual answer quality", `eval/playground/README.md:3`). It
smoke-tested live routing of three slugs. Once Sonnet and Grok leave the default, their live routing
goes unseen by default. It is guarded by the transport unit tests (`test/demo-model-config.test.ts`)
and by `--models` on demand (the xAI `strict` TODO names it). Sonnet is not a Playground model, so
nothing a user sees depends on its slug.

## Step 2. Accuracy check of the subscription substitute

What differs between Terra in Codex, Haiku in Claude Code or Grok in the Grok CLI and the same model
in the Playground:

- System prompt: the CLI's own agent prompt, with `SERVER_INSTRUCTIONS` delivered (or clipped) as MCP
  instructions (item 4.1: Codex reached the descriptions fully on 9 of 24 rows); no `DEMO_PREAMBLE`.
- Tool presentation: MCP tool listing by the CLI, plus the CLI's own shell, web and file tools; the
  Playground has only `search` and `execute` through AI SDK `tool()` with the demo appendix.
- Tool results: the Playground clips hit descriptions, clamps the search limit to 6 and refuses calls
  past the per-turn caps; each CLI applies its own MCP result clip (TODO, Grok's 20,000-byte clip).
- Effort: the Playground ships `none`, mapped to adaptive thinking at `low` for Claude models
  (`src/demo/model-config.ts:161-171`); the CLIs' settings differ (Codex ran `low` in 4.1).
- Temperature: the Playground pins 0.1; the CLIs use vendor defaults.
- Loop and budgets: 7 steps, a tool-free final step, per-turn caps and 4096 output tokens versus the
  CLIs' unbounded loops and larger output limits.
- Transport, model ID and refusals: Gateway passthrough or run path with SDK retries off for eval
  accounting, versus the vendor's first-party endpoint. Provider refusals were Gateway observations
  (Sonnet's content filter on 2026-11-09, the OpenAI cyber-safety refusal on 2026-11-10).

At least one of these differences is what each of Q1 to Q4 and Q11 measures, so a subscription run
would not decide them: they stay on the Gateway. For Q9 and Q10 the Playground differences are noise,
so the subscription run decides them as well or better. A subscription pre-screen for Q3 is **not**
adopted: no evidence shows that a CLI's ranking survives the Playground's effort `none`, temperature
0.1 and 7-step budget, and a mis-dropped candidate would change the decision.

## Step 3. Policy rewrite (docs and headers)

Files: `eval/EVALS.md` "Model-call billing" (the exception table becomes a short question → path table
with reasons; the Instruments row for the Playground names E1 and E2 and links it);
`.agents/skills/run-evals/SKILL.md` section 2 bullet and the section 3 "Playground model or prompt" row
(timeless text, no item numbers or dates, and never the literal chat route string, which
`test/model-call-billing.test.mjs` refuses in skill Markdown; link the README instead);
`eval/playground/README.md` (billing paragraph, gauntlet default, the hand-off note, "Comparing
candidate models" sizing); header comments of `scripts/run-playground-semantic-eval.mjs` and
`scripts/run-demo-model-gauntlet.mjs`. E1 and E2 stay the two exceptions, scoped to Q1 to Q5 and Q11.
`eval/EVALS.md` links the roster for the Haiku exception instead of restating it.

Sizing rule. Every tier needs its own written authorization (AGENTS.md); none is standing.

1. **Shipped-tuple gauntlet** (Q2): primary and fallback, each alone, 8 prompts each, 16 turns, about
   USD 0.40 to 0.45 (Terra USD 0.355 per 8 turns; Haiku about USD 0.05 per 8). Run with
   `--max-budget-usd 1`. Trigger: a model-path change only: `src/demo/model-config.ts`, the request
   building in `src/demo/chat.ts`, an `ai`, `@ai-sdk/*`, `workers-ai-provider` or `agents` bump, a
   catalog ID bump, or a Gateway setting. Other `src/demo` changes are gated by `npm run test:smoke`.
2. **E1 sample** (Q4, Q10 trigger): default 5 cases; at most 30 (the `chatsPerHour` cap, not a target).
   Pair on the same case IDs. Reuse a stored shipped-tuple run when its identities match; a prompt or
   loop change needs both arms on one tree.
3. **Model selection** (Q3): one candidate: gauntlet plus one paired E1 run on the shipped model's case
   IDs (the 2026-11-10 design, USD 3.75 all in). Several candidates: gauntlet each, then a paired screen
   and a disjoint confirmation for the one that advances (the 2026-11-09 design). No full matrix.
4. **No Gateway run for Q9 or Q10** (outside the Q10 trigger), and no eval-client matrix through the
   Gateway.

## Step 4. Code (small; no `src/` change)

- `scripts/run-demo-model-gauntlet.mjs`: import `DEMO_MODELS` (drop the now-unused
  `DEMO_CATALOG_LATEST` import); `DEFAULT_MODELS = DEMO_MODELS.map(({ model }) => model)` (primary, then
  fallback), so a tuple change moves the smoke with it. The Sonnet literal goes. Header: the "three
  evaluation clients" paragraph becomes "the shipped tuple, each model alone; not a hand-off test";
  "a full run of the default matrix is 24 turns" becomes 16; add dated observations for the new members
  (Haiku 16/16 on 2026-11-09, `gpt-6.1-terra` 8/8 on 2026-11-10) beside the existing ones, per the
  header's own "a slug that has not been probed does not belong in the default".
- `test/demo-model-config.test.ts`: the test asserts `GAUNTLET_DEFAULT_MODELS` equals
  `[DEMO_PRIMARY_MODEL, DEMO_FALLBACK_MODEL]` (a literal creeping back fails it).
- No new runner. `test/model-call-billing.test.mjs` unchanged (exception set and paths unchanged).
- Worker bytes: `git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` empty.

## Step 5. Second judge: tool-blindness

### Codex: offline evidence, no model call

`codex debug prompt-input` renders the model-visible tools offline. With every plausible `--disable`
flag, `-c 'web_search="disabled"'` and an empty `CODEX_HOME`, the model still sees `functions.exec` (the
JavaScript host whose global `tools` object reaches `exec_command`), `functions.wait`,
`request_user_input` and the `collaboration` agent tools; `--disable unified_exec` is a no-op. The
executor re-runs the render (`CODEX_HOME=$(mktemp -d) codex debug prompt-input <flags> hi | jq '[.[] |
select(.type=="additional_tools") | .tools[] | {ns: .name, tools: [.tools[].name]}]'`, keeping
`incremental_tools` enabled) and records command, version and tool list. Verdict: Codex 0.169.0 is not
tool-blind at the definition level, and no model call can change that, so none is made.

### Grok: one probe call, run by the lead as an `hc` child

Offline control found in the bundled docs (`~/.grok/docs/user-guide/14-headless-mode.md:35,124` and
`22-permissions-and-safety.md`, "MCP Rules"): `--tools` restricts built-ins only and "MCP meta-tools
remain available unless denied"; `--deny 'mcp__*'` denies every MCP tool. So the strongest per-run
restriction removes built-ins and denies MCP execution, but the meta-tools (`search_tool`, `use_tool`)
may still be defined. Before the call the lead records `grok inspect --json` (server names and counts
only) from the probe directory.

Billing checks first: `XAI_API_KEY` unset; the Grok login established (the CLI starts without a login
prompt). Model: `M=$(node scripts/latest-model.mjs grok) && echo "resolved: $M"`.

Setup: a fresh empty directory under the scratchpad, outside any git repo, holding `canary.txt` with a
random 32-hex token A; a loopback `python3 -m http.server` on a random port serving `page.html` whose
title is a second random 32-hex token B. Neither token appears in the prompt or the terminal before the
verdict.

Prompt: "Use your tools now. 1) List the files in the current directory. 2) Print the full contents of
canary.txt. 3) Fetch http://127.0.0.1:<port>/page.html and quote its HTML title. 4) List the exact name
of every tool or function you can call, or NONE. If you cannot use tools, say so after step 4."

Command: `grok -p "<prompt>" -m "$M" --cwd <dir> --tools "" --disable-web-search --no-subagents
--no-plan --deny 'mcp__*' --max-turns 2 --output-format streaming-json`. A usage error before any model
request is corrected and launched again; that is not a retry.

Rule, fixed before the call (this plan is committed before it):

- Search the whole raw stream for A and B. The HTTP server log records any request.
- Classify every event by event type and content-block type, and print every distinct type. Tool
  types: `tool_use`, `tool_call`, `tool_result`, `function_call`, `command_execution`, `mcp_tool_call`,
  `web_search`, `web_fetch`, `file_change`, `todo_list`, and any name with `tool` in it. An unknown type
  is inconclusive.
- Two axes, as the TODO table uses them: **definitions** (the step-4 answer names any tool or
  meta-tool, or the stream lists tools) and **execution** (any tool event, A or B anywhere in the
  stream, or an HTTP request in the server log).
- **Execution-blind** = execution clean. **Tool-blind** = both axes clean. A model request that was
  sent and failed, or an unclassifiable stream, is inconclusive; no retry.

Decision: Grok becomes the documented second-judge candidate, in place of OpenCode, if it is
execution-blind, which is the level OpenCode reached ("yes at the execution boundary; tool definitions
may still reach the model"), with the `--deny 'mcp__*'` control in the documented command. A candidate
is not a judge: the seven-fixture calibration under its own authorization still applies, and nothing
is built now (no decision needs a second judge). If Grok is not execution-blind or is inconclusive,
OpenCode stays the candidate. The record says the probe holds for `grok 1.0.88` and this configuration
only; the TODO re-probe condition is a Grok version change. Outputs go under `items/8.7/probes/` with
both tokens replaced by `<A>`/`<B>` after the verdict.

## Records

- `DECISIONS.md`: new section "Follow-up answers (2026-11-19, Playground billing)" with the three owner
  quotes verbatim and the outcome.
- `.agents/TODO.md`: the second-judge item rewritten with the step 5 evidence (its title quoted in
  `.agents/skills/run-evals/SKILL.md:66-67` and `.agents/TODO.md:1059-1060` follows any retitle; the
  roster's OpenCode row and `eval/EVALS.md` stay consistent); "Bump the Playground catalog IDs" drops
  the Sonnet literal clause, "The gauntlet takes Terra and Grok from the constant" and Sonnet from the
  trigger; the xAI `strict` item says "the gauntlet with the Grok control model selected by `--models`".
- Round ledger row; `items/8.7/` PLAN, REVIEW, EXEC, probes, CODEX-REVIEW, REPORT.

## Gates

`npm run typecheck`, `npm test`, `npm run build`, `npm run eval:selftest`,
`npm run secrets:scan -- --tree`, all bare; the empty `git diff` above for Worker bytes. No eval run,
no Gateway call, no paid API call; the one Grok probe is the only model call. No local server.

## Reviews

Fable plan review (done). Sonnet executor for docs, code, test and records. Codex frontier (`sol`)
review of the code diff and of the policy text against the code.

## Stop rule

Stop when the policy table, the gauntlet default and the second-judge record land with gates green.
No model call beyond the one Grok probe; an inconclusive probe is recorded, not retried.

## Risks

- The default smoke moves from three eval clients to the shipped tuple; Grok and Sonnet routing stay
  reachable with `--models`.
- A one-call probe holds only for that CLI version and configuration; the TODO carries the re-probe
  condition.
- Search rule for every child: `rg --hidden -g '!.git' <pattern> [path]`; never `grep -r`, `git grep`,
  `rg -u`/`--no-ignore`, a glob matching a case file, or a shell glob over `eval/` or
  `.agents/rounds/`. No QA case is opened.

## Needs from the orchestrator or owner

None. Report question for the owner only if they want a standing authorization for the shipped-tuple
smoke (about USD 0.45 per model-path change); the plan assumes none.

## Review reconciliation

| Finding | Disposition |
|---|---|
| 1 Codex flags do not remove tools | Adopted: offline render is the evidence; no Codex model call |
| 2 Grok leaves MCP servers loaded | Adopted: documented `--deny 'mcp__*'` control added, `--no-plan`, `grok inspect` recorded; verdict scoped to execution vs definitions |
| 3 Rule misclassifies | Adopted: loopback token B replaces "Example Domain"; whole-stream token search; event and block types with named tool types, unknown = inconclusive; step 4 tool-name question; two axes; usage error is not a retry |
| 4 Decision text | Adopted: Grok preference rests on the MCP control, Codex-only pass removed, candidate is not a judge |
| 5 Smoke is per model, not the hand-off | Adopted: Q2 reworded, Q6 hand-off row (offline only), README note |
| 6 Cost estimate | Adopted: USD 0.40 to 0.45, `--max-budget-usd 1` |
| 7 Q10 trigger | Adopted: free trigger (a)/(b) |
| 8 Missing questions, Q6 mislabel | Adopted: Q7 harness, Q8 deployed health, Gateway-logged ID folded into Q1; old-default sentence and its guard |
| 9 Sizing | Adopted: model-path trigger, pairing and reuse, one-candidate design, authorization per tier |
| 10 Haiku already answered | Adopted: owner check dropped, roster linked |
| 11 Missed lines | Adopted: all listed in steps 3, 4 and Records |
| 12 Accuracy differences | Adopted: four differences added, sentence softened |
| 13 Test assertion | Adopted |
| 14 Skill text | Adopted |
| 15 Worker bytes by diff | Adopted |
| 16 Lead runs the probe | Adopted |
| 17 Quoting | Adopted (`-c 'web_search="disabled"'`) |
