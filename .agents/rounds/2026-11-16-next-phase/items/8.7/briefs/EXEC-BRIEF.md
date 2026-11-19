# Item 8.7 executor brief (Claude Sonnet)

You carry out the reconciled plan for round item 8.7. You edit files and commit; you make no model
call of any kind (no `grok -p`, no `codex exec`, no `claude -p`, no eval, no Gateway call).

- Worktree: `/home/tyler/code/raven-wt/np-8.7`, branch `np/8.7-playground-billing`. Work only there.
- Plan (revision 2, binding): `.agents/rounds/2026-11-16-next-phase/items/8.7/PLAN.md`. Steps 1 to 4,
  the Codex half of step 5, and "Records" are yours. The Grok probe already ran: read
  `.agents/rounds/2026-11-16-next-phase/items/8.7/probes/PROBE.md`. Its verdict: Grok is not
  execution-blind (`--tools ""` restricts nothing), so OpenCode stays the second-judge candidate.
- Fable review: `items/8.7/REVIEW.md` (all findings adopted in the plan).
- Owner quotes, verbatim, are in `/home/tyler/code/raven-wt/orch/8.7-NOTE.md` ("Owner instructions").
- Read `AGENTS.md` first.

## Tasks

1. `DECISIONS.md` (`.agents/rounds/2026-11-16-next-phase/DECISIONS.md`): add a section
   "Follow-up answers (2026-11-19, Playground billing)" after the 2026-11-18 subscriptions-first
   section, before "## Timing". Quote all three owner statements verbatim, then a short outcome (E1 and
   E2 stay as product exceptions scoped by question; the gauntlet default is the shipped tuple; Q9/Q10
   on subscriptions; second judge: Codex not tool-blind at the definition level offline, Grok not
   execution-blind on one probe, OpenCode stays the candidate; applied by round item 8.7).
2. `eval/EVALS.md` "Model-call billing": replace the E1/E2 exception table with the short question →
   path table (plan step 1, reasons included) and the sizing rule (plan step 3); keep the pre-run
   checks and OpenCode probe sections; link `.agents/model-roster.md` for the Haiku/fallback exception;
   update the Playground row in the Instruments table to name E1 and E2. Keep it short; the README holds
   detail.
3. `.agents/skills/run-evals/SKILL.md`: section 2 "Subscriptions first" bullet and the section 3
   "Playground model or prompt" row say which Playground questions go to the Gateway and which to
   subscriptions, linking EVALS.md and the README. Skill text is timeless (no item numbers, dates or
   TODO ids except an existing TODO title it already quotes) and must not contain the literal chat route
   string that `test/model-call-billing.test.mjs` refuses in skill Markdown.
4. `eval/playground/README.md`: the gauntlet paragraph (default = the shipped tuple, each model alone,
   16 turns, about USD 0.40 to 0.45, run with `--max-budget-usd 1`; not a hand-off test; the hand-off is
   covered by offline tests only); the billing paragraph (which questions belong here, which go to
   subscriptions); "Comparing candidate models" gets the sizing rule (one candidate vs several).
5. `scripts/run-demo-model-gauntlet.mjs`: plan step 4 exactly (import `DEMO_MODELS`, derive
   `DEFAULT_MODELS`, drop the Sonnet literal and the unused import, rewrite the header paragraph, 24 to
   16 turns, add the dated observations). `scripts/run-playground-semantic-eval.mjs` header: one or two
   lines saying it is billing exception E1 for Playground product questions, with the EVALS.md pointer.
6. `test/demo-model-config.test.ts`: the default-matrix test asserts equality with
   `[DEMO_PRIMARY_MODEL, DEMO_FALLBACK_MODEL]` (import them from `src/demo/model-config.ts`); rename the
   test accordingly.
7. `.agents/TODO.md`: (a) "Build a subscription second judge on OpenCode when a decision needs one":
   update the table rows for Codex (offline `codex debug prompt-input` evidence: `exec` host, `wait`,
   `request_user_input`, `collaboration` tools stay defined with every flag; not tool-blind; no model
   call) and Grok (probe 2026-11-19: `--tools ""` restricts nothing, `read_file` returned the canary;
   not execution-blind; a different configuration would need its own pre-registered probe), linking
   PROBE.md. Keep the title unless you must change it; if you do, update its quotes in the run-evals
   skill and the TODO line that cites it. (b) "Bump the Playground catalog IDs…": drop the Sonnet
   literal clause, "The gauntlet takes Terra and Grok from the constant", and Sonnet from the trigger;
   say the gauntlet default follows `DEMO_MODELS`. (c) "Verify that xAI accepts the explicit tool
   `strict` field": done-when says the gauntlet with the Grok control model selected by `--models`.
8. Codex evidence: re-run offline, with no model call,
   `CODEX_HOME=$(mktemp -d) codex debug prompt-input --disable shell_tool --disable unified_exec --disable apps --disable plugins --disable browser_use --disable computer_use --disable in_app_browser --disable image_generation --disable multi_agent --disable sleep_tool --disable tool_suggest --disable skill_search --disable code_mode_host -c 'web_search="disabled"' hi | jq '[.[]|select(.type=="additional_tools")|.tools[]|{ns:.name,tools:[.tools[].name]}]'`
   (if `debug prompt-input` would contact a model or needs a login, stop and say so in EXEC.md instead).
   Record the command, `codex --version` and the tool list in EXEC.md. Use a temp dir under the
   worktree's `tmp/`, not your home.
9. Gates, each run bare (no pipe): `npm run typecheck`, `npm test`, `npm run build`,
   `npm run eval:selftest`, `npm run secrets:scan -- --tree`. Then
   `git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` must be empty.
10. Commit on the branch with the normal hooks (never `--no-verify`), in two or three focused commits
    (code + test; docs + TODO + DECISIONS; EXEC.md). End each message with
    `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (use the exact model name your system
    prompt gives you). Do not push.
11. Write `.agents/rounds/2026-11-16-next-phase/items/8.7/EXEC.md`: what you did per task, a short
    summary of each gate's output (counts), the Codex render, and any deviation from the plan.

Search rule: search with `rg --hidden -g '!.git' <pattern> [path]`. Never use `grep -r`, `git grep`,
`rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/` or
`.agents/rounds/`. Never open a QA case file (`eval/qa/corpus/`, `cases.json`, `sample.json`,
`tool-cases.json`, eval/qa `results/` or `reviewed/`). Do not edit `AGENTS.md`. Do not touch the
round ledger (the lead does). Writing style: short plain sentences, like the surrounding text.

When done, report the EXEC.md path as your task line says.
