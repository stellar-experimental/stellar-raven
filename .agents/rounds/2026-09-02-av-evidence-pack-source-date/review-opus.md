# A/V evidence-pack source date — independent review

Date: 2026-09-02
Reviewer CLI: Claude Code
Model: Opus 5
Effort: high
Author: Codex Terra
Orchestrator: Codex
Prior reviewer: Codex Sol (`review-sol.md`)
Eligibility: the reviewer differs from the author and from the orchestrator.
Fixed point: HEAD `9d9ed2c` (`skills: stop dating A/V rows from created_at`)
Reviewer edits: none to implementation files. This report is the only file the reviewer wrote.
Paid or provider calls: none.

## Verdict

**NOT PASS.** Five actionable findings remain, four of them High.

The change closes the case it was written for. A classified A/V row no longer renders
`created_at` as a source date. The non-A/V fallback order in `sourceDate` is unchanged.

The failures are on the other side of the same rule. Non-A/V dates are removed and relabeled as
A/V metadata; the text inference fires on ordinary `collection` objects; two ordinary A/V call
shapes still leak the timestamp; and an unrelated selection change alters the global `fields:` line
for almost every pack-eligible row while the ledger and the README both say it does not.

## What the reviewer inspected

`AGENTS.md`, the removed `.agents/TODO.md` contract, the complete uncommitted diff across seven
files, `.agents/rounds/2026-09-02-av-evidence-pack-source-date.md`, `review-sol.md`, the
`run-evals` and `audit-reviewability` skills, and every evidence-pack consumer: `judge.mjs`,
`run-qa.mjs`, `re-judge.mjs`, and `verify-evidence-pack-fixtures.mjs`.

The reviewer probed the public seam `buildTranscriptEvidencePack` directly, and ran an A/B against
an unmodified copy of the module held outside the repository.

## Independent p6 contract verification

The reviewer reproduced the contract at the public seam with local JSON only.

| Shape | Classifier signal | A/V `created_at` in the pack |
| --- | --- | --- |
| Semantic row with `collection: "av"` | row field | absent |
| Grouped `av` array | parsed path | absent |
| `find_av_passages` row with `start_offset` | row field | absent |
| Document list, one `list_documents({ collection: "av" })` call | recorded `entry.input` | absent |
| Mixed response with an `av` key and a `research` key | parsed path | absent |
| Two clipped A/V rows in malformed JSON | `pathHasAvArray` | absent |
| **Document list, two calls to the same A/V operation** | none | **present — see F3** |
| **Composed A/V plus research returned under a `videos` key** | none | **present — see F4** |

Non-A/V controls hold at the item level. Across all eight committed fixtures the `sourceItems`
block and the `claimSnippets` block are byte-identical to the pre-change module, so no non-A/V
item-level `date="..."` attribute moved. The `fields:` line is a different matter; see F5.

## Findings

### F1 — HIGH — Claim-snippet redaction deletes non-A/V dates and relabels them as A/V metadata

File: `eval/qa/evidence-pack.mjs:590` (`redactAvDateMetadata`), `eval/qa/evidence-pack.mjs:585`
(`redactsAvDateMetadata`), `eval/qa/evidence-pack.mjs:616-618`

`redactsAvDateMetadata` decides A/V-ness from a text window of 500 characters before the match and
300 after it. When it returns true, `redactAvDateMetadata` runs an unanchored global regex over the
whole snippet and rewrites **every** `"created_at"` and `"date"` value in it, whatever object it
belongs to.

A snippet is 720 characters wide. Any non-A/V row inside that window loses its date.

Reproduced at the public seam. One malformed result held an `av` array and an `articles` array. The
claim term matched inside the article. The pack emitted:

```text
snippet: {"av":[{"title":"Talk about Protocol 23",...,"av_metadata_date":"[omitted]"}],
"articles":[{"title":"Protocol 23 release article",...,"av_metadata_date":"[omitted]",
"publishing_date":"2025-11-05T00:00:00Z"}]
```

The article's `"date":"2025-11-05T00:00:00Z"` is gone, and the key that replaced it tells the judge
the value was A/V ingest metadata. It was an article publication date. In this fixture the value
survives only because the row also carries `publishing_date`; a row with `date` alone loses it.

The removed `.agents/TODO.md` contract required the fix "without changing verified date handling
for other source types". This changes it, in the direction that destroys evidence.

Required action: scope the rewrite to the matched A/V object, not the snippet. Redact by offset
inside the object that `redactsAvDateMetadata` classified, or drop the snippet-level rewrite and
rely on the object-level rules that already work.

### F2 — HIGH — The A/V text inference fires on any `collection` whose value is an object or an array

File: `eval/qa/evidence-pack.mjs:578`, `eval/qa/evidence-pack.mjs:587`

Both call sites use `/"(?:collection|av)"\s*:\s*(?:"av"|[\[{])/`. The alternation `[\[{]` accepts
`"collection": {`, `"collection": [`, `"av": {`, and `"av": [`. Only `"collection": "av"` is an A/V
signal. A row whose `collection` is a nested object is ordinary.

Reproduced at the public seam with a row that has no A/V content at all:

```text
snippet: {"results":[{"title":"Protocol 23 release article","collection":{"name":"articles","id":7},
...,"av_metadata_date":"[omitted]","av_metadata_date":"[omitted]"}]
```

Both `created_at` and `date` were destroyed, and the output carries a duplicated key, so the
snippet is no longer valid JSON for a reader or a judge.

Required action: match the A/V value, not the punctuation after the key. Use
`/"collection"\s*:\s*"av"/` and a separate check for an `av` array key.

### F3 — HIGH — Two calls to the same A/V operation defeat `entryIsAv` and leak the timestamp

File: `eval/qa/evidence-pack.mjs:358-362`

```js
const calls = [...input.matchAll(/\blumenloop\.([a-z_]+)/g)].map((match) => match[1]);
if (calls.length !== 1) return false;
```

The rule counts occurrences, not distinct operations. A paginated listing calls the same A/V
operation twice, so `calls.length` is 2 and the entry is not A/V. The document-list shape carries
no `collection`, no `type`, no `kind`, no `av` path segment, and no `start_offset`, so nothing else
classifies it.

Reproduced at the public seam. The identical result body was passed twice, once with a one-call
input and once with a two-call input:

```text
one A/V call  -> timestamp leaks: false
two A/V calls -> timestamp leaks: true
1. title="Listed A/V source" date="2026-06-18T18:18:47.672Z" ...
   fields="channel="SDF", created_at="2026-06-18T18:18:47.672Z""
```

The new document-list test input at `test/evidence-pack-per-operation.test.mjs:266` uses exactly
one call, so it cannot detect this.

Required action: deduplicate the operation names before the count, and decide on the set of
distinct A/V operations rather than on a single call.

### F4 — HIGH — Composed responses leak when the A/V rows are not returned under an `av` key

File: `eval/qa/evidence-pack.mjs:347-363`, `eval/qa/evidence-pack.mjs:365-368`

A composed script that mixes A/V with another service always has more than one Lumenloop call, so
`entryIsAv` is false by construction. Classification then depends on the row or the path. A model
chooses its own return keys, and `av` is only one of them.

Reproduced at the public seam:

```js
async () => { const [videos, research] = await Promise.all([
  lumenloop.list_documents({ collection: "av" }), lumenloop.list_research({}) ]);
  return { videos, research }; }
```

```text
1. title="Composed A/V source" date="2026-05-05T00:00:00Z" ...
   fields="created_at="2026-05-05T00:00:00Z""
```

The shipped mixed fixture passes only because it names the key `av`. It therefore exercises the
path rule, not the composed-classifier gap. `review-sol.md` asked for exactly this repair in its
first closure ("Preserve row-level A/V context in composed execute results") and accepted the
`av`-keyed fixture as evidence for it.

The ledger Risks section records the general limit honestly. `eval/qa/README.md:628` does not:
"**Pack p6** (2026-09-02, current) omits A/V `created_at` values from source dates" is unqualified.

Required action: either classify per returned collection instead of per entry, or state the exact
covered shapes in the README and add a composed control that does not use the `av` key.

### F5 — HIGH — An out-of-contract change alters the global `fields:` line for almost every row

File: `eval/qa/evidence-pack.mjs:748`, `eval/qa/evidence-pack.mjs:841-845`

Two unconditional passes became one. `collectSourceItems` and `collectRelevantFacts` previously ran
the parsed walker **and** the text scanner on every entry. They now run the text scanner only when
the body does not parse.

This is unrelated to A/V dates, and nothing in the change requested it.

The reviewer measured it by A/B against an unmodified copy of the module on the eight committed
fixtures. The `fields:` line differs on **7 of 8**. Global fact counts fall 10 to 5, 6 to 3, 12 to
6, 9 to 4, and 28 to 15. Pack length moves between −361 and +520 characters. `sourceItems` and
`claimSnippets` stay byte-identical, so the change is confined to the `fields:` line.

The loss is not only relabeling. After normalizing away the path prefix, the shipped module drops
distinct fact values that the pre-change module kept:

| Fixture | Distinct fact values dropped | Examples |
| --- | --- | --- |
| beans | 10 | `description="Stellar API SDK for .NET 8"`, `fullName="Beans-BV/homebrew-tap"`, `name="dotnet-stellar-sdk"`, `owner="Beans-BV"`, `slug="beans"` |
| indexer | 3 | `name="stellar-ledger-data-indexer"`, `name="mercury-indexer-asset-price-estimator"` |
| control4 | 1 | `snippet="Q2 2026 validated Stellar's core thesis: DTCC…"` |

The record contradicts this. The ledger Contract says "Non-A/V date selection must remain
unchanged" (`:11`) and the Runtime trace says "All other fallback fields remain in their original
order" (`:27`) and "It reads parsed JSON and visible JSON fragments" (`:19`), which is no longer
true of any one entry. `eval/qa/README.md:628-630` says p6 "omits A/V `created_at` values from source
dates. It retains the p5 source-basis boundaries and diagnostics."

No test covers the `fields:` line for these fixtures, which is why the suite stayed green and why
`review-sol.md` recorded "Non-A/V date order | Pass".

Required action: revert the two `else` branches, or keep the change and document it as a second p6
selection change in the README changelog and the ledger, with the measured fixture deltas.

### F6 — LOW — `pathHasAvArray` carries a broken copy of the string scanner

File: `eval/qa/evidence-pack.mjs:318-326`

The function declares `inString` and `escaped` and enters an escape state machine at line 322. It
never sets `inString = true`. The sibling scanner `scanBalancedObjectAt` sets it at line 490. The
whole branch is unreachable, and the function instead relies on `text.indexOf('"', at + 1)`, which
does not skip an escaped quote.

The reviewer probed an escaped-quote string that could desynchronize the key and array tracking.
The result stayed conservative and leaked nothing, so this is a code-health finding, not a proven
defect. The code still advertises string safety it does not implement.

Required action: add the missing `inString = true`, or delete the dead branch and say the scanner
trusts `indexOf`.

### F7 — LOW — The historical portfolio record no longer matches the command it names

File: `eval/qa/README.md:1161-1172`

The recorded replay keeps the old field names: `p3Mean=9228.06 p5Mean=10580.16 …
omissions=399->114`. `formatEvidencePackPortfolioSummary` now prints `p3Mean=… currentPack=p6
currentMean=… omissions=…->…`. The sentence is correctly past-tensed, so the record is honest, but
a reader who runs the command sees different keys and has no current-pack baseline to compare to.

The reviewer could not run `node eval/qa/verify-evidence-pack-fixtures.mjs --portfolio` here. The
gitignored `eval/qa/results/` artifacts are absent, and the command exits before the portfolio
phase. `review-sol.md` reports the same limit.

Required action: name the old keys as the p5 formatter's keys, or record a current-pack line beside
the historical one when a machine with the artifacts can produce it.

### F8 — NIT — Mixed `&&` inside an `||` chain, duplicated verbatim

File: `eval/qa/evidence-pack.mjs:449`, `eval/qa/evidence-pack.mjs:767`

`if (avSource && (key === "created_at" || key === "dateField" || key === "date" && value.dateField === "created_at")) continue;`

The precedence is correct. The expression is hard to verify by eye, and it appears twice.

Required action: parenthesize the final clause, or extract one named predicate both sites call.

## Items the reviewer checked and cleared

- **Version bump consumers.** `judge.mjs:118`, `run-qa.mjs:783`, and `re-judge.mjs:699` import
  `PACK_VERSION` and stamp it. Nothing hard-codes `p5` in a live path. The three changed test
  expectations match.
- **Stored-judge refusal.** `run-qa.mjs:1075` refuses a stored artifact whose `meta.packVersion`
  differs and names both versions in the message. `re-judge.mjs:387-394` compares the model, rubric
  and pack tuple against the imported value. A stored `p5` artifact refuses under `p6`, which is
  the documented and intended behavior.
- **Historical p5 labels.** `.agents/rounds/` and `research/` are untouched. The README keeps a p5
  bullet and moves it out of the "current" position.
- **Fixture verifier rename.** No `p5Chars`, `p5Omissions`, or `p5MeanPackChars` reference
  survives. `formatEvidencePackPortfolioSummary` prints `currentPack=p6`, and the focused test
  asserts it.
- **Non-A/V item dates.** Byte-identical `sourceItems` blocks across all eight committed fixtures.
- **Parsed and clipped A/V paths.** `pathHasAvArray` keeps the `av` array active for the second and
  later clipped rows. The reviewer confirmed both clipped timestamps are absent.
- **`dateField`-derived dates.** A canonical `date` whose `dateField` is `created_at` is skipped in
  `sourceDate`, in `scalarFactsForObject`, in `collectRelevantFactsFromParsed`, and in
  `collectRelevantFactsFromText`.
- **Scope of files.** Seven files, all within the item. No unrelated file changed.
- No secret, credential, or partner detail entered the diff.

## Gates the reviewer ran

| Gate | Command | Result |
| --- | --- | --- |
| Focused evidence pack | `npx vitest run test/evidence-pack-per-operation.test.mjs` | pass — 35 tests |
| Four-file focused | plus `qa-judge-evidence`, `qa-verdict-consistency`, `qa-judge-stored` | pass — 223 tests |
| Typecheck | `npm run typecheck` | pass |
| Full test suite | `npm test` | pass — 100 files, 1633 tests |
| Build | `npm run build` | pass |
| Eval self-test | `npm run eval:selftest` | pass |
| Secret scan | `npm run secrets:scan -- --tree` | pass — no leaks |
| Diff check | `git diff --check` | pass |
| Fixture verifier | `node eval/qa/verify-evidence-pack-fixtures.mjs` | not runnable here — the gitignored saved artifacts are absent |
| Provider or paid calls | none | 0 |

Every ledger gate result reproduces. The suite is green and does not cover F1 through F5.

## Summary

| Severity | Count | Findings |
| --- | --- | --- |
| HIGH | 5 | F1, F2, F3, F4, F5 |
| LOW | 2 | F6, F7 |
| NIT | 1 | F8 |

The A/V rule is right for the shapes it classifies. The remaining work is on the two sides the
prior review did not reach: the redaction must stop taking non-A/V dates with it, the classifier
must survive an ordinary composed or paginated script, and the `fields:` selection change must
either be reverted or declared. Resolve F1 through F5, clear the LOW items, then request a closure
review.
