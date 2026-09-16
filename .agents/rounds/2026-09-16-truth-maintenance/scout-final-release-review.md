# Final release review (existing 30 Scout ops, RWA excluded)

Reviewer: Grok high (Grok 4.6). Distinct from quality Sol, runtime Sol, and root.
Clock: `2026-09-16T23:16:54Z`.
Mode: read-only. **No gate edits in this turn. No holdout tuning. No holdout cases sent to authors.**

Policy: existing **30** exposed Scout operations. **`GET /api/rwa` remains forbidden.** Source / Docs-title / Light-pin land were reviewed separately and are not reopened here.

## Decision

**Accept semantic quality for this 30-op, RWA-excluded candidate.**

Reconcile with prior reviews: the quality review’s **335 ordered-list count is not a blocker**. The existing-operations review already classified the 22:22 packet except three residuals. Quality repaired those three (stablecoins, Soroswap membership, Blend dated-semantic). This closeout packet is the remainder. Each of the 41 rows is classified below. None is a blocking user-facing regression that needs more scoring work before recording a numeric baseline.

**Accept runtime integration** including the parent per-search `routingRejections` map. 544 full-page SHA is unchanged. Both timing files show all 13 query medians faster than accepted, with no residual query slowdown.

**Numerical baseline to record** (measured 22:54, RWA excluded) when parent edits `eval/gates.json` in a later reviewed commit:

| Lane | acceptedTotals to record |
|---|---|
| legacy n=338 | **219 / 298 / 326** (cardHit5 measured 112) |
| skills n=23 | **17 / 23 / 23** |
| holdout n=49 | **12 / 27 / 29**, forbidden **10** |
| extended n=122 (companion, measured) | 93 / 111 / 117, cardHit5 **16** |

Do **not** fit these into stored 213/279/312 ±3. Do **not** edit gates in this review.

**Not granted:** production release, **#141 close**, RWA exposure, holdout retune, silent gate weakening.

#141 close still needs eventual production proof and a separate track for RWA-deferred mixed-intent extras (tokenized-bond RPC simulate, treasury wallet balance, issuer-fee/cap/freeze). Those extras are not this 30-op accept.

## Code hashes (live)

Frozen quality tree `/tmp/raven-execution-2026-09-16/drift-combined-accepted` **unchanged**:

| File | SHA-256 |
|---|---|
| quality `search.ts` | `8a264911a38ced92503e11d844d793cb85004d79387ef878ce8e5ecd710605cc` |
| quality `scoring.ts` | `32fc2be48aeed6973f77ce9a3fa89d145f02db3f005b48b5f14f4cc4dd8a5b6a` |

Integrated `/tmp/raven-execution-2026-09-16/source-integration`:

| File | SHA-256 |
|---|---|
| `search.ts` before Map | `aa36447c2dc6d91382de9c2485ac4df964942b59a6150f632f9714cd883ac29a` |
| `search.ts` live (with Map) | `6aca9f7c84cdd96a68738a6439011a0518cf847ded9df0abcadfb383f08c2f89` |
| `scoring.ts` | `1120e3c0a510ebffd624f834387ae9077becccc1b7a15add31d0f5551507d8cb` |
| `skill-search-admission.ts` | `6c26fb77db5663db6b5774f494e428db338213faca197eec5935b65a5d1744d3` |
| catalog **file** | `da21ab9ab7859bb36ef0c2f5443c48cafef69c6c545c6397f7f741cc9fb47210` |
| `scout-exposure.ts` | `dc9238321e396646a5080db5b86b622c82a79ecdcbac2375dc53672cfe29a6bb` |
| `eval/gates.json` (unedited) | `d25251f2409c85a34233f0bfca3d0dfd1e5fd4ab76dfa4f7272b4f43ab8f6722` |
| quality dump 22:54 | `7bc73bdcc20e0081c0d4049f73afd29ae7368b54e30b57d5b2dd2635947448b6` |
| closeout packet | `99488038b17d8886201dcba52c9a613a6f099b17f7e7573f9d140b0eb2415ab8` |

Builder-printed catalog `7a270c85…` remains a canonical-JSON digest, not the file hash. 22:56 already recorded `da21ab9a…`.

## Runtime + per-search Map

`PreparedSearchQuery.routingRejections` is `Map<CatalogEntry, boolean>` created with `new Map()` inside `prepareSearchQuery`. `scoreCandidates` computes `rejectsRoutingIntent` once per entry and reuses it on the ungated pass. Same catalog, same query, same call. **Not** module-global. No `preparedQueryCache`.

544 exact full-page SHA (pre-runtime, post-runtime, parent-cache after Map):

`898df99147cae59ed2a6f08f3454070d6adee94f8d2636b1d834698251e429d6`

Parent reports 2152 unit + 94 smoke **before** the Map. This lane did not re-run after-Map tests (parent reruns now). Behavior proof for the Map is the identical 544 SHA.

## Timing (no residual slowdown)

Independent read of `scout-integrated-runtime-final-1.json` and `-2.json`. Compare **integrated-after vs accepted** medians. All **13/13** queries improve in **both** files.

| | Run 1 | Run 2 |
|---|---:|---:|
| overall median ms (accepted → after) | 3.689 → **3.332** | 3.711 → **3.345** |
| overall p95 ms | 12.919 → **7.998** | 12.907 → **8.046** |

Parent’s ~3.34 vs ~3.70 and ~8.02 vs ~12.91 matches. Controlled-vocabulary is faster after (run1 6.97→5.73; run2 7.01→5.74), so the earlier +3.65 ms cost is gone. **Accept no residual timing query slowdown.** Do not treat this as a Worker-CPU production proof.

## Reconcile quality vs existing-ops

Existing-ops review (`22:22` vs `20:37`): all earlier grade losses were permissible (NQG witness, Circle/USDC, Axelar, YieldBlox order, protocol-24 order, DeFi directory order, builder-by-SCF-tier truthful `notFor`) **except three residuals**.

Quality repaired those three with four list changes vs 22:22:

- `getStablecoins` rank 1 on the stablecoin page (list now equals 20:37)
- `searchProjects` back on Soroswap (rank 5, any5; any3 vs 20:37 still rank-only)
- Blend dated-semantic first (do **not** restore `searchResearch`)
- extra DEX-saturation list: `searchProjects` rank 2

Quality then refused no-degradation because **335 lists** still differ vs 20:37. That count mixes already-classified permissible moves with the three repaired rows. **List-count alone is not a semantic gate.** This closeout is the remaining grade-loss and new-directory set (41 unique rows).

## Closeout packet — classify each row

Packet: 24 grade-loss rows + 19 new `lumenloop.search_directory` pages = 41 unique (31 legacy, 7 extended, 3 holdout). Labels: **relevant** = after page still serves the question (grade/order only); **irrelevant-and-displaces-relevant** = an off-topic hit replaced a useful one; **irrelevant-but-displaces-noise** = off-topic hit replaced hackathon/cluster/`listSkills`/`vetIdea` noise.

### Grade losses (non-holdout) — all relevant or previously diagnosed

| id | losses | before → after (ids) | class |
|---|---|---|---|
| `q-builder-by-scf-tier` | top1, cardHit5 | `getBuilders` first → SCF submissions/radar/`scfPitch` | **relevant**. Truthful `notFor` (no SCF-tier data). Do not restore `getBuilders`. |
| `q-comp-yieldblox-oracle-incident` | top1 | `searchResearch` first → Docs first, research rank 2 | **relevant**. Order only. Research stays. |
| `q-defi-agentic-payment-standards-compare` | any1 | `compareHackathons` first → `agentic-payments` skill first | **relevant**. x402/MPP skill is the right lead. |
| `q-defi-soroswap-what-is` | any3 | same five ids; `searchProjects` rank 2→5 | **relevant**. Membership restored; rank-only vs 20:37. |
| `q-eco-defi-projects-discovery` | top1, any1 | same five ids; `searchProjects` rank 1→2 | **relevant**. Directory still rank 2. |
| `q-eco-dex-saturation` | top1, card, any1 | lost `compareHackathons`/`getClusters`; `searchProjects` rank 2 | **relevant**. Hackathon lead was noise. `searchProjects` answers “how many players”. `getClusters` crowdedness is a **non-blocking** nicer-to-have, not a restore of `compareHackathons`. |
| `q-protocol-24-whisk-incident` | top1 | Docs first → `searchResearch` first | **relevant**. Better incident corpus. Expected Docs still rank 2. |
| `q-protocol-max-tx-set-size` | cardHit5 | lost `searchResearch`; gained asset-token Docs | **relevant**. Protocol Docs still ranks 1–2. Asset-token at 4 is weak but does not hide the protocol answer. |
| `q-protocol-version-history-list` | top1 | Docs first → `searchResearch` first | **relevant**. Protocol-history corpus. |
| `q-scf-growth-hack` | cardHit5 | lost `hackathonBrief`/research; `searchProjects` + SCF radar | **relevant**. More SCF-specific. |
| `q-sep-catalog-list` | any1 | `listSkills` first → `standards` skill first | **relevant**. |
| `q-soroban-auth-recursion-dos-audit` | top3, card | lost research; gained `listAudits` | **relevant**. Audit op is the better surface. Docs 1–2 stay. |
| `q-soroban-instance-storage-dos` | top1, top3 | research/hackathon noise → Docs + research rank 4 | **relevant**. |
| `q-soroban-storage-types` | any1 | `listSkills` first → semantic + `searchResearch` + smart-contracts skill | **relevant**. |
| `q-soroban-vuln-classes` | cardHit5 | lost research; gained smart-contracts skill + `listAudits` | **relevant**. |
| `q-token-circle-usdc-on-stellar` | top3, top5, any3 | lost hackathon/clusters; kept cross-chain skill; SEP Docs rank 5 | **relevant**. |
| `q-crp-anchors-by-corridor` | any1 | hackathon first → SEP/anchor Docs first | **relevant**. |
| `q-defi-bridge-evm-to-stellar-axelar` | top5, card | ranks 1–4 unchanged; rank 5 `searchProjects` → titles | **relevant**. |
| `q-defi-build-staking-for-own-token` | top3 | lost `vetIdea`; research rank 1, `searchProjects` rank 2 | **relevant**. |
| `q-pc-surge-griefing-threat-model` | any1 | hackathon/cluster page → digest + Docs | **relevant**. |
| `q-ti-friendbot-ratelimit-alternatives` | any1, any3 | changelog/clusters → SCF clutter + wallet Docs rank 5 | **irrelevant-but-displaces-noise**. Do **not** restore changelog. Weak page; not a scoring restore ticket. Non-blocking. |
| `q-ti-video-tutorials` | any5 | lost `getSkill`/`compareHackathons`; Docs remain | **relevant**. |

### New `search_directory` pages (non-holdout)

On every technical how-to below, Docs or SEP Docs stay in ranks 1–2 unless noted.

| id | after role of directory | class |
|---|---|---|
| `q-infra-hubble-bigquery` | rank 5; lost `listSkills` | **irrelevant-but-displaces-noise** |
| `q-protocol-clawback-cap-0035` | rank 5; lost `vetIdea` | **irrelevant-but-displaces-noise** |
| `q-scf-liquidity-award-amount` | rank 5; lost `searchProjects` | **irrelevant-but-displaces-noise**. Docs 1–2 stay. |
| `q-sep-43-web-wallet-api` | rank 5; SEP Docs now rank 1 | **relevant** lead; directory **irrelevant-but-displaces-noise** |
| `q-soroban-auth-vs-authn` | rank 4; Docs rank 1 | **irrelevant-but-displaces-noise** |
| `q-soroban-contract-build-verification` | rank 5; Docs 1–2, research 3 stay | **irrelevant-but-displaces-noise** |
| `q-soroban-fee-structure` | rank 5; Docs 1–2 + protocol Docs | **relevant** lead; directory **irrelevant-but-displaces-noise** |
| `q-soroban-ttl-expiry-behavior` | rank 3 with `resolveProject`; Docs rank 1 | **irrelevant-but-displaces-noise** vs clusters/`getSkill` |
| `q-tool-freighter-wallet` | rank 5; wallet Docs 1–2 | **irrelevant-but-displaces-noise** |
| `q-pc-scp-message-types-overlay` | rank 4; titles + protocol Docs | **irrelevant-but-displaces-noise** vs clusters/hackathon |
| `q-edge-inject-fabricate-citation-instruction` | rank 5; lost `vetIdea` | **irrelevant-but-displaces-noise** |
| `q-edge-noinfo-sep-9999` | rank 3; SEP Docs rank 1 (fictional SEP) | **relevant** SEP-docs lead; directory **irrelevant-but-displaces-noise** |
| `q-soroban-oracle-defensive-consumption` | rank 4; Docs 1, `searchProjects` still rank 5 | **relevant**; directory **irrelevant-but-displaces-noise** vs `analyzeEcosystem` |
| `q-eco-freighter-wallet` | rank 4 with entity/semantic/`resolveProject`; titles rank 1 | **relevant**. Directory/resolve replace `getChanges`/`listAudits`. |
| `q-defi-defindex-honest` | `searchProjects` left; `analyzeEcosystem` + semantic + directory + SEP Docs | **irrelevant-and-displaces-relevant** for SEP/titles vs `searchProjects` (named product + `tvlUSD`). **Non-blocking:** `analyzeEcosystem` and `search_directory` still on the page. Do not restore `getClusters`. |
| `q-edge-fresh-latest-blend-tvl` | dated semantic rank 1; `searchResearch` not restored; `searchProjects` absent | **relevant** for the accepted source-capability repair. `searchProjects` weekly `tvlAsOf` is a **non-blocking capability note**, not a `searchResearch` restore. |

No technical directory capture **displaces a leading Docs/SEP answer**. Rank-1/2 how-tos stay Docs.

### Holdout (reviewer-only — do not send to authors, do not retune)

| id | class |
|---|---|
| `q-holdout-a-13-zk-replay` | **relevant**. `skills.stellar-dev.zk-proofs` rank 1 vs five hackathon-noise hits. Directory rank 3 is leftover noise. |
| `q-holdout-b-08-sep24-validation` | **irrelevant-but-displaces-noise**. Semantic + SEP Docs stay; directory rank 5. |
| `q-holdout-b-15-wallet-usdc-screen` | **irrelevant-but-displaces-noise**. Wallet Docs 1–2 stay. |

Holdout totals improve (12/27/29, forbidden 10 vs 10/22/27, forbidden 11). **0 pass regressions** in the existing-ops packet; this closeout adds no holdout grade-loss rows, only directory extras.

## Concrete remaining user-facing items (all non-blocking)

1. Named-product `searchProjects` absent on Defindex TVL/lineup and Blend TVL-today. Directory/semantic remain. Do not restore `searchResearch` or `getClusters`/`compareHackathons`.
2. Friendbot alternatives page is still weak SCF clutter; wallet Docs at rank 5. Do not restore changelog.
3. Leftover `search_directory` at rank 4–5 on several Docs-led how-tos. Displaces noise only.

**No blocking semantic regression for the 30 existing ops.**

## Blocking vs non-blocking

| Item | Status |
|---|---|
| Semantic quality, 30 ops, RWA excluded | **Non-blocking — accept** |
| Runtime Map + 544 SHA `898df991…` | **Non-blocking — accept** |
| Timing vs accepted (both final files) | **Non-blocking — accept no residual slowdown** |
| Numeric baseline 219/298/326; 17/23/23; holdout 12/27/29 forb 10 | **Accept to record**; land in a later gates commit |
| After-Map 2152+94 rerun | **Non-blocking pending parent result** |
| `eval/gates.json` fingerprint + acceptedTotals | **Not done this turn** (no gate edits) |
| RWA exposure | **Forbidden** |
| #141 close | **Blocked** until production proof + RWA-deferred track |
| Source / title / Light pin | Separate, already reviewed |
| Holdout retune | **Forbidden** |
