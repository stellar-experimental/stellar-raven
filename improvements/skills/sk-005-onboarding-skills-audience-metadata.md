---
id: sk-005
service: skills
status: reported-upstream
discovered: 2026-07-03
evidence:
  - gateway retirement decision + verification, Solo project 49, todo 825 (2026-07-03)
  - scripts/build-catalog.mjs RETIRED_ONBOARDING_SKILLS (deny-list-as-data, this repo)
  - content survey: lumenloop-api family teaches Bearer llmcp_ auth, key minting, REST envelope; playbooks reference tools by bare name only (zero REST markers)
  - live re-verified 2026-07-06 (eval round todo 846): stellar-project-dossier playbook still ships no frontmatter audience/transport marker; the retirement of the 7 onboarding skills is holding (playbook still bare-name tool refs, zero REST/auth markers)
  - upstream source rechecked 2026-07-09 at lumenloop/lumenloop-skills main (skills tree d92c56b): stellar-project-dossier frontmatter still has name/description/user-invocable only, with no audience or transport marker
  - upstream issue filed 2026-07-09: https://github.com/lumenloop/lumenloop-skills/issues/2
recurrences:
  - date: 2026-07-09
    evidence: current upstream stellar-project-dossier frontmatter still omits audience/transport metadata while remaining user-invocable
  - date: 2026-07-13
    evidence: structured HTTP probe returned 200, retained user-invocable true, and still found neither audience nor transport metadata
  - date: 2026-08-11
    evidence: structured HTTP probe returned 200, retained user-invocable true, and still found neither audience nor transport metadata
probe:
  type: http-text
  url: https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-project-dossier/SKILL.md
  expect:
    status: 200
    contains:
      - 'user-invocable: true'
    excludes:
      - 'audience:'
      - 'transport:'
---

## Finding

The Lumenloop skill corpus lacks machine-readable audience and transport metadata.

It mixes two audiences with no machine-readable marker. The `lumenloop-api`
family (connect/keys/billing/integrate/query/research) plus
`lumenloop-mcp-connect` teach **transport onboarding**: Bearer `llmcp_` auth, key
minting/rotation, rate limits, the REST response envelope, connector installs. The
seven playbooks (dossier, ecosystem-scout, scf-radar, digest, auditor, quickstart,
integration-finder) are **transport-agnostic methodology** — they reference tools by
bare name (`search_directory(query)`) and survive any transport.

For gateway/aggregator deployments that re-expose the tools behind their own auth
and envelope (this repo: sandboxed `lumenloop.*` fns, no network, host-held key,
`{ok,data}` envelope), the onboarding family is not just redundant but actively
misleading — it steers agents toward key management and raw HTTP that the sandbox
forbids. We retired those 7 from exposure on 2026-07-03 (deny-list-as-data); the
playbooks were verified clean and kept. Since 2026-07-30 no skill body is stored in
this repo at all — retired skills are simply never pinned, fetched, or emitted, so
"retired" and "absent" are now the same state here. The finding is unaffected: it is
about upstream metadata, and the upstream bodies are unchanged.

## Evidence

A source survey and REST-marker scan found 40+ transport markers per onboarding
skill and zero in the transport-agnostic playbooks. The current upstream
`stellar-project-dossier` frontmatter remains user-invocable but has no audience
or transport marker.

## Recommendation

Add a machine-readable audience/transport field to skill frontmatter in
`lumenloop/lumenloop-skills` and the partner archive — e.g.
`audience: direct-consumer | any` or `transport: rest | mcp | agnostic` — so
downstream catalogs can filter mechanically instead of re-deriving the split by
content analysis. The playbooks' "reconnect the connector" pointers to
`lumenloop-mcp-connect` would also carry a graceful no-op for gateway contexts.
