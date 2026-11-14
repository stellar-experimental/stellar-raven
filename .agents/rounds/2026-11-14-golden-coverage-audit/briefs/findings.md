# Brief: gap ledger and upstream findings

Read `briefs/common.md` first. Your lane is `findings`. Follow
`.agents/skills/improvements-pipeline/SKILL.md` for every file under `improvements/`.

## Task

The round found topics that Raven's sources cannot answer. Record them where the owner can act:
a gap ledger for the whole taxonomy, and `improvements/` findings for the confirmed gaps. A gap
(a missing fact, page, or record) is a finding as much as an error is; each one ends in a
concrete content recommendation. Post nothing upstream: no issue, comment, or pull request.

## Inputs

- `gap/verify-gap.json` and `gap/gap-*.json`: per new case, Raven reach, confirmed by two lanes.
  Eight are `unreachable`, one `reachable-not-surfaced`.
- `review/REVIEW.md`, finding D4: the Docs lumens page says all XLM was created at genesis, a few
  lines above its own inflation paragraph.
- `map/taxonomy.json`: `ravenReach` per leaf from the mappers (`no`, `partial`, `yes`,
  `unchecked`) with their evidence. These are single observations, weaker than the first input.
- `audit/*.json`: `rot` entries with result `unverifiable`, and `missing` arrays.
- Later, `qa/RESULT.md` (a QA test now running). The orchestrator will send you a follow-up.

## Work

1. **Gap ledger.** Write `.agents/rounds/2026-11-14-golden-coverage-audit/gaps/GAPS.md` and
   `gaps/gaps.json`: one row per taxonomy leaf with a known or suspected gap: leaf, weight, the
   fact or record that is missing, the canonical owner (which upstream: Stellar Docs, Stellar
   Light/Scout, Lumenloop, a skill repository, or outside Raven's scope), evidence strength
   (`confirmed` = reproduced by two lanes or by you today; `single` = one observation), the
   affected case ids, and the recommended content. Sort by weight, then evidence strength.
2. **Re-check before filing.** For each `mapper` `no` or `partial` leaf of weight 3, and any other
   row you would file, run the trigger yourself today through Raven (one `search` per family, one
   `execute`) and record what came back. A row you cannot reproduce stays in the ledger as
   `single` and is not filed.
3. **Findings.** For each confirmed gap whose owner is a Raven source:
   - Search `improvements/` for an existing finding first (`grep -ril`). Update it with a dated
     recurrence instead of filing a near-duplicate.
   - Otherwise file a new finding in the form and status the skill prescribes, with the live
     trigger, what was returned, the affected case ids, and the exact recommended content or
     record (a page outline, the fields a record needs, or the sentence to fix).
   - Ids: run `git fetch origin && git merge-base --is-ancestor origin/main HEAD` first; take the
     next free id per collection after checking `origin/main` and every open pull request
     (`gh pr list`, then `gh pr diff <n> --name-only`) for ids in use.
   - A gap whose owner is outside Raven's scope (for example XRP Ledger facts) is not a finding.
     Record it in the ledger as a source-coverage question for the owner.
4. Run the improvements gates the skill names (lint, index regeneration, probes if required) and
   record exit codes.

Write set: `improvements/**` and `gaps/**` under the round folder. Do not edit a case. If a
finding implies a grading caution or cap on a case (the canonical-page rule in the golden-truth
skill), list the case and the proposed note text in `gaps/GAPS.md` under "Case cautions"; the
orchestrator applies it.

## Output

`gaps/GAPS.md` ends with: findings filed (id, title, owner), findings updated, gaps not filed and
why, case cautions, and the gate results. Send its path.
