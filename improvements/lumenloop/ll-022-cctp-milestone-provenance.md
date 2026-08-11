---
id: ll-022
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - P4 N2 reconciliation: Circle release notes record Stellar mainnet support on 2026-05-18 and SDF publicly announced "Circle CCTP is Live on Stellar" on 2026-05-19; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - the same reconciliation contradicts 2026-05-08 as the SDF/Circle public live-announcement date and preserves earlier technical/domain milestones as distinct facts
  - reported upstream: https://github.com/lumenloop/lumenloop-backend/issues/38
  - 2026-08-11 review: issue #38 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:35Z. `get_document({collection: "articles", id: 6461})` still returns a prose-only CCTP summary and no separately typed milestone or source-provenance fields.
recurrences:
  - date: 2026-08-11
    evidence: Article 6461 says CCTP is live, but its projection has no technical, deployment, or public-announcement milestone fields.
---

## Finding

Lumenloop's CCTP event material lacks explicit milestone provenance. Deployment,
technical support, and public-announcement dates can be collapsed into one
"launch" date, making the May 18 Circle technical milestone, May 19 SDF/Circle
announcement, and any earlier integration preparation indistinguishable.

## Evidence

P4 N2's primary/blind review on 2026-07-11 validated the May 18 Circle release
note and the May 19 SDF/Circle public announcement. The candidate notes a
contradicted May 8 lead and older corpus treatment of an earlier technical
milestone. This is proposed pending a stored Lumenloop response that assigns a
wrong or unqualified date.

## Recommendation

Store event type and source provenance separately: `technicalAvailableAt`,
`publicAnnouncedAt`, `deploymentAt` when known, plus source URL and as-of date.
Answer summaries should name the milestone rather than overwrite it with a
single undifferentiated launch date.
