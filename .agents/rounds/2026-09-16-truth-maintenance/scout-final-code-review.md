# Final code-integrity review

**Verdict: blocker found.**

Mode: read-only audit. Fixed point: `1d9fa2f20e498e441ba0428c1a6fdbac306710f7`.
Reviewed worktree: `/tmp/raven-execution-2026-09-16/source-integration`.

The scope included every authored changed hunk in the named source areas.
It also included tests, skill metadata, and round records.
Generated JSON received no source finding.
I checked the supplied runtime and quality evidence.
I did not rerun validation gates.

## Findings

### High — A positive stablecoin query can match a negated source exclusion

`src/catalog/search.ts:371` removes only the token after `non` from a source exclusion.
The remaining words still meet the two-token negative witness at `src/catalog/search.ts:520`.

`scout.getStablecoins` has the source exclusion `non stablecoin issued assets
governance utility tokens`. The positive query `Which stablecoins issued assets?`
returns no `scout.getStablecoins` hit. It instead returns asset and general results.
This contradicts the rule for a source `non-X` modifier.

The current regression test at `test/drift-141-routing.test.ts:206` uses only
positive queries without the remaining `assets` token. It does not cover this case.

Repair modifier handling as a clause-level condition.
A source exclusion using `non-X` must require that query modifier.
Keep exclusions without this modifier active. Add the reproduced positive query as a
regression test.

### Medium — The `.github` classification includes unrelated JSON encoding changes

`ecosystem-skills/groups.json:3` through `ecosystem-skills/groups.json:24` replace
existing literal em dashes with `\\u2014` escapes. The intended `.github` entry at
`ecosystem-skills/groups.json:17` is correct and matches the source-integration
record at `.agents/rounds/2026-09-16-truth-maintenance/source-integration.md:37`.

The escape changes have no semantic effect.
They add unrelated review work to a narrow metadata change.
Restore the existing UTF-8 text.
Retain only the new `.github` classification.

## Confirmed checks

- The reviewed `src/catalog/search.ts` SHA-256 is
  `6aca9f7c84cdd96a68738a6439011a0518cf847ded9df0abcadfb383f08c2f89`.
- `GET /api/rwa` remains excluded in `src/policy/scout-exposure.ts`.
- The `.github` reason is bounded to repository CI workflows. It changes no pin,
  selection, or runtime catalog entry.
- The supplied runtime evidence shows byte-identical responses before and after the optimization.
- The supplied runtime evidence reports the stated validation results.
- `git diff --check HEAD` reported no whitespace errors.

No other blocker appeared in the reviewed authored source hunks.
The high finding blocks this candidate until repair and regression coverage exist.
