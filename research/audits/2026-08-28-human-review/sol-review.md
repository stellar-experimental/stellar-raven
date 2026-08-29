# Sol implementation and eval review — 2026-08-28

## Verdict

**PASS**

The package records all 21 item numbers. It also removes every stale owner question.

The reconciliation resolves all five initial findings. No confirmed contract remains incomplete.

The implementation remains queued. The package does not claim that the new behavior has shipped.

The initial audit remains below as historical evidence. The dated reconciliation section gives the
final current result.

## Scope and method

The fixed point was `HEAD`. I reviewed the complete working-tree diff and every named file.

The reviewed durable files were:

- `.agents/rounds/2026-08-28-human-review-grill.md`
- `research/decisions/0008-human-review-eval-and-playground-policy.md`
- `.agents/NEXT.md`
- `.agents/TODO.md`
- `ideas/shareable-durable-playground-sessions.md`
- `ideas/source-delivery-ranked-references.md`
- `.agents/rounds/2026-08-25-connectors-directory-submission.md`
- `.agents/skills/golden-truth/SKILL.md`
- `.agents/skills/run-evals/SKILL.md`

I also checked `ideas/README.md` and the audit directory README. Their links and status labels are accurate.

I inspected current runner, compiler, sampler, judge, failure classifier, retrieval profiles, and Playground limits. I used no external system.

I did not use the other final reviewer report. This review remained independent.

## Initial decision coverage

This table records the first review. The reconciliation section supersedes its incomplete results.

| Item | Result | Evidence |
| --- | --- | --- |
| 1 | Captured | The TODO requires 20 sourcing-guard cases, including eight targeted and twelve seeded-random cases. |
| 2 | Captured | The TODO classifies all 56 corroboration warnings before edits. |
| 3 | Captured | The source-delivery idea marks all twelve questions and the spike as deferred. |
| 4 | Captured | ADR-0008 records the strongest-authority and attributed-conflict rule. |
| 5 | Incomplete | Finding F4 covers the missing recovery baselines and gates. |
| 6 | Incomplete | Findings F2 and F3 cover denominators and retry limits. |
| 7 | Captured | The Playground remains stateless. Durable sessions remain an unapproved idea. |
| 8 | Captured | The TODO specifies an 8,000-character fail-loud contract. |
| 9 | Captured | The Connectors addendum records an external block instead of a repo blocker. |
| 10 | Captured | The round requires independent Fable and Sol closure reviews. |
| 11 | Captured | T5 owns provider safeguards. T3 uses model-authored behavior only. |
| 12 | Incomplete | Finding F2 covers missing exact track accounting. |
| 13 | Captured | Slack and Google Docs own current Connectors work. |
| 14 | Captured | The warning audit forbids warning-count optimization and truth-check weakening. |
| 15 | Captured | The TODO requires several independent models and reconciliation. |
| 16 | Captured | The source-delivery idea contains all four incident checks and both reopen routes. |
| 17 | Incomplete | Finding F5 covers the three-case boundary and `sd-043` root cause. |
| 18 | Incomplete | Finding F4 covers the suite, canary, and provenance gaps. |
| 19 | Incomplete | Findings F2 and F3 cover accounting and retries. |
| 20 | Incomplete | Finding F1 covers lifecycle transitions, registry integrity, and exact sampling. |
| 21 | Captured | The client retains text, disables Send, reports excess, and the server rejects bypasses. |

## Initial findings

These findings describe the pre-reconciliation capture. The final section records their resolution.

### F1 — High — Q20 lacks the complete lifecycle and sampling contract

Locations:

- `research/decisions/0008-human-review-eval-and-playground-policy.md:67`
- `.agents/TODO.md:214`
- `.agents/skills/golden-truth/SKILL.md:209`
- `.agents/skills/run-evals/SKILL.md:340`

Observed evidence:

- No durable file names the required `truth.lifecycle` field.
- The registry requirement omits case digests and the explicit ID-reuse ban.
- No lifecycle method defines proposal activation or immediate quarantine triggers.
- No method queues judge noise while keeping a trusted case active.
- The trigger list omits observability, landed improvements, drift, user failures, and recurrent eval evidence.
- The sampling text omits the exact `k of N` output form.
- The sampling text does not forbid replacement or appending after selection.

Current code confirms that this work is pending. `compile-qa.mjs` walks only `corpus/battery`.

The compiler validates `truth.status`, but it has no lifecycle field. The runner stores only `truth.status` and optional `truth.asOf`.

Consequence:

An implementation can quarantine judge noise, omit registry digests, or change sample membership. Each outcome weakens QA or hides denominator changes.

Required correction:

1. State that active and quarantined cases use `truth.lifecycle` in each case file.
2. Define a separate review-state field with the four accepted values.
3. Generate a canonical registry with case digests and retired tombstone digests.
4. Reserve proposed and retired IDs permanently. State that an ID is never reused.
5. Keep proposed files outside the battery until `golden-truth` verification activates them.
6. Quarantine a credible truth or validity conflict immediately.
7. Queue judge noise without quarantine while the case truth remains trusted.
8. Add the five accepted evidence triggers to the lifecycle workflow.
9. Keep the accepted 30-day independent review and no-automatic-reactivation rules.
10. Sample the full active-plus-quarantined pool before partitioning.
11. Never re-pick, replace, or append selected IDs after partitioning.
12. Print the active denominator as `k of N` and list every excluded quarantined ID.

The explicit `--ids` partition, mass-review thresholds, and baseline rules are otherwise correct.

### F2 — High — Q19 does not define exact denominators or all outcome mappings

Locations:

- `research/decisions/0008-human-review-eval-and-playground-policy.md:54`
- `.agents/TODO.md:196`
- `.agents/skills/run-evals/SKILL.md:313`

Observed evidence:

- The documents require visible denominators, but they do not define each numerator and denominator.
- They do not state that an unsafe trap answer is wrong in T1 and failed in T3.
- They do not keep invalid tests separate from harness failures and unsafe outputs.
- They do not define one stable metadata field for the `qa-five-track-v1` stamp.

The current summary counts every row in one verdict denominator. The pending contract must replace that ambiguity before implementation.

Required correction:

1. Define selected coverage as first-attempt rows over active selected IDs.
2. Define authored coverage as answered first attempts over active selected IDs.
3. Define grading coverage as valid first-pass grades over answered first attempts.
4. Also print the grading count against all active selected IDs.
5. Define conditional quality over valid first-pass grades only.
6. Keep every judge-error row visible in T4 and outside conditional T1 quality.
7. Count retry recovery over eligible first-pass transport failures.
8. Report recovered, repeated-failure, and unattempted retry counts over that fixed set.
9. Define T3 over answered active trap rows and print answered coverage for selected active traps.
10. Mark unsafe trap output as a T3 failure and a T1 wrong answer.
11. Use explicit answer and trap evidence for successful refusals, never `judgeScore`.
12. Keep each related contradiction as a separate T4 consistency error.
13. Report invalid tests separately in corpus health or T4. Do not merge them into safety.
14. Define a stable result field that carries the exact `qa-five-track-v1` value.

These formulas preserve first-pass failures and keep conditional quality interpretable.

### F3 — High — The judge retry rule still permits timeout retries

Locations:

- `research/decisions/0008-human-review-eval-and-playground-policy.md:64`
- `.agents/TODO.md:206`
- `.agents/skills/run-evals/SKILL.md:335`
- `eval/qa/judge.mjs:79`
- `eval/qa/run-qa.mjs:683`

Observed evidence:

The confirmed rule says no timeout retries. The durable text narrows that ban to answer timeouts.

Current `isRetryableJudgeError` accepts every judge error without `judgeScore`. That set includes a judge CLI timeout.

`judgeStoredResults` selects such errors again. It also lacks a one-retry cap across repeated resumes.

Consequence:

The implementation can retry a judge timeout or retry one row more than once. Both actions violate the confirmed retry contract.

Required correction:

1. Exclude judge timeouts from the CLI retry class.
2. Permit one judge retry for non-timeout CLI failures or parse failures only.
3. Enforce one total retry across inline runs and stored resumes.
4. Preserve both attempts, hashes, failure classes, and costs.
5. Add tests for timeout exclusion and repeated-resume exhaustion.

### F4 — High — Q18 omits required pre-registration and truth-workflow details

Locations:

- `research/decisions/0008-human-review-eval-and-playground-policy.md:38`
- `.agents/TODO.md:139`
- `.agents/NEXT.md:69`
- `.agents/skills/golden-truth/SKILL.md:21`

Observed evidence:

- The documents mention telemetry canaries, but they omit the required baseline-first order.
- They omit weekly zero-hit, all-backfill, and `scout.explainRepo` share bands.
- They omit pinned live exposed operations as the canary inputs.
- The new suite requires `golden-truth`, but that skill currently owns only the battery path.
- The 10-of-12 recovery numerator does not explicitly require both sequence and answer checks.

The existing retrieval profiles already contain one RPC-specific `scout.explainRepo` edge. The new work must generalize from the defined class.

Consequence:

An implementation can select telemetry bands after release. It can also count tool calls without correct answers.

The separate suite can receive weaker truth review than the main battery. That outcome defeats the owner's frozen-suite safeguard.

Required correction:

1. Freeze the 20 blind-authored cases before implementation access or score access.
2. Route every suite golden through the `golden-truth` evidence bar.
3. Extend the skill and lint method to the separate suite without compiling it into existing corpora.
4. Measure the current telemetry baseline before changing recovery metadata.
5. Pre-register weekly zero-hit, all-backfill, and `scout.explainRepo` share bands.
6. Use pinned live exposed operations for every canary.
7. Count a positive recovery only when its operation sequence and answer both pass.
8. Keep 10 of 12 as the positive denominator and eight as the negative denominator.
9. Then change `scripts/catalog-data/retrieval-profiles.mjs` and regenerate the manifest.
10. Run every accepted offline, paid, holdout, QA, plan, and canary gate.
11. Consider ranking only after three qualifying positive misses remain.

This order prevents target leakage and protects users from premature repository detours.

### F5 — Medium — Q17 broadens the exception boundary and weakens one provenance action

Locations:

- `research/decisions/0008-human-review-eval-and-playground-policy.md:34`
- `.agents/TODO.md:90`
- `.agents/skills/golden-truth/SKILL.md:54`

Observed evidence:

ADR-0008 calls the three cases an initial set. It permits new cases after evidence and review alone.

The confirmed decision applies the exception to only three cases. It gives the other audited cases no exception.

The base-reserve TODO says to cite `sd-043`. It does not require `sd-043` in `truth.verified.rootCause`.

Consequence:

A later author can expand grading exceptions without another owner decision. The base-reserve repair can also leave incomplete provenance.

Required correction:

1. Require a later owner decision before any new case receives this grading exception.
2. Keep `golden-truth` evidence and independent review as required inputs for that decision.
3. Require `improvements/stellar-docs/sd-043-sponsored-reserves-min-balance-liabilities.md` in the base-reserve `truth.verified.rootCause`.

The Horizon, RPC, Freighter, and Protocol 27 actions are otherwise accurate.

## Correct current-versus-pending statements

The package correctly marks the following work as pending:

- The current QA runner makes one answer attempt.
- The current golden compiler has no lifecycle implementation.
- `sources.locate` does not exist and remains deferred.
- The current Playground is stateless.
- The current Playground limits user messages to 4,000 characters and truncates server-side.

The package does not claim that these changes shipped. The TODO and NEXT files place implementation work correctly.

## Durable placement and stale-question review

ADR-0008 is the correct long-term policy owner. The round ledger correctly preserves the 21-item history.

The TODO owns implementation work. NEXT gives a valid dependency order for the major blocks.

The five-track denominator work precedes lifecycle sampling. Repository recovery precedes any `sources.locate` study.

The two idea files correctly hold deferred product designs. The Connectors addendum correctly holds external status.

No stale owner question remains:

- The twelve source-delivery questions are explicitly deferred.
- The Connectors questions are explicitly external and blocked.
- The hackathon cluster question is an agent-owned truth task.
- The durable-session choices require future reactivation, not a current answer.

## Verification

The following checks passed:

- `git diff --check HEAD`
- Local Markdown target check across 11 reviewed files
- `npm run eval:selftest`
- `npm run eval:qa:lint -- --stale`: 0 errors and 475 expected warnings
- Eight focused test files: 181 tests passed

The focused tests covered agent failures, judge storage, measurement, verdict consistency, harness preconditions, and Playground limits.

I ran no paid eval, live probe, deployment, or external action. This review changed only this report.

## Reconciliation — 2026-08-28

### Final result

**PASS**

The current capture resolves F1 through F5. It preserves all 21 owner decisions.

No actionable finding remains. No new owner decision is necessary.

The policy, queue, skills, and deferred ideas now describe one consistent contract.

### F1 through F5 disposition

| Finding | Status | Current evidence |
| --- | --- | --- |
| F1 — lifecycle and sampling | Resolved | ADR-0008 defines both lifecycle fields, registry digests, permanent ID reservation, quarantine rules, and exact sampling at lines 92–123. `.agents/TODO.md:238` and both changed skills carry the implementation workflow. |
| F2 — exact five-track accounting | Resolved | ADR-0008 defines the T1, T2, and T3 populations at lines 65–90. `.agents/skills/run-evals/SKILL.md:313` defines every required coverage view and outcome mapping. |
| F3 — judge retry exclusions | Resolved | ADR-0008 lines 82–84 allow one total non-timeout CLI or parse retry. `.agents/TODO.md:224` and `.agents/skills/run-evals/SKILL.md:337` preserve the same limit across stored resumes. |
| F4 — repository recovery gates | Resolved | ADR-0008 lines 40–63 and `.agents/TODO.md:142` define the blind suite, baselines, telemetry bands, canaries, gates, and ranking threshold. |
| F5 — three-case conflict boundary | Resolved | ADR-0008 lines 30–38 fixes the exact set and requires a later owner decision for expansion. `.agents/TODO.md:90` names every case-specific repair and the exact `sd-043` root cause. |

### Exact denominators and outcome classes

The T1 row coverage numerator is the number of first-attempt rows.
The denominator is the number of active selected IDs.

The T1 answered coverage numerator is the number of answered first attempts.
The denominator is the number of active selected IDs.

The T1 grading coverage numerator is the number of valid first-pass grades.
The primary denominator is the number of answered first attempts.
The report also prints that numerator against all active selected IDs.

Conditional T1 quality uses valid first-pass grades only.
Judge errors remain ungraded in T1 and visible in T4.

T2 fixes its denominator at eligible first-pass transport failures.
Its three outcomes are recovered, repeated failure, and unattempted.

T3 uses answered active trap rows.
It prints answered trap coverage against selected active traps.
It derives safety from the answer and explicit trap evidence.
It never derives safety from `judgeScore`.

Unsafe trap output fails T3 and remains `wrong` in T1.
Provider safeguards are `not observed` in T3 and remain in T5.
Invalid tests remain separate from harness failures and safety outcomes.

The stable discoverability field is `meta.trackSchema: "qa-five-track-v1"`.
These rules appear in `.agents/skills/run-evals/SKILL.md:315` through line 344.

### Retry exclusions

The answer retry set contains first-pass transport failures only.
The retry uses byte-identical input and cannot replace T1.

The judge can retry one non-timeout CLI failure or parse failure.
This limit applies across inline runs and stored resumes.

Provider safeguards never retry. All timeouts never retry.
Deterministic consistency contradictions never retry.

Every attempt retains its input hash, answer hash, failure class, and cost.
The TODO requires retry tests for every permitted and forbidden class.

The current code does not yet enforce the new judge limit.
`eval/qa/judge.mjs:88` still includes timeouts in its retryable error set.
`eval/qa/run-qa.mjs:681` can still select those rows on a stored resume.

The ADR, TODO, and runbook mark this implementation as pending.
They do not report the current code as compliant.

### Lifecycle fields and sampling

Active and quarantined files use `truth.lifecycle.state`.
The accepted values are `proposed`, `active`, `quarantined`, and `retired`.

The separate review field is `truth.lifecycle.reviewState`.
Its values are `none`, `queued`, `in-review`, and `resolved`.

Proposed files remain outside the battery until verification activates them.
Retired tombstones also remain outside the battery.

The generated registry records case and tombstone digests.
It reserves proposed and retired IDs permanently.
It rejects every ID reuse.

Credible truth or validity conflicts enter quarantine before the next aggregate.
An independent reviewer must confirm a score-independent cause.
Judge noise queues review while trusted truth remains active.

The workflow includes all five accepted intake sources.
They are observability, improvements, drift, user failures, and recurrent eval evidence.

Each quarantine gets a ledger record and a 30-day independent decision.
The decision corrects, retires, or renews the quarantine.
The system never reactivates a case automatically.

Sampling first uses the full compiled active-plus-quarantined pool.
It then partitions selected IDs by lifecycle state.
It never re-picks, replaces, or appends IDs.

Active IDs form the performance set.
Quarantined IDs form the diagnostic set.
Quarantined IDs never enter T1 or T3.

The report prints the active denominator as `k of N`.
It also lists every excluded quarantined ID.
The same rule applies to explicit `--ids` lists.

The current compiler and runner have no lifecycle implementation.
`eval/qa/compile-qa.mjs:16` still compiles the battery directly.
`eval/qa/run-qa.mjs:964` still samples without lifecycle partitioning.

ADR-0008, `.agents/TODO.md`, and both skills state that this work is pending.

### Repository recovery gates

The plan defines repository-only flags, defaults, symbols, and configuration keys.
Docs or skills can contain an adjacent page, but not the required fact.

The frozen suite has 20 blind-authored cases across at least four repositories.
It contains 12 positive cases and eight negative cases.
The author remains blind to the implementation and every score.

Every suite golden uses the full `golden-truth` evidence bar.
The suite has its own validator and lint.
It never enters current QA, routing, or holdout denominators.

The plan measures the current telemetry baseline before the recovery change.
It pre-registers weekly bands before release.
The bands cover zero hits, all-backfill searches, and `scout.explainRepo` operation share.

Pinned live exposed operations supply the canaries.
The current telemetry already records search tier counts and exact operation IDs.

The implementation changes `scripts/catalog-data/retrieval-profiles.mjs` first.
It then regenerates the manifest.

The gate requires at least 10 of 12 positive recoveries.
Each recovery must pass its operation sequence and answer checks.
All eight negatives must avoid a premature repository detour.

The remaining gates cover offline routing, a paid live lane, and stored operation order.
They also cover answer quality, current routing gates, the frozen holdout, and current QA.
The current QA sample also receives its plan regrade.

Ranking can change only after three qualifying positive misses remain.
This order blocks case-specific tuning and premature `scout.explainRepo` routing.

The existing retrieval profile has one RPC-specific `scout.explainRepo` edge.
The queued work must implement the defined general class.

### Three-case grading boundary

The accepted exception set contains exactly three cases.
They are base reserve, Horizon lifecycle, and RPC pagination.

Each caution lives in the case's `golden.notes`.
No global judge exception is allowed.

The base-reserve repair puts
`improvements/stellar-docs/sd-043-sponsored-reserves-min-balance-liabilities.md` in
`truth.verified.rootCause`.

The Horizon repair replaces `sd-017` with `sd-042`.
It also repairs the disputed corroboration claim.

The RPC caution accepts attributed owner wording.
It still rejects universal immutability.
The `sd-004` caution remains permanent until another owner decision.

The Freighter repair aligns the caution wording without adding an exception.
Protocol 27 key fact 2 gets a separate `golden-truth` review.

Every caution names its expiry.
Any expansion needs new evidence, independent review, and a later owner decision.

### Q16 dependency and reopen rule

`sources.locate` remains deferred.
The Q18 recovery steering must ship and remain live first.

`ideas/source-delivery-ranked-references.md:369` records all four incident checks.
It also records both live-incident thresholds and the evaluation-only threshold.

Every incident needs the question and transcript.
A Ray ID and date are added when available.

The trigger opens a phase-zero study only.
No trigger authorizes implementation.

### Dependency order and durable placement

ADR-0008 remains the canonical policy owner.
The round ledger preserves the numbered 21-item history.

`.agents/TODO.md` owns the implementation contracts and completion gates.
`.agents/NEXT.md` places five-track accounting before lifecycle sampling.

The repository recovery block precedes every `sources.locate` study.
The recovery block measures telemetry before it changes recovery metadata.
Ranking remains after the recovery experiment.

The two idea files own deferred product designs.
The Connectors addendum owns the external block.
The two skills own repeatable truth and eval workflows.

This placement avoids duplicate current-behavior claims.
It also keeps historical reasoning in the ADR and round ledger.

### Decision coverage and stale questions

The round table contains items 1 through 21 exactly once.
Each item points to a durable destination.

`.agents/NEXT.md:90` states that no grill question remains open.
The twelve source-delivery questions are explicitly deferred.

The Connectors questions are external and blocked.
The durable-session choices need a future reactivation decision.

No stale owner question remains in the current work queue.

### Verification after reconciliation

The following checks passed on the reconciled capture:

- `git diff --check HEAD`
- Local Markdown target check across 11 reviewed files
- The 21-item mapping check
- `npm run eval:selftest`
- `npm run eval:qa:lint -- --stale`: 0 errors and 475 expected warnings

The reconciliation changed policy and planning documents only.
It did not change runner, compiler, judge, sampler, retrieval, or Playground code.

I ran no paid eval, live probe, deployment, or external action.
This reconciliation changed only this report.
