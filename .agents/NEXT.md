# NEXT — handoff for the next work block

Updated 2026-08-30 after the same-100 eval closeout. Read this first. `TODO.md` holds the
full item text; this file only ranks and sequences. Delete or rewrite this file when the block
below is done.

## State at handoff

- `origin/main` is clean. Production runs Worker Version ID
  `6282fe2a-54d8-471e-9f0a-0a2565110af1`, deployed 2026-08-28 from `main` HEAD. Session 3 did
  not deploy.
- `improvements/`: 68 active findings, lint ok. Stellar-Light/stellarlight#1031 is still open;
  the maintainer owns the close.
- Corpus lint: 0 errors, 60 warnings (0 long-fact, 44 sourcing-guard, 16 corroboration). Every
  remaining warning carries an audited disposition: the 44 sourcing-guard items stay advisory
  (20-case audit, two models); the 16 corroboration items are grammar-only (56/56 class
  agreement, two models). Do not chase these counts to zero.
- Golden import validates Stellar strkeys (CRC16, SEP-23 version bytes) in `eval/qa/compile-qa.mjs`
  through `eval/qa/strkey.mjs`.
- The first `qa-five-track-v1` same-100 result is local at
  `eval/qa/results/2026-08-30T03-43-11-variantA.json`. Its independent decision is
  `VALID WITH A T4 EXCEPTION`. The one T4 exclusion leaves 99 paired-eligible IDs, so the
  100-ID method is `INDETERMINATE`. Judge stability remains 57 of 100 below 0.75.
- The paid artifact used rubric `v2.9`. The closeout fixes its `partial-without-issue` defect in
  rubric `v2.10`. Cross-rubric comparison requires a rejudge under the target tuple.
- Consistency register: reconciled on 2026-08-29; 0 reopen entries.
- The Terms are in force. `TERMS_EFFECTIVE_DATE` is `August 5, 2026` and stays as is.
- Ledgers for the finished blocks: `.agents/rounds/2026-08-29-golden-truth-session-3.md` and
  `.agents/rounds/2026-08-29-five-track-same-100.md`.

## Ranked blocks

### 1. Golden metadata remainder

Skill: `golden-truth`. Three `TODO.md` items remain under "Goldens":

- Dead provenance: 47 untouched files still cite a temporary path (94 before session 3). Repair
  them only during a verified touch of each case; no bulk edit. The session-3 rule for each
  path class is in the TODO item.
- Recheck the two dated source-metadata conflicts (`q-tool-soroban-auth-audit-live`,
  `q-protocol-ledger-close-time`).
- Review the five same-100 candidates listed in `TODO.md`. The result review found no false golden.

Record the affected case-id list in the round ledger, as session 3 did.

### 2. Eval instruments

Skill: `run-evals`. Two open items remain under `TODO.md` "Eval instruments":

- Harden the answering prompt for the Raven lookup boundary and Friendbot network distinctions.
- Judge stability is degrading (47 → 57 unstable). Watch the trend at the next register refresh.

The `qa-five-track-v1`, paired verdict, judge `v2.10`, and golden lifecycle contracts are implemented.

### 3. Routing: `scout.searchResearch` for protocol-history questions

`search` never surfaces the research lane for incident questions such as
`q-protocol-24-whisk-incident`. The data is reachable; ranking is the fault. Measure on the
routing eval, not one case. A fix that helps only this case is unshipped.

### 4. Repository-level tooling recovery

Use the v2 decision at
[`research/decisions/0010-repository-recovery-contract-v2.md`](../research/decisions/0010-repository-recovery-contract-v2.md).
Require 10 of 12 positive recoveries and zero premature detours across eight negatives. Keep every existing lane frozen.

The fifth v2 closeout is in
[`fable-plan-v2-live-failure.md`](./rounds/2026-08-30-repository-tooling-recovery/fable-plan-v2-live-failure.md).
The v2 result remains a FAIL. The Docs-versus-repository synthesis pattern is monitor-only.
The 2026-08-31 free probe retained the stale Horizon value `25`.
The local-config answer now includes the ancestor search and `<cwd>/.stellar` fallback.
No paid rerun may occur until the Horizon free probe returns `28`.
G1 is a pre-registered v3 candidate only.

`sources.locate` stays deferred. Its phase-zero study reopens only through the measured trigger in
`ideas/source-delivery-ranked-references.md` §8.

### 5. Playground message limit

Raise the user-message ceiling from 4,000 to 8,000 characters. Keep excessive text intact, disable
Send, show the accessible count and error, and reject bypassed requests server-side. Keep the
Playground stateless; durable session history remains a deferred idea.

### 6. Small own-repo fixes

- `test/demo-chat.test.ts` mocks the `ai` module, so the tool-loop guard never runs. Stub the
  model instead.
- Decide cluster membership for the two `scout.hackathonBrief` cases.
- Remove the leading blockquote marker from generated improvement titles.

## Owner decisions

The 2026-08-28 human-review grill resolved its 21 questions. One later eval-method question is open.

### Choose a product-loss margin for the paired QA method

The current `0.08` value is only the no-change confidence radius. It is not an accepted quality-loss
tolerance. The table uses the mixed-tuple 2026-08-27 and 2026-08-28 discordance upper bound.

| Candidate margin | Look-1 no-change `PASS` | Two-look no-change `PASS` | Two-look false `PASS` at a true 5-point loss | Second collection under no change |
| ---: | ---: | ---: | ---: | ---: |
| 0.05 | 6.992% | 25.963% | 0.051% | 91.812% |
| 0.08 | 36.350% | 80.925% | 3.899% | 62.454% |
| 0.10 | 66.208% | 95.657% | 18.357% | 32.596% |

Choose the largest acceptable product loss from product impact. Do not choose it from power alone.
Promotion also needs one same-tuple pinned pair for recalibration.

## Suggested sequence

Start block 1 in an idle golden lane; it is small. Block 2 is the largest block and can start at
once. Run block 4 before any `sources.locate` discovery. Blocks 3, 5, and 6 fit an idle lane.
