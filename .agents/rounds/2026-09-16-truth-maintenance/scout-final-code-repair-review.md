# Final code-repair review

**Verdict: no blockers.**

Mode: read-only audit. Fixed point: `1d9fa2f20e498e441ba0428c1a6fdbac306710f7`.
Reviewed worktree: `/tmp/raven-execution-2026-09-16/source-integration`.

## Repaired findings

### High — Source `non-X` exclusion scope

`src/catalog/search.ts:367` now checks each source `non-X` modifier against adjacent,
ordered query words. It accepts `non X` and `not X` only. The check uses original
tokens at `src/catalog/search.ts:722`. Stopword processing cannot remove `not`.

Without a matching modifier, `negativeRoutingIntentCoverage` returns zero. The source
clause then supplies no partial negative witness. Other source clauses retain their
existing coverage behavior.

The new tests at `test/drift-141-routing.test.ts:211` cover both reported positive
queries. They also cover a `non-stablecoin` negative and the existing `not stablecoins`
negative. Manual probes produced the same results.

The only source clauses using this modifier are `non-Stellar ideas` and
`non-stablecoin issued assets`. Both are modifier clauses. No broad English-negation
parser was added.

### Medium — `.github` classification scope

`ecosystem-skills/groups.json:17` now adds only `.github` with the repository-CI
reason. Existing UTF-8 em dashes remain unchanged. The source-integration record
still states the matching blob evidence and no runtime effect.

## Verification

- `npm test -- test/drift-141-routing.test.ts` passed.
- Result: 46 passed, 3 skipped, and 0 failed.
- `git diff --check HEAD` reported no whitespace errors.
- `src/catalog/search.ts` SHA-256 is
  `46fa7be7cad1f50bdfb8d48ab5af85d14fcb8cdd98997d2647f30c78ca9e5111`.

The full routing run was outside this repair review. No new correctness or
reviewability finding appeared in the repaired scope.
