# Live drift: Scout 1.9.61 and the Stellar Docs title vocabulary — 2026-10-02

Issue #215, filed by the 06:48Z refresh run. Lead `raven-next` (Claude Fable 5.1, pane `w3W:p2`).
Base `origin/main` `38aa07fc`. Runbook: `.agents/skills/live-drift-resolution/SKILL.md`.

## Regeneration (Step 1)

Run in order in a clean worktree at 14:20Z: `refresh-inventory.mjs`, `build-catalog.mjs`,
`micro-map:build`, `spec:build`, `build-op-classes.mjs`, then `ecosystem-skills/update.sh` for the
stellarlight catalog snapshot, then the catalog chain again. `inventory/lumenloop.json` and
`inventory/stellar-docs.json` were unchanged. The tree holds only generated artifacts plus the
justified edits listed under "Hand edits".

## Classification (Step 2)

`node scripts/diff-inventory.mjs <mode> HEAD:inventory/stellar-light.json inventory/stellar-light.json`:

| mode | result |
| --- | --- |
| `surface` | empty, exit 0: no operation added, removed, or renamed (38 paths before and after) |
| `text` | exit 1: `scout.listSkills` and `scout.getSkill` descriptions changed; `x-routing` identical on both |
| `deep` | exit 1: paths and components differ |

Scout API version `1.9.54` → `1.9.61`. The changes, from the actual diff:

- **Routing-relevant text.** `listSkills` now says the catalog holds both sections of
  skills.stellar.org (`source=sdf` and `source=community`, "listed but not reviewed by SDF") plus
  curated entries and approved submissions, and that `meta.registry` reports what the registry
  listed, resolved, and could not fetch. `getSkill` now returns raw `SKILL.md` content for every
  registry entry, not only SDF skills.
- **Schema, model-visible through the spec.** `searchResearch` gains `sources` (array, form style,
  `explode: false`) and `perSource` (default 8, max 25), and its `source` description now explains
  `meta.sourceEmpty` and `meta.sourceDocCount`. Components: `Skill` gains `registry` and reworded
  `source`, `install`, `rawUrl`, `argumentHint`, and `userInvocable`; `Meta` reworded one
  description; `RequestError` (400 with a `hint`) and `RetryableError` (503 with
  `retryAfterSeconds` and an `advisory`) are new and are declared on `GET /api/research` and
  `GET /api/hackathon-brief`.
- **Provenance.** Every Scout entry's `provenance` moved with the version; many `outputSchema`
  fields moved with the `Meta` and `Skill` components.
- **Stellar Docs titles** 651 → 666 (563 → 575 distinct titles). New: the "Stellar CLI for Agents"
  section (`/docs/tools/cli/agent-cli` and seven guides, including "Pay for APIs with x402"),
  "Replay a ledger to collect its LedgerCloseMeta", "Delegate Auth", "USDT0 Transfers with
  LayerZero", and "Skills". Nothing removed. The keyword sets of
  `stellarDocs.search_sdk_cli_tools_docs` (71 → 88) and `search_soroban_contract_docs`
  (166 → 184) gained `agents`, `pay`, `apis`, `x402`, `messages`, `usdt0`, `skills`, and others;
  three other docs operations each lost one keyword.
- **Skills mirror.** All five pins unchanged (`check-mirrors.mjs --fetch` → 66 files verified;
  `check-pin-review.mjs` → no selection moved). The stellarlight catalog snapshot grew 43 → 62
  entries: 19 `community` entries added, none removed. `community.json` changed only its
  `fetched_at`. `MANIFEST.json` changed only its `synced_at`.

Class: **routing-relevant text plus model-visible schema**, no operation-surface change. Not
runner-affecting: the only runner declares three Lumenloop operations and `inventory/lumenloop.json`
is unchanged.

Exposure (Step 3): no decision needed. `build-catalog.mjs` still excludes the same operations
(Lumenloop paid research trio, Scout feedback, partner submission, RWA). 282 manifest IDs before and
after; 60 operations.

## Routing gate (Step 4)

`npm run eval:compile && npm run eval:routing -- --gate` on the regenerated catalog failed only on
the manifest fingerprint. Lane totals against the accepted baseline:

| lane | accepted | regenerated |
| --- | --- | --- |
| legacy (338) | top-1 219, top-3 298, top-5 326, card 112/182 | top-1 219, **top-3 297**, top-5 326, card 112/182 |
| skills (23) | 17 / 23 / 23 | 17 / 23 / 23 |
| holdout (49) | 12 / 26 / 29, forbidden 10, passed 24 | 12 / 26 / 29, forbidden 10, passed 24 |

56 of 544 rows reorder hits below rank 5 or move a Scout `getSkill` score; one graded result
moved. `q-defi-agentic-payment-standards-compare` ("How do x402, MPP, AP2, and ACP compare…",
expected `stellarDocs`) lost `stellarDocs.search_docs` from its top five and gained
`stellarDocs.search_sdk_cli_tools_docs` at rank 5. The cause is the new agent-cli guide titles,
which put `x402`, `pay`, and `apis` into the sdk/cli and soroban docs keyword sets. The row still
passes at top-5.

Decision: re-baseline the fingerprint. `eval/gates.json` now carries the new manifest SHA-256
(`6b8cc6ed28f125cc0ea7d3c65f7161d46fff23979de8bbc3294e108345eda196`), `baselinedAt`
2026-10-02T14:28:39.540Z, the local trace name, and a dated note. The accepted legacy top-3 total
records the measured 297. **The band center and every threshold stay unchanged** (legacy 298 ± 3,
skills floor 17, holdout floors 12/26/29, ceiling 10). After the edit: `GATE PASS`.

Watch item, not fixed here: the agent-cli guide titles contribute generic words (`skills`,
`output`, `model`, `authority`, `security`, `messages`, `spending`) to two docs operations. The
gate shows no measured harm today.

## Impact audit (Step 1b)

- **Runtime source.** `src/adapters/scout.ts` serializes array parameters with `join(",")`, which
  matches the new `sources` parameter (`style: form`, `explode: false`). A live upstream probe at
  14:30:24Z, `GET /api/research?q=base%20reserve&sources=cap,sep&perSource=2`, returned HTTP 200
  with 4 results. No adapter change.
- **Golden and eval files.** No battery case, plan rule, or test quotes the old descriptions or
  passes `source` to `searchResearch`. No golden change.
- **Improvements.** `sls-089` (project search returns a zero count after a failed read): the new
  `RetryableError` is declared on `/api/research` and `/api/hackathon-brief`, not on
  `/api/projects/search`; the finding stays `reported-upstream` with a dated recheck line. `sk-027`
  and `sk-028` concern the pinned Scout skill text, whose upstream commit is unchanged; still
  repro, no edit. The `community` entries the catalog now lists match the item closed by #203.
- **Docs and runbooks.** `eval/README.md` named the committed Scout version; updated to `1.9.61`.
  `.agents/TODO.md` routing item named `1.9.54` as the accepted source; updated. No skill or runbook
  quotes the changed descriptions.
- **Upstream issue state.** `Stellar-Light/stellarlight#1751` (`sls-089`) is open with no comment.

## Hand edits

`eval/gates.json` (fingerprint, baselinedAt, localTrace, accepted legacy top-3, note),
`eval/README.md` (one version string), `.agents/TODO.md` (one version string),
`improvements/stellar-light-scout/sls-089-…md` (one dated evidence line) with the regenerated
`improvements/INDEX.md`, and this ledger. Everything else is generated.

## Gates (Step 5)

- `node scripts/build-catalog.mjs` → exit 0, expected exclusions printed.
- `npm run eval:routing -- --gate` → `GATE PASS` after the re-baseline.
- `node scripts/check-mirrors.mjs --fetch` → ok; `check-pin-review.mjs --base origin/main` → no
  move; `check-skills-drift.mjs` → every source `ok`, catalog 62 = 62.
- `npm run improvements:lint` → ok (66 findings).
- `npm run typecheck` → exit 0; `npm test` → 2360 passed, 3 expected fail; `npm run build` → exit 0
  (7252.85 KiB); smoke, secrets scan, register check, and `git diff --check`: see the receipt.

## Review (Step 6)

(pending)

## Receipt (Steps 7 and 8)

(pending)
