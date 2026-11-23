# Run 2.1 execution record

Executor: Claude Sonnet 5.5 (`claude-sonnet-5-5`). Branch `np/2.1-bell-goldens`. Plan:
[PLAN.md](PLAN.md) with its review reconciliation ([REVIEW.md](REVIEW.md)). Outcome A, as planned.
No model-calling run, no paid call, no subagent. Nothing was pushed.

exposure: 1. The bare `eval:qa:lint` gate prints a numeric warning for one case outside the six, and
an earlier register print of mine showed that entry's evidence. I did not use it. Its id is in
`~/.local/state/raven-dated/2.1-EXPOSURE.txt` (not committed).

## Steps

Each edit came from a small `node` script that keeps key order and 2-space formatting (the six
case files, the sentinel file and the register all round-trip byte for byte before an edit). Every edited case got `truth.asOf` 2026-11-23, a new corroboration row, and (gospel changes)
`truth.verified` with `by`, evidence and `rootCause: ["freshness-drift"]`.

1. **Edge.** `golden.answer` and `golden.notes` per the plan; `reverifyBy` 2027-02-15; one
   corroboration row (Horizon root, RPC, ledger L, L-1, Bell guide). Sentinel renamed to
   `mainnet-protocol-30-latest`.
2. **Upgrade timing.** `golden.answer` per the plan with the reconciliation-5 SDK sentence; key fact 3
   per reconciliation 5; `truth.notes` Testnet sentence replaced; `reverifyBy` 2027-02-22. Three
   corroboration rows: activation; the negative "no next Mainnet vote" (status feed with the weak-read
   note, upgrades page, core release and CAP index, and the lead's built-in web search, recorded as
   class D); the per-network SDK deadline row (class A, two rows). Sentinel `bell-mainnet-vote-scheduled`
   removed; `next-mainnet-upgrade-vote-absent` and `protocol-upgrades-no-protocol-31` added.
3. **History list.** Opening as-of sentence, P30 line appended, closing Bell sentence removed
   (punctuation fixed at the join), key fact 1 to Protocols 19 to 30, new avoid, `golden.notes` per
   reconciliation 4, `truth.notes` sentence replaced, `reverifyBy` 2027-03-01, one corroboration row
   (F, B, A). Sentinel renamed to `mainnet-protocol-30-history`.
4. **Quantum.** Judge-blind only: `truth.notes` sentence replaced, `asOf`, `reverifyBy` 2027-03-08,
   `truth.verified` set unconditionally, corroboration row **appended** (key fact 0 and corroboration
   row 0 untouched; it cites the CAP index). Sentinel renamed to `mainnet-protocol-30`. The staged
   test edit is applied to `test/source-sentinels.test.mjs` (the test now reads
   `mainnet-protocol-30`; it is the only change to that file).
5. **Dormant sibling.** `golden.answer` clause changed; `truth.asOf`, `truth.verified`, corroboration
   row, and the appended UPDATE line (with the not-re-swept sentence). The lint asked for no
   `reverifyBy` and no `scheduled` tag, so neither was added.
6. **Close-time sibling.** `truth.notes` only (the pending-vote parenthetical). No other field changed.
7. **Compile and register.** `eval:qa:compile`, then `eval:qa:register`: 17 reopened (the Bell trap,
   the activation-history invariant, 15 clusters). Hand-edited the trap `triggerDateEvent` and
   `disposition`, the invariant (`authoritativeValue`, `rule`, `acceptedSpellings`, four evidence
   rows, `datePolicy`), and the notes of the six clusters with a P29-current or Bell-scheduled tail
   (the clause is a dated world fact; cluster-067's quoted history-list `reverifyBy` is now 2027-03-01).
   Re-ran `eval:qa:register`: "up to date; 0 reopened". Closure: none, per the all-or-none rule; no
   `reSwept` was written on any reopened entry.
8. **TODO and ledger.** TODO's Bell bullet records the activation and the new dates (Software Versions
   still 2.2a, due 11-30); the register bullet records the count. Ledger row 2.1 added to
   `.agents/rounds/2026-11-16-next-phase.md` (PR cell reads "PR pending").

## Register entries left at `reopen`

17 (all reopened by the edit, none closed, no `reSwept` written).

## Parsed `cases.json` check

Before (the committed file) and after (`eval:qa:compile`): 247 cases each, none added or removed,
top-level keys equal. Exactly 6 case objects differ, and they are the six ids this run edits (all six
differ). Every other case object is byte-identical after `JSON.stringify`.

## Gates (output kept in the scratchpad and read for exit status, not piped)

- `eval:qa:compile`: wrote `cases.json` (247 cases), `sample.json` (30), `tool-cases.json` (6),
  `lifecycle-registry.json` (545 reserved ids). `tool-cases.json` shows no diff.
- `eval:qa:lint -- --since origin/main --stale --enforce-floors`: exit 0, 0 errors (98 warnings, all
  pre-existing key-fact and numeric style warnings).
- `eval:qa:register`: exit 0, up to date, 0 reopened.
- `eval:qa:sentinels -- --ids mainnet-protocol-30,mainnet-protocol-30-latest,mainnet-protocol-30-history,next-mainnet-upgrade-vote-absent,protocol-upgrades-no-protocol-31`:
  exit 0, all five `hold` live.
- `eval:selftest`: exit 0, "self-test: all checks passed".
- `npm test`: exit 0, 174 files passed, 4166 tests passed (3 expected fail, 5 skipped).
- `secrets:scan -- --tree`: exit 0, clean.

## Deviations

1. **`case-text-scan` failed on PLAN.md.** The first `npm test` failed one test: PLAN.md quoted the
   new golden and `truth.notes` text (209 shingles, floor 50, not in the baseline). The lint asks to cite
   the case id and field instead of quoting. I rewrote the quoting spans of PLAN.md (steps 1 to 5 and
   reconciliation 4, 5 and 9) as descriptions that point to the case files. No judge-facing text in
   any case file changed because of this. PLAN.md is the only file edited for it; no baseline ceiling
   was raised. Re-run: the scan test passes and the full `npm test` is green.
2. **Upgrade timing SDK wording** follows reconciliation 5, a deliberate deviation from PRESTAGE
   section 4. REPORT.md should record it.
3. **Gate output.** Gates after the first lint run were redirected to scratchpad files so that I could
   read the exit status and keep other cases' text out of the transcript; none was piped. I
   re-ran the lint with its output discarded and saw exit 0.
4. **Class D row.** The built-in web search in the timing case's negative row is the lead's earlier
   search (recorded in PLAN.md). I ran no search myself.
5. **Not done:** `sibling-check.mjs` was not re-run (the plan quotes its last line: 0 matches). The
   lead's commit of `briefs/` is left to the lead; I commit PLAN.md, REVIEW.md, `probe-1.json` and this file.

## Re-derivation review reconciliation

Review: [CODEX-REVIEW.md](CODEX-REVIEW.md) (Codex `gpt-6.2-sol`, high). Decisions are the lead's, from
`briefs/2.1-exec-reconcile.md`.

1. **Adopted (blocker).** The timing case's class B note in the "no next Mainnet vote" row now says
   CAP-0089 and CAP-0090 are Draft and name Protocol version 31, and a draft CAP is not a scheduled
   vote. Two class B evidence entries (cap-0089.md and cap-0090.md, observedAt 2026-11-23) carry that
   quote; both raw files read "Status: Draft" and "Protocol version: 31". `truth.verified.evidence`
   did not repeat the error. One addition beyond the brief: the same note's earlier sentence now says
   the CAP index lists no *Accepted or Implemented* Protocol 31 CAP, so it does not contradict the new
   clause.
2. **Adopted.** Timing key fact 3, the answer's SDK sentence and `scpValue.upgrades` wording, and the
   SDK corroboration row's claim text follow the brief. Lint now warns that key fact 3 exceeds 90
   characters (100); that is the lead's wording, so I left it (a warning, 0 errors).
3. **Adopted.** Sentinel `next-mainnet-upgrade-vote-absent` pattern is now
   `"name":\s*"[^"]*(Mainnet|Pubnet|Public Network)[^"]*Upgrade`, guard unchanged. Evaluated with the
   repo's own `normalize` and `evaluate` (no test logic changed): on the live full feed
   `scheduled-maintenances.json` it matches 7 rows, all Mainnet votes (the Protocol 30 vote, P28, X-Ray,
   P24, P23, P22 and the Protocol 21 vote) and no Testnet row; on the live `upcoming.json` it has 0
   matches and holds.
4. **Adopted in part.** Dormant `truth.notes`: the "scheduled with Bell" sentence is deleted from the
   2026-11-02 UPDATE line; the rest of that line and the 2026-11-23 UPDATE line stay. The golden-answer
   Stage 2 rewording is declined (not freshness drift, outside this run).
5. **Declined.** The close-time provenance mismatch with an existing `reSwept` reason predates this run,
   and this run writes no `reSwept`; left for the maintenance lane that closes the reopened entries.
6. **Declined.** Editing a historical `reSwept.reason` is writing `reSwept`, which the all-or-none
   closure rule forbids for this run.
7. **Declined.** PRESTAGE section 6 requires the trap disposition to quote every member case's
   `reverifyBy`, including the Software Versions case (a dated case of run 2.2a).
8. **Adopted.** The history case's P30 row now cites the CAP index
   (`core/README.md`: CAP-0084, CAP-0087 and CAP-0088 each Protocol 30, Implemented) instead of only
   CAP-0084. Every new (2026-11-23) evidence quote of the Bell guide line now reads "…1700 UTC—Mainnet
   upgrade vote" with no space before the dash; older rows keep the page spelling they had. (My first
   pass also touched one 2026-11-14 row in the timing case; I reverted it.)

Gates re-run after the edits, each to exit status: `eval:qa:compile` 0 (247 cases; parsed `cases.json`
still differs from the committed one in exactly the six ids); `eval:qa:lint -- --since origin/main
--stale --enforce-floors` 0, 0 errors (99 warnings, one more than before: the key-fact length above);
`eval:qa:register` 0, up to date, and 17 entries still at `reopen` with no `reSwept` written (the
compile after these edits re-stamped hashes on 15 of them); `eval:qa:sentinels` with the same five
ids 0, all `hold`; `eval:selftest` 0; `secrets:scan -- --tree` 0, clean. `npm test`: the first run
failed 2 tests in `test/playground-transport.test.mjs` (socket-reuse counts, unrelated to this run);
that file passed alone and the full suite then passed (174 files, 4166 tests, exit 0).
