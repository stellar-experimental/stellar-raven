# Item 8.10 plan: audit of item 8.9, corrections, and the 8.9 close-out

Lead and auditor: Claude Fable (`claude-fable-5-2`), agentpc `t20j`. Branch `np/8.10-audit-8.9` from
`origin/main` at `50418fa3`. Orchestrator note: `/home/tyler/code/raven-wt/orch/8.10-NOTE.md` (binds
over `briefs/ITEM-LEAD.md`).

## Decision this item changes

Whether each of the eight item 8.9 lanes (#499 to #506) stands as merged, and which corrections land.
It also closes item 8.9 in the TODO, the ledger and DECISIONS.md.

## Steps

1. **Audit (lead, no child).** For each lane read its brief, REPORT, REVIEW and the full merged diff,
   and run targeted free checks where reading cannot decide (a test file, a probe of a pure
   function). Judge correct, complete, fit and well made. Findings with file:line evidence go to
   `items/8.10/AUDIT.md`, one verdict per lane: `good`, `good with fixes`, or `rework`.
   The `flush` lane is read from `--stat`, its script and its test only; no deleted file is opened.
2. **Fix list.** A finding becomes a fix only when it names a wrong result, a weakened guard, a
   missed "Done when", or cruft a reader would trip on. Taste stays. Each fix names its files.
3. **Executor (Claude Sonnet, `hc` child, high effort).** One brief under `items/8.10/briefs/`: the
   fix list plus the close-out edits in the note (`.agents/TODO.md`, the round ledger, the hooks
   wording in `AGENTS.md`, `golden-truth`, `.agents/README.md` and the model roster,
   `usage/README.md`, DECISIONS.md). It writes `EXEC.md` and commits on this branch.
4. **Re-check (lead).** Read the executor's whole diff, run the gates bare, add the ledger rows'
   final numbers, push, open one pull request (`Refs` only), write `REPORT.md`, send its path.

## Gates

`npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`. Added by area:
`npm run eval:routing -- --gate` if a fix touches routing code under `eval/`; `npm run test:smoke` if
it touches `src/executor` or `src/demo`; `npm run eval:selftest` if it touches `eval/self-test.mjs`
or `eval/lib/`; the `CONTRIBUTING.md` "Checks" row of any other area a fix touches. A fix under
`src/` states whether Worker bytes change.

## Spend and stop rule

- No model-calling eval. One Sonnet executor on the subscription; at most one further Sonnet round
  for my re-check findings. USD 0 API.
- One audit pass per lane. I stop a lane when its diff is read and each of the four questions has
  an answer with evidence; I do not re-run a lane's own gates beyond what a finding needs.
- If a correction would reopen a recorded decision, change a security boundary's design, or need a
  model-facing measurement, it goes to the report as an owner or orchestrator question, not into
  the pull request.

## Risks

- Case text: the flush lane and the hook lane sit next to it. Searches use
  `rg --hidden -g '!.git'`; no file under the case paths or the two golden round folders is opened.
- `scrub` is deployed and model-facing. A fix there changes Worker bytes and needs the served-text
  check and a deploy; I say so in the report.
- The hook guard fails open by design; a fix must not turn a false denial into a blocked lane.

## Needed from the orchestrator or owner

Nothing to start.
