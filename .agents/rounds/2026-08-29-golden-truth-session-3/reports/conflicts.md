# Golden-truth session 3 — P2 conflicts — gt3-sol-a

## q-anchor-sdp-vs-anchor-platform — DONE

- Corrected the Wallet SDK wrap list to SEP-10/12/24/38 and added the SEP-31 trap.
- A — https://developers.stellar.org/docs/build/apps/wallet/intro — “Below you can find all the SEPs the anchor class currently supports”; the list omits SEP-31.
- B — https://github.com/stellar/typescript-wallet-sdk/blob/main/@stellar/typescript-wallet-sdk/src/walletSdk/Anchor/index.ts — exposes SEP-10/12/24/38 APIs and no `sep31` client.
- Corroboration: corrected claim `confirmed-as-of`; false SEP-31 wrap `contradicted` and mirrored in `golden.avoid`.

## q-asset-wallet-sdk-seps — DONE

- Corrected the supported anchor-flow list to SEP-1/6/10/12/24/38 and added the SEP-31 trap.
- A — https://developers.stellar.org/docs/build/apps/wallet/intro — lists SEP-1/6/10/12/24/38 as the current anchor-class SEPs.
- B — https://github.com/stellar/typescript-wallet-sdk/blob/main/@stellar/typescript-wallet-sdk/src/walletSdk/Anchor/index.ts — exposes `sep1`, `sep6`, `sep10`, `sep12`, `sep24`, and `sep38`, with no `sep31` method.
- Corroboration: corrected claim `confirmed-as-of`; false SEP-31 wrap `contradicted` and mirrored in `golden.avoid`.

## q-sep-wallet-seps-list — DONE

- Kept SEP-31 as a general remittance-wallet option and removed it from the Wallet SDK wrap sentence.
- A — https://developers.stellar.org/docs/build/apps/wallet/intro — current Wallet SDK list names SEP-1/6/10/12/24/38 and omits SEP-31.
- B — https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0031.md — SEP-31 defines sending-anchor to receiving-anchor cross-border payments.
- Corroboration: corrected Wallet SDK claim `confirmed-as-of`; false SEP-31 wrap `contradicted` and mirrored in `golden.avoid`.

## q-asset-two-account-issuer — DONE

- Split the long fact and corrected “holds/creates supply” to “creates supply.”
- A — https://developers.stellar.org/docs/tokens/control-asset-access — “The issuing account creates (or mints) the asset” and “can’t actually hold a balance of its own asset.”
- B — https://github.com/stellar/stellar-core/blob/master/src/transactions/ChangeTrustOpFrame.cpp — self trust returns `CHANGE_TRUST_SELF_NOT_ALLOWED`.
- Corroboration: corrected account-role claim `confirmed`; false issuer-balance claim `contradicted` and mirrored in `golden.avoid`.
- Copied the prior matrix conflict line into `truth.verified.evidence`.

## q-asset-deploy-sac-cli — DONE

- Corrected `CONTRACT_ID_FROM_ASSET` to `CONTRACT_ID_PREIMAGE_FROM_ASSET` and split the long fact.
- A — https://developers.stellar.org/docs/tokens/stellar-asset-contract — names a `CONTRACT_ID_PREIMAGE_FROM_ASSET` contract ID preimage.
- B — https://github.com/stellar/stellar-xdr/blob/main/Stellar-transaction.x — defines `CONTRACT_ID_PREIMAGE_FROM_ASSET = 1`.
- B — https://github.com/stellar/stellar-cli/blob/main/cmd/soroban-cli/src/commands/contract/deploy/asset.rs — constructs `ContractIdPreimage::Asset(asset)`.
- Corroboration: corrected identifier claim `confirmed`; false identifier spelling `contradicted` and mirrored in `golden.avoid`.

## q-comp-security-disclosure-programs — DONE

- Removed the stale HackerOne pause claim and dated the current profile observation to 2026-08-29.
- A — https://hackerone.com/stellar — page title is “Stellar.org - Vulnerability Disclosure Program | HackerOne”; the old pause notice is absent.
- F — https://stellar.org/grants-and-funding/bug-bounty — heading is “File a bug report”; the page links to the SDF HackerOne profile.
- Corroboration: the dated no-pause observation is `confirmed-as-of`.
- Refreshed `truth.asOf`, added `truth.reverifyBy`, changed freshness to `scheduled`, and resolved `truth.status` to `confirmed`.

## q-defi-category-funding-ratio-live — DONE

- Corrected `fundedCount/size` to `scfFundedCount/size` in the answer and key fact.
- C — https://stellarlight.xyz/api/clusters?dimension=category — live rows expose `size` and `scfFundedCount`.
- B — catalog/manifest.json#scout.getClusters — defines `scfFundedCount` as “Cluster projects with an SCF award.”
- Corroboration: corrected field and ratio claim `confirmed-as-of`.

## q-passkey-smart-account-architecture — DONE

- Made metadata-only changes; no golden answer, key fact, or avoid text changed.
- A — https://developers.stellar.org/docs/build/apps/guestbook — says the tutorial implements a passkey-powered smart wallet.
- B — https://github.com/stellar/stellar-protocol/blob/master/core/cap-0051.md — says secp256r1 enables WebAuthn through Soroban custom accounts.
- Replaced the broken Stellar passkeys URL in `truth.sources` and corroboration evidence.

## q-zk-host-functions-status — DONE

- Corrected CAP-0080 status from `Final` to the dated `Implemented` observation and shortened the long fact.
- B — https://github.com/stellar/stellar-protocol/blob/master/core/cap-0080.md — exact header lines: `Status: Implemented` and `Protocol version: 26`.
- A — https://developers.stellar.org/docs/networks/software-versions — lists CAP-80 under Protocol 26 for mainnet and testnet.
- Corroboration: corrected dated CAP-0080 status claim `confirmed-as-of`.

## Verification

- All nine files parse as JSON.
- The required lint grep output was empty.
- No assigned case remains disputed.
