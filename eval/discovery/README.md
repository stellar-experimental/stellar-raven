# Discovery evaluation

Measures whether MCP `search` over HTTP exposes an expected source family and usable operation or skill: one-shot (1 search), agent (≤3 searches, paid), and replay (stored agent queries). Committed rows matching a QA headline question are listed by ID in `routing-qa-overlap.json` (confirmation-only); one-shot and replay tag and hide per-row outcomes by committed ID (custom `--cases` IDs are not screened automatically), while agent and classifier do not tag ([routing guide](../README.md#confirmation-only-rows)).

## Commands

Reuse the running server and substitute its bound URL (`--url` accepts base URL or `/mcp`; defaults: `run-discovery.mjs` `8788`, agent/replay `8787`; remote one-shot/replay use `RAVEN_MCP_BEARER_TOKEN` `name:token` without printing it):

```sh
node eval/discovery/run-discovery.mjs --url http://localhost:8788
node eval/discovery/run-replay.mjs --url http://localhost:8787

# Paid agent collection: requires local `npm run dev:eval` on a clean tree, budget cap, and identity pins.
node eval/discovery/run-agent-discovery.mjs \
  --url http://localhost:8787 \
  --server-revision <commit> \
  --expect-sha256 <surface-sha256> \
  --expect-agent-binary-sha256 <wrapper-sha256> \
  --expect-agent-environment-sha256 <environment-sha256> \
  --max-budget-usd <usd>
```

Paid agent rules (prepare server via [`run-evals`](../../.agents/skills/run-evals/SKILL.md)):

- Disables user/project/local settings and slash commands; requires strict MCP config with `raven` connected on every row (failure stops collection and suppresses aggregates).
- Every flag takes one spaced value; unknown flags, `=`, stray args, or duplicate `--ids` fail before spend. Each agent gets only remaining budget; missing/excess cost fails the run. Artifacts go to `eval/discovery/results/`.
- Defaults to Claude alias `sonnet` (resolved ID recorded) at medium effort with `mcp__raven__search` only; grades at most the first 3 searches (0 or >3 searches lose selection credit). Optional flags: `--cases`, `--ids a,b,c`, `--repeat`, `--model`, `--effort`.

## Inputs and grading

[cases.json](cases.json) holds 43 cases; [mined-lumenloop-queries.json](mined-lumenloop-queries.json) holds 91 query occurrences across 8 Lumenloop cases (`mine-agent-queries.mjs` reads eval agent transcripts only—never user traffic).

One-shot calls `search` with `limit: 8`: `familyHit@3` matches `expectedFamilies` in ranks 1–3; `usableOp@5` matches `acceptableOps` in ranks 1–5. Summaries group by seed pool. `classify-misses.mjs` compares one-shot vs agent artifacts (never combining hits across repeats):

- `downstream`: one-shot found both family and usable op (or post-discovery cause in review: `execute`, upstream quality, missing/stale fields, synthesis).
- `agent-behavior`: one-shot missed either measure, but a single agent run found both.
- `retrieval`: no single agent run found both.

Discovery does not measure final-answer correctness—use [QA](../qa/README.md). [ADR-0009](../../research/decisions/0009-discovery-stays-lexical.md) owns the lexical discovery decision and reopening bars.
