# NEXT — handoff for the next work block

Written 2026-08-27 (late evening) from a review of `.agents/`, PRs #68–#85, and issues #39, #40,
#67. Read this first tomorrow. `TODO.md` holds the full item text; this file only ranks and
sequences. Delete or rewrite this file when the block below is done.

## State at handoff

- `origin/main` includes `e8dbf99 chore: resolve Scout 1.8.110 drift` and the agent handoff.
  Production runs Worker Version ID `6e1d34c2-ba35-4f45-a357-edc4e8116bf7`. Issue #67 is closed.
- Issue #39 is closed. Production returned Bridge, Wirex, Rain, and Cards402 before the two
  inactive records, Kulipa and GetBlockCard.
- Corpus lint: 0 errors, 475 warnings (372 long-fact across 204 cases, 47 sourcing-guard,
  56 corroboration). Confirmed by `node eval/qa/lint-corpus.mjs` at handoff.
- Both paid Connectors description candidates were rejected under preregistered stops. No repo
  work remains there. The Directory submission is external owner work.

## Ranked blocks

### 1. Improvements hygiene sweep — DONE 2026-08-28

PR #87 landed the lint contract, the re-checks, and the filing-ready findings. The seven
retirements landed in the follow-up PR from branch `lane/improvements-retire-20260828`. Ledger:
`.agents/rounds/2026-08-28-improvements-hygiene.md`.

- `improvements:lint` enforces the `upstreamTitle` contract.
- `sls-077` and `sls-078` filed as Stellar-Light/stellarlight#1086 and #1087.
- `sd-036` -> `fixed-upstream`; `sls-023`, `sls-024`, `sls-029`, `sls-033` still reproduce.
- The seven reviewed `fixed-upstream` findings were retired; 64 findings remain active.
- `sd-001` stays `fixed-upstream`: the crawl settled, but repo cleanup and three ranking
  residuals (`what is in Protocol 23`, `Protocol 27`, `Poseidon Rust SDK`) remain.
- Open upstream follow-up: Stellar-Light/stellarlight#1031 (`sls-074`) still open after the
  verification comment; the maintainer owns the close.

### 2. Eval measurement block (paid — ask before spend)

Skill: `run-evals`.

- Same-100 rerun at current `main`. Compare against
  `eval/qa/results/2026-08-27T00-02-11-variantA.json` (48/35/13/4, half-credit 65.5,
  strict 48.0, core-answer 91.7%). This run also reconciles the seven dated consistency reopens.
- Confirm `meta.judgeTierUsed` is on every verdict, then run `node eval/qa/judge-stability.mjs`.
- Add three owned QA cases under `eval/qa/corpus/` for the new Scout ops: `verifyClaim`
  ("Is Blend audited?"), `getQualityReport` ("How reliable is Scout status data?"), and
  `resolveProject` (a renamed project). The drift audit asked for these.
- Update `DEMO_GROK_CONTROL_MODEL` in `src/demo/model-config.ts` from `grok-4.5` to the current
  control model.

### 3. Golden-truth session 3 (largest block)

Skill: `golden-truth`. Method and pitfalls: `program-log.md` (session 2).

- First, the small fix: validate Stellar strkeys (CRC16) on golden import, with positive and
  negative tests for account and contract keys.
- Then clear the 372 long-fact warnings across 204 cases. Build a fresh helper pack from `main`;
  the old `/tmp/raven-qadeep/gt2/` pack expired. About 50 worker prompts, four cases each, three
  Sol high workers, one Grok high reviewer.
- Pair each touched case with block 4 so no case needs a second pass.

### 4. Dead provenance repair

97 temporary-path references across 94 corpus files. 69 cite the unrecoverable Fable report
`conversions-copy-review.md` and need re-verification through `golden-truth`. 27 cite the
session-2 Grok reviews and can migrate through a metadata-only review. One cites
`/tmp/raven-qadeep/review-judge.md`; its durable copy is
`research/qa-deep-dive-2026-08-25/review-judge.md`. No bulk edit.

### 5. Routing: `scout.searchResearch` for protocol-history questions

`search` never surfaces the research lane for incident questions such as
`q-protocol-24-whisk-incident`. The data is reachable; ranking is the fault. Measure on the
routing eval, not one case. A fix that helps only this case is unshipped.

### 6. Small own-repo fixes

- `test/demo-chat.test.ts` mocks the `ai` module, so the tool-loop guard never runs. Stub the
  model instead.
- `TERMS_EFFECTIVE_DATE` in `src/site.ts` waits on counsel.
- Decide cluster membership for the two `scout.hackathonBrief` cases.

## Owner decisions (no agent time, but they block work)

- Include or decline the two out-of-scope lint classes (47 sourcing-guard, 56 corroboration).
- Answer the 12 Lane-3 questions in `ideas/source-delivery-ranked-references.md` §8, or defer
  the idea. The phase-zero spike stays unapproved until then.
- Three synthesizer questions from `research/qa-deep-dive-2026-08-25/fable-max.md` §7 have no
  recorded decision: Q2 docs-vs-source grading policy, Q6 repo-level steering for
  "how do I do X in tool Y" questions, Q8 exclude provider-safeguard refusals from the score
  denominator. See the `TODO.md` entry.
- Issue #40 items 1 and 3 (paste cap, chat history).
- Connectors Directory: reviewer WorkOS account, portal wording, primary review contact, and
  item-8 scope confirmation from SDF security. Six portal questions are listed in
  `.agents/rounds/2026-08-25-connectors-directory-submission.md` §Open questions.

## Note: the "8 / 11 / 12 open questions" confusion

Three separate lists exist. Chat transcripts from 2026-08-27 confirm this.

- **8** = `research/qa-deep-dive-2026-08-25/fable-max.md` §7, questions for the plan synthesizer.
  Five are answered by the plan; three are still open (see Owner decisions above).
- **12** = `ideas/source-delivery-ranked-references.md` §8, the Lane-3 owner questions.
- **11** = a bookkeeping error. Commit `5548a58` (17:26 EDT) copied §8 into `TODO.md` and
  dropped question 12 (allowlist governance). The Sol lane-3 reviewer and the Grok audit reviewer
  both caught it at about 19:15–19:40 EDT. PR #84 (`6fec2fb`) corrected `TODO.md` to 12.

The 2026-08-27 transcript review found that the 12:59 EDT first draft had **7** questions. The
13:12 review asked for five more. They covered query ownership, index availability, CPU limits,
conflict grouping, and flag semantics. The 13:14 rewrite had **12**. No draft ever had 8 or 11.
The 8 belongs to the Fable list above.

The transcripts name the same next step: record an owner decision for each of the 12 questions,
then decide whether the phase-zero spike (one or two repos) gets a brief.

## Suggested sequence

Block 1 is done. Next: block 2 after spend authorization, then block 3 with block 4 folded in.
Blocks 5 and 6 fit any idle lane.
