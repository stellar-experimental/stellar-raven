# GT-41 Soroban empirical findings

Date: 2026-07-10 (collection completed after midnight UTC)

Primary process 3302 and blind process 3305 independently audited ten Soroban
tooling and migration goldens. Full matrices and command results are in Solo
scratchpad 575. This note preserves two filing-ready upstream candidates whose
owner/intake does not fit the current improvements service map.

## `ed25519-dalek` dependency-range failure

A fresh Stellar contract scaffold using both `soroban-sdk` 26.1 and 27.0
resolved `ed25519-dalek` 3.0 through the current `soroban-env-host` range while
retaining older rand/rand_chacha traits. `cargo test` then failed because
`ChaCha20Rng` did not satisfy the required `CryptoRng` bound. Pinning
`ed25519-dalek` 2.2.0 removed v3 and made the clean SDK-27 test pass.

Candidate owner: `stellar/rs-soroban-env`. Recommended fix: constrain the
dependency to major 2 or update the random-trait stack, publish patched crates,
and add clean-lockfile CI.

## CLI init-template SDK-major drift

`stellar` CLI 27.0.0 still generated a contract template with
`soroban-sdk = "26"`. This may be deliberate protocol-support policy rather
than a defect. The upstream owner should either make CLI/template majors
coherent or document why the current CLI intentionally scaffolds the prior SDK
major. Candidate owner: `stellar/stellar-cli`.

## Other durable empirical boundaries

- Generated local-Wasm TypeScript bindings work without a deployed C-address;
  the typed `Client.deploy` route requires an already-installed wasmHash.
- In JS SDK 16.0.1, `assembleTransaction` returns a builder requiring
  `.build()`, while `prepareTransaction` returns the built transaction.
- All-zero Ed25519/contract payloads encode valid G/C addresses and are unsafe
  null sentinels.
- Current mutable Manage Data state is not sufficient historical timestamp
  evidence; preserve the successful transaction/result and ledger-close data.
- Solang 0.3.5 describes its Soroban target as pre-alpha/experimental; SEP-57
  remains Draft v0.3.0.
