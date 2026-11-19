# Item 8.8 plan: no per-run approvals

Lead: Claude Opus (`claude-opus-5-5`), agentpc `t202`. Branch `np/8.8-no-per-run-approvals` from
`origin/main` at `7121bba2` (#497). Binding notes: `/home/tyler/code/raven-wt/orch/8.8-NOTE.md`
and `/home/tyler/code/raven-wt/orch/7-COMMON.md`.

## Decision this item changes

Owner (2026-11-19, verbatim): "we can honestly remove all per turn or per request approvals, I don't
want to be approving things, we should relax these guidelines anywhere and everywhere they show up
especially for sub use"

Today the repository makes an agent obtain someone's written authorization, approval, signature or a
typed confirmation flag before a model-calling run. After this item, agents decide and run, then
record what they ran, why, and what it cost. What stays is discipline, enforced automatically where
possible:

- Subscriptions first (AGENTS.md, `eval/EVALS.md` "Model-call billing"). A subscription run needs no
  authorization of any kind. The pre-run billing checks (`assertClaudeSubscription`, login status, no
  API key in the environment, the OpenCode probe) stay: they are automatic cost guards.
- The AI Gateway exceptions E1 and E2 and the question → path table stay, minus "needs its own
  written authorization". Every run carries a hard dollar cap sized to the question.
- An API-billed path outside the exception list stays out by rule. If a lead judges one necessary,
  it records why and runs it under a hard cap; no owner approval. Said once, in `eval/EVALS.md`
  "Model-call billing"; AGENTS.md points there.
- Least spend that decides, stop rules, cost beside accuracy, "never in a gate sweep" stay.

## Default caps (chosen from #497's sizing)

| Run | Documented default cap (`--max-budget-usd`, required on every paid launch) | Basis |
|---|---|---|
| E2 shipped-tuple smoke (gauntlet default) | USD 1 | 16 turns, USD 0.40–0.45 measured. The capped path is stricter than production: SDK retries off, one Gateway attempt per call, and a turn with no reported cost stops the matrix (`scripts/run-demo-model-gauntlet.mjs:210-213, 302-314`) |
| E2 on one candidate model | USD 1 | Terra 8 turns USD 0.355 |
| E1 run | USD 0.20 per selected case, rounded up to a whole dollar, minimum USD 2 (5 cases: 2; 30 cases: 6) | Measured about USD 0.11 per case (30 cases: answers 1.383 + judge 2.016) |
| One candidate, all in | Two invocations: gauntlet 1 + E1 30 cases 6; expected total USD 3.75; the ledger row records the sum | 2026-11-10 worked example (`research/audits/2026-11-10-playground-gpt61-terra-recheck.md:84`) |
| QA runner, re-judge, discovery (subscription) | Required `--max-budget-usd` sized from stored runs (run-evals §5 step 4) | Unchanged: an existing cost guard, not an approval |
| Judge self-test (subscription) | Its fixed 7 × USD 0.50 | Unchanged |

A cap above these defaults is the lead's call; the ledger row records the cap, the reason and the
reported cost.

## Code gates: classification

Approval gates (change):

1. `scripts/run-demo-model-gauntlet.mjs` (E2) `--confirm-paid`. Remove the flag (no alias). A launch
   requires exactly one `--max-budget-usd`; there is no default cap and no `--dry-run` flag. Without
   the cap flag the script prints the validated launch plan and exits non-zero with "pass
   --max-budget-usd <usd> to launch (the shipped-tuple smoke uses 1)", before any filesystem,
   credential or Wrangler work. The uncapped CLI path disappears. Rewrite
   `test/demo-gauntlet-cli.test.ts:42-50` (expected message) and `:172-176` (drop `--confirm-paid`) in
   the same edit as the script, and add a test that `--confirm-paid` is rejected as an unknown flag.
   Never run `npm test` between the script edit and the test edit (review finding 2).
2. `scripts/run-playground-semantic-eval.mjs` (E1) `--confirm-paid`. Remove the flag. A
   model-backed run is any invocation without `--dry-run`, `--preflight`, `--print-generation` or
   `--help`, and it still requires exactly one `--max-budget-usd` (no default: E1 sample sizes vary
   from 5 to 30 cases). Update the usage text and examples, `npm run eval:playground` examples in
   docs, and `test/playground-budget.test.ts`.
3. `--round-cap-context` (E1, `eval/playground/artifact-contract.mjs`
   `assertModelBackedRunInputs`). It is a cumulative call-cap file across a round, with a
   `not-applicable` kind that needs a reason. Make it optional: when absent, the runner records
   `roundAuthorization: { contract, kind: "not-applicable", reason: "single run: no round cap context
   given", sourceFile: null, …all cap fields null, runAllocation: null }` (keep `experimentId`
   required only for `reviewed-round`, or auto-fill it with the run ID; executor picks whichever
   keeps the validator simplest and says which). The validator accepts `sourceFile: null` only for
   `not-applicable`; a `reviewed-round` still needs the file and its hash. Stored artifacts keep the
   field name `roundAuthorization` and stay valid. Docs drop "reviewed" as a launch precondition:
   the file is the agent's own cumulative cap when a round runs several E1 invocations.
4. `eval/qa/paired-collection-supervisor.mjs` `--authorized-plan-sha256`. The hash binding is an
   integrity guard (frozen plan bytes and command arrays) and stays; the name implies an approver.
   Rename the flag to `--plan-sha256` and `validateAuthorizedPairedCollectionPlan` to
   `validateFrozenPairedCollectionPlan`, error text "plan SHA-256 does not match…"; keep the
   "authorization record must stay external" check only if a stored plan could carry that key,
   otherwise reword to "the plan must not embed its own hash record". Update
   `test/qa-paired-collection-supervisor.test.mjs` and `eval/qa/README.md`.

Cost or integrity guards (keep; wording only where a comment says "approval"):

- `eval/qa/spend-budget.mjs` (sequential budget ledger; its `authorize`/`authorizedUsd` vocabulary
  is the budget mechanism and appears in stored artifacts: keep).
- `eval/qa/run-qa.mjs`, `re-judge.mjs`: required `--max-budget-usd`, identity pins, no resume of a
  stopped ledger. Keep.
- `eval/discovery/run-agent-discovery.mjs`: required binary/environment/surface hashes, server
  revision and cap. Keep; change the comment "malformed approval" to "malformed preconditions".
- `eval/qa/run-p6-judge-self-test.mjs`: fixed calls and cap, signed listener digest (integrity).
  Keep.
- `scripts/improvements-run-probes.mjs` "auth probe target is not approved": the allowlist of
  hosts a secret may be sent to. Security guard. Keep.
- `--server-generation` on E1: binds the run to the working tree. Keep.
- `eval/playground/artifact-contract.mjs` `infraRetryAuthorized: false`, `accountingPolicy`
  string: stored-artifact schema. Keep.

The executor re-runs this search before editing and adds any gate it finds that this list misses
(classify it the same way, and say so in EXEC.md):
`rg --hidden -g '!.git' -n -i "confirm-paid|authori[sz]ed-|--approve|run sheet|owner.?(token|sign)" eval scripts package.json .github`

## Documents and skills (exact edits)

1. `AGENTS.md` (proposed text; the report quotes it):
   - Commands: "Never put a model-calling eval command in a gate sweep. Those commands cost money and
     need their own authorization (the `run-evals` skill)." → "Never put a model-calling eval command
     in a gate sweep: it costs money. Run it on its own, sized and capped by the `run-evals` skill."
   - Spend, subscriptions bullet: replace "Any other API-billed run needs the owner's written approval
     naming the run." with "Every API-billed run carries a hard dollar cap and is recorded with its
     cost; [`eval/EVALS.md`](eval/EVALS.md) \"Model-call billing\" says what happens outside the
     list."
   - Delete "A paid method needs its own written authorization. A diagnostic budget does not
     transfer to headline collection." Add after "Decide with the least spend…": "**No per-run
     approvals.** No run needs the owner's or anyone's approval, signature or confirmation flag.
     Subscription runs need none of any kind. Decide, run under a hard cap, and record each run, its
     reason, answer count and cost in the round ledger or item record."
   - Owner delegations: replace the "Owner signatures on reviewed run sheets" bullet with "**Run
     evals without asking.** Pick and run the least-spend instrument that decides, under its hard cap,
     and record it. Keep every stop rule and independent review the work needs. Add no paid method the
     done criterion does not need. Outward-facing posts still need the owner's approval." Drop "or
     sign" from the section's lead sentence.
   - "Spend and evidence" footer: "A paid method needs its own written authorization" is gone;
     "The `run-evals` skill has the measurement procedure" stays.
2. `eval/EVALS.md`: the source-of-truth bullet "owns round coordination and required approval steps"
   → "owns round coordination and run sizing". Rule 7: drop "under its own authorization". Rule 8:
   "or authorize another paid run" → "or decide that another paid run is needed". "Model-call billing"
   opening: replace the two approval sentences with the outside-the-list rule (record why, hard cap,
   no approval) and "No run needs anyone's approval; the checks below are automatic". Question table:
   "an authorized `--max-budget-usd`" → "a `--max-budget-usd` cap"; "inside an already authorized
   product run" → "inside a product run that is happening anyway". "Sizing. Every tier needs its own
   written authorization; none is standing." → "Sizing. Each tier runs under the default cap below;
   record the run and its cost." Add the default-cap table from this plan.
3. `.agents/skills/run-evals/SKILL.md`: replace "A paid run needs the owner's spending
   authorization. One call-count or dollar authorization covers one method run; a re-run needs its
   own…" with "No run needs approval. One cap covers one method run; a re-run gets its own cap and
   its own ledger line." Line 68 the same as AGENTS.md. §4 self-test "under its own authorization"
   drop. §5 step 3: "a new pin needs a new authorization. Never resume a stopped artifact under the
   same authorization." → "a new pin starts a new run. Never resume a stopped artifact under the
   same budget ledger." Check `references/*.md` with the same search and fix any approval line.
4. `eval/qa/README.md`: lines 5, 69, 114, 131, 167, 171, 373, 442, 581, 791–825, 851 (re-locate by
   search): "obtain paid-call approval" → "plan and size a round"; "authorization" meaning the budget
   ledger becomes "budget"; owner signature on the paired plan becomes "freeze the plan and record
   its hash" with the renamed flag; "requires separate approval" → "is paid and runs only when its
   trigger holds".
5. `eval/playground/README.md`: line 42 "Each tier needs its own written authorization." → "Each
   tier runs under its default cap (`eval/EVALS.md` sizing)."; line 110 "records each authorization
   and reported cost" → "records each run, its cap and reported cost"; all `--confirm-paid`
   examples; `--round-cap-context` described as optional; line 3 gauntlet usage (`--dry-run`).
6. `eval/agentic/README.md` line 5, `eval/discovery/README.md` 42–43 (wording only: "remaining
   budget"), `PLAN.md` lines 40–45 ("requires written authorization for a paid method" → the
   cap-and-record rule), `ecosystem-skills/README.md` (only lines that require approval for a run;
   leave the deploy line, see out-of-scope).
7. `.agents/TODO.md`: every item whose next step or trigger waits on an owner or written
   authorization for a run (lines near 10, 38, 115, 1052, 1076, 1085, 1112, 1150, 1271, 1279, 1506,
   1508; re-locate by search). Rewrite the next step so an agent can do it within the caps. Keep
   owner decisions that are product or direction calls (for example "no third tuning loop", "the
   owner retires the question", a general scoring repair that changes the baseline policy): those
   are not run approvals. List each touched item and its old/new trigger in EXEC.md.
8. `.agents/rounds/2026-11-16-next-phase/briefs/ITEM-LEAD.md` Rules "Spend": replace "No
   model-calling eval, paid call, AI Gateway call or Workers AI call unless your item in
   DECISIONS.md authorizes it. Only item 4.1 does." with the 7-COMMON spend rule (subscriptions on
   `hc`, Gateway only for an EVALS.md exception under a hard cap, no approval, record each run and
   cost).
9. `.agents/rounds/2026-11-16-next-phase/DECISIONS.md`: new section "Follow-up answers
   (2026-11-19, no per-run approvals)" with the owner's words verbatim, the question it answered,
   and "Applied by item 8.8" plus the caps chosen.
10. `.agents/model-roster.md`: no approval lines found (only `--always-approve` CLI flags, which
    are tool-permission flags, not owner approval). No change.
11. Dated briefs (`items/1.4/dated/*`): the search finds no line that requires approval before a
    step. No change; EXEC.md says so.
12. Round ledger row for 8.8 (lead adds at verify).

Historical records (DECISIONS.md earlier sections, `research/`, earlier item records, `improvements/`
receipts) stay unchanged.

## Out of scope (listed for the orchestrator in the report)

End-user consent in the Worker (AGENTS.md hard rules on paid or side-effecting model operations,
Lumenloop paid research, Mintlify admin), outward-facing posts (upstream issues, `improvements`
filing), security-boundary design studies and approval gates, merge and deploy gates (for example
`ecosystem-skills/README.md` "deploy with the owner's approval", `live-drift-resolution` "`npm run
deploy` needs the owner's go-ahead unless durably authorized"). The report says whether any of these
holds a per-request owner approval the owner's words should reach, quoting it.

## Gates

- `npm run typecheck`, `npm test`, `npm run build` (bare).
- `npm run test:smoke` is not required (no `src/executor` or `src/demo` change); run it anyway only
  if the executor touches `src/`.
- CONTRIBUTING "Checks" for `eval/`: `npm run eval:selftest`, `npm run eval:routing -- --gate`
  (free). Not the QA lint (7-COMMON forbids it).
- Dry proofs, no model call: `node scripts/run-demo-model-gauntlet.mjs --dry-run` prints the plan and
  exits 0; `npm run eval:playground -- --dry-run` (and `--preflight` is not needed) succeeds without
  `--confirm-paid`; `npm run eval:qa:paired:collect` usage error names `--plan-sha256`.
- `npm run secrets:scan -- --tree`.
- Worker bytes: compare `npm run build` output (`dist/` or the wrangler dry-run bundle hash) before
  and after; expected unchanged.
- Codex Sol reviews the code diff (scripts, eval code, tests).

## Stop rule

Done when the final search (`rg --hidden -g '!.git' -n -i "authori[sz]|approv|sign(ed|ature)? for|written approval|confirm-paid"` over AGENTS.md, CONTRIBUTING.md, PLAN.md, README.md, docs/, eval/*.md, eval/*/README.md, `.agents/skills`, `.agents/TODO.md`, `.agents/model-roster.md`, ITEM-LEAD.md, scripts/, eval code) shows no line that requires approval, authorization, a signature or a confirmation flag before a run, other than the out-of-scope list; gates pass; Sol's findings are reconciled. No model-calling run is made.

## Risks

- A bare `node scripts/run-demo-model-gauntlet.mjs` now launches paid turns (capped at USD 1). Usage
  text and docs lead with `--dry-run`; `--help` stays harmless.
- Renaming `--authorized-plan-sha256` breaks any uncommitted operator script; there is none in the
  repo, and the plan is uncommitted by contract.
- Over-editing TODO items could erase real owner product decisions. Mitigation: the executor lists
  each change and its classification in EXEC.md; the lead reads every TODO hunk.
- The `roundAuthorization` contract change must keep old artifacts valid; tests cover both shapes.

## Needs from the orchestrator or owner

None to start. The report will quote any out-of-scope per-request approval the owner may want
reached.

## Review reconciliation (REVIEW.md, Claude Fable `claude-fable-5-2`)

These bind over anything above that they contradict.

1. Adopted: E2 has no default cap and no `--dry-run`; a launch requires `--max-budget-usd` (code gate 1
   rewritten above). A bare invocation prints the plan and refuses.
2. Adopted: test order and the unknown-flag test (code gate 1). Same for E1: add to
   `test/playground-budget.test.ts` that `parseArgs([])` throws the "exactly one `--max-budget-usd`"
   error and `parseArgs(["--confirm-paid"])` throws as an unknown flag.
3. Adopted: caps table rewritten (per-case E1 cap; one-candidate row as two per-invocation caps;
   the E2 strictness note). The table goes into `eval/EVALS.md` "Sizing".
4. Adopted. `.agents/TODO.md:38` becomes: "No third tuning loop (owner, 2026-11-16, decision 1). A QA
   headline run starts only when a named decision needs it (`run-evals` section 1); it needs no
   approval." Line 10 becomes: "The spend rules in AGENTS.md apply to every item: a run needs no
   approval, and each runs under a hard cap and is recorded with its cost." The DECISIONS.md section
   says the 2026-11-19 answer supersedes the second sentence of answer 1 ("No paid QA run without a
   new written authorization") and the first ("No third tuning loop") stands; answer 1's own text
   stays. TODO classification, binding on the executor:
   - Rewrite (run approval): 115; 447-449 (keep the independent plan review, drop the spend
     authorization); 1052, 1076, 1085, 1150, 1271, 1279; 1112 first half (keep "or the owner accepts
     them"); 1504-1508 wording only ("No item here authorizes a paid run", "an authorized A/B").
   - Keep (direction calls or not runs): 481 (scoring repair), 1441 (phase-zero study), the 1504
     "owner funds" trigger itself, 1303 (orchestrator approval of a list), 422, 604, 711-715, 927.
   Line numbers are from `7121bba2`; locate by text.
5. Adopted. AGENTS.md: in "Spend and evidence", the deleted "A paid method needs its own written
   authorization…" bullet is replaced by: "**No per-run approvals.** A model-calling eval, test or
   build run needs nobody's approval or signature. Decide, run it under a hard cap, and record the
   run, its reason, answer count and cost in the round ledger or item record. A lane stays inside its
   brief." In "Owner delegations": delete the signature bullet with no replacement, drop "or sign"
   from the lead sentence, and append "Outward-facing posts still need the owner's approval." to the
   merge-and-deploy bullet. No heading changes. The gate-sweep line becomes "Never put a
   model-calling eval command in a gate sweep: it costs money. Run it on its own, sized and capped by
   the `run-evals` skill."
6. Adopted (a refinement of the orchestrator note's wording, kept within its intent: no owner
   approval). The one statement in `eval/EVALS.md` "Model-call billing": an API-billed path outside the
   list first becomes a listed exception, with its reason in that section and, if code names the
   endpoint, the allowlist in `test/model-call-billing.test.mjs`, in a reviewed pull request; then it
   runs under a hard cap. No owner approval. AI Gateway judging stays out without exception (owner,
   2026-11-18). AGENTS.md's subscriptions bullet: "Every API-billed run carries a hard dollar cap and is
   recorded with its cost; an unlisted path first joins the list in a reviewed pull request
   ([`eval/EVALS.md`](eval/EVALS.md) \"Model-call billing\")."
7. Adopted. `--round-cap-context` optional; when absent the runner auto-fills `experimentId` with the
   run ID and records `kind: "not-applicable"`, a reason, `sourceFile: null` and null caps. The
   validator accepts `sourceFile: null` only for `not-applicable`. Rewrite
   `eval/playground/README.md:150-158, 166`: what makes an E1 result evidence is the pre-registered
   decision and stop rule (`run-evals` section 1), not the cap file; the file is the agent's own
   cumulative call cap for a round with several invocations; "reviewed-round" and `roundAuthorization`
   stay as stored contract names (say so once). Update `test/playground-eval-contract.test.ts:286` and
   add tests for both shapes.
8. Adopted. Also edit: `eval/qa/README.md:653` ("For an approved paid run" → "For a paid run"),
   `eval/discovery/README.md:17, 34` (approved cap / approve that server → cap / prepare that server).
   Keep as discipline, name in EXEC.md: `run-evals/SKILL.md:39-43` independent review of the four
   lines (an agent review, not an owner approval; 7-COMMON keeps pre-registration review) and
   `run-evals/references/source-addition.md:4`. Left alone, named in EXEC.md: the list in REVIEW.md
   finding 8 "Checked and correctly left alone".
9. Adopted. Rename, move or delete no heading in `AGENTS.md`, `eval/qa/README.md` or `.agents/TODO.md`
   (item 8.2 hold, `.agents/TODO.md:1300-1303`; run 2.1 fires 2026-11-23). Do not touch "Held-out split"
   or "Searching without reading case text". After the edits, check with `rg -F` that every TODO heading
   named in `items/1.4/dated/*.md` and `items/1.4/dated/items.json` still exists.
10. Adopted. Drop the `eval:playground -- --dry-run` gate (it reads case files and proves nothing);
    the unit tests in 2 replace it. Run `npm run eval:qa:register -- --check` (CONTRIBUTING). Worker
    bytes proof: `git diff --stat origin/main -- src catalog specs ecosystem-skills/catalog.json wrangler.jsonc`
    is empty (the lead also compares `dist/` hashes it captured before).
11. Adopted. Stop-rule search adds `go-ahead|blocks launch|owner (funds|signs)|owner-signed|signature`
    and the paths `ecosystem-skills/README.md`, `test/`, `package.json`, `.agents/README.md`. It stays a
    read, not a zero count: kept names (`authorizeSpend`, `authorizedUsd`, `roundAuthorization`,
    `maxAuthorizedCostUsd`, OAuth text) still match.
12. Adopted. Rename to `--plan-sha256` and `validateFrozenPairedCollectionPlan`, no alias; delete the
    "authorization record must stay external" check and its test (`test/qa-paired-collection-supervisor.test.mjs`
    near 1207); EXEC.md records that the plan hash now guards the plan bytes. Keep `maxAuthorizedCostUsd`.
13. Adopted: "malformed approval" → "malformed flags".
14. Adopted: the report quotes `ecosystem-skills/README.md:174-175` and
    `live-drift-resolution/SKILL.md:156` and points at held item 8.2 O-10. Not edited here.
