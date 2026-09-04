# Remaining clear work — 2026-09-03

## Result

No clear parallel task remains.
The handoff metadata repair below is complete.
No clear product, evaluation, upstream, or deployment task can run during the candidate QA collection.

## Completed Priority 0 — Correct the active-finding count in the handoff

The repair updated `.agents/NEXT.md:35-37` after the four completed Scout resolutions.
The old text stated 66 active findings: 60 `reported-upstream`, three `proposed`, and three `declined-upstream`.
The generated authority, `improvements/INDEX.md:5`, states 64 active findings.
Current active front matter counts are 57 `reported-upstream`, four `proposed`, and three `declined-upstream`.

The handoff now uses that count and distribution.
Do not regenerate `improvements/INDEX.md` unless its source changes.

The repair was one documentation-only edit to `.agents/NEXT.md`.
It did not touch the candidate revision, runner, corpus, manifest, gates, result artifacts, or local eval server.

## Excluded work

`sd-049` and `sk-021` need independent live re-derivation before filing.
This requires evidence judgment and lifecycle decisions.
See `.agents/TODO.md:14-23` and `improvements/INDEX.md:17,54`.

`sd-047` waits for PR #2806 to merge.
The queue forbids polling and comments before that event.
See `.agents/TODO.md:25-36` and the round ledger at lines 231-232.

The required `sls-080` monitor already passed this round.
Exclude it as complete work.
See the round ledger at lines 240-244.

The general Raven scoring repair waits for round close and owner authorization.
It may change routing and its gates.
See `.agents/TODO.md:175-208` and the round ledger at lines 248-251.

The paired-QA validator design needs owner choices before a new collection.
Its collection also has a separate budget rule.
See `.agents/TODO.md:273-299` and `.agents/NEXT.md:75-95`.

All recovery, protocol-history, capability-boundary, Friendbot, short-token, Scout-exposure, and source-delivery items are trigger-only or monitor-only.
See `.agents/NEXT.md:41-53` and `.agents/TODO.md:52-79, 146-170, 212-271, 301-341`.

The remaining round checklist needs the running result, its review, or later deployment authority.
Do not start those tasks before the candidate QA collection ends.
See `.agents/rounds/2026-09-03-truth-maintenance.md:304-317`.

`PLAN.md` records all eight phases as shipped.
It sends follow-up work to `.agents/TODO.md`.
It adds no separate clear work item.
See `PLAN.md:288-352` and `PLAN.md:317-318`.

## Parallelism boundary

The Priority 0 handoff repair is complete.
Wait for the candidate result before every measurement-related update.
Do not call the local eval server.
