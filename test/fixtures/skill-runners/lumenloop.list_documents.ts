/**
 * Live-captured fixture — production raven.stellar.buzz MCP `execute`, 2026-07-06.
 * Op: lumenloop.list_documents   Args: { collection: "events", period: "upcoming", limit: 3 }
 * Projection: arrays cut to their first 2 items (live page carried 3 of 19).
 * Shape notes the runner projection depends on: rows sit under `items` with a
 * `pagination` sibling, and the slim event rows here carry NO start_at (only
 * created_at/status) — the runner projects startAt as null when absent.
 * Refresh fixtures after the live-drift checks in .agents/skills/live-drift-resolution/SKILL.md.
 */
export default {
  ok: true as const,
  data: {
    items: [
      {
        id: "1624",
        title: "Built in Nairobi: Stellar Impact Studio Demo Day",
        url: "https://luma.com/xzvdmrt0",
        status: "processed",
        created_at: "2026-07-06T00:26:52.352Z"
      },
      {
        id: "1623",
        title: "Stellar Ecosystem Impact: Web3 Founders & Investor Mixer",
        url: "https://luma.com/ipggktuu",
        status: "processed",
        created_at: "2026-07-06T00:26:52.352Z"
      }
    ],
    pagination: { total: 19, page: 1, limit: 3, hasMore: true }
  }
};
