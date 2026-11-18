# Item 8.4: plan review

Reviewer: Claude Fable (`fable` alias, resolved `claude-fable-5-2`), high effort, agentpc `t1z8`,
2026-11-18. Read-only against `np/8.4-families-everywhere` at `b623d5ac`. No model call, no QA
lint, no case file opened.

Verdict: no blocker. Six findings to adopt before execution (1 to 6), four nits.

## Findings

1. **should: the two-step line hides the resolved ID from the lead.** `M=$(...)` captures the
   resolver's stdout; only `catalog fetched_at ...` reaches the screen, and a Claude lead's Bash
   calls do not keep shell variables. So "record the resolved ID (the resolver's stdout)" (plan
   step 2) and "Record its tier, model and effort" (`2.1-LEAD.md:82`) cannot be met from that
   line. Checked here: the step prints nothing. The plan's `echo`-for-`hc` dry run would not show
   this, because the echo prints `$M`.
   Fix: in every edited line use
   `M=$(node <wt>/scripts/latest-model.mjs sol) && echo "resolved: $M" && hc run ... -m "$M" ...`
   (same for Grok and for `ITEM-LEAD.md:78-79`). Step 1 already edits the roster: add the same
   `echo` to `.agents/model-roster.md:62,64`, whose line 59 claims the first step "gives the
   orchestrator the ID to record".

2. **should: step 4 is not the minimal change, and it costs a deploy.** The Worker never uses
   Sonnet; `DEMO_CATALOG_LATEST` holds "each family the demo uses" (`src/demo/model-config.ts:15`).
   Adding `sonnet` there moves one literal from a script into the Worker bundle and buys: a deploy,
   the smoke lane, the `dist/server.js` comparison, and a new `modelConfigFileSha256` for the
   Playground semantic eval (`scripts/run-playground-semantic-eval.mjs:272`,
   `eval/playground/artifact-contract.mjs:134`). The count of exact IDs does not drop: the AI
   Gateway has no alias, so one Sonnet literal remains either way.
   Fix (recommended): edit the script only.
   `DEFAULT_MODELS = ["anthropic/claude-sonnet-5.5", DEMO_CATALOG_LATEST.terra, DEMO_CATALOG_LATEST.grok]`
   (the import at `scripts/run-demo-model-gauntlet.mjs:9` already loads that module), with the
   comment at lines 37-42 saying the Sonnet literal is the one eval-client-only ID. That removes
   the duplicated Terra and Grok, touches no `src/`, and drops `test:smoke`, the dist comparison
   and the deploy from the item.
   If the plan keeps the Worker edit instead: fix the comment at `model-config.ts:15-17`, add the
   hash move to Risks, and confirm in the ledger that no Playground semantic run is in flight or
   awaiting a resume. Nothing iterates `DEMO_CATALOG_LATEST` (only `.terra`, `.haiku`, `.grok`
   reads), so a new key changes no behavior, and there is no typing issue.

3. **should: a live TODO entry goes stale with step 4.** `.agents/TODO.md:1253-1258` says the
   constant holds "(Terra, Haiku, Grok)", that the gauntlet's default matrix names exact IDs, and
   "Bump the constant and the gauntlet literal together (a test pins that they agree)". Either
   variant of step 4 makes that wrong. Add the file to step 4 and rewrite those two sentences to
   the new single-edit bump.

4. **should: say what an unattended lead does when the launch line stops.** The form fails closed
   (checked with a missing cache: exit 1, reason on stderr, no launch), but the dated briefs give no
   rule for it, and a lead may type a remembered version. A newly released Sol can also resolve on
   2026-11-23 and fail its first launch (`.agents/model-roster.md:101-102`); "fall back to the
   previous model" has no meaning in a brief with no versions.
   Fix: one sentence after the fallback line in each dated brief (`2.1-LEAD.md:81-83` and the same
   lines in 2.2a, 2.2b, 2.2c): "If the resolver exits non-zero or the resolved model fails to
   start, that tier is unavailable: take the next fallback and record the reason. Never type a
   model version by hand."

5. **should: step 5 replaces one pin with a newer pin.** `gpt-6.2-sol` in the example goes stale at
   the next Sol, which is the edit the owner asked to stop making. The file already uses
   placeholders (`gateway-judge.md:60`).
   Fix: `"model": "gpt-<version>-sol"`, `"gatewayLogModel": "openai/gpt-<version>-sol"`, drop
   "(the example uses `gpt-6.1-sol`)" at line 55, and point the reference at line 149 to the
   OpenAI models index instead of one model page.
   The reason for keeping the config explicit is sound: the log model is "checked literally" with
   "no model aliases or fuzzy matching" (lines 29-30) and identity hashes "exact model IDs" (line
   77). Add to the planned sentence that the Codex CLI catalog is not the AI Gateway catalog, so
   `scripts/latest-model.mjs` cannot fill the field.

6. **should: the gates omit the `eval/` row.** Step 5 edits `eval/qa/gateway-judge.md`, and
   `CONTRIBUTING.md:41` maps `eval/` to `eval:selftest`, `eval:qa:lint -- --stale --enforce-floors`
   and `eval:qa:register -- --check`. State the choice in the plan: the lead runs them bare, or a
   Markdown-only edit leaves them to CI. Do not give the QA lint to a lane that the held-out rule
   bars from it.

7. **nit: the step 4 test stops guarding what it guarded.** `test/demo-model-config.test.ts:82-85`
   guards drift between a literal and the constant. Once the default is derived, `toEqual` against
   the same expression cannot fail on drift; it guards membership only (three clients, no Haiku).
   Rename it to say so, or delete it and name derivation as the guard. Line 93 pins the Haiku
   fallback the same way line 92 pins the primary; give it the same "stays" reason.

8. **nit: the stop-rule scan needs named patterns.** Two live pins escape an obvious one:
   `gpt-6-astra` has no dot (`ITEM-LEAD.md:78`), and "Claude Sonnet / 5.5)" wraps across lines at
   `2.1-LEAD.md:59-60`, `2.2a:52-53`, `2.2b:45-46`, `2.2c:51-52`. Write the pattern in the plan
   (`gpt-[0-9]`, `claude-[a-z]+-[0-9]`, `grok-[0-9]`, `(Opus|Sonnet|Fable|Haiku|Grok|Sol|Astra|Terra) [0-9]`)
   and check the four wrapped lines by eye.

9. **nit: `DECISIONS.md:11` still says "a Claude Sonnet 5.5 executor"** and binds leads through
   `ITEM-LEAD.md:13-14`. Leave the dated line. Put the step 6 entry in the existing
   "Follow-up answers (2026-11-18)" section (line 117, beside the 8.3 "Models" answer at 142-145)
   and have it say it supersedes that version and the 8.3 dated-brief exception.

10. **nit: use this item's own Codex review as the live proof.** It is the first lane on
    `gpt-6.2-sol` from agentpc. Launch it with the byte-exact line the dated briefs will carry
    (scope wrapper included) and record that in REPORT.md. The `echo` dry run is then needed for
    the Grok line only. Executor note: keep `M=... && hc run`; the prefix form `M=... hc run` would
    expand `$M` before it is set. Keep the three-space indent of the block at
    `rehearsal-LEAD.md:26`.

## Confirmed

- **Brief source.** "The lead reads the brief from origin/main at fire time" is right:
  `launch-dated-lead.sh:102-103` fetches and checks the brief on `origin/main`, `125-126` cuts the
  worktree from `origin/main`, `130` points the lead into that worktree. `ITEM-LEAD.md` and
  `scripts/latest-model.mjs` come from the same snapshot, so brief and resolver cannot skew. The
  three installed scripts are byte-identical to the repo copies (`cmp`), and
  `raven-dated-2.1.timer` is loaded for 2026-11-23 18:00 UTC. A merge after a lead has started
  does not reach that lead; follow-up runs read main at their own fire time.
- **Shell.** The `&&` form is correct inside the briefs: `$M` expands in the lead's shell before
  `hc run`, so `systemd-run --scope` receives a literal ID. `$HC_TERMINAL_ID` lines are unchanged
  and right (the launcher unsets it at line 23; the lead's own terminal sets it). Under the
  launcher's PATH with `env -i`, `node` is `/usr/bin/node` v26 and the resolver returns
  `gpt-6.2-sol`, `gpt-6.2-astra`, `gpt-6.1-terra`, `grok-4.7`.
- **Briefs.** The Children blocks of 2.1 and 2.2a are identical, so one edit pattern fits all
  four. `PRESTAGE.md`, the unit files and the dated scripts name no model version. No test reads
  the briefs, the roster line or the AGENTS.md clause.
- **Completeness.** No other live pin in `README.md`, `CONTRIBUTING.md`, `docs/`, `.agents/skills/`,
  `.github/`, `src/` or the eval scripts. The plan's record list is right, including
  `usage/report-site/src/launch.js:64` and `eval/qa/README.md:442`. The only live miss is
  finding 3.
- **Spend.** One review round and the stated stop rule fit AGENTS.md. With finding 2 adopted the
  item needs no deploy.
