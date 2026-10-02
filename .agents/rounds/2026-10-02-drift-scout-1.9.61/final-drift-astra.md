safe with fixes

I reviewed `09c94e3d6117af839e8fc4e0482ede63a297588d` against `origin/main` at `38aa07fc8a4b05c5fa271d0227d2e80c2fdc650d`.
The alias implementation resolves Finding 3 without weakening the validator.
The original five findings are now resolved or explicitly accepted as a tracked follow-up.
However, this commit also deletes two unrelated routing work items.
Restore those items before merging this exact candidate.

**Required scope correction**

1. **[P2] Restore the unrelated routing work items removed from `.agents/TODO.md`.**

   Evidence: the `35882740..09c94e3d` diff replaces the old routing section with the new MCP note.
   In the candidate, `.agents/TODO.md:132` contains that note, followed by `## Dependencies` at line 152.
   Two existing sections are gone:

   - `search does not surface the research lane for protocol-history questions`
   - `Preserve structured routing intent across extraction caps and gate tiers`

   They appear at `origin/main:.agents/TODO.md:106` and `:152`.
   They remained present in `35882740`.
   Their removal deletes the PH1–PH4 conditions, owner-decision limits, and eleven acceptance checks.
   It also removes the recorded RWA and quality-operation restrictions and their unresolved work.
   This alias change does not complete either work item.
   The ledger describes no decision to retire them.

   Expected fix: restore both sections from `35882740` and retain the two new routing notes.
   This is a documentation-scope defect, not a defect in the alias implementation.

**Alias verification**

`src/policy/argument-aliases.ts:21` declares one exact operation mapping:

```text
scout.searchResearch: source -> sources, kind comma-list
```

`src/executor/providers.ts:420` applies the mapping before `guard()`.
The adapter receives those same validated arguments at line 437.
`src/policy/validate.ts` and the operation schemas remain unchanged.
The change does not bypass enum, array-item, type, or numeric-bound validation.

I verified the real operation closure with a capturing fetch.
This input succeeds:

```js
{ q: "base reserve", source: "cap, sep", perSource: 2 }
```

The request contains `sources=cap%2Csep` and `perSource=2`.
It contains no `source` parameter.
The caller's original object remains unchanged.
The normalizer leaves single-source input and other operation IDs untouched.

I also verified rejection before any fetch for:

- `source: "cap,invalid"`
- `perSource` values 0, 26, and 1.5 with the comma alias
- A string-valued `sources`
- An array-valued `source`
- A comma-valued `source` combined with an explicit `sources` array
- An invalid single source
- Null, array, numeric, and string argument objects

All these checks used a valid query where applicable.
The five committed alias tests and fourteen independent checks pass: 19 tests total.
The independent tests exist only in the temporary review copy.

One test-quality correction is advisable at `test/argument-aliases.test.ts:48`.
Its `q: "x"` violates the query's minimum length, independently of the comma alias.
The combined-input test at line 39 has the same problem.
Use `q: "base reserve"` and assert a `source` validation issue.
The independent checks above already establish the intended behavior, so this does not block the implementation verdict.

**Routing and prior findings**

The manifest, super-spec, and gates file are byte-identical to `35882740`.
No operation description changed in this correction.
The title snapshot remains equal to `origin/main`.

I reran routing compilation, the routing gate, and the evaluation self-test.
All pass.
Every threshold and accepted total remains equal to `origin/main`.

| Lane | Verified result |
| --- | --- |
| Legacy top-1 / top-3 / top-5 | 219 / 298 / 326 |
| Legacy card hits | 112 / 182 |
| Skills top-1 / top-3 / top-5 | 17 / 23 / 23 |
| Holdout top-1 / top-3 / top-5 | 12 / 26 / 29 |
| Holdout forbidden captures / passed | 10 / 24 |

The manifest fingerprint remains `15a4fe9fe4c5f741a26a39e7d4037575a05f753e70865ca01dd08abdf2e6ccba`.
The unchanged manifest preserves the previous probe results and causal findings.
The three title regressions remain removed.
The fourth discovery probe remains an accepted, bounded follow-up.

The MCP TODO now correctly records the `any` → `an` prefix match and the coverage threshold.
It no longer attributes the loss to description length.
Its proposed repair remains general and forbids query-specific exceptions.
My previous acceptance of this follow-up still stands.

The corrected `sls-089` and `sk-027` records remain unchanged from the accepted verification pass.

**Record wording still needs cleanup**

- `eval/gates.json:54` still describes the source-alias defect as a TODO item. Record the implemented normalization instead.
- The ledger at `.agents/rounds/2026-10-02-drift-scout-1.9.61.md:13` still says three new TODO items. Two remain.
- The ledger at line 149 still says `RetryableError` is “described on” `/api/hackathon-brief`. Only status-code descriptions appear there.
- `.agents/TODO.md:142` calls the direct MCP query unchanged. Its rank stays 3, but its score changed from 233 to 207.

These are record corrections; none requires a new threshold or description change.

**Validation and limits**

| Check | Result |
| --- | --- |
| Committed and independent alias tests | 19 passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; Wrangler dry run only |
| `npm run test:smoke -- --no-cache` | 102 passed across 7 files |
| Routing gate | Passed |
| Evaluation self-test | Passed |
| Secrets scan, including Gitleaks | Passed |
| `git diff --check` | Passed |
| Full unit suite | 2336 passed, 3 expected fail, 29 failed in one unrelated file |

The 29 failures occur in `test/qa-paired-launch.test.mjs`.
Their process-inspection and cleanup checks encounter `spawnSync ps EPERM` in this sandbox.
That file is unchanged by this candidate.
I do not classify those failures as an alias regression.
I also do not claim a fully green unit-suite result.
A normal-environment unit-suite result remains necessary for the release checks.

I used temporary copies for generated files and tests.
I copied the existing generated `env.d.ts` for type checking.
I did not read credential files, post upstream, deploy, or run a paid operation.
The source worktree remains clean.

Evidence is retained under:

```text
/private/tmp/final-drift-astra.CBPs1k/
  alias-tests.log
  candidate/test/review-argument-aliases.test.ts
  candidate/eval/results/routing-2026-10-02T15-14-14-179Z.json
  gate.log
  selftest.log
  typecheck.log
  build.log
  smoke.log
  unit.log
  secrets.log
```
