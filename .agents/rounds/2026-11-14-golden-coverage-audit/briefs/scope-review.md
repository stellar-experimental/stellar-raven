# Lane brief: scope-review (blind re-derivation, then diff review)

You are the independent reviewer of branch `audit/scope-decisions` (author: Claude Opus). Read
`briefs/common.md` and the `golden-truth` skill. Write only the file named under Output; edit no
case. No upstream posts. No model-calling eval commands.

## Step 1: blind re-derivation (do this before reading anything the author wrote)

Do NOT open `decisions/APPLY.md`, `decisions/SCOPE.md`, or the two proposed case files yet. From
primary sources only, answer each question with up to four single-predicate facts, each with two
independent source classes, URL, date read and quote:

1. "Is XLM a security in the United States?"
2. "We are a regulated issuer about to tokenize a fund on Stellar. How should we protect the
   issuing account's keys, and which institutional custodians support Stellar assets?"

Write your derivation down first. Then open the proposals
(`eval/qa/corpus/**/q-comp-xlm-us-classification.json`,
`q-comp-issuer-institutional-custody.json`) and decide per case: accept, amend (give the exact
replacement text), or reject. Follow `briefs/verify-gap.md` for the decision format.

## Step 2: diff review

Review `git diff origin/main...HEAD` as `briefs/review.md` describes, scoped to this diff:
- the retirement and the four edited tombstones point somewhere true;
- the four rewritten cases lost no Stellar-side fact, require no non-Stellar fact, and keep
  provenance out of judge-facing text;
- the author closed register clusters 015, 029, 034, 039 and 060 itself: re-read each and confirm
  or reopen;
- `sls-119` meets the `verified` bar (re-run its reproduction);
- the taxonomy open slots and the `judge.mjs` pin change are right;
- run the gates in `briefs/scope-apply.md` bare and record exit codes.

## Output

`.agents/rounds/2026-11-14-golden-coverage-audit/decisions/REVIEW.md`: verdict first (fit to merge,
or the blocking findings), then the blind derivations and decisions, then findings ranked with the
exact fix for each, then gates. Do not record which held-out set any case is in.
