# Golden-question candidates — net-new from Jitsu/Stella traffic

> **Status: candidate questions, NOT yet answered or compiled.** This directory holds question
> *themes* mined from real user traffic that are **not yet covered** by the 395 shipped golden
> questions in [`../compiled/golden.json`](../compiled/golden.json). They are the raw material
> for the *next* expansion of the golden set — questions only, no golden answers yet.

## What this is

On 2026-06-29 we processed the **Jitsu export of real questions asked to "Stella"** (the Stellar AI
assistant) — `~/Downloads/jutsu_stellar_questions_export`: **25,875 questions across 9,526 threads**.
After normalization + junk filtering this left **20,862 substantive unique questions** (787 recur ≥2
times; the rest are the singleton long tail). We partitioned them into 8 frequency-sorted chunks and
ran **8 parallel YOLO Claude subagents** (Solo-orchestrated), each clustering its chunk into themes,
de-duplicating against the 395 golden questions, and keeping only the **strong + consistent + net-new**
ones. This orchestrator then merged + de-duplicated the 218 raw themes across the 8 workers into the
canonical catalog below.

- **Main deliverable:** [`2026-06-29-jitsu-net-new-questions.md`](./2026-06-29-jitsu-net-new-questions.md)
  — ~90 de-duplicated net-new question themes, grouped by golden category, each with a canonical
  phrasing, a **consistency signal** (how many of the 8 independent chunks surfaced it), the closest
  existing golden near-miss, and the coverage gap.
- **Raw worker output (traceability):** not retained in this repo — the 8
  per-chunk `findings-N.md` files with verbatim user-question examples, plus the `_mining-brief.md`
  the workers were given.

## "Strong + consistent + net-new" bar (what workers kept)

- **Strong** — a real, answerable, substantive Stellar/Soroban/XLM/ecosystem question (not a greeting,
  test string, gibberish, or one-off idiosyncrasy).
- **Consistent** — frequency ≥2, OR a clear recurring *intent* across many distinct singleton
  phrasings (often multilingual). Cross-chunk corroboration is the strongest consistency signal and is
  recorded per theme as `chunks: N/8`.
- **Net-new** — not semantically covered by any of the 395 golden questions. Where a theme is a
  *near-miss* (golden has the concept but not the angle users actually ask), the closest golden item
  is named and the delta explained.

## How to use this

These are **candidates for triage**, not finished goldens. Next steps (not done here):
1. Decide which themes to promote, which to fold into an existing golden question, and which to drop.
2. For promoted themes, author full per-question files per [`../_template.md`](../_template.md)
   (frontmatter rubric + reference dossier), assign categories/axes/cards, then re-run
   `_meta/compile.mjs` / `_meta/build-index.mjs`.
3. Several clusters argue for **new subcategories** — see the "Cross-cutting gaps" section of the main
   deliverable (operational how-to, user-support/safety governance, adversarial-security expansion,
   Pi Network).
