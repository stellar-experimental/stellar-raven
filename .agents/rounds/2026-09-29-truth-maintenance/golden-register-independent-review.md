# Independent golden and register review

Reviewed 2026-09-29 at 19:46–19:49Z. This review covers two owned case edits and five reopened register entries. I did not edit the corpus or register.

## Case diff verdict

| Case | Exact comparison with `HEAD` | Verdict |
| --- | --- | --- |
| `q-protocol-base-reserve-min-balance` | `question`, `golden.answer`, `golden.keyFacts`, `golden.avoid`, `tags.freshness`, `truth.asOf`, and `truth.reverifyBy` are byte-equivalent after JSON parsing. The judge-facing `golden.notes` removes only the expired canonical-page caution. | Supported. |
| `q-pc-sponsored-reserves` | The same fields and `golden.notes` are unchanged. Only one judge-blind `truth.verified.evidence` sentence changes. | Supported. |

The base-reserve case keeps `truth.asOf: 2026-07-11` and `truth.reverifyBy: 2026-11-05`. Its answer dates the 0.5 XLM value to Mainnet ledger `63426130`. I fetched that ledger at 19:48Z. It closed at `2026-07-11T08:32:55Z` with `base_reserve_in_stroops: 5000000`. The latest ledger then was `64685103`, closed at `2026-09-29T19:48:16Z`, with the same reserve. The dated golden claim remains valid.

The new `truth.verified.rootCause` cites immutable Raven commit `8ab7b88f95177022cd24c0d0acb6e619b19ea23c`. I read `improvements/stellar-docs/sd-046-pool-share-trustline-reserve-conflict.md` at that commit. It contains the original `sd-046` source record. The edit removes the active finding path from the case. This is the correct resolver form.

The two-reserve corroboration row now uses live Docs pages, commit-pinned Core, CAP-0038, and the indexed-section review. The A and B classes independently support the numeric claim. The E class shows discoverability. My separate [source review](docs-independent-review.md) records the live page and adapter checks. The case keeps the one-reserve avoid rule because that claim remains false.

## Reopened cluster review

I read every member's answer, key facts, and avoid rules. I compared the two edited files with `HEAD`. Other member files are unchanged. I checked all member hashes against the stamped register. All hashes match. `node eval/qa/register-helper.mjs --check` returned `up to date`.

| Entry | Members checked | Independent consistency result |
| --- | --- | --- |
| `cluster-017` | All 15 members. | The dated 0.5 XLM reserve and 1 XLM empty unsponsored minimum agree with the fee, trustline, sponsorship, and account-creation cases. The other members keep separate claims about path payments, AMM fees, ledger cadence, fee-pool accounting, Soroban fees, and monetary history. No new numeric conflict appears. |
| `cluster-054` | `q-edge-1xlm-activation-fee`, `q-pc-account-activation-not-found`, `q-pc-account-merge-reclaim-reserve`, `q-pc-sponsored-reserves`. | An unfunded keypair is not a ledger account. Unsponsored creation needs the dated 1 XLM minimum. Sponsorship can shift that obligation and permit zero-balance creation. AccountMerge still requires non-signer state and provided sponsorship to be cleared. |
| `cluster-114` | `q-asset-amm-fee-reserve`, `q-pc-account-activation-not-found`, and the two edited cases. | The full sponsorship formula excludes selling liabilities. Available balance subtracts them separately. Sponsored creation can start at zero. A pool-share trustline costs two reserves. |
| `cluster-123` | `q-asset-amm-fee-reserve`, `q-asset-trustline-basics`, `q-edge-1xlm-activation-fee`, `q-pc-account-activation-not-found`, `q-protocol-base-reserve-min-balance`, `q-raph-low-xlm-transfer-fail`. | Ordinary trustlines cost one reserve. Pool-share trustlines cost two. The XLM figures match the observed reserve setting. Reserve release and AccountMerge remain conditional. |

Each cluster supports `verdict: consistent` and `lastChecked: 2026-09-29`. The accompanying [`golden-register-review.json`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-29-truth-maintenance/golden-register-review.json) has the supported `--review` fields. `applyRegisterReview` accepts it on an in-memory copy. Its `clearReopened: true` fields are valid because each cluster is currently reopened.

The sibling `q-asset-trustline-basics` quotes 0.5 XLM and 1.0 XLM without an answer-visible date. `q-asset-amm-fee-reserve` also puts 1.0 XLM in a key fact without a date. These texts predate this diff. Their current values agree with the live reserve setting. They remain freshness debt under `golden-truth`; this consistency review does not certify that debt as fixed.

## Exact numeric invariant attestation

The `base reserve` numeric invariant has four affected cases. I read `q-asset-trustline-basics`, `q-edge-1xlm-activation-fee`, `q-protocol-base-reserve-min-balance`, and `q-raph-low-xlm-transfer-fail`. They agree on the as-of verified 0.5 XLM base reserve and 1 XLM empty unsponsored minimum. The sponsorship-aware formula and two-reserve pool-share exception qualify simple statements. The case edit changes no numeric answer, key fact, avoid rule, `asOf`, or `reverifyBy`. The live Horizon read above confirms the pinned ledger value. The four member hashes match the register.

`register-helper.mjs --review` accepts only `clusters` and `dateContingentTraps`. It cannot apply a numeric-invariant review. The register owner must manually set the `base reserve` entry to `verdict: "consistent"` and `lastChecked: "2026-09-29"`. Set `reSwept` to this exact attestation:

```json
{
  "date": "2026-09-29",
  "reason": "Independent 2026-09-29 review: re-read all four affected cases. The as-of verified 0.5 XLM base reserve, 1 XLM empty unsponsored minimum, sponsorship-aware formula, and two-reserve pool-share exception remain consistent. Mainnet ledger 63426130 returned 5000000 stroops per base reserve. The changed case removed only the expired canonical-page caution and refreshed source provenance; answer, key facts, avoid rules, asOf, and reverifyBy stayed unchanged. Pre-existing undated sibling amounts remain freshness debt. Evidence: .agents/rounds/2026-09-29-truth-maintenance/golden-register-independent-review.md.",
  "verdict": "consistent"
}
```

Delete the entry's `reopened` marker. Keep its stamped member hashes, authoritative value, accepted spellings, and `datePolicy` unchanged. Run `node eval/qa/register-helper.mjs --check` after the register owner applies the review.

## Evidence and commands

- `git diff --` the two owned cases and `eval/qa/consistency-register.json`.
- `git show 8ab7b88f95177022cd24c0d0acb6e619b19ea23c:improvements/stellar-docs/sd-046-pool-share-trustline-reserve-conflict.md`.
- `node eval/qa/register-helper.mjs --check` → `up to date`.
- Node `fetch` of `https://horizon.stellar.org/ledgers/63426130` and `https://horizon.stellar.org/ledgers?order=desc&limit=1`, at 19:48Z.
- Node SHA-256 comparison of all five entries' member files with `memberContentSha256` → no mismatches.
