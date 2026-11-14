# Brief: closing fixes

Lane `instrument`, fourth task. Do not commit; the orchestrator commits. Golden edits follow
`.agents/skills/golden-truth/SKILL.md`. Inputs: `qa/RESULT.md`, `qa/review.json`,
`review/REVIEW.md` ("Delta review"), `gaps/GAPS.md`.

## 1. Cases the QA test showed to be flawed (`qa/RESULT.md`, "Cases to fix")

A verdict is never a reason to change a golden. For each listed case, read the case and decide on
its own terms: does a key fact bundle several predicates, demand a detail the question does not
ask for, or state something the sources do not support? Apply the proposed fix only where that
defect is real, in the smallest form, and keep every fact that matters to the leaf. Where the
proposal would only make the case easier, change nothing and say so.

- The two rows classed as judge artifacts get no golden change unless you find a defect that is
  independent of the verdict.
- `q-stellar-vs-xrp-ledger`: keep the leaf covered. Restate the case so that the key facts are
  Stellar-side facts (per-node quorum sets, the fee handling, the 2015 SCP relaunch) and XRP
  Ledger properties are context that an answer may attribute, not key facts. Verify the Stellar
  facts against primary sources.
- Root cause for these edits: `.agents/TODO.md — Finish the 2026-11-14 golden coverage audit`.
  Evidence: the source you checked, plus `qa/RESULT.md` as the trigger only.

## 2. Delta review

- D1: add the avoid item to `q-soroban-simulate-resource-fee`.
- D2: rewrite the 16 tombstone reasons as one self-contained sentence each.
- D4: correct the verified event of `q-token-xlm-supply-total-circulating` (the independent check
  is the delta review), and add the canonical-page grading caution and cap tied to `sd-105` in
  the lint-canonical form.

## 3. Gap ledger

- Apply each entry under "Case cautions" in `gaps/GAPS.md` that names an active finding.
- Add a dated recurrence from the QA test to `sls-118` (two cases missed the Limits Proposals) and
  `sd-106` (Tier 1 roster), in the form the `improvements-pipeline` skill prescribes. Regenerate
  the index and run the improvements lint.
- Add two entries to `.agents/TODO.md` under "Golden answers", each stating what is wrong, the
  current state, the next step, and what done means:
  1. Decide whether stellar.org pages outside Docs belong in a Raven source: three unrelated cases
     (SDF strategy, Audit Bank projects, service-provider directories) miss for that one reason;
     `sls-117` covers the Scout research corpus part.
  2. Check Docs search for the SEP-7 payment-request page at the retrieval level before filing
     (`gaps/GAPS.md`, `standards.payment-patterns`).
  Name no held-out or reserve case id.

## 4. Held-out split

Draw the split by the rule in `eval/qa/README.md` ("Held-out split") from the final headline
battery. Write it to `eval/qa/results/splits/2026-11-14.json` (git-ignored) and copy it to
`~/backups/gca-2026-11-14-split.json`. Report only its sha256 and the three set sizes. Put no
split membership in any tracked file.

## 5. Gates

`npm run eval:qa:compile`, `npm run eval:qa:register` (close anything your edits reopen with a
`--review` file after re-checking the members), then every gate from `briefs/apply-run.md` step 6
plus the improvements gates, bare, with exit codes.

Write `apply/CLOSEOUT.md`: per section what changed and what you declined to change with the
reason, final counts, the split sha256 and sizes, and the gate table. Send its path.
