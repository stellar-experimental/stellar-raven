# Section guard — pre-spend measurement plan

Status: **draft, not authorized.** No paid call ran. The plan needs an independent pre-spend
review and a spend authorization. The paid run waits for the next weekend authorization.

Change under test: Fix 1 of Pattern 2 in the
[triage ledger](../2026-10-12-call-pattern-triage.md). `SECTIONS_GUARD` in
`src/executor/providers.ts` throws on a map read of `r.data.sections` and on a string use of a
section object. It changes model-visible results: a script with lost section text becomes a
failed script.

This file also holds the **shared section screen**: the pins, schedule, commands, and budget
that the [section-text plan](plan-section-text.md) uses too. Base plan for structure: the
answer-style plans on PR #271 (`.agents/rounds/2026-10-10-weekend/answer-style/measurement-plan.md`
and `measurement-plan-v2.md`).

## Question

When the guard turns a silent section misread into an exception, does the model recover? Does
the guard do so without lost results, without a false exception on a correct read, and without
an answer regression?

## Cheapest valid design: one shared baseline

The guard and the text are two separate changes. Each needs its own verdict. Two separate ABBA
screens need eight collections. A shared baseline needs six:

| Arm | Content | Used by |
| --- | --- | --- |
| A | `main` | Both verdicts |
| G | `main` plus the guard commits only | Guard verdict (G against A) |
| T | `main` plus the text commit only | Text verdict (T against A) |

Order: **A1, G1, T1, T2, G2, A2.** The order is symmetric around its center. Each arm has the
same mean position (3.5), so a linear source drift does not favor an arm. A against G and A
against T are each ABBA-like. The screen needs five server starts: A, G, T, G, A.

Why this design is valid:

- G and T each differ from A by one change only. G and T are never compared with each other.
- Both changes touch disjoint code paths. Both apply cleanly to `main` alone (checked with
  `git merge-tree` on 2026-10-12).
- The cost of the shared baseline: an unusual A collection affects both verdicts. The noise
  floor (A1 against A2) shows that risk. Report it beside both verdicts.

Not measured: the guard and the text together. The guard acts only on a misread. The text acts
only on the guidance before the read. With both present, the text can only lower the number of
misreads that reach the guard. So the guard's measured harms (lost results, extra calls) bound
the combined harms from above. This is an inference, not a measurement. The TODO done-condition
already needs a later authorized QA round to recount the three behaviors after both merge.

### Merge order

1. The clip marker, on its own verdict. It touches `src/demo/` only, and its plan builds both
   arms on the `main` of its launch. It does not depend on the section changes.
2. The section text, if its verdict is PASS. It is guidance only, and it is the smaller change.
3. The section guard, if its verdict is PASS, in a separate merge after the text.

Each change merges as its own PR or commit set. A FAIL or INDETERMINATE verdict keeps that change
off `main`. Run the Playground screen first: it is the cheapest (about $3.40), and it frees the
server slot fast. The section screen follows in the same window or a later one.

If the owner authorizes only one section change, run a four-collection ABBA for it: A1, X1, X2,
A2. The rules below do not change. The fallback budget is in "Budget".

## Arms

| Arm | Revision | Tree (pin) | Built how |
| --- | --- | --- | --- |
| A | `main` `6891dca23a2e1baab44916a6cd8524006f0e9267` | `ab4c63e3de9e85b479dea657169d2ff5a8ed9387` | Detached worktree at that commit |
| G | `main` plus `ba6a1dfa95122276f72b8b1cad51338d5ca9c64c`, then `416d2aa24835ec6a88580fcfc095f0ea5235ec15` | `28a6411854bc93fca8e6a1b1c290028b31ed9cda` | Detached worktree at `main`, then `git cherry-pick` |
| T | `main` plus `7cf3a833eeb5a1864eeb6f56bdf3ce7dfa3bd558` | `e74d9afdc4604975df233286b9d2fe77944b9e05` | Detached worktree at `main`, then `git cherry-pick` |

- The SHAs are the `w1012/t` commits after the 2026-10-12 rebase onto `6891dca2`. A later rebase
  changes them. Then cherry-pick the commits with the same subjects: "executor: guard misreads
  of a section read" and "executor: keep property checks on a guarded section read" (G), and
  "mcp: state the section-read result shape" (T).
- Assert each tree pin. The cherry-pick commit SHA depends on the time; the tree does not.
- `git diff --stat A G` lists only `src/executor/providers.ts`, `test/executor-providers.test.ts`,
  and `test/smoke/executor.test.ts`. G holds no text change: the `codemode.describe` usage line
  stays "the result arrives under r.data.sections".
- `git diff --stat A T` lists only `src/executor/providers.ts`, `src/mcp/tools.ts`, `src/site.ts`,
  `src/skills/README.md`, `test/executor-providers.test.ts`, and `test/mcp-instructions.test.ts`.
- No arm changes `package.json`, `package-lock.json`, `eval/`, `catalog/`, or `specs/`. All arms
  install the same toolchain.
- If `main` moves before launch, rebuild all three arms on the new `main` and record the new
  trees as an amendment. It needs no new review only when each arm diff shows the same changed
  lines as its commits. Draft PR #271 edits the same `execute` description. If it merges first,
  the T cherry-pick can conflict. A conflict needs a reviewed amendment.

The answering server of each arm must serve that arm's whole tree. A partial overlay is not an
arm.

## Instrument and models

MCP QA (`eval/qa/run-qa.mjs`, variant `A`), one server at a time, from one clean runner worktree
at A. The runner keeps the QA implementation and the case bytes the same across arms.

| Role | Model |
| --- | --- |
| Answer | `claude-sonnet-5` (runner default; pass no `--model`) |
| Judge | `claude-sonnet-5` (runner default; pass no `--judge-model`), rubric `v2.11`, pack `p6` |

Record the rubric and pack from the first judged row of each collection. If `main` carries a
new rubric or pack at launch (for example pack p9 from draft PR #272), all six collections use
it. Record that in the amendment. Do not compare these grades with stored grades.

## Frozen rows (16, battery order)

The runner keeps battery order. Use this list as one `--ids` value in every collection.
All 16 are `active` and `confirmed` at `6891dca2`.

| Row | Role | Observed misread (run) | Guard can act on it |
| --- | --- | --- | --- |
| `q-aas-burn-clawback-redemption-mechanics` | Misread | Absent `content` (paired-1 baseline); `.slice` on a section (paired-3 candidate) | No: `.slice` already throws |
| `q-aas-list-token-on-exchanges-aggregators` | Misread | Absent `content`, top-level shape (paired-3 baseline) | Only if a trapped class occurs |
| `q-agent-identity-erc8004-stellar` | Misread | Absent `content`, top-level shape (paired-1 baseline) | Only if a trapped class occurs |
| `q-asset-trustline-basics` | Control | None; section read in 5 of 8 stored runs | Only on a false exception |
| `q-defi-build-staking-for-own-token` | Misread | Map keyed by section (paired-1 baseline, paired-3 candidate) | **Yes** |
| `q-defi-etherfuse-stablebonds` | Misread | Absent `content`, top-level shape (paired-1 baseline) | Only if a trapped class occurs |
| `q-edge-ambig-stellar-token-meaning` | Control | None; section read in 4 of 4 runs | Only on a false exception |
| `q-edge-noinfo-sep-9999` | Misread | Sections array used as a string, `.toString()` (B1) | **Yes** |
| `q-jutsu-check-account-history` | Misread | Absent `content`, top-level shape (both paired baselines) | Only if a trapped class occurs |
| `q-passkey-smart-account-architecture` | Misread | Section used as a string (paired-1 and paired-3 candidate) | **Yes** |
| `q-pc-address-types-strkey` | Misread | Absent `content`, top-level shape (paired-1 baseline) | Only if a trapped class occurs |
| `q-pc-surge-griefing-threat-model` | Misread | Section used as a string (paired-1 candidate) | **Yes** |
| `q-scf-pitch-prep-live` | Misread | Absent `content`, top-level shape (paired-3 baseline) | Only if a trapped class occurs |
| `q-soroban-cross-contract-call` | Misread | `typeof … === "string"` check on a section object (B1); absent `content` (C1) | No: both observed paths stay silent |
| `q-soroban-fuzz-testing` | Control | None; a correct `content \|\| sections` fallback | Only on a false exception |
| `q-stellar-recurring-payments` | Misread | Map keyed by section (C2, two scripts) | **Yes** |

**Change to the ledger's frozen list.** The ledger named `q-soroban-storage-types` as a control.
It has no MCP row in any stored run since 2026-10-07; its section read is a Playground
observation. So it cannot show how MCP scripts read sections. This plan uses
`q-asset-trustline-basics` instead: it read sections in all four answer-style runs and in
paired-1 candidate, with no misread, and all four grades were `correct`. The ledger records the
change.

**Deterministic exposure.** The guard code runs only on a successful section read. A row-run
with no section-read script cannot change because of the guard. Its grade difference is
variance by construction, and it is monitor-only. The helper below lists the section-read
scripts of each row-run.

No row without a skill read is in the list. The guard cannot act on such a row, so it would
measure only noise.

**Expected exposure** (from stored scripts on the current `data` envelope): the 13 misread rows
had 46 section-read scripts in 38 row-runs (about 1.2 per row-run). 10 of the 46 were misreads
(21.7%), and 7 were a trapped class (15.2%). So one collection is expected to hold about 16
section-read scripts and about 2.4 trapped misreads. Two G collections hold about 4.8 expected
guard exceptions. These are expectations from 6 stored runs, not a power claim.

## Counts and how to read them

Run the free helper on each result first:
`node .agents/rounds/2026-10-12-call-pattern-triage/count-patterns.mjs --rows <result.json>`.
On the eight stored MCP runs it prints 199 `skill.read` scripts, all of them section reads.
That matches the triage ledger.

| Count | Source | Use |
| --- | --- | --- |
| S: section-read scripts per row-run | Helper `sectionReadScripts` | Exposure |
| E: guard exceptions | Helper `guardMessages` | Mechanism |
| F: false guard exceptions (an exception on a correct read) | Direct read of each script with E > 0 | Defect |
| M: misreads by class (map key, string use, absent `content`, other) | Direct read of each section-read script | Mechanism |
| L: silent text losses (a misread script that returned without an exception) | Direct read | Mechanism |
| R: recoveries | Direct read: after a guard exception, a later script in the same row reads the same section correctly | Mechanism |
| U: unrecovered exceptions | Direct read: the row ends without a correct read of that section | Harm |
| D: lost co-results | Direct read: other service calls in a script that threw a guard exception | Harm |
| X: execute calls per row, and execute errors per row | Helper `executeCalls`, `executeErrors` | Call use |
| G: grades | `verdict.score`, ordinal `wrong` 0, `partial` 1, `correct` 2, after T4 and T5 exclusions | Answer rule |

Two readers classify every section-read script on their own and reconcile. One reader is not the
author of the guard. Each reader records the script's row, transcript index, and class.
Report S, E, F, M, L, R, U, D, and X per collection and per arm.

## Reading rules (fixed before spend)

1. **Completeness.** Each collection holds 16 rows, `meta.comparable: true`, unsuppressed
   aggregates, and `budget` with no missing cost. A short or non-comparable collection allows only
   a per-row diagnostic, unless the replacement fills its slot.
2. **Arm integrity.** E is 0 in A1, A2, T1, and T2. A guard message in an arm without the guard
   means a wrong arm. The method is then INDETERMINATE.
3. **Consistent change.** A row changes only when both G grades differ from both A grades in the
   same direction. Any other difference is variance, monitor-only. A row-run with S = 0 is
   unexposed (see "Deterministic exposure").
4. **PASS** needs all of these:
   - E is 1 or more across G1 and G2 (the guard fired);
   - F is 0;
   - R is greater than U;
   - L in G (G1 plus G2) is not greater than L in A (A1 plus A2);
   - zero confirmed consistent regressions on a row where the guard fired in a G collection;
   - at most one confirmed consistent regression on the other rows.
5. **FAIL** if any of these is true. A FAIL blocks the merge.
   - F is 1 or more (the guard broke a correct read);
   - E is 1 or more and U is equal to or greater than R;
   - a confirmed consistent regression on a row where the guard fired;
   - two or more confirmed consistent regressions on any rows.
6. **INDETERMINATE** in every other case. Examples: an incomplete or non-comparable collection,
   E = 0 across G1 and G2, or L higher in G with no other FAIL condition. Do not repeat a
   collection under the same authorization.
7. **Confirmation re-judge.** After all six collections, write the consistent-change list in the
   ledger before any re-judge spend. Re-judge those IDs once in A1 and once in G1. A change that
   the re-judge does not reproduce is judge variance. Live-check every G `wrong` against the
   service before it counts (`run-evals` Step 4). "Confirmed" means it survived both.
8. **Failed confirmation re-judge.** A re-judge that ends T4 or T5 on a listed ID gets one retry
   of the failed IDs, in the same artifact, with the same model, rubric, and pack, under
   `--max-budget-usd 2`. At most one retry per re-judged artifact. Then:
   - when the retry gives a valid grade, use it as the confirmation grade;
   - when the retry also ends T4 or T5, the row is an **unconfirmed change**; record both stamps
     and never use the diagnostic `judgeScore` as a grade;
   - an unconfirmed regression on a row where the guard fired gives FAIL, because four
     collections observed it and the merge needs evidence of no regression;
   - an unconfirmed regression on another row counts as confirmed for the rule 4 and rule 5
     limits;
   - an unconfirmed improvement counts as no change;
   - a live check that clears the G answer removes the regression, confirmed or not.
   The ledger keeps "unconfirmed" separate from "confirmed".
9. **Noise floor.** Report the A1-against-A2 and G1-against-G2 grade disagreement counts beside
   the consistent-change count. They bound what variance can explain. They are not a significance
   threshold.
10. Do not tune per case. A failed row supplies a test, not new guard wording.

The sample is too small for `eval:qa:paired` (it needs 100 eligible IDs). Do not run it. Also run
the free plan regrade on each collection: `npm run eval:plan -- <result.json>`.

## Shared section screen: pins (assert before the first paid call)

| Pin | Value |
| --- | --- |
| Arms | The three tree pins above |
| `SERVER_REVISION` | The 40-character commit of each arm worktree, which must be clean |
| `SURFACE_SHA256` | `node eval/report-live-surface.mjs --port <port> --expect-source-revision <rev> --json <out>` per arm. **A and G must match**: the guard changes no `tools/list` text. **T must differ** from A: the `execute` description changes. |
| Surface size | `npm run mcp:surface` in each arm worktree; record the `execute` description length. Only T differs. |
| Runner | One clean runner worktree at A. Record `qaImplementationSha256` and `meta.inputSnapshot.casesSha256`; both stay the same in all six collections. |
| `AGENT_BINARY_SHA256` | One versioned `claude` executable, linked from a private `PATH` directory, with `DISABLE_AUTOUPDATER=1` |
| `AGENT_ENVIRONMENT_SHA256` | Computed once in the collection shell after every Claude variable has its final value |
| Remote identity | `eval/qa/probe-remote-identities.mjs`, its SHA-256, and one `--stable-sha256` vector for this authorization |
| Judge-stability register | One frozen register outside the runner tree, made once before A1. Record its SHA-256. Pass the same path to all six collections. |
| Server `.dev.vars` identity | One salted `devVarsIdentity` hash with one fresh salt across the three server worktrees. The hashes and name lists must match. Record the salt and hash only. |

A changed pin stops the method before the next paid call. Do not replace an expected value in
the same authorization.

Checkpoints before the first paid call:

- **Paired window.** `test ! -e /private/tmp/stellar-raven-paired-launch`. The owner confirms that
  no paired plan signature or collection is in progress, and the end of the window. Do not create
  that directory. Do not merge or deploy between a paired plan signature and the end of paired
  collection.
- **Server slot.** `pgrep -f 'wrangler|workerd' | wc -l` prints `0`. Never use `pgrep -fl` or `ps`
  with arguments.
- **Freeze.** All four worktrees are clean, with no untracked file (a stray `plugins/` trips the
  guard). Each arm passes `npm run typecheck`, `npm test`, and `npm run test:smoke`.
- **Server stop risk.** The 2026-10-12 soak found that Wrangler can exit after
  `Network connection lost.` Re-assert the revision and the surface after each start. A server
  exit during a collection is a transport failure (see "Replacement").

## Shared section screen: budget

Cost basis, from stored `meta.totalCostUsd` and per-row `agent.costUsd` and `verdict.costUsd` in
the main checkout's `eval/qa/results/`. No run had a missing cost.

| Source | Contract | n | Range (USD) | Median (USD) |
| --- | --- | ---: | --- | ---: |
| Answer-style collections, 34 rows (`2026-10-11-answer-style/`) | `claude-sonnet-5` both roles, `v2.11`, `p6` | 4 | 11.64 to 12.08 per collection (0.342 to 0.355 per row) | 11.75 |
| Paired collect-only, 142 to 145 rows (`2026-10-11-paired-attempt-{1,3}/`) | `claude-sonnet-5` answer only, no judge | 4 | 35.91 to 37.29 per collection (0.248 to 0.263 per row) | 36.24 |
| Directed re-judges, 4 IDs each (2026-10-11) | `v2.11`, `p6` | 2 | 0.33 to 0.36 | 0.345 |

The 16-row list has no stored run of its own. Per-row estimate: the median answer cost of that row
across up to 10 stored runs, plus the median judge cost of that row across up to 6 judged runs.
A row with no judged history (5 rows) uses the all-row judge median, $0.096. The rows are
skill-heavy, so they cost more than the answer-style mean:

- one collection: **$6.39** (sum of row medians); $9.12 (sum of row maxima, with a $0.444 judge
  maximum for rows with no judged history);
- six collections: about **$38**.

| Item | Cap (`--max-budget-usd`) |
| --- | ---: |
| Each of the six collections | 10 |
| Re-judge in A1 (union of the guard and text lists) | 4 |
| Re-judge in G1 | 3 |
| Re-judge in T1 | 3 |
| Rule 8 retry in A1, G1, or T1, if needed (reserve, at most one each) | 2 each, 6 in all |
| One replacement collection (reserve) | 10 |
| **Total authorization** | **86** |

- The collection cap is 10 percent above the sum of row maxima and 56 percent above the estimate.
  It also covers judge-panel escalation (the default cap is 10 boundary panels for 16 rows).
- A budget stop ends that command. Do not resume it under the same authorization.
- If a consistent-change list needs more than its re-judge cap, stop and request a new
  authorization.
- A budgeted call without a reported cost invalidates the method.
- Fallback for one section change only (A1, X1, X2, A2): four collections at 10, re-judges in A1
  and X1 at 3 each, two retries at 2 each, one replacement at 10. Total **$60**.

**Replacement.** Use the reserve only for a collection that is incomplete because of a transport
failure (for example a Wrangler exit), with complete cost accounting. Restart the same arm's
server, re-assert every pin, and run the same 16 IDs. Run it next, before the next scheduled
collection, so the order stays balanced. Keep the failed artifact separate. A second failed
collection ends the screen: both verdicts are INDETERMINATE.

## Shared section screen: commands

Run every command from the runner worktree root in the pinned collection shell. Call `node`
directly, not `npm run`, so `PATH` does not change. Fill each `<…>` from recorded values.

### Once, before A1

```sh
MAIN=6891dca23a2e1baab44916a6cd8524006f0e9267
for WT in "$A_WT" "$G_WT" "$T_WT" "$RUNNER_WT"; do git worktree add --detach "$WT" "$MAIN"; done
git -C "$G_WT" cherry-pick ba6a1dfa95122276f72b8b1cad51338d5ca9c64c 416d2aa24835ec6a88580fcfc095f0ea5235ec15
git -C "$T_WT" cherry-pick 7cf3a833eeb5a1864eeb6f56bdf3ce7dfa3bd558
test "$(git -C "$A_WT" rev-parse HEAD^{tree})" = ab4c63e3de9e85b479dea657169d2ff5a8ed9387
test "$(git -C "$G_WT" rev-parse HEAD^{tree})" = 28a6411854bc93fca8e6a1b1c290028b31ed9cda
test "$(git -C "$T_WT" rev-parse HEAD^{tree})" = e74d9afdc4604975df233286b9d2fe77944b9e05
# In each server worktree: npm ci, copy .dev.vars without printing it, npm run typegen,
# npm run typecheck, npm test, npm run test:smoke. In the runner: npm ci.
for WT in "$A_WT" "$G_WT" "$T_WT" "$RUNNER_WT"; do git -C "$WT" status --porcelain=v1 --untracked-files=all; done   # prints nothing

export DISABLE_AUTOUPDATER=1
PATH="<private dir holding only a link to the versioned claude executable>:$PATH"
AGENT_BINARY_SHA256=$(shasum -a 256 "$(command -v claude)" | cut -d ' ' -f 1)
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d ' ' -f 1)
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256)
STABILITY_REGISTER=<absolute path outside the runner tree>/judge-stability.json
node eval/qa/judge-stability.mjs --results-dir "<directory of stored QA results>" --out "$STABILITY_REGISTER"
shasum -a 256 "$STABILITY_REGISTER"   # record in the ledger
DEV_VARS_SALT=$(openssl rand -hex 32)
for WT in "$A_WT" "$G_WT" "$T_WT"; do
  node --input-type=module -e 'import { devVarsIdentity } from "./eval/qa/paired-collection-supervisor.mjs"; const r = devVarsIdentity(process.argv[1], process.argv[2]); process.stdout.write(JSON.stringify(r) + "\n");' "$WT" "$DEV_VARS_SALT"
done   # the three lines must be identical
test ! -e /private/tmp/stellar-raven-paired-launch && echo "paired-launch directory absent"
pgrep -f 'wrangler|workerd' | wc -l   # must print 0

IDS="q-aas-burn-clawback-redemption-mechanics,q-aas-list-token-on-exchanges-aggregators,q-agent-identity-erc8004-stellar,q-asset-trustline-basics,q-defi-build-staking-for-own-token,q-defi-etherfuse-stablebonds,q-edge-ambig-stellar-token-meaning,q-edge-noinfo-sep-9999,q-jutsu-check-account-history,q-passkey-smart-account-architecture,q-pc-address-types-strkey,q-pc-surge-griefing-threat-model,q-scf-pitch-prep-live,q-soroban-cross-contract-call,q-soroban-fuzz-testing,q-stellar-recurring-payments"
```

### Each server start (A, G, T, G, A)

```sh
# In the orchestrator's own pane, from the arm's server worktree:
npm run dev:eval -- --port "<port>"
# From the runner worktree:
node eval/report-live-surface.mjs --port "<port>" --expect-source-revision "<arm revision>" --json "<out>.json"
# Assert surfaceSha256: A and G equal; T different. Stop the server after its collections.
```

### Each collection (A1, G1, T1, T2, G2, A2)

```sh
node eval/qa/run-qa.mjs \
  --ids "$IDS" \
  --port "<port>" \
  --max-budget-usd 10 \
  --stability-register "$STABILITY_REGISTER" \
  --server-revision "<arm revision>" \
  --expect-sha256 "<arm surface sha256>" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" \
  --remote-identity-probe "$REMOTE_IDENTITY_PROBE" \
  --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
  --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256"
node .agents/rounds/2026-10-12-call-pattern-triage/count-patterns.mjs --rows "<result file>"
```

Do not pass `--sample`. Check before each collection that the command passes exactly one
`--max-budget-usd`, with the value 10.

### Directed re-judge (after the lists are in the ledger)

```sh
node eval/qa/re-judge.mjs "<A1, G1, or T1 result>" --ids "<listed IDs>" --cases-ref "$MAIN" --dry-run
node eval/qa/re-judge.mjs "<A1, G1, or T1 result>" \
  --ids "<listed IDs>" \
  --cases-ref "$MAIN" \
  --max-budget-usd "<4 for A1; 3 for G1 or T1; 2 for a rule 8 retry>" \
  --claude-path "$(command -v claude)" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256"
```

## Records

Record the pins, stamps, costs, counts, script classifications, and readings in a new
"Measurement results" section of the [triage ledger](../2026-10-12-call-pattern-triage.md).
Write each consistent-change list and each retry selection there before its spend. Result JSON
stays local under `eval/qa/results/` (gitignored). A non-author reviewer reviews the result
before the merge decision.
