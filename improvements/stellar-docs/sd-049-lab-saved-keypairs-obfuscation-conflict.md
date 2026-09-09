---
id: sd-049
service: stellar-docs
status: fixed-upstream
discovered: 2026-09-03
upstreamTitle: Saved Keypairs conflict used an obsolete Laboratory branch
evidence:
  - 2026-09-09 independent Grok 4.6 high review and root browser/source checks confirm that the original premise is invalid. Laboratory defaults to main, whose writer and live bundle apply reversible XOR/base64 obfuscation. Docs say obfuscated but not encrypted; the UI says unencrypted and unprotected. These statements agree. See .agents/rounds/2026-09-08-maintenance-independent-review-grok.md, reconciliation at 03:14:02Z.
  - The current writer already existed before this finding: https://github.com/stellar/laboratory/commit/624d40ff29ca897f07290ca52011893175dae200. This retirement corrects a source-selection error; it does not claim a new upstream fix.
  - 2026-09-08 fresh default-branch reads did not reproduce the claimed conflict. `localStorageSavedKeypairs.ts` uses `encryptJson`, SHA-256 54fcb79cbc08f21c00b4c78f32caeade587b6f7d203096cac92b10c54cde55a0. `jsonCipher.ts` uses XOR plus base64 and warns against sensitive data, SHA-256 5a3aab65e39f891706be2adfa55b1f052f044c064d5bd868f01aedd622b0ff99. The docs source says obfuscated but not encrypted, SHA-256 68e3cb0c994df62414a530b2195f3ccf471e2f2019cccc38a003ac00a157880b.
  - 2026-09-08 related-record review found resolved receipt `sd-030`, stellar/stellar-docs#2605, and stellar/stellar-docs#2620. Those records corrected warning prominence. This finding instead used an obsolete source branch; it is not the same defect.
  - 2026-09-03 rendered fetch of https://developers.stellar.org/docs/tools/lab/saved/keypairs says Saved Keypairs are obfuscated but not encrypted
  - 2026-09-03 source read of the obsolete https://github.com/stellar/laboratory/blob/master/src/helpers/localStorageSavedKeypairs.ts branch shows direct JSON.stringify serialization. It does not describe the default branch.
  - 2026-09-03 source read of the obsolete https://github.com/stellar/laboratory/blob/master/src/types/types.ts#L322-L325 branch defines SavedKeypair.secretKey as a string
  - 2026-09-03 read-only live inspection of https://lab.stellar.org/account/saved says browser localStorage is unencrypted and unprotected
  - The prior case at https://github.com/stellar-experimental/stellar-raven/blob/b2dbde53e9c9910b6d49a87ccea829555eeb4ef1/eval/qa/corpus/battery/tooling-infra/q-ti-stellar-lab-usage-and-new-ui.json records the obsolete-branch conclusion. The current two case files and consistency register reconcile it through independent review dated 2026-09-09.
  - .agents/rounds/2026-09-03-truth-maintenance/golden-sol.md records the prior source classes and obsolete-branch conclusion
  - .agents/rounds/2026-09-03-truth-maintenance/golden-final-review-sol.md records the prior trigger; it is not current defect proof
---

## Finding

The claimed conflict does not reproduce on the Laboratory default branch.
The current writer passes each saved keypair array through `encryptJson`.
That helper applies reversible XOR and base64 obfuscation.
It does not provide encryption or secret custody.

The current Docs page states this exact boundary.
The Laboratory UI also warns that local storage is unencrypted and unprotected.
Resolved finding `sd-030` recorded the warning correction and its deployment.
The UI does not deny obfuscation or claim plaintext serialization.
The original conflict used the obsolete `master` writer as current implementation evidence.

## Evidence

The Saved Keypairs page limits the feature to Testnet and Futurenet.
It says that stored secrets are recoverable by anyone with browser access.
It also uses the word "obfuscated" for the stored data.

The obsolete `master` branch helper writes SavedKeypair objects with direct JSON serialization.
The default `main` branch does not use that writer.
It reads legacy plain JSON for compatibility and obfuscates new writes.

The [SavedKeypair type](https://github.com/stellar/laboratory/blob/main/src/types/types.ts#L322-L325) includes a secretKey string.
The current UI describes localStorage as unencrypted and without protection.

These are read-only checks.
They did not create, import, sign, or submit a key or transaction.

## Recommendation

Do not file this finding.
Retire the invalid premise after reconciling the two affected golden cases and the consistency register.
Independent review confirmed the current source, deployed writer, Docs, and UI boundary.
Record the obsolete-branch error in the resolved receipt. No new upstream issue or successor is justified.
