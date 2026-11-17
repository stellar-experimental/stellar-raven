# Item 5.1 follow-up: split v8

## Provenance

While listing every repository reference to `scout.matchPartners`, the item lead saw one QA case
that lists the operation in its `surface` ([QUESTION.md](QUESTION.md)). It was outside tuning in
split v7. The case id is in the untracked `tmp/5.1/EXPOSURE.md` and in no tracked prose.

## Orchestrator's answer

Option (a), as in items 1.4 and 3.5: move the case to tuning by script in split v8, in this PR.

## Amendment

- Script: [`amend-split-v8.mjs`](amend-split-v8.mjs), modelled on `items/3.5/amend-split-v7.mjs`.
  It verifies the v7 SHA-256 and the counts 88/112/47, requires exactly one non-tuning id in the
  exposure note, and moves it with `moveToTuning`. Its output carries no id.
- Dry run and real run printed the same SHA-256.
- v8 path: `~/backups/gca-2026-11-14-split-v8.json` (mode 600, never overwritten).
- Counts: 89 tuning, 112 held-out, 46 reserve.
- Cases outside tuning with a `reverifyBy`: 65; earliest 2027-01-14 (unchanged from v7).
- SHA-256: `1f0c1268d47103e652c545cd7642f808d893aa7779192b50d189c42510027720`.
- v7 stays in place (SHA-256 `d5e56748dfdf2ce9c0bcf8a48898f976db96578dd97516d07dd0b3cb13966c8a`).
- `TUNING_ROW_COUNT` is 89. The v7 pins in `.agents/TODO.md` and the dated briefs under
  `items/1.4/dated/` now name v8. The 3.5 and 4.1 records are unchanged.
- `sibling-check.mjs` on v8, last line only: 2.1: 0, 2.2a: 0, 2.2c: 1. These equal the v7 values.
