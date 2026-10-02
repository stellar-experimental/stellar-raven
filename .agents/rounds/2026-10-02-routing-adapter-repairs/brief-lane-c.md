# Lane C — repair the matching that let an article carry `scout.listSkills` for one MCP discovery probe

Worktree: `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/lane-c`
Branch: `fix/listskills-article-prefix`. Read `brief-common.md` in this directory first.

## Problem (from `.agents/TODO.md`, "Repair the matching that let an article carry `scout.listSkills` for one MCP discovery probe")

Found by the 2026-10-02 drift review (`.agents/rounds/2026-10-02-drift-scout-1.9.61/verify-drift-astra.md`).
"Are there any model context protocol skills for Stellar?" lists `scout.listSkills` at rank 3
(score 195) with the Scout 1.9.54 description and not in the first five with the 1.9.61 wording
(now on `main`). The cause is not description length. The vendor scorer's prefix match
(`src/catalog/vendor/search-scoring.ts`, `scoreField`, the `startsWith` branch) let the query
token `any` match the article `an` in the old phrase "an install", and the 60% token-coverage
rule in `scoreEntry` then admitted the entry (six of nine tokens). The new description drops that
article; five of nine tokens no longer meet the rule. Neither description matches `model`,
`context`, or `protocol`. "Are there any MCP skills for Stellar?", "What Stellar AI skills can I
install?", and "List Stellar skills" are unchanged.

Done when: the probe lists `scout.listSkills` in the first five results through a general rule,
with no graded routing regression. Do not edit the mirrored upstream Scout description and do not
add a query-specific exception.

## Design notes

- Two general directions are named in the TODO: (1) do not let a stopword-length prefix match
  count toward coverage (for example, require the shorter side of a prefix match to be at least
  three characters, or exclude stopwords from prefix matching); (2) let an expanded protocol name
  resolve to its abbreviation (a general acronym rule in the local query preparation in
  `src/catalog/scoring.ts`, not a per-query alias). Evaluate both; you may ship one or both if each
  is justified by measurement.
- `src/catalog/vendor/` mirrors the upstream Cloudflare codemode scorer. Read the file header and
  any README in that directory for its edit policy. The project rule is: a deviation from upstream
  codemode needs conviction and measurement. If the vendor file is meant to stay byte-identical,
  put the rule in the local pipeline (`src/catalog/scoring.ts` prepared query or wrapper) and say
  so. If a local vendor edit is the right place, mark it clearly in a comment and justify it.
- Lane A is changing title-keyword derivation in `scripts/build-catalog.mjs` and the keyword
  rescue in `scoring.ts` in parallel. Keep your diff to the matching rule and its tests. The lead
  re-gates after merge order is decided.

## Steps

1. Baseline: `npm run eval:compile && npm run eval:routing -- --gate` passes on the untouched
   tree. Run `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` and
   record the probe query's current top five (and the rank and score of `scout.listSkills`, using
   `eval/run-routing.mjs --dump-ranked` or a small script against `src/catalog/search.ts`).
2. Implement the rule with unit tests under `test/` (find the existing scoring and search tests).
3. Measure: the probe, the three control queries above, `npm run eval:compile && npm run eval:routing -- --gate`,
   `npm run eval:selftest`, and per-case hit→miss flips against `origin/main` (zero graded
   regressions is the standard). If totals improve, say so; do not re-baseline `eval/gates.json`
   unless the manifest fingerprint changed, which it should not in this lane.
4. Run the common gates and write `tmp/lane-c-report.md`.
