/**
 * Live-captured fixture — production raven.stellar.buzz MCP `execute`, 2026-07-06.
 * Op: lumenloop.search_content_semantic
 * Args: { query: "RWA tokenization", date_start: "2026-06-06", date_end: "2026-07-06",
 *         types: ["articles","av","events","research"], limit: 2,
 *         response_format: "concise" }
 * Projection: strings > 160 chars truncated with a trailing ellipsis; arrays cut
 * to their first 2 items. The live type-keyed response is shown after the
 * adapter's forward-only normalization: one similarity-ranked `items` list,
 * canonical source collection per row, collection counts, and metadata.
 * Refresh fixtures after the live-drift checks in .agents/skills/live-drift-resolution/SKILL.md.
 */
export default {
  ok: true as const,
  data: {
    items: [
      {
        id: "9014",
        title: "RWA Market Pulse Recap: JUNE 2026",
        url: "https://x.com/i/article/2072970136643129344",
        domain: "x.com",
        publishing_date: "2026-07-03 09:50:22+00",
        summary:
          "RWA market crossed $39.68B in distributed value in June, up 23% monthly—the strongest gain of 2026. Citi Institute projects a $5.5 trillion tokenized asset mark…",
        slug: "rwa-market-pulse-recap-june-2026",
        similarity: 0.476904984096866,
        collection: "articles"
      },
      {
        id: "8949",
        title: "RedStone Monthly Digest - June 2026  ",
        url: "https://x.com/i/article/2072335315394531329",
        domain: "x.com",
        publishing_date: "2026-07-01 15:14:33+00",
        summary:
          "RedStone's June conference recap: TokenizeThis NYC becomes their largest event with Newton's policy engine launching on mainnet, evaluating transaction complian…",
        slug: "redstone-monthly-digest-june-2026",
        similarity: 0.3184000503821114,
        collection: "articles"
      },
      {
        id: 132,
        title: "The Financial Advisor Has Been Cut Out of Crypto and Rivool Is Changing That",
        format: "long-form",
        summary:
          "Thousands of independent financial advisors in Brazil manage over $220 billion in assets but have no clean path to offer clients digital asset exposure and earn…",
        slug: "financial-advisor-cut-crypto-rivool-changing",
        created_at: "2026-06-25T17:04:30.717Z",
        similarity: 0.27423040187225056,
        collection: "research"
      },
      {
        id: "2408",
        title: "Stellar Developers Meeting - 06/18/2026",
        url: "https://www.youtube.com/watch?v=9dfzsu5ChCM",
        channel: "Stellar Development Foundation",
        created_at: "2026-06-18T18:18:47.672Z",
        summary:
          "Stellar's weekly developer meeting features JavaScript SDK v16 release, a real-world ZK hackathon ($10K prize pool, 11 days remaining), and the CV Labs + SDF EM…",
        slug: "stellar-developers-meeting-06-18-2026",
        similarity: 0.27018757449582553,
        collection: "av"
      },
      {
        id: 133,
        title: "Stellar Weekly Roundup — week of Jun 19, 2026",
        format: "long-form",
        summary:
          "Stellar's on-chain RWA market cap crossed $3 billion as Matrixdock's XAUm tokenized gold launched with an SDF treasury allocation. AllUnity and Zebec launched a…",
        slug: "stellar-weekly-roundup-week-jun-19-2026",
        created_at: "2026-06-26T16:09:32.120Z",
        similarity: 0.23907246213838662,
        collection: "research"
      },
      {
        id: "1486",
        title: "Builders Breakfast - Stellar37°",
        url: "https://luma.com/25iytn9p",
        start_at: "2026-06-10T11:00:00.000Z",
        platform: "luma",
        summary:
          "Builders Breakfast at Stellar37° in Rio brings ecosystem participants together for networking on payments, RWA, and blockchain. Hosted by NearX.",
        slug: "builders-breakfast-stellar37",
        similarity: 0.20876628998961066,
        collection: "events"
      }
    ],
    counts: { articles: 2, research: 2, av: 1, events: 1 },
    meta: {}
  }
};
