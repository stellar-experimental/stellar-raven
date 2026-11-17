# Brief: Fable review of the item 1.3 plan

You are the plan reviewer for round item 1.3 (close the source-gap residue). The lead is Claude
Opus 5.5 at agentpc `t1rm`. You work in `/home/tyler/code/raven-wt/np-1.3`.

## Read

- `AGENTS.md`.
- The plan: `.agents/rounds/2026-11-16-next-phase/items/1.3/PLAN.md`.
- The round's `PLAN.md` item 1.3 and `DECISIONS.md` (decisions 4 and 6 bind), in
  `.agents/rounds/2026-11-16-next-phase/`.
- `.agents/rounds/2026-11-16-next-phase/items/1.1/REPORT.md`, item 4.
- The gap ledger `.agents/rounds/2026-11-14-golden-coverage-audit/gaps/GAPS.md` and `gaps.json`.
- `.agents/TODO.md`, the items the plan names.
- Skills: `.agents/skills/improvements-pipeline/SKILL.md` (and its `references/`),
  `.agents/skills/golden-truth/SKILL.md`, `docs/stellar-docs.md`, `improvements/README.md`,
  `improvements/intake.json`.

## Check

Review the plan against the repository and say where it is wrong, incomplete, or wasteful:

- Are the stated facts true on this tree (leaf list, ids, `sd-110` status, TODO titles, the
  sd-077 placement precedent)?
- Does each step produce a class and a concrete action, with the right owner and collection?
- Do the findings it plans meet the `improvements-pipeline` bar and writing style? Is any planned
  finding really a search-absence claim with no owner page that undertakes the topic?
- Is the golden edit on `q-soroban-cli-bindings` correct per `golden-truth` (lint-canonical
  caution form, `truth.verified`, register)? Are the gates complete for what the item touches?
- Is the spend proportionate (stop rule, Grok attack placement)? Anything to cut?

Rules: do not edit any file except your review. Do not open any file under `eval/qa/corpus/`
except the three case files the plan names. Never read a split file under `~/backups/`. Do not call
any model-graded eval, AI Gateway or Workers AI. Keyless reads of public pages are fine but not
needed.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/1.3/REVIEW.md`: numbered findings, each with a
severity (blocking, should-fix, nit), the evidence (file and line or command), and the change you
recommend. Keep it short. Then report as your task line says.
