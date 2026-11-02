# Stellar Docs section anchors 2026-11-02

Task: `.agents/TODO.md` "Derive section anchors for Mintlify search hits". Algolia hits linked to the
matched section; Mintlify search hits carry only the page path.

## Decision

A general slug rule cannot predict the site's IDs. Custom IDs (`Application (app)` → `app`) and
duplicate suffixes (`software-2`, `core-1`) break it. The adapter therefore reads a build-time index
of rendered heading IDs (`src/adapters/stellar-docs-anchors.json`, from
`npm run docs:anchors:build`, keyless). It appends `#<id>` only when the hit's ATX section heading
maps to exactly one rendered ID on that page. Every other case keeps the page URL. Searches make no
additional requests.

The daily refresh workflow runs the capture and reports anchor changes in the drift issue.

## Evidence

- Author: Codex `gpt-6.1-sol` high (lane mint-a). Index: 971 pages, 4,075 headings, 82 ambiguous
  heading groups. The fixture holds 419 captured pairs from eleven pages, plus source-form pairs
  transcribed by the reviewer.
- Independent review: Claude Fable 5.1 high, [review-fable.md](2026-11-02-mintlify-anchors/review-fable.md),
  SHIP-WITH-FIXES. On 12 live pages outside the fixture (949 headings), it found 332 anchors and zero
  wrong anchors. All ten findings are fixed (fix passes 1 and 2), except finding 8. Finding 8
  (normalize smart quotes and heading wrappers) stays a follow-up that needs a measured win.
- Routing: the authored `hits[].url` description changed on eleven operations. The orchestrator
  compared all 544 routing rows with the origin/main manifest: zero graded flips, zero top-five
  order changes, and zero score changes. Only the manifest fingerprint in `eval/gates.json` moves.
