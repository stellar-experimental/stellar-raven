# Stellar Docs second free comparison

The second comparison passed all 101 input pairs across 12 operations.
The run used the original 89 inputs and the 12 frozen additions.
The frozen-input SHA-256 matched before execution and after completion.
The script ran once, from 2026-10-01T19:03:40.157Z to 2026-10-01T19:03:59.532Z.
It made 255 HTTP attempts and exited with code 0.

All response comparisons passed with only the declared default-limit and miss-message exceptions.
All nine required category branches returned matching retained string content.
All eight filtered branches demonstrated prefix removal before slicing.
The meetings branch passed its unfiltered retained-ID checks.
The zero-hit, filtered-window, and page-section miss checks passed.
The nonzero tokens-category miss returned 100 raw candidates in each revision.
Both revisions returned soft-empty for that input and made no object request.
The empty-result case did not count toward the eight required prefix-removal branches.

The candidate requested content objects only for retained IDs.
The candidate omitted content from the initial query's requested attributes.
The free comparison establishes equivalence for these inputs under the declared exceptions.
It does not establish paid QA performance or complete the measurement requirement.

Evidence paths below are relative to this report directory.

- Result receipt: `sd-differential-2026-10-01T19-03-40.156Z.json`.
- Result receipt SHA-256: `5f297a53c3e23d19b2d7c00dc6a9922da52210156c166ce1193abd47b47a126e`.
- Frozen inputs: `../sd-diff2-frozen-inputs.json`.
- Frozen-input SHA-256: `772b8c09f3be0be842ddd30875932a5da2b1351f4b06a013298d33d687dbccae`.
- Command receipt: `sd-measure-checks/differential-2-command.json`.
- Executed script: `sd-measure-checks/differential-2-script.mjs`.
- Script SHA-256, excluding the saved trailing newline: `46010f9f47f1e9a463790ed90ffacb91e70f2f1432f27e9add7a36299f5d72a6`.
- Plan SHA-256 at execution: `ce82e5db26d94c8ffdd8fcbb8a9b3e053f471a3dd5a62e232327d7b359cb9838`.
- Execution log: `sd-measure-checks/differential-2.log`.
- Review: `review-sd-amendment.md`.
- Baseline: `bcfa617ffcb6e58e6a7498a1e42135a059535402`.
- Candidate: `36787b3a9b051fa366b7648ca201691715253fbc`.
- Adapter SHA-256: `0d3a347b7bea4b4d03c833c07fe3d0d1d3e1995479d597c23ac264e99a7d0d93`.

I preserved the first incomplete receipt and the baseline probe receipts.
I changed no source file and moved no Git revision.
The candidate worktree remained clean after the run.
No paid command ran. Model spend was `$0`.
No server started. The measurement TODO remains open.
Paid collection still requires explicit `GO PAID`.
