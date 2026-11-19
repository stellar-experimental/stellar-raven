# Item 8.7 plan review

Reviewer: Claude Fable tier, `claude-fable-5-2` (effort as set on the launch line). Read-only review
of `PLAN.md` on `np/8.7-playground-billing` at `48f034d3`. I made no model call: every CLI command
below is `--help`, `--version`, `features list`, `debug prompt-input`, or `inspect`, run on agentpc
in an empty scratch directory. I opened no QA case file.

## Verdict

Steps 1 to 4 are sound and can go ahead with the "should" fixes. **Step 5 must not run as written**:
three blocking findings (1 to 3) show the Codex command cannot produce a meaningful pass, the Grok
command leaves 13 MCP servers loaded, and the pre-registered rule misclassifies in predictable ways.
The probe rule cannot change after the calls and allows no retry, so these need fixing first.

What I confirmed as correct:

- The split itself. Q1 to Q5 and Q8 belong on the Gateway; Q6 and Q7 belong on subscriptions.
  Rejecting a subscription pre-screen for Q3 is right: on 2026-11-03 the same model went from 0/8 to
  8/8 on an SDK bump alone (`research/audits/2026-11-10-playground-gpt61-terra-recheck.md:29-31`), so
  the transport decides eligibility, and no CLI touches it. The Gateway half of E1 is also the small
  half: answers USD 1.38 against a USD 2.02 subscription judge (same file, line 84).
- Every fact under "Facts re-checked" that I tested: the tuple and effort
  (`src/demo/model-config.ts:19-39`), the caps (`src/demo/budget.ts:21-51`), the prompt
  (`src/demo/prompt.ts:28`), `strict: false` (`src/demo/tools.ts:301-304,441-444`), the 4.1 figures
  (9 of 24 rows, Codex at `low`), the cost figures, and the CLI versions `codex-cli 0.169.0` and
  `grok 1.0.88`.
- Nothing else reads `DEFAULT_MODELS` or the Sonnet literal. Live readers are
  `scripts/run-demo-model-gauntlet.mjs:88-92,716` and `test/demo-model-config.test.ts:6,82-88`.
  `test/demo-gauntlet-cli.test.ts:204` expects 24 turns from its own explicit matrix, not the default.
- `test/model-call-billing.test.mjs` stays unchanged, and Worker bytes do not change.
- The Codex config key is right. `codex -c 'web_search="bogus"' features list` fails with "expected
  one of `disabled`, `cached`, `indexed`, `live` in `web_search`". All 13 feature names in the plan
  exist; an unknown name fails with "Unknown feature flag".

## Blocking

### 1. The Codex command does not remove the tools, and no flag set does

Evidence, all offline on `codex-cli 0.169.0`:

- `codex debug prompt-input` renders the model-visible input, including an `additional_tools` item.
  With the plan's 13 `--disable` flags plus `-c 'web_search="disabled"'` and an empty `CODEX_HOME`
  (the same effect as `--ignore-user-config`), the model still sees `functions.exec`,
  `functions.wait`, `request_user_input`, `request_user_input_async`, and the whole `collaboration`
  namespace (`spawn_agent`, `send_message`, `wait_agent`, `list_agents`, `followup_task`,
  `interrupt_agent`). The plan's flags remove only `clock.sleep`.
- `exec` is the JavaScript tool host: "All nested tools are available on the global `tools` object,
  for example `await tools.exec_command(...)`". `--disable code_mode_host` does not remove it, and
  `--disable multi_agent` does not remove `collaboration`.
- `--disable unified_exec` is a no-op. `codex --disable unified_exec features list` still prints
  `unified_exec stable true`, also with `-c features.unified_exec=false` and with an empty
  `CODEX_HOME`.
- Disabling all 61 other default-on features (every `true`, non-`removed` row except
  `incremental_tools`) leaves the same tool list.
- Trap: disabling `incremental_tools` makes the `additional_tools` item vanish from the render. That
  changes how tools are delivered, not whether they exist, so it proves nothing.
- The plan's list also misses default-on features that look tool-bearing: `view_image`, `goals`,
  `browser_use_external`, `browser_use_full_cdp_access`, `in_app_local_automation`, `remote_plugin`,
  `skill_mcp_dependency_install`, `hooks`. So "every tool-bearing feature disabled" (PLAN.md:132-135)
  is false twice over.

Consequence: Codex is not tool-blind at the definition level in this version, whatever the flags. A
"tool-blind" verdict from the plan's call could only be a false pass (the prompt did not elicit
`exec`). The paid call adds little: the free render already answers the owner's question for Codex.

Fix:

- Record the offline render as the Codex evidence (command, version, tool list). Verdict: not
  tool-blind; the TODO row "No. Stays unsupported" (`.agents/TODO.md:1071`) stands, now with the
  reason "the `exec` host and agent tools cannot be switched off", which is stronger than "a
  deny-list goes stale".
- Drop the Codex model call (AGENTS.md: least spend that can decide). If the lead still wants it,
  re-scope it in the plan before the call: the only open question is whether `exec` can reach the
  file system with `shell_tool` off, and the outcome labels must be "executed a read or fetch" or
  "executed nothing", never "tool-blind".
- Reproduce with:
  `CODEX_HOME=$(mktemp -d) codex debug prompt-input <flags> hi | jq '[.[]|select(.type=="additional_tools")|.tools[]|{ns:.name,tools:[.tools[].name]}]'`.
  Keep `incremental_tools` enabled, or the render shows nothing.

### 2. The Grok command leaves 13 MCP servers, 143 skills and a plugin loaded

Evidence, offline on `grok 1.0.88`:

- `grok inspect --json` in an empty directory lists 13 MCP servers, read from `~/.claude.json` and
  `~/.grok/config.toml`: `parallel`, `context7`, `deepwiki`, `linear`, `mobbin`, `perplexity`,
  `executor`, `cloudflare`, `notion`, `todoist`, `mymind`, `planning-center`, `github`. The count is
  the same with `--tools "" --disable-web-search --no-subagents` in front.
- The help text scopes both flags to built-ins: `--tools` is "Built-in tools to allow",
  `--disable-web-search` is "Disable web search and web fetch tools". `parallel` and `perplexity`
  offer web fetch and search through MCP.
- `grok mcp` has only a persistent `disable` subcommand, which edits host config. `inspect` shows
  `mcpManagedServersOnly: "off"` and no managed settings file.

The plan only records `grok mcp list` (PLAN.md:120-121). So step 3 of the prompt can be served by an
MCP server, and a "not tool-blind" result would not tell us what an empty `--tools` means. A
"tool-blind" result would not show MCP is off either. A judge that can call 13 servers is not blind.

Fix:

- Before the call, find an MCP-off control and verify it offline. Candidates to check in `grok help`
  and the docs: a `--deny` rule that covers MCP tools, a definition file passed to `--agent` with an
  empty tool list, or the managed `mcpManagedServersOnly` and `mcpServerAllowlist` settings. Do not
  run `grok mcp disable`: it changes host state.
- Put the control in the command, add `--no-plan`, and record `grok inspect --json` output (server
  names only) from the probe directory.
- If no per-run control exists, say so in the plan before the call and scope the Grok verdict to
  "built-in tools". Then Grok cannot be the documented judge on a host with MCP servers, and the
  OpenCode TODO stays.
- Good news to record: `grok --tools "" --disable-web-search --no-subagents version` exits 0, so the
  empty value parses.

### 3. The pre-registered rule misclassifies in four ways

Evidence is PLAN.md:137-143 against the prompt at PLAN.md:123-125.

1. **"Example Domain" is memorized.** A model with no web tool can quote that title from training.
   The rule then says "not tool-blind". Codex is the likely case: it keeps `exec`, so the `NO_TOOLS`
   escape does not apply and it will answer step 3 from memory.
2. **The canary check reads only "the reply".** A tool result can carry the token in the stream
   without the model repeating it.
3. **The event rule exempts assistant-message events.** Grok mirrors Claude Code's flag names, and
   Claude-style stream JSON carries a tool call as a content block inside an assistant message. Such
   a call would pass as "zero tool events". The Grok `streaming-json` schema is not verified anywhere
   in the plan.
4. **"The call errors: inconclusive, no retry"** also burns the probe on a usage error where no model
   request was sent.

Fix, all before the calls:

- Replace the web marker with one that cannot be recalled: a second random token served by a
  loopback static server started for the probe, plus "any web, fetch or search event is a tool
  event". Text that contains "Example Domain" with no tool event is recorded as recall.
- Search the whole raw stream for both tokens.
- Classify by event type and by content-block type. Name the tool types up front (`tool_use`,
  `tool_call`, `function_call`, `command_execution`, `mcp_tool_call`, `web_search`, `file_change`,
  `todo_list`). Print every distinct type seen. An unknown type is inconclusive.
- Add a fourth prompt step: "List the exact name of every tool or function you can call, or NONE."
  It costs nothing and records the definition surface in the same call.
- Report two axes, in the words the TODO table already uses (`.agents/TODO.md:1073`): definitions
  reaching the model, and execution. "Tool-blind" needs both clean.
- Define "the call errors" as a model request that was sent and failed. A CLI usage error before any
  request is corrected and launched again; that is not a retry of a model call.

## Should

### 4. The Step 5 decision text follows from findings 1 and 2

- "Grok is preferred: its control is an allowlist" (PLAN.md:146-147) holds for built-in tools only.
  MCP servers, plugins and skills sit outside it. Say so, and make the MCP control part of the
  documented judge command.
- Remove "A Codex-only pass is adopted with a condition" (PLAN.md:147-148). Finding 1 shows a Codex
  pass can only mean "executed nothing this once" with `exec` and agent tools still defined.
- A pass makes a CLI a candidate, not a judge: the seven-fixture calibration under its own
  authorization still applies (`.agents/TODO.md:1082`). The plan builds nothing, which is right.

### 5. The default smoke runs each model alone; it does not test the tuple or the hand-off

`startWrangler` sets `DEMO_MODEL_OVERRIDE:${model}` with one model per server
(`scripts/run-demo-model-gauntlet.mjs:239-245`). So "default matrix = the shipped tuple" means Terra
alone and Haiku alone as primary. The hand-off is "verified offline only"
(`research/audits/2026-11-09-playground-product-decision.md:79-81`).

Fix: word Q2 as "each shipped model, run alone". Add a row: "Does the fallback hand-off keep
history, budget and per-attempt effort?" with path "offline tests, free; no live instrument". Say the
same in `eval/playground/README.md` so nobody reads a green smoke as hand-off evidence.

### 6. "16 turns, about USD 1" is about twice the cited evidence

Terra cost USD 0.355 for 8 turns (recheck audit, line 29-31). Haiku cost USD 0.101 for 16 turns
(product-decision audit, line 74), so about USD 0.05 for 8. The default is about USD 0.41.

Fix: state "about USD 0.40 to 0.45" with both sources. Document the default command with
`--max-budget-usd 1`: without the flag the launch plan says "no cost accounting"
(`scripts/run-demo-model-gauntlet.mjs:791`), and Q5 says the cost frame is exercised only inside
another run.

### 7. Q7 has no rule for when a shared-text change needs the E1 sample

`DEMO_SYSTEM_PROMPT` is `SERVER_INSTRUCTIONS` plus the preamble (`src/demo/prompt.ts:28`), and the
Playground tools reuse the MCP descriptions (`src/demo/tools.ts:302,442`). Every MCP text change is
also a Playground prompt change. "Only when the change also needs a Playground verdict"
(PLAN.md:49) gives no test, so the result is either an E1 run on every wording change or none ever.

Fix: add a free trigger. The subscription QA run is the measured verdict for shared text. Add the E1
sample only when (a) the change touches text about call counts, step order or the search evidence
rule, which the Playground caps or overrides, or (b) the stored QA transcripts show the change moves
tool calls per answer past the Playground caps of 3 `search`, 3 `execute` and 6 tool steps
(`src/demo/budget.ts:23,37,39`; read it with `npm run eval:plan`, free).

### 8. The table is missing three questions and mislabels one

- **Harness and artifact contract.** The orchestrator note names it (`8.7-NOTE.md:39-40`). Path:
  free. `test/playground-*` plus `--dry-run`, `--preflight` and `--print-generation`
  (`eval/playground/README.md:12-19`).
- **Is the deployed Playground healthy after a deploy?** Path: a Gateway log read with the
  `cloudflare-observability-review` skill, no model call. The 2026-11-10 production check did exactly
  this (recheck audit, lines 89-93). Without the row, someone will reach for E2.
- **Does the Gateway log a vendor's model under the configured ID?** This is Gateway-only and still
  open for non-OpenAI vendors (`eval/playground/README.md:160`). Fold it into Q1.
- **Q6 "Instrument today: was in the gauntlet default"** is wrong. The gauntlet never measured which
  family answers best: it "does not establish factual answer quality"
  (`eval/playground/README.md:3`). Its eval-client default only smoke-tested three slugs' routing.
  Write that, then state what goes unseen once Sonnet and Grok leave the default (live routing of
  those two slugs) and what guards it now (the transport unit tests in
  `test/demo-model-config.test.ts:205-240`, and `--models` on demand). AGENTS.md asks for this
  sentence whenever a check is cut.

### 9. Sizing rule: three adjustments

- **Rule 1 trigger is too wide.** "After a `src/demo` ... change" would buy a paid run for a UI or
  throttle edit. `npm run test:smoke` is the gate for `src/demo`. Limit the paid smoke to the model
  path: `model-config.ts`, the request building in `chat.ts`, an `ai`, `@ai-sdk/*`,
  `workers-ai-provider` or `agents` bump, a catalog ID bump, or a Gateway setting.
- **Rule 2 cites the throttle as a size.** 30 is the `chatsPerHour` ceiling, not a reason. Keep it as
  the cap and add the lever the records support: pair on the same case IDs, and reuse a stored
  shipped-tuple run when its identities match (run-evals section 1, line 21-23). Note the recheck's
  own caveat that a reused comparator across trees is "not a like-for-like quality comparison"
  (line 19-22), so a prompt change (Q4) needs both arms on one tree.
- **Rule 3 forces screen plus confirmation on every round.** That design chose among several
  candidates. One candidate needs the 2026-11-10 design: gauntlet plus one paired run, USD 3.75 all
  in (line 84), which `eval/playground/README.md:42` already documents. Write: one candidate, paired
  run; several, screen then a disjoint confirmation for the one that advances.
- State the authorization for each tier. AGENTS.md says every paid method needs its own written
  authorization; "default Gateway run" must not read as a standing one. If the lead wants a standing
  authorization for the USD 1 smoke, that is an owner question for the report.

### 10. The Haiku owner check is already answered

`.agents/model-roster.md:49-50`: "Haiku and Codex Luna are out of every test and eval ... The
Playground fallback model is the one exception." Drop the owner check (PLAN.md:190-192) and the extra
line planned for `eval/EVALS.md` (PLAN.md:106-108). Link the roster instead.

### 11. Files and lines the plan misses

- `scripts/run-demo-model-gauntlet.mjs:84-85`: "A full run of the default matrix is 24 turns"
  becomes 16.
- Same file, lines 43-47: the header's own rule is "a slug that has not been probed does not belong
  in the default". Add the dated observations for the new members: Haiku 16/16 on 2026-11-09, Terra
  6.1 8/8 on 2026-11-10.
- Same file, line 9: the `DEMO_CATALOG_LATEST` import becomes unused; import `DEMO_MODELS` instead.
- If the second-judge TODO is retitled, its quoted title also lives in
  `.agents/skills/run-evals/SKILL.md:66-67` and `.agents/TODO.md:1059-1060`. The roster's OpenCode
  row (`.agents/model-roster.md:43-48`) and `eval/EVALS.md:68-69` describe the same stance.
- `eval/EVALS.md:32`, the Instruments row, names exception E1; keep it in step with the new table.
- `.agents/TODO.md:1286,1288-1290`: besides the Sonnet literal clause, drop "The gauntlet takes Terra
  and Grok from the constant" and Sonnet from the trigger list.
- `.agents/TODO.md:1401`: the xAI `strict` item is "done when the model gauntlet shows the Grok
  control model accepts the request". With Grok out of the default, add "selected with `--models`".

### 12. Accuracy check: add four differences and soften one sentence

Add to the Step 2 list:

- Temperature: the Playground pins 0.1 (`src/demo/model-config.ts:40`); the CLIs use vendor defaults.
- Tool results, not only tool presentation: the Playground clips hit descriptions, clamps the search
  limit to 6 and refuses calls past the per-turn caps (`src/demo/tools.ts:203`,
  `src/demo/budget.ts:35-41`); each CLI applies its own MCP result clip (`.agents/TODO.md:147-155`).
- Claude effort mapping: `none` becomes adaptive thinking at `low` for Haiku
  (`src/demo/model-config.ts:161-171`).
- Provider refusals differ by endpoint: the Sonnet content-filter refusal and the OpenAI
  cyber-safety refusal were Gateway observations (product-decision audit, line 25; recheck audit,
  lines 56-58).

"Each difference is the thing Q1 to Q4 measure" (PLAN.md:67) overstates it: Q1 and Q2 measure
transport and loop, not the prompt. Write "at least one of these differences is what each of Q1 to
Q4 measures".

## Nits

13. **Test assertion.** Assert `GAUNTLET_DEFAULT_MODELS` equals
    `[DEMO_PRIMARY_MODEL, DEMO_FALLBACK_MODEL]`. Repeating the script's own `DEMO_MODELS.map` in the
    test would pass by construction. What the test guards is a literal creeping back.
14. **Skill text.** `test/model-call-billing.test.mjs:18,43` scans skill Markdown and fails on the
    string `playground/chat`. Keep the route name out of the `run-evals` rows and link the README.
    Skill text is timeless: no item number, date or TODO id.
15. **Worker bytes.** An empty `git diff origin/main -- src/ package.json package-lock.json
    wrangler.jsonc` proves it without a second build of `origin/main`.
16. **Who runs the probe.** AGENTS.md says Claude lanes refuse paid steps sent as a brief. Plan for
    the lead to run any probe call itself, as an `hc` child.
17. **Shell quoting.** Write `-c 'web_search="disabled"'`. The unquoted form in PLAN.md:135 works only
    because Codex falls back to a raw string.
