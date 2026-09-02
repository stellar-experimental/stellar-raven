# A/V evidence-pack source date — independent closure review

Date: 2026-09-02
Reviewer CLI: Claude Code
Model: Opus 5
Effort: high
Author: Codex Terra
Orchestrator: Codex
Prior reports: `review-sol.md`, `review-opus.md` (unchanged, `NOT PASS`)
Fixed point: HEAD `9d9ed2c`
Reviewer edits: none to implementation files. This report is the only file the reviewer wrote.
Paid or provider calls: none.

## Verdict

**NOT PASS.** F1 through F8 are all closed. Two new findings remain, one Medium and one Low.

The reconciliation is strong. Every failure the prior report reproduced at the public seam is now
fixed, and the eight committed non-A/V fixtures produce **byte-identical** packs to pristine p5.

The remaining defect is on the repair itself. The new object-scoped snippet rule drops a whole
claim snippet whenever the claim term sits inside a classified A/V object. Real `find_av_passages`
rows carry `created_at`, so an A/V-sourced question loses its anchored passage evidence, including
transcript-supported exact facts that live only in the snippet.

## F1 through F8 — independent verification

Each row was re-run at the public seam with local JSON only, using the same probes as the prior
report.

| Finding | State | Independent evidence |
| --- | --- | --- |
| F1 snippet redaction deleted non-A/V dates | closed | `redactAvDateMetadata` is gone. `snippetRangeWithoutAvMetadata` (`:651`) clamps the snippet range to the A/V object bounds. Re-ran the `av` + `articles` probe: the article's `"date":"2025-11-05T00:00:00Z"` survives verbatim, the A/V timestamp is absent, and no `av_metadata_date` placeholder appears. |
| F2 `"collection": {` inferred A/V | closed | The window regex is gone. `isAvSource` (`:379`) reads the parsed row through `isSupportedAvCollection` (`:316`). Re-ran the probe: `collection: {name:"articles", id:7}` keeps both `created_at` and `date`, and no placeholder appears. |
| F3 repeated A/V operations defeated the classifier | closed | `entryIsAv` (`:372`) deduplicates operation names with a `Set` before the count. Re-ran the probe: one call and two calls to `list_documents({collection:"av"})` both classify, and neither leaks `2026-06-18T18:18:47.672Z`. |
| F4 composed A/V under a non-`av` key | closed | `AV_COLLECTION_VALUES` (`:314`) covers `av` and `videos`, and `isSupportedAvPath` (`:320`) matches any path segment. Re-ran the composed probe: the `videos` timestamp is absent and the sibling `research` date is preserved as `date="2026-05-04T00:00:00Z"`. |
| F5 out-of-contract `fields:` selection change | closed | Both `collectSourceItems` (`:821`) and `collectRelevantFacts` (`:914`) run the parsed pass **and** the visible-text pass again. See the fixture A/B below. |
| F6 dead string scanner | closed | `activeSupportedAvContainer` sets `inString = true` at `:345` and tracks `stringStart`; `enclosingObjectStartAt` does the same at `:610`. Re-ran the escaped-quote clipped probe with two rows: both A/V rows classify and neither timestamp leaks. |
| F7 historical portfolio record | closed | `eval/qa/README.md:1172-1175` now labels the recorded numbers as "the then-p5 formatter keys" and states that a current replay prints `currentPack=p6` and `currentMean`. |
| F8 mixed `&&` inside an `||` chain | closed | Replaced by the named predicate `omitsAvDateField` (`:384`), called from all three sites. |

### F5 — the decisive check

The reviewer A/B'd the current module against the pristine `HEAD` module on all eight committed
fixtures. The prior report measured a differing `fields:` line on 7 of 8.

```text
beans     WHOLE-PACK-IDENTICAL=true  chars 7192/7192
indexer   WHOLE-PACK-IDENTICAL=true  chars 8830/8830
control0…control5  WHOLE-PACK-IDENTICAL=true

non-A/V fixtures whose pack changed: 0 of 8
```

Every non-A/V fixture now produces a byte-identical pack under p6. The p5 `fields:` behavior is
restored exactly, and the version bump changes bytes only for rows with A/V content. This is a
stronger result than the contract required.

## New findings

### R1 — MEDIUM — A classified A/V object drops the whole claim snippet, not just its date

File: `eval/qa/evidence-pack.mjs:661`, reached from `eval/qa/evidence-pack.mjs:680-690`

```js
if (object.start <= matchStart && matchEnd <= object.end) return null;
```

When a classified A/V date field lies inside the snippet window and the claim term sits inside that
same object, `snippetRangeWithoutAvMetadata` returns `null` and the caller skips the snippet
entirely. The object's title, channel, `summary`, and `long_summary` go with the date.

This is not a rare shape. `research/services/lumenloop.md:152` documents `find_av_passages` as
returning `{av_id,title,url,channel,summary,long_summary,start_offset,created_at}`. Every passage
row carries `created_at`, and `start_offset` classifies the row, so the rule fires on the operation
whose whole purpose is to supply passage text.

Reproduced at the public seam with that documented row shape. The `long_summary` carried a fact the
short `summary` does not, and the candidate answer cited it:

```text
p5  snippets 1   pack contains "4.81": true
p6  snippets 0   pack contains "4.81": false
p6  leaks a created_at: false
```

The supported exact fact `4.81` is present in the p5 pack and absent from the whole p6 pack. The
`findTranscriptEvidencePackOmissions` diagnostic reported `omittedTerms 0` for both, so the p5
diagnostic that exists to flag transcript-supported claims a bounded pack omitted does not catch
this loss. The judge simply stops seeing the support for the candidate's number.

A second probe shows the same drop when the claim term matches the literal key `created_at` inside
an A/V row: `snippets: 0`.

No leak is introduced. The failure is over-removal, and it is confined to A/V rows.

The record does not describe it. `.agents/rounds/2026-09-02-av-evidence-pack-source-date.md:104`
says "Claim snippets now cut out a classified A/V object", which describes the range clamp, not the
whole-snippet drop. `eval/qa/README.md:628-632` describes p6 only as omitting A/V `created_at`
values.

Required action: excise the date field's own key-and-value span instead of the enclosing object, so
the passage prose survives. Keep the whole-snippet drop only for the case
`classifiedAvDateFieldAt` already handles at `:680`, where the claim term *is* the A/V date value.
If the drop is kept deliberately, state it in the README p6 entry and in the ledger, and add a
public control that pins it.

### R2 — LOW — The A/V vocabulary is applied to `collection` but not to `type` or `kind`

File: `eval/qa/evidence-pack.mjs:314`, `eval/qa/evidence-pack.mjs:379-381`

`AV_COLLECTION_VALUES` holds `av` and `videos`, and `isSupportedAvCollection` is used for
`value.collection` and for every path segment. Line 380 checks `type` and `kind` with a bare
`sourceType === "av"` instead.

Measured at the public seam:

```text
collection="av"       classified: true
collection="videos"   classified: true
type="av"             classified: true
type="videos"         classified: false
type="video"          classified: false
kind="videos"         classified: false
```

`research/services/lumenloop.md:161-163` shows `videos` as a first-class collection name in the
`get_document` and `list_documents` enums, so a row typed `videos` is a plausible projection. The
README enumerates the supported signals as "`type` or `kind: "av"`", so the behavior is documented
rather than hidden, but the split vocabulary has no stated reason and invites the next A/V shape to
slip through the same way F4 did.

Required action: run `type` and `kind` through `isSupportedAvCollection` as well, or record in the
ledger why those two fields deliberately accept a narrower vocabulary.

## Audit of the new object-scoped snippet logic

The reviewer probed the new range logic for both cross-object loss and cross-object leakage.

| Case | Result |
| --- | --- |
| A/V array **nested inside** the object holding the claim match | Correct. The snippet splits into a before-range and an after-range. The nested A/V timestamp is absent and the outer `published` date survives. |
| Non-A/V dates **beyond** an A/V object in the same window | No loss. Two article rows after an `av` array keep both `date` values, and the A/V timestamp is absent. |
| Claim match **inside** the A/V object | Whole snippet dropped. See R1. |
| Claim match on the A/V date **value** | Match skipped at `:680`. Correct and intended. |
| Claim match on the A/V date **key** | Whole snippet dropped. Same root cause as R1. |
| Overlap without containment | Unreachable for well-nested JSON: containment is handled first, and a match cannot straddle an object boundary. |
| Escaped quotes before a clipped `av` array, two rows | Both rows classify. Neither timestamp leaks. |

The clamp direction is right: `rangeStart` takes a `max` and `rangeEnd` a `min` across every
classified A/V object in the window, so several A/V objects narrow the snippet from both sides
without dropping the material between them.

## Performance

`avObjectAt` and `classifiedAvDateFieldAt` re-scan from the start of the body for every candidate
match, so the new logic is quadratic in body length. Measured over five runs per fixture:

| Fixture | Body chars | p5 | p6 | Ratio |
| --- | --- | --- | --- | --- |
| beans | 33,019 | 2.4 ms | 6.1 ms | 2.59x |
| indexer | 28,760 | 3.6 ms | 5.6 ms | 1.58x |
| control0–control5 | 29k–60k | 0.4–2.3 ms | 0.5–2.1 ms | 0.58x–1.50x |

The worst case is 6.1 ms on a 33 KB body. This is an observation, not a finding.

## Items the reviewer checked and cleared

- **Non-A/V dates.** Byte-identical packs on all eight committed fixtures, and every non-A/V
  control in the new probes keeps its selected date.
- **p5 `fields:` behavior.** Restored exactly; see the F5 A/B.
- **Repeated A/V operations.** `Set`-deduplicated; the paginated two-call probe classifies.
- **Supported `videos` path.** Classified through `isSupportedAvPath`; the sibling research row is
  untouched.
- **Escaped clipped rows.** Both rows after an escaped quote classify.
- **Pack version consumers.** `judge.mjs`, `run-qa.mjs`, `re-judge.mjs`, and
  `verify-evidence-pack-fixtures.mjs` all import `PACK_VERSION`. A repository-wide grep finds no
  `"p5"` literal in any `.mjs`, `.js`, or `.ts` live path. Stored-judge refusal at
  `run-qa.mjs:1075` and the re-judge tuple guard at `re-judge.mjs:387` are version-neutral, so a
  stored p5 artifact refuses under p6.
- **Historical labels.** `.agents/rounds/` and `research/` are untouched apart from this round's own
  new files. The README keeps a p5 bullet and moves it out of the current position, and it now
  scopes the p6 claim explicitly: "It does not infer custom response-key aliases."
- **Test coverage.** The focused file adds public controls for every one of F1 through F8,
  including the `records[0].description` / bare `description` assertion that pins the restored
  two-pass fact collection.
- **Scope.** Seven files, all within the item. No secret or credential entered the diff.

## Gates the reviewer ran

| Gate | Command | Ledger claim | Reviewer result |
| --- | --- | --- | --- |
| Focused evidence pack | `npx vitest run test/evidence-pack-per-operation.test.mjs` | 41 tests | pass — 41 tests |
| Typecheck | `npm run typecheck` | PASS | pass |
| Full test suite | `npm test` | 100 files, 1,639 tests | pass — 100 files, 1639 tests |
| Build | `npm run build` | PASS | pass |
| Eval self-test | `npm run eval:selftest` | PASS | pass — all checks passed |
| Secret scan | `npm run secrets:scan -- --tree` | PASS | pass — no leaks |
| Diff check | `git diff --check` | PASS | pass |
| Fixture verifier | `node eval/qa/verify-evidence-pack-fixtures.mjs` | — | not runnable here; the gitignored saved artifacts are absent |
| Provider or paid calls | none | 0 | 0 |

Every ledger gate result reproduces.

## Summary

| Severity | Count | Findings |
| --- | --- | --- |
| HIGH | 0 | — |
| MEDIUM | 1 | R1 |
| LOW | 1 | R2 |

F1 through F8 are closed and independently verified. The classifier is now correct for every
documented A/V shape the reviewer could construct, and non-A/V output is byte-identical to p5. Fix
R1 so an A/V passage keeps its prose when its `created_at` is removed, settle R2, then request a
final closure review.
