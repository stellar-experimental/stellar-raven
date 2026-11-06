---
id: sd-096
service: stellar-docs
status: declined-upstream
discovered: 2026-11-03
disposition: "ElliotFriend declined on 2026-11-05: these source URLs never existed; reconsider only with real traffic/link evidence. https://github.com/stellar/stellar-docs/issues/3028#issuecomment-6665776744"
upstreamTitle: Wildcard redirects accept three nonexistent source paths and lead to 404 pages
evidence:
  - "2026-11-03T19:02:10Z GET https://developers.stellar.org/docs/build/apps/smart-wallets/recovery returned HTTP 308 to https://developers.stellar.org/docs/build/guides/contract-accounts/recovery, which returned HTTP 404."
  - "2026-11-03T19:02:10Z GET https://developers.stellar.org/docs/build/apps/smart-wallets/fee-sponsorship returned HTTP 308 to https://developers.stellar.org/docs/build/guides/contract-accounts/fee-sponsorship, which returned HTTP 404."
  - "2026-11-03T19:02:10Z GET https://developers.stellar.org/docs/learn/encyclopedia/contract-development/contract-interactions/stellar-ecosystem-proposals returned HTTP 308 to https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/stellar-ecosystem-proposals, which returned HTTP 404."
  - "stellar/stellar-docs main 51c89c4ff5cc057ffb391f66915929dc2377ccc6 redirects.json line 2383 maps /docs/build/apps/smart-wallets/:slug* to /docs/build/guides/contract-accounts/:slug*, and line 2607 maps /docs/learn/encyclopedia/contract-development/:slug* to /docs/learn/fundamentals/contract-development/:slug*. No more specific rule exists for the three paths. docs/build/guides/contract-accounts/ holds only advanced-patterns, examples, index, and smart-wallets; docs/learn/fundamentals/contract-development/contract-interactions/ has no stellar-ecosystem-proposals page."
  - "Current pages that hold the same content, each HTTP 200 on 2026-11-03: https://developers.stellar.org/docs/build/guides/contract-accounts/advanced-patterns (recovery authority), https://developers.stellar.org/docs/build/guides/transactions/fee-sponsorship, and https://developers.stellar.org/docs/learn/fundamentals/stellar-ecosystem-proposals."
  - "Prevalence: redirects.json has 1618 rules, 153 of them with wildcard or parameter destinations. All 984 distinct fixed destinations returned HTTP 200 (one external 307), so the failures come only from wildcard expansion. Of the 11 redirected golden source URLs in Raven's 2026-11-02 page-coverage check, 3 hit this defect."
  - "Found by Raven's golden source repair, .agents/rounds/2026-11-03-golden-urls.md (golden cases q-passkey-wallet-recovery, q-smart-wallet-fee-sponsorship, and q-protocol-cap-vs-sep now cite the current pages)."
  - upstream issue filed 2026-11-03: https://github.com/stellar/stellar-docs/issues/3028
recurrences:
  - date: 2026-11-06
    evidence: "All3 paths still308→404. NEW explicit ElliotFriend Nov5 decline: never real pages; independent GitHub commits?path checks for .md/.mdx return0 for all6. Original old-link regression premise unsupported. Exact URLs and upstream state: .agents/rounds/2026-11-05-truth-maintenance/docs.md, row sd-096"
---

## Finding

Three invented source paths redirect to pages that do not exist. The original old-page premise was incorrect; the maintainer confirmed these paths never existed.
Two wildcard rules in `redirects.json` cause this.
`/docs/build/apps/smart-wallets/:slug*` maps to `/docs/build/guides/contract-accounts/:slug*`, but that folder has no `recovery` or `fee-sponsorship` page.
`/docs/learn/encyclopedia/contract-development/:slug*` maps to `/docs/learn/fundamentals/contract-development/:slug*`, but that folder has no `contract-interactions/stellar-ecosystem-proposals` page.
A request to one of these paths gets HTTP 308 and then HTTP 404. No real historic inbound link has been demonstrated.
The open request stellar/stellar-docs#2883 asks for a general redirect check; this finding names three concrete failures.

## Evidence

See the frontmatter evidence.

## Recommendation

No change is requested without evidence of real traffic or inbound links. The owner declined adding redirects for nonexistent pages. If new traffic evidence justifies explicit rules, the candidate destinations are:

- `/docs/build/apps/smart-wallets/recovery` to `/docs/build/guides/contract-accounts/advanced-patterns`
- `/docs/build/apps/smart-wallets/fee-sponsorship` to `/docs/build/guides/transactions/fee-sponsorship`
- `/docs/learn/encyclopedia/contract-development/contract-interactions/stellar-ecosystem-proposals` to `/docs/learn/fundamentals/stellar-ecosystem-proposals`

Optional: check each wildcard rule against the page tree, so an expansion cannot land on a missing page.
