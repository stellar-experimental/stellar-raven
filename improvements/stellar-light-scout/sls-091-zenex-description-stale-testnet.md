---
id: sls-091
service: stellar-light-scout
status: verified
discovered: 2026-10-09
upstreamTitle: Update the Zenex shortDescription to match its sourced mainnet deployment
evidence:
  - 2026-10-09 Scout API 1.9.72 exact Zenex project read; https://stellarlight.xyz/api/projects/search?q=Zenex&limit=5
  - 2026-10-09 Zenex deployment page checked 2026-10-06; https://docs.zenex.trade/deployments/contract-addresses
  - 2026-10-09 pinned zenith-protocols/zenex-docs deployment source; https://raw.githubusercontent.com/zenith-protocols/zenex-docs/9a6f5de766f744c93fb7f80c3b525b514b7a4fed/docs/deployments.md
---

## Finding

The Zenex project's `shortDescription` still says testnet with mainnet pending.
The same response gives a sourced `mainnet` deployment and a mainnet lifecycle note.
The linked operator deployment page also describes a live mainnet deployment.
Readers receive conflicting deployment states inside one exact project result.

The `Live` label alone does not prove mainnet deployment.
The verified defect is the stale `shortDescription` beside explicit, sourced mainnet fields.

## Evidence

On 2026-10-09, this public read returned one strict project match:

```sh
curl 'https://stellarlight.xyz/api/projects/search?q=Zenex&limit=5'
```

Scout API `1.9.72` returned HTTP `200` without partial or failed-read indicators.
The project has `status: Live` and `deployment.network: mainnet`.
Its deployment basis is `human-verified`.
Its deployment source is `https://docs.zenex.trade/deployments/contract-addresses`.
The deployment evidence date is `2026-10-03T08:05:44.623Z`.

The `shortDescription` contains `Currently on testnet, with mainnet pending`.
The lifecycle note instead states mainnet operation since `2026-09-29`.
That lifecycle date is Scout's claim, not an independently established launch date.

The [operator deployment page](https://docs.zenex.trade/deployments/contract-addresses) identifies live mainnet contracts.
Its stated verification date is `6 October 2026`.
It lists an active XLM-USD market and the factory contract.
The operator source supports the network distinction without proving every current runtime property.

The retired `sls-079` covers conflation between lifecycle and deployment.
The active `sls-024` covers missing provenance for positive deployment claims.
Zenex now has separate deployment fields and an operator source.
Its stale descriptive text is a distinct content defect.
The related upstream verification record describes the older qualifier change, not this current stale `shortDescription`.

## Recommendation

Update the Zenex `shortDescription` from the operator deployment evidence.
Remove the testnet-only statement and the pending-mainnet claim.
Keep lifecycle, deployment network, and descriptive text consistent with their dated sources.
Use a consistency check to flag explicit network contradictions during record updates.
Do not infer mainnet from `Live` when no deployment evidence exists.
