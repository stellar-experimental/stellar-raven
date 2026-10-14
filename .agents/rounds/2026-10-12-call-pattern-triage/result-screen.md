# Section screen (text and guard) — measurement result

Plans: [`plan-section-guard.md`](plan-section-guard.md) (shared screen and guard verdict) and
[`plan-section-text.md`](plan-section-text.md) (text verdict reading rules). Amendments: launch
amendment 1, deviation 1, and orchestrator amendment 2, all in the
[triage ledger](../2026-10-12-call-pattern-triage.md) ("Measurement results").
Collector: lane T (Claude Opus 5.5, high). Collection: 2026-10-14 00:47Z to 03:47Z.
Post-run review: [`review-post-run-astra.md`](review-post-run-astra.md) (Codex `gpt-6-astra`,
high, on `26ee296a`). The orchestrator accepts its verdicts. Lane T2 reconciled it here.

## Final verdicts on `f7b1b775` (post-run review)

| Change | Final verdict | Merge status |
| --- | --- | --- |
| Section-shape text | **PASS on `f7b1b775`, needs re-measure** (review: PASS-CONFIRMED-NEEDS-REMEASURE) | Does not merge on this evidence. `main` moved to `0a60d98a` (#271, answer-style v2) during the screen. #271 changes the `execute` description, the server instructions, the success envelopes, and the source footers. The measured arms do not contain it. The text gets one measurement on the new `main` ([result-text-v2.md](result-text-v2.md)). This result stays as historical evidence. |
| Section guard | **INDETERMINATE** (review: INDETERMINATE-CONFIRMED) | Does not merge. Do not merge the guard with the text. |

## Proposed verdicts

| Change | Comparison | Proposed verdict | Main reason |
| --- | --- | --- | --- |
| Section-shape text (Fix 2) | A against T | **PASS** | Misreads fell from 4 in 40 section-read scripts (A) to 0 in 31 (T). No new script-error class. No consistent grade change on any of the 16 rows. |
| Section guard (Fix 1) | **T against TG** (selected by the text PASS) | **INDETERMINATE** | The guard never fired in TG1 or TG2 (E = 0). With the text present, the model made no misread for the guard to act on (TG: 0 misreads in 29 section-read scripts). Rule 6 names E = 0 as INDETERMINATE. |

- The text PASS meets every rule 5 condition. Two conditions are close to their limits: M in A is
  exactly 4 (the floor), and the rate claim rests on 4 misreads. Read it as a small-sample result.
- The guard result does not show harm in TG: F = 0, no silent loss, no consistent grade change.
  It also does not show benefit, because no misread occurred in TG.
- Diagnostic only (A against G, does not decide): the guard fired once (G2), the model recovered in
  the next script, and the exception discarded 4 co-results. One row
  (`q-defi-build-staking-for-own-token`) shows a consistent grade drop in G that the plan does not
  confirm for a non-deciding comparison. See "Diagnostics".

## Arms, pins, and environment

| Arm | Commit | Tree | Surface SHA-256 (`report-live-surface`) | `execute` description |
| --- | --- | --- | --- | ---: |
| A (`main`) | `f7b1b77506acda9b674fb67610fbfd8b8e029e13` | `227ee549…` | `656feeef8966cbac326db00479f69b3171c401e94c5c4239364d04a28e754c4a` | 9,841 |
| T | `52415bb074d6347b12815232812b3f06b8e7dba8` | `0c8f0cca…` | `0e429c70854fadcd68fed6e8cff56e0cb84e357c70dea182654c8c087921ff26` | 10,046 |
| G | `7c2b203083376b6cc42dba9e21388f86a8fe400a` | `886b8ef6…` | `656feeef…` (equals A) | 9,841 |
| TG | `e972a6f114009395e563440068e0aa5fa2aaf7a8` | `7117040b…` | `0e429c70…` (equals T) | 10,046 |

- Surface relations hold at every start: A equals G, T equals TG, T differs from A. The source
  revision pin passed at every start.
- Answer and judge: `claude-sonnet-5` (runner defaults). Rubric `v2.11`, pack **`p9`** in all eight
  collections (launch amendment 1). These grades are not comparable with stored `p6` grades.
- In all eight: cases SHA-256 `5872d7527c914fbd2a862e1ec6499659460c2ffe58fc804b4f7fab646f08fe83`,
  `qaImplementationSha256` `5c2f1adb…`, agent binary `c9b53416…`, agent environment `190d0b47…`,
  remote identity probe `eb06cd89…` and vector `414667aa…`, stability register `aebd5b94…`, counter
  `2a99d514…` (self-check 23 of 23 before each count).
- The runner worktree stayed at `f7b1b775` and clean.

## Schedule and server checks

| Order | Collection | Server start | Pre-start check (UTC) | 1-min load | Window (UTC) |
| --- | --- | --- | --- | ---: | --- |
| 1 | A1 | A-1 | 00:47 count 5 (deviation 1) | — | 00:47:52–01:10:35 |
| 2 | T1 | T-1 | 01:11:34 count 5 | — | 01:12:15–01:34:00 |
| 3 | G1 | G-1 | 01:34:21 count 5 | — | 01:34:28–01:56:15 |
| — | (stop) | — | 01:57:06 count 36: stop; orchestrator amendment 2 | 19.11 at 01:58 (lane read; no receipt kept; see note) | — |
| 4 | TG1 | TG-1 | 01:59:55 raven 0, no listener, total 37 | 10.36 | 02:00:01–02:19:56 |
| 5 | TG2 | (same) | — | — | 02:19:56–02:40:40 |
| 6 | G2 | G-2 | 02:40:55 raven 0, total 25 | 7.11 | 02:41:02–03:01:29 |
| 7 | T2 | T-2 | 03:01:55 raven 0, total 21 | 6.91 | 03:01:59–03:23:46 |
| 8 | A2 | A-2 | 03:23:58 raven 0, total 21 | 5.96 | 03:24:02–03:47:01 |

- Load note (post-run review correction): the ledger's amendment 2 reason gives 7.5 at 01:58Z.
  That value is the orchestrator's own read. The 19.11 above is the lane's read. The record keeps
  no receipt for either value, so the record cannot reconcile them. Neither value was a gate
  input. The first start under the load gate (TG1) has the retained receipt: 10.36 at 01:59:55Z
  (`start-TG-1.txt`).
- Contention check (amendment 2, condition 3): 0 rows in every collection (limit 1). Every
  `execute` error in the screen is a model error (listed under "Q").
- One refused command, no spend: the first T1 command (01:11:44Z) ran in a shell whose `PATH`
  differed, and `run-qa.mjs` refused before any model call. The driver then used `zsh -f`.

## Completeness and grade coverage

| Collection | Rows | `comparable` | Aggregates suppressed | Calls reported | Missing costs | Judge calls | Spend (USD) | Agent (USD) | Judge (USD) |
| --- | ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| A1 | 16 | true | no | 40/40 | 0 | 24 | 6.6985946 | 4.9736230 | 1.7249716 |
| T1 | 16 | true | no | 42/42 | 0 | 26 | 6.6318970 | 4.7954982 | 1.8363988 |
| G1 | 16 | true | no | 40/40 | 0 | 24 | 6.7421682 | 5.1181836 | 1.6239846 |
| TG1 | 16 | true | no | 38/38 | 0 | 22 | 5.8277914 | 4.2410240 | 1.5867674 |
| TG2 | 16 | true | no | 40/40 | 0 | 24 | 6.1198368 | 4.5056586 | 1.6141782 |
| G2 | 16 | true | no | 36/36 | 0 | 20 | 6.2686388 | 4.8608044 | 1.4078344 |
| T2 | 16 | true | no | 42/42 | 0 | 26 | 6.4095010 | 4.6830952 | 1.7264058 |
| A2 | 16 | true | no | 40/40 | 0 | 24 | 6.7411778 | 4.9906136 | 1.7505642 |

- 128 of 128 cells have a grade. No `agent-limit`, no `judge-*`, no other missing class.
- No initial-judge retry, no replacement, no confirmation re-judge (both lists empty).
- `npm run eval:plan`: 16 of 16 required covered in every collection; mean on-plan ratio 0.93 to
  0.95.

## Grades (2 correct, 1 partial, 0 wrong)

| Row | A1 | T1 | G1 | TG1 | TG2 | G2 | T2 | A2 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `q-aas-burn-clawback-redemption-mechanics` | 2 | 2 | 1 | 2 | 2 | 2 | 2 | 2 |
| `q-aas-list-token-on-exchanges-aggregators` | 2 | 1 | 2 | 2 | 1 | 0 | 2 | 2 |
| `q-agent-identity-erc8004-stellar` | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `q-asset-trustline-basics` (control) | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| `q-defi-build-staking-for-own-token` | 2 | 2 | 1 | 1 | 2 | 1 | 2 | 2 |
| `q-defi-etherfuse-stablebonds` | 1 | 1 | 1 | 0 | 1 | 1 | 1 | 1 |
| `q-edge-ambig-stellar-token-meaning` (control) | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| `q-edge-noinfo-sep-9999` | 2 | 2 | 2 | 2 | 0 | 0 | 2 | 2 |
| `q-jutsu-check-account-history` | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `q-passkey-smart-account-architecture` | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `q-pc-address-types-strkey` | 1 | 1 | 1 | 2 | 1 | 2 | 1 | 1 |
| `q-pc-surge-griefing-threat-model` | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `q-scf-pitch-prep-live` | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `q-soroban-cross-contract-call` | 1 | 1 | 1 | 1 | 2 | 2 | 1 | 1 |
| `q-soroban-fuzz-testing` (control) | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 |
| `q-stellar-recurring-payments` | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

Consistent changes (both candidate grades on the same side of both baseline grades):

| Comparison | Role | Consistent changes | Baseline disagreement | Candidate disagreement |
| --- | --- | --- | ---: | ---: |
| A against T | Text verdict | none | 0 (A1 vs A2) | 2 (T1 vs T2) |
| T against TG | Guard verdict | none | 2 (T1 vs T2) | 6 (TG1 vs TG2) |
| A against G | Diagnostic | `q-defi-build-staking-for-own-token` (A 2, 2; G 1, 1), unconfirmed | 0 | 5 |
| A against TG | Diagnostic | none | 0 | 6 |

## Script counts and classification

Two readers classified every section-read script and every unknown or unparsed script on their
own: R1 (a Claude Opus 5.5 subagent) and R2 (a Claude Sonnet subagent). Neither reader wrote the
guard. They agree on all 139 scripts (A1 23, T1 15, G1 18 including one unparsed syntax-error
script with no skill read, TG1 17, TG2 12, G2 21, T2 16, A2 17). Where a result was clipped in the
reader input, the collector checked the full result (A2 `q-asset-trustline-basics` shows
`"[object Object]"`; G2 `q-stellar-recurring-payments` shows `"...LEN:0"` and `"security":""`).

| Collection | S | M map-key | M string-use | M absent `content` | M other | M total | L | E | F | R | U | D | X execute calls | X errors | K |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A1 | 23 | 0 | 2 | 0 | 0 | 2 | 1 | 0 | 0 | — | — | — | 37 | 2 | 0 |
| T1 | 15 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 34 | 0 | 0 |
| G1 | 17 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 33 | 2 | 0 |
| TG1 | 17 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 30 | 0 | 0 |
| TG2 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 33 | 0 | 0 |
| G2 | 21 | 0 | 2 | 2 | 0 | 4 | 2 | 1 | 0 | 1 | 0 | 4 | 36 | 2 | 0 |
| T2 | 16 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 33 | 0 | 0 |
| A2 | 17 | 0 | 2 | 0 | 0 | 2 | 2 | 0 | 0 | — | — | — | 38 | 1 | 0 |

The 8 misreads:

- A1 `q-defi-build-staking-for-own-token` [6]: `Object.values(…sections).join("\n")`, silent
  (`[object Object]`); later scripts in the row read the section correctly.
- A1 `q-passkey-smart-account-architecture` [4]: `.slice` on a section object; native `TypeError`
  (not a guard message), which also discarded the script's other results; [5] read it correctly.
- A2 `q-asset-trustline-basics` [2] (a control): `sections.toString().slice(…)`, silent.
- A2 `q-defi-build-staking-for-own-token` [5]: the same `join` misread, silent; the row ends
  without a correct read of that section.
- G2 `q-defi-build-staking-for-own-token` [4]: `Object.values(…)[0]` then `.split`; native
  `TypeError`; [7] read it correctly. The guard does not trap `.split`.
- G2 `q-pc-surge-griefing-threat-model` [5]: `sections.toString()`; **guard exception**; 4 docs
  calls in the same script lost; [6] read the section correctly (recovered).
- G2 `q-stellar-recurring-payments` [5] and [6]: `data.content` on a section read, silent (the
  guard does not trap absent `content`).

Q, script-error classes (direct read of each `execute` error):

| Collection | Errors |
| --- | --- |
| A1 | `.slice` on a section object (TypeError); `undefined` read of `hits` |
| G1 | syntax error in model code; unknown tool name `searchStablecoins` |
| G2 | `.split` on a section object (TypeError); section guard |
| A2 | `scout` used before initialization |
| T1, T2, TG1, TG2 | none |

K: no script in any collection called `codemode.describe` on a skill. The changed usage line was
not exercised.

## Text verdict (A against T): reading rules

| Rule | Result |
| --- | --- |
| 1 Completeness and grade coverage | Met: four complete collections, 64 of 64 grades. |
| 2 Arm integrity | Met: `guardMessages` 0 in A1, A2, T1, T2; T surface differs from A. |
| 3 Consistent change | None on the 16 rows. |
| 4 Rate claim defined | Met: S in T is 31 (at least 1, and at least half of 40). |
| 5 M in A ≥ 4 | Met: 4 (A1 2, A2 2). |
| 5 r in T ≤ half of r in A | Met: r(A) = 4/40 = 10.0%; r(T) = 0/31 = 0%. |
| 5 No new script-error class in both T collections | Met: T1 and T2 have no `execute` error. |
| 5 Zero confirmed consistent regressions | Met: the text list is empty. |
| 6 FAIL conditions | None holds. |
| 8 Confirmation re-judge and live check | Not needed: the text list is empty; T has no `wrong` grade. |
| 10 Noise floor | A1 vs A2: 0 grade disagreements, 2 and 2 misreads. T1 vs T2: 2 grade disagreements. |

**Proposed text verdict: PASS.**

Read avoidance and routing (plan-section-text "Counts"):

- V (S > 0 in both A collections and S = 0 in both T collections): 0 rows.
- S per arm: A 40, T 31. The difference comes from re-reads. In A, `q-defi-build-staking-for-own-token`
  (A1: 4 scripts, the first a misread), `q-pc-surge-griefing-threat-model` (A1: 4 scripts, with
  repeated `file:security.md` reads), `q-passkey-smart-account-architecture` (A1: a re-read after
  the `TypeError`; A2: two identical reads), and `q-scf-pitch-prep-live` (A2: three reads, two
  identical) read the same section more than once. In T, these rows read once and usually combine
  sections in one call.
- One row moves the other way: `q-defi-etherfuse-stablebonds` read `skills.stellar-dev.assets`
  sections in both T collections and in neither A collection. Its grades did not change (all 1).
- Every T section read used a correct form. The text names the array shape and the absent
  `content`; the observed A misreads (`join`, `toString`, `.slice` on a section) did not recur in T.

## Guard verdict (T against TG): reading rules

| Rule | Result |
| --- | --- |
| 1 Completeness | Met: T1, T2, TG1, TG2 complete; 64 of 64 grades. |
| 2 Arm integrity | Met: E = 0 in A1, A2, T1, T2. |
| 3 Consistent change | None on the 16 rows. |
| 4 E ≥ 1 across TG1 and TG2 | **Not met: E = 0.** |
| 4 F = 0 | Met. |
| 4 R > U | Not defined (no exception). |
| 4 L in TG ≤ L in T | Met (0 and 0). |
| 4 Consistent regressions | None. |
| 5 FAIL conditions | None holds. |
| 6 INDETERMINATE | Holds: E = 0 across C1 and C2 is a named example. |
| 7 and 8 Confirmation | Not needed: the guard list is empty. |
| 9 Noise floor | T1 vs T2: 2 grade disagreements. TG1 vs TG2: 6. |

**Proposed guard verdict: INDETERMINATE.** The guard did no harm in TG and had nothing to do:
TG made no misread in 29 section-read scripts. Under the merge order, the guard stays off `main`
for now. A later measurement would need a design in which misreads still occur with the text in
place, or a decision that the guard is not needed after the text.

## Diagnostics (do not decide a verdict)

**A against G.** E = 1 (G2 `q-pc-surge-griefing-threat-model`), F = 0, R = 1, U = 0, D = 4.
L: G 2 (G1 0, G2 2) against A 3 (A1 1, A2 2). M: G 4 (2 string use, 2 absent `content`) against A 4.
One consistent change: `q-defi-build-staking-for-own-token`, A 2, 2 against G 1, 1. The guard did
not fire on that row; its G2 misread threw a native `TypeError` (`.split`), and its G1 section
reads were all correct. The plan authorizes confirmation re-judges only for the deciding
comparison, so this change is unconfirmed. If A against G were deciding, rule 4 would allow at most
one confirmed regression on a row where the guard did not fire.

**A against TG.** No consistent change. M: TG 0 against A 4. E = 0.

**Mechanism note.** The guard caught 1 of the 4 G misreads. The other three were classes that the
guard does not trap by design (`.split` on a section object, and two absent-`content` reads).

## Spend

| Command | Cap (USD) | Spend (USD) |
| --- | ---: | ---: |
| A1 | 12 | 6.6985946 |
| T1 (refused first attempt) | 12 | 0 |
| T1 | 12 | 6.6318970 |
| G1 | 12 | 6.7421682 |
| TG1 | 12 | 5.8277914 |
| TG2 | 12 | 6.1198368 |
| G2 | 12 | 6.2686388 |
| T2 | 12 | 6.4095010 |
| A2 | 12 | 6.7411778 |
| Confirmation re-judges, retries, initial-judge retries, replacement | 40 (reserve) | 0 |
| **Total** | **136** | **51.4396056** |

No call was missing a cost. The highest single agent call was $0.5969282 (G2) and the highest
judge call $0.1330004 (A1). The per-collection mean ($6.43) is close to the primary estimate
($6.00), so the `p9` cost basis held.

## Artifacts

All under `/private/tmp/raven-section-screen/` (outside the repository). The runner worktree is
removed, so the result copies below are the retained artifacts.

| Collection | Result file | SHA-256 |
| --- | --- | --- |
| A1 | `results-A1.json` (from `2026-10-14T01-10-35-variantA.json`) | `17d1f4cd0d5605cb7da2efb25abf7c6841e3ab810b7d26cb3b5fef3f69c5f6a8` |
| T1 | `results-T1.json` (`2026-10-14T01-34-00`) | `8a7bf5f8b6ef8838575c745869e1233116bc2597949e00c6b8959092a9ab450f` |
| G1 | `results-G1.json` (`2026-10-14T01-56-15`) | `ae4af402f529f3c840569873667fb3185f08a6ba1183b42eee024d7b0f92ba61` |
| TG1 | `results-TG1.json` (`2026-10-14T02-19-56`) | `9cc09a0655e9ab2fe0b8fb25664c0c021dcee9f1d9b1d3afe431aa801c02ebf0` |
| TG2 | `results-TG2.json` (`2026-10-14T02-40-40`) | `a31c8c2d1d7b05222aca7bb1742be95e6f67c49967042f8000b5a236dd8b234a` |
| G2 | `results-G2.json` (`2026-10-14T03-01-29`) | `d3bf0d9a0501f7ad27cfcd1a363b3c8692bc25d9b5a482f22f5696cedf6ec739` |
| T2 | `results-T2.json` (`2026-10-14T03-23-46`) | `ab0d9cd6c7a8f2db4f9e14d98e6f24adefc2aea8a60e84bab0b850392b4289e2` |
| A2 | `results-A2.json` (`2026-10-14T03-47-01`) | `7af1632d6f850a09f0d21eba1d5e6f29939efe18afc825407f1d9d1c9ca6d810` |

Also: counter outputs `count-<label>.json`, run logs `<label>.out`, plan regrades
`plan-<label>.out`, surfaces `surface/`, server logs `server/`, reader inputs `read/<label>.md`,
and reader outputs `read/R1-*.json` and `read/R2-*.json`.

The claim stays narrow: a 16-row MCP screen with `claude-sonnet-5`, two collections per arm, and
judge pack `p9`. The misread counts are small (4 in A), so the text result is a direction with a
small sample, not a rate estimate.
