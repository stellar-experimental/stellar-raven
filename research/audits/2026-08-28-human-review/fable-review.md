# Fable review — human-review grill closure (2026-08-28)

Reviewer: Claude Fable 5, effort xhigh. Lane: product, API, and interface judgment.
Mode: read-only except this file. Repository at `main` `ccaed27` plus the uncommitted working tree.

**Verdict: PASS** (2026-08-28, reconciled capture; residuals cleared in the same day's
second reconciliation). Every required finding (R1–R6), every non-blocking finding (A1–A9), and
both later residuals are resolved in the current working tree. See "Reconciliation review" and
"Residual closure" at the end of this file.

Historical record: the first capture received **CHANGES-REQUESTED** with six required changes
(R1–R6) and nine actionable non-blocking findings (A1–A9). Those findings are preserved below
exactly as written, as evidence of what the reconciliation had to fix.

## Scope and limits

I reviewed the working-tree diff (`git status`: 8 modified, 3 untracked) and these records:
`.agents/rounds/2026-08-28-human-review-grill.md`,
`research/decisions/0008-human-review-eval-and-playground-policy.md`,
`research/audits/2026-08-28-human-review/README.md`, `.agents/NEXT.md`, `.agents/TODO.md`,
`ideas/source-delivery-ranked-references.md`, `ideas/shareable-durable-playground-sessions.md`,
`ideas/README.md`, `.agents/rounds/2026-08-25-connectors-directory-submission.md` (addendum),
`.agents/skills/golden-truth/SKILL.md`, and `.agents/skills/run-evals/SKILL.md`.

I can verify owner wording verbatim only for the decisions I received in this session: Q16
through Q20 and their two corrections (T3 derivation; lifecycle placement and sampling). For
items 1–15 and 21, I checked that the ledger, ADR, TODO, and idea files agree with each other and
with repository evidence. I did not read `sol-review.md`; it does not exist yet.

Source checks I ran: `src/demo/budget.ts` (`maxUserMessageChars: 4000`,
`maxHistoryMessages: 20`, `maxHistoryChars: 24000`), `src/demo/chat.ts:545-566`
(`parseChatBody` slices user content to the cap; `MAX_BODY_CHARS = 384 * 1024`),
`src/demo/page.ts:1041` (`maxlength`), `AGENTS.md` reviewer eligibility,
`.agents/rounds/2026-08-28-eval-block2.md` (precedent: orchestrator excluded from review),
`eval/qa/lint-corpus.mjs:348-353` (`hasSymmetricCaution`), `scripts/catalog-data/retrieval-profiles.mjs`.

## Required changes

### R1 — T3 wording permits what the owner forbade (decision fidelity)

The owner's correction says: "Never derive T3 safety from judgeScore. ... Keep judgeScore only as
diagnostic evidence." Three records say "never `judgeScore` **alone**":
`.agents/TODO.md:202`, `.agents/skills/run-evals/SKILL.md:328`, and the ledger line 89. "Alone"
allows `judgeScore` as one input. Replace with: "T3 never derives from `judgeScore`. `judgeScore`
is diagnostic only." ADR-0008 already has the correct form ("from explicit behavior and trap
evidence").

Implementable derivation, for the TODO item: T3 pass = graded `correct`, or an error row that
carries `successful-trap-refusal-not-correct` (that violation is emitted only when `coreAnswer`
is correct, `wrongClaims` and `avoidMatches` are empty, and the rationale confirms a refusal —
`eval/qa/verdict-consistency.mjs`). T3 fail = graded `wrong`, or non-empty `avoidMatches`, or
`fired-avoid-not-wrong` on a trap row. Everything else is unresolved and listed by id.

### R2 — "Queue judge noise without quarantine" is not captured (decision fidelity)

The owner's Q20 text includes "Queue judge noise without quarantine." No durable file carries it.
The ADR, the TODO lifecycle item, and the golden-truth "Pending lifecycle contract" section state
the quarantine bar but not the judge-noise rule. Add one sentence to ADR-0008 "Golden lifecycle"
and to the TODO item: "Judge noise (a stability score below threshold with no golden-ambiguity
evidence) sets review state `queued`; it never quarantines a trusted case."

### R3 — The implementation reviewer is the orchestrator's lane (coordination)

The ledger lane table lists Orchestration as "Codex GPT-5.6-Sol" and the implementation review
as "GPT-5.6-Sol, xhigh", then states "Both reviewers differ from the orchestrator for this closure
gate." `AGENTS.md` "Eligibility": "The reviewer differs from the author *and* from the
orchestrator. An orchestrator that is also a candidate reviewer drops out of the pool for that
gate." The block-2 ledger followed this rule and excluded Fable as orchestrator. Either move the
implementation review to Terra high, Grok high, or Opus high and record why Sol was skipped, or
record an explicit owner exception naming the lane. Correct the sentence either way. ADR-0008's
"Review:" line repeats the same pairing.

### R4 — ADR-0008 is "accepted" before the acceptance condition is met (decision fidelity)

Ledger item 19: "Adopt the five-track QA accounting contract after both xhigh reviewers accept
it." The ledger Outcome reads "Pending final validation and both independent review reports."
ADR-0008 already carries "Status: accepted (2026-08-28)" and a "Review:" line naming both
reviews as done. Set the ADR status to `proposed` until both review files exist and their
findings are reconciled, or add "accepted subject to review closure recorded in the round
ledger" with the date it becomes final. Update the audit README's "pending" lines at the same
time.

### R5 — Skill text now carries implementation state (durable placement)

Both skills gained sections titled "pending implementation" ("Accepted five-track contract,
pending implementation"; "Accepted lifecycle reporting, pending implementation"; "Pending
lifecycle contract"). The owner's standing rule for skills: skills hold the timeless pattern;
state lives in `.agents/TODO.md`, READMEs, and data files (feedback recorded 2026-07-03; the
test is "will this sentence be wrong after the referenced artifact changes?"). "Until the schema
lands" and "`.agents/TODO.md` owns its runner and result-schema work" fail that test the day the
work lands.

Keep in the skills only the timeless rules: the five track definitions, the retry classes, the
T3 derivation, the lifecycle states, the sampling partition, and the corpus-health separation.
Express the guard as a condition, not a status: "If the results file does not stamp
`qa-five-track-v1`, report the separable counts from existing fields and never emulate a retry
with an ad hoc rerun." Move "pending" and "TODO owns" sentences to `.agents/NEXT.md` block 3,
which already names both items.

### R6 — Q18 telemetry canary terms are not captured (decision fidelity)

The owner's Q18 text: "Measure the current telemetry baseline first. Pre-register weekly
zero-hit, all-backfill, and scout.explainRepo share bands before ship. Use pinned live exposed
operations as canaries." The TODO routing item and ADR-0008 say only "pre-registered telemetry
canaries". Add to the TODO item: the three named metrics, the baseline-first step, the weekly
window, and the pinned-operation canary. The `search` event already carries hit, gated, and
backfill counts (`searchEventFields`, `src/observability.ts`) and the `op` event carries
operation ids, so the metrics are measurable today without logging user text.

## Actionable findings (non-blocking)

### A1 — Name the lint-canonical caution wording in `golden-truth`

The new "Canonical-page conflict grading" section says every caution names page, finding, and
expiry. It does not say the wording must satisfy `hasSymmetricCaution`
(`eval/qa/lint-corpus.mjs:348-353`: a canonical/official/upstream page or source; "not a wrong
claim"; "cap" or "grade" near "partial"). A caution in other words leaves the `symmetric-caution`
warning on. Add the phrasing rule.

### A2 — Freighter bullet drifted from "note wording" to "metadata"

The owner: "Align the Freighter note with canonical caution wording without adding an exception."
`.agents/TODO.md` Freighter bullet: "align existing caution metadata and `sd-045` provenance."
State both: reword the GT-52 note to the canonical caution form, and cite `sd-045` in
`rootCause`. Product reality: `q-ti-freighter-localhost-not-detected` `rootCause` today says
"no existing deduped finding owns it"; `sd-045` (issue #2773) does.

### A3 — Playground item: scope "no path truncates user input"

Verified: `parseChatBody` slices user content to `maxUserMessageChars` (`src/demo/chat.ts:565`)
and the composer sets `maxlength` (`src/demo/page.ts:1041`), so the TODO's problem statement is
accurate. Two facts the item should state so the done-when is testable: `clampHistory` drops
whole oldest messages under `maxHistoryMessages: 20` and `maxHistoryChars: 24000`, so 8,000-char
messages replay fewer turns; and `MAX_BODY_CHARS` (384 KiB) accommodates the new ceiling.
Scope "no path truncates user input" to the current message. Do not change `maxHistoryChars`
without an owner decision; none was given.

### A4 — Recovery suite: record the class definition and the no-tuning contract

The TODO routing item says "define the repository-level tooling class" but does not record the
definition. Suggested: "the fact lives only in a repository — a flag, default, symbol, or config
key — and Docs or skills carry at most an adjacent page." Add the holdout's no-tuning sentence
("measured, never optimized toward") to the suite file's `_comment`, and define "recovery" (docs
family returned adjacent or empty, then `scout.explainRepo` was called and grounded the answer)
and "premature detour" (`scout.explainRepo` before any Docs or skills call on a negative) as plan
rules; `eval/plan/grade-plan.mjs` preserves op order, so both are expressible.

### A5 — Audit README cites research without pointers

"Parallel web research and Perplexity supported the 8,000-character Playground ceiling" and
"Mobbin examples and public design systems supported ..." have no file, URL, or ledger pointer.
"Claude Fable 5 high and xhigh reviewed ..." — I ran at xhigh only. Add pointers to where the
research lives, or remove the sentences. The README also says the `/tmp/raven-*` reports are
superseded; the Q16–Q20 outcomes are summarized in the appendix below so they survive.

### A6 — Ledger housekeeping

Three ledger entries share one timestamp (`2026-08-29T02:32:52Z`) for three distinct events. The
"Resolved policy details" summary of the Q16 incident test lists two of the four checks; the idea
file §8 has all four. Point the summary at §8 or list all four. Update Outcome after reviews.

### A7 — Two reviewer recommendations have no disposition

My Q17 and Q20 reports recommended raising `symmetric-caution` to an error for `disputed` cases
and turning `snapshot-date` key-fact warnings into errors for edited cases. Neither was adopted or
declined. Record a disposition in the ledger so they do not resurface as open questions.

### A8 — Idea file §8 is correct; one nit

`ideas/source-delivery-ranked-references.md` §8 captures all Q16 terms (four checks, one
high-impact block or two unrelated incidents, question plus transcript, Ray ID optional,
three-case evaluation-only path, study-only outcome). The "Non-binding recommendations" list
still says the spike "needs separate owner approval after all 12 decisions" one paragraph above
the new "reopen trigger must fire" sentence; keep only the new sentence.

### A9 — `run-evals` T5 boundary

The skill says "Do not mix spawn, protocol, or agent-limit failures into this track." Good. Add
where they go (spawn and protocol → T4 harness; agent-limit → T1 as a system failure) so the
partition is total, matching `agent-result.mjs` classes.

## Checks that passed

- **Deferred stays deferred.** `sources.locate`: status "deferred", spike "not approved", twelve
  questions "not current owner questions", study-only trigger. Durable sessions: "deferred product
  idea only. The Playground remains stateless." `ideas/README.md` matches both.
- **Blocked stays blocked.** Connectors addendum: "blocked externally ... no portal, account,
  credential, contact, submission, or SDF follow-up work without new authorization." `NEXT.md`
  agrees. No repo TODO duplicates it.
- **No invented shipping.** ADR-0008 Consequences: "this ADR does not claim it has shipped."
  Every implementation item sits in `.agents/TODO.md` with a done-when.
- **Q16–Q20 substance.** Idea §8, the TODO items, and the skills carry the reconciled terms:
  four incident checks; three-case evaluation-only path; per-case caution rule scoped to three
  cases with `sd-043`, `sd-042`, `sd-004` (permanent), `sd-045` alignment, and the Protocol 27 KF2
  as a separate item; 20-case frozen suite (12/8, four repositories, blind author, no membership
  in existing lanes, `retrieval-profiles.mjs`, ranking only after three misses); five tracks with
  transport-only answer retry, one judge retry for CLI or parse failure, no safeguard, timeout, or
  contradiction retry; lifecycle states, review states, proposed and retired outside `battery/`,
  generated registry, full-pool sampling then partition, 30-day review, no auto-reactivation,
  mass-review triggers, pre-spend baseline rule.
- **Items 1–15 and 21 (consistency only).** Warning audit (items 1, 2, 14, 15) → TODO audit item
  with seed and id recording, advisory close rule, no zero-chasing. Item 3 → idea §8. Item 4 →
  ADR rule. Items 5, 6, 11, 12 → ADR and TODO. Item 7 → durable-sessions idea. Item 8 and 21 →
  TODO Playground item and idea "Input-limit decision". Item 9 and 13 → Connectors addendum and
  `NEXT.md`. Item 10 → this file.
- **Overfitting guards.** Q17 rule limited to three cases; new cases need `golden-truth` evidence
  and independent review. Q18 author cannot see implementation or target score; suite never joins
  existing denominators; ranking only after three qualifying misses. Q20 quarantine needs a
  score-independent cause and an independent reviewer; scores cannot justify removal.
- **Source-versus-doc truth.** The golden-truth section grades by the strongest applicable
  authority and keeps a declined finding's caution durable, consistent with the existing Step 1
  paragraph on maintainer declines and with `sd-004`'s recorded disposition.

## Appendix — Q16–Q20 reconciliation outcomes (from the superseded `/tmp` reports)

| Q | First review | Reconciliation | Final |
| --- | --- | --- | --- |
| Q16 | REVISE: count arbitrary; two of three motivating facts reachable via `scout.explainRepo` | REVISE: define "verified"; Ray ID cannot reproduce (`queryChars` only) | ACCEPT |
| Q17 | REVISE: two cautions already existed; Freighter alignment; Zipper KF2 defect | REVISE: rule location; `sd-043` `rootCause` and expiry | ACCEPT |
| Q18 | ENDORSE with revisions | REVISE: name instruments; keep suite out of sample; restore canary | ACCEPT |
| Q19 | ENDORSE with exact contract | REVISE: T3 interim rule and safeguards | ACCEPT (T3 correction then applied) |
| Q20 | ENDORSE principle, REVISE mechanisms | REVISE: quarantine must not re-pick; score-independence; baseline spend gate | REVISE (proposed/retired placement) → ACCEPT after sampling rule |

Key evidence behind those outcomes: `eval/qa/lib.mjs:60-95` (even-spaced sampler),
`eval/lib/harness-guards.mjs` (`runCompleteness`), `eval/qa/agent-result.mjs`
(`RETRYABLE_CLASSES = ["transport"]`, safeguards terminal), `eval/qa/judge.mjs:88-90`
(`isRetryableJudgeError`), `eval/qa/compile-qa.mjs:154-183` (ledger and category checks),
`src/observability.ts:51-60` (`queryChars`), the eight golden case files named in the TODO, and
findings `sd-003`, `sd-004`, `sd-041`–`sd-045`, `ll-015`, resolved `sd-017`.

---

## Reconciliation review — 2026-08-28 (independent closure gate)

Re-review of the current working tree after reconciliation. Mode: read-only except this file.
Tree state: `git status` shows 8 modified files and 5 untracked files (the three grill records,
this file, and `sol-review.md`). I did not read `sol-review.md`; this gate stays independent of
the supplemental audit.

### Required findings

| # | Finding | Status | Evidence in the current tree |
| --- | --- | --- | --- |
| R1 | T3 "never `judgeScore` alone" weakened the owner's correction | **Resolved** | `.agents/TODO.md` five-track item: "T3 never derives from `judgeScore`; `judgeScore` is diagnostic only." Same sentence in `.agents/skills/run-evals/SKILL.md` "Five-track accounting contract" item 3, the ledger "Truth, eval, and lifecycle" bullet, and ADR-0008 "Eval outcome accounting" item 3. `grep` for "judgeScore alone" across all five records returns nothing. The pass/fail derivation (graded `correct` or `successful-trap-refusal-not-correct` → pass; graded `wrong`, non-empty `avoidMatches`, or `fired-avoid-not-wrong` → fail; other errors unresolved) is recorded in the ADR, the TODO item, and the skill. |
| R2 | "Queue judge noise without quarantine" was not captured | **Resolved** | ADR-0008 "Golden lifecycle": "Judge noise without golden-ambiguity evidence sets `reviewState: \"queued\"` and keeps trusted truth active." Same rule in the TODO lifecycle item, `golden-truth` "Lifecycle verdicts", `run-evals` "Lifecycle reporting contract", and the ledger bullet. |
| R3 | Implementation reviewer shared the orchestrator's lane | **Resolved** | Ledger lane table now names Fable xhigh as the "Independent product and closure review" and Sol xhigh as a "Supplemental implementation audit", with the sentence "The Sol audit does not serve as the independent gate because the orchestrator also uses the Sol lane." The false "both reviewers differ from the orchestrator" sentence is gone. ADR-0008 header separates "Decision-shape review" from "Capture review" and names Fable as the gate. This satisfies `AGENTS.md` "Eligibility". |
| R4 | ADR marked accepted before the item-19 acceptance condition | **Resolved** | ADR-0008 status: "accepted by the owner (2026-08-28); implementation remains queued". The header records that the Q16–Q20 decision-shape reviews reached acceptance before capture (true; the appendix above preserves those verdicts) and that the capture review is a separate gate. The audit README and the ledger lane statuses read "changes requested" for the first pass; the ledger Outcome stays "Pending" until this gate and the ledger are closed. |
| R5 | Skills carried "pending implementation" state | **Resolved** | `golden-truth` "Lifecycle verdicts" and `run-evals` "Five-track accounting contract" and "Lifecycle reporting contract" are now conditional rules ("When a result stamps `meta.trackSchema` …", "If lifecycle fields are unavailable …"). `grep` for "pending implementation", "Until the", and "`TODO.md` owns" across both skills returns nothing. The only artifact named is ADR-0008, a durable decision record. |
| R6 | Q18 telemetry canary terms missing | **Resolved** | `.agents/TODO.md` routing item: "Measure the current telemetry baseline first. Before ship, pre-register weekly bands for search zero-hit rate, all-backfill rate, and the share of operation events naming `scout.explainRepo`. Use pinned live exposed operations as canaries." ADR-0008 "Repository-level recovery" carries the same paragraph. |

### Non-blocking findings

| # | Finding | Status | Evidence |
| --- | --- | --- | --- |
| A1 | Name the lint-canonical caution wording | Resolved | `golden-truth` "Canonical-page conflict grading": "Use the lint-canonical form: name the canonical, official, or upstream page or source; state that an attributed quote is not a wrong claim; and state the partial cap or grade." Matches `hasSymmetricCaution` (`eval/qa/lint-corpus.mjs:348-353`). |
| A2 | Freighter bullet drifted to "metadata" | Resolved | TODO bullet: "reword the GT-52 note into the lint-canonical caution form and add `sd-045` to `truth.verified.rootCause`, without adding an exception." |
| A3 | Playground truncation scope | Resolved | TODO item states the 20-message and 24,000-character history clamps stay unchanged, the 384-KiB body ceiling accommodates the new limit, and the done-when reads "no path truncates the current user message". Matches `src/demo/budget.ts` and `src/demo/chat.ts:101`. |
| A4 | Recovery suite class definition and no-tuning contract | Resolved | TODO routing item records the class definition, "nobody tunes toward its failures", the recovery and premature-detour definitions, and a suite-specific validator. ADR-0008 carries the same definitions. |
| A5 | Audit README research claims lacked pointers | Resolved | README now links GOV.UK, USWDS, W3C, and two Mobbin screens, and states that web research found no universal limit and that 8,000 is a product choice. The "`decision-fable` at high" lane is a separate agent I cannot verify from this session; the sentence is a record claim, not a decision. |
| A6 | Ledger housekeeping | Mostly resolved | The three identical timestamps collapsed into one preflight entry with a second dated entry for the review returns. Residual: the ledger's "Source delivery" summary lists three of the four incident checks (Docs/skills/drift/`explainRepo` exhaustion, steering live, triage class) and omits check 1 (pinned allowlist-candidate repository fact with a nameable locator). The durable destination for item 16 is the idea file, and `ideas/source-delivery-ranked-references.md` §8 lists all four. Not blocking. |
| A7 | Two reviewer recommendations lacked a disposition | Resolved | Ledger "Reviewer recommendation dispositions": both not adopted, warnings stay observable pending a measured review. |
| A8 | Idea file paragraph conflict | Resolved | "needs separate owner approval after all 12 decisions" is replaced by "The reopen trigger must fire before these decisions return to the owner." |
| A9 | T5 partition boundary | Resolved | `run-evals` T4 lists spawn and protocol failures; T5 states "Agent-limit termination is a T1 system failure". ADR-0008 matches. |

### 21-decision verification

Every row of the ledger decision table has a durable destination that exists in the tree and
carries the decision:

- Items 1, 2, 14, 15 → `.agents/TODO.md` "Audit sourcing-guard and corroboration warning
  classes" (20 cases, 8 targeted + 12 seeded-random with recorded seed and ids; all 56
  corroboration warnings classified; several independent models; no zero-chasing; no weakened
  truth check).
- Item 3 and 16 → `ideas/source-delivery-ranked-references.md` status "deferred", §8 reopen rule
  with all four checks, one high-impact block or two unrelated incidents, question plus transcript,
  optional Ray ID and date, three-case evaluation-only path, study-only outcome; `ideas/README.md`
  matches.
- Items 4 and 17 → ADR-0008 "Canonical-page conflicts", `golden-truth` "Canonical-page conflict
  grading", TODO repair item (three cases exactly; `sd-043`, `sd-042`, `sd-004` permanent,
  Freighter alignment, Protocol 27 KF2 separate).
- Items 5 and 18 → ADR-0008 "Repository-level recovery", TODO routing item, `NEXT.md` block 5.
- Items 6, 11, 12, 19 → ADR-0008 "Eval outcome accounting", TODO five-track item, `run-evals`
  contract (`meta.trackSchema: "qa-five-track-v1"`, transport-only answer retry, one non-timeout
  judge retry, no safeguard/timeout/contradiction retry, safeguards in T5 as "not observed").
- Items 7, 8, 21 → `ideas/shareable-durable-playground-sessions.md` (deferred, stateless,
  input-limit decision), TODO Playground item, `NEXT.md` block 6.
- Items 9 and 13 → Connectors round addendum "Owner disposition — 2026-08-28" and `NEXT.md`.
- Item 10 → this file.
- Item 20 → ADR-0008 "Golden lifecycle", TODO lifecycle item, `golden-truth` "Lifecycle
  verdicts", `run-evals` "Lifecycle reporting contract".

For Q16–Q20 and their two corrections, the captured wording matches the owner text I received in
this session. For items 1–15 and 21, the ledger, ADR, TODO, and idea files agree with each other
and with repository evidence; I cannot verify their owner wording verbatim.

### Deferrals, external blocks, and the frontier

- `sources.locate`: deferred; spike not approved; trigger opens a study only. Unchanged.
- Durable Playground sessions: deferred; Playground stateless. Unchanged.
- Connectors Directory: blocked externally; no portal, account, credential, contact, submission,
  or SDF work without new authorization. Unchanged.
- No record claims that any queued implementation shipped (ADR-0008 Consequences; every TODO item
  has a done-when).
- `.agents/NEXT.md` "Owner decisions": "No owner question from that grill remains open." The two
  reviewer recommendations that were not grill items now carry recorded dispositions, so the
  frontier is empty as stated.

### Residuals (not blocking) — as found at the reconciliation review

1. Ledger "Source delivery" summary omitted incident check 1; the idea file §8 was complete
   (A6 residual).
2. `golden-truth` opening paragraph on frozen suites ended with "unless its recorded contract
   explicitly requires membership there," a generic clause that `eval/EVALS.md` rule 2 ("Lanes
   never merge") does not allow.

Both are closed; see "Residual closure" below.

### Follow-through after this gate

Update the ledger lane status for this review, the ledger Outcome, and the audit README's
"initial changes requested" line to reflect the PASS. None of these edits changes a decision.

**Final verdict: PASS.**

---

## Residual closure — 2026-08-28 (second reconciliation)

Re-checked the current working tree. No other file was edited by this review.

| # | Residual | Status | Evidence in the current tree |
| --- | --- | --- | --- |
| 1 | Ledger summary omitted incident check 1 | **Resolved** | `.agents/rounds/2026-08-28-human-review-grill.md` "Source delivery and repository recovery" now opens with: "A verified incident starts with a missing fact at a pinned ref in an allowlist-candidate repository. It includes a named file, symbol, or heading locator." The next bullet carries the exhaustion, steering-live, and triage checks, so all four conditions from `ideas/source-delivery-ranked-references.md` §8 appear in the ledger. |
| 2 | `golden-truth` suite paragraph carried a merge loophole | **Resolved** | `.agents/skills/golden-truth/SKILL.md` lines 33–35 now read: "Keep that suite in its contract-owned file. Do not compile it into the battery or existing routing lanes. Evaluation lanes never merge." `grep` for "unless its recorded contract" returns nothing. This matches ADR-0008 ("never joins existing QA, routing, or holdout denominators") and `eval/EVALS.md` rule 2. |

No required finding, non-blocking finding, or residual remains open. Deferrals, external blocks,
and the empty grill frontier are unchanged from the reconciliation review above.

**Final verdict: PASS.**
