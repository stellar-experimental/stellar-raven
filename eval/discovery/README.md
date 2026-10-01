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
The Vectorize experiments measured NO-SHIP outcomes. Their implementation and commands are removed.

## Replay smoke record — 2026-07-10

Standalone replay smoke evidence against the existing Solo `dev` process:
`2026-07-10T04-31-51-308Z-todo-902-smoke.json` (91/91 calls completed; family top-1
20/91, family top-5 37/91, usable operation top-5 28/91). The result is local/gitignored by
policy; its exact stamp and aggregate are retained here.

## Phase 0 Baseline

Baseline **re-stamped 2026-07-09 after pr17 fold** (Pool C re-seeded against the real
`agentic-2026-07-04-drift.json` results file during the earlier independent ground-truth
adjudication; see `lumenloop-agentic-misses` above). The pre-adjudication table reported the
overall lane at 32/40 (80.0%) familyHit@3 and 25/40 (62.5%) usableOp@5 — those numbers were
inflated by Pool C accepting Scout as a family, which masked the LumenLoop one-shot-discovery gap.
Post-PR-17-fold numbers, run against the Solo `dev-wt` server at `http://localhost:8788`:

| pool | n | familyHit@3 | usableOp@5 |
| --- | ---: | ---: | ---: |
| extended-strict-misses | 12 | 6/12 (50.0%) | 4/12 (33.3%) |
| issue-9-exemplars | 10 | 10/10 (100.0%) | 7/10 (70.0%) |
| lumenloop-agentic-misses | 8 | 3/8 (37.5%) | 2/8 (25.0%) |
| pr17-fold | 3 | 3/3 (100.0%) | 3/3 (100.0%) |
| round-844-real-user | 10 | 10/10 (100.0%) | 9/10 (90.0%) |
| overall | 43 | 32/43 (74.4%) | 25/43 (58.1%) |

The PR #17 fold added only the `pr17-fold` pool; extended/issue-9/round-844 numbers are
byte-identical to the pre-adjudication run, and Pool C remains at its adjudicated baseline.

### July 9 artifact availability

No `eval/discovery/results/` JSON or exact result-file stamp survives for this July 9 baseline.
A free in-memory replay on 2026-07-09 from 22:04:36.356Z through 22:04:37.631Z reproduced all
43 rows and the table exactly (32 family hits, 25 usable operations; pool counts 6/4, 10/7,
3/2, 3/3, 10/9), but that replay was not persisted. Those timestamps are an execution window,
not an invented artifact stamp. The table above is therefore the committed historical record;
the missing raw JSON is explicitly unavailable, and the next run must write a new honest stamp.

## July 10 paired extension baseline

The next run wrote the missing raw evidence and reproduced the historical one-shot table exactly:
`2026-07-10T03-57-12-740Z.json` = 32/43 family@3 and 25/43 usable-op@5. The paired
`2026-07-10T04-06-53-881Z-discovery-current-agent.json` agent run reached 40/43 family@3,
36/43 usable-op@5, and selected an expected primary family on 36/43. Pool results:

| pool | n | agent familyHit@3 | agent usableOp@5 | expected primary |
| --- | ---: | ---: | ---: | ---: |
| extended-strict-misses | 12 | 12/12 | 12/12 | 12/12 |
| issue-9-exemplars | 10 | 10/10 | 9/10 | 10/10 |
| lumenloop-agentic-misses | 8 | 5/8 | 4/8 | 3/8 |
| pr17-fold | 3 | 3/3 | 3/3 | 3/3 |
| round-844-real-user | 10 | 10/10 | 8/10 | 8/10 |
| overall | 43 | **40/43** | **36/43** | **36/43** |

Paired miss classification (`2026-07-10-current-miss-classification.json`): 25 downstream,
12 agent-behavior, 6 retrieval. Five of the six retrieval cases are in the LumenLoop pool
(tokenized-RWA freshness, Aquarius, RWA overview, Soroswap, LOBSTR); the sixth is testnet USDC
faucet. This classification is discovery-layer only; it does not claim those questions are
unanswerable downstream.

## Miss Classification

The historical review taxonomy remains the interpretation layer:

- `retrieval`: one-search discovery failed to surface a needed family or usable op even though the exposed catalog contains one.
- `agent-behavior`: the needed family/op was visible, but an agent likely needs better search planning, follow-up search, or source-family guidance.
- `downstream`: discovery was sufficient; the later answer would fail because of execute usage, upstream data/content quality, missing fields, stale source data, or synthesis.
