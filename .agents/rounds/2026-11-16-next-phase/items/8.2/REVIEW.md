# Item 8.2 plan review

Reviewer: Claude Fable 5.2 (`claude-fable-5-2`), read-only, 2026-11-18. Tree: `np/8.2-docs-audit`
at `e0ad27d9`. Inputs read: PLAN.md, the five audit files, EXPOSURE.md, COMMON.md, the
orchestrator's `8.2-NOTE.md` and `7-COMMON.md`. No model call, no case file opened. I did not open
`ideas/codegen-correctness-substrate.md` at all, `ideas/source-delivery-ranked-references.md`
lines 28-62, or line 35 of `ideas/stellar-org-source-lane.md`.

**Verdict: approve with changes.** R-01, R-02 and R-03 are blocking and need a plan edit before
the executors start. The rest of the plan is sound: 13 of the 14 spot-checked findings hold against
the code, the three file sets are disjoint, and nothing in them reaches the Worker bundle.

## Spot-check of adopted evidence

| Finding | Result | What I checked |
|---|---|---|
| A-03 | holds | `wrangler.jsonc:8` `"assets": { "directory": "./public" }`; `ARCHITECTURE.md:69` says no static-assets directory. |
| A-04 | holds | `src/mcp/tools.ts:55` `SEARCH_DEFAULT_LIMIT = 7`; `ARCHITECTURE.md:367` says 5. |
| A-06 | holds | `.github/workflows/golden-sentinels.yml` exists, daily `17 7 * * *`, assignee from `REFRESH_ISSUE_ASSIGNEE`; the table in `docs/operations.md:72-78` has three rows. |
| A-12 | holds | ADR-0008 has one hit for deploy, paid or closure (`:128`, a pre-spend review of a paid baseline); it does not state the rule `PLAN.md:53-55` cites it for. |
| B-01 | holds | `package.json` `"dev": "wrangler dev --host localhost"`; `scripts/run-eval-server.mjs:15-24` refuses a dirty tree and prints the revision. |
| **B-03** | **evidence wrong** | See R-01. |
| B-05 | holds | `rounds/README.md` "Shape" is Scope, Lanes, Ledger, Outcome; `2026-11-12-truth-maintenance.md` has no Outcome heading. |
| C-05 | holds | `eval/plan/grade-plan.mjs:21,57` include `stellarOrg`; the README regex has three services. |
| C-11 | holds | `git cat-file -t`: `d15a4ce5` is a commit; `7e00ede2` and `36e77d40` are not valid objects. |
| D-01 | holds | `eval/qa/compile-qa.mjs:338` writes `TOOL_CASES_PATH`; `ci.yml:138` diffs `eval/qa/tool-cases.json`. |
| D-04 | holds | `vitest.config.ts:20` excludes no `research/` path; `git ls-files` shows `research/audits/2026-11-06-playground-final-resolution/blind-packets.test.mjs`. |
| O-02 | holds | The file's decision is "Do not expose `stellarOrg`"; `catalog/manifest.json` has `stellarOrg.search_site` and `stellarOrg.get_page` (#447). Its lessons are in `run-evals/references/source-addition.md` items 1-6; live state is `.agents/TODO.md` "Prove the stellar.org source". |
| O-06 | holds | `improvements/README.md:181-184` (own-repo gap goes to the queue, not a finding) against skill `:108-112` ("Record the change ... in the finding's evidence"). |
| O-52 | evidence holds, disposition does not | See R-05. |
| A-11, D-15 | hold | Section 7 of O.md doubted them. `src/site.ts:1146-1147` reads "for 30" then "days" across a line break, which is why O's `rg` missed it. The owner question stands. |
| A-01 | holds | `git log -1 88659e30`: "Claude Code reads AGENTS.md natively; a CLAUDE.md anywhere on the path stops it from doing so." |

## Blocking

### R-01 (blocking) B-03 would put a false sentence in a skill
- Plan line 112 (PR 2 adopts B-03).
- B-03 says `subjectHash` "is unsalted and stays stable" across a rotation of `MCP_SERVER_SECRET`.
  The hash is unsalted, but its input is not: `src/auth/workos.ts:299` derives the subject with
  `deriveSubject(workosUserId, env.MCP_SERVER_SECRET)`, and `:436-443` is
  `sha256Hex(workosUserId + ":" + serverSecret)`. `src/observability-request.ts:76-82` hashes that
  stored subject. A rotation gives each user a new subject at the next sign-in, and a grant issued
  before it keeps the old subject in its props. The skill's current "splits hashes between old and
  new grants" is right for `subjectHash`. `ideas/per-user-mcp-observability.md:8` exists because
  identity does not survive a rotation.
- B-03 is right about `clientHash` (HMAC keyed by the secret, computed per request,
  `observability-request.ts:46-66`), the Playground cookies (`src/demo/auth.ts:87`), and the
  `null` case when the secret is unset (`:49`).
- Change: replace B-03's text with: "Rotating `MCP_SERVER_SECRET` changes every `clientHash` at
  once. It also gives each user a new subject, so a new `subjectHash`, at the next sign-in; a grant
  issued before the rotation keeps its old subject until it is replaced. Signed Playground cookies
  stop verifying." Keep the added `clientHash = null` line.

### R-02 (blocking) The sanitizing diff shows the case text to every reader of PR 3
- Plan lines 63-65 (decision 2), 125-171 (PR 3), 193-194 (stop rule).
- The plan stops the executor from quoting the text, but the pull request's diff prints every
  removed line of `ideas/codegen-correctness-substrate.md` 174-221 and
  `ideas/source-delivery-ranked-references.md` 30-60. PR 3 is the largest of the three and the one
  a reviewer or the orchestrator is most likely to read in full. `eval/qa/README.md:262-264` sets
  the standard for this text: no other agent "opens the case files, the pull request's diff of
  them, or a log that prints them", and `:267` says anyone who sees the content triggers the move.
- Change: take the two sanitizations out of PR 3 into a fourth small pull request (the move of the
  codegen note and section 1 of the source-delivery note, nothing else). Its body says that the
  diff holds case text, that nobody reads the diff, and that it merges on check status plus a
  reader of the two result files only. Add the same sentence to EXPOSURE.md. PR 3 then has a diff
  anyone may read.
- Cheaper on exposure, if terminal `t1yr` is still open: it has already read both passages, so it
  writes the replacement text and the executor applies it by line range without reading. If the
  executor does read them, record its terminal in EXPOSURE.md as a reader.

### R-03 (blocking) EXPOSURE.md misses a case id
- EXPOSURE.md lines 8-17; plan line 64.
- An id-only match (`rg -o -n '\bq-[a-z0-9]+(-[a-z0-9]+)+' ideas`, which prints no surrounding
  text) finds `q-sor-evm-to-soroban-porting` at `ideas/codegen-correctness-substrate.md:42`, `:135`
  and `:157`. That is a sixth id in that file, outside the 174-221 range and absent from the list
  the orchestrator will check. I did not read those lines, so I cannot say whether expected-answer
  detail sits beside it.
- The same match puts `q-edge-deep-full-history-report` on line 34 of
  `ideas/stellar-org-source-lane.md`, not 35. The other nine ids and both ranges match EXPOSURE.md.
- Change: have `t1yr`, which read the whole file, say whether lines 42, 135 and 157 carry more than
  the id. Add the id to EXPOSURE.md and to the orchestrator's question either way, widen the
  sanitizing range if they do, and correct the line number.

## Should

### R-04 Three edits to the frozen `improvements-pipeline` skill break the plan's own freeze
- Plan lines 48-49 ("No rule moves or cuts in `AGENTS.md`, `golden-truth` or
  `improvements-pipeline`") against lines 116 and 120-121 (B-13, B-14, the "Raven scoping"
  sentence).
- The dated leads read this skill: `items/1.4/dated/` cites
  `.agents/skills/improvements-pipeline/SKILL.md` (path-only match). B-13 narrows a prohibition
  ("Never open a pull request"), the scoping edit removes an instruction, and B-14 changes the
  frontmatter description that decides when the skill loads.
- Change: defer all three with B-12 to the post-2.2c item. `improvements/README.md` already states
  the right scoping rule, so the contradiction costs two more weeks and no wrong action. PR 2's
  file list becomes "every skill except `golden-truth` and `improvements-pipeline`". If the lead
  wants them now, list them for the orchestrator as exceptions to the freeze, and mark B-13
  `SKILL-BEHAVIOR`.

### R-05 Deleting `ideas/skill-discovery-without-bundling.md` leaves three pointers this item cannot fix
- Plan line 167 (O-52: fold into a TODO item, then delete).
- `src/executor/providers.ts:1372` and `src/observability.ts:88` name the file in comments as the
  home of the question `skill_read` telemetry answers, and `test/executor-providers.test.ts:1767`
  names it in a `describe` title. The plan bars `src/` edits and PR 3 owns no test file. O-52 did
  not list these.
- Lines 55-70 of the file are a pre-registered decision rule (90 percent, 25 percent, the 10 to 25
  band, organic traffic only). A paraphrase in a queue item changes a rule written before the data.
  The file also states its own exit (`:84-90`): delete once both questions are answered.
- Change: treat it like O-49. Keep the file, fix the three dead references O-52 names, and add one
  queue line that fires the overdue read and points at the file. Keep O-42 (the skill stops citing
  an idea). Delete the file when the read is recorded. This is also less work than a faithful fold.
  If the lead still deletes: copy `:55-70` verbatim, carry question 1's ceiling and "What a win
  would delete", add the two `src/` comments to the `src/` comment TODO item, and fix the test
  title in a pull request that owns it. Either way the queue line should say Workers Logs hold at
  most 7 days (`docs/operations.md:116`), which bounds how many organic events one read can count.

### R-06 B-12 and O-06 point the same rule in opposite directions
- Plan line 122 (defer B-12) and lines 143-144 (O-06 README half lands now).
- B-12 makes the charter own the silence rule and has the skill link `improvements/README.md`
  "Follow up". O-06 deletes `README:153-169` and has the README link the skill. Apply both and each
  file links the other for text neither holds.
- I compared the two: skill steps 3 and 6 and "More rules" hold everything in `README:153-169`, and
  step 6 holds `README:120-133` except the marker name and the `gh search` command, which O-06
  keeps. So O-06's direction is safe today.
- Change: decline B-12 as superseded by O-06. Tell E3 to delete from the README only text the skill
  already holds, because the skill cannot take additions until 2.2c merges. Also pick one treatment
  for `README:100-118`: the plan adopts both D's (keep the lines as orientation) and O-06's (one
  line). `improvements/intake.json` already carries the per-repository guidance (`rule`,
  `alsoAvailable`), so the one-line form loses nothing.

### R-07 Links cross the three pull requests; the plan rebases only on a file conflict
- Plan line 189.
- A-18 has `THIRD-PARTY-NOTICES.md` (PR 1) link a TODO item that PR 3 creates; an anchor link is
  dead when PR 1 merges. PR 2 removes the skill's pointer to an `ideas/` file that PR 3 may delete.
  PR 2 adds links to `docs/operations.md` (PR 1) and to `eval/EVALS.md` and
  `ecosystem-skills/README.md` (PR 3); PR 3's C-08 links a roster heading PR 2 edits.
- Change: PR 1 links `.agents/TODO.md` with no anchor. Each later pull request rebases on `main`
  after the earlier one merges and reruns the link check before it merges. Run the link check once
  more on `main` after the last merge. Name the headings that must keep their text: "Deploy" in
  `docs/operations.md`, "Evaluation rules" in `eval/EVALS.md`, the re-pin heading in
  `ecosystem-skills/README.md`, "Models for evals and tests" in the roster.

### R-08 The gates do not check the freeze, and the plan has no merge window
- Plan lines 177-182.
- The plan promises byte-identical TODO anchors and an unchanged `golden-truth`, but no gate checks
  either. Item 8.1 had the check (`items/8.1/PLAN.md:228`).
- Add four free gates: the 8.1 frozen-anchor diff for `.agents/TODO.md` (PR 3);
  `git diff --quiet origin/main -- .agents/skills/golden-truth` (PR 2); a diff showing the
  `### Held-out split` heading and the Maintenance exception block (`eval/qa/README.md:240-269`)
  unchanged (PR 3); `git diff --stat origin/main -- src public wrangler.jsonc catalog specs`
  showing only `src/catalog/README.md` (every PR, as the proof that no Worker bytes moved).
- The round's ledger gives other documentation pull requests a window: merge before 2026-11-23
  18:00 UTC, or hold until run 2.1 and its follow-ups have merged (ledger rows for 5.2, 6.1, 6.2).
  PR 1 edits `AGENTS.md` and PR 3 edits `.agents/TODO.md` and `eval/qa/README.md`, which the dated
  leads read at launch. State the same window.

### R-09 Two edits rewrite self-declared records in `plugins/openai/`
- Plan lines 139-141 (D-12 to D-17 with O-09); decision 5 (line 75) keeps records untouched.
- `RESUBMISSION.md:3-4` opens "Historical record ... have not been reverified here".
  `EXCEPTION-REQUEST.md:3-5` opens "Historical draft ... Refresh portal status, catalog details ...
  before sending". "Lift the standing procedure out" reads as a move, which rewrites the first
  record. It also turns steps last run on 2026-10-23 into current procedure in a living guide, and
  no lane in this item can verify them against the portal.
- Change: copy, do not move. `RESUBMISSION.md` stays byte-identical, and the README section says
  "last run 2026-10-23; check the portal before you act". Decline D-17: the draft's own header
  already tells the sender to refresh the counts.

### R-10 The approval list is short by three items
- Plan lines 55-62 and 205-207.
- A-01's replacement text adds a prohibition ("Do not add a `CLAUDE.md`"). That is a new AGENTS.md
  rule, not a sentence-level accuracy fix. Land the fact now ("There is no `CLAUDE.md`; Claude Code
  reads this file natively.") and list the prohibition for approval, or list the whole sentence.
- B-13 changes what an agent may do; mark it `SKILL-BEHAVIOR` (moot if R-04's deferral is taken).
- C-17's README line calls the gauntlet "the one exception" to an AGENTS.md rule whose exception is
  only proposed. Write the fact ("It starts its own Wrangler per model on its own port") and leave
  "exception" for the approved rule.
- The correction to the frozen list (plan lines 41-51) is itself a decision about files the dated
  runs read. Put it on the list so the orchestrator approves it, not only the edits under it.

### R-11 A-16 depends on a deploy date nobody verified
- Plan lines 95-97.
- A.md lists "That #484 is deployed" under "Not verified", and the ledger row for #484 does not
  state it. Deleting the access-token sentence is right only an hour after that deploy.
- Change: write the form that needs no date: "A grant with no resource binds to the origin that
  first refreshes it. An access token with no audience stays usable on all three origins until it
  expires, at most one hour." It drops "migration" and stays true before and after the deploy.

## Nits

### R-12 Findings with no disposition
Add one line each to the plan or the report:
- A-21 (the roster's "Run on `hc` agents first" bullet): O-05 part 3 cuts it; the plan cites O-05
  only for B-06 and C-08.
- A-28 (the Codex `ps` rule): keep, and note that O-33 proposes moving it.
- O-21: declined as low value, but `eval/qa/corpus/README.md` and `eval/corpus/PROVENANCE.md` are
  living guides no lane could open. Report them as not audited and add a queue line for a
  golden-maintenance lane.
- O-25 row `plugins/openai/README.md:111-113`.
- O-27 rows "Playground / demo" outside `ARCHITECTURE.md`, "round ledger / round record", and
  "terminal / pane".
- O section 7, `plugins/openai/domain-verification/README.md:6`: D.md checked it correct; decline.
- A-02: after `AGENTS.md` changes, the hook message and three `.ignore` headers still say
  "Held-out split". With C-13's pointer that is navigable; say so, or add them to the deferred item.

### R-13 D-05 maps 41 test files one by one
- Plan lines 138-139. A per-file table is stale at the next new test. Add the four group rows D-05
  drafts for the new areas, add the stragglers to the nearest row, and state that the table names
  groups. Do not promise that every file is mapped.

### R-14 B-07 should name the commands it runs
- Plan lines 113-115. The roster's "How to re-verify" has an offline block (`:71-76`) and two
  network reads. One of them, `claude -p --model <alias> ... "Reply ok"`, is a model call. Run the
  offline block only and record that the alias probe was skipped.

### R-15 The moved codegen note and the disposition table need provenance
- Plan lines 155-159 and 171.
- A file named `research/audits/2026-08-07-...` that was edited on 2026-11-18 reads as an untouched
  record. Give it a header line: moved from `ideas/` and sanitized on 2026-11-18 by item 8.2, case
  text replaced by case ids, partner detail removed.
- For each deleted or sanitized file, record in EXEC the last commit that holds the earlier version
  (`git log -1 --format=%h -- <path>` before the change).
- EXPOSURE.md should add three facts for the orchestrator: readers before this item are unknown
  (the file has been on `main` since `842d85b5`, 2026-08-11); only living docs were swept, not
  `research/` or the round records; and the answer must not write a set beside an id in a ledger or
  the TODO (`eval/qa/README.md:231-232`).
- O-01 also found partner-side detail (a first name, the partner's regulatory processes) in a
  public repository. The edit removes it from `main`; history keeps it. That is an owner question
  about a partner, separate from the held-out question. Put it in the report.

### R-16 `ARCHITECTURE.md:416` has a better fix than deletion
- Plan line 103. Nothing is named "instruction-map", but CI's sync guard diffs
  `src/mcp/family-text.ts` (`ci.yml:138`). Write "Catalog, spec, and family-text checks reject
  stale generated outputs."

### R-17 The `architecture-explorations.md` fold has two loose ends
- Plan lines 152-154 and 172.
- Item 5's second half (expose page modification dates to agents) and item 4's pointer to the
  upstream approval runtime are not in the living docs O-46 cites. Record each in EXEC as rejected
  with a reason, or carry one line into the queue.
- "Fold item 2 into the TODO p9 claim-support item" edits an existing item, while line 172 says new
  items only. Say "append one bullet"; that heading is not a frozen anchor.

### R-18 Smaller wording points
- C-13 (plan lines 133-134): put the pointer line before `**Maintenance exception.**`, not after
  the exception's closing paragraph (`eval/qa/README.md:266-269`), where it would read as part of
  the exception.
- A-27 (plan lines 97-98): the link check does not see references by section number.
  `.github/workflows/refresh.yml:291,307`, one skill and three `ideas/` files cite
  "`ARCHITECTURE.md` §6". Rename the heading only; keep the "1." and every other number.
- Decision 6 (plan lines 78-79): a reworded sentence should point at what owns the stellar.org
  contract (`specs/stellar-org.json` and the adapter), and call the research file "the 2026-11-14
  measurement".
- Execution (plan lines 186-189): say which pull request commits which item record. An executor in
  another worktree cannot write `EXEC-<n>.md` "here" and have it land in its own pull request.

## Scope, split and spend

- **Disjoint file sets:** yes. The only near overlaps are `eval/plan/build-op-classes.mjs` (PR 1, a
  script) against `eval/**/*.md` (PR 3), and the round's `DECISIONS.md` (PR 1) against PR 2's
  `.agents/` files; neither collides.
- **Worker bytes:** none. `wrangler.jsonc` has no module rule that bundles Markdown, no script
  reads a doc into generated output, and the two generator comments PR 1 edits
  (`scripts/build-catalog.mjs:619`, `eval/plan/build-op-classes.mjs:24`) are comments, not emitted
  text. No test reads the text of any doc the plan edits; `check-pin-review.mjs` reads
  `PIN-REVIEW.md` only for `sel:` tokens when a pin moves.
- **Reviewable:** PR 1 and PR 2, yes. PR 3 only after R-02 takes the case-text edits out of it.
- **Dated runs:** the prestaged leads cite `AGENTS.md`, `golden-truth`, `improvements-pipeline`,
  `eval/qa/README.md` and `.agents/TODO.md` and nothing else PR 2 edits, so `run-evals`, the roster
  and the other skills are free to change.
- **Spend:** nothing in the plan costs money. D-05 (R-13) and the O-52 fold (R-05) are the two
  places where the plan does more work than the result needs.
