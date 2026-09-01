# Final approval pass — Opus 5 high

Scope: the exact uncommitted delta in `/private/tmp/stellar-raven-release`
(7 modified files, 4 untracked reports) over `823c3fc`. Read-only; no repository
file changed. No new scope opened.

## Blockers

None.

## The five required paid-run flags

All five now route through `parseRequiredFlagValue` (`run-qa.mjs:231`), which
rejects the `=value` form, an absent flag, a duplicate flag, and a missing value:

| Flag | Call site | Required in |
| --- | --- | --- |
| `--max-budget-usd` | `:1440` via `parseRequiredBudgetFlag` | every mode |
| `--expect-agent-binary-sha256` | `:1411` | every mode |
| `--expect-agent-environment-sha256` | `:1415` via the env wrapper | every mode |
| `--server-revision` | `:1478` | collection only |
| `--expect-sha256` | `:1479` | collection only |

I verified the mode split rather than trusting the table: `--judge-stored` returns
at `:1459`, before the two collection pins are parsed. That matches the documented
contract exactly, and the judge-stored fixtures still pass without them.

The surface pin is now read once into `expectedSurfaceSha256` and reused at both
`:1517` preflight and `:1718` postflight, so the two checks can no longer disagree
about which argument they read.

Regression checks: `assertPinnedServerRevision` and `assertExpectedSurface` keep
their own required-value branches, still exercised directly by
`qa-judge-stored.test.mjs:548` and `qa-harness-preconditions.test.mjs:818`, and
`assertExpectedSurface` is still reached with a raw `argValue` from the discovery
runner, so neither branch is dead. `parseRequiredBudgetFlag`'s `label` option is
gone and no caller passed one — prior item 5 is now fixed rather than deferred.

## Counts reproduced

- Focused: `npx vitest run` over the three changed test files — 3 files,
  **85 tests passed**. Matches the ledger.
- Baseline: `npm test` — 99 files, **1595 tests passed**, exit 0. Matches the
  ledger's corrected `1,595`.
- `npm run typecheck` exit 0; `npm run improvements:lint` exit 0 (66 findings);
  `node scripts/eval-algolia-raven.mjs --self-test` prints `ok (12 controls)`;
  `git diff --check` clean.

## Documentation and TODO

`eval/qa/README.md:189-194` now states the split correctly — budget, binary, and
environment for every mode; server revision and surface for collection — and
attributes the rejection set to every required flag rather than to the environment
flag alone. Checked against the code above: accurate.

`improvements/README.md:154` now distinguishes the two canaries by consequence.
Verified against code: `check-algolia-rule-canary.mjs:124` sets
`process.exitCode = 1` on a failed assertion; `eval-algolia-raven.mjs` has no
rank-based exit path. The wording is exact.

`.agents/TODO.md:171-180` records the discovery-runner gap with the file, the three
missing preconditions, an absolute date, a statement that it predates this release,
and a testable "Done when". A stranger can act on it cold.

## Earlier findings — final status

| Finding | Status |
| --- | --- |
| Duplicated flag parsing | Fixed; one shared parser |
| Orphaned `expectTextIncludesAll` | Fixed; 12 controls, contract test updated |
| Uppercase SHA-256 pin | Fixed; control at `:620` records the intent |
| sd-001 monitor vs rule canary | Accepted with a sound opposite-invariant rationale |
| Denominator in three surfaces | Accepted as a cost judgment |
| Spec F1 merge order | Accepted; `9074093` is the only branch-only `sourceCommit` |
| Spec F2 route rationale | Fixed in both ledgers, with the Grok skip reason |
| Binary pin parser | Fixed, with duplicate and equals-form controls |
| `improvements/README.md` wording | Fixed |
| Unused `label` option | Fixed |
| Ledger pin-count ambiguity | Fixed |
| Discovery runner | Accepted; deferred to `.agents/TODO.md` |
| Stale `1,588` baseline | Fixed to `1,595`, verified |
| `eval/qa/README.md` doc gap | Fixed |

## Non-blocking

1. `.agents/rounds/2026-09-01-release-closeout.md` still says
   "`improvements/README.md` also defines the resolved precedents as separate
   **monitor-only** canaries." This same delta dropped "monitor-only" from that
   README precisely to separate reporting from failing. One word.
2. `.agents/skills/run-evals/SKILL.md:276-278` still bans the `=<hash>` form for the
   environment flag only. Still true, now incomplete. Optional.
3. The four reports in the round directory remain untracked. They belong in the
   commit this pass precedes.

PASS
