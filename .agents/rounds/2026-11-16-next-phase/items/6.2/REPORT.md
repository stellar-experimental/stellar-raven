# Item 6.2 report: Docs titles hold, evaluated and ended

Lead: Claude Opus 5.5, agentpc `t1v9`, 2026-11-17.

## Pull request and result

- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/474 (`Refs #223`). It is not merged.
- **Decision: absorb.** The pre-registered rule says absorb, and both independent second opinions
  ([SECOND-OPUS.md](SECOND-OPUS.md) and [SECOND-FABLE.md](SECOND-FABLE.md)) agree.
- **Answer A/B** ([RESULTS.md](RESULTS.md)):
  - Design: 10 questions, HOLD against FRESH, on Claude Fable 5.2, Opus 5.5 and Sonnet 5.5.
  - Collection: 60 of 60 runs answered, with no retry, for USD 19.9 subscription-equivalent.
  - Blind grading: FRESH has 0 losses, 1 win and 29 ties. Neither arm has a fabrication, and reach
    is identical in every pair.
  - The rule is the note's rule with a margin of two and an attribution clause. Both adjustments
    came from the Fable plan review, before any run ([PLAN.md](PLAN.md), reconciliation table).
- **Routing re-baseline:**
  - Legacy top1 goes from 220 to 219 and top5 from 327 to 326.
  - Holdout top3 goes from 27 to 26, read as a count only. It now equals its floor of 26, so the
    next change that costs one holdout top-3 fails the gate. The `gates.json` note and the TODO
    say so.
  - Extended, skills and protocol history are unchanged in grade.
- **Hold text:** removed from the drift summary, `inventory/README.md` and the TODO. #223 stays
  open for the general routing repair.
- **Split v11** (the answer to [QUESTION.md](QUESTION.md)): the script's outcome was "moved". The
  file is `~/backups/gca-2026-11-14-split-v11.json`, SHA-256
  `bb4390d3398f5e0cbdf99948bdd61be4b6872fe57c2484524802771407d71fd6`, with 93 tuning, 109
  held-out and 45 reserve cases. `TUNING_ROW_COUNT` is 93, and the dated briefs, `PRESTAGE.md` and
  the TODO point at v11.
- **Gates**, each run bare by the lead at `d8bbee9e`: typecheck, test (3744 passed), build, the
  routing gate (PASS) and the secrets scan. All exit 0.
- **Reviews:**
  - Fable plan review: 13 findings (4 blocking), all adopted.
  - Codex frontier (`gpt-6-astra`, high) diff review: PASS, with 1 low finding (the harness retry
    budget). It is recorded, and it did not arise in this run.
- **Limits:**
  - The result shows no detectable harm, not a gain.
  - Each cell has one sample, and only Claude clients ran.
  - The third lost row (holdout) was not tested.
  - The "Varial" probe did not separate the arms. Arm identity rests on `sourceRevision`, the
    clean tree and the manifest hashes.
  - HOLD was X in 22 of 30 pairs (chance). That imbalance works against absorb, not for it.

## Deploy

**Needed.** The catalog search keywords for the Stellar Docs operations change, and they are
model-facing. The measured verdict is absorb on the answer A/B; routing is measured by the gate.

## For the orchestrator on the Mac

- **Squash-merge** #474, so the titles absorb (commit A) and the gates re-baseline (commit B) land
  as one commit.
- **Merge before 2026-11-23 18:00 UTC**, so the dated timers read v11 from `origin/main`. If that
  is missed, hold the merge until 2.1 and its follow-ups have merged, then rebase.
- Copy split v11 to the Mac.
- Deploy after the merge.

## Disclosures

- A lead `grep -rn` printed one QA case's path and two golden source lines. That case moved to
  tuning in v11.
- A lead `--gate` run put part of the routing holdout table on screen. This is the known runner
  behavior from the 3.5 TODO item. Nothing was tuned on it, and the lane was used as counts only.
- Before the fixes, `blind.mjs` attribution and the `ab-run.mjs` budget check each have a known
  defect: an empty `R`, and a retry outside the cap. Both are recorded in RESULTS.md, and neither
  arose here.

## Open questions for the owner

None.
