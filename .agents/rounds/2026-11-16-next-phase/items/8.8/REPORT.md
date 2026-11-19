# Item 8.8 report: no per-run approvals

Lead: Claude Opus (`claude-opus-5-5`), agentpc `t202`. Worktree `/home/tyler/code/raven-wt/np-8.8`, branch
`np/8.8-no-per-run-approvals`.

## Pull request and result

[#498](https://github.com/stellar-experimental/stellar-raven/pull/498) (`Refs #497`, no closing keyword).
Docs, skills, the TODO list, the ITEM-LEAD brief, DECISIONS.md, eval scripts and tests now ask nobody for
approval, a signature or a confirmation flag before a run. Agents decide, run under a dollar cap, and
record each run with its reason and cost. These guards stay: subscriptions first, the pre-run billing
checks, the E1/E2 exceptions and their allowlist test, identity pins, budget ledgers, and "never in a gate
sweep". Records: [PLAN.md](PLAN.md), [REVIEW.md](REVIEW.md) (Fable), [EXEC.md](EXEC.md) (Sonnet),
[CODEX-REVIEW.md](CODEX-REVIEW.md) (Sol).

Gates, run bare by the lead on the final tree, all exit 0:
- `npm run typecheck`
- `npm test` (4285 passed, 3 expected fail)
- `npm run build`

The executor also ran these, all exit 0:
- `npm run eval:selftest`
- `npm run eval:routing -- --gate`
- `npm run eval:qa:register -- --check`
- `npm run secrets:scan -- --tree`

CI is pending at the time of this report. No model-calling run was made; cost USD 0.

### Code gates

| Gate | Decision |
|---|---|
| `--confirm-paid` on E2 (gauntlet) and E1 (`eval:playground`) | Removed. Every model-backed launch requires exactly one `--max-budget-usd`. Without it, E2 prints its plan and refuses before any Wrangler or credential work, and E1 refuses before any request. |
| `--round-cap-context` on E1 | Optional. Without it the run records a single-run `not-applicable` context. Stored artifacts stay valid. |
| `--authorized-plan-sha256` on the paired supervisor | Renamed `--plan-sha256`. The hash binding stays. |
| Budget ledgers, identity pins, discovery preconditions, the self-test cap, the probe credential allowlist, `--server-generation` | Kept. These are cost and integrity guards. |

### Default caps

These are documented in `eval/EVALS.md` "Sizing". They are not built into the scripts.

| Run | Cap |
|---|---|
| E2 shipped-tuple smoke | USD 1 (measured USD 0.40–0.45) |
| E2 on one candidate | USD 1 |
| E1 | USD 0.20 per case, rounded up, minimum USD 2 (5 cases: 2; 30 cases: 6) |
| One candidate, all in | Gauntlet 1 plus E1 6; expected USD 3.75 |

A cap stops the next call. One in-flight call can go past it, and the docs say so.

### Where this differs from the note

The note said a lead that judges an unlisted API-billed path necessary should record why and run it under a
hard cap. I adopted Fable's refinement instead: the path first joins the `eval/EVALS.md` exception list in a
reviewed PR, then runs capped. There is still no owner approval. This keeps the owner's 2026-11-18 wording
"rare, known, and reasoned exceptions" whole, and `test/model-call-billing.test.mjs` already enforces the
allowlist for committed code.

Owner decision 1, "No paid QA run without a new written authorization", is recorded in DECISIONS.md as
superseded by the 2026-11-19 answer. "No third tuning loop" still stands.

## Deploy

None needed. `dist/server.js` and its map are byte-identical to `origin/main`, and the change is not
model-facing.

## For the orchestrator on the Mac

Nothing is required for this PR. Context for the merge:

- Run 2.1 fires 2026-11-23 and reads AGENTS.md, `eval/qa/README.md` and `.agents/TODO.md`. This PR changes
  sentences only in those files: every heading is unchanged, and every TODO anchor the dated briefs name
  still exists.
- The dated briefs needed no change. They forbid model-calling runs outright, which limits scope; it is not
  an approval step.

## Open questions for the owner

1. **Two per-request deploy approvals are still in place.** I did not edit them because the note puts merge
   and deploy gates out of scope. Both contradict AGENTS.md's standing "run `npm run deploy` without asking",
   and both sit in held item 8.2 O-10 (`.agents/TODO.md`, the 8.2 hold, until about 2026-12-04):
   - `ecosystem-skills/README.md:174-175`: "Get an independent review (`AGENTS.md`), record it in a round
     ledger, and deploy with the owner's approval."
   - `.agents/skills/live-drift-resolution/SKILL.md:156`: "`npm run deploy` needs the owner's go-ahead unless
     durably authorized."

   Should they be relaxed now, or left for O-10?
2. **Other approvals I kept.** None of these is a per-run spend approval:
   - The Worker's end-user consent and elicitation for paid or side-effecting model operations (AGENTS.md
     hard rules).
   - Lumenloop paid research and Mintlify admin.
   - "Outward-facing posts still need the owner's approval" (AGENTS.md).
   - `run-evals` "Get an independent review of the four lines … A missed review blocks launch". This is an
     agent review that 7-COMMON keeps; no owner signs it.
   - TODO triggers that are owner direction calls: the general scoring repair, the phase-zero study, and
     "the owner funds a … codegen A/B".
3. **Deferred defect.** Sol found a pre-existing bug: a tiny cap or remainder such as `0.0000005` is sent as
   `5e-7`, and the Worker rejects it with HTTP 400. It fails closed and costs nothing, so it is not filed.
4. **Dated research script.** `research/audits/2026-11-06-playground-final-resolution/orchestrate.mjs` still
   passes `--confirm-paid`. Re-running it would now fail with "Unknown argument". Research records stay
   unchanged.

## Orchestrator additions (2026-11-19, commits on top)

1. **Deploy approvals relaxed.** Per the orchestrator's instruction, the owner's 2026-11-19 words override
   the 8.2 O-10 hold for these lines. `ecosystem-skills/README.md` step 8 now reads "deploy without asking
   under the owner delegation in `AGENTS.md`". `live-drift-resolution` "Deploy and close" step 2 now reads:
   after the independent review, run `npm run deploy` without asking under the AGENTS.md owner delegation,
   and record it in the ledger. The O-10 bullet in the TODO item "Apply the item 8.2 deferred
   documentation changes" now holds only posting authority.
2. **Cap formatting fixed (Sol finding 4).** `formatBudgetUsd` (`eval/qa/spend-budget.mjs`) now returns a
   plain decimal at ledger precision, for example `0.0000005` instead of `5e-7`. It refuses values that
   cannot be written that way. Both Playground scripts now send `x-raven-eval-max-budget-usd` through it.
   Ordinary values format exactly as before, so stored command arrays and the run-qa and discovery
   arguments do not change.

   The tests were written first and failed before the fix: four failures, including the gauntlet loopback
   test that captured the sent header as `'5e-7'`. All pass after it:
   - `test/qa-budget.test.mjs`: formatter cases.
   - `test/demo-gauntlet-cli.test.ts`: a "tiny cap" loopback case that records the header the script sends
     and checks it against the Worker's regex.

Gates rerun bare on the new head, all exit 0:
- `npm run typecheck`
- `npm test` (4293 passed, 3 expected fail)
- `npm run build`
- `npm run eval:selftest`
- `npm run secrets:scan -- --tree`

The Worker bundle (`dist/server.js` and its map) is still byte-identical. No deploy is needed.
