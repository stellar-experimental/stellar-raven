# Fable plan review, item 5.2

You review a plan; you change no repository file except the review file below.

- Worktree: `/home/tyler/code/raven-wt/np-5.2` (branch `np/5.2-owner-followups`, from `origin/main`).
- Plan: `.agents/rounds/2026-11-16-next-phase/items/5.2/PLAN.md`.
- Its inputs, in the same folder: `NOTE.md` (the orchestrator's scope, binding) and `EVAL-FABLE.md`
  (the evaluation it starts from; items A, C, D, E, F, H, I only).
- Rules: `AGENTS.md`, `.agents/skills/improvements-pipeline/SKILL.md`, `improvements/README.md`,
  `eval/qa/README.md` ("Held-out split").

## Check

1. Every fact the plan states against the repository (TODO headings and wording, line numbers,
   ids, hashes, file paths, the pinned `@cloudflare/codemode` lines under `node_modules`).
2. Scope against NOTE.md: anything NOTE.md asks for that the plan misses, or anything the plan adds
   that NOTE.md does not ask for.
3. The maintenance-exception rule text (EVAL-FABLE section E): loopholes, ambiguity, conflicts
   with the existing "Held-out split" rule or with answer 2 in `DECISIONS.md`. Propose tightened
   wording if needed.
4. Step 4 (dated briefs): read `items/1.4/dated/PRESTAGE.md` and the four `*-LEAD.md` briefs. Is
   keeping their narrow scope correct and safe for unattended runs? Does any brief text contradict
   the new README rule once it lands?
5. Step 5 and 6 (`cs-012`): is the finding well placed, is the reproduction sufficient and free,
   and does the filing follow the skill?
6. Gates and stop rule: sufficient and runnable.

## Hard limits

- Never open a file under `eval/qa/corpus/`, `eval/qa/cases.json`, `eval/qa/sample.json`, or any
  split file. Never name which set a QA case is in.
- No model-calling eval, no paid call, no upstream post, no commit.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/5.2/REVIEW.md`: numbered findings, each with
severity (blocking / should-fix / nit), the evidence (file and line), and the concrete change to
the plan. Then run the report command from your launch line.
