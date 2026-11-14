# Brief: verify the coverage cuts

Read `briefs/common.md` first. Your lane is `verify-coverage`.

## Task

`coverage/coverage.json` (shape in `briefs/coverage.md`) maps the audited battery onto
`map/taxonomy.json`. Its author cut 94 more cases than the case auditors did (`extraCuts`),
re-pointed 22 merges (`mergeFixes`), retired 12 of 18 tool-lane candidates and kept 7
(`toolLane`), and waived some open slots. No reviewer has seen those decisions. You are that
reviewer. A retirement is permanent, so each one needs a score-independent reason that holds.

Form your own view from the case files and the taxonomy before you read the author's reasons.

## Check

1. **Every `extraCuts` entry.** Read the cut case and the cases that stay on its leaf
   (`leaves[].primary` minus `cut`). Is the cut case's knowledge still tested by a survivor's
   question and its final rewrite (verifier `finalRewrite`, else auditor `rewrite`)? Does the cut
   remove the only case for a facet the taxonomy names, or the only case that tests a
   weight-3 fact? If so, reject the cut or name the fact the survivor must absorb.
2. **Every `mergeFixes` entry.** The fixed survivor exists, stays in the headline, and tests the
   same knowledge.
3. **Tool lane.** For each retired candidate, open the file the author cites in `coveredBy` and
   confirm that it exercises the mechanism. For each kept case: is the mechanism real, distinct
   from the other six, and invisible to routing gates, unit tests, and the frozen live lane? The
   owner wants this lane only if it earns its place; say plainly whether seven cases do.
4. **Leaves.** For each leaf with no surviving case and no slot (waived), and each leaf over
   target: is the author's reason sound? For each of the 10 weight-3 leaves you pick at random
   (state your rule), read its survivors and judge whether together they test the heart of the
   leaf. A leaf whose cases all test side details is a finding.
5. **Residual duplicates.** Read `duplicates` and `residualOverlap`. Flag any pair that should
   merge now.
6. **The five unverified `keep` records** listed in `unverified`: check each as a case audit
   reviewer would (compact, current, most volatile claim holds live).

## Output

`.agents/rounds/2026-11-14-golden-coverage-audit/coverage/verify-coverage.json`:

```json
{
  "lane": "verify-coverage",
  "extraCuts": [{"id": "q-...", "decision": "accept | reject | accept-with-absorb", "why": "...", "absorbInto": null, "absorbFact": null}],
  "mergeFixes": [{"id": "q-...", "decision": "accept | reject", "why": "...", "survivor": "q-..."}],
  "toolLane": [{"id": "q-...", "decision": "accept | reject", "final": "keep-tool-lane | retire", "why": "..."}],
  "toolLaneVerdict": "Whether the lane earns its place, in two sentences.",
  "leaves": [{"id": "...", "finding": "...", "fix": "restore q-... | add slot: <facet and question> | none"}],
  "duplicates": [{"ids": ["q-...", "q-..."], "survivor": "q-...", "why": "..."}],
  "unverifiedKeeps": [{"id": "q-...", "decision": "accept | amend", "why": "..."}],
  "summary": {"cutsAccepted": 0, "cutsRejected": 0, "cutsWithAbsorb": 0}
}
```

Done when every `extraCuts`, `mergeFixes`, and `toolLane` entry has a decision and the file
parses.
