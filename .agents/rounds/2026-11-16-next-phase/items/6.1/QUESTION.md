# Item 6.1 question: one non-tuning QA case seen by the lead

Lead: Claude Opus 5.5, agentpc `t1v5`, 2026-11-17.

## What happened

While listing every repository mention of codemode `0.5.1`, the lead ran a repository-wide `grep`
that did not exclude `eval/qa/`. It printed matching lines of `eval/qa/cases.json` and of one
battery corpus file for one case: the case id, its golden `notes` and two source notes. It did not
print the question or the golden answer. The lead had not checked the case's set first. A script
then checked membership in split v9 (`~/backups/gca-2026-11-14-split-v9.json`, SHA-256 prefix
`0b6c9c04b59f5f49`) and printed only one boolean: the case is **not** in tuning. Neither the lead
nor the script printed which non-tuning set holds it. The id is in the untracked note
`/home/tyler/code/raven-wt/np-6.1/tmp/6.1/EXPOSURE.md` and in no tracked file.

The case has nothing to do with item 6.1. No edit to it is needed.

## Proposed answer (option (a), as in items 1.4, 3.5 and 5.1)

In PR 6.1, in its own commit:

1. Add `items/6.1/amend-split-v10.mjs`, modelled on `items/5.1/amend-split-v8.mjs`. It verifies the
   v9 SHA-256 (`0b6c9c04…800c`), reads the exposure note, requires exactly one non-tuning v9 id,
   moves it with `moveToTuning`, and writes `~/backups/gca-2026-11-14-split-v10.json` (mode 600,
   never overwrite). It prints only the counts (expected 92 tuning, and 110 + 45 or 111 + 44 across
   held-out and reserve) and the SHA-256.
2. Bump `TUNING_ROW_COUNT` to 92 and anything else that asserts it.
3. Point the dated briefs and `PRESTAGE.md` under `items/1.4/dated/` at v10 and its SHA-256, and
   update the TODO held-out status line.

Option (b): you check by script and amend on the Mac instead. Tell me which, or another route. I am
continuing the plan and its review meanwhile; the execution child will not touch the split until you
answer.

## Answer

Orchestrator (`kalepail-c3614nvxph-mbp/t40j`), 2026-11-17, verbatim:

> Orchestrator: approve option (a), in its own commit in PR 6.1, as in 1.4/3.5/5.1. This is not a
> maintenance lane, so the case moves. Make sure the dated timers and briefs end up pointing at v10
> and its SHA-256, and say so in the report. Going forward, every repo-wide grep by you and your
> children excludes eval/qa/ and eval/corpus/ (e.g. git grep ... -- ':!eval/qa' ':!eval/corpus'); put
> that in each child brief. Continue.
