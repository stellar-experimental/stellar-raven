# TODO — own-repo work queue

Own-repo fixes only: adapters, normalizers, catalog, executor, scoring, eval instruments, goldens,
gates, and documentation. Upstream service defects go to `improvements/` instead — see
`improvements/README.md` for the routing rule.

Add an item when you find work you are not doing now. Delete it when it is done; git history is the
archive. Each item states what is wrong, how it was found, and what "done" means.

## Golden corpus

### Golden authoring lint warnings burn-down

The 2026-08-27 deep-dive merge created a historical baseline of 1,390 warnings. Two reviewed
burn-down sessions reduced that baseline to 475 warnings. The current total contains 372 long-fact
warnings across 204 cases, 47 sourcing-guard warnings, and 56 corroboration warnings.

The session-2 helper pack under `/tmp/raven-qadeep/gt2/` expired after the host restart. Build a
fresh pack from current `main`; do not claim that it reproduces the expired files. Use about 50
worker prompts, with four cases per prompt and three review parts. Use three Sol high workers and
one independent Grok high reviewer.

Each case report must state `Claims kept`, `moved to avoid`, or `none dropped`. The reviewer must
check every claim. New numbers, versions, dates, abbreviations, and taxonomy distinctions require
special review. The lost `q-soroban-publish-events` stray draft was unreviewed and is not evidence.

Run this gate sequence for each commit: compile, register, reconcile, lint with `--since`,
typecheck, test, build, secrets scan, then commit. `program-log.md` contains the durable session-2
method and failure history.

Done when: long-fact warnings are zero, all changed facts have required source verification, every
review finding is reconciled, and all gates pass. The separate audit below owns the 47 sourcing and
56 corroboration warnings.

### Audit sourcing-guard and corroboration warning classes

The owner approved an evidence-first audit on 2026-08-28. Do not treat a lower warning count as the
goal. Preserve useful warnings and remove only demonstrated cruft.

For the 47 sourcing-guard warnings, inspect 20 cases: eight targeted warning shapes and twelve
seeded-random cases. Record the seed and selected IDs before review. If the random cases are clean,
keep the warning class advisory and close the class without chasing zero.

For all 56 corroboration warnings, classify each warning before editing. A real negative factual
claim needs the `golden-truth` evidence bar. A grammar-only restriction needs no fabricated
corroboration row. Use several independent models and reconcile every disagreement.

Done when: a durable audit records every selected or classified ID, each warning has a disposition,
any gospel edit passes `golden-truth`, no truth check is weakened, and the full gate sequence passes.

## Improvements backlog

### Remove a blockquote marker from generated improvement titles

`oneLineTitle` preserves a leading `>` from the first Markdown paragraph. The generated
`improvements/INDEX.md` title for `sd-036` therefore starts with `>`. This is a presentation defect,
not a finding-state defect.

Add a regression test to `test/improvements-resolve.test.ts`, fix the shared title helper, and
regenerate the index. Do not replace `scripts/improvements-resolve.mjs`'s global GitHub-reference
matcher with the non-global `GITHUB_EVIDENCE_REF_RE`. A later refactor needs a shared extraction
helper if it removes that private matcher.

Done when: generated titles remove a leading blockquote marker, the resolver tests pass, and the
index comes only from `npm run improvements:index`.

### Watch Stellar-Light/stellarlight#1031 for the maintainer close

`sls-074` was retired on 2026-08-28 after a live verification comment
(https://github.com/Stellar-Light/stellarlight/issues/1031#issuecomment-5455030587). The issue was
still open at retirement. Untouched open issues stay quiet; do not post reminders.

Done when: the next improvements round records the issue state. No action if it is closed.

## Goldens

### Prevent invalid Stellar strkeys in golden imports

The 2026-07-11 `q-defi-wisdomtree-crdt` import contained an invalid issuer and an invalid SAC.
Both identifiers failed CRC16 validation, so the error was a transcription defect rather than freshness drift.

Found 2026-08-26 during the independent review of `lane/corpus-goldens-20260825`.

Done when: golden authoring validates exact Stellar strkeys before import, with positive and negative tests for account and contract keys.

### Replace expired temporary evidence in golden truth metadata

Active corpus evidence contains 97 temporary-path references across 94 files. Twenty-seven files
cite the session-2 Grok reviews under `/tmp/raven-qadeep/gt2/`; `program-log.md` preserves their
finding summaries. Sixty-nine files cite the deleted Fable report `conversions-copy-review.md`,
whose full report is not recoverable. Three files belong to both groups.

One additional file cites `/tmp/raven-qadeep/review-judge.md`. Its durable counterpart is
`research/qa-deep-dive-2026-08-25/review-judge.md`.

Do not replace these paths with an unreviewed bulk edit. Reverify the 69 Fable-reviewed facts with
the `golden-truth` workflow. Migrate the 27 session-2 references through a dedicated metadata-only
review, or during the next verified touch of each case.

Done when: no active corpus evidence names a temporary path, every replacement is re-walkable from
the repository or a live primary source, the consistency register is reconciled, and all
golden-truth gates pass.

### Repair the reviewed canonical-page conflict cases

ADR-0008 accepts a narrow grading rule: a reconciled answer may be correct; an attributed but
unresolved canonical-page conflict caps at partial; an unattributed false claim remains wrong.
Encode the rule in per-case notes, not the global judge prompt.

- `q-protocol-base-reserve-min-balance`: add the attributed Docs caution, add
  `improvements/stellar-docs/sd-043-sponsored-reserves-min-balance-liabilities.md` to
  `truth.verified.rootCause`, and name the caution's expiry.
- `q-infra-horizon-vs-rpc`: repair the disputed corroboration claim and replace the resolved
  `sd-017` root cause with `sd-042`.
- `q-ti-rpc-gettransactions-pagination-xdr`: accept attributed owner wording without accepting
  universal immutability. Record that `sd-004` makes the caution permanent until the owner changes
  that decision.
- `q-ti-freighter-localhost-not-detected`: reword the GT-52 note into the lint-canonical caution
  form and add `sd-045` to `truth.verified.rootCause`, without adding an exception.
- `q-pc-protocol-27-zipper`: re-derive the snapshot-date key fact separately.

Done when: `golden-truth` verifies every changed claim, all caution expiry rules are explicit, the
round records affected IDs, sibling cases are reconciled, and all golden gates pass.

### Recheck two dated source-metadata conflicts

The 2026-08-29 temporary-artifact audit found two current conflicts that need `golden-truth` review.

- `q-tool-soroban-auth-audit-live` has `truth.asOf: 2026-08-25`, while its verification date is
  `2026-08-28`. Confirm the intended claim date before changing the metadata.
- `q-protocol-ledger-close-time` cites official wording for a 5–7-second range. Verify the current
  wording across every cited official page. Preserve the dated 199-ledger observation, but verify
  its attribution separately. Add a symmetric caution or file a Stellar Docs finding only if a
  live conflict remains after direct confirmation.

Done when: `golden-truth` records both dispositions, any changed fact keeps primary-source
provenance, the round records the affected IDs, and all golden gates pass.

## Playground

### Raise the user-message ceiling to 8,000 characters without truncation

The current client uses a 4,000-character `maxlength`, and `parseChatBody` silently slices user
messages to that limit. ADR-0008 replaces both behaviors.

Keep the full pasted text editable. Show a live count and exact excess, disable Send while over the
limit, and use an accessible inline error associated with the composer. Reject bypassed requests
server-side with a 400 response and the same 8,000-character contract. Keep the Playground
stateless; durable history remains a deferred idea. The existing 20-message and 24,000-character
history clamps remain unchanged, so longer messages can reduce the number of replayed turns. The
384-KiB body ceiling already accommodates the new per-message limit.

Done when: client and server tests cover 7,999, 8,000, and 8,001 characters; no path truncates the
current user message; the UI retains excessive text; accessibility behavior is tested; smoke
passes; and the Playground idea describes the shipped result.

## Tests

### The `ai` tool-loop guard is never exercised

`test/demo-chat.test.ts:6` calls `vi.mock("ai")`. It spreads `importOriginal` and replaces only
`streamText`, so the unsafe-finish-reason guard added in `ai@7.0.70` never runs. Smoke stops at the auth gauntlet, and
`workers-ai-provider` maps unknown finish reasons to `"stop"`, which can hide the exact condition
the guard exists for. Affects `/demo/chat` only.

Done when: a test stubs the model rather than the module, so the real tool loop runs.

## Routing

### Measure bounded repository-level recovery before ranking changes

Define the repository-level tooling class before tuning search: the fact lives only in a repository
as a flag, default, symbol, or configuration key, while Docs or skills carry at most an adjacent
page. Create a separate frozen suite with 20 blind-authored, provenance-bearing cases across at
least four repositories: 12 positive and eight negative. Freeze it before the author can see the
implementation or any score. Route every golden through `golden-truth`. The suite must not enter
existing QA, routing, or holdout denominators, and nobody tunes toward its failures.

Add manifest-owned `source-code` recovery metadata in
`scripts/catalog-data/retrieval-profiles.mjs`, then regenerate the manifest. Measure offline routing,
a paid live agent lane, stored operation order, answer quality, current routing gates, the frozen
holdout, the current QA sample, and its plan regrade. Measure the current telemetry baseline first.
Before ship, pre-register weekly bands for search zero-hit rate, all-backfill rate, and the share of
operation events naming `scout.explainRepo`. Use pinned live exposed operations as canaries.

Define recovery as adjacent or empty Docs evidence followed by `scout.explainRepo` and a grounded
answer. Define a premature detour as `scout.explainRepo` before Docs or skills on a negative.

Done when: at least 10 of 12 positives pass both operation-sequence and answer checks; all eight
negatives avoid a premature repository detour; every existing gate holds; and each weekly canary
stays inside its pre-registered band. Consider ranking only if at least three qualifying positive
misses remain. A suite-specific validator and lint enforce the full `golden-truth` evidence fields
without compiling the suite into existing corpora.

### `search` does not surface the research lane for protocol-history questions

Eval case `q-protocol-24-whisk-incident` asks why Protocol 24 followed Protocol 23 so quickly. The
answer needs the eviction-defect cause, the counts 478 / 84 / 77 / 394, `CAP-0076`, Hot Archive,
and a 31,879,035-stroop fee-pool remediation.

`scout.searchResearch` holds all of them. `source: "cap"` returns 478, 84, 77, 394, Hot Archive,
and TTL; a broad call returns 478, 84, 77, 31879035, `CAP-0076`, and Hot Archive. The union is the
complete fact set, so this question is fully answerable today.

`search` does not point there. Measured 2026-08-25 with the case's own wording: ten hits, none of
them `scout.searchResearch`. The top hits were `stellarDocs.*` operations, and no Stellar Docs
lane carries a single required fact.

This is not a description gap. `scout.searchResearch` already advertises "incident reports" and
offers `source` values `cap` and `incident`. The lane says what it is; ranking does not find it.

Done when: a protocol-history or incident question surfaces `scout.searchResearch` in `search`,
measured on the routing eval rather than on this one case. Treat a fix that only helps this case
as unshipped.

Filed here and not in `improvements/`: the data is reachable, so there is no upstream gap. This is
our ranking.

## Staleness

### Decide the two hackathon cases' consistency-cluster membership

The consistency-register comment now states the current 499-case battery. The remaining question
concerns the two added `scout.hackathonBrief` cases.

This is not a number bump. Neither added `scout.hackathonBrief` case appears in any of the 135
clusters. The only hackathon id in the register is `q-scf-hackathons-active`, and it sits in four
clusters — `cluster-011` (SCF program mechanics), `cluster-074` and `cluster-079` (Growth Hack
amount basis), and `cluster-091` (v7 program menu). All four are SCF program facts; none concerns
the `scout.hackathonBrief` operation. Whether the new cases join a cluster is a content decision.

Done when: `golden-truth` records whether each case belongs in an existing or new cluster.

## Eval instruments

### Add `qa-five-track-v1` outcome accounting

Implement the ADR-0008 tracks without hiding first attempts or shrinking denominators. Stamp the
result as `meta.trackSchema: "qa-five-track-v1"`.

- T1: over active selected IDs, report first-attempt-row coverage, answered coverage, valid-grade
  coverage over answered rows, and the valid-grade count over all selected IDs. Conditional quality
  uses valid first-pass grades only. Judge errors stay in T4. Unsafe trap output is wrong in T1.
- T2: over eligible first-pass transport failures, report recovered, repeated-failure, and
  unattempted counts. One byte-identical retry never replaces T1.
- T3: over answered active trap rows, report answered coverage and safety behavior from explicit
  answer and trap evidence. T3 never derives from `judgeScore`; `judgeScore` is diagnostic only.
  Unsafe trap output fails T3.
- T4: harness and judge health, including deterministic consistency errors.
- T5: provider availability, including safeguards, transport, and timeouts.

Allow one total judge retry across inline and stored resumes for a non-timeout CLI failure or parse
failure. Never retry a provider safeguard, any timeout, or deterministic consistency contradiction.
Preserve every attempt, input hash, answer hash, failure class, and cost. Count retry attempts in
cost accounting. Report invalid tests separately from harness failures and safety outcomes.

T3 passes a graded `correct` trap or an error row carrying
`successful-trap-refusal-not-correct`. It fails a graded `wrong` trap, a trap with non-empty
`avoidMatches`, or a row carrying `fired-avoid-not-wrong`. Every other trap error is unresolved and
listed by ID. Each contradiction also remains a T4 consistency error.

Done when: results stamp `qa-five-track-v1`; every row exposes its first attempt and outcome class;
the console and README report all five tracks with visible denominators; retry tests cover every
allowed and forbidden class; and the existing result-contract tests pass.

### Add a score-independent golden lifecycle

Implement `truth.lifecycle.state` values `proposed`, `active`, `quarantined`, and `retired`, plus
orthogonal `truth.lifecycle.reviewState` values `none`, `queued`, `in-review`, and `resolved`.
Active and quarantined cases own their state in the case file. Proposed files stay outside the
battery until `golden-truth` verification activates them. Retired tombstones also stay outside the
battery. Generate a canonical registry with case and tombstone digests. Reserve proposed and retired
IDs permanently, and reject every ID reuse.

Sample over the full compiled active-plus-quarantined pool, then partition selected IDs. Never
re-pick, replace, or append selected IDs. Keep quarantined rows as diagnostics outside T1 and T3.
Print the active denominator as `k of N` and list every excluded quarantined ID. Apply the same rule
to explicit `--ids` lists.

Every quarantine needs a score-independent cause, an independent reviewer, a ledger entry, and a
30-day review that corrects, retires, or renews it. A credible truth or validity conflict triggers
quarantine before the next aggregate after independent review. Judge noise without golden-
ambiguity evidence sets review state `queued` and keeps trusted truth active.

Queue lifecycle review from verified observability failures, landed improvements, live drift,
verified user failures, and recurrent eval evidence. A trigger changes no golden by itself.

Start mass review at 25 queued active cases, five percent of active cases, or quarterly. Keep corpus
health separate from system performance. Require pre-spend review for a new baseline when sample
membership changes or at least five percent of active cases change.

Done when: compile and lint enforce the states and reserved IDs; sample membership is stable under
quarantine; results report excluded IDs; lifecycle and mass-review tests pass; and `golden-truth`
and `run-evals` describe the implemented workflow without unsupported steps.

### The verdict-consistency engine converts two judge-prompt contradictions into 4% errors

Four rows became `error` on the 2026-08-28 same-100 run
(`eval/qa/results/2026-08-28T19-27-08-variantA.json`); three did on the
2026-08-27 baseline. All came from two repeatable judge-prompt contradictions,
and none was an agent failure (`agent.failure: null` on all four):

- `successful-trap-refusal-not-correct`: the judge scores a correctly refused
  trap as `partial` for a missing key fact. The trap rubric says grade the
  behaviour, so a missing non-behavioural fact should not lower the score.
- `fired-avoid-not-wrong`: the judge marks an avoid item and still scores
  `partial`.

The engine is right to reject both pairs as self-contradictory. The defect sits
upstream of it, in the judge prompt. Either make the prompt unable to produce
these pairs, or let the trap path ignore non-behavioural key facts. A rubric
bump is required either way.

Whichever fix lands must reject a generic refusal when the case requires useful behavior. Add
fixtures for a legitimate answer, a clarifying question, a boundary, a named alternative, and a
scam warning. Test the required behavior directly instead of relying on key-fact position. Keep
ADR-0008's T3 rule and every T4 contradiction unchanged.

Done when: each behavior class has positive and negative tests, a bare refusal cannot pass the
wrong class, and a full run produces zero `error` rows from these two rule pairs.

### Design and validate a paired comparison verdict

Same-100 reruns need a durable verdict when only part of the sample remains comparable. The
2026-08-28 record described the aggregate change as diagnostic, but it had no predeclared method
for `PASS`, `FAIL`, or `INDETERMINATE`.

Design the method before the next comparable rerun. Preserve `correct`, `partial`, and `wrong`
instead of flattening them without evidence. Define the estimand, a practical non-inferiority
margin, power, fixed T4/T5 exclusions, and a fixed repeat rule. Use simulations or repeated-judge
backtests to measure false pass and false fail rates. Do not adopt the temporary addendum's exact
thresholds until this validation supports them.

Done when: `eval/qa/README.md` and `run-evals` name the validated procedure, tests cover its
boundary cases, and the next comparable rerun prints one verdict with its denominator and reasons.

### `--max-panel-cases 10` is too small for 100-case runs

31 rows met a boundary condition on the 2026-08-28 same-100 run
(`eval/qa/results/2026-08-28T19-27-08-variantA.json`). The cap admitted 10 and
denied panels to 21 via `panelEscalationSkipped: "max-panel-cases"`. The run
summary line does not print the skipped count, so an operator sees it only by
opening the artifact. `single` in such an artifact means "not escalated", not
"not borderline".

Done when: the cap scales with the denominator (or a documented larger default
for 100-case runs), and the run summary prints the skipped-panel count.

### Judge stability on the same-100 set is degrading

57 of the same-100 cases now sit below the 0.75 stability threshold, up from 47
before the 2026-08-28 run. Eleven crossed into unstable and one crossed out
when the run added one sample per case. The register decides paid escalations,
so this number governs future spend as well as verdict quality.

Found: register regenerated 2026-08-28 after
`eval/qa/results/2026-08-28T19-27-08-variantA.json` — 538 cases from 195
artifacts (161 collection, 34 rejudge, 0 skipped).

Done when: the next post-collection register refresh reports a stable or
falling unstable-count trend, or the escalation policy accounts for the drift.

### Golden-edit rounds must record the affected id list

One golden-truth burn-down left only 41 of the same-100 ids per-id comparable
to their own baseline; 59 changed judge-facing gospel. The 2026-08-28 rerun lane
(`eval/qa/results/2026-08-28T19-27-08-variantA.json` and its preflight) had to
reconstruct the affected id list with per-id `git show` comparisons. Same-100
reruns stay comparable only if the round that edits goldens records the
affected id list when it lands.

Done when: golden-edit rounds record the affected case-id list in the round
ledger or consistency register, so a later rerun reads the list instead of
reconstructing it.

## Owner decisions

Owner decisions that block agent work are listed once, in `NEXT.md` under "Owner decisions".
Record each answer there or in `eval/qa/README.md`, then delete the question.
