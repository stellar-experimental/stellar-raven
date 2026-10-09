---
id: sd-057
service: stellar-docs
status: verified
discovered: 2026-10-09
upstreamTitle: Label the Circle USDC issuer example as Stellar Testnet in the Anchor admin guide
evidence:
  - eval/qa/results/2026-10-07-tool-surface-qa/2026-10-07T23-25-14-variantA.json; q-defi-bridge-evm-to-stellar-axelar
  - 2026-10-09 published Anchor Platform admin guide and source at 2efd1d55840eb780f4b311c313e35d34fedf2f63; https://raw.githubusercontent.com/stellar/stellar-docs/2efd1d55840eb780f4b311c313e35d34fedf2f63/docs/platforms/anchor-platform/admin-guide/assets-and-client-wallets.mdx
  - 2026-10-09 Circle USDC contract-address table; https://developers.circle.com/stablecoins/usdc-contract-addresses
  - 2026-10-09 repeated issuer scan; 51 occurrences across the current docs source
---

## Finding

The Anchor Platform admin guide uses Circle's Testnet USDC issuer without a network label.
Its asset-ID explanation says the example represents Circle USD.
The page does not identify that issuer as Testnet or distinguish the Mainnet issuer.
Readers can copy a valid Testnet asset ID into Mainnet instructions.

The example is valid on Testnet.
The verified defect is its missing network scope, not an invalid issuer address.

## Evidence

The [Assets and Wallet Clients guide](https://developers.stellar.org/docs/platforms/anchor-platform/admin-guide/assets-and-client-wallets#field-explanations) gives this example:

```text
stellar:USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

The [source snapshot](https://github.com/stellar/stellar-docs/blob/2efd1d55840eb780f4b311c313e35d34fedf2f63/docs/platforms/anchor-platform/admin-guide/assets-and-client-wallets.mdx#L51) has the same network-free explanation.
The page contains no Testnet, Mainnet, or network qualification.
Both live reads succeeded on 2026-10-09.
This observed commit does not establish the first commit that omitted the label.

[Circle's current address table](https://developers.circle.com/stablecoins/usdc-contract-addresses) assigns the displayed issuer to Stellar Testnet.
It assigns a different issuer to Stellar Mainnet:

```text
GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
```

A downstream consumer copied this issuer into a Mainnet answer.
That mistake does not prove that this page was the only cause.

A source scan found 51 occurrences of the Testnet issuer.
The path-payment example explicitly labels it Stellar Testnet.
Several create-account examples use `TESTNET_USDC_ISSUER`.
Those labeled examples do not support a broader wrong-address claim.
The smallest verified correction belongs in this admin guide's generic asset-ID explanation.

## Recommendation

Label the example as Circle USDC on Stellar Testnet.
State that asset issuers differ between Testnet and Mainnet.
Link Circle's current issuer table for production configuration.

Keep the Testnet issuer in development examples.
Check repeated generic issuer explanations for missing network labels.
Do not replace Testnet fixture addresses across the docs with Mainnet addresses.
