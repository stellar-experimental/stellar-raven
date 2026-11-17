# Item 6.3 report: RWA re-test (#167), after the second measurement

Lead: Claude Opus 5.5, agentpc `t1w3`, 2026-11-17. Branch `np/6.3-rwa-retest`. This replaces the first
report; the first is in git history (`473801af`).

## Pull request and result

- PR: https://github.com/stellar-experimental/stellar-raven/pull/475 (`Refs #167`).
  - Updated in place, not replaced; ready for review again.
  - CI was pending when this report was written.
- **Result: `GET /api/rwa` stays excluded, on both measurements.**
- **Result 1** ([RESULTS.md](RESULTS.md), unedited): exclude, on a single-sample drop on one control.
- **Result 2** ([RESULTS-2.md](RESULTS-2.md)): your 3-sample re-test, pre-registered in `0100fa6a`
  before any answer, after a Fable review whose 16 findings (2 blocking) were all adopted.
  - 42 of 42 answers, 42 of 45 attempts, USD 5.09 subscription-equivalent.
  - Outcome **exclude** on one question. On "notable DeFi and RWA launches of 2025", the INCLUDED
    answer stopped at registry rows and missed the headline launches. It was graded partial against
    correct in 3 of 3 samples.
  - The attribution judge tied each of those drops to the registry, with two verified quotes.
  - It is a completeness loss: no answer on either arm was wrong or fabricated.
- What else result 2 showed:
  - Result 1's control drop did not repeat; that control tied correct 3 of 3, with no registry call.
  - No clause fired on any control or off-target question.
  - `offTopic` was false on all 42 answers.
  - The off-target questions never called the registry, though RWA ranks 1 to 4 on their pages.
- Your answer 3 is applied:
  - the codemode TODO item says #167 no longer tracks cloudflare/agents#2296 and keeps the watch;
  - the second #167 comment says the same:
    https://github.com/stellar-experimental/stellar-raven/issues/167#issuecomment-6962274351.
- Diff:
  - `.agents/` only; product code is identical to `main`;
  - commit I is reverted;
  - the TODO RWA bullet records both results;
  - the ledger row is updated.
- Gates, run bare by the lead on the final tree, all exit 0:
  - typecheck;
  - `npm test`: 168 files passed, 3 expected fail;
  - build;
  - `eval:routing --gate`: GATE PASS;
  - `eval:selftest`;
  - `secrets:scan --tree`.
- No Codex review: there is no exposure change.

## Deploy

Not needed: no Worker bytes change.

## For the orchestrator on the Mac

Nothing. Merge when CI is green.

## Choices to accept, and open questions

1. **Scope choice: D3 re-sampled.**
   - I added the 2025-launches question (D3) at 3 samples, following REVIEW-2 finding 3. That made
     42 planned answers, inside your cap of 45 and "about 40".
   - Reason: D3's single result-1 sample was carried as a pass, but it showed exactly the pattern your
     rule asks about.
   - It is the question that decided result 2. Without it, result 2 would have said include:
     - no clause fired on the six questions you named;
     - D1, D2 and D4 carry their result-1 passes.
   - Tell me if you meant the re-test to cover only the controls and off-target questions.
2. **Deviation from blind judging (registered before the run).**
   - The grades stayed blind.
   - The attribution judge saw the INCLUDED arm's tool output by construction, because your clause
     needs the stated reason tied to the registry call. The blind grader cannot see the call.
   - That judge saw no EXCLUDED answer, no grade and no stake.
3. **For the owner, if RWA is wanted later.**
   - The measured harm is narrow: on a launches or news question, a client given the registry card
     stops at registry rows.
   - A card caveat such as "registry rows are not a launch or news timeline" is a candidate fix.
     It is model-facing, so it would need its own measurement. I did not add it.
