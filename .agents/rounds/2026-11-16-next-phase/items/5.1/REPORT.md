# Item 5.1 report

Lead: Claude Opus 5.5, agentpc `t1tm`, 2026-11-17.

## Pull request and result

[#467](https://github.com/stellar-experimental/stellar-raven/pull/467), branch
`np/5.1-remove-matchpartners`. Not merged.

- **Removal.** `scout.matchPartners` is removed. The manifest now has 285 entries, 61 operations
  and 29 Scout operations; Scout exclusions go from 12 to 13.
- **Re-baseline,** by your note and the owner's line. Holdout, read as counts only: captures go
  from 10 to 11, passed from 25 to 24, and the ceiling is now 11; top1, top3, top5 and cardHit5
  are unchanged. Legacy, extended, skills and protocol-history show zero graded change. Every
  number matches 3.2's step E7, and Codex reproduced every one independently.
- **SERVICE ERRORS wording** changed as specified.
- **Scout finding.** `sls-123` is filed as
  [Stellar-Light/stellarlight#1976](https://github.com/Stellar-Light/stellarlight/issues/1976), an
  issue only. Its fix, verified live, is the re-exposure trigger. The TODO bullet is rewritten to
  match, and EXEC.md lists the reverse edits.
- **Reviews.** The Fable plan review found 15 items, all adopted or answered. The Codex frontier
  review (`gpt-6-astra`, high) found 1 should-fix, adopted in the finding and in the issue body.
- **Gates.** All bare and green; the lead re-ran typecheck, test, build, the routing gate and the
  secrets scan. USD 0.

## Deploy

**Needed.** Worker bytes change. Production checks after the deploy:

1. A live `search` for a partner question (for example "find an anchor partner for a USDC off-ramp
   in Mexico") lists no `matchPartners`.
2. The landing page returns 200, and `/mcp` returns 401.

## For the orchestrator on the Mac

- **Split v8.** Copy `~/backups/gca-2026-11-14-split-v8.json` from agentpc and verify it:
  - SHA-256 `1f0c1268d47103e652c545cd7642f808d893aa7779192b50d189c42510027720`;
  - 89 tuning, 112 held-out, 46 reserve;
  - v7 stays in place.
- **Merge before 2026-11-23 18:00 UTC.** The 2.1 timer reads the split path from `origin/main`,
  and the dated briefs now name v8.

## Read before merging

- **Served-skill side effect.** `src/skills/scrub.ts` scrubs served skill bodies from the same
  exclusion list. The served `stellar-scout` skill loses:
  - its partner-filter workflow step (the directory filters, the stablecoin peg guidance, and the
    "none listed at our source" rule);
  - one sentence of the `getPartner` paragraph;
  - the match section of its API reference.

  Neither the note nor EVAL-FABLE item B weighed this. A TODO line asks for a narrower scrub unit.
  If you would rather not lose the partner-filter step, hold the merge until that unit lands.
- **Generic Scout errors.** A generic Scout error carries no hint (`src/adapters/scout.ts:187-194`),
  so "follow each failure's hint" gives no instruction there. The note fixed the wording, so I kept
  it.
- **Exposure record.**
  - The lead printed lines of `eval/qa/cases.json` before checking the split. That read became the
    split v8 move. The id appears in no prose. The case's own file, `cases.json` and the register
    name it, as they must.
  - The executor printed one confirmation-only legacy routing row (`.cases[0]`) while checking the
    results shape. A lead script, printing booleans only, showed that this row's only QA match is
    the moved case, now tuning, so nothing further is exposed.
  - The v8 counts (reserve 47 to 46) show which set the case left. Your answer required the counts.
- **An earlier exposure, not caused by this item.** `items/3.2/EXEC.md:79-85` on `main` shows two
  confirmation-only legacy rows with their rank changes. The Fable reviewer found it. It is a
  recorded exposure under decision 2(a).
- **The reviewer's incidental read.** The Fable reviewer read two tracked records that name a past
  QA case. A lead script showed that case is no longer in the battery, so nothing needs to move.

## Cleanup on agentpc (the lead's, after merge)

- Remove the worktree `/home/tyler/code/raven-wt/np-5.1`, which holds the untracked
  `tmp/5.1/EXPOSURE.md`.
- Delete the local branch `np/5.1-remove-matchpartners`.
- `np/5.1-base` (`b4a74b8f`, the 3.2 WIP) was not created by this lead, so it is yours to delete.
  Nothing needs it now: EXEC.md holds the reverse edit list.

## Open questions for the owner

None blocking.
