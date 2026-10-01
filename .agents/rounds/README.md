# `rounds/` — dated ledgers for multi-lane work

One file per round: `<YYYY-MM-DD>-<slug>.md`. A ledger is working state for one round. It stays
after reconciliation only while a current artifact needs its evidence. The retention rule is in
[`../README.md`](../README.md#retention).

Open the ledger before spawning any agent. While the round runs, append to it; do not rewrite
earlier entries. Two reviewers appending to the same ledger must write to distinct sections, the
same way two agents editing code must hold disjoint file sets.

## Shape

```markdown
# <round name> — <YYYY-MM-DD>

## Scope
What is in this round, and what is deliberately out.

## Lanes
| lane | agent (model, effort) | pane | write set | status |

## Ledger
Append-only while the round runs. One entry per event: the exact command or probe, a summary of
what it returned, and the verdict.

## Outcome
Per lane: verdict, evidence stamps, commit refs, issue or PR URLs, remaining risk. Name the
retained evidence and the current artifact that needs it.
```

## Rules

- Record the exact command and its result. A ledger that says "tests passed" is not evidence; one
  that carries the command and its result is. Keep full output only when a current consumer needs it.
- Name the model and effort for every spawned agent, and why that tier was chosen. `AGENTS.md`
  requires it for the independent-review gate.
- A verdict needs a stamp: a timestamp, a commit, a results file, or a URL.
- When a round changes gospel, capture the root cause in the ledger and link it from the change.
- Finish the round by writing the Outcome section. An unfinished ledger is an unfinished round.

## What a file cannot do

A ledger has no ids, no state machine, no locks, and nothing fires it.

- **Nothing claims a round.** Before opening `<date>-<slug>.md`, check whether that file already
  exists and whether another agent is working in it. The filename is the only claim there is.
- **Nothing wakes you.** A future check is a dated `.agents/TODO.md` entry that the next round
  reads, not a scheduled event.
