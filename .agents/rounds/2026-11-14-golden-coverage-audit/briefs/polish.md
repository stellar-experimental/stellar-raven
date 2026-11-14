# Brief: final overrides before the apply

Read `briefs/common.md` first. Your lane is `polish`.

## Task

`apply/apply.mjs` turns the reviewed audit into corpus edits. `apply/REFUSALS.md` lists what
blocks or weakens the run. `coverage/verify-coverage.json` holds the independent review of the
coverage cuts. Write `coverage/overrides.json` so that the applied battery is correct, compact,
and clean. You write that one file and `coverage/POLISH.md`. Do not run the apply for real.

Overrides shape: `{"cases": [{id, finalVerdict?, survivor?, note?, rewrite?, leaf?,
secondaryLeaf?}]}`. A `rewrite` is the whole judge-facing form (`question` or null, `answer`,
`keyFacts`, `avoid`, `notes`, `movedToTruth`), so start from the case's current final rewrite
(verifier `finalRewrite`, else auditor `rewrite`) and change only what the item needs.

Read `.agents/skills/golden-truth/SKILL.md` once. Every fact you add needs evidence at its bar;
record the evidence rows in `POLISH.md` under the case id.

## Work list

1. **Adopt** `apply/overrides-draft.json` (R1 to R3) after reading each fix.
2. **verify-coverage.** For each `accept-with-absorb`, add the absorbed fact to the survivor (one
   key fact, or a clause in the answer) if the survivor's rewrite lacks it. Apply each `leaves`
   fix and `duplicates` merge the reviewer names. If the reviewer retired a tool-lane survivor,
   set `finalVerdict: "retire"` on the cases merged into it (REFUSALS W2).
3. **Absorb pending (W1).** For each row, add the fact to the survivor in the smallest form.
   Check the fact against one primary source first. Do not change a survivor's question.
4. **Snapshot dates (W5).** A key fact must not demand the round date. Reword so that a later
   dated figure also passes ("dates the figure it cites").
5. **Key facts.** Go through every `[lint-warn]` key-fact line of the dry run
   (`node .agents/rounds/2026-11-14-golden-coverage-audit/apply/apply.mjs --dry-run`). Split or
   trim a key fact that holds several predicates or runs over 90 characters, when you can do so
   without losing a fact that matters; five key facts is the cap. Leave a warning in place when
   the fix would damage the fact, and say so in `POLISH.md`.
6. **Avoid items (W4).** Rewrite the awkward wrapped items as plain "Do NOT ..." sentences.
7. **Guard tests.** Three tests protect earlier golden decisions: `test/qa-corpus-lint.test.mjs`
   (archive rosters of `q-infra-rpc-provider-archive-tier`), `test/qa-golden-max-tx.test.mjs`
   (`q-protocol-max-tx-set-size`), and `test/qa-judge-qpp-dormant.test.mjs`
   (`q-pc-quantum-preparedness-dormant`). Read each test and the case's final state. If the
   guarded fact still matters, restore it in the rewrite in compact form. If the case is retired
   or the guard no longer protects anything, say so in `POLISH.md` with the reason; the
   orchestrator removes the test.
8. **Read-through.** Read the final judge-facing form of every weight-3 leaf's cases
   (`coverage.json` `leaves[]`, weight 3) once, as the judge would. Fix an answer that is unclear,
   that a correct agent could not satisfy from a different good source, or whose key facts miss
   the heart of the question.

After each group, run the dry run with your overrides and confirm `refusals=0`.

## Output

- `coverage/overrides.json`.
- `coverage/POLISH.md`: per work-list item, the cases changed and why; the evidence rows for added
  facts; warnings left in place; the guard-test calls; the final dry-run summary line.

Done when the dry run exits 0 with your overrides, and `POLISH.md` covers all eight items.
