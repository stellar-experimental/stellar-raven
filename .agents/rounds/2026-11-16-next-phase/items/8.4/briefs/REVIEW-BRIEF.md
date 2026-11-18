# Item 8.4: Fable plan review

You review the plan at `/home/tyler/code/raven-wt/np-8.4/.agents/rounds/2026-11-16-next-phase/items/8.4/PLAN.md`
against the repository in `/home/tyler/code/raven-wt/np-8.4` (branch `np/8.4-families-everywhere`).
Read-only: change no file except your findings file.

Goal of the item (owner, 2026-11-18, verbatim): "We should update all things everywhere around this
to not name versions but rather familes running the latest version. e.g. there are new Sol and Astra
versions that came out recently". Item 8.3 (#494) did the roster, AGENTS.md, eval code and the
Playground constant; this item finishes the rest. Records keep the model they ran on.

Read `AGENTS.md`, `.agents/model-roster.md`, `scripts/latest-model.mjs`, the plan, and every file
the plan names. Check:

1. Completeness. Re-scan for version pins in live files (launch lines, defaults, skills, READMEs,
   CONTRIBUTING, scripts, src, test helpers that assert a version as a default). Is anything live
   missed, or is anything the plan calls a record actually live (or the reverse)? Name file:line.
2. The dated briefs (`items/1.4/dated/*-LEAD.md`) run unattended from a systemd timer on
   2026-11-23 18:00 UTC via `items/1.4/dated/launch-dated-lead.sh`. Is the plan's two-step launch
   form correct shell inside those briefs and `briefs/ITEM-LEAD.md` (the `systemd-run` scope
   wrapper, quoting, `$HC_TERMINAL_ID`, failure behavior)? Does anything else in those briefs
   change meaning? Is the claim "the lead reads the brief from origin/main at fire time" right?
3. Step 4 (gauntlet defaults derived from `DEMO_CATALOG_LATEST`): correct, minimal, and does the
   test change still guard what it guarded? Any Worker-bytes or typing issue?
4. Step 5 (gateway judge stays explicit): is the reason sound, and is the doc edit right?
5. Gates, stop rule and risks: anything missing or excessive for the spend rules in AGENTS.md?

Search rule (binding): search with `rg --hidden -g '!.git' <pattern> [path]`. Never use `grep -r`,
`git grep`, `rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over
`eval/` or `.agents/rounds/`. Never open a QA held-out or reserve case (eval/qa/corpus/,
cases.json, sample.json, tool-cases.json, eval/qa results/ or reviewed/), and never run the QA lint.
No model-calling eval, no paid call, no network writes. No subagents.

Write findings to `/home/tyler/code/raven-wt/np-8.4/.agents/rounds/2026-11-16-next-phase/items/8.4/REVIEW.md`:
a numbered list, each with severity (blocking / should / nit), file:line evidence, and a concrete
fix. Record your own resolved model ID at the top. Keep it short. Then send only the path as the
task line says.
