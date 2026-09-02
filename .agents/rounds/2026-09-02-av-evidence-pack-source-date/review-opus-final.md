# A/V evidence-pack source date — final bounded closure review

Date: 2026-09-02
Reviewer CLI: Claude Code
Model: Opus 5
Effort: high
Author: Codex Terra
Orchestrator: Codex
Prior reports: `review-sol.md`, `review-opus.md`, `review-opus-closure.md`
Fixed point: HEAD `9d9ed2c`
Bounded scope: R1, R2, and defects introduced by their repairs. F1 through F8 were closed in
`review-opus-closure.md` and were not re-opened.
Reviewer edits: none to implementation files. This report is the only file the reviewer wrote.
Paid or provider calls: none.

## Verdict

**NOT PASS.** R1 and R2 are closed. One new High finding comes from the R1 repair, plus one Nit.

Every required public-seam check passes. The A/V passage prose and its `4.81` `long_summary` fact
survive, the classified `created_at` is cleanly excised, a claim on the date value is still skipped,
`collection`, `type` and `kind` all accept `av` and `videos`, and a neighbouring article keeps its
date. The eight committed non-A/V fixtures remain byte-identical to pristine p5.

The new defect is a boundary case the repair introduced. When a classified A/V date field starts
inside the snippet window but ends past it, the field is skipped instead of excised, and its
visible prefix stays in the snippet. The reviewer recovered a complete calendar date and time this
way.

## R1 — closed

File: `eval/qa/evidence-pack.mjs:668` (`snippetWithClassifiedAvDatesOmitted`),
`eval/qa/evidence-pack.mjs:690` (`isClassifiedAvDateValueMatch`),
`eval/qa/evidence-pack.mjs:708-716`

`snippetRangeWithoutAvMetadata` and its whole-snippet `return null` are gone. The snippet now keeps
its full range and excises only the classified date field's key-and-value span, with a comma and
whitespace cleanup on either side.

Reproduced with the documented `find_av_passages` projection
(`research/services/lumenloop.md:152`), the same probe that failed in the closure review:

```text
p5 snippets 1   p6 snippets 1
p6 retains long_summary fact 4.81  : true
p6 retains 'parallel apply pipeline': true
p6 retains 'archival backlog cleared': true
p6 leaks any full A/V created_at    : false
p6 leaks any A/V date prefix 2026-0 : false
p6 still shows a created_at key     : false
```

The emitted snippet reads
`..."long_summary":"In part 1 … fell to 4.81 seconds …","start_offset":24301},{"av_id":1002,…`.
The excision leaves well-formed JSON: the field and its separating comma are both removed.

A claim term that *is* the A/V date value remains intentionally skipped:
candidate `"The recording metadata says 2026-01-15T10:00:00Z."` yields `snippets: 0` and the
timestamp is absent from the whole pack.

## R2 — closed

File: `eval/qa/evidence-pack.mjs:379-386`

`isAvSource` now routes `collection`, `type` and `kind` through `isSupportedAvCollection`. Measured
at the public seam:

| Field | `av` | `videos` | `articles` | `video` |
| --- | --- | --- | --- | --- |
| `collection` | classified | classified | not classified | not classified |
| `type` | classified | classified | not classified | not classified |
| `kind` | classified | classified | not classified | not classified |

The vocabulary is now symmetric across the three fields. Singular `video` stays out, which matches
the `AV_COLLECTION_VALUES` set and the README enumeration at `eval/qa/README.md:628-632`.

The non-A/V control holds. With an `av` row and an `articles` row in the same result, the article
keeps `date="2025-11-05T00:00:00Z"` on its source line and `"date":"2025-11-05T00:00:00Z"` inside
the claim snippet, while the A/V object appears as
`{"title":"Talk about Protocol 23","summary":"An A/V summary about Protocol 23 upgrades."}` with no
timestamp and no placeholder key.

## New findings

### N1 — HIGH — A window-straddling A/V date field is skipped, so its visible prefix leaks

File: `eval/qa/evidence-pack.mjs:661`

```js
if (match.index + match[0].length > end || !classifiedAvDateFieldAt(text, match.index, entryAv)) continue;
```

`classifiedAvDateFieldsInRange` drops any date field that starts inside the snippet window but ends
beyond it. `snippetWithClassifiedAvDatesOmitted` then slices `text.slice(start, end)` with that
field still in place, so the part of the field that falls inside the window survives.

The old whole-object drop could not do this. The repair introduced it.

Reproduced at the public seam with a single classified A/V row whose `transcript_note` pushes
`created_at` toward the trailing edge of the 360-character window. Sweeping the note length from
320 to 360 characters:

```text
worst visible created_at value prefix: "2026-08-08T00:00:00" (19 chars, note length 323)
full calendar date exposed: true
```

The emitted snippet ends `…lorem ipsum","created_at":"2026-08-08T00:00:00`. The complete recording
date and time reach the judge under the key that names them, which is exactly the metadata p6
exists to suppress. Two other offsets in the sweep leaked shorter prefixes
(`…","created_at":"2026-08-` and `…","created_at"`).

The leading edge is safer but not clean: a field that begins before `start` is never matched, and
its tail can remain. The worst tail the reviewer recovered there is `11:22:33Z` — a time with no
date and no key.

The condition is an offset alignment, not a rare shape. A real `find_av_passages` body holds
several rows, and each claim match places the window at an arbitrary offset, so a straddling
`created_at` will occur.

No committed test can see it. The new public controls use short fixtures in which every date field
fits inside the window.

Required action: excise the visible part of a straddling field instead of skipping it. Clamp the
removal span to the window — remove `[max(field.start, start), min(field.end, end))` — or widen
`end` to `field.end` before excision so the whole field is removed. Add a public control whose A/V
`created_at` starts inside the window and ends past it.

### N2 — NIT — `snippetFromRange` is now unreferenced

File: `eval/qa/evidence-pack.mjs:579`

The R1 repair replaced its only call site with `snippetWithClassifiedAvDatesOmitted`, which inlines
the same prefix, suffix, `sanitizeUrlsInText` and `cleanText` handling. A repository-wide grep finds
no other reference in `eval/` or `test/`.

Required action: delete it, or call it from the new function so the shared formatting has one home.

## Required checks

| Check | Result |
| --- | --- |
| `4.81` `long_summary` fact remains in the pack | pass |
| Classified A/V `created_at` absent (well-formed rows) | pass |
| Claim on the A/V date value intentionally skipped | pass — 0 snippets, timestamp absent |
| `collection`, `type`, `kind` accept `av` and `videos` | pass |
| Non-A/V article date survives beside an A/V row | pass — in the source line and the snippet |
| Non-A/V committed fixtures byte-identical to p5 | pass — 0 of 8 changed |
| Classified A/V `created_at` absent (straddling window) | **fail — see N1** |

## Gates

| Gate | Command | Ledger claim | Reviewer result |
| --- | --- | --- | --- |
| Focused evidence pack | `npx vitest run test/evidence-pack-per-operation.test.mjs` | 43 tests | pass — 43 tests |
| Diff check | `git diff --check` | PASS | pass — clean |
| Full test suite | `npm test` | 100 files, 1,641 tests | pass — 1641 tests |
| Provider or paid calls | none | 0 | 0 |

The ledger's `## Opus closure reconciliation` section records R1 and R2 accurately, including that
a claim match inside an A/V date value stays skipped. It does not mention the straddling case.

## Summary

| Severity | Count | Findings |
| --- | --- | --- |
| HIGH | 1 | N1 |
| NIT | 1 | N2 |

R1 and R2 are closed and the repairs are the right shape: the pack now removes the A/V date field
and keeps the passage. One bounded gap remains in the new excision, and it leaks the full recording
date under its own key. Clamp the straddling field instead of skipping it, add the control, settle
N2, then this block passes.
