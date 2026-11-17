# Item 3.3 measurement

Executor: Claude Sonnet 5.5, 2026-11-17, worktree `np-3.3`. Each mechanism was measured once, alone,
on a local branch cut from the base commit. Neither passes. The combination was not measured, because
the plan measures it only when both pass alone. USD 0: no model call, no network, no local server.

| Commit | What |
|---|---|
| `8d42de37` | Base commit: the plan, review, instruments and briefs on `e710b5d3`. |
| `0c2e43b9` | `np/3.3-prefix-floor`: the prefix floor, code change only. Local, never pushed. |
| `013592d1` | `np/3.3-slot-keeping`: gate-failed slot keeping, code change only. Local, never pushed. |

The code diffs are saved as [`prefix-floor.patch`](prefix-floor.patch) and
[`slot-keeping.patch`](slot-keeping.patch). Each applies to `8d42de37`.

The FAM cells come from `~/backups/fd-2026-11-14/split/fam.development.discovery.json`, a file that
exists only on agentpc. `measure.mts` checked its SHA-256 (`0246ad022163…`) on every run. Per-row
output stayed in the scratch directory.

## Gates, per run

`eval/results/` is not tracked; the paths below are the run results the comparisons read.

| Run | `eval:routing --gate` exit | Verdict line | Results |
|---|---|---|---|
| base | 0 | PASS, legacy 338 within band | `eval/results/routing-2026-11-17T10-00-37-746Z.json` |
| prefix floor | 1 | FAIL: legacy top1 231 vs baseline 220, top3 301 vs 293, top5 320 vs 327, each outside ±3 | `eval/results/routing-2026-11-17T10-01-49-483Z.json` |
| slot keeping | 1 | FAIL: legacy top5 318 vs baseline 327, outside ±3 | `eval/results/routing-2026-11-17T10-04-05-845Z.json` |

## Prefix floor alone

Change: `Math.min(c.length, token.length) >= 4 &&` in front of the prefix test in `scoreField` (vendor)
and `scoreFieldUngated`, as the plan states. No other change.

| Cell | Base | Prefix floor |
|---|---|---|
| Probe non-SDF (25) on page / displacing, limit 5, 7, 10 | 0, 1, 3 | 0, 1, **5** |
| Probe SDF (5) on page, limit 5, 7, 10 | 2, 2, 4 | 2, 3, 4 |
| Effect target: no `stellarOrg` card on "which organizations run validators" @5 and "Tier 1 organization validators quorum requirements" @8 | not met | met |
| Off-golden 40, question form, limit 5, 7, 10 | 8, 8, 10 | 8, 10, 13 |
| Off-golden 40, keyword form, limit 5, 7, 10 | 14, 16, 18 | 16, 16, 18 |
| FAM development (64), operation reach, limit 5, 7, 10 | 55, 58, 63 | 57, 60, 64 |
| FAM development, `stellarOrg` on an unlabelled row, limit 5, 7, 10 | 1, 1, 1 | 0, 0, 0 |
| Extended strict totals (top1, top3, top5, cardHit5) | 93, 112, 117, 16 | 93, **104, 109, 11** |
| Protocol-history lane (top1, top3, top5; control captures) | 6, 7, 7; 3 | 7, 7, 7; 3 |
| `npm test` | 0 failing | **24 failing**, 3695 passing |

The two new non-SDF displacements at limit 10 are `search_site` on "is this soroban protocol audited"
(rank 10, gated 51) and on "stellar wallet security private key storage" (rank 7, backfill 131). The
other three keep their `stellarOrg` card (two at rank 6 and 8, one `get_page` at 7).

`compare-routing.mjs --lists`, base against prefix floor, exit 1. Ordered top five changed on 312 of
338 legacy rows, 118 of 122 extended, 22 of 23 skills, 48 of 49 holdout, 11 of 12 protocol-history.

| Lane, metric | Hit-to-miss | Miss-to-hit | Net |
|---|---|---|---|
| legacy top1 | 18 (11 named, 7 confirmation-only) | 29 (22 named, 7 confirmation-only) | +11 |
| legacy top3 | 13 (10 named, 3 confirmation-only) | 21 (13 named, 8 confirmation-only) | +8 |
| legacy top5 | 11 (6 named, 5 confirmation-only) | 4 (1 named, 3 confirmation-only) | -7 |
| legacy cardHit5 | 15 (14 named, 1 confirmation-only) | 14 (9 named, 5 confirmation-only) | -1 |
| extended top1 | 10 (9 named, 1 confirmation-only) | 10 (6 named, 4 confirmation-only) | 0 |
| extended top3 | 11 (9 named, 2 confirmation-only) | 3 | -8 |
| extended top5 | 9 | 1 | -8 |
| extended cardHit5 | 6 | 1 | -5 |
| skills (23) | 0 | 0 | 0 |
| holdout top1, top3, top5, cardHit5, pass (counts only) | 1, 3, 2, 2, 1 | 3, 3, 4, 4, 4 | +2, 0, +2, +2, +3 |
| holdout forbidden captures | 10 to 10 | rows newly captured 1, rows cleared 1 | |

Ids named by the comparison (non-confirmation rows only):

- legacy top1 hit-to-miss: `q-defi-soroswap-similar`, `q-defi-stellarx-what-is`,
  `q-edge-deep-leave-no-stone-unturned-defi`, `q-hist-franklin-templeton-benji`,
  `q-hist-remittance-corridors`, `q-protocol-23-whisk-caps`, `q-protocol-parallel-execution`,
  `q-protocol-passkeys-secp256r1`, `q-scf-verified-members`, `q-soroban-restore-archived-entry`,
  `q-soroban-wasm-language`.
- legacy top3 hit-to-miss: `q-builder-lumenloop-regions-vocab`, `q-defi-aquarius-av`,
  `q-defi-lumenloop-categories-vocab`, `q-defi-rwa-overview`, `q-defi-rwa-scf-similar`,
  `q-eco-wallets-similar`, `q-edge-deep-comprehensive-sep-audit`,
  `q-edge-deep-leave-no-stone-unturned-defi`, `q-edge-noinfo-fake-project-quasarswap`,
  `q-hist-franklin-templeton-benji`.
- legacy top5 hit-to-miss: `q-asset-rwa-tokenized-freshness`, `q-defi-aquarius-av`,
  `q-defi-bridges-content`, `q-defi-comet-content`, `q-defi-phoenix-what-is`,
  `q-defi-reflector-oracle`. Miss-to-hit: `q-eco-wallets-overview`.
- extended top1 hit-to-miss: `q-aas-claim-received-claimable-balances`,
  `q-crp-custodial-vs-noncustodial-wallets`, `q-crp-tokenize-personal-rwa`,
  `q-edge-deep-leave-no-stone-unturned-wallets`, `q-ti-contract-verification-explorers`,
  `q-ti-freighter-localhost-not-detected`, `q-ti-launchtube-mercury`,
  `q-ti-multisig-recover-lobstr-vault`, `q-ti-openzeppelin-relayer`.
- extended top3 hit-to-miss: `q-aas-trusted-asset-list-whitelist`, `q-crp-anchors-by-corridor`,
  `q-crp-custodial-vs-noncustodial-wallets`, `q-crp-tokenize-personal-rwa`,
  `q-edge-deep-leave-no-stone-unturned-wallets`, `q-edge-scf-v7-centralization-myths`,
  `q-scf-nontechnical-participation`, `q-ti-contract-verification-explorers`,
  `q-ti-launchtube-mercury`.
- extended top5 hit-to-miss: the top3 list without `q-edge-scf-v7-centralization-myths`, plus
  `q-ti-friendbot-ratelimit-alternatives`. Miss-to-hit: `q-sor-reflector-integration-code`.
- extended cardHit5 hit-to-miss: `q-aas-trusted-asset-list-whitelist`,
  `q-crp-custodial-vs-noncustodial-wallets`, `q-crp-tokenize-personal-rwa`,
  `q-scf-nontechnical-participation`, `q-ti-contract-verification-explorers`,
  `q-ti-openzeppelin-relayer`. Miss-to-hit: `q-sor-reflector-integration-code`.
- The miss-to-hit id lists are not reproduced here except where named above; a gain cannot offset a
  rule 1 loss, and the rule 2 totals are the net.

Verdict:

| Rule | Result |
|---|---|
| 1. Legacy, skills, holdout | **Fail.** Legacy rows go hit-to-miss on all four metrics. One holdout row is newly captured. The gate exits 1. |
| 2. Extended strict totals | **Fail.** top3 112 to 104, top5 117 to 109, cardHit5 16 to 11. |
| 3. Off-golden 40 | Pass. No cell falls. |
| 4. FAM development reach | Pass. 57, 60, 64 against 55, 58, 63. |
| 5. Effect | **Fail.** The target is met, but non-SDF displacement at limit 10 rises from 3 to 5. |
| 6. Unit tests | **Fail.** See EXEC.md for the 24 names. Most assert the membership, rank or tier of a named card. |

The prefix floor is dropped. The 2026-10-02 floor-3 result predicted this direction: its gate failed
the same way.

## Gate-failed slot keeping alone

Change: the block in `searchCatalogPage` exactly as the plan states, between `preserveStrongBackfill`
and `preserveIntentWithinServiceQuota`. No other change.

| Cell | Base | Slot keeping |
|---|---|---|
| Probe non-SDF (25) on page / displacing, limit 5, 7, 10 | 0, 1, 3 | **2, 3,** 3 |
| Probe SDF (5) on page, limit 5, 7, 10 | 2, 2, 4 | 2, 2, 3 |
| Effect target: `stellarDocs.search_soroban_contract_docs` on "soroban reentrancy security" @8 | not met | met |
| Off-golden 40, question form, limit 5, 7, 10 | 8, 8, 10 | 10, 11, 14 |
| Off-golden 40, keyword form, limit 5, 7, 10 | 14, 16, 18 | 16, 17, 18 |
| FAM development (64), operation reach, limit 5, 7, 10 | 55, 58, 63 | 55, 58, **61** |
| FAM development, `stellarOrg` on an unlabelled row, limit 5, 7, 10 | 1, 1, 1 | 1, 1, 2 |
| Extended strict totals (top1, top3, top5, cardHit5) | 93, 112, 117, 16 | 93, 112, 117, 16 |
| Protocol-history lane (top1, top3, top5; control captures) | 6, 7, 7; 3 | 6, 7, 7; 3 |
| `npm test` | 0 failing | **4 failing**, 3714 passing |

The probe's limit-5 and limit-7 rises are not part of rule 5 (limit 10 only); they are reported.

`compare-routing.mjs --lists`, base against slot keeping, exit 1. Ordered top five changed on 158 of
338 legacy rows, 12 of 122 extended, 3 of 23 skills, 13 of 49 holdout, 4 of 12 protocol-history.

| Lane, metric | Hit-to-miss | Miss-to-hit | Net |
|---|---|---|---|
| legacy top1 | 1 (`q-defi-stellarx-what-is`) | 0 | -1 |
| legacy top3 | 1 (`q-soroban-current-sdk-cli-version`) | 0 | -1 |
| legacy top5 | 9 (`q-defi-bridges-content`, `q-defi-comet-content`, `q-defi-ondo-usdy`, `q-defi-reflector-oracle`; 5 confirmation-only) | 0 | -9 |
| legacy cardHit5 | 11 (`q-defi-bridges-content`, `q-defi-comet-content`, `q-edge-noinfo-fake-project-quasarswap`, `q-protocol-bn254-poseidon-xray`, `q-protocol-cap-vs-sep`; 6 confirmation-only) | 3 (`q-defi-aquarius-scf`, `q-scf-funded-similar-oracle`, `q-soroban-auth-recursion-dos-audit`) | -8 |
| extended, all metrics | 0 | 0 | 0 |
| skills (23) | 0 | 0 | 0 |
| holdout top3 (count only) | 1 | 0 | -1 |
| holdout forbidden captures | 10 to 10 | rows newly captured 0, rows cleared 0 | |

Verdict:

| Rule | Result |
|---|---|
| 1. Legacy, skills, holdout | **Fail.** Legacy rows go hit-to-miss on top1, top3, top5 and cardHit5. One holdout row goes hit-to-miss on top3. No holdout row is newly captured. The gate exits 1. |
| 2. Extended strict totals | Pass. No total moves. |
| 3. Off-golden 40 | Pass. No cell falls; question form rises at limits 5, 7 and 10. |
| 4. FAM development reach | **Fail.** Limit 10 falls from 63 to 61. |
| 5. Effect | Pass. The target is met and limit-10 displacement stays at 3. |
| 6. Unit tests | Three plan-named or ordering assertions, plus the gate-run test. See EXEC.md. |

Slot keeping is dropped.

## Combination

Not measured: neither mechanism passes alone. Nothing ships, so there is no re-baseline, no
`eval/gates.json` change and no deploy.
