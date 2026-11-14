# Golden coverage audit — 2026-11-14

## Scope

The owner asked for a deep audit of the QA battery as an instrument: does it cover the whole
surface of Stellar by category, in as few cases and as little judge-facing prose as possible, and
does each case test what matters?

The 2026-11-02 audit re-verified every case's truth. It did not ask whether each case should
exist, or what is missing. This round asks both.

In:

- All 501 active battery cases and the 6 proposals. Each gets one verdict: keep, tighten, merge,
  retire, or move to a tool-contract lane.
- A taxonomy of Stellar built from outside the battery, used as the coverage map.
- New cases for uncovered topics, through the `golden-truth` propose-then-activate lifecycle.
- Compact judge-facing prose: provenance moves from `golden.notes` to the judge-blind `truth`
  block.
- New lint floors derived from the taxonomy, replacing `CATEGORY_FLOORS`.
- A gap ledger: topics Raven's sources cannot answer become `improvements/` findings.
- A fresh tuning, held-out, and reserve split drawn by rule at close.

Out: product code, the frozen live lanes, upstream posting, paid Lumenloop research, any deploy.

**Decision it changes.** Which cases form the headline battery, and which upstream gaps get filed.

**Owner decisions, 2026-11-14.**

1. Audit all 501 cases. The first-principles split is void after restructuring; re-draw it.
2. Coverage decides the battery size. No fixed number.
3. Cases that grade Raven mechanics leave the headline. Each must also earn its place in a
   separate lane; cut the ones that add no visibility. The owner: "toxic code bloat is a problem
   we need to fight".
4. Spend on the Claude subscription is approved while weekly limits have headroom for other
   parallel work. No API-billed path.

**Spend.** Subscription CLI lanes on agentpc. Parallel web search is metered on the SDF DevRel
organization; the owner asked for extensive use. Lanes use `search` and `extract` by default and
`research` only for a topic that two searches could not settle.

**Stop rules.**

- A lane that meets a usage or rate limit halves its pace and retries with backoff. If the limit
  holds for 20 minutes it writes its state, reports `LIMIT`, and stops. No lane continues on
  weaker sources.
- The orchestrator runs at most six lanes at once and drops to three on the first `LIMIT`.
- A phase closes when every unit has a verdict with evidence. No confirmation pass beyond the one
  independent verification each phase names.

**Overlap.** Session `t3r0` ran a `golden-pass` lane (procedural key facts) on 2026-11-14. No
branch or pull request from it was found at round start. This round's case audit covers the same
77 flagged key facts. Before phase 4 edits, the orchestrator checks `origin` again and rebases on
any golden change.

## Phases

| # | Phase | Output | Verification |
|---|---|---|---|
| 1 | Surface map | `map/taxonomy.json`: domains and leaf topics with weight, volatility, canonical sources | Two independent mappers (supply side, demand side), one reconciler |
| 2 | Case audit | `audit/<lane>.json`: one record per case | Opus verifier re-derives every retire, merge, move, and changed fact |
| 3 | Gap research | Proposed cases for uncovered or thin leaves | Blind re-derivation from live sources |
| 4 | Apply | Case edits, tombstones, proposals, taxonomy tags, new floors | Lint, register, compile |
| 5 | Gap ledger | Per leaf: answerable, reachable but not surfaced, or unreachable; findings filed | Opus review of each finding |
| 6 | Verify | Free gates; a Sonnet 5.5 QA sample on changed and new cases | Independent whole-diff review |
| 7 | Close | Pull requests, new split, outcome table, TODO updates | |

Compaction target for a judge-facing golden: an answer of 60 words or fewer where the truth
allows, two to four single-predicate key facts that state world facts, avoid items only for claims
shown false, and notes limited to grading cautions.

## Lanes

Machine `agentpc`, worktree `/home/tyler/code/raven-wt/gca`, branch `audit/golden-coverage`.
Orchestrator: Claude Fable 5.2 on the Mac, terminal `t40f`. Briefs are in
[`2026-11-14-golden-coverage-audit/briefs/`](2026-11-14-golden-coverage-audit/briefs/).

| lane | agent (model, effort) | terminal | write set | status |
|---|---|---|---|---|

## Ledger

## Outcome
