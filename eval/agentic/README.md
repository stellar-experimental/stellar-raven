# Agentic routing evaluation

This paid diagnostic checks whether an agent selects the expected service after searching the catalog.
Use the [QA guide](../qa/README.md) to measure final-answer correctness.
Use the [run-evals workflow](../../.agents/skills/run-evals/SKILL.md) to obtain approval before paid collection.

## Method

[sample.json](sample.json) fixes 30 cases: 12 Stellar Docs, 10 Scout, and eight Lumenloop cases.
[workflow-agentic-routing.js](workflow-agentic-routing.js) runs each case at low and medium effort, producing 60 rows.
It uses the Workflow model alias `sonnet`.
Record the resolved model before comparing runs; an alias does not establish model identity.

Each agent receives the question and a recipe for calling the local MCP `search` tool.
It can make at most three searches and returns these fields:

```text
queriesUsed, primaryToolId, primaryService, alternateToolIds, reasoning
```

The harness also records each search query, limit, ordered hit IDs, tiers, scores, total, and truncation state.
`zeroGated` describes pages without a gated-tier hit.
`widerCandidateIds` records advisory IDs outside the ranked hits.
`primaryInHits` records whether a ranked page contained the selected primary ID.

The primary grade requires the selected service to match `expected_service`.
The any-hit grade accepts that service in the primary or alternate selections.
This contract uses the exact expected service. It does not apply the routing evaluator's `expected_any` tolerance.

## Re-run

The collector requires the **Claude Code Workflow tool**.
That host supplies `args`, `phase`, `parallel`, `agent`, and `log`.
The repository does not provide a standalone Node launcher for the workflow.

1. Reuse the running development server and read its bound URL from the existing output.
2. Start the capture proxy with that upstream URL and a separate local port.
3. Invoke the Claude Code Workflow tool with `workflow-agentic-routing.js` and the proxy port.
4. Save the returned `{summary, rows}` under `eval/agentic/results/`.
5. Reconcile the stored transcript with the captured exchanges before interpreting the search behavior.

```sh
# Substitute the actual server URL, proxy port, and a new output stamp.
node eval/agentic/capture-proxy.mjs \
  --upstream http://localhost:8788 \
  --port 8789 \
  --out eval/agentic/results/capture-<stamp>.jsonl

node eval/agentic/reconcile-capture.mjs \
  --capture <capture.jsonl> \
  --results <results.json>
```

Pass the Workflow tool `{"port": 8789, "cases": [...]}`.
Copy each case's `id`, `question`, and `expected_service` from `sample.json`.
Use the proxy port so the capture includes every agent exchange.
Keep the fixed sample and grading contract for comparable runs.

## Capture reconciliation

A nonzero exit with `summary.tainted` rejects the transcript-derived analysis.
Inspect `summary.anomalies` and `unmatchedMarkers` for missing, invented, or unassigned exchanges.
The service grades remain separate from transcript reconciliation.

A normalization pass can replace incorrect page content when every query/limit multiset still matches the captured exchanges.
Keep the original report and create a separate normalized artifact:

```sh
node eval/agentic/reconcile-capture.mjs \
  --capture <capture.jsonl> \
  --results <results.json> \
  --raw-reconciliation <reconcile.json> \
  --write-normalized <normalized-results.json> \
  --workflow <workflow-id>
```

The normalizer pins the raw reconciliation and preserves agent-reported pages in `rawAgentSearchCalls`.
It copies captured pages into `searchCalls` and derives `primaryInHits` from those pages.
It requires unique row markers and matching query/limit multisets across all evidence.
It rejects capture anomalies, unmatched markers, missing reports, and paths that overwrite inputs.
Run ordinary reconciliation again on the normalized copy before using it.

## Evidence

[Cited agentic records](../qa/reviewed/2026-09-30-agentic-guide-records.md) retain evidence used by current artifacts.
[Earlier agentic history](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/eval/agentic/README.md) remains available at the audit base.
