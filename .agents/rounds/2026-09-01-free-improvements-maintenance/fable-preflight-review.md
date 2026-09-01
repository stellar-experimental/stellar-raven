# Preflight review of the safe pre-resolution changes — Fable

- Round: `.agents/rounds/2026-09-01-free-improvements-maintenance.md`.
- Reviewer: Claude Fable 5.1, effort high. This reviewer did not author any change in the diff.
- Scope: the current uncommitted diff plus `sd-048`, the ledger, and the three lane reports.
- Writes: this file only. No finding, script, ledger, generated file, or upstream ref changed.
- Out of scope by instruction: the gated golden reconciliation and every lifecycle status change.

## Verdict

**FINDINGS.** No finding is high severity. The upstream facts in `sd-048`, `sd-047`, and
`sls-080` are accurate. Two medium findings concern record truth and evidence provenance. The
rest are low.

## Independent verification

| check | result |
|---|---|
| `core/cap-0075.md` at `65e2b6262c0825494caf2a94116eb512c8335f22` | line 78 lists `d` as `(3, 5, 7, or 11)`; line 124 says `Only d=5 is supported`; line 153-157 trap list includes `d` is not 5; line 61 (`poseidon_permutation`) already says `(5 for BLS12_381/BN254)` |
| `soroban-env-common/env.json` at `a7e15b439c4b49b17ba8f9e4527efee8d8119aba` | line 2725 reads `d: S-box degree (5 for BLS12_381/BN254)`; `a7e15b43` is `main` HEAD at 2026-09-01T01:01:25Z |
| `poseidon/mod.rs:19` and `poseidon2_params.rs:32-35` at the same commit | `SUPPORTED_SBOX_DEGREES: [u32; 1] = [5]`; `"Poseidon2: unsupported s-box degree"` |
| adjacent-copy calibration | GitHub code search: `"3, 5, 7, or 11"` in `stellar/stellar-protocol` hits only `core/cap-0075.md`; `"S-box degree"` in `stellar/stellar-docs` returns 0 |
| last commit touching `cap-0075.md` | `d186cf31` (PR #1996 merge, 2026-08-20); the pinned revision is later, so the claim is current |
| `stellar/stellar-docs#2805` and PR #2806 | issue open, 0 comments; PR open, not merged |
| `docs/validators/README.mdx:10` and `docs/learn/fundamentals/stellar-stack.mdx:22` on default branch | `3-5 seconds` and `5-7 seconds` still present |
| `Stellar-Light/stellarlight#1134`, PR #1174 | closed completed, 3 comments; PR merged at `76cb312d…` with the title naming plain-English trigger phrases |
| `Stellar-Light/stellarlight#1031` | open, 1 comment, last update 2026-08-28T16:27:13Z |
| `npm run improvements:lint` | `improvements lint ok (70 findings)` |
| `node scripts/eval-algolia-raven.mjs --self-test` | `ok (9 controls)` |
| `node scripts/eval-algolia-raven.mjs` (read-only) | `sd-001-software-versions-rank-one`: docs rules `#1`, docs no-rules `#1`; summary row says the target remains at expected rank #1 |
| `npm test` | 1588 passed |
| `git diff --check`; `improvements/intake.json` parse | clean; valid JSON |
| `improvements/resolved.json` | no `sd-001` receipt; `sls-074` receipt present (resolved 2026-08-28) |

## Findings

### F1 — Medium — `improvements/README.md` describes `sd-001` as resolved before it is resolved

- File: `improvements/README.md` lines 141 and 153-154; `scripts/eval-algolia-raven.mjs` line 28.
- Change: line 141 now reads `` (`sd-003`; `sd-001` and `sd-006` are resolved precedents) ``. Lines
  153-154 read `` The resolved `sd-001` and `sd-006` precedents retain separate monitor-only canaries
  after the active findings retire ``. The canary note says `the resolved sd-001 crawler fix`.
- Evidence: `improvements/stellar-docs/sd-001-*.md` still exists with `status: fixed-upstream`.
  `improvements/resolved.json` has no `sd-001` entry. The ledger gates the resolver
  (`Remaining gated actions` 1 and 6). The Opus review asked for the rewrite as a resolver
  precondition, not as a statement that resolution happened.
- Why it matters: if this diff commits before the resolver runs, `main` states a lifecycle fact
  that is false, and the old pointer to `resolved.json` is gone. AGENTS.md requires documentation
  to describe current behavior.
- Smallest fix: use state-neutral wording, for example `` (`sd-003`; `sd-006` is a resolved precedent
  in `resolved.json`, and `sd-001` is fixed and pending retirement) ``, and `the sd-001 crawler
  fix` in the note. Or hold the README hunk and the note wording for the resolver commit.

### F2 — Medium — the ledger records an `sls-074` live re-check that no lane report contains

- File: `.agents/rounds/2026-09-01-free-improvements-maintenance.md` line 52.
- Change: the upstream state table row says `2026-09-01: V-SOR-APP-VUL-003 returns the Veridise row
  without exactMiss; V-SOR-APP-VUL-999 retains exactMiss`, and labels `sls-074` as a `finding`.
- Evidence: `terra-evidence.md` records only the GitHub read for `#1031` and no Scout call.
  `rg VUL-999` over the round directory returns nothing. The only matching text in the repository
  is the 2026-08-28 `liveRecheck` in `improvements/resolved.json` line 1999, with the same wording.
  `sls-074` has no active file; it was resolved on 2026-08-28.
- Why it matters: the skill requires evidence a stranger can reproduce. A re-dated copy of an older
  receipt, or an unrecorded run, cannot be told apart from this ledger.
- Smallest fix: either record the 2026-09-01 command and response in a lane report and cite it, or
  change the cell to cite the 2026-08-28 resolved receipt as the last live re-check. Mark the row
  as a resolved record whose upstream ref remains open.

### F3 — Low — `sd-048` carries internal routing language into the owner-facing Finding

- File: `improvements/stellar-docs/sd-048-cap-0075-poseidon2-sbox-degree-contradiction.md`
  lines 24-25.
- Change: `` This is a `canonical-source` defect in `stellar/stellar-protocol`. It is a successor to
  `sd-036`, which did not report the S-box-degree contradiction. ``
- Evidence: `scripts/improvements-file-issue.mjs` `scrub()` (line 341) removes only Solo, scratchpad,
  workflow, and local-path lines. Both sentences render into the issue body. The skill says the
  owner-facing ask must not carry internal workflow language, and provenance belongs in evidence.
  The title and first paragraph are clean.
- Smallest fix: replace the two sentences with maintainer context, for example `Pull request #1996
  corrected the field selector and left this docs string unchanged.` Keep the `sd-036` successor
  link in the evidence list. Do not add a GitHub URL to `evidence`, because lint would then require
  `reported-upstream`.

### F4 — Low — `sd-048` status understates its evidence

- File: `sd-048` line 4 (`status: proposed`).
- Evidence: the record holds pinned commits, read-only commands, and two independent lanes that
  executed them (Opus review, Sol implementation). The skill defines `verified` as live
  re-execution with recorded command and result. The ledger keeps it `proposed` until a filing lane
  reviews it. Filing authorization and the verification evidence bar are separate things.
- Action: a choice, not a defect. If it stays `proposed`, the ledger should say the evidence bar for
  `verified` is already met so the filing lane does not repeat the source reads.

### F5 — Low — the `sd-001` canary watches the rules-on control and its new logic has no self-test

- File: `scripts/eval-algolia-raven.mjs` lines 26-27, 274-289, 342-347.
- Change: `monitorOnly` compares `primaryRulesBest` (best of docs-rules and meetings-rules) with
  `expectedPrimaryRulesRank: 1`.
- Evidence: the `sd-001` fix is a crawler extractor change and does not depend on query rules. A
  future rule could hide a crawler regression, and a rule change could raise a false drift alarm.
  The `sd-006` precedent in `scripts/lib/algolia-rule-canary.mjs` compares rules-on with rules-off.
  Today both controls rank `#1`, so this is not a live defect. The self-test covers only URL
  matching for the new case. The `summarize` monitor branch (rank 2 or miss must report drift) has
  no test. `expectTextIncludesAll` now has no case and no self-test after the old assertions were
  removed, so that matcher path is unexercised.
- Smallest fix: also require `primaryNoRulesBest === 1` for the monitor, or state in the note that
  the rules-on rank is intentional. Add two `summarize` assertions (met, not met). Either add one
  `text-all` self-test or remove the unused option.

### F6 — Low — the `sls-080` 2026-09-01 reading is recorded twice and carries transient wording

- File: `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md`
  lines 14 and 20-21.
- Change: the same `generatedAt 2026-09-01T18:23:41.351Z` reading appears as an evidence bullet
  and as a `recurrences` entry. The recurrence ends with `pending independent lifecycle review`.
- Evidence: `.agents/TODO.md` line 72 orders the reading into `recurrences`, so the mechanism is
  mandated and `TODO.md` edits are gated. The index now shows 3 recurrences while this one records
  a pass, which a reader will count as a reproduction. The Grok review has completed with `DEFER`,
  so the `pending` phrase is already stale.
- Smallest fix: keep the mandated recurrence, drop the duplicate evidence bullet or the duplicate
  recurrence text, and replace `pending independent lifecycle review` with the dated fact
  (`independent review deferred retirement; see grok-sls080-review.md`).

### F7 — Low — the `sd-047` recurrence has no recorded command or ref

- File: `improvements/stellar-docs/sd-047-validators-ledger-close-cadence-conflict.md` lines
  21-23; ledger line 54.
- Change: `current raw source still says 3-5 seconds in docs/validators/README.mdx and 5-7 seconds
  in docs/learn/fundamentals/stellar-stack.mdx`.
- Evidence: this review confirmed both sentences on the default branch. No lane report records the
  fetch; `terra-evidence.md` shows only the issue and PR reads for `#2805`. The original evidence
  bullets record blob ids and the repo HEAD; the recurrence records neither.
- Smallest fix: add the fetched ref or blob id and the command to the recurrence text, matching the
  2026-08-31 bullets.

### F8 — Informational — the ledger does not yet record this review lane

- File: ledger route cards (`Reviewer:` lines 24, 33, 45) and `Remaining gated actions` item 7.
- Evidence: AGENTS.md requires the lane and effort used for each review gate to be recorded. This
  preflight ran on Fable high. The cards name a later Grok 4.6 final-diff gate.
- Action: record this preflight and, later, the final-diff lane and effort actually used.

## What passed without finding

- `sd-048` scope: only `poseidon2_permutation` is wrong. The `poseidon_permutation` docs string
  already reads `(5 for BLS12_381/BN254)`. No other page or repo file repeats the wrong list.
- `sd-048` owner: `stellar/stellar-protocol` through the intake override, matching the `sd-036` and
  `sd-037` precedents under the `mixed` `stellar-docs` rule. The override reason is specific.
- `sd-048` title and first paragraph: reader-first, no eval ids, exact tokens preserved.
- `sd-048` evidence: four commands are read-only and reproduce at the pinned commits. Line numbers
  78, 124, and 157 are correct at `65e2b626`. The Opus report's line 163 for the trap list is not
  carried into the finding.
- Intake: valid JSON, `updated` bumped, override placed in id order.
- `INDEX.md`: regenerated; lint confirms byte match at 70 findings.
- `sls-080` evidence additions match the live GitHub state and the Terra and Grok readings.
- Ledger validation table matches what this review re-ran. Pending items are marked pending.
- No status changed, no comment posted, no resolver ran, no golden changed, no Algolia write.
