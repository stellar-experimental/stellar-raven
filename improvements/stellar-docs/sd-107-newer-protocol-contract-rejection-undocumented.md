---
id: sd-107
service: stellar-docs
status: reported-upstream
discovered: 2026-11-14
upstreamTitle: Docs do not say that the network rejects a contract built for a newer protocol
probe:
  type: http-text
  url: https://developers.stellar.org/docs/learn/fundamentals/contract-development/overview.md
  expect:
    status: 200
    contains:
      - "should match the version of the host functions supported"
    excludes:
      - "newer"
evidence:
  - "2026-11-14T05:10Z GET https://developers.stellar.org/docs/learn/fundamentals/contract-development/overview.md returned HTTP 200 (12,146 bytes). The Environment Meta section says \"The interface version stored within should match the version of the host functions supported.\" It does not say what the host does on a mismatch. The word \"newer\" does not occur on the page."
  - "Source: stellar/stellar-docs main 62f29bbbfef70a7b79cf6d632e750bf51e768f95, docs/learn/fundamentals/contract-development/overview.mdx lines 66 to 70. docs/tools/sdks/build-your-own.mdx repeats the same sentence."
  - "Host rule: stellar/rs-soroban-env main 5fdf6e6275bd3822bdb981df2c140751075e1502, soroban-env-host/src/vm/parsed_module.rs lines 336 to 385. A contract protocol below the ledger protocol passes when its pre-release number is 0. An equal protocol passes when the pre-release number matches. A higher protocol returns (WasmVm, InvalidInput) with \"contract protocol number is newer than host\". The comment on line 374 says \"Future protocols we don't allow.\""
  - "2026-11-14 gh search code in stellar/stellar-docs: \"newer than host\" 0 results, \"newer protocol\" 0 results, \"pre-release version\" 0 results."
  - "2026-11-14T05:04:48Z Raven execute: stellarDocs.search_docs('contract protocol number is newer than host') returned Software Versions, The Guestbook Contract, Build Your Own Contract SDK, and State Archival. stellarDocs.search_sdk_cli_tools_docs and scout.searchResearch (8 rows) returned upload and SDK pages. No returned text states the rule."
  - "The round's gap and verify lanes reached the same result on 2026-11-14 (.agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-3.json and gap/verify-gap.json, q-infra-version-lag-errors)."
  - "Classification: docs-content. The Environment Meta section undertakes to explain the interface version and omits the rule that the host enforces."
  - "Affected golden case: eval/qa/corpus/battery/tooling-infra/q-infra-version-lag-errors.json, key fact 4. Ledger: .agents/rounds/2026-11-14-golden-coverage-audit/gaps/GAPS.md."
  - upstream issue filed 2026-11-14: https://github.com/stellar/stellar-docs/issues/3145
---

## Finding

Stellar Docs do not state what happens when a contract is built for a newer protocol than the
network runs.

The Environment Meta section says the interface version "should match the version of the host
functions supported." It does not state the rule or the error. The host enforces a precise rule. It
accepts a contract built for the same protocol or an older one. It rejects a contract built for a
newer protocol with `contract protocol number is newer than host`.

Developers meet this error when a new SDK release arrives before a network upgrades. Testnet
upgrades before Mainnet, so a contract can work on Testnet and fail on Mainnet. The upgrade guides
cover only the opposite case, an SDK that is too old.

## Evidence

Read-only reproduction:

```sh
curl -sS https://developers.stellar.org/docs/learn/fundamentals/contract-development/overview.md | grep -n -i -e "interface version" -e "newer"
curl -sS https://raw.githubusercontent.com/stellar/rs-soroban-env/main/soroban-env-host/src/vm/parsed_module.rs | grep -n "newer than host"
```

The first command returns only the "should match" sentence. The second returns the host error.

## Recommendation

Add these sentences to the Environment Meta section:

> The host compares the protocol number in this section with the protocol version of the ledger.
> It accepts a contract built for the same protocol or an older one. It rejects a contract built for
> a newer protocol with the error `contract protocol number is newer than host`. Build with the SDK
> release that matches the target network. The Software Versions page lists those releases.

Add one sentence to the introduction of the Software Versions page: a contract built with an SDK
for a later protocol does not work on a network that still runs an earlier protocol.
