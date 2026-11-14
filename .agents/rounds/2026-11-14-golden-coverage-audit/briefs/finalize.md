# Brief: review fixes, proposal activation, register closure

Lane `instrument`, third task. Do not commit; the orchestrator commits. Golden edits follow
`.agents/skills/golden-truth/SKILL.md` (a `truth.verified` event with evidence and root cause
`.agents/TODO.md — Finish the 2026-11-14 golden coverage audit`).

## 1. Review findings (`review/REVIEW.md`)

- M1, M3: fix the stale docs as the review says. Keep the skill timeless (no dates, no round
  names).
- M2: add to `eval/qa/README.md` one short paragraph: the headline battery measures Stellar truth
  by taxonomy leaf; it does not measure operation reach, skill reach, or envelope traps; routing
  gates, skills cases, unit tests, the frozen live lanes, and the tool lane own those. Add no
  TODO entry.
- M4: restore the three absorbed facts as answer clauses. Each fact was in the retired case's
  golden; cite that tombstone and one primary source read today.
- L1: fix the two overclaimed stamps; move `truth.asOf` only where this round observed the claim.
- L2: make every tombstone reason one self-contained sentence (text from the coverage note,
  verifier `why`, or audit reason). No pointer to round files in the reason itself.
- L3: move provenance out of judge-facing text; keep a finding id only where the cap lint needs
  it.
- L4 to L8: fix what is cheap and safe; list what you leave and why.

## 2. Activate the proposals (`gap/verify-gap.json`)

- Apply the seven `amend` decisions to their proposal files exactly (`amended` fields; null means
  unchanged).
- Activate all 36 proposals under the lifecycle rules: move each to its battery directory, set
  the lifecycle state, and record author (the gap lane, Claude Fable 5.2), independent reviewer
  (`verify-gap`, Claude Opus 5.5), date, and evidence path. Proposal and activation are separate
  commits: the proposals landed in `c7dbdc87`.
- Store nothing about Raven reach in a case.
- Remove the filled leaves from `openSlots` in `eval/qa/taxonomy.json`. Report leaves that are
  still empty or over target after activation.

## 3. Register (`resweep/resweep-1.json`, `resweep/resweep-2.json`)

- Apply every `text-edit`, `drop-member`, and `delete-entry` as written. Stop and report on any
  `conflict`.
- Stamp with `npm run eval:qa:register`, then close the reopened entries with one `--review` file
  built from the re-sweep verdicts (`resweep/review.json`). For an entry that sections 1 or 2
  reopen again after its re-sweep, re-check its members and say so in the review evidence.
- New cases are unclustered. List any new case whose number, version, or date also appears in an
  existing case, and add or extend a cluster for it.

## 4. Gates

Merge `origin/main` into the branch first if it merges cleanly; otherwise report. Then
`npm run eval:qa:compile` and every gate from `briefs/apply-run.md` step 6, bare, with exit codes.

Write `apply/FINAL.md`: what changed per section, final counts (headline, tool, retired, leaves
covered, open slots, judge-facing words, counts by freshness and by domain), review findings left
open with reasons, and the gate table. Send its path.
