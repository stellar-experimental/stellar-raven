CHANGES-NEEDED

Review basis: `704d84aeb2228dfa372200ede546e246df8ca244`, against base `6891dca23a2e1baab44916a6cd8524006f0e9267`.
I made no paid call, started no server, and changed no plan.
The findings below block launch, except the P3 finding.

1. **P1 — Separate PASS verdicts do not establish the combined change's safety.**

   Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/plan-section-guard.md:45` and `:55`.
   The plan assumes that the text can only reduce misreads reaching the guard.
   The experiment does not establish this assumption.
   The text can change section selection, script composition, call order, and recovery behavior.
   Fewer exceptions can still discard more useful results when each script contains more service calls.
   Thus, guard-only harm does not bound combined harm.
   Merging T first also changes the baseline against which G will ship.
   A later recount does not resolve this missing evidence before merge.

   Fix: remove the claimed bound and require a measured combined arm before the second merge.
   One option measures A against T, then T against T+G under a separate bounded authorization.
   Another option adds T+G to the reviewed design, with explicit comparisons, costs, and decision rules.

2. **P1 — The section completeness rule permits PASS despite missing answer-quality evidence.**

   Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/plan-section-guard.md:171`, `:179`, and `:184`.
   The text plan inherits these rules at `plan-section-text.md:85`.
   Sixteen rows, comparability, and unsuppressed aggregates do not require sixteen valid grades.
   `eval/lib/harness-guards.mjs:173` counts an `error` verdict as a judged row.
   Its aggregate check at `:185` accepts that row.
   An offline reproduction returned `aggregatesAllowed: true` for sixteen rows with one `error` verdict.
   The plans exclude T4/T5 grades, then require two grades per arm to detect a consistent regression.
   A candidate-only judge failure can therefore remove a harmful row from the regression check while PASS remains possible.
   The confirmation retry cannot repair this omission because the row never enters the consistent-change list.

   Fix: define valid-grade coverage before the regression rules.
   Require all four comparison grades per selected row, or assign INDETERMINATE when required grades are absent.
   Preserve agent-limit failures as T1 failures; do not exclude them with T4/T5.
   Any repair collection or initial-judge retry needs an explicit, bounded authorization.

3. **P2 — The text plan excludes rows that the changed description already exposes.**

   Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/plan-section-text.md:36`, `:59`, and `:88`.
   Line 36 correctly states that every row sees the changed `execute` description.
   Lines 59–61 nevertheless make grade differences monitor-only when no section-read script appears.
   Section-read occurrence follows the treatment; it cannot establish whether the model saw that treatment.
   For example, the text can cause a model to avoid a useful section read and produce a worse answer.
   The current rule excludes that exact regression.

   Fix: keep all sixteen rows in the text answer-regression check, regardless of section-read occurrence.
   Use section-read counts only for the mechanism analysis.
   Review routing and read avoidance when section-read exposure differs between arms.

4. **P2 — The text verdict has no rule for a zero section-read denominator.**

   Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/plan-section-text.md:76` and `:89`.
   The plan defines `r = M / S`, but it does not require positive S in T.
   The changed guidance can produce no section reads in both T collections.
   Then `r in T` is undefined, even when A has four misreads and every collection otherwise completes.
   Treating that result as zero would reward avoidance without measuring correct section use.

   Fix: predeclare zero-S handling as INDETERMINATE for the misread-rate claim.
   Report read avoidance separately and retain every row in the answer-regression check.

5. **P2 — The counter can misclassify the primary metric and hide section-read exposure.**

   Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/count-patterns.mjs:60`, `:74`, and `:85`.
   `stripStrings` removes quoted property names, while the required-field matcher ignores object depth.
   I reproduced these results using three offline fixture scripts:

   | Script | Counter result | Correct interpretation |
   | --- | --- | --- |
   | `stellarDocs.search_docs({"query":"trustline"})` | Missing `query` | Required field exists |
   | `stellarDocs.search_docs({filter:{query:"trustline"}})` | Required field present | Required top-level field is absent |
   | `codemode.skill.read("skills.stellar-dev.assets", {"sections":["trustlines"]})` | Zero section-read scripts | One section-read script |

   The historical totals match, but that does not validate the counter for newly generated scripts.
   The plans use its S count to select scripts for inspection and classify unexposed rows.
   Human review of only the listed scripts misses the third example.

   Fix: use a JavaScript parser for literal property keys and object depth.
   Mark unresolved calls as unknown and inspect them before assigning exposure or computing rates.
   Alternatively, require readers to inspect every execute script and replace the helper counts with reconciled counts.

6. **P2 — The section cost estimate silently pools different judge contracts.**

   Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/plan-section-guard.md:261` and `:270`.
   The four answer-style totals and four paired totals reproduce correctly.
   However, the stated source table does not reproduce the sixteen-row estimate.
   I reproduced `$6.386139` and `$9.1185678` only after adding two unlisted tool-surface runs:

   - `2026-10-07-tool-surface-qa/2026-10-07T23-25-14-variantA.json`
   - `2026-10-07-tool-surface-qa/2026-10-08T02-40-37-variantA.json`

   Both runs use rubric `v2.10`, while the plan declares `v2.11`.
   This pool also reproduces the `$0.0956242` judge median, `$0.4442642` maximum, and five rows without judged history.
   The quoted estimate therefore depends on an undisclosed contract mismatch.
   The run-evals skill requires matching cost contracts and explicit source evidence.

   Fix: list the exact source artifacts and separate the rubric groups.
   Recompute the primary estimate from the matching contract.
   Label older-contract costs as supplementary estimates, including their limits.
   Recheck the reserve if the launch amendment changes the judge pack or tier policy.

7. **P2 — The Playground collection commands do not assert the frozen environment hash.**

   Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/plan-clip-marker.md:234`, `:246`, and `:275`.
   The plan computes `AGENT_ENVIRONMENT_SHA256`, then uses it only for directed re-judging.
   `judge-pin.mjs` checks the executable, PATH resolution, and updater flag; it does not compare the environment hash.
   The Playground runner records its judge executable at `scripts/run-playground-semantic-eval.mjs:744`.
   It accepts no expected environment hash and does not enforce that frozen value during collection.
   Thus, changed Claude settings can affect a judged collection before the later re-judge notices the mismatch.

   Fix: assert the frozen environment hash before every judged Playground command, including replacement commands.
   Use the same assertion for re-judges and preserve the original expected value after a failure.
   Record the check in each command's launch receipt.

8. **P3 — The shared commands invoke a helper absent from the pinned runner.**

   Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/plan-section-guard.md:306`, `:313`, and `:368`.
   The runner uses A, but `count-patterns.mjs` first appears after A.
   `git cat-file -e 6891dca2:.agents/rounds/2026-10-12-call-pattern-triage/count-patterns.mjs` fails.
   The stated command therefore fails after a paid collection.

   Fix: invoke an absolute, pinned helper path outside the runner worktree.
   Record its hash before collection, as with the clip plan's `COUNT` path.
   Do not copy the helper into the clean runner and invalidate its revision checks.

Verification results:

- I read the run-evals launch gate, EVALS guide, QA contract, and paired launch requirements.
- I checked the 2026-10-12 shared-toolchain and lost-listener amendment.
  These plans do not invoke the paired supervisor or modify its signed launch.
  Their separate sixteen-row screen correctly avoids `eval:qa:paired`, which requires at least 100 eligible IDs.
- I re-derived every candidate tree with `git merge-tree` onto `6891dca2`.
  I used temporary Git objects outside the repository and changed no branch.

  | Arm | Re-derived tree | Result |
  | --- | --- | --- |
  | A / BASE | `ab4c63e3de9e85b479dea657169d2ff5a8ed9387` | Match |
  | Clip | `db523f8055fc4b9060bcb51727fdb478475b2a9a` | Match |
  | G | `28a6411854bc93fca8e6a1b1c290028b31ed9cda` | Match |
  | T | `e74d9afdc4604975df233286b9d2fe77944b9e05` | Match |

- Each arm's changed-file list matches its plan.
- The sixteen section IDs match corpus order and have confirmed truth status at A.
- Stored MCP results since 2026-10-07 contain no `q-soroban-storage-types` row.
  `q-asset-trustline-basics` reads sections in five cited runs.
  Its four answer-style grades are `correct`; their scripts preserve the section data.
- The counter reproduces 1,891 MCP docs calls, zero omissions, and 199 section-read scripts across eight cited runs.
  It reproduces 28 Playground docs calls, six omissions, and six invalid-argument entries.
- Playground method costs range from `$0.7557626` to `$0.8493131`; the median is `$0.81888265`.
  Answer costs range from `$0.0371102` to `$0.0816868`; the median is `$0.0543927`.
  Judge costs range from `$0.0546364` to `$0.1073384`; the median is `$0.0737694`.
- Answer-style collection costs range from `$11.6398508` to `$12.0836566`; the median is `$11.752485`.
  Paired collection costs range from `$35.9055856` to `$37.2913486`; the median is `$36.2396406`.
  Directed re-judge costs are `$0.3283216` and `$0.3603036`; the median is `$0.3443126`.
  The plan's `$0.345` median uses rounded inputs; use `$0.3443` when reporting four decimal places.
- The total caps add correctly: `$20`, `$86`, and `$60` for the one-change fallback.
  Paid command templates each contain one `--max-budget-usd`.
  Replacement collections and confirmation retries each have separate conditional allocations.
- The ordinary collection and directed re-judge flags match the current parsers.
  A Playground re-judge dry run passed against A with matching case and judge identities.
  Re-judging writes a separate artifact; retry instructions should identify the original source and the new retry output explicitly.
- The plans treat within-arm disagreements as variance evidence, not significance thresholds.
  Two repetitions provide a diagnostic screen; they do not prove equivalence or a statistical upper bound on harm.

Re-review the revised design and decision rules before paid launch.
