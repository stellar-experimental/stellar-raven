# Ideas

Research notes and possible future work that are not committed product plans.

- [Observability R2 Retention Plan](./observability-r2-retention.md) — optional Logpush/R2 archive
  design for investigations that need history beyond the Workers Logs window.
- [Per-user MCP Observability and Future Personalization](./per-user-mcp-observability.md) — current
  `/mcp` identity and request tracking, privacy boundaries, and deferred adoption analytics without
  turning telemetry into a profile store.
- [Architecture Explorations](./architecture-explorations.md) — ranked A/B and readiness
  candidates from the 2026-07-07 first-principles codemode review (per-op null hypothesis,
  embedding hybrid, MCP 2026-07-28 spec spike, evidence sidecar, and deferred leftovers).
- [Docs Recency Ranking](./docs-recency-ranking.md) — why modification time should remain
  agent-visible metadata or a measured experiment rather than a default ranking boost.
- [Direct Stellar.org Source Coverage](./stellar-org-source-lane.md) — revisit the held
  `stellarOrg` root-service proposal only after its dated review or explicit source-gap trigger.
- [Live Ecosystem-Partner Documentation](./partner-doc-live-sources.md) — why partner MCP servers
  are not a docs source, why allowlisted first-party partner Markdown is, and the four-phase gate
  that keeps it held.
- [ChatGPT Subscription Login for `/playground`](./playground-chatgpt-subscription-login.md) —
  optional user-funded playground inference via ChatGPT/Codex OAuth, with hosted-token custody,
  consistency, budget, and upstream-support gates recorded before any spike.
- [Shareable Durable `/playground` Sessions](./shareable-durable-playground-sessions.md) — private
  durable sessions, opt-in public read links, login-gated follow-ups, and atomic private forks on a
  non-author's first send.
- [Skill Discovery: What Is Still Open After De-vendoring](./skill-discovery-without-bundling.md) —
  the content-ownership question is CLOSED (bodies are served from pinned upstream, never stored).
  Two measurable questions survive: whether the `skills.*` read surface earns its place at all
  versus navigation-only, and whether exact-read section entries do.
- [Raven as a Codegen Correctness Substrate](./codegen-correctness-substrate.md) — an external partner
  ran long-horizon Soroban codegen with Raven merely installed alongside. Guidance for many reported
  defect classes is present in what we serve, yet the defects occurred; the cause is unattributed and
  n=1. The durable point is that no instrument measures that mode at all.
