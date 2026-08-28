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
review finding is reconciled, and all gates pass. The 47 sourcing and 56 corroboration warnings
remain a separate owner decision below.

## Improvements backlog

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

## Tests

### The `ai` tool-loop guard is never exercised

`test/demo-chat.test.ts:6` calls `vi.mock("ai")`. It spreads `importOriginal` and replaces only
`streamText`, so the unsafe-finish-reason guard added in `ai@7.0.70` never runs. Smoke stops at the auth gauntlet, and
`workers-ai-provider` maps unknown finish reasons to `"stop"`, which can hide the exact condition
the guard exists for. Affects `/demo/chat` only.

Done when: a test stubs the model rather than the module, so the real tool loop runs.

## Routing

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

Done when: a full run produces zero `error` rows from these two rule pairs.

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
