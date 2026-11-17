# Item 1.1 plan: drain the three upstream handoffs

Lead: Claude Opus 5.5, agentpc `t1r5`. Worktree `/home/tyler/code/raven-wt/np-1.1`, branch
`np/1.1-drain-upstream-handoffs` from `origin/main` at `f44204cb`. Spend: USD 0. Every read is a
keyless public read, and no step is an eval or model-graded. Revision 2 adopts every finding in
[REVIEW.md](REVIEW.md); the reconciliation table is at the end.

## Decision this item changes

- **#429 closes.** sls-033 is retired and the one golden cap that names it is removed. This needs
  split v4. The authority is the orchestrator's answer recorded in [QUESTION.md](QUESTION.md)
  (option 1).
- **#425 closes.** sls-107 is retired after the distinct retirement review, which also covers
  BRLT.
- **#427 stays open** with a dated reply that gives today's result.
- **Ten more findings get a dated status** from one live re-run each: sd-105 to sd-110, sls-117
  to sls-119, and sd-081 at its renamed Docs paths. With sls-033, sls-107 and sls-116 that makes
  thirteen findings.
- **The standing authority to post** (decision 4) moves from `.agents/TODO.md` into the
  `improvements-pipeline` skill, written as a timeless rule.

## Facts re-checked against `f44204cb`

- **The cap.** PLAN.md names two cases, but only `q-tool-wallets-comparison` carries the sls-033
  cap.
  - `q-scf-resolve-passport-superseded-slug` is a tool-lane case outside the split. It cites the
    sls-033 file in `truth.corroboration[1].evidence[2].ref` only.
  - No battery file names sls-107.
- **Wallets case status.** `q-tool-wallets-comparison` is in split v3, SHA-256
  `ceb98d6a612aa2a85b48a20dac953f76b7e67f860092c61c84292dcb53434155`, at 80 tuning, 118 held-out
  and 49 reserve. It is not in tuning. It was checked by id only and has not been opened.
- **Compiled files.** `cases.json` holds the wallets case, and `tool-cases.json` holds the
  passport case. `sample.json` holds neither. `eval/qa/lifecycle-registry.json` stores a
  `caseContentSha256` for both cases.
- **Upstream refs.**
  - sls-033: stellarlight #519 and #742 are closed, and PR #1967 is merged.
  - sls-107: #1900 is closed, and PR #1944 is merged.
  - Both findings already have the 2026-11-14 verification posted upstream.
  - sls-116 (#1952) has had no maintainer reply since our 2026-11-14 comment.
  - sls-119 (#1971, open) is sls-107's EURC successor.
- **Docs threads.** The seven Docs threads have no question for Raven. #3143 and #3151 each have
  a fix pull request that is not live yet (#3147, #3153).
- **sd-081.** The unsuffixed pages answer 200, and the `-js` paths answer 308 to them.
- **Next free id.** It is `sls-120`. No item-1.3 lane exists yet, so nothing is reserved.

## Who does what

- **Retirement reviewer:** Claude Fable 5.2, high. It is a fresh child, distinct from the plan
  reviewer and the executor. It reviews in two passes: part A before v4, part B after the golden
  edit is pushed.
- **Executor:** Claude Sonnet 5.5, high. It runs in three phases, and the lead releases each
  phase.
- **Lead:** opens the pull request, posts the two comments that need its link, and writes the
  report.

## Steps

### Phase 1 (executor), in parallel with reviewer part A. Nobody opens the wallets case.

1. **Split code. No write to `~/backups` in this phase.**
   - Files: `eval/qa/split-amend.mjs`, `test/split-amend.test.mjs`, `eval/qa/tuning-rows.mjs`,
     and a new runner `items/1.1/amend-split.mjs`.
   - Add a pure `moveToTuning({ split, movedId, allowedFrom, countsBefore, caseIds })`.
   - Check order: shape, `countsBefore`, a 247-id disjoint partition, then the id appears exactly
     once and only in a set listed in `allowedFrom`. After that: after counts (tuning +1, source
     set -1), the same partition, and case membership.
   - New checks get new fixed lines that carry no data. The existing D2 lines keep their text.
   - `amendSplit` becomes a thin wrapper that passes `allowedFrom: ["heldOut"]` and D2's
     constants. D2's tests pass unchanged.
   - New tests cover:
     - a move from `heldOut`;
     - a move from `reserve`;
     - an id that is already in tuning;
     - an absent id;
     - a disallowed source set;
     - an id that is not a case.
   - The runner:
     - checks v3's full SHA-256, above, and refuses to overwrite v4;
     - names the id as a constant and passes `countsBefore` {80, 118, 49} with
       `allowedFrom: ["heldOut", "reserve"]`;
     - writes `~/backups/gca-2026-11-14-split-v4.json` with mode 600;
     - appends this note: `2026-11-17: round item 1.1: one non-tuning case moved to tuning for
       the sls-033 cap removal (orchestrator answer in items/1.1/QUESTION.md)`;
     - prints only the three counts and the SHA-256.
   - Run `--dry-run` only in this phase.
2. **sls-033 live re-check.** Run `GET https://stellarlight.xyz/api/projects/search?type=Wallet&limit=200`.
   - Pass: every platform fact has `sourceUrl`, and no unavailable fact lacks a URL.
   - Spot-fetch two `sourceUrl`s.
   - Record the result. Do not edit the finding yet.
3. **sls-116.** Re-run the three open items:
   - Is `soroban-contract-source-verification-service-bax` on any `scfAwarded=true` row?
   - Is a public endpoint serving the 27-award baseline?
   - Do `peer`'s `scfSourceUrl` and `scfAsOf` still read null?

   Add a dated recurrence to the finding, and draft the #427 reply. Post on #1952 only if
   something changed.
4. **The nine findings from 2026-11-14, and sd-081.**
   - Run `npm run improvements:probes -- --service stellar-docs --service stellar-light-scout`.
     It reports only and writes nothing.
   - Use its result for the seven findings that have a probe. For sd-108 and sls-119, run the
     reproduction command in their evidence.
   - Read each upstream thread with `gh api … --jq .body`.
   - Classify each finding with the skill table, and add a dated recurrence or `fixed-upstream`.
   - Reply upstream only where a thread needs one. None did on 2026-11-17, so expect none.
   - sd-081: re-run the TypeScript parse check on each restoration fence at the unsuffixed
     pages, `restore-contract`, `restore-data`, `submit-transaction-wait` and the state-archival
     page, as its earlier evidence did. Add a dated recurrence that names the new paths.
5. **The skill rule.** Add the standing authority to `improvements-pipeline` SKILL.md, in
   timeless words with no decision number or date:
   - post every verified finding as an issue, and resolutions as comments;
   - never post a pull request, and there is no per-repository cap;
   - a finding not posted stays `verified`, with a note.

   Then delete that TODO bullet.
6. Stop. Report phase 1 to the lead.

### Gate before v4 (lead)

Write v4 only if both of these pass:

- the executor's re-check in step 2;
- the trigger re-run in reviewer part A.

If either fails, stop. The cap stays, and nobody opens the case.

### Phase 2 (executor)

7. **Write v4.** Run the runner for real. Record the path, the SHA-256 and the counts.
8. **sls-033 to `fixed-upstream`.** Add dated evidence from step 2 and the resolving ref, PR
   #1967.
9. **golden-truth on the wallets case.** It is now in tuning.
   - Remove the cap sentence that names sls-033 from `golden.notes`.
   - Change any other judge-facing claim only if step 2's live data makes it false, and only at
     the golden-truth bar.
   - Update `truth.verified`: date, by and evidence. Write `rootCause` as
     `improvements/resolved.json (sls-033 receipt)`.
   - Leave `truth.asOf` and `reverifyBy` as they are.
   - Do not act on the Freighter/Varial wording. Note it for the report.
   - **Sibling sweep.**
     - Run a small script that reads the ids from `rg -l -i wallet eval/qa/corpus/battery`
       together with v4 `sets.tuning` and the ids in `tool-cases.json`.
     - It prints the ids that are in tuning or tool-lane, and only a count of the rest.
     - Open only the printed ids. EXEC.md records them, the count, and the fact that the rest
       stay unchecked.
     - Commit no raw list.
   - **Re-judge disposition.** Record it in EXEC.md: none runs, because no model call is
     authorized. The case's `caseInputSha256` changes, so `heldout-read.mjs` leaves the row
     unpaired, and no stored comparison mixes the two goldens.
10. **Passport case.** Repoint its corroboration `ref` to
    `improvements/resolved.json (sls-033 receipt)`. In step 13, put the receipt's commit-pinned
    `sourceUrl` in that row's `note`. This edit is judge-blind.
11. **Compile and check.**
    - Run `npm run eval:qa:compile` and `npm run eval:qa:register`.
    - Parsed-diff check:
      - `cases.json` changes the wallets case and its header hash;
      - `tool-cases.json` changes the passport case and its header hash;
      - `sample.json` changes its header hash only;
      - `lifecycle-registry.json` changes two `caseContentSha256` values;
      - `counts` is unchanged in all of them.
12. **Commit and push.** Commit phases 1 and 2 with normal hooks, then push the branch. Confirm
    that `gh api repos/stellar-experimental/stellar-raven/commits/<sha>` answers. Stop and report
    to the lead.

### Reviewer part B, then phase 3

- **Reviewer part B** works on the pushed branch:
  - reconciles every `rg -n --hidden --glob '!.git' "<id>" .` hit for sls-033 and sls-107;
  - classes dated round records and the generated `inventory/stellar-light.json` OpenAPI text as
    history or upstream text, and leaves them unchanged;
  - checks the golden edit and the passport repoint.
- **13. Resolve.** For sls-033 and then sls-107, with no commit to either finding file between
  the dry run and the real run:
  - Run `npm run improvements:resolve -- … --dry-run`.
    - sls-107's `--live-recheck` names sls-119 (#1971) as the EURC successor.
    - If reviewer A found a BRLT residual, `--live-recheck` names the successor too. File the
      successor first through `improvements:file` as `sls-120`.
  - Post the printed comment.
    - sls-033: stellarlight #519, PR #1967 and #742. #742 is included because an earlier comment
      on that thread said the residual stays open.
    - sls-107: #1900 and PR #1944.
  - Read each comment back. Put the URLs in `--review-evidence` together with the reviewer
    record.
  - Run the real resolve. Then reword the sls-119 line that cites sls-107 so it points to the
    receipt. This is the only edit to another finding outside step 4.
- **14. Records.**
  - **`.agents/TODO.md`:** update the held-out status:
    - the v4 path and SHA-256, and the counts;
    - name v3 as replaced, and say that Mac copies of v2 or v3 are stale;
    - "a future read pairs on v4's held-out count".
  - **`.agents/TODO.md`, finished bullets:** delete those for sls-033, sls-107, the nine
    findings and sd-081.
  - **`.agents/TODO.md`, sls-116:** rewrite its bullet as a dated next check. Name the three
    open items, #1952 and #427, and the exact re-check.
  - **Item records:** write `items/1.1/STATE.md` (the skill's state table, 13 rows) and
    `items/1.1/EXEC.md`.
- **15. Gates,** each run bare:
  - `npm run improvements:index`
  - `npm run improvements:lint`
  - `npm run improvements:lint -- --live`
  - `npm run eval:qa:compile`
  - `npm run eval:qa:lint -- --since origin/main`
  - `npm run eval:qa:lint -- --stale --enforce-floors`
  - `npm run eval:qa:register -- --check`
  - `npm run eval:selftest`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
  - `npm run secrets:scan -- --tree`

  Then commit and push. Post the #427 reply.
- **Lead.** Open the pull request with `Closes #425`, `Closes #429` and `Refs #427`. Comment on
  #425 and #429 with the live result and the pull request link. Add the ledger row.

## Stop rule

- One live re-run per finding. A trigger that still reproduces keeps its status.
- If the sls-033 re-check or reviewer A's trigger re-run fails, there is no v4.
- If any v4 runner check fails, nobody opens the wallets case. Stop and report.
- A finding with a confirmed residual retires only after its successor is filed and linked.
  Otherwise its status stays.
- One reply per thread that needs one. No chasing.

## Risks

- **Exposure order.** The gates and the briefs guard it. No reviewer opens the wallets case
  before v4 exists.
- **Set leak.** The v4 counts show which set the case left. That is accepted, because the case
  is now in tuning. No other non-tuning id is recorded.
- **Snapshot links.** Step 12 pushes before step 13 prints. After the squash merge, an
  off-`main` commit still resolves.
- **Deploy.** None is needed: `improvements/`, `eval/`, `test/` and `.agents/` are not Worker
  bytes. EXEC.md confirms that the build output is unchanged.

## From the orchestrator

- Copy `~/backups/gca-2026-11-14-split-v4.json` to the Mac. The report gives its SHA-256.
- Tuning scans then pass `--split ~/backups/gca-2026-11-14-split-v4.json`.
- Merge. No deploy.
- Tell the item 1.3 lane which ids this item took.

## Reconciliation of REVIEW.md

| # | Disposition |
|---|---|
| 1 | Adopted: step 13 names the targets, including #742; the URLs go in `--review-evidence` |
| 2 | Adopted: step 12 commits and pushes before step 13; no finding-file commit between the dry run and the real run |
| 3 | Adopted: the re-check and reviewer part A gate v4; added to the stop rule |
| 4 | Adopted: step 11's per-file check; the registry is added |
| 5 | Adopted: three gates added in step 15 |
| 6 | Adopted: step 5 (skill rule); step 14 (TODO bullets) |
| 7 | Adopted: step 9's sweep method |
| 8 | Adopted: the answer is appended to QUESTION.md |
| 9 | Adopted: successor filing and linking; sls-119 named; the one sls-119 reword; `--hidden` scan; inventory classed as upstream text |
| 10 | Adopted: disposition recorded in EXEC.md, no re-judge |
| 11 | Adopted: `allowedFrom`; new fixed lines; full v3 hash and counts |
| 12 | Adopted: clause dropped from the v4 note |
| 13 | Adopted: thirteen |
| 14 | Adopted: the lead posts the #425 and #429 comments after the pull request opens |
| 15 | Adopted: `rootCause` spelling; receipt `sourceUrl` in the note; dates unchanged |
| 16 | Adopted: the next free id is taken and reported |
| 17 | Adopted: step 14 wording |
| 18 | Noted: no change |
