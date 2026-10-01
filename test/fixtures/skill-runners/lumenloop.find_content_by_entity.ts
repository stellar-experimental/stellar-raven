/**
 * Live-captured fixture — production raven.stellar.buzz MCP `execute`, 2026-07-06.
 * Op: lumenloop.find_content_by_entity
 * Args: { entity: "Soroswap", date_start: "2026-06-06", date_end: "2026-07-06", limit: 3 }
 * Projection: arrays cut to their first 2 items. Shape notes the runner
 * projection depends on: a type-keyed map whose keys are articles/av/events/
 * proposals/scf_submissions (no research), rows carry NO summary field, and
 * scf_submissions rows have no url — the digest runner keeps only its four
 * output types and projects missing summaries as "".
 * Refresh fixtures after the live-drift checks in .agents/skills/live-drift-resolution/SKILL.md.
 */
export default {
  ok: true as const,
  data: {
    articles: [
      {
        id: "8756",
        title: "OctoPos: DeFi Position API",
        url: "https://untangled.finance/posts/octopos-defi-position-api",
        domain: "untangled.finance",
        publishing_date: "2026-06-23 00:00:00+00",
        entity_type: "project",
        entity_name: "SoroSwap"
      },
      {
        id: "8768",
        title: "@wowmax/sdk",
        url: "https://www.npmjs.com/package/@wowmax/sdk",
        domain: "www.npmjs.com",
        publishing_date: "2026-06-15 07:26:37.427+00",
        entity_type: "project",
        entity_name: "Soroswap"
      }
    ],
    av: [],
    events: [],
    proposals: [],
    scf_submissions: [
      {
        slug: "recO8Z0J0DohwPyBm",
        title: "Institutional Capital Access for Stellar",
        category: "End-User Application",
        round: "SCF #42",
        entity_type: "project",
        entity_name: "Soroswap"
      },
      {
        slug: "recaJkqF1MOWhu3Z5",
        title: "Prices API RFP - CTX.com",
        category: "Developer Tooling",
        round: "SCF #41",
        entity_type: "project",
        entity_name: "Soroswap"
      }
    ]
  }
};
