---
id: sd-109
service: stellar-docs
status: verified
discovered: 2026-11-14
upstreamTitle: Passkeys prerequisites page says Friendbot cannot fund a contract address
probe:
  type: http-text
  url: https://developers.stellar.org/docs/build/apps/guestbook/passkeys-prerequisites.md
  expect:
    status: 200
    contains:
      - "only funds classic"
evidence:
  - "2026-11-14 GET https://developers.stellar.org/docs/build/apps/guestbook/passkeys-prerequisites.md returned HTTP 200. Line 49 says: \"Friendbot only funds classic `G...` accounts, so it can't top up a `C...` contract address directly.\""
  - "Source: stellar/stellar-docs main 62f29bbbfef70a7b79cf6d632e750bf51e768f95, docs/build/apps/guestbook/passkeys-prerequisites.mdx line 50 (file last changed 2026-11-10 by #3087)."
  - "Same site, opposite claim: docs/networks/index.mdx line 37 at the same commit says \"Friendbot is a bot that funds accounts and contracts with fake XLM on Testnet or Futurenet.\" docs/tools/quickstart/faucet.mdx line 8 says Friendbot \"can be used to fund accounts and contracts\" (added 2025-12-16 by #2136, \"Document Friendbot contract funding support\")."
  - "Friendbot source: stellar/friendbot main, internal/friendbot_handler.go lines 108 to 111 accept a valid C address when the deployment enables `fund_contract_addresses`. The feature landed in stellar/friendbot#21 (2025-12-15). README line 39: \"The Stellar address to fund (account G... address, or contract C... address)\"."
  - "2026-11-14T20:26:23Z live test. GET https://friendbot.stellar.org/?addr=CALMAURYIR6LLJWOSEKKSKWB75BAR5LRXZWFCVOXP246WHL4P44MN6MB returned HTTP 200 \"successful\": true, hash 191ea1c8b23cf887bbe9d49db8c5e4efae1f81bd7a11e3116e7eecb62a8e8e51. RPC getTransaction on https://soroban-testnet.stellar.org returned SUCCESS at ledger 5732868. The envelope invokes the native asset contract `transfer` for 10,000 XLM to the C address."
  - "2026-11-14 the same request to https://friendbot-futurenet.stellar.org returned HTTP 200 \"successful\": true, hash d2a93391edfb847f646f40c6d6a8ec57e0733a621af26415b61eb3378d1958a1. RPC getTransaction on https://rpc-futurenet.stellar.org returned SUCCESS at ledger 1613141."
  - "2026-11-14 gh search code in stellar/stellar-docs: \"only funds classic\" matches only docs/build/apps/guestbook/passkeys-prerequisites.mdx."
  - "Classification: docs-content. The page states a Friendbot limit that the deployed Friendbot no longer has and that two other Docs pages contradict."
  - "Affected golden case: eval/qa/corpus/battery/tooling-infra/q-infra-testnet-vs-futurenet.json (grading caution). Ledger: .agents/rounds/2026-11-14-baseline-tuning/CASE-DEFECTS.md."
---

## Finding

The passkeys prerequisites page says that Friendbot cannot fund a contract address. That is no
longer true. The Testnet and Futurenet Friendbots fund a `C...` contract address directly.

The page says: "Friendbot only funds classic `G...` accounts, so it can't top up a `C...`
contract address directly." The Networks page and the Quickstart faucet page say that Friendbot
funds accounts and contracts. A reader gets two opposite answers from the same site.

## Evidence

Read-only check of the page text:

```sh
curl -sS https://developers.stellar.org/docs/build/apps/guestbook/passkeys-prerequisites.md | grep -n "only funds classic"
curl -sS https://developers.stellar.org/docs/networks.md | grep -n "funds accounts and contracts"
```

Live behavior on 2026-11-14 (Testnet, free):

```sh
curl -sS "https://friendbot.stellar.org/?addr=<any C... address>"
```

The request returned `"successful": true`. The transaction calls the native asset contract
`transfer` and sends 10,000 XLM to the contract address. RPC `getTransaction` reports `SUCCESS`.
Futurenet gave the same result.

Friendbot added contract address funding in stellar/friendbot#21 (2025-12-15). The Docs recorded
it in #2136 (2025-12-16).

## Recommendation

Replace the first sentence of the funding paragraph with:

> Friendbot can fund a `C...` contract address directly on Testnet and Futurenet.

Then keep or remove the Smart Account Kit explanation. If the kit still funds through a temporary
account, state the reason without the Friendbot limit.
