# Item 6.2: Fable review of the plan

Reviewer: Claude Fable 5.2 (`claude-fable-5-2`), agentpc `t1vb`, 2026-11-17, for the 6.2 lead
(`t1v9`). Reviewed [PLAN.md](PLAN.md) on `5279f46a`. No model-calling run, no QA case opened, no
tracked file edited. Routing stdout went to `tmp/6.2/review-{hold,fresh}.txt` and was not read.

## What I checked and found correct

- **Routing numbers.** I re-ran the runner on `catalog/manifest.json` and
  `tmp/6.2-fresh-manifest.json` and compared with `tmp/6.2-compare.mjs`. Every figure in the plan
  reproduces: legacy 220/293/327/113 to 219/293/326/113, the same two legacy losses, 18 list
  changes and 41 score-only moves; extended, skills and protocol history with no grade change (24,
  2, 0 list changes); holdout lane by count top3 27 to 26, with 12/30/30, passed 24 and captures 11
  unchanged.
- **Step 6a numbers and fields** match `eval/gates.json` and the gate code. The legacy band is ±3
  (`eval/run-routing.mjs:368`), so FRESH passes the gate once the manifest hash moves; only the
  accepted totals change.
- **Question rows.** L1, L2 and N1 to N4 are not on `eval/routing-qa-overlap.json`, not tagged
  confirmation-only, and not in `eval/holdout-cases.json`. N1 to N4 are Docs-labelled and their
  top five differs between arms with no grade change.
- **The holdout lost row.** Leaving it unidentified and giving its slot to a fourth control is the
  right reading of `eval/README.md` and the counts-only rule.
- **Reference pages.** All 19 paths return 200 today. "Varial (formerly Freighter)" is live on the
  Freighter paths.
- **Harness reuse.** `runAgent`, `buildAgentSpawn` and `isRetryableAgentFailure` are exported
  (`eval/qa/run-qa.mjs:828`, `:782`, `:1056`). Importing the module runs nothing and opens no case
  file (checked with `strace`, counts only). The spawn carries `--max-budget-usd 4`,
  `--strict-mcp-config`, `--setting-sources ""` and `--max-turns 24`, and refuses a cwd inside the
  worktree.
- **Judge assignment.** No judge grades a comparison it answered in.
- **Step 1** matches the 6.1 precedent file for file (`git show --stat 5279f46a`).

## Findings

### 1. Blocking: `dev:eval` refuses a dirty tree, so step 2 cannot start as written

- Evidence: `scripts/run-eval-server.mjs:18-21` throws when
  `git status --porcelain=v1 --untracked-files=all` is non-empty. Today that prints
  `items/6.2/PLAN.md`, `QUESTION.md` and `briefs/`. The plan also keeps `questions.json` uncommitted
  and commits `ab-run.mjs` "later with the records" (step 2), and both sit in the tracked area.
  (`tmp/` is ignored, so it is fine.)
- Change: add a pre-registration commit before step 2 holding PLAN.md, QUESTION.md, the briefs,
  this review, `questions.json`, `ab-run.mjs` and `blind.mjs`. Record its SHA in EXEC.md as the
  proof that the rule and the questions predate every answer. Write nothing else into tracked paths
  until the arm ends.

### 2. Blocking: the pair order turns grading noise into the decision

- Evidence: step 4 orders answers by correctness, then fabrication, then grounding, so a
  "grounded" against "partly" difference alone decides a pair. Rule 1 then holds on a net of one.
  If the arms are equivalent and `k` of the 18 pairs split by noise, rule 1 holds with probability
  50% at `k` = 1, 25% at 2, 50% at 3, 31% at 4. Clause 2(a) adds three more chances. The plan's own
  risk section says one sample "detects only a large effect"; the rule does not.
- The `run-evals` skill (section 1, "Cost counts") names what should decide: "new wrong answers,
  fabrication, or a failed safety or trap behavior".
- Change, in place of the step 4 pair outcome and the rule:
  - An answer is **bad** when `correctness` is wrong or `fabrication` is true. FRESH loses a pair
    when its answer is bad and HOLD's is not, wins in the reverse case, and ties otherwise.
    Correct against partial and the reach metric are reported, not counted.
  - Absorb unless (1) over the 18 rule pairs FRESH losses minus wins is at least 2; or (2a) for one
    client over its 10 pairs losses minus wins is at least 2; or (2b) one attributable loss, as
    defined in finding 6.
- This changes the note's "more losses than wins" to a margin of two. The note allows a pre-run
  adjustment on a reviewer finding. One unattributed flip is noise; one attributed flip, or a net
  of two, holds. If the lead keeps "more than", the coarser outcome is still needed, and a single
  flip stays a coin toss.

### 3. Blocking: a failed run is graded as a wrong answer, and the arms run one after the other

- Evidence: `eval/qa/agent-result.mjs:563` and `:588` blank the answer on any failure. Only
  `transport` retries (`:53`). A dead dev server is `protocol`; a `--max-budget-usd` stop is
  `unclassified` (`:120` lists only `error_max_turns`, so it falls to `:276`); a subscription usage
  limit matches no transport pattern (`:110-117`) and is also `unclassified`. The plan grades all of
  these "as given", which means an empty answer and a certain loss.
- FRESH always runs second, with three clients sharing one subscription and one server. A usage
  limit, a server crash or a Docs outage late in the run would land on FRESH only and produce a
  hold that has nothing to do with titles.
- Change, pre-registered:
  - A run is **answered** when `failure` is null and the answer is non-empty. A pair with an
    unanswered run on either side is missing: a tie, reported with its failure class.
  - Two consecutive unanswered runs of a class other than `agent` stop that client's harness. The
    cause is fixed and the client resumes once from the stopped question, on the same arm and server
    revision. A resumed question is a first sample.
  - Inconclusive when more than 3 of 30 pairs are missing, or more than 2 of the 18 rule pairs, or
    FRESH has 3 or more unanswered runs than HOLD. The plan's threshold counts only the 30.
  - Probe Docs through the server (one `execute` of a `stellarDocs` search) at the start and end of
    each arm.
- Step 6b for an inconclusive result should record "inconclusive" in the TODO bullet and leave the
  re-run question to the orchestrator. It should not say the A/B decided the hold.

### 4. Blocking: the judge cannot grade `fabrication` or `grounding` from the packet

- Evidence: the packet holds answer text and a tool-call list (names, queries, operation ids), not
  tool results (step 4). The rubric defines fabrication as a specific that "neither the reference
  pages nor its own tool calls support", and grounding as claims that "trace to Docs operations or
  pages it called". The judge cannot see either. A correct detail from a Docs page outside the one
  to four reference pages would be marked fabricated. The `run-evals` skill (section 6) warns of
  this exact artifact. L2's "names only protocols its tool results show" has the same problem.
- Change:
  - The harness adds to each answer's packet entry the deduplicated URLs found in its tool results.
    They are arm-neutral. Fabrication becomes: a specific that the reference pages, the cited pages
    and the listed pages do not support; the judge fetches what it needs.
  - Drop judged `grounding`. The mechanical reach metric already covers it.
  - L2: wrong when the answer claims an exhaustive or multi-hour report, or names a protocol the
    judge cannot confirm on the web as a Stellar protocol, or gives a figure with no cited source.

### 5. Should-fix: blinding holds by instruction only

- Evidence: the judge's cwd is `tmp/6.2/judge/<judge>`, inside the worktree. From there
  `../../blind-key.json` and `../../answers-{hold,fresh}-*.jsonl` are readable, and PLAN.md
  publishes the label function `sha256("np-6.2|" + client + "|" + key)`. Keys such as `L1` and `F1`
  also tell the judge the question class.
- Change: launch each judge in a fresh directory outside the worktree that holds only its packet.
  Assign X and Y with a random bit stored in the key file. Use opaque pair ids in shuffled order.
  Give judges high effort and record model and effort.

### 6. Should-fix: clause 2(b) is not mechanical, and it is undefined for L2

- Evidence: "never called an operation that the HOLD run used to reach a reference page" needs a
  per-operation attribution, but one `execute` script calls several operations and returns one
  result. L2 has no reference page.
- Change: compute it in `blind.mjs --score`. Let `R` be the `stellarDocs.*` ids named in HOLD
  `execute` calls whose result contains a reference path. A FRESH loss is attributable when the
  FRESH run names no id in `R` and no FRESH tool result contains a reference path. For L2, use
  "HOLD called a `scout.*` or `lumenloop.*` operation and FRESH called none".

### 7. Should-fix: arm identity should be the served revision, and the step 3 hash check cannot pass

- Evidence, identity: the plan records `sha256sum catalog/manifest.json`, which is the file on
  disk. The server already reports its commit: `src/server.ts:36-44` puts `sourceRevision` in
  `serverInfo`, set by `run-eval-server.mjs` from `git rev-parse HEAD` on a clean tree.
- Change: read `serverInfo.sourceRevision` from the `initialize` response at the start and end of
  each arm, require it to equal the arm's commit, and record
  `git show <rev>:catalog/manifest.json | sha256sum`. Require a clean `git status` at arm end,
  because `wrangler dev` reloads on file changes. Keep the `search` probe as a second check;
  "Varial" works, since the fresh manifest contains it once and the held one never.
- Evidence, hash: `scripts/build-catalog.mjs:1384-1390` derives `generatedAt` from the newest input
  stamp, and the titles `fetchedAt` is the newest. The lead's fresh manifest has `generatedAt`
  `2026-11-17T19:23:01.953Z`, which is the lead's fetch time. The executor's refresh writes a new
  `fetchedAt`, so its manifest hash will differ from `tmp/6.2-fresh-manifest.json` even with
  identical titles.
- Change: compare the two manifests with `generatedAt` removed, and the two titles files by
  path and title pairs. Re-run the routing comparison only when those differ. Commit A holds the
  titles file and the manifest only; if the refresh changes `inventory/stellar-docs.json` beyond
  `fetchedAt`, stop and report.

### 8. Should-fix: two reference lists are wrong or incomplete

- N2: `/docs/build/guides/fees` is a 431-byte index about smart contract metering, and the
  fee-bump page never says "base fee". Neither covers the classic fee model. Use
  `/docs/learn/fundamentals/fees-resource-limits-metering` (200; it defines the inclusion fee and
  the 100-stroop minimum) and drop `/docs/build/guides/fees`.
- F4: add
  `/docs/data/analytics/hubble/data-catalog/data-dictionary/silver/account-signers-current` (200).
  Without it an answer that names the silver table reads as unsupported.

### 9. Should-fix: caps and question order

- Evidence: the per-answer cap (USD 4) times 20 answers is USD 80 per client, above the USD 50
  client cap. A cap stop therefore falls on FRESH and on the last questions in file order, which
  are N1 to N4, the rule pairs. The estimate (USD 40 to 90) has no stated basis; `run-evals`
  section 5 asks for one.
- Change: order the file L1, L2, N1 to N4, then F1 to F4. Cap each client at USD 25 per arm; if a
  client's HOLD arm passes it, stop and report before FRESH. Count a run with a null `costUsd` at
  USD 4. State the estimate's basis, or say it is a guess.

### 10. Should-fix: step 6a text edits

- `.agents/TODO.md:513-514` is the only `#223` reference in TODO.md, and it sits inside the bullet
  the plan deletes. The plan both deletes the bullet and edits that line. Replace the bullet with
  one sentence on the routing repair item: issue #223 stays open for the repair.
- The gates note should say that the absorb departs from the zero-regression standard on the
  owner's answer (earlier notes use that wording), carry an "Independent review:" line, and state
  that holdout top3 now equals its floor (26), so the next title drift that costs one holdout
  top-3 fails the gate. Put that last point in the TODO routing repair item too.
- `gates.json` asks for the baseline in the same commit as the change. Commits A and B are
  separate because the server needs a clean tree. Say in the PR that the squash merge lands them
  as one commit.
- I found no other live text that describes the hold. The remaining hits are dated records and
  the "Prior note" history in `gates.json`.

### 11. Should-fix: `runAgent` does not return `modelUsage`

- Evidence: `parseAgentResult` returns `usage.final` and `usage.perTurn` only
  (`eval/qa/agent-result.mjs:586-604`), and `runAgent` discards stdout.
- Change: record the requested model id and `claude --version` instead, or say that the resolved
  model is not recorded.

### 12. Should-fix: step 1 has no branch for an id outside the split

- Evidence: the plan covers "already in v10 tuning" and "move". The exposed file could be a case
  outside the 247 (92 + 110 + 45).
- Change: a third branch that writes nothing and prints "not in split", recorded in EXEC.md.

### 13. Nits

- N2 and N4 are not verbatim. The rows use a dash, and N4's row ends "(it's not an
  allow/blocklist)". Use the row text or drop the "verbatim" claim.
- Unset `QA_AGENT_PROMPT_APPEND` in the harness environment (`eval/qa/run-qa.mjs:740`).
- Create the agent cwd with `mkdtempSync` under `os.tmpdir()`, as `run-qa.mjs:1863` does.
- The prompt asks for as-of dates. If the arms straddle 00:00 UTC the dates differ by arm. Record
  it if that happens.
- "At most 30 retries" needs enforcing in the harness, or should read "one retry per answer".

## Verdict

Revise before any run: findings 1 to 4 are blocking (a step that cannot start, and a rule, failure
handling and rubric that would make the outcome arbitrary); the routing numbers, question rows,
holdout handling, judge assignment and harness exports are sound.
