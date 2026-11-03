---
id: sd-082
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Clarify that master weight 0 does not disable other issuer signers
evidence:
  - "2026-11-03T00:07:12Z GET https://developers.stellar.org/docs/tokens/control-asset-access.md returned HTTP 200. Line 224 equates master weight 0 with preventing issuer transactions. Body SHA-256: 2f53ab8331b4ec0c9d3b2e9fdb00af6bab1d109bd9f432790037260a1df78ce8."
  - "2026-11-03T00:07:12Z GET https://developers.stellar.org/docs/learn/fundamentals/transactions/signatures-multisig.md returned HTTP 200. Lines 25 and 29 preserve other signers and threshold authorization. Body SHA-256: 6e2a70e0c425a38a12abf42c6383ce2f54c070b92504240e3788fd4202a98b80."
  - "2026-11-03T00:07:13Z GET https://developers.stellar.org/docs/tokens/how-to-issue-an-asset.md returned HTTP 200. Its maximum-supply section repeats the unconditional lock claim. Body SHA-256: da98324edb693f04aef1c20fbf17274cc26d28a4ff24bbfddc02cde7faeda314."
  - "Request descriptors and receipts: research/audits/2026-11-02-golden-overnight/issuer-lock-receipts.json. Requests use no authentication or model calls."
  - "Reviewed IDs: q-aas-burn-clawback-redemption-mechanics and q-aas-list-token-on-exchanges-aggregators. Their exact tool input and result hashes appear below."
  - "Dedupe checked active findings, recurrences, resolved.json, and intake.json in both worktrees. sd-059 concerns search indexing, not this content omission."
recurrences:
  - date: 2026-11-02
    evidence: "The separately authorized method 7 listing answer repeats the unqualified issuer-lock claim. Its exact row SHA-256 is e05e08432584b13241a7d2b7ac766cfd0a0ec477ac6e808d4d9864ef38db7a47. Fresh primary reads at 2026-11-03T00:38:45Z reproduce the same asset-control and multisig distinction. The new burn answer avoids that claim, so this recurrence counts only the listing answer. Original scores remain unchanged, and collection supplies no aggregate at this checkpoint."
---

## Finding

The asset-control page equates setting issuer master weight `0` with disabling issuer transactions and further issuance.
That step disables the master key.
Other signers can still authorize transactions when their combined weights meet the relevant threshold.
The issuance tutorial repeats the unconditional account-lock claim in its maximum-supply section.

This is a `docs-content` omission on pages that explain fixed supply and issuer locking.
It can mislead issuers and holders about account authority and supply controls.
The existing SAC-admin exception addresses a separate authorization path and does not supply the missing signer condition.
The intake map names `stellar/stellar-docs` as the content owner.
This finding remains local; no external report was sent.

## Evidence

Independent reads occurred on `2026-11-03` UTC, which was still `2026-11-02` in `America/New_York`.
All three GET requests returned HTTP `200`.

| Primary source | Observed text or behavior | Qualification |
| --- | --- | --- |
| [Asset control](https://developers.stellar.org/docs/tokens/control-asset-access.md#limiting-the-supply-of-an-asset), line `224` | “This prevents the issuing account from being able to sign transactions” | The preceding instruction sets master weight `0`, without checking other signers. |
| [Multisig](https://developers.stellar.org/docs/learn/fundamentals/transactions/signatures-multisig.md#thresholds), lines `25` and `29` | Other signers “can still continue to sign transactions.” | Their combined weights must meet the operation threshold. |
| [Issuance tutorial](https://developers.stellar.org/docs/tokens/how-to-issue-an-asset.md#configure-maximum-supply), lines `328`–`374` | The warning and examples describe a permanent lock using master weight `0`. | The section needs the same signer qualification. |

The source documents explain the counterexample without a transaction experiment.
An issuer can have master weight `0` and another signer whose weight meets its payment threshold.
That signer can authorize issuer payments, which issue assets.
Remaining authority can also permit changes to signers or thresholds.
This finding makes no claim about when the omission first appeared.

The tutorial starts with a new issuer and adds no other signer in its shown setup.
Its illustrated setup does not establish a broken transaction.
Its general warning repeats the claim without naming that assumption.

Request hashes cover canonical JSON descriptors containing only the method, URL, and explicit public headers.
Result hashes cover the exact returned Markdown bytes.

| GET source | Request descriptor SHA-256 | Result body SHA-256 |
| --- | --- | --- |
| Asset control | `cfed2871daf537df4a81e27ae3209f9ab909e4c44616aa621c18d5c34764db0a` | `2f53ab8331b4ec0c9d3b2e9fdb00af6bab1d109bd9f432790037260a1df78ce8` |
| Multisig | `64f7da831e78f4d0d44afdfa1289154b544493677f9882c7ab94cebb2936792f` | `6e2a70e0c425a38a12abf42c6383ce2f54c070b92504240e3788fd4202a98b80` |
| Issuance tutorial | `47864ed608e9925227ffda43ef244d97107c2e8a969175564aa416f5a15bbfbd` | `da98324edb693f04aef1c20fbf17274cc26d28a4ff24bbfddc02cde7faeda314` |

Two reviewed answers repeat this omission.
The first uses execute entry `5`, field `limitSupply`.
The second uses execute entry `6`, field `control.supply`.
Their source is `eval/local-lanes/direct-grok/2026-11-02/review-packets/<case-id>.json`.
The result hashes below cover exact model-visible text, including source footers.

| Reviewed ID | Tool input text SHA-256 | Model-visible result text SHA-256 |
| --- | --- | --- |
| `q-aas-burn-clawback-redemption-mechanics` | `4660df76a8d08c344b55b7f40ee21175d6ce51a7a47f26d9eebb8cfd114ef5ed` | `8544de8e3372119c3c6c159b8b47881b3ed440e198c84bf1f5682d3b1debdcb1` |
| `q-aas-list-token-on-exchanges-aggregators` | `71f60424199e0e0fe7af139ace68a416ab686f6eab754a177cde7db79d62d61f` | `9cb95bfd8f15bc408268c5c8a9eb2efe364390ad21e371a9ea53f3a5a8563c72` |

Agent synthesis and judge behavior remain separate from the upstream omission.
Both original grades remain `correct`; their main required answers remain supported.
Both need qualitative disagreement labels for the unqualified issuer-lock claim that their judges missed.
The containing diagnostic method is invalid-or-incomplete, so these observations establish no aggregate prevalence or accuracy.
The separate infrastructure failure is not an agent error.
No golden, score, source, or baseline artifact changed for this finding.

## Recommendation

Qualify both asset pages at the master-weight instruction and the adjacent permanent-lock warning.
State that master weight `0` disables the master key, while other signers can retain authority.
Require review of all remaining signers and thresholds before claiming that issuer transactions or further issuance are impossible.
Also account for authority that can restore issuance permissions.
Preserve the existing separate SAC-admin warning.
Link both instructions to the multisig threshold explanation.
Keep examples clear about their assumption that no other signer retains the required authority.

Recheck both asset pages after the correction.
Each page must distinguish disabling the master key from disabling all relevant issuer authority.
The existing multisig explanation must remain consistent with that distinction.
