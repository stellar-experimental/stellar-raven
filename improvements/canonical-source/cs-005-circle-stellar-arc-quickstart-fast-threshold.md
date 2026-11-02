---
id: cs-005
service: canonical-source
status: verified
discovered: 2026-11-02
upstreamTitle: "Stellar to Arc quickstart labels threshold 1000 as Fast Transfer, but Stellar-source Fast Transfer is N/A"
probe:
  type: http-text
  url: https://developers.circle.com/cctp/quickstarts/transfer-usdc-stellar-arc.md
  expect:
    status: 200
    contains:
      - "// Fast Transfer finality threshold"
evidence:
  - "2026-11-02T17:20Z live read: https://developers.circle.com/cctp/quickstarts/transfer-usdc-stellar-arc.md (HTTP 200). The Stellar burn step calls deposit_for_burn with 'nativeToScVal(1000, { type: \"u32\" }), // Fast Transfer finality threshold' (twice, lines 363 and 615 of the markdown). The parameter list says the threshold 'Determines whether it's a Fast Transfer (1000 or less) or a Standard Transfer (2000 or more)'."
  - "2026-11-02T17:21Z live read: https://developers.circle.com/cctp/concepts/supported-chains-and-domains.md row '| Stellar | ✅ | N/A | ❌ | ❌ |' under columns 'Source (Standard transfer) | Source (Fast transfer) | Source (Upfront fees) | Forwarding Service'. The page says N/A marks chains where 'standard attestation is already fast' so 'Fast Transfer is not necessary'."
  - "2026-11-02 live read: https://developers.circle.com/cctp/concepts/finality-and-block-confirmations.md lists '| **Stellar** | 1 | \\~5 seconds |' only in the 'Standard Transfer attestation times' section. The 'Fast Transfer attestation times' section has no Stellar row."
  - "2026-11-02T17:21Z GET https://iris-api.circle.com/v2/burn/USDC/fees/27/0 returns [{\"finalityThreshold\":1000,\"minimumFee\":0},{\"finalityThreshold\":2000,\"minimumFee\":0}]. The fee API still lists a 1000 row for Stellar source, so it does not settle the conflict."
  - "Context: https://developers.circle.com/cctp/references/stellar.md shows an example message with 'minFinalityThreshold': '1000' and 'finalityThresholdExecuted': '2000'. A requested 1000 can execute at 2000."
  - "Dedupe 2026-11-02: circlefin/stellar-cctp issues and PRs (state all) contain no report about Stellar-source Fast Transfer. Circle publishes no public repository for developers.circle.com content."
  - "Golden consumer: eval/qa/corpus/battery/tooling-infra/q-tool-cctp-stellar-integration.json answer discloses the conflict, and its keyFacts say to use Standard 2000 until the Stellar-source 1000/Fast versus N/A dispute resolves."
---

## Finding

The Stellar to Arc quickstart passes `1000` to `deposit_for_burn` and labels it a Fast Transfer
finality threshold. Circle's supported-chains table marks Fast Transfer from a Stellar source as
`N/A`. The Fast Transfer attestation-times table also omits Stellar. A reader cannot tell whether a
Stellar-source burn with `1000` gets Fast attestation or Standard attestation.

## Evidence

- Quickstart: <https://developers.circle.com/cctp/quickstarts/transfer-usdc-stellar-arc>, comment
  `// Fast Transfer finality threshold` on the `1000` argument.
- Supported chains: <https://developers.circle.com/cctp/concepts/supported-chains-and-domains>, row
  `| Stellar | ✅ | N/A | ❌ | ❌ |`.
- Finality: <https://developers.circle.com/cctp/concepts/finality-and-block-confirmations>, Stellar
  appears only under Standard Transfer attestation times (1 block, about 5 seconds).
- Fees: `GET https://iris-api.circle.com/v2/burn/USDC/fees/27/0` returns rows for both 1000 and 2000.

## Recommendation

Make the quickstart agree with the supported-chains table. If Stellar-source Fast Transfer is not
offered, pass `2000` and label it Standard, or keep `1000` and state that it executes as Standard
on Stellar. If Fast Transfer is offered, update the supported-chains and attestation-times tables.
