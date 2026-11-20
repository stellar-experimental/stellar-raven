# Ideas

Research notes and possible future work (not committed product plans).

| Idea | State | Reopen trigger or review date | Work queue item |
|---|---|---|---|
| [Observability R2 retention](./observability-r2-retention.md) | Held | Forensic need beyond 7 days, Owner decision 5, or another trigger in the note | "Keep 30 days of observability data, including queries and responses" |
| [Retrieval demand report](./retrieval-demand-report.md) | Held | Operator needs question text, or scheduled / post-7-day ranking (with purpose, access, retention, and disclosure written first) | None |
| [User-controlled personalization](./user-controlled-personalization.md) | Deferred | Owner decision to build personalization | None |
| [Live ecosystem-partner documentation](./partner-doc-live-sources.md) | Held (reviewed 2026-11-19) | Two unrelated partner-only failures, measured demand, or the note's MCP trigger | None |
| [ChatGPT subscription login for `/playground`](./playground-chatgpt-subscription-login.md) | Held research note | One of the note's four reopen triggers | None |
| [Shareable durable `/playground` sessions](./shareable-durable-playground-sessions.md) | Deferred | Owner decision, then the note's four deferred choices | None |
| [Skill discovery measurements](./skill-discovery-without-bundling.md) | Measuring (2026-09-30 date overdue) | 100 organic `skill_read` events, or the date | "Read the `skill_read` shape distribution" |
| [Source delivery: ranked references](./source-delivery-ranked-references.md) | Deferred (owner, 2026-08-28) | Measured reopen rule in §8 | "Keep `sources.locate` deferred" |

Each idea file carries a status line and a trigger. Dated reviews live in
[`.agents/TODO.md`](../.agents/TODO.md) and point here. When an idea ships or is rejected, delete
the file and record the decision in an ADR or the work queue. Dated research belongs in
[`research/`](../research/).
