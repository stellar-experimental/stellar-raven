# Section-shape text — pre-spend measurement plan

Status: **draft, not authorized.** No paid call ran. The plan needs an independent pre-spend
review and a spend authorization. The paid run waits for the next weekend authorization.
Revision 2 reconciles review RP (Codex `gpt-6-astra`, high, CHANGES-NEEDED on `704d84ae`).
Revision 3 reconciles review RP2 (the same reviewer, CHANGES-NEEDED on `4a5d17a1`).

Change under test: Fix 2 of Pattern 2 in the
[triage ledger](../2026-10-12-call-pattern-triage.md). The `execute` description and the
`codemode.describe` usage line state that a section read has no `content`, and that
`r.data.sections` is an array of `{ section, content, url }` in request order. The docs page and
`src/skills/README.md` state the same shape. The guard is absent from both arms.

This plan runs inside the **shared section screen** of the
[section-guard plan](plan-section-guard.md). Its design, arms, instrument, models, frozen 16
rows, grade-coverage rule, pins, checkpoints, schedule, commands, budget, and replacement rule
apply here. This file states only what is specific to the text verdict.

## Question

Does the text lower the rate of section misreads, with no new script-error class and no answer
regression on any of the 16 rows?

## Arms

| Arm | Revision | Tree (pin) |
| --- | --- | --- |
| A | `main` `6891dca23a2e1baab44916a6cd8524006f0e9267` | `ab4c63e3de9e85b479dea657169d2ff5a8ed9387` |
| T | `main` plus `7cf3a833eeb5a1864eeb6f56bdf3ce7dfa3bd558` ("mcp: state the section-read result shape") | `e74d9afdc4604975df233286b9d2fe77944b9e05` |

T differs from A by the text commit only. The commit applies cleanly to `main` without the guard
(checked with `git merge-tree` on 2026-10-12). Its changed lines are the same as on `w1012/t`.
The text verdict compares A1 and A2 with T1 and T2 of the shared order
(A1, T1, G1, TG1, TG2, G2, T2, A2).

The text verdict decides which guard comparison applies (see the guard plan). So the guard plan's
"Confirmation sequence" confirms the text verdict first (steps 1 to 4), before any guard list
exists.

Model-visible exposure in T:

- **Every row:** the `execute` description is longer. `SURFACE_SHA256` differs from A. Record the
  `execute` description length in each arm with `npm run mcp:surface`.
- **Rows that call `codemode.describe` on a sectioned skill:** the usage line changes. Count those
  calls per arm.
- `src/site.ts` and `src/skills/README.md` are not model-facing in an MCP run.

## Frozen rows

The same 16 IDs as the guard plan, for these reasons:

- **13 misread rows.** Every row had at least one stored misread. The text addresses all three
  observed classes: a map keyed by section, a section used as a string, and an absent `content`.
  The six rows whose only stored misread is the historical top-level shape (`90d0ba75`) stay in:
  the text names "no `content`" directly, and that class can recur on the current envelope (C1 on
  `q-soroban-cross-contract-call`).
- **3 controls** (`q-asset-trustline-basics`, `q-edge-ambig-stellar-token-meaning`,
  `q-soroban-fuzz-testing`). Each read sections correctly in all four answer-style runs. A
  regression or a new misread here would show harm from the text.

The plan uses `q-asset-trustline-basics` in place of the ledger's `q-soroban-storage-types`. The
guard plan gives the reason: that row has no stored MCP section read.

**Every row is exposed.** Each row sees the changed `execute` description. A section read is an
outcome of the treatment, not proof of exposure: the text can make a model skip a useful read and
give a worse answer. So **all 16 rows stay in the answer-regression check**, whatever their
section-read counts. Section-read counts serve the mechanism analysis only. (The guard verdict
keeps its own S = 0 rule. Its arms have the same input until a section read returns; that is not
true here.)

**Base rate.** The ledger counts 26 misreads in 199 MCP section-read scripts (13.1%) on 8 runs,
and 10 in 121 (8.3%) on the current `data` envelope. On the 13 misread rows and the current
envelope, the rate was 10 in 46 (21.7%). Two A collections hold about 32 section-read scripts and
about 7 misreads at that rate. That is an expectation, not a power claim.

## Counts and how to read them

Use the pinned counter and the two-reader direct read of the guard plan. Readers also inspect
every unknown and unparsed script. Per collection, report:

| Count | Source |
| --- | --- |
| S: section-read scripts | Counter `sectionReadScripts`, plus reconciled unknowns |
| M: misreads by class (map key, string use, absent `content`, other) | Direct read of each section-read script |
| r: misread rate, M divided by S, per arm | Computed from S and M of both collections of that arm |
| V: read avoidance | Rows with S > 0 in both A collections and S = 0 in both T collections; also S per arm |
| L: silent text losses | Direct read |
| Q: script-error classes | Direct read of each execute error: one class per distinct cause (for example, a `TypeError` on a section object, an unknown operation) |
| K: `codemode.describe` calls on a sectioned skill | Direct read of each execute script |
| X: execute calls and execute errors per row | Counter `executeCalls`, `executeErrors` |
| G: grades | The grade-coverage rule of the guard plan |

When S differs between the arms, or V is 1 or more, a reader reviews the routing of each such row
(which skills, sections, and services each script used) and records the cause in the ledger.

## Reading rules (fixed before spend)

1. **Completeness and grade coverage.** As in the guard plan, for A1, A2, T1, and T2. A missing
   grade on any of the 16 rows, after its initial-judge retry, gives INDETERMINATE for the whole
   text verdict. An `agent-limit` row counts as `wrong`.
2. **Arm integrity.** The counter's `guardMessages` is 0 in A1, A2, T1, and T2. The T surface
   differs from the A surface. A failed check means a wrong arm, and the method is INDETERMINATE.
3. **Consistent change.** A row changes only when both T grades differ from both A grades in the
   same direction. Any other difference is variance, monitor-only. Apply this to all 16 rows.
4. **Rate claim.** The misread-rate claim needs S in T (T1 plus T2) of 1 or more and at least
   half of S in A. Otherwise the rate claim is INDETERMINATE: report S, V, and the routing review,
   and never treat an undefined or small-denominator rate as zero.
5. **PASS** needs all of these:
   - M in A (A1 plus A2) is 4 or more;
   - the rate claim is defined (rule 4), and r in T is at most half of r in A;
   - no script-error class occurs in both T collections and in neither A collection;
   - zero confirmed consistent regressions on the 16 rows.
6. **FAIL** if any of these is true. A FAIL blocks the merge, and the text commit is dropped
   (`run-evals`: a prose edit with no measured shift is reverted, not kept).
   - M in A is 4 or more, the rate claim is defined, and r in T is equal to or greater than r in
     A;
   - a script-error class occurs in both T collections and in neither A collection, and a reader
     traces it to the text;
   - one or more confirmed consistent regressions on any of the 16 rows.
7. **INDETERMINATE** in every other case. Examples: an incomplete collection, a missing grade,
   M in A below 4, an undefined rate claim (rule 4), or r in T between half of r in A and r in A.
   Do not repeat a collection under the same authorization.
8. **Confirmation re-judge.** Follow steps 1 to 4 of the guard plan's "Confirmation sequence":
   K1 in A1 and K2 in T1, on the gradeable text-list IDs only. Apply its "Agent-limit cells"
   rules: an `agent-limit` cell keeps 0, is never re-judged, and is never judge variance. Live-check
   every graded T `wrong`. "Confirmed" means it survived both, or it is a system-failure
   regression.
9. **Failed confirmation re-judge.** The guard plan's rule 8 applies, with K1r and K2r. An
   unconfirmed regression on any of the 16 rows gives FAIL. An unconfirmed improvement counts as
   no change.
10. **Noise floor.** Report the A1-against-A2 and T1-against-T2 disagreement counts beside the
    consistent-change count. Also report the A1-against-A2 misread counts. They bound what
    variance can explain. They are not a significance threshold.
11. Do not tune per case. A failed row supplies a test, not new wording.

## Budget

The text verdict shares the shared screen's $136 authorization. Its own share: collections T1 and
T2 ($12 cap each; about $12 expected), the K1 and K2 re-judges ($3 each), and their retries K1r
and K2r ($2 each). It
shares A1, A2, the initial-judge retry reserve, and the replacement reserve with the guard
verdict. The cost basis is in the guard plan.

If the owner authorizes the text change alone, use the guard plan's one-change fallback (A1, T1,
T2, A2), with a total of **$74**.

## Commands

The shared commands in the guard plan apply. For T1 and T2, pass the T revision as
`--server-revision` and the T surface value as `--expect-sha256`.

## Records

Record the text results beside the guard results in the "Measurement results" section of the
[triage ledger](../2026-10-12-call-pattern-triage.md), as a separate verdict.
