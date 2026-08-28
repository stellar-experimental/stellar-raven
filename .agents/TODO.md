# TODO — own-repo work queue

Own-repo fixes only: adapters, normalizers, catalog, executor, scoring, eval instruments, goldens,
gates, and documentation. Upstream service defects go to `improvements/` instead — see
`improvements/README.md` for the routing rule.

Add an item when you find work you are not doing now. Delete it when it is done; git history is the
archive. Each item states what is wrong, how it was found, and what "done" means.

## Gates

### `improvements:lint` does not enforce the filer's own contract

`scripts/improvements-lint.mjs` never checks `upstreamTitle`. The 20–120 character cap lives only in
`issueTitle` in `scripts/improvements-file-issue.mjs`, which runs at filing time. So a finding can
pass lint, pass CI, and merge, and still be impossible to file.

Found 2026-08-25: sls-073 merged with a 124-character title and `improvements:file` refused it.
Three reviews had passed the record because none of them tried to send it.

Done when: lint enforces the cap, and requires an `upstreamTitle` on any finding at `verified`
(records predating the field stay grandfathered). An improvements PR should also run
`improvements:file --dry-run` as a check — it posts nothing.

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

### Five findings are stale against their upstream issue

Each is `reported-upstream` while its GitHub issue is closed. Our rule is that closure is not proof,
so each needs a live re-check before it can move to `fixed-upstream`.

`sd-036`, `sls-023`, `sls-024`, `sls-029`, `sls-033`.

Done when: each carries a dated live re-check and the correct status. Use `improvements-pipeline`.

### Four findings are deletion candidates

`sk-006`, `sk-009`, `sd-008`, `sd-025` are `fixed-upstream` and still in the active queue.
`improvements/README.md` calls that state short-lived and requires a distinct reviewer to re-run the
original trigger before the file is retired.

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

## Legal

### Set the Terms effective date after counsel approves it

`TERMS_EFFECTIVE_DATE` in `src/site.ts` remains `August 5, 2026`. PR #59 retained that date because
the Terms include a 2026-08-25 counsel edit and were not in force on the approved document's
`July 30, 2026` date.

Done when: counsel approves the effective date, `TERMS_EFFECTIVE_DATE` matches it, and the `/terms`
route tests pass.

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

## Verification owed

### Re-check the Algolia extractor change after a full crawl

The 2026-08-25 crawler fix (`sd-001`) was applied, then only the affected URL was recrawled. Every
other page still carries records from the previous extractor until the daily 00:00 crawl settles.
The no-regression evidence so far is a sample of about twenty queries and twelve page-level
extractor comparisons, not a corpus-wide proof.

Done when: a full crawl has completed, the regression and collateral checks are repeated against
the settled index, and the result is recorded on `sd-001`. Rollback source is in
`research/services/stellar-docs-algolia.md`.

### sd-001 cannot retire yet

The independent recheck returned DO-NOT-RETIRE on 2026-08-25. See that finding for the three
reasons and the conditions for retirement.

## Staleness

### `DEMO_GROK_CONTROL_MODEL` is a retired model

`src/demo/model-config.ts:14` pins `xai/grok-4.5`. The current default is `grok-4.6`. This is the
control model for gauntlets, never production. One-line fix whenever a gauntlet next runs.

Done when: the next gauntlet updates the pin to its current control model and the relevant model
configuration tests pass.

### Decide the two hackathon cases' consistency-cluster membership

The consistency-register comment now states the current 499-case battery. The remaining question
concerns the two added `scout.hackathonBrief` cases.

This is not a number bump. Neither added `scout.hackathonBrief` case appears in any of the 135
clusters. The only hackathon id in the register is `q-scf-hackathons-active`, and it sits in four
clusters — `cluster-011` (SCF program mechanics), `cluster-074` and `cluster-079` (Growth Hack
amount basis), and `cluster-091` (v7 program menu). All four are SCF program facts; none concerns
the `scout.hackathonBrief` operation. Whether the new cases join a cluster is a content decision.

Done when: `golden-truth` records whether each case belongs in an existing or new cluster.

## QA quality round — tracked follow-ups (2026-08-27)

Source: `research/qa-improvement-plan-2026-08-25.md` and round ledger
`.agents/rounds/2026-08-25-qa-quality-deep-dive.md`.

- [ ] Decide whether to include the two out-of-scope lint classes (47
  sourcing-guard avoid warnings, 56 corroboration warnings). Owner call made
  when: included in a session brief or explicitly declined in the ledger.
- [ ] Lane 3 (source delivery): answer the 12 owner questions in
  `ideas/source-delivery-ranked-references.md` §8 (pin freshness, agents
  without fetch tools, index cost/budget, line ranges, attribution,
  docs-vs-source neutrality, query ownership, index availability, CPU/latency
  limits, conflict grouping, skill sourceRoles metadata, and allowlist
  governance). Done when: each has a recorded owner decision. The phase-zero
  spike remains unapproved until the owner approves it separately.
- [ ] Judge stability register: regenerate after every collection run
  (`node eval/qa/judge-stability.mjs`); verify escalation tiers appear in
  result metadata. Done when: the first judged current-`main` collection
  records `meta.judgeTierUsed` on every verdict.
- [ ] Benchmarks to re-measure after the corpus burn-down: same-100 rerun at
  current main; compare against `eval/qa/results/2026-08-27T00-02-11-variantA.json`
  (48/35/13/4, half 65.5, strict 48.0, core-answer 91.7%). Done when: a comparable
  current-`main` same-100 run is stored and compared against that result.
- [ ] Three synthesizer questions from `research/qa-deep-dive-2026-08-25/fable-max.md` §7
  have no recorded decision. Q2: docs-vs-source disputes — does the battery grade truth
  per Core/source or per the tested surface (the same question as Lane 3 §8 item 6)?
  Q6: should `search` or the server instructions steer "how do I do X in tool Y"
  questions to repo-level operations such as `scout.explainRepo` when the docs family
  returns adjacent-only hits? Q8: exclude provider-safeguard refusals (for example
  `q-n3-ssrf-metadata-endpoint`) from the score denominator? Done when: each has an
  owner decision recorded here or in `eval/qa/README.md`. Found 2026-08-27 while
  reviewing the round ledgers; the other five questions were answered by the plan
  (A1, A2, A3, R8) or by the 2026-08-27 same-100 run.
