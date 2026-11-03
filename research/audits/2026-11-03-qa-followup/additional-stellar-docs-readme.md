# Additional Stellar Docs patch

This separate patch addresses sd-091, sd-092, sd-093, sd-094, and sd-095.
Its exact base is `85d2d1b8e7a4451b7a6af0931f587ce73109b816`.
It uses a separate source worktree and index.
It preserves the original two patches and their manifest.

The patch changes four maintained MDX pages, the Transactions OpenRPC schema, and its generated stable bundle.
The changes add single JSON parsing with RPC error handling and the Protocol 25 InvokeHostFunction source exception.
They also distinguish read-only overlap from write conflicts and correct the TransactionMeta type and link.
The muxed-source wording preserves the outer fee-bump fee source distinction.
The footprint wording does not promise scheduling or throughput.

## Apply

Both patch orders pass indexed forward and reverse checks.
The original patch and this patch produce the same combined stable bundle in either order.
The actual generator reproduces that combined bundle from the combined canonical inputs.

```sh
git apply --check /path/to/additional-stellar-docs.patch
git apply /path/to/additional-stellar-docs.patch
npm run rpcspec:validate
```

Use the existing frozen-lock dependencies. This pass performs no installation.

## Generated method page remains pending

The faulty text exists in `openrpc/src/stellar-rpc/schemas/Transactions.json`.
The actual `npm run rpcspec:validate` script rebuilds and validates the stable OpenRPC bundle.
The patch includes that canonical input and generated bundle.

The getTransactions MDX region has an explicit generated marker.
The frozen `openrpc/README.md` says the method MDX generator is outside this repository.
This pass does not hand-edit that generated region or invent a generator command.
A maintainer must regenerate the method page from the corrected bundle before publication is complete.
The current method MDX still has the old type and link until that step runs.
The manifest records this publication limit explicitly.

## Validation and scope

The five target MDX files pass the frozen Prettier configuration and component-padding check.
OpenRPC generation and validation pass with the reused dependency directory.
A structural comparison finds one stable-bundle change: the getTransactions resultMetaXdr description.
The base generator also changes two unrelated Anchor Platform SEP-12 links.
That same drift occurs without this patch, so the patch excludes it.

The manifest records file hashes, canonical ownership, generation limits, and apply checks.
The temporary source worktree remains available for review.
No model call, network simulation, external message, commit, or deployment occurs.

## Passkey wording supplement

The fifth correction replaces permanent device-only storage with authenticator or passkey-provider management and website non-disclosure.
It distinguishes device-bound credentials from end-to-end encrypted provider synchronization.
Backup and availability remain provider-dependent. The text promises no recovery or access from another device.
The source proof concerns maintained SDP develop code, not an observed deployment.
Root first supplied six separate source/API reads after the initial 24-read pass.
Root later added two provenance reads. The repeated source bytes remain identical.
The supplement identity remains in the manifest. The wording correction awaits final Grok closeout.
