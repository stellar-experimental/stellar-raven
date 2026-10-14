# Pack p9 review (Codex gpt-6-astra, high)

Author and orchestrator: Claude Opus 5.5. Four passes: `dabdea00` (CHANGES/BLOCKED), `740c24f6` (CHANGES/BLOCKED), `369ab7c4` (CHANGES/BLOCKED), and the final head (APPROVE/LAUNCH-OK).


## Pass rj

# RJ: independent review of pack p9

The code needs changes before the paid measurement.
The stored replay reproduces, and p9 restores the R8-1 source records.
However, the coverage measure can report evidence that the pack does not contain.

Reviewed HEAD: `dabdea00dbf6b9d2c8c1dbfc42ff76f8f2ebf6a4`.
The p9 changes are `4b4fb9e2` and `dabdea00`.
I reviewed those changes against `13a1ddbb` and read the earlier p7/p8 evidence.
I made no paid call, started no server, and ran no launcher.
I changed only this output file.

## Findings by severity

### RJ-1 — P2: coverage crosses record boundaries and accepts partial values

Evidence: `eval/qa/evidence-pack.mjs:2380`, `:2388`, `:2390`, and `:2392`.

`listRecordShown` ends its search at the next identity key, not at the current object's boundary.
A later object's field can therefore count for the earlier object.
This contradicts the stated record-isolation guarantee.

I used source records `Alpha` and `Bravo`, each with `status: Live`.
The answer was `Alpha and Bravo are Live.`
This pack fragment has no status for Alpha:

```text
   span: {"name":"Alpha"},{"status":"Live","name":"Bravo"}
```

The measure nevertheless reports Alpha as shown.
It reports only Bravo as missing.
The status before Bravo's identity belongs to Bravo, but the measure assigns it to Alpha.

The same measure also accepts these fragments as complete:

```text
   span: {name: Alpha Other | status: Live}; {name: Bravo | status: Live}
   span: {name: Alpha | status: Live-preview}; {name: Bravo | status: Live}
   span: {"name":"Alpha","child":{"status":"Live"}},{"name":"Bravo","status":"Live"}
```

These fragments respectively substitute another name, another value, and a nested field.
The first record does not provide the required exact field in any example.
Each example returned `shown: 2, complete: true`.

Use record boundaries, field ownership, and complete scalar values for coverage.
Preserve source identity where the same name occurs in different records.
Add fixtures for both directions of field ordering, nested objects, and partial name/value matches.
Then regenerate the replay and its tables.

### RJ-2 — P2: selection limits remove required evidence from the coverage count

Evidence: `eval/qa/evidence-pack.mjs:2271`, `:2293`, `:2294`, and `:2417`.

`listClaimsFor` limits records before the coverage measure receives them.
It similarly limits claim groups and claim fields before measurement.
The resulting denominator excludes evidence that the selection omitted.

I created 25 source records, from `Project 00 Hub` through `Project 24 Hub`.
Each record had `status: Live`.
One answer sentence named all 25 records and stated that they were Live.
I supplied a pack containing only the first 24 records.
`entityListCoverage` returned `records: 24, shown: 24, complete: true`.
It did not report the missing `Project 24 Hub` record.

Keep the complete detected claim requirements separate from rendering limits.
Apply the limits when selecting units, then measure against all required records and fields.
Report omissions caused by each limit.
The existing 12-unit limit already follows this principle because it applies after claim detection.

### RJ-3 — P3: the baseline reuse condition names the wrong pack

Evidence: `.agents/rounds/2026-10-12-pack-p9/measurement-plan-p9.md:58` and `:60`.
Related code: `.agents/rounds/2026-10-12-pack-p9/analyze-rejudge-p9.mjs:95` and `:112`.

The plan requires the rebuilt p9 prompt to equal the reused p6 prompt for arm A.
That condition defeats the intended comparison between different packs.
The reading command does not enforce that condition for arm A.

For `S1a|q-defi-etherfuse-stablebonds`, I rebuilt both prompts.
The p6 prompt matches the stored baseline; the p9 prompt does not.
The replay correctly checks the rebuilt p6 prompt against the stored p6 prompt.

State separate conditions for each arm.
Arm A requires the rebuilt p6 prompt to match the stored p6 prompt.
Reused arm B requires the rebuilt p9 prompt to match the stored p8 prompt.
Identify the replay as the baseline verification command.

## Answers to the review questions

### 1. General design, R8-1, and p8 repairs

The selection rule is general.
I found no case ID or entity-specific branch in the p9 implementation.
The actual R8-1 pack contains all nine listed directory records with their correct status values.
It retains Aquarius and Soroswap TVL values, Comet `Inactive`, and the other records' distinct statuses.
This repairs the source omission identified by R8-1.
It does not resolve the candidate sentence's ambiguous scope.

The saved omission rows retain all 12 supported disputed claims under the existing diagnostic.
The four relevant fixture files also pass all 255 tests, including the earlier p8 fixtures.
These checks support preservation of the measured p8 repairs.
They do not establish preservation of every possible claim.

Five control rows lose seven answer probes against p8.
The reported control total increases from 270 missing probes to 277.
The design discloses this cost, including the row with no list-coverage gain.
That cost remains a limitation, rather than proof that all p8 support improves.

### 2. Replay, table, and false matches

I ran `replay-p9.mjs` directly and compared its complete parsed output with `replay-p9.json`.
The outputs match exactly after normalizing only `revisions.p9`.
All 96 stored packs and all 96 stored full prompts reproduce.
The per-row data and summary table therefore reproduce as written.

| Measure | p6 | p7 | p8 | p9 |
|---|---:|---:|---:|---:|
| Measured list records shown, denominator 63 | 19 | 8 | 12 | 62 |
| Measured disputed claims held, denominator 37 | 15 | 36 | 36 | 36 |
| Rows passing the combined evidence diagnostic | 21 | 26 | 26 | 30 |
| Omission-row supported claims held, denominator 12 | 2 | 11 | 12 | 12 |
| Control list records shown, denominator 437 | 180 | 115 | 131 | 434 |
| Control answer probes missing | 493 | 283 | 270 | 277 |

Reproduction does not validate the coverage definition.
RJ-1 and RJ-2 show false completeness results outside the current fixtures.
The phrase “every claim's evidence” also overstates the diagnostic's reach.
It checks detected lists and probes from disputed claims, rather than independently checking every claim.

Ordinary words do select unrelated fields at `eval/qa/evidence-pack.mjs:2258` and `:2266`.
For example, `Alpha and Bravo supply live numbers.` selects `status: Live`.
The real R8-1 row has the same issue in its later sentence about unavailable “live numbers”.
That sentence adds two record occurrences to the diagnostic count.
Thus, its reported 11 records represent nine distinct entities plus two repeated occurrences.
The earlier list unit already covers those occurrences, so this example adds no extra unit.
Other false field matches can consume budget, as the design acknowledges.

### 3. Stable prompts

All 187 stable rows produce identical full p6 and p9 prompt hashes.
There are zero differing rows.
Stable tags bypass the transcript evidence pack, which explains this result.
This verifies the saved stable inventory, not every possible stable input.

### 4. Fixture tests

I ran this command directly, without the paid evaluation wrapper:

```sh
node node_modules/vitest/vitest.mjs run test/evidence-pack-claim-support.test.mjs test/evidence-pack-per-operation.test.mjs test/qa-judge-evidence.test.mjs test/qa-verdict-consistency.test.mjs
```

Result: four files passed; 255 tests passed; exit 0.
`node eval/qa/judge.mjs --self-test-static` also passed with exit 0.

The new fixtures prove the R8-1 example, budget removal, label exclusion, and several negative cases.
They do not prove the general coverage guarantee.
The record-isolation fixture at `test/evidence-pack-claim-support.test.mjs:624` checks only one field-order direction.
The budget fixture at `:629` tests unit removal, rather than the final hard-clip path.
The unchanged-pack fixture at `:687` checks for no list unit, without comparing p8 bytes.
The replay supplies the stronger saved-row comparison.

### 5. Measurement plan

The six changed rows exactly match the replay's full-prompt differences:

- `S1a|q-defi-etherfuse-stablebonds`
- `S1b|q-edge-fresh-latest-blend-tvl`
- `S2a|q-asset-stablecoin-issuers-discovery`
- `S2a|q-defi-arbitrage-pathpayment-bots`
- `S2b|q-agent-identity-erc8004-stellar`
- `S2d|q-gap-leaderboard-project-not-builder`

The other 26 p9 prompts equal their recorded p8 prompts.
Reusing those observations is valid under the declared unchanged measurement conditions.
The earlier blocked result does not invalidate the recorded observations.
It also does not become an accepted result through reuse.

I independently checked all 36 historical p6/p7/p8 artifacts against their manifest hashes.
Their model, rubric, and panel match `claude-sonnet-5`, `v2.11`, and panel 3.
Their recorded before/after executable and environment hashes match the declared pins.
The current pinned binary also matches:

```text
c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937
```

The frozen launcher's declared environment produces the required environment hash:

```text
ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac
```

The 11 quoted R6 rule lines match the amendment after replacing `p9` with `p8`.
The R8-1 reading preserves the unresolved-scope blocker.
It also preserves the distinction between a source contradiction and the disputed unsupported-memory avoid item.
Those rules are sound.

The cost basis reproduces from the stored calls:

| Same six rows | Spend |
|---|---:|
| p6 | $1.8616692 |
| p7 | $1.8635434 |
| p8 | $1.7754404 |

The five file caps sum to $5.05.
The seven-call self-test cap adds $3.50, giving $8.55.
The expected range of about $2.06 to $2.15 agrees with the stated historical basis.
The self-test wrapper enforces its $0.50 call authorization.
The re-judge enforces each supplied file budget.
The $0.60 checkpoint remains a reported-cost stop rule, rather than a separate per-call authorization limit.

The default reading command returns `not-run`, with 26 reused rows and zero inconclusive rows.
The p8 stand-in returns `INCONCLUSIVE` for all six changed rows.
The reader checks the advertised pack, prompt, votes, costs, outcome, and postflight conditions.
It does not independently check model, rubric, executable pins, or the reviewed commit.
Those conditions still require the prescribed operator checks and post-run review.

The launcher has an empty `REVIEWED` value and exits before invoking the runner.
After that value is set, it checks HEAD and supplies the fixed identity pins and file budget.
I verified this code without executing the launcher, as the brief required.
The launcher does not itself enforce owner approval or successful completion of the preceding self-test.
The plan explicitly assigns those steps to the operator.

Do not spend before fixing RJ-1 and RJ-2 and rerunning the offline checks.
Refresh the changed-row set and cost plan if the repaired pack changes additional prompts.
Correct RJ-3 before recording the reviewed plan.

CODE: CHANGES: Repair record matching and preserve complete coverage requirements before applying selection limits.
PLAN: BLOCKED: Resolve the code findings, refresh the replay, and correct the baseline reuse condition before spend.


## Pass rj2

# RJ2: delta review of pack p9

The original counterexamples now pass, but two new counterexamples still produce false coverage.
The code and paid measurement remain blocked.

Reviewed HEAD: `740c24f62ef77f4e821cbc1b8a86889a8e24b7ca`.
I reviewed `d07fffc8`, `4bfcdb4d`, `89ff6313`, and `740c24f6` against `dabdea00`.
I read the report's review reconciliation and independently checked the changes.
I made no paid call, started no server, and ran no launcher.
I changed only this output file.

## Findings by severity

### RJ2-1 — P2: quoted prose counts as structured identity and field evidence

Evidence: `eval/qa/evidence-pack.mjs:2453`, `:2454`, and `:2479`.

`scopeFieldValues` searches every character of a scope with a regular expression.
It does not exclude matches inside another field's quoted value.
Consequently, example text can count as a real field or a complete record.

I used two source records with `name` values `Alpha` and `Bravo`.
Both source records had `status: Live`.
The candidate answer was `Alpha and Bravo are Live.`

This rendered fragment contains no status field for Alpha:

```text
   span: {"name":"Alpha","note":"status: Live; this is only an example"},{"name":"Bravo","status":"Live"}
```

The measure returns `shown: 2, complete: true`.
The word `Live` comes from the note, not Alpha's status field.

This second fragment has no Alpha identity field either:

```text
   span: {"note":"name: Alpha; status: Live; this is only an example"},{"name":"Bravo","status":"Live"}
```

It also returns `shown: 2, complete: true`.
Replacing the note with ordinary text restores the correct result: `shown: 1, complete: false`.

Read field tokens at the owning object's level.
Skip the complete values of unrelated fields when searching for another field.
Add both counterexamples as fixtures.
The measure must distinguish quoted example text from structured evidence.

### RJ2-2 — P2: Unicode offsets can expose nested fields as parent fields

Evidence: `eval/qa/evidence-pack.mjs:2423`, `:2437`, and `:2439`.

The scanner records JavaScript string offsets in UTF-16 code units.
`[...line.slice(from, to)]` creates an array indexed by Unicode code points.
The code then uses the original offsets to blank that array.
Characters outside the Basic Multilingual Plane make those offsets disagree.
The masking can leave a nested field visible in its parent's scope.

Using the same source records and candidate answer, I constructed this first rendered object:

```js
const first = {
  name: "Alpha",
  note: "🚀".repeat(20),
  child: { status: "Live" }
};
```

I serialized it with `JSON.stringify` and appended the complete Bravo record on the same span line.
Alpha has no direct status field.
The measure nevertheless returns `shown: 2, complete: true`.
Replacing the note with `"x".repeat(40)` returns `shown: 1, complete: false`.

Use the same offset unit throughout scanning and masking.
Alternatively, construct scopes from string slices with unchanged offsets.
Add a Unicode fixture that requires the parent status to remain missing.

## Previous findings

| Finding | Result | Independent evidence |
|---|---|---|
| RJ-1: record boundaries and exact values | Partly resolved | All four original fragments now report Alpha missing. RJ2-1 and RJ2-2 still violate field ownership. |
| RJ-2: limits reduce the denominator | Resolved | The 25-record example reports 25 required, 24 shown, and the missing final record. |
| RJ-3: wrong baseline prompt comparison | Resolved | The plan separates both arms. The reader rebuilds and checks the p6 baseline. |

For RJ-2, I also checked five required fields and four independent record groups.
All five fields remain requirements; a pack containing only four reports the fifth field missing.
All four groups remain requirements despite the three-group rendering limit.
`entityListLimits` identifies the omitted fields and fourth-group records.
The limits now apply during selection at `eval/qa/evidence-pack.mjs:2350`, `:2354`, and `:2355`.

For RJ-3, I changed one cached baseline hash in memory without editing any artifact.
I selected the changed S1a row, which has no new p9 panel yet.
The reader returned `INCONCLUSIVE` and identified the baseline mismatch.
The new ordering correctly prevents `not-run` from hiding that failure.
The relevant checks are at `analyze-rejudge-p9.mjs:104` and `:122` in the p9 round folder.

The clipped-opening-string and nested-fragment fixtures pass.
The new hard-clip fixture also passes.
Those fixes do not address the quoted-field and Unicode counterexamples above.

## Replay and stored evidence

I ran `replay-p9.mjs` directly and compared its complete parsed output with the refreshed `replay-p9.json`.
The outputs match exactly after normalizing only `revisions.p9`.
All 96 historical packs and all 96 historical prompts reproduce.
All 187 stable rows retain identical full p6 and p9 prompt hashes.

| Measure | p6 | p7 | p8 | p9 |
|---|---:|---:|---:|---:|
| Measured list records shown, denominator 70 | 19 | 7 | 11 | 65 |
| Measured disputed claims held, denominator 37 | 15 | 36 | 36 | 36 |
| Rows with detected evidence complete | 21 | 26 | 26 | 28 |
| Omission-row supported claims held, denominator 12 | 2 | 11 | 12 | 12 |
| Control list records shown, denominator 463 | 172 | 108 | 124 | 429 |
| Control answer probes missing | 493 | 283 | 270 | 278 |

The R8-1 row retains its nine distinct entities and two repeated record occurrences.
Its coverage remains 11 of 11 under the measure.
The saved p8 omission repairs remain intact under the disputed-claim diagnostic.
The control inventory still contains 270 rows.

The changed-row set remains exactly the six declared rows:

- `S1a|q-defi-etherfuse-stablebonds`
- `S1b|q-edge-fresh-latest-blend-tvl`
- `S2a|q-asset-stablecoin-issuers-discovery`
- `S2a|q-defi-arbitrage-pathpayment-bots`
- `S2b|q-agent-identity-erc8004-stellar`
- `S2d|q-gap-leaderboard-project-not-builder`

The remaining 26 p9 prompts equal their stored p8 prompts.
Reproduction confirms the saved results, but it does not validate the defective coverage parser.

## Tests and reading command

I ran the touched claim-support tests and the related pack and judge fixtures directly:

```sh
node node_modules/vitest/vitest.mjs run test/evidence-pack-claim-support.test.mjs test/evidence-pack-per-operation.test.mjs test/qa-judge-evidence.test.mjs test/qa-verdict-consistency.test.mjs
```

Result: four files passed; 267 tests passed; exit 0.
`node eval/qa/judge.mjs --self-test-static` passed with exit 0.
`git diff --check dabdea00...HEAD` passed.
The additional counterexamples ran as read-only Node probes against the public coverage function.

The default reading command returns `not-run`, with 26 reused rows and zero inconclusive rows.
The p8 stand-in returns `INCONCLUSIVE` for all six changed rows.
The baseline mismatch probe also returns `INCONCLUSIVE`, as required.

## Measurement plan

RJ-3 is corrected in both the plan and the reading command.
The unchanged six-row selection still supports 18 new panel calls plus seven self-test calls.
The stated cost basis and $8.55 cap remain unchanged from the independently checked RJ figures.
The delta does not change the executable pins, frozen environment, launcher, R6 rule, or R8-1 interpretation rule.

The revised Stage 1 text now accepts the documented 5-of-7 Etherfuse coverage.
This narrows the earlier complete-list requirement.
The plan discloses the two records that lose fields to the four-field limit.
A successful measurement under this rule cannot establish complete coverage of all detected list requirements.
The report must retain that limitation, including the other incomplete measured rows.

The current draft still requires independent approval before spend.
RJ2-1 and RJ2-2 prevent that approval because they undermine its coverage evidence.
Repair the parser, add the counterexample fixtures, and regenerate the replay before another launch review.
Recalculate the changed-row selection and budget if those repairs change additional prompts.

CODE: CHANGES: Exclude quoted prose from field matching and use consistent Unicode offsets when masking nested objects.
PLAN: BLOCKED: Repair the coverage parser and refresh the offline evidence before spend.


## Pass rj3

# RJ3: second delta review of pack p9

The changes resolve both RJ2 findings.
However, the new parser accepts unfinished quoted values as complete evidence.
The code needs another correction before the paid measurement.

Reviewed HEAD: `369ab7c4b5ee79120e5f5f0dbe87aa41cd876e38`.
Reviewed commits: `e0dd1953` and `369ab7c4`, against `740c24f6`.
I read the report's “Review reconciliation 2” section and independently checked its claims.
I made no paid call, started no server, and ran no launcher.
I changed only this output file.

## Findings by severity

### RJ3-1 — P2: unfinished quoted tokens count as complete identities and values

Evidence: `eval/qa/evidence-pack.mjs:2442` and `:2488`.

`readQuoted` correctly returns `clipped: true` when the closing quote is missing.
Its caller ignores that flag and adds the partial value to the scope.
The coverage check then treats that value as complete.

I used source records `Alpha` and `Bravo`, each with `status: Live`.
The candidate answer was `Alpha and Bravo are Live.`
Both fragments below return `shown: 2, complete: true`:

```text
   span: {"name":"Bravo","status":"Live"},{"name":"Alpha","status":"Live
   span: {"name":"Bravo","status":"Live"},{"status":"Live","name":"Alpha
```

The first fragment does not establish the complete status value.
The second does not establish the complete identity value.
The unfinished strings could continue as `Live-preview` or `Alpha Other`.
Those longer versions correctly report Alpha missing, demonstrating the prefix-match problem.

This reintroduces false completeness at a clipping boundary.
It conflicts with the stated rule that a quoted value ends at its closing quote.
Skip a quoted identity or claim field when `clipped` is true.
Keep any other complete fields from that object available for comparison.
Add separate fixtures for unfinished identities and unfinished claim values.

The stored replay still reproduces.
These additional probes demonstrate a parser defect; they do not establish a changed stored judgment.

### RJ3-2 — P3: quoted JSON escapes are not decoded

Evidence: `eval/qa/evidence-pack.mjs:2432` and `:2433`.

The escape branch removes the backslash and copies the next character.
It does not decode JSON escapes such as `\u0041`.
Consequently, equivalent JSON strings can produce different coverage results.

With the same source records and candidate, these complete fragments report Alpha missing:

```text
   span: {"name":"Bravo","status":"Live"},{"name":"\u0041lpha","status":"Live"}
   span: {"name":"Bravo","status":"Live"},{"name":"Alpha","status":"Li\u0076e"}
```

Both contain the required Alpha record after normal JSON decoding.
The first reports the identity missing; the second reports the status missing.
Using literal `Alpha` and `Live` reports complete coverage.

Decode complete double-quoted JSON tokens according to JSON string rules.
Test escaped identities, escaped claim values, and escaped whitespace.
This finding causes under-counting in these examples.
RJ3-1 is the blocking false-completeness finding.

## Verification of earlier findings

| Finding | Result | Independent check |
|---|---|---|
| RJ2-1: quoted prose becomes a field | Resolved | Both original fragments now report Alpha missing. |
| RJ2-2: Unicode shifts nested-object masks | Resolved | Nested status remains missing after 20 rocket characters. Direct status still counts. |
| RJ-1: record ownership and exact values | Original examples repaired | Earlier object, nested object, longer name, and longer value examples remain covered by passing fixtures. RJ3-1 exposes a new boundary failure. |
| RJ-2: selection limits shrink requirements | Remains resolved | Requirements still precede selection limits; the denominator fixtures pass. |
| RJ-3: baseline prompt condition | Remains resolved | The unchanged reader checks the rebuilt p6 baseline and the reused p8 prompts separately. |

The parser now reads quoted field values as complete tokens before scanning the next field.
That prevents the two quoted-prose examples from supplying fake identity or status fields.
The parser also removes the mixed code-point and UTF-16 masking operation.
Its object stack gives nested fields their own scope.
The source-item wrapper fixture passes, including the older nested-quote field format.

I also checked quoted text inside an array.
The parser correctly excludes that text from the parent's status fields.

## Replay and evidence checks

I ran `replay-p9.mjs` directly and compared its complete parsed output with the committed output.
They match exactly after normalizing only `revisions.p9`.
All 96 stored packs and all 96 stored full prompts reproduce.
All 187 stable rows retain identical full p6 and p9 prompt hashes.

| Measure | p6 | p7 | p8 | p9 |
|---|---:|---:|---:|---:|
| Measured list records shown, denominator 70 | 19 | 7 | 11 | 65 |
| Measured disputed claims held, denominator 37 | 15 | 36 | 36 | 36 |
| Rows with detected evidence complete | 21 | 26 | 26 | 28 |
| Omission-row supported claims held, denominator 12 | 2 | 11 | 12 | 12 |
| Control list records shown, denominator 463 | 174 | 108 | 124 | 429 |
| Control answer probes missing | 493 | 283 | 270 | 278 |

The R8-1 row retains 11 record occurrences across nine distinct entities.
The p8 omission repairs retain all 12 supported disputed claims under the existing diagnostic.
The six changed rows and 26 reused p8 prompts remain unchanged.
The saved p9 pack and prompt hashes also remain unchanged from RJ2.

I inspected the two additional p6 control matches independently:

- `ZARZ`, in `2026-10-07T16-51-53-variantA.json|q-asset-stablecoin-issuers-discovery`.
- `BRLT`, in `2026-10-11T09-48-55-variantA.json|q-eco-stablecoins-on-stellar`.

The ZARZ snippet contains its complete `company` and `peg` fields.
The BRLT snippet contains its complete `peg`, `company`, and `marketCapUSD` fields.
Both increases reflect visible evidence, rather than the unfinished-token problem above.

## Tests and reading command

I ran the touched tests and related pack and judge fixtures directly:

```sh
node node_modules/vitest/vitest.mjs run test/evidence-pack-claim-support.test.mjs test/evidence-pack-per-operation.test.mjs test/qa-judge-evidence.test.mjs test/qa-verdict-consistency.test.mjs
```

Result: four files passed; 270 tests passed; exit 0.
`node eval/qa/judge.mjs --self-test-static` passed with exit 0.
`git diff --check 740c24f6...HEAD` passed.
The additional parser probes ran directly against `entityListCoverage`, without changing source files.

The default reading command reproduces `rejudge-summary-p9-notrun.json` byte for byte.
It reports `not-run`, 26 reused rows, and zero inconclusive rows.
The p8 stand-in reproduces `rejudge-summary-p9-standin.json` byte for byte.
It reports `INCONCLUSIVE` for all six changed rows.

## Measurement plan

The delta changes only the plan's replay revision reference.
The selected six rows, 25 total calls, expected cost, and $8.55 cap remain unchanged.
The R6 rule, R8-1 scope rule, identity pins, and launcher remain unchanged.
The known 5-of-7 Stage 1 coverage limitation also remains explicit.
A successful measurement still cannot establish complete coverage of all detected list requirements.

The previous findings are reconciled, but RJ3-1 prevents launch approval.
Reject unfinished quoted tokens, correct JSON escape decoding, and add the corresponding fixtures.
Then refresh the replay and confirm whether any prompt or selected row changes.
No additional paid evidence is needed to verify these parser corrections.

CODE: CHANGES: Reject unfinished quoted tokens and decode complete JSON string escapes before coverage comparisons.
PLAN: BLOCKED: Correct the quoted-token parser and refresh the offline evidence before spend.


## Pass rj4

# RJ4: third delta review of pack p9

The changes resolve RJ3-1 and RJ3-2.
I found no new blocking defect in the reviewed changes.
The code and pre-spend plan pass this review.

Reviewed HEAD: `59f5490a8d07de109f88412bb11fab3b24f8d8cd`.
Reviewed commits: `05e520fc` and `59f5490a`, against `369ab7c4`.
I read “Review reconciliation 3” and independently checked its claims.
I made no paid call, started no server, and ran no launcher.
I changed only this output file.

## Findings and reconciliation

No new blocking findings.

**RJ3-1 — Resolved.**
`readQuoted` returns an empty value and `clipped: true` when the closing quote is missing.
The caller now excludes that field at `eval/qa/evidence-pack.mjs:2500`.
Both original unfinished-token examples correctly report Alpha missing.
Complete identity and status fields still count when an unrelated final token is unfinished.
The fixtures at `test/evidence-pack-claim-support.test.mjs:733`, `:737`, and `:741` cover those cases.

**RJ3-2 — Resolved.**
Complete double-quoted tokens use `JSON.parse` at `eval/qa/evidence-pack.mjs:2448`.
Quoted keys use the same decoder at `:2494`.
The escaped identity, escaped status, and escaped whitespace examples now match their decoded source values.
I also checked escaped field names independently.
The committed fixture starts at `test/evidence-pack-claim-support.test.mjs:745`.

The earlier quoted-prose and Unicode ownership repairs remain intact.
The earlier record-boundary, exact-value, rendering-limit, and baseline-reuse fixtures also pass.
The changes add no case-specific selection rule.

## Additional parser checks

I ran eight direct regression and extension checks against `entityListCoverage`.
They cover unfinished identities, unfinished values, complete neighboring fields, escaped keys, quoted prose, and nested Unicode text.
All eight passed.

I also ran 340 generated checks against valid JSON records.
These checks varied identity text, field order, string escapes, Unicode, numbers, and booleans.
Complete direct fields counted in every case.
Nested status fields and quoted example text never supplied the parent's missing status.
These checks ran in memory and changed no source file.

The parser remains specific to the supported evidence formats.
Its fallback for invalid JSON tokens does not establish strict JSON validation.
The documented limitation for an unmarked cut through an unquoted value also remains.
The pack's own truncation functions add cut markers.
I found no new blocking failure in the reviewed output paths.

## Replay

I ran `replay-p9.mjs` directly and compared its complete parsed output with the committed replay.
The outputs match exactly after normalizing only `revisions.p9`.
The committed replay also differs from the RJ3 version only in that revision field.

- All 96 historical packs reproduce.
- All 96 historical full prompts reproduce.
- All 187 stable rows retain identical full p6 and p9 prompt hashes.
- The six changed rows remain unchanged.
- The other 26 p9 prompts equal their stored p8 prompts.
- The saved p9 pack and prompt hashes remain unchanged.

| Measure | p6 | p7 | p8 | p9 |
|---|---:|---:|---:|---:|
| Measured list records shown, denominator 70 | 19 | 7 | 11 | 65 |
| Measured disputed claims held, denominator 37 | 15 | 36 | 36 | 36 |
| Rows with detected evidence complete | 21 | 26 | 26 | 28 |
| Omission-row supported claims held, denominator 12 | 2 | 11 | 12 | 12 |
| Control list records shown, denominator 463 | 174 | 108 | 124 | 429 |
| Control answer probes missing | 493 | 283 | 270 | 278 |

The R8-1 row retains all nine distinct entities and two repeated record occurrences.
Its diagnostic remains 11 of 11.
The p8 omission repairs retain all 12 supported disputed claims under the existing diagnostic.

## Tests and reading command

I ran the touched tests and related pack and judge fixtures directly:

```sh
node node_modules/vitest/vitest.mjs run test/evidence-pack-claim-support.test.mjs test/evidence-pack-per-operation.test.mjs test/qa-judge-evidence.test.mjs test/qa-verdict-consistency.test.mjs
```

Result: four files passed; 274 tests passed; exit 0.
`node eval/qa/judge.mjs --self-test-static` passed with exit 0.
`git diff --check 369ab7c4...HEAD` passed.

The default reading command reproduces `rejudge-summary-p9-notrun.json` byte for byte.
It reports `not-run`, 26 reused rows, and zero inconclusive rows.
The p8 stand-in reproduces `rejudge-summary-p9-standin.json` byte for byte.
It reports `INCONCLUSIVE` for all six changed rows.

## Plan disposition and limits

The plan still selects six rows for 18 new panel calls and seven self-test calls.
Its expected cost remains about $2.06 to $2.15, with a total cap of $8.55.
The unchanged row selection preserves the previously checked cost basis.
The R6 rule, R8-1 scope rule, baseline reuse conditions, and launcher remain unchanged.

I rechecked the current pinned executable hash.
It matches `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937`.
The declared frozen environment produces `ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac`.
The launcher still refuses execution while `REVIEWED` is empty.

The plan explicitly accepts incomplete detected-list coverage in three measured rows.
Stage 1 retains its documented 5-of-7 Etherfuse requirement.
The control diagnostic still loses eight answer probes against p8.
These limitations must remain in the result; this review does not establish universal coverage or accuracy.

The R8-1 sentence scope remains unresolved by the offline evidence.
The paid measurement must apply its predeclared rule and retain every vote.
The required post-run independent review remains outstanding.

This verdict clears the code review and pre-spend plan review for the reviewed HEAD.
It authorizes no paid call, merge, or deployment.
Owner spend approval, recording the reviewed commit, and the prescribed run-day preflight remain required.

CODE: APPROVE
PLAN: LAUNCH-OK
