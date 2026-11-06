---
id: cs-004
service: canonical-source
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "CCTP Stellar contracts reference names handle_receive_* but the deployed TokenMessengerMinter exposes handle_recv_*"
probe:
  type: http-text
  url: https://developers.circle.com/cctp/references/stellar-contracts.md
  expect:
    status: 200
    contains:
      - "handle_receive_finalized_message"
evidence:
  - "2026-11-02T17:20Z live read: https://developers.circle.com/cctp/references/stellar-contracts.md (HTTP 200) lists '| `handle_receive_finalized_message` | Mints USDC upon receiving a fully finalized message. | Called by `MessageTransmitter`. |' and '| `handle_receive_unfinalized_message` | Processes partially finalized (\"Fast Burn\") messages. |'. The page has no handle_recv_ spelling."
  - "Source: circlefin/stellar-cctp master 45746f2c803198bc6cd586475eb3c925f12bb488 (2026-06-18). packages/cctp-interfaces/src/message_handler.rs:40 'fn handle_recv_finalized_message(' and :63 'fn handle_recv_unfinalized_message('. contracts/token-messenger-minter-v2/src/contract.rs:375 and :428 implement the same names."
  - "2026-11-02T17:21Z deployed interface: stellar contract info interface --contract-id CAE2G5Z77UP7GYPYGFOWFGW7C7J6I4YP2AFGSADRKQY62SYUFLPNFTXL --rpc-url https://mainnet.sorobanrpc.com (stellar-cli 28.1.0; the mainnet TokenMessengerMinter ID from the same Circle page) returns 'fn handle_recv_finalized_message(' and 'fn handle_recv_unfinalized_message(' and no handle_receive_ function."
  - "2026-11-02T20:11Z recheck: page lines 84-85 unchanged; stellar contract info interface (stellar 28.1.0) on the mainnet TokenMessengerMinter still returns only handle_recv_finalized_message and handle_recv_unfinalized_message. gh search code finds handle_receive_finalized_message in circlefin/solana-cctp-contracts (Solana V2), not in circlefin/stellar-cctp."
  - "Dedupe 2026-11-02: circlefin/stellar-cctp issues and PRs (state all) contain no report about handler names or this docs page. Circle publishes no public repository for developers.circle.com content; circlefin/docs-examples holds code samples only."
  - "Golden consumer: eval/qa/corpus/battery/tooling-infra/q-tool-cctp-stellar-integration.json answer and keyFacts tell the answerer to use the deployed handle_recv_* names amid the docs contradiction."
  - upstream issue filed 2026-11-02: https://github.com/circlefin/stellar-cctp/issues/36
recurrences:
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: GET Circle stellar-contracts.md; current interface source; stellar contract info interface on mainnet contract CAE2G5Z77UP7GYPYGFOWFGW7C7J6I4YP2AFGSADRKQY62SYUFLPNFTXL — Docs still both handle_receive_*; fresh deployed interface and source both handle_recv_*. Both functions checked. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row cs-004."
---

## Finding

Circle's CCTP Stellar contracts reference lists the `TokenMessengerMinter` receive handlers as
`handle_receive_finalized_message` and `handle_receive_unfinalized_message`. The source and the
deployed mainnet contract use `handle_recv_finalized_message` and `handle_recv_unfinalized_message`.
Only `MessageTransmitter` calls these handlers. An auditor or indexer who looks up the documented
names on the deployed contract finds no such function. The documented names are the Solana CCTP
V2 names.

developers.circle.com has no public content repository, so this report goes to the Stellar CCTP
repository. Please forward it to the CCTP documentation owners.

## Evidence

- Page: <https://developers.circle.com/cctp/references/stellar-contracts> (HTTP 200 on 2026-11-02).
- Source: `circlefin/stellar-cctp` at `45746f2c`, `packages/cctp-interfaces/src/message_handler.rs`
  lines 40 and 63.
- Deployed interface, read-only:

  ```sh
  stellar contract info interface \
    --contract-id CAE2G5Z77UP7GYPYGFOWFGW7C7J6I4YP2AFGSADRKQY62SYUFLPNFTXL \
    --rpc-url https://mainnet.sorobanrpc.com \
    --network-passphrase "Public Global Stellar Network ; September 2015" | grep 'fn handle'
  ```

  The output has `fn handle_recv_finalized_message(` and `fn handle_recv_unfinalized_message(`.

## Recommendation

Rename the two rows on the Stellar contracts reference to `handle_recv_finalized_message` and
`handle_recv_unfinalized_message`. Check other Stellar CCTP pages for the same spelling.
