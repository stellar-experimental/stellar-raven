# Skill system audit — 2026-09-30

## Scope

Audit the ecosystem-skill pin set, its documentation, and the repo runbooks for correctness,
clarity, and currency. Land the clear, low-risk fixes in one PR.

In scope: stale counts and versions in docs, the runbook list in `AGENTS.md`, a documented
procedure for admitting a new skill source, one upstream skill finding (`sk-027`), and the
2026-10-01 source-metadata case from the September 14 golden review.

Out of scope, recorded instead:

- The two sibling golden freshness items (`q-defi-x402-on-stellar-what`,
  `q-gap-builders-person-empty`). They change judge-facing text and need independent
  re-derivation. Queued in `.agents/TODO.md`.
- A pin decision for the twelve Stellar Light `scf-*` skills. Owner decision K in `.agents/NEXT.md`.
- Upstream filing of `sk-027`. The finding is `verified`; filing is an outward-facing write that
  waits for the owner.
- 28 `research/skill-exposure-inventory.json` evidence refs to the removed
  `ecosystem-skills/skills/` tree. They are dated evidence and stay unchanged.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| audit + fixes | Claude Opus 5.5 | `w46:p1` | files in this PR | done |

No independent review was requested for this round.

## Ledger

- Base `origin/main` `605c1558`. Working tree clean before the branch.
- `node scripts/check-skills-drift.mjs` → all five sources `ok` against upstream HEAD;
  `stellarlight-catalog 43 entries (snapshot 2026-09-29T19:23:49Z) 43 entries ok`; exit 0.
- `node scripts/check-mirrors.mjs` → `mirror checks ok`.
- Raven production `search` over skills plus about 200 varied `codemode.search` queries returned
  the same 20 skill IDs, matching `catalog/manifest.json` (`operation: 60, skill: 20,
  skill-section: 202`).
- `GET https://stellarlight.xyz/api/skills` (2026-09-30T19:41:24Z) → 43 entries, `sdf` 8,
  `generatedAt` 2026-09-30T19:24:07.210Z. `GET /api/skills/soroban` → HTTP 404
  `unknown skill: soroban`. Raven `scout.getSkill({ name: "soroban" })` → `soft-empty` 404.
- Pinned `Stellar-Light/stellar-scout@3b587aa9` text names `soroban` and "7 official SDF skills"
  in `SKILL.md`, `references/api-reference.md`, `README.md`, and `references/examples.md`.
  Upstream issue search found no duplicate. Filed locally as
  `improvements/skills/sk-027-scout-skill-stale-skills-catalog.md` (`verified`).
- Stale docs found by grep: `ecosystem-skills/README.md` (42 entries; 7 SDF skills including
  `soroban`), `ecosystem-skills/update.sh` (7 SDF skills), `eval/plan/coverage-rules.json`
  (42 entries), `research/skill-exposure-inventory.md` (18 exposed vs 20 in the JSON),
  `.agents/NEXT.md` (Scout `1.9.52` vs `1.9.54` deployed in PR #182), `.agents/TODO.md`
  (latest ledger pointer). `AGENTS.md` omitted the `retrieval-system-audit` runbook.
- `q-ti-stellar-lab-usage-and-new-ui` re-probe at 2026-09-30T19:42:17Z:
  `docs/tools/cli/cookbook/contract-assets` HTTP 404;
  `docs/tools/cli/cookbook/deploy-stellar-asset-contract` HTTP 200 with both
  `stellar contract asset deploy` and `stellar contract id asset`; Lab, transactions, saved
  keypairs, and Quickstart pages HTTP 200 with the quoted text; `stellar/laboratory` main has
  no commit to the two storage helpers after `624d40ff29ca` (2025-09-04); the live saved-keypairs
  bundle is still `page-dbc03db5d85268bb.js`; local `stellar 28.1.0` help matches.
- `npm run eval:qa:register` → reopened `cluster-023` and `cluster-137` (member hash changed).
  `npm run eval:qa:register -- --review .agents/rounds/2026-09-30-skill-system-audit/register-review.json`
  → `updated; 0 reopened`.
- `npm run eval:qa:compile` → `eval/qa/cases.json (501 cases; sha256 06d348f6…)`; only content
  hashes moved in `sample.json` and `lifecycle-registry.json`.

## Outcome

Gates on the branch:

- `npm run eval:qa:lint -- --since origin/main --stale` → `0 error(s), 62 warning(s)`; `main`
  has the same 62 warnings, none for the edited case.
- `node scripts/check-pin-review.mjs --base origin/main` → `no skill pin or file selection moved.`
- `npm run improvements:lint` → `improvements lint ok (64 findings)`.
- `npm run typecheck` → exit 0.
- `npm test` → `120 passed` files, `2185 passed | 4 skipped` tests.
- `npm run build` → dry-run bundle built, exit 0.
- `npm run secrets:scan -- --tree` → clean.

Remaining risk: none for runtime. The PR changes no Worker source, catalog, or spec.
