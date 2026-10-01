# ADR-0009: Local catalog discovery stays lexical

Status: accepted, 2026-10-01.

Raven keeps deterministic lexical ranking for local catalog discovery.
This decision does not restrict semantic search inside upstream services.

Generic catalog cards failed to capture entity-dominated queries and were reverted.
The [card experiment](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/p2-outcome-addendum.md)
records the query replay and its measured ceiling.
The [Vectorize experiments](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/eval/vectorize/README.md)
measured NO-SHIP outcomes: target gains did not offset blocking routing regressions.

Reopening requires a measured failure on an unsaturated target lane and a general mechanism that addresses it.
Compare against the accepted lexical baseline with pinned models, runtimes, inputs, and generated artifacts.
The [measured trigger](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/discovery-redesign.md#11--vectorize-backed-semantic-routing-cards)
requires +5 percentage points at top-1 or +3 at top-5, with per-case net-win review.
All [current routing gates](../../eval/gates.json) must pass; a target gain cannot offset a blocking regression.
Paid measurement requires separate approval under the [run-evals workflow](../../.agents/skills/run-evals/SKILL.md).
