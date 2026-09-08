# Improvements follow-up: merged Stellar Docs fixes

Date: 2026-09-08

## Scope

Re-check `sd-042`, `sd-043`, and `sd-047` after `stellar/stellar-docs#2806` merged.
Update affected golden guidance, verify all lifecycle gates, and resolve only fully deployed fixes.

## Upstream state

- PR: https://github.com/stellar/stellar-docs/pull/2806
- Merge commit: `ad0accbd0da545ccba12b5a01fd5dc9e387977f8`
- Merge time: `2026-09-08T15:05:25Z`
- Current upstream `main` during the first re-check: `79a50fde577f83d63e284993ad86a9f47bd4cddf`
- Issues `#2770`, `#2771`, and `#2805` closed as completed after the merge.

## Initial live re-check

The rendered pages and current source agree on all three corrections.

- `sd-042`: the EVM migration guide now says `Horizon API (nearing end-of-life)`.
- `sd-043`: the sponsored-reserves page excludes selling liabilities from minimum balance.
- `sd-047`: both cadence pages now say `every 5-7 seconds`.

## Verification lanes

| finding | reviewer | model and effort | report | status |
|---|---|---|---|---|
| `sd-042` | `docs_horizon_fable` | Claude Fable, high | `2026-09-08-improvements-docs-fixes/verify-sd-042-fable.md` | content fixed; search trigger stale |
| `sd-043` | `docs_balance_sol` | Codex GPT-5.6 Sol, high | `2026-09-08-improvements-docs-fixes/verify-sd-043-sol.md` | PASS; ready for resolver |
| `sd-047` | `docs_cadence_terra` | Codex GPT-5.6 Terra, high | `2026-09-08-improvements-docs-fixes/verify-sd-047-terra.md` | content fixed; search trigger stale |

## Current classification

`sd-042` and `sd-047` remain `reported-upstream` during the daily search-index delay.
Their rendered pages and current source are corrected.
Their exact production Raven search triggers still return the pre-deploy snippets.
The next eligible re-check starts after `2026-09-09T00:00Z`.

`sd-043` passed the full source, deployment, adjacent-page, and Core verification.
Its two golden cautions expired, and `q-pc-sponsored-reserves` needed the corrected formula.

## `sls-080` recovery monitor

One free local Raven reading ran at `2026-09-08T16:11:09.547Z`.

- Repository: `stellar/stellar-horizon`
- Question: `Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?`
- Returned value: `MaxSupportedProtocolVersion uint32 = 28`
- `generatedAt`: `2026-09-08T16:11:09.547Z`
- `scannedRef`: `82660510ecda7fd365a14d08badb9d85fa22bc32`
- `answerSource`: `knowledge-note`
- `answerAsOf`: `2026-09-01T00:00:00Z`
- `routedVia`: `explicit`

A direct source read at the returned `scannedRef` found the constant at
`internal/ingest/main.go:36-38` with value `28`.
The returned value matches its own scanned source.

Verdict: `PASS`.

## Golden consistency review

Codex GPT-5.6 Sol at high effort re-read 33 unique members.
It reviewed 10 reopened clusters and two numeric invariants.
All 12 entries remain internally consistent.

- Review: `2026-09-08-improvements-docs-fixes/consistency-review-sol.md`
- Cluster closure input: `2026-09-08-improvements-docs-fixes/register-review-sol.json`
- Closed clusters: `cluster-017`, `cluster-018`, `cluster-042`, `cluster-054`, `cluster-056`,
  `cluster-061`, `cluster-063`, `cluster-065`, `cluster-114`, and `cluster-123`
- Closed numeric invariants: `base reserve` and `Stellar base fee floor`
- `npm run eval:qa:register -- --check`: PASS

The review reported two additional findings.

1. It first requested a fourth symmetric caution for `q-protocol-ledger-close-time`.
   The reviewer withdrew this finding after reading ADR-0008 and the exact avoid item.
   ADR-0008 fixes the accepted set at exactly three cases.
   The owner decision remains open in `.agents/NEXT.md` decision B4.
2. It found two premature claims that the local `sd-043` resolver had completed.
   Both references now state `fixed-upstream` and keep the local receipt pending.

The review verdict was `CHANGES-REQUIRED` before this reconciliation.
The follow-up review passed all seven entries reopened by two caution-wording repairs.
The second finding is corrected in this branch.

The final corpus contains 500 cases with content SHA-256
`5a66e56c55b69a261311b255529b6e50a78b35a1a6e16e693a55494071351604`.
The lint passed with zero errors and 63 warnings before the `sd-043` resolver.
