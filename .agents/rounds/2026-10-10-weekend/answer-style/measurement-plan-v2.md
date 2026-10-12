# Answer-style signals, version 2 — measurement-plan delta

Status: **draft, not authorized.** It needs an independent pre-spend review and a new budget
authorization. No paid call ran for version 2.

Base plan: [`measurement-plan.md`](measurement-plan.md) (version 1, run on 2026-10-11). Change
under test: [`design.md`](design.md), section "Version 2 (2026-10-12)". Version 1 result:
[`measurement-ledger.md`](measurement-ledger.md) and
[`review-result-astra.md`](review-result-astra.md) (INDETERMINATE).

This file lists only the differences. Every rule, pin, and command of the base plan applies
unless a section below replaces it.

## Unchanged

- **Question.** Does the candidate keep abstention, absence, and volatile-value answers at least
  as good as `main`?
- **Design.** Four collections in ABBA order (B1, C1, C2, B2), one server at a time, the same
  port for every start, and one clean runner worktree at the baseline commit.
- **Cases.** The 34 IDs of the 2026-10-11 run, in battery order, with
  `q-pc-quantum-preparedness-dormant` in place of `q-pc-protocol-upgrade-timing`. The final list
  is in the ledger section "Case swap (before spend)".
- **Slices.** Abstention 8, absence 8, volatile 8 (with the quantum row), control 10.
- **Pins.** The same pin set. Record every value fresh for this authorization.
- **Reading rules 1 to 6**, the consistent-change rule, the noise floor, the live check of every
  candidate `wrong`, and the mechanism metrics.

## Arms

| Arm | Revision | Notes |
|---|---|---|
| Baseline (B) | `main` at the merge base of `w1012/c`: `63396840` | Version 1 used `d15a4ce5`. |
| Candidate (C) | The `w1012/c` head commit that the orchestrator approves | Fetch it into the runner repository before C1. |

Between `d15a4ce5` and `63396840`, `main` changed `eval/qa/run-qa.mjs`, the AI SDK versions in
`package.json`, and `src/demo/tools.ts` (the Playground). None of these changes the MCP surface.
Still, record the baseline surface SHA-256 fresh. Do not assume `656feeef…`. The
`qaImplementationSha256` will differ from version 1, because `run-qa.mjs` changed.

The selected case bytes at `63396840` are the same as at `d15a4ce5`:
`2cc286f6df1cd731…` (checked on 2026-10-12 with the same selection). All 34 IDs are `active` in
`eval/qa/lifecycle-registry.json` at `63396840`. Re-check both before the first paid call.

Before launch, also confirm that the golden of `q-pc-quantum-preparedness-dormant` is still
valid. If it is stale, apply the base plan's swap rule from that row, and record the swap before
spend.

Expected surface delta (`npm run mcp:surface`): server instructions go from 7,864 to 7,858
characters. The `search` and `execute` descriptions also change.

## Predeclared attribution

The measurement attributes one bundle against `main`: the version 1 signals and footer, three
removed phrasing rules, the restored attribution tail, and the `caveat` rename. A per-part claim
is diagnostic only. Version 2 does not compare against the version 1 candidate.

Exposure classes for the reviewer: replace "inconclusive markers" with "caveat markers". The
other classes do not change.

Two diagnostic hypotheses. They are not gates:

- **H1 (attribution).** Both candidate answers to `q-edge-strupey-ambiguous-stellar-history` say
  that the identity is unverified or ask for context, and do not present the history of a
  different project as the answer.
- **H2 (envelope distinction).** No answer in either arm puts an ok result with no rows and a
  `soft-empty` error into one claim. Count such answers per arm. Read every abstention and absence
  answer that mentions either kind.

## Judge-contract check (new, before a change counts)

The 2026-10-11 review found two judge artifacts. The judge rejected a real candidate-host field
on `q-gap-contracts-domain-empty`. The judge also used an obsolete activity definition on
`q-eco-most-active-defi-projects`, because the evidence pack omitted `meta.metricDefinitions`.

Rule: before a consistent change counts, the result reviewer reads each judge rationale that
cites host behavior or a metric definition. The reviewer compares it with the arm's host
contract at its revision and with the stored service metadata. A rationale that contradicts
either one makes that grade a judge artifact. The row is then monitor-only, and the ledger states
why. The rule applies to both directions and to every row.

If the evidence pack carries `metricDefinitions` before launch, the runner revision changes.
Then both arms use the new runner, and the activity row is an ordinary row again.

## Reading rule 7: failed confirmation re-judge (new)

The base plan had no rule for a confirmation re-judge that fails. Version 1 needed one: the B1
re-judge of the Strupey row ended T4 (`score: "error"`, `failureClass: "consistency"`).

7. **Failed confirmation.** A confirmation re-judge that ends T4 or T5 on a consistent-change
   row gets one retry. Re-judge only the failed IDs, in the same artifact, with the same model,
   rubric, and pack, under `--max-budget-usd 2`. Run at most one retry command for each of the two
   re-judged artifacts (B1 and C1). Then:
   - When the retry gives a valid grade, use it as the confirmation grade.
   - When the retry also ends T4 or T5, the row is an **unconfirmed change**. Record both
     re-judge stamps. Never use the diagnostic `judgeScore` as a grade.
   - An unconfirmed regression in the abstention or absence slice gives **FAIL**, and the merge
     stays blocked. Reason: all four collections observed the regression, and the done-condition
     needs evidence of no regression.
   - An unconfirmed regression in the volatile or control slice counts as a confirmed regression
     for the rule 3 and rule 4 limits of that slice.
   - An unconfirmed improvement counts as no change.
   - The live check still applies to every candidate `wrong`. A live check that clears the
     candidate answer removes the regression, whether it is confirmed or unconfirmed.

Rule 7 replaces the version 1 disposition, where a failed confirmation gave INDETERMINATE. Rule 5
(INDETERMINATE) now applies only to an incomplete or non-comparable collection.

## Budget

Cost basis: the six 2026-10-11 artifacts in `eval/qa/results/2026-10-11-answer-style/` total
**$47.92**. The four collections cost $47.23 (B1 $11.64, C1 $12.08, C2 $11.65, B2 $11.85). The two
directed re-judges of four IDs cost $0.69 ($0.33 and $0.36). No call had a missing cost. The
review recomputed these sums from per-row and per-call costs.

The version 2 bundle adds about 19 instruction characters to the version 1 candidate. The rename
does not change the footer length in a material way. Expect each collection to cost about $12, and
the total to be about $49.

| Item | Cap |
|---|---|
| Each of the four collections | `--max-budget-usd 18` (about 49 percent above the highest 2026-10-11 collection, $12.08) |
| Directed re-judge in B1 | `--max-budget-usd 4` |
| Directed re-judge in C1 | `--max-budget-usd 4` |
| Rule 7 retry in B1, if needed | `--max-budget-usd 2` |
| Rule 7 retry in C1, if needed | `--max-budget-usd 2` |
| **Total authorization** | **$84** |

A budget stop ends that command. Do not resume it under the same authorization. If the
consistent-change list needs more than $4 per re-judge, stop and request a new authorization. A
budgeted call without a reported cost invalidates the method.

## Commands (changes only)

Use the base plan's commands with these values:

- `--server-revision`: `63396840…` (full 40 characters) for B, and the approved `w1012/c` head for
  C.
- `--cases-ref` for each re-judge: the baseline revision `63396840…`.
- `--expect-sha256`: the fresh surface value of each arm.

Rule 7 retry, only after the first re-judge of that artifact ended T4 or T5 on a listed ID:

```sh
node eval/qa/re-judge.mjs "<B1 or C1 results file>" \
  --ids "<IDs whose first re-judge ended T4 or T5>" \
  --cases-ref "<baseline revision>" \
  --max-budget-usd 2 \
  --claude-path "$(command -v claude)" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256"
```

Run it with `--dry-run` first, without the budget flags, to check the selection.

## Records

Keep the version 2 pins, stamps, and results in a new section of
[`measurement-ledger.md`](measurement-ledger.md), headed "Version 2". Write the consistent-change
list, and each rule 7 retry selection, in the ledger before its spend. Result JSON stays local
under `eval/qa/results/` (gitignored).
