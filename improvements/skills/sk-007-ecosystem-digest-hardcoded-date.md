---
id: sk-007
service: skills
status: reported-upstream
discovered: 2026-07-03
evidence:
  - ecosystem-skills/skills/lumenloop/stellar-ecosystem-digest/SKILL.md (mirror, verbatim of upstream lumenloop/lumenloop-skills)
  - audit sweep 2026-07-03 (documentation-consistency pass)
  - live re-verified 2026-07-06 (eval round todo 846): worked example still hardcodes "Today is 2026-06-08" and date_end="2026-06-08" throughout, byte-identical to the quoted lines, no placeholder marker added
  - upstream source rechecked 2026-07-09 at lumenloop/lumenloop-skills skills commit d92c56b: the worked example still says "Today is 2026-06-08" and repeats the frozen date through every recency query
  - upstream issue filed 2026-07-09: https://github.com/lumenloop/lumenloop-skills/issues/3
recurrences:
  - date: 2026-07-09
    evidence: current upstream stellar-ecosystem-digest still contains the literal "Today is 2026-06-08" and frozen 2026-05-09→2026-06-08 window
  - date: 2026-07-13
    evidence: structured HTTP probe returned 200 and still found the literal "Today is 2026-06-08" in the upstream digest skill
  - date: 2026-08-11
    evidence: structured HTTP probe returned 200 and still found the literal "Today is 2026-06-08" in the upstream digest skill
probe:
  type: http-text
  url: https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-ecosystem-digest/SKILL.md
  expect:
    status: 200
    contains:
      - Today is 2026-06-08
---

## Finding

The ecosystem-digest skill hard-codes a stale 2026-06-08 recency window.

The `lumenloop/stellar-ecosystem-digest` skill hard-codes a specific calendar
date — **"Today is 2026-06-08"** — into its worked example, and threads that same
date through every example call as a literal `date_end` / window bound. The
digest skill is fundamentally about *recency* ("What's new in the last 30 days?"),
so a frozen date silently goes stale: an agent that copies the worked example
verbatim will query a window ending 2026-06-08 no matter what the real current
date is, producing a "digest" that omits everything published since. Nothing in
the skill marks the date as an example placeholder rather than a live value, so
the staleness is invisible to a model pattern-matching the example.

## Evidence

In the mirror (byte-identical to upstream), `stellar-ecosystem-digest/SKILL.md`:

- **Line 186:** `Today is 2026-06-08, so the window is \`2026-05-09 → 2026-06-08\`.`
  — the worked example ("What's new in Stellar RWA in the last 30 days?", §Worked
  example, lines 183–214) pins "today".
- **Lines 193, 197, 199, 201:** every example call in that walkthrough carries
  `date_end="2026-06-08"` (and `date_start="2026-05-09"`).
- **Lines 104–105, 133:** earlier `search_content_semantic` /
  `find_content_by_entity` examples also end their windows at `date_end="2026-06-08"`.
- **Line 217:** the output template header reads `# Stellar RWA — digest for
  2026-06-08 (last 30 days)`.

All dated-state, no placeholder marker. (Distinct from sk-001/sk-003, which are
stale *facts*; this is a stale *example convention* in a recency-oriented skill.)

## Recommendation

In the upstream `lumenloop/lumenloop-skills` source, either (a) parameterize the
date — replace the literal with `<today>` / `<today − 30d>` placeholders and an
explicit "substitute the current date" instruction, so the example teaches the
*shape* of a recency window without pinning a value; or (b) mark the worked
example as frozen-in-time ("Example run as of 2026-06-08 — substitute today's
date") so a model copying it knows to update the bounds. Option (a) is preferred:
a digest skill's whole value is current-window queries, and a literal date is the
one thing guaranteed to be wrong on every future run.
