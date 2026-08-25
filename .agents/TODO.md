# TODO — own-repo work queue

Own-repo fixes only: adapters, normalizers, catalog, executor, scoring, eval instruments, goldens,
gates, and documentation. Upstream service defects go to `improvements/` instead — see
`improvements/README.md` for the routing rule.

Add an item when you find work you are not doing now. Delete it when it is done; git history is the
archive. Each item states what is wrong, how it was found, and what "done" means.

## Gates

### `improvements:lint` does not enforce the filer's own contract

`scripts/improvements-lint.mjs` never checks `upstreamTitle`. The 20–120 character cap lives only in
`scripts/improvements-file-issue.mjs:321`, which runs at filing time. So a finding can pass lint,
pass CI, and merge, and still be impossible to file.

Found 2026-08-25: sls-073 merged with a 124-character title and `improvements:file` refused it.
Three reviews had passed the record because none of them tried to send it.

Done when: lint enforces the cap, and requires an `upstreamTitle` on any finding at `verified`
(records predating the field stay grandfathered). An improvements PR should also run
`improvements:file --dry-run` as a check — it posts nothing.

## Improvements backlog

### Nine findings are stale against their upstream issue

Each is `reported-upstream` while its GitHub issue is closed. Our rule is that closure is not proof,
so each needs a live re-check before it can move to `fixed-upstream`.

`sd-036`, `sls-023`, `sls-024`, `sls-029`, `sls-033`, `sls-069`, `sls-070`, `sls-071`, `sls-072`.

`sls-069`–`072` are ours, filed and closed upstream on 2026-08-20.

Done when: each carries a dated live re-check and the correct status. Use `improvements-pipeline`.

### Four findings are deletion candidates

`sk-006`, `sk-009`, `sd-008`, `sd-025` are `fixed-upstream` and still in the active queue.
`improvements/README.md` calls that state short-lived and requires a distinct reviewer to re-run the
original trigger before the file is retired.

### sd-001 is unfiled and its diagnosis is too narrow

The only finding still at `verified`. It has no `upstreamTitle`, so it was never prepared for
filing. It still reproduces — see the finding for the dated re-check and the widened evidence.

Done when: the scope question is settled — file it upstream, or fix it with the Algolia operator
credentials under the guardrails in `AGENTS.md` and
`research/services/stellar-docs-algolia.md`.

## Tests

### The `ai` tool-loop guard is never exercised

`test/demo-chat.test.ts:6` calls `vi.mock("ai")`. It spreads `importOriginal` and replaces only
`streamText`, so the unsafe-finish-reason guard added in `ai@7.0.70` never runs. Smoke stops at the auth gauntlet, and
`workers-ai-provider` maps unknown finish reasons to `"stop"`, which can hide the exact condition
the guard exists for. Affects `/demo/chat` only.

Done when: a test stubs the model rather than the module, so the real tool loop runs.

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

### The QA consistency register still says 497

`eval/qa/consistency-register.json:2` reads `Current 497-case ... as of 2026-08-18`. The battery is
499 as of 2026-08-19. The comment is hand-written, not generated, so nothing lints it.

This is not a number bump. Neither added `scout.hackathonBrief` case appears in any of the 135
clusters. The only hackathon id in the register is `q-scf-hackathons-active`, and it sits in four
clusters — `cluster-011` (SCF program mechanics), `cluster-074` and `cluster-079` (Growth Hack
amount basis), and `cluster-091` (v7 program menu). All four are SCF program facts; none concerns
the `scout.hackathonBrief` operation. Whether the new cases join a cluster is a content decision.

Done when: `golden-truth` settles cluster membership and the comment matches the corpus.
