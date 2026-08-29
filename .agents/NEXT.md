# NEXT — handoff for the next work block

Written 2026-08-29 after golden-truth session 3 landed. Read this first. `TODO.md` holds the
full item text; this file only ranks and sequences. Delete or rewrite this file when the block
below is done.

## State at handoff

- `origin/main` is clean. Production runs Worker Version ID
  `6282fe2a-54d8-471e-9f0a-0a2565110af1`, deployed 2026-08-28 from `main` HEAD. Session 3 did
  not deploy.
- `improvements/`: 66 active findings, lint ok. Stellar-Light/stellarlight#1031 is still open;
  the maintainer owns the close.
- Corpus lint: 0 errors, 60 warnings (0 long-fact, 44 sourcing-guard, 16 corroboration). Every
  remaining warning carries an audited disposition: the 44 sourcing-guard items stay advisory
  (20-case audit, two models); the 16 corroboration items are grammar-only (56/56 class
  agreement, two models). Do not chase these counts to zero.
- Golden import validates Stellar strkeys (CRC16, SEP-23 version bytes) in `eval/qa/compile-qa.mjs`
  through `eval/qa/strkey.mjs`.
- Same-100 baseline for the next comparison: `eval/qa/results/2026-08-28T19-27-08-variantA.json`
  (local-only). Session 3 changed judge-facing gospel on 211 cases; the per-id list is
  `.agents/rounds/2026-08-29-golden-truth-session-3/affected-case-ids.md`. Read it before any
  same-100 rerun to decide per-id comparability. Judge stability: 57 of 100 same-100 cases sit
  below 0.75.
- Consistency register: reconciled on 2026-08-29; 0 reopen entries.
- The Terms are in force. `TERMS_EFFECTIVE_DATE` is `August 5, 2026` and stays as is.
- Ledger for the finished block: `.agents/rounds/2026-08-29-golden-truth-session-3.md` (route
  cards, matrices, three review parts, final review, warning breakdown, affected ids).

## Ranked blocks

### 1. Golden metadata remainder

Skill: `golden-truth`. Two `TODO.md` items under "Goldens":

- Dead provenance: 47 untouched files still cite a temporary path (94 before session 3). Repair
  them only during a verified touch of each case; no bulk edit. The session-3 rule for each
  path class is in the TODO item.
- Recheck the two dated source-metadata conflicts (`q-tool-soroban-auth-audit-live`,
  `q-protocol-ledger-close-time`).

Record the affected case-id list in the round ledger, as session 3 did.

### 2. Eval instruments

Skill: `run-evals`. Five items under `TODO.md` "Eval instruments":

- Two judge-prompt contradictions produce `error` rows (4% of the last run). Fix the prompt or
  the trap path; a rubric bump and behavior-class fixtures are required.
- Design and validate a three-outcome paired comparison verdict before another comparable rerun.
- Judge stability is degrading (47 → 57 unstable). Watch the trend at the next register refresh.
- Implement the `qa-five-track-v1` contract from ADR-0008.
- Implement the score-independent golden lifecycle after the five-track denominator contract.

### 3. Routing: `scout.searchResearch` for protocol-history questions

`search` never surfaces the research lane for incident questions such as
`q-protocol-24-whisk-incident`. The data is reachable; ranking is the fault. Measure on the
routing eval, not one case. A fix that helps only this case is unshipped.

### 4. Repository-level tooling recovery

Build the separate frozen 20-case suite before any ranking work. Add manifest-owned recovery from
adjacent or empty Docs evidence to one pinned `scout.explainRepo` attempt. Require 10 of 12 positive
recoveries and zero premature detours across eight negatives. Keep every existing lane frozen.

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

The 2026-08-28 human-review grill resolved every open owner question. The authoritative package is
ADR-0008, and `.agents/rounds/2026-08-28-human-review-grill.md` preserves the 21-item mapping.
No owner question is open.

## Suggested sequence

Start block 1 in an idle golden lane; it is small. Block 2 is the largest block and can start at
once. Run block 4 before any `sources.locate` discovery. Blocks 3, 5, and 6 fit an idle lane.
