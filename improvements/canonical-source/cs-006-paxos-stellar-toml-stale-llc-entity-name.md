---
id: cs-006
service: canonical-source
status: verified
discovered: 2026-11-02
upstreamTitle: "Paxos stellar.toml ORG_DESCRIPTION still names Paxos Trust Company LLC after the conversion to Paxos Trust Company, N.A."
probe:
  type: http-text
  url: https://token-metadata.paxos.com/.well-known/stellar.toml
  expect:
    status: 200
    contains:
      - "Paxos Trust Company LLC is"
evidence:
  - "2026-11-02T17:22Z GET https://token-metadata.paxos.com/.well-known/stellar.toml returns HTTP 200 with ORG_NAME=\"Paxos Trust Company\" and ORG_DESCRIPTION=\"Paxos Trust Company LLC is a prudentially regulated stablecoin issuer, powering PYUSD \"."
  - "2026-11-02T17:23Z GET https://www.paxos.com/newsroom/occ-approves-paxos-application-to-convert-to-occ-trust-paxos-to-complete-conversion-imminently-to-become-a-federally-regulated-blockchain-infrastructure-provider returns HTTP 200 with 'Update: Paxos officially converted its New York Department of Financial Services (NYDFS) limited purpose trust charter to a national trust charter overseen by the U.S. Office of the Comptroller of the Currency (OCC) on December 12, 2025.' The page footer says '© 2026 Paxos Trust Company, N.A.'"
  - "Independent primary source: the OCC decision letter of 2025-12-12, https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-125e.pdf, says 'The converted bank will operate under the title of Paxos Trust Company, National Association (Bank) under OCC Charter Number 25379.' (Parallel web_search excerpt, 2026-11-02.)"
  - "Owner: Paxos serves this stellar.toml from token-metadata.paxos.com. No public repository holds it: the paxosglobal GitHub repositories found on 2026-11-02 (paxos-token-contracts, stellar-paxos-token-contracts, stellar-render) do not contain the file. The file lists ORG_OFFICIAL_EMAIL=\"support@paxos.com\"."
  - "Golden consumers: eval/qa/corpus/battery/defi-ecosystem/q-eco-pyusd-stellar-freshness.json and q-eco-stablecoins-on-stellar.json cite this stellar.toml as 'stale wording' next to the N.A. entity name."
---

## Finding

The SEP-1 `stellar.toml` that Paxos publishes for its Stellar assets describes the issuer as
"Paxos Trust Company LLC". Paxos converted that LLC to a national trust bank on December 12, 2025.
The current legal name is "Paxos Trust Company, N.A." The `ORG_NAME` field is not wrong, but the
`ORG_DESCRIPTION` sentence names an entity that no longer exists in that form.

## Evidence

- `curl -s https://token-metadata.paxos.com/.well-known/stellar.toml | grep ORG_` shows
  `ORG_DESCRIPTION="Paxos Trust Company LLC is a prudentially regulated stablecoin issuer, powering PYUSD "`.
- The Paxos newsroom update and the paxos.com footer use "Paxos Trust Company, N.A.".
- The OCC decision letter names the converted bank "Paxos Trust Company, National Association".

Wallets, explorers, and agents read `stellar.toml` as the issuer's own statement. A stale entity
name there conflicts with the issuer's current legal identity.

## Recommendation

Change `ORG_DESCRIPTION` to name "Paxos Trust Company, N.A." Optionally, set `ORG_NAME` to the same
full legal name so that both fields agree.
