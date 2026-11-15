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
| `loop2-plan` | Claude Fable 5.2 | (finished) | Plan written | [PLAN.md](2026-11-15-tuning-loop-2/PLAN.md) |
| plan review | Claude Opus 5.5 | (finished) | Reviewed: launch after amendments | [PLAN-REVIEW.md](2026-11-15-tuning-loop-2/PLAN-REVIEW.md) |
| `loop2-impl` | Claude Sonnet 5.5 | `t1pk`, parent `kalepail-c3614nvxph-mbp/t40f` | Step 1 free work done, pushed; awaits the diff review and the P0 and P1 authorizations | [STEP-1-IMPL.md](2026-11-15-tuning-loop-2/STEP-1-IMPL.md) |

## Ledger

### 2026-11-15: orchestrator rulings on the plan review

Direct instruction to the implementer (`loop2-impl`). The review file is the authoritative text;
the amendments are copied from it verbatim in [PLAN-AMENDMENTS.md](2026-11-15-tuning-loop-2/PLAN-AMENDMENTS.md).

- Amendments A1 to A10 in `PLAN-REVIEW.md` are all adopted.
- Q1 is decided as amendment A2: the primary record a result returned counts as support; a
  party's statement about itself does not.
- Q2 to Q7 are decided as the reviewer answers them (Q2 ship seven cards inside P2; Q3 item 5 may
  run, with A6; Q4 the 58-row panel and repeat passes; Q5 required before P2, as A7; Q6 do not
  re-home the "not for" guidance now; Q7 keep the order, and report each run's research-call share
  on the 17 identifier rows).
- No paid run is authorized by these rulings. The implementer does the free work for step 1 only.
- Implementer reading, to be confirmed by the orchestrator: A10 adopted means P2's two extra
  passes over the 12 source rows are cut (P2 becomes one pass over the 58 rows plus nothing
  else), so the plan's "three passes" paired check on the source rows and its gain figure are
  dropped. P1's guard-row passes and R's passes stay, as A10 says.

### 2026-11-15: step 1, free work (no paid run)

[STEP-1-IMPL.md](2026-11-15-tuning-loop-2/STEP-1-IMPL.md). Code tip `0a343e3f` (the guard `b8ea957d`, then the map removal alone, which reverts
alone). The amended panel is 58 rows and the scan reproduces the plan's counts. The guard rows are 10 by the amended claim words (the plan's 8
plus two); the stored with-map reference is 1 violation in 29 exposed answers (1 in 24 by the plan's list), no map 1 in 9 (1 in 8), class 3 bare
0 in both. All gates 0 on every tip. **No paid run is authorized by this entry.** Open for the orchestrator: the guard-row count (10 or 8), the A10
reading, and the independent review of the diff before P0 and P1.
