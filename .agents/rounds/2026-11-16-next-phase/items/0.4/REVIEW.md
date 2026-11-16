# Item 0.4 plan review

Reviewer: Claude Fable 5.2, high, agentpc `t1r0`. Tier: Claude Fable (docs and taste), as
DECISIONS.md assigns. Read-only; free reads only; no QA case opened; no split file read beyond
`sha256sum`.

**Verdict: adopt after changes. No blocker. 12 should-fix, 5 notes.** Every deletion's work is
done or superseded, but two deletions and one omission drop an open step (2, 3, 10), one rewrite
writes a false statement about ADR-0011 (1), and the retention step leaves a dead link (9).

## Verified, no finding

- #446 `0a603453` 2026-11-15T02:28:53Z; #447 `986ffbaa` 2026-11-16T00:04:53Z; #440 and #442 merged;
  #426 closed 2026-11-14 with the receipt reply; open issues are #429, #427, #425, #223, #167.
- `sls-119` is `reported-upstream` (`improvements/INDEX.md:35`).
- `sha256sum ~/backups/gca-2026-11-14-split-v2.json` = `697c550a…ed12`; the old file = `f683852e…0efa`.
- Lengths, measured with `npx tsx`: instructions 1,899, `search` 1,960, `execute` 1,964.
- Gap ledger: 11 rows have `not re-run` in the "Reach today" column (`GAPS.md` 67 to 76, 79).
- 245 battery cases cite the "Finish the 2026-11-14 golden coverage audit" heading. No lint, test,
  script or skill resolves it or any other heading the plan deletes or merges.
- Loop 2 ledger defects are at the lines the plan names (58 to 59; 148, 176, 296, 303, 370; 403).
  `P0.md`, `P1.md`, `P2.md`, `R.md` are on `main`. Spend sums: loop 1 56.43, loop 2 71.59.
- Six cases have `reverifyBy` before 2027; the 11-30 one is `q-infra-software-versions-current-protocol`.
- 0.2 facts match `TITLES-AB.md`, `SCOUT-EXPOSURE.md` and `EXEC.md` step 10 (`scannedRef` `01ba44a9…`).
- The 0.2 deploy Version `5f571cd2-1279-43f1-a445-57c301aa1a50` is on #223 (comment of
  2026-11-16T22:41:28Z). Cite that comment as the stamp in the round ledger cell.
- All 88 relative links in the four files resolve today.
- Rules: no `solo://`, no retired sibling repo, no skill edit, no held-out or reserve case named.

Not verifiable here: deploy `c3596dcc`. The Cloudflare read returns HTTP 403 (this session has no
Workers scope). See finding 6.

## Findings

1. **should-fix. Step 2c misstates ADR-0011.** The ADR's rule 3 reads "A fix for the live-data
   weakness that gives back most of the token saving" and it reopens the trim
   (`research/decisions/0011-tool-surface-stays-code-mode-trimmed.md:72`). The plan writes "rule 3
   stands: a fix that keeps most of the token saving reopens the question", copied from
   DECISIONS.md decision 5. Fix: "The owner accepted the trimmed surface's loss on live-data
   questions as the price of the trim (2026-11-16, decision 5). A fix that keeps most of the token
   saving reopens it. ADR-0011's reopening rules are unchanged." Link the ADR; do not attribute
   the sentence to rule 3. Tell the orchestrator that DECISIONS.md paraphrases rule 3 backwards.

2. **should-fix. Deleting "Finish the 2026-11-14 golden coverage audit" drops an open step.**
   `TODO.md:359` says "On the next drift refresh, read each ref and re-run each finding's
   reproduction commands". Item 0.2 was that refresh and did not do it (no trace in `0.2/EXEC.md`);
   the round plan gives it to 1.1 (`PLAN.md:154`). Fix: add a bullet to "Improvements follow-up":
   "`sd-105` to `sd-110` and `sls-117` to `sls-119` (filed 2026-11-14): read each upstream ref and
   re-run each reproduction command once (round item 1.1)." The rest of the deletion is sound.

3. **should-fix. The plan takes item 3 of the 0.2 report and skips item 4.**
   `0.2/REPORT.md:69-74` and `0.2/EXEC.md:155-158` leave three open inputs that no TODO line holds
   (`grep -n 'sd-081\|Varial' .agents/TODO.md` is empty). Fix: add to "Improvements follow-up":
   "`sd-081` cites Docs pages that lost their `-js` suffix; run a recurrence probe at the new paths
   (round item 1.1)." Add under "Golden answers": Docs retitled the Freighter guides "Varial" and
   Scout 1.9.150 added SDK-status fields; `q-tool-freighter-wallet`, `q-tool-wallets-comparison`
   and the matching `eval/qa/cases.json` entries need a `golden-truth` look (round item 1.1 or
   1.3). Done when each is edited or confirmed.

4. **should-fix. Decisions 2 and 6(c) have no round item, so "their own item" points nowhere.**
   The round plan's items run 0.1 to 4.1; none commits the overlap list, amends the split, or files
   the three gaps (`PLAN.md:410` only says agentpc is needed for "decision 2(b)"). Fix:
   - 2g: make the item stand alone. Name the place (agentpc; the exposed row is identified by
     `exposed-row.sha256` in the sealed directory, loop 2 ledger line 463). Keep the interim rule:
     until the list is committed, the loop 2 ruling stands (no lane reads per-row output of the
     legacy and extended rows; aggregate counts only), so round item 3.3's per-case review waits on
     part (a).
   - 2d: replace "by their own item" with the three leaves (`assets.public-sector-cbdc`,
     `wallets.scams-phishing`, `wallets.pi-network`) and "filed as content-gap issues in round item
     1.3's change (decision 6(c))".
   - Report: ask the orchestrator which lane carries decision 2.

5. **should-fix. Step 2d leaves "six `verified` findings" (`TODO.md:61`).** All six are
   `reported-upstream` (`improvements/INDEX.md`). Fix: "six filed findings cover 9 of them". Write
   the count as 11, and tell the executor to count the "Reach today" column of the Ledger table:
   the "Gaps not filed" table uses "not re-run" for a different set of 8 rows.

6. **should-fix. The egress bullet is closed on one parenthesis.** The only source is
   `briefs/PLAN-BRIEF.md:84`. It gives no command, result or time, and `rounds/README.md` asks for
   all three ("'Tests passed' is not evidence"). The plan also replaces the bullet with a done
   line, against the TODO header ("Delete it when it is done"). Fix: make the orchestrator's answer
   (full Version ID, the two operations called, what each returned, the date) a condition of the
   removal.
   - If it arrives: put it in the loop 2 "merged and deployed" entry, delete the bullet and its
     done-when clause, and add no done line.
   - If it does not: keep the bullet as "Deployed after #447. The orchestrator reports the adapter
     path verified (Version `c3596dcc`); record the command and result in the loop 2 ledger, then
     delete this bullet", and keep the done-when clause.

7. **should-fix. The loop 1 bundle pointer omits `refs/heads/tune/loop-1`.** That ref alone holds
   the kept-set tip `5fca33a3` (ledger line 119), and it holds `a321c5b7` and `3eb40f56`
   (`git bundle list-heads`, then `git merge-base --is-ancestor`). Fix: use the loop 2 header
   sentence unchanged ("This round's branches and the commits it cites are archived in the branch
   bundle …"), or list `tune/loop-1`, `tune/loop-1-arm2`, `tune/loop-1-arm3` and the three backups.

8. **should-fix. The loop 1 Outcome omits Plan 1, the baseline.** Once the empty "Ledger" heading
   goes, the ledger holds no result for it. Fix: add "Baseline: 247 of 247, 82 correct, 144
   partial, 21 wrong; stamp `2026-11-14T20-13-51-variantA` on `66301389`; USD 45.27 of the 90 cap
   (`BASELINE.md`); merged in #442 as `06757beb`", and say the USD 56.43 is the tuning loop only.
   Also correct "the battery case that cites CASE-DEFECTS": four battery cases, `eval/qa/cases.json`,
   `eval/qa/sample.json`, `eval/qa/consistency-register.json` (which also cites
   `CASE-DEFECTS-REVIEW.md`) and `sd-074`, `sd-109`, `sd-110` cite `BASELINE.md` or `CASE-DEFECTS.md`.

9. **should-fix. Retention: the scope is right, three details are wrong.** Deleting only the two
   launch briefs fits `.agents/README.md`: the plans, amendments and reviews define the labels the
   ledgers and the TODO still use (`TODO.md:244` R8, `:267` D7), so they stay. But:
   - `2026-11-15-tuning-loop-2/PLAN.md:5` links `briefs/loop2-plan.md`. The plan's parenthesis has
     this backwards, and its link check covers four files, so the dead link passes. Fix: replace
     that link with plain text (`briefs/loop2-plan.md`, deleted at closure), add the file to the
     write set and the diff gate, and run the link check over every `*.md` in both folders.
   - The Outcome lists leave files neither named nor deleted: loop 2 `PLAN.md`, `PLAN-REVIEW.md`,
     `PLAN-AMENDMENTS.md`; loop 1 `ARM-3-IMPL.md`, `ARM-3-REVIEW.md`, `KEPT-SET.md`,
     `TUNE-DIFF-REVIEW.md`, `TUNING-PLAN-REVIEW.md`, `review.json`. Fix: name each, or write "every
     other file in the folder: defines the rule labels the ledger and the TODO cite".
   - `scans/`: the stated reason ("the ledger and STEP files interpret it") is a link from a
     historical record, which the README excludes. Fix: name the current need (the loop 2
     follow-up items rest on its claim reads and counts) and name the off-repo raw output,
     `~/backups/loop2-scans-2026-11-15/scans/` (`scans/README.md`).

10. **should-fix. Step 2b drops the 70-case sentence, the only record that answers were read
    before the draw.** The audit ledger records the run, not its bearing on the split. Fix: keep
    one exposure sentence: "The audit's battery test read the answers of 70 headline cases before
    the draw ([ids](rounds/2026-11-14-golden-coverage-audit/qa/ids.txt)). The baseline and one read
    per loop ran the held-out rows, counts only. One held-out answer was exposed (loop 2); it moves
    to tuning under decision 2(b)."

11. **should-fix. Step 3 does not say what happens to the absorbed item's done-when.** "Get
    research called…" holds the measured bar for any later pointer: per-fire follow rate above
    33%, two rows up by trace, no regression, at least 17 rows twice (`TODO.md:716-719`). Fix: keep
    that sentence in the held note as "the bar a later attempt must meet", beside the host item's
    own done-when (19 of 19).

12. **should-fix. Step 2h says "Nothing else", but the item's first sentence is stale.**
    `TODO.md:309` says the "Routing reach" bullet holds "7 of 40"; that bullet is now a
    cross-reference with no number, and loop 2 measured 8 of 40 (loop 2 ledger line 203;
    `TODO.md:329`). The round plan lists this ("the first paragraph is stale"). Fix: "Routing reach
    of the `stellarOrg` operations (top five for 8 of 40 off-golden questions, loop 2 step 2) is
    this item. The family decider record answers it: an engine is not the fix."

13. **note. About twenty links to the round's PLAN.md.** That file is a proposal, and DECISIONS.md
    overrides it (machine, authors, reviewers). Fix: one sentence under "Priorities" defines the
    term: "'Round item N' is an item of the [2026-11-16 round](rounds/2026-11-16-next-phase.md);
    its [plan](…/PLAN.md) proposes and the [owner decisions](…/DECISIONS.md) bind." Items then say
    plain "round item 1.3". For consistency add the pointers the plan misses: "Read the free
    telemetry…" to 3.1 (its timeout bullet to 3.2); the micro-map rename, the date gap and the
    fingerprint message to 3.5; "Software Versions (not filed)" to 2.2; and in step 2k the merge
    deadline, before 2026-11-25 00:00 UTC (DECISIONS.md, "Timing").

14. **note. "Point the total-guard failure": delete, but record the real slack.** 2,197 is the
    slack against a guard that cannot fail first. The binding guards are Grok's: 134, 73 and 69
    characters. Their failure text names no file either. Deletion still holds, because the
    instructions take no generated text now and `source-families.mjs` feeds only the `search`
    description. Put 134, 73 and 69 in the pull request text, not 2,197.

15. **note. Loop 2: prefer a header line to in-place edits.** `rounds/README.md` says "Append; do
    not rewrite earlier entries", and 0.3 solved the same problem with a header pointer. One
    sentence after it ("`P0.md`, `P1.md`, `P2.md` and `R.md` are in this round's folder on `main`
    since #447; entries that place them on `tune/loop-2-runs` predate the merge") covers the five
    phrases. If the lead edits in place, change only the location phrase. In the Outcome, say that
    decision 2(b) replaces "at the next split draw" (line 464). The Lanes rows that still say
    "awaits…" can take a final state in the same edit.

16. **note. TODO style: three rewrites add history the header sends to the ledger.**
    - 2o: give the count and the link only. The two row names are in `TITLES-AB.md`, and per-row
      output of legacy rows is what the loop 2 ruling keeps lanes away from. State the
      `GET /api/quality` result once, in 2q.
    - 2p: after the ruling, cut the 2026-11-14 evidence paragraph to one sentence with the
      `BASELINE.md` link.
    - 2a and 2t: the Priorities sentence needs "except round item 4.1 under decision 7", as the
      round ledger says. In 2t link DECISIONS.md for the cap and carry "no per-token API path".
    - M2 still ends "Then run 4,000 against 6,000…". Say the free read decides (round item 3.4's
      stop rule) and a paid comparison needs a new owner authorization.

17. **note. Decision 4 is a standing rule, and the TODO is not its home.** `.agents/README.md`
    sends "a rule that binds future work" to AGENTS.md, a skill or an ADR. Skills are out of this
    item's scope. Fix: keep the line in 2m and end it "move this rule into the
    `improvements-pipeline` skill in round item 1.1's change". The "read past the snippet" deletion
    is sound by its own done-when; say in the pull request that the partial-page-of-rows half of
    the candidate was never measured.
