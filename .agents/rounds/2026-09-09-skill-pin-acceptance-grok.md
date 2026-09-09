# Isolated stellar-dev pin acceptance — Grok 4.6 high — 2026-09-09

Reviewer: Grok 4.6, high effort, pane `w3G:p8`.
Author of the pin refresh: Astra medium, pane `w3G:p7`.
Orchestrator: parent on this branch.
This reviewer is not the author and is not the orchestrator.
No subagent ran.
No commit, push, deploy, upstream comment, paid call, golden edit, source edit, scoring edit, or test edit occurred.
Allowed writes: this file, plus corrections to `.agents/rounds/2026-09-09-upstream-handoffs-grok.md`.

Checks: `2026-09-09T16:46:48Z` through `2026-09-09T16:51:29Z`.
Page re-derivation: `2026-09-09T16:55Z` via `loadManifest` + `searchCatalogPage`.
PIN-REVIEW and root-ledger review: after the isolated-acceptance rewrite.

Git HEAD: `1ef0cdd2bd839c156ec175e04b61df9db51926b9` on `maintenance/drift-141`.

## Verdict

**PASS** the isolated `stellar-dev` pin for merge.

The PIN-REVIEW rewrite is present. The earlier commit-blocking finding is resolved.
This lane still does not approve production deployment or finding retirement.

Gate totals, tests, hash fetch, Scout inventory, and `stellar-light` pin match the stated isolation.
Independent `searchCatalogPage` re-derivation finds **19** page changes and **zero** grade losses.

Do not deploy from this review.

## Isolation check

| Surface | HEAD | Worktree | Result |
|---|---|---|---|
| `stellar-dev` commit | `03b2f8e8c88a42b16551926a938ec8173763b45a` | `0472452a05731de5e0a1e886d8aae6df24873fe2` | moved |
| `stellar-dev` selection | `sel:e9f82f593834` | `sel:7b68c8b72b2f` | moved |
| `stellar-light` commit | `d25b9f6bd842159b5a33aa6125ecb62373c2d8b5` | same | match HEAD |
| `stellar-light` blobs | four files unchanged | same SHAs | match HEAD |
| `inventory/stellar-light.json` SHA-256 | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` | same | match HEAD |
| Scout OpenAPI in catalog | `1.9.1` count 30 | `1.9.1` count 30; `1.9.48` count 0 | isolated |
| `lumenloop` / `openzeppelin-stellar` | unchanged | unchanged | isolated |

`node scripts/check-pin-review.mjs --base HEAD` reports only `stellar-dev` moved, and records `sel:7b68c8b72b2f`.

Compare `0472452a...1f57ed1a` (current `stellar/stellar-dev-skill` `main` merge of PR #129): ahead_by 1, **files empty**. Served skill tree matches `main` and live `skills.stellar.org` bytes from the prior source audit.

## Gate and tests

`eval/gates.json` vs HEAD:

- `legacy`, `skills`, `holdout` thresholds: **byte-equal**
- `evidence.acceptedTotals`: **byte-equal**
- Other input fingerprints (`routing-cases`, `skills-cases`, `holdout-cases`): **unchanged**
- Only `catalog/manifest.json` SHA-256, `baselinedAt`, `note`, and `localTrace` changed

Catalog fingerprint:

- HEAD: `618c3503b49d101edc8ddc41d51704bccc548716589419be0bc0743b0b76332a`
- Worktree and gate evidence: `83d9998f984cae38c363524e0592c6d035e80ba09cc27003f7a65e11bb0350f9`

Independent `node eval/run-routing.mjs --gate` at `2026-09-09T16:51:29Z`: **GATE PASS**.
Totals: legacy 338 / 213 / 279 / 312 / card 95; skills 23 / 16 / 23 / 23; holdout 49 / 10 / 22 / 26, forbidden 11, passed 21.
Protocol-history diagnostic remains FAIL at 4/8 and 2/4 control captures, same as HEAD. That lane is outside the gate.

Tests: `/tmp/raven-141-isolated-tests.log` at `12:44:07` — 108 files, **1995 passed**.
Smoke: `/tmp/raven-141-smoke.log` — 4 files, **85 passed**.
Self-test: `/tmp/raven-141-final-selftest.log` — all checks passed.
This lane did not re-run the 1995-test suite. It re-ran the routing gate, pin-review, and hash fetch.

Hash fetch, this lane: `node scripts/check-mirrors.mjs --fetch` → `fetched + verified 44 pinned skill files (upstream, cache bypassed)`.

## Independent routing diagnostic (both denominators)

The eval trace `topHits` field stores `{id, service, score}` only.
`searchCatalog` returns `searchCatalogPage(...).hits`.
It omits `total` and `truncated`.
Root counts a page change as a difference in hit `id`/`score`/`tier` **or** in `total`/`truncated`.

This follow-up called `loadManifest` and `searchCatalogPage` from `src/catalog/search.ts`.
Base catalog: `git show 1ef0cdd:catalog/manifest.json` SHA-256 `618c3503b49d101edc8ddc41d51704bccc548716589419be0bc0743b0b76332a`.
Worktree catalog: SHA-256 `83d9998f984cae38c363524e0592c6d035e80ba09cc27003f7a65e11bb0350f9`.
Query set: 338 legacy + 122 extended + 23 skills + 49 holdout + 12 protocol-history = **544**.
Each call used `{ query, limit: 5 }`.
Projected page: `hits[].{id,score,tier}`, `total`, `truncated`.

| Denominator | Count | Meaning |
|---|---|---|
| Cases | **544** | all five lanes |
| Full page changes (`id`/`score`/`tier` or `total`/`truncated`) | **19** | 17 legacy + 2 holdout |
| Hit-projection changes (`id`/`score`/`tier`) | **9** | what eval `topHits` can see |
| Ordered-ID changes | **7** | ordered top-5 ids differ |
| Membership changes | **6** | set of top-5 ids differs |
| Score/tier-only hit changes | **2** | same ids and order |
| `total`-only changes | **10** | hits identical; pool size +1 |
| `truncated` changes | **0** | all changed pages stay `truncated: true` |
| Grade losses | **0** | no `top1`/`top3`/`top5`/`cardHit5`/`pass` true→false |
| Grade wins | **0** | no compensating win |

`9` hit-projection changes + `10` total-only changes = `19` full page changes.
The earlier report compared eval `topHits` only and reported 9. That denominator is incomplete.
The 19 is **not** the 19 Lumenloop digest catalog provenance stamps.

`total` changed on 11 pages. Ten of those are total-only. `q-defi-perps-whitespace` also changed membership (`16→17`).

Eval traces `16-44` and `16-46` still match each other on `topHits`. They cannot show the ten total-only pages.

### Nine hit-projection changes (eval `topHits` denominator)

Score-only (same ids, same order; `agentic-payments` score rose):

1. `q-infra-anchor-platform` — score 295 → 306 at rank 3. Grades unchanged (top-1/3/5 still true).
2. `q-soroban-canonical-examples-source` — score 472 → 492 at rank 2. Grades unchanged.

Ordered-ID, membership unchanged (same five ids, new order):

3. `q-sep-7-uri` — `skills.stellar-dev.agentic-payments` moves from rank 4 to rank 3, swapping with `stellarDocs.search_docs`.

Membership (each gains `skills.stellar-dev.agentic-payments` at the cost of one other id):

4. `q-comp-anchor-compliance-stack` — loses `stellarDocs.search_meeting_notes`
5. `q-defi-perps-whitespace` — loses `skills.stellar-dev.dapp`
6. `q-scf-funded-similar-payroll` — loses `lumenloop.get_scf_submissions` (rank 5); `scout.scfPitch` stays in top-5 at rank 5
7. `q-tool-cli-install` — loses `skills.stellar-dev.dapp`
8. `q-holdout-b-10-nextjs-payment` — expected `skills_dapp`; already a miss; still `pass: false`, `forbiddenCapture: false`
9. `q-holdout-b-14-compliance-backfill` — expected `skills_data`; already a miss; still `pass: false`, `forbiddenCapture: false`

No expected hit left the top-k that the grade uses.
Holdout pass and forbidden-capture bits did not flip.
Extended, skills, and protocol-history `topHits` are identical to HEAD.

These ranking moves are incidental description/token changes on `agentic-payments`. They are not a scoring-threshold change.

### Ten total-only pages (absent from eval `topHits`)

Hits `id`/`score`/`tier` are identical. `truncated` stays true. `total` rises by one:

1. `q-asset-two-account-issuer` — 55 → 56
2. `q-defi-etherfuse-stablebonds` — 36 → 37
3. `q-defi-reflector-content` — 34 → 35
4. `q-eco-2025-defi-launches` — 38 → 39
5. `q-eco-nft-marketplace-whitespace` — 24 → 25
6. `q-protocol-current-mainnet-version` — 24 → 25
7. `q-scf-regional-india` — 41 → 42
8. `q-sep-45-contract-auth` — 44 → 45
9. `q-tool-freighter-wallet` — 44 → 45
10. `q-tool-lab-what-is` — 33 → 34

These pages do not change the returned five hits or any grade bit.
`searchCatalogPage` documents `total` as the consulted-tier candidate pool before diversity and paging.
A +1 total with an unchanged page is a larger pool behind the same five ids.

## Full skill diffs and exposure

`node scripts/diff-pins.mjs` HEAD manifest → worktree manifest: **4 files**, 77 lines.

| File | Old blob | New blob | Change |
|---|---|---|---|
| `agentic-payments/SKILL.md` | `cfadf070` | `ab6ea05b` | facilitator table and setup scoped to OZ as one option |
| `agentic-payments/mpp.md` | `0fa181ae` | `d389cd61` | two added lines: payment-method-agnostic scope |
| `agentic-payments/x402.md` | `2012c1ca` | `81623e78` | facilitator options; key scoped to OZ Channels |
| `smart-contracts/SKILL.md` | `99903bd4` | `626ad2e9` | `soroban-sdk = "27"`; Mainnet protocol 27 |

No other selected markdown changed.
No added/removed skill name or path.
No `ignore previous`, `you must`, `solo://`, `globalOutbound`, or Scout feedback path in the diff.

Declared catalog exposure:

- Entry count 253 → 253. No id added or removed.
- Field changes: `provenance` 193, `transport` 92, `description` 1.
- The 92 `transport` updates are `stellar-dev` commit/URL rewrites. Unchanged blobs keep the same content SHA-256.
- The one description change is `skills.stellar-dev.agentic-payments`, matching the SKILL.md frontmatter.
- Scout entries are not among the 92 transport rewrites.

Content SHA-256 of the four moved bodies still match live `skills.stellar.org` from the source audit (`205faa24`, `56ee9da7`, `6b7e58d8`, `2c5daaee`).

## Semantic source risks (non-blocking)

1. **MPP "one network" phrasing.** The new paragraph says each payment method "defines how one network settles it". Copilot on PR #129 flagged Stripe and NEAR Intents. `mpp.dev/protocol` says methods "define how specific networks integrate". Residual, not the original `sk-023` defect.
2. **x402 leak comment vs code.** The buyer sample comments that an unset URL falls back to `https://x402.org/facilitator` and would send `OZ_API_KEY` there. The code on the next line is `process.env.FACILITATOR_URL || "https://channels.openzeppelin.com/x402/testnet"`. Unset `FACILITATOR_URL` in the served example still uses OpenZeppelin. The prior source report stated the leak as a property of the example. That is inaccurate. Corrected in the prior report.
3. **Self-facilitation `S...` key.** Existing Stellar secret-key pattern. Not a leaked credential.
4. **`agentic-payments` rank bleed.** Six unrelated top-5 memberships pick up this skill. Zero grade losses. Accept as incidental.
5. **Catalog provenance stamp.** Rebuild writes a new `fetchedAt` on unchanged sources. Digest's 19 pages are that stamp. Not a body change.

Root-confirmed live facts, already independently measured in the source audit and not re-paid here: crates.io stable `soroban-sdk` 27.0.6; Horizon Mainnet protocol 27; MPP protocol agnostic; x402.org `/supported` has `stellar:testnet` only.

## PIN-REVIEW review (after rewrite)

Heading: `### 2026-09-09 — isolated stellar-dev acceptance from issue #141`.

The blocked combined-candidate heading is gone.
No `3b587aa9` or `sel:339145ff9f53` remains.

The entry names only `stellar-dev` `0472452a05731de5e0a1e886d8aae6df24873fe2` / `sel:7b68c8b72b2f`.
It keeps the other three sources unchanged.
It rejects the combined Scout candidate and points at `.agents/rounds/2026-09-09-drift-141-astra.md`.
It approves the isolated pin for merge, not production deployment or finding retirement.
It names this reviewer, the four-file body read, the 44-file hash fetch, unchanged totals, and zero grade losses.

`node scripts/check-pin-review.mjs --base HEAD` records the one selection change.

No remaining PIN-REVIEW blocking finding.

## Root ledger review

`.agents/rounds/2026-09-09-truth-maintenance.md` now states:

- Isolated pin `sel:7b68c8b72b2f` at `0472452a`
- Scout inventory and Stellar Light pin retained
- 1995 tests, 85 smoke tests, 44 hashes, catalog fingerprint-only gate rebase
- 544 pages compared; 19 change; 7 ordered ids; 6 membership; 2 score-only; 10 total-only
- No expected-service or forbidden-absence regression
- Combined candidate preserved as local tar evidence, not a release artifact
- Production Worker skill reads at 16:46–16:47 UTC still served `03b2f8e8`
- Findings stay `reported-upstream`

The 19/7/6/2/10 split matches this lane's `searchCatalogPage` run.
The ledger's production Worker note is live-Worker evidence. It is stronger than catalog inference.

No ledger blocking finding.

## Prior-report corrections applied

File: `.agents/rounds/2026-09-09-upstream-handoffs-grok.md`

1. Verdict table column no longer says "Raven production". It now says committed catalog, not a live Worker check.
2. Layer 3 no longer infers deployed Worker behavior from catalog URLs.
3. Unset-`FACILITATOR_URL` leak claim corrected: example defaults to OZ Channels testnet.
4. "PIN-REVIEW has no new `sel:` entry" marked true for the `16:41Z` read and superseded by the later Astra entry.

## Safe action for parent

Accept serving `stellar-dev` `0472452a05731de5e0a1e886d8aae6df24873fe2` / `sel:7b68c8b72b2f`.
Do not re-pin `stellar-light`.
Do not change routing thresholds.
Do not deploy in this round.
Keep `sk-021`, `sk-023`, and `sk-024` active until a reviewed pin is committed and the original triggers are re-run against that accepted pin.
The `sk-023` probe now excludes the scope sentence on `main`. A hit there is a regression of the canonical fix, not the kept Stellar-native bullet.

## Addendum — `searchCatalogPage` denominator

Date: `2026-09-09T16:55Z`.

The first acceptance write compared eval `topHits` and called the root 19 a digest provenance stamp. That attribution was wrong.

Independent `searchCatalogPage` on `1ef0cdd` vs worktree across 544 cases:

- full page changes = 19
- hit-projection changes = 9
- total-only changes = 10
- truncated changes = 0

Root's 19 is the full page denominator. Keep both numbers.
