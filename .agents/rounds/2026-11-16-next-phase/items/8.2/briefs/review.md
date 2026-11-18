# Item 8.2 plan review (Claude Fable 5.2)

Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/briefs/COMMON.md` first; its rules bind you, except that the plan's "Correction to the
frozen list" replaces COMMON's frozen list. You review the lead's plan, read-only. Write your review
to `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/REVIEW.md`, then report.

## Inputs

- The plan: `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/PLAN.md` (stage 2 is the change list under review).
- The five audit files it reconciles: `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/audit/{A,B,C,D,O}.md`.
- `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/EXPOSURE.md` (case ids only; do not open the passages it names, and do not open
  `ideas/codegen-correctness-substrate.md` lines 170-225 or `ideas/source-delivery-ranked-references.md`
  lines 28-62).
- The orchestrator's constraints: `/home/tyler/code/raven-wt/orch/8.2-NOTE.md` and
  `/home/tyler/code/raven-wt/orch/7-COMMON.md`.
- The repository at `/home/tyler/code/raven-wt/np-8.2` (branch at `origin/main` `e0ad27d9`).

## Check

1. Every adopt, decline and defer: is it right? Spot-check the evidence of the findings the plan
   adopts with the highest reader impact (at least A-03, A-04, A-06, A-12, B-01, B-03, B-05, C-05,
   C-11, D-01, D-04, O-02, O-06, O-52) against the code. Flag any adopted finding whose evidence is
   wrong.
2. Missing: a finding the plan neither adopts nor declines; a change that would break a frozen path,
   anchor, test, generated file, CI sync guard or link; a deletion without a disposition or with lost
   work (owner rule: "be careful never to delete work that hasn't been considered or wrapped into the
   main project").
3. Scope and split: the three PRs' file sets are disjoint; nothing touches Worker bytes; each PR is
   reviewable; the list of changes for orchestrator approval (AGENTS.md rules, `SKILL-BEHAVIOR`) is
   complete.
4. The handling of the case-text exposure (decision 2 and EXPOSURE.md): is it right and enough?
5. Spend: is anything here not worth doing, or missing at low cost?

Write each finding with an id (`R-NN`), severity (blocking, should, nit), the plan line it concerns,
evidence, and the change you want. End with a verdict: approve, approve with changes, or rework.
