# Temporary artifact audit — 2026-08-27

## Scope

Review surviving repository-related text records under `/tmp` from 2026-08-20 through 2026-08-27.
Compare each unique record with current Git, GitHub, `ideas/`, `.agents/`, `research/`, and the
golden corpus. Route current work into durable repository records.

The audit excludes implementation and configuration formats. It also excludes unrelated projects,
secret values, and temporary copies that match current repository files byte for byte.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| complete inventory and canonical-state comparison | Codex (`gpt-5.6-sol`, high) | `w3:p22` | temporary report only | complete |
| adversarial gap review | Grok 4.6 (high) | `w3:p23` | temporary report only | complete |
| reconciliation and durable repair | Codex orchestrator | `w3:p1J` | repository records and GitHub review state | in progress |

Sol handled the large inventory because it required dense repository analysis. Grok supplied an
independent vendor-diverse assumption review. Neither reviewer edited the repository.

## Ledger

- `2026-08-27T23:42Z` — `git status --short --branch` returned
  `## main...origin/main`. `git rev-parse HEAD` returned
  `51afc4122fe5970771e211861709c385d1316b76`. Git had one local branch, one worktree, no stash,
  and no remote branch except `main`.
- `2026-08-27T23:42Z` — the inventory lane classified 4,515 repository-related artifact
  instances. It found 4,475 duplicate scratch instances, 16 obsolete scratch variants, 11
  duplicate gate logs, one obsolete session log, and 12 top-level Markdown records.
- `2026-08-27T23:42Z` — both reviewers independently identified the expired golden-truth pack,
  12 unresolved Lane 3 questions, untracked issue #67, stale QA ledger state, and the missing idea
  index entry. Both also found two unresolved PR #81 review threads.
- `2026-08-27T23:42Z` — `rg -l 'conversions-copy-review\.md' eval/qa/corpus | wc -l` returned
  `69`. `rg -l '/tmp/raven-qadeep/gt2/review-b[45]-part[123]\.md' eval/qa/corpus | wc -l`
  returned `27`. The audit routed both dead provenance groups into `.agents/TODO.md`; it did not
  perform an unreviewed truth-metadata replacement.
- `2026-08-27T23:42Z` — `node eval/qa/lint-corpus.mjs` reported 372 long-fact warnings across 204
  cases, 47 sourcing-guard warnings, and 56 corroboration warnings. These counts match the durable
  session-2 record.
- `2026-08-27T23:42Z` — GitHub showed no open pull request. Issues #39, #40, and #67 remain open.
  PR #82 has three late unresolved documentation comments. PR #81 has two repaired but unresolved
  review threads. PR #83 contains the PR #81 repairs.
- `2026-08-27T23:42Z` — durable repairs added a self-contained golden-truth session-3 handoff,
  the issue #67 drift task, issue #39 production verification, and completion conditions for
  judge metadata and the Grok control model. The source-delivery idea now records all 12
  non-binding recommendations and keeps its spike unapproved.

## Artifact disposition

- PR #81 and PR #83 temporary reviews are complete, duplicated, or obsolete. PR #83 preserves the
  final zero-finding reviews and repairs.
- PR #82 item-8 evidence remains canonical under
  `eval/qa/reviewed/2026-08-26-connectors-item8/`. Its late documentation comments are repaired in
  this round.
- Connector A/B temporary reports are historical receipts. The round ledger preserves every
  material verdict and the rejected candidate remains closed.
- The cleanup inventory is obsolete. Current Git has no related worktree, branch, or stash.
- Lane 3 remains a product idea. The temporary package supplied recommendations only.
- The session-2 temporary helper pack expired. `program-log.md` preserves its method and outcomes.
- The Directory submission remains external owner work. Its expired live extract must be rebuilt
  only when authorized portal work resumes.

## Outcome

The surviving temporary records contain no unmerged implementation. Every current action now has
one durable home in `.agents/TODO.md`, an active round ledger, or `ideas/`.

The next own-repository blocks are the golden-truth session-3 burn-down, dead provenance repair,
live drift issue #67, issue #39 production verification, judge stability verification, and the
same-100 benchmark. The owner must decide the two optional lint classes and all 12 Lane 3 questions.

Issue #40 remains a product decision inside the durable-session idea. The Connectors Directory
submission remains external owner work in its existing ledger. Neither has implementation
authorization.

Final independent review, repository gates, GitHub thread resolution, merge, and branch cleanup
remain required before this round closes.

## Correction and independent-review reconciliation — 2026-08-27

The first provenance count covered two clusters only. The full `rg -l '/tmp/' eval/qa/corpus`
check finds 97 references across 94 files. The extra file cites
`/tmp/raven-qadeep/review-judge.md`; its durable archive is
`research/qa-deep-dive-2026-08-25/review-judge.md`.

The next own-repository blocks are the golden-truth session-3 burn-down, dead provenance repair,
judge stability verification, and the same-100 benchmark. Issue #67 and its dependent issue #39
check await separate owner authorization.

The first Grok high review returned `CHANGES-REQUESTED`. It found stale handoff text, one missing
benchmark done condition, one missing audit link, and the incomplete temporary-path count. Those
findings now have repairs or explicit corrections.

The reviewer requested a durable pointer to closed PR #43. The orchestrator declined that request.
The old audit is stale and explicitly lacks legal-clearance authority. Current
`THIRD-PARTY-NOTICES.md` remains the canonical present-state record.

The issue #67 Docs-title and issue #39 `openapi@1.8.83` claims are supported by their GitHub issue
comments. The TODO records both facts without authorizing implementation or deployment.

## Final verification — 2026-08-28

The second independent Grok 4.6 high review returned `PASS` on both Standards and Spec. It
recounted all temporary corpus paths and rechecked issues #67 and #39, including comments.

- `git diff --check` and `git diff --cached --check` returned no error.
- `node eval/qa/lint-corpus.mjs` returned 0 errors and 475 known warnings.
- `npm run typecheck` returned no diagnostic.
- `npm test` passed 89 files and 1,365 tests.
- `npm run build` completed its Wrangler dry run.
- `npm run secrets:scan -- --tree` returned `secret-scan: clean (+ gitleaks)`.

The documentation and review repairs are ready to merge. GitHub thread resolution and local branch
cleanup follow the merge.

## Final lane status — 2026-08-28

The Lanes table records the reconciliation lane before final verification. That lane completed in
PR #84, merged as `6fec2fb75b0e5dd8efa2e9d972fa9a37b7fdcf6f`. All three lanes are complete,
and this round is closed.
