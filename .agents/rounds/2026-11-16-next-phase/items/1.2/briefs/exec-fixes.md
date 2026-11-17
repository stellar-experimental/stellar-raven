# Brief: reconcile the Codex fix review (item 1.2 executor, round 2)

Read `.agents/rounds/2026-11-16-next-phase/items/1.2/CODEX-FIX-REVIEW.md`. Adopt all three
findings; the lead agrees with each and found Y2 independently.

- **Y1 (should fix).** Raw-text jumps must be off anywhere inside an `svg`, not only when `svg`
  is the outermost skipped element. Smallest shape: keep an `svgDepth` counter in `scan`, updated
  on every `svg` start (not self-closing) and `</svg>` the scanner sees, skipping or not, and
  replace `skipping !== "svg"` with `svgDepth === 0`. Keep `/>` honoured inside svg. Tests
  (through `htmlToText`/`mainHtml` and one through `get_page`):
  `<main>before<template><svg><title/></svg></template><p>after</p></main>` gives
  `before\nafter`; the same with `<svg><style/><path/></svg>`; and
  `<head><svg><title/></svg></head><main>real</main>` gives `real`. A real `<script>` inside a
  `<template>` is still skipped as raw text (existing test). Re-run the linear-time tests.
- **Y2 (low).** Restore U+00A0 in the line-whitespace class, written as the escape ` `. Test:
  literal `A  B` in `<main>` gives `A B`, the same as `A&nbsp;&nbsp;B`.
- **Y3 (low).** Narrow the `…` wording in `research/services/stellar-org-site.md` and the header
  comment of `stellar-org.ts`: titles, names, individual tags and header excerpts end with `…`
  when clipped; descriptions keep their silent 500-character clip.

Then: the four gates bare (`npm run typecheck`, `npm test`, `npm run build`,
`npm run secrets:scan -- --tree`), and one re-run of the live snapshot to `tmp/1.2-smoke/after2.json`
compared with `before.json` as before. Append a "Fix review reconciliation" section to `EXEC.md`
(per finding, gates, live result). Commit (normal hooks, no `--no-verify`, no push) the code,
tests, docs, `EXEC.md`, `CODEX-FIX-REVIEW.md` and this brief, subject
`stellarOrg: keep svg context inside skipped elements, restore NBSP (round item 1.2 fix review)`,
ending `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Then run
`hc send t1r9 '/home/tyler/code/raven-wt/np-1.2/.agents/rounds/2026-11-16-next-phase/items/1.2/EXEC.md'`.
