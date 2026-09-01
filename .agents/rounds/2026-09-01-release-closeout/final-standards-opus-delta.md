# Reconciliation delta review — Opus 5 high

Scope: the uncommitted delta only (6 modified files, 2 untracked reports) on
`maintenance/free-improvements-followup` at `823c3fc`. Read
`final-standards-opus.md`, `final-spec-opus.md`, and the new "Final independent
review" section. Read-only; no repository file changed.

## Blocking issues

None.

## Repairs verified

**Duplicated flag parsing — repaired.** `parseRequiredFlagValue` (`run-qa.mjs:231`)
now backs both `parseRequiredBudgetFlag` and `parseRequiredAgentEnvironmentFlag`.
Messages are preserved for absent, duplicate, and missing-value; the equals-form
guard now covers `--max-budget-usd` and has a new control
(`test/qa-budget.test.mjs:135`). No script, package script, skill, or doc uses the
`--max-budget-usd=` form, so nothing breaks.

**Orphaned matcher — repaired.** `expectTextIncludesAll` is gone from
`rankExpected`, `expectedLabel`, and the self-test fixture. `containsBoundedTerm`
is still live through `expectTextIncludesAny`. I counted 12 `assert.` calls in
`runMatcherSelfTest` and ran `node scripts/eval-algolia-raven.mjs --self-test`:
prints `ok (12 controls)`, matching the test contract.

This reverses Fable's earlier F5 repair, which added the `text-all` controls. That
is not a reopened finding: F5 asked to "add a `text-all` self-test **or** remove the
unused option" (`fable-preflight-review.md:108`).

**Uppercase SHA-256 — recorded.** The new `["uppercase", …]` row
(`qa-harness-preconditions.test.mjs:575`) pins the intentional rejection. It runs
through the shared `assertExpectedIdentity`, so it covers the path whose
`.toLowerCase()` was dropped.

**Focused tests — reproduced.** `npx vitest run` over the three changed files:
3 files, 79 tests passed. Matches the ledger exactly.

## Judgments accepted

**sd-001 monitor stays diagnostic.** Sound. The rule-canary asserts rules-on beats
rules-off; the sd-001 monitor asserts rank 1 in *both* arms. Those invariants are
genuinely opposite, and merging them would weaken the sd-006 guard.

**Denominator in three surfaces.** Accepted as a cost judgment. The drift I cited
was real but doc-only and now corrected.

**Spec F1 merge order.** I re-derived it. `0a933c2` is a one-line `eval/EVALS.md`
change, lives only on `docs/remaining-work-adversarial-audit`, and is not an
ancestor of `823c3fc`. Merging #112 → #113 → #114 brings it in with no QA effect.
The reachability judgment is also complete, not partial: `5e23340` and `462ff2b`,
the other two `resolved.json` `sourceCommit` values, are already on `origin/main`;
`9074093` is the only branch-only one, and it is the commit the ledger pins.

## Non-blocking issues

1. **Spec F2 only half reconciled.** The ledger explains why Sol and Fable were
   ineligible and notes the route "replaces an older draft plan that named Grok",
   but records no reason Grok was skipped. AGENTS.md "Model routing" asks for
   exactly that. `.agents/rounds/2026-09-01-free-improvements-maintenance.md:33`
   still reads as a live plan ("A later Grok 4.6 gate will review the final diff").
   One clause fixes both.

2. **Third pin flag bypasses the shared parser.** `--expect-agent-binary-sha256`
   still uses `argVal` (`run-qa.mjs:1405`), so `--expect-agent-binary-sha256=<hash>`
   reports "must be a 64-character lowercase SHA-256" rather than the equals-form
   message, and a duplicate is silently accepted (first wins). Both fail safe — no
   paid call can proceed — and the ledger's sentence is accurate as scoped to the
   two required flags. Worth folding in when that flag is next touched.

3. **Reports are untracked.** `final-standards-opus.md`, `final-spec-opus.md`, and
   the ledger delta must enter a commit before the merge, per this round's own
   clean-tree rule and the AGENTS.md durable-state rule.

4. **`improvements/README.md:153`** still reads as if both canaries are retained
   alike. sd-006 has an enforcing runner (`scripts/check-algolia-rule-canary.mjs`);
   sd-001's is report-only. The judgment is sound; the sentence could say so.

5. `parseRequiredBudgetFlag`'s `label` option now has no caller that passes it
   (pre-existing, harmless).

PASS
