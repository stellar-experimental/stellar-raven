# NEXT — handoff for the next work block

Written 2026-08-27 (late evening) from a review of `.agents/`, PRs #68–#85, and issues #39, #40,
#67. Read this first tomorrow. `TODO.md` holds the full item text; this file only ranks and
sequences. Delete or rewrite this file when the block below is done.

## State at handoff

- `HEAD` includes `e8dbf99 chore: resolve Scout 1.8.110 drift`. The commit is on `origin/main`.
  Production runs Worker Version ID `6e1d34c2-ba35-4f45-a357-edc4e8116bf7`. Issue #67 is closed.
- Issue #39 remains open. Repeat its exact card-services query through production before closure.
- Corpus lint: 0 errors, 475 warnings (372 long-fact across 204 cases, 47 sourcing-guard,
  56 corroboration). Confirmed by `node eval/qa/lint-corpus.mjs` at handoff.
- Both paid Connectors description candidates were rejected under preregistered stops. No repo
  work remains there. The Directory submission is external owner work.

## Ranked blocks

### 1. Verify and close #39

Repeat the exact card-services query through production. Confirm that Bridge, Wirex, Rain, and
Cards402 lead the result. Confirm that Kulipa is inactive. Record the evidence on issue #39, then
close it if the full answer is correct.

The Scout 1.8.110 drift is deployed. Do not close #39 from catalog inspection alone.

### 2. Improvements hygiene sweep

One agent, no paid calls. Skill: `improvements-pipeline`.

- Make `scripts/improvements-lint.mjs` enforce the 20–120 character `upstreamTitle` cap and
  require the field at `verified`.
- File `sls-077` and `sls-078` upstream.
- Live re-check the five stale `reported-upstream` findings whose issues are closed:
  `sd-036`, `sls-023`, `sls-024`, `sls-029`, `sls-033`.
- Retire the `fixed-upstream` queue with a distinct reviewer: `sk-006`, `sk-009`, `sd-008`,
  `sd-025`, `sls-074`, `sls-075`, and `sls-076`.
- Re-check `sd-001` against the settled Algolia index; the daily crawl has run twice since the fix.

### 3. Eval measurement block (paid — ask before spend)

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

### 4. Golden-truth session 3 (largest block)

Skill: `golden-truth`. Method and pitfalls: `program-log.md` (session 2).

- First, the small fix: validate Stellar strkeys (CRC16) on golden import, with positive and
  negative tests for account and contract keys.
- Then clear the 372 long-fact warnings across 204 cases. Build a fresh helper pack from `main`;
  the old `/tmp/raven-qadeep/gt2/` pack expired. About 50 worker prompts, four cases each, three
  Sol high workers, one Grok high reviewer.
- Pair each touched case with block 5 so no case needs a second pass.

### 5. Dead provenance repair

97 temporary-path references across 94 corpus files. 69 cite the unrecoverable Fable report
`conversions-copy-review.md` and need re-verification through `golden-truth`. 27 cite the
session-2 Grok reviews and can migrate through a metadata-only review. One cites
`/tmp/raven-qadeep/review-judge.md`; its durable copy is
`research/qa-deep-dive-2026-08-25/review-judge.md`. No bulk edit.

### 6. Routing: `scout.searchResearch` for protocol-history questions

`search` never surfaces the research lane for incident questions such as
`q-protocol-24-whisk-incident`. The data is reachable; ranking is the fault. Measure on the
routing eval, not one case. A fix that helps only this case is unshipped.

### 7. Small own-repo fixes

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
- **11** = a bookkeeping error. Commit `5548a58` copied §8 into `TODO.md` and dropped question 12
  (allowlist governance). The Sol lane-3 reviewer and the Grok audit reviewer both caught it.
  PR #84 (`6fec2fb`) corrected `TODO.md` to 12. No list grew from 8 to 11.

The transcripts name the same next step: record an owner decision for each of the 12 questions,
then decide whether the phase-zero spike (one or two repos) gets a brief.

## Suggested sequence

Day 1: blocks 1 and 2 in parallel lanes (block 2 does not touch the drift tree). Day 2 onward:
block 3 after authorization, then block 4 with block 5 folded in. Blocks 6 and 7 fit any idle
lane.
