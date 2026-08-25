---
name: truth-maintenance
description: Coordinate a full truth-maintenance pass for stellar-raven-codemode across live drift, evals, golden questions/answers, and improvements/issues/PR follow-up. Use when asked to ensure repo truth is current, review the current state of upstream findings or PRs the repo opened, run a multi-lane maintenance round, or orchestrate CI-like review work across several agents instead of one monolithic context window.
---

# Truth maintenance

This is the coordinator skill. It does not replace the lane runbooks:

- `live-drift-resolution` owns catalog/inventory/spec/op-class drift from live upstream services.
- `run-evals` owns eval instrument selection, result review, and eval-round closeout.
- `golden-truth` owns any golden question/answer/key-fact/avoid/source/grader-note change.
- `improvements-pipeline` owns `improvements/`, intake, probes, upstream issue/PR tracking, and index/lint.

Use this skill when the work crosses lanes or when the user asks for "truth is up to date"
rather than a single drift issue. The product is a maintenance round recorded in a ledger, with
lane verdicts, evidence, follow-ups, and cleaned-up spawned work.

## Orchestration contract

Use the global `herdr` skill for spawning, monitoring, and cleanup: one pane per lane, split from
your own pane. Select model and effort explicitly per `AGENTS.md`. This skill adds only
truth-maintenance lane structure.

Open one ledger for the round at `.agents/rounds/<YYYY-MM-DD>-truth-maintenance.md`.
Use fixed headings so spawned agents can append without clobbering each other:

```
# Truth maintenance <YYYY-MM-DD>
## Scope
## Lane plan
## Drift verdict
## Eval verdict
## Golden verdict
## Improvements/issues/PR verdict
## Own-repo todos
## Decisions
## Final checklist
```

By default, workers research/review and append to ledger; coordinator owns repo edits. Delegate
patches only when write set is narrow, explicit, and disjoint.

Reviewer and author are separate roles. A spawned reviewer must re-derive from files, diffs,
live probes, or GitHub state, not rubber-stamp the coordinator's summary. Let reviewers finish
unless the user cancels or they clearly error.

## Stale-gospel queue (the freshness lane — owned by this skill)

Golden freshness is not maintained by batch re-audits; it is a **standing due-date queue**.
Every `scheduled`-freshness QA case carries a `truth.reverifyBy` date, and
`npm run eval:qa:lint -- --stale` fails on any past-due case — wired into PR CI and the daily
refresh workflow, so a date passing fires within 24 hours. This skill owns that queue:

- **Triage on fire.** When the stale gate fails, dispatch each past-due case through the
  `golden-truth` lane: re-verify (update `truth.verified` + `truth.asOf` + a new
  `reverifyBy`) or record an explicit dated extension with rootCause. Never silently bump a
  date — the gospel-change lint audits either remedy.
- **Drip policy.** `reverifyBy` dates are set by the verifying author, quarter-granular and
  staggered across cases, so re-verification arrives as a steady drip instead of a cliff.
  When a round re-verifies many cases at once, spread the new dates; a wall of identical
  dates is a review finding.
- **Look ahead, not just behind.** A maintenance round should also sweep upcoming dates
  (e.g. the next 2–4 weeks) and fold near-due cases into the current round's golden lane
  rather than waiting for the gate to fire.

## Round plan

1. Define the question: scheduled truth refresh, stale-queue triage, drift issue, post-eval
   closeout, upstream PR/issue follow-up, golden-health sweep, or release/CI readiness.
2. Open the ledger and write the lane plan: lanes in scope, spawned agents, exact
   commands/probes, expected artifacts, and stopping criteria.
3. Run the lane runbooks in parallel where independent:
   - Drift lane: use `live-drift-resolution` for service inventory/catalog/spec/op-class
     refresh and drift classification.
   - Eval lane: use `run-evals` for selected instruments and result review.
   - Golden lane: use `golden-truth` for stale, contradictory, disputed, or volatile truth;
     the stale-gospel queue above feeds this lane its due and near-due cases.
   - Improvements lane: use `improvements-pipeline` for findings, probes, intake, and
     upstream issue/PR state.
4. Reconcile cross-lane effects:
   - Drift changed facts consumed by goldens or eval cases.
   - Eval failures imply new or updated improvements.
   - Upstream issue/PR resolution requires live re-probe of the original trigger.
   - Golden gospel changes require root-cause capture in improvements or `.agents/TODO.md` (the
     gospel-change lint enforces `truth.verified` evidence + rootCause in the same diff).
5. Run the final gates from the affected lane runbooks, then record exact commands, result
   stamps, issue/PR URLs, commit refs, and remaining risks in the ledger.

## Lane briefs

Use briefs like these; keep each agent's task bounded and append-only to the ledger.

**Drift reviewer**

Rebuild or inspect the generated drift artifacts, classify each changed service as
provenance/data, operation-surface, routing-text, or runner-affecting, run the relevant
guards, and append file:line/diff evidence plus a close/block verdict.

**Eval reviewer**

Review stored or newly produced eval results. Join rows with goldens, re-check wrong/partial
claims live, classify failures with the `run-evals` root-cause table, and identify new or
updated improvements and own-repo `.agents/TODO.md` entries.

**Golden reviewer**

For candidate golden changes or contradiction clusters, build the `golden-truth`
corroboration matrix from independent source classes. Do not edit files; return confirmed,
disputed, contradicted, or unverifiable with exact sources and as-of dates.

**Improvements/PR reviewer**

Enumerate findings with upstream issue/PR evidence, check current GitHub state, inspect
unresolved reviews/checks/comments for PRs this repo opened, re-run the original trigger or
probe, and append a deterministic status table plus recommended file updates. Treat
`fixed-upstream` as a deletion-candidate queue: a second reviewer, distinct from the author lane,
must independently repeat the live trigger and reconcile repo references before the active file is
retired through the `improvements-pipeline` resolved-ledger workflow. Declined/wontfix/legacy/overfit
findings remain active while the trigger reproduces; they are not resolution shortcuts.

## Deterministic state table

Use this table shape in the ledger for improvements/issues/PRs:

| finding | trigger | upstream ref | ref state | PR checks/reviews/blocker | live re-check | repo action | next wake-up |
|---|---|---|---|---|---|---|---|
| `sls-005` | eval stamp / probe / drift fact | issue/PR URL | open/closed/merged/stale/unknown | pass/fail/requested-changes/none | fixed/still-repro/inconclusive | no-op/status edit/successor/own todo | dated `.agents/TODO.md` entry |

Only mark `fixed-upstream` when the live re-check of the original trigger passes. A closed
GitHub issue or merged PR is evidence to inspect, not proof of resolution. If a PR is open
and waiting on review/CI/author changes, track the blocker and add a dated `.agents/TODO.md` entry
for the next follow-up instead of relying on memory.

## Closeout checklist

- The ledger has lane verdicts, exact commands/probes, spawned pane IDs, and final status.
- Every spawned agent is idle/finished; useful output is incorporated; no orphan follow-up
  `.agents/TODO.md` entry remains unless it names a concrete next check.
- Drift-generated artifacts are regenerated, not hand-edited.
- Golden changes went through `golden-truth` and include root-cause capture; the stale queue
  has no past-due `reverifyBy` dates left (`npm run eval:qa:lint -- --stale` is green) and
  newly set dates are staggered.
- Improvements index/lint/probes ran when `improvements/` changed.
- Every retired finding has a complete `improvements/resolved.json` receipt, a commit-pinned source,
  an upstream resolution comment when applicable, and no stale intake/probe/golden/research refs.
- Open upstream PRs/issues have deterministic next actions or scheduled follow-up.
- Every newly recorded GitHub issue, PR, or comment URL was read back successfully before being
  accepted as evidence; dangling refs and unposted drafts were removed or corrected.
- Filing waves were paced for owner-readable, deduplicated issues. Untouched open issues stayed
  silent unless the `improvements-pipeline` comment budget allowed a substantive response.
- `npm run secrets:scan -- --tree` runs before any commit that includes generated artifacts
  or copied upstream content.
