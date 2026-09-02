# Independent review closure — A/V runtime date semantics

Date: 2026-09-02
Reviewer model: Fable 5
Effort: high
Mode: audit only. No repository file was edited. No paid or live provider call was made.
Prior report: `.agents/rounds/2026-09-02-av-runtime-date-semantics/review-fable.md`

## Verdict

**PASS. All four findings are closed. No new actionable issue came from the repairs.**

The change may proceed to commit. The original TODO item under "Catalog correctness" can leave the
queue in that commit, and the ledger status can move to complete.

## Scope

| Item | Value |
| --- | --- |
| Fixed point | `09c095986dfcf21833d5382fd1cef2518bd0ee31` (HEAD, unchanged) |
| Changed files | `src/skills/runners/stellar-ecosystem-digest.ts`, `test/skill-runners.test.ts`, `test/smoke/executor.test.ts`, `research/skill-run-design.md`, `.agents/TODO.md` |
| New file | `.agents/rounds/2026-09-02-av-runtime-date-semantics.md` |
| Reviewed | The repairs for F1 to F4, the updated ledger, and the new TODO item |

## Verification run

| Command | Result |
| --- | --- |
| `vitest run test/skill-runners.test.ts` | PASS. 19 tests. Matches the ledger claim. |
| `npm run typecheck` | PASS |
| `npm run test:smoke -- -t "digest run"` | PASS. 1 test, 81 skipped. |
| `git diff --check` | Clean. This closes the ledger's "Final check remains" row. |

The working tree was unchanged after every command. Lines longer than 100 characters in
`research/skill-run-design.md` are all outside the diff and pre-existing.

## Finding reconciliation

### F1 — Closed. A/V window admission is now durably documented

- **Location:** `research/skill-run-design.md:348-349`.
- **Observed:** Two new sentences state that upstream still applies `date_start` and `date_end` to
  A/V rows on an undocumented basis, and that the digest keeps those rows but never restates the
  window as their date.
- **Judgment:** This is the repair the report asked for. It is present-state, true to the runner's
  call arguments, and sits beside the projection rule it qualifies. The owner product question
  about dropping `av` from theme `types` was not required by the finding and remains an owner
  decision.

### F2 — Closed. The runner comment states the exact invariant and its owner

- **Location:** `src/skills/runners/stellar-ecosystem-digest.ts:63-66`.
- **Observed:** "A/V created_at has no verified recording-date meaning (ll-019). Every other
  collection keeps the existing publishing/start/created fallback."
- **Judgment:** The overstated "verified date meaning" claim for other collections is gone. The
  comment names `ll-019` as the evidence owner. The word "existing" is mild diff narrative but does
  not create a false claim. Not actionable.

### F3 — Closed. Schema oracle and entity-mode coverage added

- **Location:** `test/skill-runners.test.ts:112-158` and `:222-256`.
- **Observed:** The theme test now records calls and ends with `expectValidates(...)`. A new test
  feeds a type-keyed entity payload with an A/V row carrying `created_at` and asserts
  `[["articles", date], ["av", null]]`, then validates against the output schema.
- **Judgment:** Both requested repairs are in place. The entity test exercises the second projection
  path with a real A/V row, which the committed fixture could not. Both tests pass.

### F4 — Closed. The ledger satisfies the evidence-contract brief

- **Location:** `.agents/rounds/2026-09-02-av-runtime-date-semantics.md`, "Evidence and
  hypothesis", "Verification", "Decision scorecard", "Review".
- **Observed:** The brief now names two paths as targets, six symmetric controls, the repetition
  count, the pins, an explicit not-applicable statement for prompt, pack, rubric, and judge, the
  author and orchestrator (Codex), and the reviewer (Fable 5, high). Every scorecard row is "pass"
  with evidence. The Review section records the report path, verdict, and each repair.
- **Judgment:** Closed. Two residual items are administrative and belong to the closing commit,
  not to a reopened finding:
  - "Status" still reads "independent review repairs in progress" and the last Review sentence
    says the original TODO item remains until the reviewer confirms. This closure is that
    confirmation. Update both in the commit that deletes the TODO item.
  - The evidence-contract "Finding" row still states the defect only. That satisfies the contract
    field ("verified defect"). Adding "fixed in this change" is optional.

### Observation — Closed. The evidence-pack use of A/V `created_at` is queued

- **Location:** `.agents/TODO.md:166-176`, under "Eval instruments".
- **Observed:** The new item names `eval/qa/evidence-pack.mjs`, the `sourceDate` fallback, the
  consequence for judge evidence packs, the discovery source, and a "Done when" with a
  non-A/V preservation rule and fixture coverage.
- **Judgment:** Correctly routed as own-repo eval-instrument work. The item does not authorize any
  change in this round. Well formed per the queue's own rules.

## New-issue check on the repairs

- **Runner comment.** No false claim. No stale reference. `ll-019` resolves to
  `improvements/lumenloop/ll-019-av-output-contract-shape-and-date.md`.
- **Research note.** The five added lines are present-state and do not duplicate the ledger.
- **Tests.** No implementation mirroring. Each new assertion is a public-boundary contract. The
  entity test omits `proposals`; the projection drops that key regardless, so nothing is lost.
- **TODO item.** Scoped, dated, sourced, with a testable "Done when".
- **Ledger.** The verification table matches what the reviewer reproduced. The author probe
  output format differs from the reviewer probe but reports the same outcome.
- **Scope.** The diff still contains only the runner, its tests, the design note, the ledger, and
  the queue. No generated artifact needs regeneration; the schemas are unchanged.

## Remaining steps for the author

1. Set the ledger "Status" to complete and replace the last Review sentence with the closure.
2. Delete the "Stop using A/V `created_at` for stellar-ecosystem-digest date sorting" item from
   `.agents/TODO.md` in the same commit.
3. Run `npm run build` once more before commit if any file changed after the author's recorded
   run. The reviewer did not run build, for the reason stated in the prior report.
