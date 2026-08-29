# Final-review re-check (Grok) — 2026-08-29

Lane: read-only. Wrote only this file. Diff: `git diff origin/main`.

## 1. Single-class scan — PASS

Check: compare `truth.corroboration` claims in `eval/qa/corpus/battery` against `origin/main`.

New claims: 82. Multi-class: 82. Single-class: **0**.

Combos: A+B 49, A+D 23, B+F 3, B+C 3, A+F 1, A+C 1, B+D 1, A+B+F 1.

## 2. Sample of 12 repaired rows — PASS

Sampled four rows from each Sol worker. Fetched the second-class URL on 2026-08-29. Every row has a different class letter, `observedAt` 2026-08-29, a resolving URL, and a quote or observed result that supports the claim. Class-D notes name the query and primary results.

| worker | id | classes | second-class URL | HTTP | date |
|---|---|---|---|---|---|
| A | q-aas-burn-clawback-redemption-mechanics | A+D | `https://www.google.com/search?q=Stellar+classic+asset+issuer+balance+burn+create+asset` (note also cites control-asset-access) | 200 on cited docs | 2026-08-29 |
| A | q-sep-clawback-prereq-flag | A+D | query `Stellar clawback AUTH_REVOCABLE existing trustlines XLM`; primary CAP-0035 + clawbacks guide | 200 clawbacks | 2026-08-29 |
| A | q-crp-custodial-vs-noncustodial-wallets | A+D | query `site:fincen.gov wallet money transmitter facts circumstances` | 200 FinCEN PDF | 2026-08-29 |
| A | q-infra-horizon-vs-rpc | A+D | query `site:developers.stellar.org Horizon deprecated nearing end-of-life maintained` | 200 docs | 2026-08-29 |
| B | q-aas-claim-received-claimable-balances | A+B | `https://github.com/stellar/stellar-protocol/blob/4c55f7cc…/core/cap-0023.md` | 200 | 2026-08-29 |
| B | q-comp-clawback-cap0035 | A+B | `https://github.com/stellar/stellar-protocol/blob/e3af4c8c…/core/cap-0035.md` | 200 | 2026-08-29 |
| B | q-pc-address-types-strkey | B+F | `stellar 27.1.0` `strkey zero contract` observed as `CAAAA…BSC4` | 200 CLI repo | 2026-08-29 |
| B | q-tool-js-sdk-package | B+C | `https://registry.npmjs.org/@stellar/stellar-base/latest` deprecated fold-in | 200 | 2026-08-29 |
| C | q-aas-claimable-predicates-expiry-reserves | A+B | CAP-0023: entry deleted only by `ClaimClaimableBalanceOp` | 200 | 2026-08-29 |
| C | q-asset-trustline-vs-sac | A+B | CAP-0046-06 deterministic `Asset` preimage | 200 | 2026-08-29 |
| C | q-protocol-validator-node-roles | A+B | `stellar-core_example.cfg` `NODE_IS_VALIDATOR` | 200 | 2026-08-29 |
| C | q-soroban-factory-pattern | A+B | `soroban-examples` `env.deployer().deploy_v2` | 200 | 2026-08-29 |

Extra C check: `q-scf-ambassador-program` A+B handbook official-rules `$15,000 paid in XLM` / `NOT automatic` — HTTP 200.

No class-D sweep lacked a named query or a primary result.

## 3. Re-worded keyFacts — PASS

Paths: `eval/qa/corpus/battery/tooling-infra/q-infra-rpc-provider-archive-tier.json`, `eval/qa/corpus/battery/protocol-core/q-pc-quantum-preparedness-dormant.json`.

- Archive [0] 81 chars, one predicate: `Names the dated seven-provider archive roster or an attributed eighth-row roster.` Split tails keep 2026-08-18 and Validation Cloud as later facts. Seven names and 2026-07-11 remain in the answer.
- Quantum [4] 81 chars, one predicate: `No QPP or CAP source defines a final mechanical dormant-account eligibility rule.` `Do NOT invent dormant-account thresholds or deadlines.` stays in avoid.

## 4. Consistency register — FAIL

Path: `eval/qa/consistency-register.json`.

Check: walk `clusters.entries`.

- Tension: 3 (`cluster-017` sd-043 Docs-vs-Core liabilities; `cluster-018` sd-004 + sd-042; `cluster-114` same sd-043 set as 017). Dated reasons name the upstream disputes.
- `reopened` keys: **1**. `cluster-018` still has `"reopened": { "date": "2026-08-29", "reason": "member-content-changed" }` while `verdict` is `tension`. HEAD already had a 2026-08-27 stamp; this session refreshed it and did not clear it after the re-sweep.

Exact fix: delete `reopened` on `cluster-018`. Keep `verdict: "tension"` and the 2026-08-29 `reSwept` reason that names sd-004 and sd-042.

## 5. Lint — PASS

Check: `node eval/qa/lint-corpus.mjs --since origin/main --stale` → `0 error(s), 60 warning(s)`. Zero `exceeds 90` lines.

## Findings

1. `eval/qa/consistency-register.json` `cluster-018` still carries a `reopened` stamp. Remove that key.

## VERDICT: APPROVE-WITH-FIXES

Clear the leftover `cluster-018` reopen stamp. Do not reopen the two-class corroboration work.
