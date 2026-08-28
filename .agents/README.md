# `.agents/` — agent instructions and durable working state

Four things live here. Keep them separate.

| path | holds | lifetime |
|---|---|---|
| `skills/` | repeatable task workflows (`<name>/SKILL.md`) | durable |
| `TODO.md` | the own-repo work queue | until each item is done |
| `NEXT.md` | the ranked handoff for the next work block | until that block is done |
| `rounds/` | one dated ledger per multi-lane round | durable record |

`.claude/skills` is a committed symlink to `skills/`. Codex scans `skills/` repo-scoped.

## Why these are files

Working state lives in the repository, in git, reviewable in a pull request. It is not held in an
external task tracker. An instruction nobody can `grep` is an instruction nobody follows: a
decision recorded outside the repo is invisible to the next agent and to CI.

Two consequences follow.

- A decision that should bind future work belongs in `AGENTS.md`, a skill, or an ADR under
  `research/decisions/` — not in a round ledger. Ledgers record what happened, not what is required.
- Anything an agent must not lose across a context window goes in a file in the same commit as the
  work it describes.

## Where a given note goes

- Upstream service defect → `improvements/<collection>/` (see `improvements/README.md`).
- Own-repo fix, gap, or follow-up → `TODO.md`.
- Evidence from a dated investigation → `research/audits/` or `eval/qa/reviewed/`.
- The working ledger of a round in progress → `rounds/<YYYY-MM-DD>-<slug>.md`.
- A durable design decision → `research/decisions/`.
