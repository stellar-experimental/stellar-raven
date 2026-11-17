---
id: sd-112
service: stellar-docs
status: reported-upstream
discovered: 2026-11-17
upstreamTitle: "Docs search omits the SEP-7 page for a query that contains its exact URI string web+stellar:pay"
evidence:
  - "2026-11-17 POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation with body {\"query\": \"web+stellar:pay payment request QR code\", \"pageSize\": 50} returned HTTP 200 and 43 sections. None of them is from /docs/build/apps/wallet/sep7. The first five pages are the SEP-10 tutorial, the Anchor Platform do_stellar_payment method, three x402 pages, and two payment guides."
  - "Same day, same endpoint, body {\"query\": \"web+stellar:pay\", \"pageSize\": 50} returned 38 sections. The first section is /docs/build/apps/wallet/sep7."
  - "2026-11-17 GET https://developers.stellar.org/docs/build/apps/wallet/sep7.md returned HTTP 200. The text holds the string web+stellar:pay 3 times and a section titled Pay Operation, which says \"The pay operation represents a request to pay a specific address\". It does not hold the word QR."
  - "Both queries also ran through the Docs search tool that Raven exposes (stellarDocs.search_docs, hitsPerPage 20). The results match the direct calls: the long query omits the page; the bare query ranks it first. Raven's path scoping does not hide the page, because the backend response does not contain it."
  - upstream issue filed 2026-11-17: https://github.com/stellar/stellar-docs/issues/3163
---

## Finding

Docs search does not return the SEP-7 page, `/docs/build/apps/wallet/sep7`, for the query
`web+stellar:pay payment request QR code`. The page holds the exact string `web+stellar:pay` three
times. The same search ranks the page first for the bare query `web+stellar:pay`.

The long query adds three generic words. The page does not hold the word "QR", and it says "request to pay" instead of
"payment request". The backend then returns 43 sections from other pages and none from the
SEP-7 page. The exact URI string in the query does not rescue the page.

A reader who searches for how to build a payment-request link gets x402 and anchor pages instead of
the one page that defines the URI.

## Evidence

Read-only reproduction:

```sh
curl -sS -X POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation \
  -H "Authorization: Bearer $MINTLIFY_ASSISTANT_API_KEY" -H 'Content-Type: application/json' \
  -d '{"query":"web+stellar:pay payment request QR code","pageSize":50}'   # no /wallet/sep7 section
curl -sS -X POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation \
  -H "Authorization: Bearer $MINTLIFY_ASSISTANT_API_KEY" -H 'Content-Type: application/json' \
  -d '{"query":"web+stellar:pay","pageSize":50}'                          # first section: /wallet/sep7
curl -sS https://developers.stellar.org/docs/build/apps/wallet/sep7.md | grep -c 'web+stellar:pay'   # 3
```

The first request returns 43 sections although `pageSize` is 50. The page is absent from all 43.

## Recommendation

Ask the Docs team to check how the search ranks a rare literal token such as `web+stellar:pay`
when the query also holds common words. An exact match of a rare token should keep the page in the
returned sections.

Smaller option: add the words "payment request" and "QR code" to the SEP-7 page introduction, for
example where the Pay Operation section says it requests a payment. The page then matches the
words that readers use for this task.
