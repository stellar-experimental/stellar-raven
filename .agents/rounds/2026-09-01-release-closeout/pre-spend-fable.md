# Pre-spend review: release closeout paid eval brief

- Reviewer: Claude Fable 5.1, high effort (the brief names "Claude Fable 5")
- Author and orchestrator under review: Codex GPT-5.6 Sol
- Brief: `.agents/rounds/2026-09-01-release-closeout.md` (untracked at review time)
- Branch: `maintenance/free-improvements-followup` at `482226c`
- Date: 2026-09-01
- Mode: read-only. No repository file was edited. No paid call ran.

## Inputs read

- `AGENTS.md` (coordination, model routing, hard rules)
- `.agents/skills/run-evals/SKILL.md` (pre-spend plan review, pins, budget, five-track, lifecycle)
- `eval/EVALS.md` (denominator history, single-case rule, generated-file rule)
- `eval/qa/corpus/battery/protocol-core/q-protocol-bn254-poseidon-xray.json` and its diff against `main`
- `eval/qa/run-qa.mjs`, `eval/qa/judge.mjs`, `eval/qa/judge-stability.mjs`, `eval/qa/spend-budget.mjs`, `eval/lib/executable-identity.mjs`
- PR #112, #113, #114 metadata and file lists (`gh pr view`)
- Stored local results under the main checkout (read-only, for cost context)

## Verdict summary

The brief is close to launch-ready. Three defects stop it as written:

1. The brief file itself makes the runner tree dirty. The runner refuses collection on a dirty tree.
2. The brief authorizes one judge call. The harness default for a one-case run can spend three.
3. The brief names no server revision and does not say whether the paid run happens before or after merge.

Each fix is a short text or procedure change. A bounded delta re-review of the revised brief is enough after that.

## Findings

| # | Area | Severity | Finding |
| --- | --- | --- | --- |
| F1 | Stop rules / pins | Blocking | The untracked brief trips the clean-tree gate before spend. |
| F2 | Budget / stop rules | Blocking | "One judge call" contradicts the tiered judge default for one case. |
| F3 | Pins | Blocking | The server revision is unnamed and the run position relative to merge is undefined. |
| F4 | Reading rules | Medium | The brief omits three artifact checks the skill requires. |
| F5 | Pins | Low | The environment SHA-256 in the brief is an observation, not a pin. |
| F6 | Review independence | Low | The final Opus gate does not record why the matched lanes were skipped. |
| F7 | Reading rules | Low | The rubric and pack versions are not named. |
| F8 | Stop rules | Low | Repo edits during the run flip the post-collection identity check. |

Attribution, denominator, and budget amount pass. Details follow.

### F1 — The brief file makes the tree dirty (Blocking)

`git status` shows `?? .agents/rounds/2026-09-01-release-closeout.md`. The runner computes
`runnerDirty` from `git status --porcelain=v1 --untracked-files=all` and filters out only
`eval/qa/judge-stability.json` (`eval/qa/run-qa.mjs`, `collectionGitStatus` and `sourceIdentity`).
`assertCollectionSourceIdentity` then throws `QA collection requires a clean runner working tree`.
The `dev:eval` launcher also requires a clean worktree (skill, Step 2).

The brief's own stop rule says "Stop before spend after any ... clean-tree mismatch". As written,
the plan stops itself at preflight. The brief must schedule a commit of the brief before the
server launch and before the paid command. It must also say that no repository file changes
between the launch and the end of the run (see F8).

### F2 — The judge call count does not match the harness (Blocking)

The brief says the cap "includes one answering call and one judge call" and the run "must collect
and judge exactly one row". The harness default is tiered judging. It starts with one judge call
and can escalate to a three-vote panel (`selectJudgeTier` in `eval/qa/judge.mjs`).

For one selected case, `defaultMaxPanelCases(1)` returns the floor of 10. The panel cap therefore
permits escalation. The case has no usable stability history: the regenerated register shows
`comparisonCount: 0` and one prior verdict, so the boundary path applies. That one prior verdict
was `partial` with one missing fact. That is exactly the `boundary-partial` trigger. A panel
escalation is the likely outcome, not an edge case.

Two acceptable fixes exist. Pick one and write it into the brief:

- Pass `--max-panel-cases 0`. The parser accepts zero (`parseMaxPanelCases`,
  `createPanelCaseBudget`). The artifact then stamps `maxPanelCasesSource: cli-override`. This
  holds the "one judge call" authorization exactly.
- Keep the default tier and restate the authorization as "one answering call and up to three
  judge calls, within `$1.50` total".

Budget math under the second option still fits. Stored Sonnet-5 costs from the three most recent
`v2.9`/`p5` runs (203 rows, 221 judge calls):

| Call | Median | p90 | Max |
| --- | --- | --- | --- |
| Answering call (100 rows, 2026-08-30) | $0.22 | $0.41 | $0.65 |
| Judge call (221 calls) | $0.08 | $0.11 | $0.16 |

Worst case: $0.65 + 3 × $0.16 = $1.13, below `$1.50`. The cap is enforceable through the spend
ledger (`--max-budget-usd` exactly once; `BudgetExhaustedError` stops the next call). The defect is
the call-count wording, not the dollar amount. The skill requires a bounded call-count
authorization that matches what the method will do.

### F3 — Server revision unnamed; run position undefined (Blocking)

The brief says "The command will pin ... the clean server revision" but names no SHA. The skill
requires that revision pins are "asserted before spend, not reconstructed after". The runner
requires `--server-revision` as a 40-character commit that resolves locally, and it asserts the
compiled source revision against `serverInfo`.

The Scope says the round merges the stack and deploys `main`. The Review gates say Opus reviews
the completed round before merge. So the paid run happens before merge, on the branch. The brief
must say that. It must name the commit that will be running (the branch head after the brief
commit from F1). It must also state that production deployment is of the later merge commit and
is not the revision under test.

### F4 — Artifact checks are incomplete (Medium)

The brief requires only "the answering agent must report the `raven` MCP server as connected".
The skill (Step 2) requires four artifact confirmations for collection:

- `meta.agentEnvironment.isolation.safeMode: false`
- `meta.agentBinary.matches: true`
- `meta.agentEnvironment.inherited.matches: true`
- `agent.mcpServers` reports `raven` as `connected` in every row

Add the first three. Also add the five-track T4/T5 reading for the single row when
`meta.trackSchema: "qa-five-track-v1"` is stamped, and review each panel vote if a panel ran.

The phrase "The result must permit aggregates" is odd for a diagnostic single row. Rephrase it as
"the artifact is complete and comparable with `aggregatesSuppressed: false`". That is what the
harness actually checks.

### F5 — The environment SHA-256 is an observation, not a pin (Low)

The brief records environment SHA-256 `7a1b4ae2…` and says the paid shell will recompute both
values. Recomputing in the paid shell is correct per the skill. The recorded value is therefore
not a pin. It only guards drift between the identity command and the run in the same shell.

My recompute in this nested Claude Code session gives `9e90fa7f…` over 13 variable names,
including `CLAUDE_CODE_*` values that a nested session injects. The answering agent inherits
those. Add two lines to the brief: the paid shell must not be a nested Claude Code session, and
the closeout records the variable-name list (never values) from the artifact.

The binary pin holds. I verified `64590d7d…` for `/Users/kalepail/.local/bin/claude`
(real path `versions/2.1.257`) and version `2.1.257`. Both match the brief.

### F6 — Final reviewer choice is not justified (Low)

The brief assigns the completed-round review to Opus 5 high. `AGENTS.md` requires the reviewer to
match the lane and to "record the lane and effort used, and why the matched lane was skipped".
The matched lanes here are Sol (analysis, but Sol is the author) and Fable (eval taste, but Fable
already reviewed PR #114 content and this brief). Choosing Opus for fresh eyes is defensible.
The brief must say so.

Independence otherwise holds. The pre-spend reviewer (Fable) and the final reviewer (Opus) both
differ from the author and orchestrator (Codex Sol). Add the `AGENTS.md` rule that the final
reviewer writes findings to a Markdown file and replies with only the path.

### F7 — Rubric and pack versions unnamed (Low)

The brief says the rubric and evidence pack "remain unchanged" but does not name them. The current
values are `JUDGE_RUBRIC = "v2.10"` and `PACK_VERSION = "p5"`. Name them so the artifact stamps can
be checked against the brief. The historical `$0.6542763` row is correctly labeled cost context:
I confirmed it is the 2026-08-04 row for this case, `$0.4397` answer plus `$0.2146` judge, under
`v2.4`.

### F8 — Repo edits during the run break comparability (Low)

The runner re-checks the source identity after collection (`sourceIdentityGuard`). If the
orchestrator edits the ledger or any tracked file during the run, `runnerDirty` flips, the artifact
is marked non-comparable, and aggregates are suppressed. Write into the brief: no repository edits
between server launch and the end of the paid command.

## Checks that pass

### Attribution

| Change | Brief claim | Verified |
| --- | --- | --- |
| PR #112 | none | Files are `.agents/**`, `SKILL.md`, `EVALS.md`, `README.md` files. No runtime or eval code. |
| PR #113 | all QA modes must match and stamp the environment | `run-qa.mjs` requires `--expect-agent-environment-sha256` once, in every mode. `qaImplementationSha256` changes, so no tuple comparison is valid. The brief already forbids comparison. |
| PR #114 golden | only this case changes judge-facing truth | `cases.json` hunks are the header digest and lines 29560–29684, which is this case only. `sample.json` changes only `corpusContentSha256`. `lifecycle-registry.json` changes only this case's content hash. |
| PR #114 Algolia canary | no QA answer effect | `scripts/eval-algolia-raven.mjs` is the offline maintenance canary. The sd-001 case became monitor-only. No runtime path. |

The judge-facing change is real. The answer drops the CAP-0075 `U32Val`/P24 erratum sentence.
The `avoid` clause drops "silently choose the CAP's stale U32Val interface". The `notes` drop the
partial-cap caution for stale Docs quotes. Sources are pinned to commits with class A and B
evidence, `asOf` `2026-09-01`, lifecycle `active`. Removing the caution makes a `partial` or
`wrong` verdict on a stale-source quote more likely. The brief's live-verification reading rule
covers that. Keep it.

### Denominator

`--ids q-protocol-bn254-poseidon-xray` yields "active 1 of 1 selected cases · excluded
quarantined IDs: none". The case is active with `reviewState: none`. Sample membership is
unchanged. One of 500 active cases is 0.2 percent, below the 5 percent baseline-decision trigger.
The brief correctly calls the lane diagnostic and forbids replacement, variance claims, and
comparison with older tuples. Record the exact `--ids` command and the printed denominator line in
the closeout.

### Budget amount

`$1.50` covers the worst observed case with either judge option (see F2). The cap is one flag,
enforced by the ledger, and a missing reported cost invalidates the method. This matches the
skill.

### Stop rules

Identity, surface, revision, clean-tree, incomplete row, missing cost, provider safeguard, harness
failure, single run, and no repair rerun are all present. They match the skill's "one method run
per authorization" rule. F1 and F8 are the gaps.

### Reading rules

Single row, no noise floor, no tuple comparison, live verification of `wrong` or `partial`,
`improvements/` for upstream gaps, `.agents/TODO.md` for own-repo defects. All correct. F4 lists
the missing artifact checks.

## Not verified

- The production evidence section (Wrangler versions, Ray IDs, CSP fingerprint). I ran no
  Wrangler or HTTP query. Note that the recorded deployment predates PR #99 and PRs #100–#111, so
  deploying `main` ships more than this round's three PRs. That is outside this eval review.
- The live MCP surface SHA-256. It is computed at launch by `eval/report-live-surface.mjs`.

## Required changes before spend

1. Commit the brief. State the commit and the exact server revision SHA in the brief.
2. State that the paid run happens before merge on that SHA, and that deployment is of the later
   merge commit.
3. Pick the judge option in F2 and write the matching call-count authorization.
4. Add the artifact checks from F4 and the rubric and pack names from F7.
5. Add the no-nested-session and no-repo-edits rules from F5 and F8.
6. Record why Opus is the final reviewer and require a Markdown findings file.

After these changes, request a bounded delta re-review of the changed lines only.

## Result

BLOCKED
