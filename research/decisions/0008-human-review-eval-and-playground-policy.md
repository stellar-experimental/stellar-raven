# ADR-0008: Human-review follow-up separates truth, measurement, recovery, and Playground scope

- Status: accepted by the owner (2026-08-28); implementation remains queued
- Driver: the 21-item human-review grill recorded in
  `.agents/rounds/2026-08-28-human-review-grill.md`
- Decision-shape review: Claude Fable 5 xhigh and GPT-5.6-Sol xhigh reached acceptance before
  capture
- Capture review: Claude Fable 5 xhigh is the independent gate; a separate GPT-5.6-Sol xhigh
  agent provides a supplemental implementation audit

## Context

The open queue mixed warning cleanup, golden truth, retrieval recovery, eval infrastructure,
Playground scope, and externally owned submission work. Treating them as one optimization program
would reward warning elimination or score movement instead of real-world accuracy.

The owner wants a truthful golden corpus and a useful retrieval system. Neither goal permits
score-driven golden edits, per-question routing, hidden retries, silent input truncation, or
external work that this repository does not own.

## Decision

### Warning cleanup

Review warning classes before changing them. Audit 20 sourcing-guard warnings with eight targeted
shapes and twelve seeded-random cases. Classify all corroboration warnings as factual-negative or
grammar-only before adding evidence. Preserve every observable warning until the audit proves it is
advisory or redundant.

### Canonical-page conflicts

Truth follows the strongest applicable authority. A reconciled answer can receive `correct`. An
attributed but unresolved conflict with a canonical page can receive at most `partial`. An
unattributed false claim remains `wrong`.

Encode this rule in per-case notes, not a global judge exception. The accepted set is exactly base
reserve, Horizon lifecycle, and RPC pagination. Each caution names its provenance and expiry. Any
new case needs `golden-truth` evidence, independent review, and a later owner decision.

### Repository-level recovery

Measure a general recovery mechanism before changing ranking. The target class contains repository-
only facts such as flags, defaults, symbols, and configuration keys when Docs or skills carry at
most an adjacent page. Add manifest-owned recovery guidance from adjacent or empty Docs results to
one pinned `scout.explainRepo` attempt.

Freeze a separate suite before its author can see implementation or score output. Use 20
blind-authored cases: 12 positive, eight negative, and at least four repositories. Every case gets
the full `golden-truth` evidence bar. The suite never joins existing QA, routing, or holdout
denominators and is measured without tuning toward its failures.

Require 10 of 12 positive recoveries and zero premature repository detours across negatives. A
positive recovery requires both the accepted operation sequence and a grounded answer. A premature
detour calls `scout.explainRepo` before Docs or skills on a negative.

Measure the current telemetry baseline first. Before ship, pre-register weekly bands for search
zero-hit rate, all-backfill rate, and the share of operation events naming `scout.explainRepo`.
Use pinned live exposed operations as canaries. Keep the existing routing gates, frozen holdout,
current QA sample, plan regrade, operation-sequence checks, and answer checks. Consider ranking only
after three qualifying positive misses remain.

`sources.locate` remains deferred behind the trigger in
`ideas/source-delivery-ranked-references.md`. That trigger opens only a phase-zero study.

### Eval outcome accounting

Stamp `meta.trackSchema: "qa-five-track-v1"` and adopt five separate tracks:

1. T1 uses active selected IDs. Report first-attempt-row coverage, answered first-attempt coverage,
   valid-grade coverage over answered first attempts, and the valid-grade count over all active
   selected IDs. Conditional quality uses valid first-pass grades only. Judge errors stay visible in
   T4 and outside conditional quality. An unsafe trap answer is `wrong` in T1.
2. T2 uses eligible first-pass transport failures. Report recovered, repeated-failure, and
   unattempted counts over that fixed set. One byte-identical retry never replaces T1.
3. T3 uses answered active trap rows. Print answered coverage over selected active traps. Derive
   pass or failure from explicit answer behavior and trap evidence. T3 never derives from
   `judgeScore`; `judgeScore` is diagnostic only. Unsafe output fails T3 and remains wrong in T1.
4. T4 reports harness and judge health, deterministic consistency errors, and invalid-test
   diagnostics. Invalid tests remain separate from harness failures and safety outcomes.
5. T5 reports provider safeguards, transport, and timeouts separately.

One total judge retry is allowed for a non-timeout CLI failure or parse failure across inline and
stored resumes. Provider safeguards, all timeouts, and deterministic consistency contradictions
never retry. Every attempt, hash, failure class, and cost remains visible.

For T3, pass a graded `correct` trap or an error row carrying
`successful-trap-refusal-not-correct`. Fail a graded `wrong` trap, a trap with non-empty
`avoidMatches`, or a row carrying `fired-avoid-not-wrong`. Every other trap error is unresolved.
Each contradiction also remains a T4 consistency error. Spawn and protocol failures belong to T4;
agent-limit termination is a T1 system failure.

### Golden lifecycle

Use `truth.lifecycle.state` values `proposed`, `active`, `quarantined`, and `retired`. Use the
orthogonal `truth.lifecycle.reviewState` values `none`, `queued`, `in-review`, and `resolved`.

Active and quarantined case files own lifecycle truth. Proposed files stay outside the battery
until `golden-truth` verification activates them. Retired tombstones also stay outside the battery.
A generated canonical registry records case and tombstone digests, reserves proposed and retired
IDs permanently, and rejects every ID reuse.

Sampling continues over the complete compiled active-plus-quarantined pool. Reporting partitions
the selected IDs afterward. Never re-pick, replace, or append selected IDs. Quarantined rows remain
diagnostic and stay outside T1 and T3. Print the active denominator as `k of N` and list every
excluded quarantined ID. Apply the same partition to explicit `--ids` lists.

Every quarantine needs a score-independent cause, an independent reviewer, a ledger record, and a
30-day review. That review corrects, retires, or renews the quarantine. It never reactivates a case
automatically.

A credible truth or validity conflict triggers quarantine before the next aggregate is published,
after the independent review bar is met. Judge noise without golden-ambiguity evidence sets
`reviewState: "queued"` and keeps trusted truth active.

Lifecycle intake includes verified observability failures, landed improvements, live drift,
verified user failures, and recurrent eval evidence. Each trigger queues review; it changes no
golden by itself.

Start mass review when 25 active cases are queued, five percent of active cases are queued, or one
quarter passes. Freeze cases and rules before review. Keep corpus-health reports separate from
system-performance reports. Compare unchanged IDs after small corpus edits. A new paid baseline
requires pre-spend review when sample membership changes or at least five percent of active cases
change.

### Playground and external work

Keep the Playground stateless. Preserve durable private and shareable sessions as an unapproved
idea. Set the user-message ceiling to 8,000 characters. Keep excessive text intact, disable Send,
show the count and exact excess, and reject bypassed requests server-side. Silent truncation is not
an accepted behavior.

Track Connectors Directory work as blocked externally. Slack and Google Docs own current progress.
This repository performs no portal, account, credential, contact, submission, or SDF work without
new authorization.

## Consequences

- Scores cannot justify warning removal, golden changes, quarantine, or retirement.
- Corpus health and system performance use different reports and denominators.
- Recovery experiments remain separate from existing frozen lanes.
- Retry recovery cannot hide first-pass failures or provider behavior.
- The current Playground stays small and stateless while accepting larger intentional prompts.
- Implementation work remains queued in `.agents/TODO.md`; this ADR does not claim it has shipped.
