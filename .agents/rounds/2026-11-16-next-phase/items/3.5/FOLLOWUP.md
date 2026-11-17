# Item 3.5 follow-up: split v7

Lead: Claude Opus 5.5, agentpc `t1ss`, 2026-11-17. Added to PR #465 in its own commit.

## Provenance

The lead ran `npm run eval:qa:lint -- --stale --enforce-floors` as a gate and then read the last
two lines of its log. They showed one corpus lint warning naming a case id and the numeric amounts
in its golden. The id went into an untracked note on agentpc
(`/home/tyler/code/raven-wt/np-3.5/tmp/3.5/EXPOSURE.md`) and into no tracked file. The lead did not
check its set.

## Orchestrator's answer

Received from `t40j` on 2026-11-17 over `hc`, verbatim:

> Orchestrator: I checked by script, without seeing the id, that the exposed case is outside tuning
> in v6. Option (a), as in item 1.4: add the amendment to #465 in its own commit. (1) Add
> items/3.5/amend-split-v7.mjs, modelled on items/1.4/amend-split-v6.mjs. It reads
> tmp/3.5/EXPOSURE.md, requires exactly one non-tuning v6 id, moves it with moveToTuning, writes
> ~/backups/gca-2026-11-14-split-v7.json (mode 600, never overwrite) and prints only the counts and
> the SHA-256. The id never leaves the process. (2) Bump TUNING_ROW_COUNT and anything else that
> asserts the tuning count. (3) Point every dated brief and PRESTAGE.md under items/1.4/dated/ at
> split-v7 and its SHA-256. The 2.1 timer fires 2026-11-23, and sibling-check would fail against
> v6. (4) Update the TODO's held-out status line and record the provenance in a FOLLOWUP note. Then
> rerun the gates bare and tell me the v7 SHA-256; I'll copy v7 to the Mac and verify it.

## Split v7

- [amend-split-v7.mjs](amend-split-v7.mjs) does the move. It has the shape of `amend-split-v6.mjs`
  and uses the same `moveToTuning` core. It verifies the v6 SHA-256, collects the case ids in the
  exposure note, requires exactly one of them in held-out or reserve of v6, and moves it. It prints
  only counts and the SHA-256. It also prints, for the TODO, how many cases outside v7 tuning carry
  a `reverifyBy` and the earliest such date.
- The dry run and the real run gave the same hash.
- Path: `~/backups/gca-2026-11-14-split-v7.json`, mode 600.
- SHA-256: `d5e56748dfdf2ce9c0bcf8a48898f976db96578dd97516d07dd0b3cb13966c8a`.
- Counts: 88 tuning, 112 held-out, 47 reserve. v6 (87/113/47) stays in place.
- `TUNING_ROW_COUNT` is 88. Every scan and test reads that one constant.
- `.agents/TODO.md` held-out status names v7. Cases outside tuning with a `reverifyBy`: 65 (was
  66). The next date is still 2027-01-14.
- The four dated lead briefs and `PRESTAGE.md` under `items/1.4/dated/` name v7 and its SHA-256.
  `sibling-check.mjs` on v7 gives the staging values (2.1: 0, 2.2a: 0, 2.2c: 1) and rejects v6.

## For the orchestrator

- Copy v7 to the Mac and verify the SHA-256 above.
- Merge #465 before 2026-11-23 18:00 UTC. The 2.1 lead reads the v7 path from `origin/main`.
