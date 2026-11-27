# Independent drift review — `drift/2026-11-27-live-drift` (#565, #566, #567, #572, #573, #574)

- **Reviewer:** Claude Fable, resolved model ID `claude-fable-5-2`, `high` effort, hc terminal `t2p5`.
- **Author:** Gemini 4 Neon, high. Reviewer differs from author and orchestrator.
- **Reviewed tree:** uncommitted working tree on `d39f0d6b` (`HEAD` == `origin/main`), 20 modified
  files, no untracked files. Compared with `git diff origin/main`.
- **Lane rules kept:** no tracked file edited, nothing committed, pushed, posted, or deployed; no
  subagents; no file under `eval/qa/corpus/` opened; holdout lane read as counts only. `git status
  --short` is byte-identical before and after every command I ran.

## Verdict: PASS WITH FINDINGS

The regeneration is faithful and every gate is green. The class is **operation surface + routing
text + skill pin** (independent review required), and every count in the author's record that I
could re-derive is correct. Nothing blocks the commit once the four Should-fix items are
reconciled; two of them (S3, S4) are the lead's exposure call on `scout.getTokenIntegrations`.

| Severity | Count |
|---|---|
| Blocking | 0 |
| Should-fix | 4 |
| Low | 6 |

## Findings

### Blocking

None.

### Should-fix

**S1. `PIN-REVIEW.md` records two commit SHAs that do not exist upstream.**
`ecosystem-skills/PIN-REVIEW.md:55-56` name `9098e8ba24de45d723b1c0c5a570070f50a51d68` and
`2527e7b2ff196069a32f9e180338277500b58399`. Only the first 12 hex match the real pins at
`ecosystem-skills/MANIFEST.json:192` (`9098e8ba24de3299cda24b21bb5cb80aa1cb5d2b`) and `:368`
(`2527e7b2ff19a03857d7cf066cf68d1d9c33cc06`). `gh api repos/stellar/stellar-dev-skill/commits/<sha>`
and the `Stellar-Light/stellar-scout` equivalent answer "No commit found" for the ledger's values
and resolve the manifest's. `check-pin-review.mjs` passes because it keys on the `sel:` token
(both `sel:` digests are correct). Fix: paste the two manifest SHAs into the table. The prior
entry (`:71-72`) matches its manifest, so this is new in this diff.

**S2. Two `.agents/TODO.md` exposure triggers fired; neither is executed or recorded.**
- `.agents/TODO.md:549-561` fires on a response-schema change to `GET /api/quality` or
  `GET /api/verify`, and prescribes: rebuild a candidate, run exposure tests and the gate without
  changing `eval/gates.json`, and record the manifest hash and lane totals. Both changed in
  1.9.173 (`inventory/stellar-light.json`): quality gains `findings.byFailureMode.items.{blocked,refresh}`,
  `repoQuality.coverage.knowledgeNotes.{missing,triaged,triagedMeans}`, five
  `rowQuality.weakestRows.items.*` fields, `rowQuality.deploymentSplit`, and
  `rowQuality.strongBasisSplit`; verify gains `meta.searched.stablecoins`.
- `.agents/TODO.md:400-406` names an `/api/rwa` schema change as a reopen condition that needs an
  owner or orchestrator decision. `GET /api/rwa` gains `assets.items.integrations`.

The only record is `eval/gates.json:53` ("inspected per TODO trigger and remain excluded"); the
diff does not touch `.agents/TODO.md` ("Last fired 2026-11-16" stands) and adds no candidate
record like the precedent `.agents/rounds/2026-11-16-next-phase/items/0.2/SCOUT-EXPOSURE.md`. The
note does not mention the `/api/rwa` change at all. Staying excluded is the safe default, so this
does not block the absorb. Reconcile by either running the candidate procedure and recording it,
or recording the orchestrator's explicit deferral, and stamping "Last fired" either way.

**S3. The exposure record omits that the new operations enter unrelated top-fives; `getTokenIntegrations` shows the pattern that keeps `GET /api/rwa` excluded.**
No grade is lost, and the gate passes. But the per-case comparison shows the new operations in the
top five of **10 non-holdout rows and 2 holdout rows** (counts only) that they do not answer, and
`eval/gates.json:53` discloses none of it (the 2026-11-16 candidate record listed this for
`getQualityReport`).

| Row | New op, rank | Left the top five |
|---|---|---|
| `q-protocol-clawback-cap-0035` (legacy) | `getTokenIntegrations`, 3 | `lumenloop.search_directory` |
| `q-edge-ambig-stellar-token-meaning` (legacy) | `getTokenIntegrations`, 3 | `lumenloop.search_content_semantic` |
| `q-sor-index-sac-vs-sep41-events` (extended) | `getTokenIntegrations`, 3 | `skills.stellar-dev.smart-contracts` |
| `q-sor-sep41-transfer-vs-transferfrom` (extended) | `getTokenIntegrations`, 4 | `stellarDocs.search_soroban_contract_docs` |
| `q-asset-establish-trustline-howto` (legacy) | `getTokenIntegrations`, 5 | `lumenloop.search_directory` |
| `q-scf-award-tiers-list` (legacy) | `getTokenIntegrations`, 5 | `skills.lumenloop.scf-submission-radar` |
| `q-scf-history-soroswap` (legacy) | `getAwardRoundCoverage`, 2 | `scout.scfPitch` |
| `q-edge-deep-comprehensive-sep-audit` (legacy) | `getAwardRoundCoverage`, 3 | `scout.getLeaderboard` |
| `q-edge-fresh-latest-scf-round` (legacy) | `getAwardRoundCoverage`, 4 | `lumenloop.find_content_by_entity` |
| `q-ti-enumerate-all-contracts` (extended) | `getAwardRoundCoverage`, 5 | `scout.getPartners` |

Four of the six `getTokenIntegrations` rows are protocol or implementation questions. Probes I
wrote independently of the goldens (`searchCatalogPage`, limit 5, both manifests):

| Query | `origin/main` | Working tree |
|---|---|---|
| "which lending protocols support EURC" | not present | `getTokenIntegrations` rank 1 |
| "which tokens does Blend support" | not present | `getTokenIntegrations` rank 1 |
| "does Scout carry every award SCF lists for round 44" | not present | `getAwardRoundCoverage` rank 1 |
| "how many projects were awarded in SCF round 38" | — | `getAwardRoundCoverage` absent from top five |
| "how do I build a token swap in my Soroban contract" | — | `getTokenIntegrations` rank 3 (score 318); `skills.stellar-dev.smart-contracts` falls 4 to 5, `scout.searchHackathonBuilds` leaves |
| "how do I implement SEP-41 token transfer in Soroban", "how do I add a trustline for USDC", "what is the clawback flag" | — | unchanged |

So the operations serve their intent, and `getTokenIntegrations` also captures some implementation
questions. That is the reason `src/policy/scout-exposure.ts:25-27` gives for excluding
`GET /api/rwa`. The mechanism is the builder's response-schema keywords on the entry at
`catalog/manifest.json:14851` (`contracts`, `horizon`, `network`, `amount`, `holders`, `round`,
`award`, `coverage`), the general extraction issue already held at `.agents/TODO.md:409-415`.
There is no answer-level evidence for either new operation. Reconcile by listing these captures in
the gates note and commit body, and by the lead stating the accepted trade (or excluding
`getTokenIntegrations` until the general scoring repair). `getAwardRoundCoverage` is the lower-risk
of the two.

**S4. The natural `getTokenIntegrations` call returns `caveat: "no-rows"` while carrying the answer's next step; "live-verified" is not backed by a through-Worker check.**
Live `GET /api/tokens/integrations?token=USDC` returns 200 with `edges: null`, `summary: null`, and
five `meta.token.candidates`. `hasServiceData` (`src/executor/providers.ts:193-218`) skips the
`meta` branch, so `resultCaveat` (`:257`) returns `no-rows` and `asOf` falls back to `observed` —
identical to an unknown code (`token=ZZZNOPE`). The server instructions tell the model a caveated
ok result "grounds nothing", so a bare code (the form upstream documents first) reads as an empty
result instead of "pick an issuer and call again". Calls with `CODE:ISSUER`, `XLM`, or `project=`
return edges, no caveat, and `asOfBasis: data.meta.asOf`.

I derived this from the code and the live payloads; I did not run it through the Worker (no
`workerd` was listening and a reviewer lane does not start one). Before deploy, the lead should run
one `execute` on the dev server for `scout.getTokenIntegrations({token:"USDC"})`, the same with
`CODE:ISSUER`, `{project:"blend"}`, and `scout.getAwardRoundCoverage({round:44})`, and record the
envelopes. If confirmed, file a TODO item rather than changing `providers.ts` in a drift commit
(that path needs `test:smoke`). Say in the gates note what "live-verified" covered.

### Low

**L1. `eval/gates.json:53` note is imprecise in three places.**
- "deep schema/response updates on 15 Scout ops": I count 13 exposed Scout operations with a
  direct inventory change (18 including 5 excluded), 19 existing Scout manifest entries with a
  changed `outputSchema`, and 26 with any model-visible change (most through derived `keywords`).
- Two Stellar Docs entries also moved and are not mentioned: `stellarDocs.search_protocol_concepts_docs`
  loses derived keyword `support`; `stellarDocs.search_soroban_contract_docs` loses `support` and
  gains `coverage`.
- The extended lane's 8 top-five list changes and 13 score-only moves are omitted (legacy and
  holdout counts are given and are correct).
- "Independent review: pending" (and `PIN-REVIEW.md:55-56` "pending reconciliation") need the
  final reviewer line.

**L2. `PIN-REVIEW.md:63` says the changed text has no reference to an excluded operation; it adds one, and the scrub leaves an orphaned paragraph.**
The new `hackathonBuilds[]` paragraph in `references/api-reference.md` (raw line 134) names
`/api/hackathons/builds/{id}` (excluded, `src/policy/scout-exposure.ts:34`). The scrub drops that
sentence, so nothing leaks, but the served text keeps the rest with no subject: "Newest event
first; the order is not a rank. Say "contributed to {build} ({event})"…" now follows the `onStellar`
paragraph and reads as describing `onStellar.builds[]`. `diff-pins.mjs` printed no `SCRUB NARROWED`
line because the sentence was removed, not narrowed. Reword the attestation and note the served
wording; a scrub change is a separate, reviewed follow-up.

**L3. Stale count in docs.** `eval/qa/README.md:100` still says "61-operation diagnostic: 18
Lumenloop, 29 Scout…"; the constants it describes are now 63 and 31
(`eval/qa/plain-operation-harness.mjs:25-26`).

**L4. Both new operations are classed `detail` by the `get` prefix default.**
`eval/plan/op-classes.json:27,43`. By the generator's own rule (`eval/plan/build-op-classes.mjs:37-49`,
collection-returning `get*` is `broad`; precedent `scout.getStablecoins`, `scout.getPartners`),
`scout.getTokenIntegrations` (`edges[]` with `limit`/`offset`) is `broad`, and
`scout.getAwardRoundCoverage` (`rounds[]`, every round when `round` is omitted) probably is. This
needs `OP_OVERRIDES` entries, a source decision the regeneration skipped. It affects only the
plan-progression diagnostic.

**L5. WalletConnect content is reachable but not discoverable by its own name.**
The host override at `scripts/description-notes.mjs:23-24` pins the `dapp` description without
WalletConnect, and the new `skills.stellar-dev.dapp#file:walletconnect.md` section is exact-ID
only. "add WalletConnect to my Stellar dapp" ranks `skills.stellar-dev.dapp` second on both
manifests; "WalletConnect Pay Stellar wallet integration" does not surface it (standards ranks
third). No regression; a note for the next override review.

**L6. Not verified by this review.** Upstream factual claims in `dapp/walletconnect.md` and
`standards/ecosystem.md` (WalletConnect Pay Stellar launch date, LOBSTR first wallet, the Boundless
mainnet escrow contract `CCFVEGOQ…MJGQZ`; the stellar.expert lookup answered 402). The Circle USDC
issuer in the new text matches the first candidate Scout returns live. `getAwardRoundCoverage`
carries no `meta.asOf`, so its envelope `asOf` is `observed` while SCF's side is as of
`meta.scfReadAt` (2 days older at review time).

## What I re-derived

### 1. Drift classification

| Artifact | Result | Class |
|---|---|---|
| `inventory/stellar-light.json` 1.9.157 → 1.9.173 | `surface` exit 1 (+`GET /api/projects/scf-rounds`, +`GET /api/tokens/integrations`; 0 removed, 0 renamed); `text` exit 1; `deep` exit 1. 42 → 44 operations; changelog 405 → 428 | Operation surface + routing text |
| Routing-text fields | `listContracts` (description), `getStablecoins` (description, `x-routing`, parameters), `searchResearch` (`x-routing`, parameters) — matches the note | Routing text |
| Components | 10 changed, 4 added (`TokenHolderSweep`, `TokenIntegrationEdge`, `TokenIntegrationsBrief`, `TokenTierCounts`) | Deep |
| `inventory/stellar-docs.json`, `stellar-docs-titles.json` | all three modes exit 0; 982 → 983 pages, one title `/meetings/2026/11/19` | Provenance/data |
| `src/adapters/stellar-docs-anchors.json` | 979 → 980 pages; 7 existing pages gain one heading each, 1 page added, 0 removed (8 changed, as claimed); 3 anchor test files, 147 tests pass | Provenance/data |
| `ecosystem-skills/catalog.json`, `community.json` | timestamp only | Provenance |
| `lumenloop`, `stellar-org` inventories | unchanged | — |

### 2. Skill pins (read in full, 5 files, via `diff-pins.mjs` and my own scrub pass)

- `stellar-dev` `f954e6a0f35c` → `9098e8ba24de`: `dapp/SKILL.md` (link + description), new
  `dapp/walletconnect.md` (6,035 bytes), `standards/ecosystem.md` (WalletConnect, WalletConnect Pay,
  Boundless).
- `stellar-light` `a07d00c45623` → `2527e7b2ff19`: `SKILL.md` (one table row),
  `references/api-reference.md`.
- No instruction override, no credential (the WalletConnect project ID is described as public; no
  literal value), no claim about Raven's capabilities, no retired-skill reference. Signing guidance
  is restrictive ("Never sign raw bytes", bind passphrase from chain, reject mismatched address).
- Served text after `scrubNonExposedRefs`: `findExcludedScoutPath` null and zero non-exposed
  operation names in all five files (see L2 for the one wording defect).
- `references/feedback.md` stays excluded: `ecosystem-skills/sources.json:5` `excludeFiles`, and
  absent from `MANIFEST.json`.
- `catalog/manifest.json` carries the new `transport.url` and `sha` for all five files; zero
  references to either old commit remain.

### 3. ADR-0003 surface decision

- Both new operations are `GET` with query parameters only. Live: 200 on valid calls, 400 on a bad
  or unknown parameter, 405 on `POST`/`PUT`/`DELETE`.
- `catalog/manifest.json`: 288 entries (63 operations, 20 skills, 205 sections); Scout 31. A rebuild
  to a scratch path is byte-identical (`39e7224b…f180`, the fingerprint in `eval/gates.json`).
- All 13 exclusions hold: the 13 inventory operations absent from the manifest are exactly
  `EXCLUDED_SCOUT_OPERATIONS`; `src/policy/scout-exposure.ts` is untouched.
- Zero occurrences of any non-exposed operation name or excluded path in `catalog/manifest.json`
  and `specs/super-spec.json` (the upstream `notFor` pointer to `getRwaAssets` is scrubbed).
- `specs/super-spec.json`: 67 paths (63 + 4 skills), both new operations present.
- Runner `ops` (`skills.lumenloop.stellar-ecosystem-digest`: three Lumenloop operations) do not
  intersect the diff.

### 4. Routing, all 544 rows against `origin/main`'s manifest

| Lane | `origin/main` | Working tree | Top-five list changes | Score-only | Grade changes |
|---|---|---|---|---|---|
| Legacy (338) t1/t3/t5/card@5 | 219/293/326/115 | 219/293/326/115 | 17 | 19 | 0 |
| Extended (122) t1/t3/t5/card@5 | 93/112/117/16 | 93/112/118/16 | 8 | 13 | 1 gain (`q-sor-reflector-integration-code` top5, `scout.explainRepo`) |
| Skills (23) | 17/23/23/23 | 17/23/23/23 | 0 | 0 | 0 |
| Holdout (49), counts only | 12/26/30/30, 11 captures, 24 passed | same | 3 | 2 | 0 |
| Protocol history (12) | 6/7/7, 3/4 controls | same | 0 | 0 | 0 |

Zero losses. Accepted totals and every threshold are unchanged; only the manifest fingerprint,
`baselinedAt`, and `localTrace` move. Holdout headroom stays at zero.

### 5. Test edits — none weakened

- `test/search.test.ts:617` (1 → 2 Scout hits for "top Stellar projects by GitHub activity"):
  `scout.searchRepos` enters at rank 4 (score 159) through the new derived keyword `activity`.
  `scout.getLeaderboard` stays at rank 2, `scout.searchProjects` stays out, and the page is still
  truncated; the sibling test at `:601` already pinned 2. An exact re-pin inside the quota.
- `test/catalog.test.ts`: counts 29 → 31, 204 → 205, 285 → 288; both operations added to the
  exposed and `x-routing` id lists; every "excluded count is 0" assertion remains.
- `test/super-spec.test.ts`, `test/skills.test.ts` (224 → 225), `test/live-cases.test.mjs`
  (65 → 67), `eval/qa/plain-operation-harness.mjs` and its test (61 → 63, Scout 29 → 31): mechanical
  re-pins that match the manifest. The staleness tests for the manifest and super-spec pass.

## Verification commands

| Command | Exit | Result |
|---|---|---|
| `node scripts/diff-inventory.mjs {surface,text,deep}` × 4 services vs `origin/main` | 1/1/1 (stellar-light), 0 (others) | as classified above |
| `npm run eval:routing -- --gate` | 0 | GATE PASS; committed evidence verified |
| `node eval/run-routing.mjs --manifest <origin/main manifest>` | 0 | baseline for the per-case comparison |
| `npm run eval:selftest` | 0 | all checks passed |
| `node scripts/check-pin-review.mjs --base origin/main` | 0 | 2 selection changes, both recorded |
| `node scripts/check-mirrors.mjs --fetch` | 0 | 68 files fetched and verified, cache bypassed |
| `node scripts/check-skills-drift.mjs` | 0 | all 7 sources `ok` |
| `node scripts/build-catalog.mjs --out <scratch>` | 0 | byte-identical to `catalog/manifest.json`; 13 Scout exclusions listed |
| `node scripts/diff-pins.mjs <main MANIFEST> <tree MANIFEST>` | 0 | 5 files changed; no `SCRUB BLOCKED` |
| `npm run secrets:scan -- --tree` | 0 | clean |
| `git diff --check origin/main` | 0 | clean |
| `npm run typecheck` | 0 | — |
| `npm test` (first run, concurrent with the routing/mirror stream) | 1 | 1 failed, 4196 passed: `test/playground-transport.test.mjs:82` (socket count 6, expected 4) |
| `npm test` (rerun alone) | 0 | 175 files, 4197 passed, 3 expected fail, 5 skipped |
| `npx vitest run test/playground-transport.test.mjs` | 0 | 5 passed |
| `npx vitest run test/adapters.test.ts test/stellar-docs-anchor*` | 0 | 147 passed |
| `npm run build` | 0 | dry-run bundle 7067 KiB / gzip 1401 KiB |

The one `npm test` failure is a socket-timing test in a file this diff does not touch; it failed
only while my second gate stream was running and passed twice afterwards. I treat it as load
flake, not a finding against this change.

**Not run:** `npm run test:smoke` (the diff touches neither `src/executor` nor `src/demo`), any
model-calling eval (cost: $0 for this review), and a through-Worker `execute` of the new operations
(see S4). Direct upstream probes: 8 `GET` and 6 non-`GET` requests to `stellarlight.xyz`.
