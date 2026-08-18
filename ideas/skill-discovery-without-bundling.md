# Skill discovery: what is still open after de-vendoring

_Status: the content-ownership question is CLOSED (shipped 2026-07-30). Two narrower questions
survive and are measurable. This file used to be a 23 KB decision memo weighing four candidate
shapes; the decision was made, so the memo is gone and this is the residue._

## Closed — do not re-open without new evidence

**"Should Raven own, pin, clone, section, index, bundle, and serve skill content?"** Answered: it
owns the catalog and the safety boundary; maintainers own the bytes.

What shipped is essentially the old M2 shape ("metadata catalog plus allowlisted on-demand load"),
with one improvement on the design that was written here: it loads from a **commit-pinned**
address rather than a mutable canonical URL, so freshness is a deliberate act rather than a
property of whenever the fetch happened.

- `ecosystem-skills/skills/**` (604 KiB) and `src/skills/bundle.json` (389 KiB) are gone.
  `MANIFEST.json` — commit SHA per source, git blob hash per file — is the whole artifact.
- `codemode.skill.read` fetches from `raw.githubusercontent.com` at the pinned commit and verifies
  a SHA-256 (security) plus the git blob hash (provenance) before serving. The model calls an exact
  skill/file id and never supplies a URL; the transport shape is allowlisted at catalog load
  (https, exactly that host, 40-hex commit in the path).
- Section entries survived but became addresses: heading only, no body excerpt, no body-derived
  keywords. The searchable projection was byte-identical across the change, so routing did not move.
- **The owner rule, 2026-07-30: serve, do not store.** A durable owned mirror (R2, a committed
  copy, a bundled copy) is out of scope by decision — it would make Raven the source of record.
  Availability is an accepted risk that is now actively detected from both sides: upstream-side
  loss by the daily `check-mirrors --fetch`, Cloudflare-side by the hourly in-Worker canary
  (`src/skills/canary.ts`). See `ARCHITECTURE.md` §6. Do not "solve" it with an R2 mirror.
- Responses forward the content and nothing else — no license text or notice, by decision.

Also closed by that work: the old M0 (bundled corpus) no longer exists as a baseline, and M3
(official-live / community-link hybrid) was a fallback for licensing problems that did not
materialize.

## Still open — question 1: does the read surface earn its place?

The old M1 arm. Raven could expose skills for **navigation only** — `scout.listSkills` /
`scout.getSkill` for discovery, install commands, and repository links — and remove the `skills.*`
read surface entirely.

The hypothesis is that Raven's real job is routing an agent to the right playbook, not delivering
its text. What makes this testable now, and cheaper than when it was written: delivery is a thin
fetch adapter rather than a bundle plus a sync pipeline, so removing it is a small deletion instead
of an architecture change.

The known ceiling still stands: the Dynamic Worker has no network, so an agent inside `execute`
cannot follow a source URL itself. M1 likely holds for install/recommendation questions and loses
build tasks that need the instructions in the same turn. A valid arm must remove the read surface
AND rewrite the guidance that names `skills.*` ids, or the model is told to call something that is
not there.

Instruments: the skills lane in `eval/skills-cases.json` (23 cases), the QA battery's skill cases,
and the agentic lane. Precedent for the shape of this experiment: the 2026-07-13 skills-form A/B
(`eval/README.md`), which moved sections out of search on measured evidence.

## Still open — question 2: do section entries earn their place?

Sections are `searchable: false` — they cost nothing in ranking. What they cost is catalog size and
a fail-closed invariant to maintain (a `##` heading with no catalog entry is refused on both read
paths). What they buy is exact-id partial reads and `availableSections` navigation.

Banked evidence, not re-litigated: arm C (all skills out of search) has +30/−1 offline evidence in
Solo scratchpad 608; arm A (sections back in search) stays buildable via
`node scripts/build-catalog.mjs --skills-form A`.

Cheapest falsification: measure how often agents actually request a section versus a whole read.
**The instrument now exists** — `skill_read` (added 2026-07-30, `src/observability.ts`
`logSkillRead`, emitted from the `skill_read` dispatch in `src/executor/providers.ts`). Per call it
records `id`, `shape` (whole | sections | files | mixed), `requested` key count, `retrievals`
(distinct pinned files fetched), `from` (memo | cache | upstream | none), `ms`, `ok`, and `error`.
No body text and no caller identity.

Verified end to end in production 2026-07-30 (deploy `64d9db06`): events emit, join to their
`execute` by request id, and the first reading gives upstream 61-80 ms vs memo 0 ms. What it does
NOT yet have is ORGANIC traffic — the only events so far are the author's own probes, whose shape
mix was chosen by hand and says nothing about agent behaviour. Do not read a distribution off
author-generated calls; that is the guessing this instrument exists to replace.

**Decision rules, pre-registered.** Written down before the data arrives so the outcome is a
measurement rather than a story told afterwards — the same discipline the `basis` won't-fix taught
(check what the threshold actually measures before writing the fix). Read when there are >= 100
`skill_read` events from ORGANIC traffic, or after 2026-09-30, whichever comes first.

- **`shape` distribution decides question 2.** >= 90% `whole` (sections + files + mixed under 10%)
  means the section entries are dead weight: delete them, the section builder, and the
  read-time sectioning invariant. Routing cannot regress — sections are already `searchable: false`.
  >= 25% section/file reads means they are earning their place: close question 2 and stop
  revisiting it. Between 10% and 25% is inconclusive; keep them and re-read with more data.
- **`id` distribution informs question 1.** Rank skills by read count. A long never-read tail is
  evidence for NARROWING the surface, not for deleting it — "few skills are read" and "reads are
  unnecessary" are different claims, and conflating them is the easy mistake when you are holding a
  distribution and want a conclusion. Deleting the read surface stays gated on a full A/B (skills
  lane + QA battery + agentic); the distribution only decides whether that A/B is worth running.
- **`ms` split by `from`,** always. A mean over memo and upstream is meaningless. First reading
  2026-07-30: upstream 61-80 ms, memo 0 ms.
- **`ok: false` rate** is the accepted availability risk made observable instead of assumed. It is
  no longer this file's problem: the hourly canary (`evt = "skill_canary"`) watches the same path
  continuously and `refresh.yml` classifies its verdict, so nothing here needs to carry the
  availability question forward. Read the rate while you are in the logs; the detector owns it.

Query guidance, including the trap where a filter on a new field VALUE returns zero while the
events exist, is in `.agents/skills/cloudflare-observability-review/SKILL.md` "Skill Retrieval".

## What a win would delete

Question 1: `src/skills/store.ts`, `src/skills/source.ts`, `src/skills/scrub.ts`, the pin set and
its two guards, and the skills half of the catalog builder. Question 2: 204 catalog entries, the
section builder, and the read-time sectioning invariant.

Neither is a deletion worth making on taste. Both need a measured win on golden Q→A accuracy, per
the house rule.

## When this file can be deleted

Once both questions are answered by the data above, with the answers recorded where they belong:
a settled "sections stay" in `ARCHITECTURE.md` §6, a deletion in the diff itself, or an ADR if the
read surface goes. Until then this file is the single home for the questions, the rules, and the
reasoning — deliberately not split across a doc and a todo, because two copies of a pending
decision is two things to keep in sync and still nothing that fires.

## Sources

- [ADR-0002: retire onboarding skills and twins](../research/decisions/0002-skills-retirement-twin-dedup.md)
- [ADR-0003: build-time exposure filtering](../research/decisions/0003-build-time-exposure-filtering.md)
- [ADR-0005: skill sections leave search](../research/decisions/0005-skills-form-sections-out-of-search.md)
- [Skills-form A/B results](../eval/README.md)
- [Skill exposure inventory](../research/skill-exposure-inventory.md)
- `ARCHITECTURE.md` §6 — the shipped retrieval design, the review gate, the availability posture
- `THIRD-PARTY-NOTICES.md` — the serve-not-store position
- Adversarial review 2026-07-30: Solo todos 1275–1278, 1280
