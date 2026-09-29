# Truth maintenance 2026-09-29

## Scope

Review all open Raven issues and all active upstream findings. Apply supported repairs and verify their effects.
Keep paid evaluation, new operation exposure, and production deployment behind their existing gates.

## Lane plan

- Coordinator: Codex. Own repository edits and final checks.
- Drift: review issue #180 with `live-drift-resolution`; regenerate artifacts and inspect skill body changes.
- Improvements: inspect every active record and upstream ref with `improvements-pipeline`; repeat changed or claimed-fixed triggers.
- Independent review: the user explicitly permitted built-in agents after the Herdr caller pane failed to resolve.
- `docs_resolution_review`: GPT-6 Sol, high; live Docs/index verification, golden matrix, and `sls-024` lifecycle audit.
- `drift_independent_review`: GPT-6 Astra, high; drift class, prompt input, runtime impact, and independent routing comparison.
- `horizon_findings_review`: GPT-6 Sol, high; original monitor, product classification, deduplication, and SLP correction.
- The built-in runtime provides OpenAI models only. The reviews use independent contexts and fresh live probes.
- Fable and Grok are unavailable through the permitted built-in runtime. The user chose this runtime as the topology exception.
- Golden: check due dates and change facts only through `golden-truth` when required.

## Drift verdict

Accept the Scout 1.9.54 metadata update and the two skill pin updates.
All 38 upstream operation objects and shared components remain identical.
The path/method set remains identical. No declared runner operation changed.
The manifest still exposes 60 operations, 20 whole skills, and 202 skill sections.
All 282 IDs remain identical. RWA and paid Lumenloop operations remain excluded.
The skill body review covered all ten changed files.
The independent GPT-6 Astra high reviewer accepted the actual diff.
Its bounded link defect became `sk-026`; it does not block the pins.
The review verified all 66 mirrored files and 222 catalog file transports.
See `2026-09-29-truth-maintenance/drift-independent-review.md`.

The owner approved merging and production deployment in this session.
PR #182 merged and the production checks passed. Issue #180 is closed.

## Eval verdict

The free routing gate passes against the existing numerical thresholds.
The author and reviewer compared all 544 complete scored rows.
No result ID, rank, score, accepted total, or holdout result changed.
`drift-comparison.json` records the comparison.
The manifest byte fingerprint changed; numerical acceptance rules did not change.

The stored 100-case plan run keeps identical rows and summary grades.
`plan-check.json` records the comparison.
No paid answer-quality run or re-judging ran.
This round makes no new answer-quality claim.

## Golden verdict

Remove only the expired canonical-page caution from `q-protocol-base-reserve-min-balance`.
Refresh its source provenance and the resolved `sd-046` root cause.
Update only the stale provenance sentence in `q-pc-sponsored-reserves`.
Both cases keep their answers, key facts, avoid rules, observation dates, and reverifyBy dates.
The corroboration uses official pages, CAP-0038, commit-pinned Core, and complete indexed sections.
The independent reviewer also verified the dated Mainnet ledger reserve setting.

The compiler changed exactly those two case records among 501 cases.
The register reopened clusters 017, 054, 114, 123, and the base-reserve numeric invariant.
The independent reviewer read every member and approved all five consistency entries.
The helper applied the four cluster reviews; the owner applied the exact numeric-invariant attestation.
The stamped hashes remain current. No entry remains reopened from this change.
See `golden-register-independent-review.md` and `golden-register-review.json`.

The stale queue has no past-due case. Eighteen cases reach review dates by 2026-10-27.
Existing dated TODOs remain. No freshness date was extended.
Two existing undated sibling amounts now have a named follow-up in `.agents/TODO.md`.

## Improvements/issues/PR verdict

The initial GitHub census found three open issues (#167, #180, #181) and no open Raven pull requests.
It covered all 61 initial findings and 69 distinct upstream references with zero read errors.
`upstream-state.json` preserves the census. `upstream-table.md` records each action.
Routine recurrences stayed local. Untouched open issues received no reminders.

| Issue or finding | Action | Remaining condition |
| --- | --- | --- |
| Raven #167 | Retain the RWA exclusion | Existing mixed-intent acceptance conditions |
| Raven #180 | Merge and deploy the accepted drift changes | None; live acceptance passed |
| Raven #181 / sd-046 | Close the notification and retire the finding | None for the verified original trigger |
| sd-037 / stellar-protocol PR #2021 | Repair the SLP definition at 65d35aebf3ae3d5b9094b36959c27d9b8540e2a0 | Maintainer decision |
| sd-027 / sd-034 / Docs PR #2837 | Retain the merge hold; nine checks pass | Review and template dependency |
| sls-024 | Record the partial fix across 1004 searchable rows | Evidence for positive deployment claims |
| sls-029 / sls-033 / sls-085 / sls-086 | Record current local recurrences | Upstream content or metadata repair |
| Seven recurring probes | Keep existing statuses | Original upstream defects remain |
| sls-087 | Verify current Horizon answer 28 against own scanned source 29 | Await the upstream fix; re-run the original trigger |
| sls-088 | Verify Horizon fixture contracts cause a false product classification | Await the upstream fix; re-run the original trigger |
| sk-026 | Verify two error links return 404 while grouped links return 200 | Await the upstream fix; re-run the original trigger |

`sd-046` passed independent fresh checks on both rendered pages and complete indexed sections.
Docs PR #2844 deployed its merged correction. CAP-0038 and Core agree with the pages.
The author posted resolution comments on Docs issue #2842, Docs PR #2844, and Raven issue #181.
Each exact comment body and author passed GitHub readback.
`sd-046-resolution-comments.json` records the durable links and bodies.
The resolver removed the active finding and intake override, then rebuilt the index.
The receipt pins the original record at `8ab7b88f95177022cd24c0d0acb6e619b19ea23c`.
Dated historical records remain intact.

The author repaired the existing SLP PR and answered its substantive review comment.
All six titles and statuses match the proposal preambles. All four upstream checks pass.
The independent Horizon reviewer accepted the repair.

The original free Horizon monitor reproduced through the direct Scout service.
No valid local Raven server pane was available. No second development process started.
The returned knowledge note uses a dated September 1 value, while its scanned source now defines 29.
The new finding preserves the retired `sls-080` receipt and its valid historical observation.
The classification finding covers one verified API-server repository.
The final review corrected a wallet field name and a deployment count description.
It also required the Horizon recommendation to avoid a false application fallback.
Every correction appears in the final source record before filing.
The Trustless Work finding covers documentation links only; no escrow transaction ran.
All three reports now have status `reported-upstream`.
The active index contains 63 findings: 61 initial records, one retirement, and three additions.

## Own-repo todos

Remove the completed temporary `sd-046` retirement task.
Keep the SLP PR follow-up with its correction commit and review reply.
Update the Horizon monitor rule to compare with the response's own scanned source.
Record the two pre-existing undated reserve examples for a future golden pass.
Keep the October 1 source-metadata follow-up and existing review holds.

## Decisions

Keep RWA excluded while issue #167's acceptance conditions remain unmet.

The fingerprint refresh changes only the accepted manifest byte identity.
All 544 routing rows retain their result IDs, ranks, and scores.
Every numerical floor, ceiling, label, and accepted total remains unchanged.
The enforced routing gate passes against those thresholds.

The Horizon reviewer corrected the author's broken-link claim before filing.
The GitHub browser link redirects from `master` to `main`; a contents API ref error was insufficient evidence.
The current-source value mismatch remains independently verified.

## Final checklist

- `npm run typecheck`: pass.
- `npm test`: 120 files; 2185 tests pass; four tests skip.
- `npm run build`: pass; assembled bundle dry-run only.
- `npm run eval:routing -- --gate`: pass; all 544 rows retain their results and scores.
- `node scripts/check-mirrors.mjs --fetch`: pass; 66 files.
- `node scripts/check-skills-drift.mjs`: pass.
- `node scripts/check-pin-review.mjs --base 40a77c4`: both new selections recorded.
- `npm run eval:qa:compile`: 501 cases; exactly two changed records.
- `npm run eval:qa:register -- --check`: pass.
- `npm run eval:qa:lint -- --since 40a77c4 --stale`: zero errors; 62 existing warnings.
- `npm run eval:plan -- /tmp/raven-20260929-last-qa.json`: 100 unchanged row grades.
- `npm run improvements:index`: 63 active findings after one retirement and three new reports.
- `npm run improvements:lint -- --live`: pass.
- `npm run improvements:probes`: seven recurring; zero fixed candidates, inconclusive results, or errors.
- Staged tree and staged-addition secret scans: clean.
- Exact finding snapshots published at `22ec28cbd6704fcde1acdaba9db7bfccea261161`.
- Final scoped findings review: accepted; `final-findings-review.md` records each reconciled finding.
- Standardized filing completed. Exact public source blobs, issue bodies, and authors passed GitHub readback.
- `sls-087`: https://github.com/Stellar-Light/stellarlight/issues/1738.
- `sls-088`: https://github.com/Stellar-Light/stellarlight/issues/1739.
- `sk-026`: https://github.com/Trustless-Work/trustlesswork-skill/issues/16.
- `filed-findings.json` records the immutable source, exact posted bodies, and verified authors.
- Production deployment and closure of #180: completed after the owner approved the release.

## Publication

The reviewed source commit is `22ec28cbd6704fcde1acdaba9db7bfccea261161`.
The filing receipt commit is `1b7c06847b38398740bffc77d5bf7f0ba82d4440`.
The branch is `chore/truth-maintenance-2026-09-29`.
PR https://github.com/stellar-experimental/stellar-raven/pull/182 merged the reviewed maintenance package.
The author, exact PR body, remote branch head, and clean worktree passed readback checks.
GitHub CI checks the published head. Its durable results appear on PR #182.
All independent agents completed their reviews. No development service started.
The owner approved production deployment. This round completed issue #180 after live verification.

## Production acceptance

PR #182 merged by squash, as the repository requires.
The merged runtime commit is `1e94ccdde8098d0317ab63cf0d9fe174f7f7dfce`.
Worker Version ID is `5774bb56-d1f9-4725-ae65-bfd35e3c0bce`.
Deployment ID is `5aa207b6-d989-42aa-8f82-f8831b6e2f0d`.
Cloudflare reports 100% traffic on this version.
MCP initialize reports the exact merged source revision.
The deployed catalog has 60 operations, 20 whole skills, and 202 sections.
Every one of the 282 IDs matches the committed manifest.
All 80 operation and whole-skill exact-ID searches pass.
The updated standards and Core API file reads carry the reviewed pinned URLs and content markers.
RWA remains excluded.

All six public route checks return HTTP 200. Unauthenticated MCP returns HTTP 401.
The usage tail consumer and retention schedule checks pass with `WRANGLER_PROFILE=sdf`.
The initial postdeploy hook used an unsuitable credential and returned HTTP 401 after the successful upload.
The profile-specific recheck passed. No second deployment was needed.

The raw local and HTTP surface hashes differ.
Their complete tool definitions match after sorting JSON object keys; their instruction hashes match exactly.
This confirms a serialization-order difference, not a changed tool definition.
The temporary verification credentials were revoked, and their local files were removed.
`production-verification.json` records each acceptance result.
`drift-resolution-comment.json` records the exact posted comment, its author, and the closed issue state.

The final receipt commit changes documentation and acceptance evidence only.
Production continues to identify the reviewed runtime commit above.
