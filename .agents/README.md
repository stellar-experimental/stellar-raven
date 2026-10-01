# `.agents/` — agent instructions and durable working state

Four things live here. Keep them separate.

| path | holds | lifetime |
|---|---|---|
| `skills/` | repeatable task workflows (`<name>/SKILL.md`) | durable |
| `model-roster.md` | the map from `AGENTS.md` model tiers to exact model IDs | durable; update when a CLI catalog changes |
| `TODO.md` | the own-repo work queue, its priorities, and open owner decisions | until each item is done |
| `rounds/` | one dated ledger per multi-lane round | until reconciliation; retain only cited evidence or a unique durable decision |

`.claude/skills` is a committed symlink to `skills/`. Codex scans `skills/` repo-scoped. Each skill
is a plain-Markdown runbook, so any agent can read it directly.

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
- Own-repo fix, gap, follow-up, or owner decision → `TODO.md`.
- Evidence from a dated investigation → `research/audits/` or `eval/qa/reviewed/`.
- The working ledger of a round in progress → `rounds/<YYYY-MM-DD>-<slug>.md` (see
  `rounds/README.md`).
- A durable design decision → `research/decisions/`.

## Retention

- Keep one ledger while a round runs.
- At closure, move open work to `TODO.md` and durable rules to the nearest current guide or ADR.
- Keep a dated ledger only while a current artifact needs its evidence.
- Keep a raw report only when a current artifact cites it or needs it to interpret retained evidence.
- Delete other briefs, intermediate reviews, raw outputs, and completed ledgers after reconciliation.
- A link from another historical record does not establish a retention need.
- Preserve historical content through Git; do not rewrite it to describe current tools.
- Record the retained evidence and its current consumer in the round's Outcome section.
