---
id: ll-028
service: lumenloop
status: verified
discovered: 2026-08-14
upstreamTitle: Reject or echo the sort field in list_documents instead of ignoring unknown values
evidence:
  - 2026-08-14 live list_documents on collection articles with sort "definitely_not_a_real_sort_key" returned ok with 1986 total rows and no error
  - 2026-08-14 live list_documents on collection articles with sort "zzz_not_a_field" returned the identical first page
  - 2026-08-14 live list_documents on collection articles with sort "last_seen_at" returned the identical first page, although last_seen_at is documented for jobs only
  - 2026-08-14 live list_documents on collection articles with sort "publishing_date" returned a different row order, which shows the unknown values fell back to a default order
  - eval round 2026-08-14, live-run stamp 2026-08-14T04-13-13, Solo scratchpad 809 todo 1538 shard
---

## Finding

`list_documents` accepts an unknown `sort` value. The call returns `ok` with a
full result page. It returns no error and no warning.

The response also does not report the effective sort field. A caller cannot tell
that the service ignored the requested order.

The same call accepts a sort field from a different collection. The operation
documents `last_seen_at` for jobs. An articles request with
`sort: "last_seen_at"` still returns `ok`.

The result is a silent contract break. A caller that asks for one order receives
the default order and treats it as the requested order. Every downstream claim
about "newest" or "oldest" rows can then be wrong.

## Evidence

These four live calls ran on 2026-08-14 through the exposed gateway.

```js
await lumenloop.list_documents({ collection: "articles", sort: "definitely_not_a_real_sort_key", limit: 3 });
await lumenloop.list_documents({ collection: "articles", sort: "zzz_not_a_field", order: "DESC", limit: 3 });
await lumenloop.list_documents({ collection: "articles", sort: "last_seen_at", limit: 3 });
await lumenloop.list_documents({ collection: "articles", sort: "publishing_date", order: "DESC", limit: 3 });
```

The first three calls returned the same first page:

1. "2+ Years of Neural Quorum Governance"
2. "Nansen Stellar Q2 2026 Report"
3. "Marketnode to Offer BNY Investments Funds on Stell..."

The fourth call returned a different second row, "Marketnode to Offer BNY
Investments Funds on Stell...", and a different third row, "Introducing Adapter,
Protocol 28 on Stellar".

Each response carried `pagination` with `total: 1986`. No response carried a
`sort` field.

## Recommendation

Reject an unknown `sort` value with a 400 error. Name the accepted sort fields
for the requested collection in the error message.

Reject a sort field that belongs to a different collection with the same error.

Add the effective sort field and direction to the `pagination` object on every
response. A caller can then confirm the applied order without a second request.

Apply the same rule to any other query parameter that the endpoint currently
ignores.
