---
id: sd-049
service: stellar-docs
status: proposed
discovered: 2026-09-03
upstreamTitle: Saved Keypairs documentation calls unencrypted JSON storage obfuscated
evidence:
  - 2026-09-03 rendered fetch of https://developers.stellar.org/docs/tools/lab/saved/keypairs says Saved Keypairs are obfuscated but not encrypted
  - 2026-09-03 source read of https://github.com/stellar/laboratory/blob/master/src/helpers/localStorageSavedKeypairs.ts shows direct JSON.stringify serialization of SavedKeypair objects
  - 2026-09-03 source read of https://github.com/stellar/laboratory/blob/master/src/types/types.ts#L322-L325 defines SavedKeypair.secretKey as a string
  - 2026-09-03 read-only live inspection of https://lab.stellar.org/account/saved says browser localStorage is unencrypted and unprotected
  - eval/qa/corpus/battery/tooling-infra/q-ti-stellar-lab-usage-and-new-ui.json truth.verified dated 2026-09-03 records the same A/B/F conflict
  - .agents/rounds/2026-09-03-truth-maintenance/golden-sol.md records the independent source classes and observations
---

## Finding

The Saved Keypairs page says saved keys are obfuscated but not encrypted.
The current storage helper serializes each SavedKeypair directly with JSON.stringify.
The saved-keypairs UI says the browser storage is unencrypted and unprotected.

The page and the implementation describe different protection properties.
This is a docs-content conflict for secret-bearing browser storage.

## Evidence

The Saved Keypairs page limits the feature to Testnet and Futurenet.
It says that stored secrets are recoverable by anyone with browser access.
It also uses the word "obfuscated" for the stored data.

The current Laboratory helper writes SavedKeypair objects with direct JSON serialization.
The [SavedKeypair type](https://github.com/stellar/laboratory/blob/master/src/types/types.ts#L322-L325) includes a secretKey string.
The current UI describes localStorage as unencrypted and without protection.

These are read-only checks.
They did not create, import, sign, or submit a key or transaction.

## Recommendation

Make the page match the current storage implementation.
Remove the unqualified obfuscation claim if direct JSON serialization is the intended behavior.
Otherwise, implement the stated obfuscation and make the UI use the same wording.

Keep the Testnet/Futurenet-only and no-Mainnet-custody warnings.
