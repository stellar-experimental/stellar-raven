# `rounds/` — dated ledgers for multi-lane work

One file per round: `<YYYY-MM-DD>-<slug>.md`. A ledger is working state for one round.
[`../README.md`](../README.md#retention) says how long it stays.

## Shape

```markdown
# <round name> — <YYYY-MM-DD>

## Scope
What is in this round, and what is deliberately out. The decision it changes, the smallest run
that can change it, the expected time and cost, where it runs, and the stop rule.

## Lanes
| lane | agent (model, effort) | terminal | write set | status |

## Ledger
Append-only while the round runs. One entry per event: the exact command or probe, a summary of
what it returned, and the verdict.

## Outcome
Per lane: verdict, evidence stamps, commit refs, issue or PR URLs, remaining risk. Name the
retained evidence and the current artifact that needs it.
```

## Rules

- Before you open `<date>-<slug>.md`, check that the file does not exist and that no other agent
  works in it. The filename is the only claim.
- Open the ledger before you spawn an agent. Append; do not rewrite earlier entries. Two agents
  that append to one ledger write to distinct sections.
- Record the exact command and its result. "Tests passed" is not evidence. Keep full output only
  when a current consumer needs it.
- Name the model and effort of every spawned agent and why that tier was chosen.
- A verdict needs a stamp: a timestamp, a commit, a results file, or a URL.
- When a round changes a golden answer, record the root cause here and link it from the change.
- Close the round by writing the Outcome section and moving open work to `.agents/TODO.md`.
- Nothing wakes you. A future check is a dated `.agents/TODO.md` entry that the next round reads.
