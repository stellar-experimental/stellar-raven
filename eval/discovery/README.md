# Discovery evaluation

This instrument measures whether search results expose an expected source family and a usable operation or skill.
The one-shot instrument makes one MCP search with the case question.
The agent instrument allows at most three searches. The replay instrument uses stored queries from evaluation agents.
The runners call the MCP server through HTTP. They do not import the search implementation.

## Commands

Reuse the running server and substitute its bound URL.

```sh
node eval/discovery/run-discovery.mjs --url http://localhost:8788
node eval/discovery/run-replay.mjs --url http://localhost:8787

# Paid agent collection requires an approved cap and pinned server, executable, and environment identities.
node eval/discovery/run-agent-discovery.mjs \
  --url http://localhost:8787 \
  --server-revision <commit> \
  --expect-sha256 <surface-sha256> \
  --expect-agent-binary-sha256 <wrapper-sha256> \
  --expect-agent-environment-sha256 <environment-sha256> \
  --max-budget-usd <usd>
```

The one-shot runner defaults to `http://localhost:8788`.
The agent and replay runners default to `http://localhost:8787`.
Each `--url` accepts a base URL or a URL ending in `/mcp`.
Remote one-shot and replay runs use `RAVEN_MCP_BEARER_TOKEN` with the full `name:token` credential.
The runner sends that credential as a bearer token and does not print it.

Paid agent collection requires a local server from `npm run dev:eval`, with a clean tree and a matching compiled revision.
Use the [run-evals workflow](../../.agents/skills/run-evals/SKILL.md) to prepare and approve that server.
The runner disables user, project, and local settings and slash commands.
It retains the explicit strict MCP configuration and permission bypass.
Each row must report the `raven` MCP server as `connected`.
A failed connection stops collection and suppresses aggregates.

Every agent-runner flag requires one spaced value. The parser rejects unknown flags, equals forms, and stray arguments.
The required flags bind the server revision, surface hash, executable hash, environment hash, and total budget.
Each agent receives only the remaining budget authorization. Invalid, missing, or excessive cost reports fail the run.
Artifacts record each authorization, cost report, and remaining amount under `eval/discovery/results/`.

The agent defaults to `claude-sonnet-5` at medium effort and can use only `mcp__raven__search`.
The runner grades at most the first three searches and records the observed call count.
Zero searches or more than three searches invalidate final-selection credit.
Use `--cases`, `--ids`, `--repeat`, `--model`, and `--effort` for explicit comparisons.
Supply `--ids a,b,c` once. Duplicate `--ids` flags fail before a paid call.

## Inputs and grading

[cases.json](cases.json) defines the 43 cases, seed pools, expected families, and accepted operation IDs.
[mined-lumenloop-queries.json](mined-lumenloop-queries.json) contains 91 query occurrences across eight Lumenloop cases.
`mine-agent-queries.mjs` reads queries from evaluation agents over committed questions. Raw user traffic is forbidden.

For each one-shot case, the runner calls `search` with the question and `limit: 8`.

- `familyHit@3`: a rank 1–3 hit has a service in `expectedFamilies`.
- `usableOp@5`: a rank 1–5 hit has an ID in `acceptableOps`.
- Stored hits include rank, ID, service, kind, tier, score, and supported additional score fields.

The summary groups counts by seed pool.
`classify-misses.mjs` compares a one-shot artifact with an agent artifact:

- `downstream`: the one-shot search found both the expected family and a usable operation.
- `agent-behavior`: the one-shot search missed either measure, but one agent run found both.
- `retrieval`: no individual agent run found both.

The classifier never combines hits across repeated agent runs to claim recovery.
The discovery measures do not establish final-answer correctness. Use [QA](../qa/README.md) for that measure.

## Changes to discovery

[ADR-0009](../../research/decisions/0009-discovery-stays-lexical.md) records the lexical discovery decision and its measured reopening conditions.
Use fresh, identified artifacts for comparisons. Historical scores do not establish current performance.

## Miss Classification

Use these categories when reviewing misses:

- `retrieval`: one-search discovery failed to surface a needed family or usable op even though the exposed catalog contains one.
- `agent-behavior`: the needed family/op was visible, but an agent likely needs better search planning, follow-up search, or source-family guidance.
- `downstream`: discovery was sufficient; the later answer would fail because of execute usage, upstream data/content quality, missing fields, stale source data, or synthesis.
