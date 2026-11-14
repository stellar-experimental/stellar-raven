---
id: sls-117
service: stellar-light-scout
status: verified
discovered: 2026-11-14
upstreamTitle: Research source sdf-org omits the SDF strategy, roadmap, service-provider, and community pages
probe:
  type: http-text
  url: https://stellarlight.xyz/api/research?q=SDF%202026%20strategy%20priorities&source=sdf-org&limit=25
  expect:
    status: 200
    excludes:
      - "stellar.org/foundation/strategy"
evidence:
  - "2026-11-14T05:10:48Z GET https://stellarlight.xyz/api/research?q=SDF%202026%20strategy%20priorities&source=sdf-org&limit=25 returned HTTP 200 with 25 rows from nine distinct URLs: stellar.org/terms-of-service, stellar.org/foundation, stellar.org/foundation/mandate, stellar.org/foundation/mandate/2017, stellar.org/foundation/mandate/2019, stellar.org/foundation/team, stellar.org/quarterly-reports, stellar.org/enterprise-fund, and research.stellar.org/research-grants. Scout OpenAPI 1.9.150."
  - "2026-11-14T05:10:48Z the same request with q=service%20providers%20directory and with q=forgot%20memo%20exchange%20deposit%20recover%20funds returned the same nine URLs. The response bodies contain none of the strings foundation/strategy, foundation/roadmap, service-providers, or stellar.org/community."
  - "2026-11-14T05:04:25Z Raven execute: scout.searchResearch for the 2026 strategy and for the service-provider directory, with no source filter and with sdf-org and sdf-blog filters, returned no row from the four pages. No returned content contains \"$1 billion\", \"transformational enterprises\", \"Developer services\", or \"Infrastructure & whitelabel\"."
  - "2026-11-14 the four pages are live. https://stellar.org/foundation/strategy returned HTTP 200 with the description \"SDF's 2026 strategy accelerates network growth\". https://stellar.org/ecosystem/service-providers returned HTTP 200 with the title \"Stellar | Service Providers\". https://stellar.org/foundation/roadmap returned HTTP 200. https://stellar.org/community returned HTTP 200 with the text \"I forgot a memo on a deposit — can SDF recover my funds? SDF cannot recover funds. Contact the exchange or service you sent to directly.\""
  - "Other Raven sources do not hold the facts. 2026-11-14T05:04:25Z lumenloop.search_documents({collection:'articles', query:'strategy'}) listed SDF strategy posts for 2018, 2019, 2021, 2022, and 2023 only. 2026-11-14T05:05:26Z a missing-memo query returned SEP-0029 and the 2020 SDF post 'Fixing memo-less payments' with no recovery advice."
  - "The round's gap and verify lanes reached the same result for the strategy and service-provider pages on 2026-11-14 (.agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-1.json, gap/gap-3.json, gap/verify-gap.json)."
  - "Predecessor: sls-055 (canonical SDF organizational pages) was resolved on 2026-08-19; its receipt is in improvements/resolved.json. Its live re-check covered five canonical SDF page families. This finding names four pages that the source does not hold."
  - "Affected golden cases: eval/qa/corpus/battery/history-org-tokenomics/q-sdf-2026-strategy-priorities.json, eval/qa/corpus/battery/scf-grants-builders/q-scf-service-provider-directories.json, and eval/qa/corpus/battery/retail-consumer/q-raph-missing-exchange-memo.json. Ledger: .agents/rounds/2026-11-14-golden-coverage-audit/gaps/GAPS.md."
---

## Finding

The `sdf-org` source of the Scout research corpus holds nine SDF pages. It does not hold four
pages that answer common questions about SDF.

| Page | What it answers |
|---|---|
| `https://stellar.org/foundation/strategy` | SDF's 2026 objectives and targets |
| `https://stellar.org/foundation/roadmap` | The SDF product roadmap |
| `https://stellar.org/ecosystem/service-providers` | SDF's directory of service providers, by type |
| `https://stellar.org/community` | SDF's answers to common user questions, such as a missing deposit memo |

A research query about SDF strategy returns the mandate pages and the terms of service. A query
about service providers returns the same rows. An agent then answers from older strategy posts, or
reports that no directory exists.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/research?q=SDF%202026%20strategy%20priorities&source=sdf-org&limit=25'
curl -sS 'https://stellarlight.xyz/api/research?q=service%20providers%20directory&source=sdf-org&limit=25'
```

Each response has 25 rows from the same nine URLs. None of the four pages appears.

## Recommendation

Add the four pages to the `sdf-org` source, with the same title, `observedAt`, and refresh rules as
the pages already there. Keep the page year in the title of the strategy and roadmap rows, because
the roadmap page still shows the 2025 roadmap.
