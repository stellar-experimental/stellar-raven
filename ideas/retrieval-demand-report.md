# Retrieval demand report

Status: held. Reopen only when an operator needs question text, or needs the same ID ranking past
the 7-day Workers Logs window, with purpose, access, retention, and disclosure written first.

MCP is the primary surface; Playground is secondary (include only alongside MCP, never design around
it).

## Goal

Understand what callers ask MCP (`/mcp` never receives the user's raw prompt, only the model's
distillation):

1. **Lookup arguments inside `execute`:** string queries passed to content lookups (e.g.,
   `lumenloop.search_content_semantic`, `stellarDocs.search_docs`, `scout.searchResearch`) paired
   with operation ID.
2. **Catalog `search` query:** shorter distillation, often naming a tool family.

Playground messages on `/playground/chat` (`demo-chat-start` logs `latestUserChars` and
`historyChars` only) stay out of scope for the primary extract.

## What logs show today (7-day window)

Workers Observability calculations rank call volume (not questions; one `execute` may repeat an op):

- `op.id` (currently mixes MCP and Playground; note that when sharing until a `surface` field exists)
- `search` `top.0` split by `source` (`tool` | `codemode`), plus `demo-search` `top.0` secondary
- `skill_read.id` and `skill_run.id`

Verified query shape (2026-10-02): service `stellar-raven-codemode`, `$metadata.type = cf-worker`,
`view: calculations`, 14 adjacent 12-hour windows, `abr_level` 1. Follow
[`cloudflare-observability-review`](../.agents/skills/cloudflare-observability-review/SKILL.md)
(never a flat 7-day `events` query), and never commit production counts
([`usage/README.md`](../usage/README.md)).

## Held intent extract

To capture subject demand beyond public IDs, store a redacted aggregate (e.g., token counts or short
redacted forms) of search-like `execute` arguments (paired with `op.id`) and catalog `search`
queries. Never store full `execute` scripts or Playground chat text (highest pasted-secret risk).

Gates before any collection:

- Redact caller-pasted secrets before storage (host-secret redaction alone is insufficient).
- Document purpose, access, and retention, and update user disclosure first.
- Follow `usage/README.md`'s ban on publishing raw query lists or reversible short-query hashes.
- Do not feed raw user traffic into discovery cases ([`eval/discovery/README.md`](../eval/discovery/README.md)).

Distinct from [`observability-r2-retention.md`](./observability-r2-retention.md) (forensic raw logs),
the monthly usage report (tool/account counts only), and
[`user-controlled-personalization.md`](./user-controlled-personalization.md) (per-user memory).

## Optional daily public-ID aggregate

If 7-day logs are too short for ID rankings, store daily counts of public IDs (`op.id`, `search`
`top.0` + `source`, `skill_read.id`, `skill_run.id`, `surface`, plus Playground `demo-search`
`top.0`). Keep the no-payload rule ([`ARCHITECTURE.md`](../ARCHITECTURE.md)): no query text, code,
answers, account hashes, or request IDs. Place beside the usage collector only after documenting
purpose, access, and retention; do not widen the 13-month response table by default.
