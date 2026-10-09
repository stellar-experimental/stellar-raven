---
id: sd-058
service: stellar-docs
status: reported-upstream
discovered: 2026-10-09
upstreamTitle: Update the fee-payer signing example to use SDK 17 XDR fields
evidence:
  - 2026-10-09 live signing guide and source at 2efd1d55840eb780f4b311c313e35d34fedf2f63; https://github.com/stellar/stellar-docs/blob/2efd1d55840eb780f4b311c313e35d34fedf2f63/docs/build/guides/transactions/signing-soroban-invocations.mdx#L274
  - "2026-10-09 @stellar/stellar-sdk 17.2.1 local execution: the current fee-payer example throws TypeError: txEnvelope.v1 is not a function before any RPC call."
  - 2026-10-09 SDK 17.0.0 release and XDR migration guide; https://github.com/stellar/js-stellar-sdk/releases/tag/v17.0.0; https://github.com/stellar/js-stellar-sdk/blob/v17.0.0/docs/migration/xdr-migration.md
  - 2026-10-09 adjacent x402 source and local SDK section check; https://github.com/stellar/stellar-docs/blob/2efd1d55840eb780f4b311c313e35d34fedf2f63/docs/build/agentic-payments/x402/quickstart-guide.mdx#L154
  - upstream issue filed 2026-10-09: https://github.com/stellar/stellar-docs/issues/2909
---

## Finding

The fee-payer signing example calls removed XDR getter methods with the current JavaScript SDK.
It throws `TypeError: txEnvelope.v1 is not a function` while extracting Soroban data.
The failure occurs before the fee-payer account read, simulation, assembly, or signing.
The example imports `@stellar/stellar-sdk` without identifying an older supported version.

The example already calls `assembleTransaction(...).build()` correctly.
The x402 quickstart repeats the same failing XDR access chain.

## Evidence

The live [Signing Contract Invocations guide](https://developers.stellar.org/docs/build/guides/transactions/signing-soroban-invocations) contains this fee-payer extraction:

```typescript
const txEnvelope = xdr.TransactionEnvelope.fromXDR(transactionXdr, "base64");
const sorobanData = txEnvelope.v1()?.tx()?.ext()?.sorobanData();
```

The [source snapshot](https://github.com/stellar/stellar-docs/blob/2efd1d55840eb780f4b311c313e35d34fedf2f63/docs/build/guides/transactions/signing-soroban-invocations.mdx#L274) contains the same code.
Both fresh reads succeeded on 2026-10-09.
This observed docs commit does not establish the first commit with the stale access chain.

The [SDK 17.0.0 release](https://github.com/stellar/js-stellar-sdk/releases/tag/v17.0.0) introduced the XDR API rewrite.
It replaces getter methods with properties and discriminated union values.
The [migration guide](https://github.com/stellar/js-stellar-sdk/blob/v17.0.0/docs/migration/xdr-migration.md) explains the changed access pattern.
The [current envelope source](https://github.com/stellar/js-stellar-sdk/blob/494cf9e26662ef4ff91afa013d5dfc37bd1f2286/src/xdr/generated/transaction-envelope.ts) exposes `type`, `v1`, and `value` as properties.
The callable `fromXDR` alias still works in the tested version.
The first runtime failure is the call to `v1`, not the parser.

Install the tested SDK in an empty directory:

```sh
npm install --ignore-scripts @stellar/stellar-sdk@17.2.1
```

Run this minimal reproduction with `node --input-type=module`:

```javascript
import { Account, Keypair, Networks, Operation, SorobanDataBuilder,
  TransactionBuilder, xdr } from "@stellar/stellar-sdk";
const signer = Keypair.random();
const tx = new TransactionBuilder(new Account(signer.publicKey(), "0"), {
  fee: "100", networkPassphrase: Networks.TESTNET,
}).setTimeout(30).setSorobanData(new SorobanDataBuilder().build())
  .addOperation(Operation.invokeContractFunction({
    contract: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    function: "symbol", args: [],
  })).build();
const transactionXdr = tx.toXDR();
const txEnvelope = xdr.TransactionEnvelope.fromXDR(transactionXdr, "base64");
const sorobanData = txEnvelope.v1()?.tx()?.ext()?.sorobanData();
```

SDK `17.2.1` reports `TypeError: txEnvelope.v1 is not a function`.
The reproduction makes no network request.
Additional local checks execute the complete Step 2 snippet with local RPC responses.
They replace the placeholder secret with a newly generated local keypair.
They confirm the failure before any RPC call.
They check the corrected complete flow and the missing-data branch.

The corrected flow rebuilds, simulates, assembles, signs, and submits to the local fixture.
The missing-data branch rejects before any RPC fixture call.
These checks prove SDK mechanics, not live network execution or authorization policy.

A scan of 919 current docs source files found two copies of this specific access chain.
The [x402 quickstart source](https://github.com/stellar/stellar-docs/blob/2efd1d55840eb780f4b311c313e35d34fedf2f63/docs/build/agentic-payments/x402/quickstart-guide.mdx#L154) uses `tx.toEnvelope().v1()?.tx()?.ext()?.sorobanData()`.
That guide installs `@stellar/stellar-sdk` without a version pin.
Its isolated SDK section throws `TypeError: tx.toEnvelope(...).v1 is not a function` with the same fixture.
The corrected section preserves Soroban data and adjusts the fee to `"1"`.
The check does not execute the full payment client or make a payment.

## Recommendation

Replace the getter chain with the supported SDK 17 property access pattern.
Check the envelope and extension variants before reading Soroban data:

```typescript
const txEnvelope = xdr.TransactionEnvelope.fromXdr(transactionXdr, "base64");
if (txEnvelope.type !== "envelopeTypeTx") {
  throw new Error("Expected a v1 transaction envelope");
}
const txExt = txEnvelope.value.tx.ext;
if (txExt.type !== "sorobanData") {
  throw new Error("Missing Soroban data");
}
const sorobanData = txExt.value;
```

Apply the same checked extraction to the x402 quickstart's envelope.
Retain the existing `.build()` before signing.
State the tested SDK version and link the XDR migration guide.
Execute both examples against that version with local service fixtures.
