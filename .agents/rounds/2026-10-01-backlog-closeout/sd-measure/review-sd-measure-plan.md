# Pre-spend review: Stellar Docs adapter measurement

## Verdict

LAUNCH-OK WITH FIXES

Fix the two Appendix B gaps before launch.
The rest of the launch checklist holds.
Spend still waits for matching current-tuple receipts or an explicit cost-estimate exception.
The phrase "all spending is approved" does not supply that exception.

## Findings

1. Medium. Appendix B, comparison and pass rule.
The content rule requires no object request when a call keeps no hits.
Every `includeContent: true` input is marked positive.
A positive input must return at least one hit.
The filtered miss inputs omit `includeContent`.
Those inputs never reach the empty content path.
A candidate can request content for discarded hits on that path and still pass.
Exact fix: add one `search_docs_in_category` input with `category: "tokens"`, `includeContent: true`, and a quoted validator query.
Do not mark that input positive.
Require a soft-empty envelope on both arms.
Require zero requests whose path is `/1/indexes/*/objects`.
Keep the three message substitutions.

2. Medium. Appendix B, branch coverage.
The plan requires each category branch to discard at least one candidate.
The script counts a branch when the raw hit list is longer than the final kept list.
A `hitsPerPage` value of 1 creates that gap after the prefix filter.
The meetings branch has no prefix filter, so only a shorter page can mark it.
A URL filter that keeps every hit can still pass.
Exact fix: count a filtered branch only when the prefix filter removes a hit before the slice.
Require that event for every filtered category branch.
Check the meetings branch through its unfiltered kept record IDs.
Do not use a shorter page as proof of a prefix discard.

## Checked

Review date: 2026-10-01.
The reviewer did not author the plan.
No Git write, paid call, server start, `.env` read, or `.dev.vars` read was made.
The candidate worktree was clean at `36787b3a9b051fa366b7648ca201691715253fbc`.
That commit changes `.agents/TODO.md`, `docs/stellar-docs.md`, `src/adapters/stellar-docs.ts`, and `test/adapters.test.ts`.
The manifest hash is the same at both pinned commits.

Attribution holds.
Appendix A matches `sd-adapter-measurement.json` and `case.surface` for all 12 operations.
The 20 battery IDs are the union of the three direct surfaces and the five named miss cases.
All 20 are active in `eval/qa/cases.json`.
The 15 live IDs are the full `live-data-canonical-v3` set.
Missing lifecycle fields stay active.
The plan attributes an answer change only when the trace reaches the affected call.
Surface membership stays candidate coverage.

The variance rule is adequate for these 20 and 15 rows.
`eval/qa/README.md` gives no numeric noise floor to use as a cutoff.
`--judge-panel 2` forces two votes, and a tie resolves to the worse grade.
One rejudge of the grade-difference and Wrong union repeats that panel on stored answers.
A second answer collection does not fit inside the $150 cap.
The plan blocks release on an unattributed new Wrong until triage.

Pins match Appendix C at both commits.
`JUDGE_RUBRIC` is `v2.10` and `PACK_VERSION` is `p6`.
The four `run-qa.mjs` commands pass the fail-closed syntax parser.
Each paid command has one `--max-budget-usd`.
`re-judge.mjs`, `judge-stability.mjs`, and `report-live-surface.mjs` accept the planned flags.
`surfaceSha256` covers server instructions and the tool list.
The adapter diff does not change that surface, so cross-arm equality is valid.
The stable probe takes three vectors at five-minute intervals.
The launcher rejects a dirty worktree.
The cited historical totals, splits, ranges, and medians match the stored artifacts.
The proxy arithmetic is about $17.41, $12.20, and $59.22, and the plan labels it as a proxy.
A cap stop writes the partial artifact, suppresses aggregates, and keeps the original denominator.

The free differential tolerates the documented default and the three miss-text changes.
Direct omitted limits must match a baseline call with `hitsPerPage: 5`.
The retained hit prefix, `nbHits`, and `page` stay fixed.
Only `hits` and `nbPages` may differ from the omitted baseline call.
Category content calls still require full envelope equality.
The script sends the documented search-only names, `ALGOLIA_APPLICATION_ID_DOCS` and `ALGOLIA_API_KEY_DOCS`.
It does not read `ALGOLIA_WRITE_API_KEY`.
Headers stay out of the receipt.
The receipt redacts both runtime values before the write.
A temp copy of the baseline adapter imported on Node `v24.13.0`.
The embedded script passes `node --check`.
The matrix contains 88 inputs.
The schedule keeps this lane off the paired run on 2026-10-03 and 2026-10-04.
The 18:00 America/New_York stop matches `2026-10-02T22:00:00Z`.
