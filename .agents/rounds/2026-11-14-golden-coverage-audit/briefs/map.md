# Brief: surface map

Read `briefs/common.md` first. Your launch line names your lane: `map-supply` or `map-demand`.

## Task

Build a taxonomy of everything an AI agent may need to know about Stellar. It becomes the
coverage map that the QA battery is measured against. A second mapper builds one independently
from a different starting point; a reconciler merges the two.

**Do not read `eval/qa/` or `eval/corpus/`.** The map must not inherit the battery's blind spots.

## Starting point

- `map-supply`: start from what exists. The official docs navigation
  (`https://developers.stellar.org/llms.txt`), stellar.org, the CAP and SEP lists
  (`github.com/stellar/stellar-protocol`), protocol releases and upgrade history, the SDF and
  ecosystem GitHub organizations, SCF programs and rounds, and the project, asset, anchor, wallet,
  and audit directories reachable through Raven (Scout and Lumenloop). Use Raven's own `search`
  to list what its sources cover.
- `map-demand`: start from what people ask. `eval/discovery/mined-lumenloop-queries.json` and
  `eval/discovery/cases.json` (real mined queries), Stellar Stack Exchange, GitHub issues and
  discussions in the busiest Stellar repositories, developer Discord topics that surface on the
  web, docs FAQ and troubleshooting pages, and the questions a builder, an integrator (anchor,
  exchange, wallet), an analyst, an investor, a grant applicant, and a retail holder would bring to
  an agent. Use `parallel-cli search` widely.

## What a leaf is

A leaf is one topic that a single categorical question could test: narrow enough that one
compact answer covers it, broad enough that a wrong answer would mislead an agent on real work.
"SEP-10 authentication" is a leaf. "SEPs" is a domain. "The SEP-10 challenge timeout value" is a
detail inside a leaf.

Aim for about 12 domains and 120 to 160 leaves. Include topics that matter even when you suspect
no good source exists: network operations and validators, fees and resource limits, governance,
history and incidents, tokenomics, compliance and regulation, real-world assets, payments
corridors, security and audits, wallets and retail use, scams and support, AI and agent tooling,
and the organizations and people of the ecosystem.

## Output

`.agents/rounds/2026-11-14-golden-coverage-audit/map/<lane>.json`:

```json
{
  "lane": "map-supply",
  "domains": [
    {
      "id": "protocol",
      "title": "Protocol and network",
      "leaves": [
        {
          "id": "protocol.fees-resource-limits",
          "title": "Fees, surge pricing, and Soroban resource limits",
          "scope": "One or two sentences: what is in and what is out.",
          "weight": 3,
          "weightReason": "Why an agent needs this, and how often.",
          "volatility": "stable | scheduled | live",
          "canonicalSources": [{"class": "A", "ref": "https://..."}],
          "question": "The one categorical question that best tests this leaf.",
          "ravenReach": "yes | partial | no | unchecked",
          "evidence": "Which queries, pages, or threads showed that this topic matters."
        }
      ]
    }
  ],
  "notes": "Topics you considered and left out, and why."
}
```

- `weight`: 3 = an agent meets it constantly or a wrong answer loses funds or breaks a build;
  2 = regular; 1 = niche but real. Be strict: at most a quarter of leaves are weight 3.
- `volatility`: `stable` rarely changes; `scheduled` changes on known events (protocol votes,
  SCF rounds, releases); `live` changes continuously (TVL, rosters, prices).
- `ravenReach`: spot-check about a third of your leaves with one Raven `search` plus `execute`
  each, weight-3 leaves first. Leave the rest `unchecked`.

Done when every domain is filled, the file parses, and `notes` lists your exclusions.
