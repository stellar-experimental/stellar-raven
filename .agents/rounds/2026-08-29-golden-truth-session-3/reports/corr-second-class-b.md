# Final-review second-class corroboration fix — gt3-sol-b — 2026-08-29

- `eval/qa/corpus/battery/assets-anchors-seps/q-aas-claim-received-claimable-balances.json`: DONE (2 rows fixed)
- `eval/qa/corpus/battery/assets-anchors-seps/q-asset-claimable-balance.json`: DONE (1 row fixed)
- `eval/qa/corpus/battery/assets-anchors-seps/q-asset-path-payment-ops.json`: DONE (1 row fixed)
- `eval/qa/corpus/battery/compliance-rwa-payments/q-comp-clawback-cap0035.json`: DONE (2 rows fixed)
- `eval/qa/corpus/battery/compliance-rwa-payments/q-crp-regional-offramp-mobilemoney.json`: DONE (1 row fixed)
- `eval/qa/corpus/battery/protocol-core/q-pc-address-types-strkey.json`: DONE (2 rows fixed)
- `eval/qa/corpus/battery/protocol-core/q-protocol-amm-cap-0038.json`: DONE (1 row fixed)
- `eval/qa/corpus/battery/protocol-core/q-protocol-operations-vs-transactions.json`: DONE (1 row fixed)
- `eval/qa/corpus/battery/protocol-core/q-protocol-tier1-requirements.json`: DONE (1 row fixed)
- `eval/qa/corpus/battery/retail-consumer/q-asset-usdc-eurc-path-fx.json`: DONE (1 row fixed)
- `eval/qa/corpus/battery/soroban/q-soroban-contract-id-derivation.json`: DONE (2 rows fixed)
- `eval/qa/corpus/battery/tooling-infra/q-tool-js-sdk-package.json`: DONE (1 row fixed)

## Result

- Fixed rows: 16.
- Conflicts: none.
- Evidence classes: A+B, A+D, B+F, and B+C.
- Corpus JSON checks: passed.
- Targeted lint: no `ERROR` output.
- Targeted lint retained one existing sourcing-guard warning for `q-crp-regional-offramp-mobilemoney`.
