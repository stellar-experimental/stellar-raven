---
id: sd-106
service: stellar-docs
status: verified
discovered: 2026-11-14
upstreamTitle: Tier 1 Organizations page does not name the current Tier 1 organizations
probe:
  type: http-text
  url: https://developers.stellar.org/docs/validators/tier-1-orgs.md
  expect:
    status: 200
    excludes:
      - "Blockdaemon"
      - "Franklin Templeton"
evidence:
  - "2026-11-14T05:10Z GET https://developers.stellar.org/docs/validators/tier-1-orgs.md returned HTTP 200 (16,077 bytes). The text contains neither Blockdaemon nor Franklin Templeton. It refers to \"current Tier 1 operators\" and \"current Tier 1 organizations\" in the cost section and names none of them."
  - "Source: stellar/stellar-docs main 62f29bbbfef70a7b79cf6d632e750bf51e768f95, docs/validators/tier-1-orgs.mdx (179 lines). Lines 47, 55, and 71 refer to current Tier 1 organizations. The Resources table links Obsrvr Radar and the stellar/packages example configuration. No line lists the organizations."
  - "2026-11-14T05:04:48Z Raven execute: stellarDocs.get_doc_page({path:'/docs/validators/tier-1-orgs'}) returned 18,903 characters with no organization named except Obsrvr as the owner of Radar. stellarDocs.search_docs('current Tier 1 validator organizations list') ranked this page first. scout.searchResearch and lumenloop.search_content_semantic returned the SDF press release of 2026-07-16 (three of ten names), an SDF blog post of 2026-08-11, and a 2024 Obsrvr post. No source returned the full current set."
  - "Current set, 2026-11-14: stellar/packages docs/examples/pubnet-validator-full/stellar-core.cfg lists ten HOME_DOMAIN values: www.stellar.org, stellar.blockdaemon.com, www.franklintempleton.com, lobstr.co, publicnode.org, stellar.creit.tech, stellar.withobsrvr.com, www.ylds.com, moneygram.com, stellar.validator.range.org. Commit b78a86f233 (2026-07-14) replaced SatoshiPay with OBSRVR. Commit e3a92b9d74 (2026-08-25) added Figure (YLDS), MoneyGram, and Range."
  - "Second witness for the set: the round's verify lane read the same ten organizations from Obsrvr Radar's transitive quorum set on 2026-11-14 (.agents/rounds/2026-11-14-golden-coverage-audit/gap/verify-gap.json, q-net-tier1-roster-current)."
  - "Classification: docs-content. The page title and description define Tier 1 organizations, and the page says \"The standard Tier 1 quorum set configuration is updated to include your organization\", but it never shows the set."
  - "Affected golden case: eval/qa/corpus/battery/protocol-core/q-net-tier1-roster-current.json. Ledger: .agents/rounds/2026-11-14-golden-coverage-audit/gaps/GAPS.md."
---

## Finding

The Tier 1 Organizations page explains the role, the cost, and the path to join. It does not say
which organizations are Tier 1 today.

The page refers to "current Tier 1 organizations" several times. It links Obsrvr Radar and the
example Mainnet validator configuration only in the Resources table. It does not say that those two
sources show the current set.

A reader who asks "who are the Tier 1 validators" finds this page first and gets no answer. Older
press and blog posts then fill the gap. Those sources still name SatoshiPay, which left the set in
July 2026.

## Evidence

Read-only reproduction:

```sh
curl -sS https://developers.stellar.org/docs/validators/tier-1-orgs.md | grep -c -e Blockdaemon -e "Franklin Templeton"
curl -sS https://raw.githubusercontent.com/stellar/packages/master/docs/examples/pubnet-validator-full/stellar-core.cfg | grep '^HOME_DOMAIN=' | sort -u
```

The first command prints `0`. The second prints the ten home domains of the current set.

## Recommendation

Add a short section named "Current Tier 1 organizations" near the top of the page.

1. State that the set changes, and that Obsrvr Radar's network quorum set is the live view.
2. State that the example configuration in `stellar/packages` lists the same set.
3. Give a dated list. As of 2026-11-14 the set is: SDF, Blockdaemon, Franklin Templeton, LOBSTR,
   Public Node, Creit Technologies, OBSRVR, Figure (YLDS), MoneyGram, and Range.
4. Add a "Last reviewed" date, as the cost table already does.

If the team prefers no list in the docs, add steps 1 and 2 only.
