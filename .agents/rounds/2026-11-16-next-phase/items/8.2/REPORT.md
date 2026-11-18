# Item 8.2 report: documentation audit (interim: PRs 1 and 2 open)

Lead: Claude Opus 5.5, agentpc `t1yk`, 2026-11-18. Four PRs, merge in order. PRs 3 and 4 follow.

| PR | Scope | State |
|---|---|---|
| [#488](https://github.com/stellar-experimental/stellar-raven/pull/488) | Root docs, `docs/`, ADR index, 4 comments, item records, DECISIONS entry | Open, gates green |
| [#489](https://github.com/stellar-experimental/stellar-raven/pull/489) | `.agents/` README, rounds guide, roster, skills (not `golden-truth`, not `improvements-pipeline`) | Open, gates green |
| PR 3 | Folder guides, `ideas/`, TODO additions | Executing (`t1yx`) |
| PR 4 | Case text out of `ideas/` (codegen note moved to `research/audits/`) | Committed on `np/8.2-docs-case-text`, not pushed until PR 3 is ready |

Process: 4 Sonnet accuracy lanes + 1 Fable organization lane (147 findings), lead plan, Fable plan
review (18 findings, all adopted, RECONCILE.md), Sonnet executors. No model-calling eval, USD 0.

## Deploy

None needed: no PR changes Worker bytes (`git diff --stat origin/main -- src public wrangler.jsonc
catalog specs` empty in each).

## Needs orchestrator approval before merge

- #488: the three `AGENTS.md` edits (the `CLAUDE.md` fact, the search-heading pointer, six map rows),
  and the plan's correction to the frozen list (PLAN.md "Correction to the frozen list").
- #489: four `SKILL-BEHAVIOR` changes (B-02, B-04, B-05, O-16), listed in the PR body.
- Deferred until run 2.2c merges, proposed only: RECONCILE.md "Approval list" point 3 (AGENTS.md
  rule moves and cuts, posting/deploy authority wording, `improvements-pipeline` fixes, the
  `eval/qa/README.md` split, hook and `.ignore` heading pointers). PR 3 adds a TODO item for them.

## Merge window

Before 2026-11-23 18:00 UTC; else hold until run 2.1 and its follow-ups merge, then rebase.

## For the orchestrator (Mac or decision)

- **Case text in `ideas/`** ([EXPOSURE.md](EXPOSURE.md)): ten case ids, ids only. Readers in this
  item: `t1yr` (Fable) and `t1yw` (Sonnet E4). Whether the held-out rule moves any of them is yours.
  PR 4's diff shows the removed text: nobody should read that diff.

## Open questions for the owner

1. `gpt-6.2-sol` and `gpt-6.2-astra` are in the Codex catalog: replace or join the Codex tiers?
2. Partner-side detail (a first name and the partner's regulatory processes) sat in a public idea
   file since 2026-08; PR 4 removes it from `main`, git history keeps it. Any further action?
3. `/terms` promises 30 days for query/response observability data; operations says 7 days and no
   query text. Already in the TODO OpenAI item; restated because the audit hit it again.
4. Optional ADRs: the stellar.org admission (#447) and the OAuth per-origin design have no ADR;
   living docs cite round records for them.
