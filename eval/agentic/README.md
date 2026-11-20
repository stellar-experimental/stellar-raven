# Agentic routing evaluation

Paid diagnostic measuring whether an agent selects the expected service after searching the catalog (for final-answer correctness, use [QA](../qa/README.md); size/cap runs with [run-evals](../../.agents/skills/run-evals/SKILL.md)).

## Method

[sample.json](sample.json) fixes 30 legacy routing cases (12 Stellar Docs, 10 Scout, 8 Lumenloop). Rows matching a QA headline question are listed in `routing-qa-overlap.json` (set `agentic`; see [confirmation-only rows](../README.md#confirmation-only-rows)); this workflow does not tag them, so report them as counts only. [workflow-agentic-routing.js](workflow-agentic-routing.js) runs each case at low and medium effort (60 rows) using the `sonnet` alias—record the resolved model ID.

Each agent gets up to 3 local MCP `search` calls and returns `queriesUsed`, `primaryToolId`, `primaryService`, `alternateToolIds`, and `reasoning`. The harness records per-call search pages (`zeroGated`, `widerCandidateIds`, `primaryInHits`). Primary grade matches exact `expected_service` (no `expected_any` tolerance); any-hit accepts it in primary or alternates.

## Re-run

Requires the **Claude Code Workflow tool** (no standalone Node launcher). Reuse the running dev server, start the capture proxy on a separate port, invoke `workflow-agentic-routing.js` with `{"port": 8789, "cases": [...]}` (copy `id`, `question`, `expected_service` from `sample.json`), save `{summary, rows}` under `eval/agentic/results/`, and reconcile before interpreting transcripts:

```sh
node eval/agentic/capture-proxy.mjs \
  --upstream http://localhost:8788 \
  --port 8789 \
  --out eval/agentic/results/capture-<stamp>.jsonl

node eval/agentic/reconcile-capture.mjs \
  --capture <capture.jsonl> \
  --results <results.json>
```

## Capture reconciliation

A non-zero exit with `summary.tainted` rejects transcript analysis (inspect `summary.anomalies` and `unmatchedMarkers`; service grades stay separate). If query/limit multisets match captured exchanges but reported pages differ, write a separate normalized copy (never overwrite inputs) and re-run ordinary reconciliation on it:

```sh
node eval/agentic/reconcile-capture.mjs \
  --capture <capture.jsonl> \
  --results <results.json> \
  --raw-reconciliation <reconcile.json> \
  --write-normalized <normalized-results.json> \
  --workflow <workflow-id>
```

The normalizer pins the raw reconciliation, preserves `rawAgentSearchCalls`, replaces `searchCalls` from capture, derives `primaryInHits`, and rejects capture anomalies or unmatched markers.

## Evidence

[Cited agentic records](../qa/reviewed/2026-09-30-agentic-guide-records.md).
