# Item 1.1 executor brief (Claude Sonnet 5.5, high)

You carry out `PLAN.md` (revision 2) in this directory, in the worktree
`/home/tyler/code/raven-wt/np-1.1` on branch `np/1.1-drain-upstream-handoffs`. Read `AGENTS.md`,
`PLAN.md`, `QUESTION.md`, `REVIEW.md`, and the skills `improvements-pipeline` (with
`references/upstream-writing-style.md`) and `golden-truth` before you start.

The plan runs in phases. **Stop at each phase boundary**, write your progress into `EXEC.md` in
this directory, and report with `hc send t1r5 '<abs path of EXEC.md>'`. Then wait in this
terminal for the lead's go message ("phase 2", "phase 3") before continuing.

- Phase 1: plan steps 1 to 6. Do NOT open `q-tool-wallets-comparison` (battery file or its row in
  `cases.json`) in any way, and do not write v4 (`--dry-run` only).
- Phase 2: steps 7 to 12 (only after the lead says "phase 2").
- Phase 3: steps 13 to 15 (only after the lead says "phase 3"). Do not open the pull request and
  do not comment on #425 or #429; the lead does those.

Rules:
- Posting upstream (issues and comments, never pull requests) is authorized by decision 4 for
  exactly what the plan names. Read each posted comment back and record its URL.
- No model-calling eval, no paid call. Keyless public reads only. Never print a secret.
- Never print, `cat`, `jq` or `head` anything under `~/backups`; the runner prints counts and a hash.
  Never record which set a case is in beyond the v4 counts.
- Commit with normal hooks, never `--no-verify`. Commit message ends with
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Run each gate bare (no pipes) and summarize each gate's output in EXEC.md. Report failures; do
  not hide them. Record any deviation from the plan in EXEC.md with its reason.
- If something the plan assumes turns out false, stop and report rather than improvising.

## Lead addendum (2026-11-17, after phase 1)

Gate before v4: PASS (your step 2, and reviewer part A in `REVIEW-RETIRE.md`). Phase 2 is released.

Phase 3 additions (do these in step 13 to 14, in addition to the plan):

1. **sls-120.** Before the sls-107 resolve, write `improvements/stellar-light-scout/sls-120-*.md`
   from the "What sls-120 would state" block of `REVIEW-RETIRE.md` (part A, sls-107). Re-run its
   four reads yourself once (the evidence bar for `verified` is your own live re-execution), then
   file it with `npm run improvements:file -- --file … --dry-run`, read the dry run as the
   maintainer, then file for real. Do not cite the attestation PDF. Name sls-119 (#1971) and
   sls-120 (its issue URL) in sls-107's `--live-recheck`, so the comment on #1900 carries both links.
2. **sd-081.** Its residual (the restore-data `Api` / TS2440 defect) is inside the original
   finding, so the status stays `reported-upstream` and no successor is filed. But bring the
   finding's `## Finding`, `## Evidence` pointers and `## Recommendation` to current state: say the
   restore-contract defects were fixed by stellar-docs PR #3083 (merged 2026-11-10), use the
   unsuffixed page paths, and keep the `Api` defect as the open item with its smallest fix. Then
   post one short verification comment on stellar/stellar-docs#2562 (materially new evidence:
   what #3083 fixed live, what still fails, the smallest fix), in the upstream writing style.
   Read it back and record the URL in the finding's evidence.
3. **TODO.** Add one dated line under "Improvements follow-up" for the next Scout sweep, from
   `REVIEW-RETIRE.md` "Adjacent scan": 5 `Live` wallet rows whose own `availabilityCheck` says the
   operator is gone or the product left Stellar (spatium, freelii, bebop, sentit, elsa), and the
   unrepeated `q=wallet` paging overlap (196 rows for total 195, `coca` on both pages). Neither is
   verified to the filing bar; the line names the exact re-check.
4. **#427 reply:** post your phase-1 draft in step 15 as planned.
5. In EXEC.md, keep the v4 counts but drop the sentence that names which set the case left.

## Lead decision (2026-11-17, phase 2 step 9)

Option **A**. Rewrite only the judge-blind `truth.notes` paragraph that ties grading to sls-033:
state, dated 2026-11-17, that sls-033 is fixed live (every platform fact sourced, Scout 1.9.150)
and that no cap applies; keep any provenance that is still true. Leave every `golden.*` field,
`truth.asOf` and `reverifyBy` unchanged. Update `truth.verified` (date 2026-11-17, by, evidence
including the step 2 re-check and REVIEW-RETIRE.md, rootCause
`improvements/resolved.json (sls-033 receipt)`). Skip the sibling sweep's golden edits (nothing
judge-facing changes) but still run the sweep script and record the opened ids and the count,
because the truth claim changed. Re-judge disposition: none needed, judge-facing text unchanged;
record whether `caseInputSha256` changed after compile. Then steps 10 to 12 as planned; step 11's
expected diff is whatever A produces: record exactly which compiled fields changed.
In EXEC.md record plainly that the case was not judge-facing-capped, so the v4 move turned out
unnecessary for this edit; the lead reports it.
