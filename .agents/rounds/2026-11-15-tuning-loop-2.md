# Round 2026-11-15: second tuning loop

Orchestrator: Claude Fable 5.2 (Mac, `hc`). Lanes run on the owner's Linux machine under the
owner's Claude subscription (owner, 2026-11-14: approved subscription spend for evals and tuning
loops while weekly limits have headroom). No API-billed path. Worktree
`/home/tyler/code/raven-wt/loop2`, branch `tune/loop-2`, from `origin/main` at `0a603453` (loop 1
merged and deployed there).

## Scope

The owner approved this order on 2026-11-14:

1. Carry the corroboration guard for audit, incident and governance claims on a surface every
   client receives; measure it; then remove the source micro-map from the server instructions.
2. Land the `stellarOrg` source (PR 439, held). With the map in place it overflows Claude Code's
   4,096 characters by 594.
3. Seven search cards by default against five (caps audit M1).
4. Per-client delivery fixes from the client text-limits probe: the first line of the
   instructions and the first 120 characters of each tool description stand alone; `execute` is
   2,029 characters against Grok's 2,033 cut.
5. Agents that never call research on a named SEP or CAP (the routing gap loop 1's arm 2 cannot
   reach).

Plan: [PLAN.md](2026-11-15-tuning-loop-2/PLAN.md) (Claude Fable 5.2, lane `loop2-plan`). It is
not adopted until its review is reconciled and the orchestrator rules on its open questions Q1 to
Q7. No paid run is authorized by this file yet: each run gets its own authorization entry below
before launch. Loop 1's record is [the 2026-11-14 round](2026-11-14-baseline-tuning.md).

## Rules that bind every lane

- A general mechanism or the case stays red. No case id, question phrase or golden fragment in
  any product surface.
- Subscription spend on Claude models only. `sets.tuning` is the only part of the split a lane
  reads, and a script selects rows by tuning id before it reads any other field.
- Held-out and reserve rows are never opened. A held-out read is counts only, launched by the
  orchestrator with `eval/qa/heldout-read.sh`.
- Every run in a comparison uses the same judge-panel policy and stability register. A change
  counts only when its cause is traced in the transcript.

## Orchestrator ruling: routing rows that duplicate held-out questions

The owner agreed with the lean (2026-11-14). The 73 legacy and 26 extended routing rows that
duplicate held-out or reserve QA questions are off-limits for routing tuning. No lane reads their
per-row output; aggregate gate counts stay allowed. Their ids are not recorded anywhere.

## Lanes

| Lane | Model | Terminal | State | Output |
|---|---|---|---|---|

## Ledger
