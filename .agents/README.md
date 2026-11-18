# `.agents/` — agent instructions and working state

| Path | Holds | Lifetime |
|---|---|---|
| `skills/` | Repeatable task procedures (`<name>/SKILL.md`). `.claude/skills` is a committed symlink to it. | Durable |
| `model-roster.md` | Family-to-launch-line map for the `AGENTS.md` tiers and the eval and test set | Durable; names families, so a family move needs no edit |
| `TODO.md` | The own-repo work queue and open owner decisions | Until each item is done |
| `rounds/` | `<YYYY-MM-DD>-<slug>.md` ledger per multi-lane round, plus an optional `<YYYY-MM-DD>-<slug>/` working folder for briefs, plans, and reviews | Until reconciliation (see Retention) |

Working state lives in the repository so that the next agent and CI can read it. A decision
recorded elsewhere does not exist for them.

## Where a note goes

| Note | Place |
|---|---|
| Upstream service defect | `improvements/<collection>/` ([`improvements/README.md`](../improvements/README.md)) |
| Own-repo fix, gap, follow-up, or owner decision | `TODO.md` |
| Working ledger of a round in progress | `rounds/<YYYY-MM-DD>-<slug>.md` ([`rounds/README.md`](rounds/README.md)) |
| Evidence from a dated investigation | `research/audits/` or `eval/qa/reviewed/` |
| A rule that binds future work | `AGENTS.md`, a skill, or an ADR under `research/decisions/` |

A ledger records what happened. It never sets a rule.

## Retention

- Keep one ledger while a round runs.
- At closure, move open work to `TODO.md` and durable rules to the nearest guide or ADR.
- Keep a dated ledger or raw report only while a current artifact cites it or needs it to
  interpret retained evidence. Name that artifact in the round's Outcome section. A link from
  another historical record is not such a need.
- Delete other briefs, intermediate reviews, raw outputs, and finished ledgers after
  reconciliation. Git keeps the history; do not rewrite a retained record to describe current
  tools.
- Deleted branches are archived in dated git bundles outside the repository; the item record that
  deleted them lists each ref, SHA, and bundle
  ([`rounds/2026-11-16-next-phase/items/0.3/DISPOSITION.md`](rounds/2026-11-16-next-phase/items/0.3/DISPOSITION.md),
  retained for this index).
