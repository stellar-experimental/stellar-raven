---
name: retrieval-system-audit
description: Audit and improve stellar-raven-codemode retrieval across every exposed service operation and skill. Use for comprehensive endpoint, response-shape, catalog-description, search-ranking, execute-grounding, evaluation-coverage, golden-truth, or cross-source weighting reviews that require live probes and measured A/B evidence.
---

# Retrieval system audit

Measure the retrieval system before changing it. Ship only general improvements that survive real
endpoint calls and reviewed golden questions.

## Scope first

A full audit is the largest task in this repo. Before you start, write in the round ledger the
question the audit answers, the surfaces and steps below that it needs, and the expected time and
cost. Run only those steps. Probes and offline instruments are free and run here against the local
dev server; every paid run follows the `run-evals` spend rule. Stop when the question is answered.

Companion skills: `run-evals` for every evaluation and spend decision, `golden-truth` before any
golden change, `improvements-pipeline` for verified upstream defects, and `live-drift-resolution`
first when the committed catalog differs from the live surfaces. Read `PLAN.md`,
`ARCHITECTURE.md`, `eval/EVALS.md`, and `eval/qa/README.md` for the parts in scope.

## Fixed boundaries

- The manifest is the exposed surface. Keep exact operation and skill IDs.
- Keep data, soft-empty, and error responses distinct.
- Keep secrets and service traffic outside model-authored code.
- Never call a paid or side-effecting operation during inventory work.
- Never tune production behavior for one question.
- Prefer deletion, simpler descriptions, and existing interfaces to new code.
- Raw paid results stay local and gitignored.
- The coordinator holds Git, spending, deployment, and external filing authority.

## Steps

1. **Pin.** Work in a dedicated worktree with a round ledger. Record the revision and the manifest,
   runner, and corpus digests. Run the free baseline from `AGENTS.md` and confirm that regeneration
   leaves the tree clean.
2. **Build one surface ledger.** For each operation and skill in scope, compare the committed
   manifest, generated spec, adapters, live catalog, and fresh-client MCP descriptions. Use the
   fields in [`references/evidence-contract.md`](references/evidence-contract.md). Separate
   deployed drift from a client that cached an older MCP schema.
3. **Probe live response contracts.** Design the probe matrix first and mark every probe read-only,
   paid, side-effecting, secret-bearing, or unsafe. Call each safe read-only operation with a
   representative input, then add bounded soft-empty and invalid-input probes by response class.
   Compare returned keys and nested shapes with the model-visible schema. Keep hashes and compact
   projections, not raw bodies.
4. **Trace retrieval decisions.** Follow `search` from catalog generation through scoring, tiering,
   quotas, descriptions, profiles, and recovery guidance. Follow `execute` through adapters,
   envelopes, truncation, artifacts, and evidence packing. For each suspected defect, name the
   first failed boundary: discovery, schema, retrieval, execution, upstream data, synthesis, judge,
   or golden truth. When the evidence is absent upstream, file a finding and make no runtime
   change.
5. **Audit evaluation coverage.** Map each operation and skill to its routing, holdout, discovery,
   plan, QA, live, temporal, and agentic coverage. Separate direct case labels from operations
   that agents called. Review every consequential verdict change against the transcript and
   golden. Claim no gain below the documented noise floor, and compare different memberships only
   on common cases.
6. **Pre-register each experiment.** One hypothesis per candidate: mechanism, target cases,
   symmetric controls, one mechanism metric, expected time and cost, hard cap, stop rule, and
   acceptance threshold. Use identical case IDs, runner code, judge tuple, and arm order across
   arms. Collect answers before judging when the runner supports it.
7. **Implement the smallest proven change.** Keep measurement changes separate from product
   changes, with disjoint write ownership. Use generation scripts. Remove rejected experimental
   code and dormant flags. Advance a candidate only after two unrelated targets show the intended
   mechanism. Stop after a verified control, security, exposure, or exact-match regression.
8. **Close.** Goldens change only through `golden-truth`; service defects go to `improvements/`,
   never behind a local answer patch. A reviewer who did not author the change reviews it, and
   every finding is reconciled. Run the tests, smoke tests, build, routing gate, relevant evals,
   improvements lint, and secret scan that the change touches. Record artifacts, costs, failures,
   and rejected hypotheses. Stop only the lanes you started.

## Evidence rule

An aggregate score never overrides a blocking regression. A shipped change needs reviewed
correctness, causal evidence, stable retrieval, complete accounting, and no security or exposure
regression. Cost counts as `run-evals` states: a much cheaper path that is only slightly less
correct can be the better product.
