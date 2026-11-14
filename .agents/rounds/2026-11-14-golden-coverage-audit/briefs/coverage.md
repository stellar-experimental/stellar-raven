# Brief: coverage matrix

Read `briefs/common.md` first. Your lane is `coverage`.

## Task

Map the audited battery onto the taxonomy and state exactly what the battery must add and may
still cut. Inputs: `map/taxonomy.json`, every `audit/*.json`, and every `verify/*.json`. You may
read a case file to settle a mapping.

## Method

1. **Final verdict per case.** Use the verifier's `finalVerdict` and `finalRewrite` where a
   decision exists; otherwise the auditor's `verdict` and `rewrite`. List every audit record that
   no verifier checked.
2. **Resolve merges.** Follow each merge to its survivor. Flag a chain, a cycle, a survivor that is
   itself retired or merged, and a survivor outside the battery. Propose the fix for each.
3. **Assign survivors to leaves.** Every surviving headline case (`keep`, `tighten`, merge
   survivor) gets one primary leaf and at most one secondary leaf. A `behavior` case goes to a
   `behavior` leaf. A case that fits no leaf is either a missing leaf (propose it) or a case with
   no categorical value (propose `retire`, with the reason).
4. **Compare with the leaf's `cases` target.**
   - Surplus: more primary cases than the target. Rank them and name the ones to cut or merge. Keep
     the cases that cover distinct facets; cut the ones that repeat a facet. A leaf may keep one
     case over target when each covers a facet that the taxonomy names.
   - Deficit: fewer than the target. For each missing slot, write the facet it should cover and a
     draft question. Use the auditors' `missing` arrays as hints.
5. **Tool lane.** List every `move-tool-lane` case with what it alone makes visible. The owner
   wants this lane cut hard: propose `retire` for any case whose behavior the routing gates
   (`eval/routing-cases.json`, `eval/skills-cases.json`), the unit tests under `test/`, or the
   frozen live lane (`eval/qa/corpus/live/live-cases.json`) already exercise. Check those files;
   do not guess. Aim for the smallest set that keeps one case per distinct mechanism.
6. **Cross-category duplicates.** Auditors worked one category at a time. Within each leaf, read
   the survivors' questions and proposed answers side by side and flag remaining duplicates.

## Output

`.agents/rounds/2026-11-14-golden-coverage-audit/coverage/coverage.json`:

```json
{
  "cases": [{"id": "q-...", "finalVerdict": "tighten", "survivor": null, "leaf": "protocol.fees", "secondaryLeaf": null, "verified": true, "note": null}],
  "leaves": [{"id": "protocol.fees", "weight": 3, "target": 2, "primary": ["q-..."], "cut": ["q-..."], "slots": [{"facet": "...", "question": "..."}]}],
  "mergeFixes": [{"id": "q-...", "problem": "...", "fix": "..."}],
  "toolLane": [{"id": "q-...", "mechanism": "...", "coveredBy": "path or null", "final": "keep-tool-lane | retire"}],
  "extraCuts": [{"id": "q-...", "why": "..."}],
  "proposedLeaves": [],
  "unverified": ["q-..."],
  "totals": {"before": 507, "headline": 0, "toolLane": 0, "retired": 0, "merged": 0, "newSlots": 0, "leavesCovered": 0, "leavesEmpty": 0}
}
```

Also write `coverage/coverage.md`: one table per domain (leaf, weight, target, cases kept, cases
cut, open slots), then the tool lane table and the totals, for human review.

Done when every case and every leaf appears once, the totals add up, and the JSON parses.
