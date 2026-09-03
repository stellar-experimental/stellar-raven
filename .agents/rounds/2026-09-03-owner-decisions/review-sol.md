# Independent completion review

Reviewer: Sol, independent from the Terra implementation author and the root orchestrator.
Base commit: `560ab73c3776ed8a4b00483432131604f8f8b349`
Date: 2026-09-03

## Findings

### Medium

1. The v2 self-test does not pin all contract provenance.

   The contracts declare `predecessor` and `labelReview` provenance at
   `eval/protocol-history-cases-v2.json:9` and `eval/protocol-history-cases-v2.json:10`.
   The blind contract declares the same fields at
   `eval/protocol-history-blind-cases-v2.json:9` and
   `eval/protocol-history-blind-cases-v2.json:10`.

   The self-test checks only `ownerDecision` and `caseContentDigest` at
   `eval/self-test.mjs:456` and `eval/self-test.mjs:464`.
   It does not check either required source field.
   A change or removal of these source fields still passes `npm run eval:selftest`.
   This result does not satisfy the required provenance pin.

   Add exact assertions for `contractProvenance.predecessor` and
   `contractProvenance.labelReview` for both v2 contracts.

### High

None.

### Low

None.

## Verified requirements

- Both v1 files match their base-commit Git object IDs.
- All 19 v1 positive cases remain exact and ordered required cases.
- The v2 contracts contain 19 required, nine forbidden, and four neutral cases.
- The four neutral IDs match the approved IDs.
- Neutral ranks do not affect the pass expression at `eval/run-protocol-history.mjs:101`.
- The evaluator loads only v2 files at `eval/run-protocol-history.mjs:14`.
- The evaluator emits the approved v2 counters and case roles.
- The documentation keeps the Raven decision monitor-only.
- The documentation assigns the defect to this repository.
- The documentation creates no `improvements/` finding.
- The documentation does not authorize PH3, paid evaluation, or a product route.
- The current baseline is 7/19 required and 5/9 forbidden captures.
- The neutral capture count is 3/4, and both contracts return `FAIL`.

## Checks

- `npm run eval:selftest`: passed.
- `npm run eval:protocol-history`: returned 1 with the expected diagnostic `FAIL`.
- `npm run typecheck`: passed.
- `npm test`: passed with 100 files and 1,699 tests.
- `npm run build`: passed.
- `git diff --check`: passed.

## Final verdict

FAIL. One medium finding remains open.
