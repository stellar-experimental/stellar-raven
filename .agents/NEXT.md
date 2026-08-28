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

### 4. Routing: `scout.searchResearch` for protocol-history questions

`search` never surfaces the research lane for incident questions such as
`q-protocol-24-whisk-incident`. The data is reachable; ranking is the fault. Measure on the
routing eval, not one case. A fix that helps only this case is unshipped.

### 5. Small own-repo fixes

- `test/demo-chat.test.ts` mocks the `ai` module, so the tool-loop guard never runs. Stub the
  model instead.
- Decide cluster membership for the two `scout.hackathonBrief` cases.

## Owner decisions (no agent time, but they block work)

- Include or decline the two out-of-scope lint classes (47 sourcing-guard, 56 corroboration).
- Answer the 12 Lane-3 questions in `ideas/source-delivery-ranked-references.md` §8, or defer
  the idea. The phase-zero spike stays unapproved until then.
- Three synthesizer questions from `research/qa-deep-dive-2026-08-25/fable-max.md` §7 have no
  recorded decision. Q2: docs-vs-source disputes — grade truth per Core/source or per the tested
  surface (the same question as Lane 3 §8 item 6)? Q6: should `search` or the server
  instructions steer "how do I do X in tool Y" questions to repo-level operations such as
  `scout.explainRepo` when the docs family returns adjacent-only hits? Q8: exclude
  provider-safeguard refusals (for example `q-n3-ssrf-metadata-endpoint`) from the score
  denominator? The other five §7 questions were answered by the plan (A1, A2, A3, R8) or by the
  2026-08-27 same-100 run.
- Issue #40 items 1 and 3 (paste cap, chat history).
- Connectors Directory: reviewer WorkOS account, portal wording, primary review contact, and
  item-8 scope confirmation from SDF security. Six portal questions are listed in
  `.agents/rounds/2026-08-25-connectors-directory-submission.md` §Open questions.

## Suggested sequence

Start block 1 with block 2 folded in. Block 3 fits between golden sessions. Blocks 4 and 5 fit any
idle lane. Owner decisions can land at any time.
