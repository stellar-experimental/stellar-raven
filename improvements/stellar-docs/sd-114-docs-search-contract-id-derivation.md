---
id: sd-114
service: stellar-docs
status: verified
discovered: 2026-11-20
upstreamTitle: "Docs search omits the Stellar Transaction page for contract ID derivation queries"
evidence:
  - "2026-11-20 POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation with body {\"query\": \"how is a Soroban contract ID derived\", \"pageSize\": 50} returned HTTP 200 and 40 sections. None of them is from /docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction. /docs/tokens/stellar-asset-contract ranked 31st."
  - "Same day, same endpoint, body {\"query\": \"how is a Soroban contract ID calculated from deployer address and salt\", \"pageSize\": 50} returned HTTP 200 and 35 sections. None is from /docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction. The top two pages are /docs/build/smart-contracts/example-contracts/deployer and /docs/build/guides/conventions/deploy-contract, which do not state the SHA-256 or HashIDPreimage formula. /docs/tokens/stellar-asset-contract ranked 14th."
  - "Same day, same endpoint, body {\"query\": \"Soroban contract ID derivation sha256 network identifier\", \"pageSize\": 50} returned HTTP 200 and 50 sections. /docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction ranked 16th (rank 15 in Raven stellarDocs.search_docs after excluding /meetings/), and /docs/tokens/stellar-asset-contract ranked 47th. Body {\"query\": \"contract ID preimage network ID\", \"pageSize\": 50} returned 50 sections with those pages at ranks 19 and 32. Body {\"query\": \"how are Soroban contract addresses derived\", \"pageSize\": 50} returned 46 sections with those pages at ranks 36 and 21."
  - "Same day, same endpoint, bare XDR identifier controls returned /docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction at rank 1 and /docs/tokens/stellar-asset-contract at rank 3: {\"query\": \"contractIDPreimage\", \"pageSize\": 50} (50 sections) and {\"query\": \"HOST_FUNCTION_TYPE_CREATE_CONTRACT\", \"pageSize\": 50} (50 sections)."
  - "2026-11-20 GET https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction.md returned HTTP 200. Under ### InvokeHostFunctionOp -> #### Function -> item 3 (HOST_FUNCTION_TYPE_CREATE_CONTRACT), it defines ContractIDPreimage (CONTRACT_ID_PREIMAGE_FROM_ADDRESS and CONTRACT_ID_PREIMAGE_FROM_ASSET) and states: \"The final contract identifier is created by computing SHA-256 of this together with the network identifier as a part of HashIDPreimage\" (ENVELOPE_TYPE_CONTRACT_ID). That explanation has no dedicated heading."
  - "All queries also ran through Raven stellarDocs.search_docs (hitsPerPage 20). The results match the direct Mintlify calls: all five natural derivation queries omit both pages from the top 10, while both XDR identifier queries rank stellar-transaction 1st. Raven path scoping does not hide the page."
  - "Verified locally on 2026-11-20; not yet posted upstream pending review."
---

## Finding

Docs search omits or buries `/docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction`
for natural questions about Soroban contract ID derivation. That page is the one canonical docs
page that defines the full derivation formula. It specifies `ContractIDPreimage`, `HashIDPreimage`,
`ENVELOPE_TYPE_CONTRACT_ID`, and the SHA-256 hash with `networkID`.

The same search ranks that page first for the exact XDR symbols `contractIDPreimage` and
`HOST_FUNCTION_TYPE_CREATE_CONTRACT`. It omits the page completely for
`how is a Soroban contract ID derived`. It also omits the page for
`how is a Soroban contract ID calculated from deployer address and salt`. Even
`Soroban contract ID derivation sha256 network identifier` places it 16th of 50 sections.

A developer asking how contract IDs are derived gets deployer guides and EVM migration pages. Those
top pages mention deployer address and salt, but they omit SHA-256, `HashIDPreimage`, and
`networkID`. Readers miss the exact formula unless they already know the XDR symbol name.

## Evidence

Read-only reproduction:

```sh
curl -sS -X POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation \
  -H "Authorization: Bearer $MINTLIFY_ASSISTANT_API_KEY" -H 'Content-Type: application/json' \
  -d '{"query":"how is a Soroban contract ID derived","pageSize":50}'
# 40 sections; 0 from .../stellar-transaction; /docs/tokens/stellar-asset-contract at rank 31

curl -sS -X POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation \
  -H "Authorization: Bearer $MINTLIFY_ASSISTANT_API_KEY" -H 'Content-Type: application/json' \
  -d '{"query":"how is a Soroban contract ID calculated from deployer address and salt","pageSize":50}'
# 35 sections; 0 from .../stellar-transaction; /docs/tokens/stellar-asset-contract at rank 14

curl -sS -X POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation \
  -H "Authorization: Bearer $MINTLIFY_ASSISTANT_API_KEY" -H 'Content-Type: application/json' \
  -d '{"query":"Soroban contract ID derivation sha256 network identifier","pageSize":50}'
# 50 sections; .../stellar-transaction at rank 16; /docs/tokens/stellar-asset-contract at rank 47

curl -sS -X POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation \
  -H "Authorization: Bearer $MINTLIFY_ASSISTANT_API_KEY" -H 'Content-Type: application/json' \
  -d '{"query":"contractIDPreimage","pageSize":50}'
# 50 sections; .../stellar-transaction at rank 1; /docs/tokens/stellar-asset-contract at rank 3
```

The derivation formula sits inside `#### Function` on `stellar-transaction.md`, past line 580. It
has no dedicated heading for contract ID derivation.

## Recommendation

Add a dedicated heading such as `##### Contract ID Derivation` to the derivation block in
`docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction.mdx`. Use
the phrase "contract ID derivation" in its opening sentence alongside `ContractIDPreimage`,
`HashIDPreimage`, and SHA-256.

Link to that section from `/docs/build/smart-contracts/example-contracts/deployer` and
`/docs/build/guides/conventions/deploy-contract`. Place the link where each page states that
contract addresses derive from deployer address and salt. Then verify that Mintlify search places
the section in the top 5 for `how is a Soroban contract ID derived`.
