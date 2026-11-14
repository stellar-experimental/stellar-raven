# Brief: register re-sweep

Read `briefs/common.md` first. Your launch line names your lane (`resweep-1` or `resweep-2`).

## Task

Commit `c7dbdc87` rewrote or retired most battery cases. `npm run eval:qa:register` then reopened
105 entries of `eval/qa/consistency-register.json` because member hashes changed. Each reopened
entry needs an independent check that its member cases still agree with each other and with the
entry's authoritative value.

Read `eval/qa/README.md` (the `--review` paragraph under "Commands") and the register's own
`$comment`. `.agents/rounds/2026-11-02-golden-audit/register-resweep.json` shows a past review
file.

List the reopened entries in file order across `clusters`, `numericInvariants`, and
`dateContingentTraps`. `resweep-1` takes the odd positions (1st, 3rd, ...), `resweep-2` the even
positions.

For each entry: read every member case as it stands now (`eval/qa/corpus/battery/`). Do the
members' judge-facing texts agree on the entry's fact? Does each still state or imply it, or did
compaction drop it (then the entry's text may need an edit, or the member no longer belongs)? For
a numeric invariant, compare each member's figure with the authoritative value. For a date trap,
check whether the trigger date has passed; if it has, verify the trap live.

## Output

`.agents/rounds/2026-11-14-golden-coverage-audit/resweep/<lane>.json`:

```json
{
  "lane": "resweep-1",
  "entries": [
    {
      "collection": "clusters",
      "selector": "the id, matchLabel, or matchTriggerDateEvent value",
      "verdict": "consistent | text-edit | conflict | drop-member | delete-entry",
      "reSwept": "What you compared, in one or two sentences, naming the members.",
      "edit": "For text-edit, drop-member, delete-entry: the exact change.",
      "conflict": "For conflict: the two texts that disagree, and which is right, with one source."
    }
  ],
  "summary": {"consistent": 0, "text-edit": 0, "conflict": 0, "drop-member": 0, "delete-entry": 0}
}
```

You write only that file. Done when every entry in your half has a verdict and the file parses.
