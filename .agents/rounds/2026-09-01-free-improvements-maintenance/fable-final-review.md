# Final independent review — Fable 5 high

Date: 2026-09-01
Reviewer: Fable 5 (`claude-fable-5-1`) at high. Author: GPT-5.6 Sol.
Scope: fixed point `23982548b7b67a1931c61f2d02a04d8a386f6b5c` through the working tree.
Mode: audit. This report is the only file this review wrote.

## Verdict

**FAIL.** One High finding remains: `npm test` fails on the Algolia self-test control count,
and the ledger records that command as passing. Four Medium and four Low findings follow.
Every completion requirement other than the test gate and the record-truth items passed
independent verification.

## Findings

### F1 — High — `npm test` fails and the ledger records it as PASS

- Files: `test/eval-algolia-raven.test.ts:12`; `scripts/eval-algolia-raven.mjs:371`;
  `.agents/rounds/2026-09-01-free-improvements-maintenance.md:266`.
- Evidence: the script now prints `Algolia semantic matcher self-test ok (14 controls)`. The test
  still expects `(9 controls)`. Fresh run:

```
FAIL  test/eval-algolia-raven.test.ts > Algolia semantic matcher > rejects substring mutations and accepts boundary-safe AP2/ACP terms
- Algolia semantic matcher self-test ok (9 controls)
+ Algolia semantic matcher self-test ok (14 controls)
Test Files  1 failed | 98 passed (99)
Tests  1 failed | 1587 passed (1588)
```

  The ledger line 266 says `npm test: PASS; 99 files and 1,588 tests passed`. That result predates
  the self-test expansion and was not re-run.
- Consequence: CI fails on this branch. The ledger asserts a gate that does not hold.
- Smallest repair: change the expectation to `(14 controls)`, or match
  `/self-test ok \(\d+ controls\)/` so the count is not a contract. Re-run `npm test` and replace
  ledger line 266 with the new result.

### F2 — Medium — the consistency register misstates what changed in the golden

- File: `eval/qa/consistency-register.json` lines 151, 197, 1270, 2627, 2781 (`reSwept.reason`).
- Evidence: each reason says the case "added pinned class A truth evidence only. Its answer,
  keyFacts, avoid, and notes did not change." The register's previous member hash
  `96a8150f…` was recorded on 2026-08-30. Between that hash and the new hash `2aad8008…` the
  golden `answer` lost the `U32Val`/Protocol 24 erratum sentence, `avoid[2]` lost its `U32Val`
  clause, and `notes` lost the `sd-036` grading caution (`git diff 23982548 -- eval/qa/corpus/battery/protocol-core/q-protocol-bn254-poseidon-xray.json`).
  The gated closeout and the focused follow-up were squashed into commit `9074093`, and the
  follow-up reason overwrote the closeout reason.
- Consequence: the durable sweep record contradicts git. A later auditor cannot trust the
  register's account of judge-facing changes.
- Smallest repair: rewrite the five reasons to state the cumulative change, for example:
  "q-protocol-bn254-poseidon-xray removed the obsolete CAP-0075 `U32Val`/Protocol 24 erratum
  sentence, its avoid clause, and the `sd-036` grading caution after upstream PR #1996, and added
  pinned class A and B evidence; Protocol 25, CAP-0074/0075, and primitive boundaries are
  unchanged." Then run `npm run eval:qa:register` and confirm `0 reopened`.

### F3 — Medium — the round ledger is accretive and contradicts the final tree

- File: `.agents/rounds/2026-09-01-free-improvements-maintenance.md`.
- Evidence:
  - Lines 246, 254, 255, 261, 262 report `70 findings`; the tree holds 66.
  - Line 248 reports corpus SHA `e14fb81b…`; the committed corpus SHA is `4f9b5017…`.
  - Lines 268-270 mark `improvements:lint -- --live`, `improvements:probes`, and
    `secrets:scan -- --tree` as `pending`. The pipeline skill requires the first two after every
    lifecycle edit. This review ran them; all pass (see Verification).
  - Line 266 records `npm test` as PASS (see F1).
  - Lines 111, 168, 174 state superseded facts as present ("Recorded `sd-001` as fixed pending
    retirement in `improvements/README.md`", "No issue was filed", "Did not edit `.agents/NEXT.md`").
    The README now calls `sd-001` a resolved precedent, `sd-048` is filed, and `NEXT.md` was
    rewritten.
- Consequence: a cold reader cannot tell which validation applies to the final tree, and the
  ledger asserts required gates that it did not run.
- Smallest repair: replace the Validation section with one final-state table (66 findings,
  corpus SHA `4f9b5017…`, 0 errors / 62 warnings, live lint ok, probes 6 recurring / 0
  fixed-candidate, secrets clean, `npm test` after F1). Delete or past-tense the three
  superseded sentences.

### F4 — Medium — two resolved receipts carry a status note as their title

- File: `improvements/resolved.json` lines 515 (`sd-036`) and 2098 (`sls-080`).
- Evidence: `oneLineTitle` in `scripts/improvements-lib.mjs:210` takes the first paragraph of the
  Finding section. Commit `9074093` prepended `> **Fixed upstream 2026-09-01.** …` to `sls-080`,
  so the receipt title is "Fixed upstream 2026-09-01. The deployed 1.9.16 API returns a dated
  source-parity answer for the exact monitor question". `sd-036` inherited the same pattern from
  before the fixed point. No other receipt in the ledger starts with a fix note.
- Consequence: the receipt is the durable finding record after deletion. Dedupe by title (the
  filing workflow's first step) will not match either defect.
- Smallest repair: set both `title` fields to the defect statement. Use each finding's
  `upstreamTitle` or its first defect sentence: for `sls-080`, "scout.explainRepo returned a
  DeepWiki answer that stated MaxSupportedProtocolVersion = 25 while the scanned source defined 28";
  for `sd-036`, "CAP-0075 declared a U32Val field selector and one Protocol 24 sentence while the
  shipped host uses a Symbol selector at Protocol 25". Run `npm run improvements:lint`.

### F5 — Medium — the `sd-048` filing links depend on a merge that has not happened

- Files: upstream issue https://github.com/stellar/stellar-protocol/issues/2010; comment
  https://github.com/Stellar-Light/stellarlight/issues/1134#issuecomment-5499763507.
- Evidence: the issue's "Public source record" points at `blob/main/improvements/stellar-docs/sd-048-…md`.
  That path does not exist on `main`. Both immutable snapshots point at commit `9074093`, which is
  reachable only from `origin/maintenance/free-improvements-followup`. `main` history is linear
  with `(#NNN)` squash commits, so `9074093` will never be on `main`; it stays fetchable only
  through the pull request ref.
- Consequence: the maintainer-facing source link is a 404 until merge. If the branch is rebased
  before the pull request is opened, the snapshot commit becomes unreachable.
- Smallest repair: open the pull request from this branch without rewriting `9074093`, merge it,
  and record in the ledger that the `sd-048` and `sls-080` snapshots resolve through the pull
  request ref. No repository file change is needed.

### F6 — Low — the golden lists `sd-048` as a root cause of a change it did not cause

- File: `eval/qa/corpus/battery/protocol-core/q-protocol-bn254-poseidon-xray.json`
  `truth.verified.rootCause[2]`.
- Evidence: the same block's evidence says "Active sd-048 remains outside this grading contract."
  No judge-facing text changed because of the Poseidon2 degree defect. The entry creates the new
  lint warning `symmetric-caution q-protocol-bn254-poseidon-xray` (61 → 62 warnings).
- Consequence: `rootCause` is the audit trail from a gospel change to its defect; this entry is a
  cross-reference, not a cause, and it manufactures a caution obligation the case does not need.
- Smallest repair: remove the `sd-048` path from `rootCause` (the evidence sentence already
  cross-links it), run `npm run eval:qa:compile`, `eval:qa:register`, and `eval:qa:lint --since`,
  and update the warning count in `.agents/NEXT.md`.

### F7 — Low — judge-facing notes carry a historical round label

- File: same case, `golden.notes`: `GT-31 CORRECTION: Protocol 25 activated…`.
- Evidence: `GT-31` names a retired round; it gives the judge no grading information.
- Consequence: transient narrative in a permanent judge-facing field.
- Smallest repair: drop the prefix. `truth.verified` already changed in this diff, so the
  gospel-change lint accepts the edit when done together with F6.

### F8 — Low — internal path leaked into the upstream issue body

- File: `improvements/stellar-docs/sd-048-…md` evidence line 4 → rendered into issue #2010 under
  "Additional recorded evidence".
- Evidence: the body lists `.agents/rounds/2026-09-01-free-improvements-maintenance/opus-deletion-review.md`.
  The upstream writing style says to remove internal workflow details; the path is unreachable for
  the maintainer until merge.
- Consequence: noise in the owner-facing ask. No truth defect.
- Smallest repair: none required for the record. If the owner authorizes an issue edit, delete
  that bullet. Future filings should keep lane-report paths out of `evidence`.

### F9 — Low — no queued re-check for the `sd-047` claimed fix

- File: `.agents/TODO.md`.
- Evidence: the closeout deleted "Refresh the recorded upstream states" without a replacement.
  `stellar/stellar-docs#2805` is open and PR #2806 is an open fix candidate. `NEXT.md` records the
  state but is not the work queue. The pipeline skill asks for a dated `TODO.md` entry naming the
  finding, ref, ledger, and exact re-check.
- Smallest repair: one entry: "When stellar/stellar-docs#2806 merges, re-read
  `docs/validators/README.mdx` and `docs/learn/fundamentals/stellar-stack.mdx` raw; `sd-047` moves
  to `fixed-upstream` only if both cadence sentences agree. Ledger:
  `.agents/rounds/2026-09-01-free-improvements-maintenance.md`."

## Requirements verified as PASS

- **Golden content.** `q-protocol-bn254-poseidon-xray` contains no `U32Val`, `P24`, `Protocol 24`,
  or `sd-036` text. Answer, keyFacts, and avoid keep Protocol 25, three CAP-0074 functions, two
  CAP-0075 permutations, and the privacy boundary.
- **Source classes.** Two class A (X-Ray announcement; `stellar-docs@83c68f21` `zk.mdx` lines 6,
  41-42) and three class B (`stellar-protocol@65e2b626` CAP-0074/0075; `rs-soroban-env@a7e15b43`
  `env.json` lines 2696-2726). All five refs re-read live today. `65e2b626` is the current
  `master` head; `a7e15b43` is the current `main` head.
- **`sd-048`.** Self-contained; `reported-upstream`; issue #2010 open, 0 comments, five sections,
  automated-content marker present. Claims re-derived: CAP-0075 line 78 lists `3, 5, 7, or 11`;
  line 124 `Only d=5`; line 157 `d is not 5`; `env.json:2725` `(5 for BLS12_381/BN254)`;
  `mod.rs:19` `SUPPORTED_SBOX_DEGREES: [u32; 1] = [5]`; PR #1996 merged `d186cf31` and left
  line 78 unchanged.
- **Receipts.** `sd-001`, `sd-036`, `sk-020`, `sls-080` present with `liveRecheck`,
  `reviewEvidence`, `sourceCommit`, `sourceUrl`. `5e23340b` and `462ff2b1` are on `main`;
  file content at those commits equals the last active state. `sls-080` blob `a8dafc22` matches
  `9074093`. Intake overrides for `sd-001` and `sd-036` removed; `sd-048` override added.
- **Comments.** Today's comments by `kalepail` exist only on stellar-protocol #1980
  (`5499757126`), stellar-dev-skill #113 (`5499760587`), and stellarlight #1134 (`5499763507`).
  No comment today on PR #1996, PR #114, ecosystem-resources #9 (closed 2026-08-26),
  PR #1174, #1031, #2805, or PR #2806. The only new issue by `kalepail` today is #2010.
- **`sd-047` recurrence.** #2805 open with 0 comments; PR #2806 open; blobs `37f87980`
  (`3-5 seconds`) and `06c92f8d` (`5-7 seconds`) match `main` today.
- **Queue truth.** INDEX total 66; statuses 60/3/3; services 29 Lumenloop, 21 Stellar Docs,
  9 Stellar Light, 6 skills, 1 `workers-ai-provider`. `NEXT.md` and `TODO.md` counts match.
  No dangling reference to the four deleted files outside dated ledgers and `resolved.json`
  (searched with hidden directories included). No `sls-081`/`sls-082` collision.
- **Generated files.** After regeneration, `INDEX.md`, `cases.json`, `sample.json`,
  `lifecycle-registry.json`, and `consistency-register.json` are byte-identical to the tree.
- **Scope.** Changed files are limited to the improvements tree, the one golden and its generated
  outputs, the round ledger and lane reports, `NEXT.md`, `TODO.md`, and the Algolia canary script
  plus its self-test. `git diff --check` is clean.
- **No paid or production action.** The diff and the ledger record only GitHub issue and comment
  writes. The Algolia evidence came from the read-only `eval:algolia-raven` harness.

## Verification commands run by this review

| command | result |
|---|---|
| `npm run improvements:index` | wrote 66 findings; byte-identical to tree |
| `npm run improvements:lint` | `improvements lint ok (66 findings)` |
| `npm run improvements:lint -- --live` | `ok (66 findings, live intake checked)` |
| `npm run improvements:probes` | 6 recurring, 0 fixed-candidate, 0 inconclusive, 0 errors |
| `npm run eval:qa:compile` | 500 cases; SHA `4f9b5017…`; three outputs byte-identical |
| `npm run eval:qa:register` | up to date; 0 reopened; byte-identical |
| `npm run eval:qa:lint -- --since 23982548…` | 0 errors, 62 warnings |
| `node scripts/eval-algolia-raven.mjs --self-test` | ok (14 controls) |
| `npm run secrets:scan -- --tree` | clean |
| `npm test` | **1 failed**, 1587 passed (F1) |
| `git diff --check 23982548…` | clean |

## Not actionable

- The nine lane reports total about 2,050 lines for four retirements and one golden edit.
  They are dated lane outputs in the designated round directory, and the ledger's
  "Reviewer outcomes" section summarizes them. No repair required.
- The `sd-001` monitor-only canary keeps `finding: "sd-001"` after retirement. This follows the
  `sd-006` precedent that `improvements/README.md` names.
