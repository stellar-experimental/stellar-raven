# Verification lane brief — general routing repair (#223), 2026-10-28

You are the verification lane. The lead (agent `rlead`, pane `w3W:p5P`) owns the ledger and
commits. The implementation lane (agent `rimpl`, Codex) builds candidates and writes to
`tmp/impl/`. You re-derive its measurements independently and attack invariants. Write everything
under `tmp/verify/`. Do not edit tracked files unless the lead asks you to write tests. Do not
commit.

## Read first

`AGENTS.md`; `.agents/rounds/2026-10-28-routing-repair.md`; `tmp/lanes/impl-brief.md` (the
implementation lane's brief: inputs, labels, phases); `.agents/TODO.md` → "Preserve structured
routing intent across extraction caps and gate tiers" (twelve checks) and owner decision B; the
three prior reports named in the ledger and their independent reviews.

## Phase 0 — independent baseline (start now)

The implementation lane is measuring `baseline-main` and `baseline-fresh`. Without reading its
helper first, write your own minimal re-derivation in `tmp/verify/`:

1. In a scratch copy (`git archive HEAD | tar -x -C tmp/verify/src-<label>`), build the catalog for
   the current source and for the frozen fresh snapshot `tmp/fresh-inventory-2026-10-28/`
   (expose `analyzeHackathonSubmissions` and `getHackathonSubmission`; keep `reviewSubmission`,
   RWA, and quality excluded; `locateSource` exposed). Run `eval/run-routing.mjs` on each.
2. When `tmp/impl/phase0.md` appears, compare: manifest hashes, lane totals, per-row grades for all
   544 rows, and each of the twelve check verdicts. Read the implementation helper and attack it:
   does each check test what the TODO says, or something weaker? Is any check vacuous?
3. Write `tmp/verify/phase0.md` with agreements, disagreements, and helper defects. Reply in your
   pane with one line naming the file.

## Phase 1 — per candidate

For each `tmp/impl/cN.patch` the lead hands you: apply it in your own scratch copy, rebuild, and
re-run all 544 rows on both sources. Confirm the numbers in `tmp/impl/cN.md`. Then attack it:

- Is it general? Search the diff for operation IDs, service names, query strings, or tuned
  constants that target one row.
- Probe beyond the corpus: write 20 or more new natural queries per risky area (short tokens,
  hackathon captures, RWA discovery versus implementation, schema-word leakage, directory
  taxonomy) and report captures that the corpus does not see.
- Check that no test was weakened and no label, case, threshold, or golden changed.

Write `tmp/verify/cN.md` with CONFIRMED / DISPUTED per claim and any new finding, then reply with
one line naming the file.

## Rules

No Wrangler process, no deploy, no paid eval. Run gate commands bare. Workers AI (Clef) spend only
with the lead's approval; log it in `tmp/verify/spend.md`.
