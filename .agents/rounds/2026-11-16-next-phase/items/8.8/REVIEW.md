# Item 8.8 plan review

Reviewer: Claude Fable, model ID `claude-fable-5-2`, high effort, terminal `t203`. 2026-11-19.
Read-only against branch `np/8.8-no-per-run-approvals` at `7121bba2`. No model call, no paid call,
no subagent, no case file opened. Searches used `rg --hidden -g '!.git'` only.

## Verdict

The plan is sound in direction and its keep list (budget ledgers, identity pins, billing checks,
the probe allowlist) is classified correctly. Fix findings 1 to 4 before the executor starts; they
change what the executor does. Findings 5 to 9 are edits to the plan's lists and text. Findings 10
to 14 are small.

Answers to the brief's direct questions:

- `--confirm-paid` replacement: safe on E1, not safe as planned on E2 (findings 1 and 2).
- `--round-cap-context` optional: sound, and old artifacts stay valid, with one documentation
  consequence the plan misses (finding 4).
- Renaming `--authorized-plan-sha256`: worth it, cheaply (finding 12).
- Default caps: two of six rows are wrong or unenforceable (finding 3).

## Findings

### 1. High. A bare gauntlet invocation should not launch; require the cap flag instead of adding `--dry-run`

Evidence: `scripts/run-demo-model-gauntlet.mjs:152` is the only thing between a bare invocation and
the launch at lines 154 to 211, which reads `.dev.vars`, starts one Wrangler per model
(`startWrangler`, line 241) and sends 16 turns through AI Gateway. Plan "Code gates" item 1 makes
the bare command launch under a default USD 1 cap, and "Risks" accepts that.

`--confirm-paid` asks nobody for anything: the agent types it itself. It is an interlock against an
accidental launch, and on E2 it is the only one. Agents run a script bare to see what it does. After
the plan, that costs up to USD 1 on the API-billed path the owner most wants kept small, and starts
Wrangler processes against the AGENTS.md rule "Do not start a second Wrangler process".

E1 does not have this problem: without `--confirm-paid` it still refuses unless it gets
`--max-budget-usd` and `--server-generation` (`scripts/run-playground-semantic-eval.mjs:135`,
`eval/playground/artifact-contract.mjs:105-110`).

Recommended change: give E2 the same rule as E1. Remove `--confirm-paid`. A launch requires exactly
one `--max-budget-usd`; there is no default and no `--dry-run` flag. Without the cap flag the script
prints the validated plan and exits non-zero with "pass --max-budget-usd <usd> to launch (the
shipped-tuple smoke uses 1)". This removes the approval-shaped flag and the uncapped path, adds no
new flag, and keeps one sentence true for both lanes: "a model-backed run requires exactly one
`--max-budget-usd`". `eval/EVALS.md:122-123` already tells agents to run the smoke "with
`--max-budget-usd 1`", so the documented command does not change. The default-cap table then states
documented defaults, not built-in ones.

### 2. High. Test-order hazard: the existing safety test becomes a launch

Evidence: `test/demo-gauntlet-cli.test.ts:42-50` spawns the real script with
`--models openai/test --prompts rpc-simulate --out-dir <tmp>` and no confirm flag, and expects a
refusal. Under the plan's item 1 that exact invocation launches: it reads `.dev.vars` and runs
`npx wrangler dev` from `npm test`. If the executor edits the script and runs `npm test` before
rewriting this test, the gate sweep itself starts Wrangler and may send a Gateway turn.

Recommended change: finding 1 removes the hazard (the invocation has no cap flag, so it still
refuses; only the expected message changes). If the plan keeps its own design, it must order the
work: rewrite this test in the same edit as the script, and never run `npm test` between them.
Either way, add to the plan that `test/demo-gauntlet-cli.test.ts:172-176` (the fake-`npx` launch)
drops `--confirm-paid`, and that a new test asserts `--confirm-paid` is rejected as an unknown flag
on both scripts.

### 3. High. Two default caps are wrong

Evidence: `research/audits/2026-11-10-playground-gpt61-terra-recheck.md:84` gives the worked
example as USD 0.355 gauntlet + 1.383 answers + 2.016 judge = 3.75, for 30 E1 cases.

- "One candidate, all in: USD 4 across its invocations." This is 7% above one measured run, so
  ordinary variance trips it, and a stopped E1 artifact cannot resume
  (`.agents/skills/run-evals/SKILL.md:149`), so the spend is wasted. Nothing enforces a dollar sum
  across an E2 and an E1 invocation: `--round-cap-context` counts calls, not dollars.
- "E1 run, default 5-case sample: `--max-budget-usd 2`" is fine for 5 cases (about USD 0.57
  expected), but the table gives no cap for the 30-case paired run that the one-candidate tier
  uses, and 2 does not cover its USD 3.40.

Recommended change: state E1's cap per case, not per run: USD 0.20 per selected case, rounded up to
a whole dollar, minimum USD 2 (5 cases: 2; 30 cases: 6; measured: about 0.11 per case). Replace the
"across its invocations" row with the two per-invocation caps it consists of (gauntlet 1, E1 30
cases 6; expected total 3.75), and say the ledger row records the sum. Keep the other four rows.
Also state in the E2 row that the capped path is stricter than production (SDK retries off, one
Gateway attempt per call, and a turn with no reported cost stops the matrix:
`scripts/run-demo-model-gauntlet.mjs:302-314`, `:210-213`), since after this item it is the only
path.

### 4. High. Owner decision 1 is edited without being named, and the rewrite is unspecified

Evidence: `.agents/rounds/2026-11-16-next-phase/DECISIONS.md:21` records "**No third tuning loop.
No paid QA run without a new written authorization.**" (owner, 2026-11-16). `.agents/TODO.md:38`
restates it. The plan's document item 7 lists "near 38" for rewriting and, in the same item, names
"no third tuning loop" as a decision to keep. The second sentence of decision 1 is both a per-run
approval and the hold that stops QA headline collection, whose reviewed caps were USD 80 to 240
(`eval/qa/README.md:825`). Deleting "without a new written authorization" turns a hold into a free
choice for any agent.

Recommended change: the plan states the exact new text for `.agents/TODO.md:38` and for line 10
("no item below authorizes a paid run"), for example: "No third tuning loop (owner, 2026-11-16,
decision 1). A QA headline run starts only when a named decision needs it (`run-evals` section 1);
it needs no approval." The new DECISIONS.md section (document item 9) says in one line that the
2026-11-19 answer supersedes the second sentence of answer 1 and that the first sentence stands.
Answer 1's own text stays unchanged.

Classify the other ambiguous TODO lines in the plan now, not in EXEC.md, because the executor is a
different model and the mitigation is only "the lead reads every hunk":

| TODO line | Text | Class |
|---|---|---|
| 115 | "A paid test needs its own written authorization" | Run approval: rewrite |
| 447-449 | "pass an independent plan review and its own spend authorization" | Missed by the plan. Keep the plan review, drop the spend authorization |
| 481 | "Trigger: owner authorization for a general scoring repair" | Direction call: keep (the plan agrees) |
| 1052, 1076, 1085, 1150, 1271, 1279 | "under a new/its own/a written authorization" | Run approval: rewrite |
| 1112 | "an authorized measurement, or the owner accepts them" | Rewrite the first half; keep the owner's acceptance |
| 1441 | "the owner approves a phase-zero study" | Direction call: keep |
| 1504-1508 | "the owner funds a ... codegen A/B" | Direction call (an unscoped external A/B): keep the trigger, reword "No item here authorizes a paid run" and "an authorized A/B" |
| 1303 | "waits for the orchestrator's approval of the list" | Not a run: keep |

### 5. Medium. The proposed AGENTS.md text is too wide in one place and duplicated in another

Evidence: plan "Documents and skills" item 1.

- "No run needs the owner's or anyone's approval, signature or confirmation flag." "Run" is
  unscoped, and `npm run deploy`, the paid Lumenloop research trigger and upstream posting are all
  runs in plain reading. "Anyone's" also reads past a lane's own brief: the dated leads' briefs say
  "No model-calling eval, no paid call" (`items/1.4/dated/2.1-LEAD.md:56`) and they read AGENTS.md
  at launch on 2026-11-23. "Confirmation flag" describes a flag that no longer exists, which the
  definition of done excludes ("current behavior ... not history").
- The same rule appears twice: once for everyone in "Spend and evidence" and once for the lead only
  in "Owner delegations" ("Run evals without asking"). The lead-only copy implies lanes must ask.

Recommended text for "Spend and evidence", replacing the deleted bullet:

> **No per-run approvals.** A model-calling eval, test or build run needs nobody's approval or
> signature. Decide, run it under a hard cap, and record the run, its reason, answer count and cost
> in the round ledger or item record. A lane stays inside its brief.

In "Owner delegations": delete the signature bullet without a replacement, drop "or sign" from the
lead sentence, and keep "Outward-facing posts still need the owner's approval" as the last sentence
of the merge-and-deploy bullet. Keep every heading unchanged: `PLAN.md:43-44` links
`#spend-and-evidence` and `#owner-delegations-lead-session-only`.

### 6. Medium. The outside-the-list rule must not reopen what the owner closed on 2026-11-18

Evidence: DECISIONS.md "Follow-up answers (2026-11-18)": "There should be NO gateway judging ...
except or rare, known, and reasoned exceptions". The plan (and the orchestrator's note) lets a lead
run an unlisted API-billed path after it "records why". That drops "known".
`test/model-call-billing.test.mjs:49-58` already fails any committed code that names a Gateway or
provider endpoint outside its allowlist.

Recommended change: write the single statement in `eval/EVALS.md` "Model-call billing" as: an
unlisted API-billed path first becomes a listed exception (its reason in that section, and the
allowlist in `test/model-call-billing.test.mjs` if code names the endpoint), in a reviewed pull
request; then it runs under a hard cap. No owner approval. AI Gateway judging stays out without
exception. This matches the orchestrator's intent and keeps the 2026-11-18 answer whole.

### 7. Medium. `--round-cap-context` default makes every default run "not evidence" under the current README

Evidence: `eval/playground/README.md:150-155`: a `not-applicable` context is for "a one-off
unreviewed diagnostic" and "such an artifact is labeled diagnostic and is not evidence for a
reviewed eval-round conclusion". Line 166: "any retry needs a new reviewed cap context". Lines
157-158 name a "round owner". The plan's document item 5 only says "described as optional". With
the plan's default, the README would say that an ordinary single E1 run decides nothing.

The code side is sound. `assertRoundCapContext` (`eval/playground/artifact-contract.mjs:677-712`)
already accepts `not-applicable` with a reason, so any agent can write that file today; making it
the default removes ceremony, not a guard. `--max-budget-usd` and `--server-generation` still
bind. Stored artifacts stay valid because the change only relaxes the validator. The other readers
of `sourceFile.sha256` (`research/audits/2026-11-06-playground-final-resolution/orchestrate.mjs:242`,
`test/playground-final-orchestrator.test.mjs:167`) only handle `reviewed-round` artifacts.

Recommended change: decide the two open choices in the plan instead of leaving them to the
executor: auto-fill `experimentId` with the run ID (that validator line stays as it is), and accept
`sourceFile: null` only when `kind` is `not-applicable`. Rewrite README lines 150-158 and 166: what
makes an E1 result evidence is the pre-registered decision and stop rule (`run-evals` section 1),
not the cap file; the file is the agent's own cumulative call cap for a round with several
invocations. `kind: "reviewed-round"` and the field name `roundAuthorization` stay as stored
contract names; say so once in the README. Update `test/playground-eval-contract.test.ts:286`.

### 8. Medium. Document lines the plan misses

Found by the search; each requires an approval before a run and is not in the plan's lists:

- `.agents/skills/run-evals/SKILL.md:39-43`: "Get an independent review of the four lines only when
  the owner asks for one, or when the run is a multi-arm comparison ... A missed review blocks
  launch". This is a pre-launch review by another agent, not an owner approval, and 7-COMMON keeps
  it ("Pre-register ... have the Fable reviewer check it"). The plan should classify it as kept
  discipline in one line, and the report should quote it for the orchestrator, because the note's
  goal says "the owner (or anyone)".
- `.agents/skills/run-evals/references/source-addition.md:4`: "Before a paid A/B for one, add these
  to the pre-spend lines and have them reviewed." Same class: keep, state it.
- `eval/qa/README.md:653`: "For an approved paid run, replace `--dry-run` with these flags".
- `eval/discovery/README.md:17`: "Paid agent collection requires an approved cap"; and line 34: "to
  prepare and approve that server". The plan lists only lines 42-43.
- `eval/playground/README.md:150-158, 166` (finding 7).
- `.agents/TODO.md:447-449` (finding 4).

Checked and correctly left alone (name them in EXEC.md so the stop-rule read is quick):
`eval/README.md:15, 124` and `eval/qa/README.md:37` ("approved" source-label, baseline and case
changes: golden and baseline decisions, not runs); `eval/gates.json` evidence notes;
`eval/qa/remote-identity-guard.mjs:676-677` (`sameAuthorizationResumeAllowed`,
`requiresNewAuthorization`: stored stop-receipt fields); `eval/qa/paired-collection-supervisor.mjs:45`
and `eval/qa/run-p6-judge-self-test.mjs:254` (`maxAuthorizedCostUsd`: the fixed self-test cap in
stored plans and summaries); `.agents/skills/improvements-pipeline/SKILL.md:176` ("authorized
filing": outward-facing); `.agents/rounds/2026-11-16-next-phase/briefs/PLAN-BRIEF.md:16` (the
finished plan phase); the dated briefs (they forbid model-calling runs outright, which is scope,
not approval: the plan's item 11 is right); `.agents/model-roster.md`; `.claude/settings.json`
(no hook gates an eval run); `.github/workflows`; `CONTRIBUTING.md`; `docs/`.

### 9. Medium. This item edits three files that item 8.2 held until run 2.2c merges

Evidence: `.agents/TODO.md:1300-1303`: the 8.2 changes wait until about 2026-12-04 "because the
dated runs read `AGENTS.md`, `golden-truth`, `improvements-pipeline`, `eval/qa/README.md` and the
TODO anchors at launch". Run 2.1 fires 2026-11-23. The plan edits `AGENTS.md`, `eval/qa/README.md`
and many TODO items and does not mention the hold.

The edits are compatible if they change sentences only. Recommended change: add a rule to the
plan: rename, move or delete no heading in `AGENTS.md`, `eval/qa/README.md` or `.agents/TODO.md`,
and do not touch "Held-out split" or "Searching without reading case text". After the edits, check
that every TODO heading the dated briefs and `items.json` name still exists (a free `rg` for each
title). Say in the report that the 8.2 hold was considered.

### 10. Low. One planned gate proves nothing, and one check is dropped without a reason

- `npm run eval:playground -- --dry-run` passes today without `--confirm-paid`
  (`scripts/run-playground-semantic-eval.mjs:778-781`), so it cannot show the change. It also reads
  `eval/qa/cases.json` and prints the sampled case IDs into the lane. Replace it with unit proofs
  in `test/playground-budget.test.ts`: `parseArgs([])` throws the "exactly one `--max-budget-usd`"
  error, and `parseArgs(["--confirm-paid"])` throws as an unknown flag.
- CONTRIBUTING.md:41 lists `npm run eval:qa:register -- --check` for `eval/` beside the QA lint.
  7-COMMON forbids only the lint. Run the register check, or say that CI covers both and why the
  lane skips it.
- Worker bytes: no `src/`, `catalog/`, `specs/` or Wrangler config file changes, so
  `git diff --stat origin/main -- src catalog specs ecosystem-skills wrangler.jsonc` (empty) is the
  exact proof. Comparing build outputs costs more and can differ for unrelated reasons.

### 11. Low. The stop-rule search misses wording that is in the repository

The pattern `authori[sz]|approv|sign(ed|ature)? for|written approval|confirm-paid` does not match
"go-ahead" (`live-drift-resolution/SKILL.md:156`), "blocks launch" (`run-evals/SKILL.md:42`),
"the owner funds" (`.agents/TODO.md:1504`), "signature" without "for" (`eval/qa/README.md:800`) or
"owner-signed" (`:825`). Its path list omits `ecosystem-skills/README.md`, `test/`, `package.json`
and `.agents/README.md`. Add `go-ahead|blocks launch|owner (funds|signs)|owner-signed|signature`
and those paths. The search will still hit kept names (`authorizeSpend`, `authorizedUsd`,
`roundAuthorization`, OAuth text), so the rule stays a read, not a zero count; say that.

### 12. Low. The rename is worth it; delete the dead check instead of rewording it

`--authorized-plan-sha256` is what an agent types, and a Claude lane that has no "authorization"
to cite stops there. The rename touches two code sites
(`eval/qa/paired-collection-supervisor.mjs:99-108, 1166-1173`), one test file and one README
block. The hash binding keeps its value without a signer: it ties the launch to the plan bytes a
reviewer read. Lines 105-107 ("the authorization record must stay external") guard a key nobody
will write once there is no authorization record. Delete that check and its test
(`test/qa-paired-collection-supervisor.test.mjs:1207`) and record what guards the plan now (the
hash). Forward-only: no alias for the old flag. Keep `maxAuthorizedCostUsd`.

### 13. Low. `eval/discovery/run-agent-discovery.mjs:119` comment

"malformed approval" becomes "malformed flags" (the function parses required flags), not
"malformed preconditions".

### 14. Out-of-scope list: correct, with two lines the report should quote

The plan changes none of the Worker's end-user consent rules, the paid Lumenloop trigger, Mintlify
admin, security-boundary approval gates, upstream posting or historical records. Two out-of-scope
lines are per-request owner approvals that contradict the standing delegation in `AGENTS.md`
("run `npm run deploy` without asking"), and the owner's words reach them:

- `ecosystem-skills/README.md:174-175`: "deploy with the owner's approval."
- `.agents/skills/live-drift-resolution/SKILL.md:156`: "`npm run deploy` needs the owner's go-ahead
  unless durably authorized."

Both belong to the held 8.2 item O-10 (`.agents/TODO.md:1309-1310`), so leaving them is right;
the report should quote them and point at O-10.

## Checks made

- Completeness: `rg` for `authori[sz]|approv|signature|signed|sign for|confirm-paid|go-ahead|sign-off`
  across the tree, then read every hit in live documents, skills, briefs, `eval/` and `scripts/`
  code, `package.json`, `.github` and `.claude`. Dated rounds and `research/` were counted, not
  edited or judged.
- Classification: read the gates in `scripts/run-demo-model-gauntlet.mjs`,
  `scripts/run-playground-semantic-eval.mjs`, `eval/playground/artifact-contract.mjs` and
  `eval/qa/paired-collection-supervisor.mjs`, and the tests that pin them.
- Caps: checked against `eval/EVALS.md:120-137` and the 2026-11-10 worked example.
- Not checked: the QA runner, re-judge and discovery budget code beyond their flag and ledger
  names (the plan keeps them unchanged); no command in the plan's gate list was run.
