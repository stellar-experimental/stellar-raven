# Item 5.1 question: one non-tuning QA case seen by the lead

Lead: Claude Opus 5.5, agentpc `t1tm`, 2026-11-17.

## What happened

While listing every repository reference to `scout.matchPartners`, the lead printed lines of
`eval/qa/cases.json` around the one QA match. That showed one case's id, question and `surface`
list, and the first sentence of its golden answer. The lead had not checked its set first. A script
then checked membership in split v7 and printed only one boolean: the case is **not** in tuning.
Neither the lead nor the script printed which non-tuning set holds it. The id is in the untracked
note `/home/tyler/code/raven-wt/np-5.1/tmp/5.1/EXPOSURE.md` and in no tracked file.

## Why it also matters to the item

The case's `surface` lists `scout.matchPartners`. Once the operation leaves the manifest,
`eval:qa:lint` fails it (`non-exposed surface id`). The case therefore needs one mechanical edit
(remove that id from `surface`, then `eval:qa:compile`) whatever its set.

## Proposed answer (option (a), as in items 1.4 and 3.5)

In PR 5.1, in its own commit:

1. Add `items/5.1/amend-split-v8.mjs`, modelled on `items/3.5/amend-split-v7.mjs`. It verifies the v7
   SHA-256 (`d5e56748…6c8a`), reads the exposure note, requires exactly one non-tuning v7 id, moves
   it with `moveToTuning`, and writes `~/backups/gca-2026-11-14-split-v8.json` (mode 600, never
   overwrite). It prints only the counts (expected 89 tuning, 111 + 47 split across held-out and
   reserve per the actual set) and the SHA-256.
2. Bump `TUNING_ROW_COUNT` to 89 and anything else that asserts it.
3. Point the dated briefs and `PRESTAGE.md` under `items/1.4/dated/` at v8 and its SHA-256, and update
   the TODO held-out status line.
4. Then, after v8 exists, make the `surface` edit in a separate commit.

Option (b): you check by script and amend on the Mac instead. Tell me which, or another route.
I am continuing the plan and its review meanwhile; the execution child will not touch the case or
the split until you answer.
