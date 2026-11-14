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
| map-supply | Claude Fable 5.2, high: taste and product judgment | `agentpc/t1hd` | `map/map-supply.json` | done: 14 domains, 160 leaves |
| map-demand | Claude Opus 5.5, high: a second model for an independent map | `agentpc/t1hf` | `map/map-demand.json` | done: 14 domains, 156 leaves |
| map-reconcile | Claude Fable 5.2, high | `agentpc/t1j8` | `map/taxonomy.json`, `map/taxonomy.md` | done: 14 domains, 167 leaves, target 249 cases |
| audit-protocol, -assets, -defi, -soroban-a, -soroban-b, -scf, -compliance, -edge, -hist-retail, -tooling-a, -tooling-b | Claude Sonnet 5.5, high: bounded per-case review | `agentpc/t1hg`, `t1hh`, `t1hj`, `t1hk`, `t1j1`, `t1hx`, `t1hy`, `t1j0`, `t1j9`, `t1jc`, `t1jd` | `audit/<lane>.json` | done: 507 records |
| verify-protocol-defi, -assets-soroban-a, -scf-edge, -compliance-soroban-b, -hist-retail, -tooling-a, -tooling-b | Claude Opus 5.5, high: the reviewer differs from the Sonnet auditors and the Fable orchestrator | `agentpc/t1hz`, `t1jb`, `t1jf`, `t1jh`, `t1jj`, `t1jk`, `t1jm` | `verify/<audit-lane>.json` | done: 502 decisions |
| coverage | Claude Fable 5.2, high | `agentpc/t1jq` | `coverage/coverage.json`, `coverage/coverage.md` | done |
| instrument | Claude Opus 5.5, high: instrument code; Codex tiers skipped because the owner asked for Fable, Opus, and Sonnet | `agentpc/t1jr` | `eval/qa/**` code, tests, `apply/**` | first pass done; follow-up running |
| verify-coverage | Claude Opus 5.5, high: reviews the Fable coverage lane | `agentpc/t1jt` | `coverage/verify-coverage.json` | running |
| gap-1, gap-2, gap-3 | Claude Fable 5.2, high: question design and research | `agentpc/t1jv`, `t1jw`, `t1jx` | `gap/<lane>.json`, new files under `eval/qa/corpus/proposed/` | running |

## Ledger

- 2026-11-14 05:50 UTC. Opened the round at `920ae9f2`. Created the box worktree and launched six
  lanes with `hc run --bg --on agentpc --outlive-parent ... claude --model <alias> --effort high`.
  All six reported `working` on their brief.
- 06:00 to 08:40 UTC. Phase 1 and 2. The two maps were reconciled into 167 leaves with a target of
  249 cases. The 11 audit lanes returned 507 records; 7 verifier lanes checked 502 of them (401
  accepted, 100 amended, 1 rejected; 5 `keep` records fell outside the one-in-five sample). Final
  verdicts: 297 tighten, 84 merge, 100 retire, 18 move to tool lane, 8 keep. Rot checks: 604
  hold, 97 unverifiable, 35 changed. The first verifier's error patterns went into
  `briefs/common.md` (`a5631afb`). Outputs committed on the box at `52f0b754`.
- 08:40 to 09:05 UTC. `coverage` mapped survivors to leaves: 211 headline cases, 7 tool-lane
  cases, 200 retired, 89 merged, 35 open slots, 24 empty leaves (21 with a slot, 3 waived). It
  proposed 94 cuts beyond the audit; `verify-coverage` reviews them before anything is applied.
- 08:45 to 09:00 UTC. `instrument` wrote `apply/DESIGN.md`, taxonomy-based lint rules, a tool-lane
  partition, and `apply/apply.mjs`. In a scratch clone with fixture leaves: compile, register,
  lint (`--stale --enforce-floors`, and `--since`), selftest, and sentinels exit 0; `npm test`
  fails in 6 files that pin case content. 17 records were refused (`apply/REPORT.md`).
- 09:05 to 11:30 UTC. Phases 3 and 4. `verify-coverage` (Opus) accepted 92 of the 94 extra cuts
  and turned 2 into merges, accepted all 22 merge fixes, and cut the tool lane from 7 to 6
  (`coverage/verify-coverage.json`). `polish` (Fable) wrote 71 overrides (`coverage/POLISH.md`).
  `gap-1` to `gap-3` (Fable) proposed 36 cases; `verify-gap` (Opus) re-derived each one blind: 29
  accepted, 7 amended, 0 rejected (`gap/verify-gap.json`). Raven reach on the 36: 27 answerable, 8
  unreachable, 1 reachable but not surfaced.
- 11:30 UTC. `instrument` ran `apply/apply.mjs` for real: `c7dbdc87`, 210 headline and 6 tool-lane
  cases, 291 tombstones. Gate table in `apply/RUN.md` (all exit 0).
- 11:40 to 13:20 UTC. `review` (Sonnet 5.5, high; it differs from the Opus instrument author, the
  Fable polish and gap authors, and the Fable orchestrator; the Codex tiers were skipped because
  the owner asked for Fable, Opus, and Sonnet) found four must-fix and eight optional items and
  no truth error in a 30-case read (`review/REVIEW.md`). `resweep-1` and `resweep-2` (Sonnet)
  re-checked the 105 reopened register entries: 57 consistent, 26 text edits, 12 dropped members,
  10 deleted entries, 0 conflicts.
- 13:20 UTC. `instrument` fixed M1 to M4 and L1 to L3, activated the 36 proposals, applied the
  re-sweep, closed the register, and merged `origin/main` (`d7e13d98`): `aaaf107f`, 246 headline
  and 6 tool-lane cases, 164 of 167 leaves covered. Gate table in `apply/FINAL.md` (all exit 0).
  Left open there: optional key-fact polish (L4), one leaf question (L5), and one correction made
  after review (`q-token-xlm-supply-total-circulating`), which goes back to `review`.

### QA test plan (before any runner call)

1. **Decision.** Which new or rewritten cases are unanswerable, ambiguous, or mis-goldened, and
   which topics Raven's sources cannot answer. It is a test of the battery; it yields no headline
   score.
2. **Smallest run.** 70 cases at `aaaf107f`, variant A, one client (the runner's default
   answering and judge models): the 36 activated cases plus 34 rewritten cases drawn by hash,
   stratified by domain.
3. **Stop rule, cap, estimate.** One collection, `--max-budget-usd 40`, no re-run or re-judge.
   Stored runs cost USD 0.32 to 0.41 per case (`2026-08-28T19-27-08` and `2026-08-30T03-43-11`,
   100 cases each), so USD 22 to 29 and one to two hours. Billing is the subscription CLI on
   agentpc; the owner approved subscription spend on 2026-11-14.
4. **Review coverage.** Every `wrong` and `partial` row against transcript and golden, and every
   fifth `correct` row.

## Outcome
