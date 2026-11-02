---
id: sd-080
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: "Fuzzing example tells readers to run `soroban contract build`; Homebrew and the install script ship only `stellar`"
evidence:
  - "2026-11-02 stellar/stellar-docs main 85d2d1b8e7a4451b7a6af0931f587ce73109b816 docs/build/smart-contracts/example-contracts/fuzzing.mdx line 197: 'This can be worked around by building the contract with either `soroban contract build` or `cargo rustc --crate-type cdylib` instead of the typical `cargo build`.'"
  - "2026-11-02 install paths on docs/tools/cli/install-cli.mdx at the same commit: the install script, `brew install stellar-cli`, `winget install --id Stellar.StellarCLI`, and `cargo install --locked stellar-cli`. stellar/stellar-cli install.sh sets BINARY_NAME=\"stellar\". Homebrew/homebrew-core Formula/s/stellar-cli.rb runs `cargo install --bin=stellar`. cmd/soroban-cli/Cargo.toml declares both `stellar` and `soroban` [[bin]] targets, so only `cargo install` also ships `soroban`. The winget package was not inspected."
  - "2026-11-02 stellar/stellar-cli main cmd/soroban-cli/src/commands/contract/build.rs lines 339 and 349 run `cargo rustc` with `--crate-type=cdylib`, so `stellar contract build` gives the same LTO workaround that the note describes."
  - "2026-11-02 repeated-claim scan of docs/ and .mintlify/ at 85d2d1b8 for `soroban <subcommand>` CLI calls outside meeting notes: only fuzzing.mdx line 197 gives a live instruction. docs/networks/software-versions.mdx line 2198 is a historical changelog entry, and docs/build/guides/dapps/docker.mdx line 94 is an unrelated echo string."
  - "Dedupe 2026-11-02: resolved sd-075 (stellar/stellar-docs#2974, fixed by #2991) covered the Hello World build commands, not this note. Its independent reviewer flagged this line as a separate defect: .agents/rounds/2026-11-02-upstream-filing.md, section 'Resolver pass: sd-075'. No active finding names fuzzing.mdx."
---

## Finding

The fuzzing example tells readers to build the contract with `soroban contract build` to avoid a cargo LTO problem.
The CLI is now named `stellar`.
The Homebrew formula and the install script install only the `stellar` binary.
A reader who installed the CLI with either method gets `command not found` for this command.

`stellar contract build` gives the same workaround, because it runs `cargo rustc --crate-type=cdylib`.

## Evidence

[`docs/build/smart-contracts/example-contracts/fuzzing.mdx` line 197](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/docs/build/smart-contracts/example-contracts/fuzzing.mdx#L197) says:

> This can be worked around by building the contract with either `soroban contract build` or `cargo rustc --crate-type cdylib` instead of the typical `cargo build`.

The [install page](https://developers.stellar.org/docs/tools/cli/install-cli) gives four install methods.
Two of them ship only `stellar`:

- [`install.sh`](https://github.com/stellar/stellar-cli/blob/main/install.sh) sets `BINARY_NAME="stellar"`.
- The [Homebrew formula](https://github.com/Homebrew/homebrew-core/blob/main/Formula/s/stellar-cli.rb) runs `cargo install --bin=stellar`.

`cargo install --locked stellar-cli` installs both binaries.
The winget package was not checked.

[`build.rs`](https://github.com/stellar/stellar-cli/blob/main/cmd/soroban-cli/src/commands/contract/build.rs) runs `cargo rustc` with `--crate-type=cdylib`.

A scan of `docs/` found no other live `soroban` CLI instruction.

## Recommendation

On line 197, replace `soroban contract build` with `stellar contract build`.
