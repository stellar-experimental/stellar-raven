# Lane brief: loop2-plan (plan the second tuning loop)

You are the planner (Claude Fable). Claude Opus reviews your plan; Claude Sonnet implements and
runs it. Write no code and run no model-calling command. Worktree
`/home/tyler/code/raven-wt/loop2`, branch `tune/loop-2`, from `origin/main` at `0a603453` (loop 1
is merged and deployed there).

## Read first

- `.agents/rounds/2026-11-14-baseline-tuning.md` (the ledger) and, in its folder: `BASELINE.md`,
  `TUNING-PLAN.md`, `TUNING-PLAN-REVIEW.md`, `TUNING-PLAN-AMENDMENTS.md`, `STEP-0-PRIME.md`,
  `ARM-1.md`, `ARM-2.md`, `ARM-3.md`, `ARM-3-REVIEW.md`, `KEPT-SET.md`.
- `research/audits/2026-11-14-client-text-limits.md`, `2026-11-14-caps-audit.md` and its review,
  `2026-11-14-mcp-peer-survey.md`, `2026-11-14-family-decider.md`.
- The held `stellarOrg` source: branch `origin/feat/stellar-org-source` (PR 439, draft), and in
  `.agents/rounds/2026-11-14-golden-coverage-audit/decisions/` on that branch: `SORG.md`,
  `SORG-REVIEW.md`, `SORG-GENERAL.md`.
- The `run-evals` skill and `AGENTS.md` ("Spend and evidence").

## The owner approved this order (2026-11-14)

1. Carry the corroboration guard for audit, incident and governance claims on a surface every
   client receives; measure it; then remove the source micro-map from the server instructions.
2. Then land the `stellarOrg` source. With the map in place it overflows Claude Code's 4,096
   characters by 594.
3. Seven search cards by default against five (caps audit M1).
4. Per-client delivery fixes from the probe: the first line of the instructions and the first 120
   characters of each tool description must stand alone (Codex shows one catalogue line; OpenCode
   shows 120 characters of each description); `execute` is 2,029 characters against Grok's 2,033
   cut.
5. Agents that never call research on a named SEP or CAP (the routing gap arm 2 cannot reach).

Orchestrator ruling on the routing and held-out overlap (the owner agreed with the lean): the
73 legacy and 26 extended routing rows that duplicate held-out or reserve QA questions are
off-limits for routing tuning. No lane reads their per-row output; aggregate gate counts stay
allowed. Their ids are not recorded anywhere.

## Owner rules that bind the plan

- Build a general-purpose service. Never fit the goldens, the panel, or one source at the expense
  of other categories. Application development and audits matter most.
- A general mechanism or leave the case red. No case id, question phrase or golden fragment in any
  product surface.
- Cut what adds no visibility. Least spend that can decide. Question every numeric cap and hard
  line, including ones in this plan.
- Subscription spend on Claude models only. Held-out and reserve rows are never opened; a held-out
  read is counts only, launched by the orchestrator with `eval/qa/heldout-read.sh`.

## What loop 1 taught, which the plan must use

- Identical surfaces moved 17 of 50 panel verdicts (7 of 35 on judge-tier-matched rows). A change
  counts only when its cause is traced in the transcript. Every run in a comparison uses the same
  judge-panel cap. The surface changed with loop 1, so loop 2 needs its own same-surface control
  on the new `main`; say whether one control can serve every arm.
- Zero-tolerance count rules revert everything; a pre-registered bar that is itself a guess (the
  50% page-read bar) produced an owner exception. Set bars from measured rates where a rate exists,
  and say where a bar is a guess.
- Tool results reach all four measured clients. Server instructions reach Claude Code and OpenCode
  whole, Grok to 2,033 characters, Codex as one line. Prefer results for anything an answer depends
  on.
- Removing the map cost nothing measurable on Claude Code, but one unhedged audit attribution
  appeared without it. The guard has to exist somewhere agents see before the map goes.
- The existing CANDIDATE EVIDENCE footer already carries part of the guard for semantic and
  research calls. Read what it says today before proposing anything new.

## What the plan must decide

1. For each of the five items: the exact mechanism, the files, what it must not change, the free
   checks before any paid run, and whether it needs a paid run at all (a contract fix decided by
   free checks plus a targeted read is allowed, as arm 2 was).
2. Which items are independent enough to share one panel run, and which must be separate arms.
   Order them so no two are confounded.
3. The panel: whether loop 1's 50 rows still serve, or what to change, by a committed
   deterministic rule over `sets.tuning` only. The guard and the `stellarOrg` source need rows where
   audit, incident and governance claims and SDF-site facts can appear; say how many such tuning
   rows exist.
4. Pass rules with traced attribution, the governance and attribution read as a standing step,
   cost and token measures, and what each result does and does not license per client.
5. The `stellarOrg` landing: rebase onto the post-map `main`; what model-facing text it adds and
   where it now fits; the paired check on its affected tuning cases plus a control from unrelated
   categories; what must be verified after deploy (Worker egress to stellar.org); and the off-golden
   40-question set as a free routing check.
6. Item 4 is about clients the QA runner cannot drive. Say what can be decided by the free probe
   harness (`research/audits/2026-11-14-client-text-limits/`), what text changes are safe as
   contract fixes, and what must wait for a Codex or Grok answering runner.
7. Item 5: whether a general mechanism exists that is not a per-source boost or per-question
   vocabulary. If none does, say so and leave it red with the evidence.
8. Spend: an estimate and cap per run from loop 1's measured USD 0.19 per case, the total, and the
   single held-out read at the end with its fixed reading.
9. Deploy points: which kept changes ship together, and what is verified live after each deploy.

## Output

`.agents/rounds/2026-11-15-tuning-loop-2/PLAN.md`: the four `run-evals` lines first, then the
sections above, then open questions for the orchestrator, each with your recommendation. Compact
prose. Also create the round ledger `.agents/rounds/2026-11-15-tuning-loop-2.md` with the scope,
the ruling above, and an empty lanes table. Commit and push the branch.
