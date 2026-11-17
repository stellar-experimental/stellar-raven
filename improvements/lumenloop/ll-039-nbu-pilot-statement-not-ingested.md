---
id: ll-039
service: lumenloop
status: verified
discovered: 2026-11-17
upstreamTitle: "Coverage request: ingest the National Bank of Ukraine statement on the 2021 TASCOMBANK and Bitt pilot"
evidence:
  - "2026-11-17 Canonical source, read live: https://bank.gov.ua/en/news/all/natsionalniy-bank-vitaye-pilotniy-proyekt-ministerstva-tsifrovoyi-transformatsiyi-schodo-vipusku-programovanih-elektronnih-groshey (HTTP 200, published 15 Dec 2021 18:30; Ukrainian original at the /ua/ path). Title: \"NBU Welcomes Ministry of Digital Transformation's Pilot Project to Issue Programmable Electronic Money\". It quotes NBU Deputy Governor Oleksii Shaban: \"This pilot project is not directly concerned with issuing the e-hryvnia, the NBU's digital currency. Under new legislation, the NBU is the only authority that can issue the e-hryvnia.\""
  - "2026-11-17 lumenloop.search_content_semantic for the pilot (English and Ukrainian wording, limit 5 to 8 per call, no type filter and a bank.gov.ua source filter) returned no row from bank.gov.ua. The pilot rows it holds are: id 4400, the SDF press release \"Ukraine electronic hryvnia pilot launched by TASCOMBANK and bitt on Stellar\" (2021-12-14, \"under National Bank of Ukraine supervision\"); id 5407, Decrypt \"Ukraine's Central Bank Oversees Digital Currency Pilot Using Stellar\" (2021-12-14); id 4751, CoinDesk \"Ukraine Commercial Bank to Test Digital Currency Built on Stellar\" (2021-12-14); id 4406, the TASCOMBANK pilot report press release (2023-01-12); and id 4732, CoinDesk \"Ukraine Government Picks Stellar Development Foundation to Help Build National Digital Currency\" (2021-01-04). None of them holds the NBU sentence."
  - "The Decrypt headline calls the pilot a central-bank pilot. The NBU statement says the pilot is not the e-hryvnia. A reader who has only the held rows cannot see the NBU statement. This is a third party's wording, not a defect in a Lumenloop record."
---

## Finding

This is a coverage request. Lumenloop holds several news items on the 2021 Ukraine pilot of
TASCOMBANK, Bitt, and the Stellar Development Foundation. It does not hold the primary correction
that the National Bank of Ukraine (NBU) published on 2021-12-15.

The NBU statement says the pilot "is not directly concerned with issuing the e-hryvnia, the NBU's
digital currency". The Decrypt item that Lumenloop holds calls the pilot a central-bank pilot. A
reader of Lumenloop content alone sees only the central-bank framing.

The Decrypt item is accurate to Decrypt's own words. It is not a defect in a Lumenloop record.

## Evidence

Read-only reproduction:

```sh
curl -sS https://bank.gov.ua/en/news/all/natsionalniy-bank-vitaye-pilotniy-proyekt-ministerstva-tsifrovoyi-transformatsiyi-schodo-vipusku-programovanih-elektronnih-groshey | grep -o 'not directly concerned with issuing the e-hryvnia'
# lumenloop search_content_semantic, query "National Bank of Ukraine welcomes pilot programmable electronic money not related to e-hryvnia":
# no returned row has a bank.gov.ua URL
```

The held rows are ids 4400, 5407, 4751, 4406, and 4732 in the `articles` collection.

## Recommendation

Ingest the NBU news item of 2021-12-15 as an article, from the English URL above.

Optional: if Lumenloop has a way to relate one content item to another, link the NBU item to the
Decrypt item (id 5407). If it has no such relation, ingestion alone is enough.
