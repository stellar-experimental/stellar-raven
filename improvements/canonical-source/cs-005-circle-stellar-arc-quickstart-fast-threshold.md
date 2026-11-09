---
id: cs-005
service: canonical-source
status: reported-upstream
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
  - "2026-11-09 sweep (still-repro): Both Stellar→Arc burn examples still label threshold 1000 Fast Transfer. Supported-chains says Stellar Fast=N/A; finality lists Stellar only under Standard. Original source-domain-27 Iris attestation still requested 1000 and executed 2000; fee API still lists both thresholds. Recheck: https://developers.circle.com/cctp/quickstarts/transfer-usdc-stellar-arc.md; https://developers.circle.com/cctp/concepts/supported-chains-and-domains.md; https://developers.circle.com/cctp/concepts/finality-and-block-confirmations.md; https://iris-api.circle.com/v2/burn/USDC/fees/27/0; https://iris-api.circle.com/v2/messages/27?transactionHash=649b62ed6fc2d566d8ce3d5e89a2ecef27d932e228d2892bef60bce43fb0bd27"
  - "2026-11-02T17:20Z live read: https://developers.circle.com/cctp/quickstarts/transfer-usdc-stellar-arc.md (HTTP 200). The Stellar burn step calls deposit_for_burn with 'nativeToScVal(1000, { type: \"u32\" }), // Fast Transfer finality threshold' (twice, lines 363 and 615 of the markdown). The parameter list says the threshold 'Determines whether it's a Fast Transfer (1000 or less) or a Standard Transfer (2000 or more)'."
  - "2026-11-02T17:21Z live read: https://developers.circle.com/cctp/concepts/supported-chains-and-domains.md row '| Stellar | ✅ | N/A | ❌ | ❌ |' under columns 'Source (Standard transfer) | Source (Fast transfer) | Source (Upfront fees) | Forwarding Service'. The page says N/A marks chains where 'standard attestation is already fast' so 'Fast Transfer is not necessary'."
  - "2026-11-02 live read: https://developers.circle.com/cctp/concepts/finality-and-block-confirmations.md lists '| **Stellar** | 1 | \\~5 seconds |' only in the 'Standard Transfer attestation times' section. The 'Fast Transfer attestation times' section has no Stellar row."
  - "2026-11-02T17:21Z GET https://iris-api.circle.com/v2/burn/USDC/fees/27/0 returns [{\"finalityThreshold\":1000,\"minimumFee\":0},{\"finalityThreshold\":2000,\"minimumFee\":0}]. The fee API still lists a 1000 row for Stellar source, so it does not settle the conflict."
  - "2026-11-02T20:16Z on-chain check: Stellar RPC getEvents on mainnet TokenMessengerMinter CAE2G5Z77UP7GYPYGFOWFGW7C7J6I4YP2AFGSADRKQY62SYUFLPNFTXL (ledgers 65173012-65182132, 2026-10-28) gave 25 deposit_for_burn transactions. GET https://iris-api.circle.com/v2/messages/27?transactionHash=<hash> returned status complete for all 25. 9 requested minFinalityThreshold 1000 and all 9 report finalityThresholdExecuted 2000. Examples: 649b62ed6fc2d566d8ce3d5e89a2ecef27d932e228d2892bef60bce43fb0bd27, 215bb6345b7dca5eccc49398c560e4d12b12b46a314903bb5d7cd9e4416ae10f, 4243fe17124b39dd49e2ecd3849cf9b9913247aadb4ef69103059364b6246f92."
  - "The https://developers.circle.com/cctp/references/stellar.md example with minFinalityThreshold 1000 and finalityThresholdExecuted 2000 is an Ethereum-to-Stellar message (sourceDomain 0). It does not show Stellar-source behavior."
  - "Dedupe 2026-11-02: circlefin/stellar-cctp issues and PRs (state all) contain no report about Stellar-source Fast Transfer. Circle publishes no public repository for developers.circle.com content."
  - "Golden consumer: eval/qa/corpus/battery/tooling-infra/q-tool-cctp-stellar-integration.json answer discloses the conflict, and its keyFacts say to use Standard 2000 until the Stellar-source 1000/Fast versus N/A dispute resolves."
  - upstream issue filed 2026-11-02: https://github.com/circlefin/stellar-cctp/issues/37
recurrences:
  - date: 2026-11-09
    evidence: "Both Stellar→Arc burn examples still label threshold 1000 Fast Transfer. Supported-chains says Stellar Fast=N/A; finality lists Stellar only under Standard. Original source-domain-27 Iris attestation still requested 1000 and executed 2000; fee API still lists both thresholds."
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: GET Circle Stellar→Arc quickstart,supported chains,finality; Iris fees27/0 and original attestation hash — Both Stellar burn examples still1000/Fast; Stellar Fast=N/A, Standard~5sec. Original mainnet source27 message request1000 executed2000; fee API still lists both. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row cs-005."
---

## Finding

The Stellar to Arc quickstart passes `1000` to `deposit_for_burn` and labels it a Fast Transfer
finality threshold. Circle's supported-chains table marks Fast Transfer from a Stellar source as
`N/A`. The Fast Transfer attestation-times table also omits Stellar. Recent mainnet Stellar-source
burns that request `1000` all execute at `2000` (Standard). The quickstart comment promises a Fast
Transfer that the reader does not get.

developers.circle.com has no public content repository, so this report goes to the Stellar CCTP
repository. Please forward it to the CCTP documentation owners.

## Evidence

- Quickstart: <https://developers.circle.com/cctp/quickstarts/transfer-usdc-stellar-arc>, comment
  `// Fast Transfer finality threshold` on the `1000` argument.
- Supported chains: <https://developers.circle.com/cctp/concepts/supported-chains-and-domains>, row
  `| Stellar | ✅ | N/A | ❌ | ❌ |`.
- Finality: <https://developers.circle.com/cctp/concepts/finality-and-block-confirmations>, Stellar
  appears only under Standard Transfer attestation times (1 block, about 5 seconds).
- Fees: `GET https://iris-api.circle.com/v2/burn/USDC/fees/27/0` returns rows for both 1000 and 2000.
- Attestations: 9 of 25 mainnet Stellar-source burns on 2026-10-28 requested `1000`. The Iris
  messages API reports `finalityThresholdExecuted: 2000` for all 9. Example transaction:
  `649b62ed6fc2d566d8ce3d5e89a2ecef27d932e228d2892bef60bce43fb0bd27`.

## Recommendation

Make the quickstart agree with the supported-chains table. Pass `2000` and label it Standard, or
keep `1000` and state that it executes as Standard on Stellar. Change both `deposit_for_burn`
calls and the finality-threshold parameter note. If Stellar-source Fast Transfer ships later,
update the supported-chains and attestation-times tables at that time.
