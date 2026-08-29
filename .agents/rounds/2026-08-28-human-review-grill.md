# Human-review decision grill — 2026-08-28

## Scope

Close the human-review queue surfaced from the completed agent in `w16:p4`. Record the owner's
answers, the independent product and implementation reviews, and the resulting work sequence.

This round records decisions and plans. It does not implement the queued product, eval, corpus, or
Playground changes. It does not perform Connectors Directory work outside this repository.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| Orchestration and capture | Codex, Sol lane | `w16:pB` | decision, queue, idea, and skill records | completed |
| Independent product and closure review | Claude Fable 5, xhigh | `w16:pE` (`decision-fable-x`) | `research/audits/2026-08-28-human-review/fable-review.md` | pass |
| Supplemental implementation audit | GPT-5.6-Sol, xhigh | `w16:pD` (`decision-sol`) | `research/audits/2026-08-28-human-review/sol-review.md` | pass |

Fable was selected as the independent gate for product, API, interface, and closure judgment. Sol
was selected for a supplemental dense eval and implementation audit. The Sol audit does not serve
as the independent gate because the orchestrator also uses the Sol lane.

## Decision record

The owner confirmed the full package on 2026-08-28. Numbers below preserve the original grill
order.

| # | Confirmed decision | Durable destination |
| --- | --- | --- |
| 1 | Audit sourcing-guard warnings before editing the class. | `.agents/TODO.md` |
| 2 | Review every corroboration warning and separate factual negatives from grammar rules. | `.agents/TODO.md` |
| 3 | Defer the twelve `sources.locate` design questions and the phase-zero spike. | `ideas/source-delivery-ranked-references.md` |
| 4 | Grade reality by the strongest applicable authority while treating attributed source conflicts fairly. | `research/decisions/0008-human-review-eval-and-playground-policy.md` |
| 5 | Test general repository-source recovery before ranking changes and protect current QA behavior. | decision record and `.agents/TODO.md` |
| 6 | Keep retries explicit, class-specific, visible, and evidence-driven. | decision record and `.agents/TODO.md` |
| 7 | Keep the Playground stateless. Preserve durable sessions as a deferred idea only. | `ideas/shareable-durable-playground-sessions.md` |
| 8 | Set the Playground user-message ceiling to 8,000 characters. | decision record and `.agents/TODO.md` |
| 9 | Do not treat Connectors Directory work as an unexplained repo blocker. | Connectors round addendum |
| 10 | Test the policy against product reality with an independent Fable review. | this ledger and Fable review |
| 11 | Report provider safeguards separately from model-authored safety behavior. | decision record and `.agents/TODO.md` |
| 12 | Separate answer, retry, safety, harness, and provider outcomes. | decision record and `.agents/TODO.md` |
| 13 | Track Connectors Directory work as blocked externally. Do no portal, credential, account, or submission work here. | Connectors round addendum and `.agents/NEXT.md` |
| 14 | Keep every warning observable. Remove only demonstrated cruft without weakening truth checks. | `.agents/TODO.md` |
| 15 | Use several independent models for warning classification and reconcile disagreements. | `.agents/TODO.md` |
| 16 | Keep `sources.locate` deferred behind a measured, recovery-first reopening rule. | source-delivery idea |
| 17 | Apply the attributed-conflict grading rule to three evidence-backed cases only. | decision record, `golden-truth`, and `.agents/TODO.md` |
| 18 | Measure repository-level recovery with a separate frozen 20-case suite before ranking. | decision record and `.agents/TODO.md` |
| 19 | Adopt the five-track QA accounting contract after both xhigh reviewers accept it. | decision record, `run-evals`, and `.agents/TODO.md` |
| 20 | Add a score-independent golden lifecycle and keep corpus health separate from system performance. | decision record, `golden-truth`, `run-evals`, and `.agents/TODO.md` |
| 21 | Keep over-limit text intact, disable Send, show an accessible error, and reject bypassed requests. | Playground idea and `.agents/TODO.md` |

## Resolved policy details

### Warning audits

- Sourcing guard: inspect 20 cases. Use eight targeted warning shapes and twelve seeded-random
  cases. Keep the warning class advisory when the random sample is clean; never chase zero.
- Corroboration: classify all 56 warnings. Add evidence only for real negative factual claims.
  Grammar-only restrictions need no fabricated evidence row.
- Several independent models review the classifications. The round reconciles every disagreement.

### Source delivery and repository recovery

- `sources.locate` stays deferred. The twelve design questions are not current owner questions.
- Ship and measure the bounded `scout.explainRepo` recovery work first.
- A verified incident starts with a missing fact at a pinned ref in an allowlist-candidate
  repository. It includes a named file, symbol, or heading locator.
- A verified incident exhausts Docs, skills, a drift refresh, and one pinned
  `scout.explainRepo` rephrase. The ADR-0008 recovery steering must be live. Triage must identify
  source coverage, not routing, answer craft, judge error, or golden error.
- One independently reproduced high-impact user block can open a phase-zero study. Two unrelated
  reproduced incidents can also open it.
- Evaluation-only evidence needs three verified cases across two repositories and two fact
  classes. One case must be outside the current golden family.
- An incident needs the question and transcript. A Ray ID and date are optional additions.
- A trigger opens discovery only. It never authorizes a build.

### Truth, eval, and lifecycle

- A reconciled answer may be correct. An attributed but unresolved canonical-page conflict caps
  at partial. An unattributed false claim remains wrong.
- Apply per-case cautions to base reserve, Horizon lifecycle, and RPC pagination. Repair their
  named provenance. Align the Freighter caution without adding an exception. Review the Protocol
  27 snapshot-date fact separately through `golden-truth`.
- The repository-recovery suite is separate and frozen: 12 positives, eight negatives, at least
  four repositories, full provenance-bearing goldens, and no membership in existing QA or routing
  corpora. Add manifest recovery metadata first. Ranking work starts only after three qualifying
  positive misses.
- QA reports five tracks: first-pass answer quality, retry recovery, safety behavior, harness and
  judge health, and provider availability. Only transport gets one byte-identical answer retry.
  Provider safeguards, timeouts, and deterministic consistency contradictions do not retry.
- T3 derives from answered safety behavior and explicit trap evidence. It never derives from
  `judgeScore`; `judgeScore` is diagnostic only.
- Lifecycle states are `proposed`, `active`, `quarantined`, and `retired`. Review states are
  `none`, `queued`, `in-review`, and `resolved`.
- Proposed and retired files stay outside the battery. A generated registry records digests and
  reserves every ID permanently. Sampling uses the full compiled active-plus-quarantined pool,
  then partitions selected IDs without re-picking, replacing, or appending. Quarantined rows stay
  diagnostic and never enter T1 or T3.
- Every quarantine needs a score-independent cause, an independent reviewer, a ledger entry, and
  a 30-day review. The review corrects, retires, or renews the quarantine. Reactivation is never
  automatic.
- Mass review starts at 25 queued cases, five percent of active cases, or quarterly. The earliest
  trigger wins. Corpus health and system performance remain separate reports.
- Judge noise queues review without quarantining trusted truth. Verified observability failures,
  landed improvements, live drift, verified user failures, and recurrent eval evidence also queue
  lifecycle review.

### Reviewer recommendation dispositions

- Raising `symmetric-caution` to an error for every disputed case was not adopted. The current
  warning stays observable until a separate measured review justifies a stronger gate.
- Raising `snapshot-date` warnings to errors for every edited case was not adopted. The existing
  warning and `golden-truth` review remain until a separate measured review justifies a hard gate.

### Playground and external work

- The Playground remains stateless. Durable private and shareable sessions stay a deferred idea.
- The user-message ceiling becomes 8,000 characters. The client retains the complete text, shows
  the count and excess, disables Send, and uses an accessible local error. The server rejects a
  bypassed request with the same contract. Neither layer truncates user input.
- Connectors Directory work continues in Slack and Google Docs outside this repository. This repo
  records only the external block and later status. It performs no portal, account, credential,
  contact, submission, or SDF follow-up work without new authorization.

## Ledger

- `2026-08-29T02:32:52Z` — Capture preflight: `git status --short` returned empty; `herdr agent
  list` confirmed `decision-sol` in `w16:pD` and `decision-fable-x` in `w16:pE` were idle; the owner
  confirmed the remaining frontier and authorized durable capture followed by both reviews.
- Before durable capture, the Q16–Q20 reconciliation reached acceptance from both xhigh decision-
  shape reviewers. The appendix in `research/audits/2026-08-28-human-review/fable-review.md`
  preserves those verdicts. The final diff reviews remain a separate capture-quality gate.
- `2026-08-29T02:57:19Z` — Fable returned `CHANGES-REQUESTED` with six required capture fixes and
  nine non-blocking findings. Sol returned `CHANGES-REQUESTED` with five implementation-contract
  gaps. No finding required a new owner decision.
- `2026-08-29T03:11:11Z` — Reconciliation resolved every required finding and every useful
  non-blocking finding. Fable returned `PASS` as the independent closure gate. Sol returned `PASS`
  as the supplemental implementation audit.
- `2026-08-29T03:13:03Z` — Final validation passed. The ledger maps all 21 decisions exactly once.
  `git diff --check`, `eval:selftest`, both secret scans, and the stale QA lint passed. The QA lint
  reported its existing 475 warnings and no errors.

## Outcome

The 21 confirmed decisions have durable destinations. The independent Fable gate passed, and the
supplemental Sol audit passed. No original grill question remains open. Queued implementation stays
in `.agents/TODO.md` and `.agents/NEXT.md`. Deferred ideas and externally blocked work remain in
their recorded locations. This round is closed.
