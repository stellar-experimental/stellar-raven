Item 5.1 independent Codex review — 2026-11-17

Reviewed `origin/main...HEAD`, base `9b1a483b`, HEAD `5e846d67`, in `/home/tyler/code/raven-wt/np-5.1`. No tracked files edited by hand; generator reruns left no tracked diff. No server, model-calling eval, paid request, or upstream post. This review used the Codex brief's held-out restrictions throughout.

1. **Should-fix — the finding still overstates the historical HTTP status, including in the posted issue.**
   Evidence: `improvements/stellar-light-scout/sls-123-partner-match-ai-path-unavailable-for-three-weeks.md:19-21` says a client “gets a 503 on every call we observed.” Its own evidence at line 43 records HTTP 502 on 2026-11-02. The same unqualified sentence is present in the open upstream issue, verified with `gh issue view 1976 --repo Stellar-Light/stellarlight --json number,title,body,state,url,comments`. This retains the precise factual inconsistency identified by plan review finding 4, despite the correct opening sentence and dated table.
   Proposed fix: qualify the sentence to the observed date: “Every observed call on 2026-11-17 returned HTTP 503 with `unavailable: true`.” Correct the source record and the corresponding upstream statement through the authorized finding-maintenance workflow; preserve the existing observations and provenance. No new endpoint probe or routing run is needed for this prose correction.

No blocking code finding or additional test/routing defect found. The evidence below supports the implementation, subject to reconciling finding 1.

**Review results**

- Routing comparison exactly reproduces the EXEC lane table and its enumerated non-confirmation-only score-change IDs. Legacy: 338 rows, 108 confirmation-only, zero grade changes, two top-five changes (both confirmation-only), nine score-only changes (seven enumerated, two confirmation-only), maximum score change 15. Extended: 122 rows, 43 confirmation-only, zero grade or top-five changes, four score-only changes (three enumerated, one confirmation-only), maximum score change 8. Skills: 23 rows, no changes. Protocol history: 12 rows, one confirmation-only, no changes. Overall, per-service, accept-either, and the three other lane aggregates are equal. Full permitted comparison output is in `tmp/5.1/codex/comparison.json`.
- Holdout aggregates only: forbidden captures 10 → 11, passed 25 → 24. All other aggregate members are identical: n 49, top1 12, top3 27, top5 30, cardN 49, cardHit5 30, and authoredAt. No `holdoutCases` member was accessed. No confirmation-only row was printed.
- `eval/gates.json` matches HEAD manifest SHA-256 `4e7094be6c3a2e39462020910ec163ad4e88f07fa0af8ec712d6f13aad0635bb`; the other three committed input hashes are unchanged. Accepted holdout totals and ceiling 11 are correct. `baselinedAt` equals the `ranAt` of its existing `localTrace`, whose manifest hash and accepted aggregates match the rerun. The new evidence lead contains the owner authorization, policy reason, counts-only boundary, observed lane movements, issue, re-exposure condition, and accurately pending review attribution. The lead should now replace the pending review attribution with the reconciled review outcome as already planned. `holdoutNote` correctly scopes 11 to this removal and states the return to 10 on re-exposure.
- Exposure: exactly one manifest entry disappears, `scout.matchPartners`. Twenty remaining Scout entries have generated keyword changes only. The manifest, super-spec, family text and corroboration text pass the emitted-text guard. All 65 selected non-retired skill files, after the shared runtime scrub, contain none of the removed operation's camelCase name, snake_case name, or endpoint path. Catalog, search, spec, scrub and emitted-text tests pass. The documented loss of the Scout partner-filter workflow remains the accepted scope tradeoff and is recorded in TODO; the orchestrator still needs that disclosure before merge.
- Test retargets retain the original assertions apart from justified counts and exposure expectations; `scout.getPartners` gains an explicit reachability assertion. The adapter fixture overrides the id and POST transport while retaining the 503/fallback assertions. `callScout` uses that transport and does not validate the inherited directory schema, so the test still exercises the intended 503 branch.
- `src/mcp/tools.ts` makes only the two authorized wording changes. Following the adapter hint avoids the former conflict with timeout and unavailable hints that prohibit retry. Generic errors may lack a hint; this is the already disclosed plan limitation, not a new regression in error classification or execution.
- The finding's status, issue URL, index entry, documented causes and recommendation are otherwise consistent. GitHub issue 1976 is open, has the expected body and source snapshot, and has no comments. The finding and posted body contain no production counts or case IDs. The review did not re-run its model-backed POST.
- Split amendment review was code-only. The v7 fingerprint and counts are pinned, exactly one non-tuning identifier is selected, `moveToTuning` enforces the partition and count invariants, output uses fixed failures/counts/hash, and the v8 write is exclusive with mode 0600. The helper count is 89; the four dated briefs and PRESTAGE consistently point to v8, whose documented hash matches TODO and FOLLOWUP. The changed QA file's path metadata was used only to check that its identifier appears in zero changed Markdown files, commit messages, gate provenance, or amendment code. No QA corpus/cases row, split file, or exposure note was opened. Accordingly, the golden-independence conclusion remains the executor's recorded C2 read, rather than an independent golden review here.

**Commands and results**

All routing commands redirected both stdout and stderr into `tmp/5.1/codex/`. Only `grep` selections of lines beginning `GATE` or `results -> ` were read from those logs. QA lint output was never displayed.

| Command | Result |
|---|---|
| `git show origin/main:catalog/manifest.json > tmp/5.1/codex/base-manifest.json` | Base manifest captured |
| `npm run eval:routing -- --manifest tmp/5.1/codex/base-manifest.json --dump-ranked tmp/5.1/codex/base-ranked.json --gate` | Exit 1, expected: only the old manifest/new committed fingerprint mismatch; comparison run completed |
| `npm run eval:routing -- --dump-ranked tmp/5.1/codex/head-ranked.json` | Exit 0, GATE PASS |
| `npm run eval:routing -- --gate` | Exit 0, GATE PASS |
| `node tmp/5.1/codex/compare.mjs` | Final exit 0; comparison and gate provenance assertions pass |
| `npm run typecheck` | Exit 0 |
| `npm test` | Exit 0; 168 files passed, 5 skipped; 3,733 tests passed, 3 expected fail, 5 skipped |
| `npm run build` | Exit 0 |
| `npm run eval:selftest` | Exit 0 |
| `npm run eval:qa:lint -- --stale --enforce-floors` | Exit 0; log not read |
| `npm run eval:qa:register -- --check` | Exit 0 |
| `npm run improvements:lint` | Exit 0 |
| `npm run secrets:scan -- --tree` | Exit 0 |
| `node scripts/build-catalog.mjs`; `npm run family-text:build`; `npm run spec:build`; `npm run site:globes`; `node scripts/check-mirrors.mjs`; `node ecosystem-skills/build-index.mjs`; `node eval/corpus/raven-next/research/golden/_meta/compile.mjs`; `node eval/compile-routing.mjs`; `node eval/qa/compile-qa.mjs`; `node eval/plan/build-op-classes.mjs` | Every CI generator/check exited 0, in CI order |
| `npm run improvements:index`; `npm run eval:routing:overlap`; `git diff --exit-code --quiet` | Exit 0; additional generated artifacts in sync and no tracked worktree diff |
| `node tmp/5.1/codex/surface-check.mjs` | Final exit 0; generated surfaces, served skill references and no-prose-identifier checks pass |
| `git diff --check origin/main...HEAD`; `git status --short` | No whitespace errors; only the pre-existing untracked Codex review brief |
| `gh issue view 1976 --repo Stellar-Light/stellarlight --json number,title,body,state,url,comments` | Read succeeded; evidence for finding 1 |

Scratch-helper corrections during review: the first comparison assertion included the result's `authoredAt` metadata when comparing to accepted numeric totals; corrected to compare the committed total keys. An exploratory skill check initially included the deliberately retired onboarding skill, then applied the generic name guard to all raw skill prose and hit an unrelated `submit_feedback` spelling in the existing standards companion. The final check follows the builders' retired-skill exclusion and checks the newly removed operation across every served body; normal repository guard tests and builds all passed. These exploratory helper failures were not product gate failures.

No smoke lane was required: neither `src/executor` nor `src/demo` changed. The base and HEAD routing traces are `routing-2026-11-17T14-32-13-346Z.json` and `routing-2026-11-17T14-32-23-371Z.json`; the standalone HEAD gate trace is `routing-2026-11-17T14-32-33-560Z.json`.

FAIL — reconcile the factual wording in finding 1; implementation and required gates pass.
