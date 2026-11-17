# Item 1.1 plan review

Reviewer: Claude Fable 5.2, high, agentpc `t1r6`. Read-only against `f44204cb`. I did not open
`q-tool-wallets-comparison` or its compiled row, and I read nothing under `~/backups` beyond `ls`
and `sha256sum`. Every content grep excluded the battery, `cases.json` and `sample.json`. Plan
line numbers are from `PLAN.md` as written at 2026-11-17 00:03.

The plan's facts hold except where a finding says otherwise. Checked and correct:

- v3 hashes to `ceb98d6a612aa2a85b48a20dac953f76b7e67f860092c61c84292dcb53434155` (`sha256sum`).
- The passport case is tool-lane and cites sls-033 only in `truth.corroboration[1].evidence[2].ref`.
  It is the only battery file besides the wallets case that names sls-033 (`rg -l`, wallets file
  excluded). No battery file names sls-107.
- Upstream states and the two comment ids in plan lines 29 to 35 match GitHub.
- Seven of the nine 2026-11-14 findings have a probe; sd-108 and sls-119 do not.
- The probe script writes only with `--append-drafts` and accepts a repeated `--service`
  (`scripts/improvements-run-probes.mjs:19-21`).
- `eval/qa/lint-corpus.mjs:517-519` exempts `improvements/resolved.json` from the
  symmetric-caution warning.

## Findings

1. **blocker. Plan lines 96 to 97 (where the resolution comment goes).** Every upstream ref of
   both findings is closed, so "post on every ref that is still open" posts nothing, and
   `--upstream-commented` would then attest to comments that do not exist.
   - Evidence: `gh api` today: stellarlight #519, #742 and #1900 are closed; PRs #1944 and #1967
     are merged. The resolver never names a ref. It prints one comment whenever any recorded ref
     is not gone (`scripts/improvements-resolve.mjs:47`, `:56-58`, `:103-105`), so "where the
     resolver asks" selects nothing.
   - `.agents/TODO.md:481-485` already names the targets: #519 and PR 1967 for sls-033, #1900 and
     PR 1944 for sls-107. The sls-111 and sls-115 receipts in `improvements/resolved.json` posted
     on the closed issue and the merged PR.
   - Change: name the targets in the plan. sls-033: #519 and PR 1967. sls-107: #1900 and PR 1944.
     For #742, the third ref the resolver counts for sls-033, either post there too or record why
     not. I recommend posting: `improvements/resolved.json:2931` shows an earlier comment told
     that thread the sls-033 residual stays open. Put the comment URLs in `--review-evidence`, as
     the sls-111 receipt does.

2. **blocker. Plan lines 94 to 99 (commit and push before the dry run).** The printed comment
   links a snapshot at `git log -1 -- <finding>` (`scripts/improvements-resolve.mjs:67-71`,
   `:168-172`). Step 2 edits sls-033, and the plan never commits it before step 4.
   - Evidence: the last commit that touches sls-033 is `cfb8a6be`, where the file says
     `reported-upstream`. Run from an uncommitted tree, the posted "immutable source snapshot"
     shows the old status and none of today's evidence. Committed but not pushed, the link is a
     404 when the maintainer opens it.
   - The skill says the same: "Commit first, or omit the snapshot" (`improvements-pipeline`
     SKILL.md, lines 89 to 90).
   - Change: order step 4 as: commit the `fixed-upstream` edit; push the branch; confirm
     `gh api repos/stellar-experimental/stellar-raven/commits/<sha>` answers; dry run; post; real
     run. No commit may touch either finding file between the dry run and the real run, or the
     receipt's `sourceUrl` differs from the one posted. An off-`main` commit keeps resolving after
     the squash merge: receipt commit `433b3848…` is on no branch and still answers.

3. **should. Plan lines 45 to 46, 65 to 70, 83 to 93 and 145 to 148 (order of the irreversible
   step).** The split amendment and the first read of the wallets case happen in steps 1 and 2.
   The sls-033 live re-check comes after v4 is written, and the distinct retirement review comes
   after the case is opened. If either fails, a blind case is spent and the cap must stay.
   - Change: before step 1, run the sls-033 live re-check and the part of the retirement review
     that needs no QA case (finding, upstream refs, deployment, trigger, adjacent rows). Write v4
     only if both pass. Reference reconciliation stays after the golden edit. Add to the stop
     rule: "if the sls-033 re-check or the reviewer's trigger re-run fails, do not write v4".
   - The risk is low but the reorder is free. My own read at 2026-11-17T00:07:15Z:
     `type=Wallet&limit=200` returns 74 rows, 123 platform facts, 10 unavailable, 0 without
     `sourceUrl`, 0 null `productKind`, 10 rows with `availabilityCheck`. This is review evidence
     only. It is not the executor's re-run or the distinct reviewer's.

4. **should. Plan lines 65 to 67 and 141 (compiled files and the diff check).** The gate "the
   parsed `cases.json` diff touches only the two intended cases" cannot pass as written.
   - Evidence, by id only: `cases.json` holds the wallets case and not the passport case.
     `tool-cases.json` holds the passport case. `sample.json` holds neither.
     `eval/qa/compile-qa.mjs:314-337` splits them that way.
   - `eval/qa/lifecycle-registry.json` is also regenerated and stores a `caseContentSha256` per
     case, so two of its entries change. The plan's file list omits it, and CI fails on a
     generated file that is out of sync.
   - Change: the check becomes: `cases.json` changes one case (wallets) and its header hash;
     `tool-cases.json` changes one case (passport) and its header hash; `sample.json` changes its
     header hash only; `lifecycle-registry.json` changes two `caseContentSha256` values. `counts`
     is unchanged in all four. Add the registry to step 2's files.

5. **should. Plan lines 128 to 139 (gates).** The plan touches `eval/`, and three CI gates for
   that area are missing.
   - Evidence: `CONTRIBUTING.md:41` and `.github/workflows/ci.yml:96-98` run
     `npm run eval:selftest`, `npm run eval:qa:lint -- --stale --enforce-floors` and
     `npm run eval:qa:register -- --check`.
   - Change: add all three. All are offline.

6. **should. Plan lines 122 to 124 (work the TODO assigns to this item).** Two parts of the
   item are not in the plan.
   - `.agents/TODO.md:473-476`: "Move this rule into the `improvements-pipeline` skill in round
     item 1.1's change" (the standing authority to post, decision 4). Add a step that edits the
     skill and deletes the TODO bullet. Skill text stays timeless: no decision number, date or
     round id.
   - `.agents/TODO.md:478-493` holds five bullets that this item completes or changes (sls-033,
     sls-107, sls-116, the nine findings, sd-081). Step 7 names only the held-out status. Delete
     the finished bullets. Rewrite the sls-116 bullet as the dated next check that skill step 8
     asks for. It still says "Reply with the 2026-11-14 result", and that reply is already posted.

7. **should. Plan lines 78 to 79 (sibling sweep).** `rg -l "wallet" eval/qa/corpus/battery` reads
   every case, including held-out and reserve cases. The plan does not say how the executor then
   picks the cases it may open, or what it records.
   - Risk: the executor prints the split with `jq` or `cat` to decide, or it records the full
     `rg -l` list beside the opened list. By elimination that names which cases are not in
     tuning, against `.agents/TODO.md:53-54`.
   - Change: give the method. A short script reads the `rg -l` ids and v4 `sets.tuning`, prints
     the ids in both, and prints only a count of the rest. Tool-lane cases are found by path in
     `tool-cases.json`. EXEC.md records the opened ids and that count. The raw list is not
     committed. Say that the unopened siblings stay unchecked, which is the honest limit of the
     sweep.

8. **should. Plan lines 9 to 11 (authority for the amendment).** The plan cites
   `QUESTION.md` for the orchestrator's choice, but `QUESTION.md` holds only the question. The
   answer is on a terminal screen, and "screen history is not a record" (`AGENTS.md`,
   "Coordination").
   - Change: append the answer to `QUESTION.md` (who, when, the option, the words) before
     step 1. Decision 2(b) covered one row, so this record is the only authority for v4.

9. **should. Plan lines 88 to 93 and 147 to 148 (successors and the reference scan).**
   - A finding with a residual retires only when its ref carries the successor link (skill step
     7: "stays until its open ref carries a successor link"). The plan files the successor but
     does not say that it is posted upstream or linked. Change: file it with
     `improvements:file` under decision 4, and name the successor id and URL in `--live-recheck`
     so the printed comment carries the link. The sls-111 receipt is the pattern.
   - sls-107 already has one successor: sls-119 (stellarlight #1971, open) is its EURC residual
     (`sls-119…md:13`). Name it in the sls-107 `--live-recheck` text. After the retirement,
     reword that sls-119 line, which says "sls-107 (fixed-upstream…)", to point at the receipt.
     Plan line 121, "Change no other finding", needs that one exception.
   - BRLT today (`dataAsOf` 2026-11-16T22:21:02Z, 37 rows, 0 null `assetType`): the Settle
     Network row has `issuerOfRecord`, `issuerOfRecordCheck`, the note, the source URL and
     `issuerOfRecordAsOf` all null. USDT0 has check `not-named`, a note and a date. BRLT is the
     one row the check never ran on. The reviewer decides; this is the read.
   - `rg -n "<id>" .` skips hidden directories, so it misses `.agents/`. Evidence:
     `rg --hidden` finds sls-033 in `.agents/TODO.md` (2 lines) and 26 files under
     `.agents/rounds/`. Change: the reviewer runs `rg -n --hidden --glob '!.git' "<id>" .` and
     classes dated round records as history, left unchanged.
   - `inventory/stellar-light.json:6` and `:4993` name sls-033 in the upstream's own OpenAPI
     text. It is generated. Class it as upstream text and leave it.

10. **should. Plan lines 72 to 79 (golden-truth close step).** `golden-truth` section 6 asks:
    "If a stored run's decision depended on the changed golden, re-judge that row and record the
    direction." The plan is silent on it.
    - Change: record the disposition in EXEC.md. No re-judge runs, because a re-judge is a
      model call and nothing authorizes one. The stored verdicts for this case predate the cap
      removal. Its `caseInputSha256` changes, so `eval/qa/heldout-read.mjs` (line 11) leaves the
      row unpaired on a later read and no stored comparison silently mixes the two goldens.

11. **should. Plan lines 50 to 57 (`moveToTuning` and the D2 wrapper).** "Moves an id from
    `heldOut` or `reserve`" and "D2's tests pass unchanged" conflict unless the wrapper keeps a
    held-out-only rule.
    - Evidence: `test/split-amend.test.mjs:122-127` expects check `notHeldOut` for a reserve
      match. If `moveToTuning` accepts reserve and then compares the after counts, the wrapper
      throws `countsAfter` instead.
    - Change: give `moveToTuning` an allowed-source argument that is checked before the after
      counts. `amendSplit` passes `["heldOut"]`; the 1.1 runner passes both. Add new fixed lines
      for the general checks. Do not edit the text of the existing lines: they carry D2's
      numbers (`eval/qa/split-amend.mjs:28-31`), and "the fixed-line rule" does not otherwise
      survive a `countsBefore` argument.
    - State the runner's `countsBefore` as v3's 80, 118 and 49, and give the full v3 hash from
      the top of this file. The plan abbreviates it.

12. **nit. Plan lines 60 to 62 (v4 note).** The note is appended to v3's `amended` string, which
    already ends with "strata describe the draw, not the amended sets". The clause would appear
    twice. Drop it from the new note.

13. **nit. Plan line 123 ("all twelve findings").** The plan covers thirteen: sls-033, sls-107,
    sls-116, sd-105 to sd-110, sls-117 to sls-119 and sd-081.

14. **nit. Plan line 100 (comments on #425 and #429 "with the PR link").** The pull request does
    not exist while the executor runs; the lead opens it afterwards. Have the lead post those two
    comments after it opens the pull request, or drop the link and let `Closes` connect them.

15. **nit. Plan lines 76 to 77 and 81 (the two `resolved.json` pointers).**
    - Write the `rootCause` as `improvements/resolved.json (sls-033 receipt)`, with a space. A
      form such as `improvements/resolved.json#sls-033` misses the exemption at
      `lint-corpus.mjs:519` and raises the symmetric-caution warning.
    - The receipt does not hold the sentence the passport case relies on (duplicate Stellar
      Passport rows under two slugs). Keep that reachable: put the receipt's commit-pinned
      `sourceUrl` in the evidence row's `note`. It is known after finding 2's commit.
    - Leave `truth.asOf` and `truth.reverifyBy` of the wallets case alone, since one claim is
      re-checked and not the case. If either moves, the lint needs `--stale`.

16. **nit. Plan lines 91 to 92 and 157 to 158 (id reservation).** No 1.3 lane exists yet: there
    is no worktree, branch or item folder for it. `PLAN.md:188` tells that lane to reserve ids
    when it starts. Nothing is reserved today. The next free id is `sls-120` (active maximum 119,
    resolved maximum 115). Take it by the skill's rule and tell the orchestrator, so that 1.3
    starts above it.

17. **nit. Plan line 122 (TODO held-out status).** Besides the path, hash and counts, two
    sentences go stale: "a future read pairs on v3's 118" (`.agents/TODO.md:53`) and the line on
    stale Mac copies (`:43-46`), which must now name v3 as well. State the counts and no more.

18. **nit. Plan lines 108 to 121 (step 6, for information).** The plan needs no change here.
    - Probes today: 7 recurring, 0 fixed-candidate, 0 errors, and the tree stayed clean.
    - The unsuffixed sd-081 pages answer 200: `restore-contract`, `restore-data`,
      `submit-transaction-wait` and the state-archival page. The three `-js` paths answer 308 to
      them, so the finding's links still resolve.
    - stellar-docs #3143 and #3151 each have a triage-bot fix pull request (#3147, #3153) that is
      not live yet. #3146 has a "Decision needed" question addressed to the Docs maintainers, not
      to Raven. None of the seven Docs threads asks Raven for a reply today.

## Verdict

Adopt after fixing findings 1 and 2 (both in step 4) and reconciling 3 to 11; the plan's facts,
scope and stop rule are otherwise sound.
