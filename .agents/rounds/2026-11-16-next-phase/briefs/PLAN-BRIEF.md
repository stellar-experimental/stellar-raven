# Brief: plan the next phase after tuning loop 2

Planner: Claude Fable 5.2, high effort, lane `next-plan`. Orchestrator: Claude Opus 5.5 (Mac,
`hc` terminal `t40j`). Date 2026-11-16.

## Your job

Write one plan, `.agents/rounds/2026-11-16-next-phase/PLAN.md`, that says what this repository
should do next, in order, and what it should stop doing. Then send the orchestrator only the path:
`hc send t40j '.agents/rounds/2026-11-16-next-phase/PLAN.md'`. Send the same way if you are stuck.

Hard limits for this lane:

- Read anything; write only `PLAN.md` in this folder. No commits, no branches, no pushes, no GitHub
  writes, no deploys, no edits to other tracked files.
- No model-calling eval, no paid call, no AI Gateway call. Keyless read-only checks against live
  public upstreams (Raven's own `search`/`execute` via local scripts, `gh` reads, `curl` of public
  pages) are fine when a fact in the plan depends on them; say which you ran.
- Start no `hc` children and no subagents. Never send input to any terminal but `t40j`. The other
  `claude-code` terminals in this repo (`t3r0`, `t40f`) belong to the owner; do not touch them.
- Never open a held-out or reserve QA case. Never name which set a case is in.
- `agentpc` is unreachable from this Mac right now (Tailscale DNS). Plan Mac-first; mark any step
  that needs agentpc.

## Read first

`AGENTS.md`, `PLAN.md`, `.agents/TODO.md` (all of it), `.agents/README.md`,
`.agents/model-roster.md`, the `run-evals`, `truth-maintenance`, `live-drift-resolution`,
`golden-truth` and `improvements-pipeline` skills under `.agents/skills/`, and these records:

- `.agents/rounds/2026-11-15-tuning-loop-2.md` (+ its folder: KEPT-SET, P0–P2, R)
- `.agents/rounds/2026-11-14-baseline-tuning.md` and `.agents/rounds/2026-11-14-golden-coverage-audit.md`
  (+ `gaps/GAPS.md`)
- `.agents/rounds/2026-11-12-fp.md`, `research/audits/2026-11-12-first-principles-round.md`,
  `research/decisions/0011-tool-surface-stays-code-mode-trimmed.md`
- `research/audits/2026-11-14-caps-audit.md`, `…-client-text-limits.md`, `…-mcp-peer-survey.md`,
  `…-family-decider.md`
- `git log --oneline -40`, open issues (`gh issue list`), issue #223 (drift, updated today),
  #428 (npm audit), #167, #425, #427, #429.
- The owner's own messages from 2026-11-10 to today, extracted from the Claude transcripts:
  `/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/99f9c6ad-c078-4605-8db8-31a48b63b48b/scratchpad/owner-messages-2026-11-10-to-16.txt`
  (lines starting `<hc from=` are lane reports the owner pasted, not owner words). Raw
  transcripts are under `~/.claude/projects/-Users-kalepail-Desktop-stellar-raven-codemode/`
  if you need more; they are large, so use `jq`, not a full read.

## The owner's stated direction (from those messages)

- Sources and goldens are the main accuracy lever; keep pressing upstream improvements and fixing
  golden errors. Gaps (missing content) are findings too; upstream gets issues, never PRs.
- Token efficiency with a high correctness bar; correctness wins only when the alternative is far
  less correct.
- Stop overspending: "focused with a little", decide with the least spend, call results early.
  Run on `hc` subscription CLIs, not API billing. Eval models: Sonnet 5.5, Terra, Grok 4.7.
- Do not overfit the service to the golden set or to the stellar.org slice; build a general
  service, especially for application development and audits.
- Caps should be researched, not arbitrary.
- Standing: merge and deploy as work completes; end clean (main only, local and remote).

## Orchestrator assessment (test it; overturn anything the evidence does not support)

1. **Surface tuning has reached diminishing returns.** Loops 1 and 2 cost about USD 120 of
   subscription-equivalent spend and returned "no harm shown, no improvement shown" on most arms.
   T = 5 on 58 rows cannot see effects this size. Loop 2's held-out read passed its rule but moved
   down (core-correct 115 to 110, traps 7/7 to 5/7, wrong 7 to 9). Required-service coverage fell
   58 → 56 → 55 across P0–P2. The identifier pointer and the family decider both showed agents can
   be handed the right document and still not answer better. My lean: no third surface-tuning loop
   now.
2. **Time-bound work comes first.** Bell/P30 Mainnet vote 2026-11-23 17:00 UTC. Goldens due:
   `q-edge-fresh-latest-protocol-version`, `q-pc-protocol-upgrade-timing`,
   `q-protocol-version-history-list` (11-24), `q-infra-software-versions-current-protocol` (11-30),
   `q-hist-quantum-preparedness-plan` (12-01), `q-scf-current-round` (12-04). After 11-24 the
   `--stale --enforce-floors` lint fails every PR.
3. **Drift #223 is open again** (updated 2026-11-16): skill drift on openzeppelin-stellar,
   stellar-dev (mirrored `standards` touched), stellar-light, two community catalogs (new
   `cavos-stellar`), plus Docs page and anchor drift.
4. **npm audit #428:** `hono` moderate, transitive, fix available.
5. **Hygiene debt.** 12 remote branches ahead of main (`evals/baseline-2026-11-14`, `exp/*` ×5,
   `feat/stellar-org-source`, `research/client-text-limits`, `research/mcp-peer-survey`,
   `tune/loop-1-arm2`, `tune/loop-1-arm3`, `tune/loop-2-runs`) and a local
   `audit/golden-coverage` 29 ahead. Deletion needs a line-level content check, not ancestry.
   Stale TODO text I found: the "first full baseline run" bullet (the 247-case baseline ran in
   #442: 82/144/21); the `fp/*` owner decision (those branches are gone from origin); "Treat
   stellar.org routing reach" still says the branch is unmerged; the stellar.org egress bullet
   (production verified the adapter path after deploy `c3596dcc`); the loop 2 ledger lacks the
   deploy note. Find any others.
6. **Held-out integrity.** One held-out row was exposed (loop 2 deviation) and 73 + 26 routing rows
   duplicate held-out/reserve questions. One re-draw of the split could settle both; that is an
   owner decision and must happen before the next held-out read.
7. **Only Claude Code is measured.** The map removal changed what Grok and OpenCode receive,
   unmeasured. The Codex/Grok QA-runner TODO is the prerequisite for any further surface claim.
8. **Source coverage is the highest-leverage open program** (TODO priority 2): 28
   single-observation gap leaves to re-check, confirmed gaps to classify, gap findings to file
   upstream. Mostly keyless reads.
9. **Cheap general ranker fixes** are queued with clear acceptance checks (vendor prefix rule ≥ 4
   chars; gate-failed backfill), free to verify on the routing gate and off-golden 40.

## What the plan must contain

- A short verdict on the last ten days: what worked, what did not, what the owner should stop
  paying for. Cite records.
- **Ordered phases.** For each work item: the decision it changes; where it runs (Mac `hc`,
  agentpc, CI); expected time and spend (USD 0 where free); the stop rule; the author and reviewer
  tiers per `AGENTS.md` routing; the gates; and whether it ends in a merge/deploy. Keep the free
  and time-bound work first. Any paid run gets a cap and a decision it changes, or it is cut.
- A **"do not do now"** list with the reason for each (things that look attractive but will not
  change a decision).
- A **TODO reconciliation list**: entries to delete, rewrite, or merge, and why. Do not edit the
  TODO yourself.
- **Owner decisions**, each with a recommended answer and a safe default, numbered so the owner can
  reply by number.
- Parallelism: which items can run as disjoint-file lanes at once, and the merge order.
- Keep it under about 400 lines. Plain, direct prose. No round stamps or case lists beyond what a
  step needs.
