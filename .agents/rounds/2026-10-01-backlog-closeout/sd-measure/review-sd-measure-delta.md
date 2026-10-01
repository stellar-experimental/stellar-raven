# Delta review: Stellar Docs measurement plan

## Verdict

GAPS

One gap remains in Appendix B.
The empty-content input can fail the prefix-discard set check.
The two amendments keep attribution and the caps.

## Findings

1. Medium. Appendix B, prefix-discard set.
The new tokens input sets `includeContent` to true.
That input enters the prefix-discard counter.
Its query is the filtered validator miss.
A real prefix removal adds `stellarDocs.search_docs_in_category:tokens`.
The expected branch set does not list that id.
The final equality fails after the empty-content checks pass.
Exact fix: skip `filteredBranches.add` when `input.requireEmptyContent` is true.
Keep the before-slice prefix count for every matrix branch.
Keep the meetings check on unfiltered kept record IDs.
Keep the soft-empty check and the zero-object check on the new input.

## Checked

Finding 1 matches the specified input.
The operation is `search_docs_in_category`.
The category is `tokens`.
The query is the quoted validator string.
`includeContent` is true.
The input is not positive.
Both arms must return a soft-empty envelope.
Both arms must send zero `/1/indexes/*/objects` requests.
The three message substitutions remain in `normalized`.
The script requires 89 inputs.
`node --check` passed on the amended script.
That check did not execute the script.

Finding 2 counts a prefix removal before the slice.
The meetings branch stays outside that count.
Meetings coverage uses the unfiltered kept record IDs.
A shorter page is not proof of a prefix discard.

The Costs section names the cost exception.
The exception cites `go-sd-measure.md`.
It cites the owner spending authority of 2026-10-01.
It permits the approximate `$59` proxy.
Paid commands still wait for `GO PAID`.
The four collection caps remain `$25`, `$25`, `$20`, and `$20`.
The method cap is `$90`.
Unused allocations do not transfer.
Repeated judging cannot use a collection allocation.
A nonempty grade union still stops for a new reviewed cap.
The variance rule remains in force.

The baseline server is the detached worktree at `bcfa617ffcb6e58e6a7498a1e42135a059535402`.
That worktree HEAD matches the recorded baseline commit.
The candidate server remains at `36787b3a9b051fa366b7648ca201691715253fbc`.
Neither HEAD may move.
Every `run-qa.mjs` command runs from the candidate worktree.
Each command still passes `$SERVER_REVISION` for the verified server.
The plan compares runner, judge, evidence-pack, case, and prompt-input hashes before spend.
The plan still allows only one Wrangler process.
The attribution table is unchanged.

Review date: 2026-10-01.
The reviewer did not author the amendment.
No Git write, paid call, server start, `.env` read, or `.dev.vars` read was made.
