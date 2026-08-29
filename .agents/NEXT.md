# NEXT — handoff for the next work block

Written 2026-08-28 (evening) after blocks 1 and 2 landed. Read this first. `TODO.md` holds the
full item text; this file only ranks and sequences. Delete or rewrite this file when the block
below is done.

## State at handoff

- `origin/main` is clean. Production runs Worker Version ID
  `6282fe2a-54d8-471e-9f0a-0a2565110af1`, deployed 2026-08-28 from `main` HEAD.
- `improvements/`: 66 active findings, lint ok. Stellar-Light/stellarlight#1031 is still open;
  the maintainer owns the close.
- Corpus lint: 0 errors, 475 warnings (372 long-fact across 204 cases, 47 sourcing-guard,
  56 corroboration).
- Same-100 baseline for the next comparison: `eval/qa/results/2026-08-28T19-27-08-variantA.json`.
  Result artifacts are gitignored and local-only; `eval/qa/README.md` holds the committed record. Judge stability: 57 of 100 same-100 cases sit below 0.75.
- The Terms are in force. `TERMS_EFFECTIVE_DATE` is `August 5, 2026` and stays as is.
- Ledgers for the finished blocks: `.agents/rounds/2026-08-28-improvements-hygiene.md` and
  `.agents/rounds/2026-08-28-eval-block2.md`.

## Ranked blocks

### 1. Golden-truth session 3 (largest block)

Skill: `golden-truth`. Method and pitfalls: `program-log.md` (session 2).

- First, the small fix: validate Stellar strkeys (CRC16) on golden import, with positive and
  negative tests for account and contract keys.
- Then clear the 372 long-fact warnings across 204 cases. Build a fresh helper pack from `main`;
  the old `/tmp/raven-qadeep/gt2/` pack expired. About 50 worker prompts, four cases each, three
  Sol high workers, one Grok 4.6 high reviewer.
- Run the confirmed warning audit without treating zero as the target: 20 sourcing-guard cases
  (eight targeted, twelve seeded-random) and classifications for all 56 corroboration warnings.
- Fold the five reviewed canonical-page cases into this block through `golden-truth`; keep the
  three-case caution boundary and handle the Protocol 27 snapshot fact separately.
- Fold block 2 into every touched case so no case needs a second pass.
- Record the affected case-id list in the round ledger. The next same-100 rerun reads that list
  to decide per-id comparability.

### 2. Dead provenance repair

97 temporary-path references across 94 corpus files. 69 cite the unrecoverable Fable report
`conversions-copy-review.md` and need re-verification through `golden-truth`. 27 cite the
session-2 Grok reviews and can migrate through a metadata-only review. One cites
`/tmp/raven-qadeep/review-judge.md`; its durable copy is
`research/qa-deep-dive-2026-08-25/review-judge.md`. No bulk edit.

### 3. Eval instruments

Skill: `run-evals`. Four items under `TODO.md` "Eval instruments":

- Two judge-prompt contradictions produce `error` rows (4% of the last run). Fix the prompt or
  the trap path; a rubric bump is required.
- `--max-panel-cases 10` denied panels to 21 of 31 boundary rows. Scale the cap with the
  denominator and print the skipped count in the run summary.
- Judge stability is degrading (47 → 57 unstable). Watch the trend at the next register refresh.
- Golden-edit rounds must record affected ids (covered by block 1 above).
- Implement the `qa-five-track-v1` contract from ADR-0008. Keep first-pass quality, retry recovery,
  safety behavior, harness health, and provider availability separate.
- Implement the score-independent golden lifecycle after the five-track denominator contract. Keep
  quarantined cases diagnostic without changing sample membership.

### 4. Routing: `scout.searchResearch` for protocol-history questions

`search` never surfaces the research lane for incident questions such as
`q-protocol-24-whisk-incident`. The data is reachable; ranking is the fault. Measure on the
routing eval, not one case. A fix that helps only this case is unshipped.

### 5. Repository-level tooling recovery

Build the separate frozen 20-case suite before any ranking work. Add manifest-owned recovery from
adjacent or empty Docs evidence to one pinned `scout.explainRepo` attempt. Require 10 of 12 positive
recoveries and zero premature detours across eight negatives. Keep every existing lane frozen.

`sources.locate` stays deferred. Its phase-zero study reopens only through the measured trigger in
`ideas/source-delivery-ranked-references.md` §8.

### 6. Playground message limit

Raise the user-message ceiling from 4,000 to 8,000 characters. Keep excessive text intact, disable
Send, show the accessible count and error, and reject bypassed requests server-side. Keep the
Playground stateless; durable session history remains a deferred idea.

### 7. Small own-repo fixes

- `test/demo-chat.test.ts` mocks the `ai` module, so the tool-loop guard never runs. Stub the
  model instead.
- Decide cluster membership for the two `scout.hackathonBrief` cases.

## Owner decisions

The 2026-08-28 human-review grill resolved every item in this handoff. The authoritative package is
ADR-0008, and `.agents/rounds/2026-08-28-human-review-grill.md` preserves the 21-item mapping.

- The warning classes now have an audit plan.
- `sources.locate` and its twelve design questions stay deferred behind a measured trigger.
- Docs-versus-source grading, repository recovery, provider safeguards, retries, and golden
  lifecycle have accepted contracts.
- Issue #40 uses an 8,000-character fail-loud limit and keeps history stateless.
- Connectors Directory work is blocked externally in Slack and Google Docs. It is not repo work.

No owner question from that grill remains open.

## Suggested sequence

Start block 1 with block 2 folded in. Block 3 can proceed between golden sessions. Run block 5
before any `sources.locate` discovery. Blocks 4, 6, and 7 fit an idle lane.
