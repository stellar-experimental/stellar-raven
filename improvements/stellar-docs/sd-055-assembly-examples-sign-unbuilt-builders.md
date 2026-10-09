---
id: sd-055
service: stellar-docs
status: verified
discovered: 2026-10-09
upstreamTitle: Build assembled transactions before signing in the archival and simulation examples
evidence:
  - 2026-10-09 current stellar/stellar-docs source commit 2efd1d55840eb780f4b311c313e35d34fedf2f63
  - 2026-10-09 @stellar/stellar-sdk 17.2.1 local reproduction
  - 2026-10-09 repeated-example scan
  - 2026-10-09 multi-party reproduction
---

## Finding

Two archival examples call `sign()` on the builder returned by `assembleTransaction()`.
The non-restoration branch fails with `TypeError: prepTx.sign is not a function`.
Readers cannot submit the documented transaction.

The same mistake appears in the multi-party transaction-simulation example.
Both transaction-simulation examples call `Server()` without `new`.
Example 1 also calls `prepareTransaction()` without `await`, then tries to sign the returned promise.

The fee-payer signing guide already calls `.build()` correctly.

## Evidence

Live reads on 2026-10-09 confirm these published source examples:

- [Archival guide](https://developers.stellar.org/docs/build/guides/archival/restore-data-js), source `docs/build/guides/archival/restore-data-js.mdx:63`.
- [State archival example](https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival#example-my-data-is-archived), source `docs/learn/fundamentals/contract-development/storage/state-archival.mdx:270`.
- [Example 1](https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/transaction-simulation#example-1-source-account-authorization), source `docs/learn/fundamentals/contract-development/contract-interactions/transaction-simulation.mdx:75,97`.
- [Multi-party example](https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/transaction-simulation#example-2-multi-party-authentication), source `docs/learn/fundamentals/contract-development/contract-interactions/transaction-simulation.mdx:129,184`.

The [source snapshot](https://github.com/stellar/stellar-docs/tree/2efd1d55840eb780f4b311c313e35d34fedf2f63/docs) preserves the tested examples.
The observed SDK version is `@stellar/stellar-sdk` `17.2.1`.
This observation does not identify the release that introduced the mistakes.

Install the tested SDK in an empty directory:

```sh
npm install --ignore-scripts @stellar/stellar-sdk@17.2.1
```

Run this minimal reproduction with `node --input-type=module`:

```javascript
import { Account, BASE_FEE, Keypair, Networks, Operation,
  SorobanDataBuilder, TransactionBuilder, rpc } from "@stellar/stellar-sdk";
const signer = Keypair.random();
const tx = new TransactionBuilder(new Account(signer.publicKey(), "0"), {
  fee: BASE_FEE, networkPassphrase: Networks.TESTNET,
}).setTimeout(30).addOperation(Operation.invokeContractFunction({
  contract: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  function: "symbol", args: [],
})).build();
const sim = { _parsed: true, latestLedger: 1, events: [],
  transactionData: new SorobanDataBuilder(), minResourceFee: "0",
  result: { auth: [] } };
const prepTx = rpc.assembleTransaction(tx, sim);
try { prepTx.sign(signer); } catch (error) { console.log(String(error)); }
try { rpc.Server("https://soroban-testnet.stellar.org"); }
catch (error) { console.log(String(error)); }
const s = new rpc.Server("https://soroban-testnet.stellar.org");
s.simulateTransaction = async () => sim;
const preppedTx = s.prepareTransaction(tx);
try { preppedTx.sign(signer); } catch (error) { console.log(String(error)); }
const corrected = await preppedTx;
corrected.sign(signer);
rpc.assembleTransaction(tx, sim).build().sign(signer);
```

The output shows these errors with SDK `17.2.1`:

```text
TypeError: prepTx.sign is not a function
TypeError: Class constructor RpcServer cannot be invoked without 'new'
TypeError: preppedTx.sign is not a function
```

The final two signing calls succeed.
The reproduction uses a local simulation response and makes no network request.

Additional local checks extract both archival functions and supply local RPC fixtures.
They run assembly and signing through the installed SDK.
They submit no transaction to a network.
Both non-restoration branches reach the reported signing error.

After adding `.build()`, the restoration branch fails because its builder has no time bounds.
The examples also omit the `Operation` import used in that branch.
Their linked `submitTx` helper returns undefined `status` and throws undefined `tmpStatus`.
The successful polling branch fails with `ReferenceError: status is not defined`.

The local correction adds `.build()`, supplies `Operation`, and sets restoration time bounds.
It returns or throws `finalStatus` in the polling helper.
Both archival functions then pass their non-restoration and restoration branches with signed local transactions.
The retry uses sequence `2` after the restoration consumes sequence `1`.
The corrected polling helper passes its success and failure branches.

A local check also executes the repeated multi-party example.
The original first fails at server construction, before assembly.
The corrected flow uses current operation arguments, XDR fields, and awaited simulation and authorization calls.
Its local address-credential fixture passes authorization signing, assembly, envelope signing, and mocked submission.

The repository scan found three examples with the missing build step.
Other assembly examples in the fee-payer, simulation deep-dive, and Relayer guides already call `.build()`.

## Recommendation

Call `assembleTransaction(tx, sim).build()` before signing in all three repeated examples.
Add the required `Operation` import and restoration time bounds to both archival examples.
Correct the linked polling helper to return or throw `finalStatus`.

Update both transaction-simulation examples to use `new Server()` and `getAccount()`.
Add `await` to Example 1's `prepareTransaction()` call.
Use named `invokeContractFunction` arguments and import `BASE_FEE`, `nativeToScVal`, and `Address`.
Set transaction time bounds in both examples.
Await `simulateTransaction()` in the multi-party example.

Use current XDR fields to select the address signer.
Await authorization calls with `Promise.all()` and use `simResult.latestLedger` for expiration.
Build the assembled transaction before signing it.

Keep the correct `.build()` calls in the other guides.
Validate the repaired examples against the supported SDK with local success and restoration fixtures.
