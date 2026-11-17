# Verdict: do it now, slightly reshaped

Evaluator: Claude Fable 5.2. Read source and docs only; lint not run, corpus not opened.

## 1. Likelihood of a third exposure: high

- CI runs `npm run eval:qa:lint -- --stale --enforce-floors` on every PR, plus the live-contract lint (`.github/workflows/ci.yml:97-102`). `refresh.yml:141` tees lint output to a file.
- `CONTRIBUTING.md:41` makes it the gate for any `eval/` change, and four skills tell lanes to run it (`golden-truth`, `run-evals`, `truth-maintenance`, `live-drift-resolution`).
- Warnings print on green runs, so every run exposes text, including CI logs an agent reads after a failure.
- Two exposures already happened in one round. Each costs a split amendment and permanently shrinks held-out (now 111).

## 2. Size: small

Eight sites in `eval/qa/lint-corpus.mjs` interpolate golden text into a message:

| Line | Lane | Quotes |
|---|---|---|
| 452, 514 | avoid | avoid item |
| 496, 499, 503 | key-fact | key fact |
| 507 | snapshot-date | key fact |
| 573 | cap-finding (error) | 140 chars of `golden.notes` |
| 616 | corroboration (error) | key fact |

Two indirect sites carry fragments only: line 302 (the ADR-0003 guard names the offending token) and line 356 (a forbidden register value). No question text is printed anywhere.

Estimate: about 20 changed lines in one file, plus a test of about 30 lines. `test/qa-corpus-lint.test.mjs` (465 lines) already imports the lane functions and builds fixture cases, and its existing assertions match on message prefixes, not on quoted text, so few or none should break.

## 3. Usefulness after the change: nearly unchanged, if the field is named

Whoever fixes a warning opens the case file anyway. Bare "id + check name" would lose which of several key facts tripped. Replace the text with a field path and non-text metadata: `golden.keyFacts[2] (104 chars)`, `golden.avoid[1] [beyond-support]`, `golden.notes sentence 3`. Dates, finding ids, and pattern labels can stay.

## 4. Cheaper alternatives: none that works

- An opt-out flag (`--no-text`) fails: CI, `CONTRIBUTING.md`, and the skills run the bare command, which is how both exposures happened.
- Hiding warnings behind a count fails: two of the eight sites are errors, and errors are what lanes read most closely.
- An opt-in `--show-text` flag reopens the hole and makes the test weaker. Leave it out.

## Recommendation

Do it as scoped, with two adjustments:

1. Print field path and index instead of nothing, so warnings stay actionable.
2. Put the marker in every judge-facing field of the fixture (question, answer, key facts, avoid, notes), trip every text-bearing check including `lintLiveContract`, and assert the marker is absent from every `finding.message`. One spawned CLI run can cover `printFindings` too.

Leave lines 302 and 356 as they are unless the marker test catches them; the token and the register value are what the fixer needs.
