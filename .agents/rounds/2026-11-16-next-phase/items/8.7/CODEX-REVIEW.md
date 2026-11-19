# Item 8.7 Codex review

Reviewer model `gpt-6.2-sol`, effort `high` (launch configuration). Reviewed
`np/8.7-playground-billing` at `9b7779f0` against `origin/main` at `48f034d3`.

## Verdict

**CHANGES.** The default matrix is correct for the current shipped configuration. The billing
instructions can send a paid run through a path that cannot answer the selected question, or send a
shared-surface change to the Gateway without the evidence required by the reconciled plan.

## Findings

1. **Blocking — Selecting a model alone cannot verify its Gateway-logged ID.** The routing row at
   `eval/EVALS.md:109` names the logged ID and prescribes E2 with `--models`. The invocation example
   at `eval/playground/README.md:3` likewise gives `--models` and `--confirm-paid` without a budget.
   E2 omits the accounting header without `--max-budget-usd` and then discards `evalCost` entirely
   (`scripts/run-demo-model-gauntlet.mjs:355–360,385–399`). The configured ID printed in the launch
   plan is independent of the observed ID. The table also omits the plan's distinct cost-settlement
   question (`.agents/rounds/2026-11-16-next-phase/items/8.7/PLAN.md:53`). **Fix.** Use a matching
   saved receipt or log when it can decide the logged-ID question. When live evidence is needed,
   specify `--models` with an authorized `--max-budget-usd` and compare the observed IDs with the
   configured ID. Add the cost-settlement row with offline coverage and live settlement as part of
   an already authorized product run. Qualify `eval/playground/README.md:162`, which says other
   vendors are covered only by mocks. The dated E2 summary already records exact live IDs for Haiku,
   Sonnet, Kimi and Grok (`research/gauntlets/2026-11-03-sweep-probe-summary.md:19–20,26–31`).

2. **Should — The shared-surface trigger lost its before-and-after condition.** `eval/EVALS.md:112,115`
   can sweep an ordinary MCP wording edit into the Playground prompt row because `SERVER_INSTRUCTIONS`
   and the tool descriptions feed both surfaces (`src/demo/prompt.ts:28`, `src/demo/tools.ts:302,442`).
   Its transcript trigger also fires on an existing over-cap answer. The plan requires that the
   change move the count past a cap (`.agents/rounds/2026-11-16-next-phase/items/8.7/PLAN.md:58–64`).
   The skill and decision record route shared changes to subscriptions without mentioning the
   conditional sample (`.agents/skills/run-evals/SKILL.md:65–67,97–103`,
   `.agents/rounds/2026-11-16-next-phase/DECISIONS.md:198–201`). **Fix.** Scope the prompt row to
   Playground-specific changes and put shared changes on subscription QA first. Add E1 only when
   changed shared text affects the specified Playground constraint or matched stored transcripts
   show the change crossing a cap. Count actual MCP `search` and `execute` calls. The plan report's
   `searchQueries` also counts searches nested inside `execute` (`eval/plan/grade-plan.mjs:249–258`).
   Point the skill and decision record to this rule.

3. **Should — The default smoke can exercise a different Gateway or request from the changed product.**
   `eval/EVALS.md:120–123` prescribes E2 default after a Gateway setting or model-config change.
   E2 forces `DEMO_AI_GATEWAY_ID:stellar-raven-demo` and passes a slug-only override
   (`scripts/run-demo-model-gauntlet.mjs:239–245`). The Worker uses the Gateway var and derives wire
   mode from the entire tuple (`src/demo/chat.ts:232–246,266–270`). For example, a Terra/Grok tuple
   uses Chat, while Terra alone uses Responses. Slug overrides also drop any per-entry effort
   (`src/demo/model-config.ts:49–67,98–108`). The current Terra/Haiku tuple is covered by the
   offline request-equivalence check (`test/demo-chat.test.ts:460–473`). **Fix.** State that E2
   default verifies isolated requests on the configured test Gateway. For a tuple change, confirm
   offline equivalence and pin `--openai-api-mode` and `--reasoning-effort` where needed. For a
   Gateway ID change, use a reviewed harness configuration that actually targets the changed ID.
   The current E2 default cannot verify that change.

4. **Should — A plan-only comparison can skip subscription judging.** `eval/EVALS.md:112` combines
   answer quality and plan in the same paired E1 instruction. The E1 default invokes the judge, but
   `--no-judge` preserves the tool transcript (`scripts/run-playground-semantic-eval.mjs:79,822–834,892–916`).
   `eval:plan` accepts those rows and computes plan metrics without a verdict
   (`eval/plan/grade-plan.mjs:278–295,383–391`). **Fix.** Use stored matched traces where possible.
   If new Playground traces are necessary for a plan-only question, use E1 with `--no-judge` and
   the offline plan grader. Include the judge when the decision needs factual answer grades.

5. **Should — The gauntlet header conflates two historical results.** At
   `scripts/run-demo-model-gauntlet.mjs:45–48`, the August 6 matrix is attributed to GPT-6.1 Terra.
   `git show face6a28:scripts/run-demo-model-gauntlet.mjs` puts GPT-5.6 Terra in that matrix.
   The November 3 probe and November 10 8/8 run support GPT-6.1 Terra directly
   (`research/gauntlets/2026-11-03-sweep-probe-summary.md:16`,
   `research/audits/2026-11-10-playground-gpt61-terra-recheck.md:27–31`). The same header says
   Haiku passed 16/16 turns. That denominator is for the five required promotion fields, while
   the broader diagnostic passed 14/16 after two missed expected search calls
   (`research/audits/2026-11-09-playground-product-decision.md:74`). Gauntlet `pass.overall`
   includes expected search use (`scripts/run-demo-model-gauntlet.mjs:402–414`). **Fix.** Use the
   November evidence for 6.1 and name both Haiku denominators with their criteria. Their reported
   costs still support the estimated USD 0.40–0.45 for the current tuple.

6. **Nit — The default-matrix test checks values and order.** `test/demo-model-config.test.ts:82–84`
   immediately catches the old three-model list or a reversed pair. A literal copy of both current
   IDs passes until the next tuple change. **Fix.** If the intent is to detect matching literals
   immediately, load the gauntlet against a substituted tuple with distinct IDs and assert the
   resulting default launch plan. Otherwise describe the existing assertion as a drift check.

7. **Nit — The accounting coverage text still describes an OpenAI fallback.**
   `eval/playground/README.md:87` says the OpenAI Responses primary and fallback share accounting.
   The shipped fallback is Anthropic (`src/demo/model-config.ts:19–31`) and follows the Anthropic
   transport in the table above that sentence. **Fix.** Name the two paths used by the shipped
   tuple and the shared ledger.

## Verification

- The shipped current IDs appear in order in the default launch plan. There are eight prompts,
  one effort and one repeat, for 16 turns on Wrangler ports 8890–8891 and inspector ports
  9890–9891. Explicit `--models` and a single prompt still produce a one-turn plan. The existing
  24-turn test selects its own two models, two efforts, two prompts and three repeats.
- `npm test -- test/demo-model-config.test.ts test/demo-gauntlet-cli.test.ts test/model-call-billing.test.mjs`
  passed all 57 tests. The billing guard and exception list are unchanged. The changed skill adds
  no provider endpoint, Gateway token, chat-route string or AI SDK import.
- Both runner syntax and help checks passed. `git diff --check origin/main...HEAD` passed.
  `git diff --exit-code origin/main -- src/ package.json package-lock.json wrangler.jsonc` was
  empty, so the branch leaves Worker inputs unchanged.
- The second-judge conclusion matches the recorded evidence for the tested versions and
  configurations. Codex exposed definitions offline. Grok executed the canary read, and OpenCode
  remains the candidate with execution permissions denied in the offline config check.
- This review used the focused offline suites and the executor's recorded full-gate results.
  It made zero model, eval, Gateway or paid calls and opened no QA case file.
