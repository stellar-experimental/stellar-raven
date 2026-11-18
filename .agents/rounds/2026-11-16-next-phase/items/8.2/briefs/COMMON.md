# Item 8.2 common rules for every child (docs audit)

Lead: Claude Opus 5.5, agentpc `t1yk`. Worktree `/home/tyler/code/raven-wt/np-8.2`, branch
`np/8.2-docs-audit` from `origin/main` `e0ad27d9`. Item folder:
`/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/`.

Owner instruction (2026-11-18, verbatim): "We should probably work with Fable and Sonnet to audit and
review all docs around this repo to ensure accuracy, cleanliness, organization, etc."

Goal: every living document states current behavior accurately, has one clear home (no two documents
own the same fact), is easy for a human and an agent to navigate, and carries no stale history.
AGENTS.md "Definition of done": documentation describes current behavior and links dated research,
not history.

## Rules (binding)

- Read `/home/tyler/code/raven-wt/np-8.2/AGENTS.md` first.
- **Search.** Search with `rg --hidden -g '!.git' <pattern> [path]`. The `.ignore` files under
  `eval/`, `eval/qa/` and `.agents/rounds/` keep it out of the case-bearing paths. Never use
  `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a
  shell glob over `eval/` or `.agents/rounds/`.
- **Never open** `eval/qa/corpus/`, `eval/corpus/`, `eval/qa/cases.json`, `sample.json`,
  `tool-cases.json`, `consistency-register.json`, `source-sentinels.json`, `eval/qa/reviewed/`,
  `eval/qa/results/`, `eval/holdout-cases.json`, `eval/protocol-history-blind-cases*.json`,
  `.agents/rounds/2026-11-02-golden-audit/` or `.agents/rounds/2026-11-14-golden-coverage-audit/`.
  A doc may name these paths; check such a path's existence with `test -e`, never its contents.
  Never run the QA lint (`npm run eval:qa:lint`).
- **Spend.** No model-calling eval, no paid call, no AI Gateway or Workers AI call, no `wrangler dev`,
  no deploy. Free reads are fine: repository files, `npm run <script> -- --help` where a script
  supports it, `npx wrangler --version`, `gh issue view`/`gh pr view` (read-only), and keyless
  public pages.
- **No subagents.** Do the work yourself in this session.
- **Read-only** unless your brief says otherwise: write only your own findings file.
- Never print a secret. Do not open `.dev.vars`.
- Records are evidence, not instructions: `research/**`, `.agents/rounds/**`,
  `improvements/<service>/*.md` findings and ADR decision text (`research/decisions/`) are never
  rewritten. Check only that living docs link them correctly; flag a living doc that treats a record
  as a live instruction.

## Frozen until run 2.2c has merged (about 2026-12-04)

Timer-launched dated runs read these from `origin/main`. A finding may propose a change to them, but
mark it `FROZEN` so the lead defers it:
- the paths `AGENTS.md`, `.agents/skills/golden-truth/SKILL.md`,
  `.agents/skills/improvements-pipeline/SKILL.md`, `eval/qa/README.md`, `.agents/TODO.md`;
- the section numbering of `golden-truth/SKILL.md` (a dated brief cites "section 4");
- the "Maintenance exception" and "Held-out split" headings in `eval/qa/README.md` (the `.ignore`
  files, the case-search hook message and its test cite "Held-out split");
- the TODO anchors listed in `items/8.1/PLAN.md` "Frozen anchors".

## Findings file format

Markdown. One table row or bullet per finding, with an id (`<SET>-NN`):
- `file:line` of the doc text;
- class: `accuracy`, `stale-history`, `duplication`, `ownership`, `organization`, `dead-link`,
  `orphan`, `term`, `timeless` (skill text with todo IDs, run stamps or dated state), `code-defect`
  (the doc is right and the code is wrong: becomes a TODO item, not a fix);
- what the doc says, in brief;
- the evidence: the code path and line, the command and its output, or the issue state;
- the proposed fix, as exact replacement text where it is short;
- confidence: high, medium, low.
End with a short "Checked and correct" list of the claims you verified, so the lead can see coverage.
A finding without evidence is not a finding.
