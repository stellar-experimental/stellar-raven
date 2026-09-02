# A/V evidence-pack source date

Date: 2026-09-02
Status: complete; committed as `c4a064b`
Scope: `eval/qa/evidence-pack.mjs` and its public evidence-pack output.

## Contract

The public seam is `buildTranscriptEvidencePack` output.
A/V `created_at` must not render as an item `date`.
Non-A/V date selection must remain unchanged.
The pack version changes from `p5` to `p6`.
This is a deterministic local change.
No paid or live provider call is authorized.

## Runtime trace

`buildTranscriptEvidencePack` calls `collectSourceItems`.
It reads parsed JSON and visible JSON fragments.
`maybeSourceItem` calls `sourceDate` and stores `item.date`.
Ranking reads that field through `sourceItemText`.
`serializePack` renders it as `date="..."` in `sourceItems`.

The rule detects A/V from a supported row value, a supported response path, or `start_offset`.
The supported row values are `collection`, `type`, or `kind` set to `"av"` or `"videos"`.
The supported response paths are `av` and `videos`.
An all-A/V execute request also classifies its result.
It skips `created_at` for those items.
It also skips a canonical `date` when `dateField` says `created_at`.
All other fallback fields remain in their original order.
Visible JSON fragments retain their parent array key.
That preserves A/V detection for grouped response output.

## Test-first record

The focused test is in `test/evidence-pack-per-operation.test.mjs`.
It uses fixed local JSON and the public pack text.
It covers collection-tagged, grouped, direct, and canonical A/V rows.
It preserves article, research, and event date output.

| Phase | Command | Result |
| --- | --- | --- |
| Red | `./node_modules/.bin/vitest run test/evidence-pack-per-operation.test.mjs -t "omits A/V created_at source dates and keeps non-A/V source dates"` | Failed. The semantic A/V row rendered `date="2026-04-02T23:21:21.744Z"`. |
| Red refinement | Same command | Failed. A grouped A/V JSON fragment lost its `av` path and rendered `date="2026-04-28T05:25:34.817Z"`. |
| Red refinement | Same command | Failed. An A/V canonical `date` with `dateField: "created_at"` rendered as a source date. |
| Green | Same command | Passed. One test passed. |
| Red version | `./node_modules/.bin/vitest run test/evidence-pack-per-operation.test.mjs -t "uses a new pack version for changed evidence selection"` | Failed. The existing version was `p5`. |
| Green version | `./node_modules/.bin/vitest run test/evidence-pack-per-operation.test.mjs -t "uses a new pack version for changed evidence selection|omits A/V created_at source dates and keeps non-A/V source dates"` | Passed. Two tests passed. |

## Verification plan

- Run the full evidence-pack test file.
- Run `npm run typecheck`, `npm test`, `npm run build`, and `npm run eval:selftest`.
- Run `npm run secrets:scan -- --tree` and `git diff --check`.
- Obtain an independent high-effort implementation review.
- Keep the TODO item until the review completes.

## Independent review and reconciliation

`Codex Sol` reviewed this change at high effort.
The report is `.agents/rounds/2026-09-02-av-evidence-pack-source-date/review-sol.md`.
Its first verdict was `FAIL` with three High findings.

- F1 found raw A/V date evidence in source fields, facts, and snippets.
  The pack now omits A/V `created_at` and canonical derived dates in all three outputs.
- F2 found generic document and later clipped A/V rows without a classifier.
  Direct A/V document calls now use their request collection.
  The fragment scanner now tracks the active `av` array for every recovered row.
- F3 found current pack output reported as `p5` in the portfolio diagnostic.
  The diagnostic now records and prints `currentPackVersion` and current-pack metrics.

The public test now covers collection-tagged, grouped, direct, document-list, and two-row clipped
A/V output. It asserts that no A/V metadata timestamp appears in the pack. It also preserves the
article, research, and event controls.

## Risks

The pack needs an A/V signal from the row, path, request, or `start_offset`.
An ambiguous upstream shape needs new evidence before it gets a rule.

## Closure

The independent closure review passed at high effort.
The final review report is `.agents/rounds/2026-09-02-av-evidence-pack-source-date/review-sol.md`.
It closed F1 through F3 after it checked the recorded JSON `entry.input` shape.

The focused public-seam test passed with 35 tests.
`npm run typecheck` passed.
`npm test` passed with 100 files and 1,633 tests.
`npm run build` and `npm run eval:selftest` passed.
`npm run secrets:scan -- --tree` and `git diff --check` passed.
No paid or live provider call occurred.

The completed TODO item was removed after the independent review passed.
At that review point, the implementation remained uncommitted.

## Opus review reconciliation

The Opus 5 high review is `.agents/rounds/2026-09-02-av-evidence-pack-source-date/review-opus.md`.
Its verdict remains NOT PASS. This ledger does not alter that report.

| Finding | Repair and public check |
| --- | --- |
| F1 | Claim snippets now cut out a classified A/V object. They do not rewrite any date. The nearby article control retains its raw `date`. |
| F2 | A/V detection reads a parsed row and supported container path. It does not infer A/V from a `collection` object or array. |
| F3 | Request classification deduplicates operation names before it applies the A/V collection rule. The paginated two-call control passes. |
| F4 | `videos` is a supported response path. The composed `videos` and `research` control omits only the video metadata. The README names the supported shapes and rejects custom aliases. |
| F5 | Parsed and visible-text source and fact passes both run for each entry. The public control asserts both field paths. |
| F6 | The container scanner now enters string state and handles escaped quotes. The clipped-row control covers a later row after an escaped quote. |
| F7 | The formatter uses `currentPack` and `currentMean`. The README labels the historical p3-to-p5 formatter output as historical. |
| F8 | One named predicate decides whether an A/V date field is omitted. |

The follow-up test-first command initially failed with five public failures: F1 through F5.
The final focused suite passes with 41 tests.

## Final local verification

`npm run typecheck` passed.
`npm test` passed with 100 files and 1,639 tests.
`npm run build` and `npm run eval:selftest` passed.
`npm run secrets:scan -- --tree` and `git diff --check` passed.
No paid or provider call occurred.

## Opus closure reconciliation

The closure report is `.agents/rounds/2026-09-02-av-evidence-pack-source-date/review-opus-closure.md`.
Its verdict remains NOT PASS. This ledger does not alter either Opus report.

- R1: Claim snippets remove only classified A/V `created_at` or derived `date` fields.
  They retain the A/V title, channel, summary, long summary, and exact facts.
  A claim match inside an A/V date value remains intentionally skipped.
- R2: `collection`, `type`, and `kind` all use `isSupportedAvCollection`.
  The public control covers `videos` in each field and an `articles` control.

The R1 and R2 test-first run failed with two public-seam failures.
The final focused suite passed with 43 tests.
`npm run typecheck`, `npm test`, `npm run build`, and `npm run eval:selftest` passed.
The full suite passed with 100 files and 1,641 tests.
`npm run secrets:scan -- --tree` and `git diff --check` passed.
No paid or provider call occurred.

## Opus final reconciliation

The final review is `.agents/rounds/2026-09-02-av-evidence-pack-source-date/review-opus-final.md`.
Its verdict remains NOT PASS. This ledger does not alter any reviewer report.

- N1: Every classified A/V date field that overlaps a snippet range is removed.
  The removal clamps to the visible range for both leading and trailing straddles.
  It removes each visible key, value, quote, comma, and partial calendar or time fragment.
  The public controls retain passage prose and a nearby non-A/V article date.
- N2: The unreferenced `snippetFromRange` helper was deleted.

The trailing 323-character control and the leading-edge control both failed before the repair.
The final focused suite passed with 45 tests.
`npm run typecheck`, `npm test`, `npm run build`, and `npm run eval:selftest` passed.
The full suite passed with 100 files and 1,643 tests.
`npm run secrets:scan -- --tree` and `git diff --check` passed.
No paid or provider call occurred.

## Final Opus closure

The final closure report is `.agents/rounds/2026-09-02-av-evidence-pack-source-date/review-opus-final-closure.md`.
Its verdict is PASS with no actionable finding.
All five reviewer reports are tracked under this round directory.
The final closure confirms both straddle controls and the exact `4.81` passage fact.
It also confirms nearby non-A/V dates and byte-identical non-A/V fixtures.

The focused suite passed with 45 tests.
The full suite passed with 100 files and 1,643 tests.
The final secrets scan and diff check passed.

## Outcome

Commit `c4a064b` landed the reviewed evidence-pack `p6` implementation on 2026-09-02.
The final Opus closure passed with no actionable finding.
The completed TODO item remains closed.
