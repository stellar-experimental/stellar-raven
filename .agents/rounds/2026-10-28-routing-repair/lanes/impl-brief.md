# Implementation lane brief — general routing repair (#223), 2026-10-28

You are the implementation lane. The lead (Claude Opus, pane `w3W:p5P`, agent `rlead`) owns the
ledger, commits, and the PR. You build and measure candidates. You do not commit, push, or edit
`.agents/**` (your sandbox cannot). Write everything under `tmp/impl/`.

## Read first

1. `AGENTS.md` (hard rules), `.agents/rounds/2026-10-28-routing-repair.md` (this round: goal,
   owner decisions, spend cap, constraints, method, stop rule).
2. `.agents/TODO.md` → "Preserve structured routing intent across extraction caps and gate tiers"
   (the twelve acceptance checks and all prior attempts) and owner decision B.
3. Prior reports: `.agents/rounds/2026-10-08-routing-repair/routing-repair-report.md`,
   `.agents/rounds/2026-10-09-followup/routing-step1/routing-step1-report.md`,
   `.agents/rounds/2026-10-09-continuation/routing-step2/routing-step2-report.md` and
   `independent-review.md` next to it.
4. Code: `src/catalog/scoring.ts`, `src/catalog/search.ts`, `src/catalog/vendor/search-scoring.ts`,
   `src/catalog/extract-routing-phrases.ts`, `src/catalog/extract-keywords.ts`,
   `src/catalog/skill-search-admission.ts`, `scripts/build-catalog.mjs`, `scripts/exposure.mjs`,
   `src/policy/scout-exposure.ts`, `eval/run-routing.mjs`, `test/drift-141-routing.test.ts`.

## Inputs prepared by the lead (read-only)

- Current source: the tracked tree at `main` `344d6af2` (Scout 1.9.61, 666 Docs titles,
  stellar-light skill pin `3b587aa9`).
- Fresh source, frozen today: `tmp/fresh-inventory-2026-10-28/` (Scout 1.9.111 with 42 operations,
  682 Docs titles; `SHA256SUMS` inside). Do not re-fetch; every lane measures this snapshot.
  New Scout operations against 1.9.61: `analyzeHackathonSubmissions`, `getHackathonSubmission`,
  `reviewSubmission`, `locateSource`.
- Live stellar-light skill pin: `789c9061f0dc0fca0cbeaa9519404361a4f5d062`.
- Prior evidence, extracted: `tmp/evidence/2026-10-09-routing-step1/tmp/routing3/` (step 1 helper
  layout, baseline runs, accepted inventory), `tmp/evidence/2026-10-09-continuation-lanes/archive/r2/routing4/`
  (step 2 helper, patch, traces), `tmp/evidence/2026-10-08-routing-repair/` (ten tested policies).
  Main has moved since 2026-10-09 (for example #220 acronym rescue), so prior baselines are history,
  not your baseline.

## Phase 0 — baseline (do this first, then report)

1. Build one acceptance helper `tmp/impl/acceptance.mjs`, adapted from the step 1 / step 2 helper,
   that computes all twelve checks from saved runs into a `tmp/impl/runs/<label>/` layout (manifest,
   routing result JSON, inventory used, scorer hash). Labels: `baseline-main`, `baseline-fresh`,
   then `cN-main`, `cN-fresh` per candidate. It must verify manifest hashes and all 544 rows
   (338 legacy, 122 extended, 23 skills, 49 holdout, 12 protocol-history), and exit 1 when any
   check fails. Keep check 12 strict: zero per-row grade changes between the paired sources, the
   four named regressions at their main grades, `reviewSubmission` never ranked on non-hackathon
   questions.
2. The fresh label exposes `analyzeHackathonSubmissions` and `getHackathonSubmission`, keeps
   `reviewSubmission` excluded, and keeps RWA and quality excluded. For `locateSource`, measure it
   exposed and record every row where it ranks top five; recommend an exposure decision with that
   evidence. Build fresh catalogs in a scratch copy (`git archive HEAD | tar -x -C tmp/impl/src-<label>`)
   or restore the tracked tree byte-for-byte afterwards; prove the restore with `git diff --exit-code`.
3. Measure `baseline-main` and `baseline-fresh`. Write `tmp/impl/phase0.md`: lane totals, which
   checks fail and why, and how the baseline differs from the 2026-10-09 baseline.
4. Then reply in your pane with one line: `phase0 done: tmp/impl/phase0.md`. Wait for the lead's go.

## Phase 1 — candidates (after the lead says go)

- One mechanism per step. Measure all 544 rows on both sources after each step. Record each
  candidate in `tmp/impl/cN.md` (design, diff, lane totals, twelve-check table for both sources,
  every changed graded row with its cause) and keep the patch as `tmp/impl/cN.patch`.
- Stop rule: up to six candidate designs. If none passes, stop and write `tmp/impl/failure-analysis.md`.
- Start from the TODO's open direction: the admission-only keyword variant together with the
  selector quota fix (`src/catalog/search.ts`: let quota replacement fire at or above quota and
  replace the weakest same-service entry). Owner decision B option 1 applies only when every other
  check passes and the only check-10 failure is the Groth16 ZK skill moving from holdout rank 3 to
  rank 4; record that evidence explicitly if it applies.
- The remaining hard parts are check 8 (three mixed RWA `it.fails` controls), check 12 (four
  fresh-source regressions plus new hackathon captures), and the short-token triggers
  (`dApp` → `d`+`app`, `approach` prefix-matching `app`, `is`/`an`/`also`). The dApp
  `SKILL_DESCRIPTION_OVERRIDES` entry should become removable.
- General mechanisms only. No operation-specific, question-specific, or query-specific rule. No new
  `SKILL_DESCRIPTION_OVERRIDES` entry. No re-baseline to hide a regression. Do not edit routing
  cases, labels, gates thresholds, or golden data.

## Cloudflare Clef (optional, capped)

Allowed for build-time classification (committed as reviewed data, deterministic at serve time)
and for measurement labelling. Serve-time use needs the lead's approval. Budget for the whole
round is USD 25; ask the lead before any batch above USD 3. Log every batch in
`tmp/impl/spend.md` (model, calls, input tokens, estimated cost). Token: run `cf auth whoami`,
then read it into a variable with
`node -p 'require(process.env.HOME+"/Library/Preferences/cloudflare/config/default.json").oauth_token'`.
Never print it. Docs: https://developers.cloudflare.com/workers-ai/models/clef/

## Rules

- No Wrangler process, no deploy, no paid eval (`eval:qa*`, `eval:plan`, agent lanes).
- Run gate commands bare, without pipes. `npm test` sees ~29 `qa-paired-launch` failures in your
  sandbox (`ps` EPERM); note them and the lead re-runs outside the sandbox.
- When you finish a candidate or need a decision, reply in your pane with one line that names the
  file. Keep long content in files.
