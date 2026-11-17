# Item 6.3: Fable review 2, the re-test rule

Reviewer: Claude Fable 5.2 (`claude-fable-5-2`), 2026-11-17, for the 6.3 lead (`t1w3`). Reviewed the
section "Re-test: second measurement" of [PLAN.md](PLAN.md) (working tree, lines 368 to 458) on
`473801af`. No model-calling run, no paid call, no network call, no subagent. No QA case, QA result or
reviewed file opened; no holdout or discovery case opened; the QA lint and `run-routing.mjs` were not
run. I wrote only this file.

Disclosures:

- To answer check 4 I read the source that `runAgent` calls: `eval/qa/agent-result.mjs` (the
  transcript parser) and `eval/lib/harness-guards.mjs` (the isolation flags).
- One scoped `git grep -n answeringAgentIsolationArgs` printed two source lines (an import and a call)
  of a script under `eval/discovery/`. The pattern is a function name and the lines hold no case text.
  I did not open the file.
- I read result 1's scratch answers (`tmp/6.3/answers-*.jsonl`) with a script that printed per-run
  counts only (turns, `execute` calls, `rwaCalled`).

## Summary

The rule has the right structure and reads the orchestrator's sentence faithfully. Two things must
change before the pre-registration commit:

- The attribution judgement decides the outcome more often than the plan implies, and its clause (b)
  has no checkable definition (finding 1).
- The harness capture as specified loses evidence that cannot be collected again (finding 2).

One scope question should go to the orchestrator before the commit: D3 (finding 3). The rest are
should-fix items that are cheap now and impossible after the run.

## Findings

### 1. Blocking: the attribution judgement decides the outcome, and clause (b) is not checkable

Evidence: PLAN.md:419-427, 434-435; RESULTS.md:71, 112-117.

- The "majority of samples" half filters little noise. If an answer is `partial` with probability 0.5
  on both arms (the rate that gives 6.2's 5 of 10 flips), INCLUDED is worse in a pair with probability
  0.25, and in at least 2 of 3 pairs with probability 0.16 per question.
- In result 1 the registry was called on C1, C2 and C3 and on no N question. Over three such
  questions the chance that at least one reaches two candidate pairs by noise alone is about 0.40.
  At a `partial` rate of 0.2 it is 0.07 per question and 0.19 over three.
- So in a large share of runs where inclusion changes nothing, `involvesRegistry` alone decides
  include or exclude. It is one judgement, by one judge that sees only the arm under test.
- Clause (a), "a claim taken from the registry result", can be checked. Clause (b), "registry content
  that stands in place of what the question asked", cannot: any answer that shows registry rows and
  omits something fits it.
- Selecting only candidate pairs tells the attribution judge that each item it sees was graded worse
  than its pair.

Fix:

- Make every `true` carry two quotes: the deficient passage from the answer, and the result text it
  came from. `attribute.mjs --score` checks that each quote is a substring (whitespace-normalised) of
  the answer and of the captured result text. A `true` without both is an invalid verdict (finding 12).
- Define (b) operationally: `true` only when the deficiency is an omission or off-question content
  **and** the answer gives registry rows in the place where the missing content belongs (quoted as
  above). An omission where the answer shows no registry content in that part is `false`.
- State in the plan how the definition reads result 1, as a calibration, not as a rubric example:
  C3 is `false` (a misstated documentation list, no registry quote exists); D3 is `true` under (b)
  (registry rows given for "notable launches", the year-in-review launches missing). Keep C3 out of the
  attribution rubric, because C3 is re-sampled.
- Run attribution on every INCLUDED answer that has `rwaCalled` and a deficiency, not only on
  candidates. The packet does not say which items are candidates; the score uses only the candidates.
  This hides the stake and gives the judge's base rate. Result 1 suggests about nine such answers at
  most.
- The attribution rubric holds none of: "arm", "included", "excluded", "candidate", or what `true`
  leads to.
- Report per question the candidate pairs with `involvesRegistry: false`. A pure crowd-out (the run
  spends its one `execute` on the registry and omits documentation, with no registry content in the
  answer) is not counted. That follows the orchestrator's sentence, and the reader should see the
  count.

### 2. Blocking: the capture loses evidence that cannot be collected again

Evidence: PLAN.md:405-407, 422-423; `ab-run.mjs`:35, 73, 162; `eval/qa/agent-result.mjs`:542-548;
`eval/qa/run-qa.mjs`:852-853; `src/executor/run.ts`:546-580; `src/policy/truncate.ts`:18;
`src/policy/source-basis.ts`:335-349; `src/mcp/tools.ts`:185.

Yes, `ab-run.mjs` can capture it: `runAgent` returns each `execute` result whole as
`transcript[i].result`, the exact text the model saw. Four limits follow from what that text is.

- **Nothing else keeps it.** `ab-run.mjs`:162 reduces the transcript to summaries. What the re-test
  does not write is gone, and the plan allows no second sample.
- **There is no separable "registry result text".** The result is the script's return value, cut at
  6,000 tokens, plus a host footer. In result 1 all six INCLUDED runs that called the registry made
  exactly one `execute` (C1, C2, C3, D1, D3, D4). That one result mixes registry rows with every
  other source. The attribution judge needs the script to tell which keys came from the registry.
- **Artifact follow-ups are skipped.** A script that returns the registry response whole (about
  117 KB, PLAN.md:326) is truncated and gets an artifact. The next `execute` reads it with
  `codemode.artifact.read(id)` and does not name `scout.getRwaAssets`, so "a call naming
  `scout.getRwaAssets`" misses the rows the answer may have used.
- **`rwaCalled` is static text.** The regex is true for a call that errored or never ran, and false
  for a runnable skill that calls the registry (`codemode.skill.run`). The host footer line
  `calls: scout.getRwaAssets=ok/<ms>` is the record that the call ran.

Fix:

- For every run on both arms, with no branch on the arm, write
  `tmp/6.3/rt/exec-<arm>-<key>-<sample>.json`: every `execute` entry of the final attempt as
  `{ index, code, result, isError, resultChars, namesRwa, footerCalls }`.
- `attribute.mjs` gives the judge the code and result of every `execute` from the first one that
  names or ran the registry onward, labelled as tool output, not as "registry text".
- Record `rwaRan` (the footer lists `scout.getRwaAssets=ok`) beside `rwaCalled`. Make the re-test's
  call condition `rwaCalled || rwaRan`, and report any run where the two differ.

### 3. Should-fix, decide before the commit: D3 is carried on one sample that went against it

Evidence: RESULTS.md:74, 121-122; REPORT.md:14; PLAN.md:384-385, 439.

- Carrying D1, D2 and D4 is acceptable: the orchestrator made the registry questions conditional on
  about 40 answers, and D1 plus D4 would make 48.
- D3 is different. In result 1 its INCLUDED answer was `partial` against `correct`, the run called the
  registry, used 4 turns against 6, and the judge's reason was that it gave registry rows and missed
  the launches in the reference page. That is the pattern clause (b) names.
- Result 1's D clause counts bad answers only, so it "held". REPORT.md told the orchestrator "no loss
  on the displacement or registry questions" and did not mention this pair.
- An include outcome would then rest on a displacement class whose only sample showed the pattern,
  untested.

Fix: put it to the orchestrator before the commit, with both options.

- Add D3 at 3 samples per arm with the attributable-drop clause applied to it: 42 planned answers,
  under the cap of 45 with three retries of headroom, and "about 40".
- Or keep the scope, and say in the rule and in RESULTS-2 that the D clauses are single-sample passes
  carried over and that D3's sample fits the new definition.

### 4. Should-fix: resume, sample identity and the 45-run cap are not enforceable as written

Evidence: `ab-run.mjs`:102-110, 127, 133-156; PLAN.md:386, 400, 405.

- `--from` assumes one record per key. After round 1, `--from C3` throws "--out already holds C3".
- The loop has a cost cap and no attempt counter. 36 runs with one retry each can reach 72 attempts.
- Nothing says a failed sample stays missing instead of pairing with another sample.

Fix:

- Record identity is `(key, sample)`. Iteration is round-major. Resume is `--from <sample>:<key>`.
- Add `--max-attempts`, checked before every attempt beside the cost cap: 22 per arm (44 in all), or
  the INCLUDED arm gets what the EXCLUDED arm left of 45.
- An unanswered `(key, sample)` is a missing pair. Samples are never re-paired.
- Add `--dry-run` that prints the planned order, so a check needs no agent call.

### 5. Should-fix: with exactly two complete pairs, one trigger should be inconclusive

Evidence: PLAN.md:440-441.

With two complete pairs the plan needs both to trigger. A question with one trigger and one missing
pair is then scored as passing, although the missing pair would have decided it.

Fix: per question and per clause with two complete pairs: two triggers fire the clause, zero do not,
exactly one makes the outcome inconclusive.

### 6. Should-fix: the bad-loss clause can exclude on noise for N3

Evidence: PLAN.md:433; RESULTS.md:78.

- At a low bad-answer rate the clause is safe: at 5 percent, two losses in three pairs has
  probability 0.007 per question.
- N3 is not low: one of its two result-1 answers was bad (the EXCLUDED one, fabrication), with no
  registry call on either arm. At a bad rate of 0.4 to 0.5 on both arms, two losses in three pairs has
  probability about 0.15.

Fix: net it, as clause 3 does for D1 and D4 (PLAN.md:192): INCLUDED bad losses minus wins is at least
2. Or keep the clause and name this risk in the section.

### 7. Should-fix: `deficiency` must be a list that stands alone

Evidence: PLAN.md:410-411, 423-424; RESULTS.md:71.

- Result 1's C3 reason had two parts (a misstated list, thin legal guidance). The plan does not say
  what `involvesRegistry` means when one part involves the registry and another does not.
- A deficiency written as a comparison ("unlike Y") leaks the other answer to the attribution judge.

Fix:

- Rubric: `deficiencies` is a list, most important first. Each item names one claim or omission and
  refers to neither the other answer nor to X or Y.
- Attribution is per item. The answer's `involvesRegistry` is true when any item is true. That matches
  "the stated reason involves", and it errs toward exclude.
- `attribute.mjs` refuses an item that matches `\b[XY]\b`.
- Also require the off-topic content to be named when `offTopic` is true, for the report.

### 8. Should-fix: state the reading of the orchestrator's sentence, and report the other one

Evidence: PLAN.md:375-376, 433-437.

- The plan needs the registry reason in each of at least two worse pairs. The sentence also allows
  "worse in a majority, and the reason involves the registry at least once". The plan's reading is
  harder to trigger. It is stated, which is good, but the other count is not reported.
- The clauses do not add across each other. A question with one bad loss and one attributed drop, or
  with INCLUDED worse in all three pairs for mixed reasons, passes.

Fix: say in the rule that clauses do not add. In RESULTS-2, report per question the pairs where
INCLUDED is worse for any reason and the count under the other reading, and flag any question with two
or more worse pairs that triggered no clause.

### 9. Should-fix: name the non-blind step as a deviation

Evidence: PLAN.md:419-427; 6-COMMON "Judging answers: grade blind, with the arm hidden"; the
orchestrator's "the same blind judging" (PLAN.md:376).

The grades stay blind. The attribution judge does not grade, but its output decides a clause and it
sees one arm by construction. Say so in the section, and list it in the report as a deviation for the
orchestrator to accept.

### 10. Should-fix: balance X and Y within each question

Evidence: `blind.mjs`:100-108; PLAN.md:408-409.

The split is balanced over the packet only. The rule is per question, so a question whose three
INCLUDED answers all land on X carries any position effect whole.

Fix: within each question the split is 2 and 1; three questions each way give 9 and 9.

Accepted limit, to state in RESULTS-2: the judge sees each question three times, so it can group
registry-flavoured answers more easily than in result 1.

### 11. Should-fix: a fresh agent directory per run

Evidence: `ab-run.mjs`:118; `eval/lib/harness-guards.mjs`:68-78.

One `mkdtempSync` directory serves a whole harness process. Result 1 never asked a question twice in
it; the re-test asks each one three times. The isolation flags are `--setting-sources ""` and
`--disable-slash-commands`. I did not verify that the CLI keeps nothing per directory between runs.

Fix: a new `mkdtempSync` directory for every attempt. It removes the question at no cost.

### 12. Should-fix: pre-register what happens when a judge's output is incomplete

Evidence: `blind.mjs`:173-189; PLAN.md:441-442, "No re-judge" at PLAN.md:305.

Fix:

- Re-test validation requires `deficiencies` whenever the grade is not `correct` or `fabrication` is
  true, and refuses the file otherwise.
- On a refusal the executor may ask the same judge session once to complete missing fields. `--score`
  compares every grade with a hash taken at the first write, so no grade can change.
- An attribution verdict that is missing or invalid after one correction makes the outcome
  inconclusive. Neither `true` nor `false` is a default.

### 13. Should-fix: what the selftests must cover

`blind.mjs --retest --selftest`:

- 18 pairs from six keys and three samples; a D key in the answers is never packed; a missing or
  unanswered sample makes that pair missing and shifts no other pair.
- 9 and 9 overall, 2 and 1 within each question; unique opaque ids.
- The packet entry shape is exactly `X, Y, id, question, referenceUrls`. Outside answer text it holds
  none of: `sample`, the key, the class, `excluded`, `included`, `arm`, `getRwaAssets`, `rt/`,
  `exec-`, cost, timestamps, model names. No registry URL in `resultUrls` on either arm.
- Each clause at its threshold: one trigger of three passes, two fail, three fail.
- Candidates need a strict order of `s` and a registry call: partial under correct, bad under
  partial, bad under correct are candidates; equal grades and INCLUDED better are not.
- Two candidates with one `true` and one `false` pass. Triggers on two different questions do not
  add. One bad loss plus one attributed drop on one question pass (finding 8).
- Inconclusive: one complete pair; two complete pairs with exactly one trigger. Failed clauses are
  still listed.
- The D clauses are recomputed from the committed `verdicts.json`, not hard-coded as held.
- Zero candidates gives a final outcome through the same code path, with no judge session.
- The result-1 selftest (20 rule cases, 3 refusals) still passes unchanged.

`attribute.mjs --selftest`:

- The scored set is exactly the candidate pairs; the packed set is the wider one of finding 1.
- A packet item holds the question, the INCLUDED answer, its deficiency items, and the `execute` code
  and results. It holds no EXCLUDED answer or deficiency, no grade field, no pair `reason` line, and
  none of the strings listed above.
- A packed run with no capture file is a hard error, never "none".
- One verdict per id; unknown and duplicate ids refused; `involvesRegistry` is a boolean; both quotes
  verify for a `true`; an item naming X or Y is refused.
- Packing twice is refused, as `blind.mjs`:331 does.
- The final outcome for every combination above, including inconclusive on an invalid verdict.

`ab-run.mjs` (it has no selftest): `--dry-run` order; unknown keys and bad sample counts refused;
duplicate `(key, sample)` refused; resume position; the attempt cap; one capture file per run;
defaults give result 1's ten-question order.

### 14. Should-fix: the follow-ups

Evidence: PLAN.md:254-259, 327-328, 447-458; REPORT.md:21-22; `.agents/TODO.md`:679-682.

- **#2296, either way.** Step 6a defines no #167 comment, so on include the sentence has nowhere to
  go. Say that the lead posts one new #167 comment on every outcome. Result 1's comment is not
  edited. Nothing is posted on cloudflare/agents. Name the TODO item: "Re-check the upstream codemode
  short-token repair", the only place that mentions #2296.
- **Include.**
  - The revert of the revert must give manifest SHA-256 `d90a7a46…c3a1`, the measured arm.
  - If `origin/main` has moved past `cd4520bd` in product paths by then, stop and report. The local
    ref is still `cd4520bd`.
  - The 6a text step also removes the result-1 sentences that 6b added to the TODO, and updates
    PR #475's title and body and the ledger row.
  - The Codex review reads `attribute.mjs` and the re-test mode too.
  - The policy record quotes the orchestrator's instruction that changed the rule between results.
- **Exclude or inconclusive.** Sound. Inconclusive names the questions with missing pairs.

### 15. Nit: caps, time and stop rule

Evidence: PLAN.md:386-389.

- The caps sum to USD 60 (two arms at 15, two judges at 15) against a stated total of 50. Set the arm
  cap to USD 10, as in result 1; the estimate is USD 2 to 3 per arm.
- Add the time estimate. Result 1 took under 3 minutes per 10-run arm, so about 6 minutes per arm
  plus two judge sessions.
- Restate for the re-test: no re-judge beyond finding 12, no fourth sample, no extra arm.

### 16. Nit: arm identity details

Evidence: PLAN.md:393-401; `scripts/run-eval-server.mjs`:18-21; `src/skills/source.ts`:156.

- Name the serving worktree in the identity commands
  (`git -C /home/tyler/code/raven-wt/np-6.3-inc status --porcelain`).
- `dev:eval` refuses a tree with any untracked file. This file is untracked now and belongs in the
  pre-registration commit. RESULTS-2 and EXEC drafts stay in `tmp/` until both arms end.
- Record that `git diff --stat cd4520bd <pre-registration commit> -- . ':!.agents'` is empty and that
  the diff from that commit to `92f71b8d` outside `.agents/` is commit I's six files.
- The new worktree has no `.wrangler/state`, so the skills cache is cold on INCLUDED and warm on
  EXCLUDED. The content is pinned, so this is latency only. Run the start probes and one skill read
  before the harness on both arms.
- After `git worktree remove`, check that the directory and its `.dev.vars` copy are gone.
- Do not start an arm in the half hour before 00:00 UTC; answers state as-of dates.

## Checked and found correct

- **Scope arithmetic.** 6 × 3 × 2 = 36; D1 and D4 add 12, which is 48 and over the cap.
- **Capture is possible.** `runAgent` keeps `execute` results whole, and `ab-run.mjs` already reads
  them for the URL lists.
- **Arm trees.** `git diff cd4520bd HEAD -- . ':!.agents'` is empty at `473801af`. Commit I's parent
  is `370fb322`, and it changes six files.
- **Scratch path.** `tmp/` is ignored (`.gitignore`:43), so `tmp/6.3/rt/` does not dirty the tree.
- **Pairing sample i with sample i.** Valid: samples within an arm are exchangeable and the pairing is
  fixed before any grade. The round-major order puts sample i at the same position in both arms.
- **Sequential arms.** Acceptable with one server at a time; result 1's arms were four minutes apart.
- **Candidate definition.** A bad INCLUDED answer against a non-bad one with a registry call is a
  candidate, so a registry-caused bad answer counts toward both clauses.
- **Wrong registry use.** Same definition as result 1, where `offTopic` was false on all 20 answers.
- **Judges.** The attribution judge (Fable) is not the answerer (Sonnet), the grader (Opus) or this
  reviewer session.
- **Mechanical outcome.** Nothing lets the lead or executor steer the result after the fact, once
  finding 12 gives judge failures a fixed path.

## Verdict

Revise before the pre-registration commit: findings 1 and 2 are blocking (the attribution judgement decides on noise without a checkable definition, and the capture drops evidence that cannot be re-collected), finding 3 needs the orchestrator's answer, and the rule's structure, the pairing, the arms and the carried D1, D2 and D4 clauses are sound.
