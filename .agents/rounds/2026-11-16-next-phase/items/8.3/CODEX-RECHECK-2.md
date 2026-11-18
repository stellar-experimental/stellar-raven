# Item 8.3 second Codex recheck

Reviewed commit `242d19fd` at worktree HEAD `5339794e`.

| Item | Disposition | Evidence |
|---|---|---|
| Finding 3 — architecture comparator | Fixed | Two arms with scored rows and null judge metadata now refuse for lack of an exact judge ID. An asymmetric fixture also refused when only the second arm had a score. The original explicit non-comparability and answering-model mismatch probes still refused. Answer-only rows passed with null verdicts, and judged rows passed with a matching exact ID. [Comparator](../../eval/qa/compare-architecture-ab.mjs#L330) |
| Finding 4 — Playground re-judge identity | Fixed | The synthetic v3 artifact with metadata naming `claude-sonnet-5-6` and a graded verdict reporting `claude-sonnet-5-5` still has the original pre-run hash. The evidence validator, re-judge CLI dry run, diagnostic reader, and recovery reader refused it. The tuple guard matched neither ID. An agreeing exact ID matched, and the unresolved legacy v3 control validated while leaving the judge identity unknown. [Evidence validator](../../eval/playground/artifact-contract.mjs#L176) · [Tuple and source guard](../../eval/qa/re-judge.mjs#L565) |
| Register provenance for empty files | Fixed | Adding an empty re-judge file, an incomplete pair, and a collection with no eligible verdict left the register matched to the contributing `claude-sonnet-5-5` and left the comparison count at zero. Giving the pair two eligible verdicts added both IDs and one cross-model comparison. [Register provenance](../../eval/qa/judge-stability.mjs#L236) |

No new findings in the fix.

The three synthetic probes and all 192 tests across seven focused files passed. The probes used synthetic files, and no model calls or tracked edits were made. The broader `re-judge.test.ts` suite does read repository case fixtures, including a historical live-case blob, internally. That suite ran in both rechecks. No case text was displayed or used in the review, and the first recheck's statement of no QA corpus reads was too broad.

Verdict — Approve the three reviewed fixes.

Reviewer — `gpt-6.2-sol`, high effort.
