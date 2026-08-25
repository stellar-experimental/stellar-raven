---
name: retrieval-system-audit
description: Audit and improve stellar-raven-codemode retrieval across every exposed service operation and skill. Use for comprehensive endpoint, response-shape, catalog-description, search-ranking, execute-grounding, evaluation-coverage, golden-truth, or cross-source weighting reviews that require live probes and measured A/B evidence.
---

# Retrieval System Audit

Measure the complete retrieval system before changing it. Ship only general improvements that survive real endpoint calls and reviewed golden questions.

## Use the companion runbooks

1. Read `PLAN.md`, `ARCHITECTURE.md`, `eval/EVALS.md`, and `eval/qa/README.md`.
2. Use the global `herdr` skill to run an explicitly requested multi-model audit, one agent per pane.
3. Use `run-evals` for every evaluation run and spend decision.
4. Use `golden-truth` before changing a golden question or answer.
5. Use `improvements-pipeline` for verified upstream defects.
6. Use `live-drift-resolution` first when the committed catalog differs from the live surfaces.

## Keep fixed boundaries

- Treat the manifest as the exposed surface.
- Keep exact operation and skill identifiers.
- Keep data, soft-empty, and error responses distinct.
- Keep secrets and service traffic outside model-authored code.
- Do not call a paid or side-effecting service operation during inventory work.
- Do not tune production behavior for one question.
- Prefer deletion, simpler descriptions, and existing interfaces before new code.
- Keep raw paid results local and gitignored.
- Give Git, spending, deployment, and external filing authority to the coordinator.

## Run the audit

### 1. Isolate and pin

Create a dedicated Git worktree and a round ledger under `.agents/rounds/`. Record the revision, clean-tree digest, manifest digest, runner digest, corpus digest, and evaluation gates.

Run the free baseline from `AGENTS.md`. Compile generated artifacts and verify that regeneration leaves the tree clean.

### 2. Build one surface ledger

Inventory every exposed operation and whole skill. Compare the committed manifest, generated specification, adapters, live catalog, and fresh-client MCP descriptions.

Record each input schema, output schema, retrieval description, retrieval profile, response class, authority scope, safety class, and evaluation coverage. Use `references/evidence-contract.md` for the required fields.

Separate deployed drift from a client that cached an older MCP schema.

### 3. Probe live response contracts

Design the probe matrix before calling services. Mark every probe as read-only, paid, side-effecting, secret-bearing, or unsafe.

Call each safe read-only operation with a valid representative input. Add bounded soft-empty and invalid-input probes by response class, not by individual question.

Compare returned keys and nested shapes with the model-visible schema. Preserve hashes and compact projections instead of raw large bodies.

### 4. Trace retrieval decisions

Trace `search` from catalog generation through lexical scoring, tiering, quotas, descriptions, keywords, profiles, recovery guidance, and prompt text. Trace `execute` through adapters, envelopes, truncation, artifacts, evidence packing, and final answers.

For each suspected defect, identify the first failed boundary. Classify it as discovery, schema, retrieval, execution, upstream data, synthesis, judge, or golden truth.

Reject a runtime change when the required evidence is absent upstream. File or update an improvement instead.

### 5. Audit evaluation coverage

Map every operation and skill to routing, holdout, discovery, plan, QA, live, temporal, and agentic coverage. Distinguish direct case labels from operations that agents actually called.

Treat scores as instruments. Review every consequential verdict change against the transcript and golden requirements.

Do not claim a gain below the documented noise floor. Do not compare different case memberships without a common-case analysis.

### 6. Pre-register experiments and spend

Write one hypothesis for each candidate. Name the mechanism, target cases, symmetric controls, one mechanism metric, cost estimate, hard cap, repetition count, stop rules, and acceptance threshold.

Use identical case identifiers, runner code, judge tuple, and arm order for comparisons. Collect answers before judging when the runner supports stored judging.

Require an independent adversarial review before any paid run. Review every brief change before additional spend.

### 7. Implement the smallest proven change

Assign disjoint write ownership. Keep measurement changes separate from product changes.

Use generated-artifact scripts instead of hand edits. Remove rejected experimental code and dormant flags.

Advance a candidate only after two unrelated targets show the intended mechanism. Stop after a verified control, security, exposure, or exact-match regression.

### 8. Maintain truth and upstream findings

Change goldens only through `golden-truth`. Triangulate volatile, disputed, or high-stakes claims with independent source classes.

Record service defects in `improvements/`. Do not hide an upstream defect with a local answer patch.

### 9. Review and close

Use reviewers who did not author the change. Reconcile every finding before final verification.

Run the required tests, smoke tests, build, routing gate, relevant evals, improvements lint, and secret scan. Record exact artifacts, costs, failures, and rejected hypotheses.

Close only panes you split yourself, after reviewing their handoffs. Reconcile `.agents/TODO.md`, the round ledger, and the worktree.

## Evidence rule

Do not use an aggregate score to override a blocking regression. A shipped change needs reviewed correctness, causal evidence, stable retrieval, complete accounting, and no security or exposure regression.
