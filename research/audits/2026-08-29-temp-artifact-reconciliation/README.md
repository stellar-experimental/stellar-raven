# Temporary-artifact reconciliation — 2026-08-29

## Scope

Audit recent temporary Raven reports from the 2026-08-28 eval and human-review work. Compare each
artifact with the durable repository state after commit `6817e99`. Do not reopen confirmed owner
decisions. Record any missing work category, unanswered implementation question, superseded
proposal, or external-only action in its correct durable location.

## Review lanes

- `fable-review.md` — independent product, truth, and decision-placement review.
- `sol-review.md` — implementation, eval, and evidence-completeness review.

## Inventory

The reviewers inspected these artifact families:

- Twelve `/tmp/raven-*.md` decision and reconciliation reports.
- `/tmp/eval-refusal-policy.json` and seven `/tmp/hyg-comment-*.md` posting drafts.
- The human-authored `b2-*` and `hyg-*` briefs and reports in recent Claude scratchpads.
- The eval-block2 comparison, reopen, judge-stability, and gate artifacts.
- The live-drift comparison and gate artifacts.
- Generated logs and tool-result files as families when one durable ledger already owned them.

The Fable report contains the 41 byte-identical comparison IDs. The Sol report contains both the
41 byte-identical IDs and the 59 changed IDs. Both reports name revisions `9bb465d` and `644f364`.
The exact partition is dated evidence, not a standing denominator.

## Reconciled dispositions

The accepted 21 owner decisions remain complete. ADR-0008, the human-review ledger, the TODO queue,
and the two deferred idea files own their durable outcomes. This audit does not change them.

The review added these future-work destinations:

- Validate a three-outcome paired comparison method before the next comparable rerun.
- Add behavior-class fixtures to the queued trap-contradiction repair.
- Recheck two golden source-metadata conflicts through `golden-truth`.
- Repair the generated blockquote title through the improvements generator and its tests.

The audit also corrected completed orchestration states and stale outcome wording in two round
ledgers. It preserved these residuals only in the dated reviews:

- The exact 41/59 comparison partition.
- The below-threshold `sk-006` successor candidate.
- The invalid direct regex-reuse proposal.
- The four-lane GLM 5.3 Flash trial outcome.

No temporary artifact becomes policy. Generated logs remain transient. The optional public reply
on issue #40 remains external-only and was not posted. Connectors Directory work remains blocked
externally, as ADR-0008 and `.agents/NEXT.md` state.

## Final review state

Fable and Sol both requested the durable changes above. Each reviewer then checked the applied
patch and returned `PASS`. The Fable recheck resolved one unsupported source sentence by replacing
it with a direct-verification task. Neither reviewer found an unanswered owner question.
