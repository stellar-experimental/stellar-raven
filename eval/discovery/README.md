# Discovery Eval

Discovery instruments for the discovery redesign. The one-shot lane asks a narrower question than QA: if a naive agent makes exactly one live MCP `search` call with the user's question, did the returned catalog hits surface the right source family and at least one usable operation or skill? The paired agent lane allows a real headless agent at most three searches, and the replay lane replays search queries mined from prior eval agents.

The runner talks to the real MCP server over HTTP and does not import `src/` search or scoring code. That keeps the lane pointed at the live product surface rather than an offline reimplementation.

## Run

```sh
node eval/discovery/run-discovery.mjs --url http://localhost:8788
SERVER_REVISION=$(git rev-parse HEAD)
SURFACE_SHA256=<surfaceSha256 from eval/report-live-surface.mjs>
AGENT_BINARY_SHA256=<SHA-256 of the capped Claude wrapper resolved on PATH>
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
MAX_BUDGET_USD=<approved total USD cap>
node eval/discovery/run-agent-discovery.mjs --url http://localhost:8787 --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" --max-budget-usd "$MAX_BUDGET_USD"
node eval/discovery/run-replay.mjs --url http://localhost:8787
```

`run-discovery.mjs` retains its historical `http://localhost:8788` default; the new agent and
replay runners default to the repository's local server at `http://localhost:8787`.
Every `--url` may include or omit `/mcp`. For non-local targets, provide the full named
credential (`name:token`) through `RAVEN_MCP_BEARER_TOKEN`; the runner sends it as a bearer
credential and never prints it.

The paid `run-agent-discovery.mjs` lane accepts only a local `dev:eval` server. The free one-shot
and replay lanes can still use an authenticated remote target.

Start paid agent-discovery servers with `npm run dev:eval -- --port 8787`. This launcher requires
a clean worktree and compiles its commit into MCP `serverInfo`. The agent runner disables all
user, project, and local setting sources and slash commands. It keeps the explicit strict MCP
configuration and the existing permission-bypass flag. It does not use Claude `--safe-mode`,
because Claude Code 2.1.247 drops explicit MCP servers in that mode.
Each row must report the explicit `raven` server as `connected`. The runner stops after the first
failure and suppresses all aggregates.

The paid runner requires one space-separated value for each required flag: the binary pin,
environment pin, total budget, `--server-revision`, and `--expect-sha256`.
It rejects missing, duplicate, empty, and `--flag=value` forms before an agent starts.
Each agent receives only its remaining budget authorization.
Missing, invalid, and excessive costs fail the run.
The result artifact records every authorization, reported cost, and remaining amount.

Results are written to `eval/discovery/results/<ISO-stamp>.json` and are local evidence, matching the existing eval results convention.

The agent runner defaults to `claude-sonnet-5` at medium effort, launches non-interactively with
permission bypass, and exposes only `mcp__raven__search`. It records the observed call count,
grades at most the first three searches, and invalidates final-selection credit if the agent makes
zero or more than three calls. `--repeat N`, `--cases`, `--ids`, `--model`, and `--effort`
support isolated A/Bs.

`mine-agent-queries.mjs` builds `mined-lumenloop-queries.json` only from agent-generated queries over committed eval questions; raw user traffic is forbidden. The committed lane has 91 occurrences across the eight LumenLoop target cases from three retained historical agentic result files. Its deterministic register classifier reports 42 mixed (46.2%), 19 entity-only, and 30 capability queries. This does not recreate the unavailable July 9 160-query artifact's 66.3% mixed share; the different retained sample is recorded honestly rather than relabeled to match history.

Standalone replay smoke evidence against the existing Solo `dev` process:
`2026-07-10T04-31-51-308Z-todo-902-smoke.json` (91/91 calls completed; family top-1
20/91, family top-5 37/91, usable operation top-5 28/91). The result is local/gitignored by
policy; its exact stamp and aggregate are retained here.

## Seed Pools

- `extended-strict-misses`: the 12 current extended-lane strict top-5 misses derived from `eval/routing-cases.json`. They are the cases where strict labels still miss while broader acceptable families can be defensible.
- `issue-9-exemplars`: vague/status/current-recommendation questions from GitHub issue #9's exemplar class, authored against exact manifest ids.
- `lumenloop-agentic-misses`: the 8 LumenLoop-labelled cases (`expected_service: lumenloop`) from the real agentic run `eval/agentic/results/agentic-2026-07-04-drift.json` (local-only, gitignored). Ground truth is authored from each case's `expected_cards`, so `expectedFamilies` is `["lumenloop"]` for the seven LumenLoop-only-card cases and `["lumenloop","scout"]` only for `blend-tvl`, whose authoritative card list itself includes `scout_analyze`. This pool deliberately measures **LumenLoop-family** discovery: a miss means one-shot search did not surface the intended LumenLoop editorial/directory source, even in cases where Scout may still return a factually usable answer. Scout was dropped from `phoenix-scf` (SCF submission history is a LumenLoop-specific dataset Scout cannot serve).
- `round-844-real-user`: representative real-user alias/error/tooling questions from the round-844 lane context in `eval/README.md`, using committed routing-corpus questions as durable refs.
- `pr17-fold`: unique provisional seed cases folded from draft PR #17 (`kalepail/stellar-raven#17`) so that competing Phase-0 instrument can be superseded without losing Protocol 24, AP2/ACP, and RPC `getTransactions` exemplars.

## Grading

For each case, the runner calls `search` once with the case question and `limit: 8`.

- `familyHit@3`: any rank 1-3 hit has `service` in `expectedFamilies`.
- `usableOp@5`: any rank 1-5 hit has `id` in `acceptableOps`.
- Raw rank 1-8 hits are recorded as `{ rank, id, service, kind, tier, score }` plus any additional score fields returned by the server that this runner knows to preserve.

The summary reports overall counts and per-seed-pool counts. `classify-misses.mjs` pairs a one-shot result with an agent result:

- `downstream`: one shot already surfaced both expected family@3 and usable op@5;
- `agent-behavior`: one shot missed at least one metric, but one ≤3-search agent run surfaced both;
- `retrieval`: no individual agent run surfaced both. Family and operation hits from different
  repeated runs are never OR-combined into a recovery.

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
