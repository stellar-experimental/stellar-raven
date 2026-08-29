# Human-review grill evidence — 2026-08-28

## Purpose

This directory holds the independent closure reviews for the 21-item human-review grill. The
authoritative owner decisions are in `research/decisions/0008-human-review-eval-and-playground-policy.md`.
The round history is in `.agents/rounds/2026-08-28-human-review-grill.md`.

## Evidence lanes

- The completed agent in Herdr pane `w16:p4` supplied the original human-review queue.
- The owner answered items 1 through 21 across the grill rounds.
- Parallel web research and Perplexity found no universal Playground character limit. The
  8,000-character ceiling is a product choice for this bounded surface.
- [GOV.UK character count](https://design-system.service.gov.uk/components/character-count/),
  [USWDS character count](https://designsystem.digital.gov/components/character-count), and
  [W3C validation guidance](https://www.w3.org/WAI/tutorials/forms/validation/) support retained
  text, an associated counter, actionable errors, and client-plus-server validation.
- [Mobbin Reddit](https://mobbin.com/screens/bdaedb67-bfc7-4e0d-b67c-7429cc84ea11) and
  [Mobbin Slack](https://mobbin.com/screens/b3a636b0-d8d7-4a7f-bfeb-3d888d05935d) examples
  supported a local counter and nearby alert instead of a modal.
- `decision-fable` at high and `decision-fable-x` at xhigh reviewed product reality, dispute
  handling, recovery, and corpus lifecycle. The xhigh Fable review is the independent closure gate.
- A separate GPT-5.6-Sol xhigh agent reviewed implementation, eval denominators, retries, and
  corpus lifecycle. This audit is supplemental because the orchestrator also uses the Sol lane.
- Reconciliation continued until both reviewers accepted the final Q16 through Q20 package.

## Final review files

- `fable-review.md` — independent product and closure review; final verdict `PASS`.
- `sol-review.md` — supplemental implementation and eval audit; final verdict `PASS`.

Both files preserve their initial `CHANGES-REQUESTED` findings and the final reconciliation.

Temporary `/tmp/raven-*` reports were working evidence. These final reports supersede them as the
durable review record.
