# Item 0.4 plan: reconcile the TODO and the two loop ledgers

Lead: Claude Opus 5.5, agentpc `t1qz`. Branch `np/0.4-todo-ledgers` from `origin/main` at
`000a30de` (0.1, 0.2 and 0.3 merged). Worktree `/home/tyler/code/raven-wt/np-0.4`.

## Decision this changes

The work queue and the two loop ledgers match the repository and the owner's 2026-11-16 answers
again, so later items (1.1 to 4.1) start from a correct queue. Docs only: no code, no generated
file, no golden, no deploy.

Binding inputs: [DECISIONS.md](../../DECISIONS.md) 1, 5, 6(a), 6(b) (the orchestrator's task line);
the round plan's "TODO reconciliation" list ([PLAN.md](../../PLAN.md)); the 0.4 inputs in
[0.2 REPORT.md](../0.2/REPORT.md) item 3; and the 0.3 record (its TODO edits already landed in #453;
this item only checks them). Where a TODO item still says "the owner picks" and the owner has now
picked (decisions 2, 3, 4, 7), the text records the answer and keeps the work open. It does not
carry out decisions 2, 6(c) or 7; those belong to their own items.

## Facts re-checked on `000a30de` (the round plan was written at `986ffbaa`)

- 0.3 already fixed: the identifier-pointer bundle pointer, the FAM rows paragraph, the
  `gca-eval` register item, the empty "Owner decisions" section, and the bundle pointer at the top
  of the loop 2 ledger (lines 9 to 12). Not redone here.
- #447 merged 2026-11-16 00:04:53 UTC as `986ffbaa`; #446 merged 2026-11-15 02:28:53 UTC as
  `0a603453`. #426 is closed (2026-11-14). Open issues: #429, #427, #425, #223, #167.
- `sls-119` is `reported-upstream` (`improvements/INDEX.md`).
- The current split file on agentpc is `~/backups/gca-2026-11-14-split-v2.json`, SHA-256
  `697c550a…` (the loop 1 ledger's value). `~/backups/gca-2026-11-14-split.json` is the old
  `f683852e…` split.
- Server instructions are 1,899 characters: 2,197 of headroom against Claude Code's 4,096. The
  binding cut is Grok's 2,033, already pinned by named constants in `test/mcp-instructions.test.ts`.
- About 250 battery cases cite ".agents/TODO.md — Finish the 2026-11-14 golden coverage audit" in
  `truth.verified.rootCause`. That is dated provenance; no lint resolves it. Leave the cases
  untouched (an edit would change golden digests). No live doc, skill, script or test names any
  heading this plan deletes or renames (checked with `grep -F` over `.agents/skills`, `docs`,
  the top-level docs, `eval/**/*.md`, `research/decisions`, `src`, `scripts`, `test`).
- Loop 2 ledger defects: a duplicate `loop2-impl` row and a blank line that splits the Lanes
  table (lines 58 and 59); five places say a run record (`P0.md`, `P1.md`, `P2.md`, `R.md`) lives
  on `tune/loop-2-runs` (lines 148, 176, 296, 303, 370), but all four are on `main`; line 403 says
  "git history `3d65d0ff`" (now in the bundle only); no merge or deploy entry.
- Loop 1 ledger: empty "Lanes" table and empty "Ledger" section; no Outcome; no bundle pointer.
- Loop 2 deploy: no tracked file records it except the round brief (`briefs/PLAN-BRIEF.md` line
  84: "production verified the adapter path after deploy `c3596dcc`"). The Cloudflare API is not
  readable from this lane, so the ledger cites the orchestrator's statement, and the report asks
  the orchestrator to confirm the full Version ID and the method.

## Steps

All edits in `.agents/TODO.md`, `.agents/rounds/2026-11-14-baseline-tuning.md`,
`.agents/rounds/2026-11-15-tuning-loop-2.md` and `.agents/rounds/2026-11-16-next-phase.md`, plus
the two `briefs/` deletions in step 4. Style: the repo's plain style (short sentences, no
history in the TODO beyond what the next step needs, links to the round records). Round item
numbers are linked as `[round item N](rounds/2026-11-16-next-phase/PLAN.md)`.

### 1. TODO: delete

| Item | Why it goes |
|---|---|
| "Find what costs the trimmed surface accuracy on live-data questions" | Decision 5: the owner accepts the loss. Record it in one sentence in the section intro (step 2c). |
| "Point the total-guard failure at its sources" | Its premise ("30 characters of headroom") is false: 2,197 against 4,096. Grok's cut is guarded by named constants. |
| "Finish the 2026-11-14 golden coverage audit" | Every owner decision is done (`sls-119` `reported-upstream` since #440); the baseline ran (#442); the key-fact polish is optional and on the round plan's "do not do now" list. |
| "Measure 'read past the snippet' guidance" | Loop 1's arm 1 was that measurement and shipped (#446). |
| The "Inbound handoff #426 (sls-029)" bullet under "Improvements follow-up" | #426 closed 2026-11-14. |

### 2. TODO: rewrite

a. **Priorities** (decision 1 and the round plan):
   1. Dated truth maintenance: the Bell goldens after the 2026-11-23 vote and the three later
      cases (round items 1.4, 2.1, 2.2), and the upstream handoffs (1.1).
   2. The production read and the source-gap residue (round items 3.1 and 1.3).
   3. Mechanisms with a measured cause (round items 3.2 and 3.3).
   Then one sentence: no third tuning loop, and no paid QA run without a new written owner
   authorization (owner, 2026-11-16, decision 1). Keep the "general routing repair stays held"
   sentence.
b. **Held-out status** (top of "First-principles round follow-ups"): 247 headline cases; SHA-256
   `697c550ae15400f5d7e8d9e47f4fd3d5460a6052d91571f5014ef4d35f64ed12`; 79 tuning, 119 held-out,
   49 reserve; file `~/backups/gca-2026-11-14-split-v2.json` on the owner's Linux machine. Two
   tuning loops tuned on the tuning rows; two counts-only held-out reads (loop 1 and loop 2
   ledgers); one held-out row's answer was exposed (loop 2 deviation) and moves to tuning by a
   dated amendment (decision 2(b)). Keep the rule sentences ("never record which set a case is
   in", "tune no product change on a held-out or reserve case"). Drop "No product-tuning lane has
   opened any of the 246 cases" and the 70-case battery-test sentence.
c. **Section intro, live-data sentence**: "The owner accepted the trimmed surface's loss on
   live-data questions as the price of the trim (2026-11-16, decision 5). ADR-0011's reopening
   rule 3 stands: a fix that keeps most of the token saving reopens the question."
d. **"Audit source coverage"**: the residue is the gap-ledger leaves marked "not re-run" (the
   executor counts the table rows; the round plan says 11) plus the confirmed gaps without a
   finding; round item 1.3 classes them. Drop "28 single observations" and "Do this after the
   per-source status item below." Add: the National Bank of Ukraine, scam-recovery and Pi Network
   gaps are filed under decision 6(c) by their own item. Keep the owner's "gaps are findings"
   paragraph. Done-when unchanged in substance.
e. **"Report per-source attempts and final status"**: drop "This work comes before the coverage
   audit." Point at round item 3.2, which also adds the Lumenloop and Scout per-call timeouts.
f. **"M2"** absorbs two items (step 3).
g. **"Settle the routing-row overlap with the held-out QA questions"**: the owner chose no
   re-draw (2026-11-16, decision 2): (a) commit the list of routing rows whose question matches
   any of the 247 headline questions at token Jaccard ≥ 0.8 and mark them confirmation-only for
   routing work (computed against all 247, so it reveals no membership); (b) move the exposed
   held-out row to tuning by a dated amendment and record the new SHA-256. Done when both are
   done and the routing eval README says no lane tunes on the listed rows. Keep the existing
   counts (73 of 338, 26 of 122) as the old measurement.
h. **"Treat stellar.org routing reach…"**: add that round item 3.3 measures the two ranker
   changes once each, with the pass rule fixed in the round plan. Nothing else.
i. **"Prove the stellar.org source and settle its egress"**:
   - Worker egress bullet: replace with one line: deployed as Version `c3596dcc` after #447; the
     orchestrator verified the adapter's path from the deployed Worker (loop 2 ledger,
     2026-11-16 entry). Remove it from the done-when.
   - Adapter review residue: point at round item 1.2.
   - Blend register finding and the Anchor Directory case: point at round item 1.3.
   - Algolia bullet: state the decision already recorded in the round plan ("add depth only on
     a production detail-lookup failure"), and drop "the Algolia decision is recorded" from the
     done-when.
j. **"Check Docs search for the SEP-7 payment-request page"**: point at round item 1.3. Text
   otherwise unchanged.
k. **"Re-verify the event-tied goldens"**: name the 11-30 case,
   `q-infra-software-versions-current-protocol`; point at round items 1.4, 2.1 and 2.2.
l. **"Add a canonical-page caution to `q-soroban-cli-bindings`"** and **"Two snippet-only rows no
   Docs page can answer"**: add a pointer to round item 1.3. Do not delete them yet.
m. **"Improvements follow-up"**: point the sls-033, sls-107 and sls-116 bullets at round item
   1.1. Add one line: standing authority to post verified findings as issues and resolution
   comments, never pull requests, with no per-repository cap; an unposted finding stays
   `verified` with a note (owner, 2026-11-16, decision 4).
n. **"Monitor the Horizon protocol-ceiling note"**: "passed on 2026-11-12" becomes "passed on
   2026-11-12 and 2026-11-16 (value 30 at `scannedRef` `01ba44a9`, [round item
   0.2](rounds/2026-11-16-next-phase/items/0.2/EXEC.md))".
o. **"Preserve structured routing intent…", titles bullet** (0.2 input): replace "Fresh titles
   alone drop `stellarDocs.search_wallet_dapp_docs` from `q-tool-wallets-kit`" with: on
   2026-11-16 (982 Docs pages) fresh titles cost three graded rows with no gain, two legacy
   (`q-edge-exhaustive-defi-deep-report` top 5, `q-infra-hubble-vs-rpc-layer` top 1) and one
   routing holdout-lane row by count; the `q-tool-wallets-kit` row no longer moves; under decision
   3 the hold stays ([TITLES-AB.md](rounds/2026-11-16-next-phase/items/0.2/TITLES-AB.md)).
   The `GET /api/quality` line: add the 2026-11-16 candidate result (step 2q).
p. **"`search` does not surface the research lane…"** absorbs "Get research called when a
   question names a SEP or CAP" (step 3). Replace "Whether this meets PH4's bar is the owner's
   decision; the routing repair stays held until the owner rules on PH3" with: the owner ruled
   on 2026-11-16 that PH4 is not met and PH3 does not open (decision 6(a)). The item becomes a
   held note: what reopens it is PH4 evidence of the stated kind, then an owner PH3 ruling.
q. **"Re-evaluate Scout exposure after a routing-contract change"**: add the 2026-11-16 firing:
   Scout 1.9.150 changed the `GET /api/quality` schema; the candidate gave +1 legacy, −1 extended,
   −1 protocol-history, so quality stays excluded
   ([SCOUT-EXPOSURE.md](rounds/2026-11-16-next-phase/items/0.2/SCOUT-EXPOSURE.md)).
r. **"Point agents at the page when a docs hit has no body"**: arm 1 shipped (#446). Keep the
   `sd-059` problem, the next step (compare raw Discovery candidates with the adapter output and
   the site MCP) and the done-when. Cut the 2026-11-14 evidence paragraph to one sentence with
   the ARM-1 link; keep the nine row ids only if the snippet-only item needs them (it names its
   two rows itself, so they can go).
s. **"Add a release and package-version source"**: the owner decides this and a Dashboard lumens
   API source after the production read (round item 3.1; decision 6(b)). Keep the
   `getChangelog` ranking trap.
t. **"Add a runner for Codex and Grok as QA answering clients"**: the hand-run diagnostic comes
   first (round item 4.1, decision 7: 24 tuning rows per client on GPT-6.1 Terra and Grok 4.7,
   no judge, cap USD 8 per client subscription-equivalent; OpenCode only if a subscription login
   works in it). A committed runner only if that shows a defect that needs a before-and-after
   measurement. Done-when follows.

### 3. TODO: merge

- "Keep a default `execute` result under the Grok CLI clip" into "M2": M2 keeps its heading and
  takes the clip facts (20,000-byte head clip; 275 of 565 `execute` results over it) and the
  "status lines first" idea as a candidate. Its free step is round item 3.4.
- "Recount `data.sections` misreads in the next authorized QA round" into "M2": the same free
  read of stored transcripts (round item 3.4) recounts section misreads, `.data` omissions and
  failed calls with an omitted reason. Keep the PR #270 numbers and the sandbox-guard sentence.
- "Get research called when a question names a SEP or CAP" into "`search` does not surface the
  research lane" (step 2p): keep the R result in two sentences, the two general defects, the
  bundle pointer and restore command verbatim, and the "different surface" condition.

### 4. Ledgers

**Loop 2** (`.agents/rounds/2026-11-15-tuning-loop-2.md`):
- Remove the stale `loop2-impl` row and the blank line (58, 59) so the Lanes table is one table.
- The five "on `tune/loop-2-runs`" / "lives on that branch" phrases: link the file on `main`
  instead.
- Line 403: "git history `3d65d0ff`" becomes "the branch bundle above, `3d65d0ff`". Other commit
  ids stay: the header already says the bundle holds them.
- Append "### 2026-11-16: merged and deployed": #447 merged 2026-11-16 00:04:53 UTC as
  `986ffbaa`; deployed as Version `c3596dcc` (orchestrator); the orchestrator verified the
  `stellarOrg` adapter's path from the deployed Worker (round brief
  `2026-11-16-next-phase/briefs/PLAN-BRIEF.md`). If the orchestrator's reply gives the full
  Version ID or the method before merge, use it.
- Append "## Outcome": verdict per item (from "the kept set" entry), spend USD 71.59, the
  retained evidence (P0, P1, P2, R, KEPT-SET, the STEP files, `scans/`) and the current artifact
  that needs it (`.agents/TODO.md` "Tuning loop 2 follow-ups" and "Prove the stellar.org
  source"), and the open work moved to the TODO.
- Retention: delete `briefs/loop2-plan.md` (a launch brief; only `briefs/` itself cites
  `PLAN.md`). Keep `scans/` (the ledger and STEP files interpret it).

**Loop 1** (`.agents/rounds/2026-11-14-baseline-tuning.md`):
- Remove the empty "Lanes" table and the empty "Ledger" heading. Do not reconstruct lanes.
- Add the bundle pointer (same text as loop 2's header) for `tune/loop-1-arm2`,
  `tune/loop-1-arm3` and the three `tune-final-backup*` refs.
- Append "## Outcome": kept arm 1 (owner exception) and arm 2; merged #446 as `0a603453`
  2026-11-15 02:28:53 UTC and deployed (loop 2 ledger header); arm 3 not merged, its map removal
  shipped in loop 2 (#447); spend USD 56.43; retained evidence (BASELINE, ARM-1, ARM-2, ARM-3,
  CASE-DEFECTS and its review, STEP-0-PRIME, TUNE-IMPL-1, TUNING-PLAN and amendments, `arm3/`) and
  the current artifacts that need it (`.agents/TODO.md`, `eval/qa/cases.json`,
  `eval/qa/consistency-register.json`, the battery case that cites CASE-DEFECTS).
- Retention: delete `briefs/baseline.md`.

**Round ledger** (`.agents/rounds/2026-11-16-next-phase.md`):
- 0.2 row, Deployed cell: "Deployed 2026-11-16, Version `5f571cd2-1279-43f1-a445-57c301aa1a50`;
  landing 200 and `/mcp` 401 `Bearer` verified" (orchestrator's instruction, verbatim facts).
- Add the 0.4 row after the pull request exists (lead does this).

## Gates

Run bare in the worktree: `npm run typecheck`, `npm test`, `npm run build`,
`npm run secrets:scan -- --tree`. No area-specific gate applies: nothing under `eval/`,
`improvements/`, `catalog/`, `ecosystem-skills/` or `usage/` changes. Plus two checks:
- every relative link in the four edited files resolves (a short script, output in EXEC.md);
- `git diff --stat` touches only the four files and the two deleted briefs (plus this item's
  folder).

## Stop rule

One pass of edits, one Fable plan review, the lead's own read of the full diff, then the PR. The
round plan's Codex workhorse read of the deletions is not run: DECISIONS.md replaces the per-item
topology with Opus plan, Fable review and Sonnet execution, and adds only reviews that a skill or a
security boundary requires; none applies to a docs-only TODO change. The Fable review checks each
deletion's reason against the repository instead. A finding that needs a fact this lane cannot
get free goes to the report as a question; it does not block the other edits.

## Risks

- Deleting an item whose work is not really done. Mitigation: each deletion has a stated reason
  above; the Fable reviewer checks each against the repository, and the lead re-reads the diff.
- Pre-empting a later item. Mitigation: decisions 2, 6(c) and 7 are recorded, not executed.
- The egress line rests on the orchestrator's statement. Mitigation: it says so, and the report
  asks for the Version ID and method.
- Naming routing holdout-lane rows. Mitigation: holdout-lane routing rows are counts only, as in
  item 0.2's records; no QA held-out or reserve case is opened or classed.

## Needs from the orchestrator

- The full Version ID of the loop 2 deploy (`c3596dcc…`) and how the adapter egress was checked.
  Not blocking: the plan's wording works without it.

## Review reconciliation (Fable, [REVIEW.md](REVIEW.md))

All 17 findings are adopted. Where a finding and a step above differ, the finding's fix governs.

| # | Finding | Disposition |
|---|---|---|
| 1 | 2c misstates ADR-0011 rule 3 | Adopted: use the reviewer's wording, link the ADR, no attribution to rule 3. The report tells the orchestrator that DECISIONS.md 5 paraphrases rule 3 backwards. |
| 2 | Deleting the audit item drops the upstream-ref re-run | Adopted: new bullet under "Improvements follow-up" for `sd-105` to `sd-110` and `sls-117` to `sls-119` (round item 1.1). |
| 3 | 0.2 report item 4 skipped | Adopted: `sd-081` recurrence bullet (1.1); a "Golden answers" item for the Freighter to Varial retitle and the new Scout SDK-status fields (`golden-truth` look, round item 1.1 or 1.3). Open no case beyond what the item already names. |
| 4 | Decisions 2 and 6(c) have no round item | Adopted: 2g stands alone (agentpc; the exposed row is identified by `exposed-row.sha256` in the sealed directory; interim rule from the loop 2 ruling; 3.3's per-case review waits on part (a)). 2d names the three leaves as `GAPS.md` spells them (executor checks) and says they are filed in round item 1.3's change. The report asks which lane carries decision 2. |
| 5 | "six `verified` findings" is stale | Adopted: "six filed findings"; count 11 from the "Reach today" column of the Ledger table. |
| 6 | Egress closed on one parenthesis | Adopted, fallback form: keep the bullet as the reviewer words it, keep its done-when clause, and write the loop 2 entry as "the orchestrator reports…". The report asks for the Version ID, the two calls, their results and the date; with those, a follow-up commit deletes the bullet. |
| 7 | Loop 1 bundle pointer misses `tune/loop-1` | Adopted: use the loop 2 header sentence unchanged. |
| 8 | Loop 1 Outcome omits the baseline | Adopted, with the reviewer's citation list. |
| 9 | Retention details | Adopted: plain-text the `briefs/loop2-plan.md` link in loop 2 `PLAN.md:5` (add the file to the write set); name every retained file or use the reviewer's catch-all sentence; give `scans/` its current need and the off-repo copy; run the link check over every `*.md` in both round folders. |
| 10 | 2b drops the 70-case exposure sentence | Adopted: the reviewer's three sentences. |
| 11 | Absorbed item's done-when | Adopted: keep it as "the bar a later attempt must meet". |
| 12 | 2h stale first sentence | Adopted: the reviewer's wording (8 of 40). |
| 13 | Round-item links | Adopted: define "round item N" once under Priorities; plain "round item N" elsewhere; add the extra pointers (3.1, 3.2, 3.5, 2.2) and the 2026-11-25 00:00 UTC merge deadline in 2k. |
| 14 | Total-guard slack | Adopted: the PR text gives 134, 73 and 69 (Grok guards); the TODO deletion stands. |
| 15 | Loop 2 in-place edits | Adopted: one header sentence after the bundle pointer covers the five location phrases; line 403 stays. Fix only the Lanes table (drop the duplicate row and blank line, give the "awaits…" rows a final state). The Outcome says decision 2(b) replaces "at the next split draw". |
| 16 | TODO style | Adopted: 2o count and link only, no row names; quality result once (2q); 2p evidence paragraph to one sentence; "except round item 4.1 under decision 7" in Priorities; 2t links DECISIONS.md and says no per-token API path; M2 ends with "the free read decides; a paid comparison needs a new owner authorization". |
| 17 | Decision 4 is a standing rule | Adopted: 2m line ends "move this rule into the `improvements-pipeline` skill in round item 1.1's change". The PR notes the unmeasured partial-page half of the "read past the snippet" candidate. |

Write set after reconciliation: `.agents/TODO.md`, the two loop ledgers, the round ledger,
`.agents/rounds/2026-11-15-tuning-loop-2/PLAN.md` (one link), the two deleted briefs, and this
item's folder.
