# Lane A — keep docs page-title keywords from rescuing docs operations on generic words

Worktree: `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/lane-a`
Branch: `fix/docs-title-keyword-rescue`. Read `brief-common.md` in this directory first.

## Problem (from `.agents/TODO.md`, "Keep docs page-title keywords from rescuing docs operations on generic words")

The Stellar Docs title snapshot (`inventory/stellar-docs-titles.json`) gained a "Stellar CLI for
Agents" section whose guide titles are short imperatives ("Send tokens", "Sign messages", "Delegate
spending", "Output and errors", "Skills", "Authority & Security Model", "Pay for APIs with x402").
`scripts/build-catalog.mjs` `stellarDocsTitleExtras` feeds those titles into
`attachOperationKeywords`, which turns them into `keywords` on
`stellarDocs.search_sdk_cli_tools_docs` and `search_soroban_contract_docs`. `src/catalog/scoring.ts`
`scoreWithKeywords` then rescues an operation into the gated tier on two keyword matches alone.

Measured effect (review in `.agents/rounds/2026-10-02-drift-scout-1.9.61/review-drift-astra.md`,
finding 2): for "How do x402, MPP, AP2, and ACP compare…", `stellarDocs.search_docs` (score 326,
backfill) left the first five results and the sdk/cli operation entered at rank 5 with score 130;
for "Stellar skills for signing messages", "Stellar skills for security auditing", and
"Stellar authority skills", `scout.listSkills` fell below a docs operation. Because of this the
title snapshot is held at its 2026-09-29 state (651 titles; live has 666) and the drift issue #215
stays open.

## Goal

Repair the general mechanism, not the titles. Candidates named in the TODO: require a
title-derived keyword to be distinctive across the whole catalog rather than within one service;
exclude generic action and entity words from title extraction; stop keyword-only rescue for title
tokens. Choose the smallest rule you can state in one sentence that is not tied to this title set,
and explain why the other candidates lose.

Done when: the current live title snapshot is absorbed with no graded routing regression, and the
probe queries keep `scout.listSkills` and `stellarDocs.search_docs` at or above their
2026-09-29 ranks.

## Steps

1. Baseline on the untouched tree: `npm run eval:compile && npm run eval:routing -- --gate`
   (passes against `eval/gates.json`), and
   `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` (compares
   `origin/main:catalog/manifest.json` with the working `catalog/manifest.json`; identical now).
   `reviewer-causality.mjs` in the same directory is the reviewer's attribution script from the
   drift round; reuse or adapt it.
2. Reproduce: run `node scripts/refresh-inventory.mjs`. Only `inventory/stellar-docs-titles.json`
   should change. If any other inventory file changes, restore it with `git checkout --` and report
   that separately (it is unrelated drift the lead will handle). Rebuild the chain:
   `node scripts/build-catalog.mjs && npm run micro-map:build && npm run spec:build && node eval/plan/build-op-classes.mjs`.
   Record the probe and gate output with the snapshot absorbed and no code change. This is your
   "before" table.
3. Implement the fix in `scripts/build-catalog.mjs` and/or `src/catalog/scoring.ts`. Add or adjust
   unit tests under `test/` (find the existing catalog keyword and scoring tests). Rebuild the chain.
4. Measure: the probe, `npm run eval:compile && npm run eval:routing -- --gate`,
   `npm run eval:selftest`, and per-case hit→miss flips against `origin/main` (zero graded
   regressions is the standard; `eval/run-routing.mjs --dump-ranked` helps). Also run the
   drift-round review's probe queries listed in `review-drift-astra.md` finding 2.
5. The manifest fingerprint will change because the titles are absorbed. Re-baseline
   `eval/gates.json` fingerprint-only, the way the last change did
   (`git log -p -1 -- eval/gates.json` shows the fields: manifest sha, `baselinedAt`, trace file,
   dated note). Keep accepted totals unchanged unless a graded improvement is measured and
   justified; `npm run eval:selftest` must pass.
6. Run the common gates and write `tmp/lane-a-report.md`.

Keep the diff to this mechanism. Lane C is changing the vendor prefix match in
`src/catalog/vendor/search-scoring.ts` in parallel; do not touch that file. The lead re-gates
after merge order is decided.
