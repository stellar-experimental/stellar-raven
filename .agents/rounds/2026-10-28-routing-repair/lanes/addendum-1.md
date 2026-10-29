# Addendum 1 (lead, 2026-10-28) — the fresh label includes the stellar-light pin

`ecosystem-skills/update.sh` (run by the lead in a scratch copy) moves only the stellar-light
source: `3b587aa9` → `789c9061`. The frozen result is in `tmp/fresh-pin-2026-10-28/`
(`MANIFEST.json`, `INDEX.md`, `catalog.json`, `community.json`, and `body-diff.log`, the old→new
body diff). The `SKILL.md` change is mostly punctuation; `references/api-reference.md` adds the
new hackathon and source-locate endpoint text.

For every `*-fresh` label, copy those four files over `ecosystem-skills/` in the scratch copy as
well as the inventory files. If the pin changes any searchable catalog entry or any of the 544
rows on its own, record that separately (`baseline-fresh-nopin` as a diagnostic). Also confirm that
no `codemode.skill.read` section of the new pin names a non-exposed Scout path after the build's
section filter (the ADR-0003 leak the TODO describes), for each exposure choice you measure.
