# Call-pattern triage review (Codex gpt-6-astra, high)

Author and orchestrator: Claude Opus 5.5. First pass at `c5bdcd54`; delta pass at `bceb8fc4`.

## First pass

# RT independent review

Reviewed `63396840...c5bdcd54` on `w1012/t`.
I inspected the code, stored transcripts, schemas, tests, and measurement notes directly.
I made no paid call or live upstream call.
I changed only this report.

## Findings, by severity

### P1 — The guard breaks a valid result-shape check

Evidence: `src/executor/providers.ts:295`, `src/executor/providers.ts:301`, and `test/executor-providers.test.ts:858`.

The guard adds an own `content` property to every successful section result.
Both `"content" in r.data` and `Object.hasOwn(r.data, "content")` therefore return `true`.
Before this change, both return `false` for a section result.
This valid script now selects the wrong branch and throws:

```js
const r = await codemode.skill.read(id, { sections: [key] });
if (!r.ok) return r.error;
return "content" in r.data
  ? r.data.content.slice(0, 1000)
  : r.data.sections.map(s => s.content);
```

I reproduced this failure with the actual `SECTIONS_GUARD` strings under Node.
The exception says `Cannot read properties of undefined (reading 'slice')`.
Non-enumerability does not preserve property-existence checks.
The new test checks only `Object.keys`, so it misses this regression.

Remove or redesign the `content` accessor before merge.
Add regression coverage for `in` and `Object.hasOwn` with whole reads and section reads.
Preserve the documented absence of `content` on section results.

### P2 — The recount misses 13 additional section misreads

Evidence: `.agents/rounds/2026-10-12-call-pattern-triage.md:109`, `:111`, `:118`, and `:193`.
The same incorrect totals appear in `.agents/TODO.md:333`.

The ledger defines a misread as lost text, garbled text, or an exception.
Its baseline counts omit silent reads of the absent top-level `content` property.
Those older revisions return section results without the newer `.data` wrapper.
The ledger already includes two exceptions from that older shape, so it must include its silent losses too.

My recount finds **26 misread scripts in 199 MCP skill-read scripts**.
The classes contain **4 map reads, 6 string reads, and 16 absent-content reads**.
The Playground count remains **0 in 6**.
The table below provides the corrected counts and the additional evidence.

Correct the ledger, TODO, reported rate, affected rows, and guard-coverage claim.
Keep historical top-level results separate from results with the current envelope.

### P2 — The guard needs a measurement before merge

Evidence: `src/executor/providers.ts:299`, `:307`, `:311`;
`.agents/rounds/2026-10-12-call-pattern-triage.md:186` and `:198`.

Commit `7bd47e73` changes model-visible results and logs.
It converts successful executions with incomplete skill text into failed executions.
An exception can also discard useful results from other calls in the same script.
The model must then recover, with possible effects on answer quality and call use.
The Playground permits only three execute calls per turn (`src/demo/budget.ts:39`).

The guard also logs warnings for correct `content || sections` fallbacks.
The B1 `q-soroban-fuzz-testing` script provides a stored example.
Thus, guard-message counts do not equal misread counts.
The shared warning set also suppresses repeated content warnings within one execution.

The proposed A/B includes the guard in both arms.
That comparison can measure the text change, but cannot measure the guard's effects.
First compare a repaired guard against the unchanged behavior, with identical guidance in both arms.
Count lost result data, successful recovery, extra execute calls, correct fallback warnings, and answer grades.
Inspect scripts directly to distinguish warnings from actual misreads.

### P2 — The cause statement overlooks existing model-visible shape guidance

Evidence: `.agents/rounds/2026-10-12-call-pattern-triage.md:148` and `.agents/TODO.md:336`.

The claim that no model-facing text states the element shape is false.
`specs/super-spec.json:4945` already states `sections?: [{section, content, url ...}]`.
`scripts/build-super-spec.mjs:610` generates that description.
I confirmed the same description at `63396840`.
The model can read it through `codemode.spec()`.

The narrower cause remains credible.
The execute description and ordinary skill detail guidance omit the array shape before this change.
State that gap precisely, and describe model causation as an inference from the stored behavior.

## Question 1 — Independent recount and causes

### Calls without required arguments

I parsed the saved execute scripts and inspected the remaining malformed script directly.
The totals count written call expressions, including expressions inside scripts that could not execute.
They do not count confirmed upstream requests.

| Run | Revision | Stellar Docs expressions | Missing required inputs | Skill-read scripts |
| --- | --- | ---: | ---: | ---: |
| paired-1 baseline | `90d0ba75` | 471 | 0 | 39 |
| paired-1 candidate | `0dc353b9` | 370 | 0 | 40 |
| paired-3 baseline | `90d0ba75` | 454 | 0 | 39 |
| paired-3 candidate | `8bca4167` | 374 | 0 | 36 |
| answer-style B1 | `d15a4ce5` | 60 | 0 | 11 |
| answer-style C1 | `2612f86a` | 56 | 0 | 12 |
| answer-style C2 | `2612f86a` | 51 | 0 | 12 |
| answer-style B2 | `d15a4ce5` | 55 | 0 | 10 |
| **MCP total** | | **1,891** | **0** | **199** |
| Playground baseline-1 | `0dc353b9` | 6 | 1 | 2 |
| Playground baseline-2 | `0dc353b9` | 6 | 2 | 2 |
| Playground candidate-1 | `32d22a71` | 9 | 1 | 1 |
| Playground candidate-2 | `32d22a71` | 7 | 2 | 1 |
| **Playground total** | | **28** | **6** | **6** |

The MCP totals include 182 anchor expressions and 91 asset expressions.
None omit a required input.
The Playground omissions are exactly those reported:

| Run | Operation | Missing / total | Missing-call arguments |
| --- | --- | ---: | --- |
| baseline-1 | `search_anchor_sep_docs` | 1 / 2 | `{ hitsPerPage: 3 }` |
| baseline-2 | `search_anchor_sep_docs` | 1 / 1 | `{ hitsPerPage: 3 }` |
| candidate-1 | `search_anchor_sep_docs` | 1 / 2 | `{ hitsPerPage: 3 }` |
| candidate-2 | `search_anchor_sep_docs` | 1 / 1 | `{ hitsPerPage: 5 }` |
| baseline-1 | `search_asset_token_docs` | 0 / 1 | — |
| baseline-2 | `search_asset_token_docs` | 1 / 1 | `{ hitsPerPage: 3 }` |
| candidate-1 | `search_asset_token_docs` | 0 / 0 | — |
| candidate-2 | `search_asset_token_docs` | 1 / 1 | `{ hitsPerPage: 3 }` |

All six calls omit `query`.
The anchor omissions occur on `q-anchor-list-builders-discovery`.
The asset omissions occur on `q-asset-stablecoin-issuers-discovery`.

The stored Playground cards omit `query: string;` after the signature cut.
They retain `hitsPerPage?: number;` and part of the `includeContent` comment.
No Playground script calls `codemode.describe`.
The catalog, spec, and full rendered signature correctly require `query`.
The micro-map contains no conflicting argument guidance.
The host rejects the calls and names `query`.

I reproduced the signature cut against all 61 callable catalog entries.
It clips 56 entries and hides a required field in 22 entries.
The reported service breakdown also matches.
This is strong evidence for an own-repository presentation defect.
An A/B remains necessary to establish the fix's effect on model behavior.

### Section-result misreads

| Run | Scripts | Map | String | Absent content | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| paired-1 baseline | 39 | 1 | 0 | 8 | 9 |
| paired-1 candidate | 40 | 0 | 2 | 0 | 2 |
| paired-3 baseline | 39 | 0 | 0 | 7 | 7 |
| paired-3 candidate | 36 | 1 | 2 | 0 | 3 |
| answer-style B1 | 11 | 0 | 2 | 0 | 2 |
| answer-style C1 | 12 | 0 | 0 | 1 | 1 |
| answer-style C2 | 12 | 2 | 0 | 0 | 2 |
| answer-style B2 | 10 | 0 | 0 | 0 | 0 |
| **MCP total** | **199** | **4** | **6** | **16** | **26** |
| Playground | 6 | 0 | 0 | 0 | 0 |

These counts retain the ledger's script-based denominator.
They exclude correct fallbacks, serialized section arrays, and deliberate shape inspection.
The combined rate is 13.1%.
The current-envelope revisions account for 10 misreads in 121 scripts, or 8.3%.
Historical top-level revisions account for 16 misreads in 78 scripts.

The following table locates every absent-content misread in the two historical baseline runs.
The ledger counted only the exception at index 5 in each `q-jutsu-check-account-history` row.
Indices refer to the zero-based `transcript` array.
Line numbers identify each transcript's `input` field.

`P1B` means:
`/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/2026-10-11-paired-attempt-1/baseline-results/2026-10-11T02-01-12-variantA.json`.

`P3B` means:
`/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/2026-10-11-paired-attempt-3/baseline-results/2026-10-11T07-03-19-variantA.json`.

| Artifact | Row | Transcript indices | Input lines |
| --- | --- | --- | --- |
| P1B | `q-aas-burn-clawback-redemption-mechanics` | 4 | 7276 |
| P1B | `q-agent-identity-erc8004-stellar` | 6 | 11005 |
| P1B | `q-defi-etherfuse-stablebonds` | 4, 5 | 39790, 39800 |
| P1B | `q-jutsu-check-account-history` | 3, 4, 5 | 82079, 82089, 82099 |
| P1B | `q-pc-address-types-strkey` | 3 | 91976 |
| P3B | `q-aas-list-token-on-exchanges-aggregators` | 5 | 9437 |
| P3B | `q-jutsu-check-account-history` | 3, 4, 5 | 86430, 86440, 86450 |
| P3B | `q-scf-pitch-prep-live` | 4, 5, 6 | 132755, 132765, 132775 |

For example, P1B's agent-identity script returns `{}` after reading two absent `content` fields.
P1B's second Etherfuse script returns `rwaSkill: ""`.
P3B's SCF script at index 6 returns `{}`.
Each loses requested section text without an exception.

The three error classes support the narrower guidance-gap explanation.
They do not prove that missing guidance alone caused every misread.
The spec already exposes the shape, as finding 4 explains.

## Question 2 — Guard correctness and merge decision

The guard preserves ordinary enumerable data for normal section keys.
Direct content reads, numeric indexing, `find`, `Object.keys`, `Object.entries`, and ordinary spreads retain their data.
Normal JSON serialization and Node structured cloning also retain the plain section values.
The smoke test contains a useful return-across-boundary check, but this environment could not execute it.

The guard changes property-existence checks, string conversion, and logs.
`content || sections` still selects the section array, but adds a warning.
The property-existence regression blocks code approval.
The warning and exception changes also require measurement before merge.

One additional limitation affects the broad JSON-safety claim.
A synthetic section named `toJSON` makes `JSON.stringify(data)` throw through the array-key accessor.
JSON reads `toJSON` even when that property is non-enumerable.
I reproduced this with the actual guard strings.
I found no current catalog selector requiring that name, so this is an additional test case, not a current-catalog blocker.

The guard also misses `typeof`-based text loss and `.slice()` on section objects.
It catches only requested section names for map-style reads.
Thus, its messages cannot serve as a complete misread counter.
Historical scripts also require explicit shape normalization before a current-envelope guard replay can assess them.

Decision for `7bd47e73` alone: **MEASURE-FIRST**, after the property-existence repair.

## Question 3 — Other commits and measurement notes

**`34859dbd`: general and correct for the current catalog.**
It derives required input names from the manifest.
It applies the same helper to hits, wider candidates, and recovery candidates.
I checked all 61 callable entries with the actual clipping function.
All outputs preserve the callable line and stay within 400 characters.
Every clipped entry with required inputs names those inputs.

The Playground note selects relevant rows, controls, counts, and two repetitions per arm.
Before collection, pin both revisions and keep the guard and section guidance identical between arms.
Comparing `main` against all of `w1012/t` would also measure those other changes.
Use a candidate containing only `34859dbd` for this comparison.
The fallback at `src/demo/tools.ts:179` can drop the marker with larger future schemas.
No current catalog entry reaches that fallback.

**`dfd96ded`: general and correct.**
The description matches `src/skills/store.ts:383` and `:415`.
The store appends section objects in request order.
The documentation now gives the model a direct, correct content-access example.

The MCP note provides useful initial scope, but needs the corrected recount and guard comparison.
It also says “9 misread rows” while its original list contains eight distinct IDs.
Freeze an explicit ID list after the recount.
Pin the model, judge, revisions, and acceptance rules before collection.
Keep manual classification for correct fallbacks and guard misses.
Both text commits still need their stated measurements before merge.

## Question 4 — Tests and verification

I ran both commands without output pipes:

```sh
npx vitest run test/executor-providers.test.ts test/mcp-instructions.test.ts
npx vitest run --config test/smoke/vitest.config.ts test/smoke/demo-tools.test.ts test/smoke/executor.test.ts
```

The first command exited 0: **2 files and 103 tests passed**.
The second command exited 1 before any test ran.
Both worker pools failed with `listen EPERM: operation not permitted 127.0.0.1`.
Wrangler also reported a denied write to its external log directory.
These failures leave the smoke result unverified in this review.
They do not establish a code failure.

I verified all 66 pinned cache files before running tests.
Their Git blob hashes matched the manifest, so test setup needed no upstream fetch.
I also ran read-only Node checks for the guard regression and all 61 callable signatures.

The tests prove normal shape preservation and the intended error messages.
They do not prove preservation of property-existence checks or improved model behavior.
Add the property-check regression tests and correct-fallback controls.
Rerun both smoke files in an environment that permits the local worker test sockets.
Complete the guard measurement before its merge decision.

CODE: CHANGES: Repair the content accessor, correct the recount and cause claims, and revise the measurement notes.
GUARD-COMMIT: MEASURE-FIRST: Repair valid property checks, then measure recovery, result loss, call use, and answer quality.


## Delta pass

# RT2 delta review

Reviewed `c5bdcd54...bceb8fc4` on `w1012/t`.
The delta contains `532cd789`, `51b365eb`, and `bceb8fc4`.
I checked the reconciliation notes against the code, tests, ledger, and previous independent recount.
I changed only this report.
I made no paid call or live upstream call.

## Findings

No new blocking defect found in this delta.
The code corrections resolve the previous code findings.
The guard still needs a measurement before merge.
Code approval does not approve a merge or a paid collection.

## Verification of each previous finding

### P1 — Valid property checks: resolved

Evidence: `src/executor/providers.ts:296` and `test/executor-providers.test.ts:881`.

Commit `51b365eb` removes the `content` accessor.
A section result again returns `false` for both `"content" in data` and `Object.hasOwn(data, "content")`.
A whole result retains its own `content` property.
The added test checks both result shapes and the previously broken branch.
That test passes.

I also checked the actual guard strings directly under Node.
The previously failing branch now returns the section content.
`content || sections` returns the section array and adds no warning.

### P2 — Missing misreads: resolved

Evidence: `.agents/rounds/2026-10-12-call-pattern-triage.md:115` and `.agents/TODO.md:333`.

The corrected records match my independent recount:

| Result shape | Skill-read scripts | Misreads | Rate |
| --- | ---: | ---: | ---: |
| Historical top-level results | 78 | 16 | 20.5% |
| Current data envelope | 121 | 10 | 8.3% |
| All MCP results | 199 | 26 | 13.1% |
| Playground results | 6 | 0 | 0% |

The classes contain 4 map reads, 6 string reads, and 16 absent-content reads.
The ledger includes the 13 previously omitted scripts and their transcript indices.
It separates the historical shape from the current envelope.
The frozen list now contains 13 affected row IDs and three controls.

The revised guard-coverage statement also matches the code and stored error classes.
It catches 7 of the 10 current-envelope misreads: 3 map reads and 4 string conversions.
One other script already throws on `.slice()`.
Two remain silent: the `typeof` branch and the absent-content read.
The ledger no longer treats guard messages as a complete misread count.

### P2 — Guard measurement: reconciled as a required gate

Evidence: `.agents/rounds/2026-10-12-call-pattern-triage.md:189` and `:218`.

The ledger now identifies the guard as a change to model-visible results.
Its separate A/B holds the section guidance constant.
The comparison measures lost results, recoveries, extra execute calls, incorrect guard messages, and answer grades.
Direct script inspection supplies the misread counts.

This resolves the previous measurement-plan finding.
It does not complete the measurement.
The repaired guard, `7bd47e73` plus `51b365eb`, remains **MEASURE-FIRST**.
The ledger requires exact revisions, model pins, judge pins, and acceptance rules before collection.

### P2 — Existing shape guidance: resolved

Evidence: `.agents/rounds/2026-10-12-call-pattern-triage.md:159` and `:165`.

The ledger now identifies the shape description available through `codemode.spec()`.
It narrows the missing guidance to the ordinary execute, describe, and search paths before this change.
It labels the proposed causal link as an inference.
The TODO uses the same narrower explanation.

## Additional corrections and defect checks

**Special section names:** `src/executor/providers.ts:301` now excludes `toJSON` and `then` from array-key traps.
The synthetic test at `test/executor-providers.test.ts:903` passes for JSON serialization and promise resolution.
My direct checks also pass for those names, `find`, `length`, and numeric keys.

**Ordinary data operations:** I checked `Object.keys`, `Object.entries`, `for...in`, spreads, JSON, and Node structured cloning.
They preserve the ordinary enumerable section data.
The intended map-read and string-conversion exceptions still occur.
These checks do not establish preservation of every possible reflection operation.
The guard deliberately adds non-enumerable properties to section objects and arrays.

**Signature fallback:** `src/demo/tools.ts:179` now retains the required-input marker and callable line.
I checked the actual clipping function against all 61 callable catalog entries.
Every output stays within 400 characters and preserves the callable line.
Every clipped signature with required inputs names those inputs.
No current entry enters the fallback.

A synthetic long callable enters the fallback and produces 458 characters.
It retains both the marker and callable line.
The ledger records this possible budget excess.
This remains a documented limitation for larger future signatures, with no current-catalog regression found.

**Measurement separation:** The Playground candidate now contains only the two clipping commits.
The section-text comparison keeps the guard state identical between arms.
These changes resolve the previous comparison-design concerns.
All three changes retain their measurement gates.

## Tests and limits

I verified all 66 pinned cache files before testing.
Their Git blob hashes match the manifest.
Test setup therefore needed no upstream fetch.

I ran the affected tests without output pipes:

```sh
npx vitest run test/executor-providers.test.ts test/mcp-instructions.test.ts
npx vitest run --config test/smoke/vitest.config.ts test/smoke/demo-tools.test.ts test/smoke/executor.test.ts
```

The unit command exited 0: **2 files and 104 tests passed**.
The smoke command exited 1 before any test ran.
Both worker pools failed with `listen EPERM: operation not permitted 127.0.0.1`.
Wrangler also reported a denied write to its external log directory.

The author reports a successful full smoke run in the reconciliation notes.
I could not independently verify that result in this environment.
The edited smoke assertion correctly checks that the returned section data lacks `content`.
The environment failure does not establish a code defect.

The direct Node checks for guard behavior and signature clipping also passed.
They supplement the unit results but do not replace the worker-boundary smoke tests or model measurements.

CODE: APPROVE
GUARD-COMMIT: MEASURE-FIRST: The repaired guard still needs the isolated recovery, result-loss, call-use, and answer-quality measurement.
