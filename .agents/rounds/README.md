# `rounds/` — dated ledgers for multi-lane work

One file per round: `<YYYY-MM-DD>-<slug>.md`. It replaces an external scratchpad.

Open the ledger before spawning any agent. Append to it; do not rewrite earlier entries. Two
reviewers appending to the same ledger must write to distinct sections, the same way two agents
editing code must hold disjoint file sets.

## Shape

```markdown
# <round name> — <YYYY-MM-DD>

## Scope
What is in this round, and what is deliberately out.

## Lanes
| lane | agent (model, effort) | pane | write set | status |

## Ledger
Append-only. One entry per event: the exact command or probe, what it returned, and the verdict.

## Outcome
Per lane: verdict, evidence stamps, commit refs, issue or PR URLs, remaining risk.
```

## Rules

- Record the exact command and its observed output, not a summary of it. A ledger that says
  "tests passed" is not evidence; one that carries the command and its result is.
- Name the model and effort for every spawned agent, and why that lane was chosen. `AGENTS.md`
  requires it for the independent-review gate.
- A verdict needs a stamp: a timestamp, a commit, a results file, or a URL.
- When a round changes gospel, capture the root cause in the ledger and link it from the change.
- Finish the round by writing the Outcome section. An unfinished ledger is an unfinished round.

## What a file cannot do

A ledger has no ids, no state machine, no locks, and nothing fires it. Two consequences.

- **Nothing claims a round.** Before opening `<date>-<slug>.md`, check whether that file already
  exists and whether another agent is working in it. The filename is the only claim there is.
- **Nothing wakes you.** A future check is a dated `.agents/TODO.md` entry that the next round
  reads, not a scheduled event. To wait on a running agent, use `herdr agent wait <name>` or
  `herdr agent prompt … --wait`; never poll, and never defer a blocked lane to a reminder that
  will not fire.
