# Item 8.8 execution record: no per-run approvals

Executor: Claude Sonnet 5.5 (`claude-sonnet-5-5`), worktree `/home/tyler/code/raven-wt/np-8.8`, branch
`np/8.8-no-per-run-approvals`, from `origin/main` at `7121bba2`. Plan: `PLAN.md` beside this file, with its
"Review reconciliation" binding. Spend: none. No model call, no Wrangler process of mine, no AI Gateway.
Not pushed.

## Changes per file

### Code (scripts, eval code, tests)

| File | Change |
|---|---|
| `scripts/run-demo-model-gauntlet.mjs` | `--confirm-paid` removed from the parser, usage and launch. A launch requires `--max-budget-usd` (`invocation.maxBudgetUsd === null` refuses with "pass --max-budget-usd <usd> to launch (the shipped-tuple smoke uses 1)"), after the plan prints and before any filesystem, credential or Wrangler work. No default cap, no `--dry-run`. Usage text now leads with the cap. |
| `test/demo-gauntlet-cli.test.ts` | Refusal test now expects the new message with no cap flag; the offline fake-`npx` launch test drops `--confirm-paid`; new test: `--confirm-paid` is an unknown argument. Edited in the same step as the script; `npm test` was not run between them. |
| `scripts/run-playground-semantic-eval.mjs` | `--confirm-paid` removed (parser, usage, header comment, examples, the runtime refusal). `parseArgs` requires exactly one `--max-budget-usd` for any invocation except `--help`, `--dry-run`, `--preflight`, `--print-generation`. `--round-cap-context` is optional: absent, `loadRoundCapContext(undefined, runId)` returns `singleRunRoundCapContext(runId)`. Examples use the per-case cap (USD 2 for 5 cases, USD 6 for a full contract). |
| `eval/playground/artifact-contract.mjs` | `assertModelBackedRunInputs` requires only `--server-generation`. New `singleRunRoundCapContext(runId)`: `kind: "not-applicable"`, `experimentId` auto-filled with the run ID (decision: keeps the `experimentId` validator line unchanged), reason "single run: no round cap context given", `sourceFile: null`, all cap fields and `runAllocation` null. `assertRoundCapContext` accepts `sourceFile: null` only when `kind` is `not-applicable`; a `reviewed-round` still needs `sourceFile.path` and a SHA-256. Field name `roundAuthorization` and the kind names are unchanged, so stored artifacts stay valid. |
| `test/playground-budget.test.ts` | `parseArgs([])` throws "exactly one --max-budget-usd"; `parseArgs(["--confirm-paid"])` throws as unknown; `--preflight`, `--print-generation`, `--help` and `--max-budget-usd 2` parse. |
| `test/playground-eval-contract.test.ts` | `assertModelBackedRunInputs` needs no cap context; new test covers `singleRunRoundCapContext`, a `not-applicable` file context (old shape), and a `reviewed-round` with `sourceFile: null` or a bad hash failing. `fixtureMeta` now lets a caller's `sourceFile` win (default unchanged). |
| `eval/qa/paired-collection-supervisor.mjs` | Flag `--authorized-plan-sha256` is `--plan-sha256`; `validateAuthorizedPairedCollectionPlan` is `validateFrozenPairedCollectionPlan`; error "plan SHA-256 does not match the canonical plan". The "authorization record must stay external" check is deleted (reconciliation 12). No alias. `maxAuthorizedCostUsd` kept. What guards the plan now: the hash binds the launch to the canonical plan contents and the ordered command arguments (corrected after the Sol review; it hashes canonicalized parsed JSON, not raw bytes), and `validatePairedCollectionPlan` still validates the plan; nothing stops a plan from carrying an `authorization` key, and nothing needs to, since no authorization record exists. |
| `test/qa-paired-collection-supervisor.test.mjs` | Renamed imports and tests; dead "authorization record" assertion deleted; CLI test expects `--plan-sha256` and also proves the old flag is rejected with the usage text. |
| `eval/discovery/run-agent-discovery.mjs` | Comment "malformed approval" to "malformed flags" (reconciliation 13). |

### Documents, skills, TODO, brief, DECISIONS (sentence edits; no heading touched)

- `AGENTS.md`: gate-sweep line; subscriptions bullet (every API-billed run has a hard cap and a cost record,
  an unlisted path first joins the list in a reviewed PR); the "paid method needs its own written
  authorization" bullet replaced by the **No per-run approvals** bullet (reconciliation 5 text); Owner
  delegations: signature bullet deleted with no replacement, "or sign" dropped, "Outward-facing posts still
  need the owner's approval." appended to the merge-and-deploy bullet.
- `eval/EVALS.md`: source-of-truth bullet, rules 7 and 8, "Model-call billing" opening (outside-the-list rule
  of reconciliation 6, AI Gateway judging stays out), question-table cells, and "Sizing" (new default-cap
  table, reconciliation 3 values).
- `.agents/skills/run-evals/SKILL.md`: "No run needs approval. One cap covers one method run" (§1), the
  API-billed rule (§2), self-test "under its own authorization" dropped (§4), §5 step 3 wording.
- `eval/qa/README.md`: lines 5, 69, 114, 131, 167, 171, 373, 442, 581, 653, 791-825, 851 by search.
- `eval/playground/README.md`: gauntlet usage, `--confirm-paid` examples, "Each tier runs under its default
  cap", ledger line, `--round-cap-context` described as optional with the evidence rule and the stored-names
  note (reconciliation 7), the `infraRetryAuthorized` sentence.
- `eval/agentic/README.md:5`, `eval/discovery/README.md:17, 34, 42-43`, `PLAN.md:43`,
  `.agents/rounds/2026-11-16-next-phase/briefs/ITEM-LEAD.md` Spend rule (7-COMMON rule).
- `.agents/rounds/2026-11-16-next-phase/DECISIONS.md`: new "Follow-up answers (2026-11-19, no per-run
  approvals)" after "Follow-up answers (2026-11-19, Playground billing)" and before "## Timing", with the
  owner's words verbatim, the question it answered, the supersession of the second sentence of answer 1 (the
  first stands; answer 1's text unchanged), "Applied by item 8.8" and the caps.

### TODO items touched (`.agents/TODO.md`, located by text; line numbers from `7121bba2`)

| Item (line) | Old trigger or next step | New |
|---|---|---|
| Preamble (10) | "no item below authorizes a paid run" | "a run needs no approval, and each runs under a hard cap and is recorded with its cost" |
| Decision-1 restatement (38) | "no paid QA run without a new written owner authorization, except round item 4.1 under decision 7" | "No third tuning loop (owner, 2026-11-16, decision 1). A QA headline run starts only when a named decision needs it (`run-evals` section 1); it needs no approval." Routing repair stays held |
| `execute` timeout (115) | "A paid test needs its own written authorization ... none is granted here" | "A paid test runs under a cap sized by the `run-evals` skill and is recorded with its cost" |
| Repository-recovery gate (447-449) | "pass an independent plan review and its own spend authorization" | independent plan review kept, spend authorization dropped |
| OpenCode reopen (1052) | "under a new spend authorization" | "under its own cap" |
| Second judge on OpenCode (1076, 1085) | "under its own written authorization" / "under a written authorization" | "under its own cap" |
| p9 claim-support gaps (1112) | "an authorized measurement, or the owner accepts them" | "a capped measurement, or the owner accepts them" (owner acceptance kept) |
| Account-scoped monitor (1150) | "a diagnostic and a headline sample each need their own authorization" | "each run under their own caps" |
| Judge self-test on the newest Sonnet (1271, 1279) | "under its own authorization" / "under a written authorization" | "under its own cap" |
| Codegen A/B (1504-1508) | "No item here authorizes a paid run" / "an authorized A/B" | "The A/B is a direction call and runs under a hard cap" / "a capped A/B"; the "owner funds" trigger itself kept |

Kept as direction calls or non-runs (unchanged): 481 (general scoring repair), 1441 (phase-zero study), the
1504 "owner funds" trigger, 1303 (orchestrator approval of the 8.2 list), 422, 604, 711-715, 927, and the
1000 "owner go to start the design study".

## Code-gate classification

Changed (approval gates): E2 `--confirm-paid`; E1 `--confirm-paid`; E1 required `--round-cap-context`;
paired-supervisor `--authorized-plan-sha256` and its "authorization record" check.

Kept (cost or integrity guards): `eval/qa/spend-budget.mjs` and its `authorize*`/`authorizedUsd`
vocabulary (stored in artifacts); `run-qa.mjs`, `re-judge.mjs`, `diagnostic-rejudge-source.mjs` required cap,
pins and no-resume; `run-agent-discovery.mjs` required hashes and cap; `run-p6-judge-self-test.mjs` and
`maxAuthorizedCostUsd`; `improvements-run-probes.mjs` "auth probe target is not approved" and
`improvements-lint.mjs` "approved probe credential" (credential allowlists); `--server-generation`;
`infraRetryAuthorized: false` and `accountingPolicy` (stored schema); `remote-identity-guard.mjs`
`sameAuthorizationResumeAllowed`/`requiresNewAuthorization` (stored stop-receipt fields);
`scripts/exposure.mjs:20` (Worker end-user consent, out of scope). The gauntlet's `authorizedUsd` snapshot
key and its "of X authorized" log text stay (budget vocabulary, asserted by tests).

The plan's pre-edit search (`confirm-paid|authori[sz]ed-|--approve|run sheet|owner.?(token|sign)` over
`eval scripts package.json .github`) found no gate beyond the four above.

## Gates

| Gate | Result |
|---|---|
| `npm run typecheck` | exit 0. First run failed with `Env` members missing (no `.dev.vars`/`env.d.ts` in the fresh worktree); I created the gitignored placeholder `.dev.vars` (names only, CI's stub) and ran `npm run typegen`, as AGENTS.md says. Not an item issue |
| `npm test` | exit 0: 177 files passed, 5 skipped; 4285 tests passed, 3 expected fail, 8 skipped. One earlier run failed my own new test (a case `fixtureMeta` could not express); I removed it and re-ran |
| `npm run build` | exit 0 (Wrangler dry run) |
| `npm run eval:selftest` | exit 0, "self-test: all checks passed" |
| `npm run eval:routing -- --gate` | exit 0, `GATE PASS` (legacy 338, committed evidence verified) |
| `npm run eval:qa:register -- --check` | exit 0, "up to date" |
| `npm run secrets:scan -- --tree` | exit 0, clean |
| `node scripts/run-demo-model-gauntlet.mjs --models openai/test --prompts rpc-simulate` | printed the plan, exit 1 with "pass --max-budget-usd <usd> to launch (the shipped-tuple smoke uses 1)"; no output directory, no Wrangler. `--confirm-paid` alone: "Unknown argument", exit 1. `--help` exit 0 |
| `git diff --stat origin/main -- src catalog specs ecosystem-skills/catalog.json wrangler.jsonc` | empty |
| TODO and heading check | `AGENTS.md`, `eval/qa/README.md` and `.agents/TODO.md` heading lists are identical to `HEAD`. The four TODO anchors the dated briefs name ("Re-verify the event-tied goldens", "Software Versions (not filed)", "Bell/P30 Mainnet vote", "Close the register entries the dated runs leave open") each exist once. `items.json` names no TODO heading. The 8.2 hold was considered; "Held-out split" and "Searching without reading case text" are untouched |

`npm run test:smoke` not run (no `src/` change). The QA lint was not run. The `eval:playground -- --dry-run`
gate is dropped (reconciliation 10); the unit tests cover the change.

A `wrangler dev` process (pid 512476) was already running; I did not start it and did not touch it.

## Stop-rule search (reconciliation 11)

Pattern `authori[sz]|approv|sign(ed|ature)? for|written approval|confirm-paid|go-ahead|blocks launch|owner (funds|signs)|owner-signed|signature`
over AGENTS.md, CONTRIBUTING.md, PLAN.md, README.md, docs, `eval/` (directory scan, `.ignore` applied),
`.agents/skills`, `.agents/TODO.md`, `.agents/model-roster.md`, `.agents/README.md`, ITEM-LEAD.md, `scripts`,
`package.json`, `ecosystem-skills/README.md`, and `test/`. Not a zero count. I read every hit outside `test/`
and the OAuth-heavy test files. Classification of what remains:

- **Out of scope, per request (quoted for the orchestrator):** `ecosystem-skills/README.md:174-175` "deploy
  with the owner's approval."; `.agents/skills/live-drift-resolution/SKILL.md:156` "`npm run deploy` needs the
  owner's go-ahead unless durably authorized." Both contradict the standing AGENTS.md deploy delegation and
  belong to held item 8.2 O-10 (`.agents/TODO.md` near 1309); not edited. Other out-of-scope keeps:
  `AGENTS.md:203` (Worker end-user consent for paid or side-effecting operations), `scripts/exposure.mjs:20`
  and `:64` (the same, in comments), `improvements-pipeline/SKILL.md:176` ("authorized filing", outward-facing),
  `AGENTS.md:159` (outward-facing posts).
- **Kept discipline, not an owner approval:** `run-evals/SKILL.md:39-43` (independent agent review of the four
  lines, "A missed review blocks launch"; 7-COMMON keeps pre-registration review) and
  `run-evals/references/source-addition.md:4`.
- **Direction or product calls kept:** the TODO lines listed above, `.agents/TODO.md:1528-1530` (OpenAI
  publication), `:944`, `:1441`.
- **Kept names and budget vocabulary:** `authorizeSpend`, `authorizedUsd`, `BudgetAuthorizationExceededError`,
  `roundAuthorization`, `infraRetryAuthorized`, `maxAuthorizedCostUsd`, `sameAuthorizationResumeAllowed`,
  `requiresNewAuthorization`, the gauntlet's `authorized` log text.
- **Not about runs:** OAuth and HTTP `Authorization` text (README, docs, `test/auth*`, `test/oauth-origins`,
  smoke tests, fetchers), "signature" meaning a type signature, `eval/README.md:15, 124` and
  `eval/qa/README.md:37` ("approved" label and baseline changes), `eval/qa/corroboration-rubric.mjs` and
  `claim-read-brief.md` (claim classification), `eval/partner-docs/README.md:4`, `PLAN.md:40` (accepting a
  catalog), `.agents/model-roster.md` and ITEM-LEAD (`--always-approve` and `-a never` are CLI tool-permission
  flags), and the `--confirm-paid` assertions in the two new tests.
- **Dated line 1.4 briefs** (`items/1.4/dated/*`): no line requires approval before a step; no change.
- Left alone per REVIEW.md finding 8's list: `eval/gates.json` notes, `.claude/settings.json`,
  `.github/workflows`, `CONTRIBUTING.md`, `docs/`, `PLAN-BRIEF.md`.

## Deviations and observations

1. **E2 launch condition.** The plan's reconciliation 1 says "a launch requires `--max-budget-usd`". I kept
   the validator tolerant of an absent cap (so the plan-printing path and `createGauntletBudget(null)` tests
   still work) and put the refusal in `main`, after the plan prints. Net behavior matches the plan.
2. **`research/audits/2026-11-06-playground-final-resolution/orchestrate.mjs:224`** still passes
   `--confirm-paid` to the E1 script. It is a dated record (research/ stays unchanged) and no test runs it
   live (the suite is green). Re-running it would now fail with "Unknown argument".
3. **Search rule slip, disclosed.** One of my stop-rule searches used the shell globs `eval/qa/*.mjs` and
   `eval/discovery/*.mjs` (code files, not case files). I discarded that output and redid the search by
   directory with `rg` so `.ignore` applies. No case text was opened.
4. **Untracked item records.** `items/8.8/` (PLAN.md, REVIEW.md, briefs) was untracked when I started; I
   committed only this EXEC.md from it. The lead decides about the rest.
5. **Placeholder `.dev.vars` and generated `env.d.ts`** exist in the worktree (both gitignored; names only,
   per the README step).
6. Reconciliation 14: the two per-request deploy approvals are quoted above; held item 8.2 O-10 owns them.

## Review reconciliation (Codex Sol)

Review: `CODEX-REVIEW.md` (`gpt-6.2-sol`), commit `94135d9e`. Fixes are a second commit on top (no amend).

1. **Sol 1 (medium): adopted, wording only, no Worker change.** "Hard cap" became "dollar cap" in
   `AGENTS.md` (both places), `eval/EVALS.md` "Model-call billing", the `run-evals` skill, ITEM-LEAD.md, the
   new DECISIONS.md section and the two TODO lines I wrote. `eval/EVALS.md` "Sizing" now says once: a cap
   stops the next call once the reported spend reaches it, one in-flight call can overshoot it
   (`eval/playground/README.md`, "Dollar accounting"), so size caps with that headroom. The hard-ceiling
   alternative (a verified upper bound before dispatch) is not done here; it would be a Worker change.
2. **Sol 2 (low): adopted.** The code comment, `eval/qa/README.md` and this file now say the hash binds the
   canonical plan contents and the ordered command arguments (key order and whitespace do not change it), and
   that the hash stays outside the plan.
3. **Sol 3 (low): adopted.** The no-cap launch-plan line prints `no cap supplied; preview only`;
   `test/demo-gauntlet-cli.test.ts` asserts it; the "Dollar accounting" comment in
   `scripts/run-demo-model-gauntlet.mjs` now describes current behavior (every launch has a cap; a null cap
   only occurs in the preview).
4. **Sol 4 (low, pre-existing): deferred, not fixed.** Both CLIs can serialize a tiny positive cap or
   remainder such as `0.0000005` as `5e-7`, which the Worker rejects with HTTP 400. It predates 8.8 and
   fails closed (the run stops; no spend), and a fix touches the shared header formatting. Worth a TODO item
   if it ever bites; none filed here.
5. **TODO fixes: adopted.** The doubled "under under its own cap" in the OpenCode reopen item is gone; the
   `execute`-timeout paragraph, the codegen A/B trigger and the OpenCode paragraph are reflowed to the file's
   width.

Gates re-run bare after the fixes: `npm run typecheck` exit 0; `npm test` exit 0 (4285 passed, 3 expected
fail, 8 skipped); `npm run build` exit 0; `npm run eval:selftest` exit 0 (I touched a script comment and a
launch-plan string, not eval logic); `npm run secrets:scan -- --tree` exit 0, clean.
