# Stellar Docs free differential result

## Result

**INCOMPLETE. Stop before paid collection.**

The comparison ran once on 2026-10-01, from 18:43:10Z to 18:43:31Z.
It tested all 89 planned input pairs across 12 operations.
All 89 pairs passed the envelope comparison with only the declared default and message exceptions.
Nine additional baseline calls checked the omitted-limit default against explicit `hitsPerPage: 5`.
The run made 222 HTTP attempts and exited with code 1.

The final full-content coverage assertion failed.
None of the nine required category branches returned a string `content` value in their retained hits.
The retained records were headings on both revisions.
The candidate's retrieved heading objects had null content.
Thus, the run verifies heading-only equivalence but cannot establish full-content equivalence.
This observation does not show that the index lacks content records.
The recorded meetings candidate window includes content records beyond the retained headings.

No code changed. No repeat or replacement query ran after the failure.
The measurement TODO remains open.

## Review fixes and observed coverage

- The plan includes the non-positive, content-enabled tokens-category validator query.
- Both revisions returned soft-empty for that input, with zero object requests.
- The saved response had `nbHits: 0` before category filtering.
- Saved requests show prefix removals before slicing in 6 of eight filtered category branches.
- The meetings branch passed its unfiltered retained-ID checks.
- The run observed zero-hit, filtered-window, and page-section misses.
- Full-content branch coverage remained zero of nine.
- `search_anchor_sep_docs` and `search_sdk_cli_tools_docs` did not demonstrate prefix removals before slicing.
- The content-enabled miss had a zero index count, so it did not demonstrate a nonzero-count filtered miss.

The script stopped at the full-content assertion before storing its final coverage object.
`sd-measure-checks/differential-analysis.json` derives the other coverage facts from the unchanged receipt.

## Plan amendments

Both Grok review fixes are applied in `$B/sd-measure-plan.md`.
The baseline server uses `sd-baseline`; the candidate server uses `sd-adapter`.
Neither worktree's HEAD will move. Every future QA runner command uses the candidate worktree.
The coordinator's explicit cost exception accepts historical proxies.
Four collection commands have a combined `$90` cap.
The prior repeated-judging allocations are withdrawn; any required repeated judging needs separate bounded approval.
Paid collection still requires the coordinator's explicit `GO PAID`.

## Evidence

- Receipt: `sd-differential-2026-10-01T18-43-10.584Z.json`.
- Receipt SHA-256: `2ecda29d51f9382e4b1bbe9acc4880981d7bbc1b4273c2c757e3288418d8759c`.
- Command receipt: `sd-measure-checks/differential-command.json`.
- Executed script: `sd-measure-checks/differential-script.mjs`.
- Execution log: `sd-measure-checks/differential.log`.
- Baseline: `bcfa617ffcb6e58e6a7498a1e42135a059535402`.
- Candidate: `36787b3a9b051fa366b7648ca201691715253fbc`.
- Adapter SHA-256: `0d3a347b7bea4b4d03c833c07fe3d0d1d3e1995479d597c23ac264e99a7d0d93`.

## Checks and spend

The compilers, evaluation self-test, stale corpus lint, register check, routing gate, and diff check passed.
Runner, judge, evidence-pack, case-file, and catalog hashes match across both worktrees.
Logs remain in `sd-measure-checks/` beside this note.
No paid command ran. Model spend was `$0`.
No Wrangler server started.

## Next decision

The coordinator must review a bounded input amendment that reaches retained content records.
That amendment must also cover both missing prefix-removal branches and a content-enabled miss after nonzero candidate retrieval.
Preserve this incomplete receipt. Do not weaken the coverage assertion or silently rerun the method.
Paid collection and release remain blocked by incomplete content coverage.
