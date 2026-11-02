---
id: sd-075
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Hello World calls stellar contract build a cargo build shortcut; soroban-sdk 28 rejects plain cargo
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world returned HTTP 200 with "This is a small wrapper around cargo build that sets the target to wasm32v1-none and the profile to release ... You can think of it as a shortcut for the following command" followed by "cargo build --target wasm32v1-none --release"
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/build/smart-contracts/getting-started/hello-world.mdx lines 309-312; docs/build/smart-contracts/example-contracts/TEMPLATE.mdx line 135 repeats the plain cargo command
  - stellar/rs-soroban-sdk v29.0.1 soroban-sdk/src/_migrating/v28_spec_shaking.rs "contracts must be built with stellar contract build from stellar-cli v25.2.0 or newer. Building a contract for wasm with any other build system produces a build error - error - soroban-sdk requires stellar-cli v25.2.0+ to build a contract"
  - 2026-11-02 local reproduction with soroban-sdk 29.0.1 and Rust target wasm32v1-none - cargo build --target wasm32v1-none --release exited 101 with "failed to run custom build command for soroban-sdk v29.0.1" and "soroban-sdk requires stellar-cli v25.2.0+ to build a contract"
  - the same docs commit docs/tools/cli/agent-cli/guides/build-and-deploy-contracts.mdx line 90 already tells agents not to use cargo build --target wasm32v1-none
  - golden case q-sor-build-target-wasm32v1 (golden audit pass 2, 2026-11-02)
---

## Finding

The Hello World tutorial says that `stellar contract build` is "a small wrapper around
`cargo build`". It says the CLI is "a shortcut for" `cargo build --target wasm32v1-none --release`.

Since soroban-sdk 28, that plain `cargo build` command fails for a Wasm target. The SDK build
script requires the build to come from `stellar contract build` in stellar-cli v25.2.0 or newer.
The CLI strips unused contract spec entries after the build.

A reader who runs the "equivalent" command gets a build error.

This is a `docs-content` finding.

## Evidence

The live tutorial shows `cargo build --target wasm32v1-none --release` as the command that the
CLI is a shortcut for.

The soroban-sdk v28 migration note says that "contracts must be built with `stellar contract
build` from `stellar-cli` v25.2.0 or newer". Any other Wasm build gives
`error: soroban-sdk requires stellar-cli v25.2.0+ to build a contract`.

A local build on 2026-11-02 with soroban-sdk 29.0.1 ran
`cargo build --target wasm32v1-none --release`. It exited with code 101 and printed that error.

The Agent CLI guide on the same site already tells agents not to use the plain `cargo build`
command.

## Recommendation

Remove "shortcut for" and the plain `cargo build` command, or mark the command as valid only for
soroban-sdk versions before 28. Say that `stellar contract build` also strips unused spec entries,
and that soroban-sdk 28 and later require it for Wasm builds. Apply the same change to the
example-contract template.
