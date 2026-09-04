# Final launch-contract and closeout review — Claude Opus 5

Date: 2026-09-04.

Reviewer: Claude Opus 5 at `high` effort. Mode: audit. The reviewer changed no product code and no
existing document.

Author of the reviewed work: Codex Sol (code, `1847ffd`) and Claude Fable 5.1 (documents,
`52e34c6`). The reviewer is neither author and is not the orchestrator.

Fixed point: `main` at `2ee801f80d626e68f010392a7d541aab7997349d`.

Reviewed snapshot: `52e34c6cab71dc74cd4968f0b9e8e78a88d18147` on
`codex/truth-maintenance-2026-09-03`.

Worktree: `/private/tmp/stellar-raven-tm-final-launch-review`.

## Verdicts

`LAUNCH-OK`: **withheld**. One launch blocker stays open. It is L1.

`CLOSEOUT-OK`: **withheld**. Three closeout findings stay open. They are C1, C2, and C3.

Every Sol finding P1, P2, P3, S1, S2, and S3 is closed. The landed launch contract at `1847ffd`
holds under executable test. The reviewer found no defect in the enforced contract itself.

The single launch blocker sits in the canonical eval runbook, not in the code. The runbook still
publishes the retired v1 launch command. The repair is small and local.

The reviewer made no paid call, no live collection, no stored judging, no external write, no
deployment, and no network mutation.

## Scope

The reviewer inspected these surfaces:

- commit `1847ffd` and its complete diff;
- commits `dc0761d` and `52e34c6`;
- `eval/qa/paired-collection-supervisor.mjs`, `eval/qa/check-paired-capacity.mjs`,
  `eval/qa/re-judge.mjs`, `eval/qa/run-p6-judge-self-test.mjs`, `eval/qa/run-qa.mjs`,
  `eval/qa/judge.mjs`, `eval/qa/paired-verdict.mjs`, and `eval/qa/spend-budget.mjs`;
- the four paired-contract test files and the five paired-lane test files;
- `.agents/NEXT.md`, `.agents/TODO.md`, and `.agents/rounds/2026-09-03-truth-maintenance.md`;
- `revised-impact-measurement-fable.md` revision 3, `final-synthesis-review-sol.md`,
  `launch-contract-repair-sol.md`, and `paired-capacity-check-terra.md`;
- the authoritative artifact `/private/tmp/paired-capacity-live-v2-2026-09-04.json`;
- the complete branch diff from `2ee801f` (171 files, 63 commits);
- `.agents/skills/run-evals/SKILL.md` and the other live instruction surfaces.

## Launch blockers

### L1 — High — The eval runbook publishes the retired v1 launch contract

Location: `.agents/skills/run-evals/SKILL.md:517-523`.

Evidence:

- Line 518 gives the launch command as
  `npm run eval:qa:paired:collect -- --plan <absolute-plan.json>`.
- That command form has no `--authorized-plan-sha256` argument.
- `eval/qa/paired-collection-supervisor.mjs:1076-1080` rejects that form.
- Line 519 names the manifest schema `qa-paired-collection-plan-v1`.
- `eval/qa/paired-collection-supervisor.mjs:31` sets the schema to `qa-paired-collection-plan-v2`.
- `eval/qa/paired-collection-supervisor.mjs:500-502` rejects every other schema.
- The skill never mentions the external authorized plan hash.
- The skill never mentions the fixed capacity contract or its 24-hour freshness window.
- The skill never mentions the 200 selected and 500 active corpus counts.
- The skill never mentions the P6 exclusive output rule or the flip Claude identity pins.
- Every earlier supervisor commit updated this skill. Those commits are `9bbcdbd`, `6934e1c`,
  `e0df186`, and `a5ac32f`.
- Commit `1847ffd` did not update it.
- `AGENTS.md` names `run-evals` as the runbook that defines the exact eval gate.
- `eval/qa/README.md` and `eval/EVALS.md` carry the correct v2 contract.

Consequence:

The repository states two different launch contracts. An operator who follows the runbook builds a
v1 manifest. That operator then runs a command that the supervisor refuses. The refusal is
fail-closed, so no spend occurs. The cost is a wasted launch window and a broken single truth
owner. A weekend UTC launch window is scarce, and the capacity artifact expires within 24 hours.

Smallest repair:

Rewrite `.agents/skills/run-evals/SKILL.md:517-523` against the v2 contract. State the launch
command with `--authorized-plan-sha256`. State the schema `qa-paired-collection-plan-v2`. State
that the owner authorization record stays outside the plan. Keep the full contract in
`eval/qa/README.md` and point the skill at it.

## Reviewability findings

### C1 — Medium — The repair report makes a false tree-identity claim

Location: `.agents/rounds/2026-09-03-truth-maintenance/launch-contract-repair-sol.md:67-68`.

Evidence:

- The report says that `e5c835e` has the same tree as `1847ffd`.
- `git rev-parse e5c835e^{tree}` returns `e097497577ebef0cf998284e90fadc35f054abdc`.
- `git rev-parse 1847ffd^{tree}` returns `03d93f5eaa31646f1e14e085c40f6bb4d914596a`.
- The trees differ.
- `git diff --stat e5c835e 1847ffd` reports one changed file.
- That file is
  `.agents/rounds/2026-09-03-truth-maintenance/final-synthesis-review-sol.md` at 486 added lines.
- The parent of `e5c835e` is `bd8d2d2`. The parent of `1847ffd` is `f766893`.
- Commit `f766893` added that review report.
- Every code path is byte-identical between the two commits.

Consequence:

The report uses the false claim to carry Sol's validation forward to `1847ffd`. A reader who
checks the claim finds it wrong. That reader must then re-derive which files differ. The
underlying conclusion still holds, because only one Markdown record differs.

Smallest repair:

Replace the sentence. State that the two trees differ only by
`final-synthesis-review-sol.md`, and that every code file is byte-identical.

### C2 — Low — The recorded full-suite test count does not reproduce

Location: `.agents/rounds/2026-09-03-truth-maintenance/launch-contract-repair-sol.md:71`.

Evidence:

- The report records 1,961 passing tests in the first complete run.
- The reviewer ran the full suite at `52e34c6` and measured 108 files and 1,971 tests.
- The ledger records 1,971 tests for the orchestrator run at `dc0761d`.
- `.agents/NEXT.md:36` also records 1,971 tests.
- The code trees of `e5c835e` and `1847ffd` are identical, per C1.
- No test enumerates `.agents/rounds` files dynamically.
- The report itself records sandbox `listen EPERM` and GPG restrictions in that lane.

Consequence:

The report presents an environment-limited count as a plain result. A reader cannot reconcile
1,961 with the 1,971 recorded twice elsewhere. The risk is low, because two independent runs at
`dc0761d` and `52e34c6` both give 1,971.

Smallest repair:

Label the 1,961 count as a restricted-sandbox measurement, or remove the exact number.

### C3 — Low — The design names a stale branch tip

Location: `.agents/rounds/2026-09-03-truth-maintenance/revised-impact-measurement-fable.md:690`.

Evidence:

- The blockers section says `codex/truth-maintenance-2026-09-03` at `dc0761d`.
- `git show-ref` returns `52e34c6` for that branch.
- Commit `52e34c6` is a documentation-only child of `dc0761d`.
- Its diff touches six files, all under `.agents`.
- The contract file hashes are identical at both commits.
- `.agents/NEXT.md:16-17` uses the safer phrase "contains the work through `dc0761d`".

Consequence:

The launch requires one clean launch revision. A reader may take `dc0761d` as the branch tip and
build the manifest there. The substance holds either way, because the code is identical.

Smallest repair:

Use the `.agents/NEXT.md` phrasing at line 690. Say that the branch contains the work through
`dc0761d`.

### R1 — Medium — A failed re-judge never persists the after-identity or the guard

Location: `eval/qa/re-judge.mjs:920-950`.

Evidence:

- Line 943 attests the Claude identity after judging.
- Line 944 stores that identity on `baseMeta`.
- Lines 945 to 948 compute the stability guard.
- `assertStableRejudgeIdentity` throws when the identity drifted.
- The final `writeCheckpoint` call is at line 950, after that throw point.
- Line 949 rethrows a judging error before line 950.
- The last checkpoint on disk therefore keeps `judgeIdentity.after: null` and
  `judgeIdentity.guard: null`.
- `eval/qa/README.md:979-982` states that the result stamps both identities and the guard.
- Line 943 can also throw and replace an earlier judging error.

Consequence:

A flip re-judge that drifts writes an artifact that looks only unfinished. The artifact holds no
machine-readable evidence of the drift. A reviewer must read the process output instead. A second
failure can also hide the first cause.

This is not a launch blocker. The flip re-judge supplies stability evidence only. It runs after
the paired comparison. The failure is loud on standard error, and `finishedAt` stays `null`.

Smallest repair:

Stamp `judgeIdentity.after` and a failed `judgeIdentity.guard`, write one checkpoint, then throw.
Preserve the original judging error when the post-run attestation also fails.

### R2 — Low — One catch-all message covers seven distinct flip-command defects

Location: `eval/qa/paired-collection-supervisor.mjs:413-414`.

Evidence:

- One message names source order, identity, cases reference, judge tuple, cap, and zero-flip
  behavior.
- The command array holds 17 or 19 elements.
- The check is a whole-array JSON equality test at line 413.
- `test/qa-paired-collection-supervisor.test.mjs` asserts `/wrong source order/` for a changed
  `--cases-ref`, a changed `--judge-model`, and a changed `--max-budget-usd`.
- It asserts `/identity/` for three further mutations.
- Both patterns match the same single message.

Consequence:

An operator who hits this error learns only that some element differs. That operator must diff the
array by hand under launch pressure. The test labels also claim a discrimination that the
assertions do not provide.

Smallest repair:

Report the first differing index with its expected and actual values.

### R3 — Low — The capacity evidence shows a wrapper that the frozen array excludes

Location: `.agents/rounds/2026-09-03-truth-maintenance/paired-capacity-check-terra.md:86-90`.

Evidence:

- The record shows `/usr/bin/env -i PATH=... /usr/local/bin/node eval/qa/check-paired-capacity.mjs
  --out <path>`.
- `eval/qa/paired-collection-supervisor.mjs:250-257` freezes
  `[process.execPath, "eval/qa/check-paired-capacity.mjs", "--out", artifactPath]`.
- The frozen array carries no `env -i` wrapper.
- The supervisor validates the artifact bytes, not the invoking shell.

Consequence:

A reviewer who compares the signed `capacity.command` with the evidence record sees two different
command texts. The difference is harmless, because `env -i` only clears the environment.

Smallest repair:

State that `env -i` is the environment-hygiene wrapper, and that `capacity.command` records the
unwrapped array.

## Sol findings — verification

### P1 — Closed

The authorization now binds the exact paid commands.

- `validateAuthorizedPairedCollectionPlan` requires `--authorized-plan-sha256`.
- The hash covers the recursively key-sorted plan JSON.
- The function rejects any plan that carries an `authorization` key.
- The schema is `qa-paired-collection-plan-v2`. Version 1 plans fail.
- The plan freezes the capacity, P6, two collection, two stored-judge, two flip, and comparison
  arrays.
- Each flip command pins the Claude path, the binary SHA-256, and the environment SHA-256.
- Each flip command requires `--allow-empty`, which makes a zero-flip result valid.
- The P6 contract freezes seven calls, a `$0.50` per-call cap, and a `$3.50` maximum.
- The flip judge implementation must equal `p6.judgeSha256`.

Command-line proof: the reviewer ran the CLI with a plan and no authorized hash. The process exited
1 and named `--authorized-plan-sha256`. The reviewer then supplied a wrong hash. The process exited
1 and reported a canonical-plan mismatch.

### P2 — Closed

The free capacity gate is deterministic.

- `PAIRED_CAPACITY_CONTRACT` fixes the schedule, ten thresholds, and the freshness window.
- The schedule is `simultaneous-barrier-v1` with two agents and one capture each.
- It expects 14 responses, split as Scout 2, Lumenloop 6, and Stellar Docs 6.
- The thresholds require zero HTTP errors, transport errors, retries, and `Retry-After` headers.
- They require matching vectors, overlapping windows, and at least two active fetches.
- They cap the whole check and each capture at 120,000 ms.
- The plan binds the exact command, the instrument bytes, and the artifact bytes.
- The supervisor checks the executing instrument and both runner copies.
- The freshness window is 86,400,000 ms after `completedAt`.

The reviewer executed `capacityRejectionReasons` against the authoritative artifact. The function
returned an empty array. The artifact schema, contract, and `accepted` flag all matched.

The freshness boundary behaves as documented. `nowMs - completedAtMs > freshnessMs` fails. The exact
boundary passes. One millisecond beyond fails. A future `completedAt` fails.

### P3 — Closed

The supervisor enforces the denominator contract.

- `SELECTED_CASE_COUNT` is 200 and `ACTIVE_CORPUS_COUNT` is 500.
- The plan must carry `selected.count: 200` and exactly 200 unique ordered IDs.
- The plan must carry `selected.activeCorpusCount: 500` and `selected.activeCorpusIdsSha256`.
- Both runner worktrees recompute the cases-file hash, the selected content hash, the ordered
  200-ID hash, and the ordered 500-ID hash.
- Every selected ID must be active in that runner.
- The cases path must resolve inside its runner worktree.

## Independent corpus reproduction

The reviewer rebuilt the sample from the rule in revision 3. The rule is proportional allocation by
service with even-spaced picks over id-sorted strata. Every value reproduced exactly.

| Item | Recomputed value | Matches |
| --- | --- | --- |
| Cases file SHA-256 | `1842a188437ea0ae265f6ab6c897de00220de23f4b34b9fe7b6d93f80f142396` | yes |
| Ordered 500-ID SHA-256 | `b557bcb5cff8a434ad684b90a60343358360330ca1f91072089ceb57a38310d0` | yes |
| Active corpus content SHA-256 | `c5d0c804ddd9ce241fae90398ee0d83808e5d847f049d118e4ad15903d07b43e` | yes |
| Ordered 200-ID SHA-256 | `8ba8e687ace17711cabb3932ca6d5e2edebede2bfbfcfbfd79ce3fca3bbd20da` | yes |
| Selected 200-content SHA-256 | `b8512352599ed9df760113cb86db8337ae3136a1cec4aea8461ef08d61e55ee1` | yes |

The corpus holds 500 cases. All 500 are active and unique.

The sample composition also reproduced. It has Docs 96, Scout 57, Lumenloop 25, skills 13, and none
9. Its freshness split is stable 84, scheduled 60, and live 56. It holds 16 trap cases. These
counts match revision 3.

The reviewer did not reproduce the 150-ID fallback hash. The design does not state the 150-ID
per-service allocation. The landed supervisor rejects a 150-ID plan, so this gap blocks nothing.

## Contract file hashes at the reviewed snapshot

The reviewer recomputed every hash in `launch-contract-repair-sol.md`. All eleven matched.

| File | SHA-256 | Matches |
| --- | --- | --- |
| `eval/qa/paired-collection-supervisor.mjs` | `0afb9c4dbddd33cb9d979d47a1076f8df5e0e6ade931280b9a1a5764cad3222c` | yes |
| `eval/qa/paired-collection-control.mjs` | `1f3e4ce3bdbb6679c4e6e8e59c433c3093ecab98eaa0bbdb74b3ad5a06a76bb7` | yes |
| `eval/qa/check-paired-capacity.mjs` | `59a52b96e890f0de4babb911022ed863c4ad5a62a6473b146007544143e8f3a9` | yes |
| `eval/qa/re-judge.mjs` | `d3dca551164f7b6fbb6587faedace1fe97cc59b287c36d7db451da4bf2dea9c9` | yes |
| `eval/qa/run-p6-judge-self-test.mjs` | `d821bb7d9d15004e65544c5de5f80255a1de190b788fce2603de1168da4f7c24` | yes |
| `eval/qa/judge.mjs` | `2d14376ac4b1c1f0b9c50b0067fc4287ba200eee46c6d5d4dd6425c5c8a07637` | yes |
| `eval/qa/evidence-pack.mjs` | `ad6cd7e6a0502f9ce0fd36208e2c9872bde08862b039b8b419917f37130bf4bd` | yes |
| `eval/qa/run-qa.mjs` | `60aa6f3b5cb46e509dadf54fba7a34777569f2e1ba437374a282b2fc5f65f61f` | yes |
| `eval/qa/paired-verdict.mjs` | `5a473a57708ddb17791e264b7da68e96b5b49b0102141d3a687b15510e8bd960` | yes |
| `eval/qa/probe-remote-identities.mjs` | `bde386a01ceb5bfdd325f3cd24369e00e2c111f7b4747ec7c0c9e77bc84485ef` | yes |
| `eval/qa/exact-old-runtime-adapter.mjs` | `473690c7f10d5384be252bb97f9aa16ee88428d23589779289f5910c08e60303` | yes |

The tuple values also matched. `JUDGE_RUBRIC` is `v2.10`. `PACK_VERSION` is `p6`.
`JUDGE_SELF_TEST_CANDIDATE_COUNT` is 7.

## Frozen command arrays against the real CLIs

The reviewer executed each frozen array through the real parser. Every array parsed.

| Frozen array | Parser | Result |
| --- | --- | --- |
| Capacity command | `check-paired-capacity.mjs` `parseArgs` | accepts `--out <path>` |
| P6 command | `parseP6SelfTestCli` | accepts all four identity flags and `--out` |
| Flip re-judge command, no panel | `re-judge.mjs` `parseArgs` | accepted |
| Flip re-judge command, `--judge-panel 2` | `re-judge.mjs` `parseArgs` | accepted |
| Flip re-judge command, `--judge-panel 3` | `re-judge.mjs` `parseArgs` | accepted |
| Collection command | `assertRunQaCliSyntax` | accepted |
| Stored-judge command | `assertRunQaCliSyntax` | accepted |
| Comparison command | `paired-verdict.mjs` argument handling | two positionals plus `--json` |

Every flag that the supervisor freezes exists in `RUN_QA_VALUE_FLAGS` or `RUN_QA_BOOLEAN_FLAGS`.
The reviewer checked all 27 flags.

The pinned Claude path reaches the paid call. `re-judge.mjs:928-934` passes
`judgeIdentityBefore.binary.resolvedPath` as the `command` option. `judge.mjs:576-596` spawns that
command. The closure sets `command` after the spread, so a caller cannot override the pin.

## Authorization hash timing and paid spawn order

The supervisor validates before it spawns. The order in `main` is fixed.

1. Parse the four launch arguments.
2. Read the plan file.
3. Call `validateAuthorizedPairedCollectionPlan`.
4. Call `validatePairedCollectionPlan`.
5. Create the control directory.
6. Spawn both collection children.

No child starts before step 4 completes. A validation failure exits 1 and spawns nothing.

The design places the owner signature before the P6 run. Step 8 of the sequence signs the plan.
Step 9 runs the frozen P6 command. Step 10 launches the supervisor. The supervisor then verifies
the retained P6 summary against the frozen command parameters. It checks the runner revision, the
Claude path, both identity hashes, the call count, each per-call cap, each reported cost, and the
wrapper implementation hash. The paid P6 spend therefore happens under the signed plan.

The reviewer confirms one design property. The supervisor runs only the two collection commands.
An operator runs the P6, judge, comparison, and flip commands. `eval/qa/README.md:924-925` states
this honestly.

## P6 exclusive output handling

`main` calls `assertP6OutputAvailable(parsed.out)` before `runP6JudgeSelfTest`. The check refuses an
existing `--out` path and an existing `.tmp` path. It runs before any paid call.

`writeP6SummaryExclusive` writes the temporary file with the `wx` flag. It then links the temporary
file to the output path. `linkSync` fails when the output path exists, so the wrapper never
overwrites an earlier method record. The `temporaryCreated` flag turns true only after a successful
exclusive write. The cleanup path therefore removes only a temporary file that this invocation
created.

Four tests cover this behavior. They prove refusal, single-write success, no leftover temporary
file, and correct cleanup under a racing link failure.

## Re-judge identity checks and partial-artifact honesty

The paid path requires three spaced identity flags. `parseArgs` refuses an equals-joined value and
refuses an uppercase SHA-256. It also refuses a partial pin set on a dry run.

The dry run returns at `re-judge.mjs:837-851`, before `attestRejudgeIdentity`. A dry run therefore
never inspects or starts Claude.

`attestRejudgeIdentity` runs at line 869, before the spend ledger and before the first paid call.
`assertStableRejudgeIdentity` runs after judging. A successful run stamps
`meta.judgeIdentity.before`, `meta.judgeIdentity.after`, and `meta.judgeIdentity.guard`.

Partial artifacts stay honest on the budget path. `rejudgeRows` catches a budget stop and returns.
`main` then stamps both identities, computes the guard, and writes a final checkpoint. The artifact
records `incompleteIds`, `unattemptedIds`, and `finishedAt`.

Partial artifacts stay honest but incomplete on the error path. Finding R1 records that gap. The
artifact never claims a stability that it did not verify, because both fields stay `null`.

The cumulative cap claim also holds. `judgeStoredResults` calls `resumeSpendLedger(maxBudgetUsd,
meta.budget)`. That function reloads the prior calls and recomputes the reported spend. The `$120`
stored-judge cap therefore covers collection and judging on one ledger.

## Blocked decisions

Every paid, filing, golden, and owner action stays blocked. The reviewer checked each class.

- Paid: `.agents/NEXT.md:112-123` blocks the paired subset, the stopped arms, the live-data method,
  the digest method, and four named rejudges. Revision 3 states that the general round approval is
  not the strict authorization.
- Filing: `.agents/NEXT.md:106-110` blocks all ten verified findings. `improvements/INDEX.md` shows
  57 `reported-upstream`, 10 `verified`, and 3 `declined-upstream`. That total is 70. No record has
  a filed state.
- Golden: `.agents/NEXT.md:125-132` blocks B1 to B11 and the row-review adjudication. The three
  reviewed commits changed no file under `eval/qa/corpus`.
- Owner: decisions A to J each carry a safe default of no spend, no filing, and no deployment.
  Decision 5, the concurrent-load acceptance, stays open in revision 3 and in the handoff.
- Deployment: the ledger keeps the production smoke item unchecked. No deployment happened.

Revision 3 states that it authorizes nothing. The reviewer confirms that claim.

## Branch diff review from `2ee801f`

The branch adds 63 commits and touches 171 files. The change is 36,416 added lines and 6,269
removed lines.

The three reviewed commits are tightly scoped. They touch 18 files. They change no file under
`src`, `catalog`, `inventory`, or `eval/qa/corpus`. The reviewer found no unrelated scope in them.

The wider branch carries four product-code files. They are `src/catalog/output-compaction.ts`,
`src/catalog/search.ts`, `src/executor/providers.ts`, and `src/policy/scout-exposure.ts`. Each
change belongs to a named round lane with a recorded independent review. The envelope
serialization repair is `795fa41`. The Scout exposure comments belong to the drift lane.

The first branch commit `884c0e3` squashes many lanes into one change. It carries the super-spec
compaction, the drift artifacts, and 26 round reports. That shape is a historical property of this
round. It has its own recorded reviews, including `spec-review-terra.md` and
`reviewability-audit-sol.md`. The reviewer raises no new finding against it.

The reviewer scanned the changed eval code for reviewability debt. It found no `TODO`, no `FIXME`,
no compatibility shim, no dead path, and no session narrative. The supervisor rejects v1 plans
outright rather than translating them. The capacity instrument rejects the v1 schema. The
forward-only rule holds.

The new tests are behavior-level. They mutate a valid fixture and assert a refusal. They cover the
200 and 500 boundaries, the freshness boundary, the P6 exclusive output, the flip identity pins,
and each capacity threshold. The reviewer found no test that mirrors the implementation and no test
that memorializes text. Finding R2 records the one weak assertion pattern.

## Commands and results

| Command | Result |
| --- | --- |
| `npx vitest run` (full suite) | Pass, 108 files and 1,971 tests |
| `npm run test:smoke` | Pass, 4 files and 83 tests |
| `npx vitest run <four paired-contract files>` | Pass, 153 tests |
| `npx vitest run <five paired-lane files>` | Pass, 191 tests |
| `npm run typegen` then `npm run typecheck` | Pass |
| `npm run build` | Pass, dry run exited before upload |
| `npm run secrets:scan -- --tree` | Pass, clean with gitleaks |
| `git diff --check main...HEAD` | Pass |
| `npm run eval:qa:paired:validate` | Pass |
| `npm run eval:qa:lint -- --stale` | Pass, 0 errors and 62 warnings |
| `npm run eval:qa:register -- --check` | Pass, up to date |
| `npm run eval:selftest` | Pass |
| `npm run eval:compile` | Pass |
| `npm run eval:routing` | `GATE PASS` |
| `npm run eval:protocol-history` | Both v2 contracts `source-expired`, no scored question |
| `npm run improvements:lint` | Pass, 70 findings |
| `shasum -a 256 <eleven contract files>` | All eleven matched the repair report |
| `node -e` capacity artifact against `capacityRejectionReasons` | Empty rejection list |
| `node -e` corpus recomputation | All four corpus hashes matched |
| `node -e` sample reconstruction | Ordered 200-ID and content hashes matched |
| `node -e` frozen arrays through each real parser | All eight accepted |
| `node <supervisor> --plan <plan>` without the hash | Exit 1, names `--authorized-plan-sha256` |
| `node <supervisor> --plan <plan> --authorized-plan-sha256 <wrong>` | Exit 1, canonical mismatch |
| `git rev-parse e5c835e^{tree} 1847ffd^{tree}` | Trees differ, see C1 |
| `git merge-base --is-ancestor` for four commits | All four on the round branch, none on `cbdfc5b` |

The reviewer linked a prepared `node_modules` tree and a stub `.dev.vars` for these commands. The
reviewer removed both afterwards. The worktree carries no change except this report.

The full suite ran with 1,971 tests and zero skipped tests. The reviewer had `gitleaks` installed.

## Confirmed claims in the handoff and ledger

The reviewer verified these claims independently.

- `main` is at `2ee801f`. The branch adds 63 commits.
- The round branch contains `a5ac32f`, `5603d6d`, `1847ffd`, and `dc0761d`.
- The branch `codex/tm-final-synthesis` stops at `cbdfc5b` and contains none of those four commits.
- The capacity artifact SHA-256 is `f94663390187a52a89007ca22a23530c873cb8e00b4117bece045265a56c2423`.
- It completed at `2026-09-04T10:25:17.815Z` and expires at `2026-09-05T10:25:17.815Z`.
- Every latency figure, service count, and vector hash in `paired-capacity-check-terra.md` matches
  the artifact bytes.
- The full validation figures match: 1,971 unit tests, 83 smoke tests, 0 lint errors, 62 lint
  warnings, 70 findings, and corpus content `c5d0c804…7b43e`.
- Every report commit named in the ledger repair table resolves to a commit object.
- The cap arithmetic is correct. Expected spend is about `$166`. The method maximum is `$273.50`.

## Sol standards findings

S1 is closed. Revision 3 names `1847ffd` as the final supervisor contract. The ledger repair table
lists `a5ac32f`, `5603d6d`, `1847ffd`, and `dc0761d`. Finding C3 records one remaining stale branch
label.

S2 is closed. `.agents/NEXT.md` now titles the block "Completed repair work". The block states that
the round stays open. The ledger keeps four checklist items unchecked.

S3 is closed. `.agents/NEXT.md:12-15` labels production as the last recorded deployment state from
2026-09-02. It states that nobody re-verified the live Worker.

## Preserved historical verdicts

The reviewer changed no earlier verdict. These records stay as written.

- `final-synthesis-review-sol.md` keeps `CHANGES-REQUIRED` on revision 2.
- `revised-impact-measurement-review-sol.md` keeps `CHANGES-REQUIRED` on revision 1.
- `paired-collection-supervisor-review-opus.md` keeps its `CHANGES-REQUIRED` and `PASS` sequence.
- The v1 capacity run keeps its provisional status. It cannot enter a v2 plan.
- Sol measured 164 tests across five paired-lane files at `b5dca1c`. The reviewer measured 191 at
  `52e34c6`. Commit `1847ffd` added the difference. Sol's figure was correct at its own snapshot.
- The two `qa-paired-collection-plan-v1` references inside dated round reports are provenance. They
  are not findings.

## Risks

- The capacity artifact expires at `2026-09-05T10:25:17.815Z`. A later launch needs a fresh
  artifact, a new plan hash, and a new owner signature.
- The design requires a weekend UTC start. The expiry and the window can conflict.
- Scout ships often. The design accepts a 16% to 53% chance of a guard stop inside the window.
- The capacity check covers 14 public reads. It does not prove sustained capacity across 200 paired
  rows.
- The plan holds the salt and the salted `.dev.vars` digest together. The handling rule protects the
  secrets. The plan must stay uncommitted and must be deleted after the run.
- The supervisor does not read the external authorization record. A human must check that the
  record names the printed canonical hash.
- Judge discordance may exceed 0.3 and force an `INDETERMINATE` result.

## Exclusions

The reviewer did not run any paid command. The reviewer did not run `eval:qa:compile`,
`improvements:index`, or `eval:qa:paired:capacity`, because each writes a generated artifact or
makes live requests. The reviewer verified their recorded outputs by direct recomputation instead.

The reviewer did not verify the live production Worker. Network mutation and deployment were out of
scope.

## Blockers before `LAUNCH-OK`

1. Repair L1 in `.agents/skills/run-evals/SKILL.md`.

## Blockers before `CLOSEOUT-OK`

1. Repair C1 in `launch-contract-repair-sol.md`.
2. Repair C2 in `launch-contract-repair-sol.md`.
3. Repair C3 in `revised-impact-measurement-fable.md`.
4. Record the L1 skill repair as a machine-ready item in `.agents/NEXT.md`.

Findings R1, R2, and R3 need no action before launch. Record them as follow-up items.

## Standing

The launch contract at `1847ffd` is sound. Its enforcement matches its documentation in
`eval/qa/README.md`, `eval/EVALS.md`, `.agents/TODO.md`, and revision 3. All six Sol findings are
closed. Every corpus hash, contract hash, and capacity figure reproduces exactly.

The four repairs above are small and local. They change no code and no contract. After those
repairs, this review supports `LAUNCH-OK` and `CLOSEOUT-OK`.

The owner authorization stays unsigned. The concurrent-load acceptance stays open. No paid, filing,
golden, or deployment action is authorized by this review.
