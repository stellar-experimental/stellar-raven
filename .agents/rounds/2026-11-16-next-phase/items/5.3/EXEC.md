# Item 5.3 execution

Executor: Claude Sonnet 5.5, worktree `np-5.3`, branch `np/5.3-lint-no-golden-text`. Code commit
`116a0416`. USD 0. No model call, no push, no PR, no server. No golden text was seen at any point.

## What changed

Sites, all from [PLAN.md](PLAN.md):

- `eval/qa/lint-corpus.mjs`:
  - `lintAvoidPhrases`: `golden.avoid[i] <tier> [<labels>]`.
  - `lintGoldenAuthoring`: key fact over 90 characters, multiple predicates, negative predicate
    object, snapshot date, and non-content avoid item, each by `golden.keyFacts[i]` or
    `golden.avoid[i]`.
  - `lintCapFindings`: `golden.notes sentence <n> (chars <a>-<b>)`, or `sentences <n>-<n+1>` for a
    joined pair, offsets in the notes string.
  - `lintCorroboration`: `golden.keyFacts[i] numeric/version/date keyFact lacks a covering corroboration row`.
  - `lintNumericInvariants`: `exact contradiction to <label>: forbidden value <k> of the register entry is present`.
  - `lintSurface`: on a guard throw, re-run per judge-facing field, one finding per field that
    throws, `ADR-0003 leak in <field path>: references <class>`; fallback `ADR-0003 leak in case text`.
  - JSON: `json()` and `loadCasesAtRef` rethrow `<path>: invalid JSON` plus line/column or position.
- `eval/qa/compile-qa.mjs`: `invalid strkey at <path> (<reason>)` without the token; `json()` uses
  the same rethrow.
- `eval/qa/lib.mjs`: new `parseJsonText(text, label)`, shared by both files.
- `eval/qa/README.md`: one sentence under the lint commands.
- `.agents/TODO.md`: deleted "Stop QA lint from printing golden text". The lead adds the ledger row.
- Tests: `test/qa-corpus-lint.test.mjs` (new `describe("QA lint never prints judge-facing text")`,
  13 tests) and `test/qa-strkey.test.mjs` (updated).

## Tests first: result on the untouched source

Run against `5646570d` source before any `eval/qa/*.mjs` edit (no stash). All 14 failed:

| Test | On untouched source |
|---|---|
| names the avoid item, tier and labels instead of quoting it | fail |
| names the key fact index and metadata instead of quoting it | fail |
| names the uncorroborated numeric key fact by index | fail |
| names the partial cap by sentence ordinal and character span | fail |
| names the leaking field, not the token, for an ADR-0003 surface leak | fail |
| names the register entry and value index, not the forbidden value | fail |
| keeps the marker out of every runLint finding while each targeted check still fires | fail |
| keeps the marker out of every live-contract finding | fail |
| on disk > reports a strkey and malformed JSON in the proposed lane without their text | fail |
| on disk > names the file, not the source text, for a malformed case file | fail |
| on disk > prints no marker through the CLI while every targeted lane still reports | fail |
| on disk > prints no marker when a battery file or the live contract is malformed | fail |
| on disk > prints no marker when the base ref holds a malformed case file | fail |
| `qa-strkey` > rejects a CRC-broken strkey through the case compiler hook (updated) | fail |

The pre-existing tests in both files passed. After the change all 74 tests in the two files pass.
Two expectations in my own fixtures (the `corpus-support` label on avoid item 0; sort order of the
proposed-lane messages) were corrected after the first post-fix run. Both only made the
expectations match the fixture, and the messages they assert still differ from the old
quoting messages.

## Gates (run bare, exit status read directly)

- `npm run typecheck`: 0. It first failed with `Env` errors because the fresh worktree had no
  `.dev.vars`; I created the git-ignored placeholder the way `ci.yml` does and ran
  `npm run typegen`.
- `npm test`: 0. 168 files passed, 5 skipped; 3746 tests passed, 3 expected fail, 5 skipped.
- `npm run build`: 0 (dry run).
- `npm run secrets:scan -- --tree`: 0, clean. The pre-commit hook scan was clean too.
- `npm run test:smoke` not run: no `src/executor` or `src/demo` change.

## Step 7: real-corpus count

Script `/tmp/claude-1000/np-5.3-count/count.mjs`, read and approved by the lead before the run.
Positive control first, on a synthetic root: unplanted leaks 0, planted leaks 1, shape 0 and 0.

Real run, once, printout verbatim:

```
cases battery 253 proposed 0 live 15
needles windows 199259 short 38 below-min 0
lint: exit 0; lines 102; leaks 0
lint-since: exit 0; lines 101; leaks 0
live-contract: exit 0; lines 45; leaks 0
register: exit 0; lines 3; leaks 0
selftest: exit 0; lines 40; leaks 0
findings by lane (lint runs, summed) avoid=47 corroboration=8 coverage=4 key-fact=183 numeric=2 untagged=4
leaks by lane none
leaks total 0
shape nonprefix 0 template 0
```

Pass: every leak and shape count is 0, so no fix and no re-run. The output files were deleted in the
script's `finally`; the scratch folder holds only `count.mjs`.

## Deviations from the plan

1. `parseJsonText` is a shared helper in `eval/qa/lib.mjs`, not two copies. `compile-qa.mjs` labels
   a file relative to the real repo root, so a fixture outside the repo shows a `../..` path; the
   tests assert the file name, not the full path.
2. `lintSurface` maps the guard's message to a fixed class by regex (six classes plus a generic
   fallback), so the finding keeps the violation class the plan asked for.
3. Step 7 additions: a fifth command (the lint with `--since origin/main`, which exercises
   `loadCasesAtRef` and the gospel lane); needles under 8 characters are dropped (count printed as
   `below-min`, 0 here); a leak hit whose needle also occurs in the lint's own source files is
   ignored as a template coincidence (no such case arose: no leak line was found at all).
   Per-command line counts are printed as integers. None carries text or a case id.
4. The extra integers beyond NOTE.md's three items (cases per lane, needle counts, line counts,
   shape counts) are the ones PLAN.md step 7 lists; the lead adopted them.
5. Not run here: CI's lint step and `gh pr checks` (no push). The lead handles the PR.

Outside this diff (review 8): `register-helper.mjs:228` shares the JSON-snippet channel; it stays in
the report, not this change.
