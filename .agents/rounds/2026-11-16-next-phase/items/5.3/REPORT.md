# Item 5.3 report

Lead: Claude Opus 5.5, agentpc `t1v1`. Branch `np/5.3-lint-no-golden-text`.

## Pull request and result

[#470](https://github.com/stellar-experimental/stellar-raven/pull/470), "QA lint never prints golden
text (round item 5.3)". No `Refs`: no issue tracks this item. CI: all checks pass (`test`, `secrets`, CodeQL and its three analyses), read from `gh pr checks` only. The first CodeQL run failed on one new high alert in the new test (`test/qa-corpus-lint.test.mjs:654`, incomplete escaping in a hand-built `RegExp`); the lead replaced it with a suffix match (`4e6fbb42`, commit "Match the strkey message by suffix"), re-ran `npm test` and `npm run typecheck` (both 0), and CodeQL passed.

Every QA lint finding now names the case id, the check and a field path with non-text metadata. None
prints question, answer, key-fact, avoid or notes text.

**Sites changed:**

- `eval/qa/lint-corpus.mjs`:
  - eight direct sites: `avoid` 452, `key-fact` 496/499/503, `snapshot-date` 507, non-content `avoid`
    514, `cap-finding` 573 (sentence ordinal and character span), `corroboration` 616;
  - `lintSurface` 302: the ADR-0003 guard is re-run per field and reports the violation class, with
    no token;
  - `numeric` 356: prints the register value's index, not the value. It fired only when the value
    was in the case, so printing it confirmed case text;
  - JSON parsing in `json()` and `loadCasesAtRef`.
- `eval/qa/compile-qa.mjs`: the strkey message (no token), and JSON parsing.
- `eval/qa/lib.mjs`: new `parseJsonText`. V8's `SyntaxError` quotes the source; the new function
  reports the path plus a line and column only.
- `test/qa-strkey.test.mjs`: one expectation updated.
- `eval/qa/README.md`: one sentence stating the rule.
- `.agents/TODO.md`: the item is deleted.
- Round ledger: the 5.3 row is added.

**Test:** `test/qa-corpus-lint.test.mjs`, `describe("QA lint never prints judge-facing text")`, 13
tests. All 13, plus the updated strkey test, failed on the old source and pass now. A marker sits in
every judge-facing field, inside the fragment each site used to print. The tests trip every
text-bearing check, using exact messages, plus `lintLiveContract`, the proposed lane, and three CLI
runs in a temporary root with the CI variables cleared. They assert that each lane fired, then that
the marker is absent everywhere.

**Counting result:** run once by the executor through
`/tmp/claude-1000/np-5.3-count/count.mjs`. I read and approved the script before it ran. It
printed integers and lane names only, the output files were deleted in its `finally`, and a positive
control ran first (planted leak detected).

```
cases battery 253 proposed 0 live 15
lint / lint --since origin/main / live-contract / eval:qa:register --check / eval:selftest: all exit 0
findings by lane: avoid=47 corroboration=8 coverage=4 key-fact=183 numeric=2
leaks total 0; shape nonprefix 0, template 0
```

**Held-out integrity:** nobody saw golden text, so no split amendment is needed. The Fable
reviewer's one process deviation was a recursive `grep -l` that excluded `corpus/`, `results/`,
`reviewed/` and the compiled files. It printed 18 file names and no content, so 0 cases were
possibly seen. It is recorded in `REVIEW.md`.

**Reviews:**

- Claude Fable 5.2 (high) plan review: 12 findings, 1 of them blocking (the CLI test could pass on
  a crash in pull-request CI). All 12 were adopted; the table is in `PLAN.md`.
- No post-execution review: no skill, routing rule or security boundary requires one here.

**Gates**, run bare by the lead at `bf8553db`: `npm run typecheck` 0; `npm test` 0 (3746 passed);
`npm run build` 0; `npm run secrets:scan -- --tree` 0. USD 0.

## Deploy

Not needed: no Worker bytes change.

## For the orchestrator on the Mac

Nothing.

## Open notes, no owner decision needed

- `eval/qa/register-helper.mjs:228` (`npm run eval:qa:register`) parses case files with a bare
  `JSON.parse` and prints `error.message`. A malformed case would therefore print a V8 source
  snippet. In CI it runs after the lint, which now fails first on the same file without the
  snippet, so I left it out of scope. Run alone, it would still leak. A one-line follow-up would
  switch it to `parseJsonText`. Say if you want it in this PR.
- After this merges, lanes may read lint output again. The skills and dated briefs that warn about
  lint output were left unchanged; their caution is now redundant but harmless.
- The extra integers the count script printed (cases, needles, line counts, shape counts) go
  beyond NOTE.md's three items. I adopted them from the Fable review without asking, because they
  carry no text or case id and make a pass falsifiable.
