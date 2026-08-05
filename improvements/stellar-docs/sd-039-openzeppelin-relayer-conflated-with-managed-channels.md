---
id: sd-039
service: stellar-docs
status: reported-upstream
discovered: 2026-07-27
upstreamTitle: Separate the self-hosted OpenZeppelin Relayer from the managed Stellar Channels service in Tools docs
evidence:
  - eval round 2026-07-27 QA sample-30, results stamp 2026-07-27T22-50-16-variantA.json, case q-ti-openzeppelin-relayer graded wrong with 3 missing facts and 2 wrong claims
  - 2026-07-27 live production stellarDocs.search_sdk_cli_tools_docs({ query "managed Channels", hitsPerPage 15, includeContent true }) returned the alias framing on both /docs/tools and /docs/tools/openzeppelin-relayer
  - 2026-07-27 live production scout.searchRepos({ query "openzeppelin relayer", limit 100 }) returned the canonical OpenZeppelin/openzeppelin-relayer Rust repository, indexed activity 2026-07-14
  - 2026-07-27 live production scout.explainRepo against that repo reported a self-hosted AGPL-3.0 service run via Cargo or Docker Compose with operator-owned .env/config.json, and an operator-controlled and operator-funded Stellar fee account
  - 2026-07-27 live production scout.searchResearch returned /docs/build/agentic-payments/x402, which already states the x402 plugin uses the Relayer framework and leverages managed Channels underneath
  - filed upstream 2026-07-28: https://github.com/stellar/stellar-docs/issues/2707
recurrences:
  - date: 2026-08-04
    evidence: eval/qa/results/2026-08-04T22-02-07-variantA.json q-smart-wallet-fee-sponsorship repeated the served dapp skill's "Relayer (also called Stellar Channels Service)" alias, showing the product-identity error propagates beyond the two Tools pages
  - date: 2026-08-04
    evidence: eval/qa/results/2026-08-04T23-40-37-variantA.json q-ti-openzeppelin-relayer again conflated self-hosted Relayer and managed Channels; current OpenZeppelin release v1.7.0 and rendered 1.5.x docs preserve the need for dated, source-specific product boundaries
---

## Finding

The current Tools documentation presents "OpenZeppelin Relayer" and the managed
Stellar Channels service as the same product. Both `/docs/tools` and
`/docs/tools/openzeppelin-relayer` carry the framing that OpenZeppelin Relayer
is "also known as Stellar Channels Service, … managed infrastructure".

OpenZeppelin's canonical `openzeppelin-relayer` repository is a distinct,
self-hostable AGPL-3.0 service. Its operator runs it via Cargo or Docker
Compose, owns the configuration, holds signer authority, and funds the Stellar
account that pays fees.

Collapsing the two hides materially different contracts along every axis a
builder must decide on: who hosts it, who holds signer authority, who funds the
fee account and tops it up, how billing works, which networks are supported,
and whose status page covers it. An agent grounded entirely in official Docs
therefore gives wrong funding and top-up guidance while correctly citing its
source — the failure mode is invisible to the reader because the citation is
genuine.

The docs already demonstrate the correct distinction elsewhere:
`/docs/build/agentic-payments/x402` describes the x402 plugin as using the
Relayer framework while leveraging managed Channels underneath. The Tools pages
have not adopted that separation.

## Evidence

All probes are free production operations observed 2026-07-27.

The alias framing appears on 2 of 2 directly relevant Tools pages:

```js
await stellarDocs.search_sdk_cli_tools_docs({
  query: "managed Channels", hitsPerPage: 15, includeContent: true
});
// → /docs/tools  and  /docs/tools/openzeppelin-relayer, both carrying
//   "OpenZeppelin Relayer, also known as Stellar Channels Service, is a
//    managed infrastructure …"
```

The contradicting canonical source is reachable and current:

```js
await scout.searchRepos({ query: "openzeppelin relayer", limit: 100 });
// → OpenZeppelin/openzeppelin-relayer, indexed activity 2026-07-14
await scout.explainRepo({
  repo: "OpenZeppelin/openzeppelin-relayer",
  q: "Is this self-hosted? What license? Who funds the Stellar fee account?"
});
// → self-hosted, AGPL-3.0, Cargo or Docker Compose, operator-owned
//   .env/config.json; operator controls and funds the Stellar account,
//   which needs sufficient XLM; relayer-paid vs user-token/fee-bump strategies
```

Prevalence: 2 of 2 Tools pages checked. The broader Docs corpus was not
exhaustively scanned, so this is a floor.

Explicitly not established by this finding, and left open rather than asserted:
the specific v1.6.0-versus-1.5.x version detail could not be verified from any
tested surface, and current managed-service provider health was not verifiable
— documented endpoint reachability is not the same as a working relay.

## Recommendation

For the Stellar Docs owner, cheapest fix first: rename or restructure the
managed-service page so "OpenZeppelin Relayer" and the managed Stellar
Channels offering are two named concepts rather than aliases, and remove the
"also known as" framing
from both Tools pages.

Then add a short comparison table covering the axes that actually differ: who
hosts, who holds signer authority, who funds the XLM fee account and how it is
topped up, billing model, supported networks, and the scope of any status or
health guarantee. Link the canonical self-hosted deployment and configuration
docs separately from the managed integration path.

Finally, date the mutable claims. Version numbers, supported networks, and
provider health are all observation-time facts; presenting them undated is what
lets a stale reading survive as current guidance.

Consumer-side workaround currently required: cross-check the Docs description
against the canonical `openzeppelin-relayer` repository before advising anyone
on funding or custody, which defeats the purpose of consulting official
documentation for a tools question.
