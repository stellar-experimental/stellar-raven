# Skill discovery measurements

Status: measuring (pre-registered 2026-09-30 date is overdue; trigger tracked in
[`.agents/TODO.md`](../.agents/TODO.md) under "Deferred programs").

Two measurements govern possible reductions to the skill read surface.
[`src/skills/README.md`](../src/skills/README.md) describes content ownership and retrieval.

## Question 1: does the read surface earn its place?

Raven could expose skills for navigation only (`scout.listSkills` / `scout.getSkill`) and delete the
`skills.*` read surface. Because delivery is a thin fetch adapter, removal is a small deletion, but
the Dynamic Worker is networkless: agents inside `execute` cannot fetch source URLs themselves. A
valid test arm must remove the read surface AND rewrite guidance naming `skills.*`.

Instruments: `eval/skills-cases.json` (23 cases), QA battery skill cases, and the agentic lane
(precedent: [ADR-0005](../research/decisions/0005-skills-form-sections-out-of-search.md)).

## Question 2: do section entries earn their place?

Sections are `searchable: false` (zero ranking cost; banked in ADR-0005; arm A stays buildable via
`node scripts/build-catalog.mjs --skills-form A --out <path>`). They cost 204 catalog entries and a
fail-closed read-time sectioning invariant, buying partial reads and `availableSections` navigation.

Instrument: `skill_read` telemetry (`src/observability.ts` `logSkillRead`, emitted in
`src/executor/providers.ts`), recording `id`, `shape` (`whole | sections | files | mixed`),
`requested`, `retrievals`, `from` (`memo | cache | upstream | none`), `ms`, `ok`, and `error` (no
body text or caller identity; verified live 2026-07-30, deploy `64d9db06`). Read only organic
traffic, never author probes.

## Pre-registered decision rules

Read after >= 100 organic `skill_read` events or after 2026-09-30, whichever comes first (query
guidance and new-field filter traps in
[`.agents/skills/cloudflare-observability-review/SKILL.md`](../.agents/skills/cloudflare-observability-review/SKILL.md),
"Skill reads"):

- **`shape` distribution decides question 2:**
  - `>= 90%` `whole` (`sections + files + mixed < 10%`): delete section entries, section builder,
    and read-time sectioning invariant (routing cannot regress since sections are `searchable: false`).
  - `>= 25%` section/file reads: sections earn their place; close question 2.
  - `10%–25%`: inconclusive; keep and re-read with more data.
- **`id` distribution informs question 1:** rank skills by read count. A never-read tail supports
  narrowing, not deleting, the read surface; deleting the read surface still requires a full A/B
  (skills + QA + agentic) — the distribution only decides whether to run that A/B.
- **`ms` split by `from`:** always split memo vs. cache vs. upstream (first reading: upstream 61–80
  ms, memo 0 ms).
- **`ok: false` rate:** read while in logs; the hourly canary (`evt = "skill_canary"`) and
  `refresh.yml` own availability monitoring.

## What a win would delete

- **Question 1:** `src/skills/{store,source,scrub}.ts`, the pin set and its two guards, and the
  skills half of the catalog builder.
- **Question 2:** 204 catalog entries, the section builder, and the read-time sectioning invariant.

Neither deletes on taste; both require measured golden Q→A accuracy evidence.

## When to delete this file

Once both questions are answered and recorded (settled "sections stay" in `ARCHITECTURE.md` §6, a
deletion diff, or an ADR if the read surface is removed).

## Sources

- [ADR-0002](../research/decisions/0002-skills-retirement-twin-dedup.md),
  [ADR-0003](../research/decisions/0003-build-time-exposure-filtering.md),
  [ADR-0005](../research/decisions/0005-skills-form-sections-out-of-search.md)
- [Skill exposure inventory](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/skill-exposure-inventory.md)
- [`ARCHITECTURE.md`](../ARCHITECTURE.md) §6; [`THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md)
