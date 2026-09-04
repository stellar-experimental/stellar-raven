# Coverage metric fix

Date: 2026-09-04
Lane: Claude, Fable 5.1, `xhigh`
Branch: `codex/tm-coverage-metric` in worktree `/private/tmp/stellar-raven-tm-coverage-metric`
Base commit: `80aaf52`

## Scope

The candidate arm reported `meanContinuousCoverage` of `0.5601952380952382`.
That is the invalid `56.0195%` mean.
Forty-nine rows carried a negative coverage value.
This lane repairs the metric definition in the runner.
It does not touch the paid artifact, the judge prompt, the panel logic, or the paired printer.

## Root cause

`qaMeasurementMetrics` computed `1 - missingFacts.length / keyFacts.length` for each graded row.
`verdict.missingFacts` is judge prose.
It is not an index into `golden.keyFacts`.
One judge can write several entries for one key fact.
One judge can write one entry for several key facts.
The rubric also asks for a missing corrective distinction or a missing required trap behavior.
Neither is a key fact.

`judgeCasePanel` unions the `missingFacts` strings of every vote.
The union removes byte-identical strings only.
Three judges write three paraphrases of the same miss.
The count then exceeds the key-fact count and the row value goes negative.

Example: `q-jutsu-what-is-a-memo` has two key facts.
The three-vote panel union holds three strings.
All three describe the same missing instruction about the supplied memo type and value.
The stored row value was `-0.5`.
Even a deduplicated count would not map those strings to key facts.

The stored artifact keeps one aggregated verdict per row.
`rows[].attempts.judge` has one entry and `judgeCalls` is empty.
Nobody can rebuild per-vote lists from this artifact.

## Evidence

| Item | Value |
| --- | --- |
| Artifact | `/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json` |
| Artifact SHA-256 | `e629666bf476244d350840069094a8a579757724c101830d6d6727685b5904f7` |
| Runner revision | `65d2f98dd80305e9a2b9000c46e9a91ba0557cbc` |
| Results schema | `qa-agent-result-v4` |
| Rubric / pack / panel policy | `v2.10` / `p6` / `stability-boundary-v1`, cap 34 |
| `summary.overall` | 199 correct / 230 partial / 71 wrong / 0 error / 500 |
| `halfCreditShare` | `0.628` |
| `strictCorrectShare` | `0.398` |
| `coreAnswerCorrectShare` | `0.926` over 500 graded rows, 0 null |
| `meanContinuousCoverage` | `0.5601952380952382` over 500 rows |
| Rows with a negative value | 49 |
| Rows with `missingFacts.length > keyFacts.length` | 49, the same rows |
| Panel rows | 145 of 500 |
| Negative rows on panels | 49 of 145 |
| Single-vote rows over the key-fact count | 0 of 355 |
| Sum of the 49 negative row values | `-32.67` |

The 451 in-range rows are not valid either.
The formula has no defensible mapping for them.
The ordinal shares and the core-answer share do not use `missingFacts`.
They stay truthful.

## Affected rows

All 49 rows used a three-vote panel.
Escalation reasons: 38 `unstable-register`, 5 `boundary-partial`, 4 `boundary-wrong-claim`,
2 `boundary-trap`.
Scores: 34 `partial`, 15 `wrong`.

| Case ID | Score | Key facts | Unioned missing facts | Stored row value |
| --- | --- | ---: | ---: | ---: |
| `q-anchor-platform-what` | partial | 5 | 8 | -0.6000 |
| `q-asset-wallet-sdk-seps` | partial | 2 | 3 | -0.5000 |
| `q-builder-content-by-person` | partial | 4 | 13 | -2.2500 |
| `q-defi-agent-identity-stellar-experimental` | wrong | 4 | 6 | -0.5000 |
| `q-defi-arbitrage-pathpayment-bots` | partial | 5 | 6 | -0.2000 |
| `q-defi-defindex-honest` | wrong | 2 | 5 | -1.5000 |
| `q-defi-flash-loans` | wrong | 5 | 6 | -0.2000 |
| `q-defi-lumenloop-categories-vocab` | wrong | 2 | 3 | -0.5000 |
| `q-defi-rwa-scf-similar` | partial | 5 | 7 | -0.4000 |
| `q-defi-sdex-offer-lifecycle` | wrong | 5 | 11 | -1.2000 |
| `q-defi-skill-project-dossier` | partial | 2 | 3 | -0.5000 |
| `q-defi-streaming-payments-prior-art` | partial | 2 | 8 | -3.0000 |
| `q-eco-stellar-rwa-stablecoin-volume` | partial | 5 | 6 | -0.2000 |
| `q-edge-asset-site-scam-detection` | partial | 4 | 5 | -0.2500 |
| `q-edge-fresh-latest-protocol-version` | partial | 4 | 5 | -0.2500 |
| `q-edge-oos-bitcoin-price-prediction` | wrong | 2 | 3 | -0.5000 |
| `q-edge-oos-solana-vs-aptos` | wrong | 2 | 3 | -0.5000 |
| `q-gap-builders-person-empty` | partial | 2 | 3 | -0.5000 |
| `q-gap-contracts-domain-empty` | wrong | 5 | 6 | -0.2000 |
| `q-gap-digest-defi-adjacent` | partial | 2 | 3 | -0.5000 |
| `q-gap-scout-changelog-envelope` | partial | 2 | 3 | -0.5000 |
| `q-gap-scout-get-skill-detail` | partial | 2 | 3 | -0.5000 |
| `q-gap-scout-status-envelope` | partial | 2 | 3 | -0.5000 |
| `q-gap-vet-pitch-vertical-null` | partial | 4 | 6 | -0.5000 |
| `q-infra-secp256r1-passkeys` | wrong | 5 | 9 | -0.8000 |
| `q-infra-which-indexer` | wrong | 3 | 4 | -0.3333 |
| `q-jutsu-what-is-a-memo` | partial | 2 | 3 | -0.5000 |
| `q-org-mazieres-chief-scientist` | partial | 3 | 4 | -0.3333 |
| `q-protocol-24-whisk-incident` | partial | 5 | 6 | -0.2000 |
| `q-protocol-27-cap-0071` | partial | 4 | 6 | -0.5000 |
| `q-protocol-ledger-close-time` | wrong | 2 | 6 | -2.0000 |
| `q-raph-offramp-xlm-usdc` | partial | 2 | 3 | -0.5000 |
| `q-scf-current-hackathons-compare-live` | partial | 3 | 4 | -0.3333 |
| `q-scf-rfps-hackathons-live` | partial | 5 | 8 | -0.6000 |
| `q-scf-v7-changes` | wrong | 3 | 4 | -0.3333 |
| `q-sep-12-kyc` | partial | 5 | 9 | -0.8000 |
| `q-sep6-sep24-sep31-choice` | partial | 5 | 9 | -0.8000 |
| `q-sor-sep41-transfer-vs-transferfrom` | partial | 3 | 6 | -1.0000 |
| `q-soroban-auth-recursion-dos-audit` | partial | 4 | 5 | -0.2500 |
| `q-soroban-cli-bindings` | wrong | 4 | 7 | -0.7500 |
| `q-soroban-storage-types` | partial | 5 | 6 | -0.2000 |
| `q-ti-connect-wallet-button-code` | partial | 5 | 6 | -0.2000 |
| `q-ti-custodial-account-generation-c-address` | partial | 5 | 10 | -1.0000 |
| `q-ti-explain-repo-payload-status` | partial | 3 | 5 | -0.6667 |
| `q-ti-rpc-gettransactions-pagination-xdr` | partial | 5 | 15 | -2.0000 |
| `q-ti-stellar-lab-usage-and-new-ui` | wrong | 6 | 10 | -0.6667 |
| `q-token-circle-usdc-on-stellar` | wrong | 4 | 5 | -0.2500 |
| `q-tool-passkeykit-smart-wallet` | partial | 5 | 7 | -0.4000 |
| `q-tool-soroban-auth-audit-live` | partial | 4 | 8 | -1.0000 |

## Design decision

I considered four repairs.

1. **Retire the share.** Remove `meanContinuousCoverage` and `continuousCoverageRowCount`.
   Keep the ordinal and core-answer shares. **Chosen.**
2. **Map prose to key facts.** Fuzzy or model-based matching. Rejected. The task forbids it and
   it would invent evidence.
3. **Clamp to `[0, 1]`.** Rejected. A clamp hides the defect and keeps an invalid number.
4. **Count per-vote instead of the union.** Rejected. The artifact stores no per-vote list, and a
   single judge's prose count is still not a key-fact index.

Option 1 is the narrowest forward-only repair.
The ordinal shares `halfCreditShare` and `strictCorrectShare` stay unchanged.
The core-answer share, its null count, and its denominator stay unchanged.
The console line and `meta` no longer carry a coverage value.
`judgeCasePanel` still unions `missingFacts` as diagnostic text for humans and for
`cluster-missing-facts.mjs`.

## Compatibility decision

`AGENT_RESULT_SCHEMA` stays `qa-agent-result-v4`.
That schema names the stored row failure and usage shape.
The row shape did not change.
A bump would refuse `--judge-stored` and the paired printer on every current artifact.

Stored artifacts that carry the two retired keys stay readable.
No current reader consumes them.
`paired-verdict.mjs`, `compare-architecture-ab.mjs`, `re-judge.mjs`, `judge-stability.mjs`,
`cluster-missing-facts.mjs`, and `eval/plan/grade-plan.mjs` read rows, tuples, or verdicts only.
A new test proves the paired printer accepts an asymmetric pair where one arm carries the keys.

I added no key-deletion shim for old artifacts.
The stored-judge path clears only the keys it currently owns.
A finalized artifact with the retired keys is never rewritten, because `--judge-stored` refuses a
fully judged file.
One inert residual remains and is listed under risks.

I did not rewrite dated records.
`eval/qa/README.md` tables dated 2026-08-28 and 2026-08-30, the 2026-08-25 round ledger, and
`research/qa-deep-dive-2026-08-25/build-measure.md` still show coverage values.
The new README section says to read them as invalid.

## Changes

| File | Change |
| --- | --- |
| `eval/qa/run-qa.mjs` | `qaMeasurementMetrics(rows)` drops the case parameter and the two coverage keys. `formatMeasurementMetrics` drops the coverage segment. Four callers updated. A doc comment records why no coverage share exists. |
| `eval/qa/README.md` | New `### Measurement shares` section with the five fields, their denominators, the retirement, and the reading rule for dated records. |
| `test/qa-measure-harness.test.mjs` | Rewrites the metrics tests. Adds a panel-union case that reproduces the `-0.5` shape, a duplicated-paraphrase case, an over-count single-judge case, empty-denominator cases, and a key-set guard that every share lies in `[0, 1]` and no coverage text is printed. |
| `test/qa-judge-stored.test.mjs` | Stored `meta` asserts the five fields and the absence of both retired keys. The crash-suppression check now uses a live field. |
| `test/qa-paired-verdict.test.mjs` | Proves an artifact with the retired keys still compares and the keys are outside the measurement tuple. |

## Commands

| Command | Result |
| --- | --- |
| `npm ci` | exit 0 |
| `printf '…' > .dev.vars` then `npm run typegen` | exit 0, generated `env.d.ts` (both gitignored) |
| `npx vitest run test/qa-measure-harness.test.mjs test/qa-judge-stored.test.mjs test/qa-paired-verdict.test.mjs test/qa-harness-preconditions.test.mjs` | 4 files, 191 tests passed |
| `npm run typecheck` | exit 0 |
| `npm test` | 103 files, 1776 tests passed, exit 0 |
| `npm run build` | exit 0, `--dry-run: exiting now.` |
| `npm run secrets:scan -- --tree` | exit 0, `secret-scan: clean (+ gitleaks)` |

Row counts above came from one Node script over the artifact and `eval/qa/cases.json`.
No paid call ran.

## Risks

- **QA implementation hash moves.** `sourceIdentity.qaImplementationSha256` hashes every
  `eval/qa/*.mjs` file. This commit changes it. The paired printer requires an identical
  `qaImplementationSha256` on both arms. The candidate arm was collected at runner revision
  `65d2f98`. Collect the baseline arm from that same runner revision. Do not advance the runner
  worktree to this commit between the two arms.
- **Stale keys in the candidate `meta`.** The variantA artifact still carries
  `meanContinuousCoverage: 0.5601952380952382`. The value is invalid. The paired printer ignores
  it. Any human summary of that arm must omit it.
- **Inert residual.** A `--no-judge` artifact collected by the old runner carries
  `meanContinuousCoverage: null` and `continuousCoverageRowCount: 0`. The new stored-judge path
  leaves those two keys in place. They hold no number.
- **Other prose counts.** `boundaryEscalationReason` uses `missingFacts.length <= 1` on a single
  vote to pick the `boundary-partial` tier. `judge-stability.mjs` records
  `partialMissingFactCounts`. Both read one vote's prose list. Neither is a reported share. They
  are unchanged and remain a tiering heuristic with the same prose-count weakness.
- **Dated records.** Historical tables still print coverage values. The README now labels them
  invalid. Nobody should compare them.

## Blockers

None.
