---
id: sd-113
service: stellar-docs
status: verified
discovered: 2026-11-17
upstreamTitle: "Net-new content request: no Stellar page says that Pi Network is a separate network"
evidence:
  - "2026-11-17 Canonical source, read live: https://minepi.com/white-paper/ (HTTP 200, Pi Network's own white paper). It says the Stellar Consensus Protocol \"emerges as the leading candidate to enable user-friendly, mobile-first mining\", and it names \"the Pi blockchain\" and \"the Pi network\" as its own system. It also says \"One ambition of the Pi project is to scale the number of nodes in the Pi network to be larger than the number of nodes in the Stellar network\". The white paper treats Pi and Stellar as two networks that share a consensus protocol."
  - "2026-11-17 No Stellar page names Pi Network. stellarDocs.search_docs for \"Pi Network\" and for \"Pi coin send to Stellar address separate network\" returns network-passphrase, quickstart, and transaction pages with no Pi text. A text scan of the 196 pages listed in https://developers.stellar.org/llms.txt finds no \"Pi Network\", \"Pi coin\", or minepi.com. GitHub code search for \"Pi Network\" in stellar/stellar-docs and in stellar/stellar-protocol returns 0 files. https://stellar.org/sitemap.xml holds no pi-network URL. stellarOrg.search_site for \"Pi Network\" returns no row, and for \"Pi cryptocurrency Stellar fork\" returns an empty list."
  - "2026-11-17 Scout research and Lumenloop semantic search for \"Pi Network Stellar\" and \"Pi Network Stellar fork consensus\" return SCP articles and Stellar roundups. No returned row mentions Pi Network."
  - "Host page: none. No stellar.org or developers.stellar.org page undertakes to compare Stellar with other networks or to answer \"is this coin on Stellar\". stellarOrg.search_site for \"frequently asked questions\" and \"is this coin on Stellar\" returns no FAQ page. The nearest pages are \"Guide to Stellar\" and \"Intro to the Stellar Network\". They describe Stellar only."
  - "Classification: site-content, net-new content request. The finding is not a defect in an existing page. The Pi-side facts belong to Pi Network. The Stellar-side ask is one FAQ line."
  - "Not posted and not forwarded (owner, 2026-11-17): out of scope for stellar.org; Pi Network owns the fact. No owner page undertakes the topic."
---

## Finding

This is a net-new content request. No page on stellar.org or developers.stellar.org says that Pi
Network is a different network from Stellar. A reader who sees "Pi" next to "Stellar Consensus
Protocol" cannot learn from Stellar's own pages that the two networks are separate.

Pi Network's white paper uses the Stellar Consensus Protocol. It also describes "the Pi blockchain"
and "the Pi network" as its own system, with its own nodes. The Stellar network is a different
set of nodes and a different ledger.

The user impact is a wrong-chain mistake: a reader may treat a Pi balance or address as a Stellar
one.

## Evidence

Read-only reproduction:

```sh
curl -sS -L https://minepi.com/white-paper/ | grep -o -i 'number of nodes in the Pi network[^.]*Stellar network'
curl -sS https://developers.stellar.org/llms.txt          # then fetch each listed page and search for "Pi Network"
gh api -X GET search/code -f q='"Pi Network" repo:stellar/stellar-docs' --jq .total_count    # 0
```

No Stellar page undertakes this topic today, so there is no page to correct.

## Recommendation

Add one question to an SDF FAQ, or to the stellar.org "Intro to the Stellar Network" page:

> Is Pi Network part of Stellar? No. Pi Network runs its own blockchain and its own nodes. It
> uses the Stellar Consensus Protocol, but it is not the Stellar network. A Pi balance is not an
> XLM or Stellar asset balance.

Pi Network's documentation owns the facts about Pi. Link its white paper as the source.
