---
id: sls-121
service: stellar-light-scout
status: verified
discovered: 2026-11-17
upstreamTitle: "Five Wallet rows serve status Live although their own availabilityCheck, dated later, says the operator is gone"
evidence:
  - "2026-11-17 GET https://stellarlight.xyz/api/projects/search?type=Wallet&limit=100 returned 74 rows (returned 74, total 74): 67 Live, 4 Development, 3 Inactive. Ten rows carry an availabilityCheck. Six of those serve status Live with result none-found, and one more serves Live with could-not-check."
  - "Five of the six have an availabilityCheck.checkedAt (2026-11-11) later than statusAsOf: spatium (statusAsOf 2026-08-19, statusBasis source-inherited, statusConfidence low 0.45), freelii (2026-08-19, source-inherited, low 0.45), bebop (2026-08-19, source-inherited, low 0.45), sentit (2026-08-17, site-liveness, medium 0.6), and elsa (2026-08-17, site-liveness, medium 0.6). The sixth, ben-wallet, has statusAsOf 2026-11-12, after its check, and is not part of this finding."
  - "The checks say: spatium \"The operator's domain no longer resolves: spatium.net has no address record\"; freelii \"freelii.app ... is NXDOMAIN. The org links no app and its last push was 2025-07-28\"; bebop \"x.com/bebopcash showed 'This account doesn't exist'; the linked repo ... links no app\"; sentit \"now runs a waitlist for tokenized Nigerian government debt on ERC-20 tokens; it links no app and does not name Stellar\"; elsa \"links no app; it says its 2021 consumer remittance app became Borderless, a B2B payments API, in 2023\"."
  - "2026-11-17 independent re-read: getent hosts spatium.net and getent hosts freelii.app return no address. GET https://x.com/bebopcash returns HTTP 404. GET https://sentit.io/ returns HTTP 200 with the title \"Sentit: Tokenized Nigerian sovereign debt\". GET https://elsa.care/about returns HTTP 200 and describes a payments technology company, not a wallet app."
  - "Dedupe 2026-11-17: sls-033 (resolved 2026-11-17; Stellar-Light/stellarlight#519, #742, PR #1967) asked for availability facts beside the lifecycle label and Scout shipped them. The OpenAPI text says availability is \"separate from `status` (lifecycle)\". This finding is a residual of that receipt: the label and the check disagree on the same row. No active Scout finding covers it."
  - "Probe output: .agents/rounds/2026-11-16-next-phase/items/1.3/probes/scout-live-wallet-rows.json and scout-wallet-live-vs-check.json"
---

## Finding

Scout serves five Wallet rows with `status: "Live"` while the `availabilityCheck` on the same row
says the operator is gone or the product is no longer a Stellar wallet. Each check is dated
2026-11-11. Each `status` was set on 2026-08-17 or 2026-08-19.

The OpenAPI text treats `status` as a lifecycle label and availability as a separate fact. The
rows still contradict themselves. A caller who reads `status` gets "Live". A caller who reads
`availabilityCheck` gets "none-found". A model that answers "which wallets are live" from `status`
lists five wallets whose operators the check found to be gone.

The `statusConfidence` of the five rows is low or medium and each `statusAsOf` is 89 to 91 days old.
The rows describe themselves as weakly supported. The label has not been reconciled with the newer
check.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/search?type=Wallet&limit=100' \
  | jq -r '.projects[] | select(.status=="Live" and .availabilityCheck.result=="none-found")
           | [.slug, .statusAsOf, .availabilityCheck.checkedAt] | @tsv'
```

The output has six rows. Five have `checkedAt` later than `statusAsOf`: spatium, freelii, bebop,
sentit, elsa.

## Recommendation

When a row has an `availabilityCheck` with result `none-found` that is dated after `statusAsOf`,
do not serve `status: "Live"` unchanged. Either lower the status, or set `statusAsOf` and
`statusConfidence` from the newer check so the row says the label is under review.

For the five rows, the notes in the checks give the reason: the operator's domain no longer
resolves (spatium, freelii), the handle is gone (bebop), or the product left Stellar (sentit,
elsa).
