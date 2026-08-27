# Measurement harness build report

## Result

The mission is complete on `lane/measure-harness-20260825`.

Commit: `2260ec6cf5beeaa0dd0687e48eca98af3323846d`

Commit message: `feat(eval): harden QA measurement harness`

The worktree is clean after the commit.

## Files touched

- `eval/qa/judge.mjs`
- `eval/qa/re-judge.mjs`
- `eval/qa/run-qa.mjs`
- `eval/qa/verdict-consistency.mjs`
- `test/qa-judge-stored.test.mjs`
- `test/qa-measure-harness.test.mjs`
- `test/qa-verdict-consistency.test.mjs`
- `test/re-judge.test.ts`

No unowned file entered the commit.

The `agentPrompt` string in `eval/qa/run-qa.mjs` has no changes.

## Change summary

### R8 time-consistent rejudging

`re-judge.mjs` now uses `meta.sourceIdentity.runnerRevision` as the default cases revision.

An explicit `--cases-ref` still overrides the recorded revision.

The rejudge checks selected live and scheduled golden dates against `meta.finishedAt`.

The check reads `truth.asOf`, `truth.verified.date`, and `truth.verificationDate`.

Newer golden dates cause a clear refusal before any judge call.

`--allow-golden-drift` provides the explicit escape hatch.

The output records the golden-time guard and its decision.

### R9 ungradeable-answer guard

`judge.mjs` now owns the shared `hasSuccessfulAnswer` helper.

Both runner paths and the rejudge path use this helper.

The rejudge skips rows without a successful answer.

The skipped row keeps its original error verdict.

The rejudge records `skipped.reason` as `unsuccessful-answer`.

The skipped row causes no judge cost.

### A6 trap precedence

The consistency engine now detects a successful trap refusal with a downgraded score.

The rule requires a trap tag and a correct core answer.

The rule also requires empty wrong claims and empty avoid matches.

The rationale must confirm refusal, rejection, clarification, or another safe trap response.

The stable violation name is `successful-trap-refusal-not-correct`.

The judge prompt and rubric text have no changes.

### A8 reporting

The runner now writes `halfCreditShare` and `strictCorrectShare` into result metadata.

It also writes `coreAnswerCorrectShare` and `coreAnswerNullCount`.

Judge errors do not enter the core-answer share denominator.

The runner writes `meanContinuousCoverage` and `continuousCoverageRowCount`.

Coverage excludes cases with zero key facts.

Coverage also excludes rows without a grade.

The console prints all shares on one measurement line.

The stored-judge path writes the same metadata and output.

### A1 opt-in judge panel

`--judge-panel 2` and `--judge-panel 3` now work in both runner judge paths.

The rejudge path supports the same flag.

The default remains one judge call.

The one-call path returns the original verdict without a shape change.

A panel uses a score majority and unions all `missingFacts` values.

A two-call tie selects the worse score.

This rule prevents a promotion without a majority.

Disagreement metadata records `panelDisagreement`, `panelScores`, and `panelTie`.

Panel metadata also records panel size and cost-report counts.

Cost accounting counts every panel call and sums reported costs.

## New test coverage

Nine focused tests or test cases cover the new behavior.

- R8 tests cover the recorded revision and the golden-drift refusal.
- R9 tests cover the skip and original error preservation.
- A6 tests cover the trap-refusal consistency violation.
- A8 tests cover metric math, null counts, and zero denominators.
- A1 tests cover a majority, a tie, disagreement metadata, and one-call compatibility.
- A8 integration assertions confirm the JSON metadata fields.

The focused suite passed 4 files and 79 tests.

## Gate outputs

Tool versions:

- Node.js: `v24.13.0`
- npm: `11.11.0`
- TypeScript: `7.0.2`
- Vitest: `4.1.11`
- Wrangler: `4.124.0`

Required gates:

- `npm run typecheck`: passed with zero errors.
- `npm test`: passed 85 files and 1,242 tests.
- `npm run build`: passed.
- The build upload was 6,938.90 KiB.
- The compressed build was 1,392.54 KiB.
- `npm run secrets:scan -- --tree`: passed with no leaks.
- The commit hook scanned 23,264 bytes with no leaks.

The fresh worktree needed the documented local type-generation setup.

I created the ignored `.dev.vars` placeholder from `ci.yml`.

I ran `npm run typegen` to generate the ignored `env.d.ts` file.

Neither ignored file entered the commit.

## Known limitations

The panel calls the same judge model for each vote.

The panel runs calls in sequence.

The judge CLI still provides no seed or temperature control.

The two-call tie rule is conservative and can lower a boundary grade.

Wrangler could not write its user-level debug log inside the sandbox.

Type generation and the build still completed with exit status 0.

## Independent review fixes

Review-fix commit: `033ccd9ca0dc7726c07774bbae331a61bca88ebb`

Commit message: `fix(eval): address measurement review findings`

This section records the changes after the independent `CHANGES-REQUESTED` review.

### M-B1 legacy agent errors

The rejudge now recognizes legacy agent-error verdicts without an `agent.failure` field.

The check requires `score: "error"` and a null or absent `promptSha256`.

It also requires no string `judgeScore` value.

These rows keep their original error verdict and skip the judge call.

Cost accounting also excludes these skipped rows.

The regression test uses the real `q-n3-ssrf-metadata-endpoint` legacy row shape.

A direct probe against the 2026-08-14 artifact made zero judge calls.

The probe kept the `error` score and recorded `unsuccessful-answer`.

### M-B2 working-tree cases mode

`--cases-ref worktree` now selects current compiled cases without a revision pin.

The command usage and module documentation describe this mode.

The identity guard reports mismatches without the revision-pinned hard failure.

The artifact and dry-run guard record `casesMode: "worktree"`.

The normal `nonIdentical` label and `--allow-non-identical` policy remain active.

The golden-time guard runs before any judge call in this mode.

`--allow-golden-drift` remains the explicit golden-time escape hatch.

The updated R8 test changes the working-tree golden after the recorded snapshot.

It verifies an identity mismatch, a time refusal, and the explicit escape hatch.

A real artifact probe refused the newer `q-scf-open-rfps` golden.

The allowed dry run reported both the identity mismatch and the 2026-08-18 golden dates.

### Advisory fixes

Judge-panel error votes now abstain when one or more graded votes remain.

A panel with only error votes still returns `error`.

A graded tie still selects the worse graded score.

The trap rationale check now requires a refusal verb with an object.

It no longer treats general uses of `declined` or `rejected` as refusal evidence.

It exempts rationales that say the candidate omitted the legitimate part.

The old `coreAnswerNullCount` field is now `gradedCoreAnswerNullCount`.

The renamed field counts null values only in graded rows.

An absent stored `meta.judgePanel` now means a panel size of `1`.

A partial single-call file cannot resume with a larger panel.

Absolute main-checkout case paths now map through their `eval/qa/` suffix.

Both revision-pinned and working-tree reads use the current worktree after mapping.

### Review-fix verification

- Focused tests: 4 files passed and 86 tests passed.
- `npm run typecheck`: passed with zero errors.
- `npm test`: 85 files passed and 1,249 tests passed.
- `npm run build`: passed.
- The build upload was 6,938.90 KiB.
- The compressed build was 1,392.54 KiB.
- `npm run secrets:scan -- --tree`: passed with no leaks.
- The review-fix commit hook scanned 9,903 bytes with no leaks.

The review-fix commit changes only the eight owned QA files.

The `agentPrompt` string remains unchanged.
