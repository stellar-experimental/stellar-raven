---
id: sd-108
service: stellar-docs
status: verified
discovered: 2026-11-14
upstreamTitle: Docs have no guidance on what to review before signing or how to treat unsolicited assets
evidence:
  - "2026-11-14T05:04:48Z Raven execute, signing: stellarDocs.search_docs('what to check before signing a transaction requested by a website') returned the agent CLI section 'Inspection before signing', 'Signing Soroban contract invocations', two x402 pages, and the Lab section 'Transaction Validation'. stellarDocs.search_wallet_dapp_docs('phishing blind signing verify domain before signing') returned the wallet SEP-7 and SEP-10 pages and two Varial developer guides. None lists what a person checks before approval."
  - "2026-11-14T05:04:48Z same run: scout.searchResearch (8 rows) returned Signatures and Multisig, SEP-0007, SEP-0008, CAP-0002, and build guides. lumenloop.search_content_semantic returned the SDF scam guide of July 2022 and two third-party wallet-security articles."
  - "2026-11-14T05:06:50Z Raven execute, unsolicited assets: stellarDocs.search_docs('unknown tokens appear in wallet unsolicited claimable balance safe to claim') returned the claimable balances guide and three Horizon reference pages. No returned text mentions unsolicited, spam, or airdropped assets. scout.searchResearch (6 rows) and lumenloop.search_content_semantic (6 rows) returned no guidance."
  - "2026-11-14 gh search code in stellar/stellar-docs, outside meetings: \"blind signing\" 0 results, \"unsolicited\" 0 results."
  - "Closest SDF source: https://stellar.org/blog/foundation-news/how-to-protect-yourself-from-scammers (updated July 2022). The round's verify lane quoted its advice on fake websites and secret keys (.agents/rounds/2026-11-14-golden-coverage-audit/gap/verify-gap.json, q-signing-safety-website-request). SEP-0007 requires a wallet to verify origin_domain, which covers the domain check only."
  - "The round's gap and verify lanes reached the same result on 2026-11-14 (gap/gap-1.json and gap/verify-gap.json). The taxonomy mapper found no canonical page for unsolicited assets (map/taxonomy.json, wallets.unsolicited-assets)."
  - "Classification: docs-content, missing guidance. Placement is a judgment: Stellar Docs already host the wallet tutorial, the SEP-7 guide, and the Varial signing guides, so signing review fits there. No canonical page exists elsewhere."
  - "Affected golden cases: eval/qa/corpus/battery/retail-consumer/q-signing-safety-website-request.json and eval/qa/corpus/battery/retail-consumer/q-raph-unsolicited-airdrop.json. Ledger: .agents/rounds/2026-11-14-golden-coverage-audit/gaps/GAPS.md."
---

## Finding

Stellar Docs explain how an application asks a wallet to sign. They do not explain what a person
or a wallet must review before approval.

The docs hold the wallet tutorial, the SEP-7 guide, and the Varial signing guides. The only review
guidance is "Inspection before signing" in the agent CLI guide, which addresses agents. No page
lists the checks for a signing request from a website. No page explains why unknown tokens and
claimable balances appear in an account, or how to treat them.

Both topics are frequent user questions. A wrong answer can cost the user the account.

## Evidence

Read-only reproduction against the docs repository:

```sh
gh search code "blind signing" --repo stellar/stellar-docs
gh search code "unsolicited" --repo stellar/stellar-docs
```

Neither search returns a documentation page. The docs search returns developer signing guides and
API reference pages for both questions.

## Recommendation

Add one page under Build > Apps > Wallet, for wallet developers and their users. Suggested outline:

1. **Before you sign.** Confirm the site domain and the selected network.
2. **Read every operation.** Check the destination, the asset code and issuer, and the amount.
3. **Operations that take control.** Explain `set_options` signer, weight, and threshold changes,
   and `account_merge`. State that these can hand over or close the account.
4. **Contract calls.** Check the contract, the function, and each authorized sub-invocation.
5. **Hash signing.** Do not sign a hash or any content that the wallet cannot display.
6. **Scan warnings.** A wallet warning helps. A missing warning does not prove safety.
7. **Unsolicited assets.** Anyone can create an asset or a claimable balance for any account.
   Receipt proves nothing about the sender. Verify the issuer through an independent source. A
   non-XLM asset needs a trustline, which adds a reserve.
8. **Never enter a secret key or recovery phrase** on a website.

Link the page from the Varial signing guides and from the SEP-7 guide.
