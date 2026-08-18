# Retrieval audit evidence contract

Use these fields in the durable audit ledger. Add fields only when the experiment needs them.

## Surface inventory

| Field | Required value |
| --- | --- |
| ID | Exact exposed operation or skill ID |
| Source | Lumenloop, Scout, Stellar Docs, or Skills |
| Authority | Claims this source can support |
| Input | Required fields, enums, and unsafe values |
| Output | Top-level and nested model-visible fields |
| Runtime shape | Observed compact key projection and digest |
| Responses | Data, soft-empty, error, and upstream-ok traps |
| Retrieval | Description, keywords, profile, and recovery edges |
| Safety | Read-only, paid, side-effecting, or excluded |
| Coverage | Routing, holdout, QA, live, plan, discovery, and agentic cases |
| Finding | Verified defect, risk, or no issue |

## Live probe record

Record the revision, deployment identity, time, operation, sanitized input class, response class, observed keys, schema difference, duration, and evidence digest. Never store a secret or an unnecessary raw body.

## Experiment brief

Record these items before implementation or spend:

- One causal hypothesis.
- Two unrelated targets when available.
- At least six symmetric controls for a product change.
- The unchanged baseline arm.
- The single changed variable.
- One mechanism metric.
- Exact case identifiers and order.
- Runner, server, manifest, corpus, prompt, evidence-pack, rubric, and judge pins.
- Model roles and repetitions.
- Expected cost, hard cap, and checkpoint intervals.
- Stop rules and acceptance thresholds.
- Author and independent reviewers.

## Decision scorecard

Mark each dimension pass, fail, or not applicable.

| Dimension | Blocking failure |
| --- | --- |
| Correctness | A reviewed control loses a required fact |
| Causality | Only a judge score changes |
| Retrieval | A required source or exact ID becomes undiscoverable |
| Execution | A response class or envelope becomes misleading |
| Context | A new overflow, timeout, or unexplained growth appears |
| Cost | Spend exceeds the cap or accounting is incomplete |
| Security | Isolation, authorization, ownership, or redaction weakens |
| Exposure | A non-exposed operation appears |
| Evaluation | Cases, prompts, packs, or judge tuples are incomparable |

Reject the candidate after any blocking failure. Preserve accepted measurement repairs separately from rejected product code.
