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

`npm run eval:qa:lint` reported 0 errors and 1,390 warnings on 2026-08-27 (merge of the QA
deep-dive round). Six warning classes: keyFacts over 90 characters, compound predicates,
negative predicates whose object is absent from the question, presentation/omission avoid items,
keyFacts that demand the golden's own snapshot date, and improvements-rooted cases with no
symmetric canonical-source caution. Each is an authoring-form defect: the golden gates the judge
on shape, not on truth.

Found 2026-08-27: the lint classes landed in the corpus-goldens lane and the backlog was never
burned down. Fixes are structural (split, move to avoid, date the behavior, add the caution) and
must not change facts without two independent live sources.

Done when: all six classes report zero warnings, every touched case carries a refreshed
`truth.verified` naming this entry, and each batch is committed with its lint delta.

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

### Re-check the Scout appendix index and project resolver contracts

Raven filed `sls-074` as [Stellar-Light/stellarlight#1031](https://github.com/Stellar-Light/stellarlight/issues/1031).
Raven filed `sls-075` as [Stellar-Light/stellarlight#1030](https://github.com/Stellar-Light/stellarlight/issues/1030).
The source round is `.agents/rounds/2026-08-25-open-issues.md`.

Done when: `V-SOR-APP-VUL-003` resolves to the V2.1 appendix item, while an absent control still
returns `meta.exactMiss`. The resolver OpenAPI must type `subject`, `current`, `evidence`, and
`meta`. Its `matchedOn` vocabulary must agree with the pinned Scout API reference.

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

### The QA consistency register still says 497

`eval/qa/consistency-register.json:2` reads `Current 497-case ... as of 2026-08-18`. The battery is
499 as of 2026-08-19. The comment is hand-written, not generated, so nothing lints it.

This is not a number bump. Neither added `scout.hackathonBrief` case appears in any of the 135
clusters. The only hackathon id in the register is `q-scf-hackathons-active`, and it sits in four
clusters — `cluster-011` (SCF program mechanics), `cluster-074` and `cluster-079` (Growth Hack
amount basis), and `cluster-091` (v7 program menu). All four are SCF program facts; none concerns
the `scout.hackathonBrief` operation. Whether the new cases join a cluster is a content decision.

Done when: `golden-truth` settles cluster membership and the comment matches the corpus.

## QA quality round — tracked follow-ups (2026-08-27)

Source: `research/qa-improvement-plan-2026-08-25.md` and round ledger
`.agents/rounds/2026-08-25-qa-quality-deep-dive.md`.

- [ ] Golden-truth session 3: close the last 372 long-keyFact warnings on 204
  cases. Full hand-off plan in session 2's owner report; assets under
  `/tmp/raven-qadeep/gt2/` (rules, dispatch/gates scripts, reconcile helper).
  Copy assets into the repo or a fresh namespace before they expire.
  Done when: `eval:qa:lint` reports 0 long-fact warnings; gates green.
- [ ] Decide whether to include the two out-of-scope lint classes (47
  sourcing-guard avoid warnings, 56 corroboration warnings). Owner call made
  when: included in a session brief or explicitly declined in the ledger.
- [ ] Lane 3 (source delivery): answer the 11 owner questions in
  `ideas/source-delivery-ranked-references.md` §8 (pin freshness, agents
  without fetch tools, index cost/budget, line ranges, attribution,
  docs-vs-source neutrality, query ownership, index availability, CPU/latency
  limits, conflict grouping, skill sourceRoles metadata). Done when: each has
  a recorded decision; then a phase-zero spike brief (1-2 repos,
  `sources.locate` only) can be written.
- [ ] Judge stability register: regenerate after every collection run
  (`node eval/qa/judge-stability.mjs`); verify escalation tiers appear in
  result metadata. Done when: a run records judgeTierUsed on every verdict.
- [ ] Benchmarks to re-measure after the corpus burn-down: same-100 rerun at
  current main; compare against `eval/qa/results/2026-08-27T00-02-11-variantA.json`
  (48/35/13/4, half 65.5, strict 48.0, core-answer 91.7%).
