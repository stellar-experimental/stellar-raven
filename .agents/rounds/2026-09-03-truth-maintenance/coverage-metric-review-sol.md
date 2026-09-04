# Coverage metric independent review

## Verdict

**CHANGES-REQUIRED**

Reviewer: Sol high.

Reviewed commit: `d1fddb9f32ce77532d719a1ab9c6254378ad023f`.

Parent commit: `80aaf52d81c032a44bbd844e9d1f6e6c94aab12b`.

Branch: `codex/tm-coverage-metric`.

I reviewed the implementation diff before I read the author report. I made no paid calls.

## Required findings

### R1. The stored-judge rewrite keeps both retired fields

`judgeStoredResults` removes only the five keys returned by the new `qaMeasurementMetrics` function.
It does not remove `meanContinuousCoverage` or `continuousCoverageRowCount` from existing metadata.

I copied the named artifact and ran the stored-judge finalization path. The injected judge throws on any call.
The path made zero judge calls and stamped `meta.judgeStored`.
It kept `meanContinuousCoverage: 0.5601952380952382` and `continuousCoverageRowCount: 500`.
It also added all five replacement fields.

This result creates a newly written artifact with both metric contracts. The invalid numeric value remains easy to quote.
The author report describes only a null and zero residual from an old `--no-judge` artifact.
The same path also preserves the named artifact's invalid numeric value.

Required repair:

- Delete both retired keys in `writeState` before each stored-judge write.
- Add a stored fixture that starts with both retired keys.
- Assert their absence after a zero-call finalization.
- Assert their absence when `aggregatesSuppressed` is true.

This repair is narrow and forward-only. It changes only artifacts that the new stored-judge code rewrites.
Untouched historical artifacts keep their original bytes and remain readable.

### R2. The retirement date text excludes the named defective artifact

`eval/qa/README.md` says records dated before `2026-09-04` can show the retired value.
The named defective artifact is dated `2026-09-04T05-40-51`.
The comment in `test/qa-paired-verdict.test.mjs` uses the same date boundary.

Required repair:

- Describe artifacts produced before this repair, not artifacts dated before `2026-09-04`.
- Name the affected `2026-09-04` arm when useful.

## Defect reproduction

Artifact:
`/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json`

SHA-256:
`e629666bf476244d350840069094a8a579757724c101830d6d6727685b5904f7`

Independent results:

| Check | Result |
| --- | ---: |
| Rows | 500 |
| Stored mean | `0.5601952380952382` |
| Recomputed mean | `0.5601952380952382` |
| Negative rows | 49 |
| Negative panel rows | 49 |
| `q-jutsu-what-is-a-memo` key facts | 2 |
| `q-jutsu-what-is-a-memo` unioned missing facts | 3 |
| `q-jutsu-what-is-a-memo` coverage | `-0.5` |
| `q-jutsu-what-is-a-memo` panel size | 3 |

The negative values are real calculation results. They are not display or rounding defects.
The panel joins prose findings, so the list is not a key-fact index.

## Repair scope assessment

Removing both fields is the narrowest truthful design repair. A clamp would hide the invalid data model.
A paraphrase matcher would add a new judge without a measured contract.
A schema union would still not map prose entries to golden facts.

The implementation removes the calculation and its `compiledCases` dependency. That part is narrow.
It keeps the five valid grade-count metrics unchanged.
It also removes the retired metric from both console paths.

The stored-judge cleanup in R1 remains necessary. No wider metric redesign is necessary.

## Caller and compatibility review

I traced every `qaMeasurementMetrics` caller.

| Area | Result |
| --- | --- |
| Collection aggregate | Uses only judged active rows. It stamps only the five current fields. |
| Stored-judge write | Computes the five current fields. It fails to delete the two retired fields. |
| Stored-judge return | Returns only the five current fields. |
| Collection return | Returns only the five current fields. |
| Stored-judge console | Prints only the five current fields. |
| Collection console | Prints only the five current fields. |

The paired tuple does not include either retired field. The paired compatibility test passed with asymmetric old keys.
The stored result schema remains `qa-agent-result-v4`.
That schema protects the row failure and usage shape, not optional aggregate metadata.
No repository JSON schema promises either retired field.

The following readers ignore both retired fields:

- `eval/qa/paired-verdict.mjs`
- `eval/qa/compare-architecture-ab.mjs`
- `eval/qa/re-judge.mjs`
- `eval/qa/judge-stability.mjs`
- `eval/qa/combine-ab-shards.mjs`

Historical artifacts remain valid JSON. Current readers use rows, identity metadata, costs, or explicit tuple fields.
I found no hidden repository consumer for either retired field.

The dated research records can keep the old values as history. The current README correctly marks those values invalid.
R2 must repair the incorrect date boundary.

## Test assessment

The new metric tests cover negative values, panel unions, repeated paraphrases, overcounting, and empty rows.
They also cover the five replacement metrics and the console line.

The paired test covers old-key compatibility. The stored-judge test covers a new artifact without old keys.
It does not use a fixture that already contains the retired keys. That omission permits R1.

## Commands and exact results

```text
git status --short --branch
```

Result: `## codex/tm-coverage-metric`. The worktree was clean.

```text
git show -s --format='commit=%H%nparent=%P%nauthor=%an <%ae>%nauthorDate=%aI%nsubject=%s' d1fddb9
git show --stat --oneline --decorate --no-renames d1fddb9
git diff d1fddb9^ d1fddb9 -- . ':(exclude).agents/rounds/**'
```

Result: I reviewed five implementation and documentation files before the author report.

```text
shasum -a 256 /private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json
```

Result: `e629666bf476244d350840069094a8a579757724c101830d6d6727685b5904f7`.

```text
node --input-type=module -e 'import { readFileSync } from "node:fs"; const [artifactPath,casesPath]=process.argv.slice(1); const artifact=JSON.parse(readFileSync(artifactPath,"utf8")); const cases=JSON.parse(readFileSync(casesPath,"utf8")); const byId=new Map(cases.cases.map((item)=>[item.id,item])); const values=artifact.rows.map((row)=>{const denominator=byId.get(row.id).golden.keyFacts.length; return 1-(row.verdict.missingFacts?.length??0)/denominator;}); const negative=artifact.rows.filter((_row,index)=>values[index]<0); const memoIndex=artifact.rows.findIndex((row)=>row.id==="q-jutsu-what-is-a-memo"); console.log(JSON.stringify({rowCount:values.length,storedMean:artifact.meta.meanContinuousCoverage,recomputedMean:values.reduce((sum,value)=>sum+value,0)/values.length,storedRowCount:artifact.meta.continuousCoverageRowCount,negativeCount:negative.length,negativePanelCount:negative.filter((row)=>row.verdict.meta?.judgeTierUsed==="panel").length,memo:{value:values[memoIndex],keyFacts:byId.get("q-jutsu-what-is-a-memo").golden.keyFacts.length,missingFacts:artifact.rows[memoIndex].verdict.missingFacts.length,panelSize:artifact.rows[memoIndex].verdict.meta?.panelSize}},null,2));' /private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json eval/qa/cases.json
```

Result: 500 rows, 49 negative rows, 49 negative panel rows, and the exact stored mean.

```text
cp /private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json .review-stored-artifact.json
node --input-type=module -e 'import { readFileSync } from "node:fs"; import { judgeStoredResults, prepareJudgeStabilityRegister } from "./eval/qa/run-qa.mjs"; const file = ".review-stored-artifact.json"; const stabilityRegister = prepareJudgeStabilityRegister({ pinnedPath: "/private/tmp/stellar-raven-tm-paired-stability.json", log: () => {} }); let judgeCalls = 0; const result = await judgeStoredResults(file, { judgeModel: "claude-sonnet-5", judgePanel: 1, stabilityRegister, judge: async () => { judgeCalls += 1; throw new Error("unexpected paid judge path"); }, log: () => {} }); const written = JSON.parse(readFileSync(file, "utf8")); console.log(JSON.stringify({ judgedCount: result.judgedCount, judgeCalls, judgeStoredStamped: Boolean(written.meta.judgeStored), meanContinuousCoverage: written.meta.meanContinuousCoverage, continuousCoverageRowCount: written.meta.continuousCoverageRowCount, currentMetricKeys: ["halfCreditShare","strictCorrectShare","coreAnswerCorrectShare","gradedCoreAnswerNullCount","coreAnswerVerdictCount"].filter((key) => Object.hasOwn(written.meta, key)) }, null, 2));'
rm .review-stored-artifact.json
```

Result: `judgedCount: 0`, `judgeCalls: 0`, and `judgeStoredStamped: true`.
Both retired fields remained. All five current fields were also present.

```text
rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' 'meanContinuousCoverage|continuousCoverageRowCount|mean continuous coverage|continuous coverage|qaMeasurementMetrics|formatMeasurementMetrics' .
```

Result: no hidden implementation consumer used either retired field.

```text
npx vitest run test/qa-measure-harness.test.mjs test/qa-judge-stored.test.mjs test/qa-paired-verdict.test.mjs test/qa-harness-preconditions.test.mjs
```

Result: 4 files passed. All 191 tests passed.

```text
npm run typecheck
```

Result: exit 0.

```text
npm run eval:qa:paired:validate
```

Result: exit 0.

```text
npm test
```

Result: 103 files passed. All 1,776 tests passed.

```text
npm run build
```

Result: exit 0. Wrangler completed the dry-run build.

```text
git diff --check
git diff d1fddb9^ d1fddb9 --check
git diff --cached --check
```

Result: all three commands returned exit 0.

```text
npm run secrets:scan -- --tree
```

Result: exit 0. The repository secret scan and `gitleaks` found no leak.

## Risks

- An external unversioned consumer can depend on the retired keys. The repository has no such schema promise.
- Old artifacts keep invalid values. Readers must not compare or quote those values.
- The stored-judge in-place rewrite changes metadata. Its original source hash preserves the prior artifact identity.
- The QA implementation hash changes with this repair. Both paid arms must use the same final runner revision.

## Blockers

None.
