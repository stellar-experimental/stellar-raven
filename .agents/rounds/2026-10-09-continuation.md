# 2026-10-09 continuation round

## Scope

The owner asked to do all remaining worthwhile work, merge it, and leave the repository clean.

In: every TODO item that needs no new paid authorization and no owner decision.

Out:

- Owner decision A (the paired run). The owner signs the plan hash and runs it on a weekend UTC day.
- Paid QA rounds: "Count skill-read shape errors…", the answer-style measurement, and the `ai`
  upgrade measurement.
- Items that wait on upstream: PR #2837, the vitest pool, `agents`, and codemode 0.5.3. A
  2026-10-09 check found no change: pool 0.23.0 still pins `wrangler` 4.124.0, `agents` 0.28.0 is
  the latest, codemode 0.5.3 is the latest, and PR #2837 is open at `0c20e720`.
- Monitor items with no fired trigger.

## Lanes

Each lane works in its own worktree and branch. Codex lanes cannot commit; the orchestrator commits.
Reviewers come from a different model family than the author.

| Lane | TODO item | Author | Reviewer |
|---|---|---|---|
| R2 | "Preserve structured routing intent…", step 2 | Codex frontier `gpt-6-astra` xhigh | Claude Fable high |
| E | "Diagnose stable-row evidence omissions…" and "Investigate missing source evidence in the p6 judge pack" | Codex frontier `gpt-6-astra` high | Claude Fable high |
| H | "Label skipped-panel uncertainty in flip reports" and "Measure planning text in saved final answers" | Codex workhorse `gpt-6.1-sol` high | Claude Fable high |
| U | "Decide whether Scout's hackathon store gaps…" and "Decide whether Scout's strict repo-search label…" | Claude Fable high | Codex workhorse `gpt-6.1-sol` high |
| P | "Extend Playground eval accounting to native and no-plugin model paths" | Codex frontier `gpt-6-astra` high | Claude Fable high |

The orchestrator is Claude Opus, so it reviews nothing.

## Ledger

- Lanes started 2026-10-09. Worktrees `/Users/kalepail/Desktop/raven-{r2,e,h,u,p}` on branches
  `r1009d/{r2,e,h,u,p}`, from `main` at `ef3843e3`. Panes: R2 `w3W:p33`, E `w3W:p34`, H `w3W:p35`,
  U `w3W:p36`, P `w3W:p37`. Each lane has a placeholder `.dev.vars` and generated types.
- The R2 worktree holds the extracted step 1 archive under `tmp/`.
- Lane E asked where the 2026-10-01 artifact is. The orchestrator searched the results folder, the
  local archives, and the disk. No copy exists, so the orchestrator told the lane to proceed without it.
- Each lane got one independent review, then a fix round and a delta review where needed:
  - U: three text findings (a count label, an absence claim, and sentence length). Fixed; delta
    approve.
  - P: approve with two P3 findings (lost upstream error detail, raw `SyntaxError`). Fixed; delta
    approve. The orchestrator split one README sentence.
  - E: approve after changes. Main finding: judge-quoted text could count as support. An
    answer-presence gate fixes it. A punctuation note was also fixed, with the predicted effect.
  - H: approve after changes. The re-judge role names inverted in a paired round, the cue list
    missed preambles, and one label was inconsistent. All fixed; delta approve. The orchestrator
    chose consistency for the disputed label. The optional synthetic-paragraph note stays a README
    limit.
  - R2: the reviewer agrees with the rejection. It adds the sub-change split and the selector
    analysis now in the TODO.
- Full local test runs failed only on load timeouts (load average about 107 with five lanes). Each
  failed file passed alone. CI passed on every PR.
- PR #255 changes `src/demo`. Deployed as version `0d36cc09-4c33-4894-af91-3203b4a8ab18`. Both
  hosts return 200 on `/` and 401 with the Bearer challenge on unauthenticated `POST /mcp`.
- PR #256 changes the `re-judge.mjs` (`7b293cbe…`) and `paired-verdict.mjs` (`025168fa…`)
  implementation hashes. Owner decision A now says to assemble the plan again.

## Outcome

- **Lane U, merged.** [#254](https://github.com/stellar-experimental/stellar-raven/pull/254)
  (`8eb8c396`). New verified findings `sls-092` (Blend first place stored under a later event) and
  `sls-093` (repo search labels a spelling correction `strict`). Nothing posted upstream.
- **Lane P, merged and deployed.** [#255](https://github.com/stellar-experimental/stellar-raven/pull/255)
  (`ff5be052`), version `0d36cc09`. Native and no-plugin Playground calls now settle costs. Live
  model availability and live Gateway costs stay unverified.
- **Lane H, merged.** [#256](https://github.com/stellar-experimental/stellar-raven/pull/256)
  (`8c95ff4d`). Flip reports name skipped panels; the planning-text screen matches 32 of 2,765
  stored answers (sample: 19 planning, 0 false positives, 1 uncertain).
- **Lane E, merged.** [#257](https://github.com/stellar-experimental/stellar-raven/pull/257)
  (`7697d424`). The stable-row diagnostic is read-only. The pack analysis is in
  [pack-omission/](2026-10-09-continuation/pack-omission/); its repair moves to the TODO item
  "Repair claim-support selection in the p6 judge pack".
- **Lane R2, rejected.** No code change. Report, patch, step 2 acceptance files, traces, and review
  are in [routing-step2/](2026-10-09-continuation/routing-step2/). The next attempt waits on owner
  decision B.
- Full lane evidence (briefs, reports, reviews, runs, and raw Scout captures) is in the ignored local
  archive `eval/results/2026-10-09-continuation-lanes-evidence.tar.gz`.
- Every pane and worktree that this round opened is closed or removed.
