# Local upstream patches

Both patch files are ready for local review.
They cover all ten findings without commits, publication, or deployment.
The findings remain open; these patches do not establish an upstream fix.

## Source identity

The Docs base is `85d2d1b8e7a4451b7a6af0931f587ce73109b816`.
The skill base is `9c604c2be6ae69f962fbb578bce6b681d462fea5`.
Fresh GitHub main-branch reads matched both clone commits on `2026-11-03`.
The manifest records each original Git blob and each before/after SHA-256.
It also records each patch SHA-256 and exact application check.

The clones use a partial index.
The patches use unstaged differences for explicit target paths.
Each target index blob matches its base commit.
The patches contain no unrelated staged deletions.

## Repairs

| Finding | Local change |
|---|---|
| `sd-080` | Qualify issuer locking on both pages with signer, threshold, restoration, and SAC-admin conditions. |
| `sd-081` | Replace the universal TOML array-order claim with table context and root-key rules. |
| `sd-082` | Explain ordered, atomic operation changes and separate fee and sequence effects. |
| `sd-083` | Use `set_authorized` in the SAC authorization paragraph. |
| `sd-084` | Correct both destination-selector descriptions and regenerate the Horizon bundle. |
| `sd-085` | Correct both conditional `authMode` descriptions and generate the served OpenRPC specification. |
| `sd-086` | Name `LedgerHeader.scpValue` and nest its three member headings. |
| `sd-087` | Guard simulation decoding for errors, restoration, missing results, success, and valid void. |
| `sd-088` | Show separate tagged variants and single-u32 values in all three language examples and the enum JSON. |
| `sk-037` | Replace mixed-operation batching with manual invocation control and the single-operation boundary. |

The issuer tutorial keeps its valid new-account example.
The asset-control page keeps its separate SAC-admin caveat.
The TOML text does not advise reopening an already defined named table.
The simulation guide keeps its assembled-transaction build step.
The nested ledger headings retain their original titles and anchors.
Only their heading level changes.
The named-struct, tuple-struct, and later complex examples remain byte-identical.
The low-level skill transaction code remains unchanged.

## Primary format checks

The enum JSON follows the [v28.1.0 serializer definitions](https://github.com/stellar/stellar-cli/blob/v28.1.0/cmd/crates/soroban-spec-typescript/src/types.rs).
`Entry::Enum` uses `cases`, and `EnumCase.value` is a `u32`.
`UnionCase` uses `values` for the selected tagged variant.
This source check establishes the JSON representation; it does not claim serializer execution.

The language examples use functions present in primary SDK source:

- [Python `scval`](https://github.com/StellarCN/py-stellar-base/blob/main/stellar_sdk/scval.py): `to_symbol`, `to_uint32`, and `to_vec`.
- [Java `Scv`](https://github.com/stellar/java-stellar-sdk/blob/master/src/main/java/org/stellar/sdk/scval/Scv.java): `toSymbol`, `toUint32`, and `toVec`.
- [PHP `XdrSCVal`](https://github.com/Soneso/stellar-php-sdk/blob/main/Soneso/StellarSDK/Xdr/XdrSCVal.php): `forSymbol`, `forU32`, and `forVec`.

The manifest links the response hashes and observation dates.
These branch-source checks do not establish compatibility with every released SDK version.
Python, Java, and PHP examples did not execute.

The [released RPC implementation](https://github.com/stellar/stellar-rpc/blob/13e53516633c3ce1281c7edbacb607107d3a4e55/cmd/stellar-rpc/internal/methods/simulate_transaction.go) confirms the conditional authorization default.
The [versioned ledger XDR](https://github.com/stellar/stellar-xdr/blob/4f524bbac80c781c06e4fb5fc93a2d0d331d6705/Stellar-ledger.x) confirms the nested consensus-value fields.

## Generation and validation

The isolated clone installed dependencies with `npx --yes pnpm@11.6.0 install --frozen-lockfile --ignore-scripts`.
The installation passed on Node `v24.13.0`.
The package file and lockfile remain unchanged.

| Check | Result |
|---|---|
| Targeted Prettier check | Passed for seven MDX files and both OpenRPC source JSON files. |
| Component padding check | Passed for all seven MDX files. |
| `pnpm rpcspec:validate` | Built and validated all three OpenRPC services. |
| `pnpm bundle-horizon` | Passed with two schema-name collision warnings. |
| Full Horizon lint | Retained one error and 1202 warnings, identical to the pristine source copy. |
| Existing SDK fixtures | Passed all eight checks with JavaScript SDK `17.4.0`. |
| Extracted patched callback | Passed error, restoration, missing-result, success, and valid-void checks. |
| Preservation checks | Confirmed unchanged struct and complex sections; parsed the corrected enum JSON. |
| `git diff --check` | Passed in both clones. |
| Patch forward checks | Passed `git apply --check --cached` against both pristine selected indexes. |
| Patch reverse checks | Passed `git apply --reverse --check` against both changed trees. |

The Horizon error concerns an existing `nullable` property in `asyncTransactionSubmissionSchema.yml`.
The comparison records all diagnostic signatures and confirms no new lint diagnostic.
The initial formatting check failed only for the edited JSON array layout.
A targeted formatter write corrected that layout; the final check passed.
The first comparison helper failed on the linter JSON envelope.
The corrected helper compared the `problems` arrays and passed.

The OpenRPC script also regenerated unrelated Anchor SEP-12 links.
The patch excludes those changes and restores that artifact from the pristine index.
The saved generator output records that existing drift.
The served `stellar-rpc.openrpc.json` exactly matches the script-generated internal specification.

## Limits and next action

These files are local proposals, not shipped changes.
No transaction was submitted. No network simulation, signing operation, or on-chain decoder ran.
The tagged void decoder ignores a trailing map in the original combined example.
The fixture does not prove that example is rejected on-chain.
The integer-vector rejection applies to the tested JavaScript SDK conversion path.

The repository does not contain its method-page generator.
A Docs maintainer must regenerate the `simulateTransaction` method page from the corrected OpenRPC specification.
No generated method page was edited manually.
Full Mintlify site validation did not run in the partial checkout.
The full Horizon lint still has its documented baseline failures.
No subpatch requires a guessed signature or schema format.

All fifteen owned command terminals exited and were removed.
Root's terminals remained untouched.
The manifest contains exact commands, results, hashes, source receipts, and cleanup records.
Root can review the two patches and their remaining publication limits without changing the original QA artifacts.
