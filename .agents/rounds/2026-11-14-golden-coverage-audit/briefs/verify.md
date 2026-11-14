# Brief: verify the case audit

Read `briefs/common.md` first. Your launch line names your lane and the audit files you verify.

## Task

You are the independent reviewer of a case audit. For each audit file, re-derive the verdicts that
change the battery, from the case files and live sources. Read the auditor's `verdict`, `rewrite`,
and `rot[].claim` only; form your own view before you read its `reason` and evidence.

Read `eval/qa/README.md` section "Case schema and golden lifecycle" and
`.agents/skills/golden-truth/SKILL.md` once.

## Check

1. **Every `retire`, `merge`, and `move-tool-lane`.** Read the case. Is the reason
   score-independent and true? For a duplicate, read the survivor: does it really test the same
   knowledge, and does it (after the proposed absorption) keep everything that matters? Would the
   battery lose visibility of a real topic?
2. **Every `rot` result `changed`, and every rewrite that changes a fact.** Re-derive the fact
   from two independent source classes, without the auditor's evidence. Numbers, versions, dates,
   and amounts need one primary source (class A or B).
3. **Every `tighten` rewrite.** Compare it with the current golden. It must not drop or weaken a
   correct fact that matters, must not introduce a claim the current golden lacks unless evidence
   supports it, and must leave key facts that an agent using any correct source could satisfy.
   Check that a `behavior` case still demands the behavior. Where the rewrite is too aggressive or
   not compact enough, write the corrected rewrite.
4. **A sample of `keep`.** One in five, chosen by position (every fifth record). Is it really
   compact and current? Check its most volatile claim live.
5. **`purpose`.** Flag a `stellar-truth` label on a case that only Raven could satisfy, and the
   reverse.

## Output

`.agents/rounds/2026-11-14-golden-coverage-audit/verify/<audit-lane>.json`, one file per audit
file:

```json
{
  "lane": "verify-<audit-lane>",
  "decisions": [
    {
      "id": "q-...",
      "auditVerdict": "retire",
      "decision": "accept | amend | reject",
      "finalVerdict": "retire",
      "why": "One or two sentences.",
      "evidence": [{"class": "A", "ref": "...", "observedAt": "2026-11-14", "quote": "..."}],
      "finalRewrite": null
    }
  ],
  "summary": {"accept": 0, "amend": 0, "reject": 0},
  "patterns": ["Any systematic error of this auditor that the orchestrator should correct everywhere."]
}
```

`finalRewrite` has the audit `rewrite` shape and is set only for `amend`. `evidence` is required
for every changed fact you accept or correct. A record you did not check is not listed; state the
sample rule you used in `patterns`.

Done when every record under check 1, 2, and 3 has a decision and the file parses.
