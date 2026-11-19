# Retired Lumenloop onboarding skills: guidance review

Date: 2026-07-07

Scope: Solo todos 852/854 revisited whether retired Lumenloop onboarding skills
should produce any Raven-owned guidance after the raw bodies were removed from
model-facing catalog exposure.

## Classification

The auditable source of truth is `SKILL_EXPOSURE_CLASSIFICATIONS` in
`scripts/exposure.mjs`.

- `lumenloop-mcp-connect`: `internal-guidance`. The raw connector setup, bearer
  token, and raw MCP tool-map playbook remains non-emitted because Raven execute
  exposes wrapped sandbox globals, not direct network or connector access. Safe
  lessons may be distilled only into Raven-owned search/execute guidance or code.
- `lumenloop-api-*`: `removed`. These former partner-tier onboarding bodies are
  intentionally absent from the public repo. Their names remain only as scrub
  targets for upstream cross-links and as an audit trail.

## Accepted Guidance

No new raw-body content is accepted into the model surface from this review.
Existing Raven-owned guidance already covers the transferable behavior: use
`search`/`codemode.search`, exact operation ids, in-sandbox service globals,
sectioned skill reads, and result projection before returning.

## Non-Goals

- Do not expose retired skill names, connector setup, bearer-token instructions,
  or partner-tier body content to MCP clients.
- Do not rebuild the generated catalog or skill bundle by hand.
- Do not use the classification ledger as runtime policy; ADR-0003 exposure
  remains build-time filtering.
