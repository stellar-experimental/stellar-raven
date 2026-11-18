# Item 8.2 EXEC-4: case text out of `ideas/` (PR 4)

Executor: Claude Sonnet 5.5, agentpc terminal `t1yw`. Branch `np/8.2-docs-case-text`.
Reader of case text: terminal `t1yw` (`$HC_TERMINAL_ID`), recorded as a reader. It read
`ideas/codegen-correctness-substrate.md` in full and `ideas/source-delivery-ranked-references.md`
lines 24-65 to rewrite them. No case text appears in this file, the commit message, or
`codegen-residues.md`.

## Last commit holding the earlier text

- `ideas/codegen-correctness-substrate.md`: `ae6577b1`
- `ideas/source-delivery-ranked-references.md`: `4602ca00`

## Per file

- `ideas/codegen-correctness-substrate.md` moved with `git mv` to
  `research/audits/2026-08-07-codegen-partner-report.md`, then edited:
  - after the title: the required "Moved from `ideas/` and sanitized" line;
  - original lines 6-7, 33, 71, 131, 138 and the golden-gaps and product-risk sections: every
    `solo://` or Solo scratchpad reference became "(source: an internal note, not retained)";
  - line 42 (verdict column, `q-sor-evm-to-soroban-porting`): expected-answer detail replaced by a
    reference to the expected-answer field. The defect-class label in column 1 is the reporter's
    taxonomy and stays;
  - lines 135 and 157 (`q-sor-evm-to-soroban-porting`): descriptive clauses about the case removed;
    the id and a coverage claim stay. Beyond the id, line 135 carried a one-clause paraphrase of
    the case's purpose and line 157 a scope clause; line 42 carried expected-answer detail;
  - lines 174-211 ("Golden-question gaps", "Separate corpus defect"): quotes of golden, key-facts,
    avoid and notes fields replaced by case id plus field name
    (`q-zk-nullifier-storage` golden, `q-soroban-wasm-size-limit` avoid clauses,
    `q-sor-decode-hosterror-codes` golden and rubric, `q-soroban-unit-testing` notes,
    `q-sor-testing-negative-auth-events` pointer target, its prior-art `must_haves`). Corpus-wide
    search-term counts stay: they hold no case text;
  - lines 213-221 ("Unanalyzed product risk"): the person's name, the partner's regulatory
    processes and the pronoun reference removed; the product question stays.
- `ideas/source-delivery-ranked-references.md` lines 28-62 (section 1): per-case bullets reduced to
  case id, class, and finding id (`sd-044`, `sd-004`, `sd-043`); the research-row citations and links
  on those lines went with the detail. All headings and section numbers kept; no other line touched.
- `ideas/README.md` line 30: link target retargeted to the moved file; description text unchanged.
  The index line stays an "idea" entry; the O-47 reshuffle of it is for the TODO or index owner (E3).
- `codegen-residues.md` written in `np-8.2` item folder (not committed here).

## Checks

- Id-line check (`rg -n 'q-...'` over the two files): 12 lines; each carries an id and a field name
  or finding id only.
- Residual terms: a search of the moved file for the Solo, scratchpad and removed partner-detail terms: no hits.

## Gates

- `npm run typegen`: exit 0.
- `npm run typecheck`: exit 0.
- `npm test`: exit 0 (174 files passed, 5 skipped; 4190 tests passed).
- `npm run build`: exit 0 (dry run).
- `npm run secrets:scan -- --tree`: clean.
- Link check on the moved file and `ideas/*.md`: 0 problems.
- `git diff --stat origin/main -- src public wrangler.jsonc catalog specs`: empty.

## Not done / notes

- Not pushed. No PR opened.
- The "Held-out split" question in EXPOSURE.md is the orchestrator's.
- Line 44 of the moved file keeps "SEP-57" as part of the reporter's defect-class label (#6). Say if
  the lead wants it dropped.
