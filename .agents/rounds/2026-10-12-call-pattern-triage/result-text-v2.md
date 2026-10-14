# Section-shape text — measurement result v2 (`main` `0a60d98a`)

Plans: [`plan-section-text.md`](plan-section-text.md) (reading rules) and the one-change fallback
of [`plan-section-guard.md`](plan-section-guard.md) (A1, T1, T2, A2; shared commands, pins, and
confirmation steps 1 to 4). Amendments: launch amendment 3, spend authorization 2, and the
predeclared slot conditions in the [triage ledger](../2026-10-12-call-pattern-triage.md)
("Re-measurement on the new `main`"). Collector: lane T2 (Claude Opus 5.5, high).
Collection: 2026-10-14, 04:42Z to 06:16Z. The orchestrator runs the post-run review.

The first text result ([result-screen.md](result-screen.md)) is PASS on `f7b1b775`, with a
re-measure required because #271 changed the model input. This run measures the text alone on
`main` `0a60d98a` (#271 included). No guard arm.

## Proposed verdict: PASS

| Condition (text rule 5) | Result |
| --- | --- |
| M in A (A1 plus A2) ≥ 4 | Met: 6 (A1 2, A2 4) |
| Rate claim defined (rule 4) | Met: S in T is 35 (≥ 1, and ≥ half of 38) |
| r in T ≤ half of r in A | Met: r(A) = 6/38 = 15.8%; r(T) = 0/35 = 0% |
| No script-error class in both T collections and in neither A collection | Met: T2 has no `execute` error; the one T1 class also occurs in A1 |
| Zero confirmed consistent regressions on the 16 rows | Met: no consistent regression |

- No rule 6 FAIL condition holds.
- One consistent **improvement** (`q-defi-build-staking-for-own-token`, A 1, 1 against T 2, 2)
  went to the K1 and K2 re-judges. The re-judge did not reproduce it (A1 `partial` → `partial`;
  T1 `correct` → `partial`). It is judge variance and counts as no change (rule 9).
- Robustness (not a rule input): two A misreads are borderline shape probes (A1
  `q-edge-noinfo-sep-9999` `Object.keys(…sections)`; A2 `q-stellar-recurring-payments`
  `Object.entries(…sections)` lengths). Both readers count them. Without both, M in A is 4 (still
  the floor), and every rule 5 condition still holds.
- The result agrees with the `f7b1b775` screen (A 4 in 40, T 0 in 31). Read it as a small-sample
  direction: 6 misreads in A.

## Arms, pins, and environment

| Arm | Commit | Tree | Surface SHA-256 (`report-live-surface`) | `execute` description |
| --- | --- | --- | --- | ---: |
| A (`main`) | `0a60d98a48e3bc0c7076961e33991aee2c7375d8` | `488e1aeb…` | `8c2e4dfc3c074fc918223922f10529e980f4414d4b07b5799d0c4011188ad4ad` | 10,367 |
| T | `badbda8a045620b64df626e82e8ff2cce579f479` | `eb1a91e2…` | `0026761dfe97bbe58c795fd1c9d374dac6125a800c0c27c54f583282a6b3b740` | 10,572 |

- T differs from A by the text commit only (changed lines equal the reviewed diff; launch
  amendment 3). The T surface differs from the A surface at every start. The source revision pin
  passed at every start and in each artifact (`sourceRevisionPin`, before and after).
- Answer and judge: `claude-sonnet-5` (runner defaults). Rubric `v2.11`, pack `p9` in all four
  collections (from `meta` and every row verdict).
- In all four: cases SHA-256 `5872d7527c914fbd2a862e1ec6499659460c2ffe58fc804b4f7fab646f08fe83`,
  agent binary `ba5ab7b8…` (Claude Code `2.1.299`), agent environment `ab375f52…`, remote identity
  probe `eb06cd89…` and vector `414667aa…`, stability register `5b5c16ae…`, counter `2a99d514…`
  (self-check 23 of 23 before each count). `sourceIdentityGuard` and `serverProcessGuard` match.
- The runner worktree stayed at `0a60d98a`, clean.

## Schedule and slot checks

| Order | Collection | Server start | Pre-start gate (UTC; raven, listener, load1, total for information) | Window (UTC) |
| --- | --- | --- | --- | --- |
| 1 | A1 | A-1 | 04:42:21; 0, 0, 6.56, 22 | 04:42:37–05:04:29 |
| 2 | T1 | T-1 | 05:05:27; 0, 0, 3.81, 10 | 05:05:43–05:29:14 |
| 3 | T2 | (same T-1 start) | — | 05:29:38–05:54:16 |
| 4 | A2 | A-2 | 05:54:43; 0, 0, 3.33, 5 | 05:54:56–06:16:02 |

- T1 and T2 shared one T server start, as TG1 and TG2 did in the screen.
- Contention check (slot condition 3): 0 rows in every collection. Limit: max(A1, A2) + 1 = 1. Every
  `execute` error is a model error (listed under "Q").

## Completeness and grade coverage

| Collection | Rows | `comparable` | Aggregates suppressed | Calls reported | Missing costs | Judge calls | Spend (USD) | Agent (USD) | Judge (USD) |
| --- | ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| A1 | 16 | true | no | 42/42 | 0 | 26 | 6.8097870 | 5.0301764 | 1.7796106 |
| T1 | 16 | true | no | 40/40 | 0 | 24 | 7.0359366 | 5.2944276 | 1.7415090 |
| T2 | 16 | true | no | 42/42 | 0 | 26 | 6.5992428 | 4.8054446 | 1.7937982 |
| A2 | 16 | true | no | 42/42 | 0 | 26 | 6.4597222 | 4.7089832 | 1.7507390 |

- 64 of 64 cells have a grade (`graded-*`). No `agent-limit`, no `judge-*`, no other missing class.
  No initial-judge retry and no replacement ran.
- `npm run eval:plan`: 16 of 16 required covered in every collection; mean on-plan ratio 0.93
  (A1), 0.93 (T1), 0.95 (T2), 0.95 (A2).

## Grades (2 correct, 1 partial, 0 wrong)

| Row | A1 | T1 | T2 | A2 | Change |
| --- | ---: | ---: | ---: | ---: | --- |
| `q-aas-burn-clawback-redemption-mechanics` | 2 | 2 | 2 | 2 | |
| `q-aas-list-token-on-exchanges-aggregators` | 1 | 1 | 2 | 2 | |
| `q-agent-identity-erc8004-stellar` | 1 | 1 | 1 | 1 | |
| `q-asset-trustline-basics` (control) | 1 | 2 | 2 | 2 | |
| `q-defi-build-staking-for-own-token` | 1 | 2 | 2 | 1 | Consistent improvement; not reproduced by K1/K2 (no change) |
| `q-defi-etherfuse-stablebonds` | 1 | 1 | 1 | 1 | |
| `q-edge-ambig-stellar-token-meaning` (control) | 2 | 2 | 2 | 2 | |
| `q-edge-noinfo-sep-9999` | 2 | 2 | 2 | 2 | |
| `q-jutsu-check-account-history` | 2 | 1 | 1 | 1 | |
| `q-passkey-smart-account-architecture` | 1 | 1 | 1 | 1 | |
| `q-pc-address-types-strkey` | 1 | 1 | 1 | 1 | |
| `q-pc-surge-griefing-threat-model` | 1 | 0 | 1 | 1 | |
| `q-scf-pitch-prep-live` | 1 | 1 | 1 | 1 | |
| `q-soroban-cross-contract-call` | 1 | 2 | 1 | 1 | |
| `q-soroban-fuzz-testing` (control) | 2 | 2 | 2 | 2 | |
| `q-stellar-recurring-payments` | 1 | 1 | 1 | 1 | |

- Consistent regressions (both T grades below both A grades): none.
- `q-jutsu-check-account-history` (A 2, 1; T 1, 1) is not consistent: T equals A2.
- Noise floor (rule 10): A1 against A2, 3 grade disagreements; T1 against T2, 3. A1 and A2 misread
  counts: 2 and 4.

## Script counts and classification

Two readers classified every section-read script on their own: R1 (a Claude Opus 5.5 subagent)
and R2 (a Claude Sonnet subagent), from the same reader inputs (`read/<label>.md`; the prompt
`read/READER-PROMPT.md`, the lane T prompt with the arm list changed). They agree on 72 of 73
scripts in every field. One class differed: A1 `q-edge-noinfo-sep-9999` [3], R1 `map-key`, R2
`other`. Both call it a silent misread. The code returns `Object.keys(skill.data.sections || {})`,
which treats the array as keyed by section name; the result is `["0","1","2"]`. The collector
reconciled it to `map-key`. The counter found no unknown or unparsed skill-read script.

| Collection | S | M map-key | M string-use | M absent `content` | M other | M total | L | E | X execute calls | X errors | K |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A1 | 18 | 2 | 0 | 0 | 0 | 2 | 2 | 0 | 39 | 1 | 0 |
| T1 | 21 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 37 | 1 | 0 |
| T2 | 14 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 35 | 0 | 0 |
| A2 | 20 | 0 | 4 | 0 | 0 | 4 | 3 | 0 | 39 | 2 | 0 |
| **A** | **38** | **2** | **4** | **0** | **0** | **6** | **5** | **0** | 78 | 3 | 0 |
| **T** | **35** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | 72 | 1 | 0 |

The 6 misreads (all in A):

- A1 `q-defi-build-staking-for-own-token` [4]: `dev.sections["file:development.md"] || ""`, silent
  (`"devSnippet":""`); [5] and [6] read the section correctly.
- A1 `q-edge-noinfo-sep-9999` [3]: `Object.keys(skill.data.sections || {})`, silent (index keys,
  no names or text); no later read in the row.
- A2 `q-defi-build-staking-for-own-token` [4]: `(…sections || …).toString().slice(0, 3000)`, silent
  (`[object Object],…`).
- A2 `q-passkey-smart-account-architecture` [4]: `(v || "").slice` on a section object; native
  `TypeError`, which also discarded 3 docs calls; [5] read the section correctly.
- A2 `q-pc-surge-griefing-threat-model` [5]: `Object.values(…sections).join("\n")`, silent
  (`[object Object]`); [6] and [7] read it correctly.
- A2 `q-stellar-recurring-payments` [4]: `Object.entries(…sections).map(([k, v]) => [k, (v || "").length])`,
  silent (`{}`); [5] and [6] read it correctly.

Q, script-error classes (direct read of each `execute` error):

| Collection | Errors |
| --- | --- |
| A1 | `scout` used before initialization (`q-scf-pitch-prep-live`) |
| T1 | `scout` used before initialization (`q-scf-pitch-prep-live`); the same class as A1 |
| T2 | none (one host `[invalid-args: path]` refusal on a docs call, `q-edge-ambig-stellar-token-meaning`; not an `execute` error) |
| A2 | undefined `repo` read (`q-agent-identity-erc8004-stellar`); `.slice` on a section object (`q-passkey-smart-account-architecture`, a misread) |

K: one A1 script called `codemode.describe("scout.scfPitch")`, an operation, not a sectioned skill.
No script called `codemode.describe` on a sectioned skill, so K = 0 in every collection. The changed
usage line was not exercised (as on `f7b1b775`).

Read avoidance and routing (S differs: A 38, T 35):

- V (S > 0 in both A collections and S = 0 in both T collections): 0 rows.
- The extra A reads are re-reads after a misread or of the same section: A1 staking (3 reads, the
  first a map-key misread), A2 surge-griefing (3, the first a `join` misread), A2 recurring-payments
  (3, the first a misread), A2 passkey (2, after the `TypeError`), and repeat reads in A2
  `q-edge-ambig-stellar-token-meaning` and `q-jutsu-check-account-history`.
- T reads where A did not: `q-agent-identity-erc8004-stellar` (T1, T2:
  `skills.stellar-dev.agentic-payments`), `q-defi-etherfuse-stablebonds` (T1:
  `skills.lumenloop.stellar-ecosystem-scout`), `q-pc-address-types-strkey` (T1:
  `skills.stellar-dev.standards`). Each was a correct read. Their grades did not change.
- Per-row section reads, A against T (both collections): fewer in T on trustline (2, 1), staking
  (5, 4), edge-ambig (3, 2), jutsu (3, 2), passkey (3, 2), surge-griefing (4, 2), and
  recurring-payments (5, 3); more in T on agent-identity (0, 2), etherfuse (0, 1), strkey (0, 1),
  scf-pitch (4, 5), and fuzz-testing (2, 3); equal on the other four rows. The skills per row are
  otherwise the same in both arms.
- Every T section read used a correct form. The A misread forms (`join`, `toString`, `.slice` on a
  section, map access, `Object.keys` or `Object.entries` on the array) did not occur in T.

## Reading rules

| Rule | Result |
| --- | --- |
| 1 Completeness and grade coverage | Met: four complete collections, 64 of 64 grades. |
| 2 Arm integrity | Met: `guardMessages` 0 in A1, A2, T1, T2; the T surface differs from A. |
| 3 Consistent change | One improvement (staking); no regression. |
| 4 Rate claim defined | Met: S in T 35 ≥ 19. |
| 5 PASS conditions | All met (table above). |
| 6 FAIL conditions | None holds. |
| 8 Confirmation re-judge | List written in the ledger before spend (commit `bd81e30f`). K1 (A1): `partial` → `partial`. K2 (T1): `correct` → `partial`. Not reproduced: judge variance. |
| 8 Live check of every graded T `wrong` | One cell, checked at 2026-10-14T06:19Z (below). No factual error. |
| 9 Failed confirmation re-judge | Not needed: K1 and K2 returned valid grades. K1r and K2r did not run. |
| 10 Noise floor | A1 vs A2: 3 grade disagreements, 2 and 4 misreads. T1 vs T2: 3. |

Live check: T1 `q-pc-surge-griefing-threat-model` `wrong`. The judge cites must-avoid 1 (the abuse
section gives operational attack steps, against the golden's "Do not give a step-by-step spam
playbook") and three missing defenses. It lists no wrong claim. The live official pages confirm the
answer's facts: a 100-stroop minimum per operation, surge pricing above 1,000 non-contract
operations per ledger, the lowest winning inclusion fee paid by all included transactions, the
1,000x write-fee factor above `BucketListTargetSizeBytes`
(`developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering`), and the 10x
replace-by-fee rule "to limit DOS attacks" (`…/build/guides/transactions/fee-bump-transactions`).
T2 got `partial` on the same row, and both A cells are `partial`, so it is not a consistent change.

## Spend

| Command | Cap (USD) | Spend (USD) |
| --- | ---: | ---: |
| A1 | 12 | 6.8097870 |
| T1 | 12 | 7.0359366 |
| T2 | 12 | 6.5992428 |
| A2 | 12 | 6.4597222 |
| K1 (A1, staking) | 3 | 0.0715162 |
| K2 (T1, staking) | 3 | 0.0687684 |
| K1r, K2r, initial-judge retries, replacement | 4 + 4 + 12 (reserve) | 0 |
| **Total** | **74** | **27.0449732** |

Decimal sums of `budget.calls[].costUsd`. No call was missing a cost. The highest agent call was
$0.6801362 (T1) and the highest judge call $0.1158984 (T2). The mean collection ($6.73) is close to
the `f7b1b775` mean ($6.43), so the cost basis held.

## Artifacts

All under `/private/tmp/raven-section-text-v2/` (outside the repository).

| Item | File | SHA-256 |
| --- | --- | --- |
| A1 | `results-A1.json` (from `2026-10-14T05-04-29-variantA.json`) | `f3dd5fbfcf4a34b3d213461c6b8b7d38bac7db91744be4e1218f3f60cb36f28f` |
| T1 | `results-T1.json` (`2026-10-14T05-29-14`) | `9049eeaf6a021f31d17a2bf3ce318138b12df991d3d0ac1d008a63272347871f` |
| T2 | `results-T2.json` (`2026-10-14T05-54-16`) | `b545522b626029a5abbbf6a62c4941934110a60de125e4ae1d53a6a04da5c65e` |
| A2 | `results-A2.json` (`2026-10-14T06-16-02`) | `7ae056bbf29e5274411e6319e05521015871cee4312b96acf8cf9e8508310b3e` |
| K1 | `rejudge-K1.json` (source `results-A1.json`) | `4aa5e9a04d0ce5ab7f3f5d6297e5bb793cfec92e3a2e5ca0c0569e33b276f6a5` |
| K2 | `rejudge-K2.json` (source `results-T1.json`) | `449ff36224974366fc995217c83eb75ad7fbf6dd05f13797808d172cbbf0df00` |

Also: counter outputs `count-<label>.json`, run logs `<label>.out` and `K1.out`, `K2.out`, plan
regrades `plan-<label>.out`, surfaces `surface/`, server logs `server/`, gate receipts
`start-<start>.txt`, reader inputs `read/<label>.md`, and reader outputs `read/R1-*.json` and
`read/R2-*.json`.

The claim stays narrow: a 16-row MCP screen with `claude-sonnet-5`, two collections per arm, judge
pack `p9`, on `0a60d98a`. The misread counts are small (6 in A), so the result is a direction, not a
rate estimate.
