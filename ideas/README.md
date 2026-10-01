# Ideas

Research notes and possible future work. These notes are not committed product plans.

- [Observability R2 Retention Plan](./observability-r2-retention.md) — an optional Logpush and R2
  archive for investigations that need history beyond the Workers Logs window.
- [User-controlled Personalization](./per-user-mcp-observability.md) — deferred personalization
  with a separate store and explicit user controls.
  [The usage guide](../usage/README.md) describes the implemented private aggregate reports.
- [Architecture Explorations](./architecture-explorations.md) — open architecture questions and
  their evaluation gates.
- [Docs Recency Ranking](./docs-recency-ranking.md) — why modification time stays agent-visible
  metadata or a measured experiment, not a default ranking boost.
- [Direct Stellar.org Source Coverage](./stellar-org-source-lane.md) — the held `stellarOrg`
  root-service proposal. Revisit it only after its dated review or an explicit source-gap trigger.
- [Live Ecosystem-Partner Documentation](./partner-doc-live-sources.md) — partner MCP servers
  are not a docs source. Allowlisted first-party partner Markdown is one. A four-phase gate keeps
  that source held.
- [ChatGPT Subscription Login for `/playground`](./playground-chatgpt-subscription-login.md) —
  optional user-funded Playground inference through ChatGPT/Codex OAuth. The note records the
  token-custody, consistency, budget, and upstream-support gates that come before any spike.
- [Shareable Durable `/playground` Sessions](./shareable-durable-playground-sessions.md) — a
  deferred durable-session design. The Playground stays stateless with its 8,000-character input
  limit.
- [Source Delivery: Ranked References](./source-delivery-ranked-references.md) — a deferred
  `sources.locate` surface. Its measured reopen trigger follows repository-recovery work.
- [Skill Discovery Measurements](./skill-discovery-without-bundling.md) — two questions. Do skill
  reads improve navigation-only answers? Do agents use exact section reads?
- [Raven as a Codegen Correctness Substrate](./codegen-correctness-substrate.md) — an external
  partner ran long-horizon Soroban codegen with Raven installed alongside. Raven serves guidance
  for many of the reported defect classes, but the defects occurred. The cause is unattributed and
  n=1. No instrument measures that mode.
