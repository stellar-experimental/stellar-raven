# Brief: verify the proposed cases

Read `briefs/common.md` first. Your lane is `verify-gap`.

## Task

Three research lanes wrote new proposed cases under `eval/qa/corpus/proposed/` (every file with
`truth.origin` "golden-coverage-audit 2026-11-14") and a result file each, `gap/gap-<n>.json`.
A proposal activates only after an independent reviewer re-derives it. You are that reviewer.

Read `.agents/skills/golden-truth/SKILL.md` once.

## Per proposal

1. **Blind re-derivation.** Read only `question`, `golden.answer`, `golden.keyFacts`, and
   `golden.avoid`. Establish each claim yourself from live sources: two independent classes, one
   primary (A or B) for a number, version, date, or amount. Only then read the proposer's
   `truth` block and compare.
2. **Question.** Would a real agent or user ask it? Does it test the heart of the leaf
   (`truth.leaf`, scope in `map/taxonomy.json`)? Could a correct agent with a different good
   source satisfy every key fact?
3. **Form.** Compact; key facts are single-predicate world facts; a `live` or `scheduled` key fact
   accepts a later dated figure; avoid items are verified false or sourcing guards; no tool names
   or provenance in judge-facing text; freshness tag and `reverifyBy` fit the volatility.
4. **Duplicates.** Search the battery and the other proposals for the same knowledge. Use
   `coverage/coverage.json` (`cases[]`, final verdicts) to ignore cases that are being retired.
5. **Raven reach.** For each `unreachable` and `reachable-not-surfaced` result in the gap files,
   repeat the Raven check once with your own wording. Confirm or correct the classification and
   the named owner. These become upstream findings, so a wrong one costs trust.

Decide `accept`, `amend` (write the corrected judge-facing fields), or `reject` (the case should
not activate; say why).

Also check each `covered-by` and `no-golden` slot result: is the named case really covering the
facet, and is the `no-golden` honest?

## Output

`.agents/rounds/2026-11-14-golden-coverage-audit/gap/verify-gap.json`:

```json
{
  "lane": "verify-gap",
  "proposals": [
    {
      "id": "q-...",
      "decision": "accept | amend | reject",
      "why": "...",
      "evidence": [{"class": "A", "ref": "...", "observedAt": "2026-11-14", "quote": "..."}],
      "amended": {"question": null, "answer": null, "keyFacts": null, "avoid": null, "notes": null, "freshness": null},
      "ravenReach": "answerable | reachable-not-surfaced | unreachable",
      "ravenReachNote": "Only when it differs from the proposer."
    }
  ],
  "slots": [{"leaf": "...", "result": "covered-by | no-golden", "decision": "accept | reject", "why": "..."}],
  "summary": {"accept": 0, "amend": 0, "reject": 0}
}
```

Do not edit the proposal files. Done when every proposal has a decision with evidence and the file
parses.
