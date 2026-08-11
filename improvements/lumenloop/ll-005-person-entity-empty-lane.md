---
id: ll-005
service: lumenloop
status: reported-upstream
discovered: 2026-07-03
evidence:
  - live probe 2026-07-03: find_content_by_entity {entity:"Denelle Dixon", entity_type:"person"} → success:true, all groups empty
  - control probe same session: {entity:"Stellar Development Foundation", entity_type:"organization"} → full groups (3/3/3/3/3)
  - Solo project 49, todo 825 (skills-harvest verification pass)
  - live re-verified 2026-07-06 (eval round todo 846): person probe (Denelle Dixon) still ok:true with all 5 groups empty while the organization control returns 5/5/5/5/5 — silent person-lane emptiness unchanged
  - live re-verified 2026-07-10 during GT-35: Tyler van der Hoeven exact person, exact any-type, and Tyler person probes returned all-empty groups; kalepail returned one record misclassified as project
  - live re-verified 2026-07-14: Justin Rice exact person lookup returned ok=true with all content groups empty while the semantic-content control returned exact-name dated event rows
  - 2026-07-14 normalized semantic fallback made the exact playground question recover despite the unchanged empty person-entity lane
  - https://github.com/lumenloop/lumenloop-backend/issues/19 (filed 2026-07-13)
recurrences:
  - date: 2026-07-10
    evidence: GT-35 primary/blind exact-person probes reproduced silent emptiness for Tyler van der Hoeven and a kalepail person/project classification mismatch
  - date: 2026-07-13
    evidence: targeted QA q-edge-lumenloop-person-entity-empty reproduced ok=true with all groups empty for Denelle Dixon while broad semantic search returned populated exact-name content
  - date: 2026-07-13
    evidence: post-fix QA performed the broad pass but called the ok=true empty payload a lane defect, showing the catalog mitigation must explicitly distinguish data-shaped empty from transport and soft-empty failure
  - date: 2026-07-14
    evidence: Justin Rice exact-person live probe again returned ok=true with all groups empty; the paired broad semantic control returned exact-name historical event rows
  - date: 2026-08-11
    evidence: `find_content_by_entity({entity:"Denelle Dixon",entity_type:"person",limit:100})` returned empty articles/av/events/proposals/scf_submissions groups, while the organization control returned 100/100/100/13/100; upstream #19 remains open, with only the 2026-07-13 `kalepail` tracking comment and no maintainer activity
---

## Finding

`find_content_by_entity` advertises `entity_type: "person"` in its input schema enum,
but the external lane returns `success: true` with **all-empty content groups** for
person-type queries — even for people with guaranteed heavy corpus coverage (probe:
the SDF CEO). Because the response is `meta.format: "json"` with empty arrays (not a
`text` guidance payload), it normalizes as *evidence-shaped data*, so callers read
"no content mentions this person" as evidence of absence when it is lane behavior.
The partner-archive skill (`lumenloop-api-query` tool cheatsheet) documents the
restriction ("person-type results are not exposed on the external lane"), but the
tool schema and description do not.

## Evidence

Live probes above (2026-07-03, partner key). The organization control confirms the
tool itself works on this lane; only the person type is silently empty.

## Recommendation

Any one of, in preference order: (1) serve person entities on the external lane;
(2) drop `"person"` from the external-lane enum so bad calls fail loudly as
`invalid_arguments`; (3) state the restriction in the tool description /
`when_to_use` so agents route people-queries to `search_content_semantic`.
Mitigated on our side 2026-07-03 with a catalog description note
(`scripts/description-notes.mjs`, LUMENLOOP_DESCRIPTION_NOTES) — but every other
external consumer still hits it.

The 2026-07-13 post-fix transcript exposed an ambiguity in that mitigation: the
model read “lane behavior” as a service defect and missed the valid closed-world,
source-scoped conclusion. The local note now says explicitly that the response is
normal `ok` data (not transport or `soft-empty` failure), states its narrow scope,
and routes only open-world coverage questions to semantic recovery.
