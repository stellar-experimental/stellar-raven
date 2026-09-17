# Resumption plan review — paid-plan-resume-draft.json

- Reviewer: independent of the draft (root authored it). Read-only.
- Not done: paid calls, re-judge dry runs, plan edits, Git actions, or reads of proposed goldens.
- Inputs:
  - `/tmp/raven-routing-audit-2026-09-17/paid-plan-resume-draft.json`
  - `/tmp/raven-routing-audit-2026-09-17/golden-correction-plan-review.md`
  - `eval/qa/re-judge.mjs` and `eval/qa/run-qa.mjs` at candidate worktree HEAD `d4cac5a9`
  - the M1-B1 artifact `eval/qa/results/2026-09-17T01-33-03-variantA.json`
- The candidate SHA and the corpus hash remain pending. Both must be pinned before approval.

## Verdict

Not launch-ready. The plan has four methodological blockers and two dry-run-only checks. The rest of the
structure is sound:

- Every `run-qa` command array differs only in `--server-revision`, `--ids`, and `--max-budget-usd`.
- All current file pins match HEAD.
- The pinned `claude` binary hash matches.
- Cap arithmetic is correct.

## Blockers

### 1. M0 regrade uses a different judge method than the comparison arm

- `re-judge.mjs` has no stability-boundary tiering. Its options are `--judge-panel 2|3`, and the default is a
  single judge (`judgePanel = 1`, lines 133-166). It does not read `--stability-register` or `--max-panel-cases`.
- In the M1-B1 artifact, the tier each corrected ID used depends on its first verdict:

  | ID | score | tier | panel | escalation |
  |---|---|---|---|---|
  | `q-defi-aquarius-what-is` | wrong | single | — | — |
  | `q-eco-lobstr-wallet` | partial | single | — | — |
  | `q-defi-soroswap-what-is` | wrong | panel | 3 | `boundary-wrong-claim` |

- As drafted, `M0-B1` re-judges all three rows with one judge. C1, C2, and B2 are graded by `run-qa` under
  `stability-boundary-v1`. Soroswap, the affected case, would get a 3-judge panel on the candidate side only.
- Repair:
  - Add `--judge-panel 3` to M0.
  - After C1 is collected, add a matching regrade of the same three C1 rows with identical flags: default
    `--cases-ref` (its recorded runner revision), `--judge-panel 3`, and the same judge and identity flags.
  - For those three IDs, compare only the B1 regrade with the C1 regrade. Keep the collection-time C1 verdicts
    as secondary evidence.
  - Estimated added cost is about $1.

### 2. The revision and serving plan breaks after the correction commit

- `assertCollectionSourceIdentity` (`run-qa.mjs:666-681`) refuses a dirty runner: "QA collection requires a
  clean runner working tree".
- `sourceIdentity` records `runnerRevision` as `git rev-parse HEAD` of the runner worktree.
- The candidate worktree is dirty now (root, improvements, and records edits). The golden correction commit
  will move `HEAD` off `d4cac5a`.
- `--server-revision` must resolve locally, and `assertExpectedSourceRevision` checks it against the bound
  server's reported identity before and after collection.
- Every C command pins `--server-revision d4cac5a991358475f55c8a7cf0a3065ce40275d2`. If the candidate server
  runs from this worktree after the commit, it reports the new revision and collection stops.
- `runner.revision`, `candidate.revision`, and `filePins["eval/qa/cases.json"]` all still name pre-correction
  values.
- Repair: record exactly one serving choice.
  - Serve the candidate from the correction commit. First prove that `git diff d4cac5a..<correction>` touches
    none of `src/`, `catalog/`, `wrangler.jsonc`, or `eval/qa/*.mjs`. Then set every C `--server-revision`,
    `candidate.revision`, and `runner.revision` to that commit.
  - Or serve the candidate from a separate clean checkout at `d4cac5a`. Keep the C `--server-revision` at
    `d4cac5a`, and set `runner.revision` to the correction commit.
- Either way, update the compiled `eval/qa/cases.json` pin.

### 3. Precedence between M0 and M5 regrades of B1 rows is undefined

- M0 re-judges three B1 rows. M5 also lists "M1-B1 same explicit reviewed IDs with `--cases-ref worktree
  --allow-non-identical`".
- If the reviewed IDs include any corrected ID, that row gets two regrades. `goldenCorrection.policy` ("Use
  corrected verdict overlay") does not say which one counts.
- Repair:
  - For the three corrected IDs, the B1 comparison verdict is the M0 panel regrade, paired with the symmetric
    C1 panel regrade.
  - M5 excludes those IDs, or cites the M0 and C1 regrade artifacts instead of re-judging.
  - The 13 unchanged IDs keep their collection-time verdicts unless both arms get the same M5 regrade command.

### 4. M5 commands are placeholders, and the per-command budget is tight

- `methods.M5_rejudge.commands` holds descriptions, not arrays: "M1-C1 explicit reviewed IDs", "M1-B1 same
  explicit reviewed IDs …", and "up to four Soroswap single-row pairs".
- `m5CommandPolicy` itself requires exact reviewed arrays before calls.
- Observed p6 judge calls cost $0.048–$0.114. A 3-judge regrade of 16 rows costs about $2.40–$5.30, so the
  planned $5 per M1 command can end `budget-stopped` (incomplete).
- Repair:
  - Write exact arrays with the same `--judge-panel` on both arms of every pair, the three identity flags,
    `--max-budget-usd`, and the correct `--cases-ref` per artifact.
  - Bound the reviewed ID count, or reallocate within the $24 M5 ceiling.

## Dry-run-only checks (M0)

`--allow-non-identical` waives both a case-snapshot mismatch and a judge-tuple mismatch (`re-judge.mjs`, the
"refusing non-identical re-judge" branch). The free `--dry-run` output is therefore the only guard against an
unintended tuple drift.

1. The dry-run `guards` must show:
   - `tuple.matches: true` (claude-sonnet-5, v2.10, p6);
   - `identity.guard.matches: false` from the corrected case content only;
   - `missingCaseIds` empty;
   - `orderMatches` true;
   - `selectedIds` equal to the three corrected IDs.
2. The case-snapshot guard hashes the whole selection, so it cannot identify which rows changed. Run a separate
   per-ID byte comparison of compiled `eval/qa/cases.json` entries between `d4cac5a` and the correction commit.
   Exactly the three corrected IDs may differ among the 16. If any other ID differs, add it to M0 and to the
   symmetric C1 regrade.
3. Golden-time guard: at HEAD, `q-eco-lobstr-wallet`, `q-defi-aquarius-what-is`, and `q-defi-soroswap-what-is`
   are all `freshness: stable`, so `--allow-golden-drift` is not needed. If the correction changes any of them
   to `live` or `scheduled`, M0 refuses. Stop and review; do not add the flag silently.

## Verified as correct

- **M0 array.**
  - Realpath runner `/private/tmp/raven-routing-audit-2026-09-17/repo/eval/qa/re-judge.mjs`; the source
    artifact exists.
  - `--ids q-eco-lobstr-wallet,q-defi-aquarius-what-is,q-defi-soroswap-what-is` names the correct IDs.
  - `--cases-ref worktree` is correct. `resolveCasesRef` returns `undefined` for `worktree`. A named revision
    fails in `verifySourceCases` before `--allow-non-identical` applies. With no flag, the default is the
    recorded `sourceIdentity.runnerRevision` `d4cac5a` (stale cases).
  - `--allow-non-identical` is present.
  - `--judge-model claude-sonnet-5` is present.
  - `--max-budget-usd 2` is present (required for paid runs).
  - `--claude-path /Users/kalepail/.local/bin/claude` plus both identity hashes are present (all three are
    required together). The binary realpath sha256 begins `3509913f9d157631`, which matches the pin.
- **Pins versus HEAD `d4cac5a`** (working copy equals HEAD for each):

  | File | Pin prefix |
  |---|---|
  | `src/catalog/search.ts` | `3cc4c140` |
  | `catalog/manifest.json` | `da21ab9a` |
  | `eval/discovery/cases.json` | `a81df0b9` (already committed) |
  | `eval/discovery/lib.mjs` | `cad1a9c0` |
  | `eval/discovery/run-discovery.mjs` | `0bcb6512` |
  | `eval/qa/cases.json` | `7d5e4dcc` (pre-correction) |
  | `eval/qa/probe-remote-identities.mjs` | `bde386a0` |

  Also matching: stability register `cb5fcc19` and `evals/challenge-discovery-cases-release.json` `4ade5f68`.
- **M1-B1 artifact.**
  - `sourceIdentity.runnerRevision` `d4cac5a`, `runnerDirty: false`, `serverRevision` `848edec4`.
  - `qaImplementationSha256` `4d0ccc8d4b37…`.
  - `comparable: true`.
  - Budget: authorized $20, reported $5.8820244, 48 of 48 calls, 0 missing costs, not exhausted.
- **Cap accounting.**
  - M1 4 × $20 = $80; M2 8 × $2.5 = $20; M3 2 × $12 = $24; M4 2 × $15 = $30; M5 $24; M0 $2.
  - Total $180, plus the $70 reserve, equals the $250 cap.
  - The M1-B1 spend is inside its own authorization. M2-B1a and M2-B1b have not spent.
  - With the symmetric C1 regrade from blocker 1, the total is about $182.
- **Guard semantics for M5.**
  - `verifyBaselineIdentity` is absolute and compares case content for every shared ID. So B1↔C1 cannot use
    `--flips-vs`, and the plan's `--ids` mode is correct.
  - C2↔B2 and the four M2 Soroswap pairs (B1a/b, C1a/b, C2a/b, B2a/b) will all be collected under corrected
    cases, so they remain `--flips-vs` eligible.
- **Paired printer.** Recording INDETERMINATE for both n<100 and changed B1 case-input identity is correct.

## Non-blocking corrections

1. `methods.M1_qaControls.costEvidence` says "No stored p6/v2.10 cost sample". M1-B1 now provides one:
   $5.88 for 16 rows, with agent calls $0.125–$0.487 and judge calls $0.048–$0.114.
2. Add these stops:
   - runner dirty, or runner `HEAD` different from the pinned correction commit;
   - `qaImplementationSha256` different from B1's `4d0ccc8d…` (B1 and later runs use different runner
     revisions);
   - compiled `eval/qa/cases.json` hash different from the new pin;
   - server-reported revision different from the recorded serving choice;
   - any re-judge ending `budget-stopped` or failing, treated as incomplete with no overlay;
   - an M0 dry run showing any guard other than the expected case-snapshot mismatch.
3. Record that B1↔C1 pairs cross runner revisions. They are valid only with an unchanged QA implementation hash
   and byte-identical case content for the 13 unchanged IDs.
4. The `knownRisk` (blocking on one verified loss across 16 controls and replicates) needs explicit coordinator
   acceptance in the ledger.

## Recorded coordinator decisions to carry into the plan

- The audit-row severity metadata is monitor-only. No Scout defect is filed, because the source content includes
  "Why Invalid" and no contract requires an independent validity field. The trace diagnosis is agent-side
  projection truncation.
- The Trustless Work golden is preserved. It already distinguishes API surfaces and does not require Bearer. The
  answer's missing V1 framing supports the broad-exclusivity concern without establishing V1 Bearer support.

## Launch conditions (all required before the first resumed spend)

1. Golden corrections land through `golden-truth` as one commit, with compile, lint, selftest, and test gates
   passing. The candidate worktree is clean at that commit.
2. The correction commit SHA and the compiled `eval/qa/cases.json` sha256 are pinned in the plan and ledger.
   `runner.revision`, `candidate.revision`, `filePins`, and every C `--server-revision` follow the single
   serving choice in blocker 2.
3. `git diff d4cac5a..<correction>` touches only corpus, compiled cases, and records. The QA implementation hash
   equals `4d0ccc8d4b37…`. The manifest is still `da21ab9a…`, and `search.ts` is still `3cc4c140…`.
4. The per-ID compiled-case diff shows exactly the three corrected IDs changed.
5. The M0 dry run, with `--judge-panel 3` added, shows the expected guards from "Dry-run-only checks".
6. The plan adds the symmetric C1 three-row regrade and the M0 precedence rule (blockers 1 and 3).
7. Exact M5 arrays exist, with panel parity and feasible budgets (blocker 4).
8. The added stops are recorded.
9. `--stable-sha256` remote identity has been re-run and matches `681943c44180…`; any vector change stops.
10. The coordinator explicitly accepts the known risk, and the monitor-only and preserved-golden decisions are
    recorded.
11. An independent reviewer (not the plan author) approves the revised plan and the final pins before
    authorization.

---

# Delta review — revised paid-plan-resume-draft.json (file mtime 2026-09-16 22:06 local)

- Reviewer: independent of the plan author. Read-only.
- Not done: paid calls, dry runs, plan edits, or Git actions.
- Inputs:
  - `/tmp/raven-routing-audit-2026-09-17/paid-plan-resume-draft.json`, revised.
  - Code facts from the first review (`re-judge.mjs` and `run-qa.mjs` at `d4cac5a9`). The worktree is still at
    HEAD `d4cac5a9` with 41 dirty paths.

## Delta verdict

The revision resolves all four first-review blockers. No new methodological blocker was found.

### Approval scope

Approved now, as independent method terms:

- the method design (M0 through M5 terms, pairing, reading rules, stops, and caps);
- the exact `M0-B1` command array (panel 3, worktree cases, allow-non-identical, $2);
- the `M0-C1` array shape (no `--cases-ref`, no `--allow-non-identical`, panel 3, $2), but not its source path.

Not approved, not launch authority:

- any paid call before the pins and conditions below are met;
- `M0-C1` until the M1-C1 artifact realpath exists and passes command review;
- every M5 command until exact arrays pass independent command review;
- any C collection until the correction commit is pinned and the serving allowlist check passes.

The coordinator explicitly accepted the conservative one-verified-loss stop. The monitor-only audit-row decision
and the preserved TW golden are recorded decisions from the prior turn.

## First-review blockers: resolution check

| # | Blocker | Revised plan evidence | Status |
|---|---|---|---|
| 1 | M0 judge-tier asymmetry | `M0-B1` array ends `--judge-panel 3`. `M0-C1` array exists with `--judge-panel 3` and the same three IDs. `goldenCorrection.policy` says "Rejudge exactly three corrected rows with panel 3 in both B1 and C1 … Compare these panel overlays for those IDs". `methods.M0_correctedGoldenRejudge` has runs `M0-B1` and `M0-C1`, $2 each, ceiling $4. | Resolved |
| 2 | Revision and serving break | `servingChoice`: serve the candidate from the clean correction commit. Every C command `--server-revision` is `PENDING_CORRECTION_COMMIT`; every B command keeps `848edec4…`. `candidate.revision` and `runner.revision` are `PENDING_CORRECTION_COMMIT`. `runnerRevisionCrossing` and `qaImplementationSha256: 4d0ccc8d4b37…` are recorded. | Resolved in structure; allowlist condition 1 below |
| 3 | M0/M5 precedence | Policy: "never override them with M5". `m5CommandPolicy`: "M5 excludes the three corrected IDs in B1/C1 and refers to M0 overlays instead." The 13 unchanged rows keep original verdicts unless both sides receive the same reviewed M5 method. | Resolved |
| 4 | M5 placeholders and budget | `m5CommandPolicy`: M5 and M0-C1 "are withheld from current launch authority until exact result paths, IDs, panel parity, and feasible caps pass independent command review." | Resolved as deferral; exact review mandatory before those calls |

### Other verified changes

- **Caps:** M1 $80 + M2 $20 + M3 $24 + M4 $30 + M5 $24 + M0 $4 = $182 (`allocatedCeilingUsd`). Adding
  `reserveUsd` $68 gives the $250 cap.
- **M0 cost:** each run makes nine judge calls at the observed $0.048–$0.114, about $0.43–$1.03 against its $2 cap.
- **Stops added:**
  - dirty runner tree, or HEAD different from the pinned correction commit;
  - QA implementation hash different from M1-B1;
  - compiled cases hash different from the correction pin;
  - M0 dry-run guard other than the expected case-snapshot mismatch, or a tuple mismatch;
  - any re-judge incomplete, budget-stopped, failed, or missing cost, with no overlay and no automatic retry.
- **M1 cost evidence:** updated to the M1-B1 p6/v2.10 observation ($5.8820244; agent $0.125–$0.487; judge
  $0.048–$0.114).
- **Known risk:** records explicit coordinator acceptance.
- **Command arrays:** M1/M2 C and B arrays still differ only in `--server-revision`, `--ids`, and
  `--max-budget-usd`. Budgets: M1 $20, M2 $2.5, M3 $12, M4 $15, M0 $2.
- **`M0-C1` array shape:** omitting `--cases-ref` makes `resolveCasesRef` use the C1 artifact's recorded
  `sourceIdentity.runnerRevision` (the correction commit). Omitting `--allow-non-identical` makes any snapshot or
  tuple mismatch refuse. Both are correct.

## Conditions (required before the calls they govern)

1. **Serving check as an allowlist, before any C collection and before M0-B1.**
   - The recorded byte-identity list (`src/`, `catalog/`, `wrangler.jsonc`, `eval/qa/*.mjs`) omits other runtime
     and bundle inputs: `specs/super-spec.json`, `ecosystem-skills/MANIFEST.json`, `package.json`, and
     `package-lock.json`.
   - Require `git diff --name-only d4cac5a991358475f55c8a7cf0a3065ce40275d2..<correction>` to fall entirely
     inside a non-runtime allowlist:
     - `eval/qa/corpus/**`, `eval/qa/cases.json`;
     - `improvements/**`, `research/**`, `.agents/**`, `test/**`;
     - `scripts/improvements-*.mjs`;
     - documentation Markdown.
   - Name any other path explicitly before approval. The current worktree carries dirty files from other lanes
     (improvements, skill, architecture, test, and records edits). If they land in the correction commit, the
     allowlist must cover them.
2. **M0-B1 provenance, immediately before its launch.** `re-judge.mjs` does not check for a clean tree, and a
   worktree-mode artifact records no revision. Record in the ledger:
   - `git rev-parse HEAD`, which must equal the correction pin;
   - empty `git status --porcelain=v1 --untracked-files=all`;
   - the compiled `eval/qa/cases.json` sha256, which must equal the pin.

   The dirty-runner and cases-hash stops apply to re-judge launches as well as collections.
3. **Per-ID case diff, before M0-B1.** The dry-run snapshot guard hashes the whole selection and cannot enforce
   `runnerRevisionCrossing` ("only three predeclared case inputs may differ"). Compare the 16 compiled case entries
   by ID, as canonical JSON, between `d4cac5a` and the correction commit. The differing set must equal
   `{q-eco-lobstr-wallet, q-defi-aquarius-what-is, q-defi-soroswap-what-is}`. Stop otherwise.
4. **M0-B1 dry run, free, before its paid call.** Run the approved array plus `--dry-run`. Required output:
   - `guards.tuple.matches: true` (claude-sonnet-5 / v2.10 / p6);
   - identity guard `matches: false`, `missingCaseIds` empty, `orderMatches: true`;
   - golden-time guard with no violation;
   - `selectedIds` exactly the three IDs.

   If the correction marks any of the three `live` or `scheduled`, stop and review. Do not add
   `--allow-golden-drift`.
5. **M0-C1 ordering.**
   - Launch only after M1-C1 is complete (budget not exhausted, no missing costs) and `comparable: true`.
   - Substitute the M1-C1 artifact realpath into the array and complete command review.
   - Run the same dry run first; every guard must match.
   - If any of the three C1 rows is incomplete or ungradeable, void the pair and do not launch M0-C1.
6. **No pooling across grading methods.** For the three corrected IDs, B1↔C1 comparisons use panel-3 regrades.
   B2↔C2 and all M2 pairs use collection-time `stability-boundary-v1` tiering. Report each pair within its own
   method; never combine grade counts across methods. The transcript-based verified-loss rule is unaffected.

## Remaining pin checks (all pending; final pins arrive after corpus gates)

| Pin | Current plan value | Required check |
|---|---|---|
| Correction commit (`candidate.revision`, `runner.revision`, every C `--server-revision`) | `PENDING_CORRECTION_COMMIT` | 40-hex SHA; resolves locally; worktree clean at it; allowlist diff (condition 1) |
| Compiled `eval/qa/cases.json` sha256 (`filePins`) | `7d5e4dcc…` (pre-correction) | Replace with the post-gate hash; equals working copy at launch; per-ID diff (condition 3) |
| `src/catalog/search.ts` | `3cc4c140…` | Still equal at the correction commit |
| `catalog/manifest.json` | `da21ab9a…` | Still equal at the correction commit |
| QA implementation hash | `4d0ccc8d4b37…` | `run-qa` `sourceIdentity.qaImplementationSha256` equals it on every later collection |
| Discovery pins (`eval/discovery/cases.json` `a81df0b9…`, `lib.mjs` `cad1a9c0…`, `run-discovery.mjs` `0bcb6512…`) | unchanged | Still equal at the correction commit |
| Remote-identity probe script | `bde386a0…` | Unchanged |
| Remote identity vector | `681943c44180…` | Re-run `--stable-sha256`; `prelaunchStableReceipt` `remote-stable-s1-resume.sha256` recorded; any change stops |
| Stability register | `cb5fcc19…` | Unchanged |
| Fresh challenge and discovery release view | `34edbc2f…`, `4ade5f68…` | Unchanged |
| `claude` binary and agent environment | `3509913f…`, `a460b902…` | Binary realpath hash rechecked in candidate cwd before the first spend |
| M1-C1 artifact path (for `M0-C1`) | `PENDING_M1_C1_ARTIFACT` | Realpath after complete comparable collection; command review |
| M5 arrays | descriptions only | Exact arrays, IDs, panel parity, feasible caps; independent command review |
| `review.conditions` | "Pending final pin review" | Final independent pin review before authorization |
