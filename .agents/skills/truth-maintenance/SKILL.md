---
name: truth-maintenance
description: Coordinate a full truth-maintenance pass for stellar-raven-codemode across live drift, evals, golden questions/answers, and improvements/issues/PR follow-up. Use when asked to ensure repo truth is current, review the current state of upstream findings or PRs the repo opened, run a multi-lane maintenance round, or orchestrate CI-like review work across several agents instead of one monolithic context window.
---

# Truth maintenance

This skill coordinates; the lane skills do the work:

| Lane | Skill | Owns |
|---|---|---|
| Drift | `live-drift-resolution` | Inventory, catalog, spec, and op-class drift |
| Eval | `run-evals` | Instrument choice, spend, and result review |
| Golden | `golden-truth` | Every golden question, answer, key fact, avoid, and note change |
| Improvements | `improvements-pipeline` | Findings, intake, probes, and upstream issue and PR state |

Use it when the work crosses lanes or the request is "is repo truth current?". For one drift issue
or one stale case, use the lane skill directly.

## 1. Scope the round

Size the work before you start it. Write in the ledger
(`.agents/rounds/<YYYY-MM-DD>-truth-maintenance.md`):

- the question the round answers: stale-queue triage, drift, upstream follow-up, golden health, or
  release readiness;
- only the lanes that question needs, and for each its commands or probes, expected artifact, and
  stop rule;
- the expected time and cost. Lanes run here on `hc` with subscription CLI agents; any paid eval
  follows the `run-evals` spend rule.

Run one session when the lanes are small. Spawn a lane agent (`AGENTS.md` "Coordination") only when
the lane is independent and large enough to pay for the handoff. Workers research and append to the
ledger under their own heading; the coordinator owns repo edits unless a write set is narrow,
explicit, and disjoint. A reviewer re-derives from files, diffs, live probes, or GitHub state, not
from the coordinator's summary.

Ledger headings: `Scope`, `Lane plan`, one verdict section per lane in scope, `Own-repo todos`,
`Decisions`, `Final checklist`.

## 2. The stale-gospel queue

This skill owns golden freshness as a standing due-date queue. Every `scheduled` case has a
`truth.reverifyBy` date, and `npm run eval:qa:lint -- --stale` fails on a past-due case in PR CI
and the daily refresh.

- **When the gate fires**, send each past-due case through `golden-truth`: re-verify it (update
  `truth.verified`, `truth.asOf`, and `reverifyBy`), or record a dated extension with a root cause.
  The gospel-change lint does not require evidence when only `reverifyBy` changes, so a reviewer
  checks the evidence for either action.
- **Stagger new dates** by quarter across cases. A wall of identical dates is a review finding.
- **Source sentinels fire early.** The daily `golden-sentinels` workflow keeps one labeled issue
  open while an anchor drifts. Queue each drifted case ahead of its `reverifyBy` date. A drift is a
  trigger, never evidence; when the fact holds and only the wording moved, re-author the anchor.
- **Look ahead.** Fold cases due in the next two to four weeks into the current round.
- **Corpus health**, when the round asks for it: scan `eval/qa/consistency-register.json` clusters
  for cross-question contradictions, sample a refute-then-repair sweep weighted toward
  freshness-sensitive, numeric, and non-`confirmed` cases, and re-verify any `dateContingentTraps`
  whose trigger has passed. Fixes go through `golden-truth`.

## 3. Reconcile across lanes

- Drift changed a fact that a golden or eval case consumes.
- An eval failure implies a new or updated finding.
- An upstream issue or PR resolution needs a live re-run of the original trigger. A closed issue or
  merged PR is not proof.
- A golden change needs its root cause in `improvements/` or `.agents/TODO.md`.

Track improvements, issues, and PRs in the state table from `improvements-pipeline` ("Follow up on
filed findings"). A `fixed-upstream` finding retires only after a second reviewer repeats the live
trigger. Declined findings stay active while the trigger reproduces.

## 4. Close

Stop when each lane in scope has a verdict with evidence. Then confirm:

- Each lane ran its own final gates; the ledger records commands, result stamps, URLs, and commits.
- `npm run eval:qa:lint -- --stale` is green and new `reverifyBy` dates are staggered.
- Improvements index, lint, and probes ran if `improvements/` changed; every retired finding has a
  complete `resolved.json` receipt and no stale references.
- Every recorded GitHub URL was read back; untouched open issues stayed silent.
- Open upstream refs have a next action or a dated `.agents/TODO.md` entry that names a concrete
  check.
- Lanes you started are finished and their output is incorporated.
- `npm run secrets:scan -- --tree` ran before any commit with generated or copied upstream content.
