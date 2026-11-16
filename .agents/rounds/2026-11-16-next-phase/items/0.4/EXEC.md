# Item 0.4 execution

Executor: Claude Sonnet 5.5, agentpc. Worktree `/home/tyler/code/raven-wt/np-0.4`, branch
`np/0.4-todo-ledgers` on `000a30de`. Plan and reconciliation: [PLAN.md](PLAN.md),
[REVIEW.md](REVIEW.md). Docs only; no code, golden, skill or generated file changed. No model
call, no paid call, no GitHub write (two `gh` reads: PR merge times, the #223 comment).

## What changed, per plan step

**Step 1: TODO deletions** (`.agents/TODO.md`)
- Deleted "Find what costs the trimmed surface accuracy on live-data questions" (decision 5 is
  one sentence in the section intro, step 2c).
- Deleted "Point the total-guard failure at its sources".
- Deleted "Finish the 2026-11-14 golden coverage audit". Its open steps now live elsewhere: the
  upstream-ref re-run and the `sd-081` probe under "Improvements follow-up" (findings 2, 3), and a
  new "Look at the Freighter and Scout SDK-status goldens" item under "Golden answers" (finding 3).
- Deleted "Measure 'read past the snippet' guidance".
- Deleted the "Inbound handoff #426 (sls-029)" bullet.

**Step 2: TODO rewrites**
- 2a Priorities: rewritten; "round item N" defined once there (finding 13); "except round item
  4.1 under decision 7" added (finding 16).
- 2b Held-out status: 247 cases, SHA `697c550a…`, 79/119/49, the `-v2` file, two loops, the
  reviewer's exposure sentences (finding 10); the old 246 and 70-case-only text is gone.
- 2c Live-data sentence in the section intro, in the reviewer's wording, linked to ADR-0011 through
  the existing link and not attributed to rule 3 (finding 1).
- 2d "Audit source coverage": 15 confirmed (no "28 single observations"), "six filed findings", 11
  "not re-run" leaves counted from the "Reach today" column, round item 1.3, the three
  confirmed leaves filed under decision 6(c) (findings 4, 5).
- 2e "Report per-source attempts": "comes before the coverage audit" dropped; points at round item
  3.2.
- 2f/3 "M2" absorbs the Grok-clip item and the `data.sections` recount (their facts, the PR #270
  numbers, the sandbox-guard sentence); ends "the free read decides; a paid comparison needs a new
  owner authorization"; round item 3.4. Both source items deleted.
- 2g "Settle the routing-row overlap": decision 2 (a) and (b), agentpc, `exposed-row.sha256`,
  interim loop 2 rule, round item 3.3 waits on (a); old counts kept as the old measurement
  (finding 4).
- 2h "Treat stellar.org routing reach": first sentence now 8 of 40 (finding 12); round item 3.3
  sentence added.
- 2i "Prove the stellar.org source": egress bullet kept in the reviewer's fallback form with its
  done-when clause (finding 6); round items 1.2 and 1.3 pointers; Algolia decision stated and
  dropped from done-when.
- 2j SEP-7: round item 1.3 pointer.
- 2k Event-tied goldens: names `q-infra-software-versions-current-protocol`; round items 1.4, 2.1,
  2.2; the 2026-11-25 00:00 UTC deadline (finding 13).
- 2l `q-soroban-cli-bindings` and the two snippet-only rows: round item 1.3 pointers; not deleted.
- 2m "Improvements follow-up": round item 1.1 pointers on sls-033, sls-107, sls-116; the standing
  authority line ending "move this rule into the `improvements-pipeline` skill in round item
  1.1's change"; new `sd-105`..`sls-119` bullet and `sd-081` bullet (findings 2, 3, 17).
- 2n Horizon monitor: 2026-11-16 pass, value 30, `scannedRef` `01ba44a9` (checked against 0.2
  `EXEC.md` step 10).
- 2o Titles hold bullet: counts and link only (finding 16).
- 2p/3 PH4 item: ruling recorded as held; the evidence paragraph cut to one sentence with the
  `BASELINE.md` link; "Get research called when a question names a SEP or CAP" merged in (R result
  in two sentences, both defects, the bundle pointer and restore command verbatim, the "different
  surface" condition) and its done-when kept as "the bar a later pointer attempt must meet"
  (finding 11). Heading unchanged.
- 2q Scout exposure: 2026-11-16 firing, +1 legacy, −1 extended, −1 protocol-history, quality stays
  excluded.
- 2r "Point agents at the page": evidence paragraph cut to one sentence with the ARM-1 link; the
  `sd-059` problem, next step and done-when kept.
- 2s Release source: decided after round item 3.1 (decision 6(b)); `getChangelog` trap kept.
- 2t Codex/Grok runner: round item 4.1 first, decision 7 linked, "no per-token API path".
- Also: telemetry item names round items 3.1 and 3.2; the three "Tuning loop 2 follow-ups" items
  that are round item 3.5 say so (finding 13).

**Step 4: ledgers**
- Loop 2 (`2026-11-15-tuning-loop-2.md`): one header sentence says the four run records are on
  `main` since #447 (finding 15; the five location phrases and the line 403 text are not
  rewritten); the Lanes table is one table (duplicate `loop2-impl` row and blank line removed, the
  two "awaits…" rows given a final state); appended "### 2026-11-16: merged and deployed" and
  "## Outcome" (verdicts, USD 71.59, decision 2(b) replaces "at the next split draw", every retained
  file named by group, `scans/` need and off-repo copy `~/backups/loop2-scans-2026-11-15/scans/`);
  `briefs/loop2-plan.md` deleted; its link in `2026-11-15-tuning-loop-2/PLAN.md` is plain text.
- Loop 1 (`2026-11-14-baseline-tuning.md`): empty Lanes table and Ledger heading removed; the loop 2
  bundle sentence added unchanged (finding 7); "## Outcome" with the baseline (82/144/21, stamp,
  `66301389`, USD 45.27, #442 `06757beb`), the tuning loop (kept set, #446, USD 56.43 as the
  tuning loop only), every retained file named, and the current citers (finding 8);
  `briefs/baseline.md` deleted.
- Round ledger: 0.2 Deployed cell set to Version `5f571cd2-1279-43f1-a445-57c301aa1a50`, landing
  200 and `/mcp` 401 `Bearer`, stamped with the #223 comment of 2026-11-16 22:41 UTC. The 0.4 row
  is not added.

## Gates

Run bare in this worktree.

| Gate | Result |
|---|---|
| `npm run typecheck` | Exit 1 at first: no `.dev.vars`, so `Env` lacked `OAUTH_KV` (77 errors, none in a file I touched). After the README's step 2 and 3 (the CI stub `.dev.vars`, git-ignored, then `npm run typegen`): exit 0. |
| `npm test` | Exit 0: 164 files passed, 5 skipped; 3,608 tests passed, 3 expected fail, 5 skipped. Run before the `.dev.vars` stub existed. |
| `npm run build` | Exit 0 (the Wrangler dry run). |
| `npm run secrets:scan -- --tree` | Exit 0: "clean — scanned all tracked files". |
| Link check | `tmp/check-links.mjs`: 56 files (the TODO, the round ledger, both loop ledgers, every `*.md` in both loop folders), 131 relative links, 0 broken. |
| `git diff --cached --stat origin/main` | 11 paths: the TODO, the three ledgers, loop 2 `PLAN.md`, the two deleted briefs, and this item's four files (`PLAN.md`, `REVIEW.md`, `briefs/`). EXEC.md joins at commit. Nothing else. |

## Deviations and facts re-checked

- The first link-check run reported two "broken" links in `scans/p1/trace-changed-rows.md` and
  `scans/p2/p2-trace.md`. Both are quoted, truncated snippets (`[CAP-67](.../cap-0067.md)`, `...`)
  in prose I did not touch, not links. The script skips targets that begin with `...`.
- Checked and held: #447 merged 2026-11-16 00:04:53 UTC (`986ffbaa`), #446 2026-11-15 02:28:53 UTC
  (`0a603453`) by `gh pr view`; #426 closed; open issues 429, 427, 425, 223, 167; `sls-119` is
  `reported-upstream`; the split-v2 SHA starts `697c550a…`; the baseline numbers match
  `BASELINE.md`; both bundle refs the TODO names exist in the bundle; the "not re-run" count is 11;
  the 0.2 deploy Version is on the #223 comment.
- Not verifiable here: deploy `c3596dcc` and the adapter egress check. The ledger entry says "the
  orchestrator reports". The TODO keeps the egress bullet and its done-when clause (finding 6).
- The loop 1 Outcome cites both `BASELINE.md` and `CASE-DEFECTS.md` citers as grep found them: three
  files in `eval/qa/`, four battery cases, `sd-074`, `sd-109`, `sd-110`.
- Two plan texts were already true before my edit, so nothing changed for them: the bundle pointer
  at the top of the loop 2 ledger (0.3) and the round ledger's missing 0.4 row (lead's).

## For the lead

- DECISIONS.md decision 5 says "ADR-0011's reopening rule 3 stands: a fix that keeps most of the
  token saving reopens the question". The ADR's rule 3 is the reopening trigger itself ("A fix for
  the live-data weakness that gives back most of the token saving"). The TODO sentence follows the
  reviewer's wording and does not attribute it to rule 3 (finding 1).
- Question: which lane carries decision 2 (the overlap list and the exposed-row amendment)? No
  round item does; the TODO says so (finding 4).
- Please send the full Version ID of the loop 2 deploy, the two operations called, what each
  returned, and the date. A follow-up commit then deletes the egress bullet (finding 6).
- Pull request text still owes: the total-guard slack (134, 73 and 69 characters under Grok's
  guards, not 2,197; finding 14), and that the partial-page-of-rows half of the deleted "read past
  the snippet" candidate was never measured (finding 17).
- `.dev.vars` (placeholder names only) and `tmp/` exist in this worktree; both are git-ignored.
