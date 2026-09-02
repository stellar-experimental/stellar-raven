# Independent review: A/V evidence-pack source date

Date: 2026-09-02
Reviewer: Codex Sol
Verdict: **FAIL**

The change does not complete the TODO contract.
Three findings block approval.
The full local test suite passes, but it does not cover the failing public outputs.

## Scope and fixed point

The fixed point is `HEAD` at `9d9ed2c`.
I reviewed every current uncommitted file.

- `eval/qa/evidence-pack.mjs`
- `eval/qa/README.md`
- `test/evidence-pack-per-operation.test.mjs`
- `test/qa-judge-evidence.test.mjs`
- `test/qa-verdict-consistency.test.mjs`
- `.agents/rounds/2026-09-02-av-evidence-pack-source-date.md`

I also traced the unchanged pack consumers and verification helpers.
This trace included `judge.mjs`, `run-qa.mjs`, `re-judge.mjs`, and `verify-evidence-pack-fixtures.mjs`.

The public path is direct.
`buildTranscriptEvidencePack` selects execute entries and calls `collectSourceItems`.
That function uses the parsed walker and the visible-fragment scanner.
Both paths call `maybeSourceItem`, which calls `sourceDate`.
Ranking then reads `item.date` through `sourceItemText`.
`serializePack` renders the selected value as `date="..."`.

## Findings

### F1 — High: A/V timestamps remain unlabeled date evidence

Location: `eval/qa/evidence-pack.mjs:319`, `eval/qa/evidence-pack.mjs:367`, and `eval/qa/evidence-pack.mjs:654`.

The new selector removes the dedicated `item.date` value for detected A/V rows.
It does not remove or label the same timestamp elsewhere.
`scalarFactsForObject` still retains `created_at`, `date`, and `dateField`.
`collectRelevantFacts` also prioritizes keys that contain `date`.
Claim snippets can include the original fields without an A/V warning.

A local public-seam probe used the new semantic A/V fixture shape.
The source item omitted the outer `date` attribute.
However, it emitted this field block:

```text
fields="date="2026-04-02T23:21:21.744Z", dateField="created_at", collection="av", created_at="2026-04-02T23:21:21.744Z""
```

The global `fields:` line and the claim snippet can also retain that value.
Nothing labels the A/V timestamp as ingest metadata.
The TODO permits omission or an explicit metadata label.
The current output does neither across the complete pack.

The regression test checks only the outer ` date=` attribute.
It therefore accepts the remaining unlabeled date evidence.

Consequence: a judge can still use A/V `created_at` as support for a source-date claim.

Smallest valid repair:

- Remove A/V `created_at` and derived `date` facts from date evidence.
- Alternatively, label each retained value as A/V metadata with no source-date meaning.
- Apply the same rule to source items, global facts, and claim snippets.
- Add a public-pack assertion that checks every occurrence of the timestamp.

### F2 — High: The A/V classifier misses supported response shapes

Location: `eval/qa/evidence-pack.mjs:314` and `eval/qa/evidence-pack.mjs:462`.

The classifier recognizes an exact `av` type, an `av` path segment, or `start_offset`.
That rule handles normalized semantic rows and `find_av_passages` rows.
It also handles complete type-keyed objects.

The rule does not handle all documented A/V shapes.
`research/services/lumenloop.md:88-97` documents document results under generic `items` arrays.
Those rows use `created_at` for the A/V collection.
The returned row does not have to carry `collection`, `type`, `kind`, or `start_offset`.

A local public-seam probe used this documented shape:

```json
{"items":[{"title":"List A/V source","url":"https://example.test/list-av","channel":"Stellar Development Foundation","summary":"A listed video summary with enough detail.","created_at":"2026-06-18T18:18:47.672Z"}],"pagination":{"page":1,"limit":20,"total":1}}
```

The current public pack emitted:

```text
title="List A/V source" date="2026-06-18T18:18:47.672Z"
```

The visible-fragment scanner has another gap.
It recovers the parent key only when the object immediately follows the array opening.
The second object follows the first object and a comma.
It therefore loses the `av` context.

A malformed grouped result contained two complete A/V objects before the cut.
The first item omitted the date.
The second item emitted `date="2026-04-02T00:00:00Z"`.

The new test has one grouped A/V item.
It has no document `items` case.
It cannot detect either failure.

The round ledger says visible fragments retain their parent key.
That statement is false for the second and later fragments.
The ledger risk section also confirms that classification covers only selected forms.

Consequence: valid A/V outputs can still present ingest metadata as a source date.
The `p6` README claim is therefore broader than the implementation.

Smallest valid repair:

- Define an explicit A/V discriminator for every supported public projection.
- Preserve the enclosing collection for every recovered fragment.
- Do not infer an A/V collection from an ambiguous `items` key alone.
- Add fixtures for document results and multiple clipped A/V rows.
- Keep the existing non-A/V controls in those fixtures.

### F3 — High: The portfolio diagnostic reports `p6` output as `p5`

Location: `eval/qa/verify-evidence-pack-fixtures.mjs:366-463`.

The change correctly sets `PACK_VERSION` to `p6`.
The judge and re-judge paths import that value.
The two changed judge tests also expect `p6`.

The portfolio diagnostic imports the current `buildTranscriptEvidencePack` function.
It stores that output in `p5Pack`.
It then reports `p5Chars`, `p5Omissions`, and `p5Mean`.
After this change, those values describe `p6`, not `p5`.

The associated test still builds a hard-coded `p5` report object.
It does not connect the label to `PACK_VERSION`.
The README still presents the command as a reproducible `p3` to `p5` replay.

Consequence: the diagnostic can attribute `p6` measurement results to `p5`.
That output breaks the pack-version evidence contract.

Smallest valid repair:

- Make the diagnostic use version-neutral current-pack fields.
- Print the imported `PACK_VERSION` beside those fields.
- Update the test and README command description.
- Keep old `p5` measurements as historical records only.

This repair follows the forward-only rule.
It does not need a `p5` compatibility path.

## Contract checks

| Contract | Result | Evidence |
| --- | --- | --- |
| Forward-only design | Pass | The change adds one current selector and no compatibility branch. |
| Normalized semantic A/V | Partial | The outer date disappears, but raw date evidence remains. |
| Type-keyed A/V | Partial | Complete JSON works, but later clipped items fail. |
| `find_av_passages` A/V | Partial | `start_offset` classifies the row, but raw metadata remains. |
| Document A/V results | Fail | Generic `items` rows still render `created_at` as `date`. |
| Non-A/V date order | Pass | The non-A/V fallback order is unchanged. Three public controls pass. |
| Pack version | Fail | Public judge paths use `p6`, but the portfolio labels `p6` as `p5`. |
| Documentation | Fail | The current `p6` claim exceeds the verified behavior. |
| Round ledger | Fail | It overstates fragment context and lacks final verification results. |

## Verification

I made no provider call and no paid call.
I did not edit an implementation file.

| Command | Result |
| --- | --- |
| `./node_modules/.bin/vitest run test/evidence-pack-per-operation.test.mjs` | PASS, 35 tests |
| Focused three-file Vitest run | PASS, 191 tests |
| `npm run typecheck` | PASS |
| `npm test` | PASS, 100 files and 1,633 tests |
| `npm run build` | PASS |
| `npm run eval:selftest` | PASS |
| `npm run secrets:scan -- --tree` | PASS |
| `git diff --check HEAD` | PASS |
| Public document-shape probe | FAIL, A/V `created_at` rendered as `date` |
| Public multi-fragment probe | FAIL, the second A/V item rendered `created_at` as `date` |

`node eval/qa/verify-evidence-pack-fixtures.mjs --portfolio` could not run the portfolio here.
The ignored saved result artifacts are absent.
The command exited before the portfolio phase.

## Required closeout

Repair F1 through F3 before approval.
Run the two failing public probes as deterministic regression tests.
Then run the same free verification set.

Update the round ledger with the final results.
Keep the TODO item until the repairs pass independent closure review.

## Closure review — 2026-09-02

Closure verdict: **FAIL**

I reviewed the complete current diff against `HEAD` at `9d9ed2c`.
I traced each repair through `buildTranscriptEvidencePack` output.
I made no provider call and no paid call.
I did not edit an implementation file.

### F1 closure

Status: **PASS for classified A/V rows**.

The public regression test now checks every original A/V timestamp across the complete pack.
It covers source items, global facts, and claim snippets through one public output assertion.
The test confirms that no original A/V timestamp remains for its classified shapes.

The parsed paths remove `created_at`, derived `date`, and `dateField` facts.
The text path removes those facts from malformed JSON.
Claim snippets omit or redact the same fields.

This closure depends on correct A/V classification.
The document-list classification still fails in the real transcript format, as described below.

### F2 closure

Status: **FAIL**.

The later clipped-row repair works.
`pathHasAvArray` keeps the `av` array active for both clipped rows.
The focused public test confirms that both timestamps are absent.

The non-A/V article, research, and event controls also remain present.
Their selected dates are unchanged in the focused public output.

The document-list repair does not use the real transcript input format.
The test passes raw JavaScript as `entry.input` at `test/evidence-pack-per-operation.test.mjs:262`.
The QA recorder stores `JSON.stringify(block.input)` at `eval/qa/agent-result.mjs:521-525`.
That real value contains escaped quotes around the collection value.

`entryIsAv` matches only unescaped quotes at `eval/qa/evidence-pack.mjs:354-355`.
It therefore does not recognize a real `list_documents({ collection: "av" })` execute input.

I repeated the public probe with the recorder's exact input shape:

```json
{"code":"async () => lumenloop.list_documents({ collection: \"av\", limit: 20 })"}
```

The public pack still contained `2026-06-18T18:18:47.672Z`.
It rendered the A/V source as follows:

```text
title="Listed A/V source" date="2026-06-18T18:18:47.672Z"
```

The same timestamp also remained in the claim snippet and the source fields.
Thus, the public document-list shape still violates F1 and F2.

The exact-one-Lumenloop-call rule also conflicts with composed execute scripts.
Multiple Lumenloop calls make `entryIsAv` return false.
An entry-wide true value can instead remove dates from unrelated service rows.
Use row or returned-collection context instead of an entry-wide inference.

Smallest valid repair:

- Test the JSON-stringified transcript input that `agent-result.mjs` records.
- Parse the stored tool input before reading its `code` field.
- Preserve row-level A/V context in composed execute results.
- Add one mixed A/V and non-A/V composition control.

### F3 closure

Status: **PASS**.

The portfolio imports `PACK_VERSION` and stores it as `currentPackVersion`.
It uses version-neutral names for current pack bytes, omissions, and mean length.
The formatter prints `currentPack=p6` from that field.
The focused test asserts this exact output.

The README now labels the recorded `p3` to `p5` numbers as historical.
It describes new portfolio runs as `p3` to the current pack.
No compatibility path was added.

### Closure verification

| Check | Result |
| --- | --- |
| `./node_modules/.bin/vitest run test/evidence-pack-per-operation.test.mjs` | PASS, 35 tests |
| Classified A/V timestamps absent from the focused public pack | PASS |
| Later clipped A/V rows | PASS |
| Non-A/V article, research, and event controls | PASS |
| `formatEvidencePackPortfolioSummary` current version | PASS, `currentPack=p6` |
| Real JSON-stringified document-list input | FAIL, A/V timestamp remains |

F2 remains a blocking public-contract defect.
The closure gate remains **FAIL**.

## Closure review 2 — 2026-09-02

Closure verdict: **PASS**

I reviewed the complete current diff against `HEAD` at `9d9ed2c`.
I focused on F1, F2, and F3 from the prior reviews.
I made no provider call and no paid call.
I did not edit an implementation file.

### F1 closure 2

Status: **PASS**.

Classified A/V timestamps cannot appear anywhere in the tested public pack.
The public assertion checks every original timestamp across the complete pack text.
This check covers source items, source fields, global facts, and claim snippets.

The covered shapes include semantic, grouped, passage, document-list, mixed, and clipped A/V rows.
The code removes `created_at`, derived `date`, and `dateField` from parsed A/V facts.
The malformed-text path applies the same selection rule.
Claim snippets skip or redact the same A/V values.

### F2 closure 2

Status: **PASS**.

`entryIsAv` now parses the recorded JSON input.
It reads the string from the parsed `code` field before inspecting the operation and collection.
The document-list test now uses `JSON.stringify({ code: ... })`.
This shape matches `agent-result.mjs`, which stores `JSON.stringify(block.input)`.

The clipped fixture contains two complete A/V rows in malformed JSON.
`pathHasAvArray` keeps the enclosing `av` context for both rows.
Neither clipped timestamp appears in the public pack.

The mixed fixture has separate `av` and `research` response paths.
Its A/V timestamp is absent.
Its research `created_at` remains the selected source date.
The article and event controls also remain unchanged.

The repair stays forward-only.
It adds no compatibility path or dual pack format.

### F3 closure 2

Status: **PASS**.

The portfolio imports `PACK_VERSION` from `evidence-pack.mjs`.
It records that value as `currentPackVersion`.
The current metrics use version-neutral field names.
The formatter reports `currentPack=p6`.

The README separates the historical `p3` to `p5` result from current-pack runs.
The judge tests and consistency test also expect `p6`.

### Closure review 2 verification

| Check | Result |
| --- | --- |
| `./node_modules/.bin/vitest run test/evidence-pack-per-operation.test.mjs` | PASS, 35 tests |
| Recorded JSON `entry.input` document-list shape | PASS |
| Mixed A/V and research output | PASS |
| First and later clipped A/V rows | PASS |
| Non-A/V date controls | PASS |
| Current pack version reporting | PASS, `currentPack=p6` |

I found no new actionable issue within the reviewed contract.
F1, F2, and F3 are closed.
The independent closure gate is **PASS**.
