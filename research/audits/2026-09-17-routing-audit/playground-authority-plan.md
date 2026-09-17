> Coordinator disposition: not authorized for launch. Existing controls cannot enforce the proposed dollar limit.
> The budget paragraph below uses an obsolete draft. The current D3 allocation is $178, or $180 with regrading.
> A cost observed after B1 does not bound B1 in advance. No extra call-count allowance was allocated.

# Proposal: bounded Playground A/B for the EXECUTE_DESCRIPTION authority clause

- **Status:** **DRAFT. Not launched.**
- **Scope:** read-only inspection on 2026-09-17. No paid calls, code edits, servers, or changes to
  D3 inputs.

## Verdict

**The run cannot be certified inside a $20 method ceiling with the existing controls.**

- **Answer model:** the Playground runner enforces call counts only. It records
  `answerProviderCostUsd: null` (`"not-emitted-by-playground-artifact"`), so answer-model spend has
  no USD accounting or cap.
- **Judge:** judge calls run without `maxBudgetUsd`. Judge cost is reported after each call but not
  capped.
- **Measurability:** the clause can be measured with the existing instrument and existing controls
  only if the root adds an observable USD checkpoint outside the harness. That checkpoint is AI
  Gateway cost for the baseline run's requests, read before any candidate spend. Without it, the
  $20 ceiling is an estimate, not an enforced cap.

## Why ordinary QA cannot measure the clause

- The clause "purely factual questions use docs first." sits in `EXECUTE_DESCRIPTION`
  (`src/mcp/tools.ts:281`, skills bullet at line 312). It starts at about character 5,956 of a
  description of about 9,500 characters.
- Claude Code clips MCP tool descriptions, so the QA answering agent never sees it.
- The Playground route wires the full constant: `src/demo/tools.ts:408` uses
  `description: EXECUTE_DESCRIPTION`, with no truncation in the demo tool path. The system prompt is
  `SERVER_INSTRUCTIONS` plus the preamble (`src/demo/prompt.ts:28`).
- **Residual:** provider-side handling of a 9.5k tool description is not observable from the
  artifact. Earlier Playground runs completed, so the provider did not reject it, but provider
  truncation is not proven absent.

## Candidate change (one clause; no code edit made)

- **Existing authority rule** (`src/mcp/micro-map.ts:5`, rendered into `SEARCH_DESCRIPTION`
  workflow step 1): "stellarDocs=official protocol/SDK/CLI/contracts/RPC/anchor/wallet docs; scout=live
  ecosystem graph …; lumenloop=community/editorial projects, research, content, SCF/funding …".
- **Baseline text:** `purely factual questions use docs first.`
- **Proposed replacement** (the implementer commits it in a separate worktree):
  `purely factual questions start with the authoritative family from search's family map: stellarDocs for protocol, SDK, CLI, contract, RPC, anchor, and wallet facts; scout or lumenloop for ecosystem projects, people, and funding.`
- **Nothing else changes:** no scorer, catalog, manifest, adapter, or other prose. The candidate
  worktree differs from the baseline worktree only in `src/mcp/tools.ts`.
- **Compared revisions:** baseline and candidate must both be based on the same pinned revision.
  The baseline is that revision, with no D3 change, unless the root decides to layer this on the
  accepted D3 result. **Do not mix this with D3 arms.**

## Frozen controls (existing QA cases; no corpus change)

All 12 are active, have no trap, and have `truth.status: confirmed`. None has a pending golden
correction (Aquarius, Soroswap, and LOBSTR are excluded). The runner executes them in battery order:

| Group | IDs | Expected authority |
|---|---|---|
| Protocol/API facts (regression guard) | `q-aas-issuer-fees-supply-cap-freeze`, `q-protocol-accounts-signers-thresholds`, `q-protocol-parallel-execution`, `q-protocol-scp-consensus-algorithm`, `q-sep-41-token-interface`, `q-sor-sep41-transfer-vs-transferfrom` | stellarDocs first |
| Ecosystem facts (target) | `q-defi-blend-what-is`, `q-defi-comet-what-is`, `q-defi-phoenix-what-is`, `q-eco-freighter-wallet`, `q-eco-xbull-wallet`, `q-org-sdf-board-directors` | scout or lumenloop first |

Exact `--ids` value, in battery order:

```text
q-aas-issuer-fees-supply-cap-freeze,q-defi-blend-what-is,q-defi-comet-what-is,q-defi-phoenix-what-is,q-eco-freighter-wallet,q-eco-xbull-wallet,q-org-sdf-board-directors,q-protocol-accounts-signers-thresholds,q-protocol-parallel-execution,q-protocol-scp-consensus-algorithm,q-sep-41-token-interface,q-sor-sep41-transfer-vs-transferfrom
```

- **Overlap with D3 M1:** four IDs overlap (`q-aas-issuer-fees-supply-cap-freeze`,
  `q-protocol-parallel-execution`, `q-defi-blend-what-is`, `q-org-sdf-board-directors`). This lane
  is a separate instrument with a separate denominator and does not change D3 inputs. **Never merge
  its results with QA.**
- **Freshness mix:** `q-sep-41-token-interface` is `live`; `q-sor-sep41-transfer-vs-transferfrom`,
  `q-org-sdf-board-directors`, and `q-defi-phoenix-what-is` are `scheduled`. Their judge inputs
  include evidence packs.

## Metrics (pre-registered)

1. **Mechanism (primary):**
   - For each row, the family of the first service operation called in the first `execute`
     script, read offline from the saved `mcp__playground__execute` inputs.
   - Report the stellarDocs-first rate for protocol rows and the scout- or lumenloop-first rate for
     ecosystem rows.
   - The plan regrade (`npm run eval:plan`) adds set coverage.
   - The first-family read is a small offline analysis of saved artifacts, not a harness change.
2. **Guard:**
   - **Blocking:** any protocol row that loses docs-first **and** loses a required key fact
     (verified by transcript review).
3. **Answer quality:** judge grades are diagnostic only. With n = 12 and two runs per arm, the lane
   has no statistical power. Read wrong counts first.

## Design and sizing

- **Arms and order:** baseline B and candidate C, two runs each, in the order B1, C1, C2, B2.
- **Calls:** 4 runs × 12 IDs = 48 answer turns and 48 judge calls.
- **Throttle:** each run mints its own run-scoped subject, and 12 is within the 30-per-hour cap.
- **One Wrangler at a time:**
  - B1 and B2 need a `npm run dev` pane in the baseline worktree.
  - C1 and C2 need one in the candidate worktree.
  - This requires three server sessions: B, then C, then B again.
  - Schedule it only after D3 collection releases its server.

### Cost evidence (stored artifacts)

- **Judge:** 66 local Playground artifacts; judge cost per judged row is about $0.095–$0.159
  (for example `overfit-audit-live15` $0.159 per row, `overfit-audit-main15` $0.151 per row). The
  estimate for 48 judge calls is about $4.60–$7.60. Judge calls are not individually capped.
- **Answer model:** no artifact records answer-model cost. All stored artifacts predate the current
  `openai/gpt-5.6-terra` primary and `openai/gpt-5.6-luna` fallback (`src/demo/model-config.ts:12-13`).
- **Worst-case tokens (not USD):**
  - Per turn: at most 7 steps and at most 4,096 output tokens per step (`DEMO_CAPS`).
  - Output across 48 turns: at most 48 × 7 × 4,096 = 1,376,256 tokens.
  - Input: bounded only by system and tool text plus truncated tool results per step. There is no
    USD bound without the model's price.

### $20 fit

- Judge alone is about $5–8. The remaining $12–15 must cover 48 answer turns at an unknown price.
- **Not certifiable in advance.**
- **Feasible checkpoint design:** stop after B1 (12 answers plus 12 judges). The root reads AI
  Gateway cost for B1's requests from the run's time window and gateway ID. Continue only if
  `4 × (B1 answer cost) + observed judge cost + 10% reserve ≤ $20`.
- **Within the $250 total:** the D3 plan v3 allocates $158 with a $92 reserve. A $20 method fits
  only if it is drawn from that reserve by explicit authorization.

## Exact commands (per arm; run in that arm's worktree; root-owned server)

```sh
# 0. Root starts the only Wrangler in this worktree, then:
npm run eval:playground -- --print-generation            # -> GEN (free)
npm run eval:playground -- --preflight --url http://localhost:8787   # free; expects HTTP 400 before model work
npm run eval:playground -- --dry-run --ids "$IDS"         # free; confirms the 12 IDs and order

# 1. Paid run (after pre-spend review and authorization)
npm run eval:playground -- --confirm-paid --url http://localhost:8787 \
  --server-generation "$GEN" \
  --round-cap-context /tmp/raven-routing-audit-2026-09-17/playground-clause/cap-<arm><run>.json \
  --ids "$IDS" \
  --out-dir eval/local-lanes/playground-semantic/execute-authority-clause/<arm><run>

# 2. Free plan regrade
npm run eval:plan -- eval/local-lanes/playground-semantic/execute-authority-clause/<arm><run>/<stamp>-playground-semantic.json
```

### Round-cap context (B1 example; update `*ConsumedBeforeRun` before each next run)

```json
{
  "contract": "playground-semantic-round-cap/v1",
  "experimentId": "2026-09-17-execute-authority-clause",
  "kind": "reviewed-round",
  "runAllocation": "planned",
  "plannedAnswerCalls": 48,
  "absoluteAnswerCallCap": 48,
  "answerCallsConsumedBeforeRun": 0,
  "plannedJudgeCalls": 48,
  "absoluteJudgeCallCap": 48,
  "judgeCallsConsumedBeforeRun": 0,
  "infraRetryReserve": 0,
  "infraRetryConsumedBeforeRun": 0,
  "savedAnswerRejudgeReserve": 0,
  "savedAnswerRejudgesConsumedBeforeRun": 0
}
```

The reserves are zero on purpose: any retry or re-judge needs a new reviewed authorization.

## Safe local auth

- **Loopback only:** the runner refuses any non-loopback `--url` (`ensureLoopbackUrl`).
- **Cookie:** it reads `MCP_SERVER_SECRET` from the environment or `.dev.vars` without logging it,
  and mints an ephemeral run-scoped demo cookie. The cookie is never saved and never sent to a
  non-loopback host.
- **Route check:** `--preflight` proves that the signed cookie reaches body validation (HTTP 400)
  with no throttle or model request.
- **Provider credentials:** these stay in the Worker's host-side environment. The local dev server
  still calls the real AI Gateway, so every answer turn is paid.

## Blockers and conditions

1. **No harness USD enforcement** for answer turns, and no per-call judge USD cap. This needs the
   root-owned AI Gateway cost checkpoint after B1, or an explicit acceptance that $20 is an
   estimate.
2. **Answer-model price unknown** for `openai/gpt-5.6-terra` and `-luna`. There are no stored
   current-model Playground cost artifacts.
3. **Server-generation limit:** `--server-generation` asserts the local tree only and does not prove
   what the running Worker loaded (README). The operator must start each arm's server from the
   matching worktree.
4. **Weaker judge pinning:** the Playground judge path does not pin the Claude binary or environment
   as `run-qa.mjs` does. Judge comparability across arms relies on sequential runs close in time.
5. **Pre-spend review required** (run-evals). The one-Wrangler rule forces sequencing after D3
   collection.
6. **Provider-side description handling** is not observable (see above).

If the root cannot provide the gateway cost checkpoint, report this method as **blocked for a
certified $20 ceiling** and do not launch it.
