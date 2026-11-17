# Item 6.3 report: RWA re-test (#167)

Lead: Claude Opus 5.5, agentpc `t1w3`, 2026-11-17. Branch `np/6.3-rwa-retest`.

## Pull request and result

- PR: https://github.com/stellar-experimental/stellar-raven/pull/475 (`Refs #167`). CI was pending
  when this report was written.
- **Result: `GET /api/rwa` stays excluded.** The pre-registered rule returned exclude on one clause:
  - on the mixed-intent control, the INCLUDED answer was graded partial and the EXCLUDED answer correct;
  - the INCLUDED run called the registry, so the rule counts it as an attributable drop.
- Everything else went INCLUDED's way or tied:
  - no bad INCLUDED answer, and no off-topic use of the registry;
  - no loss on the displacement or registry questions, and one registry question was graded correct
    over partial;
  - no registry call on the three off-target questions;
  - INCLUDED cost USD 0.04 less over the 10 runs.
- Routing (free) also held with RWA included:
  - every gate threshold passed;
  - legacy top3 −2, top5 −1, card@5 −2, each a one-rank card move on an RWA question;
  - holdout by count: captures 11 → 10, passed 24 → 25.
- Commit I is reverted. The diff is `.agents/` only: the item records, the TODO RWA bullet and check 8
  outcome, and the ledger row.
- #167 status comment posted:
  https://github.com/stellar-experimental/stellar-raven/issues/167#issuecomment-6961220388.
  Nothing was posted upstream.
- Spend: 20 of 20 answers, USD 2.20 subscription-equivalent, plus one Opus judge session on the
  subscription CLI. No API-billed path.
- Gates, run bare by the lead on the final tree, all exit 0:
  - typecheck;
  - `npm test`: 168 files passed, 3 expected fail;
  - build;
  - `eval:routing --gate`: GATE PASS;
  - `eval:selftest`;
  - `secrets:scan --tree`.
- Reviews:
  - Fable plan review: 13 findings, 3 blocking, all adopted before any run.
  - No Codex review: no exposure change. The plan required one only on include.

## Deploy

Not needed: no Worker bytes change.

## For the orchestrator on the Mac

Nothing to do on the Mac. Merge when CI is green.

## Open questions for the owner or orchestrator

1. **Is the rule too strict for this to be the durable answer?**
   - The failing clause rests on one sample of one pair.
   - The judge's reason for the drop cites a documentation point (the answer listed the wrong
     tokenization models), not registry data. The rule attributed the drop to RWA only because the run
     called it.
   - The 6.2 record measured 5 of 10 correct-against-partial flips between equivalent arms for this
     client, so this drop is within that noise.
   - I did not override the rule. The plan forbids it, and the TODO now says a re-test needs an owner or
     orchestrator decision.
   - A cheap re-test: 3 samples on each control and off-target pair (about 36 Sonnet answers,
     roughly USD 4), with the attributable drop counted only when it repeats.
   - Your call.
2. **Deviation from the note.**
   - #167's third control matches a confirmation-only routing row, and 6-COMMON forbids using one in an
     A/B. So the A/B used a listed mixed-intent row instead (Fable finding 1).
   - That replacement row is the control that failed.
   - The third control's rank is no longer printed in the plan. It still sits in the existing `it.fails`
     test, unchanged.
   - Tell me if you wanted the note's wording to win instead.
3. **cloudflare/agents#2296.** The note's instruction to stop status-checking #2296 on #167 sat under
   the include branch. I left it alone. Fable's assessment says #167 does not depend on it.
