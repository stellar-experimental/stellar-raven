# A/V evidence-pack source date — final bounded closure review

Date: 2026-09-02
Reviewer CLI: Claude Code
Model: Opus 5
Effort: high
Author: Codex Terra
Orchestrator: Codex
Prior reports: `review-sol.md`, `review-opus.md`, `review-opus-closure.md`, `review-opus-final.md`
Fixed point: HEAD `9d9ed2c`
Bounded scope: N1, N2, and regressions from their repair. F1 through F8, R1 and R2 were closed in
the two prior reports and were not re-opened, except for the regression checks listed below.
Reviewer edits: none to implementation files. This report is the only file the reviewer wrote.
Paid or provider calls: none.

## Verdict

**PASS.** N1 and N2 are closed. No actionable finding remains.

The straddle repair is correct at both window edges. Across 402 measured offsets, no fragment of a
removed A/V date field survives — no key, no quote, no comma fragment, no calendar date, no time
fragment, no partial value. The passage prose, the `4.81` `long_summary` fact and a neighbouring
article date all survive, a claim on the A/V date value is still skipped, and the eight committed
non-A/V fixtures remain byte-identical to pristine p5.

## N1 — closed

File: `eval/qa/evidence-pack.mjs:649-660` (`classifiedAvDateFieldsInRange`),
`eval/qa/evidence-pack.mjs:662-667` (`snippetWithClassifiedAvDatesOmitted`)

Two changes fix it:

- The skip test moved from `match.index + match[0].length > end` to `fieldEnd <= start`
  (`:655`), so a field that straddles either edge is now collected instead of dropped. Removing
  `dateFieldRe.lastIndex = start` also lets the scan see a field that begins before the window.
- The removal span is clamped to the window: `Math.max(field.start, start)` and
  `Math.min(field.end, end)` (`:666-667`).

The skip test is ordered before `classifiedAvDateFieldAt`, so fields that end before the window
cost nothing.

### Reproduced straddles

The reviewer re-ran the exact case from `review-opus-final.md` and then swept a wide band on both
edges. The residue test looks for any prefix or suffix of the literal field text
`"created_at":"2026-08-08T00:00:00Z"` of three characters or more.

| Sweep | Offsets | Offsets with a surviving fragment |
| --- | --- | --- |
| Trailing edge, note length 250–450 | 201 | **0** |
| Leading edge, note length 250–450 | 201 | **0** |

The 323-character alignment that previously exposed `"created_at":"2026-08-08T00:00:00` now reads:

```text
snippet tail: "em ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor\"..."
whole pack contains 'created_at': false
whole pack contains '2026-08'    : false
whole pack contains '00:00:00'   : false
```

A separate residue scan over the trailing band found no `created_at` key, no ISO date, no time
fragment and no quoted-year fragment at any offset. Three offsets ended the snippet on a comma; the
reviewer compared each against a non-A/V control with the identical text and window, and the
comma is the ordinary window cut, present without any removal. At the one offset where the control
and the A/V case both end on a comma (note length 357) the two tails are byte-identical.

The leading edge is now clean as well. The worst tail the prior report recovered there
(`11:22:33Z`) does not appear at any of the 201 offsets.

### Two public controls added

`test/evidence-pack-per-operation.test.mjs:480` pins the trailing 323-character alignment by name,
and `:508` pins the leading edge and asserts the passage prose survives. The focused file grew from
43 to 45 tests.

## N2 — closed

`snippetFromRange` is deleted. A grep over `eval/` and `test/` finds no reference to it or to its
predecessor `snippetAround`. A definition-versus-reference scan over every top-level function in
`eval/qa/evidence-pack.mjs` reports no other orphan, so the repair left nothing behind.

## Regression checks

| Check | Result |
| --- | --- |
| `4.81` `long_summary` fact retained | pass |
| `parallel apply pipeline` prose retained | pass |
| `archival backlog cleared` prose retained | pass |
| Any A/V `created_at` value in the pack | none |
| Any `created_at` key in the pack | none |
| Claim term that **is** the A/V date value | still skipped — 0 snippets, timestamp absent |
| Nearby article `date` in the claim snippet | preserved — `"date":"2025-11-05T00:00:00Z"` |
| Nearby article `date` on the source line | preserved — `title="Protocol 23 release article" date="2025-11-05T00:00:00Z"` |
| Committed non-A/V fixtures vs pristine p5 | byte-identical — 0 of 8 changed |

The A/V passage snippet is emitted whole with only the date field excised, and the excision leaves
well-formed JSON: the field and one adjacent comma go together.

## Performance

The date-field scan no longer starts at `start`, so it walks from the beginning of the body for
each candidate match. Measured over five runs per fixture:

| Fixture | Body chars | p5 | p6 | Ratio |
| --- | --- | --- | --- | --- |
| beans | 33,019 | 2.0 ms | 5.5 ms | 2.70x |
| indexer | 28,760 | 2.9 ms | 5.5 ms | 1.89x |
| control0–control5 | 29k–60k | 0.4–1.9 ms | 0.5–2.2 ms | 1.16x–1.37x |

The worst case is 5.5 ms on a 33 KB body, the same order as the previous review measured. This is
an observation, not a finding.

## Gates

| Gate | Command | Result |
| --- | --- | --- |
| Focused evidence pack | `npx vitest run test/evidence-pack-per-operation.test.mjs` | pass — 45 tests |
| Diff check | `git diff --check` | pass — clean |
| Full test suite | `npm test` | pass — 100 files, 1643 tests |
| Provider or paid calls | none | 0 |

## Observations, not findings

- The ledger's `## Opus closure reconciliation` section records R1 and R2 and its gate numbers
  (43 focused, 1,641 full). Those numbers were true for that iteration. The N1 and N2 repair is not
  yet recorded, and the current numbers are 45 and 1,643. A ledger cannot record a review before it
  happens, so adding an N1/N2 section with the current numbers is the integrator's merge step, as
  it was after each earlier round.
- `.agents/TODO.md` still shows the item removed and the work uncommitted. Committing and closing
  the round is the same merge step.

## Summary

| Severity | Count | Findings |
| --- | --- | --- |
| HIGH | 0 | — |
| MEDIUM | 0 | — |
| LOW | 0 | — |
| NIT | 0 | — |

N1 and N2 are closed. The straddle repair removes the whole visible part of a classified A/V date
field at both window edges and leaves nothing recoverable, the A/V passage keeps its prose and its
exact facts, non-A/V output is byte-identical to p5, and both straddles now have named public
controls. The block is complete.
