# Evidence-pack omission analysis

> Archived 2026-10-09 from lane E. The `tmp/` scripts and JSON files named below are in this folder.
> `tmp/stable-evidence.json`, `tmp/beans-saved-evidence.json`, and the lane report are in the ignored local
> archive `eval/results/2026-10-09-continuation-lanes-evidence.tar.gz`. Result paths are relative to the
> repository root; `eval/qa/results/` is ignored and exists only on the owner's machine.

Date: 2026-10-09.
Scope: offline analysis of the unchanged p6 pack.

## Evidence limit

The requested `2026-10-01T22-05-47-variantA.json` artifact is absent.
The orchestrator confirmed that no retained local copy exists.
The orchestrator authorized analysis from code, retained records, and other saved omission rows.
I cannot reproduce that row's exact selection order, field paths, or pack bytes.

The retained artifact manifest records its SHA-256:
`840fae8a41e1c3eaa93da1a0f991a97dfeeca16bf19d6bf5afe13c62b9ca1c52`.
See `.agents/rounds/2026-10-01-backlog-closeout/sd-measure/evidence/artifact-manifest.json`.

The TODO records four omitted groups: founder story, lifecycle claims, release tag, and SDK commit date.
The retained review confirms raw mentions of `Wouter`, `Philippines`, `Kulipa`, and `v3.5.0`.
It also records `evidenceSupportCheck.status: pack-omission`.
See `.agents/rounds/2026-10-01-backlog-closeout/sd-measure/review-result.md:52`.
The review retains a separate unsupported side claim.
This analysis does not overturn that finding or the saved Wrong grade.

## General selection boundary

All line references below use the unchanged `eval/qa/evidence-pack.mjs` in this worktree.

1. Lines 261–309 select non-stable rows and saved execute results.
   Lines 265–293 separate result bodies from host footers and console output.
   Stable rows receive no pack at line 1403.
   `eval/qa/judge.mjs:445` also skips their automatic omission diagnostic.
   Decision H therefore requires a separate offline diagnostic.
2. Lines 412–448 choose one summary field and construct source items.
   A preceding `summary` masks a later `description`, `excerpt`, or `text` field.
   Lines 451–487 retain at most eight short scalar fields per item.
   Long narrative details cannot use that scalar route.
3. Lines 99–131 and 192–258 extract bounded terms from the answer and case.
   They favor identifiers, dates, numbers, capitalized names, and selected field words.
   They do not represent every lowercase narrative clause.
   Candidate terms stop at 160; case terms stop at 40.
4. Lines 688–737 extract windows around terms.
   Each term receives at most two matches per execute result.
   Overlapping windows suppress later windows before final coverage selection.
   Lines 585–594 also suppress snippets that resemble either guaranteed source item.
   That comparison uses the item's full summary, before serialization shortens it.
5. Lines 740–762 select snippets by new term coverage.
   Lines 1421–1431 allocate eight candidate snippets and four case snippets.
   This step counts matching terms, not complete factual relationships.
6. Lines 845–945 select bounded scalar facts.
   Lines 948–992 prioritize verbatim claims and exact terms.
   These paths help identifiers, but do not guarantee narrative support.
7. Lines 1331–1392 serialize the selected evidence.
   Line 1365 shortens each snippet around its anchor term.
   Line 1385 shortens each source summary from its beginning.
   Those cuts can remove other terms that the coverage selector counted.
8. Lines 1433–1479 enforce the 12,000-character budget.
   They shorten summaries, reduce items and facts, then shorten and remove snippets.
   The code does not recheck claim coverage after those cuts.

The boundary loses evidence during extraction, selection, and final serialization.
It does not merely remove the end of one large transcript.
Increasing the final character budget cannot recover evidence lost before serialization.

## Implications for the missing Beans row

These are mechanism-based explanations, not an exact replay of the missing row.

| Recorded omission | Relevant general boundary |
| --- | --- |
| Founder story | Names can select snippets without preserving the full relationship. Long summaries lose later narrative details. |
| Lifecycle claims | Lowercase clauses can lack useful anchors. Scalar status fields do not preserve the full lifecycle explanation. |
| Release tag | Backticks can preserve a complete version term. An unquoted version can fragment during term extraction. Window overlap and later shortening can still remove it. |
| SDK commit date | Exact dates receive priority. Term coverage can still lose the repository/date relationship during window selection or shortening. |

The missing transcript prevents a choice among these branches for each Beans claim.
It also prevents a check of whether source truncation removed additional context.
The TODO establishes the reported omissions; the code explains how this class of omission occurs.

## Replayed saved p6 omissions

The local scan found 11 rows with saved `evidenceSupportCheck.status: pack-omission`.
`tmp/stored-pack-omissions.json` records their file names, case IDs, and saved checks.

I replayed two rows from this source:
`eval/qa/results/2026-10-07-tool-surface-qa/2026-10-08T02-40-37-variantA.json`.
Its SHA-256 is `e3517cf81b724016ac33f84be1deb9c4e17207507a2c8f2b841e08876465e5f4`.

| Case | Reproduced p6 pack | Result |
| --- | --- | --- |
| `q-hist-quantum-preparedness-plan` | 11,632 characters; `c2a605e968d48e741e6975c009a74fe397bc9a1cf5d1b7b2e223457409637859` | The raw results contain “already becoming protocol”. The pack omits it. |
| `q-soroban-oz-upgradeable-macro` | 8,419 characters; `09b8dee0d1c772a1d17373cbe0b3b5d87d8b5b32c4d652e6847c067983659849` | The raw result contains both derive macros. The pack omits both. |

Both reproduced hashes equal their saved pack hashes.
The replay reads the saved answer, case input, tags, and transcript.
`trace-saved-pack.mjs` (in this folder) exports selection helpers in memory for read-only inspection.
It reads the ignored saved result, so it runs only where that file exists.
It never edits the source module.
`tmp/saved-pack-trace.json` records the replay and the new diagnostic output.

For the quantum row, transcript entries 4 and 5 contain the phrase.
The phrase is not an extracted candidate term.
No candidate snippet contains it before coverage selection.
The raw results have truncation markers, but the phrase remains visible.
A 100,000-character budget produces 19,809 characters and still omits the phrase.
The new diagnostic reports a prose match and retains both truncation limits.
That support does not resolve the Draft-versus-shipped interpretation.

For the macro row, transcript entry 3 contains both exact macros.
The extractor recognizes both candidate terms.
No collected candidate snippet retains `#[derive(Upgradeable)]`.
One selected snippet retains `#[derive(UpgradeableMigratable)]` before serialization.
That snippet uses `_require_auth` as its anchor.
The macro starts at offset 7 in the 739-character snippet.
Final serialization shortens the snippet around `_require_auth` and removes that macro.
A 100,000-character budget produces the same 8,419-character pack.
The new diagnostic reports six matching terms from the saved result.
It does not establish that the documented API remains current.

The synthetic replay supplies a separate pressure control:
`node .agents/rounds/2026-10-09-continuation/pack-omission/replay-pack-boundary.mjs`.
Fourteen source claims retain all fourteen dates but lose nine complete prose probes.
Both 12,000 and 100,000 character budgets lose the same nine probes.
This shows why isolated date coverage cannot establish claim coverage.
The fixture is synthetic; it does not replace the missing Beans artifact.

## Proposed general repair

Do not implement this repair in the current lane.

Build evidence units with a result index, source path, entity context, and exact source span.
Derive candidate anchors before judging, including quoted lowercase clauses and complete version strings.
Do not use later judge verdicts to select the judge's input.
Retain each matched span and its relationship context as one unit.
Shorten surrounding context without cutting the supported span.

Measure coverage on the final serialized units.
Do not suppress a snippet because an unshortened source item contains similar text.
Suppress it only when the final serialized item retains the relevant support.
Recompute coverage after each budget reduction.
Allocate space across distinct claims and sources with deterministic tie rules.
Record omissions when the fixed budget cannot preserve a claim's evidence.
Preserve source truncation, error boundaries, and the p6 A/V date exclusions.
Keep stable-row judge inputs unchanged unless a separate decision changes that contract.

## Replayable coverage for a later change

- Recover the October 1 artifact only if a retained external copy becomes available.
  Require the recorded SHA-256 before using it.
  Otherwise keep its exact replay explicitly unavailable.
- Retain the two October 8 rows above with source, transcript, case, and original pack hashes.
  Preserve the original verdicts and artifacts.
- Use the other nine saved omission rows as a separate diagnostic set.
  Keep each historical rubric and pack version visible.
- Reuse `test/fixtures/evidence-pack.mjs` and `test/evidence-pack-per-operation.test.mjs` as regression controls.
  The existing Beans fixture covers an August row, not the missing October row.
- Add fixtures for late narrative clauses, overlapping anchors, complete release tags, and repository/date relationships.
  Add a selected-span fixture whose secondary claim disappears during shortening.
- Add unrelated-number, conflicting-source, truncated-JSON, missing-transcript, and duplicate-source controls.
  Require retained provenance and explicit uncertainty when evidence cannot fit.
- Preserve A/V `created_at` exclusions, error boundaries, and the 12,000-character limit.
  Verify the final serialized text, not only intermediate term counts.
- Give the repaired pack a new version and an independent review.
  Run any approved measurement into separate artifacts under its own contract.
  Never replace the frozen adapter-measurement verdicts or comparison denominators.

## Diagnostic application to locally stored Beans rows

The requested October 1 row cannot enter the diagnostic because its artifact is missing.
I used `--all-freshness --ids q-live-beans-cross-service-reconcile` on the local result directory.
Five older answer rows remain available.
They contain seven saved disputed claims.
One receives a prose match; four receive term matches; two remain uncertain.
One term match contains only a number.
Two rows contain no saved disputed claims.
`tmp/beans-saved-evidence.json` records those results.
These observations do not replace the missing October row.
