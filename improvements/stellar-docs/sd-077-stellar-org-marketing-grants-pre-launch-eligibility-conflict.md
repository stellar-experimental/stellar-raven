---
id: sd-077
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: The stellar.org funding index and the Marketing Grants page give different pre-launch eligibility
evidence:
  - "2026-11-09 sweep (still-repro): Funding index still requires a live product, while dedicated marketing-grants page’s Traction data asks whether project is live or preparing to launch soon. Dedicated prose still accepts clear use cases/concrete timelines. Both HTTP200. Recheck: https://stellar.org/grants-and-funding; https://stellar.org/grants-and-funding/marketing-grants"
  - "2026-11-02T18:32:50Z curl https://stellar.org/grants-and-funding returned HTTP 200 (SHA-256 551c02d8b32134803cc89447a9bf198a6ab7ada7f69fb85ffb54104c80e14108). The Marketing grants section says \"SDF offers Marketing Grants of up to $500,000 awarded in USD, USDC, or XLM\" and \"For both new and existing projects with a live product built on the Stellar network\""
  - "2026-11-02T18:32:50Z curl https://stellar.org/grants-and-funding/marketing-grants returned HTTP 200 (SHA-256 6a49470810f8b568ddbb44904f305fae3e578d76042336bc50c0cc9d7ad4cc4d). The What we look for section has a card titled \"Traction\"; the page data gives its description as \"Is the project live with traction or preparing to launch soon?\". The page body says \"Marketing grants go to both new and existing projects with clear use cases and concrete timelines\""
  - "2026-11-02 curl https://stellar.org/blog/foundation-news/the-marketing-grants-programs-first-million (SDF blog, dated 2022-08-02) returned HTTP 200 with \"Traction: Is the project live with traction or preparing to launch soon?\". The blog repeats the dedicated page; it does not resolve the conflict"
  - "2026-11-02 Parallel web_fetch of https://stellar.org/grants-and-funding/marketing-grants (class D render, acquired 2026-10-22) lists the What we look for cards Traction, Mission, Impact, Feasibility, and Capability"
  - "Classification: site-content. Both pages are SDF stellar.org program pages, not developers.stellar.org content. The stellar.org page copy has no public issue tracker (checked 2026-11-02), so intake.json marks this finding unclear"
  - "Affected golden case: eval/qa/corpus/battery/scf-grants-builders/q-scf-sdf-marketing-grant.json (truth.verified 2026-11-02). The golden states both attributed wordings and does not penalize either; an already-launched project qualifies under both"
recurrences:
  - date: 2026-11-09
    evidence: "Funding index still requires a live product, while dedicated marketing-grants page’s Traction data asks whether project is live or preparing to launch soon. Dedicated prose still accepts clear use cases/concrete timelines. Both HTTP200."
  - date: 2026-11-06
    evidence: "Fresh funding index requires live product; Marketing Grants page data says live with traction OR preparing to launch soon. Both200; distinction persists. Exact URLs and upstream state: .agents/rounds/2026-11-05-truth-maintenance/docs.md, row sd-077"
---

## Finding

Two stellar.org pages describe Marketing Grants eligibility differently for a
project that has not launched.

The funding index at `https://stellar.org/grants-and-funding` says the grants
are "For both new and existing projects with a live product built on the
Stellar network". This wording requires a live product.

The dedicated page at `https://stellar.org/grants-and-funding/marketing-grants`
has a Traction criterion card. Its description is in the page data but not in
the server-rendered text, which shows only the card title. The description asks
"Is the project live with traction or preparing to launch soon?". This wording
admits a project before launch.

A reader cannot tell from the two pages whether a pre-launch project can apply.
An agent that reads only one page gives a different eligibility answer from an
agent that reads the other page.

This is a `site-content` finding. Both pages undertake to state who can apply.

## Evidence

Both pages returned HTTP 200 on 2026-11-02. The funding index carries the
"with a live product" sentence in its Marketing grants section.

The dedicated page lists five What we look for cards: Traction, Mission,
Impact, Feasibility, and Capability. The page data gives the Traction card the
"preparing to launch soon" description.

The SDF blog post "The Marketing Grants Program's First Million" (2022-08-02)
uses the same Traction wording as the dedicated page.

The two pages agree on the other facts. Both give a cap of up to $500,000. Both
say that new and existing projects can apply.

## Recommendation

Render the Traction card description, or remove it from the page data, so that
readers and agents see the same criterion.


Use one eligibility statement on both pages. State whether a project that is
preparing to launch can apply.

If pre-launch projects can apply, change the funding index sentence. For
example: "For new and existing projects that are live or preparing to launch on
the Stellar network".

If a live product is required, change the Traction card description. For
example: "Is the project live with traction?".
