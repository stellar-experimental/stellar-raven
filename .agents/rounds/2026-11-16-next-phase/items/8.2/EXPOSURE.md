# Item 8.2: case text found outside the corpus (for the orchestrator)

The set O reviewer (Claude Fable 5.2, agentpc `t1yr`) read every `ideas/` file, as its brief
required. Two of them carry judge-facing text or expected-answer detail for battery cases, beside
the case ids (audit finding O-01). The text has been committed since 2026-08. Item 8.2 removes it
from the living files; git history keeps it.

Case ids in those passages (ids only; nobody in this item looked up which set any is in):

- `ideas/codegen-correctness-substrate.md` lines 174-221: `q-sor-decode-hosterror-codes`,
  `q-soroban-unit-testing`, `q-soroban-wasm-size-limit`, `q-sor-testing-negative-auth-events`,
  `q-zk-nullifier-storage`.
- `ideas/source-delivery-ranked-references.md` lines 30-60: `q-protocol-base-reserve-min-balance`,
  `q-quickstart-manual-ledger-close`, `q-sor-p23-auto-restore-extendto`,
  `q-ti-rpc-gettransactions-pagination-xdr`.
- `ideas/codegen-correctness-substrate.md` lines 42, 135, 157: `q-sor-evm-to-soroban-porting`
  (found by the plan reviewer with an id-only match; whether text sits beside it is checked by E4).
- `ideas/stellar-org-source-lane.md` line 34 names `q-edge-deep-full-history-report` with a grade
  movement and no case text.

Readers in this item: the set O reviewer (`t1yr`) read both files in full; the PR 4 executor (E4)
(agentpc `t1yw`, Claude Sonnet 5.5) reads the named ranges to sanitize them. The lead and the
plan reviewer (`t1ys`) read no case text: they matched ids only.

Facts for the orchestrator:
- Readers before this item are unknown: the codegen note has been on `main` since `842d85b5`
  (2026-08-11), and any agent told to read `ideas/` saw it.
- Only living docs were swept. `research/` and the round records were not.
- The answer must not write a set beside an id in a ledger or the TODO (`eval/qa/README.md`,
  "Held-out split").
- PR 4's diff shows the removed text. Nobody reads that diff; it merges on check status plus a
  reader of the two result files only.

The lead extracted the ids with an id-pattern match over those line ranges and did not read the
text. The executor that sanitizes the two files reads the same passages and quotes none of them.

Question for the orchestrator: whether `eval/qa/README.md` "Held-out split" (a held-out or reserve
case whose content an agent saw moves to tuning by a dated amendment) applies to any of these ids.
That check needs the split file, which only the orchestrator's process opens.
