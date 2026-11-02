---
id: ll-033
service: lumenloop
status: verified
discovered: 2026-11-02
upstreamTitle: The slender directory record says Slender lends without collateral
evidence:
  - "2026-11-02T17:17:23Z authenticated POST https://api.lumenloop.com/v1/tools/get_project with {\"slug\":\"slender\"}: description \"Slender is a decentralized lending protocol built on the Stellar blockchain, enabling users to lend and borrow assets without collateral.\""
  - "2026-11-02 committed record https://github.com/lumenloop/stellar-ecosystem-db/blob/main/projects/slender.yaml (blob b00d19533e, last commit 43ba5dcd9f on 2026-06-29) carries the same sentence"
  - "Primary audit (class B), Certora Slender report 2024-05-22, https://www.certora.com/reports/slender: \"Users are able to borrow assets from the protocol via an over-collateralized loan which issues them a dToken (debt token).\""
  - "Operator site https://slender.fi/, dated cached copy (class D, Parallel web_fetch cache, acquired 2026-08-08; read 2026-11-02): \"Flash loans — Borrow and repay in the same block with no collateral\"; the no-collateral wording applies to flash loans only"
  - "2026-11-02 dig slender.fi @1.1.1.1 returned status NXDOMAIN, so the live operator site cannot be read; the quote above comes only from the 2026-08-08 cached copy"
  - "Third-party corroboration (class D), https://defillama.com/protocol/slender (read 2026-11-02): \"Slender is a noncustodial overcollateralized lending protocol on Soroban (Stellar).\""
  - "Affected golden case: eval/qa/corpus/battery/defi-ecosystem/q-defi-blend-alternatives.json"
  - "Intake note: this is a committed directory-record correction; the owner repo is lumenloop/stellar-ecosystem-db (intake.json per-finding override added)"
---

## Finding

The Lumenloop directory record `slender` says that Slender lets users "lend
and borrow assets without collateral". This statement is incorrect for normal
borrowing.

Slender's audit report describes "an over-collateralized loan". A cached copy
of the Slender site (2026-08-08) uses "no collateral" only for flash loans. A
flash loan is borrowed and repaid in the same block.

An agent that reads the record can describe Slender as an uncollateralized
credit protocol. That description misstates the risk model of the protocol.

## Evidence

The live call ran on 2026-11-02 with a read-only request.
`POST /v1/tools/get_project` with `{"slug":"slender"}` returned this text:

```text
Slender is a decentralized lending protocol built on the Stellar blockchain,
enabling users to lend and borrow assets without collateral.
```

The committed source is `projects/slender.yaml` in
`lumenloop/stellar-ecosystem-db`. It carries the same sentence.

The Certora audit report (2024-05-22) states: "Users are able to borrow assets
from the protocol via an over-collateralized loan". The report also describes
liquidation of positions whose debt exceeds the collateral value.

A cached copy of the Slender site (2026-08-08) lists "Flash loans" with the
text "Borrow and repay in the same block with no collateral". The `slender.fi`
domain did not resolve on 2026-11-02. DefiLlama describes Slender as "a
noncustodial overcollateralized lending protocol".

## Recommendation

Change the description in `projects/slender.yaml`. State that Slender is an
overcollateralized lending protocol. State that flash loans are the only
product that needs no collateral.

Check other lending records for the same flash-loan wording. Apply the same
correction where a record generalizes flash-loan terms to all borrowing.
