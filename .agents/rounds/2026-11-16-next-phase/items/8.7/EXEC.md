# Item 8.7 execution record

Executor: Claude Sonnet (`claude-sonnet-5-5`), 2026-11-19, worktree `/home/tyler/code/raven-wt/np-8.7`,
branch `np/8.7-playground-billing`. Plan: [PLAN.md](PLAN.md) revision 2. No model call of any kind, no
push, no local server.

## What was done, per task

1. **`DECISIONS.md`**: new section "Follow-up answers (2026-11-19, Playground billing)" between the
   2026-11-18 subscriptions-first section and "## Timing". It quotes the three owner statements
   verbatim, then the outcome (E1 and E2 stay as product exceptions scoped by question; the gauntlet
   default is the shipped tuple; Q9 and Q10 on subscriptions; Codex not tool-blind at the definition
   level, Grok not execution-blind on one probe, OpenCode stays the candidate; applied by item 8.7).
2. **`eval/EVALS.md`**: the E1/E2 exception table became a question → path table (eight rows, with
   reasons), followed by the three-tier sizing rule. The pre-run checks and the OpenCode probe are
   unchanged. The Haiku exception is a link to the roster. The Playground row in the Instruments table
   names E1 and E2.
3. **`.agents/skills/run-evals/SKILL.md`**: the section 2 "Subscriptions first" bullet and the section 3
   Playground row say which questions go to the Gateway and which to subscriptions, with the EVALS.md
   link. No item number, date or chat route string. The quoted TODO title is unchanged.
4. **`eval/playground/README.md`**: gauntlet paragraph (default is the shipped tuple, each model alone,
   16 turns, about USD 0.40 to 0.45, `--max-budget-usd 1`, not a hand-off test); billing paragraph
   (which questions belong here, which go to subscriptions); "Comparing candidate models" opens with the
   sizing rule (one candidate vs several, never a full matrix, E1 sample default 5, at most 30).
5. **`scripts/run-demo-model-gauntlet.mjs`**: imports `DEMO_MODELS`, drops the unused
   `DEMO_CATALOG_LATEST` import, `DEFAULT_MODELS = DEMO_MODELS.map(({ model }) => model)`, header
   paragraph rewritten, 24 turns became 16, dated observations added (Terra 8/8 on 2026-11-10 beside the
   existing routing note; Haiku 16/16 turns on 2026-11-09). The Sonnet literal is gone.
   **`scripts/run-playground-semantic-eval.mjs`**: header says it is billing exception E1 for Playground
   product questions, with the EVALS.md pointer.
6. **`test/demo-model-config.test.ts`**: the default-matrix test is now "defaults the gauntlet to the
   shipped primary then fallback" and asserts equality with `[DEMO_PRIMARY_MODEL, DEMO_FALLBACK_MODEL]`.
   Both constants were already imported.
7. **`.agents/TODO.md`**: (a) the second-judge item keeps its title; the Codex row carries the offline
   evidence and the Grok row carries the 2026-11-19 probe with a link to
   [probes/PROBE.md](probes/PROBE.md) and the condition for a different probe; the intro sentence says
   what was checked on which dates. (b) "Bump the Playground catalog IDs" drops the Sonnet literal
   clause, the "takes Terra and Grok from the constant" sentence and Sonnet from the trigger, and says
   the gauntlet default follows `DEMO_MODELS`. (c) The xAI `strict` item's done-when names the gauntlet
   with the Grok control model selected by `--models`.
8. **Codex evidence**: below.
9. **Gates**: below.
10. **Commits**: three focused commits on the branch (code and test; docs, TODO and DECISIONS; this
    file), normal hooks, not pushed.

## Codex render (offline, no model call)

`codex --version`: `codex-cli 0.169.0`. `debug prompt-input` needed no login and made no model request.
`CODEX_HOME` was a fresh `mktemp -d -p tmp` directory under the worktree (removed afterwards; `tmp/` is
gitignored).

```sh
CODEX_HOME=$(mktemp -d) codex debug prompt-input --disable shell_tool --disable unified_exec --disable apps --disable plugins --disable browser_use --disable computer_use --disable in_app_browser --disable image_generation --disable multi_agent --disable sleep_tool --disable tool_suggest --disable skill_search --disable code_mode_host -c 'web_search="disabled"' hi | jq '[.[]|select(.type=="additional_tools")|.tools[]|{ns:.name,tools:[.tools[].name]}]'
```

Output:

| Namespace | Tools |
|---|---|
| `functions` | `exec`, `wait`, `request_user_input`, `request_user_input_async` |
| `collaboration` | `followup_task`, `interrupt_agent`, `list_agents`, `send_message`, `spawn_agent`, `wait_agent` |

Verdict, as the plan predicted: Codex 0.169.0 is not tool-blind at the definition level. One small
difference from the plan: `request_user_input_async` is also defined (the plan listed
`request_user_input`). The TODO row names the `exec` host, `wait`, `request_user_input` and the
`collaboration` tools, which stays true.

## Gates

All run bare (output redirected to a file under the gitignored `tmp/` so the exit status stays visible).

| Gate | Result |
|---|---|
| `npm run typecheck` | Exit 0. The first run failed on `OAUTH_KV` because a fresh worktree has no generated `env.d.ts`; I wrote the placeholder `.dev.vars` (names only, the `ci.yml` stub) and ran `npm run typegen`, as `README.md` "Run locally" says. Both files are gitignored |
| `npm test` | First run: exit 1, 1 failed of 4,294 (`test/qa-judge-evidence.test.mjs`, "scans failed and userinfo-free URL candidates in bounded linear time": a timing ratio, 8.81 against a limit of 8; no file I touched is involved). Second run: exit 0, 177 files passed and 5 skipped, 4,283 tests passed, 3 expected fail, 8 skipped |
| `npm run build` | Exit 0 (Wrangler dry run) |
| `npm run eval:selftest` | Exit 0, "self-test: all checks passed" |
| `npm run secrets:scan -- --tree` | Exit 0, "clean — scanned all tracked files" |
| `git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` | Empty (0 bytes). Worker bytes do not change |

## Deviations from the plan

- The Codex render lists one more tool (`request_user_input_async`) than the plan's prose.
- The first `npm test` failed on an unrelated timing-ratio test and passed on the rerun. I did not
  investigate the flake further. It may merit a TODO if it recurs.
- `.dev.vars` and `env.d.ts` now exist in the worktree (gitignored, placeholders only). The lead can
  reuse them for further gates.
- "Haiku 16/16" is worded as "passed 16/16 turns" in the gauntlet header, which matches the audit's
  "passed all five required fields on 16/16 turns".
- The ledger, `AGENTS.md`, the roster and `test/model-call-billing.test.mjs` are untouched.
