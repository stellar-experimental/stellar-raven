# Targeted corroboration probes — 2026-08-29

This probe is read-only. No case file changed.

## q-aas-issuer-fees-supply-cap-freeze

Verdict: `add-corroboration-row`

The negative claims meet the required bar when they stay dated and protocol-relative.

The official asset comparison says contract tokens support transfer fees that Stellar Assets do not provide. The full operation list has payment, path-payment, offer, `set_options`, trustline, and clawback operations. It has no issuer-fee or max-supply operation. The XDR schema gives `AccountEntry` account flags and gives `TrustLineEntry` balance, limit, flags, and extensions. Neither structure has an issuer-fee or max-supply member.

The supply guide says an issuer limits supply by setting its master weight to zero. CAP-0046-06 also states, under “No Total Supply,” that total supply is unavailable because Stellar Classic does not support it.

Exact rows to add:

```json
{
  "claim": "As of 2026-08-29, classic Stellar Assets have no built-in per-transfer issuer-fee hook; transfer-fee logic requires a contract token.",
  "verdict": "confirmed-as-of",
  "evidence": [
    {
      "class": "A",
      "ref": "https://developers.stellar.org/docs/tokens/anatomy-of-an-asset",
      "observedAt": "2026-08-29",
      "note": "The official comparison says contract tokens provide transfer fees that are not available in Stellar Assets."
    },
    {
      "class": "A",
      "ref": "https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations",
      "observedAt": "2026-08-29",
      "note": "The full classic operation list has payment, path-payment, offer, set-options, trustline, and clawback operations, with no issuer-fee operation."
    },
    {
      "class": "B",
      "ref": "https://github.com/stellar/stellar-xdr/blob/main/Stellar-ledger-entries.x",
      "observedAt": "2026-08-29",
      "note": "AccountEntry and TrustLineEntry expose balances, limits, authorization flags, and extensions, but no per-transfer issuer-fee field."
    }
  ]
}
```

```json
{
  "claim": "As of 2026-08-29, classic Stellar Assets have no immutable max-supply field; issuers limit supply by locking issuance authority.",
  "verdict": "confirmed-as-of",
  "evidence": [
    {
      "class": "A",
      "ref": "https://developers.stellar.org/docs/tokens/control-asset-access#limiting-the-supply-of-an-asset",
      "observedAt": "2026-08-29",
      "note": "The official guide limits supply by setting the issuing account's master weight to zero after issuance."
    },
    {
      "class": "B",
      "ref": "https://github.com/stellar/stellar-xdr/blob/main/Stellar-ledger-entries.x",
      "observedAt": "2026-08-29",
      "note": "AccountEntry and TrustLineEntry have no max-supply or total-supply member."
    },
    {
      "class": "B",
      "ref": "https://github.com/stellar/stellar-protocol/blob/master/core/cap-0046-06.md",
      "observedAt": "2026-08-29",
      "note": "The SAC design rationale says total supply is unavailable because Stellar Classic does not support it."
    }
  ]
}
```

Why: Class A states the feature boundary and operational supply method. Class B confirms the schema boundary. The explicit web sweep for `Stellar classic asset transfer fee hook` and `Stellar classic asset max supply` found no contrary protocol field. Results about XLM fixed supply and operational issuer caps do not contradict these source-relative claims.

## q-crp-custodial-vs-noncustodial-wallets

Verdict: `downgrade-or-reword`

FinCEN says a product label does not determine the regulatory result. It applies a facts-and-circumstances test to the activities performed. FinCEN also says technology does not decide money-transmitter status.

FATF says true peer-to-peer transfers between users acting for themselves are not explicitly subject to FATF AML/CFT controls. It also says a transaction is not peer-to-peer when a VASP participates. These sources support activity-based legal review. They do not support a universal list that always includes KYC, sanctions, travel rule, fraud, and customer support.

Replace the answer clause with:

> A non-custodial design does not by itself determine a regulated remittance business's duties. Apply each relevant jurisdiction's rules to the activities performed. Where the business is an obliged entity, plan for applicable AML/CFT, sanctions, and travel-rule controls. Plan fraud and customer-support operations separately.

Add this note:

> Treat this as legal-review and operational guidance, not as a universal list of duties. FinCEN applies a facts-and-circumstances test. FATF says true user-to-user P2P transfers are not explicitly subject to its AML/CFT controls.

Why: “Non-custodial” alone is neither an exemption nor proof that every listed duty applies. The current clause mixes legal duties with operational guidance and crosses jurisdictions.

Primary text:

- FinCEN: “The label, however, will not determine the regulatory application.” [FIN-2019-G001](https://www.fincen.gov/system/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf)
- FinCEN: “Whether a person is a money transmitter ... is a matter of facts and circumstances.” [FIN-2019-G001](https://www.fincen.gov/system/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf)
- FATF: “P2P transactions are not explicitly subject to AML/CFT controls under the FATF Standards.” [2021 VA/VASP Guidance](https://www.fatf-gafi.org/content/dam/fatf/documents/recommendations/Updated-Guidance-VA-VASP.pdf)
- FATF: “If such a VASP is involved in a transaction, it is not a P2P transaction.” [2021 VA/VASP Guidance](https://www.fatf-gafi.org/content/dam/fatf/documents/recommendations/Updated-Guidance-VA-VASP.pdf)

## q-defi-arbitrage-pathpayment-bots

Verdict: `downgrade-or-reword`

Do not add a row that says the protocol has no market-making incentive. That phrasing is false for Stellar AMMs.

The official liquidity-pool page says AMMs charge 30 bps on every trade. It says liquidity providers receive those fees. CAP-0038 fixes the fee at 0.3%. It also discusses liquidity providers deploying capital where pools generate the most profit.

Replace the sentence with:

> Path payments can traverse orderbook and pool liquidity. The protocol provides execution mechanics and a 0.3% AMM fee to liquidity providers, but it does not guarantee arbitrage or market-making profit. Profitability depends on live prices, liquidity, slippage, transaction fees, latency, competition, and capital.

Add this note:

> Grade a no-guarantee statement, not an absence-of-incentives claim. CAP-0038 includes liquidity-provider fees and expressly discusses profit-driven liquidity allocation.

Why: Profitability is an outcome and risk judgment. It is not a protocol absence. A “no protocol-level incentive” row would conflict with the AMM fee mechanism.

Primary text:

- “AMMs charge a fee on all trades” and pool participants receive a proportional share. [Stellar liquidity docs](https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools)
- CAP-0038 fixes the constant-product market-maker fee at 0.3%. [CAP-0038](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md)

## q-scf-hummingbot-kelp-closed-rfp

Verdict: `add-corroboration-row`

The live unfiltered RFP response generated at `2026-08-29T14:00:41.071Z` still includes the item. It returns `status: closed`, `quarter: q1-2026`, `category: defi`, and `rowType: rfp`. The response also reports two open briefs in the active Q3 2026 quarter. Therefore, the old item is present and closed. It is not merely absent from the current open set.

Exact row to add:

```json
{
  "claim": "As of 2026-08-29, the live Scout RFP feed returned Hummingbot Integration (Trading Engine) as closed for Q1 2026 in the DeFi category.",
  "verdict": "confirmed-as-of",
  "evidence": [
    {
      "class": "C",
      "ref": "https://stellarlight.xyz/api/rfps",
      "observedAt": "2026-08-29",
      "note": "The unfiltered response generated at 2026-08-29T14:00:41.071Z returned the Hummingbot row with status closed, quarter q1-2026, category defi, and rowType rfp."
    },
    {
      "class": "B",
      "ref": "https://github.com/NibrasD/stellar-hummingbot-connector",
      "observedAt": "2026-08-29",
      "note": "The source repository independently confirms the Hummingbot connector and the Kelp-deprecation gap; the dated closed status remains explicitly feed-relative."
    }
  ]
}
```

Why: The volatile status is dated and source-relative. The repository gives the RFP entity a current external footprint. Do not strengthen this row to “closed forever.”

## Sources

- [Stellar Asset XDR schema](https://github.com/stellar/stellar-xdr/blob/main/Stellar-ledger-entries.x)
- [Assets Overview and Comparison](https://developers.stellar.org/docs/tokens/anatomy-of-an-asset)
- [Asset Design Considerations](https://developers.stellar.org/docs/tokens/control-asset-access)
- [List of Stellar Operations](https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations)
- [CAP-0046-06](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0046-06.md)
- [FinCEN FIN-2019-G001](https://www.fincen.gov/system/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf)
- [FATF 2021 VA/VASP Guidance](https://www.fatf-gafi.org/content/dam/fatf/documents/recommendations/Updated-Guidance-VA-VASP.pdf)
- [Stellar Liquidity Pools](https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools)
- [Stellar Fees](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering)
- [CAP-0038](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md)
- [Live Scout RFP feed](https://stellarlight.xyz/api/rfps)
- [Stellar Hummingbot connector](https://github.com/NibrasD/stellar-hummingbot-connector)

## Probe artifacts

- `/tmp/gt3-corr-probes-search.json`
- `/tmp/gt3-assets-negative-sweep.json`
- `/tmp/gt3-corr-assets.json`
- `/tmp/gt3-corr-compliance.json`
- `/tmp/gt3-corr-defi.json`
- `/tmp/gt3-hummingbot-official-search.json`
- `/tmp/gt3-rfps-all.json`
