# Amendment review: baseline-only coverage selection

## Verdict

GO DIFF 2 OK

The frozen inputs cover the nine content branches and the three gaps.
The pass rule and the first receipt stay in force.

## Checked

Selection used the baseline adapter at `bcfa617ffcb6e58e6a7498a1e42135a059535402`.
Both probe scripts import that worktree only.
They do not read the candidate arm.
The probe receipts contain no candidate commit and no object-fetch path.
The run made 47 HTTP attempts.
The limit is 200 attempts and 30 minutes.
The run finished within three minutes of its start.
Each branch used at most two search calls.
The search limit is five calls for each branch.
Each branch used at most one page-section seed.
The seed limit is two calls.
The wallet continuation used the second search on that branch.
Its four listed phrases occur in the saved baseline paragraph.
Each seed uses the first baseline page URL for that branch.
Each kept content phrase is the first eight-word phrase from that baseline text.

The frozen file SHA-256 is `772b8c09f3be0be842ddd30875932a5da2b1351f4b06a013298d33d687dbccae`.
It holds 12 inputs.
Those inputs match the cumulative selection receipt.
Nine inputs require string content.
They cover all nine content branches.
The first receipt lacks prefix removal on `search_anchor_sep_docs` and `search_sdk_cli_tools_docs`.
The two prefix inputs cover those branches.
Each prefix input removes hits before the slice.
The tokens input `validators` has 127 index hits and zero hits after URL filtering.
It is soft-empty and makes no object request.
The program keeps the original 89 inputs and then appends these 12.

The program skips `filteredBranches.add` when `input.requireEmptyContent` is true.
The full-content equality still requires all nine branches.
The prefix equality still requires all eight filtered branches.
The meetings retained-ID check remains.
The soft-empty check and the zero-object check remain.
The three message substitutions remain.
New flags add content, prefix-removal, and nonzero-candidate checks on both arms.
The envelope comparison exceptions are unchanged.
`node --check` passed without execution.
The recorded program SHA-256 matches the embedded program.

The first receipt remains incomplete.
Its SHA-256 is `2ecda29d51f9382e4b1bbe9acc4880981d7bbc1b4273c2c757e3288418d8759c`.
It still holds 89 pairs.
The cumulative probe file is a separate artifact.

Review date: 2026-10-01.
The reviewer did not author the amendment.
No Git write, paid call, server start, `.env` read, or `.dev.vars` read was made.
