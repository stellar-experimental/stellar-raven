# Section guard — pre-spend measurement plan

Status: **draft, not authorized.** No paid call ran. The plan needs an independent pre-spend
review and a spend authorization. The paid run waits for the next weekend authorization.
Revision 2 reconciles review RP (Codex `gpt-6-astra`, high, CHANGES-NEEDED on `704d84ae`).
Revision 3 reconciles review RP2 (the same reviewer, CHANGES-NEEDED on `4a5d17a1`).

Change under test: Fix 1 of Pattern 2 in the
[triage ledger](../2026-10-12-call-pattern-triage.md). `SECTIONS_GUARD` in
`src/executor/providers.ts` throws on a map read of `r.data.sections` and on a string use of a
section object. It changes model-visible results: a script with lost section text becomes a
failed script.

This file also holds the **shared section screen**: the design, pins, schedule, commands, and
budget that the [section-text plan](plan-section-text.md) uses too. Base plan for structure: the
answer-style plans on PR #271 (`.agents/rounds/2026-10-10-weekend/answer-style/measurement-plan.md`
and `measurement-plan-v2.md`).

## Question

When the guard turns a silent section misread into an exception, does the model recover? Does
the guard do so without lost results, without a false exception on a correct read, and without
an answer regression? The guard must be measured on the baseline that it will ship on.

## Design: one four-arm screen

| Arm | Content |
| --- | --- |
| A | `main` |
| T | `main` plus the text commit only |
| G | `main` plus the guard commits only |
| TG | `main` plus the text commit and the guard commits |

Order: **A1, T1, G1, TG1, TG2, G2, T2, A2.** The order is symmetric around its center. Each arm
has the same mean position (4.5), so a linear source drift does not favor an arm. The screen
needs seven server starts (A, T, G, TG, G, T, A).

Comparisons, fixed before spend:

| Verdict | Comparison | When it decides a merge |
| --- | --- | --- |
| Text | A against T | Always ([section-text plan](plan-section-text.md)) |
| Guard | **T against TG** | When the text verdict is PASS. The guard then ships on T, so this is its shipping baseline. |
| Guard | **A against G** | When the text verdict is FAIL or INDETERMINATE. The guard then ships on A. |
| Diagnostic only | A against TG; the guard comparison that does not decide | Never |

Why this design:

- Separate PASS verdicts for G and T do not show that T plus G is safe. The text can change
  section choice, script shape, call order, and recovery. So the plan measures the combined arm
  TG directly, against T, before the second merge.
- Each comparison differs by one change only. The guard comparisons differ by the guard commits.
  The text comparison differs by the text commit.
- The screen costs eight collections. A two-stage design (A against T, then T against TG or A
  against G under a second authorization) also costs eight collections, because each stage
  needs its own in-window baseline. The four-arm screen needs one authorization and one window,
  and it shares one reserve. In it, the guard comparison that does not decide is the price of
  one window: two collections, about $12 expected.

### Merge order

1. The clip marker, on its own verdict. It touches `src/demo/` only, and its plan builds both
   arms on the `main` of its launch.
2. The section text, if its verdict is PASS.
3. The section guard, if the guard verdict that applies is PASS: T against TG after a text
   merge, or A against G when the text does not merge.

Each change merges as its own PR or commit set. A FAIL or INDETERMINATE verdict keeps that change
off `main`. Run the Playground screen first: it is the cheapest (about $3.40), and it frees the
server slot fast.

If the owner authorizes only one section change, run a four-collection ABBA for it: A1, T1, T2,
A2 for the text, or the guard comparison that applies at that time (for the guard after a text
merge: T1, TG1, TG2, T2). The rules below do not change. The fallback budget is in "Budget".

## Arms

| Arm | Revision | Tree (pin) | Built how |
| --- | --- | --- | --- |
| A | `main` `6891dca23a2e1baab44916a6cd8524006f0e9267` | `ab4c63e3de9e85b479dea657169d2ff5a8ed9387` | Detached worktree at that commit |
| T | `main` plus `7cf3a833eeb5a1864eeb6f56bdf3ce7dfa3bd558` | `e74d9afdc4604975df233286b9d2fe77944b9e05` | Detached worktree at `main`, then `git cherry-pick` |
| G | `main` plus `ba6a1dfa95122276f72b8b1cad51338d5ca9c64c`, then `416d2aa24835ec6a88580fcfc095f0ea5235ec15` | `28a6411854bc93fca8e6a1b1c290028b31ed9cda` | Detached worktree at `main`, then `git cherry-pick` |
| TG | `main` plus `7cf3a833…`, then `ba6a1dfa…`, then `416d2aa2…` | `8d32d670a14c2428cbcd2fe70e33bc39ecdf2fc7` | Detached worktree at `main`, then `git cherry-pick` of the three commits |

- The TG tree comes from `git merge-tree` onto `6891dca2` (2026-10-12). The text-first and the
  guard-first orders give the same tree. Its `src/` and `test/` equal those of `w1012/t` without
  the two clip-marker files.
- The SHAs are the `w1012/t` commits after the 2026-10-12 rebase onto `6891dca2`. A later rebase
  changes them. Then cherry-pick the commits with the same subjects: "mcp: state the
  section-read result shape" (text), "executor: guard misreads of a section read" and
  "executor: keep property checks on a guarded section read" (guard).
- Assert each tree pin. The cherry-pick commit SHA depends on the time; the tree does not.
- `git diff --stat A G` lists only `src/executor/providers.ts`, `test/executor-providers.test.ts`,
  and `test/smoke/executor.test.ts`. G holds no text change: the `codemode.describe` usage line
  stays "the result arrives under r.data.sections".
- `git diff --stat A T` lists only `src/executor/providers.ts`, `src/mcp/tools.ts`, `src/site.ts`,
  `src/skills/README.md`, `test/executor-providers.test.ts`, and `test/mcp-instructions.test.ts`.
- `git diff T TG` shows the same changed lines as `git diff A G`.
- No arm changes `package.json`, `package-lock.json`, `eval/`, `catalog/`, or `specs/`. All arms
  install the same toolchain.
- If `main` moves before launch, rebuild all four arms on the new `main` and record the new trees
  as an amendment. It needs no new review only when each arm diff shows the same changed lines as
  its commits. Draft PR #271 edits the same `execute` description. If it merges first, the text
  cherry-pick can conflict. A conflict needs a reviewed amendment.

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
new rubric, pack, or tier policy at launch (for example pack p9 from draft PR #272), all eight
collections use it. Record that in the amendment, and recheck the cost basis and the caps. Do not
compare these grades with stored grades.

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
paired-1 candidate, with no misread, and all four grades were `correct`.

**Exposure for the guard.** In each guard comparison, the two arms serve the same surface and the
same guidance. The model input is byte-identical until a section read returns. So the guard can
change a row-run only after a section read. A row-run with no section-read script (S = 0, see
below) cannot change because of the guard, and its grade difference is variance. This rule
applies to the guard verdict only. The text verdict keeps every row in its regression check.

No row without a skill read is in the list. The guard cannot act on such a row, so it would
measure only noise.

**Expected exposure** (from stored scripts on the current `data` envelope): the 13 misread rows
had 46 section-read scripts in 38 row-runs (about 1.2 per row-run). 10 of the 46 were misreads
(21.7%), and 7 were a trapped class (15.2%). So one collection is expected to hold about 16
section-read scripts and about 2.4 trapped misreads. Two guard collections hold about 4.8
expected guard exceptions. With the text present (TG), the number can be lower. These are
expectations from 6 stored runs, not a power claim.

## Counts and how to read them

Run the pinned counter (see "Commands") on each result. It parses each whole execute script
with acorn: a program, or one expression that consumes the input. It follows every `codemode`
reference through the syntax tree, including bracket steps. It marks as `unknown` a call or an
option object that it cannot resolve, and every skill-read reference that is not a direct call
(an alias, a destructure, a computed step), even when the same script also has a resolved read.
It lists each unparsed script. Readers inspect every unknown and unparsed script before they
assign exposure or compute a rate. Its `--self-check` holds 23 fixtures, with the review RP and
RP2 fixtures; it runs before every count and stops on a mismatch.

On the eight stored MCP runs, the counter finds 199 section-read scripts and no unknown
skill-read script. That matches the triage ledger.

| Count | Source | Use |
| --- | --- | --- |
| S: section-read scripts per row-run | Counter `sectionReadScripts`, plus reconciled unknowns | Exposure |
| E: guard exceptions | Counter `guardMessages` | Mechanism |
| F: false guard exceptions (an exception on a correct read) | Direct read of each script with E > 0 | Defect |
| M: misreads by class (map key, string use, absent `content`, other) | Direct read of each section-read script | Mechanism |
| L: silent text losses (a misread script that returned without an exception) | Direct read | Mechanism |
| R: recoveries | Direct read: after a guard exception, a later script in the same row reads the same section correctly | Mechanism |
| U: unrecovered exceptions | Direct read: the row ends without a correct read of that section | Harm |
| D: lost co-results | Direct read: other service calls in a script that threw a guard exception | Harm |
| X: execute calls per row, and execute errors per row | Counter `executeCalls`, `executeErrors` | Call use |
| G: grades | The row's grade (see "Grade coverage") | Answer rule |

Two readers classify every section-read script and every unknown or unparsed script on their own
and reconcile. One reader is not the author of the guard. Each reader records the script's row,
transcript index, and class. Report S, E, F, M, L, R, U, D, and X per collection and per arm.

## Grade coverage (applies before every regression rule)

Each comparison needs a grade for each of the 16 rows in each of its four collections. Read the
first-pass class from `eval/qa/five-track.mjs` (`rowOutcomeClass`):

| Row outcome | Grade |
| --- | --- |
| `graded-correct`, `graded-partial`, `graded-wrong` | 2, 1, 0 |
| `agent-limit` (the answering agent hit its turn limit) | 0: a T1 system failure that counts as `wrong`. It is never excluded. |
| `judge-*` (a T4 or T5 judge outcome) | Missing. One initial-judge retry is allowed (below). |
| Any other `agent-*` outcome, `answered-unjudged`, or `unattempted` | Missing. No retry. |

- **Initial-judge retry.** For a `judge-*` row, run one `re-judge.mjs` command on that artifact
  for those IDs, with the same model, rubric, and pack, under `--max-budget-usd 2`. At most one
  such command per artifact, and at most four in the screen ($8 reserve). A valid retry grade
  becomes the row's grade. Record the source artifact and the retry artifact path.
- **No repair collection** is authorized. An answering-side loss of a row stays missing.
- A comparison with any missing grade, after its retries, is **INDETERMINATE**. This applies even
  when the other rows show no change. A candidate-only loss cannot hide a regression.

## Confirmation sequence (shared, fixed before spend)

The text verdict selects the guard comparison. So the text is confirmed first, and the guard list
exists only after that. Run these steps in this order, after all eight collections and their
initial-judge retries. Each command runs at most once. Write each list and each selection in the
ledger before the spend that uses it.

| Step | Action | Command and cap |
| --- | --- | --- |
| 1 | Write the text consistent-change list (A against T, all 16 rows). | Free |
| 2 | Re-judge the gradeable text-list IDs in A1 and in T1. | K1 (A1) and K2 (T1), `--max-budget-usd 3` each |
| 3 | A rule 8 retry for K1 or K2, only if needed. | K1r and K2r, `--max-budget-usd 2` each |
| 4 | Live-check the T `wrong` answers on the text list. Read the text verdict. | Free |
| 5 | Select the guard comparison: T against TG after a text PASS, A against G otherwise. | Free |
| 6 | Write the guard consistent-change list for that comparison. | Free |
| 7 | Re-judge the gradeable guard-list IDs in B1 and in C1. | K3 (B1) and K4 (C1), `--max-budget-usd 3` each |
| 8 | A rule 8 retry for K3 or K4, only if needed. | K3r and K4r, `--max-budget-usd 2` each |
| 9 | Live-check the C `wrong` answers on the guard list. Read the guard verdict. | Free |

- **Shared results.** B1 is A1 or T1, which step 2 already re-judged. A guard-list ID that K1, K2,
  K1r, or K2r graded validly in that same artifact reuses that grade. K3 then holds only the other
  IDs. Skip a command whose ID set is empty.
- **Gradeable IDs.** A command holds only the IDs whose cell in that artifact has a grade. An
  `agent-limit` cell is never sent (see "Agent-limit cells").
- The sequence has at most four confirmation commands and four retries. A list that needs more
  than its cap stops the sequence; request a new authorization.

### Agent-limit cells

- An `agent-limit` cell keeps its grade of 0 through confirmation. It is a system failure of the
  answering agent, not a judge output.
- Never send an `agent-limit` cell to `re-judge.mjs`. The tool skips it
  (`skipped.reason: "unsuccessful-answer"`). Such a skip is never judge variance and never
  clears a change.
- Confirm only the gradeable side. The confirmation test uses the re-judged grade for each graded
  B1 or C1 cell and 0 for each `agent-limit` cell. The change is reproduced when B1 and C1 still
  differ in its direction.
- **System-failure regression:** both candidate cells are `agent-limit`, and both baseline cells
  are graded above 0. It is a confirmed regression without a re-judge. No live check applies,
  because there is no answer. In the same way, both baseline cells `agent-limit` against two
  graded candidate cells above 0 is a confirmed improvement.
- No answering retry and no repair collection are authorized.

## Reading rules for the guard verdict (fixed before spend)

Let B be the guard baseline arm and C the guard candidate arm: T and TG when the text verdict is
PASS; A and G otherwise. B1, B2, C1, and C2 are their collections.

1. **Completeness.** Each of the eight collections holds 16 rows, `meta.comparable: true`,
   unsuppressed aggregates, and `budget` with no missing cost. A short or non-comparable
   collection gives INDETERMINATE, unless the replacement fills its slot. Then apply "Grade
   coverage".
2. **Arm integrity.** E is 0 in A1, A2, T1, and T2. A guard message in an arm without the guard
   means a wrong arm, and the method is INDETERMINATE.
3. **Consistent change.** A row changes only when both C grades differ from both B grades in the
   same direction. Any other difference is variance, monitor-only. A row-run with S = 0 is
   unexposed (see "Exposure for the guard").
4. **PASS** needs all of these:
   - E is 1 or more across C1 and C2 (the guard fired);
   - F is 0;
   - R is greater than U;
   - L in C (C1 plus C2) is not greater than L in B (B1 plus B2);
   - zero confirmed consistent regressions on a row where the guard fired in a C collection;
   - at most one confirmed consistent regression on the other rows.
5. **FAIL** if any of these is true. A FAIL blocks the merge.
   - F is 1 or more (the guard broke a correct read);
   - E is 1 or more and U is equal to or greater than R;
   - a confirmed consistent regression on a row where the guard fired;
   - two or more confirmed consistent regressions on any rows.
6. **INDETERMINATE** in every other case. Examples: an incomplete or non-comparable collection,
   a missing grade, E = 0 across C1 and C2, or L higher in C with no other FAIL condition. Do not
   repeat a collection under the same authorization.
7. **Confirmation re-judge.** Follow steps 6 to 9 of the "Confirmation sequence", and apply
   "Agent-limit cells". A graded change that the re-judge does not reproduce is judge variance.
   Live-check every graded C `wrong` against the service before it counts (`run-evals` Step 4).
   "Confirmed" means it survived both, or it is a system-failure regression.
8. **Failed confirmation re-judge.** A confirmation re-judge that ends T4 or T5 on a listed ID
   gets one retry of the failed IDs (K3r or K4r, or K1r or K2r for the text). Run it on the same
   source artifact, with the same model, rubric, and pack, under `--max-budget-usd 2`. At most one
   retry per confirmation command. Record the source artifact, the first re-judge artifact, and
   the retry artifact. Then:
   - when the retry gives a valid grade, use it as the confirmation grade;
   - when the retry also ends T4 or T5, the row is an **unconfirmed change**; record both stamps
     and never use the diagnostic `judgeScore` as a grade;
   - an unconfirmed regression on a row where the guard fired gives FAIL, because four
     collections observed it and the merge needs evidence of no regression;
   - an unconfirmed regression on another row counts as confirmed for the rule 4 and rule 5
     limits;
   - an unconfirmed improvement counts as no change;
   - a live check that clears the C answer removes the regression, confirmed or not.
   The ledger keeps "unconfirmed" separate from "confirmed".
9. **Noise floor.** Report the B1-against-B2 and C1-against-C2 grade disagreement counts beside
   the consistent-change count. They bound what variance can explain. They are not a significance
   threshold.
10. **Diagnostics.** Report the guard comparison that does not decide, and A against TG, with the
    same counts. They do not change the verdict.
11. Do not tune per case. A failed row supplies a test, not new guard wording.

The sample is too small for `eval:qa:paired` (it needs 100 eligible IDs). Do not run it. Also run
the free plan regrade on each collection: `npm run eval:plan -- <result.json>`.

## Shared section screen: pins (assert before the first paid call)

| Pin | Value |
| --- | --- |
| Arms | The four tree pins above |
| `SERVER_REVISION` | The 40-character commit of each arm worktree, which must be clean |
| `SURFACE_SHA256` | `node eval/report-live-surface.mjs --port <port> --expect-source-revision <rev> --json <out>` per arm. **A equals G** and **T equals TG**: the guard changes no `tools/list` text. **T differs from A**: the `execute` description changes. |
| Surface size | `npm run mcp:surface` in each arm worktree; record the `execute` description length. T and TG differ from A and G. |
| Runner | One clean runner worktree at A. Record `qaImplementationSha256` and `meta.inputSnapshot.casesSha256`; both stay the same in all eight collections. |
| Counter | `$B/tools/count-patterns.mjs`, outside every worktree, from the reviewed commit. Record its SHA-256 before A1. |
| `AGENT_BINARY_SHA256` | One versioned `claude` executable, linked from a private `PATH` directory, with `DISABLE_AUTOUPDATER=1` |
| `AGENT_ENVIRONMENT_SHA256` | Computed once in the collection shell after every Claude variable has its final value |
| Remote identity | `eval/qa/probe-remote-identities.mjs`, its SHA-256, and one `--stable-sha256` vector for this authorization |
| Judge-stability register | One frozen register outside the runner tree, made once before A1. Record its SHA-256. Pass the same path to all eight collections. |
| Server `.dev.vars` identity | One salted `devVarsIdentity` hash with one fresh salt across the four server worktrees. The hashes and name lists must match. Record the salt and hash only. |

A changed pin stops the method before the next paid call. Do not replace an expected value in
the same authorization.

Checkpoints before the first paid call:

- **Paired window.** `test ! -e /private/tmp/stellar-raven-paired-launch`. The owner confirms that
  no paired plan signature or collection is in progress, and the end of the window. Do not create
  that directory. Do not merge or deploy between a paired plan signature and the end of paired
  collection.
- **Server slot.** `pgrep -f 'wrangler|workerd' | wc -l` prints `0`. Never use `pgrep -fl` or `ps`
  with arguments.
- **Freeze.** All five worktrees are clean, with no untracked file (a stray `plugins/` trips the
  guard). Each arm passes `npm run typecheck`, `npm test`, and `npm run test:smoke`.
- **Counter.** `node "$COUNT" --self-check` exits 0 from the runner worktree.
- **Server stop risk.** The 2026-10-12 soak found that Wrangler can exit after
  `Network connection lost.` Re-assert the revision and the surface after each start. A server
  exit during a collection is a transport failure (see "Replacement").

## Shared section screen: budget

Source artifacts (main checkout, `eval/qa/results/`, ignored). No artifact has a missing cost.

| Group | Artifacts | Contract | Use |
| --- | --- | --- | --- |
| P1 | `2026-10-11-answer-style/2026-10-11T08-17-16-variantA.json`, `…T09-04-33…`, `…T09-48-55…`, `…T10-36-13…` | `claude-sonnet-5` both roles, rubric `v2.11`, pack `p6`, 34 rows | Primary: answer and judge costs |
| P2 | `2026-10-11-paired-attempt-1/baseline-results/2026-10-11T02-01-12-variantA.json`, `…-1/candidate-results/2026-10-11T02-01-12-variantA.json`, `…-3/baseline-results/2026-10-11T07-03-19-variantA.json`, `…-3/candidate-results/2026-10-11T07-03-37-variantA.json` | `claude-sonnet-5` answer only, no judge, 142 to 145 rows | Primary: answer costs only |
| S1 | `2026-10-07-tool-surface-qa/2026-10-07T23-25-14-variantA.json`, `…/2026-10-08T02-40-37-variantA.json` | `claude-sonnet-5` both roles, rubric **`v2.10`**, pack `p6`, 100 rows | Supplementary only: an older judge contract |

Observed totals: P1 collections $11.6398508 to $12.0836566 (median $11.752485), or $0.342 to
$0.355 per row. P2 collections $35.9055856 to $37.2913486 (median $36.2396406). The two
2026-10-11 directed re-judges of 4 IDs cost $0.3283216 and $0.3603036 (median $0.3443).

**Primary estimate (P1 and P2).** For each row: the median answer cost across its P1 and P2 rows,
plus the median judge cost across its P1 rows. Nine rows have no P1 judge history; they use the
P1 all-row judge median, $0.0887 (n 136, maximum $0.4132).

- one collection: **$6.00** (sum of row medians); **$9.88** (sum of row maxima, with the $0.4132
  judge maximum for the nine rows);
- eight collections: about **$48**.

**Supplementary estimate (adds S1, rubric `v2.10`).** $6.39 per collection (sum of medians) and
$9.12 (sum of maxima), with five rows without judge history. It is a cross-check only: its judge
contract differs, and the 2026-10-07 server had a different surface. A further cross-check: the P1
per-row mean times 16 is $5.48 to $5.69.

| Item | Cap (`--max-budget-usd`) |
| --- | ---: |
| Each of the eight collections | 12 |
| Confirmation re-judges K1, K2, K3, K4 (see "Confirmation sequence") | 3 each, 12 in all |
| Rule 8 retries K1r to K4r, if needed (reserve, at most one per confirmation command) | 2 each, 8 in all |
| Initial-judge retry, if needed (reserve, at most four commands) | 2 each, 8 in all |
| One replacement collection (reserve) | 12 |
| **Total authorization** | **136** |

- The collection cap is 21 percent above the primary sum of row maxima and twice the primary
  estimate. It also covers judge-panel escalation (the default cap is 10 boundary panels for 16
  rows).
- The confirmation sequence runs the text commands (K1, K2) before the guard commands (K3, K4).
  Revision 2 combined two lists in one command; that needed the guard selection before the text
  was confirmed. The split adds one command and one retry: $4 more than revision 2.
- The 2026-10-11 directed re-judges of 4 IDs cost $0.33 and $0.36 (median $0.3443). The P1 judge
  maximum is $0.4132 per call, so a $3 command covers 7 IDs at that maximum.
- A budget stop ends that command. Do not resume it under the same authorization.
- If a consistent-change list needs more than its re-judge cap, stop and request a new
  authorization.
- A budgeted call without a reported cost invalidates the method.
- Fallback for one section change only (four collections): 4 × 12, two confirmation re-judges at
  3 each (6), two rule 8 retries at 2 each (4), two initial-judge retries at 2 each (4), and one
  replacement at 12. Total **$74**.
- Recheck these caps if the launch amendment changes the judge pack, the rubric, or the tier
  policy.

**Replacement.** Use the reserve only for a collection that is incomplete because of a transport
failure (for example a Wrangler exit), with complete cost accounting. Restart the same arm's
server, re-assert every pin, and run the same 16 IDs. Run it next, before the next scheduled
collection, so the order stays balanced. Keep the failed artifact separate. A second failed
collection ends the screen: every verdict is INDETERMINATE.

## Shared section screen: commands

Run every command from the runner worktree root in the pinned collection shell. Call `node`
directly, not `npm run`, so `PATH` does not change. Fill each `<…>` from recorded values.

### Once, before A1

```sh
MAIN=6891dca23a2e1baab44916a6cd8524006f0e9267
REVIEWED=<the reviewed w1012/t commit that holds count-patterns.mjs>
B=/private/tmp/raven-section-screen   # outside every worktree; not the paired-launch path
mkdir -p "$B/tools"
for WT in "$A_WT" "$T_WT" "$G_WT" "$TG_WT" "$RUNNER_WT"; do git worktree add --detach "$WT" "$MAIN"; done
git -C "$T_WT" cherry-pick 7cf3a833eeb5a1864eeb6f56bdf3ce7dfa3bd558
git -C "$G_WT" cherry-pick ba6a1dfa95122276f72b8b1cad51338d5ca9c64c 416d2aa24835ec6a88580fcfc095f0ea5235ec15
git -C "$TG_WT" cherry-pick 7cf3a833eeb5a1864eeb6f56bdf3ce7dfa3bd558 ba6a1dfa95122276f72b8b1cad51338d5ca9c64c 416d2aa24835ec6a88580fcfc095f0ea5235ec15
test "$(git -C "$A_WT" rev-parse HEAD^{tree})" = ab4c63e3de9e85b479dea657169d2ff5a8ed9387
test "$(git -C "$T_WT" rev-parse HEAD^{tree})" = e74d9afdc4604975df233286b9d2fe77944b9e05
test "$(git -C "$G_WT" rev-parse HEAD^{tree})" = 28a6411854bc93fca8e6a1b1c290028b31ed9cda
test "$(git -C "$TG_WT" rev-parse HEAD^{tree})" = 8d32d670a14c2428cbcd2fe70e33bc39ecdf2fc7
# In each server worktree: npm ci, copy .dev.vars without printing it, npm run typegen,
# npm run typecheck, npm test, npm run test:smoke. In the runner: npm ci.
for WT in "$A_WT" "$T_WT" "$G_WT" "$TG_WT" "$RUNNER_WT"; do git -C "$WT" status --porcelain=v1 --untracked-files=all; done   # prints nothing

# Pinned counter, outside the runner. It resolves acorn and the manifest from the working directory.
git show "$REVIEWED:.agents/rounds/2026-10-12-call-pattern-triage/count-patterns.mjs" > "$B/tools/count-patterns.mjs"
COUNT="$B/tools/count-patterns.mjs"
COUNT_SHA256=$(shasum -a 256 "$COUNT" | cut -d ' ' -f 1)   # record in the ledger
node "$COUNT" --self-check

export DISABLE_AUTOUPDATER=1
PATH="<private dir holding only a link to the versioned claude executable>:$PATH"
AGENT_BINARY_SHA256=$(shasum -a 256 "$(command -v claude)" | cut -d ' ' -f 1)
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d ' ' -f 1)
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256)
STABILITY_REGISTER="$B/judge-stability.json"
node eval/qa/judge-stability.mjs --results-dir "<directory of stored QA results>" --out "$STABILITY_REGISTER"
shasum -a 256 "$STABILITY_REGISTER"   # record in the ledger
DEV_VARS_SALT=$(openssl rand -hex 32)
for WT in "$A_WT" "$T_WT" "$G_WT" "$TG_WT"; do
  node --input-type=module -e 'import { devVarsIdentity } from "./eval/qa/paired-collection-supervisor.mjs"; const r = devVarsIdentity(process.argv[1], process.argv[2]); process.stdout.write(JSON.stringify(r) + "\n");' "$WT" "$DEV_VARS_SALT"
done   # the four lines must be identical
test ! -e /private/tmp/stellar-raven-paired-launch && echo "paired-launch directory absent"
pgrep -f 'wrangler|workerd' | wc -l   # must print 0

IDS="q-aas-burn-clawback-redemption-mechanics,q-aas-list-token-on-exchanges-aggregators,q-agent-identity-erc8004-stellar,q-asset-trustline-basics,q-defi-build-staking-for-own-token,q-defi-etherfuse-stablebonds,q-edge-ambig-stellar-token-meaning,q-edge-noinfo-sep-9999,q-jutsu-check-account-history,q-passkey-smart-account-architecture,q-pc-address-types-strkey,q-pc-surge-griefing-threat-model,q-scf-pitch-prep-live,q-soroban-cross-contract-call,q-soroban-fuzz-testing,q-stellar-recurring-payments"
```

### Each server start (A, T, G, TG, G, T, A)

```sh
# In the orchestrator's own pane, from the arm's server worktree:
npm run dev:eval -- --port "<port>"
# From the runner worktree:
node eval/report-live-surface.mjs --port "<port>" --expect-source-revision "<arm revision>" --json "<out>.json"
# Assert surfaceSha256: A equals G; T equals TG; T differs from A. Stop the server after its collections.
```

### Each collection (A1, T1, G1, TG1, TG2, G2, T2, A2)

```sh
node eval/qa/run-qa.mjs \
  --ids "$IDS" \
  --port "<port>" \
  --max-budget-usd 12 \
  --stability-register "$STABILITY_REGISTER" \
  --server-revision "<arm revision>" \
  --expect-sha256 "<arm surface sha256>" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" \
  --remote-identity-probe "$REMOTE_IDENTITY_PROBE" \
  --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
  --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256"
test "$(shasum -a 256 "$COUNT" | cut -d ' ' -f 1)" = "$COUNT_SHA256"
node "$COUNT" --rows "<result file>"
```

Do not pass `--sample`. Check before each collection that the command passes exactly one
`--max-budget-usd`, with the value 12.

### Re-judges (after the lists are in the ledger)

`re-judge.mjs` writes a new artifact and never changes its source. Record the source path and the
new artifact path for each command.

```sh
# Dry run first, without the budget flags.
node eval/qa/re-judge.mjs "<source result>" --ids "<listed IDs>" --cases-ref "$MAIN" --dry-run
node eval/qa/re-judge.mjs "<source result>" \
  --ids "<listed IDs>" \
  --cases-ref "$MAIN" \
  --max-budget-usd "<3 for K1 to K4; 2 for a rule 8 retry or an initial-judge retry>" \
  --claude-path "$(command -v claude)" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256"
```

A rule 8 retry and an initial-judge retry use the original collection artifact as the source,
not an earlier re-judge artifact. Never pass an `agent-limit` ID. Check the `--dry-run` selection
for a `skipped` entry before each paid command; a skipped ID means a wrong ID list.

## Records

Record the pins, stamps, costs, counts, script classifications, and readings in a new
"Measurement results" section of the [triage ledger](../2026-10-12-call-pattern-triage.md).
Write each consistent-change list and each retry selection there before its spend. Result JSON
stays local under `eval/qa/results/` (gitignored). A non-author reviewer reviews the result
before the merge decision.
