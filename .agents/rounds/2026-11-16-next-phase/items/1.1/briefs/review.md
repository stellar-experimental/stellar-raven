# Item 1.1 plan review brief (Claude Fable 5.2, high)

You review the item plan `PLAN.md` in this directory against the repository at
`/home/tyler/code/raven-wt/np-1.1`. Read `AGENTS.md`, `QUESTION.md` (the orchestrator chose option 1),
the round `PLAN.md` item 1.1 and `DECISIONS.md` (decision 4), and the skills
`.agents/skills/improvements-pipeline/SKILL.md` and `.agents/skills/golden-truth/SKILL.md`.
Check the plan's facts, steps, gates and stop rule against the code (`eval/qa/split-amend.mjs`,
`test/split-amend.test.mjs`, `eval/qa/tuning-rows.mjs`, `eval/qa/lint-corpus.mjs`,
`scripts/improvements-*.mjs`, `improvements/README.md`, the twelve findings named in the plan).

Hard rules:
- Do NOT open, print, grep the content of, or diff `eval/qa/corpus/battery/tooling-infra/q-tool-wallets-comparison.json`
  or its rows in `eval/qa/cases.json`. Do not open any other QA case except
  `q-scf-resolve-passport-superseded-slug`. Never read anything under `~/backups` beyond `ls` and `sha256sum`.
- Read-only: edit nothing except your findings file. No posting anywhere, no model-calling eval.
  Keyless public reads (curl, `gh api` reads) are fine if a fact needs checking.

Write findings to `REVIEW.md` in this directory: a numbered list, each with severity
(blocker / should / nit), the plan line it concerns, evidence (file:line or command output), and
the change you recommend. End with a one-line verdict. Then report as your task line says.
