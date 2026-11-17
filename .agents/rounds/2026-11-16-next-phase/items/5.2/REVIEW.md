# Fable plan review, item 5.2

Reviewer: Claude Fable 5.2, high effort, on `np/5.2-owner-followups` at `7dafce0c`. Read-only apart
from this file. No QA case, `cases.json`, `sample.json` or split file was opened; the FAM backup
folder was listed and one file hashed, not read. Public reads only: `npm view @cloudflare/codemode`,
one raw GitHub file, four `gh search issues` queries. No post, no commit, no model call.

**Verdict: the plan is sound and in scope. Two blocking findings, both in the rule text of step 2.
The rest are should-fix or nit.** The stop-rule condition "the Fable review shows the dated runs
must change scope" is not met: the narrow scope is correct (finding 7).

## Facts that checked out

- Every TODO heading and wording the plan names: `.agents/TODO.md:25` (Priorities 3), `:86-96`,
  `:259`, `:275`, `:320-326` (FAM pointer, full hash), `:343`, `:354`, `:359-362`, `:397-414`
  (65 cases, split v8), `:525`, `:695`, `:774`, `:831-834` (the non-Error sentence), `:900`.
- 3.3 numbers: `items/3.3/MEASURE.md:37` (0, 1, 3 of 25) and `:40` (8 at limit 5).
- `PRESTAGE.md:371` names the old TODO title. No dated brief moves a case between sets.
  `sibling-check.mjs:96,122` reads `sets.tuning` only.
- `@cloudflare/codemode` is pinned at 0.5.1 (`package.json:67`). `dist/index.js:307`,
  `dist/browser.js:116` and `src/executor/run.ts:496-497` read as the plan quotes them.
- Checked today: npm `latest` is 0.5.6, and upstream `main`
  `packages/codemode/src/executor.ts:511` still has `error: err.message`. Four dedupe searches on
  `cloudflare/agents` returned nothing (not exhaustive; the executor still dedupes).
- `cs-012` is the next id (active max `cs-010`, `resolved.json` max `cs-011`). `intake.json`
  overrides `cs-001` and `cs-010` to `cloudflare/agents`. The skill asks for a distinct reviewer
  only at retirement (`SKILL.md`, "Follow up", step 7).
- NOTE.md and EVAL-FABLE.md are byte-identical to the orchestrator's copies (the NOTE source is
  `orch/5.2-NOTE.md`, not `orch/NOTE.md`).

## Findings

### Step 2: the maintenance-exception rule text

**1. Blocking. The write-set bullet cannot be met, and it contradicts the next bullet.**
Evidence: EVAL-FABLE.md:150-152 says the lane changes "only the corpus, the register, and their
compiled outputs"; line 153-154 then speaks of "its report, ledger, and TODO entries".
`eval/qa/README.md:252-253` requires a re-verification that changes `truth.asOf` to update
`caseAsOf` in `source-sentinels.json` in the same change, and `npm test` fails otherwise. The dated
runs' real write set (`PRESTAGE.md:42-55`) also has the sentinel test, `improvements/`, the TODO and
the ledger. As written, no real maintenance lane qualifies, so the rule is broken or read loosely
on first use.
Change: state what the lane must not change, then list what it may. Wording in finding 6.

**2. Blocking. The trigger list omits the one trigger the plan's own follow-up lane needs.**
Evidence: PLAN.md:74-76 plans "one maintenance lane under the exception [that] reads every member
of each left-open entry". Those members have no due `reverifyBy` and no sentinel drift of their
own. EVAL-FABLE.md:147 allows "a `reverifyBy` date, a source sentinel, or an upstream event";
"an upstream event" is open-ended and is the only hook. EVAL-FABLE.md:139 gives register closure
as a reason to adopt the rule, so the rule must name it.
Change: add "a consistency-register entry that such an edit reopened" to the triggers, make the
list closed, and require the lane's brief to name the trigger before any case is opened (this
stops a trigger being found after the fact).

**3. Should-fix. "Works by case id … carry ids" conflicts with the paragraph above it.**
Evidence: `eval/qa/README.md:229-230`: "never copy a held-out or reserve ID into a ledger or
`.agents/TODO.md`". EVAL-FABLE.md:153-154 has the lane write ids into both. `.agents/TODO.md:78`
already reads the old sentence as "An item may name a case by ID; never record which set a case
is in".
Change: say so in the rule: an id written without its set is not a copy in that sense; the lane
never looks up or writes a set.

**4. Should-fix. Three loopholes in who is bound and what leaks.**
- "The lane and its reviewer" is undefined, and "in that session or pull request" binds neither
  the lane's executor nor what a session does afterwards. Define the lane as its lead, executor
  and reviewers, each a session that does nothing else.
- Nothing stops the lane from reading stored Raven answers or verdicts for a case while it edits
  it; only the trigger is constrained. Add: the lane reads no Raven output for a case it opens.
- "never golden text" covers the report, ledger and TODO only. The review file, pull-request body,
  commit messages, `improvements/` findings and `hc` messages are open. `sd-077`'s evidence line
  already paraphrases a golden ("The golden states both attributed wordings…"), which shows the
  path is real.
- "Nobody else reads the case or the diff" cannot bind the owner or GitHub. Scope it to agents and
  the orchestrator, and include logs: two of this round's four exposures came from tool output
  (`.agents/TODO.md:61-69`).

**5. Should-fix. Two ambiguities in the closing sentences.**
- "the read it pairs with" has no meaning for a first read. Say "since the split was drawn, and
  since the read it is compared with".
- PLAN.md:53-54 adds "cases already moved (v5 to v8) stay in tuning". Earlier moves exist
  (`.agents/TODO.md:73-76`: decision 2(b) and round item 1.1), and a README states current
  behaviour, not versions. Write it version-free.

**6. Proposed text** (replaces EVAL-FABLE.md:144-158; adopts findings 1 to 5):

> **Maintenance exception.** A golden-maintenance lane may open and edit a held-out or reserve
> case without moving it. The lane is its lead, its executor and its reviewers. Its brief says
> that it runs under the exception and names the trigger before any case is opened. All of these
> hold:
>
> - **Trigger.** It is a fact about the world, not about Raven: a `reverifyBy` date, a
>   source-sentinel drift, an upstream event shown by a primary source, or a consistency-register
>   entry that such an edit reopened. An edit prompted by a Raven answer, transcript, or verdict
>   on that case is not maintenance, and that case moves to tuning.
> - **No Raven output.** The lane reads no stored answer, transcript, or verdict for a case it
>   opens, and runs no model-calling eval.
> - **Edit.** It changes only what the trigger made stale, through `golden-truth` and its
>   independent re-derivation.
> - **Write set.** The lane's sessions and its pull request change no product code, catalog,
>   prompt, rubric, judge pack, or gate threshold, and its sessions do no other work. They may
>   change the corpus and its compiled outputs, the register, the source sentinels and the test
>   that pins them, `improvements/`, and the lane's own records.
> - **Records.** The lane works by case id and never looks up or writes which set a case is in; an
>   id written without its set is not a copy in the sense above. Outside the corpus and the
>   register, nothing it writes quotes or paraphrases a case's judge-facing text: not its report,
>   review file, ledger row, TODO entry, finding, commit message, pull-request body, or a message
>   to another terminal.
> - **Readers.** No other agent, and not the orchestrator, opens the case files, the pull
>   request's diff of them, or a log that prints them. The orchestrator merges on the review
>   verdict and the check status.
>
> A lane that does not claim the exception, or misses a condition, keeps the rule above. Anyone
> outside the lane who sees the content still triggers the move. The exception moves no case
> back: a case already in tuning stays there. A held-out read reports, as a count, the cases with
> a judge-facing change since the split was drawn and since the read it is compared with.

### Step 4: dated briefs

**7. No change needed: keeping the narrow scope is correct and safe.**
Evidence: `launch-dated-lead.sh:128-129` builds each lead's worktree from `origin/main` at fire
time and points the lead at the brief in that worktree, so every PRESTAGE edit in this pull
request is live for the 2026-11-23 run. Widening would change `sibling-check.mjs` (which never
prints an id outside tuning, lines 116-127), the section 1 open list and the section 6 closure
rule, none rehearsed. The cost of not widening is bounded and already designed for: entries stay
at `reopen`, which CI accepts (`PRESTAGE.md:369-372`). The four `*-LEAD.md` briefs and
`ITEM-LEAD.md:99` ("Never open a held-out or reserve QA case") agree with the narrow rule.

**8. Should-fix. The PRESTAGE paragraph must say the runs are outside the exception, not only
"narrower".**
Evidence: the dated runs read set membership through `sibling-check.mjs` (`PRESTAGE.md:37-40`), so
they cannot meet the rule's "never looks up … which set" condition. PLAN.md:90-91 says only that
"these runs keep the narrower rule above", which an unattended lead can read as "the exception is
available if I need it". PLAN.md:91 "a run moves no case" is also silent on an accidental
exposure, which has happened three times this round (`.agents/TODO.md:61-69`).
Change: use this paragraph.

> **The README maintenance exception does not apply to these runs.** `eval/qa/README.md`
> ("Held-out split") lets a golden-maintenance lane open a held-out or reserve case under
> conditions these runs do not meet. Keep the rule above: open only the files it lists, close
> entries all or none (section 6), and never amend the split or `TUNING_ROW_COUNT`. If a tool's
> output shows you text of a case you may not open, do not use it: write the id to
> `~/.local/state/raven-dated/<key>-EXPOSURE.txt`, never commit it, say "exposure: 1" in
> REPORT.md, and continue. A later lane closes the entries you leave open.

**9. Should-fix. `PRESTAGE.md:372` depends on a literal string the plan may delete.**
Evidence: `PRESTAGE.md:371-372`: record the count "under '<title>', replacing 'none recorded yet'
with the running count". PLAN.md:92 fixes the title only. PLAN.md:71-77 rewrites the TODO item's
body and does not say the sentence "Count left open so far: none recorded yet." (`.agents/TODO.md:411`)
survives.
Change: keep that sentence verbatim in the rewritten TODO item, and state in step 3 E that it is
kept because PRESTAGE section 6 edits it.

**10. Should-fix. The plan has no merge window against the timers.**
Evidence: `units/raven-dated-2.1.timer` fires 2026-11-23 18:00 UTC. `PRESTAGE.md:72`: "If `main`
moves: merge it". A dated lead writes its count into the TODO item this pull request retitles and
rewrites, so a merge of 5.2 while a lead is running gives an unattended lead a TODO conflict near
its deadline.
Change: add to Risks and to REPORT.md: merge before 2026-11-23 18:00 UTC; if that is missed, hold
the merge until no dated lead is running (2.1 and its follow-ups merged), then rebase and carry
the lead's count into the rewritten item.

### Steps 5 and 6: `cs-012`

**11. Placement is right.** `canonical-source` with a per-finding override to `cloudflare/agents`
matches `cs-001` (same package) and `improvements/README.md` ("a package that Raven vendors").

**12. Should-fix. Reproduce at the package boundary too, and say which version was executed.**
Evidence: PLAN.md:115-120 runs only `createExecuteRunner`, on the pinned 0.5.1. The skill asks for
"evidence a stranger can reproduce" (step 3) and to "separate the version where you saw the drift
from the version that introduced it" (step 4). A maintainer cannot run Raven's runner.
Change: in the same scratch test, add one call on the package itself:
`new DynamicWorkerExecutor({ loader: env.LOADER }).execute('async () => { throw "x"; }', [])`, and
record its `{ result, error }`. In the finding, state: executed on 0.5.1; the same template line
read (not executed) in 0.5.6 `dist/index.js` and in `main` `packages/codemode/src/executor.ts:511`.
The runner case stays as the Raven-impact evidence NOTE.md asks for. Still free, no model call.

**13. Nit. Add `throw null` as a third case.** `err.message` on `null` or `undefined` throws
inside the `catch`, so the outcome differs (a rejected call, which `run.ts:488-495` folds into a
load failure). The recommended form fixes it too. Narrow the stop rule (PLAN.md:134-135) to the
string and object cases, so this expected not-`ok` result does not stop the filing.

**14. Nit. The expected assertion has the wrong shape.** PLAN.md:118 expects "result undefined".
`ExecuteOutcome` is `{ ok: true; result: string }` (`src/executor/run.ts:352`, `:639-640`). Assert
`outcome.ok === true` and record `outcome.result` verbatim. Put the test source in EXEC.md, since
the file is deleted and the TODO clause asks a later upgrade to re-run it.

**15. Should-fix. Commit and push the finding before posting.**
Evidence: `scripts/improvements-file-issue.mjs:255` links the issue to the file on `main`, and
`:307-318` adds the immutable snapshot only when the last commit's blob equals the file. The skill:
"Commit first, or omit the snapshot." PLAN.md:110-113 goes from dry run to post with no commit.
Change: order the step as: write at `verified` with the reproduction, `improvements:index`, commit,
push the branch, dry run, read, post, commit the script's edits. Note in REPORT.md that the issue's
`main` link is dead until the orchestrator merges, so the merge should not wait.

**16. Nit. Two things the filing needs that the plan does not state.**
- An `upstreamTitle`, for example "codemode: DynamicWorkerExecutor reports no error when sandbox
  code throws a non-Error value".
- Every frontmatter `evidence` line is posted (`improvements-file-issue.mjs:277`). Keep round
  terms and `EXEC.md` paths out of them.

### Step 5: the three stellar.org findings

**17. Should-fix. Replace `sd-113`'s last evidence line instead of appending.**
Evidence: the file's last evidence line ends "The finding stays verified until the owner decides
where to send it." The new line says the owner decided not to forward it. Both would stand.
Change: rewrite that line to "Not posted and not forwarded (owner, 2026-11-17): out of scope for
stellar.org; Pi Network owns the fact. No owner page undertakes the topic." `sd-111`'s line ("until
the owner forwards it") agrees with the new note and can stay.

### Steps 1, 3 and 7: records

**18. Should-fix. `.agents/TODO.md:77` points at the item step 3 E rewrites.** The held-out status
says "(round item 1.4, v5; see the owner decision below)". After the retitle there is no owner
decision below. Change that pointer to DECISIONS.md "Follow-up answers", and add one sentence to the
held-out status that the maintenance exception exists (README link). Lanes read their held-out
rules there.

**19. Should-fix. Step 1's "amends answer 2" overstates it.** `DECISIONS.md:23-26`: answer 2 is "no
re-draw", the overlap list, and one move of an exposed row. All three stand under the exception.
Write E's bullet as: "narrows the README rule that every seen case moves; answer 2 is unchanged;
an exposure outside a maintenance lane still moves the case". Place the new section before
"## Timing" (`DECISIONS.md:66`). It holds NOTE.md's six bullets, `scout.matchPartners` included; H
and F are not owner answers and go in the ledger row only (PLAN.md:11 says "seven").

**20. Should-fix. D loses facts in the move.**
- `~/backups/fd-2026-11-14/split/` holds the confirmation files as well as the development ones
  (folder listing), so the Mac copy covers the sealed set. Say so in the hold item too; that was
  the risk EVAL-FABLE.md:127-128 named. NOTE.md gives no Mac path: write "path held by the
  orchestrator" or ask for it.
- Keep in the hold item: the sealed set's SHA-256 (`.agents/TODO.md:262`), "the record lists the
  paths", and a "Done when" line (`:272-273`).
- Keep with the moved pointer: "the loader now accepts `stellarOrg`, the move changes the routing
  set, and it needs its own gate run" (`.agents/TODO.md:324-326`).

**21. Nit. TODO E item.** Drop "(step 4)" from the TODO text (PLAN.md:73); a TODO cannot cite a
plan step. Add that the follow-up lane's brief must claim the exception and override
`ITEM-LEAD.md:99`.

### Gates and stop rule

**22. Should-fix. `npm run typecheck` cannot run in this worktree yet.** There is no `.dev.vars`
and no `worker-configuration.d.ts` (AGENTS.md, "Commands": typegen needs the placeholder
`.dev.vars`). Add the README "Run locally" setup and `npm run typegen` before the gates.

**23. Nit. Gates are otherwise sufficient.** They match NOTE.md's list. `improvements:index` runs
before the lint, which the lint's index-freshness check needs. The scratch test must be deleted
before `typecheck` and before `secrets:scan -- --tree`, not only before the commit. Add a stop
condition: if the upstream `main` line is already fixed at filing time, record `cs-012` with the
fix reference and do not post (it is not fixed today). REPORT.md with the no-deploy statement
(NOTE.md:76) is not in the steps; ITEM-LEAD step 7 covers it.

## Scope against NOTE.md

Nothing NOTE.md asks for is missing. The plan's additions are consequences of NOTE.md items, not
new scope: the Priorities pointer (C), the two retitles (D, E), dropping the free-count paragraph
(D, per EVAL-FABLE.md:117-118) and the line-371 pointer (E).
